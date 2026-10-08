import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import draft from "../content/glossary-catalogue.draft.json";
import status from "../content/glossary-review-status.json";
import { publishedLessons } from "../content/lesson-registry";
import { getPublishedCourseGlossary } from "../content/published-glossary";
import {
  getDisplayedCourseGlossary,
  getGlossaryPageMetadata,
  isGlossaryReviewMode,
} from "../content/glossary-display";
import { buildReviewedGlossaryPreview } from "../lib/glossary-reviewed-preview";
import type { GlossaryEntry } from "../lib/glossary-search";
import Glossary, { generateMetadata as bothMetadata } from "./glossary/page";
import Crypto, {
  generateMetadata as cryptoMetadata,
} from "./glossary/crypto/page";
import Search, {
  generateMetadata as searchMetadata,
} from "./glossary/search/page";
import { GlossaryTeaching } from "../components/glossary-teaching";
const catalogue = () => ({
  status: draft.status,
  approved: draft.approved,
  entries: draft.entries as readonly GlossaryEntry[],
});
const render = async (page: typeof Glossary, params = {}) =>
  renderToStaticMarkup(await page({ searchParams: Promise.resolve(params) }));
beforeEach(() => vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "0"));
afterEach(() => vi.unstubAllEnvs());
describe("M17 reviewed catalogue integration with personally approved release", () => {
  it("publishes the approved inventory while preserving historical editorial flags", () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    expect(getPublishedCourseGlossary("forex")).toHaveLength(242);
    expect(getPublishedCourseGlossary("crypto")).toHaveLength(136);
    expect(draft.status).toBe("draft");
    expect(draft.approved).toBe(false);
    expect(
      draft.entries.every(
        (e) =>
          e.status === "draft" && !e.approved && e.sourceReview === "pending",
      ),
    ).toBe(true);
  });
  it("requires the exact explicit environment setting, not a loose truthy value", () => {
    for (const value of ["0", "true", "yes", "01", ""]) {
      vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", value);
      expect(isGlossaryReviewMode()).toBe(false);
      expect(getDisplayedCourseGlossary("forex")).toHaveLength(242);
    }
  });
  it("projects every exact approved definition, example and caution", () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    const all = [
      ...getDisplayedCourseGlossary("forex"),
      ...getDisplayedCourseGlossary("crypto"),
    ];
    expect(all).toHaveLength(378);
    expect(all.reduce((n, e) => n + e.meanings.length, 0)).toBe(380);
    expect(getDisplayedCourseGlossary("forex")).toHaveLength(242);
    expect(getDisplayedCourseGlossary("crypto")).toHaveLength(136);
    for (const e of draft.entries) {
      const view = all.find((x) => x.id === e.id)!;
      expect(view).toBeDefined();
      expect(view.href).toBe(e.href);
      expect(view.aliases).toEqual(e.aliases);
      expect(view.category).toBe(e.category);
      expect(view.publicationBasis).toBe("reviewed-glossary-preview");
      for (const [i, m] of e.meanings.entries()) {
        expect(view.meanings[i].definition).toBe(m.definition);
        expect(view.meanings[i].example).toBe(m.example);
        expect(view.meanings[i].confusionNote).toBe(
          "confusionNote" in m ? m.confusionNote : undefined,
        );
      }
    }
  });
  it("preserves per-meaning Slashing and Wash trading lesson contexts", () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    for (const id of ["crypto:slashing", "crypto:wash-trading"]) {
      const e = draft.entries.find((x) => x.id === id)!,
        view = getDisplayedCourseGlossary("crypto").find((x) => x.id === id)!;
      expect(view.meanings).toHaveLength(2);
      for (const [i, m] of e.meanings.entries())
        if ("lessons" in m)
          expect(view.meanings[i].lessons.map((l) => l.href)).toEqual(
            m.lessons!.map((l) => l.href),
          );
    }
  });
  it("rejects missing review approval, mismatched digest and unresolved corrections", () => {
    for (const mutation of [
      { wordingApproved: false },
      { sourceReviewCompleteWithScope: false },
      { catalogueDigest: "0".repeat(64) },
      { unresolvedWordingCorrections: 1 },
      { publicationApproved: true },
      { entryCount: 377 },
    ])
      expect(
        buildReviewedGlossaryPreview(
          catalogue(),
          publishedLessons,
          { ...status, ...mutation },
          status.catalogueDigest,
        ),
      ).toEqual([]);
  });
  it("rejects a projection with an invalid lesson target instead of silently dropping a term", () => {
    const c = structuredClone(catalogue());
    c.entries[0].lessonLinks = [
      {
        lessonId: "missing",
        href: "/learn/forex/missing",
        relation: "primary",
      },
    ];
    expect(
      buildReviewedGlossaryPreview(
        c,
        publishedLessons,
        status,
        status.catalogueDigest,
      ),
    ).toEqual([]);
  });
  it("keeps all review routes out of indexing and restores normal metadata outside review", () => {
    expect(getGlossaryPageMetadata()).toEqual({
      robots: { index: true, follow: true },
    });
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    for (const metadata of [bothMetadata, cryptoMetadata, searchMetadata])
      expect(metadata()).toEqual({ robots: { index: false, follow: false } });
  });
  it("renders full counts while keeping the first visible batch bounded", async () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    const body = await render(Glossary);
    expect(body).toContain("378 terms available");
    expect(body).toContain("Showing 12 of 378 matching terms");
    expect(body.match(/<article\b/g)).toHaveLength(378);
    expect(body.match(/<article\b[^>]*\bhidden=""/g)).toHaveLength(366);
    expect(body).not.toContain("Search Forex and Crypto</a>");
  });
  it("renders new Forex terms and their examples through the existing teaching blocks", async () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    const body = await render(Glossary, { course: "forex", q: "RSI" });
    expect(body).toContain('id="relative-strength-index"');
    expect(body).toContain("<strong>Example: </strong>");
    const term = getDisplayedCourseGlossary("crypto").find(
      (e) => e.id === "crypto:slashing",
    )!;
    const teaching = renderToStaticMarkup(<GlossaryTeaching term={term} />);
    expect(teaching).toContain("In Ethereum proof of stake");
    expect(teaching).toContain("Read in context:");
  });
  it("renders reviewed crypto and combined search with full public defaults", async () => {
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "1");
    expect(await render(Crypto)).toContain("136 terms available");
    expect(await render(Search, { q: "RSI", course: "forex" })).toContain(
      'id="relative-strength-index"',
    );
    vi.stubEnv("PIPSTART_M17_GLOSSARY_REVIEW", "0");
    expect(await render(Glossary)).toContain("378 terms available");
    expect(await render(Glossary, { course: "forex", q: "RSI" })).toContain(
      'id="relative-strength-index"',
    );
  });
});
