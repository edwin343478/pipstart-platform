import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_TEN_PROGRESS_KEY } from "./progress";

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
      contextTitle="Advanced Awareness and Graduation"
      contextHref="/learn/crypto/level-10/crypto-advanced-and-graduation"
      progressKey={CRYPTO_LEVEL_TEN_PROGRESS_KEY}
    />
  );
}
