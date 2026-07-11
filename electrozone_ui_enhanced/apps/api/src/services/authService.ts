import { config } from "../config/env.js";

export function loginAdmin(password: string): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
  if (password !== adminPassword) return null;
  return config.adminApiKey || "dev-admin-key";
}
