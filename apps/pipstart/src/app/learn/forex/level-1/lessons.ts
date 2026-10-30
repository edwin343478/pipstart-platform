import type { PublishedLesson } from "../../../../content/lesson-registry";
import { forexLevelPageLessons } from "../../../../lib/forex-level-lessons";

export type ForexLesson = PublishedLesson;
// The level page's course, found from data: the course of the level's position-1 lesson.
export const forexLessons = forexLevelPageLessons("level-1");

export function getForexLesson(slug: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.slug === slug);
}

export function getForexLessonById(id: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.id === id);
}
