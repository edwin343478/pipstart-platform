import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import { projectLessonBody } from "./lesson-draft-contract";
import {
  decisionState,
  validDecisionInput,
  type DecisionAction,
  type DecisionResult,
} from "./editorial-decision-contract";
// Navigation guidance only: SQL decides every permission, including review by a different person.
const roles: Record<DecisionAction, string[]> = {
  submit: ["owner", "author", "editor"],
  approve: ["owner", "reviewer"],
  changes: ["owner", "reviewer"],
  publish: ["owner"],
};
/**
 * One review or publication decision on the exact latest revision. The write is sent at most
 * once; an unclear outcome is "uncertain" and is never retried or inferred.
 */
export async function runEditorialDecision(
  client: SupabaseClient,
  input: unknown,
): Promise<DecisionResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validDecisionInput(input)) return { kind: "invalid" };
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
    const raw = await repository.item(command.id),
      detail = parseWorkspaceDetail(raw, command.id);
    if (!detail) return { kind: "unavailable" };
    if (
      detail.revision !== command.revision ||
      detail.bodySha256 !== command.sha
    )
      return { kind: "conflict" };
    if (detail.trashed) return { kind: "state" };
    // The store refuses this too; checking first gives a clear message without a write.
    if (detail.family === "lesson" && command.action !== "changes") {
      const lesson = projectLessonBody(raw.revision.body);
      if (!lesson) return { kind: "unavailable" };
      if (!lesson.fields.sources.length) return { kind: "sources" };
    }
    sent = true;
    const result =
      command.action === "submit"
        ? await repository.submit(command.id, command.revision, command.sha)
        : command.action === "publish"
          ? await repository.publish(
              command.id,
              command.revision,
              command.sha,
              command.note,
            )
          : await repository.review(
              command.id,
              command.revision,
              command.sha,
              command.action === "approve",
              command.note,
            );
    if (
      !result ||
      typeof result !== "object" ||
      Object.keys(result).sort().join(",") !==
        "body_sha256,item_id,revision_no,state" ||
      result.item_id !== command.id ||
      result.revision_no !== command.revision ||
      result.body_sha256 !== command.sha ||
      result.state !== decisionState[command.action]
    )
      return { kind: "uncertain" };
    return {
      kind: "done",
      id: command.id,
      revision: command.revision,
      state: result.state,
    };
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
