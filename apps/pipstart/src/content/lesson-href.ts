import type { LessonMetadata } from "./lesson-content";

type LessonRouteMetadata = Pick<
  LessonMetadata,
  "learningPath" | "level" | "position" | "slug"
>;

// The first lesson of a level is the level page itself. Kept apart from the lesson registry so
// the store rebuild (lib/content/import/shadow.ts) can use it without an import cycle.
export function buildLessonHref(metadata: LessonRouteMetadata): `/${string}` {
  const levelRoot =
    `/learn/${metadata.learningPath}/${metadata.level}` as const;
  return metadata.position === 1 ? levelRoot : `${levelRoot}/${metadata.slug}`;
}
