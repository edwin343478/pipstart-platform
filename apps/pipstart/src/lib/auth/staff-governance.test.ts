import { describe, expect, it } from "vitest";
import { parseStaffGovernance } from "./staff-governance";
const target = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const scope = (id = "forex/lesson-1") => ({
  resource_kind: "lesson",
  resource_id: id,
});
const page = () => ({
  target_id: target,
  staff_active: true,
  staff_roles: ["administrator"],
  delegations: ["audit.read"],
  assignments: [scope()],
  next_after: null,
});
describe("target-bound governance read DTO", () => {
  it("returns copied minimized records without authorizing or changing anything", () => {
    const input = page(),
      parsed = parseStaffGovernance(input, target);
    expect(parsed).toEqual({
      kind: "ready",
      targetId: target,
      staffActive: true,
      roles: ["administrator"],
      delegations: ["audit.read"],
      assignments: [scope()],
      nextAfter: null,
    });
    input.staff_roles.push("owner");
    input.assignments[0].resource_id = "changed";
    expect(parsed).toMatchObject({
      roles: ["administrator"],
      assignments: [scope()],
    });
  });
  it("refuses a different or malformed expected target", () => {
    expect(
      parseStaffGovernance(page(), "d81ca71d-b4ba-4ef2-83df-0417222bfe5c").kind,
    ).toBe("unavailable");
    expect(parseStaffGovernance(page(), "bad").kind).toBe("unavailable");
  });
  it("distinguishes a non-staff profile and suspended staff", () => {
    expect(
      parseStaffGovernance(
        {
          ...page(),
          staff_active: null,
          staff_roles: [],
          delegations: [],
          assignments: [],
        },
        target,
      ),
    ).toMatchObject({ kind: "ready", staffActive: null });
    expect(
      parseStaffGovernance({ ...page(), staff_active: false }, target),
    ).toMatchObject({
      kind: "ready",
      staffActive: false,
      roles: ["administrator"],
    });
  });
  it("requires fixed, unique byte-sorted roles/delegations", () => {
    for (const change of [
      { staff_roles: ["owner", "administrator"] },
      { staff_roles: ["owner", "owner"] },
      { delegations: ["root"] },
      { staff_roles: ["author"] },
    ])
      expect(parseStaffGovernance({ ...page(), ...change }, target).kind).toBe(
        "unavailable",
      );
  });
  it("preserves C/ASCII punctuation ordering and advances across keyset pages", () => {
    const assignments = [
      scope("a-b"),
      scope("a.b"),
      scope("a/b"),
      scope("a:b"),
      scope("a_b"),
    ];
    const first = parseStaffGovernance(
      { ...page(), assignments, next_after: scope("a_b") },
      target,
    );
    expect(first.kind).toBe("ready");
    expect(
      parseStaffGovernance(
        { ...page(), assignments: [scope("b")], next_after: null },
        target,
        scope("a_b"),
      ).kind,
    ).toBe("ready");
    expect(
      parseStaffGovernance(
        { ...page(), assignments: [scope("a_b")] },
        target,
        scope("a_b"),
      ).kind,
    ).toBe("unavailable");
  });
  it("orders by kind then id, not the supplied array order", () => {
    expect(
      parseStaffGovernance(
        {
          ...page(),
          assignments: [
            { resource_kind: "course", resource_id: "z" },
            scope("a"),
          ],
        },
        target,
      ).kind,
    ).toBe("ready");
    expect(
      parseStaffGovernance(
        {
          ...page(),
          assignments: [
            scope("a"),
            { resource_kind: "course", resource_id: "z" },
          ],
        },
        target,
      ).kind,
    ).toBe("unavailable");
  });
  it.each([
    null,
    [],
    {},
    { ...page(), email: "private@example.invalid" },
    { ...page(), token: "secret" },
    { ...page(), staff_active: "true" },
    {
      ...page(),
      assignments: Array.from({ length: 51 }, (_, i) => scope(String(i))),
    },
    { ...page(), assignments: [scope(), scope()] },
    { ...page(), assignments: [{ ...scope(), email: "private" }] },
    { ...page(), assignments: [scope("contains space")] },
    { ...page(), assignments: [scope("x".repeat(201))] },
    { ...page(), assignments: [scope("Uppercase")] },
    { ...page(), assignments: [scope("a?token=secret")] },
    { ...page(), staff_active: null },
    { ...page(), next_after: scope("unreturned") },
    { ...page(), assignments: [], next_after: scope() },
  ])("fails the entire page closed for malformed/extended data %#", (value) =>
    expect(parseStaffGovernance(value, target)).toEqual({
      kind: "unavailable",
    }),
  );
  it("rejects an invalid caller cursor and accepts an exact 200-character id", () => {
    expect(
      parseStaffGovernance(page(), target, {
        resource_kind: "other",
        resource_id: "x",
      }).kind,
    ).toBe("unavailable");
    expect(
      parseStaffGovernance(
        { ...page(), assignments: [scope("x".repeat(200))] },
        target,
      ).kind,
    ).toBe("ready");
  });
});
