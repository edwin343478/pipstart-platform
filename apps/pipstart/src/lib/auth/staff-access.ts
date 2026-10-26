// Validate an RPC response without adding a runtime dependency. This never
// grants permission from a browser role or replaces the database mutation check.
const roles = [
  "owner",
  "administrator",
  "author",
  "reviewer",
  "editor",
  "moderator",
  "affiliate_manager",
] as const;
const capabilities = [
  "staff.enter",
  "content.read",
  "content.write",
  "content.submit",
  "content.review",
  "content.publish",
  "content.withdraw",
  "content.trash",
  "content.restore",
  "partner.read",
  "partner.write",
  "partner.trash",
  "partner.restore",
  "link.revoke",
  "maintenance.assigned",
  "people.read",
  "people.manage_learners",
  "roles.manage",
  "roles.delegate",
  "audit.read",
] as const;
type StaffRole = (typeof roles)[number];
type StaffCapability = (typeof capabilities)[number];
type StaffAccess = {
  authorized: true;
  user_id: string;
  roles: StaffRole[];
  capabilities: StaffCapability[];
};
export type StaffAccessResult =
  | { kind: "unavailable" }
  | { kind: "denied" }
  | { kind: "authorized"; access: StaffAccess };

const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
function knownList<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= allowed.length &&
    new Set(value).size === value.length &&
    Array.from(value).every(
      (item) =>
        typeof item === "string" &&
        (allowed as readonly string[]).includes(item),
    )
  );
}

export function parseStaffAccess(
  payload: unknown,
  verifiedUserId: string,
): StaffAccessResult {
  if (
    !uuid(verifiedUserId) ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  )
    return { kind: "unavailable" };
  const data = payload as Record<string, unknown>;
  const keys = Object.keys(data).sort().join(",");
  if (data.authorized === false && keys === "authorized")
    return { kind: "denied" };
  if (
    keys !== "authorized,capabilities,roles,user_id" ||
    data.authorized !== true ||
    !uuid(data.user_id) ||
    data.user_id !== verifiedUserId ||
    !knownList(data.roles, roles) ||
    !knownList(data.capabilities, capabilities) ||
    !data.capabilities.includes("staff.enter")
  )
    return { kind: "unavailable" };
  return {
    kind: "authorized",
    access: {
      authorized: true,
      user_id: data.user_id,
      roles: data.roles.slice(),
      capabilities: data.capabilities.slice(),
    },
  };
}
