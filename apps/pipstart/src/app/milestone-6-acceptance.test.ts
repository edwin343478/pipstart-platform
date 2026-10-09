import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import BrokersPage from "./brokers/page";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

describe("Milestone 6 release acceptance", () => {
  it("communicates the educational purpose and trust boundaries on entry", () => {
    const home = read("page.tsx");

    expect(home).toContain("Structured Forex &amp; crypto education");
    expect(home).toContain("Learn markets with structure, not shortcuts.");
    expect(home).toContain("No trading signals");
    expect(home).toContain("Affiliate partners always disclosed");
  });

  it("opens both schools at their complete level indexes", () => {
    const home = read("page.tsx");

    expect(home).toContain('href="/learn/forex"');
    expect(home).toContain("Explore all Forex levels");
    expect(home).toContain('href="/learn/crypto"');
    expect(home).toContain("Explore all Crypto levels");
    expect(home).not.toContain('href="/learn/forex/level-1"');
    expect(home).not.toContain('href="/learn/crypto/level-1"');
  });

  it("does not expose the placeholder Calendar route", () => {
    expect(fs.existsSync(path.join(appRoot, "calendar/page.tsx"))).toBe(false);
  });

  it("discloses and safely marks every broker affiliate link", () => {
    const brokers = renderToStaticMarkup(createElement(BrokersPage));
    const disclosure = read("../components/affiliate-disclosure.tsx");
    const affiliateLinks = brokers.match(/href="\/go\/[a-z0-9-]+"/g) ?? [];
    const sponsoredLinks =
      brokers.match(/rel="sponsored noopener noreferrer"/g) ?? [];

    expect(brokers).toContain('aria-label="Affiliate disclosure"');
    expect(disclosure).toContain("Affiliate disclosure:");
    expect(affiliateLinks.length).toBeGreaterThan(0);
    expect(sponsoredLinks).toHaveLength(affiliateLinks.length);
  });

  it("retains small-screen rules for every critical learning entry page", () => {
    const responsiveStyles = [
      "page.module.css",
      "start-here/page.module.css",
      "learn/forex/page.module.css",
      "learn/forex/level-1/page.module.css",
      "learn/crypto/page.module.css",
      "learn/crypto/level-1/page.module.css",
    ];

    for (const stylesheet of responsiveStyles) {
      expect(read(stylesheet)).toMatch(
        /@media\s*\(max-width:\s*(?:[1-6]\d\d|7[0-5]\d|76[0-7])px\)/,
      );
    }
  });

  it("shares the collapsible desktop sidebar and native mobile accordion across lesson paths", () => {
    const sidebar = read("../components/SteppedLessonArticle.tsx");
    const forex = read("learn/forex/level-1/forex-lesson.tsx");
    const crypto = read("learn/crypto/level-1/crypto-lesson.tsx");
    expect(forex).toContain("<LessonPage");
    expect(crypto).toContain("<LessonPage");
    expect(sidebar).toContain("<aside");
    expect(sidebar).toContain("<details");
    expect(sidebar).toContain("aria-expanded={!collapsed}");
    expect(sidebar).toContain("Collapse lesson list");
    expect(sidebar).toContain("Expand lesson list");
  });
});
