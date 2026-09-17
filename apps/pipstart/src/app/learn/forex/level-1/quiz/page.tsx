import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { ForexFoundationsQuiz } from "./quiz-client";

export const metadata: Metadata = {
  title: { absolute: "Forex Foundations Quiz | PipStart" },
  description:
    "Check your understanding of the six Forex Foundations lessons with a short module quiz.",
  alternates: { canonical: "/learn/forex/level-1/quiz" },
};

export default function ForexFoundationsQuizPage() {
  const assessment = getCurrentPublishedAssessment("forex-foundations-quiz");
  if (!assessment) notFound();

  return <ForexFoundationsQuiz assessment={toPublicAssessment(assessment)} />;
}
