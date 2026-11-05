"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readEditorialWorkspace } from "@/lib/content/editorial-workspace";
import type { WorkspaceResult } from "@/lib/content/editorial-workspace-contract";
export async function readEditorialWorkspaceAction(
  input: unknown,
): Promise<WorkspaceResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await readEditorialWorkspace(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
