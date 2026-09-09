import { notFound } from "next/navigation";

import ForexLessonPage from "../forex-lesson";
import { forexLessons, getForexLesson } from "../lessons";

export function generateStaticParams() {
  return forexLessons.slice(1).map((lesson) => ({ lesson: lesson.slug }));
}

export default async function ForexLessonRoute({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson: lessonSlug } = await params;
  const lesson = getForexLesson(lessonSlug);

  if (!lesson || lesson.position === 1) notFound();

  return <ForexLessonPage lesson={lesson} />;
}
