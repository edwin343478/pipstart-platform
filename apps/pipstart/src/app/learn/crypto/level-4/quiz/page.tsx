import { notFound } from "next/navigation";
import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../../../lib/crypto-orientation-quiz-context";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { ForexFoundationsQuiz } from "../../../forex/level-1/quiz/quiz-client";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-4/quiz",
  title: "Ethereum Contracts and Connected Networks Quiz",
  description:
    "Check your understanding of Ethereum, smart contracts, gas, tokens and bridges with fifteen questions.",
});
export default function CryptoEthereumQuizPage() {
  const assessment = getCurrentPublishedAssessment(
    "crypto-ethereum-networks-quiz",
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
