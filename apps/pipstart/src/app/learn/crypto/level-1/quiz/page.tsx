import { notFound } from "next/navigation";
import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../../../lib/crypto-orientation-quiz-context";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { ForexFoundationsQuiz } from "../../../forex/level-1/quiz/quiz-client";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-1/quiz",
  title: "Bitcoin and Shared Ledgers Quiz",
  description:
    "Check your understanding of the five Bitcoin and shared-ledger lessons with fifteen questions.",
});
export default function CryptoBitcoinQuizPage() {
  const assessment = getCurrentPublishedAssessment("bitcoin-foundations-quiz");
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
