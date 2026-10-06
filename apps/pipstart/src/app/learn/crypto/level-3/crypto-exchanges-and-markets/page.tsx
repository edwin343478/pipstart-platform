import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-3/crypto-exchanges-and-markets",
  title: "Exchanges Stablecoins and Market Orders",
  description:
    "Five complete exchange, stablecoin and market-order lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoExchangeCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-exchanges-and-markets");
  const level = getCurriculumLevel("crypto", "level-3");

  if (!learningPath || !level || !course) notFound();

  return (
    <CurriculumPage
      course={course}
      kind="course"
      learningPath={learningPath}
      level={level}
    />
  );
}
