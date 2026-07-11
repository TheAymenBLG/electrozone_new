import type { Request, Response } from "express";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "../services/orderService.js";

export async function createOrderController(req: Request, res: Response) {
  const order = await createOrder(req.body);
  res.status(201).json(order);
}

export async function getOrderController(req: Request, res: Response) {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Commande introuvable" });
  res.json(order);
}

export async function listOrdersController(_req: Request, res: Response) {
  res.json(await listOrders());
}

export async function updateOrderStatusController(req: Request, res: Response) {
  const order = await updateOrderStatus(req.params.id, req.body.status);
  if (!order) return res.status(404).json({ error: "Commande introuvable" });
  res.json(order);
}