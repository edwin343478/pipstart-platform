"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAnalysisDraft } from "@/lib/content/analysis-draft";
import type { AnalysisDraftResult } from "@/lib/content/analysis-draft-contract";
import { runTradeStatusUpdate } from "@/lib/content/trade-status-update";
import type { TradeStatusUpdateResult } from "@/lib/content/trade-status-update-contract";
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

// TA-c: change a live trade idea's status and publish it again in one step.
export async function runTradeStatusUpdateAction(
  input: unknown,
): Promise<TradeStatusUpdateResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runTradeStatusUpdate(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "uncertain" };
  }
}
