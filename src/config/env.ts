import { NOME_MARCA } from "../constants/marca.js";

export const env = {
  PORT: Number(process.env.PORT) || 3005,
  NODE_ENV: process.env.NODE_ENV || "development",
  ALLOWED_ORIGINS:
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:5173,http://localhost:4321,http://localhost:8080",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL:
    process.env.RESEND_FROM_EMAIL ||
    `${NOME_MARCA} <contato@van360.com.br>`,
  RESEND_OVERRIDE_EMAIL: process.env.RESEND_OVERRIDE_EMAIL || "",
};
