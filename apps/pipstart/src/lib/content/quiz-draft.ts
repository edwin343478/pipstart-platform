import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import {
  createEditorialRepository,
  EditorialError,
  type EditorialItemView,
} from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import { object } from "./curriculum-draft-contract";
import {
  mergeQuizDraft,
  projectQuizBody,
  quizDraftInputSchema,
  type QuizDraftResult,
  type QuizDraftView,
} from "./quiz-draft-contract";

const approval = ["imported", "reviewed", "single_person"];

// M22 MP07b: the server sets every quiz draft's version. A draft started from an approved revision
// carries the next version; a draft started from an unapproved one keeps its version. The store
// (MP07a) refuses any other version, and refuses approving a second body under a published version.
function project(raw: EditorialItemView, id: string): QuizDraftView | null {
  const d = parseWorkspaceDetail(raw, id);
  if (!d || d.family !== "quiz" || d.trashed || !d.parent) return null;
  const body = projectQuizBody(raw.revision.body);
  if (!body) return null;
  const approved = d.decisions.some((x) => approval.includes(x.kind));
  return {
    id: d.id,
    path: d.path,
    parent: d.parent,
    scope: body.scope,
    revision: d.revision,
    bodySha256: d.bodySha256,
    version: body.version,
    nextVersion: approved ? body.version + 1 : body.version,
    approved,
    fields: body.fields,
    questions: body.questions,
  };
}

/** Each call verifies Auth and live roles; resource-scoped SQL remains authoritative. */
export async function runQuizDraft(
  client: SupabaseClient,
  input: unknown,
): Promise<QuizDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  const parsed = quizDraftInputSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data;
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (
      !live.access.roles.some((r) => ["owner", "author", "editor"].includes(r))
    )
      return { kind: "denied" };
    const repository = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
    });
    const raw = await repository.item(command.id),
      view = project(raw, command.id);
    if (!view) return { kind: "unavailable" };
    if (command.kind === "load") return { kind: "ready", item: view };
    if (
      view.revision !== command.baseRevision ||
      view.bodySha256 !== command.baseSha256
    )
      return { kind: "conflict" };
    const body = mergeQuizDraft(
      raw.revision.body,
      command.fields,
      command.questions,
      view.nextVersion,
    );
    if (!body) return { kind: "invalid" };
    sent = true;
    const result = await repository.save(
      command.id,
      "quiz",
      command.baseRevision,
      body,
      command.reason,
    );
    if (
      !object(result) ||
      Object.keys(result).sort().join(",") !==
        "body_sha256,item_id,revision_no,state" ||
      result.item_id !== command.id ||
      result.revision_no !== command.baseRevision + 1 ||
      result.state !== "draft" ||
      typeof result.body_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(result.body_sha256)
    )
      return { kind: "uncertain" };
    return {
      kind: "saved",
      id: command.id,
      revision: result.revision_no,
      bodySha256: result.body_sha256,
      version: view.nextVersion,
    };
  } catch (error) {
    if (error instanceof EditorialError) {
      if (error.kind === "forbidden") return { kind: "denied" };
      if (error.kind === "conflict") return { kind: "conflict" };
      if (["invalid", "state"].includes(error.kind)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
