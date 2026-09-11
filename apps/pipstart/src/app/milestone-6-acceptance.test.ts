import fs from "node:fs";
import path from "node:path";

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

  it("starts learners at the available Forex and Crypto levels", () => {
    const home = read("page.tsx");

    expect(home).toContain('href="/learn/forex/level-1"');
    expect(home).toContain('href="/learn/crypto/level-1"');
    expect(home).not.toContain("Start Level 0");
  });

  it("does not expose placeholder Calendar or Dashboard routes", () => {
    expect(fs.existsSync(path.join(appRoot, "calendar/page.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(appRoot, "dashboard/page.tsx"))).toBe(false);
  });

  it("discloses and safely marks every broker affiliate link", () => {
    const brokers = read("brokers/page.tsx");
    const disclosure = read("../components/affiliate-disclosure.tsx");
    const affiliateLinks = brokers.match(/href=\{derivAffiliateUrl\}/g) ?? [];
    const sponsoredLinks =
      brokers.match(/rel="sponsored noopener noreferrer"/g) ?? [];

    expect(brokers).toContain("<AffiliateDisclosure");
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
});
