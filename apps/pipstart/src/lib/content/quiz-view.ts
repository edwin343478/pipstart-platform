import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import { object } from "./curriculum-draft-contract";
import { projectQuizBody } from "./quiz-draft-contract";
import {
  parseQuizViewInput,
  projectQuizGovernance,
  type QuizViewResult,
} from "./quiz-view-contract";

const VIEWERS = ["owner", "author", "editor", "reviewer"];

/**
 * Package 5 (D4): read one quiz revision for review. Each call verifies Auth and live roles; the
 * store's resource SQL still decides access to the item (a Reviewer reads only assigned items).
 */
export async function runQuizView(
  client: SupabaseClient,
  input: unknown,
): Promise<QuizViewResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  const command = parseQuizViewInput(input);
  if (!command) return { kind: "invalid" };
  try {
    const auth = await staffDeadline(client.auth.getUser());
    if (auth.error || !auth.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, auth.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.some((r) => VIEWERS.includes(r)))
      return { kind: "denied" };
    const repo = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
    });
    const raw = await repo.item(command.id),
      d = parseWorkspaceDetail(raw, command.id);
    if (!d || d.family !== "quiz" || !d.parent) return { kind: "unavailable" };
    let revision = d.revision,
      state: string = d.state,
      sha = d.bodySha256,
      body: unknown = raw.revision.body;
    if (command.revision !== null && command.revision !== d.revision) {
      if (command.revision > d.revision) return { kind: "invalid" };
      const earlier: unknown = await repo.revision(
        command.id,
        command.revision,
      );
      const r =
        object(earlier) && object(earlier.revision) ? earlier.revision : null;
      if (
        !r ||
        r.revision_no !== command.revision ||
        typeof r.state !== "string" ||
        typeof r.body_sha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(r.body_sha256)
      )
        return { kind: "unavailable" };
      revision = command.revision;
      state = r.state;
      sha = r.body_sha256;
      body = r.body;
    }
    const projected = projectQuizBody(body);
    if (!projected) return { kind: "unavailable" };
    return {
      kind: "ready",
      view: {
        id: d.id,
        path: d.path as "forex" | "crypto",
        parent: d.parent,
        scope: projected.scope,
        revision,
        latestRevision: d.revision,
        state,
        bodySha256: sha,
        version: projected.version,
        trashed: d.trashed,
        onHold: d.onHold,
        fields: projected.fields,
        questions: projected.questions,
        governance: projectQuizGovernance(body),
      },
    };
  } catch (e) {
    if (e instanceof EditorialError) {
      if (e.kind === "forbidden") return { kind: "denied" };
      if (e.kind === "invalid") return { kind: "invalid" };
    }
    return { kind: "unavailable" };
  }
}
