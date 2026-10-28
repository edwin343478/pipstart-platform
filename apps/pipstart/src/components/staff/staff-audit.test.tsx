import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StaffAudit } from "./staff-audit";
import { StaffFrame } from "./staff-frame";
import type { AuditEvent } from "@/lib/auth/staff-audit";
const id = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const event: AuditEvent = {
  id,
  request_id: id,
  actor_id: null,
  target_id: id,
  created_at: "2026-10-27T09:00:00.123456+00:00",
  operation: "bootstrap",
  value: "owner",
  resource_kind: "",
  resource_id: "",
  reason_code: "owner_transfer",
  outcome: "changed",
};
const html = (page: Parameters<typeof StaffAudit>[0]) =>
  renderToStaticMarkup(<StaffAudit {...page} />);
describe("minimized read-only audit presentation", () => {
  it("shows recorded references, UTC precision, actual counts and qualified effects", () => {
    const result = html({
      page: { kind: "ready", items: [event], next: null },
    });
    for (const text of [
      "Staff governance audit events",
      "Database operator",
      "Initial Owner setup",
      "09:00:00.123456 UTC",
      "1 event on this page",
      "does not confirm that an Auth account was suspended",
      "complete security history",
    ])
      expect(result).toContain(text);
    expect(result).not.toContain("email@");
    expect(result).not.toContain("Download");
    expect(result).not.toContain('method="post"');
  });
  it("uses native GET navigation with the exact cursor and no browser write controls", () => {
    const result = html({
      page: {
        kind: "ready",
        items: [event],
        next: { before: event.created_at, beforeId: event.id },
      },
    });
    expect(result.match(/method="get"/g)).toHaveLength(2);
    expect(result).toContain(
      'name="before" value="2026-10-27T09:00:00.123456+00:00"',
    );
    expect(result).toContain('name="beforeId"');
    expect(result).toContain("Older events");
    expect(result).not.toContain('type="password"');
    expect(result).not.toContain('name="token"');
  });
  it("distinguishes invalid, unavailable, empty and end of history", () => {
    expect(html({ page: null, invalid: true })).toContain(
      "page link is invalid",
    );
    expect(html({ page: null })).toContain("audit view is unavailable");
    expect(html({ page: { kind: "ready", items: [], next: null } })).toContain(
      "No recorded staff events",
    );
    expect(
      html({ page: { kind: "ready", items: [], next: null }, paginated: true }),
    ).toContain("No older events");
    expect(html({ page: null })).not.toContain(event.id);
  });
  it("labels staff suspension and no-op outcomes accurately", () => {
    const result = html({
      page: {
        kind: "ready",
        items: [
          {
            ...event,
            operation: "suspend",
            actor_id: id,
            value: "",
            outcome: "unchanged",
          },
        ],
        next: null,
      },
    });
    expect(result).toContain("Staff membership suspended");
    expect(result).toContain("No change");
  });
  it.each([
    { verified: false, audit: true },
    { verified: true, audit: false },
    {},
  ])(
    "does not expose audit navigation without both supplied gates %#",
    (props) =>
      expect(
        renderToStaticMarkup(<StaffFrame {...props}>Body</StaffFrame>),
      ).not.toContain('href="/admin/staff/audit"'),
  );
  it("offers audit navigation only for a verified capability-bearing frame", () =>
    expect(
      renderToStaticMarkup(
        <StaffFrame verified audit>
          Body
        </StaffFrame>,
      ),
    ).toContain('href="/admin/staff/audit"'));
});
