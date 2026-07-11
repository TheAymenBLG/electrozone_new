import { useEffect, useState } from "react";
import { useProducts, useOffers } from "../../data/store";
import { allCustomers, type CustomerInfo } from "../../lib/analytics";
import { api } from "../../lib/api-client";
import { formatDA } from "../../lib/format";
import type { OrderView } from "@electrozone/shared";

export default function Customers() {
  const products = useProducts();
  const offers = useOffers();
  const [realOrders, setRealOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listOrders()
      .then(setRealOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const customers: CustomerInfo[] = allCustomers(products, offers, realOrders);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-head text-3xl font-bold text-cloud">Clients</h1>
        <div className="flex items-center gap-3">
          {customers.filter((c) => c.isReal).length > 0 && (
            <span className="font-mono text-xs text-green-400">{customers.filter((c) => c.isReal).length} réel(s)</span>
          )}
          <span className="text-sm text-cloud-muted">{customers.length} clients</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-navy-card border border-edge rounded-2xl p-16 text-center text-cloud-muted animate-pulse">
          Chargement...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c, i) => (
            <div key={`${c.name}-${i}`} className="bg-navy-card border border-edge rounded-2xl p-5 hover:border-gold transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cloud truncate">{c.name}</p>
                    {c.isReal && <span className="text-[10px] bg-green-500/15 text-green-300 px-1.5 py-0.5 rounded-full font-mono shrink-0">RÉEL</span>}
                  </div>
                  <p className="text-xs text-cloud-muted truncate">{c.email}</p>
                  <p className="text-xs text-cloud-muted truncate">{c.phone}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-edge pt-3">
                <div>
                  <p className="text-cloud-muted text-xs">Commandes</p>
                  <p className="font-semibold text-cloud">{c.orders}</p>
                </div>
                <div className="text-right">
                  <p className="text-cloud-muted text-xs">Total dépensé</p>
                  <p className="font-mono font-semibold text-gold">{formatDA(c.spent)}</p>
                </div>
              </div>
              <p className="text-xs text-cloud-muted mt-3">{c.wilaya}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}