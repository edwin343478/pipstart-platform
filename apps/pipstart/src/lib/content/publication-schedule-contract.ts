import { publicationReason } from "./publication-contract";
export type ScheduleAction = "publish" | "withdraw";
export type ScheduleRecord = {
  id: string;
  itemId: string;
  action: ScheduleAction;
  state: "scheduled" | "cancelled" | "failed" | "published";
  revision: number | null;
  sha: string | null;
  baseGeneration: number;
  policyVersion: number;
  dueAt: string;
  timeZone: string;
  localInput: string;
  outcomeGeneration: number | null;
  failure:
    "revoked" | "approval" | "dependency" | "superseded" | "unavailable" | null;
};
export type ScheduleStatus = {
  executionEnabled: boolean;
  schedules: ScheduleRecord[];
};
export type ScheduleInput =
  | { action: "status"; id: string }
  | { action: "cancel"; id: string; schedule: string; reason: string }
  | {
      action: "schedule";
      operation: string;
      expected: number;
      id: string;
      publicationAction: ScheduleAction;
      revision: number | null;
      sha: string | null;
      localInput: string;
      timeZone: string;
      reason: string;
    };
export type ScheduleResult =
  | { kind: "status"; status: ScheduleStatus }
  | { kind: "recorded"; record: ScheduleRecord }
  | { kind: "time"; problem: "invalid" | "ambiguous" | "nonexistent" }
  | {
      kind:
        | "invalid"
        | "denied"
        | "unavailable"
        | "conflict"
        | "state"
        | "uncertain";
    };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>, k: string) =>
  Object.keys(v).sort().join(",") === k;
const integer = (v: unknown, min = 1): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min;
const id = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v);
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const hash = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const local = (v: unknown): v is string =>
  typeof v === "string" && /^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
const zone = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length <= 100 &&
  /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)+)$/.test(v) &&
  !/^(posix|right)\//.test(v);
export function validScheduleInput(v: unknown): v is ScheduleInput {
  if (!object(v) || !id(v.id)) return false;
  if (v.action === "status") return keys(v, "action,id");
  if (v.action === "cancel")
    return (
      keys(v, "action,id,reason,schedule") &&
      uuid(v.schedule) &&
      publicationReason(v.reason)
    );
  return (
    v.action === "schedule" &&
    keys(
      v,
      "action,expected,id,localInput,operation,publicationAction,reason,revision,sha,timeZone",
    ) &&
    uuid(v.operation) &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      v.operation,
    ) &&
    integer(v.expected) &&
    local(v.localInput) &&
    zone(v.timeZone) &&
    publicationReason(v.reason) &&
    ((v.publicationAction === "publish" &&
      integer(v.revision) &&
      v.revision <= 2147483647 &&
      hash(v.sha)) ||
      (v.publicationAction === "withdraw" &&
        v.revision === null &&
        v.sha === null))
  );
}
export function parseScheduleRecord(
  v: unknown,
  itemId: string,
): ScheduleRecord | null {
  if (
    !object(v) ||
    !keys(
      v,
      "action,base_generation,body_sha256,due_at,failure_code,id,item_id,local_input,outcome_generation,policy_version,revision_no,state,time_zone",
    ) ||
    !uuid(v.id) ||
    v.item_id !== itemId ||
    !integer(v.base_generation) ||
    !integer(v.policy_version, 0) ||
    !local(v.local_input) ||
    !zone(v.time_zone) ||
    typeof v.due_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(v.due_at) ||
    !Number.isFinite(Date.parse(v.due_at)) ||
    new Date(v.due_at).toISOString() !== v.due_at ||
    !Number.isFinite(Date.parse(v.local_input + ":00Z")) ||
    new Date(v.local_input + ":00Z").toISOString().slice(0, 16) !==
      v.local_input
  )
    return null;
  if (!(
    (v.action === "publish" &&
      integer(v.revision_no) &&
      v.revision_no <= 2147483647 &&
      hash(v.body_sha256)) ||
    (v.action === "withdraw" &&
      v.revision_no === null &&
      v.body_sha256 === null)
  ))
    return null;
  if (
    !["scheduled", "cancelled", "failed", "published"].includes(String(v.state))
  )
    return null;
  if (v.state === "published") {
    if (
      !integer(v.outcome_generation) ||
      v.outcome_generation <= v.base_generation ||
      v.failure_code !== null
    )
      return null;
  } else if (v.outcome_generation !== null) return null;
  if (v.state === "failed") {
    if (
      ![
        "revoked",
        "approval",
        "dependency",
        "superseded",
        "unavailable",
      ].includes(String(v.failure_code))
    )
      return null;
  } else if (v.failure_code !== null) return null;
  return {
    id: v.id,
    itemId,
    action: v.action as ScheduleAction,
    state: v.state as ScheduleRecord["state"],
    revision: v.revision_no as number | null,
    sha: v.body_sha256 as string | null,
    baseGeneration: v.base_generation,
    policyVersion: v.policy_version,
    dueAt: v.due_at,
    timeZone: v.time_zone,
    localInput: v.local_input,
    outcomeGeneration: v.outcome_generation as number | null,
    failure: v.failure_code as ScheduleRecord["failure"],
  };
}
export function parseScheduleStatus(
  v: unknown,
  itemId: string,
): ScheduleStatus | null {
  if (
    !object(v) ||
    !keys(v, "execution_enabled,schedules") ||
    typeof v.execution_enabled !== "boolean" ||
    !Array.isArray(v.schedules) ||
    v.schedules.length > 10
  )
    return null;
  const rows = v.schedules.map((r) => parseScheduleRecord(r, itemId));
  if (rows.some((r) => r === null)) return null;
  const schedules = rows as ScheduleRecord[];
  if (
    new Set(schedules.map((r) => r.id)).size !== schedules.length ||
    schedules.filter((r) => r.state === "scheduled").length > 1
  )
    return null;
  return { executionEnabled: v.execution_enabled, schedules };
}
export const scheduleFailure: Record<
  NonNullable<ScheduleRecord["failure"]>,
  string
> = {
  revoked:
    "The authorizer no longer has the required access or account verification.",
  approval: "The approval or review policy changed.",
  dependency: "The publication requirements could not be satisfied.",
  superseded: "A later publication decision replaced this plan.",
  unavailable: "Execution could not be completed; review the recorded state.",
};
export function scheduleLabel(r: ScheduleRecord): string {
  if (r.state === "scheduled") return "Pending";
  if (r.state === "cancelled") return "Cancelled";
  if (r.state === "failed") return "Not executed";
  return r.action === "withdraw"
    ? "Withdrawal recorded"
    : "Publication recorded";
}
