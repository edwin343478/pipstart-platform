import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getCurriculumModule,
  getLearningPath,
} from "../../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-8/crypto-risk-and-portfolios/sizing-leverage-and-portfolio-risk",
  title: "Sizing Leverage and Portfolio Risk",
  description:
    "Four complete lessons covering loss budgets, leverage, portfolio dependencies, purchase schedules and records, with practice and a fifteen-question quiz.",
});

export default function CryptoRiskPortfoliosModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-risk-and-portfolios");
  const level = getCurriculumLevel("crypto", "level-8");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "sizing-leverage-and-portfolio-risk",
  );

  if (!learningPath || !level || !course || !curriculumModule) notFound();

  return (
    <CurriculumPage
      course={course}
      kind="module"
      learningPath={learningPath}
      level={level}
      module={curriculumModule}
    />
  );
}
