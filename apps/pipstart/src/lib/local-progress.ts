export type StoredLessonProgress = {
  completedLessonIds: string[];
  version: 1;
};

export function parseLocalProgress(
  storedValue: string | null,
  validLessonIds: readonly string[],
): string[] {
  if (!storedValue) return [];

  try {
    const parsed = JSON.parse(storedValue) as Partial<StoredLessonProgress> & {
      completedLessonSlugs?: unknown;
    };
    const storedIds = Array.isArray(parsed.completedLessonIds)
      ? parsed.completedLessonIds
      : parsed.completedLessonSlugs;

    if (parsed.version !== 1 || !Array.isArray(storedIds)) return [];

    const completed = new Set(
      storedIds.filter(
        (id): id is string =>
          typeof id === "string" && validLessonIds.includes(id),
      ),
    );

    return validLessonIds.filter((id) => completed.has(id));
  } catch {
    return [];
  }
}

export function serializeLocalProgress(completedLessonIds: string[]): string {
  return JSON.stringify({ completedLessonIds, version: 1 });
}

export function toggleLocalProgress(
  storedValue: string | null,
  lessonId: string,
  validLessonIds: readonly string[],
): string {
  const completed = new Set(parseLocalProgress(storedValue, validLessonIds));

  if (completed.has(lessonId)) completed.delete(lessonId);
  else if (validLessonIds.includes(lessonId)) completed.add(lessonId);

  return serializeLocalProgress(
    validLessonIds.filter((id) => completed.has(id)),
  );
}
