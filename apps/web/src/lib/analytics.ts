import type { Product, Offer, OrderView } from "@electrozone/shared";
import { priceProduct } from "./offers";

export function unitsSold(p: Product): number {
  let h = 7;
  for (let i = 0; i < p.id.length; i++) h = (h * 33 + p.id.charCodeAt(i)) >>> 0;
  return 15 + (h % 45);
}

export interface Stats { orders: number; revenue: number; income: number; expenses: number; balance: number; }

export function dashboardStats(products: Product[], offers: Offer[], realOrders: OrderView[] = []): Stats {
  const active = products.filter((p) => p.isActive);
  let orders = 0, revenue = 0;
  for (const p of active) {
    const u = unitsSold(p);
    orders += u;
    revenue += priceProduct(p, offers).finalPrice * u;
  }
  for (const o of realOrders) {
    orders += 1;
    revenue += o.total;
  }
  const expenses = Math.round(revenue * 0.42);
  return { orders, revenue, income: revenue, expenses, balance: revenue - expenses };
}

export function salesSeries(products: Product[], offers: Offer[], realOrders: OrderView[] = [], days = 8) {
  const total = dashboardStats(products, offers, realOrders).revenue;
  const weights: number[] = [];
  for (let i = 0; i < days; i++) {
    weights.push(Math.max(0.25, 0.6 + 0.4 * Math.sin(i * 1.3 + 1) + 0.2 * Math.sin(i * 0.7)));
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  const labels: string[] = [];
  const data: number[] = [];
  const today = new Date();
  const scale = days / 8;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    labels.push(d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }));
    let dayRevenue = Math.round((total * weights[days - 1 - i]) / sum / scale);
    const dateStr = d.toISOString().slice(0, 10);
    for (const o of realOrders) {
      if (o.createdAt.slice(0, 10) === dateStr) dayRevenue += o.total;
    }
    data.push(dayRevenue);
  }
  return { labels, data };
}

export function topSelling(products: Product[], realOrders: OrderView[] = [], n = 4) {
  const map = new Map<string, number>();
  for (const o of realOrders) {
    for (const it of o.items) {
      if (it.kind === "product") map.set(it.id, (map.get(it.id) ?? 0) + it.quantity);
    }
  }
  const base = products.filter((p) => p.isActive).map((p) => {
    const realUnits = map.get(p.id) ?? 0;
    return { p, units: unitsSold(p) + realUnits };
  });
  return base.sort((a, b) => b.units - a.units).slice(0, n);
}

const NAMES = [
  "Yacine Benali", "Amina Cherif", "Karim Haddad", "Sara Bouzid", "Mohamed Larbi",
  "Nour Belkacem", "Riad Meziane", "Lina Saadi", "Bilal Ferhat", "Imene Ould",
  "Sofiane Brahimi", "Yasmine Kaci",
];
const WILAYAS = ["Constantine", "Alger", "Oran", "Sétif", "Annaba", "Batna", "Blida"];
const STATUS = ["Livré", "En cours", "Confirmé", "Nouveau"];

export interface DemoOrder { id: string; customer: string; wilaya: string; product: string; qty: number; total: number; status: string; date: string; }

export function demoOrders(products: Product[], offers: Offer[], n = 14): DemoOrder[] {
  const active = products.filter((p) => p.isActive);
  const out: DemoOrder[] = [];
  for (let i = 0; i < n; i++) {
    const p = active[(i * 7 + 3) % active.length];
    const qty = 1 + ((i * 5) % 3);
    const total = priceProduct(p, offers).finalPrice * qty;
    out.push({
      id: "CMD-" + (1000 + i),
      customer: NAMES[i % NAMES.length],
      wilaya: WILAYAS[i % WILAYAS.length],
      product: p.name,
      qty,
      total,
      status: STATUS[i % STATUS.length],
      date: new Date(Date.now() - i * 20 * 3600000).toLocaleDateString("fr-FR"),
    });
  }
  return out;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  wilaya: string;
  orders: number;
  spent: number;
  isReal: boolean;
}

export function demoCustomers(products: Product[], offers: Offer[]): CustomerInfo[] {
  const orders = demoOrders(products, offers, 40);
  const map = new Map<string, CustomerInfo>();
  orders.forEach((o) => {
    const c = map.get(o.customer) || { name: o.customer, email: o.customer.toLowerCase().replace(/\s/g, ".") + "@mail.dz", phone: "0554 00 00 00", wilaya: o.wilaya, orders: 0, spent: 0, isReal: false };
    c.orders += 1;
    c.spent += o.total;
    map.set(o.customer, c);
  });
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

export function realCustomers(realOrders: OrderView[]): CustomerInfo[] {
  const map = new Map<string, CustomerInfo>();
  for (const o of realOrders) {
    const key = o.email || o.phone || o.customerName;
    const existing = map.get(key);
    if (existing) {
      existing.orders += 1;
      existing.spent += o.total;
    } else {
      map.set(key, {
        name: o.customerName,
        email: o.email || "",
        phone: o.phone,
        wilaya: o.wilaya,
        orders: 1,
        spent: o.total,
        isReal: true,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

export function allCustomers(products: Product[], offers: Offer[], realOrders: OrderView[]): CustomerInfo[] {
  const demo = demoCustomers(products, offers);
  const real = realCustomers(realOrders);
  const realKeys = new Set(real.map((c) => c.email || c.phone));
  const filteredDemo = demo.filter((c) => !realKeys.has(c.email) && !realKeys.has(c.phone));
  return [...real, ...filteredDemo].sort((a, b) => b.spent - a.spent);
}

export function categoryBreakdown(products: Product[], offers: Offer[], realOrders: OrderView[] = []) {
  const map = new Map<string, number>();
  products.filter((p) => p.isActive).forEach((p) => {
    const rev = priceProduct(p, offers).finalPrice * unitsSold(p);
    map.set(p.categorySlug, (map.get(p.categorySlug) || 0) + rev);
  });
  for (const o of realOrders) {
    for (const it of o.items) {
      if (it.kind === "product") {
        const p = products.find((x) => x.id === it.id);
        if (p) map.set(p.categorySlug, (map.get(p.categorySlug) || 0) + it.unitPrice * it.quantity);
      }
    }
  }
  return [...map.entries()].map(([slug, revenue]) => ({ slug, revenue })).sort((a, b) => b.revenue - a.revenue);
}
