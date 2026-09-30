import { notFound } from "next/navigation";

import { CurriculumPage } from "../../../../../../components/curriculum-page";
import { getLearningPath } from "../../../../../../lib/curriculum";
import {
  getGenericForexModule,
  getGenericForexModuleParams,
} from "../../../../../../lib/forex-level-routing";
import { createDynamicPageMetadata } from "../../../../../../lib/seo";

// Published curriculum resolvers below remain the authority for valid routes.
export const dynamicParams = true;

export function generateStaticParams() {
  return getGenericForexModuleParams();
}

type GenericForexModulePageProps = {
  params: Promise<{ level: string; module: string; segment: string }>;
};

export async function generateMetadata({
  params,
}: GenericForexModulePageProps) {
  const { level, module, segment } = await params;
  const route = getGenericForexModule(level, segment, module);
  if (!route) return {};

  return createDynamicPageMetadata({
    path: route.module.href,
    title: route.module.title,
    description: route.module.description,
  });
}

export default async function GenericForexModulePage({
  params,
}: GenericForexModulePageProps) {
  const { level, module, segment } = await params;
  const route = getGenericForexModule(level, segment, module);
  if (!route) notFound();

  const learningPath = getLearningPath("forex");
  if (!learningPath) notFound();

  return (
    <CurriculumPage
      course={route.course}
      kind="module"
      learningPath={learningPath}
      level={route.level}
      module={route.module}
    />
  );
}
