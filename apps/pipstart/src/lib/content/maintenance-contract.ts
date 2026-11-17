// M22 MP10c: the staff maintenance contract (owner decisions D1-D3, D6, D9). Strict parsers for the
// MP10a store replies and the commands the Maintenance page may send. The store decides every
// permission; these shapes only refuse malformed data before or after it.
import type { LiveStaffAccess } from "../auth/staff-role-flow";
import { actionLimitMessage, type ActionLimited } from "./staff-action-limit";

export const MAINTENANCE_FAMILIES = [
  "lesson",
  "quiz",
  "analysis",
  "partner",
  "link",
] as const;
export const MAINTENANCE_STATUSES = [
  "overdue",
  "due",
  "current",
  "no_review",
] as const;
export const MANUAL_RESULTS = [
  "manual_ok",
  "manual_broken",
  "not_checked",
] as const;
export const MAINTENANCE_VIEWS = ["mine", "all", "report", "policy"] as const;
export type MaintenanceFamily = (typeof MAINTENANCE_FAMILIES)[number];
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];
export type MaintenanceView = (typeof MAINTENANCE_VIEWS)[number];

export type WorklistItem = {
  id: string;
  family: MaintenanceFamily;
  title: string | null;
  revision: number;
  reviewedOn: string | null;
  contentDue: string | null;
  due: string | null;
  rescheduled: boolean;
  status: MaintenanceStatus;
  acknowledged: { at: string; reason: string } | null;
  assignedToMe: boolean;
  assignee: string | null;
};
export type Worklist = { items: WorklistItem[]; next: string | null };
export type MaintenanceResult = {
  reference: string;
  source: "manual" | "probe";
  classification: string;
  evidence: string | null;
  checkedAt: string;
  byMe: boolean;
};
export type Interval = {
  family: "analysis" | "lesson";
  version: number;
  days: number;
  setAt: string;
};
export type AllowedHost = { host: string; since: string };

export type MaintenanceInput =
  | { action: "acknowledge"; id: string; revision: number; reason: string }
  | {
      action: "reschedule";
      id: string;
      revision: number;
      due: string;
      reason: string;
    }
  | {
      action: "result";
      id: string;
      revision: number;
      reference: string;
      classification: (typeof MANUAL_RESULTS)[number];
      note: string;
    }
  | { action: "assign"; id: string; assignee: string; reason: string }
  | { action: "unassign"; id: string; reason: string }
  | { action: "results"; id: string }
  | {
      action: "interval";
      family: "analysis" | "lesson";
      expected: number;
      days: number;
      reason: string;
    }
  | {
      action: "allowlist";
      host: string;
      change: "add" | "remove";
      reason: string;
    };
export type MaintenanceActionResult =
  | ActionLimited
  | { kind: "done" }
  | { kind: "results"; revision: number; results: MaintenanceResult[] }
  | {
      kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain";
    };

export const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>) => Object.keys(v).sort().join(",");
export const contentId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v);
const date = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v;
const nullableDate = (v: unknown) => v === null || date(v);
const timestamp = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}T/.test(v) &&
  Number.isFinite(Date.parse(v));
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
const positive = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 1;
/** 1 to 200 characters, already trimmed, one line: the store's reason rule. */
export const reasonOk = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length >= 1 &&
  [...v].length <= 200 &&
  v.trim() === v &&
  !/[\r\n\u0000-\u001f]/.test(v);
const hostOk = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    v,
  );
const referenceOk = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length >= 1 &&
  v.length <= 2048 &&
  !/[\u0000-\u001f\u007f]/.test(v);

/** Who may open the Maintenance section: every role that can hold maintenance. */
export function canOpenMaintenance(access: LiveStaffAccess): boolean {
  return access.roles.some((r) =>
    [
      "owner",
      "author",
      "reviewer",
      "editor",
      "moderator",
      "affiliate_manager",
    ].includes(r),
  );
}

