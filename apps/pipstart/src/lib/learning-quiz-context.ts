import "server-only";

import { getPublishedLessons } from "../content/lesson-registry";
import { getCurriculumCourse, getCurriculumModule } from "./curriculum";
import { getLearningProgressStorageKey } from "./learning-progress-storage";

export function getLearningQuizContext(
  learningPath: "crypto" | "forex",
  courseId: string,
  moduleId?: string,
) {
  const course = getCurriculumCourse(learningPath, courseId);
  const curriculumModule = moduleId
    ? getCurriculumModule(learningPath, moduleId)
    : undefined;
  if (
    !course ||
    !curriculumModule ||
    !course.modules.some((item) => item.id === curriculumModule.id)
  )
    return undefined;
  const quiz = curriculumModule.lessons.find((item) => item.type === "quiz");
  const lessons = getPublishedLessons({
    learningPath,
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
    progressKey: getLearningProgressStorageKey(
      learningPath,
      levelId,
      course.id,
    ),
  };
}

export function getLearningQuizClientContext(
  learningPath: "crypto" | "forex",
  courseId: string,
  moduleId?: string,
) {
  const context = getLearningQuizContext(learningPath, courseId, moduleId);
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
