import { describe, expect, it } from "vitest";
import {
  normalizeGlossaryText,
  searchGlossary,
  type GlossaryEntry,
} from "./glossary-search";
import {
  getGlossaryReviewCatalogue,
  getPublicGlossaryCatalogue,
} from "../content/glossary-catalogue";
import draft from "../content/glossary-catalogue.draft.json";

const review = getGlossaryReviewCatalogue();
// Search eligibility fixtures; the archived source flags remain immutable.
const published = review.map((e) => ({
  ...e,
  status: "published" as const,
  approved: true,
  sourceReview: "verified" as const,
}));
const ids = (input: Parameters<typeof searchGlossary>[1]) =>
  searchGlossary(published, input).results.map((r) => r.entry.id);
describe("M17 private glossary catalogue after editorial approval", () => {
  it("keeps 242 Forex and 136 Crypto course-qualified unique identities", () => {
    expect(review).toHaveLength(378);
    expect(new Set(review.map((e) => e.id)).size).toBe(378);
    expect(review.filter((e) => e.course === "forex")).toHaveLength(242);
    expect(review.filter((e) => e.course === "crypto")).toHaveLength(136);
    for (const e of review) {
      expect(e.id).toBe(e.course + ":" + e.slug);
      expect(e.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(e.href).toBe(
        (e.course === "forex" ? "/glossary#" : "/glossary/crypto#") + e.slug,
      );
      expect(draft.categories).toContain(e.category);
      expect(e.name.trim().length).toBeGreaterThan(0);
      expect(e.meanings.length).toBeGreaterThan(0);
      for (const m of e.meanings)
        expect(m.definition.trim().length).toBeGreaterThan(0);
    }
  });
  it("exposes no draft, unapproved or unverified records publicly", () => {
    expect(getPublicGlossaryCatalogue()).toHaveLength(378);
    expect(searchGlossary(review).total).toBe(0);
    const e = published[0];
    for (const variant of [
      { ...e, status: "draft" as const },
      { ...e, approved: false },
      { ...e, sourceReview: "pending" as const },
    ])
      expect(searchGlossary([variant]).total).toBe(0);
    expect(draft.status).toBe("draft");
    expect(draft.approved).toBe(false);
    expect(
      review.every(
        (e) =>
          e.status === "draft" && !e.approved && e.sourceReview === "pending",
      ),
    ).toBe(true);
  });
  it("preserves both retained wording occurrences for Slashing and Wash trading", () => {
    for (const slug of ["slashing", "wash-trading"])
      expect(
        review.find((e) => e.id === "crypto:" + slug)?.meanings,
      ).toHaveLength(2);
    expect(
      review
        .filter((e) => e.course === "crypto")
        .reduce((n, e) => n + e.meanings.length, 0),
    ).toBe(138);
  });
  it("keeps all context links and related identities inside the saved baseline", () => {
    expect(draft.preservationBaseline).toHaveLength(89);
    for (const e of draft.entries) {
      for (const l of e.lessonLinks)
        expect(
          draft.preservationBaseline.some(
            (b) =>
              b.path === e.course && b.id === l.lessonId && b.href === l.href,
          ),
        ).toBe(true);
      for (const r of e.relatedEntries)
        expect(
          review.some((other) => other.id === r.id && other.id !== e.id),
        ).toBe(true);
    }
  });
  it("keeps qualified reading links and stronger approved context additions", () => {
    const clone = draft.entries.find((e) => e.id === "forex:clone-firm")!;
    expect(
      clone.lessonLinks.some(
        (l) =>
          l.lessonId === "spot-forex-scams-and-safety" &&
          l.relation === "related-context-not-full-definition",
      ),
    ).toBe(true);
    expect(
      clone.lessonLinks.some(
        (l) =>
          l.lessonId === "choosing-a-forex-provider" &&
          l.relation === "direct-teaching-context",
      ),
    ).toBe(true);
    expect(
      draft.entries
        .find((e) => e.id === "forex:two-factor-authentication")!
        .lessonLinks.every(
          (l) => l.relation === "related-context-not-full-definition",
        ),
    ).toBe(true);
  });
  it("keeps same-name course entries independent", () => {
    const result = searchGlossary(published, { q: "Drawdown" });
    expect(
      result.results
        .filter((r) => r.rank === 0)
        .map((r) => r.entry.course)
        .sort(),
    ).toEqual(["crypto", "forex"]);
    expect(ids({ q: "Drawdown", course: "forex" })).not.toContain(
      "crypto:drawdown",
    );
  });
});
describe("M17 Phase 1 deterministic query engine", () => {
  it("normalizes case, accents, whitespace and hyphen variants", () => {
    expect(normalizeGlossaryText("  DéFi—TOKEN  ")).toBe("defi token");
    expect(ids({ q: "STOP LOSS ORDER", course: "forex" })[0]).toBe(
      "forex:stop-loss-order",
    );
  });
  it("finds approved acronym and spelling proposals", () => {
    expect(ids({ q: "RSI", course: "forex" })[0]).toBe(
      "forex:relative-strength-index",
    );
    expect(ids({ q: "centralized exchange", course: "crypto" })[0]).toBe(
      "crypto:centralised-exchange-cex",
    );
  });
  it("labels component matches rather than asserting equivalence", () => {
    for (const q of ["KYC", "AML"])
      expect(
        searchGlossary(published, { q, course: "crypto" }).results[0].matchedBy,
      ).toBe("component");
    expect(
      searchGlossary(published, { q: "Memo", course: "crypto" }).results[0]
        .matchedBy,
    ).toBe("component");
  });
  it("ranks exact name, alias, component, prefix and definition predictably", () => {
    const base = published[0];
    const fixture = (
      name: string,
      id: string,
      definition: string,
      aliases: GlossaryEntry["aliases"] = [],
    ): GlossaryEntry => ({
      ...base,
      name,
      id,
      meanings: [{ definition }],
      aliases,
    });
    const rows = [
      fixture("Zebra", "definition", "test"),
      fixture("Test extra", "prefix", "none"),
      fixture("Elsewhere", "alias", "none", [
        { value: "test", kind: "alternate-label" },
      ]),
      fixture("Combined", "component", "none", [
        { value: "test", kind: "component-discovery-key" },
      ]),
      fixture("Test", "exact", "none"),
    ];
    expect(
      searchGlossary(rows, { q: "test" }).results.map((r) => r.entry.id),
    ).toEqual(["exact", "alias", "component", "prefix", "definition"]);
  });
  it("supports all, letter, course and category filters", () => {
    expect(searchGlossary(published).total).toBe(378);
    expect(searchGlossary(published, { course: "forex" }).total).toBe(242);
    const letter = searchGlossary(published, { letter: "p", course: "forex" });
    expect(letter.total).toBeGreaterThan(0);
    expect(
      letter.results.every((r) => r.entry.name.toLowerCase().startsWith("p")),
    ).toBe(true);
    const category = draft.categories[1];
    const filtered = searchGlossary(published, { course: "crypto", category });
    expect(filtered.total).toBeGreaterThan(0);
    expect(
      filtered.results.every(
        (r) => r.entry.category === category && r.entry.course === "crypto",
      ),
    ).toBe(true);
    expect(
      searchGlossary(published, { category: "missing-category" }).total,
    ).toBe(0);
  });
  it("lets a search override a letter without overriding course/category", () => {
    expect(ids({ q: "Pip", letter: "Z", course: "forex" })[0]).toBe(
      "forex:pip",
    );
    expect(
      searchGlossary(published, { q: "Pip", category: "missing-category" })
        .total,
    ).toBe(0);
  });
  it("handles repeated/invalid query parameters and bounded input safely", () => {
    expect(
      searchGlossary(published, {
        q: ["Pip"],
        letter: ["P"],
        category: ["missing"],
      }).total,
    ).toBe(378);
    expect(searchGlossary(published, { q: "x".repeat(300) }).query.length).toBe(
      200,
    );
    expect(searchGlossary(published, { letter: "<P>" }).total).toBe(378);
    expect(searchGlossary(published, { q: "***" }).total).toBe(0);
    expect(
      searchGlossary(published, { q: "<script>alert(1)</script>" }).total,
    ).toBe(0);
  });
  it("returns deterministic results, total counts and bounded limits without mutation", () => {
    const snapshot = JSON.stringify(published);
    const one = searchGlossary(published, { limit: 2 });
    const two = searchGlossary([...published].reverse(), { limit: 2 });
    expect(one.total).toBe(378);
    expect(one.results).toHaveLength(2);
    expect(one).toEqual(two);
    expect(JSON.stringify(published)).toBe(snapshot);
    expect(searchGlossary(published, { limit: 0 }).results).toHaveLength(1);
    expect(searchGlossary(published, { limit: NaN }).results).toHaveLength(378);
  });
  it("returns an empty-state result without correcting an unknown spelling", () => {
    expect(
      searchGlossary(published, { q: "pippette-not-a-term" }).results,
    ).toEqual([]);
  });
});

describe("M17 editorial content and discovery", () => {
  it("records wording approval separately from publication and source approval", () => {
    expect(draft.editorialReview.wordingApproved).toBe(true);
    expect(draft.editorialReview.publicationApproved).toBe(false);
    expect(draft.editorialReview.allSourcesVerified).toBe(false);
    expect(getPublicGlossaryCatalogue()).toHaveLength(378);
  });
  it("gives every Crypto entry an example while preserving multiple source meanings", () => {
    for (const entry of review.filter((entry) => entry.course === "crypto")) {
      expect(entry.meanings[0].example?.trim().length).toBeGreaterThan(0);
    }
    for (const id of ["crypto:slashing", "crypto:wash-trading"]) {
      expect(review.find((entry) => entry.id === id)?.meanings).toHaveLength(2);
    }
  });
  it("connects all 89 baseline lessons without changing their routes or reading keys", () => {
    const linked = new Set(
      draft.entries.flatMap((entry) =>
        entry.lessonLinks.map((link) => link.lessonId),
      ),
    );
    expect(linked.size).toBe(89);
    expect([...linked].sort()).toEqual(
      draft.preservationBaseline.map((lesson) => lesson.id).sort(),
    );
    for (const lesson of draft.preservationBaseline) {
      expect(lesson.readingKey).toMatch(/^pipstart:reading:v1:/);
    }
  });
  it("finds approved additions through test-only published fixtures", () => {
    for (const [query, id] of [
      ["ETH", "crypto:ether"],
      ["DEX", "crypto:decentralised-exchange"],
      ["APR", "crypto:annual-percentage-rate"],
      ["APY", "crypto:annual-percentage-yield"],
      ["BTC", "crypto:bitcoin"],
      ["bps", "forex:basis-point"],
    ]) {
      expect(ids({ q: query })[0]).toBe(id);
    }
    expect(searchGlossary(review, { q: "ETH" }).total).toBe(0);
  });
  it("keeps related concepts and component labels distinct from synonyms", () => {
    const lot = searchGlossary(published, {
      q: "lot",
      course: "forex",
    }).results.find((row) => row.entry.id === "forex:lot-or-position-size");
    expect(lot?.matchedBy).toBe("component");
    const target = draft.entries.find((entry) => entry.id === "crypto:target")!;
    expect(target.category).toBe("Networks and consensus");
    expect(target.meanings[0].definition).toContain("less than or equal to");
    expect(
      draft.entries.find((entry) => entry.id === "forex:target")!.category,
    ).toBe("Risk, exposure and portfolios");
  });
});
