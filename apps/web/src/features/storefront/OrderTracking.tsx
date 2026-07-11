import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, Truck, Home, XCircle, Search, ArrowRight } from "lucide-react";
import { api } from "../../lib/api-client";
import { formatDA } from "../../lib/format";
import type { OrderView, OrderStatus } from "@electrozone/shared";

const STATUS_STEPS: { id: OrderStatus; label: string; icon: typeof Package }[] = [
  { id: "nouveau", label: "Commande reçue", icon: Search },
  { id: "confirme", label: "Confirmée", icon: CheckCircle },
  { id: "expedie", label: "Expédiée", icon: Truck },
  { id: "livre", label: "Livrée", icon: Home },
];

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Paiement à la livraison",
  cib: "Virement CIB interbancaire",
  card: "Carte Visa / Mastercard",
  pickup: "Retrait en magasin",
  installment: "Paiement échelonné",
};

function stepIndex(status: string): number {
  if (status === "annule") return -1;
  return STATUS_STEPS.findIndex((s) => s.id === status);
}

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .getOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Commande introuvable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-10 py-20 text-center">
        <div className="animate-pulse text-cloud-muted">Chargement de la commande...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-10 py-10">
        <div className="bg-navy-card border border-edge rounded-xl p-8 text-center">
          <p className="text-cloud-muted mb-4">{error ?? "Commande introuvable"}</p>
          <div className="flex gap-2 justify-center">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Entrez un numéro de commande"
              className="bg-navy-tile border border-edge rounded px-3 py-2 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
            />
            <Link
              to={searchInput ? `/order/${searchInput.trim()}` : "#"}
              className="bg-gold text-navy font-mono text-xs font-bold px-4 rounded hover:bg-gold-bright transition-colors flex items-center"
            >
              <Search size={16} />
            </Link>
          </div>
          <Link to="/" className="text-gold underline mt-4 inline-block text-sm">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const currentStep = stepIndex(order.status);
  const isCancelled = order.status === "annule";

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-10 py-10">
      <nav className="font-mono text-xs text-cloud-muted mb-6">
        <Link to="/" className="hover:text-gold">ACCUEIL</Link>
        <span className="mx-2">/</span>
        <span className="text-gold uppercase">Suivi de commande</span>
      </nav>

      <h1 className="font-head font-bold text-3xl mb-2">Suivi de commande</h1>
      <p className="font-mono text-sm text-cloud-muted mb-8">N° {order.id}</p>

      {isCancelled ? (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 mb-6 flex items-center gap-4">
          <XCircle className="text-red-400 shrink-0" size={32} />
          <div>
            <p className="font-medium text-red-300">Commande annulée</p>
            <p className="text-sm text-cloud-muted">Cette commande a été annulée. Contactez-nous pour plus d'informations.</p>
          </div>
        </div>
      ) : (
        <div className="bg-navy-card border border-edge rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? "bg-gold border-gold text-navy"
                          : "bg-navy-tile border-edge text-cloud-muted"
                      } ${isCurrent ? "ring-2 ring-gold/30" : ""}`}
                    >
                      <step.icon size={20} />
                    </div>
                    <span className={`font-mono text-[10px] ${done ? "text-gold" : "text-cloud-muted"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-gold" : "bg-edge"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-navy-card border border-edge rounded-xl p-5 mb-6">
        <h2 className="font-mono text-sm text-cloud-muted uppercase tracking-wider mb-3">Articles</h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-cloud">{item.id} ×{item.quantity}</span>
              <span className="font-mono text-cloud">{formatDA(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-edge pt-3 mt-3 flex justify-between items-baseline">
          <span className="font-mono text-sm text-cloud-muted uppercase tracking-wider">Total</span>
          <span className="font-mono text-xl text-gold">{formatDA(order.total)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-navy-card border border-edge rounded-xl p-4">
          <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-1">Paiement</p>
          <p className="text-sm text-cloud">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
        </div>
        <div className="bg-navy-card border border-edge rounded-xl p-4">
          <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-1">Livraison</p>
          <p className="text-sm text-cloud">{order.wilaya}</p>
          <p className="text-xs text-cloud-muted">{order.address}</p>
        </div>
      </div>

      {order.documentNames.length > 0 && (
        <div className="bg-navy-card border border-edge rounded-xl p-4 mb-6">
          <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">Justificatifs</p>
          <div className="space-y-1">
            {order.documentNames.map((name) => (
              <p key={name} className="text-sm text-cloud">{name}</p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-navy-card border border-edge rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-1">Date</p>
          <p className="text-sm text-cloud">{new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <Link to="/" className="bg-gold/10 border border-gold/30 text-gold font-mono text-sm px-4 py-2 rounded hover:bg-gold hover:text-navy transition-colors flex items-center gap-2">
          Continuer mes achats <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}