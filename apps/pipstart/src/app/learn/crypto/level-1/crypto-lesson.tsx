import "server-only";

import { notFound } from "next/navigation";

import { LessonPage } from "../../../../components/lesson-page";
import { cryptoLessonContext } from "../../../../lib/crypto-level-routing";
import {
  type CryptoLesson,
  cryptoLessons as levelPageLessons,
} from "./lessons";

// Any lesson of any course in the level; its course supplies the list, context and progress key.
export function CryptoLessonPage({
  lesson = levelPageLessons[0]!,
}: {
  lesson?: CryptoLesson;
}) {
  const context = cryptoLessonContext("level-1", lesson.course);
  if (!context) notFound();
  const {
    lessons: cryptoLessons,
    contextTitle,
    contextHref,
    progressKey,
  } = context;

  return (
    <LessonPage
      path="crypto"
      lesson={lesson}
      lessons={cryptoLessons}
      contextTitle={contextTitle}
      contextHref={contextHref}
      progressKey={progressKey}
    />
  );
}
