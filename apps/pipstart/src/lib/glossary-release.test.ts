import { describe, it, expect } from "vitest";
import draft from "../content/glossary-catalogue.draft.json";
import review from "../content/glossary-review-status.json";
import release from "../content/glossary-release-status.json";
import { releaseGlossaryEntries } from "./glossary-release";
import type { GlossaryEntry } from "./glossary-search";
const catalogue = {
  status: draft.status,
  approved: draft.approved,
  entries: draft.entries as readonly GlossaryEntry[],
};
describe("personally approved glossary release", () => {
  it("promotes all exact approved fields without mutating historical evidence", () => {
    const snapshot = JSON.stringify(draft);
    const entries = releaseGlossaryEntries(
      catalogue,
      review,
      release,
      release.catalogueDigest,
    );
    expect(entries).toHaveLength(378);
    expect(entries.reduce((n, e) => n + e.meanings.length, 0)).toBe(380);
    for (const [i, e] of entries.entries())
      expect(e).toEqual({
        ...draft.entries[i],
        status: "published",
        approved: true,
        sourceReview: "verified",
      });
    expect(JSON.stringify(draft)).toBe(snapshot);
  });
  it("keeps the public release closed without explicit approval", () => {
    expect(
      releaseGlossaryEntries(
        catalogue,
        review,
        { ...release, publicationApproved: false },
        release.catalogueDigest,
      ),
    ).toEqual([]);
  });
  it("rejects missing personal approval and mismatched release records", () => {
    for (const mutation of [
      { personalReviewApproved: false },
      { catalogueDigest: "0".repeat(64) },
      { entryCount: 377 },
      { meaningCount: 378 },
      { scope: "local-review-only" },
    ])
      expect(() =>
        releaseGlossaryEntries(
          catalogue,
          review,
          { ...release, ...mutation },
          release.catalogueDigest,
        ),
      ).toThrow();
  });
  it("rejects unreviewed, edited or incomplete source snapshots", () => {
    for (const mutation of [
      { wordingApproved: false },
      { sourceReviewCompleteWithScope: false },
      { unresolvedWordingCorrections: 1 },
    ])
      expect(() =>
        releaseGlossaryEntries(
          catalogue,
          { ...review, ...mutation },
          release,
          release.catalogueDigest,
        ),
      ).toThrow();
    expect(() =>
      releaseGlossaryEntries(catalogue, review, release, "0".repeat(64)),
    ).toThrow();
    expect(() =>
      releaseGlossaryEntries(
        { ...catalogue, entries: catalogue.entries.slice(1) },
        review,
        release,
        release.catalogueDigest,
      ),
    ).toThrow();
  });
});
