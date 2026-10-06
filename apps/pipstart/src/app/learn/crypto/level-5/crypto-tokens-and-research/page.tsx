import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-5/crypto-tokens-and-research",
  title: "Tokens, Supply and Research",
  description:
    "Four complete token-category, supply, vesting and research lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoTokenResearchCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-tokens-and-research");
  const level = getCurriculumLevel("crypto", "level-5");

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
