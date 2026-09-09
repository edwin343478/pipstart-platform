export const FOREX_LEVEL_ONE_PROGRESS_KEY =
  "pipstart:learn:forex:level-1:progress";

type StoredLessonProgress = {
  completedLessonSlugs: string[];
  version: 1;
};

export function parseLessonProgress(
  storedValue: string | null,
  validLessonSlugs: readonly string[],
): string[] {
  if (!storedValue) return [];

  try {
    const parsed = JSON.parse(storedValue) as Partial<StoredLessonProgress>;
    if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonSlugs)) {
      return [];
    }

    const validSlugs = new Set(validLessonSlugs);
    return [
      ...new Set(
        parsed.completedLessonSlugs.filter(
          (slug): slug is string =>
            typeof slug === "string" && validSlugs.has(slug),
        ),
      ),
    ];
  } catch {
    return [];
  }
}

export function serializeLessonProgress(
  completedLessonSlugs: string[],
): string {
  const progress: StoredLessonProgress = {
    completedLessonSlugs,
    version: 1,
  };

  return JSON.stringify(progress);
}

export function toggleLessonProgress(
  storedValue: string | null,
  lessonSlug: string,
  validLessonSlugs: readonly string[],
): string {
  const completed = new Set(parseLessonProgress(storedValue, validLessonSlugs));

  if (completed.has(lessonSlug)) completed.delete(lessonSlug);
  else if (validLessonSlugs.includes(lessonSlug)) completed.add(lessonSlug);

  return serializeLessonProgress([...completed]);
}
