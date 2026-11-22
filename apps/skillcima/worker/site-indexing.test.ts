import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";

// M24-06: Skillcima is open to search engines. Each indexable page has its own
// canonical, utility pages stay out of search, and titles are not doubled.
const app = (p: string) =>
  readFileSync(new URL(`../src/app/${p}`, import.meta.url), "utf8");

const indexable: Record<string, string> = {
  "/": "page.tsx",
  "/about": "about/page.tsx",
  "/contact": "contact/page.tsx",
  "/legal/privacy-policy": "legal/privacy-policy/page.tsx",
  "/legal/terms": "legal/terms/page.tsx",
  "/legal/cookie-policy": "legal/cookie-policy/page.tsx",
  "/legal/risk-disclaimer": "legal/risk-disclaimer/page.tsx",
};
const utility = [
  "confirm/page.tsx",
  "email-preferences/page.tsx",
  "thank-you/page.tsx",
  "unsubscribe/page.tsx",
];

describe("Skillcima search indexing", () => {
  it("robots.txt allows crawling, keeps the API out and names the sitemap", () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(r.sitemap).toBe("https://skillcima.com/sitemap.xml");
  });

  it("the layout is indexable and no longer forces one canonical or og:url on every page", () => {
    const layout = app("layout.tsx");
    expect(layout).toMatch(/robots:\s*\{\s*index: true,\s*follow: true,/);
    expect(layout).not.toMatch(/canonical:/);
    expect(layout).not.toMatch(/url: "\/"/);
  });

  it("every sitemap page sets its own canonical", () => {
    const urls = sitemap().map(({ url }) =>
      new URL(url).pathname.replace(/^$/, "/"),
    );
    expect(new Set(urls)).toEqual(new Set(Object.keys(indexable)));
    for (const [path, file] of Object.entries(indexable)) {
      const source = app(file);
      if (path === "/")
        expect(source, file).toContain(`alternates: { canonical: "/" }`);
      else
        expect(source, file).toMatch(
          new RegExp(
            `pageMetadata\\(\\{\\s*title: "[^"]+",\\s*path: "${path}",`,
          ),
        );
      expect(source, file).not.toMatch(/index: false/);
    }
  });

  it("utility pages stay out of search", () => {
    for (const file of utility)
      expect(app(file), file).toMatch(
        /robots:\s*\{\s*index: false,\s*follow: false/,
      );
  });

  it("page titles do not repeat the brand that the layout template adds", () => {
    for (const file of [...Object.values(indexable), ...utility])
      expect(app(file), file).not.toMatch(/title: "[^"]*\| Skillcima"/);
  });
});
