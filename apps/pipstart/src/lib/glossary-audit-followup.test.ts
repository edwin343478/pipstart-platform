import { describe, expect, it } from "vitest";
import draft from "../content/glossary-catalogue.draft.json";
import { searchGlossary, type GlossaryEntry } from "./glossary-search";
import {
  integrateApprovedGlossary,
  assertApprovedGlossaryCoverage,
} from "./glossary-publication";
import {
  glossaryDisplayTerm,
  glossaryBrowseSelection,
} from "./glossary-presentation";
import {
  assertGlossaryEntries,
  canonicalGlossaryJson,
} from "./glossary-contract";
const approved = draft.entries.map((e) => ({
  ...e,
  status: "published",
  approved: true,
  sourceReview: "verified",
})) as GlossaryEntry[];
const lessons = draft.preservationBaseline.map((l) => ({
  id: l.id,
  learningPath: l.path as "forex" | "crypto",
  href: l.href,
  title: l.id,
}));
const integrated = integrateApprovedGlossary([], approved, lessons);
const ids = (q: string) =>
  searchGlossary(approved, { q }).results.map((r) => r.entry.id);
describe("M17 audit follow-up contracts", () => {
  it("matches query words without matching unrelated word interiors", () => {
    expect(ids("ether")).toContain("crypto:ether");
    const fixture = {
      ...approved[0],
      name: "Unrelated",
      aliases: [],
      meanings: [{ definition: "Together we decide whether to start." }],
    };
    expect(searchGlossary([fixture], { q: "ether" }).total).toBe(0);
    expect(ids("dex")).not.toContain("forex:relative-strength-index");
    expect(ids("pips")).toContain("forex:pip");
    expect(ids("account equity")).toContain("forex:equity");
    expect(ids("equity account")).toContain("forex:equity");
    expect(ids("swpa")).toContain("forex:currency-swap");
    expect(ids("bitcion")).toContain("crypto:bitcoin");
  });
  it("preserves related-context qualifications and only sends display fields", () => {
    const term = integrated.find(
      (e) => e.id === "forex:two-factor-authentication",
    )!;
    expect(
      term.meanings
        .flatMap((m) => m.lessons)
        .every((l) => l.relation === "related-context-not-full-definition"),
    ).toBe(true);
    const display = glossaryDisplayTerm(term);
    expect(Object.keys(display).sort()).toEqual(
      [
        "id",
        "course",
        "slug",
        "name",
        "href",
        "meanings",
        "relatedTerms",
      ].sort(),
    );
    expect(display.meanings[0].definition).toBe(term.meanings[0].definition);
    expect(
      JSON.stringify(integrated.map(glossaryDisplayTerm)).length,
    ).toBeLessThan(JSON.stringify(integrated).length * 0.6);
    expect(
      Object.keys(
        glossaryBrowseSelection({ ...searchGlossary(approved) }),
      ).sort(),
    ).toEqual(["query", "course", "category", "letter"].sort());
  });
  it("rejects a legacy replacement even when counts and meanings match", () => {
    expect(() =>
      assertApprovedGlossaryCoverage(integrated, approved),
    ).not.toThrow();
    const changed = integrated.map((e) =>
      e.id === "crypto:gas"
        ? { ...e, publicationBasis: "existing-public-glossary" as const }
        : e,
    );
    expect(() => assertApprovedGlossaryCoverage(changed, approved)).toThrow(
      "crypto:gas",
    );
    expect(() =>
      assertApprovedGlossaryCoverage(
        [...integrated.slice(1), integrated[1]],
        approved,
      ),
    ).toThrow();
  });
  it("validates catalogue shape and retains the digest contract", () => {
    expect(() => assertGlossaryEntries(draft.entries)).not.toThrow();
    expect(() =>
      assertGlossaryEntries([{ ...draft.entries[0], meanings: null }]),
    ).toThrow();
    expect(() =>
      assertGlossaryEntries([draft.entries[0], draft.entries[0]]),
    ).toThrow();
    expect(canonicalGlossaryJson({ b: [2, 1], a: true })).toBe(
      '{"a":true,"b":[2,1]}',
    );
  });
});