export function validMaintenanceInput(v: unknown): v is MaintenanceInput {
  if (!object(v) || typeof v.action !== "string") return false;
  switch (v.action) {
    case "acknowledge":
      return (
        keys(v) === "action,id,reason,revision" &&
        contentId(v.id) &&
        positive(v.revision) &&
        reasonOk(v.reason)
      );
    case "reschedule":
      return (
        keys(v) === "action,due,id,reason,revision" &&
        contentId(v.id) &&
        positive(v.revision) &&
        date(v.due) &&
        reasonOk(v.reason)
      );
    case "result":
      return (
        keys(v) === "action,classification,id,note,reference,revision" &&
        contentId(v.id) &&
        positive(v.revision) &&
        referenceOk(v.reference) &&
        (MANUAL_RESULTS as readonly unknown[]).includes(v.classification) &&
        typeof v.note === "string" &&
        new TextEncoder().encode(v.note).length <= 2048 &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v.note)
      );
    case "assign":
      return (
        keys(v) === "action,assignee,id,reason" &&
        contentId(v.id) &&
        uuid(v.assignee) &&
        reasonOk(v.reason)
      );
    case "unassign":
      return (
        keys(v) === "action,id,reason" && contentId(v.id) && reasonOk(v.reason)
      );
    case "results":
      return keys(v) === "action,id" && contentId(v.id);
    case "interval":
      return (
        keys(v) === "action,days,expected,family,reason" &&
        (v.family === "analysis" || v.family === "lesson") &&
        positive(v.expected) &&
        typeof v.days === "number" &&
        Number.isSafeInteger(v.days) &&
        v.days >= 30 &&
        v.days <= 730 &&
        reasonOk(v.reason)
      );
    case "allowlist":
      return (
        keys(v) === "action,change,host,reason" &&
        hostOk(v.host) &&
        (v.change === "add" || v.change === "remove") &&
        reasonOk(v.reason)
      );
    default:
      return false;
  }
}

function worklistItem(v: unknown): WorklistItem | null {
  if (
    !object(v) ||
    keys(v) !==
      "acknowledged,assignedToMe,assignee,contentDue,due,family,id,rescheduled,reviewedOn,revision,status,title" ||
    !contentId(v.id) ||
    !(MAINTENANCE_FAMILIES as readonly unknown[]).includes(v.family) ||
    !(v.title === null || typeof v.title === "string") ||
    !positive(v.revision) ||
    !nullableDate(v.reviewedOn) ||
    !nullableDate(v.contentDue) ||
    !nullableDate(v.due) ||
    typeof v.rescheduled !== "boolean" ||
    !(MAINTENANCE_STATUSES as readonly unknown[]).includes(v.status) ||
    typeof v.assignedToMe !== "boolean" ||
    !(v.assignee === null || uuid(v.assignee))
  )
    return null;
  let acknowledged: WorklistItem["acknowledged"] = null;
  if (v.acknowledged !== null) {
    const a = v.acknowledged;
    if (
      !object(a) ||
      keys(a) !== "at,reason" ||
      !timestamp(a.at) ||
      !reasonOk(a.reason)
    )
      return null;
    acknowledged = { at: a.at, reason: a.reason };
  }
  return {
    id: v.id,
    family: v.family as MaintenanceFamily,
    title: v.title as string | null,
    revision: v.revision,
    reviewedOn: v.reviewedOn as string | null,
    contentDue: v.contentDue as string | null,
    due: v.due as string | null,
    rescheduled: v.rescheduled,
    status: v.status as MaintenanceStatus,
    acknowledged,
    assignedToMe: v.assignedToMe,
    assignee: v.assignee as string | null,
  };
}

/** The store's worklist page: at most 50 items in identity order, with the next cursor. */
export function parseWorklist(v: unknown): Worklist | null {
  if (
    !object(v) ||
    keys(v) !== "items,next" ||
    !Array.isArray(v.items) ||
    v.items.length > 50 ||
    !(v.next === null || contentId(v.next))
  )
    return null;
  const items: WorklistItem[] = [];
  for (const raw of v.items) {
    const item = worklistItem(raw);
    if (!item || (items.length && items[items.length - 1].id >= item.id))
      return null;
    items.push(item);
  }
  if (v.next !== null && v.next !== items[items.length - 1]?.id) return null;
  return { items, next: v.next };
}

