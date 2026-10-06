import "server-only";

import { getPublishedLessons } from "../content/lesson-registry";
import { getCurriculumCourse, getCurriculumModule } from "./curriculum";
import { getLearningProgressStorageKey } from "./learning-progress-storage";

export function getCryptoOrientationQuizContext(
  courseId: string,
  moduleId?: string,
) {
  const course = getCurriculumCourse("crypto", courseId);
  const curriculumModule = moduleId
    ? getCurriculumModule("crypto", moduleId)
    : undefined;
  if (
    !course ||
    !curriculumModule ||
    !course.modules.some((item) => item.id === curriculumModule.id)
  )
    return undefined;
  const quiz = curriculumModule.lessons.find((item) => item.type === "quiz");
  const lessons = getPublishedLessons({
    learningPath: "crypto",
    course: courseId,
    module: curriculumModule.id,
  });
  if (!quiz || !lessons.length) return undefined;
  const levelId = lessons[0].level;
  return {
    course,
    module: curriculumModule,
    quiz,
    lessons,
    lessonIds: lessons.map((item) => item.id),
    levelLabel: `Level ${levelId.replace("level-", "")}`,
    progressKey: getLearningProgressStorageKey("crypto", levelId, course.id),
  };
}

export function getCryptoOrientationQuizClientContext(
  courseId: string,
  moduleId?: string,
) {
  const context = getCryptoOrientationQuizContext(courseId, moduleId);
  if (!context) return undefined;
  const compact = (entry: { id: string; title: string; href: string }) => ({
    id: entry.id,
    title: entry.title,
    href: entry.href,
  });
  return {
    course: compact(context.course),
    module: compact(context.module),
    quiz: compact(context.quiz),
    lessons: context.lessons.map(compact),
    lessonIds: context.lessonIds,
    levelLabel: context.levelLabel,
    progressKey: context.progressKey,
  } satisfies import("./forex-quiz-client-context").ForexQuizClientContext;
}
