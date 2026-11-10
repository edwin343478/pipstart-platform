import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ action: vi.fn() }));
vi.mock("@/app/admin/staff/content/publication-actions", () => ({
  runPublicationScheduleAction: mocks.action,
}));
import {
  StaffPublicationSchedule,
  scheduleTimeMessage,
} from "./staff-publication-schedule";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
const detail = {
  id: "post-1",
  family: "course",
  path: "forex",
  parent: null,
  title: "Approved post",
  revision: 2,
  bodySha256: "a".repeat(64),
  state: "approved",
  trashed: false,
  onHold: false,
  authorIsMe: true,
  reviewRequired: false,
  createdAt: "2026-11-06T10:00:00Z",
  decisions: [],
} as WorkspaceDetail;
describe("schedule panel", () => {
  it("renders an accessible paused/read state without sending during SSR", () => {
    const html = renderToStaticMarkup(
      <StaffPublicationSchedule
        detail={detail}
        generation={4}
        canPublish
        canMakeLive
        canTakeOffline={false}
        disabled={false}
        onBusy={() => {}}
      />,
    );
    expect(html).toContain('aria-labelledby="publication-schedule-heading"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('type="datetime-local"');
    expect(html).toContain("Review schedule");
    expect(html).not.toContain("Save schedule");
    expect(mocks.action).not.toHaveBeenCalled();
  });
  it("gives readers no mutation controls", () => {
    const html = renderToStaticMarkup(
      <StaffPublicationSchedule
        detail={detail}
        generation={4}
        canPublish={false}
        canMakeLive={false}
        canTakeOffline={false}
        disabled={false}
        onBusy={() => {}}
      />,
    );
    expect(html).not.toContain("Review schedule");
    expect(html).not.toContain("Schedule or cancellation reason");
    expect(html).toContain("Load schedules");
  });
  it("keeps DST guidance explicit", () => {
    expect(scheduleTimeMessage.ambiguous).toContain("occurs twice");
    expect(scheduleTimeMessage.nonexistent).toContain("does not exist");
  });
});
