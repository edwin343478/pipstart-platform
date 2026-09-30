import { getPublishedLessons } from "../content/lesson-registry";
import { getCurriculumCourse, getCurriculumModule } from "./curriculum";
import { getLearningProgressStorageKey } from "./learning-progress-storage";

export function getForexQuizContext(courseId: string, moduleId?: string) {
  const course = getCurriculumCourse("forex", courseId);
  const curriculumModule = moduleId
    ? getCurriculumModule("forex", moduleId)
    : undefined;
  if (
    !course ||
    !curriculumModule ||
    !course.modules.some((item) => item.id === curriculumModule.id)
  )
    return undefined;
  const quiz = curriculumModule.lessons.find((item) => item.type === "quiz");
  const lessons = getPublishedLessons({
    learningPath: "forex",
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
    progressKey: getLearningProgressStorageKey("forex", levelId, course.id),
  };
}
