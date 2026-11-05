"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runCurriculumDraft } from "@/lib/content/curriculum-draft";
import type { CurriculumDraftResult } from "@/lib/content/curriculum-draft-contract";
export async function runCurriculumDraftAction(
  input: unknown,
): Promise<CurriculumDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runCurriculumDraft(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
