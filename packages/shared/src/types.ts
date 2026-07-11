export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  specs: Record<string, string>;
  isActive: boolean;
}

export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  items: BundleItem[];
  bundlePrice: number | null;
  isActive: boolean;
}

export type OfferType = "percentage" | "fixed";
export type OfferScope = "product" | "category" | "sitewide";

export interface Offer {
  id: string;
  title: string;
  type: OfferType;
  value: number;
  scope: OfferScope;
  targetId: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CartLine {
  kind: "product" | "bundle";
  id: string;
  quantity: number;
}

export interface PricedProduct {
  product: Product;
  finalPrice: number;
  originalPrice: number;
  discountPct: number;
  offer: Offer | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OrderItemInput {
  kind: "product" | "bundle";
  id: string;
  quantity: number;
  unitPrice: number;
}

export type DeliveryMethod = "standard" | "scheduled";

export type PaymentMethod = "cod" | "cib" | "card" | "pickup" | "installment";

export interface CreateOrderBody {
  customerName: string;
  email: string;
  phone: string;
  wilaya: string;
  address: string;
  items: OrderItemInput[];
  total: number;
  deliveryMethod: DeliveryMethod;
  installation: boolean;
  promoCode: string | null;
  deliveryFee: number;
  installationFee: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  documentNames: string[];
}

export interface SearchResult {
  product: Product;
  score: number;
  reason: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

export type OrderStatus = "nouveau" | "confirme" | "expedie" | "livre" | "annule";

export interface OrderView {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  wilaya: string;
  address: string;
  status: string;
  total: number;
  paymentMethod: string;
  documentNames: string[];
  deliveryMethod: string;
  installation: boolean;
  promoCode: string | null;
  deliveryFee: number;
  installationFee: number;
  discountAmount: number;
  items: OrderItemInput[];
  createdAt: string;
}

export interface UpdateOrderStatusBody {
  status: OrderStatus;
}

export type RetentionTriggerType = "abandoned_cart" | "promo" | "follow_up";

export interface TriggerRetentionBody {
  type: RetentionTriggerType;
  orderId: string;
  toEmail: string;
}

export interface RetentionResult {
  ok: boolean;
  messageId: string | null;
  error: string | null;
}