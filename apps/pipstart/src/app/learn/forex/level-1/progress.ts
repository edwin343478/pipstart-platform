import {
  parseLocalProgress,
  toggleLocalProgress,
} from "../../../../lib/local-progress";

export const FOREX_LEVEL_ONE_PROGRESS_KEY =
  "pipstart:learn:forex:level-1:progress";
export const FOREX_PROGRESS_CHANGE_EVENT = "pipstart:forex-progress-change";

export function parseLessonProgress(
  storedValue: string | null,
  validLessonSlugs: readonly string[],
): string[] {
  return parseLocalProgress(storedValue, validLessonSlugs);
}

export function serializeLessonProgress(
  completedLessonSlugs: string[],
): string {
  // Preserve the original Forex payload shape for existing browser data and
  // previously shipped clients while using the shared parser internally.
  return JSON.stringify({ completedLessonSlugs, version: 1 });
}

export function toggleLessonProgress(
  storedValue: string | null,
  lessonSlug: string,
  validLessonSlugs: readonly string[],
): string {
  const sharedValue = toggleLocalProgress(
    storedValue,
    lessonSlug,
    validLessonSlugs,
  );
  const completed = parseLocalProgress(sharedValue, validLessonSlugs);
  return serializeLessonProgress(completed);
}
