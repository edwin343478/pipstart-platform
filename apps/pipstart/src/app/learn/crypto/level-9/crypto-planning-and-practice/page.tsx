import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  getCurriculumCourse,
  getCurriculumLevel,
  getLearningPath,
} from "../../../../../lib/curriculum";
import { createDynamicMetadata } from "../../../../../lib/seo";

export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-9/crypto-planning-and-practice",
  title: "Psychology Planning and Paper Practice",
  description:
    "Four complete lessons covering decision habits, written plans, honest testing and paper-practice review, with practice and a fifteen-question quiz.",
});

export default function CryptoPlanningPracticeCoursePage() {
  const learningPath = getLearningPath("crypto");
  const course = getCurriculumCourse("crypto", "crypto-planning-and-practice");
  const level = getCurriculumLevel("crypto", "level-9");

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
