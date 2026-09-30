import { describe, expect, it } from "vitest";

import {
  getCurriculumCourse,
  getCurriculumCourseInLevel,
  getCurriculumModule,
  getCurriculumModuleInCourse,
  learningPaths,
  publishedHierarchyRoutes,
} from "./curriculum";

describe("published curriculum hierarchy", () => {
  it("publishes the approved Forex and Crypto hierarchy", () => {
    expect(
      learningPaths.map((path) => ({
        courses: path.levels.flatMap((level) =>
          level.courses.map((course) => course.id),
        ),
        id: path.id,
        levels: path.levels.map((level) => level.id),
      })),
    ).toEqual([
      {
        courses: [
          "forex-orientation",
          "forex-kindergarten",
          "brokers-and-platforms",
          "charts",
        ],
        id: "forex",
        levels: ["level-0", "level-1", "level-2", "level-3"],
      },
      { courses: ["bitcoin"], id: "crypto", levels: ["level-1"] },
    ]);
  });

  it("publishes the four approved Level 0 orientation lessons in order", () => {
    const course = getCurriculumCourseInLevel(
      "forex",
      "level-0",
      "forex-orientation",
    );
    const curriculumModule = getCurriculumModuleInCourse(
      "forex",
      "level-0",
      "forex-orientation",
      "orientation-and-safety",
    );

    expect(course?.href).toBe("/learn/forex/level-0/forex-orientation");
    expect(curriculumModule?.href).toBe(
      "/learn/forex/level-0/forex-orientation/orientation-and-safety",
    );
    expect(
      curriculumModule?.lessons.map(({ href, id, type }) => ({
        href,
        id,
        type,
      })),
    ).toEqual([
      {
        href: "/learn/forex/level-0",
        id: "orientation-course-purpose",
        type: "lesson",
      },
      {
        href: "/learn/forex/level-0/trading-versus-investing",
        id: "trading-versus-investing",
        type: "lesson",
      },
      {
        href: "/learn/forex/level-0/money-risk-and-demo",
        id: "money-risk-and-demo",
        type: "lesson",
      },
      {
        href: "/learn/forex/level-0/spot-forex-scams-and-safety",
        id: "spot-forex-scams-and-safety",
        type: "lesson",
      },
    ]);
  });

  it("keeps identifiers, routes and order unique", () => {
    for (const path of learningPaths) {
      for (const level of path.levels) {
        const courses = [...level.courses].sort((a, b) => a.order - b.order);
        expect(new Set(courses.map((course) => course.id)).size).toBe(
          courses.length,
        );

        for (const course of courses) {
          const modules = [...course.modules].sort((a, b) => a.order - b.order);
          expect(new Set(modules.map((module) => module.id)).size).toBe(
            modules.length,
          );

          for (const curriculumModule of modules) {
            const lessons = [...curriculumModule.lessons].sort(
              (a, b) => a.order - b.order,
            );
            expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(
              lessons.length,
            );
            expect(new Set(lessons.map((lesson) => lesson.href)).size).toBe(
              lessons.length,
            );
            expect(lessons.map((lesson) => lesson.order)).toEqual(
              lessons.map((_, index) => index + 1),
            );
          }
        }
      }
    }

    expect(new Set(publishedHierarchyRoutes).size).toBe(
      publishedHierarchyRoutes.length,
    );
  });

  it("publishes the Forex module quiz and preserves existing lesson routes", () => {
    const forexModule = getCurriculumModule("forex", "forex-foundations");
    const cryptoModule = getCurriculumModule("crypto", "bitcoin-foundations");

    expect(forexModule?.lessons).toHaveLength(7);
    expect(forexModule?.lessons.at(-1)).toMatchObject({
      href: "/learn/forex/level-1/quiz",
      id: "forex-foundations-quiz",
      status: "published",
      type: "quiz",
    });
    expect(forexModule?.lessons[0]?.href).toBe("/learn/forex/level-1");
    expect(cryptoModule?.lessons[0]?.href).toBe("/learn/crypto/level-1");
  });

  it("returns only published courses and modules", () => {
    expect(
      getCurriculumCourse("forex", "forex-kindergarten")?.modules,
    ).toHaveLength(1);
    expect(getCurriculumCourse("crypto", "bitcoin")?.modules).toHaveLength(1);
    expect(getCurriculumCourse("forex", "missing")).toBeUndefined();
  });

  it("supports level- and course-scoped curriculum lookup for future levels", () => {
    expect(
      getCurriculumCourseInLevel("forex", "level-1", "forex-kindergarten")?.id,
    ).toBe("forex-kindergarten");
    expect(
      getCurriculumCourseInLevel("forex", "missing", "forex-kindergarten"),
    ).toBeUndefined();

    expect(
      getCurriculumModuleInCourse(
        "forex",
        "level-1",
        "forex-kindergarten",
        "forex-foundations",
      )?.id,
    ).toBe("forex-foundations");
    expect(
      getCurriculumModuleInCourse(
        "forex",
        "level-1",
        "missing",
        "forex-foundations",
      ),
    ).toBeUndefined();
  });
});
