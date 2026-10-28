import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfiguration } from "./config";
export function maintenanceConfigured() {
  return (
    process.env.PIPSTART_M22_STAFF_MAINTENANCE_ENABLED === "true" &&
    process.env.PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED === "true" &&
    !!process.env.PIPSTART_M22_STAFF_MAINTENANCE_SECRET_KEY?.trim() &&
    !!getSupabasePublicConfiguration()
  );
}
export function createMaintenanceClient() {
  if (!maintenanceConfigured()) return null;
  const config = getSupabasePublicConfiguration(),
    key = process.env.PIPSTART_M22_STAFF_MAINTENANCE_SECRET_KEY?.trim();
  if (!config || !key) return null;
  return createClient(config.url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => {
        const incoming =
            init?.signal ?? (input instanceof Request ? input.signal : null),
          timeout = AbortSignal.timeout(7_000);
        return fetch(input, {
          ...init,
          signal: incoming ? AbortSignal.any([incoming, timeout]) : timeout,
        });
      },
    },
  });
}
