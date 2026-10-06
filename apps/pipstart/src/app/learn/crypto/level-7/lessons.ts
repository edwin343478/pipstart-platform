import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../../../../content/lesson-registry";
export type CryptoLesson = PublishedLesson;
export const cryptoLessons = cryptoLessonDocuments.filter(
  (lesson) =>
    lesson.level === "level-7" &&
    lesson.course === "crypto-charts-and-evidence",
);
export const getCryptoLesson = (slug: string) =>
  cryptoLessons.find((lesson) => lesson.slug === slug);
