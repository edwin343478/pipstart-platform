import type { LessonNavigationEntry } from "./lesson-page-data";

export type ForexQuizClientContext = {
  course: { id: string; title: string; href: string };
  module: { id: string; title: string; href: string };
  quiz: { id: string; title: string; href: string };
  lessons: LessonNavigationEntry[];
  lessonIds: string[];
  levelLabel: string;
  progressKey: string;
};
