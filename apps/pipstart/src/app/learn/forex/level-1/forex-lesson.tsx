"use client";

import { LessonPage } from "../../../../components/lesson-page";
import type { ForexLesson } from "./lessons";
import { forexLessons } from "./lessons";
import { FOREX_LEVEL_ONE_PROGRESS_KEY } from "./progress";

type LessonTarget = { href: string; label: string };

type ForexLessonPageProps = {
  contextHref?: string;
  contextTitle?: string;
  courseHref?: string;
  courseTitle?: string;
  lesson: ForexLesson;
  lessons?: readonly ForexLesson[];
  progressKey?: string;
  quizTarget?: LessonTarget | null;
};

function moduleLabel(module: string) {
  return module
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ForexLessonPage({
  contextHref,
  contextTitle,
  courseHref = "/learn/forex/level-1/forex-kindergarten",
  courseTitle = "Forex Kindergarten",
  lesson,
  lessons = forexLessons,
  progressKey = FOREX_LEVEL_ONE_PROGRESS_KEY,
  quizTarget = {
    href: "/learn/forex/level-1/quiz",
    label: "Take the Forex Foundations quiz",
  },
}: ForexLessonPageProps) {
  return (
    <LessonPage
      path="forex"
      lesson={lesson}
      lessons={lessons}
      contextHref={contextHref ?? courseHref}
      contextTitle={
        contextTitle ??
        (lesson.level === "level-0"
          ? "Orientation and Safety"
          : lesson.module
            ? moduleLabel(lesson.module)
            : courseTitle)
      }
      progressKey={progressKey}
      quizTarget={quizTarget}
    />
  );
}
