import { Router } from "express";
import {
  createOrderController,
  getOrderController,
  listOrdersController,
  updateOrderStatusController,
} from "../controllers/orderController.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";
import { createOrderBodySchema, updateOrderStatusBodySchema, idParamSchema } from "@electrozone/shared";

export const orderRouter = Router();

orderRouter.post("/", validateBody(createOrderBodySchema), createOrderController);
orderRouter.get("/:id", validateParams(idParamSchema), getOrderController);
orderRouter.get("/", requireAdmin, listOrdersController);
orderRouter.patch("/:id/status", requireAdmin, validateParams(idParamSchema), validateBody(updateOrderStatusBodySchema), updateOrderStatusController);