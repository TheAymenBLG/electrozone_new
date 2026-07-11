import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  jwtIssuer: process.env.JWT_ISSUER ?? "electrozone",
  adminApiKey: process.env.ADMIN_API_KEY ?? "dev-admin-key",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaApiKey: process.env.OLLAMA_API_KEY ?? "",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3.1",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "ElectroZone <onboarding@resend.dev>",
  isProd: process.env.NODE_ENV === "production",
};