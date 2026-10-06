import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-7/crypto-charts-and-evidence",
  title: "Charts Market Context and Evidence",
  description:
    "Five complete chart and evidence lessons covering price structure, market context, derivatives data, on-chain measurements and research notes, with practice and a fifteen-question quiz.",
});

export default function CryptoChartsEvidenceCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-charts-and-evidence");
  const level = getCurriculumLevel("crypto", "level-7");

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
