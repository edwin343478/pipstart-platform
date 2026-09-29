import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../lib/seo";
import {
  getGenericForexLevelParams,
  getGenericForexLevelRootLesson,
} from "../../../../lib/forex-level-routing";
import ForexLessonPage from "../level-1/forex-lesson";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGenericForexLevelParams();
}

type GenericForexLevelPageProps = {
  params: Promise<{ level: string }>;
};

export async function generateMetadata({ params }: GenericForexLevelPageProps) {
  const { level } = await params;
  const route = getGenericForexLevelRootLesson(level);
  if (!route) return {};

  return createDynamicMetadata({
    path: route.lesson.href,
    title: route.lesson.seoTitle,
    description: route.lesson.seoDescription,
  });
}

export default async function GenericForexLevelPage({
  params,
}: GenericForexLevelPageProps) {
  const { level } = await params;
  const route = getGenericForexLevelRootLesson(level);
  if (!route) notFound();

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
