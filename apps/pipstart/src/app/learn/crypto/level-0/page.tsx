import { cryptoOrientationLessons } from "../../../../lib/crypto-orientation-routing";
import { createDynamicMetadata } from "../../../../lib/seo";
import { CryptoOrientationLesson } from "./crypto-orientation-lesson";
const lesson = cryptoOrientationLessons[0]!;
export const metadata = createDynamicMetadata({
  path: lesson.href,
  title: lesson.seoTitle,
  description: lesson.seoDescription,
});
export default function CryptoLevelZeroPage() {
  return <CryptoOrientationLesson lesson={lesson} />;
}
