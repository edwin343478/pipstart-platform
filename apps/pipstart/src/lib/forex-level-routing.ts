import type { Metadata } from "next";

import type { PublishedLesson } from "../content/lesson-registry";
import {
  getCurriculumLevel,
  getLearningPath,
  type CurriculumCourse,
  type CurriculumLevel,
  type CurriculumModule,
} from "./curriculum";
import { curriculumPresentation } from "./curriculum-presentation";
import {
  forexCourseLessons,
  forexLevelPageLesson,
} from "./forex-level-lessons";
import { getLearningProgressStorageKey } from "./learning-progress-storage";
import {
  createDynamicPageMetadata,
  createPageMetadata,
  seoEntries,
} from "./seo";

// M22 MP05c-1b: every Forex course, module, lesson and quiz is resolved from the curriculum and
// lesson registry, for any number of courses and modules per level (D04: levels stay code).
// Level 1 keeps its own route tree, which calls the unrestricted resolvers; the generic
// [level] routes call the getGenericForex* functions, which leave Level 1 to that tree.
export const LEGACY_FOREX_LEVEL_ID = "level-1";

export type ForexLevelRouteContext = {
  contextTitle: string;
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

function moduleLabel(moduleId: string) {
  return moduleId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const quizItems = (found: CurriculumModule) =>
  found.lessons.filter((item) => item.type === "quiz");

/** Lesson context for one module: its course's lessons, breadcrumb, progress key and quiz link. */
function moduleContext(
  level: CurriculumLevel,
  course: CurriculumCourse,
  found: CurriculumModule,
): ForexLevelRouteContext | undefined {
  const lessons = forexCourseLessons(level.id, course.id);
  if (!lessons.length) return undefined;
  const quiz = quizItems(found)[0];
  return {
    contextTitle:
      curriculumPresentation[found.id]?.lessonContextTitle ??
      moduleLabel(found.id),
    course,
    level,
    lessons,
    module: found,
    progressKey: forexProgressStorageKey(level.id, course.id),
    quizTarget: quiz
      ? {
          href: quiz.href,
          label: curriculumPresentation[quiz.id]?.lessonQuizLabel ?? quiz.title,
        }
      : null,
  };
}

function lessonContext(level: CurriculumLevel, lesson: PublishedLesson) {
  const course = level.courses.find((entry) => entry.id === lesson.course);
  const found = course?.modules.find((entry) => entry.id === lesson.module);
  return course && found ? moduleContext(level, course, found) : undefined;
}

const forexLevel = (levelId: string) => getCurriculumLevel("forex", levelId);

// A level's position-1 lesson is the level page, so it never takes a second URL segment.
const laterLessons = (level: CurriculumLevel) =>
  level.courses.flatMap((course) =>
    forexCourseLessons(level.id, course.id).filter(
      (lesson) => lesson.position !== 1,
    ),
  );

function levelPageContext(levelId: string) {
  const level = forexLevel(levelId);
  const lesson = forexLevelPageLesson(levelId);
  return level && lesson ? lessonContext(level, lesson) : undefined;
}

/** The level page: the course and module of the level's position-1 lesson, and that lesson. */
export function forexLevelPageContext(levelId: string) {
  const context = levelPageContext(levelId);
  const lesson = forexLevelPageLesson(levelId);
  return context && lesson ? { ...context, lesson } : undefined;
}

/** The existing level quiz keeps its URL /learn/forex/<level>/quiz. */
export function forexLevelQuiz(levelId: string) {
  const href = `/learn/forex/${levelId}/quiz`;
  for (const course of forexLevel(levelId)?.courses ?? [])
    for (const found of course.modules)
      for (const quiz of quizItems(found))
        if (quiz.href === href) return { course, module: found, quiz };
  return undefined;
}

/** The segment after the level: a course, the level quiz or a later lesson of any course. */
export function resolveForexSegment(levelId: string, segment: string) {
  const level = forexLevel(levelId);
  if (!level) return undefined;
  if (segment === "quiz") {
    const found = forexLevelQuiz(levelId);
    const context = found && moduleContext(level, found.course, found.module);
    return context ? { ...context, kind: "quiz" as const } : undefined;
  }
  const course = level.courses.find((entry) => entry.id === segment);
  const lesson = laterLessons(level).find((entry) => entry.slug === segment);
  if (course && lesson)
    throw new Error(`Ambiguous Forex route segment: ${levelId}/${segment}`);
  if (course) {
    const first = course.modules[0];
    const context = first && moduleContext(level, course, first);
    return context ? { ...context, kind: "course" as const } : undefined;
  }
  const context = lesson && lessonContext(level, lesson);
  return context && lesson
    ? { ...context, kind: "lesson" as const, lesson }
    : undefined;
}

/** Second segments in route order: courses, the level quiz, then later lessons. */
export function forexSegmentParams(levelId: string) {
  const level = forexLevel(levelId);
  if (!level) return [];
  const segments = [
    ...level.courses.map((course) => course.id),
    ...(forexLevelQuiz(levelId) ? ["quiz"] : []),
    ...laterLessons(level).map((lesson) => lesson.slug),
  ];
  if (new Set(segments).size !== segments.length)
    throw new Error(`Ambiguous Forex route segment in ${levelId}`);
  return segments;
}

export function resolveForexModule(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  const level = forexLevel(levelId);
  const course = level?.courses.find((entry) => entry.id === courseId);
  const found = course?.modules.find((entry) => entry.id === moduleId);
  return level && course && found
    ? moduleContext(level, course, found)
    : undefined;
}

export function forexModuleParams(levelId: string) {
  return (forexLevel(levelId)?.courses ?? []).flatMap((course) =>
    course.modules.map((entry) => ({ segment: course.id, module: entry.id })),
  );
}

/** A new quiz lives under its module: /learn/forex/<level>/<course>/<module>/quiz. */
export function resolveForexModuleQuiz(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  const context = resolveForexModule(levelId, courseId, moduleId);
  const quiz =
    context &&
    quizItems(context.module).find(
      (item) => item.href === `${context.module.href}/quiz`,
    );
  return context && quiz ? { ...context, quiz } : undefined;
}

export function forexModuleQuizParams(levelId: string) {
  return forexModuleParams(levelId).filter(({ segment, module }) =>
    resolveForexModuleQuiz(levelId, segment, module),
  );
}

/** A central SEO entry wins; otherwise the item's own title and description. */
export function forexCurriculumMetadata(
  item: CurriculumCourse | CurriculumModule,
): Metadata {
  if (seoEntries.some((entry) => entry.path === item.href))
    return createPageMetadata(item.href);
  return createDynamicPageMetadata({
    path: item.href,
    title: item.title,
    description: item.description,
  });
}

export function forexQuizMetadata(
  path: `/${string}`,
  label: string,
  found: CurriculumModule,
) {
  return createDynamicPageMetadata({
    path,
    title: label,
    description: `Review the ${found.title} lessons with a module quiz.`,
  });
}

// The generic [level] route tree: every published Forex level except Level 1.
const generic = (levelId: string) => levelId !== LEGACY_FOREX_LEVEL_ID;

export function getGenericForexLevelContext(
  levelId: string,
): ForexLevelRouteContext | undefined {
  return generic(levelId) ? levelPageContext(levelId) : undefined;
}

export function getGenericForexLevelParams() {
  return (
    getLearningPath("forex")
      ?.levels.filter((level) => generic(level.id))
      .filter((level) => Boolean(levelPageContext(level.id)))
      .map((level) => ({ level: level.id })) ?? []
  );
}

export function getGenericForexSecondSegmentParams() {
  return getGenericForexLevelParams().flatMap(({ level }) =>
    forexSegmentParams(level).map((segment) => ({ level, segment })),
  );
}

export function getGenericForexModuleParams() {
  return getGenericForexLevelParams().flatMap(({ level }) =>
    forexModuleParams(level).map((params) => ({ level, ...params })),
  );
}

export function getGenericForexModuleQuizParams() {
  return getGenericForexLevelParams().flatMap(({ level }) =>
    forexModuleQuizParams(level).map((params) => ({ level, ...params })),
  );
}

export function getGenericForexLevelRootLesson(levelId: string) {
  return generic(levelId) ? forexLevelPageContext(levelId) : undefined;
}

export function getGenericForexSecondSegment(levelId: string, segment: string) {
  return generic(levelId) ? resolveForexSegment(levelId, segment) : undefined;
}

export function getGenericForexModule(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  return generic(levelId)
    ? resolveForexModule(levelId, courseId, moduleId)
    : undefined;
}

export function getGenericForexModuleQuiz(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  return generic(levelId)
    ? resolveForexModuleQuiz(levelId, courseId, moduleId)
    : undefined;
}
