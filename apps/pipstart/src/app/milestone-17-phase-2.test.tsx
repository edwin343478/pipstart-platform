import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import CombinedGlossarySearch from "./glossary/search/page";
import ForexGlossary from "./glossary/page";
import CryptoGlossary from "./glossary/crypto/page";
import {
  buildPublishedForexGlossary,
  legacyPublishedGlossary,
} from "../content/published-glossary";
import { getPublicGlossaryCatalogue } from "../content/glossary-catalogue";
import {
  publishedLessons,
  forexLessonDocuments,
  cryptoGlossaryEntries,
} from "../content/lesson-registry";
import { readingStorageKey } from "../lib/lesson-reading-state";
import { glossaryFilterHref } from "../lib/glossary-route-search";
import draft from "../content/glossary-catalogue.draft.json";

const forex = legacyPublishedGlossary.filter((e) => e.course === "forex");
const crypto = legacyPublishedGlossary.filter((e) => e.course === "crypto");
const html = async (
  course: "forex" | "crypto",
  params: {
    q?: string | string[];
    letter?: string | string[];
    category?: string | string[];
  } = {},
) =>
  renderToStaticMarkup(
    await (course === "forex" ? ForexGlossary : CryptoGlossary)({
      searchParams: Promise.resolve({
        ...params,
        ...(course === "forex" ? { course: "forex" } : {}),
      }),
    }),
  );
