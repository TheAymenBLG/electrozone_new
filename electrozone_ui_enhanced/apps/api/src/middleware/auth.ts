import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

export interface AdminPayload {
  role: "admin";
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = header.slice(7).trim();
  if (token && token === (config.adminApiKey || "dev-admin-key")) {
    req.admin = { role: "admin" };
    return next();
  }
  return res.status(401).json({ error: "Invalid token" });
}
