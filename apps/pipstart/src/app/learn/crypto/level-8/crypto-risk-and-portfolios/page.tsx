import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-8/crypto-risk-and-portfolios",
  title: "Sizing, Leverage and Portfolio Risk",
  description:
    "Four complete lessons covering loss budgets, leverage, portfolio dependencies, purchase schedules and records, with practice and a fifteen-question quiz.",
});

export default function CryptoRiskPortfoliosCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-risk-and-portfolios");
  const level = getCurriculumLevel("crypto", "level-8");

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
