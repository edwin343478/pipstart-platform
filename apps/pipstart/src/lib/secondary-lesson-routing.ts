import "server-only";
import type { PublishedLesson } from "../content/lesson-registry";

// First lessons keep their existing level-root routes. This helper does not
// change dynamicParams, publication selection, lesson order or redirects.
export function getSecondaryLessonParams(lessons: readonly PublishedLesson[]) {
  return lessons.slice(1).map((lesson) => ({ lesson: lesson.slug }));
}
export function getSecondaryLesson(
  lessons: readonly PublishedLesson[],
  slug: string,
) {
  const lesson = lessons.find((entry) => entry.slug === slug);
  return lesson && lesson.position !== 1 ? lesson : undefined;
}
