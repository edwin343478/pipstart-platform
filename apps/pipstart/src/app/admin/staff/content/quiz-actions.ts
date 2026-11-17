"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runQuizDraft } from "@/lib/content/quiz-draft";
import type { QuizDraftResult } from "@/lib/content/quiz-draft-contract";
import { runQuizView } from "@/lib/content/quiz-view";
import type { QuizViewResult } from "@/lib/content/quiz-view-contract";
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
/** Package 5 (D4): one quiz revision, read-only, for staff who review or edit quizzes. */
export async function runQuizViewAction(
  input: unknown,
): Promise<QuizViewResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client ? await runQuizView(client, input) : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
