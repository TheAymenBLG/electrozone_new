import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { CartLine } from "@electrozone/shared";

export interface ToastInfo {
  id: number;
  kind: "product" | "bundle";
  itemId: string;
}

interface CartCtx {
  lines: CartLine[];
  add: (kind: "product" | "bundle", id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
  count: number;
  toast: ToastInfo | null;
  dismissToast: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const add = useCallback((kind: "product" | "bundle", id: string) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id && l.kind === kind);
      if (found)
        return prev.map((l) =>
          l.id === id && l.kind === kind ? { ...l, quantity: l.quantity + 1 } : l,
        );
      return [...prev, { kind, id, quantity: 1 }];
    });
    setToast({ id: Date.now(), kind, itemId: id });
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const setQty = useCallback((id: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.id !== id);
      return prev.map((l) => (l.id === id ? { ...l, quantity } : l));
    });
  }, []);
  const clear = useCallback(() => setLines([]), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <Ctx.Provider value={{ lines, add, remove, setQty, clear, count, toast, dismissToast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}