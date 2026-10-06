import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

function findFiles(directory: string, filenamePattern: RegExp): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return findFiles(entryPath, filenamePattern);
    return filenamePattern.test(entry.name) ? [entryPath] : [];
  });
}

function routePattern(pagePath: string): RegExp {
  const relativePath = path.relative(appRoot, path.dirname(pagePath));
  const route =
    relativePath === "" ? "/" : `/${relativePath.split(path.sep).join("/")}`;
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\[.\.\.(.+?)\\\]\]/g, ".+")
    .replace(/\\\[(.+?)\\\]/g, "[^/]+");

  return new RegExp(`^${escaped}$`);
}

describe("PipStart internal route integrity", () => {
  it("resolves every hard-coded internal link to a page", () => {
    const pagePatterns = findFiles(appRoot, /^page\.tsx$/).map(routePattern);
    const sourceFiles = findFiles(appRoot, /\.tsx$/);
    const unresolvedLinks = new Set<string>();

    for (const sourceFile of sourceFiles) {
      const source = fs.readFileSync(sourceFile, "utf8");
      const hrefPattern = /\bhref\s*[:=]\s*["'](\/[^"]*?)["']/g;

      for (const match of source.matchAll(hrefPattern)) {
        const pathname = match[1]?.split(/[?#]/)[0];
        if (!pathname) continue;

        if (!pagePatterns.some((pattern) => pattern.test(pathname))) {
          unresolvedLinks.add(
            `${path.relative(appRoot, sourceFile)}: ${pathname}`,
          );
        }
      }
    }

    expect([...unresolvedLinks]).toEqual([]);
  });

  it("does not expose unavailable account or unpublished Crypto lesson routes", () => {
    const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
    const cryptoLesson = fs.readFileSync(
      path.join(appRoot, "learn/crypto/level-1/crypto-lesson.tsx"),
      "utf8",
    );

    expect(home).not.toContain("/account/sign-in");
    expect(cryptoLesson).toContain("<LessonPage");
    expect(cryptoLesson).not.toContain("/learn/crypto/level-1/blockchain");
  });

  it("does not send first-party navigation to external PipStart or SkillCIMA URLs", () => {
    const sourceFiles = findFiles(appRoot, /\.tsx$/);
    const unintendedExternalLinks: string[] = [];
    const firstPartyUrl =
      /\bhref\s*[:=]\s*["']https?:\/\/(?:www\.)?(?:pipstart\.net|skillcima\.(?:com|net))(?:[/:"'])/gi;

    for (const sourceFile of sourceFiles) {
      const source = fs.readFileSync(sourceFile, "utf8");

      if (firstPartyUrl.test(source)) {
        unintendedExternalLinks.push(path.relative(appRoot, sourceFile));
      }

      firstPartyUrl.lastIndex = 0;
    }

    expect(unintendedExternalLinks).toEqual([]);
  });

  it("uses the canonical risk-disclosure route", () => {
    const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");

    expect(home).toContain('href="/legal/risk-disclosure"');
    expect(home).not.toContain('href="/legal/risk-disclaimer"');
    expect(
      fs.existsSync(path.join(appRoot, "legal/risk-disclosure/page.tsx")),
    ).toBe(true);
  });

  it("opens the Forex school at the level index", () => {
    const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
    const forexPath = fs.readFileSync(
      path.join(appRoot, "learn/forex/forex-index-client.tsx"),
      "utf8",
    );

    expect(home).toContain('href="/learn/forex"');
    expect(home).toContain("Explore all Forex levels");
    expect(home).not.toContain('href="/learn/forex/level-1"');
    expect(forexPath).toContain('"/learn/forex/level-0"');
    expect(forexPath).toContain("Start Level 0: Orientation and Safety");
    expect(forexPath).toContain(
      '"/learn/forex/level-1/forex-kindergarten/forex-foundations"',
    );
    expect(forexPath).toContain("Start Level 1: Forex Kindergarten");
    expect(forexPath).toContain("Available");
    expect(forexPath).toContain("Coming soon");
  });

  it("opens the Crypto school at the level index", () => {
    const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
    const cryptoPath = fs.readFileSync(
      path.join(appRoot, "learn/crypto/page.tsx"),
      "utf8",
    );

    expect(home).toContain('href="/learn/crypto"');
    expect(home).toContain("Explore all Crypto levels");
    expect(home).not.toContain('href="/learn/crypto/level-1"');
    expect(cryptoPath).toContain("href={`/learn/crypto/level-${index}`}");
    expect(cryptoPath).toContain("index <= 10");
    expect(cryptoPath).toContain("Available");
    expect(cryptoPath).toContain("Coming soon");
  });

  it("provides a return to all levels from both Level 1 experiences", () => {
    const forexLevel = fs.readFileSync(
      path.join(appRoot, "learn/forex/level-1/forex-lesson.tsx"),
      "utf8",
    );
    const cryptoLevel = fs.readFileSync(
      path.join(appRoot, "learn/crypto/level-1/crypto-lesson.tsx"),
      "utf8",
    );

    const sharedPage = fs.readFileSync(
      path.join(appRoot, "../components/lesson-page-client.tsx"),
      "utf8",
    );
    expect(forexLevel).toContain('path="forex"');
    expect(cryptoLevel).toContain('path="crypto"');
    expect(sharedPage).toContain("href={`/learn/${path}`}");
  });
});
