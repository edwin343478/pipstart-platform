import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-4/crypto-ethereum-and-networks",
  title: "Ethereum Contracts and Connected Networks",
  description:
    "Five complete Ethereum, smart-contract, gas, token-standard and bridge lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoEthereumCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-ethereum-and-networks");
  const level = getCurriculumLevel("crypto", "level-4");

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
