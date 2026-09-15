import { describe, expect, it } from "vitest";

import {
  getContinueLearningLesson,
  getLessonNavigation,
  sortPublishedLessons,
} from "./course-engine";

const lessons = [
  { href: "/third", id: "third", position: 3, status: "published" },
  { href: "/draft", id: "draft", position: 2, status: "draft" },
  { href: "/first", id: "first", position: 1, status: "published" },
] as const;

describe("course engine", () => {
  it("orders published lessons and excludes drafts", () => {
    expect(sortPublishedLessons(lessons).map((lesson) => lesson.id)).toEqual([
      "first",
      "third",
    ]);
  });

  it("returns safe previous and next boundaries", () => {
    expect(getLessonNavigation(lessons, "first")).toMatchObject({
      next: { id: "third" },
      position: 1,
      previous: undefined,
      total: 2,
    });
    expect(getLessonNavigation(lessons, "third")).toMatchObject({
      next: undefined,
      position: 2,
      previous: { id: "first" },
      total: 2,
    });
    expect(getLessonNavigation(lessons, "missing")).toBeUndefined();
  });

  it("continues at the first incomplete lesson and restarts after completion", () => {
    expect(getContinueLearningLesson(lessons, [])?.id).toBe("first");
    expect(getContinueLearningLesson(lessons, ["first"])?.id).toBe("third");
    expect(getContinueLearningLesson(lessons, ["first", "third"])?.id).toBe(
      "first",
    );
  });
});
