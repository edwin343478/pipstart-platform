import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import {
  canOpenContentWorkspace,
  parseWorkspaceDetail,
  parseWorkspaceList,
  validWorkspaceInput,
  WORKSPACE_PAGE_SIZE,
  type WorkspaceResult,
} from "./editorial-workspace-contract";
export async function readEditorialWorkspace(
  client: SupabaseClient,
  input: unknown,
): Promise<WorkspaceResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validWorkspaceInput(input)) return { kind: "invalid" };
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const gate = await readLiveStaffAccess(client, identity.data.user.id);
    if (gate.kind !== "authorized" || !canOpenContentWorkspace(gate.access))
      return { kind: gate.kind === "unavailable" ? "unavailable" : "denied" };
    const repository = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8_000)),
    });
    if (input.kind === "list") {
      const page = parseWorkspaceList(
        await repository.list(input.after, WORKSPACE_PAGE_SIZE + 1),
        input.after,
      );
      return page ? { kind: "list", page } : { kind: "unavailable" };
    }
    const detail = parseWorkspaceDetail(
      await repository.item(input.id),
      input.id,
    );
    return detail ? { kind: "item", detail } : { kind: "unavailable" };
  } catch (error) {
    return {
      kind:
        error instanceof EditorialError && error.kind === "forbidden"
          ? "denied"
          : "unavailable",
    };
  }
}
