import "server-only";

// M22 MP05c-1b: a Forex lesson page in its own course and module context. Kept apart from
// forex-level-pages.tsx so lesson-only routes do not load the curriculum page or quiz client.
import type { PublishedLesson } from "../../../content/lesson-registry";
import type { ForexLevelRouteContext } from "../../../lib/forex-level-routing";
import ForexLessonPage from "./level-1/forex-lesson";

export function ForexContextLesson({
  context,
  lesson,
}: {
  context: ForexLevelRouteContext;
  lesson: PublishedLesson;
}) {
  return (
    <ForexLessonPage
      contextTitle={context.contextTitle}
      courseHref={context.course.href}
      courseTitle={context.course.title}
      lesson={lesson}
      lessons={context.lessons}
      progressKey={context.progressKey}
      quizTarget={context.quizTarget}
    />
  );
}
