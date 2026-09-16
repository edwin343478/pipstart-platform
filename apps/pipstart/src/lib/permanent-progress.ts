import type { CurriculumCourse, CurriculumLesson } from "./curriculum";
import { learningPaths } from "./curriculum";

export type LessonProgressRecord = {
  completedAt: string | null;
  isComplete: boolean;
  lastVisitedAt: string;
  lessonId: string;
  revision: number;
};
export type ProgressSnapshot = {
  authenticated: boolean;
  lessons: LessonProgressRecord[];
};

export function getPublishedLessonContext(lessonId: string) {
  for (const path of learningPaths)
    for (const level of path.levels)
      for (const course of level.courses)
        for (const curriculumModule of course.modules)
          if (curriculumModule.lessons.some((lesson) => lesson.id === lessonId))
            return {
              courseId: course.id,
              lessonId,
              moduleId: curriculumModule.id,
            };
}

export function getPublishedCourse(courseId: string) {
  return learningPaths
    .flatMap((path) => path.levels)
    .flatMap((level) => level.courses)
    .find((course) => course.id === courseId);
}
export function getCourseLessonIds(course: CurriculumCourse) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.id),
  );
}
export function completedLessonIds(snapshot: ProgressSnapshot) {
  return snapshot.lessons
    .filter((lesson) => lesson.isComplete)
    .map((lesson) => lesson.lessonId);
}
export function calculateProgress(
  lessons: readonly CurriculumLesson[],
  completedIds: readonly string[],
) {
  const completed = new Set(completedIds);
  const count = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return {
    completed: count,
    percentage: lessons.length ? Math.round((count / lessons.length) * 100) : 0,
    total: lessons.length,
  };
}
export function selectContinueLesson(
  course: CurriculumCourse,
  snapshot: ProgressSnapshot,
) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const complete = new Set(completedLessonIds(snapshot));
  const recent = [...snapshot.lessons]
    .filter((item) => !item.isComplete && byId.has(item.lessonId))
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt))[0];
  return recent
    ? byId.get(recent.lessonId)
    : lessons.find((lesson) => !complete.has(lesson.id));
}
export function assertUniqueCurriculumIds() {
  const seen = new Set<string>();
  for (const path of learningPaths)
    for (const level of path.levels)
      for (const course of level.courses)
        for (const curriculumModule of course.modules)
          for (const lesson of curriculumModule.lessons) {
            if (seen.has(lesson.id))
              throw new Error(`Duplicate published lesson id: ${lesson.id}`);
            seen.add(lesson.id);
          }
}
