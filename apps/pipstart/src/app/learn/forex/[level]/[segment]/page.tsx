import { toPublicAssessment } from "../../../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../../../lib/assessment-registry";
import { ForexFoundationsQuiz } from "../../level-1/quiz/quiz-client";
import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  createDynamicMetadata,
  createDynamicPageMetadata,
} from "../../../../../lib/seo";
import {
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
} from "../../../../../lib/forex-level-routing";
import { getLearningPath } from "../../../../../lib/curriculum";
import ForexLessonPage from "../../level-1/forex-lesson";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGenericForexSecondSegmentParams();
}

type GenericForexSecondSegmentPageProps = {
  params: Promise<{ level: string; segment: string }>;
};

export async function generateMetadata({
  params,
}: GenericForexSecondSegmentPageProps) {
  const { level, segment } = await params;
  const route = getGenericForexSecondSegment(level, segment);
  if (!route) return {};

  if (route.kind === "quiz") {
    return createDynamicPageMetadata({
      path: `/learn/forex/${route.level.id}/quiz`,
      title: route.quizTarget!.label,
      description: `Review the ${route.module.title} lessons with a module quiz.`,
    });
  }

  if (route.kind === "lesson") {
    return createDynamicMetadata({
      path: route.lesson.href,
      title: route.lesson.seoTitle,
      description: route.lesson.seoDescription,
    });
  }

  return createDynamicPageMetadata({
    path: route.course.href,
    title: route.course.title,
    description: route.course.description,
  });
}

export default async function GenericForexSecondSegmentPage({
  params,
}: GenericForexSecondSegmentPageProps) {
  const { level, segment } = await params;
  const route = getGenericForexSecondSegment(level, segment);
  if (!route) notFound();

  if (route.kind === "quiz") {
    const entry = route.module.lessons.find((item) => item.type === "quiz");
    const assessment = entry && getCurrentPublishedAssessment(entry.id);
    if (!assessment) notFound();
    return <ForexFoundationsQuiz assessment={toPublicAssessment(assessment)} />;
  }

  if (route.kind === "lesson") {
    return (
      <ForexLessonPage
        courseHref={route.course.href}
        courseTitle={route.course.title}
        lesson={route.lesson}
        lessons={route.lessons}
        progressKey={route.progressKey}
        quizTarget={route.quizTarget}
      />
    );
  }

  const learningPath = getLearningPath("forex");
  if (!learningPath) notFound();

  return (
    <CurriculumPage
      course={route.course}
      kind="course"
      learningPath={learningPath}
      level={route.level}
    />
  );
}
