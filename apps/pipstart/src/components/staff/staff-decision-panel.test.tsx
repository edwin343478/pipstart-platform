import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/decision-actions", () => ({
  runEditorialDecisionAction: vi.fn(),
}));
import { StaffDecisionPanel } from "./staff-decision-panel";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
const detail = (extra: Partial<WorkspaceDetail> = {}): WorkspaceDetail => ({
  id: "lesson-1",
  family: "lesson",
  path: "forex",
  parent: "module-1",
  title: "Lesson",
  revision: 3,
  bodySha256: "a".repeat(64),
  state: "draft",
  trashed: false,
  onHold: false,
  authorIsMe: false,
  reviewRequired: false,
  createdAt: "2026-11-05T10:00:00.000Z",
  decisions: [],
  ...extra,
});
const html = (
  d: WorkspaceDetail,
  roles: { submit?: boolean; review?: boolean; publish?: boolean },
) =>
  renderToStaticMarkup(
    <StaffDecisionPanel
      detail={d}
      canSubmit={!!roles.submit}
      canReview={!!roles.review}
      canPublish={!!roles.publish}
      onChanged={() => {}}
    />,
  );
describe("review and publication panel", () => {
  it("offers an author Send to reviewer on a draft, and nothing else", () => {
    const h = html(detail(), { submit: true });
    expect(h).toContain("Send to reviewer");
    expect(h).not.toContain("Publish revision");
    expect(h).not.toContain("Approve revision");
    expect(h).toContain("keep reading the published code");
  });
  it("offers the Owner Publish on a draft while review is optional", () => {
    const h = html(detail(), { submit: true, review: true, publish: true });
    expect(h).toContain("Send to reviewer");
    expect(h).toContain("Publish revision 3");
    expect(h).toContain("Decision note (optional)");
  });
  it("closes Publish when the policy requires independent review", () => {
    const h = html(detail({ reviewRequired: true }), { publish: true });
    expect(h).not.toContain("Publish revision");
    expect(h).toContain("Independent review is required by policy");
  });
  it("offers a different reviewer Approve and Request changes on a submitted revision", () => {
    const h = html(detail({ state: "submitted" }), { review: true });
    expect(h).toContain("Approve revision 3");
    expect(h).toContain("Request changes");
    expect(h).toContain("required to request changes");
    expect(h).not.toContain("Send to reviewer");
  });
  it("never offers review of the viewer's own revision", () => {
    const h = html(detail({ state: "submitted", authorIsMe: true }), {
      review: true,
    });
    expect(h).not.toContain("Approve revision");
    expect(h).toContain("a different person must review it");
  });
  it("explains approved, changes requested and archived states without actions", () => {
    for (const [d, text] of [
      [detail({ state: "approved" }), "This revision is approved"],
      [detail({ state: "changes_requested" }), "A reviewer asked for changes"],
      [detail({ trashed: true }), "Archived content cannot be reviewed"],
    ] as const) {
      const h = html(d, { submit: true, review: true, publish: true });
      expect(h).toContain(text);
      expect(h).not.toMatch(
        /Send to reviewer|Approve revision|Publish revision/,
      );
    }
  });
  it("says when no decision is available", () => {
    expect(html(detail(), {})).toContain(
      "No decision is available to you for this revision.",
    );
  });
});
