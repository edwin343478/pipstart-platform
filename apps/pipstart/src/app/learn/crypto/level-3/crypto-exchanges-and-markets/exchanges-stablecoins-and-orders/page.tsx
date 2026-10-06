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
  path: "/learn/crypto/level-3/crypto-exchanges-and-markets/exchanges-stablecoins-and-orders",
  title: "Exchanges Stablecoins and Market Orders",
  description:
    "Five complete exchange, stablecoin and market-order lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoExchangeModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-exchanges-and-markets");
  const level = getCurriculumLevel("crypto", "level-3");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "exchanges-stablecoins-and-orders",
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
