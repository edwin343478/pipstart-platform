import "server-only";

// M22 MP05c-1b shared Forex course, module and quiz pages. Both the Level 1 route tree and the
// generic [level] routes render through these (lesson pages: forex-context-lesson.tsx).
import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../components/curriculum-page";
import { toPublicAssessment } from "../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../lib/assessment-registry";
import type {
  CurriculumCourse,
  CurriculumLevel,
  CurriculumModule,
} from "../../../lib/curriculum";
import { getLearningPath } from "../../../lib/curriculum";
import { getForexQuizClientContext } from "../../../lib/forex-quiz-context";
import { ForexFoundationsQuiz } from "./level-1/quiz/quiz-client";

export function ForexCurriculumPage({
  course,
  level,
  module,
}: {
  course: CurriculumCourse;
  level: CurriculumLevel;
  module?: CurriculumModule;
}) {
  const learningPath = getLearningPath("forex");
  if (!learningPath) notFound();
  return module ? (
    <CurriculumPage
      course={course}
      kind="module"
      learningPath={learningPath}
      level={level}
      module={module}
    />
  ) : (
    <CurriculumPage
      course={course}
      kind="course"
      learningPath={learningPath}
      level={level}
    />
  );
}

/** The quiz page element itself (pages return it directly, as before). */
export function forexQuizPage(assessmentId: string) {
  const assessment = getCurrentPublishedAssessment(assessmentId);
  const context =
    assessment &&
    getForexQuizClientContext(assessment.courseId, assessment.moduleId);
  if (!assessment || !context) notFound();
  return (
    <ForexFoundationsQuiz
      assessment={toPublicAssessment(assessment)}
      context={context}
    />
  );
}
