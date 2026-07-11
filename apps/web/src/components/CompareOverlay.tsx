import { X, ShoppingCart, Star, CheckCircle, TrendingDown } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useProducts, useOffers, useCategories } from "../data/store";
import { useCart } from "../context/CartContext";
import { priceProduct } from "../lib/offers";
import { formatDA } from "../lib/format";
import { getMockReviews, getRatingSummary } from "../lib/reviews";

function isNumeric(v: string): boolean {
  return !isNaN(parseFloat(v.replace(/[^0-9.,]/g, "").replace(",", ".")));
}

function extractNum(v: string): number {
  return parseFloat(v.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

export default function CompareOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, clearCompare } = useCompare();
  const products = useProducts();
  const offers = useOffers();
  const categories = useCategories();
  const { add } = useCart();

  if (!open || items.length === 0) return null;

  const selected = items
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (selected.length === 0) {
    onClose();
    return null;
  }

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const priced = selected.map((p) => ({ p, pr: priceProduct(p, offers) }));
  const summaries = selected.map((p) => getRatingSummary(getMockReviews(p.id)));

  const allSpecKeys = [...new Set(selected.flatMap((p) => Object.keys(p.specs)))];

  const minPrice = Math.min(...priced.map((x) => x.pr.finalPrice));
  const maxStock = Math.max(...selected.map((p) => p.stock));
  const maxRating = Math.max(...summaries.map((s) => s.avg));

  function specHighlight(key: string, values: string[]): boolean {
    const nums = values.filter(isNumeric).map(extractNum);
    if (nums.length !== values.length || nums.length < 2) return false;
    const max = Math.max(...nums);
    const min = Math.min(...nums);
    return max !== min;
  }

  function betterSpecIndex(key: string, values: string[]): number {
    if (!specHighlight(key, values)) return -1;
    const nums = values.map(extractNum);
    return nums.indexOf(Math.max(...nums));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-8 bg-scrim overflow-y-auto" onClick={onClose}>
      <div
        className="bg-navy-card border border-edge rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-edge sticky top-0 bg-navy-card z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-head font-bold text-xl text-cloud">Comparateur</h2>
            <span className="font-mono text-xs text-cloud-muted">{catName(selected[0].categorySlug)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { clearCompare(); onClose(); }}
              className="font-mono text-xs text-cloud-muted hover:text-red-400 transition-colors"
            >
              Tout effacer
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-cloud-muted hover:text-gold hover:bg-cloud/5 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Image row */}
            <tbody>
              <tr>
                <td className="w-32 p-4 align-bottom font-mono text-xs text-cloud-muted uppercase tracking-wider">Image</td>
                {priced.map(({ p }) => (
                  <td key={p.id} className="p-4 align-middle">
                    <div className="bg-navy-tile rounded-xl p-4 flex items-center justify-center h-40">
                      <img src={p.imageUrl} alt={p.name} className="h-full object-contain" />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Name row */}
              <tr className="border-t border-edge">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Nom</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 align-top">
                    <p className="font-semibold text-cloud text-sm leading-snug">{p.name}</p>
                  </td>
                ))}
              </tr>

              {/* Brand row */}
              <tr className="border-t border-edge bg-navy-tile/30">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider">Marque</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 font-mono text-sm text-cloud">{p.brand}</td>
                ))}
              </tr>

              {/* Price row */}
              <tr className="border-t border-edge">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Prix</td>
                {priced.map(({ p, pr }) => {
                  const isBest = pr.finalPrice === minPrice && selected.length > 1;
                  return (
                    <td key={p.id} className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className={`font-mono text-xl ${isBest ? "text-gold font-bold" : "text-cloud"}`}>{formatDA(pr.finalPrice)}</span>
                          {pr.discountPct > 0 && (
                            <span className="font-mono text-xs text-cloud-muted line-through">{formatDA(pr.originalPrice)}</span>
                          )}
                        </div>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gold font-mono">
                            <TrendingDown size={11} /> Meilleur prix
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Category row */}
              <tr className="border-t border-edge bg-navy-tile/30">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider">Catégorie</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 text-sm text-cloud-muted">{catName(p.categorySlug)}</td>
                ))}
              </tr>

              {/* Stock row */}
              <tr className="border-t border-edge">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Stock</td>
                {selected.map((p) => {
                  const isBest = p.stock === maxStock && selected.length > 1 && selected.some((x) => x.stock !== p.stock);
                  return (
                    <td key={p.id} className="p-4 align-top">
                      {p.stock > 0 ? (
                        <span className={`font-mono text-sm ${isBest ? "text-green-400 font-bold" : "text-gold"}`}>
                          EN STOCK ({p.stock})
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-red-400">RUPTURE</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Rating row */}
              <tr className="border-t border-edge bg-navy-tile/30">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Avis</td>
                {summaries.map((s, i) => {
                  const isBest = s.avg === maxRating && selected.length > 1 && selected.some((_, j) => summaries[j].avg !== s.avg);
                  return (
                    <td key={i} className="p-4 align-top">
                      {s.count > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} size={14} className={j < Math.round(s.avg) ? "fill-gold text-gold" : "text-cloud/20"} />
                            ))}
                          </div>
                          <span className={`font-mono text-sm ${isBest ? "text-gold font-bold" : "text-cloud-muted"}`}>{s.avg.toFixed(1)}</span>
                          <span className="font-mono text-xs text-cloud-muted">({s.count})</span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-cloud-muted">Aucun avis</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Description row */}
              <tr className="border-t border-edge">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Description</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 align-top">
                    <p className="text-sm text-cloud-muted leading-relaxed">{p.description}</p>
                  </td>
                ))}
              </tr>

              {/* Spec rows */}
              {allSpecKeys.map((key, idx) => {
                const values = selected.map((p) => p.specs[key] ?? "—");
                const betterIdx = betterSpecIndex(key, values);
                return (
                  <tr key={key} className={`border-t border-edge ${idx % 2 === 0 ? "bg-navy-tile/30" : ""}`}>
                    <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">{key.replace(/_/g, " ")}</td>
                    {values.map((v, i) => (
                      <td key={i} className="p-4 align-top">
                        <span className={`font-mono text-sm ${i === betterIdx ? "text-gold font-bold" : "text-cloud"}`}>
                          {v}
                        </span>
                        {i === betterIdx && (
                          <CheckCircle size={12} className="inline-block ml-1.5 text-gold" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Add to cart row */}
              <tr className="border-t border-edge">
                <td className="p-4 font-mono text-xs text-cloud-muted uppercase tracking-wider align-top">Action</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 align-top">
                    <button
                      onClick={() => add("product", p.id)}
                      disabled={p.stock === 0}
                      className="bg-gold text-navy font-mono font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gold-bright transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <ShoppingCart size={15} /> Ajouter
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}