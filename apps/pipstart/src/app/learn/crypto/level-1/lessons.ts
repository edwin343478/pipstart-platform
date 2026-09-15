import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../../../../content/lesson-registry";

export type CryptoLesson = PublishedLesson;
export const cryptoLessons = cryptoLessonDocuments;

export function getCryptoLesson(slug: string): CryptoLesson | undefined {
  return cryptoLessons.find((lesson) => lesson.slug === slug);
}
