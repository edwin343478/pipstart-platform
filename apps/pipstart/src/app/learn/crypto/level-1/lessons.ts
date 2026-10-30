import type { PublishedLesson } from "../../../../content/lesson-registry";
import { cryptoLevelPageLessons } from "../../../../lib/crypto-level-lessons";

export type CryptoLesson = PublishedLesson;
// The level page's course, found from data: the course of the level's position-1 lesson.
export const cryptoLessons = cryptoLevelPageLessons("level-1");

export function getCryptoLesson(slug: string): CryptoLesson | undefined {
  return cryptoLessons.find((lesson) => lesson.slug === slug);
}
