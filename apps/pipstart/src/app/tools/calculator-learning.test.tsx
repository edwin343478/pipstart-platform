import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getPublishedLesson } from "../../content/lesson-registry";
import * as engine from "../../lib/calculator-engine";
import {
  calculatorLearning,
  type CalculatorLearningRoute,
} from "./calculator-learning";
import CalculatorLearning from "./components/calculator-learning";

const routes = Object.keys(calculatorLearning) as CalculatorLearningRoute[];
const pages = {
  "risk-reward-calculator": () => import("./risk-reward-calculator/page"),
  "position-size-calculator": () => import("./position-size-calculator/page"),
  "pip-value-calculator": () => import("./pip-value-calculator/page"),
  "profit-loss-calculator": () => import("./profit-loss-calculator/page"),
  "margin-calculator": () => import("./margin-calculator/page"),
  "drawdown-calculator": () => import("./drawdown-calculator/page"),
  "gain-recovery-calculator": () => import("./gain-recovery-calculator/page"),
  "crypto-position-size-calculator": () =>
    import("./crypto-position-size-calculator/page"),
  "dollar-cost-averaging-calculator": () =>
    import("./dollar-cost-averaging-calculator/page"),
  "compound-growth-illustration": () =>
    import("./compound-growth-illustration/page"),
};

describe("Phase 18.2 calculator teaching", () => {
  for (const route of routes) {
    const content = calculatorLearning[route];
    it(`${route} has formulas, defined terms, steps, interpretation and limits`, () => {
      const html = renderToStaticMarkup(
        createElement(CalculatorLearning, {
          route,
          className: "existing-assumption",
        }),
      );
      for (const heading of [
        "How this calculation works",
        "Formula in plain language",
        "What the terms mean",
        "Worked example",
        "What the result means",
        "What this does not tell you",
      ])
        expect(html).toContain(heading);
      expect(content.formulas.length).toBeGreaterThanOrEqual(2);
      expect(content.terms.length).toBeGreaterThanOrEqual(2);
      expect(content.example.steps.length).toBeGreaterThanOrEqual(3);
      expect(html).toContain("<ol>");
      expect(html).toContain(
        "fixed teaching example, separate from your current inputs",
      );
      expect(html).toContain(content.example.result);
    });
    it(`${route} uses the exact approved published topic destination`, () => {
      const lesson = getPublishedLesson(
        content.lesson.learningPath,
        content.lesson.slug,
      );
      expect(lesson).toBeDefined();
      expect(lesson).toMatchObject({
        status: "published",
        approved: true,
        href: content.lesson.href,
        title: content.lesson.title,
      });
    });
    it(`${route} renders learning and both independent lesson cards without duplicate IDs`, async () => {
      const Page = (await pages[route]()).default;
      const html = renderToStaticMarkup(createElement(Page));
      expect(html).toContain(content.example.result);
      expect(html).toContain(`href="${content.lesson.href}"`);
      const foundation =
        content.lesson.learningPath === "forex"
          ? "/learn/forex/level-1"
          : "/learn/crypto/level-1";
      expect(html).toContain(`href="${foundation}"`);
      const ids = Array.from(
        html.matchAll(/\bid="([^"]+)"/g),
        (match) => match[1],
      );
      expect(new Set(ids).size).toBe(ids.length);
      const source = readFileSync(
        join(process.cwd(), "src/app/tools", route, "page.tsx"),
        "utf8",
      );
      expect(source).toContain(`<CalculatorLearning`);
      expect(source).toContain(`route="${route}"`);
      expect(source).toContain("className={styles.assumption}");
    });
  }

  it("independently checked risk/reward example matches the engine", () => {
    expect(engine.calculateRiskReward("long", 100, 90, 120)).toMatchObject({
      riskDistance: 10,
      rewardDistance: 20,
      ratio: 2,
    });
    expect(
      engine.calculateRiskReward("long", 100, 90, 120).breakEvenWinRate,
    ).toBeCloseTo(100 / 3, 10);
  });
  it("independently checked lot sizing example matches the engine", () => {
    expect(
      engine.calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD"),
    ).toMatchObject({ lots: 0.05, positionSize: 5000, riskAmount: 10 });
  });
  it("independently checked pip example matches the engine", () => {
    expect(engine.calculatePipValue("EUR/USD", 0.1, 1, "USD")).toMatchObject({
      positionSize: 10000,
      valuePerPip: 1,
    });
  });
  it("independently checked long/short gross result matches the engine", () => {
    expect(
      engine.calculateProfitLoss("long", "EUR/USD", 0.1, 1.1, 1.105, 1, "USD"),
    ).toMatchObject({ profitLoss: 50, pipMovement: 50 });
    expect(
      engine.calculateProfitLoss("short", "EUR/USD", 0.1, 1.1, 1.105, 1, "USD")
        .profitLoss,
    ).toBe(-50);
  });
  it("independently checked margin example matches the engine", () => {
    const result = engine.calculateMargin("EUR/USD", 0.1, 1.1, 50, 1, "USD");
    expect(result.requiredMargin).toBeCloseTo(220, 10);
    expect(result.notionalValue).toBeCloseTo(11000, 8);
    expect(result.marginRate).toBe(2);
  });
  it("independently checked drawdown example matches the engine", () => {
    expect(engine.calculateDrawdown(1000, 20, "percent", "USD")).toMatchObject({
      amountLost: 200,
      remainingBalance: 800,
      recoveryPercent: 25,
    });
  });
  it("independently checked whole-period example matches the engine", () => {
    expect(engine.calculateGainRecovery(100, 144, 20, "USD")).toMatchObject({
      periods: 2,
      projectedBalance: 144,
    });
  });
  it("independently checked crypto example matches the engine", () => {
    expect(
      engine.calculateCryptoPositionSize(
        1000,
        1,
        100,
        90,
        "BTC",
        "USD",
        "spot",
        "long",
        0.01,
        0.01,
      ),
    ).toMatchObject({
      positionQuantity: 1,
      positionValue: 100,
      modeledRiskAmount: 10,
    });
  });
  it("independently checked DCA example matches the engine", () => {
    const result = engine.calculateDollarCostAveraging(
      "USD",
      "BTC",
      100,
      "monthly",
      "2026-01-01",
      "2026-02-01",
      10,
      20,
    );
    expect(result).toMatchObject({
      purchaseCount: 2,
      units: 15,
      totalContributed: 200,
      endingValue: 300,
      illustratedDifference: 100,
    });
    expect(result.averageCost).toBeCloseTo(200 / 15, 10);
    expect(result.purchaseDates).toEqual(["2026-01-01", "2026-02-01"]);
  });
  it("independently checked end/start contribution examples match the engine", () => {
    const end = engine.calculateCompoundGrowth("USD", 100, 10, 2, 10, "end");
    expect(end.endingBalance).toBeCloseTo(142, 10);
    expect(end.totalContributed).toBe(120);
    expect(end.illustratedGrowth).toBeCloseTo(22, 10);
    expect(
      engine.calculateCompoundGrowth("USD", 100, 10, 2, 10, "start")
        .endingBalance,
    ).toBeCloseTo(144.1, 10);
  });
});
