import { notFound } from "next/navigation";

import {
  forexCurriculumMetadata,
  forexModuleParams,
  resolveForexModule,
} from "../../../../../../lib/forex-level-routing";
import { ForexCurriculumPage } from "../../../forex-level-pages";

export const dynamicParams = true;

// Next passes parent params only from layouts, so this route lists its full params.
export function generateStaticParams() {
  return forexModuleParams("level-1").map(({ segment, module }) => ({
    lesson: segment,
    module,
  }));
}

type ForexModuleRouteProps = {
  params: Promise<{ lesson: string; module: string }>;
};

export async function generateMetadata({ params }: ForexModuleRouteProps) {
  const { lesson, module } = await params;
  const route = resolveForexModule("level-1", lesson, module);
  return route ? forexCurriculumMetadata(route.module) : {};
}

export default async function ForexModuleRoute({
  params,
}: ForexModuleRouteProps) {
  const { lesson, module } = await params;
  const route = resolveForexModule("level-1", lesson, module);
  if (!route) notFound();

  return (
    <ForexCurriculumPage
      course={route.course}
      level={route.level}
      module={route.module}
    />
  );
}
