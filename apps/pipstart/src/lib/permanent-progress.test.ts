import { describe, expect, it } from "vitest";
import {
  assertUniqueCurriculumIds,
  calculateProgress,
  getCourseLessonIds,
  getPublishedCourse,
  selectContinueLesson,
  type ProgressSnapshot,
} from "./permanent-progress";

describe("Milestone 12 permanent progress", () => {
  const course = getPublishedCourse("forex-kindergarten")!;
  const lessons = course.modules.flatMap((module) => module.lessons);
  const lessonItems = lessons.filter((lesson) => lesson.type === "lesson");
  it("keeps published lesson identifiers globally unique", () => {
    expect(assertUniqueCurriculumIds()).toBeUndefined();
  });
  it("ignores removed lessons when deriving percentages", () => {
    expect(
      calculateProgress(lessons, [lessons[0]!.id, "removed-lesson"]),
    ).toEqual({
      completed: 1,
      percentage: Math.round(100 / lessonItems.length),
      total: lessonItems.length,
    });
  });
  it("continues at the latest incomplete published lesson", () => {
    const state: ProgressSnapshot = {
      authenticated: true,
      lessons: [
        {
          completedAt: null,
          isComplete: false,
          lastVisitedAt: "2026-09-16T08:00:00Z",
          lessonId: lessons[0]!.id,
          revision: 1,
        },
        {
          completedAt: null,
          isComplete: false,
          lastVisitedAt: "2026-09-16T09:00:00Z",
          lessonId: lessons[2]!.id,
          revision: 1,
        },
      ],
    };
    expect(selectContinueLesson(course, state)?.id).toBe(lessons[2]!.id);
  });
  it("provides the published allowlist for imports", () => {
    expect(getCourseLessonIds(course)).toEqual(
      lessonItems.map((lesson) => lesson.id),
    );
  });
});
