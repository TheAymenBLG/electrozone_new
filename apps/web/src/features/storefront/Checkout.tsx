import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CreditCard, Banknote, Store, FileText, Truck, CheckCircle, Upload, X, ArrowRight, Wrench, MapPin } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProducts, useBundles, useOffers } from "../../data/store";
import { priceProduct, bundleFinalPrice } from "../../lib/offers";
import { formatDA } from "../../lib/format";
import { api } from "../../lib/api-client";
import type { PaymentMethod, DeliveryMethod, CreateOrderBody } from "@electrozone/shared";

interface CartState {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  installationFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  installation: boolean;
  promoCode: string | null;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "cod", label: "Paiement à la livraison", icon: Banknote, desc: "Payez en espèces à la réception" },
  { id: "cib", label: "Virement CIB interbancaire", icon: CreditCard, desc: "Virement bancaire automatique" },
  { id: "card", label: "Carte Visa / Mastercard", icon: CreditCard, desc: "Paiement sécurisé par carte" },
  { id: "pickup", label: "Retrait en magasin", icon: Store, desc: "Réservez et payez au retrait" },
  { id: "installment", label: "Paiement échelonné", icon: FileText, desc: "Payez en plusieurs fois (justificatifs requis)" },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Paiement à la livraison",
  cib: "Virement CIB interbancaire",
  card: "Carte Visa / Mastercard",
  pickup: "Retrait en magasin",
  installment: "Paiement échelonné",
};

