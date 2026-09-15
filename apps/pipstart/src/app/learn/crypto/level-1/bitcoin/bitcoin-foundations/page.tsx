import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumModule,
  getLearningPath,
} from "../../../../../../lib/curriculum";
import { createPageMetadata } from "../../../../../../lib/seo";

export const metadata = createPageMetadata(
  "/learn/crypto/level-1/bitcoin/bitcoin-foundations",
);

export default function BitcoinFoundationsPage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "bitcoin");
  const curriculumModule = getCurriculumModule("crypto", "bitcoin-foundations");

  if (!learningPath || !course || !curriculumModule) notFound();

  return (
    <CurriculumPage
      course={course}
      kind="module"
      learningPath={learningPath}
      module={curriculumModule}
    />
  );
}
