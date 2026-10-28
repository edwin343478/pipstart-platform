import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@supabase/ssr", () => ({ createBrowserClient: () => null }));
vi.mock("@/app/admin/maintenance/actions", () => ({
  executeMaintenanceAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
import {
  formatUtc,
  MaintenanceReviewDetails,
  outcomeNotice,
  StaffMaintenance,
} from "./staff-maintenance";
import { StaffFrame } from "./staff-frame";
import type { MaintenanceReview } from "@/lib/auth/staff-maintenance-contract";
const review: MaintenanceReview = Object.freeze({
  request_id: "d3000000-0000-4000-8000-000000000001",
  target_id: "d1000000-0000-4000-8000-000000000004",
  operation: "auth_suspend",
  suspend_until: "2026-10-28T16:53:59.895+00:00",
  reason: "security_response",
  state: "prepared",
  status: "reviewed",
});
describe("Owner maintenance initial presentation", () => {
  it("provides native labelled controls without an execution button before verification", () => {
    const html = renderToStaticMarkup(
      <StaffMaintenance userId="d1000000-0000-4000-8000-000000000003" />,
    );
    for (const id of [
      "maintenance-request",
      "maintenance-mode",
      "maintenance-factor",
      "maintenance-code",
    ]) {
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('pattern="[0-9]{6}"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("General staff access stays paused");
    expect(html).toContain("Verification alone does not execute");
    expect(html).not.toContain("Confirm exact action once");
    expect(html).not.toContain("sb_secret_");
  });
  it("keeps the empty live region mounted without a visual notice frame", () => {
    const html = renderToStaticMarkup(
      <StaffMaintenance userId="d1000000-0000-4000-8000-000000000003" />,
    );
    expect(html).toMatch(/<p role="status" aria-live="polite"[^>]*><\/p>/);
    expect(html).not.toContain("data-tone");
  });
});
describe("Owner maintenance review details", () => {
  it("presents the exact reviewed request with a real heading and readable UTC time", () => {
    const html = renderToStaticMarkup(
      <MaintenanceReviewDetails
        review={review}
        mode="dispatch"
        acted={false}
      />,
    );
    expect(html).toContain("<h2>Exact request review</h2>");
    expect(html).toContain("<dt>Journal state</dt><dd>prepared</dd>");
    expect(html).toContain(
      '<time dateTime="2026-10-28T16:53:59.895+00:00">2026-10-28 16:53:59 UTC</time>',
    );
    expect(html).toContain("One provider action");
    expect(html).not.toContain("captured before the action");
  });
  it("labels the review as pre-action after an outcome instead of implying a current journal state", () => {
    const html = renderToStaticMarkup(
      <MaintenanceReviewDetails review={review} mode="dispatch" acted />,
    );
    expect(html).toContain("<h2>Request as reviewed before this action</h2>");
    expect(html).toContain("<dt>Journal state at review</dt><dd>prepared</dd>");
    expect(html).toContain("captured before the action");
    expect(html).not.toContain("<h2>Exact request review</h2>");
  });
  it("shows a resumption without a suspension time", () => {
    const html = renderToStaticMarkup(
      <MaintenanceReviewDetails
        review={{ ...review, operation: "auth_resume", suspend_until: null }}
        mode="inspect"
        acted={false}
      />,
    );
    expect(html).toContain("Resume Auth account");
    expect(html).toContain("<dd>Not applicable</dd>");
    expect(html).toContain("Read-only inspection");
    expect(html).not.toContain("<time");
  });
});
describe("Owner maintenance outcome notices", () => {
  const request = review.request_id;
  it("maps each controller outcome to an honest message and tone", () => {
    expect(
      outcomeNotice({ kind: "recorded", request, outcome: "succeeded" }),
    ).toEqual({
      tone: "success",
      text: expect.stringContaining("Provider acknowledgment recorded."),
    });
    expect(
      outcomeNotice({ kind: "recorded", request, outcome: "unknown" }).tone,
    ).toBe("warning");
    expect(
      outcomeNotice({
        kind: "observed",
        request,
        journalState: "succeeded",
        observation: "desired",
      }),
    ).toEqual({
      tone: "info",
      text: expect.stringContaining(
        "Read-only observation: desired. Journal state: succeeded.",
      ),
    });
    for (const kind of ["disabled", "invalid", "denied"] as const)
      expect(outcomeNotice({ kind })).toEqual({
        tone: "error",
        text: expect.stringContaining(
          "The request was not authorized or the transport is disabled.",
        ),
      });
    for (const value of [{ kind: "unknown" } as const, null])
      expect(outcomeNotice(value)).toEqual({
        tone: "warning",
        text: expect.stringContaining(
          "The result is uncertain. Do not repeat the action.",
        ),
      });
  });
  it("formats UTC deterministically and keeps unparseable values visible", () => {
    expect(formatUtc("2026-10-28T16:53:59.895+00:00")).toBe(
      "2026-10-28 16:53:59 UTC",
    );
    expect(formatUtc("2026-10-28T19:53:59+03:00")).toBe(
      "2026-10-28 16:53:59 UTC",
    );
    expect(formatUtc(null)).toBe("Not applicable");
    expect(formatUtc("not-a-time")).toBe("not-a-time");
  });
});
describe("paused staff frame", () => {
  it("points paused maintenance at itself instead of the closed staff entry", () => {
    const html = renderToStaticMarkup(
      <StaffFrame paused>
        <h1>Owner staff maintenance</h1>
      </StaffFrame>,
    );
    expect(html).toContain('href="/admin/maintenance"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Only Owner maintenance is available");
    expect(html).not.toContain('href="/admin/access"');
    expect(html).not.toContain("Staff verification");
  });
  it("leaves the default staff entry frame unchanged", () => {
    const html = renderToStaticMarkup(
      <StaffFrame>
        <h1>Staff verification</h1>
      </StaffFrame>,
    );
    expect(html).toContain('href="/admin/access"');
    expect(html).toContain("Verify your identity before staff access.");
    expect(html).not.toContain("/admin/maintenance");
  });
});
