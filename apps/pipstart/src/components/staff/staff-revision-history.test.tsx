import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/history-actions", () => ({
  readRevisionHistoryAction: vi.fn(),
}));
import {
  RevisionComparisonView,
  StaffRevisionHistory,
} from "./staff-revision-history";
const at = "2026-11-02T10:00:00.000Z";
const result = (lines = true) => ({
  kind: "compare" as const,
  id: "lesson-1",
  from: {
    revision: 2,
    state: "superseded" as const,
    bodySha256: "a".repeat(64),
    createdAt: at,
  },
  to: {
    revision: 3,
    state: "draft" as const,
    bodySha256: "b".repeat(64),
    createdAt: at,
  },
  comparison: {
    fields: [{ label: "Title", before: "<b>Old</b>", after: "" }],
    lines: lines
      ? [
          {
            op: "removed" as const,
            position: 2,
            label: "Paragraph",
            text: "Two",
          },
          {
            op: "added" as const,
            position: 2,
            label: "Paragraph",
            text: "Two, edited",
          },
        ]
      : [],
    unchangedLines: 4,
    truncated: lines,
  },
});
describe("read-only revision history presentation", () => {
  it("starts with one explicit load action and no automatic read", () => {
    const html = renderToStaticMarkup(
      <StaffRevisionHistory id="lesson-1" latestRevision={3} />,
    );
    expect(html).toContain("Revision history");
    expect(html).toContain("Show revision history");
    expect(html).toContain('role="status"');
    expect(html).not.toContain("Compare with latest");
    expect(html).not.toMatch(/Save|Publish|Approve|Restore/);
  });
  it("labels field and content changes, escaping stored text", () => {
    const html = renderToStaticMarkup(
      <RevisionComparisonView result={result()} />,
    );
    expect(html).toContain("Changes from revision 2 to revision 3");
    expect(html).toContain("&lt;b&gt;Old&lt;/b&gt;");
    expect(html).not.toContain("<b>Old</b>");
    expect(html).toContain("(empty)");
    expect(html).toContain("Removed");
    expect(html).toContain("Added");
    expect(html).toContain("2 content changes; 4 unchanged");
    expect(html).toContain("Only the first 2 changes are shown");
    expect(html).toMatch(/<caption[^>]*>Field changes from revision 2 to 3/);
  });
  it("says plainly when nothing changed", () => {
    const html = renderToStaticMarkup(
      <RevisionComparisonView
        result={{
          ...result(false),
          comparison: { ...result(false).comparison, fields: [] },
        }}
      />,
    );
    expect(html).toContain("No field changed.");
    expect(html).toContain("No content changed (4 unchanged).");
    expect(html).not.toContain("<ol");
  });
});
