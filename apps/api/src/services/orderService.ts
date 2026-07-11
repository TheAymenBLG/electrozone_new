import { prisma } from "../lib/prisma.js";
import type { CreateOrderBody, OrderView, OrderStatus } from "@electrozone/shared";

function toView(row: any): OrderView {
  return {
    id: row.id,
    customerName: row.customerName,
    phone: row.phone,
    wilaya: row.wilaya,
    address: row.address,
    status: row.status,
    total: row.total,
    paymentMethod: row.paymentMethod,
    documentNames: row.documentNames ?? [],
    items: (row.items ?? []).map((it: any) => ({
      kind: it.kind,
      id: it.kind === "product" ? it.productId : it.bundleId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createOrder(data: CreateOrderBody) {
  const row = await prisma.order.create({
    data: {
      customerName: data.customerName,
      phone: data.phone,
      wilaya: data.wilaya,
      address: data.address,
      total: data.total,
      paymentMethod: data.paymentMethod,
      documentNames: data.documentNames,
      items: {
        create: data.items.map((it) => ({
          kind: it.kind,
          productId: it.kind === "product" ? it.id : null,
          bundleId: it.kind === "bundle" ? it.id : null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
  return { id: row.id, status: row.status };
}

export async function getOrder(id: string): Promise<OrderView | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return row ? toView(row) : null;
}

export async function listOrders(): Promise<OrderView[]> {
  const rows = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toView);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderView | null> {
  const row = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  return toView(row);
}