import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { api } from "../../lib/api-client";
import { formatDA } from "../../lib/format";
import type { OrderView, OrderStatus } from "@electrozone/shared";

const STATUS_FLOW: { id: OrderStatus; label: string; tone: string }[] = [
  { id: "nouveau", label: "Nouveau", tone: "bg-white/10 text-cloud-muted" },
  { id: "confirme", label: "Confirmé", tone: "bg-gold/15 text-gold" },
  { id: "expedie", label: "Expédié", tone: "bg-blue-500/15 text-blue-300" },
  { id: "livre", label: "Livré", tone: "bg-green-500/15 text-green-300" },
  { id: "annule", label: "Annulé", tone: "bg-red-500/15 text-red-300" },
];

const PAYMENT_LABELS: Record<string, string> = {
  cod: "COD",
  cib: "CIB",
  card: "Carte",
  pickup: "Retrait",
  installment: "Échelonné",
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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
    return STATUS_FLOW.find((s) => s.id === status)?.tone ?? "bg-white/10 text-cloud-muted";
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
                <th className="p-4">Suivi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="p-4 font-mono text-xs text-cloud-muted truncate max-w-[100px]">{o.id.slice(0, 8)}</td>
                  <td className="p-4 font-medium text-cloud">{o.customerName}</td>
                  <td className="p-4 text-cloud-muted">{o.phone}</td>
                  <td className="p-4 text-cloud-muted">{o.wilaya}</td>
                  <td className="p-4 text-cloud-muted">
                    {o.items.map((it, i) => (
                      <div key={i} className="text-xs">
                        {it.id} ×{it.quantity}
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
                    <Link
                      to={`/order/${o.id}`}
                      className="text-gold hover:text-gold-bright flex items-center gap-1 text-xs"
                    >
                      <ExternalLink size={14} /> Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}