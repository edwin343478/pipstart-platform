import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import sitemap from "./sitemap";
import { cryptoLessons } from "./learn/crypto/level-1/lessons";
import { forexLessons } from "./learn/forex/level-1/lessons";
import { publishedLessons } from "../content/lesson-registry";

describe("Milestone 10 content publishing", () => {
  it("publishes all seven migrated MDX lessons in curriculum order", () => {
    expect(forexLessons).toHaveLength(6);
    expect(cryptoLessons).toHaveLength(1);
    expect(publishedLessons.map((lesson) => lesson.position)).toEqual([
      1, 1, 2, 3, 4, 5, 6,
    ]);
    expect(forexLessons.map((lesson) => lesson.position)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("exposes review dates and authored sources for every lesson", () => {
    for (const lesson of publishedLessons) {
      expect(lesson.reviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lesson.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lesson.author).not.toBe(lesson.reviewer);
      expect(lesson.sources.length).toBeGreaterThan(0);
    }
  });

  it("indexes only published lessons with review timestamps", () => {
    const entries = sitemap();
    for (const lesson of publishedLessons) {
      const entry = entries.find((candidate) =>
        candidate.url.endsWith(lesson.href),
      );
      expect(entry?.lastModified).toEqual(new Date(lesson.reviewDate));
    }
  });

  it("uses metadata-driven SEO and generic future lesson routes", () => {
    expect(forexLessons[1].seoTitle).toBe("Currency Pairs Explained");
    expect(cryptoLessons[0].href).toBe("/learn/crypto/level-1");
    expect(
      readFileSync(
        join(process.cwd(), "src/app/learn/crypto/level-1/[lesson]/page.tsx"),
        "utf8",
      ),
    ).toContain("export const dynamicParams = false");
  });
});
