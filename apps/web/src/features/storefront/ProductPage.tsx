import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ShieldCheck, Truck, Wallet, Star, Package, ArrowRight } from "lucide-react";
import { useProducts, useOffers, useBundles, useCategories } from "../../data/store";
import { priceProduct, bundleFinalPrice } from "../../lib/offers";
import { formatDA } from "../../lib/format";
import { useCart } from "../../context/CartContext";
import { getMockReviews, getRatingSummary } from "../../lib/reviews";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "fill-gold text-gold" : "text-cloud/20"}
        />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const products = useProducts();
  const offers = useOffers();
  const bundles = useBundles();
  const categories = useCategories();
  const { add } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product)
    return (
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16">
        Produit introuvable. <Link to="/" className="text-gold underline">Retour</Link>
      </div>
    );

  const pr = priceProduct(product, offers);
  const catName = categories.find((c) => c.slug === product.categorySlug)?.name ?? product.categorySlug;

  const reviews = getMockReviews(product.id);
  const summary = getRatingSummary(reviews);

  const fbtBundles = bundles.filter(
    (b) => b.isActive && b.items.some((it) => it.productId === product.id),
  );

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-10">
      <nav className="font-mono text-xs text-cloud-muted mb-6">
        <Link to="/" className="hover:text-gold">ACCUEIL</Link>
        <span className="mx-2">/</span>
        <Link to={`/c/${product.categorySlug}`} className="hover:text-gold uppercase">{catName}</Link>
        <span className="mx-2">/</span>
        <span className="text-cloud-muted truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative bg-navy-tile rounded-xl border border-edge overflow-hidden">
          {pr.discountPct > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-red-500/20 text-red-300 border border-red-400/30 font-mono text-xs px-2 py-1 rounded">
              -{pr.discountPct}%
            </span>
          )}
          <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-contain p-8" />
        </div>
        <div>
          <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider">{product.brand}</p>
          <h1 className="font-head font-bold text-3xl mt-2">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-gold text-3xl">{formatDA(pr.finalPrice)}</span>
            {pr.discountPct > 0 && (
              <span className="font-mono text-lg text-cloud-muted line-through">{formatDA(pr.originalPrice)}</span>
            )}
          </div>
          <p className="mt-4 text-cloud-muted leading-relaxed">{product.description}</p>

          <table className="mt-6 text-sm w-full font-mono">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-b border-edge">
                  <td className="py-2.5 text-cloud-muted capitalize">{k.replace(/_/g, " ")}</td>
                  <td className="py-2.5 text-cloud text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 font-mono text-sm">
            {product.stock > 0 ? (
              <span className="text-gold">EN STOCK ({product.stock})</span>
            ) : (
              <span className="text-red-400">RUPTURE DE STOCK</span>
            )}
          </p>

          <button
            onClick={() => add("product", product.id)}
            disabled={product.stock === 0}
            className="mt-6 w-full sm:w-auto bg-gold text-navy font-mono font-bold px-8 py-4 rounded hover:bg-gold-bright disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart size={18} /> AJOUTER AU PANIER
          </button>

          <div className="mt-8 grid grid-cols-3 gap-3 font-mono text-[11px] text-cloud-muted">
            <div className="flex flex-col items-center gap-1.5 text-center"><ShieldCheck className="text-gold" size={20} /> PRODUITS ORIGINAUX</div>
            <div className="flex flex-col items-center gap-1.5 text-center"><Truck className="text-gold" size={20} /> LIVRAISON 58 WILAYAS</div>
            <div className="flex flex-col items-center gap-1.5 text-center"><Wallet className="text-gold" size={20} /> PAIEMENT À LA LIVRAISON</div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between mb-6 border-b border-edge pb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-head font-bold text-2xl">Avis clients</h2>
            {summary.count > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={summary.avg} />
                <span className="font-mono text-sm text-gold">{summary.avg.toFixed(1)}</span>
                <span className="font-mono text-xs text-cloud-muted">({summary.count} avis)</span>
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-navy-card border border-edge rounded-xl p-8 text-center text-cloud-muted">
            Aucun avis pour ce produit pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-navy-card border border-edge rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-sm">
                      {r.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cloud">{r.author}</p>
                      <p className="font-mono text-[11px] text-cloud-muted">{r.date}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={14} />
                </div>
                <p className="font-semibold text-cloud text-sm mb-1">{r.title}</p>
                <p className="text-sm text-cloud-muted leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {fbtBundles.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6 border-b border-edge pb-4">
            <Package className="text-gold" size={24} />
            <h2 className="font-head font-bold text-2xl">Souvent achetés ensemble</h2>
          </div>
          <div className="space-y-4">
            {fbtBundles.map((b) => {
              const bundleProducts = b.items
                .map((it) => products.find((p) => p.id === it.productId))
                .filter((p): p is NonNullable<typeof p> => p !== undefined);
              const price = bundleFinalPrice(b, products);
              const savings = b.bundlePrice
                ? bundleProducts.reduce((s, p) => s + p.price, 0) - b.bundlePrice
                : 0;

              return (
                <div key={b.id} className="bg-navy-card border border-edge rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      {bundleProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                          {i > 0 && <span className="text-cloud-muted font-mono text-lg">+</span>}
                          <Link to={`/p/${p.id}`} className="flex items-center gap-2 bg-navy-tile rounded-lg p-2 hover:border-gold border border-transparent transition-colors">
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-contain" />
                            <span className="text-xs text-cloud max-w-[120px] line-clamp-2">{p.name}</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="lg:ml-auto flex flex-col justify-center gap-2 lg:text-right">
                      <p className="font-mono text-2xl text-gold">{formatDA(price)}</p>
                      {savings > 0 && (
                        <p className="font-mono text-xs text-green-400">Économisez {formatDA(savings)}</p>
                      )}
                      <button
                        onClick={() => add("bundle", b.id)}
                        className="bg-gold/10 border border-gold/30 text-gold font-mono text-sm px-5 py-2.5 rounded hover:bg-gold hover:text-navy transition-colors flex items-center justify-center gap-2 lg:ml-auto"
                      >
                        <ShoppingCart size={15} /> Ajouter le pack <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-cloud-muted">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}