// Minimized read DTO only. This never authorizes a caller or performs a write.
const roles = [
  "administrator",
  "affiliate_manager",
  "author",
  "editor",
  "moderator",
  "owner",
  "reviewer",
];
const delegations = ["audit.read", "people.manage_learners", "roles.delegate"];
const kinds = [
  "course",
  "link",
  "lesson",
  "maintenance",
  "module",
  "partner",
  "quiz",
];
export type StaffAssignment = { resource_kind: string; resource_id: string };
export type StaffGovernance = {
  kind: "ready";
  targetId: string;
  staffActive: boolean | null;
  roles: string[];
  delegations: string[];
  assignments: StaffAssignment[];
  nextAfter: StaffAssignment | null;
};
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
    v,
  );
function assignment(v: unknown): v is StaffAssignment {
  return (
    record(v) &&
    Object.keys(v).sort().join(",") === "resource_id,resource_kind" &&
    typeof v.resource_kind === "string" &&
    kinds.includes(v.resource_kind) &&
    typeof v.resource_id === "string" &&
    /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v.resource_id)
  );
}
function orderedList(v: unknown, allowed: string[]): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= allowed.length &&
    v.every(
      (item, i) =>
        typeof item === "string" &&
        allowed.includes(item) &&
        (i === 0 || v[i - 1] < item),
    )
  );
}
function compare(a: StaffAssignment, b: StaffAssignment): number {
  return a.resource_kind === b.resource_kind
    ? a.resource_id < b.resource_id
      ? -1
      : a.resource_id === b.resource_id
        ? 0
        : 1
    : a.resource_kind < b.resource_kind
      ? -1
      : 1;
}
export function parseStaffGovernance(
  value: unknown,
  expectedTarget: string,
  after: StaffAssignment | null = null,
): StaffGovernance | { kind: "unavailable" } {
  const fail = { kind: "unavailable" } as const;
  if (
    !uuid(expectedTarget) ||
    (after !== null && !assignment(after)) ||
    !record(value) ||
    Object.keys(value).sort().join(",") !==
      "assignments,delegations,next_after,staff_active,staff_roles,target_id" ||
    value.target_id !== expectedTarget ||
    !(value.staff_active === null || typeof value.staff_active === "boolean") ||
    !orderedList(value.staff_roles, roles) ||
    !orderedList(value.delegations, delegations) ||
    !Array.isArray(value.assignments) ||
    value.assignments.length > 50 ||
    !(value.next_after === null || assignment(value.next_after))
  )
    return fail;
  const assignments: StaffAssignment[] = [];
  let previous = after;
  for (const item of value.assignments) {
    if (!assignment(item) || (previous && compare(previous, item) >= 0))
      return fail;
    assignments.push({
      resource_kind: item.resource_kind,
      resource_id: item.resource_id,
    });
    previous = item;
  }
  if (
    value.staff_active === null &&
    (value.staff_roles.length ||
      value.delegations.length ||
      assignments.length ||
      value.next_after !== null)
  )
    return fail;
  if (value.delegations.length && !value.staff_roles.includes("administrator"))
    return fail;
  if (
    value.next_after !== null &&
    (!assignments.length ||
      compare(value.next_after, assignments[assignments.length - 1]) !== 0)
  )
    return fail;
  return {
    kind: "ready",
    targetId: expectedTarget,
    staffActive: value.staff_active,
    roles: [...value.staff_roles],
    delegations: [...value.delegations],
    assignments,
    nextAfter:
      value.next_after === null
        ? null
        : {
            resource_kind: value.next_after.resource_kind,
            resource_id: value.next_after.resource_id,
          },
  };
}
