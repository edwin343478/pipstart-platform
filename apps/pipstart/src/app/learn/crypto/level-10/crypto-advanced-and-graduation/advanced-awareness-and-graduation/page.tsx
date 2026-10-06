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
  path: "/learn/crypto/level-10/crypto-advanced-and-graduation/advanced-awareness-and-graduation",
  title: "Advanced Awareness and Graduation",
  description:
    "Four complete lessons covering network security, governance, product claims and the seven-part graduation workbook, with practice and a fifteen-question quiz.",
});

export default function CryptoPlanningPracticeModulePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse(
    "crypto",
    "crypto-advanced-and-graduation",
  );
  const level = getCurriculumLevel("crypto", "level-10");
  const curriculumModule = getCurriculumModule(
    "crypto",
    "advanced-awareness-and-graduation",
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
