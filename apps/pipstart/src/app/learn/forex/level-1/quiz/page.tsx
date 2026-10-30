import { getForexQuizClientContext } from "../../../../../lib/forex-quiz-context";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { forexLevelQuiz } from "../../../../../lib/forex-level-routing";
import { ForexFoundationsQuiz } from "./quiz-client";

export const metadata: Metadata = {
  title: { absolute: "Forex Foundations Quiz | PipStart" },
  description:
    "Check your understanding of the six Forex Foundations lessons with a short module quiz.",
  alternates: { canonical: "/learn/forex/level-1/quiz" },
};

export default function ForexFoundationsQuizPage() {
  // The level quiz is found by its URL in the curriculum; its ID is the published assessment.
  const found = forexLevelQuiz("level-1");
  const assessment = found && getCurrentPublishedAssessment(found.quiz.id);
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