describe("M17 Phase 2 published-source integration", () => {
  it("uses 14 published Forex lesson definitions and retains Pipette/Position size", () => {
    expect(forex).toHaveLength(16);
    const definitions = forexLessonDocuments.flatMap((l) =>
      l.blocks.filter((b) => b.type === "definition"),
    );
    expect(definitions).toHaveLength(14);
    for (const d of definitions)
      expect(
        forex.some((e) => e.meanings.some((m) => m.definition === d.children)),
      ).toBe(true);
    expect(
      forex.find((e) => e.slug === "pipette")?.meanings[0].definition,
    ).toBe(
      "A fractional pip, used by brokers that quote prices to one extra decimal place.",
    );
    expect(
      forex.find((e) => e.slug === "position-size")?.meanings[0].definition,
    ).toBe("The number of units of currency controlled in a single trade.");
  });
  it("does not publish pending draft definitions or draft/unapproved lesson sentinels", () => {
    expect(getPublicGlossaryCatalogue()).toHaveLength(378);
    expect(
      draft.entries.every(
        (e) =>
          e.status === "draft" && !e.approved && e.sourceReview === "pending",
      ),
    ).toBe(true);
    const source = forexLessonDocuments[0];
    for (const modification of [
      { status: "draft" as const },
      { approved: false },
      { learningPath: "crypto" as const },
    ]) {
      const fixture = {
        ...source,
        ...modification,
        blocks: [
          {
            type: "definition" as const,
            term: "Draft sentinel",
            children: "Must remain private",
          },
        ],
      };
      expect(
        buildPublishedForexGlossary([fixture]).some(
          (e) => e.slug === "draft-sentinel",
        ),
      ).toBe(false);
    }
    expect(
      forex.some(
        (e) =>
          e.slug === "two-factor-authentication" ||
          e.slug === "currency-swap" ||
          e.slug === "backtesting",
      ),
    ).toBe(false);
  });
  it("preserves every existing Crypto anchor, definition and per-meaning context", () => {
    expect(crypto).toHaveLength(120);
    for (const original of cryptoGlossaryEntries) {
      const entry = crypto.find((e) => e.slug === original.slug)!;
      expect(entry.href).toBe("/glossary/crypto#" + original.slug);
      expect(entry.meanings).toEqual(original.meanings);
    }
  });
  it("keeps pending discovery aliases and categories private", () => {
    expect(getPublicGlossaryCatalogue()).toHaveLength(378);
    for (const entry of [...forex, ...crypto]) {
      expect(entry.aliases).toEqual([]);
      expect(entry.category).toBe("Foundations and market basics");
    }
    // This proposed spelling is present in the review catalogue, but it is
    // not approved for public discovery yet.
    const proposed = draft.entries.find(
      (entry) => entry.id === "crypto:centralised-exchange-cex",
    )!;
    expect(
      proposed.aliases.some((alias) => alias.value === "Centralized exchange"),
    ).toBe(true);
    expect(crypto.find((entry) => entry.id === proposed.id)?.aliases).toEqual(
      [],
    );
  });
  it("keeps published lesson routes and reading keys identical", () => {
    expect(
      publishedLessons.map((l) => ({
        path: l.learningPath,
        id: l.id,
        href: l.href,
        readingKey: readingStorageKey(l.id, l.sections || []),
      })),
    ).toEqual(draft.preservationBaseline);
  });
  it("keeps glossary stylesheets byte-identical to the approved baseline", () => {
    const hash = (file: string) =>
      createHash("sha256")
        .update(readFileSync(resolve(import.meta.dirname, file)))
        .digest("hex");
    expect(hash("glossary/page.module.css")).toBe(
      "24dd29c7843342254e4cffe317fdd87232a07c6583f427860c5bf3af8d332db6",
    );
    expect(hash("glossary/crypto/page.module.css")).toBe(
      "dac0446c8bde4075efea12b81a5ddfb72bac402078750a86c5ce305510e102e5",
    );
  });
  it("renders complete server results and native GET forms with no-script reveal", async () => {
    const f = await html("forex"),
      c = await html("crypto");
    expect(f.match(/<article\b/g)).toHaveLength(242);
    expect(c.match(/<article\b/g)).toHaveLength(136);
    for (const [body, course] of [
      [f, "forex"],
      [c, "crypto"],
    ]) {
      expect(body).toContain('method="get"');
      expect(body).toContain('name="q"');
      expect(body).toContain("<noscript>");
      expect(body).toContain("@layer base");
      expect(body).toContain("[hidden]:has([data-" + course + "-glossary])");
    }
    expect(f).toContain('name="letter"');
    expect(f).toContain('value=""');
    expect(f).toContain('id="pip"');
    expect(c).toContain('id="gas"');
  });
  it("searches approved released names and aliases", async () => {
    expect(await html("forex", { q: "Offer" })).toContain('id="ask-or-offer"');
    expect(await html("forex", { q: "RSI" })).toContain(
      'id="relative-strength-index"',
    );
    const c = await html("crypto", { q: "KYC" });
    expect(c).toContain('id="kyc-and-aml"');
    expect(c).not.toContain('id="gas"');
    expect(await html("crypto", { q: "centralised exchange" })).toContain(
      'id="centralised-exchange-cex"',
    );
  });
  it("supports query/category/letter combinations and rejects punctuation-only matches", async () => {
    const f = await html("forex", { letter: "p" });
    expect(f).toContain('id="pipette"');
    expect(f).not.toContain('id="liquidity"');
    expect(await html("forex", { q: "Offer", letter: "Z" })).toContain(
      'id="ask-or-offer"',
    );
    expect(await html("crypto", { category: "missing-category" })).toContain(
      "No terms match this filter",
    );
    expect(await html("crypto", { q: "***" })).toContain(
      "No terms match this filter",
    );
    expect(await html("crypto", { q: ["gas"], letter: ["G"] })).toContain(
      "136 terms available",
    );
  });
  it("preserves category state on native forms and letter navigation", async () => {
    const category = crypto.find((e) => e.slug === "gas")!.category;
    const body = await html("crypto", { category });
    expect(body).toContain('name="category"');
    expect(body).toContain("category=");
    expect(glossaryFilterHref("crypto", "G", category)).toBe(
      "/glossary/crypto?letter=G&category=" +
        new URLSearchParams({ category }).toString().slice(9),
    );
    expect(glossaryFilterHref("forex", "", "")).toBe("/glossary?course=forex");
  });
  it("escapes user-controlled query text rather than interpreting markup", async () => {
    const body = await html("forex", { q: '<script>alert("x")</script>' });
    expect(body).not.toContain('<script>alert("x")</script>');
    expect(body).toContain("&lt;script&gt;");
  });
});

describe("M17 combined search after approved release", () => {
  it("renders a native combined search with separate course identities", async () => {
    const body = renderToStaticMarkup(
      await CombinedGlossarySearch({
        searchParams: Promise.resolve({ q: "spread" }),
      }),
    );
    expect(body).toContain('href="/glossary#spread"');
    expect(body).toContain('href="/glossary/crypto#spread"');
    expect(body).toContain('name="course"');
    expect(body).toContain('method="get"');
    expect(body).toContain("data-glossary-search");
  });
  it("shows conservative spelling suggestions and approved aliases", async () => {
    const body = await html("crypto", { q: "bitcion" });
    expect(body).toContain('id="bitcoin"');
    expect(body).toContain("No direct match");
    const combined = renderToStaticMarkup(
      await CombinedGlossarySearch({
        searchParams: Promise.resolve({ q: "RSI" }),
      }),
    );
    expect(combined).toContain('href="/glossary#relative-strength-index"');
  });
  it("shows approved examples after release approval", async () => {
    const body = await html("forex", { q: "Pip" });
    const example = draft.entries.find((e) => e.id === "forex:pip")!.meanings[0]
      .example;
    expect(body).toContain(example);
    expect(body).toContain('aria-label="Terminology grouping"');
  });
});
