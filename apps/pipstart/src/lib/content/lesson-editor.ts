import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import { curriculumLevel, object } from "./curriculum-draft-contract";
import { newLessonBody, parseLessonCreation } from "./lesson-create-contract";
import { runLessonDraft } from "./lesson-draft";
import type { LessonDraftResult } from "./lesson-draft-contract";
export async function runLessonEditor(
  client: SupabaseClient,
  input: unknown,
): Promise<LessonDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!object(input) || input.kind !== "create")
    return runLessonDraft(client, input);
  const command = parseLessonCreation(input);
  if (!command) return { kind: "invalid" };
  let sent = false;
  try {
    const auth = await staffDeadline(client.auth.getUser());
    if (auth.error || !auth.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, auth.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (
      !live.access.roles.some((r) => ["owner", "author", "editor"].includes(r))
    )
      return { kind: "denied" };
    const repo = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
    });
    const rawModule = await repo.item(command.parent),
      parentModule = parseWorkspaceDetail(rawModule, command.parent);
    if (
      !parentModule ||
      parentModule.family !== "module" ||
      parentModule.trashed ||
      parentModule.path !== command.path ||
      !parentModule.parent
    )
      return { kind: "invalid" };
    const rawCourse = await repo.item(parentModule.parent),
      course = parseWorkspaceDetail(rawCourse, parentModule.parent);
    if (
      !course ||
      course.family !== "course" ||
      course.trashed ||
      course.path !== command.path ||
      !object(rawCourse.revision.body) ||
      !object(rawCourse.revision.body.metadata) ||
      !curriculumLevel(rawCourse.revision.body.metadata.level)
    )
      return { kind: "invalid" };
    const body = newLessonBody(
      command,
      course.id,
      rawCourse.revision.body.metadata.level,
    );
    if (!body) return { kind: "invalid" };
    sent = true;
    const result = await repo.create({
      id: command.id,
      family: "lesson",
      learningPath: command.path,
      parentId: parentModule.id,
      body,
      reason: command.reason,
    });
    if (
      !object(result) ||
      Object.keys(result).sort().join(",") !==
        "body_sha256,item_id,revision_no,state" ||
      result.item_id !== command.id ||
      result.revision_no !== 1 ||
      result.state !== "draft" ||
      typeof result.body_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(result.body_sha256)
    )
      return { kind: "uncertain" };
    return {
      kind: "saved",
      id: command.id,
      revision: 1,
      bodySha256: result.body_sha256,
    };
  } catch (e) {
    if (e instanceof EditorialError) {
      if (e.kind === "forbidden") return { kind: "denied" };
      if (e.kind === "conflict") return { kind: "conflict" };
      if (["invalid", "state"].includes(e.kind)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
