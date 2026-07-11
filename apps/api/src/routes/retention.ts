import { Router } from "express";
import { triggerRetentionController } from "../controllers/retentionController.js";
import { validateBody } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";
import { triggerRetentionBodySchema } from "@electrozone/shared";

export const retentionRouter = Router();

retentionRouter.post(
  "/trigger",
  requireAdmin,
  validateBody(triggerRetentionBodySchema),
  triggerRetentionController,
);