import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  categorySlug: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string(),
  imageUrl: z.string(),
  specs: z.record(z.string(), z.string()),
  isActive: z.boolean(),
});

export const bundleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const bundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  items: z.array(bundleItemSchema),
  bundlePrice: z.number().nonnegative().nullable(),
  isActive: z.boolean(),
});

export const offerSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().nonnegative(),
  scope: z.enum(["product", "category", "sitewide"]),
  targetId: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  isActive: z.boolean(),
});

export const cartLineSchema = z.object({
  kind: z.enum(["product", "bundle"]),
  id: z.string(),
  quantity: z.number().int().positive(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const pricedProductSchema = z.object({
  product: productSchema,
  finalPrice: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  discountPct: z.number().nonnegative(),
  offer: offerSchema.nullable(),
});

export const catalogSchema = z.object({
  categories: z.array(categorySchema),
  products: z.array(productSchema),
  bundles: z.array(bundleSchema),
  offers: z.array(offerSchema),
});

export const saveProductBodySchema = productSchema.omit({ id: true }).extend({
  id: z.string().optional(),
});
export const saveBundleBodySchema = bundleSchema.omit({ id: true }).extend({
  id: z.string().optional(),
});
export const saveOfferBodySchema = offerSchema.omit({ id: true }).extend({
  id: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const assistantBodySchema = z.object({
  history: z.array(chatMessageSchema),
  message: z.string().min(1),
});

export const assistantResponseSchema = z.object({
  reply: z.string(),
});

export const orderItemSchema = z.object({
  kind: z.enum(["product", "bundle"]),
  id: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const createOrderBodySchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(1),
  wilaya: z.string().min(1),
  address: z.string().min(1),
  items: z.array(orderItemSchema),
  total: z.number().nonnegative(),
  deliveryMethod: z.enum(["standard", "scheduled"]),
  installation: z.boolean(),
  promoCode: z.string().nullable(),
  deliveryFee: z.number().nonnegative(),
  installationFee: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  paymentMethod: z.enum(["cod", "cib", "card", "pickup", "installment"]),
  documentNames: z.array(z.string()),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1),
});

export const searchResultSchema = z.object({
  product: productSchema,
  score: z.number().nonnegative(),
  reason: z.string(),
});

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(searchResultSchema),
});

export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  author: z.string(),
  rating: z.number().int().min(1).max(5),
  date: z.string(),
  title: z.string(),
  comment: z.string(),
});

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(["nouveau", "confirme", "expedie", "livre", "annule"]),
});

export const triggerRetentionBodySchema = z.object({
  type: z.enum(["abandoned_cart", "promo", "follow_up"]),
  orderId: z.string().min(1),
  toEmail: z.string().email(),
});