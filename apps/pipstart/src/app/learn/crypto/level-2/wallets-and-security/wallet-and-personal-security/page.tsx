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
  path: "/learn/crypto/level-2/wallets-and-security/wallet-and-personal-security",
  title: "Wallets and Personal Security",
  description:
    "Five complete wallet and personal-security lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoWalletModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "wallets-and-security");
  const level = getCurriculumLevel("crypto", "level-2");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "wallet-and-personal-security",
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
