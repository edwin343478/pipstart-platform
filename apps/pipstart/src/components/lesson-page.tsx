import "server-only";

import { JsonLd } from "./json-ld";
import { LessonPageClient } from "./lesson-page-client";
import type { PublishedLesson } from "../content/lesson-registry";
import { createLessonJsonLd } from "../lib/lesson-json-ld";
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
  return (
    <>
      <JsonLd data={createLessonJsonLd(props.lesson)} />
      <LessonPageClient {...prepareLessonPageData(props)} />
    </>
  );
}