export default function Checkout() {
  const location = useLocation();
  const { lines, clear } = useCart();
  const products = useProducts();
  const bundles = useBundles();
  const offers = useOffers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cartState = (location.state as CartState | null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    wilaya: "",
    address: "",
  });
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [cibRef, setCibRef] = useState("");
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{
    id: string;
    rows: { name: string; qty: number; unit: number; kind: string }[];
    total: number;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    installation: boolean;
    deliveryFee: number;
    installationFee: number;
    customerName: string;
    wilaya: string;
    address: string;
  } | null>(null);

  const rows = lines.map((l) => {
    if (l.kind === "product") {
      const p = products.find((x) => x.id === l.id);
      return { id: l.id, name: p?.name ?? "?", unit: p ? priceProduct(p, offers).finalPrice : 0, qty: l.quantity, kind: "product" as const };
    }
    const b = bundles.find((x) => x.id === l.id);
    return { id: l.id, name: b?.name ?? "?", unit: b ? bundleFinalPrice(b, products) : 0, qty: l.quantity, kind: "bundle" as const };
  });

  const subtotal = cartState?.subtotal ?? rows.reduce((s, r) => s + r.unit * r.qty, 0);
  const discountAmount = cartState?.discountAmount ?? 0;
  const deliveryFee = cartState?.deliveryFee ?? 0;
  const installationFee = cartState?.installationFee ?? 0;
  const total = cartState?.total ?? Math.max(0, subtotal - discountAmount + deliveryFee + installationFee);
  const deliveryMethod = cartState?.deliveryMethod ?? "standard";
  const installation = cartState?.installation ?? false;
  const promoCode = cartState?.promoCode ?? null;

  if (placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-10">
        <div className="bg-navy-card border border-gold/40 rounded-2xl p-8">
          <div className="text-center mb-6">
            <CheckCircle className="mx-auto text-gold" size={56} />
            <h1 className="font-head font-bold text-2xl text-gold mt-4">Commande confirmée</h1>
            <p className="mt-2 font-mono text-cloud-muted">N° {placedOrder.id}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">Articles</h2>
              <div className="bg-navy-tile rounded-lg divide-y divide-edge">
                {placedOrder.rows.map((r, i) => (
                  <div key={i} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-cloud">{r.name} ×{r.qty}</span>
                    <span className="font-mono text-gold">{formatDA(r.unit * r.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-tile rounded-lg p-4 space-y-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-cloud-muted">Mode de paiement</span>
                <span className="text-cloud">{PAYMENT_LABELS[placedOrder.paymentMethod]}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-cloud-muted">Livraison</span>
                <span className="text-cloud">{placedOrder.deliveryMethod === "standard" ? "Standard (3-5j)" : "Créneau planifié"} — {formatDA(placedOrder.deliveryFee)}</span>
              </div>
              {placedOrder.installation && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-cloud-muted">Installation</span>
                  <span className="text-cloud">{formatDA(placedOrder.installationFee)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline border-t border-edge pt-3">
              <span className="font-mono text-sm text-cloud-muted uppercase tracking-wider">Total payé</span>
              <span className="font-mono text-2xl text-gold">{formatDA(placedOrder.total)}</span>
            </div>

            <div className="bg-navy-tile rounded-lg p-4 flex items-start gap-3">
              <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-cloud font-medium">{placedOrder.customerName}</p>
                <p className="text-cloud-muted">{placedOrder.address}, {placedOrder.wilaya}</p>
              </div>
            </div>

            <p className="text-sm text-cloud-muted text-center">
              {placedOrder.paymentMethod === "cod" && "Préparez le montant en espèces pour la livraison."}
              {placedOrder.paymentMethod === "pickup" && "Votre produit sera réservé. Nous vous appellerons quand il sera prêt."}
              {placedOrder.paymentMethod === "installment" && "Nous étudierons vos justificatifs et vous contacterons sous 48h."}
              {placedOrder.paymentMethod === "cib" && "Vous recevrez les coordonnées pour le virement CIB par SMS."}
              {placedOrder.paymentMethod === "card" && "Un lien de paiement sécurisé vous sera envoyé par SMS."}
            </p>

            <div className="flex gap-3 pt-2">
              <Link
                to={`/order/${placedOrder.id}`}
                className="flex-1 bg-gold text-navy font-mono font-bold py-3 rounded text-center hover:bg-gold-bright transition-colors"
              >
                SUIVRE LA COMMANDE
              </Link>
              <Link
                to="/"
                className="flex-1 border border-edge text-cloud font-mono font-bold py-3 rounded text-center hover:border-gold hover:text-gold transition-colors"
              >
                ACCUEIL
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0 && !cartState) {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-10 py-16 text-center">
        <p className="text-cloud-muted">Votre panier est vide.</p>
        <Link to="/" className="text-gold underline mt-4 inline-block">Retour à la boutique</Link>
      </div>
    );
  }

  function updateForm(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setDocumentNames((prev) => [...prev, ...names]);
  }

  function removeDoc(name: string) {
    setDocumentNames((prev) => prev.filter((n) => n !== name));
  }

  function validate(): string | null {
    if (!form.customerName.trim()) return "Le nom est requis";
    if (!form.phone.trim()) return "Le téléphone est requis";
    if (paymentMethod !== "pickup") {
      if (!form.wilaya.trim()) return "La wilaya est requise";
      if (!form.address.trim()) return "L'adresse est requise";
    }
    if (paymentMethod === "installment" && documentNames.length === 0)
      return "Veuillez téléverser au moins un justificatif";
    if (paymentMethod === "card") {
      if (!cardData.number.trim()) return "Numéro de carte requis";
      if (!cardData.name.trim()) return "Nom du titulaire requis";
      if (!cardData.expiry.trim()) return "Date d'expiration requise";
      if (!cardData.cvc.trim()) return "CVC requis";
    }
    if (paymentMethod === "cib" && !cibRef.trim())
      return "Référence CIB requise";
    return null;
  }

  async function submitOrder() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);

    const body: CreateOrderBody = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      wilaya: paymentMethod === "pickup" ? "Retrait magasin" : form.wilaya.trim(),
      address: paymentMethod === "pickup" ? "Retrait magasin" : form.address.trim(),
      items: rows.map((r) => ({ kind: r.kind, id: r.id, quantity: r.qty, unitPrice: r.unit })),
      total,
      deliveryMethod,
      installation,
      promoCode,
      deliveryFee,
      installationFee,
      discountAmount,
      paymentMethod,
      documentNames,
    };

    try {
      const result = await api.createOrder(body);
      setPlacedOrder({
        id: result.id,
        rows: rows.map((r) => ({ name: r.name, qty: r.qty, unit: r.unit, kind: r.kind })),
        total,
        paymentMethod,
        deliveryMethod,
        installation,
        deliveryFee,
        installationFee,
        customerName: form.customerName.trim(),
        wilaya: paymentMethod === "pickup" ? "Retrait magasin" : form.wilaya.trim(),
        address: paymentMethod === "pickup" ? "Retrait magasin" : form.address.trim(),
      });
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-10">
      <nav className="font-mono text-xs text-cloud-muted mb-6">
        <Link to="/cart" className="hover:text-gold">PANIER</Link>
        <span className="mx-2">/</span>
        <span className="text-gold uppercase">Paiement</span>
      </nav>

      <h1 className="font-head font-bold text-3xl mb-2">Paiement</h1>
      <p className="text-sm text-cloud-muted mb-8">
        Commande en tant qu'invité — aucun compte requis.
      </p>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          <section className="bg-navy-card border border-edge rounded-xl p-5">
            <h2 className="font-mono text-sm text-cloud uppercase tracking-wider mb-4">Mode de paiement</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-colors ${paymentMethod === m.id ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-gold" />
                  <m.icon className={paymentMethod === m.id ? "text-gold" : "text-cloud-muted"} size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cloud">{m.label}</p>
                    <p className="font-mono text-[11px] text-cloud-muted">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-navy-card border border-edge rounded-xl p-5 space-y-4">
            <h2 className="font-mono text-sm text-cloud uppercase tracking-wider">Informations de livraison</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={form.customerName}
                onChange={(e) => updateForm("customerName", e.target.value)}
                placeholder="Nom complet *"
                className="bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
              <input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="Téléphone *"
                className="bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
            </div>
            {paymentMethod !== "pickup" && (
              <>
                <input
                  value={form.wilaya}
                  onChange={(e) => updateForm("wilaya", e.target.value)}
                  placeholder="Wilaya *"
                  className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                />
                <input
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="Adresse complète *"
                  className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                />
              </>
            )}
            {paymentMethod === "pickup" && (
              <p className="font-mono text-xs text-gold bg-gold/5 border border-gold/20 rounded-lg px-3 py-2.5">
                Retrait en magasin — adresse de livraison non requise. Nous vous appellerons pour confirmer la disponibilité.
              </p>
            )}
          </section>

          {paymentMethod === "card" && (
            <section className="bg-navy-card border border-edge rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="text-gold" size={18} />
                <h2 className="font-mono text-sm text-cloud uppercase tracking-wider">Carte bancaire</h2>
              </div>
              <input
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                placeholder="Numéro de carte (UI stub — aucun traitement réel)"
                className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
              <input
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                placeholder="Nom du titulaire"
                className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  placeholder="MM/AA"
                  className="bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                />
                <input
                  value={cardData.cvc}
                  onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                  placeholder="CVC"
                  className="bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                />
              </div>
              <p className="font-mono text-[10px] text-cloud-muted/60">Interface de démonstration — aucune donnée n'est traitée ni transmise.</p>
            </section>
          )}

          {paymentMethod === "cib" && (
            <section className="bg-navy-card border border-edge rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="text-gold" size={18} />
                <h2 className="font-mono text-sm text-cloud uppercase tracking-wider">Virement CIB</h2>
              </div>
              <input
                value={cibRef}
                onChange={(e) => setCibRef(e.target.value)}
                placeholder="Référence / RIB client *"
                className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
              <p className="font-mono text-[11px] text-cloud-muted">Les coordonnées bancaires vous seront envoyées par SMS après confirmation.</p>
            </section>
          )}

          {paymentMethod === "installment" && (
            <section className="bg-navy-card border border-edge rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="text-gold" size={18} />
                <h2 className="font-mono text-sm text-cloud uppercase tracking-wider">Justificatifs</h2>
              </div>
              <p className="text-sm text-cloud-muted">Téléversez vos justificatifs pour le paiement échelonné (fichiers acceptés : PDF, images).</p>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-edge rounded-lg py-8 flex flex-col items-center gap-2 text-cloud-muted hover:border-gold hover:text-gold transition-colors"
              >
                <Upload size={24} />
                <span className="font-mono text-xs">Cliquez pour téléverser</span>
              </button>
              {documentNames.length > 0 && (
                <div className="space-y-2">
                  {documentNames.map((name) => (
                    <div key={name} className="flex items-center justify-between bg-navy-tile border border-edge rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-gold shrink-0" />
                        <span className="text-sm text-cloud truncate">{name}</span>
                      </div>
                      <button onClick={() => removeDoc(name)} className="text-red-400 hover:text-red-300 shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {paymentMethod === "cod" && (
            <section className="bg-navy-card border border-edge rounded-xl p-5">
              <div className="flex items-center gap-2">
                <Truck className="text-gold" size={18} />
                <p className="text-sm text-cloud">Préparez le montant exact de <span className="font-mono text-gold font-bold">{formatDA(total)}</span> en espèces pour la livraison.</p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-navy-card border border-edge rounded-xl p-5">
            <h2 className="font-mono text-sm text-cloud-muted uppercase tracking-wider mb-4">Récapitulatif</h2>
            <div className="space-y-2 mb-4">
              {rows.map((r) => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span className="text-cloud-muted truncate flex-1 mr-2">{r.name} ×{r.qty}</span>
                  <span className="font-mono text-cloud">{formatDA(r.unit * r.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-edge pt-3 space-y-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-cloud-muted">Sous-total</span>
                <span className="text-cloud">{formatDA(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-green-400">Remise{promoCode ? ` (${promoCode})` : ""}</span>
                  <span className="text-green-400">-{formatDA(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-mono text-sm">
                <span className="text-cloud-muted">Livraison</span>
                <span className="text-cloud">{formatDA(deliveryFee)}</span>
              </div>
              {installationFee > 0 && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-cloud-muted">Installation</span>
                  <span className="text-cloud">{formatDA(installationFee)}</span>
                </div>
              )}
              <div className="border-t border-edge pt-2.5 flex justify-between items-baseline">
                <span className="font-mono text-sm text-cloud-muted uppercase tracking-wider">Total</span>
                <span className="font-mono text-2xl text-gold">{formatDA(total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="w-full bg-gold text-navy font-mono font-bold py-4 rounded hover:bg-gold-bright transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "TRAITEMENT..." : <>CONFIRMER LA COMMANDE <ArrowRight size={18} /></>}
          </button>
          <p className="font-mono text-[10px] text-cloud-muted/60 text-center">
            En confirmant, vous acceptez nos conditions de vente.
          </p>
        </div>
      </div>
    </div>
  );
}