import { notFound } from "next/navigation";

import {
  forexModuleQuizParams,
  forexQuizMetadata,
  resolveForexModuleQuiz,
} from "../../../../../../../lib/forex-level-routing";
import { forexQuizPage } from "../../../../forex-level-pages";

// A quiz added under its module (MP05c-1b); modules without one return not found.
export const dynamicParams = true;

export function generateStaticParams() {
  return forexModuleQuizParams("level-1").map(({ segment, module }) => ({
    lesson: segment,
    module,
  }));
}

type ForexModuleQuizRouteProps = {
  params: Promise<{ lesson: string; module: string }>;
};

export async function generateMetadata({ params }: ForexModuleQuizRouteProps) {
  const { lesson, module } = await params;
  const route = resolveForexModuleQuiz("level-1", lesson, module);
  return route
    ? forexQuizMetadata(route.quiz.href, route.quiz.title, route.module)
    : {};
}

export default async function ForexModuleQuizRoute({
  params,
}: ForexModuleQuizRouteProps) {
  const { lesson, module } = await params;
  const route = resolveForexModuleQuiz("level-1", lesson, module);
  if (!route) notFound();

  return forexQuizPage(route.quiz.id);
}
