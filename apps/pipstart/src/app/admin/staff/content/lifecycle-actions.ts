"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runEditorialLifecycle } from "@/lib/content/editorial-lifecycle";
import type { LifecycleResult } from "@/lib/content/editorial-lifecycle-contract";
export async function runEditorialLifecycleAction(
  input: unknown,
): Promise<LifecycleResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runEditorialLifecycle(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
