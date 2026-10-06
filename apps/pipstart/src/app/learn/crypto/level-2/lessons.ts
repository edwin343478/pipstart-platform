import {
  cryptoLessonDocuments,
  type PublishedLesson,
} from "../../../../content/lesson-registry";
export type CryptoLesson = PublishedLesson;
export const cryptoLessons = cryptoLessonDocuments.filter(
  (lesson) =>
    lesson.level === "level-2" && lesson.course === "wallets-and-security",
);
export const getCryptoLesson = (slug: string) =>
  cryptoLessons.find((lesson) => lesson.slug === slug);
