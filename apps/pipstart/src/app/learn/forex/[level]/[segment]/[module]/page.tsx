import { notFound } from "next/navigation";

import {
  forexCurriculumMetadata,
  getGenericForexModule,
  getGenericForexModuleParams,
} from "../../../../../../lib/forex-level-routing";
import { ForexCurriculumPage } from "../../../forex-level-pages";

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

  return forexCurriculumMetadata(route.module);
}

export default async function GenericForexModulePage({
  params,
}: GenericForexModulePageProps) {
  const { level, module, segment } = await params;
  const route = getGenericForexModule(level, segment, module);
  if (!route) notFound();

  return (
    <ForexCurriculumPage
      course={route.course}
      level={route.level}
      module={route.module}
    />
  );
}
