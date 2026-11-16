"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  runMaintenanceProbe,
  type ProbeResult,
} from "@/lib/content/maintenance-probe";
export async function runMaintenanceProbeAction(
  input: unknown,
): Promise<ProbeResult> {
  if (
    process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true" ||
    process.env.PIPSTART_MAINTENANCE_PROBE_ENABLED !== "true"
  )
    return { kind: "disabled" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runMaintenanceProbe(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
