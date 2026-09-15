import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createPageMetadata } from "../../../../../lib/seo";

export const metadata = createPageMetadata(
  "/learn/forex/level-1/forex-kindergarten",
);

export default function ForexKindergartenPage() {
  const learningPath = getLearningPath("forex");
  const course = getCurriculumCourse("forex", "forex-kindergarten");
  const level = getCurriculumLevel("forex", "level-1");

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
