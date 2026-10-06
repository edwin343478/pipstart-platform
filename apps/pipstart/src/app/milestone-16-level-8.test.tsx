import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { cryptoLessons } from "./learn/crypto/level-8/lessons";
import { CryptoLessonPage } from "./learn/crypto/level-8/crypto-lesson";
import { generateStaticParams } from "./learn/crypto/level-8/[lesson]/page";
import { cryptoRiskPortfoliosQuizV1 } from "../lib/crypto-risk-and-portfolios-assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { getCurriculumModule } from "../lib/curriculum";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
import {
  calculateCryptoPositionSize,
  calculateRiskReward,
  calculateDrawdown,
  calculateGainRecovery,
  calculateDollarCostAveraging,
} from "../lib/calculator-engine";
const titles = [
  "Choose the Loss Budget Before the Position Size",
  "Leverage, Margin and Liquidation Risk",
  "Concentration, Correlation and Shared Dependencies",
  "DCA, Rebalancing, Exits and Useful Records",
];
describe("Milestone 16 approved Crypto Level 8", () => {
  it("publishes four complete lessons with sequential prerequisites and all published routes", () => {
    expect(cryptoLessons.map((x) => x.title)).toEqual(titles);
    expect(cryptoLessons.map((x) => x.position)).toEqual([1, 2, 3, 4]);
    expect(cryptoLessons.map((x) => x.sections?.length)).toEqual([4, 3, 4, 4]);
    expect(cryptoLessons[0]).toMatchObject({
      id: "choose-the-loss-budget-before-the-position-size",
      href: "/learn/crypto/level-8",
      course: "crypto-risk-and-portfolios",
      module: "sizing-leverage-and-portfolio-risk",
      prerequisites: [
        "sentiment-narratives-and-an-evidence-based-research-note",
      ],
    });
    expect(generateStaticParams()).toEqual(
      cryptoLessons.slice(1).map((x) => ({ lesson: x.slug })),
    );
    expect(assertUniqueCurriculumIds()).toBeUndefined();
    for (const [index, lesson] of cryptoLessons.entries()) {
      expect(lesson.approved).toBe(true);
      expect(lesson.author).not.toBe(lesson.reviewer);
      expect(lesson.sources.length).toBeGreaterThan(0);
      expect(lesson.sources.every((x) => x.url.startsWith("https://"))).toBe(
        true,
      );
      if (index)
        expect(lesson.prerequisites).toEqual([cryptoLessons[index - 1].id]);
      expect(JSON.stringify(lesson.blocks)).not.toMatch(
        /G20|Example using G20|\*\*/,
      );
      expect(lesson.blocks.filter((x) => x.type === "practice")).toHaveLength(
        2,
      );
      for (const block of lesson.blocks)
        if (block.type === "keyPoint")
          expect(block.points.every((x) => !/[☐□✓•]/.test(x))).toBe(true);
    }
  });
  it("retains the approved native tables, manuscript diagrams and accessible formulas", () => {
    const blocks = cryptoLessons.flatMap((x) => x.blocks);
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(8);
    expect(blocks.filter((x) => x.type === "formula")).toHaveLength(3);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(4);
    for (const diagram of diagrams)
      expect(
        fs.existsSync(path.join(process.cwd(), "public", diagram.src)),
      ).toBe(true);
  });
  it("renders full content before enhancement with closed practice, correct quiz and compact sidebar", () => {
    for (const lesson of cryptoLessons) {
      const html = renderToStaticMarkup(<CryptoLessonPage lesson={lesson} />);
      expect(html).toContain('data-enhanced="false"');
      expect(html).toContain("References and further reading");
      expect(html).toContain("Lesson completion check");
      expect(html.match(/Compare with the worked answers/g)).toHaveLength(2);
      expect(html).not.toMatch(/<details[^>]*\sopen(?:[= >])/);
      expect(html).toContain("?section=1&amp;all=0");
      expect(html).toContain('href="/learn/crypto/level-8/quiz"');
      expect(html).not.toContain('href="/learn/forex/level-8/quiz"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessons,
        contextTitle: "Sizing, Leverage and Portfolio Risk",
        contextHref: "/learn/crypto/level-8/crypto-risk-and-portfolios",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-8/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
  });
  it("uses approved fifteen questions and explained key, server grading and existing completion policy", () => {
    const quiz = getCurrentPublishedAssessment(
      "crypto-risk-and-portfolios-quiz",
    )!;
    expect(quiz).toBe(cryptoRiskPortfoliosQuizV1);
    expect(quiz.questions).toHaveLength(15);
    expect(quiz.questions.map((x) => x.correctChoiceIds[0])).toEqual([
      "b",
      "a",
      "d",
      "b",
      "c",
      "d",
      "d",
      "a",
      "d",
      "b",
      "d",
      "d",
      "b",
      "d",
      "c",
    ]);
    expect(
      quiz.questions.every((x) => x.explanation.includes("Correct choice")),
    ).toBe(true);
    const selections = (count: number) =>
      Object.fromEntries(
        quiz.questions.slice(0, count).map((x) => [x.id, x.correctChoiceIds]),
      );
    expect(gradeAssessment(quiz, selections(15))).toMatchObject({
      passed: true,
      percentage: 100,
    });
    expect(gradeAssessment(quiz, selections(12))).toMatchObject({
      passed: true,
      percentage: 80,
    });
    expect(gradeAssessment(quiz, selections(11)).passed).toBe(false);
    const publicData = JSON.stringify(toPublicAssessment(quiz));
    expect(publicData).not.toContain("correctChoiceIds");
    for (const question of toPublicAssessment(quiz).questions) {
      expect(question).not.toHaveProperty("correctChoiceIds");
      expect(question).not.toHaveProperty("explanation");
    }
    const context = getCryptoOrientationQuizClientContext(
      "crypto-risk-and-portfolios",
      "sizing-leverage-and-portfolio-risk",
    )!;
    expect(context.lessons).toHaveLength(4);
    expect(context.progressKey).toBe(
      "pipstart:learn:crypto:level-8:crypto-risk-and-portfolios:progress",
    );
    expect(
      getCurriculumModule("crypto", "sizing-leverage-and-portfolio-risk")
        ?.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
  it("highlights all tool callouts and verifies supported classroom setups and rounding", () => {
    const links = cryptoLessons
      .flatMap((x) => x.blocks)
      .filter((x) => x.type === "learningLink");
    expect(links).toHaveLength(12);
    expect(new Set(links.map((x) => x.href))).toEqual(
      new Set([
        "/tools/crypto-position-size-calculator",
        "/tools/risk-reward-calculator",
        "/tools/drawdown-calculator",
        "/tools/gain-recovery-calculator",
        "/tools/dollar-cost-averaging-calculator",
      ]),
    );
    for (const lesson of cryptoLessons) {
      const count = lesson.blocks.filter(
        (x) => x.type === "learningLink",
      ).length;
      const html = renderToStaticMarkup(<CryptoLessonPage lesson={lesson} />);
      expect(html.match(/Practise with a PipStart tool/g)).toHaveLength(count);
    }
    const position = calculateCryptoPositionSize(
      1000,
      1,
      60000,
      57000,
      "BTC",
      "USD",
      "spot",
      "long",
      0.0001,
      0.0001,
    );
    expect(position.positionQuantity).toBeCloseTo(0.0033, 8);
    expect(position.positionValue).toBeCloseTo(198, 6);
    expect(position.positionQuantity * 3000).toBeCloseTo(9.9, 6);
    expect(calculateRiskReward("long", 50000, 47500, 55000).ratio).toBe(2);
    const drawdown = calculateDrawdown(1000, 30, "percent", "USD");
    expect(drawdown.remainingBalance).toBe(700);
    expect(drawdown.recoveryPercent.toFixed(2)).toBe("42.86");
    const gain = calculateGainRecovery(700, 1000, 5, "USD");
    expect(gain.totalGainNeeded.toFixed(2)).toBe("42.86");
    expect(gain.periods).toBe(8);
    const dca = calculateDollarCostAveraging(
      "GBP",
      "BTC",
      200,
      "monthly",
      "2026-01-01",
      "2026-03-01",
      20,
      10,
    );
    expect(dca.purchaseCount).toBe(3);
    expect(dca.units).toBeCloseTo(43.3333333333, 7);
    expect(dca.averageCost.toFixed(2)).toBe("13.85");
    expect(dca.endingValue.toFixed(2)).toBe("433.33");
    expect(200 / 20 + 200 / 25 + 200 / 10).toBe(38);
    expect((600 / 38).toFixed(2)).toBe("15.79");
    const descriptions = links
      .filter((x) => x.href.endsWith("dollar-cost-averaging-calculator"))
      .map((x) => x.description);
    expect(
      descriptions.every((x) =>
        x.includes("cannot accept three independently chosen prices"),
      ),
    ).toBe(true);
  });
});
