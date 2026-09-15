export type OrderedLesson = {
  href: `/${string}`;
  id: string;
  position: number;
  status: "draft" | "published";
};

export function sortPublishedLessons<T extends OrderedLesson>(
  lessons: readonly T[],
): T[] {
  return [...lessons]
    .filter((lesson) => lesson.status === "published")
    .sort((first, second) => first.position - second.position);
}

export function getLessonNavigation<T extends OrderedLesson>(
  lessons: readonly T[],
  lessonId: string,
) {
  const published = sortPublishedLessons(lessons);
  const index = published.findIndex((lesson) => lesson.id === lessonId);

  if (index < 0) return undefined;

  return {
    current: published[index],
    next: published[index + 1],
    position: index + 1,
    previous: published[index - 1],
    total: published.length,
  };
}

export function getContinueLearningLesson<T extends OrderedLesson>(
  lessons: readonly T[],
  completedLessonIds: readonly string[],
): T | undefined {
  const published = sortPublishedLessons(lessons);
  const completed = new Set(completedLessonIds);

  return published.find((lesson) => !completed.has(lesson.id));
}

export type ContinueLearningState<T extends OrderedLesson> =
  | { status: "empty" }
  | { status: "complete" }
  | { lesson: T; status: "lesson" };

export function getContinueLearningState<T extends OrderedLesson>(
  lessons: readonly T[],
  completedLessonIds: readonly string[],
): ContinueLearningState<T> {
  const published = sortPublishedLessons(lessons);
  if (published.length === 0) return { status: "empty" };

  const lesson = getContinueLearningLesson(published, completedLessonIds);
  return lesson ? { lesson, status: "lesson" } : { status: "complete" };
}
