import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import {
  createEditorialRepository,
  EditorialError,
  type EditorialItemView,
} from "./editorial-adapter";
import type { AnalysisBody } from "./contract";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import {
  mergeAnalysisFields,
  object,
  projectAnalysisFields,
  validAnalysisInput,
  type AnalysisDraftResult,
  type AnalysisDraftView,
} from "./analysis-draft-contract";

function project(raw: EditorialItemView, id: string): AnalysisDraftView | null {
  const d = parseWorkspaceDetail(raw, id);
  if (!d || d.family !== "analysis" || d.trashed || !object(raw.revision.body))
    return null;
  const projected = projectAnalysisFields(raw.revision.body);
  if (!projected) return null;
  return {
    id: d.id,
    revision: d.revision,
    bodySha256: d.bodySha256,
    fields: projected.fields,
    statusUpdatedAt: projected.statusUpdatedAt,
  };
}

function saved(v: unknown, id: string, revision: number): AnalysisDraftResult {
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

/** TA-b. Every operation repeats verified Auth and the live Owner grant (the store grants
 * analysis writes to the Owner only). A sent write with an unclear outcome is never replayed. */
export async function runAnalysisDraft(
  client: SupabaseClient,
  input: unknown,
  now: () => Date = () => new Date(),
): Promise<AnalysisDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validAnalysisInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.includes("owner")) return { kind: "denied" };
    const repository = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
    });
    const stamp = now().toISOString();
    if (command.kind === "create") {
      const body = mergeAnalysisFields({}, command.fields, stamp);
      if (!body) return { kind: "invalid" };
      sent = true;
      return saved(
        await repository.create({
          id: command.id,
          family: "analysis",
          learningPath: null,
          parentId: null,
          body: body as unknown as AnalysisBody,
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
    const body = mergeAnalysisFields(
      raw.revision.body as Record<string, unknown>,
      command.fields,
      stamp,
    );
    if (!body) return { kind: "unavailable" };
    sent = true;
    return saved(
      await repository.save(
        command.id,
        "analysis",
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
      if (error.kind === "limited")
        return { kind: "limited", retryAfter: error.retryAfter };
      if (["invalid", "state"].includes(error.kind)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
