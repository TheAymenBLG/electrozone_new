import { useCart } from "../../context/CartContext";
import { useProducts, useBundles, useOffers } from "../../data/store";
import { priceProduct, bundleFinalPrice } from "../../lib/offers";
import { formatDA } from "../../lib/format";
import { Trash2, Plus, Minus, Tag, Truck, Wrench, Package, X, Check, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { DeliveryMethod } from "@electrozone/shared";

const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  standard: 1000,
  scheduled: 1800,
};
const INSTALLATION_FEE = 2500;

const PROMO_CODES: Record<string, { type: "percentage" | "fixed"; value: number; label: string }> = {
  WELCOME10: { type: "percentage", value: 10, label: "Bienvenue -10%" },
  BIENVENUE: { type: "fixed", value: 2000, label: "Réduction 2000 DA" },
  PACK5: { type: "percentage", value: 5, label: "Pack -5%" },
};

export default function Cart() {
  const { lines, remove, setQty, clear } = useCart();
  const products = useProducts();
  const bundles = useBundles();
  const offers = useOffers();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [installation, setInstallation] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string; type: "percentage" | "fixed"; value: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const rows = useMemo(() => {
    return lines.map((l) => {
      if (l.kind === "product") {
        const p = products.find((x) => x.id === l.id);
        return {
          id: l.id,
          name: p?.name ?? "Produit",
          imageUrl: p?.imageUrl ?? "",
          unit: p ? priceProduct(p, offers).finalPrice : 0,
          qty: l.quantity,
          kind: "product" as const,
        };
      }
      const b = bundles.find((x) => x.id === l.id);
      return {
        id: l.id,
        name: b?.name ?? "Pack",
        imageUrl: b?.imageUrl ?? "",
        unit: b ? bundleFinalPrice(b, products) : 0,
        qty: l.quantity,
        kind: "bundle" as const,
      };
    });
  }, [lines, products, bundles, offers]);

  const subtotal = rows.reduce((s, r) => s + r.unit * r.qty, 0);

  const cartProductIds = new Set(
    lines.filter((l) => l.kind === "product").map((l) => l.id),
  );
  const cartBundleIds = new Set(
    lines.filter((l) => l.kind === "bundle").map((l) => l.id),
  );

  const fbtBundles = bundles.filter(
    (b) =>
      b.isActive &&
      !cartBundleIds.has(b.id) &&
      b.items.some((it) => cartProductIds.has(it.productId)),
  );

  const discountAmount = useMemo(() => {
    if (!promoApplied) return 0;
    if (promoApplied.type === "percentage") {
      return Math.round(subtotal * (promoApplied.value / 100));
    }
    return Math.min(promoApplied.value, subtotal);
  }, [promoApplied, subtotal]);

  const deliveryFee = rows.length > 0 ? DELIVERY_FEES[deliveryMethod] : 0;
  const installationFee = installation && rows.length > 0 ? INSTALLATION_FEE : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee + installationFee);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES[code];
    if (found) {
      setPromoApplied({ code, label: found.label, type: found.type, value: found.value });
      setPromoError(null);
    } else {
      setPromoError("Code promo invalide.");
      setPromoApplied(null);
    }
  }

  function removePromo() {
    setPromoApplied(null);
    setPromoInput("");
    setPromoError(null);
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-10">
        <h1 className="font-head font-bold text-3xl mb-6">Mon Panier</h1>
        <div className="bg-navy-card border border-edge rounded-xl p-16 text-center text-cloud-muted">
          Votre panier est vide.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-10">
      <h1 className="font-head font-bold text-3xl mb-6">Mon Panier</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="bg-navy-card border border-edge rounded-xl divide-y divide-edge">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4">
                <img src={r.imageUrl} alt={r.name} className="w-14 h-14 object-contain bg-navy-tile rounded-lg p-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-cloud font-medium truncate">{r.name}</p>
                  <p className="font-mono text-xs text-cloud-muted">{formatDA(r.unit)} / unité</p>
                </div>
                <div className="flex items-center gap-2 bg-navy-tile border border-edge rounded-lg">
                  <button
                    onClick={() => setQty(r.id, r.qty - 1)}
                    className="p-2 text-cloud-muted hover:text-gold transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-sm text-cloud w-8 text-center">{r.qty}</span>
                  <button
                    onClick={() => setQty(r.id, r.qty + 1)}
                    className="p-2 text-cloud-muted hover:text-gold transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-mono text-gold w-28 text-right">{formatDA(r.unit * r.qty)}</span>
                <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-300 shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={clear} className="font-mono text-xs text-cloud-muted underline hover:text-red-400 transition-colors">
            VIDER LE PANIER
          </button>

          {fbtBundles.length > 0 && (
            <div className="bg-navy-card border border-gold/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-gold" size={20} />
                <h2 className="font-head font-bold text-lg">Packs associés à votre panier</h2>
              </div>
              <div className="space-y-3">
                {fbtBundles.map((b) => {
                  const price = bundleFinalPrice(b, products);
                  const componentTotal = b.items.reduce((s, it) => {
                    const p = products.find((x) => x.id === it.productId);
                    return s + (p ? p.price * it.quantity : 0);
                  }, 0);
                  const savings = b.bundlePrice ? componentTotal - b.bundlePrice : 0;
                  return (
                    <div key={b.id} className="flex items-center gap-3 bg-navy-tile rounded-lg p-3">
                      <img src={b.imageUrl} alt={b.name} className="w-12 h-12 object-contain shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cloud truncate">{b.name}</p>
                        <p className="text-xs text-cloud-muted truncate">{b.description}</p>
                        {savings > 0 && (
                          <p className="font-mono text-[11px] text-green-400 mt-0.5">Économisez {formatDA(savings)}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm text-gold">{formatDA(price)}</p>
                        <a
                          href={`/p/${b.items[0]?.productId}`}
                          className="font-mono text-[11px] text-cloud-muted hover:text-gold underline"
                        >
                          Voir le pack
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-navy-card border border-edge rounded-xl p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="text-gold" size={18} />
                <h3 className="font-mono text-sm text-cloud uppercase tracking-wider">Code promo</h3>
              </div>
              {promoApplied ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-400/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-400" size={16} />
                    <div>
                      <p className="text-sm text-cloud font-medium">{promoApplied.label}</p>
                      <p className="font-mono text-[11px] text-cloud-muted">Code: {promoApplied.code}</p>
                    </div>
                  </div>
                  <button onClick={removePromo} className="text-red-400 hover:text-red-300">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Entrez votre code"
                      className="flex-1 bg-navy-tile border border-edge rounded px-3 py-2 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={applyPromo}
                      className="bg-gold/10 border border-gold/30 text-gold font-mono text-xs px-4 rounded hover:bg-gold hover:text-navy transition-colors"
                    >
                      APPLIQUER
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-400 mt-1.5">{promoError}</p>}
                  <p className="font-mono text-[10px] text-cloud-muted/60 mt-1.5">Essayez: WELCOME10, BIENVENUE, PACK5</p>
                </>
              )}
            </div>

            <div className="border-t border-edge pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="text-gold" size={18} />
                <h3 className="font-mono text-sm text-cloud uppercase tracking-wider">Livraison</h3>
              </div>
              <div className="space-y-2">
                <label className={`flex items-center justify-between cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${deliveryMethod === "standard" ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}>
                  <div className="flex items-center gap-2.5">
                    <input type="radio" name="delivery" checked={deliveryMethod === "standard"} onChange={() => setDeliveryMethod("standard")} className="accent-gold" />
                    <div>
                      <p className="text-sm text-cloud">Standard (3-5 jours)</p>
                      <p className="font-mono text-[11px] text-cloud-muted">Toutes wilayas</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-gold">{formatDA(DELIVERY_FEES.standard)}</span>
                </label>
                <label className={`flex items-center justify-between cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${deliveryMethod === "scheduled" ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}>
                  <div className="flex items-center gap-2.5">
                    <input type="radio" name="delivery" checked={deliveryMethod === "scheduled"} onChange={() => setDeliveryMethod("scheduled")} className="accent-gold" />
                    <div>
                      <p className="text-sm text-cloud">Créneau planifié</p>
                      <p className="font-mono text-[11px] text-cloud-muted">Choisissez date/heure au checkout</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-gold">{formatDA(DELIVERY_FEES.scheduled)}</span>
                </label>
              </div>
            </div>

            <div className="border-t border-edge pt-4">
              <label className={`flex items-center justify-between cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${installation ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}>
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" checked={installation} onChange={(e) => setInstallation(e.target.checked)} className="accent-gold w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <Wrench className="text-gold" size={16} />
                    <div>
                      <p className="text-sm text-cloud">Installation à domicile</p>
                      <p className="font-mono text-[11px] text-cloud-muted">Technicien qualifié</p>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm text-gold">{formatDA(INSTALLATION_FEE)}</span>
              </label>
            </div>
          </div>

          <div className="bg-navy-card border border-edge rounded-xl p-5 space-y-2.5">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-cloud-muted">Sous-total</span>
              <span className="text-cloud">{formatDA(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-mono text-sm">
                <span className="text-green-400">Remise ({promoApplied?.code})</span>
                <span className="text-green-400">-{formatDA(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-mono text-sm">
              <span className="text-cloud-muted">Livraison ({deliveryMethod === "standard" ? "Standard" : "Planifiée"})</span>
              <span className="text-cloud">{formatDA(deliveryFee)}</span>
            </div>
            {installation && (
              <div className="flex justify-between font-mono text-sm">
                <span className="text-cloud-muted">Installation</span>
                <span className="text-cloud">{formatDA(installationFee)}</span>
              </div>
            )}
            <div className="border-t border-edge pt-2.5 flex justify-between items-baseline">
              <span className="font-mono text-sm text-cloud-muted uppercase tracking-wider">Total</span>
              <span className="font-mono text-2xl text-gold">{formatDA(total)}</span>
            </div>
            <p className="font-mono text-[10px] text-cloud-muted/60 text-center">Prix final, rien à ajouter au checkout</p>
          </div>

          <button
            onClick={() => navigate("/checkout", {
              state: {
                subtotal,
                discountAmount,
                deliveryFee,
                installationFee,
                total,
                deliveryMethod,
                installation,
                promoCode: promoApplied?.code ?? null,
              },
            })}
            className="w-full bg-gold text-navy font-mono font-bold py-4 rounded hover:bg-gold-bright transition-colors flex items-center justify-center gap-2"
          >
            PASSER AU PAIEMENT <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}