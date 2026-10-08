import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Glossary from "./glossary/page";
import Crypto from "./glossary/crypto/page";
import Search from "./glossary/search/page";
import type { GlossaryRouteParams } from "../lib/glossary-route-search";
const html = async (page: typeof Glossary, params: GlossaryRouteParams = {}) =>
  renderToStaticMarkup(await page({ searchParams: Promise.resolve(params) }));
const visible = (body: string) =>
  (body.match(/<article\b[^>]*>/g) ?? []).filter(
    (tag) => !tag.includes(' hidden=""'),
  );
describe("glossary grouping and progressive display", () => {
  it("defaults to both paths and reports the real public total", async () => {
    const body = await html(Glossary);
    expect(body).toContain("378 terms available");
    expect(body).toContain("Showing 12 of 378 matching terms");
    expect(visible(body)).toHaveLength(12);
    expect(body).toContain('id="spread"');
    expect(body).toContain('id="crypto-spread"');
    const ids = (body.match(/<article\b[^>]*id="([^"]+)"/g) ?? []).map(
      (tag) => tag.match(/id="([^"]+)"/)![1],
    );
    expect(new Set(ids).size).toBe(378);
  });
  it("keeps Forex, Crypto and Both controls visible on every entry point", async () => {
    for (const page of [Glossary, Crypto, Search]) {
      const body = await html(page);
      expect(body).toContain('aria-label="Terminology grouping"');
      expect(body).toMatch(/>Forex<\/a>/);
      expect(body).toMatch(/>Crypto<\/a>/);
      expect(body).toMatch(/>Both<\/a>/);
      expect(body).toContain('aria-current="page"');
    }
  });
  it("keeps grouping-specific counts and the letter reset unambiguous", async () => {
    const forex = await html(Glossary, { course: "forex" });
    const crypto = await html(Crypto);
    expect(forex).toContain("242 terms available");
    expect(forex).toContain("Showing 12 of 242 matching terms");
    expect(crypto).toContain("136 terms available");
    expect(forex).toContain("All letters");
    expect(crypto).toContain("All letters");
  });
  it("provides native View more fallback and removes it at the last group", async () => {
    const first = await html(Crypto);
    expect(first).toContain("limit=24");
    expect(first).toContain("View more");
    const next = await html(Crypto, { limit: "24" });
    expect(visible(next)).toHaveLength(24);
    const last = await html(Glossary, { course: "forex", limit: "500" });
    expect(visible(last)).toHaveLength(242);
    expect(last).not.toContain("View more");
  });
  it("paginates combined search and resets the group after filtering", async () => {
    expect(visible(await html(Search, { limit: "24" }))).toHaveLength(24);
    expect(visible(await html(Glossary, { limit: ["120"] }))).toHaveLength(12);
    expect(
      visible(await html(Glossary, { q: "spread" })).length,
    ).toBeLessThanOrEqual(12);
    const empty = await html(Glossary, { q: "***" });
    expect(empty).toContain("No terms match this filter");
    expect(empty).not.toContain("View more");
  });
  it("retains native forms and deep-anchor fallback after approved release", async () => {
    const body = await html(Glossary);
    expect(body).toContain('method="get"');
    expect(body).toContain("[data-glossary-term][hidden]:target");
    // Keep the stronger override inside noscript; normal interactive behavior is unchanged.
    const fallback = (body.match(/<noscript>[\s\S]*?<\/noscript>/g) ?? []).find(
      (markup) => markup.includes("[data-glossary-term][hidden]:target"),
    );
    expect(fallback).toMatch(
      /@layer base\s*\{\s*\[data-glossary-term\]\[hidden\]:target\s*\{\s*display: block !important;/,
    );
    expect(fallback).toContain(
      "html:has([data-glossary-term]) { scroll-behavior: auto; }",
    );
    expect(body).toContain('id="relative-strength-index"');
  });
});
