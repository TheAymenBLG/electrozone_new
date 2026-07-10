import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts, useBundles } from "../data/store";

export default function CartToast() {
  const { toast, dismissToast, count } = useCart();
  const products = useProducts();
  const bundles = useBundles();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => dismissToast(), 3500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, dismissToast]);

  if (!toast) return null;

  const name =
    toast.kind === "product"
      ? products.find((p) => p.id === toast.itemId)?.name
      : bundles.find((b) => b.id === toast.itemId)?.name;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] animate-[slideUp_0.3s_ease-out]">
      <div className="bg-navy-card border border-gold/40 rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[300px] max-w-[90vw]">
        <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
          <CheckCircle className="text-gold" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cloud">
            {name ? name : "Article"} ajouté au panier
          </p>
          <p className="font-mono text-[11px] text-cloud-muted">{count} article(s) au total</p>
        </div>
        <Link
          to="/cart"
          onClick={dismissToast}
          className="bg-gold text-navy font-mono text-xs font-bold px-4 py-2.5 rounded hover:bg-gold-bright transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ShoppingCart size={14} /> Voir
        </Link>
      </div>
    </div>
  );
}