"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createMaintenanceClient,
  maintenanceConfigured,
} from "@/lib/supabase/staff-maintenance";
import {
  runMaintenanceTransport,
  type MaintenanceResult,
} from "@/lib/auth/staff-maintenance-transport";
export async function executeMaintenanceAction(
  input: unknown,
): Promise<MaintenanceResult> {
  if (!maintenanceConfigured()) return { kind: "disabled" };
  try {
    const user = await createSupabaseServerClient(),
      service = createMaintenanceClient();
    if (!user || !service) return { kind: "disabled" };
    return await runMaintenanceTransport(user, service, input);
  } catch {
    return { kind: "unknown" };
  }
}
