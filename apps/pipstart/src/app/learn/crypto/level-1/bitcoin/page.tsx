import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createPageMetadata } from "../../../../../lib/seo";

export const metadata = createPageMetadata("/learn/crypto/level-1/bitcoin");

export default function BitcoinCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "bitcoin");

  if (!learningPath || !course) notFound();

  return (
    <CurriculumPage course={course} kind="course" learningPath={learningPath} />
  );
}