export function parseResults(
  v: unknown,
): { revision: number; results: MaintenanceResult[] } | null {
  if (
    !object(v) ||
    keys(v) !== "item_id,results,revision" ||
    !contentId(v.item_id) ||
    !positive(v.revision) ||
    !Array.isArray(v.results) ||
    v.results.length > 200
  )
    return null;
  const results: MaintenanceResult[] = [];
  for (const r of v.results) {
    if (
      !object(r) ||
      keys(r) !== "byMe,checkedAt,classification,evidence,reference,source" ||
      !referenceOk(r.reference) ||
      (r.source !== "manual" && r.source !== "probe") ||
      typeof r.classification !== "string" ||
      !(r.evidence === null || typeof r.evidence === "string") ||
      !timestamp(r.checkedAt) ||
      typeof r.byMe !== "boolean"
    )
      return null;
    results.push({
      reference: r.reference,
      source: r.source,
      classification: r.classification,
      evidence: r.evidence as string | null,
      checkedAt: r.checkedAt,
      byMe: r.byMe,
    });
  }
  return { revision: v.revision, results };
}

export function parseIntervals(v: unknown): Interval[] | null {
  if (!Array.isArray(v) || v.length > 2) return null;
  const out: Interval[] = [];
  for (const i of v) {
    if (
      !object(i) ||
      keys(i) !== "days,family,setAt,version" ||
      (i.family !== "analysis" && i.family !== "lesson") ||
      !positive(i.version) ||
      typeof i.days !== "number" ||
      !Number.isSafeInteger(i.days) ||
      !timestamp(i.setAt)
    )
      return null;
    out.push({
      family: i.family,
      version: i.version,
      days: i.days,
      setAt: i.setAt,
    });
  }
  return out;
}

export function parseAllowlist(v: unknown): AllowedHost[] | null {
  if (!Array.isArray(v) || v.length > 500) return null;
  const out: AllowedHost[] = [];
  for (const h of v) {
    if (
      !object(h) ||
      keys(h) !== "host,since" ||
      !hostOk(h.host) ||
      !timestamp(h.since)
    )
      return null;
    out.push({ host: h.host, since: h.since });
  }
  return out;
}

export const statusLabel: Record<MaintenanceStatus, string> = {
  overdue: "Overdue",
  due: "Due within 30 days",
  current: "Current",
  no_review: "No review on record",
};
export const familyLabel: Record<MaintenanceFamily, string> = {
  lesson: "Lesson",
  quiz: "Quiz",
  analysis: "Analysis post",
  partner: "Partner",
  link: "Partner link",
};
export const resultLabel: Record<string, string> = {
  manual_ok: "Checked by hand: working",
  manual_broken: "Checked by hand: broken",
  not_checked: "Not checked",
  ok: "Reachable",
  not_found: "Not found (404)",
  gone: "Gone (410)",
  redirect: "Redirects elsewhere",
  forbidden: "Forbidden",
  throttled: "Throttled",
  timeout: "Timed out",
  unreachable: "Unreachable",
};
export const actionMessage: Record<
  Exclude<MaintenanceActionResult["kind"], "results">,
  string
> = {
  limited: actionLimitMessage(null),
  done: "Saved.",
  invalid:
    "The store refused this. Check the reason, date or reference and try again. Nothing was changed.",
  denied:
    "You cannot do this for this item. Access is checked on every request. Nothing was changed.",
  unavailable: "Maintenance could not be reached. Nothing was changed.",
  conflict:
    "This item changed (a new revision went live, or a newer policy exists). Reload and decide again. Nothing was changed.",
  uncertain:
    "The change may or may not have been recorded. It will not be resent. Reload to see the current state.",
};
