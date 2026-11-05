"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runEditorialDecision } from "@/lib/content/editorial-decision";
import type { DecisionResult } from "@/lib/content/editorial-decision-contract";
export async function runEditorialDecisionAction(
  input: unknown,
): Promise<DecisionResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runEditorialDecision(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
