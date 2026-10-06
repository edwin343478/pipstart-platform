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
  path: "/learn/crypto/level-6/crypto-defi-foundations/defi-liquidity-lending-and-rewards",
  title: "DeFi Liquidity Lending and Rewards",
  description:
    "Five complete DeFi lessons covering swaps, liquidity provision, lending, rewards and protocol dependencies, with practice and a fifteen-question quiz.",
});

export default function CryptoDefiModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-defi-foundations");
  const level = getCurriculumLevel("crypto", "level-6");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "defi-liquidity-lending-and-rewards",
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
