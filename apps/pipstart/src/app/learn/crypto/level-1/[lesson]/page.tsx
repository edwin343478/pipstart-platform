import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../../lib/seo";
import { CryptoLessonPage } from "../crypto-lesson";
import { cryptoLessons } from "../lessons";
import {
  getSecondaryLesson,
  getSecondaryLessonParams,
} from "../../../../../lib/secondary-lesson-routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSecondaryLessonParams(cryptoLessons);
}

type CryptoLessonRouteProps = {
  params: Promise<{ lesson: string }>;
};

export async function generateMetadata({ params }: CryptoLessonRouteProps) {
  const { lesson: lessonSlug } = await params;
  const lesson = getSecondaryLesson(cryptoLessons, lessonSlug);
  if (!lesson) return {};

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
  const lesson = getSecondaryLesson(cryptoLessons, lessonSlug);
  if (!lesson) notFound();

  return <CryptoLessonPage lesson={lesson} />;
}
