import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/partner-actions", () => ({
  runPartnerEditorAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { StaffPartnerEditor } from "./staff-partner-editor";
import { emptyPartnerFields } from "@/lib/content/partner-editor-contract";

const partnerView = {
  kind: "partner" as const,
  slug: "deriv",
  revision: 2,
  bodySha256: "a".repeat(64),
  state: "approved",
  trashed: false,
  hasLink: true,
  policy: {
    version: 1,
    riskNotice: "Trading involves risk.",
    allowedHosts: [],
  },
  fields: {
    ...emptyPartnerFields(),
    name: "Deriv.com",
    shortName: "Deriv",
    summary: "Summary.",
  },
};
const linkView = {
  kind: "link" as const,
  slug: "deriv",
  revision: 1,
  bodySha256: "b".repeat(64),
  state: "draft",
  trashed: false,
  policy: { version: 1, riskNotice: null, allowedHosts: ["t.deriv.link"] },
  fields: {
    title: "Open",
    url: "https://t.deriv.link?t=X",
    active: true,
    expiresAt: "",
  },
};
describe("M22 MP09c partner editor presentation", () => {
  it("keeps controls inert until hydration and labels every partner field", () => {
    const html = renderToStaticMarkup(
      <StaffPartnerEditor view={partnerView} create={null} isOwner={false} />,
    );
    expect(html).toMatch(/<fieldset disabled="">/);
    for (const label of [
      "Name",
      "Short name",
      "Directory",
      "Relationship",
      "Summary",
      "Review status",
      "Review sources",
      "Facts",
      "Change reason",
    ])
      expect(html).toContain(label);
    expect(html).toContain("Edit this partner’s link");
    expect(html).not.toMatch(/Make revision|Publish|token|secret|hook/i);
  });
  it("shows the Owner policy read-only to an Affiliate Manager", () => {
    const html = renderToStaticMarkup(
      <StaffPartnerEditor view={partnerView} create={null} isOwner={false} />,
    );
    expect(html).toContain("Only the Owner can change it.");
    expect(html).toMatch(/<textarea[^>]*id="policy-notice"[^>]*readOnly=""/i);
    expect(html).not.toContain("Save policy version");
  });
  it("lets the Owner version the link's approved hosts and shows them beside the destination", () => {
    const html = renderToStaticMarkup(
      <StaffPartnerEditor view={linkView} create={null} isOwner />,
    );
    expect(html).toContain("Approved hosts:");
    expect(html).toContain("t.deriv.link");
    expect(html).toContain("Save policy version 2");
    expect(html).toContain(
      "Keep the partner’s attribution parameters exactly as issued.",
    );
  });
  it("starts a new partner with an identity field and no policy save", () => {
    const html = renderToStaticMarkup(
      <StaffPartnerEditor
        view={null}
        create={{ kind: "partner", slug: "", policy: null }}
        isOwner
      />,
    );
    expect(html).toContain("New partner");
    expect(html).toContain('id="partner-slug"');
    expect(html).toContain(
      "Save the partner first, then set its risk notice here.",
    );
  });
});
