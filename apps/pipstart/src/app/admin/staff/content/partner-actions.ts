"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runPartnerEditor } from "@/lib/content/partner-editor";
import type { PartnerEditorResult } from "@/lib/content/partner-editor-contract";
export async function runPartnerEditorAction(
  input: unknown,
): Promise<PartnerEditorResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runPartnerEditor(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
