import { useEffect, useRef } from "react";
import { GitCompare, X, ArrowRight } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useProducts } from "../data/store";

export default function CompareTray({ onOpen }: { onOpen: () => void }) {
  const { items, removeFromCompare, toast, dismissToast } = useCompare();
  const products = useProducts();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => dismissToast(), 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, dismissToast]);

  if (items.length === 0 && !toast) return null;

  return (
    <>
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] animate-[slideUp_0.3s_ease-out]">
          <div className={`rounded-xl shadow-2xl px-5 py-3.5 flex items-center gap-3 min-w-[260px] border ${toast.type === "success" ? "bg-navy-card border-gold/40" : "bg-navy-card border-red-400/40"}`}>
            <p className={`text-sm font-medium ${toast.type === "success" ? "text-cloud" : "text-red-300"}`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-5 left-5 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-navy-card border border-gold/40 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {items.map((id) => {
                const p = products.find((x) => x.id === id);
                return (
                  <div key={id} className="relative group/tray">
                    <div className="w-12 h-12 rounded-xl bg-navy-tile border border-edge overflow-hidden flex items-center justify-center p-1">
                      {p && <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />}
                    </div>
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/tray:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
              {Array.from({ length: 2 - items.length }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-xl border-2 border-dashed border-edge flex items-center justify-center">
                  <GitCompare size={16} className="text-cloud-muted/40" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-cloud-muted uppercase tracking-wider">{items.length}/2</span>
              <button
                onClick={onOpen}
                disabled={items.length < 2}
                className="bg-gold text-navy font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-gold-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Comparer <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}