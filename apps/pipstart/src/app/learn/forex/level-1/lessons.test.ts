import { describe, expect, it } from "vitest";

import { forexLessons, getForexLesson } from "./lessons";

describe("Forex level-one lesson infrastructure", () => {
  it("provides six ordered, directly addressable lessons", () => {
    expect(forexLessons).toHaveLength(6);
    expect(forexLessons.map((lesson) => lesson.position)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(forexLessons.map((lesson) => lesson.href)).size).toBe(6);
    expect(new Set(forexLessons.map((lesson) => lesson.slug)).size).toBe(6);
  });

  it("keeps the approved first lesson at the level root", () => {
    expect(forexLessons[0]).toMatchObject({
      href: "/learn/forex/level-1",
      slug: "what-is-forex",
      title: "What is Forex?",
    });
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
