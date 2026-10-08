import { describe, expect, it } from "vitest";
import {
  integrateApprovedGlossary,
  type PublishedGlossaryEntry,
  type GlossaryLessonContext,
} from "./glossary-publication";
import { searchGlossary, type GlossaryEntry } from "./glossary-search";
import draft from "../content/glossary-catalogue.draft.json";
const lessons: GlossaryLessonContext[] = draft.preservationBaseline.map(
  (l) => ({
    id: l.id,
    learningPath: l.path as "forex" | "crypto",
    href: l.href,
    title: l.id,
  }),
);
const approved: GlossaryEntry[] = draft.entries.map((e) => ({
  ...e,
  course: e.course as "forex" | "crypto",
  status: "published" as const,
  approved: true,
  sourceReview: "verified" as const,
}));
const legacy: PublishedGlossaryEntry = {
  id: "forex:pip",
  course: "forex",
  slug: "pip",
  name: "Pip",
  href: "/glossary#pip",
  status: "published",
  approved: true,
  sourceReview: "verified",
  category: "Existing category",
  aliases: [],
  meanings: [{ definition: "Existing published definition", lessons: [] }],
  publicationBasis: "existing-public-glossary",
};
const result = (q: string, entries: readonly GlossaryEntry[] = approved) =>
  searchGlossary(entries, { q });
describe("M17 gated glossary integration and typo tolerance", () => {
  it("leaves legacy content intact when no catalogue release is authorized", () => {
    expect(integrateApprovedGlossary([legacy], [], lessons)).toEqual([legacy]);
    expect(draft.status).toBe("draft");
    expect(draft.approved).toBe(false);
  });
  it("rejects every unapproved entry variant even if supplied by a caller", () => {
    const e = approved.find((e) => e.id === "forex:pip")!;
    for (const change of [
      { status: "draft" as const },
      { approved: false },
      { sourceReview: "pending" as const },
    ])
      expect(
        integrateApprovedGlossary([legacy], [{ ...e, ...change }], lessons),
      ).toEqual([legacy]);
  });
  it("integrates all 378 test-only approved entries with examples and notes", () => {
    const all = integrateApprovedGlossary([], approved, lessons);
    expect(all).toHaveLength(378);
    const pip = all.find((e) => e.id === "forex:pip")!;
    expect(pip.meanings[0].example).toContain("1.1001");
    expect(pip.meanings[0].confusionNote).toContain("distance");
    expect(pip.publicationBasis).toBe("approved-glossary-catalogue");
  });
  it("preserves separate per-meaning Slashing and Wash trading contexts", () => {
    for (const slug of ["slashing", "wash-trading"]) {
      const e = approved.find((e) => e.id === "crypto:" + slug)!;
      const [actual] = integrateApprovedGlossary([], [e], lessons);
      expect(actual.meanings).toHaveLength(2);
      actual.meanings.forEach((m, i) =>
        expect(m.lessons.map((l) => l.href)).toEqual(
          e.meanings[i].lessons?.map((l) => l.href),
        ),
      );
      expect(actual.meanings[0].lessons).not.toEqual(
        actual.meanings[1].lessons,
      );
    }
  });
  it("does not publish an unresolved lesson context", () => {
    const e = approved.find((e) => e.id === "forex:pip")!;
    expect(integrateApprovedGlossary([legacy], [e], [])).toEqual([legacy]);
  });
  it("rejects unsafe term destinations and mismatched meaning context", () => {
    const e = approved.find((e) => e.id === "forex:pip")!;
    expect(
      integrateApprovedGlossary(
        [legacy],
        [{ ...e, href: "javascript:alert(1)" }],
        lessons,
      ),
    ).toEqual([legacy]);
    expect(
      integrateApprovedGlossary(
        [],
        [
          {
            ...e,
            meanings: [
              {
                definition: "test",
                lessons: [{ href: "/learn/private", title: "private" }],
              },
            ],
          },
        ],
        lessons,
      ),
    ).toEqual([]);
  });
  it("links only available related entries and preserves their canonical anchors", () => {
    const e = approved.find((e) => e.id === "forex:position-size")!;
    const [alone] = integrateApprovedGlossary([], [e], lessons);
    expect(alone.relatedTerms).toEqual([]);
    const all = integrateApprovedGlossary([], approved, lessons);
    const a = all.find((e) => e.id === "forex:position-size")!;
    expect(a.relatedTerms?.map((t) => t.id)).toContain("forex:position-sizing");
    expect(
      a.relatedTerms?.every((t) =>
        all.some((e) => e.id === t.id && e.href === t.href),
      ),
    ).toBe(true);
  });
  it("offers one-character edits and adjacent transpositions as fallback", () => {
    expect(result("bitcion").results.map((r) => r.entry.id)).toContain(
      "crypto:bitcoin",
    );
    expect(result("bitcion").usedTypoTolerance).toBe(true);
    expect(result("pippette").results.map((r) => r.entry.id)).toContain(
      "forex:pipette",
    );
  });
  it("keeps direct matches ahead of typo candidates", () => {
    const r = result("bitcoin");
    expect(r.results[0].entry.id).toBe("crypto:bitcoin");
    expect(r.usedTypoTolerance).toBe(false);
  });
  it("does not fuzzy-match private names, components or definitions", () => {
    expect(
      result("bitcion", draft.entries as readonly GlossaryEntry[]).total,
    ).toBe(0);
    const e = {
      ...legacy,
      name: "Unrelated",
      aliases: [{ value: "bitcoin", kind: "component-discovery-key" }],
      meanings: [{ definition: "bitcoin is mentioned here" }],
    };
    expect(result("bitcion", [e]).total).toBe(0);
  });
  it("honours course/category boundaries for spelling suggestions", () => {
    expect(
      searchGlossary(approved, { q: "bitcion", course: "forex" }).total,
    ).toBe(0);
    const category = approved.find((e) => e.id === "crypto:bitcoin")!.category;
    expect(
      searchGlossary(approved, { q: "bitcion", category }).results.some(
        (r) => r.entry.id === "crypto:bitcoin",
      ),
    ).toBe(true);
    expect(
      searchGlossary(approved, { q: "bitcion", category: "missing" }).total,
    ).toBe(0);
  });
  it("bounds fuzzy input and leaves punctuation and short queries empty", () => {
    for (const q of ["***", "zz", "z".repeat(200)])
      expect(result(q).total).toBe(0);
  });
});
