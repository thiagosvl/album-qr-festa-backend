import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import type { Database } from "../types/database.types.js";

const supabaseUrl =
  env.SUPABASE_URL.trim() || "https://placeholder.supabase.co";
const supabaseServiceRoleKey =
  env.SUPABASE_SERVICE_ROLE_KEY.trim() || "placeholder-service-role-key";

if (
  !env.SUPABASE_URL.trim() ||
  !env.SUPABASE_SERVICE_ROLE_KEY.trim() ||
  env.SUPABASE_URL.includes("PLACEHOLDER") ||
  env.SUPABASE_SERVICE_ROLE_KEY.includes("PLACEHOLDER")
) {
  logger.warn(
    "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente ou com placeholder. Configure o arquivo .env com as credenciais reais do Supabase da Festalgia."
  );
}

export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

export function getPublicStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

