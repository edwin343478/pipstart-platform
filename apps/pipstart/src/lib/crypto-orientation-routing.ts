import "server-only";
import { getPublishedLessons } from "../content/lesson-registry";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getCurriculumModule,
  getLearningPath,
} from "./curriculum";
import { getLearningProgressStorageKey } from "./learning-progress-storage";
export const cryptoOrientationLessons = getPublishedLessons({
  learningPath: "crypto",
  level: "level-0",
  course: "crypto-orientation",
  module: "crypto-orientation-and-safety",
});
export function getCryptoOrientationHierarchy() {
  const learningPath = getLearningPath("crypto");
  const level = getCurriculumLevel("crypto", "level-0");
  const course = getCurriculumCourse("crypto", "crypto-orientation");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "crypto-orientation-and-safety",
  );
  if (!learningPath || !level || !course || !curriculumModule)
    throw new Error("Crypto orientation hierarchy is missing");
  return { learningPath, level, course, module: curriculumModule };
}
export const cryptoOrientationProgressKey = getLearningProgressStorageKey(
  "crypto",
  "level-0",
  "crypto-orientation",
);
