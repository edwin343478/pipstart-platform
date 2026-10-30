import { notFound } from "next/navigation";

import { createDynamicMetadata } from "../../../../../lib/seo";
import {
  forexCurriculumMetadata,
  forexSegmentParams,
  resolveForexSegment,
} from "../../../../../lib/forex-level-routing";
import { ForexContextLesson } from "../../forex-context-lesson";
import { ForexCurriculumPage } from "../../forex-level-pages";

// Resolve requests against the published lessons, including in development.
export const dynamicParams = true;

// A course page or a later lesson page, both resolved from data. Level 1's quiz has its own
// static route, so "quiz" is not a segment here.
const resolve = (segment: string) => {
  const route =
    segment === "quiz" ? undefined : resolveForexSegment("level-1", segment);
  return route?.kind === "quiz" ? undefined : route;
};

export function generateStaticParams() {
  return forexSegmentParams("level-1")
    .filter((segment) => segment !== "quiz")
    .map((segment) => ({ lesson: segment }));
}

type ForexLessonRouteProps = {
  params: Promise<{ lesson: string }>;
};

export async function generateMetadata({ params }: ForexLessonRouteProps) {
  const { lesson: segment } = await params;
  const route = resolve(segment);
  if (!route) return {};
  if (route.kind === "course") return forexCurriculumMetadata(route.course);

  return createDynamicMetadata({
    path: route.lesson.href,
    title: route.lesson.seoTitle,
    description: route.lesson.seoDescription,
  });
}

export default async function ForexLessonRoute({
  params,
}: ForexLessonRouteProps) {
  const { lesson: segment } = await params;
  const route = resolve(segment);
  if (!route) notFound();
  if (route.kind === "course")
    return <ForexCurriculumPage course={route.course} level={route.level} />;

  return <ForexContextLesson context={route} lesson={route.lesson} />;
}
