import "server-only";

// M22 MP05c-1b: Forex lesson lists read from the lesson registry only. This module must not import
// the curriculum, because lib/curriculum.ts imports the Level 1 lesson list built from it.
import {
  getPublishedLessons,
  type PublishedLesson,
} from "../content/lesson-registry";

export function forexCourseLessons(
  levelId: string,
  courseId: string,
): PublishedLesson[] {
  return getPublishedLessons({
    learningPath: "forex",
    level: levelId,
    course: courseId,
  });
}

/** The level page /learn/forex/<level>: the level's position-1 lesson. */
export function forexLevelPageLesson(levelId: string) {
  return getPublishedLessons({ learningPath: "forex", level: levelId }).find(
    (lesson) => lesson.position === 1,
  );
}

/** The lessons of the course whose first lesson is the level page. */
export function forexLevelPageLessons(levelId: string): PublishedLesson[] {
  const levelPage = forexLevelPageLesson(levelId);
  return levelPage ? forexCourseLessons(levelId, levelPage.course) : [];
}
