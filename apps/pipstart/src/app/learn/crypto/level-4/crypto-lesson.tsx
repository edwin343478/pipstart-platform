import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_FOUR_PROGRESS_KEY } from "./progress";

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
      contextTitle="Ethereum Contracts and Connected Networks"
      contextHref="/learn/crypto/level-4/crypto-ethereum-and-networks"
      progressKey={CRYPTO_LEVEL_FOUR_PROGRESS_KEY}
    />
  );
}
