import "server-only";

import {
  getLearningQuizContext,
  getLearningQuizClientContext,
} from "./learning-quiz-context";

// Keep the established exports and progress/assessment contracts.
export function getCryptoOrientationQuizContext(
  courseId: string,
  moduleId?: string,
) {
  return getLearningQuizContext("crypto", courseId, moduleId);
}
export function getCryptoOrientationQuizClientContext(
  courseId: string,
  moduleId?: string,
) {
  return getLearningQuizClientContext("crypto", courseId, moduleId);
}
