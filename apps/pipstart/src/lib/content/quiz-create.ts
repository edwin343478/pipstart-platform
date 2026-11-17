import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import type { QuizBody } from "./contract";
import { object } from "./curriculum-draft-contract";
import {
  newQuizBody,
  parseQuizCreation,
  type QuizDraftResult,
} from "./quiz-draft-contract";

const placementOf = (body: unknown): Record<string, unknown> | null =>
  object(body) && object(body.metadata) && object(body.metadata.placement)
    ? body.metadata.placement
    : null;

/**
 * M22 audit Package 5 (D1): create a new quiz at version 1 under a module. The server reads the
 * module and its course, refuses a module that already has a module quiz (each module has one module
 * quiz URL), takes the next placement order among the children it can read, and sends the create once.
 */
export async function runQuizCreate(
  client: SupabaseClient,
  input: unknown,
  now = new Date(),
): Promise<QuizDraftResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  const command = parseQuizCreation(input);
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
      course.path !== command.path
    )
      return { kind: "invalid" };
    // The module's children this caller can read (the Owner reads all of them).
    const children: { id: string; family: string }[] = [];
    for (let after = "", pages = 0; pages < 100; pages++) {
      const rows = await repo.list(after, 100);
      if (!Array.isArray(rows)) return { kind: "unavailable" };
      for (const row of rows)
        if (row.parent_id === parentModule.id && !row.trashed)
          children.push({ id: row.id, family: row.family });
      if (rows.length < 100) break;
      after = rows[rows.length - 1].id;
    }
    if (children.some((c) => c.id === command.id)) return { kind: "invalid" };
    let order = 0;
    for (const child of children) {
      const placement = placementOf((await repo.item(child.id)).revision.body);
      if (!placement || !Number.isSafeInteger(placement.order))
        return { kind: "unavailable" };
      if (child.family === "quiz" && placement.route !== "level")
        return { kind: "occupied" };
      order = Math.max(order, placement.order as number);
    }
    const body = newQuizBody(command, course.id, order + 1, now);
    if (!body) return { kind: "invalid" };
    sent = true;
    const result = await repo.create({
      id: command.id,
      family: "quiz",
      learningPath: command.path,
      parentId: parentModule.id,
      // Checked by newQuizBody against the editor and grading rules.
      body: body as unknown as QuizBody,
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
      version: 1,
    };
  } catch (e) {
    if (e instanceof EditorialError) {
      if (e.kind === "forbidden") return { kind: "denied" };
      if (e.kind === "conflict") return { kind: "conflict" };
      if (e.kind === "limited")
        return { kind: "limited", retryAfter: e.retryAfter };
      if (["invalid", "state"].includes(e.kind)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
