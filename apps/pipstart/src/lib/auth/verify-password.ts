import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfiguration } from "@/lib/supabase/config";

export async function verifyUserPassword(email: string, password: string) {
  const configuration = getSupabasePublicConfiguration();
  if (!configuration) return null;

  const verifier = createClient(
    configuration.url,
    configuration.publishableKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
  const { error } = await verifier.auth.signInWithPassword({ email, password });
  return !error;
}
