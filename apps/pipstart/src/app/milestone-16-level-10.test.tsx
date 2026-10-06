import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { cryptoLessons } from "./learn/crypto/level-10/lessons";
import { CryptoLessonPage } from "./learn/crypto/level-10/crypto-lesson";
import { generateStaticParams } from "./learn/crypto/level-10/[lesson]/page";
import { cryptoAdvancedGraduationQuizV1 } from "../lib/crypto-advanced-and-graduation-assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { getCurriculumModule } from "../lib/curriculum";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
import {
  calculateGainRecovery,
  calculateDrawdown,
} from "../lib/calculator-engine";
const titles = [
  "Consensus Network Security and Cross Chain Dependencies",
  "DAOs Governance Oracles and Audit Limits",
  "Valuation Regulation and Institutional Products",
  "Complete the Graduation Research and Safety Review",
];
describe("Milestone 16 approved Crypto Level 10", () => {
  it("publishes four complete lessons with sequential prerequisites and all published routes", () => {
    expect(cryptoLessons.map((x) => x.title)).toEqual(titles);
    expect(cryptoLessons.map((x) => x.position)).toEqual([1, 2, 3, 4]);
    expect(cryptoLessons.map((x) => x.sections?.length)).toEqual([5, 5, 5, 7]);
    expect(cryptoLessons[0]).toMatchObject({
      id: "crypto-consensus-network-security-and-cross-chain-dependencies",
      href: "/learn/crypto/level-10",
      course: "crypto-advanced-and-graduation",
      module: "advanced-awareness-and-graduation",
      prerequisites: ["read-results-honestly-and-build-a-practice-routine"],
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
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(20);
    expect(blocks.filter((x) => x.type === "formula")).toHaveLength(6);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(1);
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
      expect(html).toContain('href="/learn/crypto/level-10/quiz"');
      expect(html).not.toContain('href="/learn/forex/level-10/quiz"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessons,
        contextTitle: "Advanced Awareness and Graduation",
        contextHref: "/learn/crypto/level-10/crypto-advanced-and-graduation",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-10/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
  });
  it("uses approved fifteen questions and explained key, server grading and existing completion policy", () => {
    const quiz = getCurrentPublishedAssessment(
      "crypto-advanced-and-graduation-quiz",
    )!;
    expect(quiz).toBe(cryptoAdvancedGraduationQuizV1);
    expect(quiz.questions).toHaveLength(15);
    expect(quiz.questions.map((x) => x.correctChoiceIds[0])).toEqual([
      "b",
      "c",
      "d",
      "b",
      "a",
      "c",
      "b",
      "d",
      "a",
      "d",
      "a",
      "a",
      "c",
      "a",
      "a",
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
      "crypto-advanced-and-graduation",
      "advanced-awareness-and-graduation",
    )!;
    expect(context.lessons).toHaveLength(4);
    expect(context.progressKey).toBe(
      "pipstart:learn:crypto:level-10:crypto-advanced-and-graduation:progress",
    );
    expect(
      getCurriculumModule("crypto", "advanced-awareness-and-graduation")
        ?.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
  it("retains all seven non-secret graduation worksheets and reconciles the full ledger", () => {
    const lesson = cryptoLessons[3];
    const worksheets = lesson.blocks.filter(
      (x) =>
        x.type === "comparisonTable" && x.columns.includes("Your response"),
    );
    expect(worksheets).toHaveLength(7);
    for (const sheet of worksheets) {
      if (sheet.type !== "comparisonTable")
        throw new Error("Worksheet type mismatch");
      expect(sheet.rows.length).toBeGreaterThan(0);
      expect(
        sheet.rows.every(
          (row) => row[2] === "Record your notes and evidence here",
        ),
      ).toBe(true);
    }
    expect(
      lesson.blocks.filter(
        (x) => x.type === "example" && x.title === "Worked example",
      ),
    ).toHaveLength(7);
    const ledger = lesson.blocks.find(
      (x) => x.type === "comparisonTable" && x.columns.includes("Equity USD"),
    );
    expect(ledger?.type).toBe("comparisonTable");
    if (!ledger || ledger.type !== "comparisonTable")
      throw new Error("Full ledger missing");
    expect(ledger.rows).toHaveLength(10);
    expect(
      ledger.rows
        .map((row) => Number(row[3]))
        .reduce((sum, value) => sum + value, 0),
    ).toBe(-50);
    expect(
      ledger.rows
        .map((row) => Number(row[2]))
        .reduce((sum, value) => sum + value, 0),
    ).toBe(10);
    expect(ledger.rows[1][4]).toBe("1038.00");
    expect(ledger.rows[9][4]).toBe("950.00");
    expect(ledger.rows[9][6]).toBe("8.48");
    const html = renderToStaticMarkup(<CryptoLessonPage lesson={lesson} />);
    expect(html).toContain("not editable form fields");
    expect(html).toContain("never record real secrets");
    expect(html).toContain("Final dossier review");
    expect(html).toContain("Practice review");
  });
  it("highlights compatible ledger tools without confusing loss and recovery bases", () => {
    const links = cryptoLessons
      .flatMap((x) => x.blocks)
      .filter((x) => x.type === "learningLink");
    expect(links).toHaveLength(2);
    expect(new Set(links.map((x) => x.href))).toEqual(
      new Set([
        "/tools/gain-recovery-calculator",
        "/tools/drawdown-calculator",
      ]),
    );
    const html = renderToStaticMarkup(
      <CryptoLessonPage lesson={cryptoLessons[3]} />,
    );
    expect(html.match(/Practise with a PipStart tool/g)).toHaveLength(2);
    const observed = calculateDrawdown(1038, 88, "amount", "USD");
    expect(observed.remainingBalance).toBe(950);
    expect(observed.drawdownPercent.toFixed(2)).toBe("8.48");
    expect(observed.recoveryPercent.toFixed(2)).toBe("9.26");
    const recovery = calculateGainRecovery(950, 1038, 5, "USD");
    expect(recovery.totalGainNeeded.toFixed(2)).toBe("9.26");
    expect(recovery.periods).toBe(2);
    expect(
      links.find((x) => x.href.endsWith("drawdown-calculator"))?.description,
    ).toContain("does not ingest a full equity series");
    expect(
      links.find((x) => x.href.endsWith("gain-recovery-calculator"))
        ?.description,
    ).toContain("does not estimate the likelihood or timing");
  });
});
