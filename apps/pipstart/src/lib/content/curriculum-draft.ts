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
import {
  object,
  mergeDraftFields,
  projectCurriculumFields,
  validDraftInput,
  type CurriculumDraftResult,
  type CurriculumDraftView,
} from "./curriculum-draft-contract";
function project(
  raw: EditorialItemView,
  id: string,
): CurriculumDraftView | null {
  const d = parseWorkspaceDetail(raw, id);
  if (
    !d ||
    !["course", "module"].includes(d.family) ||
    d.trashed ||
    !object(raw.revision.body) ||
    !object(raw.revision.body.metadata)
  )
    return null;
  const projected = projectCurriculumFields(
    d.family as "course" | "module",
    raw.revision.body.metadata,
  );
  if (!projected) return null;
  return {
    id: d.id,
    family: d.family as "course" | "module",
    path: d.path,
    parent: d.parent,
    level: projected.level,
    revision: d.revision,
    bodySha256: d.bodySha256,
    fields: projected.fields,
  };
}
function saved(
  v: unknown,
  id: string,
  revision: number,
): CurriculumDraftResult {
  if (
    !object(v) ||
    Object.keys(v).sort().join(",") !==
      "body_sha256,item_id,revision_no,state" ||
    v.item_id !== id ||
    v.revision_no !== revision ||
    v.state !== "draft" ||
    typeof v.body_sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(v.body_sha256)
  )
    return { kind: "uncertain" };
  return { kind: "saved", id, revision, bodySha256: v.body_sha256 };
}
/** No action route exposes this yet. Every operation repeats verified Auth and live grants.
 * A sent write with an unclear outcome is never replayed or inferred from matching fields. */
export async function runCurriculumDraft(
  client: SupabaseClient,
  input: unknown,
): Promise<CurriculumDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validDraftInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
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
    if (command.kind === "create") {
      if (command.family === "course" && !live.access.roles.includes("owner"))
        return { kind: "denied" };
      if (command.family === "module") {
        const raw = await repository.item(command.parent!);
        const parent = project(raw, command.parent!);
        if (
          !parent ||
          parent.family !== "course" ||
          parent.path !== command.path
        )
          return { kind: "invalid" };
      }
      // Published is the learner-facing metadata target, matching imported bodies.
      // The authoritative editorial revision is created as draft; no approval/publication is sent.
      const body = mergeDraftFields(
        {
          metadata: {
            status: "published",
            ...(command.family === "course" ? { level: command.level } : {}),
          },
        },
        command.fields,
      )!;
      sent = true;
      return saved(
        await repository.create({
          id: command.id,
          family: command.family,
          learningPath: command.path,
          parentId: command.parent,
          body,
          reason: command.reason,
        }),
        command.id,
        1,
      );
    }
    const raw = await repository.item(command.id),
      view = project(raw, command.id);
    if (!view) return { kind: "unavailable" };
    if (command.kind === "load") return { kind: "ready", item: view };
    if (
      view.revision !== command.baseRevision ||
      view.bodySha256 !== command.baseSha256
    )
      return { kind: "conflict" };
    const body = mergeDraftFields(
      raw.revision.body as Record<string, unknown>,
      command.fields,
    );
    if (!body) return { kind: "unavailable" };
    sent = true;
    return saved(
      await repository.save(
        command.id,
        view.family,
        command.baseRevision,
        body,
        command.reason,
      ),
      command.id,
      command.baseRevision + 1,
    );
  } catch (error) {
    if (error instanceof EditorialError) {
      if (error.kind === "forbidden") return { kind: "denied" };
      if (error.kind === "conflict") return { kind: "conflict" };
      if (["invalid", "state"].includes(error.kind)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
