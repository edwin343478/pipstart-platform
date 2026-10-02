import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_ONE_PROGRESS_KEY } from "./progress";

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
      contextTitle="Bitcoin"
      contextHref="/learn/crypto/level-1/bitcoin"
      progressKey={CRYPTO_LEVEL_ONE_PROGRESS_KEY}
    />
  );
}
