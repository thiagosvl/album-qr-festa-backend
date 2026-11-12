import { NOME_MARCA } from "../constants/marca.js";

export const env = {
  PORT: Number(process.env.PORT) || 3005,
  NODE_ENV: process.env.NODE_ENV || "development",
  ALLOWED_ORIGINS:
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:5173,http://localhost:4321,http://localhost:8080,http://localhost:3000,https://app.festalgia.com.br,https://www.festalgia.com.br,https://festalgia.com.br",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL:
    process.env.RESEND_FROM_EMAIL ||
    `${NOME_MARCA} <contato@festalgia.com.br>`,
  RESEND_OVERRIDE_EMAIL: process.env.RESEND_OVERRIDE_EMAIL || "",
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  R2_BUCKET: process.env.R2_BUCKET || "festalgia-fotos",
  R2_ENDPOINT: process.env.R2_ENDPOINT || "",
  R2_REGION: process.env.R2_REGION || "auto",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "",
};

