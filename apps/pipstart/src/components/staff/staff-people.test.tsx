import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { StaffPeople } from "./staff-people";
import { StaffRoleChange } from "./staff-role-change";
import type { LiveStaffAccess } from "@/lib/auth/staff-role-flow";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
  target = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c";
const access: LiveStaffAccess = {
  authorized: true,
  user_id: actor,
  roles: ["owner"],
  capabilities: ["staff.enter", "people.read", "roles.manage"],
};
const person = {
  user_id: target,
  display_name: "Test <Person>",
  created_at: "2026-10-27T00:00:00Z",
  staff_active: true,
  staff_roles: ["author"],
};
describe("minimized connected people presentation", () => {
  it("uses the approved people table hierarchy with escaped live names and actual page counts", () => {
    const html = renderToStaticMarkup(
      <StaffPeople
        access={access}
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(html).toContain("People and current staff roles");
    expect(html).toContain("Test &lt;Person&gt;");
    expect(html).toContain("1 profiles on this page");
    expect(html).toContain("Staff membership");
    expect(html).toContain("people-search-help");
    expect(html).not.toContain("owner@pipstart.example");
    expect(html).not.toContain("Showing 1–8 of 41");
    expect(html).not.toContain("Invite staff");
  });
  it("shows an unavailable state without fixture people", () => {
    const html = renderToStaticMarkup(
      <StaffPeople access={access} initialPage={null} />,
    );
    expect(html).toContain("people list is unavailable");
    expect(html).not.toContain(person.user_id);
  });
  it("renders read-only rows when role management is not granted", () => {
    const html = renderToStaticMarkup(
      <StaffPeople
        access={{ ...access, capabilities: ["staff.enter", "people.read"] }}
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(html).toContain("Read only");
    expect(html).not.toContain("Manage roles for");
  });
  it("provides native named controls and no secret or receipt in initial role markup", () => {
    const html = renderToStaticMarkup(
      <StaffRoleChange
        client={{} as SupabaseClient}
        access={access}
        person={person}
        onClose={() => {}}
        onChanged={() => {}}
      />,
    );
    expect(html).toContain("Choose the exact role change");
    expect(html).toContain("Fresh six-digit authenticator code");
    expect(html).toContain('pattern="[0-9]{6}"');
    expect(html).toContain("Verify and review");
    expect(html).not.toContain("Confirm role change");
    expect(html).not.toContain("JBSWY");
    expect(html).not.toContain('role="dialog"');
  });
  it("does not offer protected roles to a delegated administrator", () => {
    const delegated: LiveStaffAccess = {
      ...access,
      roles: ["administrator"],
      capabilities: ["staff.enter", "people.read", "roles.delegate"],
    };
    const html = renderToStaticMarkup(
      <StaffRoleChange
        client={{} as SupabaseClient}
        access={delegated}
        person={person}
        onClose={() => {}}
        onChanged={() => {}}
      />,
    );
    expect(html).not.toContain('value="owner"');
    expect(html).not.toContain('value="administrator"');
    expect(html).toContain('value="author"');
  });
  it("blocks a delegated edit of an Owner target", () => {
    const html = renderToStaticMarkup(
      <StaffRoleChange
        client={{} as SupabaseClient}
        access={{
          ...access,
          roles: ["administrator"],
          capabilities: ["staff.enter", "roles.delegate"],
        }}
        person={{ ...person, staff_roles: ["owner"] }}
        onClose={() => {}}
        onChanged={() => {}}
      />,
    );
    expect(html).toContain("Only the Owner can change");
    expect(html).toContain("<fieldset disabled=");
  });
});

describe("Owner-only governance navigation", () => {
  it("shows governance only with roles.manage", () => {
    const owner = renderToStaticMarkup(
      <StaffPeople
        access={access}
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(owner).toContain("Manage governance for Test &lt;Person&gt;");
    const delegated = renderToStaticMarkup(
      <StaffPeople
        access={{
          ...access,
          roles: ["administrator"],
          capabilities: ["staff.enter", "people.read", "roles.delegate"],
        }}
        initialPage={{ kind: "ready", items: [person], nextAfter: null }}
      />,
    );
    expect(delegated).toContain("Manage roles for");
    expect(delegated).not.toContain("Manage governance for");
  });
});
