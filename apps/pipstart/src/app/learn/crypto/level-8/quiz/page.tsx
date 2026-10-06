import { notFound } from "next/navigation";
import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../../../lib/crypto-orientation-quiz-context";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { ForexFoundationsQuiz } from "../../../forex/level-1/quiz/quiz-client";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-8/quiz",
  title: "Sizing Leverage and Portfolio Risk Quiz",
  description:
    "Check your understanding of sizing, leverage, portfolio risk, recurring purchases and records with fifteen questions.",
});
export default function CryptoRiskPortfoliosQuizPage() {
  const assessment = getCurrentPublishedAssessment(
    "crypto-risk-and-portfolios-quiz",
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
