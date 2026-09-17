import type {
  CurriculumAssessmentRequirement,
  CurriculumCourse,
  CurriculumLesson,
  CurriculumModule,
} from "./curriculum";
import { learningPaths } from "./curriculum";

export type LessonProgressRecord = {
  completedAt: string | null;
  isComplete: boolean;
  lastVisitedAt: string;
  lessonId: string;
  revision: number;
};
export type AssessmentCompletionRecord = {
  assessmentId: string;
  earnedAt: string;
  highestPassedVersion: number;
  lastPassedAt: string;
};
export type ProgressSnapshot = {
  assessments?: AssessmentCompletionRecord[];
  authenticated: boolean;
  lessons: LessonProgressRecord[];
};

export function getPublishedLessonContext(lessonId: string) {
  for (const path of learningPaths)
    for (const level of path.levels)
      for (const course of level.courses)
        for (const curriculumModule of course.modules)
          if (
            curriculumModule.lessons.some(
              (lesson) => lesson.type === "lesson" && lesson.id === lessonId,
            )
          )
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
function lessonItems(lessons: readonly CurriculumLesson[]) {
  return lessons.filter((lesson) => lesson.type === "lesson");
}
export function getCourseLessonIds(course: CurriculumCourse) {
  return course.modules.flatMap((curriculumModule) =>
    lessonItems(curriculumModule.lessons).map((lesson) => lesson.id),
  );
}
export function completedLessonIds(snapshot: ProgressSnapshot) {
  return snapshot.lessons
    .filter((lesson) => lesson.isComplete)
    .map((lesson) => lesson.lessonId);
}
export function completedAssessmentIds(snapshot: ProgressSnapshot) {
  return (snapshot.assessments ?? []).map((item) => item.assessmentId);
}
function assessmentIds(
  requirements: readonly CurriculumAssessmentRequirement[] | undefined,
) {
  return (requirements ?? []).map((requirement) => requirement.assessmentId);
}
function unique(values: readonly string[]) {
  return [...new Set(values)];
}
export function getModuleRequiredAssessmentIds(
  curriculumModule: CurriculumModule,
) {
  return unique([
    ...assessmentIds(curriculumModule.assessmentRequirements),
    ...curriculumModule.lessons.flatMap((lesson) =>
      assessmentIds(lesson.assessmentRequirements),
    ),
  ]);
}
export function getCourseRequiredAssessmentIds(course: CurriculumCourse) {
  return unique([
    ...assessmentIds(course.assessmentRequirements),
    ...course.modules.flatMap(getModuleRequiredAssessmentIds),
  ]);
}
export function calculateProgress(
  lessons: readonly CurriculumLesson[],
  completedIds: readonly string[],
) {
  const publishedLessons = lessonItems(lessons);
  const completed = new Set(completedIds);
  const count = publishedLessons.filter((lesson) =>
    completed.has(lesson.id),
  ).length;
  return {
    completed: count,
    percentage: publishedLessons.length
      ? Math.round((count / publishedLessons.length) * 100)
      : 0,
    total: publishedLessons.length,
  };
}
function calculateAssessmentProgress(
  requiredAssessmentIds: readonly string[],
  snapshot: ProgressSnapshot,
) {
  const passed = new Set(completedAssessmentIds(snapshot));
  const completed = requiredAssessmentIds.filter((id) => passed.has(id)).length;
  return {
    complete: completed === requiredAssessmentIds.length,
    completed,
    total: requiredAssessmentIds.length,
  };
}
export function calculateModuleCompletion(
  curriculumModule: CurriculumModule,
  snapshot: ProgressSnapshot,
) {
  const lessons = calculateProgress(
    curriculumModule.lessons,
    completedLessonIds(snapshot),
  );
  const assessments = calculateAssessmentProgress(
    getModuleRequiredAssessmentIds(curriculumModule),
    snapshot,
  );
  return {
    assessments,
    complete: lessons.completed === lessons.total && assessments.complete,
    lessons,
  };
}
export function calculateCourseCompletion(
  course: CurriculumCourse,
  snapshot: ProgressSnapshot,
) {
  const lessons = calculateProgress(
    course.modules.flatMap((curriculumModule) => curriculumModule.lessons),
    completedLessonIds(snapshot),
  );
  const assessments = calculateAssessmentProgress(
    getCourseRequiredAssessmentIds(course),
    snapshot,
  );
  return {
    assessments,
    complete: lessons.completed === lessons.total && assessments.complete,
    lessons,
  };
}
export function selectContinueLesson(
  course: CurriculumCourse,
  snapshot: ProgressSnapshot,
) {
  const lessons = course.modules.flatMap((curriculumModule) =>
    lessonItems(curriculumModule.lessons),
  );
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
