import type {
  Category, Product, Bundle, Offer, ChatMessage, SearchResponse, CreateOrderBody, OrderView, OrderStatus, RetentionTriggerType, RetentionResult,
} from "@electrozone/shared";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("electrozone_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  bundles: Bundle[];
  offers: Offer[];
}

export const api = {
  getCatalog: () => request<Catalog>("/catalog"),

  getProducts: () => request<Product[]>("/products"),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  saveProduct: (p: Omit<Product, "id"> & { id?: string }) =>
    request<Product>("/products", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(p),
    }),
  deleteProduct: (id: string) =>
    request<{ ok: boolean }>(`/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  getBundles: () => request<Bundle[]>("/bundles"),
  saveBundle: (b: Omit<Bundle, "id"> & { id?: string }) =>
    request<Bundle>("/bundles", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(b),
    }),
  deleteBundle: (id: string) =>
    request<{ ok: boolean }>(`/bundles/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  getOffers: () => request<Offer[]>("/offers"),
  saveOffer: (o: Omit<Offer, "id"> & { id?: string }) =>
    request<Offer>("/offers", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(o),
    }),
  deleteOffer: (id: string) =>
    request<{ ok: boolean }>(`/offers/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  createOrder: (data: CreateOrderBody) =>
    request<{ id: string; status: string }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getOrder: (id: string) =>
    request<OrderView>(`/orders/${id}`),

  listOrders: () =>
    request<OrderView[]>("/orders", {
      headers: authHeaders(),
    }),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<OrderView>(`/orders/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }),

  triggerRetention: (type: RetentionTriggerType, orderId: string, toEmail: string) =>
    request<RetentionResult>("/retention/trigger", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ type, orderId, toEmail }),
    }),

  askAssistant: (history: ChatMessage[], message: string) =>
    request<{ reply: string }>("/assistant", {
      method: "POST",
      body: JSON.stringify({ history, message }),
    }),

  search: (q: string) =>
    request<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),

  login: (password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};