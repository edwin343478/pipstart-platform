import { notFound } from "next/navigation";

import { forexLevelPageContext } from "../../../../lib/forex-level-routing";
import { ForexContextLesson } from "../forex-context-lesson";

export default function ForexLevelOnePage() {
  const route = forexLevelPageContext("level-1");
  if (!route) notFound();

  return <ForexContextLesson context={route} lesson={route.lesson} />;
}
