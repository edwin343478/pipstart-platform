"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runQuizDraft } from "@/lib/content/quiz-draft";
import type { QuizDraftResult } from "@/lib/content/quiz-draft-contract";
export async function runQuizDraftAction(
  input: unknown,
): Promise<QuizDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client ? await runQuizDraft(client, input) : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
