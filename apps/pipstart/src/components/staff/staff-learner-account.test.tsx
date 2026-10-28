import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LiveStaffAccess } from "@/lib/auth/staff-role-flow";
import { StaffLearnerAccount } from "./staff-learner-account";
import { StaffPeople } from "./staff-people";
const actor = "d1000000-0000-4000-8000-000000000003",
  target = "d1000000-0000-4000-8000-000000000005";
const access: LiveStaffAccess = {
  authorized: true,
  user_id: actor,
  roles: ["administrator"],
  capabilities: ["people.read", "people.manage_learners"],
};
const person = {
  user_id: target,
  display_name: "Learner <Example>",
  created_at: "2026-10-28T00:00:00Z",
  staff_active: null,
  staff_roles: [],
};
describe("connected learner account presentation", () => {
  it("uses named native controls and explains the actual session effect", () => {
    const html = renderToStaticMarkup(
      <StaffLearnerAccount
        client={{} as SupabaseClient}
        access={access}
        person={person}
        onClose={() => {}}
      />,
    );
    expect(html).toContain("Learner &lt;Example&gt;");
    expect(html).toContain("Existing learner sessions may remain usable");
    expect(html).toContain("Verify and review");
    expect(html).toContain('pattern="[0-9]{6}"');
    expect(html).toContain("Existing request reference");
    expect(html).not.toContain("Confirm account request once");
    expect(html).not.toContain("sb_secret_");
  });
  it("refuses current and former staff targets before exposing a verification form", () => {
    for (const active of [true, false]) {
      const html = renderToStaticMarkup(
        <StaffLearnerAccount
          client={{} as SupabaseClient}
          access={access}
          person={{ ...person, staff_active: active }}
          onClose={() => {}}
        />,
      );
      expect(html).toContain("not eligible");
      expect(html).not.toContain("Verify and review");
    }
  });
  it("exposes account control to delegated admins only when server configuration enables it", () => {
    const yes = renderToStaticMarkup(
      <StaffPeople
        access={access}
        accountEnabled
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(yes).toContain("Manage learner account for");
    expect(yes).not.toContain("Manage roles for");
    const no = renderToStaticMarkup(
      <StaffPeople
        access={access}
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(no).not.toContain("Manage learner account for");
  });
});
