import { describe, expect, it } from "vitest";
import { parseStaffAccess } from "./staff-access";

const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const valid = () => ({
  authorized: true,
  user_id: actor,
  roles: ["author"],
  capabilities: ["staff.enter", "content.write"],
});
describe("staff response validation, not role authorization", () => {
  it("accepts a bounded own-user response and preserves the capability set", () => {
    expect(parseStaffAccess(valid(), actor)).toEqual({
      kind: "authorized",
      access: valid(),
    });
  });
  it("distinguishes an explicit denial from malformed/unavailable data", () => {
    expect(parseStaffAccess({ authorized: false }, actor)).toEqual({
      kind: "denied",
    });
    expect(parseStaffAccess(null, actor)).toEqual({ kind: "unavailable" });
  });
  it.each([
    { authorized: true },
    { ...valid(), user_id: "wrong" },
    { ...valid(), user_id: "d81ca71d-b4ba-4ef2-83df-0417222bfe5c" },
    { ...valid(), roles: ["admin"] },
    { ...valid(), roles: ["superuser"] },
    { ...valid(), roles: [] },
    { ...valid(), roles: ["author", "author"] },
    { ...valid(), capabilities: ["secrets.read"] },
    { ...valid(), capabilities: ["staff.enter", "staff.enter"] },
    { ...valid(), capabilities: [] },
    { ...valid(), capabilities: ["content.write"] },
    { ...valid(), secret: "sentinel" },
    { authorized: false, roles: ["owner"] },
    { ...valid(), authorized: "true" },
  ])(
    "fails closed on malformed, foreign or unexpected payload %#",
    (payload) => {
      expect(parseStaffAccess(payload, actor)).toEqual({ kind: "unavailable" });
    },
  );
  it("requires the caller's verified identity and does not infer ownership", () => {
    expect(parseStaffAccess(valid(), "user_metadata.role=owner")).toEqual({
      kind: "unavailable",
    });
    const result = parseStaffAccess(valid(), actor);
    if (result.kind !== "authorized") throw Error("Expected fixture");
    expect(result.access.capabilities).not.toContain("roles.manage");
  });
});
