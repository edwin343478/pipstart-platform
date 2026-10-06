import "server-only";

import { LessonPage } from "../../../../components/lesson-page";
import { type CryptoLesson, cryptoLessons } from "./lessons";
import { CRYPTO_LEVEL_SIX_PROGRESS_KEY } from "./progress";

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
      contextTitle="DeFi Liquidity Lending and Rewards"
      contextHref="/learn/crypto/level-6/crypto-defi-foundations"
      progressKey={CRYPTO_LEVEL_SIX_PROGRESS_KEY}
    />
  );
}
