import "server-only";

// M22 MP05c: Crypto lesson lists read from the lesson registry only. This module must not import
// the curriculum, because lib/curriculum.ts imports the Level 1 lesson list built from it.
import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../content/lesson-registry";

export function cryptoCourseLessons(
  levelId: string,
  courseId: string,
): PublishedLesson[] {
  return cryptoLessonDocuments.filter(
    (lesson) => lesson.level === levelId && lesson.course === courseId,
  );
}

/** The lessons of the course whose first lesson is the level page /learn/crypto/<level>. */
export function cryptoLevelPageLessons(levelId: string): PublishedLesson[] {
  const levelPage = cryptoLessonDocuments.find(
    (lesson) => lesson.level === levelId && lesson.position === 1,
  );
  return levelPage ? cryptoCourseLessons(levelId, levelPage.course) : [];
}
