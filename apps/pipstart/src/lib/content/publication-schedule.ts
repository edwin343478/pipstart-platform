import "server-only";
import { limitedFrom } from "./staff-action-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { parseStaffAccess } from "../auth/staff-access";
import { resolveScheduleTime } from "./publication-schedule-time";
import {
  parseScheduleRecord,
  parseScheduleStatus,
  validScheduleInput,
  type ScheduleResult,
} from "./publication-schedule-contract";
const errorKind = (
  code: string | undefined,
): "conflict" | "denied" | "invalid" | "state" | null =>
  code === "PT409"
    ? "conflict"
    : code === "42501"
      ? "denied"
      : code === "22023"
        ? "invalid"
        : code === "55000"
          ? "state"
          : null;
/** Current user context only; one write, exact DTOs and no implicit retry or deployment. */
export async function runPublicationSchedule(
  client: SupabaseClient,
  input: unknown,
): Promise<ScheduleResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validScheduleInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    // The identity above is freshly verified by Auth. Bind the separately live SQL
    // access response to it; do not perform a duplicate getUser request or cache grants.
    const access = await staffDeadline(
      client
        .rpc("pipstart_staff_access", { p_kind: "", p_id: "" })
        .abortSignal(AbortSignal.timeout(8000)),
    );
    if (access.error) return { kind: "unavailable" };
    const live = parseStaffAccess(access.data, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    const allowed =
      command.action === "status"
        ? ["owner", "author", "reviewer", "editor"]
        : ["owner", "editor"];
    if (!live.access.roles.some((r) => allowed.includes(r)))
      return { kind: "denied" };
    const call = (fn: string, args: Record<string, unknown>) =>
      staffDeadline(
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000)),
      );
    if (command.action === "status" || command.action === "cancel") {
      const read = await call("pipstart_publication_schedule_status", {
        p_id: command.id,
      });
      if (read.error)
        return { kind: errorKind(read.error.code) ?? "unavailable" };
      const status = parseScheduleStatus(read.data, command.id);
      if (!status) return { kind: "unavailable" };
      if (command.action === "status") return { kind: "status", status };
      if (!status.schedules.some((r) => r.id === command.schedule))
        return { kind: "state" };
      sent = true;
      const write = await call("pipstart_publication_cancel_schedule", {
        p_schedule: command.schedule,
        p_reason: command.reason,
      });
      if (write.error)
        return (
          limitedFrom(write.error) ?? {
            kind: errorKind(write.error.code) ?? "uncertain",
          }
        );
      const record = parseScheduleRecord(write.data, command.id);
      return record &&
        record.id === command.schedule &&
        record.state === "cancelled"
        ? { kind: "recorded", record }
        : { kind: "uncertain" };
    }
    const time = resolveScheduleTime(command.localInput, command.timeZone);
    if (time.kind !== "ready") return { kind: "time", problem: time.kind };
    sent = true;
    const write = await call("pipstart_publication_schedule", {
      p_operation: command.operation,
      p_expected_generation: command.expected,
      p_action: command.publicationAction,
      p_id: command.id,
      p_revision: command.revision,
      p_sha: command.sha,
      p_local_input: time.localInput,
      p_time_zone: time.timeZone,
      p_due_at: time.dueAt,
      p_reason: command.reason,
    });
    if (write.error)
      return (
        limitedFrom(write.error) ?? {
          kind: errorKind(write.error.code) ?? "uncertain",
        }
      );
    const record = parseScheduleRecord(write.data, command.id);
    return record &&
      record.id === command.operation &&
      record.action === command.publicationAction &&
      record.revision === command.revision &&
      record.sha === command.sha &&
      record.baseGeneration === command.expected &&
      record.localInput === time.localInput &&
      record.timeZone === time.timeZone &&
      record.dueAt === time.dueAt
      ? { kind: "recorded", record }
      : { kind: "uncertain" };
  } catch {
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
