import fs from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CryptoLevelOnePage from "./learn/crypto/level-1/page";
import ForexLevelOnePage from "./learn/forex/level-1/page";
import BitcoinCoursePage from "./learn/crypto/level-1/bitcoin/page";
import ForexKindergartenPage from "./learn/forex/level-1/forex-kindergarten/page";
import { cryptoLessons } from "./learn/crypto/level-1/lessons";
import { getLessonNavigation } from "../lib/course-engine";
import { getCurriculumLevel } from "../lib/curriculum";

const appRoot = path.resolve(import.meta.dirname);

describe("Milestones 8 and 9 hardening", () => {
  it("makes course hierarchy reachable from both lesson experiences", () => {
    expect(renderToStaticMarkup(<ForexLevelOnePage />)).toContain(
      'href="/learn/forex/level-1/forex-kindergarten"',
    );
    expect(renderToStaticMarkup(<CryptoLevelOnePage />)).toContain(
      'href="/learn/crypto/level-1/bitcoin"',
    );
  });

  it("adds breadcrumbs and truthful related-term labels to lessons", () => {
    const forex = renderToStaticMarkup(<ForexLevelOnePage />);
    const crypto = renderToStaticMarkup(<CryptoLevelOnePage />);

    expect(forex).toContain('aria-label="Breadcrumb"');
    expect(crypto).toContain('aria-label="Breadcrumb"');
    expect(crypto).toContain("Bitcoin, Blockchain");
    expect(crypto).toContain("Open glossary");
  });

  it("derives Crypto navigation exclusively from published lesson data", () => {
    const source = fs.readFileSync(
      path.join(appRoot, "learn/crypto/level-1/page.tsx"),
      "utf8",
    );
    expect(source).toContain("cryptoLessons.map");
    expect(source).not.toContain("Transactions and blocks");
    expect(getLessonNavigation(cryptoLessons, "what-is-bitcoin")).toMatchObject(
      {
        position: 1,
        total: 1,
      },
    );
  });

  it("resolves real parent levels for hierarchy pages", () => {
    expect(getCurriculumLevel("forex", "level-1")?.title).toBe("Level 1");
    expect(getCurriculumLevel("crypto", "level-1")?.title).toBe("Level 1");
    expect(getCurriculumLevel("forex", "missing")).toBeUndefined();
    expect(renderToStaticMarkup(<ForexKindergartenPage />)).toContain(
      "Level 1",
    );
    expect(renderToStaticMarkup(<BitcoinCoursePage />)).toContain("Level 1");
  });
});
