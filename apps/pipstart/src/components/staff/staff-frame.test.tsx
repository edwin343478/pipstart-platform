import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
import { StaffFrame } from "./staff-frame";
import { StaffMfa } from "./staff-mfa";
describe("honest staff entry presentation", () => {
  it("reuses the administration hierarchy without fictional users, counts or permissions", () => {
    const html = renderToStaticMarkup(
      <StaffFrame>
        <h1>Staff verification</h1>
      </StaffFrame>,
    );
    expect(html).toContain('href="#staff-main"');
    expect(html).toContain('aria-label="Staff navigation"');
    expect(html).not.toContain("MFA verified · 4 min ago");
    expect(html).not.toContain("Grace Njeri");
    expect(html).not.toContain("/admin/preview");
    expect(html).not.toContain("/admin/people");
  });
  it("does not claim verification on the enrolment screen", () => {
    const html = renderToStaticMarkup(
      <StaffFrame>
        <StaffMfa userId="2d734acd-a974-45f1-aabc-bc9b0a37fb40" />
      </StaffFrame>,
    );
    expect(html).toContain("Verify to continue");
    expect(html).toContain("does not issue recovery codes");
    expect(html).toContain("does not give this account a staff role");
    expect(html).not.toContain("JBSW");
    expect(html).not.toContain("data:image");
    expect(html).toContain('type="button"');
  });
});
