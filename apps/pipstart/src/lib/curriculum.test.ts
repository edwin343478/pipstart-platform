import { describe, expect, it } from "vitest";

import {
  getCurriculumCourse,
  getCurriculumModule,
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
      { courses: ["forex-kindergarten"], id: "forex", levels: ["level-1"] },
      { courses: ["bitcoin"], id: "crypto", levels: ["level-1"] },
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

  it("excludes draft quizzes and preserves existing lesson routes", () => {
    const forexModule = getCurriculumModule("forex", "forex-foundations");
    const cryptoModule = getCurriculumModule("crypto", "bitcoin-foundations");

    expect(forexModule?.lessons).toHaveLength(6);
    expect(forexModule?.lessons.some((lesson) => lesson.type === "quiz")).toBe(
      false,
    );
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
});
