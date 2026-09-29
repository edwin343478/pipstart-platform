import { describe, expect, it } from "vitest";

import { buildLessonHref } from "../../../../content/lesson-registry";
import { forexLessons, getForexLesson } from "./lessons";

describe("Forex level-one lesson infrastructure", () => {
  it("provides six ordered, directly addressable lessons", () => {
    expect(forexLessons).toHaveLength(6);
    expect(forexLessons.map((lesson) => lesson.position)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(forexLessons.map((lesson) => lesson.href)).size).toBe(6);
    expect(new Set(forexLessons.map((lesson) => lesson.slug)).size).toBe(6);
    expect(forexLessons.every((lesson) => lesson.status === "published")).toBe(
      true,
    );
    expect(
      forexLessons.every(
        (lesson) =>
          lesson.learningPath === "forex" &&
          lesson.level === "level-1" &&
          lesson.course === "forex-kindergarten" &&
          lesson.module === "forex-foundations",
      ),
    ).toBe(true);
  });

  it("keeps the approved first lesson at the level root", () => {
    expect(forexLessons[0]).toMatchObject({
      href: "/learn/forex/level-1",
      slug: "what-is-forex",
      title: "What is Forex?",
    });
  });

  it("builds lesson URLs from lesson metadata instead of hard-coding Level 1", () => {
    expect(
      buildLessonHref({
        learningPath: "forex",
        level: "level-3",
        position: 1,
        slug: "chart-types",
      }),
    ).toBe("/learn/forex/level-3");

    expect(
      buildLessonHref({
        learningPath: "forex",
        level: "level-3",
        position: 2,
        slug: "candlesticks",
      }),
    ).toBe("/learn/forex/level-3/candlesticks");
  });

  it("resolves every lesson slug and rejects unknown slugs", () => {
    for (const lesson of forexLessons) {
      expect(getForexLesson(lesson.slug)).toBe(lesson);
      expect(lesson.introduction.length).toBeGreaterThan(100);
      expect(lesson.keyPoints.length).toBeGreaterThanOrEqual(3);
    }

    expect(getForexLesson("not-a-real-lesson")).toBeUndefined();
  });
});
