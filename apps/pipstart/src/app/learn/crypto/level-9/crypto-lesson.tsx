import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_NINE_PROGRESS_KEY } from "./progress";

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
      contextTitle="Psychology Planning and Paper Practice"
      contextHref="/learn/crypto/level-9/crypto-planning-and-practice"
      progressKey={CRYPTO_LEVEL_NINE_PROGRESS_KEY}
    />
  );
}
