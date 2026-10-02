import "server-only";

import LearnForexPage from "./forex-index-client";
import { forexLessons } from "./level-1/lessons";

export default function ForexPage() {
  const lessons = forexLessons
    .filter((lesson) => lesson.status === "published" && lesson.approved)
    .map((lesson) => ({
      id: lesson.slug,
      href: lesson.href,
      position: lesson.position,
      status: lesson.status,
    }));
  return <LearnForexPage lessons={lessons} />;
}
