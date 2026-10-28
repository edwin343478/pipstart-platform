// Read-only DTO validation. Permission is enforced by the live gate and DB RPC.
export const STAFF_AUDIT_PAGE_SIZE = 25;
export type AuditCursor = { before: string; beforeId: string };
export type AuditEvent = {
  id: string;
  created_at: string;
  actor_id: string | null;
  request_id: string;
  operation: keyof typeof auditLabels;
  target_id: string | null;
  value: string;
  resource_kind: string;
  resource_id: string;
  reason_code: string;
  outcome: "changed" | "unchanged";
};
export const auditLabels = {
  bootstrap: "Initial Owner setup",
  control: "Staff access control",
  grant_role: "Role granted",
  revoke_role: "Role removed",
  grant_delegation: "Delegation granted",
  revoke_delegation: "Delegation removed",
  assign: "Resource assigned",
  unassign: "Resource assignment removed",
  suspend: "Staff membership suspended",
  resume: "Staff membership resumed",
} as const;
const roles = [
  "owner",
  "administrator",
  "author",
  "reviewer",
  "editor",
  "moderator",
  "affiliate_manager",
];
const delegations = ["roles.delegate", "people.manage_learners", "audit.read"];
const kinds = [
  "course",
  "module",
  "lesson",
  "quiz",
  "partner",
  "link",
  "maintenance",
];
const reasons = [
  "staff_onboarding",
  "access_change",
  "security_response",
  "owner_transfer",
  "enablement",
];
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

// Keep all six PostgreSQL fractional digits. Date.parse alone loses the last
// three and can skip events when a cursor is rounded to milliseconds.
function timestampKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(?:Z|\+00:00)$/.exec(
      value,
    );
  if (!match) return null;
  const date = new Date(match[1] + "Z");
  if (
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 19) !== match[1]
  )
    return null;
  return match[1] + "." + (match[2] || "").padEnd(6, "0");
}
export function parseAuditCursor(
  params: Record<string, string | string[] | undefined>,
): { kind: "ready"; cursor: AuditCursor | null } | { kind: "invalid" } {
  const keys = Object.keys(params);
  if (!keys.length) return { kind: "ready", cursor: null };
  if (
    keys.length !== 2 ||
    !keys.includes("before") ||
    !keys.includes("beforeId") ||
    !timestampKey(params.before) ||
    !uuid(params.beforeId)
  )
    return { kind: "invalid" };
  return {
    kind: "ready",
    cursor: { before: params.before as string, beforeId: params.beforeId },
  };
}
function validBinding(event: AuditEvent): boolean {
  const unscoped = event.resource_kind === "" && event.resource_id === "";
  if (event.operation === "control")
    return (
      event.actor_id === null &&
      event.target_id === null &&
      unscoped &&
      ["true", "false"].includes(event.value) &&
      event.reason_code === "enablement"
    );
  if (!uuid(event.target_id)) return false;
  if (event.operation === "bootstrap")
    return (
      event.actor_id === null &&
      event.value === "owner" &&
      unscoped &&
      event.reason_code === "owner_transfer"
    );
  if (!uuid(event.actor_id)) return false;
  switch (event.operation) {
    case "grant_role":
    case "revoke_role":
      return roles.includes(event.value) && unscoped;
    case "grant_delegation":
    case "revoke_delegation":
      return delegations.includes(event.value) && unscoped;
    case "assign":
    case "unassign":
      return (
        event.value === "" &&
        kinds.includes(event.resource_kind) &&
        /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(event.resource_id)
      );
    case "suspend":
    case "resume":
      return event.value === "" && unscoped;
  }
}
export type AuditPage = {
  kind: "ready";
  items: AuditEvent[];
  next: AuditCursor | null;
};
export function parseStaffAudit(
  value: unknown,
  cursor: AuditCursor | null = null,
): AuditPage | { kind: "unavailable" } {
  const fail = { kind: "unavailable" } as const;
  const before = cursor && timestampKey(cursor.before);
  if (cursor && (!before || !uuid(cursor.beforeId))) return fail;
  if (!Array.isArray(value) || value.length > STAFF_AUDIT_PAGE_SIZE + 1)
    return fail;
  const items: AuditEvent[] = [],
    ids = new Set<string>(),
    requests = new Set<string>();
  let prior: { time: string; id: string } | null = cursor
    ? { time: before!, id: cursor.beforeId }
    : null;
  for (const raw of value) {
    if (
      !record(raw) ||
      Object.keys(raw).sort().join(",") !==
        "actor_id,created_at,id,operation,outcome,reason_code,request_id,resource_id,resource_kind,target_id,value" ||
      !uuid(raw.id) ||
      !uuid(raw.request_id) ||
      !(raw.actor_id === null || uuid(raw.actor_id)) ||
      !(raw.target_id === null || uuid(raw.target_id)) ||
      typeof raw.operation !== "string" ||
      !Object.hasOwn(auditLabels, raw.operation) ||
      typeof raw.value !== "string" ||
      typeof raw.resource_kind !== "string" ||
      typeof raw.resource_id !== "string" ||
      typeof raw.reason_code !== "string" ||
      !reasons.includes(raw.reason_code) ||
      !["changed", "unchanged"].includes(raw.outcome as string)
    )
      return fail;
    const time = timestampKey(raw.created_at);
    if (
      !time ||
      ids.has(raw.id) ||
      requests.has(raw.request_id) ||
      (prior &&
        (time > prior.time || (time === prior.time && raw.id >= prior.id)))
    )
      return fail;
    const event = raw as AuditEvent;
    if (!validBinding(event)) return fail;
    items.push({
      id: event.id,
      created_at: event.created_at,
      actor_id: event.actor_id,
      request_id: event.request_id,
      operation: event.operation,
      target_id: event.target_id,
      value: event.value,
      resource_kind: event.resource_kind,
      resource_id: event.resource_id,
      reason_code: event.reason_code,
      outcome: event.outcome,
    });
    ids.add(event.id);
    requests.add(event.request_id);
    prior = { time, id: event.id };
  }
  const visible = items.slice(0, STAFF_AUDIT_PAGE_SIZE),
    last = visible.at(-1);
  return {
    kind: "ready",
    items: visible,
    next:
      items.length > STAFF_AUDIT_PAGE_SIZE && last
        ? { before: last.created_at, beforeId: last.id }
        : null,
  };
}
