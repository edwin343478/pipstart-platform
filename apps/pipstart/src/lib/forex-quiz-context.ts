import "server-only";

import {
  getLearningQuizContext,
  getLearningQuizClientContext,
} from "./learning-quiz-context";

// Keep the established exports and progress/assessment contracts.
export function getForexQuizContext(courseId: string, moduleId?: string) {
  return getLearningQuizContext("forex", courseId, moduleId);
}
export function getForexQuizClientContext(courseId: string, moduleId?: string) {
  return getLearningQuizClientContext("forex", courseId, moduleId);
}
