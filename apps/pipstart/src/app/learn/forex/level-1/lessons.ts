import {
  getPublishedLessons,
  type PublishedLesson,
} from "../../../../content/lesson-registry";

export type ForexLesson = PublishedLesson;
export const forexLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-1",
  course: "forex-kindergarten",
  module: "forex-foundations",
});

export function getForexLesson(slug: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.slug === slug);
}

export function getForexLessonById(id: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.id === id);
}
