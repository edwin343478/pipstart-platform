import { notFound } from "next/navigation";
import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../../../lib/crypto-orientation-quiz-context";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { ForexFoundationsQuiz } from "../../../forex/level-1/quiz/quiz-client";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-6/quiz",
  title: "DeFi Liquidity Lending and Rewards Quiz",
  description:
    "Check your understanding of swaps, liquidity provision, lending, rewards and DeFi dependencies with fifteen questions.",
});
export default function CryptoDefiQuizPage() {
  const assessment = getCurrentPublishedAssessment(
    "crypto-defi-foundations-quiz",
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
