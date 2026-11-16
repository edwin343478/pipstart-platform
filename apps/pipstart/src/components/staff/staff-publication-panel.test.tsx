import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ action: vi.fn() }));
vi.mock("@/app/admin/staff/content/publication-actions", () => ({
  runPublicationAction: mocks.action,
  runPublicationDeliveryAction: mocks.action,
  runPublicationScheduleAction: mocks.action,
}));
import {
  liveSummary,
  StaffItemPublication,
  StaffLivePublication,
  referencesMessage,
} from "./staff-publication-panel";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";

const detail: WorkspaceDetail = {
  id: "post-1",
  family: "analysis",
  path: null as unknown as WorkspaceDetail["path"],
  parent: null,
  title: "Post",
  revision: 2,
  bodySha256: "a".repeat(64),
  state: "approved",
  trashed: false,
  onHold: false,
  authorIsMe: true,
  reviewRequired: false,
  createdAt: "2026-11-06T10:00:00Z",
  decisions: [],
};

describe("M22 MP08b1 Publication panels", () => {
  it("summarizes the live generation and its delivery state in plain language", () => {
    expect(liveSummary(null)).toBe("Live status not loaded.");
    expect(
      liveSummary({ generation: null, refresh: null, published: null }),
    ).toContain("Nothing is live from the store yet");
    expect(
      liveSummary({
        generation: 4,
        refresh: { state: "failed", attempts: 2, updatedAt: "x" },
        published: null,
      }),
    ).toBe(
      "Live generation 4: delivery failed; check the live site before retrying.",
    );
    expect(
      liveSummary({
        generation: 5,
        refresh: { state: "verified", attempts: 1, updatedAt: "x" },
        published: null,
      }),
    ).toBe("Live generation 5: verified on the live site.");
  });
  it("renders the library summary and the item panel without sending anything during render", () => {
    const html = renderToStaticMarkup(
      <>
        <StaffLivePublication isOwner />
        <StaffItemPublication detail={detail} canPublish onChanged={() => {}} />
      </>,
    );
    expect(html).toContain("Live publication");
    expect(html).toContain(
      "Learner pages change only when a new generation is delivered",
    );
    expect(html.match(/Live status not loaded\./g)).toHaveLength(2);
    expect(html).toContain('aria-live="polite"');
    // Buttons appear only once the live status is known.
    expect(html).not.toContain("Make revision 2 live");
    expect(html).not.toContain("Create the live baseline");
    expect(mocks.action).not.toHaveBeenCalled();
  });
});

describe("MP10b reference refusal message", () => {
  it("lists the missing targets one per line and counts the rest", () => {
    expect(
      referencesMessage({
        total: 3,
        references: [
          "blocks[0].href links to a page that does not exist: /tools/gone",
        ],
      }).split("\n"),
    ).toEqual([
      "This revision points at pages or images this site does not have. Fix them in the editor first. Nothing was changed.",
      "blocks[0].href links to a page that does not exist: /tools/gone",
      "…and 2 more.",
    ]);
  });
});
