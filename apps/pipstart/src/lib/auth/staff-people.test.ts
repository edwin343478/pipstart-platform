import { describe, expect, it } from "vitest";
import { parseStaffPeople } from "./staff-people";
const id = "40000000-0000-4000-8000-000000000001";
const person = () => ({
  user_id: id,
  display_name: "Fixture",
  created_at: "2026-10-26T21:00:00+00:00",
  staff_active: null,
  staff_roles: [] as string[],
});
describe("minimal people read boundary", () => {
  it("accepts an empty page without claiming account state", () =>
    expect(parseStaffPeople({ items: [], next_after: null })).toEqual({
      kind: "ready",
      items: [],
      nextAfter: null,
    }));
  it("accepts the exact learner DTO and keyset cursor", () =>
    expect(parseStaffPeople({ items: [person()], next_after: id })).toEqual({
      kind: "ready",
      items: [person()],
      nextAfter: id,
    }));
  it.each([
    null,
    [],
    {},
    { items: [], next_after: id },
    { items: [person()], next_after: "bad" },
    { items: [person()], next_after: null, auth_users: [] },
  ])("rejects malformed or overbroad page %#", (value) =>
    expect(parseStaffPeople(value)).toEqual({ kind: "unavailable" }),
  );
  it.each([
    { ...person(), email: "private@example.test" },
    { ...person(), raw_user_meta_data: { role: "owner" } },
    { ...person(), staff_roles: ["superuser"] },
    { ...person(), staff_roles: ["owner", "owner"] },
    { ...person(), staff_roles: ["owner"] },
    { ...person(), display_name: " x" },
    { ...person(), created_at: "not-a-date" },
    { ...person(), staff_active: "banned" },
    { ...person(), factor_secret: "sentinel" },
  ])("fails closed on unexpected or contradictory fields %#", (row) =>
    expect(parseStaffPeople({ items: [row], next_after: null })).toEqual({
      kind: "unavailable",
    }),
  );
  it("rejects duplicate/out-of-order keys and pages larger than 50", () => {
    expect(
      parseStaffPeople({ items: [person(), person()], next_after: null }),
    ).toEqual({ kind: "unavailable" });
    expect(
      parseStaffPeople({
        items: Array.from({ length: 51 }, person),
        next_after: null,
      }),
    ).toEqual({ kind: "unavailable" });
  });
  it("copies returned role arrays rather than sharing mutable input", () => {
    const row = { ...person(), staff_active: true, staff_roles: ["owner"] };
    const result = parseStaffPeople({ items: [row], next_after: null });
    if (result.kind !== "ready") throw Error("fixture");
    row.staff_roles.push("author");
    expect(result.items[0].staff_roles).toEqual(["owner"]);
  });
});
