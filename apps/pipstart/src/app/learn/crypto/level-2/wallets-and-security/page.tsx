import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-2/wallets-and-security",
  title: "Wallets and Personal Security",
  description:
    "Five complete wallet and personal-security lessons with examples, practice and a fifteen-question quiz.",
});

export default function CryptoWalletCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "wallets-and-security");
  const level = getCurriculumLevel("crypto", "level-2");

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
