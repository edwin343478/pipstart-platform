import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/lifecycle-actions", () => ({
  runEditorialLifecycleAction: vi.fn(),
}));
vi.mock("@/app/admin/staff/content/decision-actions", () => ({
  runEditorialDecisionAction: vi.fn(),
}));
import { StaffLifecyclePanel } from "./staff-lifecycle-panel";
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
  roles: { archive?: boolean; restore?: boolean; hold?: boolean },
) =>
  renderToStaticMarkup(
    <StaffLifecyclePanel
      detail={d}
      canArchive={!!roles.archive}
      canRestore={!!roles.restore}
      canHold={!!roles.hold}
      onChanged={() => {}}
    />,
  );
describe("archive and hold panel", () => {
  it("offers an author Archive with a required reason", () => {
    const h = html(detail(), { archive: true });
    expect(h).toContain(">Archive<");
    expect(h).toContain("Reason (required, up to 200 characters)");
    expect(h).toContain("can be undone by restoring");
    expect(h).not.toMatch(/Restore as draft|Place hold|Release hold/);
  });
  it("offers the Owner Archive and Place hold on an active item", () => {
    const h = html(detail(), { archive: true, restore: true, hold: true });
    expect(h).toContain(">Archive<");
    expect(h).toContain("Place hold");
    expect(h).not.toContain("Restore as draft");
  });
  it("blocks Archive while held and offers the Owner Release", () => {
    const h = html(detail({ onHold: true }), {
      archive: true,
      restore: true,
      hold: true,
    });
    expect(h).not.toContain(">Archive<");
    expect(h).toContain("Release hold");
    expect(h).toContain("cannot be archived");
  });
  it("offers Restore as draft for archived content and explains approvals", () => {
    const h = html(detail({ trashed: true }), { archive: true, restore: true });
    expect(h).toContain("Restore as draft");
    expect(h).toContain("earlier approvals are not reinstated");
    expect(h).not.toContain(">Archive<");
  });
  it("says when nothing is available", () => {
    expect(html(detail({ trashed: true }), { archive: true })).toContain(
      "No archive or hold action is available to you for this item.",
    );
  });
});
describe("decision panel polish", () => {
  it("does not repeat a no-decision line for approved revisions", () => {
    const h = renderToStaticMarkup(
      <StaffDecisionPanel
        detail={detail({ state: "approved" })}
        canSubmit
        canReview
        canPublish
        onChanged={() => {}}
      />,
    );
    expect(h).toContain("This revision is approved");
    expect(h).not.toContain("No decision is available");
  });
});
