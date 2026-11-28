import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/staff/content/analysis-actions", () => ({
  runAnalysisDraftAction: vi.fn(),
  runTradeStatusUpdateAction: vi.fn(),
}));

import {
  resultMessage,
  StaffTradeStatusUpdate,
} from "./staff-trade-status-update";

const live = {
  kind: "live" as const,
  id: "eurusd-retest",
  revision: 5,
  sha: "a".repeat(64),
  generation: 12,
  status: { state: "active" as const, reason: "pending" as const },
  statusUpdatedAt: "2026-11-27T14:30:00.000Z",
};

describe("live trade status panel (TA-c)", () => {
  it("shows the live status and a grouped one-step update", () => {
    const html = renderToStaticMarkup(<StaffTradeStatusUpdate live={live} />);
    expect(html).toContain("Live trade status");
    expect(html).toContain("Now: Active");
    expect(html).toContain("Pending: waiting for price to reach the entry");
    expect(html).toContain('label="Active: the idea is still valid"');
    expect(html).toContain('label="Inactive: closed or no longer tradable"');
    expect(html).toContain("Update status and publish");
    expect(html).toContain("about 2 to 3 minutes");
    // Inert until hydrated, like the other staff forms.
    expect(html).toMatch(/<button[^>]*disabled/);
  });

  it("explains why the one-step update is unavailable with unpublished edits", () => {
    const html = renderToStaticMarkup(
      <StaffTradeStatusUpdate live={{ kind: "pending-changes" }} />,
    );
    expect(html).toContain("not live yet");
    expect(html).not.toContain("Update status and publish");
  });

  it("says exactly which steps finished", () => {
    expect(
      resultMessage({ kind: "stopped", step: "saved", revision: 6 }),
    ).toMatch(/saved as revision 6 but not approved or published/);
    expect(
      resultMessage({ kind: "stopped", step: "approved", revision: 6 }),
    ).toMatch(/approved as revision 6 but not published/);
    expect(
      resultMessage({ kind: "done", revision: 6, generation: 13 }),
    ).toMatch(/2 to 3 minutes/);
    expect(resultMessage({ kind: "uncertain" })).toMatch(/Do not try again/);
  });
});
