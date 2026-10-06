import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../../../../content/lesson-registry";
export type CryptoLesson = PublishedLesson;
export const cryptoLessons = cryptoLessonDocuments.filter(
  (lesson) =>
    lesson.level === "level-3" &&
    lesson.course === "crypto-exchanges-and-markets",
);
export const getCryptoLesson = (slug: string) =>
  cryptoLessons.find((lesson) => lesson.slug === slug);
