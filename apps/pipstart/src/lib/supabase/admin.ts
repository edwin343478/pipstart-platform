import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfiguration } from "./config";

export function createSupabaseAdminClient() {
  const configuration = getSupabasePublicConfiguration();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!configuration || !secretKey) return null;

  return createClient(configuration.url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
