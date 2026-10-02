import type {
  LessonMetadata,
  LessonBlock,
  LessonSection,
} from "../content/lesson-content";

export type LessonTarget = { href: string; label: string };
export type LessonNavigationEntry = { id: string; title: string; href: string };
export type LessonPageData = Pick<
  LessonMetadata,
  | "title"
  | "level"
  | "course"
  | "module"
  | "publishedDate"
  | "reviewDate"
  | "estimatedMinutes"
  | "objectives"
  | "sources"
> & {
  id: string;
  href: string;
  blocks: LessonBlock[];
  sections?: LessonSection[];
};
export type LessonPageClientProps = {
  path: "forex" | "crypto";
  lesson: LessonPageData;
  lessons: readonly LessonNavigationEntry[];
  contextTitle: string;
  contextHref: string;
  progressKey?: string;
  quizTarget?: LessonTarget | null;
  registeredQuiz?: { id: string; title: string; href: string };
};
