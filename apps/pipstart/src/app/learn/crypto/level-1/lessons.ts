import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../../../../content/lesson-registry";

export type CryptoLesson = PublishedLesson;
export const cryptoLessons = cryptoLessonDocuments.filter(
  (lesson) => lesson.level === "level-1" && lesson.course === "bitcoin",
);

export function getCryptoLesson(slug: string): CryptoLesson | undefined {
  return cryptoLessons.find((lesson) => lesson.slug === slug);
}
