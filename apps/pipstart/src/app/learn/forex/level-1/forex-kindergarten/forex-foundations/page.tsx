import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getCurriculumModule,
  getLearningPath,
} from "../../../../../../lib/curriculum";
import { createPageMetadata } from "../../../../../../lib/seo";

export const metadata = createPageMetadata(
  "/learn/forex/level-1/forex-kindergarten/forex-foundations",
);

export default function ForexFoundationsPage() {
  const learningPath = getLearningPath("forex");
  const course = getCurriculumCourse("forex", "forex-kindergarten");
  const level = getCurriculumLevel("forex", "level-1");
  const curriculumModule = getCurriculumModule("forex", "forex-foundations");

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
