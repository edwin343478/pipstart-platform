import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CryptoLevelOnePage from "./learn/crypto/level-1/page";
import ForexLevelOnePage from "./learn/forex/level-1/page";
import { forexLessons } from "./learn/forex/level-1/lessons";
import { learningPaths } from "../lib/curriculum";

describe("Milestone 9 basic course engine", () => {
  it("provides two working modules and at least five published lessons", () => {
    const modules = learningPaths.flatMap((path) =>
      path.levels.flatMap((level) =>
        level.courses.flatMap((course) => course.modules),
      ),
    );
    expect(modules).toHaveLength(2);
    expect(
      modules.flatMap((module) => module.lessons).length,
    ).toBeGreaterThanOrEqual(5);
  });

  it("provides complete structured metadata for every published lesson", () => {
    const lessons = learningPaths.flatMap((path) =>
      path.levels.flatMap((level) =>
        level.courses.flatMap((course) =>
          course.modules.flatMap((module) => module.lessons),
        ),
      ),
    );

    for (const lesson of lessons) {
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      expect(lesson.objectives.length).toBeGreaterThan(0);
      expect(Array.isArray(lesson.prerequisites)).toBe(true);
      expect(Array.isArray(lesson.relatedLessonIds)).toBe(true);
      expect(Array.isArray(lesson.relatedTermSlugs)).toBe(true);
    }
  });

  it("exposes metadata through the approved Forex and Crypto lesson layouts", () => {
    const forexMarkup = renderToStaticMarkup(<ForexLevelOnePage />);
    const cryptoMarkup = renderToStaticMarkup(<CryptoLevelOnePage />);

    for (const markup of [forexMarkup, cryptoMarkup]) {
      expect(markup).toContain("minute read");
      expect(markup).toContain("Learning objectives");
      expect(markup).toContain("Related learning");
      expect(markup).toContain("Mark complete");
    }
  });

  it("keeps stable unique Forex IDs, positions and direct URLs", () => {
    expect(new Set(forexLessons.map((lesson) => lesson.id)).size).toBe(
      forexLessons.length,
    );
    expect(forexLessons.map((lesson) => lesson.position)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(forexLessons.map((lesson) => lesson.href)).size).toBe(
      forexLessons.length,
    );
  });
});
