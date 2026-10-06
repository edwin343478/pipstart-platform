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
  path: "/learn/crypto/level-4/crypto-ethereum-and-networks/ethereum-contracts-and-connected-networks",
  title: "Ethereum Contracts and Connected Networks",
  description:
    "Five complete Ethereum, smart-contract, gas, token-standard and bridge lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoEthereumModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-ethereum-and-networks");
  const level = getCurriculumLevel("crypto", "level-4");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "ethereum-contracts-and-connected-networks",
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
