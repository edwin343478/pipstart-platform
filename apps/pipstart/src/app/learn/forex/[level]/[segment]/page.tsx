import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../../lib/seo";
import {
  forexCurriculumMetadata,
  forexLevelQuiz,
  forexQuizMetadata,
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
} from "../../../../../lib/forex-level-routing";
import { ForexContextLesson } from "../../forex-context-lesson";
import { ForexCurriculumPage, forexQuizPage } from "../../forex-level-pages";

// Published curriculum resolvers below remain the authority for valid routes.
export const dynamicParams = true;

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
    return forexQuizMetadata(
      `/learn/forex/${route.level.id}/quiz`,
      route.quizTarget!.label,
      route.module,
    );
  }

  if (route.kind === "lesson") {
    return createDynamicMetadata({
      path: route.lesson.href,
      title: route.lesson.seoTitle,
      description: route.lesson.seoDescription,
    });
  }

  return forexCurriculumMetadata(route.course);
}

export default async function GenericForexSecondSegmentPage({
  params,
}: GenericForexSecondSegmentPageProps) {
  const { level, segment } = await params;
  const route = getGenericForexSecondSegment(level, segment);
  if (!route) notFound();

  if (route.kind === "quiz") {
    const found = forexLevelQuiz(route.level.id);
    if (!found) notFound();
    return forexQuizPage(found.quiz.id);
  }

  if (route.kind === "lesson") {
    return <ForexContextLesson context={route} lesson={route.lesson} />;
  }

  return <ForexCurriculumPage course={route.course} level={route.level} />;
}
