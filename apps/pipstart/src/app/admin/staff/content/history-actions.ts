"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readRevisionHistory } from "@/lib/content/revision-history";
import type { RevisionHistoryResult } from "@/lib/content/revision-history-contract";
export async function readRevisionHistoryAction(
  input: unknown,
): Promise<RevisionHistoryResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await readRevisionHistory(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
