import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CompareToast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface CompareCtx {
  items: string[];
  category: string | null;
  addToCompare: (id: string, categorySlug: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  toast: CompareToast | null;
  dismissToast: () => void;
}

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<CompareToast | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const addToCompare = useCallback((id: string, categorySlug: string) => {
    setItems((prev) => {
      if (prev.includes(id)) {
        setToast({ id: Date.now(), message: "Produit déjà dans le comparateur", type: "error" });
        return prev;
      }
      if (prev.length >= 2) {
        const replaced = [...prev.slice(1), id];
        setCategory(categorySlug);
        setToast({ id: Date.now(), message: "Produit précédent remplacé", type: "success" });
        return replaced;
      }
      if (prev.length === 0) {
        setCategory(categorySlug);
        setToast({ id: Date.now(), message: "Ajouté au comparateur", type: "success" });
        return [id];
      }
      if (category !== categorySlug) {
        setToast({ id: Date.now(), message: "Impossible de comparer des produits de catégories différentes", type: "error" });
        return prev;
      }
      setToast({ id: Date.now(), message: "Ajouté au comparateur", type: "success" });
      return [...prev, id];
    });
  }, [category]);

  const removeFromCompare = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x !== id);
      if (next.length === 0) setCategory(null);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setItems([]);
    setCategory(null);
  }, []);

  const isInCompare = useCallback((id: string) => items.includes(id), [items]);

  return (
    <Ctx.Provider value={{ items, category, addToCompare, removeFromCompare, clearCompare, isInCompare, toast, dismissToast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCompare must be used within CompareProvider");
  return c;
}