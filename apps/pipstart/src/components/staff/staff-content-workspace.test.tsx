import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/actions", () => ({
  readEditorialWorkspaceAction: vi.fn(),
}));
import {
  ContentRevisionDetail,
  StaffContentWorkspace,
} from "./staff-content-workspace";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
describe("approved library presentation with real data only", () => {
  it("uses labelled filters, native pagination and honest page counts", () => {
    const html = renderToStaticMarkup(
      <StaffContentWorkspace
        initialPage={{
          rows: [
            {
              id: "module-1",
              family: "module",
              learning_path: "forex",
              category: null,
              parent_id: "course-1",
              latest_revision: 2,
              state: "approved",
              trashed: false,
            },
          ],
          next: null,
        }}
      />,
    );
    expect(html).toContain('for="content-family"');
    expect(html).toContain('for="content-query"');
    expect(html).toContain("1 shown from 1 permitted items on this page");
    expect(html).toContain("module-1");
    expect(html).toContain("View latest revision of module-1");
    expect(html).toContain("Previous page");
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("Grace Njeri");
    expect(html).not.toContain("New lesson");
  });
  it("shows an unavailable list without a sample-data fallback", () => {
    const html = renderToStaticMarkup(
      <StaffContentWorkspace initialPage={null} />,
    );
    expect(html).toContain("No current list loaded");
    expect(html).toContain("Reload list");
    expect(html).not.toContain("Bid, ask and spread");
  });
  it("escapes titles/notes and distinguishes import provenance from review or public publication", () => {
    const detail: WorkspaceDetail = {
      id: "lesson-1",
      family: "lesson",
      path: "forex",
      parent: "module-1",
      title: "<script>title</script>",
      revision: 2,
      bodySha256: "a".repeat(64),
      state: "approved",
      trashed: false,
      onHold: false,
      authorIsMe: false,
      reviewRequired: false,
      createdAt: "2026-10-30T12:00:00Z",
      decisions: [
        {
          kind: "imported",
          note: "<b>note</b>",
          byMe: false,
          at: "2026-10-30T12:00:00Z",
        },
      ],
    };
    const html = renderToStaticMarkup(
      <ContentRevisionDetail detail={detail} />,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;note&lt;/b&gt;");
    expect(html).toContain("not a new human review");
    expect(html).toContain("does not make a revision live");
    expect(html).not.toContain("<script>");
  });
});
