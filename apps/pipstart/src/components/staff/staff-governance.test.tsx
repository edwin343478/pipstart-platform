import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { StaffGovernanceChange } from "./staff-governance-change";
import { StaffGovernance } from "./staff-governance";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
  target = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c";
const access = {
  authorized: true as const,
  user_id: actor,
  roles: ["owner" as const],
  capabilities: ["staff.enter" as const, "roles.manage" as const],
};
const person = {
  user_id: target,
  display_name: "Test <Administrator>",
  staff_roles: ["administrator"],
};
const page = {
  kind: "ready" as const,
  targetId: target,
  staffActive: true,
  roles: ["administrator"],
  delegations: ["audit.read"],
  assignments: [],
  nextAfter: null,
};
const props = {
  client: {} as SupabaseClient,
  access,
  person,
  onClose: () => {},
  onChanged: () => {},
};
describe("bounded governance presentation", () => {
  it("uses an explicit delegation form and no role or account operations", () => {
    const html = renderToStaticMarkup(
      <StaffGovernanceChange {...props} page={page} />,
    );
    for (const value of [
      "Grant delegation",
      "Remove delegation",
      "Assign resource",
      "Remove assignment",
      "audit.read",
      "people.manage_learners",
      "roles.delegate",
      "Fresh six-digit authenticator code",
      "Verify and review",
    ])
      expect(html).toContain(value);
    expect(html).toContain("Test &lt;Administrator&gt;");
    expect(html).not.toContain('value="suspend"');
    expect(html).not.toContain('value="grant_role"');
    expect(html).not.toContain("Confirm governance change");
  });
  it("shows bounded internal resource input for a non-Administrator staff target", () => {
    const html = renderToStaticMarkup(
      <StaffGovernanceChange
        {...props}
        person={{ ...person, staff_roles: ["author"] }}
        page={{ ...page, roles: ["author"], delegations: [] }}
      />,
    );
    expect(html).toContain("Resource reference");
    expect(html).toContain('maxLength="200"');
    expect(html).toContain("No URL will be opened");
    expect(html).toContain("governance-resource-help");
  });
  it("does not invent current details while the live read is loading", () => {
    const html = renderToStaticMarkup(<StaffGovernance {...props} />);
    expect(html).toContain("Loading current governance details");
    expect(html).not.toContain("Change delegation or assignment");
    expect(html).not.toContain("audit.read");
  });
});

describe("native resource-reference constraint", () => {
  it("compiles under browser v semantics and matches the internal-key grammar", () => {
    const html = renderToStaticMarkup(
      <StaffGovernanceChange
        {...props}
        person={{ ...person, staff_roles: ["author"] }}
        page={{ ...page, roles: ["author"], delegations: [] }}
      />,
    );
    const pattern = /pattern="([^"]+)"/.exec(html)?.[1];
    expect(pattern).toBeTruthy();
    const regex = new RegExp("^(?:" + pattern + ")$", "v");
    for (const value of [
      "forex/lesson-1",
      "a.b",
      "a:b",
      "a_b",
      "x".repeat(200),
    ])
      expect(regex.test(value)).toBe(true);
    for (const value of [
      "Uppercase",
      "contains space",
      "a?token=x",
      "x".repeat(201),
      "",
    ])
      expect(regex.test(value)).toBe(false);
  });
});
