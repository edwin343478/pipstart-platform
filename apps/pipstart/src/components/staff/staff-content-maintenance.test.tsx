import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/admin/staff/maintenance/actions", () => ({
  runMaintenanceAction: vi.fn(),
}));
import { StaffContentMaintenance } from "./staff-content-maintenance";
import { StaffFrame } from "./staff-frame";
import type { WorklistItem } from "@/lib/content/maintenance-contract";

const me = "d1000000-0000-4000-8000-000000000001";
const item = (patch: Partial<WorklistItem> = {}): WorklistItem => ({
  id: "ma-lesson",
  family: "lesson",
  title: "Reading candles",
  revision: 2,
  reviewedOn: null,
  contentDue: null,
  due: null,
  rescheduled: false,
  status: "no_review",
  acknowledged: null,
  assignedToMe: true,
  assignee: null,
  ...patch,
});
const render = (
  props: Partial<Parameters<typeof StaffContentMaintenance>[0]>,
) =>
  renderToStaticMarkup(
    <StaffContentMaintenance
      view="mine"
      filters={{ status: null, family: null, after: "" }}
      page={{
        worklist: { items: [item()], next: null },
        intervals: null,
        allowlist: null,
        staff: null,
      }}
      report={null}
      me={me}
      owner={false}
      editor={false}
      {...props}
    />,
  );

describe("MP10c Maintenance page", () => {
  it("shows an assignee their item with actions, never as a review", () => {
    const html = render({});
    expect(html).toContain("Reading candles");
    expect(html).toContain("No review on record");
    expect(html).toContain("Acknowledge");
    expect(html).toContain("It stays due; it is not a review.");
    expect(html).toContain("Record a manual check");
    expect(html).not.toContain("Maintenance owner</h3>");
    expect(html).not.toContain("Due and overdue");
  });
  it("gives the Owner the staff picker, names and the wider view", () => {
    const html = render({
      view: "all",
      owner: true,
      page: {
        worklist: {
          items: [
            item({
              assignedToMe: false,
              assignee: "d1000000-0000-4000-8000-000000000002",
              status: "overdue",
              due: "2026-10-01",
            }),
          ],
          next: "ma-lesson",
        },
        intervals: null,
        allowlist: null,
        staff: [
          { id: "d1000000-0000-4000-8000-000000000002", name: "Mod One" },
        ],
      },
    });
    expect(html).toContain("Due and overdue");
    expect(html).toContain("Overdue");
    expect(html).toContain("Mod One");
    expect(html).toContain("Assign to");
    expect(html).toContain("Remove maintenance owner");
    expect(html).toContain("after=ma-lesson");
  });
  it("offers an Editor only Assign to me", () => {
    const html = render({
      view: "all",
      editor: true,
      page: {
        worklist: { items: [item({ assignedToMe: false })], next: null },
        intervals: null,
        allowlist: null,
        staff: null,
      },
    });
    expect(html).toContain("Assign to me");
    expect(html).not.toContain("Assign to</label>");
    expect(html).not.toContain("Record a manual check");
  });
  it("fails closed when the list cannot be read", () => {
    expect(
      render({
        page: { worklist: null, intervals: null, allowlist: null, staff: null },
      }),
    ).toContain("The maintenance list could not be read.");
  });
  it("reports the live generation's internal references", () => {
    expect(
      render({
        view: "report",
        report: { kind: "ready", generation: 10, items: 162, lines: [] },
      }),
    ).toContain("No missing internal pages, images, parents or quiz targets.");
    const broken = render({
      view: "report",
      report: {
        kind: "ready",
        generation: 11,
        items: 3,
        lines: ["l1: blocks[0].src uses an image that does not exist: /x.svg"],
      },
    });
    expect(broken).toContain("live generation 11");
    expect(broken).toContain("/x.svg");
    expect(render({ view: "report", report: { kind: "code" } })).toContain(
      "reads content from code",
    );
  });
  it("shows the policy; only the Owner can change it or see the allowlist", () => {
    const page = {
      worklist: null,
      intervals: [
        {
          family: "lesson" as const,
          version: 1,
          days: 365,
          setAt: "2026-11-16T10:00:00Z",
        },
      ],
      allowlist: [{ host: "docs.example.org", since: "2026-11-16T10:00:00Z" }],
      staff: null,
    };
    const owner = render({ view: "policy", owner: true, page });
    expect(owner).toContain("365 days");
    expect(owner).toContain("Save interval");
    expect(owner).toContain("docs.example.org");
    const staff = render({ view: "policy", page });
    expect(staff).toContain("365 days");
    expect(staff).not.toContain("Save interval");
    expect(staff).not.toContain("docs.example.org");
  });
  it("adds Maintenance to the staff navigation only when allowed", () => {
    expect(
      renderToStaticMarkup(
        <StaffFrame verified maintenance>
          x
        </StaffFrame>,
      ),
    ).toContain('href="/admin/staff/maintenance"');
    expect(
      renderToStaticMarkup(<StaffFrame verified>x</StaffFrame>),
    ).not.toContain("/admin/staff/maintenance");
    expect(
      renderToStaticMarkup(
        <StaffFrame verified paused maintenance>
          x
        </StaffFrame>,
      ),
    ).not.toContain("/admin/staff/maintenance");
  });
});
