import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import {
  validLifecycleInput,
  type LifecycleAction,
  type LifecycleResult,
} from "./editorial-lifecycle-contract";
// Navigation guidance only: SQL decides every permission.
const roles: Record<LifecycleAction, string[]> = {
  archive: ["owner", "author", "editor"],
  restore: ["owner", "editor"],
  hold: ["owner"],
  release: ["owner"],
};
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
/**
 * Archive (move to trash), restore as a new draft, or place/release an Owner hold, for the item
 * as last seen. The write is sent at most once; an unclear outcome is "uncertain", never retried.
 */
export async function runEditorialLifecycle(
  client: SupabaseClient,
  input: unknown,
): Promise<LifecycleResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validLifecycleInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.some((r) => roles[command.action].includes(r)))
      return { kind: "denied" };
    const repository = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
    });
    const detail = parseWorkspaceDetail(
      await repository.item(command.id),
      command.id,
    );
    // Quizzes are not archived, restored or held from the library (MP07b).
    if (!detail || detail.family === "quiz") return { kind: "unavailable" };
    // The store does not bind these actions to a revision; the UI must act on what it showed.
    if (
      detail.revision !== command.revision ||
      detail.bodySha256 !== command.sha
    )
      return { kind: "conflict" };
    const fits =
      command.action === "archive"
        ? !detail.trashed && !detail.onHold
        : command.action === "restore"
          ? detail.trashed
          : command.action === "hold"
            ? !detail.onHold
            : detail.onHold;
    if (!fits)
      return {
        kind: command.action === "archive" && detail.onHold ? "held" : "state",
      };
    sent = true;
    const id = command.id;
    if (command.action === "restore") {
      const r = await repository.restore(id, command.reason as string);
      return object(r) &&
        exact(r, "body_sha256,item_id,revision_no,state") &&
        r.item_id === id &&
        r.revision_no === command.revision + 1 &&
        r.state === "draft"
        ? { kind: "done", id, action: "restore", revision: r.revision_no }
        : { kind: "uncertain" };
    }
    if (command.action === "archive") {
      const r = await repository.trash(id, command.reason as string);
      return object(r) &&
        exact(r, "item_id,trashed") &&
        r.item_id === id &&
        r.trashed === true
        ? { kind: "done", id, action: "archive", revision: command.revision }
        : { kind: "uncertain" };
    }
    const r = await repository.hold(
      id,
      command.action === "hold" ? command.reason : null,
    );
    return object(r) &&
      exact(r, "held,item_id") &&
      r.item_id === id &&
      r.held === (command.action === "hold")
      ? { kind: "done", id, action: command.action, revision: command.revision }
      : { kind: "uncertain" };
  } catch (error) {
    if (error instanceof EditorialError) {
      if (error.kind === "forbidden") return { kind: "denied" };
      if (error.kind === "conflict") return { kind: "conflict" };
      if (error.kind === "state") return { kind: "state" };
      if (error.kind === "invalid") return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
