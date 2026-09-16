import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfiguration } from "./config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const configuration = getSupabasePublicConfiguration();
  if (!configuration) return null;

  return createServerClient(configuration.url, configuration.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. The proxy refreshes them.
        }
      },
    },
  });
}
