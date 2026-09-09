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

  it("does not expose unavailable account or Crypto lesson actions", () => {
    const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
    const cryptoLesson = fs.readFileSync(
      path.join(appRoot, "learn/crypto/level-1/page.tsx"),
      "utf8",
    );

    expect(home).not.toContain("/account/sign-in");
    expect(cryptoLesson).not.toContain("Mark complete");
    expect(cryptoLesson).not.toContain("/learn/crypto/level-1/blockchain");
  });
});
