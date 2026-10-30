import { notFound } from "next/navigation";

import {
  forexQuizMetadata,
  getGenericForexModuleQuiz,
  getGenericForexModuleQuizParams,
} from "../../../../../../../lib/forex-level-routing";
import { forexQuizPage } from "../../../../forex-level-pages";

// A quiz added under its module (MP05c-1b); modules without one return not found.
export const dynamicParams = true;

export function generateStaticParams() {
  return getGenericForexModuleQuizParams();
}

type GenericForexModuleQuizPageProps = {
  params: Promise<{ level: string; module: string; segment: string }>;
};

export async function generateMetadata({
  params,
}: GenericForexModuleQuizPageProps) {
  const { level, module, segment } = await params;
  const route = getGenericForexModuleQuiz(level, segment, module);
  if (!route) return {};

  return forexQuizMetadata(route.quiz.href, route.quiz.title, route.module);
}

export default async function GenericForexModuleQuizPage({
  params,
}: GenericForexModuleQuizPageProps) {
  const { level, module, segment } = await params;
  const route = getGenericForexModuleQuiz(level, segment, module);
  if (!route) notFound();

  return forexQuizPage(route.quiz.id);
}
