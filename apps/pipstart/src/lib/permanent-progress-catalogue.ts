import "server-only";
import { learningPaths } from "./curriculum";

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
