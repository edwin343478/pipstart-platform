import {
  getPublishedLessons,
  type PublishedLesson,
} from "../content/lesson-registry";
import { getLearningProgressStorageKey } from "./learning-progress-storage";
import {
  getCurriculumLevel,
  getLearningPath,
  type CurriculumCourse,
  type CurriculumLevel,
  type CurriculumModule,
} from "./curriculum";

export const LEGACY_FOREX_LEVEL_ID = "level-1";

export type ForexLevelRouteContext = {
  course: CurriculumCourse;
  level: CurriculumLevel;
  lessons: PublishedLesson[];
  module: CurriculumModule;
  progressKey: string;
  quizTarget: { href: string; label: string } | null;
};

export function forexProgressStorageKey(levelId: string, courseId: string) {
  return getLearningProgressStorageKey("forex", levelId, courseId);
}

export function getGenericForexLevelContext(
  levelId: string,
): ForexLevelRouteContext | undefined {
  if (levelId === LEGACY_FOREX_LEVEL_ID) return undefined;

  const level = getCurriculumLevel("forex", levelId);
  if (!level || level.courses.length !== 1) return undefined;

  const course = level.courses[0];
  if (!course || course.modules.length !== 1) return undefined;

  const curriculumModule = course.modules[0];
  if (!curriculumModule) return undefined;

  const lessons = getPublishedLessons({
    learningPath: "forex",
    level: level.id,
    course: course.id,
    module: curriculumModule.id,
  });
  if (!lessons.length) return undefined;

  const quiz = curriculumModule.lessons.find((item) => item.type === "quiz");

  return {
    course,
    level,
    lessons,
    module: curriculumModule,
    progressKey: forexProgressStorageKey(level.id, course.id),
    quizTarget: quiz ? { href: quiz.href, label: quiz.title } : null,
  };
}

export function getGenericForexLevelParams() {
  return (
    getLearningPath("forex")?.levels
      .filter((level) => level.id !== LEGACY_FOREX_LEVEL_ID)
      .filter((level) => Boolean(getGenericForexLevelContext(level.id)))
      .map((level) => ({ level: level.id })) ?? []
  );
}

export function getGenericForexSecondSegmentParams() {
  return getGenericForexLevelParams().flatMap(({ level }) => {
    const context = getGenericForexLevelContext(level);
    if (!context) return [];

    const segments = [
      context.course.id,
      ...context.lessons
        .filter((lesson) => lesson.position !== 1)
        .map((lesson) => lesson.slug),
    ];

    if (new Set(segments).size !== segments.length) {
      throw new Error(`Ambiguous Forex route segment in ${level}`);
    }

    return segments.map((segment) => ({ level, segment }));
  });
}

export function getGenericForexModuleParams() {
  return getGenericForexLevelParams().flatMap(({ level }) => {
    const context = getGenericForexLevelContext(level);
    if (!context) return [];

    return [
      {
        level,
        module: context.module.id,
        segment: context.course.id,
      },
    ];
  });
}

export function getGenericForexLevelRootLesson(levelId: string) {
  const context = getGenericForexLevelContext(levelId);
  if (!context) return undefined;

  const lesson = context.lessons.find((candidate) => candidate.position === 1);
  return lesson ? { ...context, lesson } : undefined;
}

export function getGenericForexSecondSegment(
  levelId: string,
  segment: string,
) {
  const context = getGenericForexLevelContext(levelId);
  if (!context) return undefined;

  const courseMatches = context.course.id === segment;
  const lesson = context.lessons.find(
    (candidate) =>
      candidate.slug === segment && candidate.position !== 1,
  );

  if (courseMatches && lesson) {
    throw new Error(`Ambiguous Forex route segment: ${levelId}/${segment}`);
  }

  if (courseMatches) return { ...context, kind: "course" as const };
  if (lesson) return { ...context, kind: "lesson" as const, lesson };
  return undefined;
}

export function getGenericForexModule(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  const context = getGenericForexLevelContext(levelId);
  if (
    !context ||
    context.course.id !== courseId ||
    context.module.id !== moduleId
  ) {
    return undefined;
  }

  return context;
}
