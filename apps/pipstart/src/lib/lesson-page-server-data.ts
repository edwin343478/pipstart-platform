import "server-only";
import { cryptoTermName, cryptoTermSlug } from "./crypto-learning-aids";
import type { PublishedLesson } from "../content/lesson-registry";
import { getCurriculumModule } from "./curriculum";
import type { LessonPageClientProps, LessonTarget } from "./lesson-page-data";

export function prepareLessonPageData(props: {
  path: "forex" | "crypto";
  lesson: PublishedLesson;
  lessons: readonly PublishedLesson[];
  contextTitle: string;
  contextHref: string;
  progressKey?: string;
  quizTarget?: LessonTarget | null;
}): LessonPageClientProps {
  if (props.lesson.status !== "published" || !props.lesson.approved)
    throw new Error(
      "Only approved published lessons can reach the lesson client.",
    );
  const lesson = props.lesson;
  const quiz = lesson.module
    ? getCurriculumModule(props.path, lesson.module)?.lessons.find(
        (item) => item.type === "quiz",
      )
    : undefined;
  return {
    path: props.path,
    contextTitle: props.contextTitle,
    contextHref: props.contextHref,
    progressKey: props.progressKey,
    quizTarget: props.quizTarget,
    registeredQuiz: quiz
      ? { id: quiz.id, title: quiz.title, href: quiz.href }
      : undefined,
    lesson: {
      id: lesson.id,
      href: lesson.href,
      title: lesson.title,
      level: lesson.level,
      course: lesson.course,
      module: lesson.module,
      publishedDate: lesson.publishedDate,
      reviewDate: lesson.reviewDate,
      estimatedMinutes: lesson.estimatedMinutes,
      objectives: lesson.objectives,
      sources: lesson.sources,
      // Sectioned lessons render their approved sections; the flat fallback is unused.
      blocks: lesson.sections?.length ? [] : lesson.blocks,
      sections: lesson.sections,
      ...(props.path === "crypto"
        ? {
            keyTerms: Array.from(
              new Map(
                lesson.blocks
                  .filter((block) => block.type === "definition")
                  .map((block) => [
                    cryptoTermSlug(block.term),
                    {
                      name: cryptoTermName(block.term),
                      href: `/glossary/crypto#${cryptoTermSlug(block.term)}`,
                    },
                  ]),
              ).values(),
            ),
          }
        : {}),
    },
    lessons: props.lessons
      .filter((item) => item.status === "published" && item.approved)
      .map((item) => ({ id: item.id, title: item.title, href: item.href })),
  };
}
