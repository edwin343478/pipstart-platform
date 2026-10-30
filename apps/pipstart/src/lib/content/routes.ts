// M22 MP04b route/resolver contract: one pure mapping between content and public URLs,
// equal to today's URLs for the whole inventory (parity-tested), plus the rules a new item
// must satisfy so its URL is unambiguous. Wiring generated items into routes is MP05.
import type { LearningPath } from "./contract";

export type RouteTarget =
  | { kind: "path"; path: LearningPath }
  | { kind: "level"; path: LearningPath; level: string }
  | { kind: "course"; path: LearningPath; level: string; course: string }
  | {
      kind: "module";
      path: LearningPath;
      level: string;
      course: string;
      module: string;
    }
  | {
      kind: "lesson";
      path: LearningPath;
      level: string;
      slug: string;
      position: number;
    }
  | { kind: "quiz"; path: LearningPath; level: string; id?: string }
  | { kind: "analysis"; slug: string };

/** One URL segment: lowercase words joined by single hyphens. */
export const routeSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const QUIZ = "quiz";

export function hrefFor(target: RouteTarget): `/${string}` {
  switch (target.kind) {
    case "analysis":
      return `/analysis/${target.slug}`;
    case "path":
      return `/learn/${target.path}`;
    case "level":
      return `/learn/${target.path}/${target.level}`;
    case "course":
      return `/learn/${target.path}/${target.level}/${target.course}`;
    case "module":
      return `/learn/${target.path}/${target.level}/${target.course}/${target.module}`;
    case "lesson":
      // The first lesson of a level is the level page itself.
      return target.position === 1
        ? `/learn/${target.path}/${target.level}`
        : `/learn/${target.path}/${target.level}/${target.slug}`;
    case "quiz":
      return `/learn/${target.path}/${target.level}/${QUIZ}`;
  }
}

const isPath = (value: string): value is LearningPath =>
  value === "forex" || value === "crypto";

/**
 * Every target a URL could mean, by shape alone. A level URL is also its first lesson,
 * and a third segment is a course or a later lesson; the inventory decides which.
 */
export function routeCandidates(href: string): RouteTarget[] {
  const parts = href.split("/");
  if (
    parts[0] !== "" ||
    parts.slice(1).some((part) => !routeSegment.test(part))
  )
    return [];
  const [, root, path, level, third, fourth, ...rest] = parts;
  if (root === "analysis" && path && level === undefined)
    return [{ kind: "analysis", slug: path }];
  if (root !== "learn" || !path || !isPath(path) || rest.length) return [];
  if (level === undefined) return [{ kind: "path", path }];
  if (third === undefined)
    return [
      { kind: "level", path, level },
      { kind: "lesson", path, level, slug: "", position: 1 },
    ];
  if (fourth !== undefined)
    return [{ kind: "module", path, level, course: third, module: fourth }];
  if (third === QUIZ) return [{ kind: "quiz", path, level }];
  return [
    { kind: "course", path, level, course: third },
    { kind: "lesson", path, level, slug: third, position: 0 },
  ];
}

export type RouteConflict = { href: string; reason: string };

/**
 * The rules that keep every URL unambiguous. Within a level, "quiz", course ids and the
 * slugs of later lessons share one namespace; lesson slugs are unique per path; every
 * segment is a plain lowercase slug; and each level has at most one quiz URL.
 */
export function checkRouteSpace(
  targets: readonly RouteTarget[],
): RouteConflict[] {
  const conflicts: RouteConflict[] = [];
  const owners = new Map<string, string>();
  const claim = (key: string, owner: string, href: string) => {
    const previous = owners.get(key);
    if (previous !== undefined && previous !== owner)
      conflicts.push({ href, reason: `${owner} collides with ${previous}` });
    else owners.set(key, owner);
  };
  for (const target of targets) {
    const href = hrefFor(target);
    const segments = Object.entries(target).filter(
      ([key]) => !["kind", "path", "position", "id"].includes(key),
    );
    if (
      segments.some(
        ([key, value]) =>
          !(
            target.kind === "lesson" &&
            target.position === 1 &&
            key === "slug"
          ) && !routeSegment.test(String(value)),
      ) ||
      (target.kind === "course" && target.course === QUIZ) ||
      (target.kind === "lesson" &&
        target.position !== 1 &&
        target.slug === QUIZ)
    ) {
      conflicts.push({ href, reason: "Invalid or reserved URL segment" });
      continue;
    }
    if (target.kind === "lesson") {
      claim(
        `slug:${target.path}:${target.slug}`,
        `lesson ${target.level}/${target.slug}`,
        href,
      );
      if (target.position === 1)
        claim(
          `first:${target.path}:${target.level}`,
          `first lesson ${target.slug}`,
          href,
        );
      else
        claim(
          `name:${target.path}:${target.level}:${target.slug}`,
          `lesson ${target.slug}`,
          href,
        );
    } else if (target.kind === "course")
      claim(
        `name:${target.path}:${target.level}:${target.course}`,
        `course ${target.course}`,
        href,
      );
    else if (target.kind === "quiz")
      claim(
        `name:${target.path}:${target.level}:${QUIZ}`,
        `quiz ${target.id ?? target.level}`,
        href,
      );
    else if (target.kind === "module")
      claim(href, `module ${target.module}`, href);
    else if (target.kind === "analysis")
      claim(href, `analysis ${target.slug}`, href);
  }
  return conflicts;
}
