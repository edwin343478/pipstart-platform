// Minimized read DTO only. This parser never authorizes a caller or queries Auth.
const roles = [
  "owner",
  "administrator",
  "author",
  "reviewer",
  "editor",
  "moderator",
  "affiliate_manager",
] as const;
type StaffPerson = {
  user_id: string;
  display_name: string;
  created_at: string;
  staff_active: boolean | null;
  staff_roles: string[];
};
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
export function parseStaffPeople(
  value: unknown,
):
  | { kind: "ready"; items: StaffPerson[]; nextAfter: string | null }
  | { kind: "unavailable" } {
  if (
    !record(value) ||
    Object.keys(value).sort().join(",") !== "items,next_after" ||
    !Array.isArray(value.items) ||
    value.items.length > 50 ||
    !(value.next_after === null || uuid(value.next_after))
  )
    return { kind: "unavailable" };
  const items: StaffPerson[] = [];
  for (const item of value.items) {
    if (
      !record(item) ||
      Object.keys(item).sort().join(",") !==
        "created_at,display_name,staff_active,staff_roles,user_id" ||
      !uuid(item.user_id) ||
      typeof item.display_name !== "string" ||
      item.display_name.length < 2 ||
      item.display_name.length > 60 ||
      item.display_name.trim() !== item.display_name ||
      typeof item.created_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(item.created_at) ||
      !Number.isFinite(Date.parse(item.created_at)) ||
      !(item.staff_active === null || typeof item.staff_active === "boolean") ||
      !Array.isArray(item.staff_roles) ||
      item.staff_roles.length > roles.length ||
      new Set(item.staff_roles).size !== item.staff_roles.length ||
      !item.staff_roles.every(
        (r) =>
          typeof r === "string" && (roles as readonly string[]).includes(r),
      ) ||
      (items.length > 0 && items[items.length - 1].user_id >= item.user_id)
    )
      return { kind: "unavailable" };
    if (item.staff_active === null && item.staff_roles.length !== 0)
      return { kind: "unavailable" };
    items.push({
      user_id: item.user_id,
      display_name: item.display_name,
      created_at: item.created_at,
      staff_active: item.staff_active,
      staff_roles: [...item.staff_roles],
    });
  }
  if (
    value.next_after !== null &&
    value.next_after !== items[items.length - 1]?.user_id
  )
    return { kind: "unavailable" };
  return { kind: "ready", items, nextAfter: value.next_after };
}
