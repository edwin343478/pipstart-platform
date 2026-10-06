import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_EIGHT_PROGRESS_KEY } from "./progress";

export function CryptoLessonPage({
  lesson = cryptoLessons[0]!,
}: {
  lesson?: CryptoLesson;
}) {
  return (
    <LessonPage
      path="crypto"
      lesson={lesson}
      lessons={cryptoLessons}
      contextTitle="Sizing Leverage and Portfolio Risk"
      contextHref="/learn/crypto/level-8/crypto-risk-and-portfolios"
      progressKey={CRYPTO_LEVEL_EIGHT_PROGRESS_KEY}
    />
  );
}
