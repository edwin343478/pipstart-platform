"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runMaintenance } from "@/lib/content/maintenance";
import type { MaintenanceActionResult } from "@/lib/content/maintenance-contract";
export async function runMaintenanceAction(
  input: unknown,
): Promise<MaintenanceActionResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runMaintenance(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
