import "server-only";

import { LessonPageClient } from "./lesson-page-client";
import type { PublishedLesson } from "../content/lesson-registry";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import type { LessonTarget } from "../lib/lesson-page-data";

type Props = {
  path: "forex" | "crypto";
  lesson: PublishedLesson;
  lessons: readonly PublishedLesson[];
  contextTitle: string;
  contextHref: string;
  progressKey?: string;
  quizTarget?: LessonTarget | null;
};

export function LessonPage(props: Props) {
  return <LessonPageClient {...prepareLessonPageData(props)} />;
}
