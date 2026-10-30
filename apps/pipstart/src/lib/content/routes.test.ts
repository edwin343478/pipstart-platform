import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "../../app/sitemap";
import { codeRouteTargets } from "./code-adapter";
import {
  checkRouteSpace,
  hrefFor,
  type RouteTarget,
  routeCandidates,
} from "./routes";

const inventory = codeRouteTargets();
const targets = inventory.map((entry) => entry.target);
const same = (a: RouteTarget, b: RouteTarget) =>
  a.kind === b.kind &&
  (a.kind === "lesson" && b.kind === "lesson"
    ? a.path === b.path &&
      a.level === b.level &&
      (a.position === 1 ? b.position === 1 : a.slug === b.slug)
    : hrefFor(a) === hrefFor(b));

// Page route patterns under app/learn and app/analysis, e.g. /learn/forex/[level]/[segment].
const app = resolve(__dirname, "../../app");
const pages = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? pages(join(dir, entry.name))
      : entry.name === "page.tsx"
        ? ["/" + relative(app, dir).replaceAll("\\", "/")]
        : [],
  );
const patterns = [
  ...pages(join(app, "learn")),
  ...pages(join(app, "analysis")),
].map((route) => new RegExp("^" + route.replace(/\[[^\]]+\]/g, "[^/]+") + "$"));
const hasPageRoute = (href: string) => patterns.some((p) => p.test(href));

describe("M22 MP04b route/resolver contract", () => {
  it("gives every published item exactly the URL the site uses today", () => {
    expect(inventory.length).toBeGreaterThan(100);
    for (const { target, href } of inventory)
      expect(hrefFor(target), JSON.stringify(target)).toBe(href);
  });

  it("covers every learning and analysis URL in the sitemap, and resolves each back", () => {
    const known = new Set(inventory.map((entry) => entry.href));
    const urls = sitemap()
      .map((entry) => new URL(entry.url).pathname.replace(/\/$/, ""))
      .filter((path) => /^\/(learn|analysis)\//.test(path));
    expect(urls.length).toBeGreaterThan(100);
    for (const path of urls) {
      expect(known, path).toContain(path);
      const meant = inventory.filter((entry) => entry.href === path);
      for (const { target } of meant)
        expect(
          routeCandidates(path).some((candidate) => same(candidate, target)),
          path,
        ).toBe(true);
    }
  });

  it("finds no URL conflict in today's inventory", () => {
    expect(checkRouteSpace(targets)).toEqual([]);
  });

  it("refuses new items that would make a URL ambiguous", () => {
    const lesson = inventory.find(
      (entry) => entry.target.kind === "lesson" && entry.target.position > 1,
    )!.target as Extract<RouteTarget, { kind: "lesson" }>;
    const course = targets.find(
      (target) => target.kind === "course" && target.path === lesson.path,
    ) as Extract<RouteTarget, { kind: "course" }>;
    const quiz = targets.find((target) => target.kind === "quiz") as Extract<
      RouteTarget,
      { kind: "quiz" }
    >;
    const cases: [string, RouteTarget][] = [
      [
        "lesson slug equal to a course id in its level",
        { ...lesson, level: course.level, slug: course.course, position: 9 },
      ],
      [
        "lesson slug already used in the path",
        { ...lesson, level: "level-99", position: 2 },
      ],
      ["a second quiz in a level", { ...quiz, id: "another-quiz" }],
      ["a lesson slugged quiz", { ...lesson, slug: "quiz", position: 3 }],
      [
        "a course named quiz",
        { kind: "course", path: "forex", level: "level-2", course: "quiz" },
      ],
      ["a malformed segment", { ...lesson, slug: "Bad Slug", position: 4 }],
    ];
    for (const [label, extra] of cases)
      expect(checkRouteSpace([...targets, extra]), label).not.toEqual([]);
  });

  it("gives a generated new item an unambiguous URL that resolves back", () => {
    const fresh: RouteTarget[] = [
      {
        kind: "lesson",
        path: "forex",
        level: "level-3",
        slug: "mp04b-generated-lesson",
        position: 9,
      },
      {
        kind: "lesson",
        path: "crypto",
        level: "level-2",
        slug: "mp04b-generated-lesson-crypto",
        position: 9,
      },
      {
        kind: "module",
        path: "forex",
        level: "level-3",
        course: "charts",
        module: "mp04b-generated-module",
      },
      {
        kind: "course",
        path: "forex",
        level: "level-3",
        course: "mp04b-generated-course",
      },
      { kind: "analysis", slug: "mp04b-generated-post" },
    ];
    expect(checkRouteSpace([...targets, ...fresh])).toEqual([]);
    for (const target of fresh)
      expect(
        routeCandidates(hrefFor(target)).some((c) => same(c, target)),
        hrefFor(target),
      ).toBe(true);
  });

  it("records which new item shapes already have a page route (the rest are MP05)", () => {
    const matrix = Object.fromEntries(
      (
        [
          [
            "forex lesson",
            {
              kind: "lesson",
              path: "forex",
              level: "level-3",
              slug: "x-new",
              position: 9,
            },
          ],
          [
            "forex course",
            {
              kind: "course",
              path: "forex",
              level: "level-3",
              course: "x-new",
            },
          ],
          [
            "forex module",
            {
              kind: "module",
              path: "forex",
              level: "level-3",
              course: "charts",
              module: "x-new",
            },
          ],
          [
            "crypto lesson",
            {
              kind: "lesson",
              path: "crypto",
              level: "level-2",
              slug: "x-new",
              position: 9,
            },
          ],
          [
            "crypto course",
            {
              kind: "course",
              path: "crypto",
              level: "level-2",
              course: "x-new",
            },
          ],
          [
            "crypto module",
            {
              kind: "module",
              path: "crypto",
              level: "level-2",
              course: "wallets-and-security",
              module: "x-new",
            },
          ],
          ["analysis post", { kind: "analysis", slug: "x-new" }],
        ] as [string, RouteTarget][]
      ).map(([label, target]) => [label, hasPageRoute(hrefFor(target))]),
    );
    // A dynamic page route exists for these shapes. Rendering generated data through them
    // (instead of the hand-written curriculum) is the MP05 bridge.
    expect(matrix).toEqual({
      "forex lesson": true,
      "forex course": true,
      "forex module": true,
      "crypto lesson": true,
      // MP05c-1a: a Crypto course URL is resolved by [lesson] as a course or a later lesson,
      // and a module URL by [lesson]/[module]; both from data, with no static folders.
      "crypto course": true,
      "crypto module": true,
      "analysis post": true,
    });
  });

  it("refuses URLs outside the learning and analysis spaces", () => {
    for (const href of [
      "/",
      "/learn",
      "/learn/stocks",
      "/admin",
      "/analysis",
      "/learn/forex/Level-1",
      "/learn/forex/level-1/a/b/c",
      "learn/forex",
    ])
      expect(routeCandidates(href), href).toEqual([]);
  });
});
