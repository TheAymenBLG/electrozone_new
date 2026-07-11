import type { Request, Response } from "express";
import { loginAdmin } from "../services/authService.js";

export async function loginController(req: Request, res: Response) {
  try {
    const body = (req.body ?? {}) as { password?: string };
    const password = typeof body.password === "string" ? body.password.trim() : "";
    if (!password) return res.status(400).json({ error: "Mot de passe requis" });

    const token = loginAdmin(password);
    if (!token) return res.status(401).json({ error: "Invalid credentials" });

    return res.json({ token });
  } catch (e) {
    console.error("[api] login error:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "Login failed" });
  }
}
