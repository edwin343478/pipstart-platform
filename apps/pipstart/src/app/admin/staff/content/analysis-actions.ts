"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAnalysisDraft } from "@/lib/content/analysis-draft";
import type { AnalysisDraftResult } from "@/lib/content/analysis-draft-contract";
// TA-b: the analysis-post editor's single server action (load, create, save).
export async function runAnalysisDraftAction(
  input: unknown,
): Promise<AnalysisDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runAnalysisDraft(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
