import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, X, MapPin, CreditCard, Truck, Wrench, Tag, FileText } from "lucide-react";
import { api } from "../../lib/api-client";
import { formatDA } from "../../lib/format";
import { useProducts, useBundles } from "../../data/store";
import type { OrderView, OrderStatus } from "@electrozone/shared";

const STATUS_FLOW: { id: OrderStatus; label: string; tone: string }[] = [
  { id: "nouveau", label: "Nouveau", tone: "bg-overlay-10 text-cloud-muted" },
  { id: "confirme", label: "Confirmé", tone: "bg-gold/15 text-gold" },
  { id: "expedie", label: "Expédié", tone: "bg-blue-500/15 text-blue-300" },
  { id: "livre", label: "Livré", tone: "bg-green-500/15 text-green-300" },
  { id: "annule", label: "Annulé", tone: "bg-red-500/15 text-red-300" },
];

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Paiement à la livraison",
  cib: "Virement CIB",
  card: "Carte Visa/Mastercard",
  pickup: "Retrait en magasin",
  installment: "Paiement échelonné",
};

export default function Orders() {
  const products = useProducts();
  const bundles = useBundles();
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderView | null>(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await api.listOrders();
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrders();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de mise à jour");
    } finally {
      setUpdating(null);
    }
  }

  function getTone(status: string): string {
    return STATUS_FLOW.find((s) => s.id === status)?.tone ?? "bg-overlay-10 text-cloud-muted";
  }

  function getItemName(item: { kind: string; id: string }): string {
    if (item.kind === "product") return products.find((p) => p.id === item.id)?.name ?? item.id;
    return bundles.find((b) => b.id === item.id)?.name ?? item.id;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-head text-3xl font-bold text-cloud">Commandes</h1>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button onClick={fetchOrders} className="text-xs text-cloud-muted hover:text-gold font-mono">
            {loading ? "..." : "Actualiser"}
          </button>
          <span className="text-sm text-cloud-muted">{orders.length} commande(s)</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-navy-card border border-edge rounded-2xl p-16 text-center text-cloud-muted animate-pulse">
          Chargement des commandes...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-navy-card border border-edge rounded-2xl p-16 text-center text-cloud-muted">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="bg-navy-card border border-edge rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-tile text-left text-cloud-muted font-mono text-xs uppercase">
              <tr>
                <th className="p-4">N°</th>
                <th className="p-4">Client</th>
                <th className="p-4">Téléphone</th>
                <th className="p-4">Wilaya</th>
                <th className="p-4">Articles</th>
                <th className="p-4">Total</th>
                <th className="p-4">Paiement</th>
                <th className="p-4">Date</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-overlay-5">
                  <td className="p-4 font-mono text-xs text-cloud-muted truncate max-w-[100px]">{o.id.slice(0, 8)}</td>
                  <td className="p-4 font-medium text-cloud">{o.customerName}</td>
                  <td className="p-4 text-cloud-muted">{o.phone}</td>
                  <td className="p-4 text-cloud-muted">{o.wilaya}</td>
                  <td className="p-4 text-cloud-muted">
                    {o.items.map((it, i) => (
                      <div key={i} className="text-xs truncate max-w-[150px]">
                        {getItemName(it)} ×{it.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-mono text-gold">{formatDA(o.total)}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-navy-tile text-cloud-muted">
                      {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-cloud-muted text-xs">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTone(o.status)}`}>
                        {STATUS_FLOW.find((s) => s.id === o.status)?.label ?? o.status}
                      </span>
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-navy-tile border border-edge rounded text-xs text-cloud py-1 px-1 focus:outline-none focus:border-gold disabled:opacity-50"
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailOrder(o)}
                        className="text-gold hover:text-gold-bright text-xs font-mono"
                      >
                        Détails
                      </button>
                      <Link
                        to={`/order/${o.id}`}
                        className="text-gold hover:text-gold-bright flex items-center gap-1 text-xs"
                      >
                        <ExternalLink size={14} /> Suivi
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          products={products}
          bundles={bundles}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  products,
  bundles,
  onClose,
}: {
  order: OrderView;
  products: { id: string; name: string; imageUrl: string; price: number }[];
  bundles: { id: string; name: string; imageUrl: string }[];
  onClose: () => void;
}) {
  function getItemName(id: string, kind: string): string {
    if (kind === "product") return products.find((p) => p.id === id)?.name ?? id;
    return bundles.find((b) => b.id === id)?.name ?? id;
  }
  function getItemImage(id: string, kind: string): string {
    if (kind === "product") return products.find((p) => p.id === id)?.imageUrl ?? "";
    return bundles.find((b) => b.id === id)?.imageUrl ?? "";
  }

  return (
    <div className="fixed inset-0 bg-scrim z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-navy-card border border-edge rounded-2xl shadow-2xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-edge sticky top-0 bg-navy-card z-10 rounded-t-2xl">
          <div>
            <h2 className="font-head font-bold text-xl text-cloud">Commande #{order.id.slice(0, 8)}</h2>
            <p className="font-mono text-xs text-cloud-muted mt-1">
              {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-cloud-muted hover:text-gold hover:bg-cloud/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-navy-tile rounded-xl p-4">
              <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">Client</p>
              <p className="text-sm font-medium text-cloud">{order.customerName}</p>
              <p className="text-xs text-cloud-muted mt-0.5">{order.email}</p>
              <p className="text-xs text-cloud-muted">{order.phone}</p>
            </div>
            <div className="bg-navy-tile rounded-xl p-4">
              <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">Livraison</p>
              <div className="flex items-start gap-1.5">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-cloud">{order.address}</p>
                  <p className="text-xs text-cloud-muted">{order.wilaya}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-3">Articles</p>
            <div className="bg-navy-tile rounded-xl divide-y divide-edge">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <img src={getItemImage(it.id, it.kind)} alt="" className="w-10 h-10 object-contain rounded bg-navy-card p-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cloud truncate">{getItemName(it.id, it.kind)}</p>
                    <p className="font-mono text-xs text-cloud-muted">{formatDA(it.unitPrice)} × {it.quantity}</p>
                  </div>
                  <span className="font-mono text-sm text-gold shrink-0">{formatDA(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment + delivery details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-navy-tile rounded-xl p-4 space-y-2">
              <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-1">Paiement & Livraison</p>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard size={14} className="text-gold" />
                <span className="text-cloud">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck size={14} className="text-gold" />
                <span className="text-cloud">{order.deliveryMethod === "standard" ? "Standard (3-5j)" : "Créneau planifié"}</span>
              </div>
              {order.installation && (
                <div className="flex items-center gap-2 text-sm">
                  <Wrench size={14} className="text-gold" />
                  <span className="text-cloud">Installation à domicile</span>
                </div>
              )}
            </div>

            <div className="bg-navy-tile rounded-xl p-4 space-y-2">
              <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-1">Coûts</p>
              <div className="flex justify-between text-sm">
                <span className="text-cloud-muted">Sous-total articles</span>
                <span className="text-cloud">{formatDA(order.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0))}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 flex items-center gap-1"><Tag size={12} /> Remise {order.promoCode ? `(${order.promoCode})` : ""}</span>
                  <span className="text-green-400">-{formatDA(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-cloud-muted">Livraison</span>
                <span className="text-cloud">{formatDA(order.deliveryFee)}</span>
              </div>
              {order.installationFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-cloud-muted">Installation</span>
                  <span className="text-cloud">{formatDA(order.installationFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-edge pt-2">
                <span className="font-mono text-sm text-cloud-muted uppercase">Total</span>
                <span className="font-mono text-lg text-gold font-bold">{formatDA(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Documents (installment) */}
          {order.documentNames.length > 0 && (
            <div className="bg-navy-tile rounded-xl p-4">
              <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-gold" /> Justificatifs
              </p>
              <div className="space-y-1">
                {order.documentNames.map((name) => (
                  <p key={name} className="text-sm text-cloud">{name}</p>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 pt-2">
            <span className="font-mono text-xs text-cloud-muted uppercase tracking-wider">Statut:</span>
            <span className={`text-xs px-3 py-1 rounded-full ${STATUS_FLOW.find((s) => s.id === order.status)?.tone ?? "bg-overlay-10"}`}>
              {STATUS_FLOW.find((s) => s.id === order.status)?.label ?? order.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}