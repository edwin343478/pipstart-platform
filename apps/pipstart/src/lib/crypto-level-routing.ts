import "server-only";

// M22 MP05c data-driven Crypto routing for levels 1-10. Every course, module, lesson and quiz is
// found from the curriculum and lesson registry, so a new course, module, lesson or quiz inside
// an existing level needs no route edit (D04). Levels themselves stay code. The per-level route
// files are thin wrappers that pass their level ID to these functions.
import type { Metadata } from "next";
import type { PublishedLesson } from "../content/lesson-registry";
import {
  type CurriculumCourse,
  type CurriculumLesson,
  type CurriculumModule,
  getCurriculumLevel,
  getLearningPath,
} from "./curriculum";
import { cryptoCourseLessons } from "./crypto-level-lessons";
import { curriculumPresentation } from "./curriculum-presentation";
import { getLearningProgressStorageKey } from "./learning-progress-storage";
import {
  createDynamicMetadata,
  createPageMetadata,
  seoEntries,
  type SeoEntry,
} from "./seo";

export function cryptoLevel(levelId: string) {
  const learningPath = getLearningPath("crypto");
  const level = getCurriculumLevel("crypto", levelId);
  return learningPath && level ? { learningPath, level } : undefined;
}

const cryptoCourses = (levelId: string) =>
  cryptoLevel(levelId)?.level.courses ?? [];

const findCourse = (levelId: string, courseId: string) =>
  cryptoCourses(levelId).find((course) => course.id === courseId);

/** Breadcrumb context, lesson list and progress key for a lesson's own course. */
export function cryptoLessonContext(levelId: string, courseId: string) {
  const course = findCourse(levelId, courseId);
  if (!course) return undefined;
  return {
    lessons: cryptoCourseLessons(levelId, course.id),
    contextTitle:
      curriculumPresentation[course.id]?.lessonContextTitle ?? course.title,
    contextHref: course.href,
    progressKey: getLearningProgressStorageKey("crypto", levelId, course.id),
  };
}

// A level's position-1 lesson is the level page, so it never takes a second URL segment.
const laterLessons = (levelId: string) =>
  cryptoCourses(levelId).flatMap((course) =>
    cryptoCourseLessons(levelId, course.id).filter(
      (lesson) => lesson.position !== 1,
    ),
  );

export type CryptoSegment =
  | { kind: "course"; course: CurriculumCourse }
  | { kind: "lesson"; lesson: PublishedLesson };

/** The segment after the level is a course or a later lesson of any course in the level. */
export function resolveCryptoSegment(
  levelId: string,
  segment: string,
): CryptoSegment | undefined {
  const course = findCourse(levelId, segment);
  const lesson = laterLessons(levelId).find((entry) => entry.slug === segment);
  if (course && lesson)
    throw new Error(`Ambiguous Crypto route segment: ${levelId}/${segment}`);
  if (course) return { kind: "course", course };
  if (lesson) return { kind: "lesson", lesson };
  return undefined;
}

export function cryptoSegmentParams(levelId: string) {
  return [
    ...cryptoCourses(levelId).map((course) => ({ lesson: course.id })),
    ...laterLessons(levelId).map((lesson) => ({ lesson: lesson.slug })),
  ];
}

export function resolveCryptoModule(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  const course = findCourse(levelId, courseId);
  const found = course?.modules.find((entry) => entry.id === moduleId);
  return course && found ? { course, module: found } : undefined;
}

// Next 16 passes parent params only from layouts, so nested routes list their full params.
export function cryptoModuleParams(levelId: string) {
  return cryptoCourses(levelId).flatMap((course) =>
    course.modules.map((entry) => ({ lesson: course.id, module: entry.id })),
  );
}

const quizItems = (found: CurriculumModule) =>
  found.lessons.filter((item) => item.type === "quiz");

/** The existing level quiz keeps its URL /learn/crypto/<level>/quiz. */
export function cryptoLevelQuiz(levelId: string) {
  const href = `/learn/crypto/${levelId}/quiz`;
  for (const course of cryptoCourses(levelId))
    for (const found of course.modules)
      for (const quiz of quizItems(found))
        if (quiz.href === href) return { course, module: found, quiz };
  return undefined;
}

/** A new quiz lives under its module: /learn/crypto/<level>/<course>/<module>/quiz. */
export function resolveCryptoModuleQuiz(
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  const found = resolveCryptoModule(levelId, courseId, moduleId);
  const quiz =
    found &&
    quizItems(found.module).find(
      (item) => item.href === `${found.module.href}/quiz`,
    );
  return found && quiz ? { ...found, quiz } : undefined;
}

export function cryptoModuleQuizParams(levelId: string) {
  return cryptoModuleParams(levelId).filter(({ lesson, module }) =>
    resolveCryptoModuleQuiz(levelId, lesson, module),
  );
}

/** A central SEO entry wins, then the item's own SEO, then text derived from the item. */
function curriculumMetadata(
  item: CurriculumCourse | CurriculumModule | CurriculumLesson,
  derived: Pick<SeoEntry, "title" | "description">,
): Metadata {
  if (seoEntries.some((entry) => entry.path === item.href))
    return createPageMetadata(item.href);
  const seo = curriculumPresentation[item.id]?.seo ?? derived;
  return createDynamicMetadata({
    path: item.href,
    title: seo.title,
    description: seo.description,
  });
}

export const cryptoCourseMetadata = (course: CurriculumCourse) =>
  curriculumMetadata(course, course);

export const cryptoModuleMetadata = (found: CurriculumModule) =>
  curriculumMetadata(found, found);

export const cryptoQuizMetadata = (
  quiz: CurriculumLesson,
  found: CurriculumModule,
) =>
  curriculumMetadata(quiz, {
    title: quiz.title,
    description: found.description,
  });

export const cryptoLessonMetadata = (lesson: PublishedLesson) =>
  createDynamicMetadata({
    path: lesson.href,
    title: lesson.seoTitle,
    description: lesson.seoDescription,
  });
