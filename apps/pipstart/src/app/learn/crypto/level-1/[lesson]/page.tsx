import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../../lib/seo";
import CryptoLevelOnePage from "../page";
import { cryptoLessons, getCryptoLesson } from "../lessons";

export const dynamicParams = false;

export function generateStaticParams() {
  return cryptoLessons.slice(1).map((lesson) => ({ lesson: lesson.slug }));
}

type CryptoLessonRouteProps = {
  params: Promise<{ lesson: string }>;
};

export async function generateMetadata({ params }: CryptoLessonRouteProps) {
  const { lesson: lessonSlug } = await params;
  const lesson = getCryptoLesson(lessonSlug);
  if (!lesson || lesson.position === 1) return {};

  return createDynamicMetadata({
    path: lesson.href,
    title: lesson.seoTitle,
    description: lesson.seoDescription,
  });
}

export default async function CryptoLessonRoute({
  params,
}: CryptoLessonRouteProps) {
  const { lesson: lessonSlug } = await params;
  const lesson = getCryptoLesson(lessonSlug);
  if (!lesson || lesson.position === 1) notFound();

  return <CryptoLevelOnePage lesson={lesson} />;
}
