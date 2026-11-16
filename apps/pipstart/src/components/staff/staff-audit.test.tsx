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
    // MP10f: the filter form, Reload and Older events are all native GET forms.
    expect(result.match(/method="get"/g)).toHaveLength(3);
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
      "page link or filter is invalid",
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
describe("MP10f audit filters and content view", () => {
  const query = {
    source: "content" as const,
    operation: "maintenance",
    actor: null,
    item: "crypto-start-here",
    from: "2026-11-01",
    to: null,
    cursor: null,
  };
  const contentPage = {
    kind: "ready" as const,
    items: [
      {
        id: "00000000-0000-4000-8000-000000000002",
        created_at: "2026-11-16T16:58:00.123456+00:00",
        actor_id: "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
        operation: "maintenance" as const,
        item_id: "crypto-start-here",
        revision_no: 1,
        action: "acknowledge" as const,
      },
    ],
    next: {
      before: "2026-11-16T16:58:00.123456+00:00",
      beforeId: "00000000-0000-4000-8000-000000000002",
    },
  };
  it("shows content events with the maintenance action, never reasons", () => {
    const result = html({ page: null, contentPage, query });
    expect(result).toContain("Content and maintenance audit events");
    expect(result).toContain("Maintenance: acknowledged");
    expect(result).toContain("crypto-start-here");
    expect(result).toContain("Reasons and other free text are not shown here");
    expect(result).not.toContain("Staff governance audit events");
  });
  it("keeps the filters on the paging forms and pre-fills the filter form", () => {
    const result = html({ page: null, contentPage, query });
    expect(result.match(/name="source" value="content"/g)).toHaveLength(2);
    expect(
      result.match(/name="item" value="crypto-start-here"/g)?.length,
    ).toBeGreaterThanOrEqual(2);
    expect(result).toContain('name="from" value="2026-11-01"');
    expect(result).toContain('value="maintenance" selected=""');
    expect(result).toContain("Older events");
    expect(result).toContain('href="/admin/staff/audit"');
  });
  it("lists only the actions of the chosen records type", () => {
    expect(html({ page: null, contentPage, query })).toContain(">Made live<");
    expect(html({ page: null, contentPage, query })).not.toContain(
      ">Role granted<",
    );
    expect(html({ page: { kind: "ready", items: [], next: null } })).toContain(
      ">Role granted<",
    );
  });
});
