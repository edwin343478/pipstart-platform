import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getCurrentPublishedAssessment } from "./assessment-registry";
import { getCurriculumLevel, getLearningPath } from "./curriculum";
import { forexCourseLessons } from "./forex-level-lessons";
import {
  forexLevelPageContext,
  forexLevelQuiz,
  forexModuleParams,
  forexModuleQuizParams,
  forexProgressStorageKey,
  forexSegmentParams,
  getGenericForexLevelContext,
  getGenericForexLevelParams,
  getGenericForexLevelRootLesson,
  getGenericForexModule,
  getGenericForexModuleParams,
  getGenericForexModuleQuiz,
  getGenericForexModuleQuizParams,
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
  resolveForexModule,
  resolveForexModuleQuiz,
  resolveForexSegment,
} from "./forex-level-routing";

const forexLevels = getLearningPath("forex")!.levels.map((level) => level.id);

describe("M22 MP05c-1b data-driven Forex routing", () => {
  it.each(forexLevels)(
    "resolves every course, module, lesson and quiz of %s from data",
    (levelId) => {
      const level = getCurriculumLevel("forex", levelId)!;
      for (const course of level.courses) {
        expect(resolveForexSegment(levelId, course.id)).toMatchObject({
          kind: "course",
          course: { id: course.id },
        });
        for (const curriculumModule of course.modules)
          expect(
            resolveForexModule(levelId, course.id, curriculumModule.id),
          ).toMatchObject({
            course: { id: course.id },
            module: { id: curriculumModule.id },
          });
        for (const lesson of forexCourseLessons(levelId, course.id)) {
          const route = resolveForexSegment(levelId, lesson.slug);
          if (lesson.position === 1) expect(route).toBeUndefined();
          else
            expect(route).toMatchObject({
              kind: "lesson",
              lesson: { id: lesson.id },
              module: { id: lesson.module },
            });
        }
      }
      expect(forexModuleParams(levelId)).toEqual(
        level.courses.flatMap((course) =>
          course.modules.map((entry) => ({
            segment: course.id,
            module: entry.id,
          })),
        ),
      );
      // The level quiz keeps /learn/forex/<level>/quiz; its ID is the published assessment.
      const quiz = forexLevelQuiz(levelId);
      expect(forexSegmentParams(levelId).includes("quiz")).toBe(Boolean(quiz));
      if (quiz) {
        expect(quiz.quiz.href).toBe(`/learn/forex/${levelId}/quiz`);
        expect(getCurrentPublishedAssessment(quiz.quiz.id)).toBeDefined();
      }
      // No module-scoped quiz exists yet; those routes generate nothing today.
      expect(forexModuleQuizParams(levelId)).toEqual([]);
    },
  );

  it("keeps Level 1's page, breadcrumb, progress key and quiz link", () => {
    expect(forexLevelPageContext("level-1")).toMatchObject({
      lesson: { href: "/learn/forex/level-1" },
      contextTitle: "Forex Foundations",
      course: {
        href: "/learn/forex/level-1/forex-kindergarten",
        title: "Forex Kindergarten",
      },
      progressKey: "pipstart:learn:forex:level-1:progress",
      quizTarget: {
        href: "/learn/forex/level-1/quiz",
        label: "Take the Forex Foundations quiz",
      },
    });
    expect(forexLevelQuiz("level-1")?.quiz.id).toBe("forex-foundations-quiz");
  });

  it("keeps the Level 0 breadcrumb and the derived labels of other levels", () => {
    expect(getGenericForexLevelContext("level-0")?.contextTitle).toBe(
      "Orientation and Safety",
    );
    expect(getGenericForexLevelContext("level-2")).toMatchObject({
      contextTitle: "Broker Foundations",
      quizTarget: {
        href: "/learn/forex/level-2/quiz",
        label: "Broker Foundations quiz",
      },
    });
  });

  it("refuses unknown and cross-level items and leaves Level 1 to its own routes", () => {
    expect(resolveForexSegment("level-2", "missing")).toBeUndefined();
    expect(resolveForexSegment("level-0", "quiz")).toBeUndefined();
    expect(
      resolveForexModule(
        "level-3",
        "brokers-and-platforms",
        "broker-foundations",
      ),
    ).toBeUndefined();
    expect(
      resolveForexModuleQuiz(
        "level-2",
        "brokers-and-platforms",
        "broker-foundations",
      ),
    ).toBeUndefined();
    expect(
      getGenericForexModuleQuiz(
        "level-1",
        "forex-kindergarten",
        "forex-foundations",
      ),
    ).toBeUndefined();
    expect(getGenericForexModuleQuizParams()).toEqual([]);
    expect(forexLevelPageContext("level-11")).toBeUndefined();
  });

  it("names no course or module in the Forex route folders", () => {
    const forexApp = resolve(import.meta.dirname, "../app/learn/forex");
    const folders = (dir: string) =>
      readdirSync(resolve(forexApp, dir), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    expect(folders("level-1")).toEqual(["[lesson]", "quiz"]);
    expect(folders("[level]")).toEqual(["[segment]"]);
    for (const route of [
      "level-1/[lesson]/[module]/page.tsx",
      "level-1/[lesson]/[module]/quiz/page.tsx",
      "[level]/[segment]/[module]/page.tsx",
      "[level]/[segment]/[module]/quiz/page.tsx",
    ])
      expect(existsSync(resolve(forexApp, route))).toBe(true);
  });
});

describe("generic Forex level routing", () => {
  it("keeps the existing Level 1 route owned by the legacy route tree", () => {
    expect(getGenericForexLevelContext("level-1")).toBeUndefined();
    expect(getGenericForexLevelRootLesson("level-1")).toBeUndefined();
    expect(
      getGenericForexSecondSegment("level-1", "currency-pairs"),
    ).toBeUndefined();
    expect(
      getGenericForexModule(
        "level-1",
        "forex-kindergarten",
        "forex-foundations",
      ),
    ).toBeUndefined();
  });

  it("publishes Levels 0, 2, 3, 4, 5, 6, 7, 8 and 9 while keeping unimplemented Forex levels unavailable", () => {
    expect(getGenericForexLevelParams()).toEqual([
      { level: "level-0" },
      { level: "level-2" },
      { level: "level-3" },
      { level: "level-4" },
      { level: "level-5" },
      { level: "level-6" },
      { level: "level-7" },
      { level: "level-8" },
      { level: "level-9" },
      { level: "level-10" },
    ]);
    expect(getGenericForexSecondSegmentParams()).toEqual([
      { level: "level-0", segment: "forex-orientation" },
      { level: "level-0", segment: "trading-versus-investing" },
      { level: "level-0", segment: "money-risk-and-demo" },
      { level: "level-0", segment: "spot-forex-scams-and-safety" },
      { level: "level-2", segment: "brokers-and-platforms" },
      { level: "level-2", segment: "quiz" },
      { level: "level-2", segment: "platforms-and-demo-practice" },
      { level: "level-2", segment: "order-types-and-exits" },
      { level: "level-2", segment: "costs-withdrawals-and-safety" },
      { level: "level-3", segment: "charts" },
      { level: "level-3", segment: "quiz" },
      { level: "level-3", segment: "trends-and-price-landmarks" },
      { level: "level-3", segment: "swings-breakouts-and-false-signals" },
      { level: "level-3", segment: "volume-and-chart-limits" },
      { level: "level-4", segment: "technical-tools" },
      { level: "level-4", segment: "quiz" },
      { level: "level-4", segment: "volatility-tools" },
      { level: "level-4", segment: "levels-patterns-and-limits" },
      { level: "level-5", segment: "risk-management" },
      { level: "level-5", segment: "quiz" },
      { level: "level-5", segment: "margin-leverage-and-drawdown" },
      { level: "level-5", segment: "combined-exposure-and-losing-streaks" },
      { level: "level-6", segment: "price-action" },
      { level: "level-6", segment: "quiz" },
      { level: "level-6", segment: "build-a-testable-observation" },
      { level: "level-6", segment: "stops-targets-and-a-checklist" },
      { level: "level-7", segment: "fundamental-analysis" },
      { level: "level-7", segment: "quiz" },
      { level: "level-7", segment: "policy-and-market-relationships" },
      { level: "level-7", segment: "use-an-economic-calendar-safely" },
      { level: "level-8", segment: "psychology" },
      { level: "level-8", segment: "quiz" },
      { level: "level-8", segment: "how-thinking-can-go-wrong" },
      { level: "level-8", segment: "a-repeatable-practice-habit" },
      { level: "level-9", segment: "strategy-development" },
      { level: "level-9", segment: "quiz" },
      { level: "level-9", segment: "test-without-looking-ahead" },
      { level: "level-9", segment: "read-the-results-honestly" },
      { level: "level-10", segment: "advanced-forex" },
      { level: "level-10", segment: "quiz" },
      { level: "level-10", segment: "liquidity-and-market-positioning" },
      { level: "level-10", segment: "review-the-whole-portfolio" },
    ]);
    expect(getGenericForexModuleParams()).toEqual([
      {
        level: "level-0",
        module: "orientation-and-safety",
        segment: "forex-orientation",
      },
      {
        level: "level-2",
        module: "broker-foundations",
        segment: "brokers-and-platforms",
      },
      { level: "level-3", module: "chart-foundations", segment: "charts" },
      {
        level: "level-4",
        module: "technical-tool-foundations",
        segment: "technical-tools",
      },
      {
        level: "level-5",
        module: "risk-management-foundations",
        segment: "risk-management",
      },
      {
        level: "level-6",
        module: "price-action-foundations",
        segment: "price-action",
      },
      {
        level: "level-7",
        module: "fundamental-analysis-foundations",
        segment: "fundamental-analysis",
      },
      {
        level: "level-8",
        module: "psychology-foundations",
        segment: "psychology",
      },
      {
        level: "level-9",
        module: "strategy-development-foundations",
        segment: "strategy-development",
      },
      {
        level: "level-10",
        module: "advanced-forex-foundations",
        segment: "advanced-forex",
      },
    ]);

    expect(getGenericForexLevelRootLesson("level-0")).toMatchObject({
      lesson: {
        href: "/learn/forex/level-0",
        id: "orientation-course-purpose",
      },
      progressKey: "pipstart:learn:forex:level-0:forex-orientation:progress",
      quizTarget: null,
    });
    expect(
      getGenericForexSecondSegment("level-0", "forex-orientation"),
    ).toMatchObject({ kind: "course" });
    expect(
      getGenericForexSecondSegment("level-0", "trading-versus-investing"),
    ).toMatchObject({
      kind: "lesson",
      lesson: { id: "trading-versus-investing" },
    });
    expect(
      getGenericForexModule(
        "level-0",
        "forex-orientation",
        "orientation-and-safety",
      ),
    ).toBeDefined();

    expect(
      getGenericForexSecondSegment("level-2", "broker-purpose"),
    ).toBeUndefined();
    expect(
      getGenericForexModule(
        "level-2",
        "brokers-and-platforms",
        "broker-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });

  it("preserves Level 1 browser data and isolates Level 0 progress", () => {
    expect(forexProgressStorageKey("level-1", "forex-kindergarten")).toBe(
      "pipstart:learn:forex:level-1:progress",
    );
    expect(forexProgressStorageKey("level-0", "forex-orientation")).toBe(
      "pipstart:learn:forex:level-0:forex-orientation:progress",
    );
    expect(
      forexProgressStorageKey("level-2", "brokers-and-platforms"),
    ).not.toBe(forexProgressStorageKey("level-0", "forex-orientation"));
  });
});
