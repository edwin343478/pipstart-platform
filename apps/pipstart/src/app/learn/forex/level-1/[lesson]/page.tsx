import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../../lib/seo";
import ForexLessonPage from "../forex-lesson";
import { forexLessons, getForexLesson } from "../lessons";

export function generateStaticParams() {
  return forexLessons.slice(1).map((lesson) => ({ lesson: lesson.slug }));
}

type ForexLessonRouteProps = {
  params: Promise<{ lesson: string }>;
};

export async function generateMetadata({ params }: ForexLessonRouteProps) {
  const { lesson: lessonSlug } = await params;
  const lesson = getForexLesson(lessonSlug);
  if (!lesson || lesson.position === 1) return {};

  return createDynamicMetadata({
    path: lesson.href,
    title: lesson.title,
    description: lesson.introduction,
  });
}

export default async function ForexLessonRoute({
  params,
}: ForexLessonRouteProps) {
  const { lesson: lessonSlug } = await params;
  const lesson = getForexLesson(lessonSlug);

  if (!lesson || lesson.position === 1) notFound();

  return <ForexLessonPage lesson={lesson} />;
}
