import { useEffect, useState } from "react";
import { Mail, Send, CheckCircle, XCircle, ShoppingBag, Tag, Phone } from "lucide-react";
import { api } from "../../lib/api-client";
import { formatDA } from "../../lib/format";
import type { OrderView, RetentionTriggerType, RetentionResult } from "@electrozone/shared";

const TRIGGER_TYPES: { id: RetentionTriggerType; label: string; icon: typeof ShoppingBag; desc: string }[] = [
  { id: "abandoned_cart", label: "Rappel panier abandonné", icon: ShoppingBag, desc: "Rappelle au client les articles qu'il n'a pas finalisés" },
  { id: "promo", label: "Email promotionnel", icon: Tag, desc: "Envoie une offre suite à une commande récente" },
  { id: "follow_up", label: "Suivi de commande", icon: Phone, desc: "Récapitulatif de commande + lien de suivi" },
];

export default function Retention() {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState("");
  const [triggerType, setTriggerType] = useState<RetentionTriggerType>("follow_up");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<RetentionResult | null>(null);

  useEffect(() => {
    api.listOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  function selectOrder(id: string) {
    setSelectedOrderId(id);
    setResult(null);
    const order = orders.find((o) => o.id === id);
    if (order) {
      const guessedEmail = order.customerName.toLowerCase().replace(/\s+/g, ".") + "@mail.dz";
      setToEmail(guessedEmail);
    }
  }

  async function send() {
    if (!selectedOrderId || !toEmail.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.triggerRetention(triggerType, selectedOrderId, toEmail.trim());
      setResult(res);
    } catch (e) {
      setResult({ ok: false, messageId: null, error: e instanceof Error ? e.message : "Erreur" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-head text-3xl font-bold text-cloud">Rétention Client</h1>
        <div className="flex items-center gap-2 text-cloud-muted">
          <Mail size={18} />
          <span className="text-sm">Triggers manuels par email</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="bg-navy-card border border-edge rounded-xl p-5">
            <h2 className="font-mono text-sm text-cloud uppercase tracking-wider mb-4">1. Sélectionner une commande</h2>
            {loading ? (
              <div className="text-cloud-muted animate-pulse text-sm">Chargement...</div>
            ) : orders.length === 0 ? (
              <div className="text-cloud-muted text-sm">Aucune commande disponible.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => selectOrder(o.id)}
                    className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${selectedOrderId === o.id ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-cloud truncate">{o.customerName}</p>
                        <p className="font-mono text-[11px] text-cloud-muted">#{o.id.slice(0, 8)} · {o.phone}</p>
                      </div>
                      <span className="font-mono text-sm text-gold shrink-0">{formatDA(o.total)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="bg-navy-card border border-edge rounded-xl p-5">
              <h2 className="font-mono text-sm text-cloud uppercase tracking-wider mb-4">Détails de la commande</h2>
              <div className="space-y-1.5 mb-3">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-cloud-muted">{it.id} ×{it.quantity}</span>
                    <span className="font-mono text-cloud">{formatDA(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-edge pt-2 flex justify-between">
                <span className="font-mono text-sm text-cloud-muted">Total</span>
                <span className="font-mono text-gold">{formatDA(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-navy-card border border-edge rounded-xl p-5 space-y-4">
            <h2 className="font-mono text-sm text-cloud uppercase tracking-wider">2. Type d'email</h2>
            <div className="space-y-2">
              {TRIGGER_TYPES.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-start gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${triggerType === t.id ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"}`}
                >
                  <input type="radio" name="trigger" checked={triggerType === t.id} onChange={() => setTriggerType(t.id)} className="accent-gold mt-0.5" />
                  <t.icon className={triggerType === t.id ? "text-gold" : "text-cloud-muted"} size={18} />
                  <div>
                    <p className="text-sm font-medium text-cloud">{t.label}</p>
                    <p className="font-mono text-[10px] text-cloud-muted">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="border-t border-edge pt-4">
              <label className="block font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">3. Email destinataire</label>
              <input
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="client@email.com"
                className="w-full bg-navy-tile border border-edge rounded px-3 py-2.5 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
            </div>

            <button
              onClick={send}
              disabled={!selectedOrderId || !toEmail.trim() || sending}
              className="w-full bg-gold text-navy font-mono font-bold py-3 rounded hover:bg-gold-bright transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? "ENVOI..." : <><Send size={16} /> ENVOYER L'EMAIL</>}
            </button>
          </div>

          {result && (
            <div className={`rounded-xl p-4 border ${result.ok ? "bg-green-500/10 border-green-400/30" : "bg-red-500/10 border-red-400/30"}`}>
              <div className="flex items-start gap-3">
                {result.ok ? (
                  <CheckCircle className="text-green-400 shrink-0" size={20} />
                ) : (
                  <XCircle className="text-red-400 shrink-0" size={20} />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.ok ? "text-green-300" : "text-red-300"}`}>
                    {result.ok ? "Email envoyé avec succès" : "Échec de l'envoi"}
                  </p>
                  {result.messageId && (
                    <p className="font-mono text-[11px] text-cloud-muted mt-1">ID: {result.messageId}</p>
                  )}
                  {result.error && (
                    <p className="font-mono text-[11px] text-red-300 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}