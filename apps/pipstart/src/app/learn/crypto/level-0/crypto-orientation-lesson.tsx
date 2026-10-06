import "server-only";
import { LessonPage } from "../../../../components/lesson-page";
import type { PublishedLesson } from "../../../../content/lesson-registry";
import {
  cryptoOrientationLessons,
  cryptoOrientationProgressKey,
} from "../../../../lib/crypto-orientation-routing";
export function CryptoOrientationLesson({
  lesson,
}: {
  lesson: PublishedLesson;
}) {
  return (
    <LessonPage
      path="crypto"
      lesson={lesson}
      lessons={cryptoOrientationLessons}
      contextTitle="Orientation and Safety"
      contextHref="/learn/crypto/level-0/crypto-orientation"
      progressKey={cryptoOrientationProgressKey}
      quizTarget={{
        href: "/learn/crypto/level-0/quiz",
        label: "Take the Crypto Orientation and Safety quiz",
      }}
    />
  );
}
