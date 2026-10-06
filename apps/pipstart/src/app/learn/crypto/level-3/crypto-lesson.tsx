import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_THREE_PROGRESS_KEY } from "./progress";

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
      contextTitle="Exchanges Stablecoins and Market Orders"
      contextHref="/learn/crypto/level-3/crypto-exchanges-and-markets"
      progressKey={CRYPTO_LEVEL_THREE_PROGRESS_KEY}
    />
  );
}
