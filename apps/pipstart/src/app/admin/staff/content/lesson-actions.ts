"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runLessonEditor } from "@/lib/content/lesson-editor";
import type { LessonDraftResult } from "@/lib/content/lesson-draft-contract";
export async function runLessonEditorAction(
  input: unknown,
): Promise<LessonDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runLessonEditor(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
