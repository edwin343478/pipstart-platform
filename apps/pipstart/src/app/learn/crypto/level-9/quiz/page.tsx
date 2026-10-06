import { notFound } from "next/navigation";
import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../../../lib/crypto-orientation-quiz-context";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { ForexFoundationsQuiz } from "../../../forex/level-1/quiz/quiz-client";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-9/quiz",
  title: "Psychology Planning and Paper Practice Quiz",
  description:
    "Check your understanding of biases, plans, testing limits and paper-practice results with fifteen questions.",
});
export default function CryptoPlanningPracticeQuizPage() {
  const assessment = getCurrentPublishedAssessment(
    "crypto-planning-and-practice-quiz",
  );
  const context =
    assessment &&
    getCryptoOrientationQuizClientContext(
      assessment.courseId,
      assessment.moduleId,
    );
  if (!assessment || !context) notFound();
  return (
    <ForexFoundationsQuiz
      assessment={toPublicAssessment(assessment)}
      context={context}
    />
  );
}
