import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { assessmentRegistry } from "../lib/assessment-registry";
import { getLearningPath } from "../lib/curriculum";
import { cryptoLessonDocuments } from "../content/lesson-registry";

// H3 checkpoint contracts: editorial review text may change; frozen public
// snapshots, answer keys, versions and governance remain exactly as approved.
const contracts: Record<string, string> = {
  "crypto-advanced-and-graduation-quiz":
    "0859edd244550281b6bbc90bfd5d5e8971c044a2d050289f677795c1db67a13f",
  "bitcoin-foundations-quiz":
    "5cbfbb96eab0b80c4a4504b96446e4a06774cddf1273aab2e7b7b22a677de477",
  "crypto-charts-and-evidence-quiz":
    "4804396835766a1d27f6e2ff690b73f93e2609bdaa8021f14b4c13ddf14753a3",
  "crypto-defi-foundations-quiz":
    "bc7d28be0abac7783f54c348e7bc9dd43325d21680c3b8052d180d1146332e29",
  "crypto-ethereum-networks-quiz":
    "46b8b56a97fc9bf32e0fffb9f5382a2dc3a16455fa0ea71b34c53b00fc999747",
  "crypto-exchange-markets-quiz":
    "104cc56d9d11f844f64edfeaaf86b488d368206bddc876f81c0b1764c8382a24",
  "crypto-orientation-quiz":
    "c7e58f8923482cdbf246af83cf1dbdbdcad7710cb7d04286197d54ecc56dbd37",
  "crypto-planning-and-practice-quiz":
    "7ef806dfcc369a8cc41a7f841aea6dddbdab928b98708463b1f86575b05c0e95",
  "crypto-risk-and-portfolios-quiz":
    "f85540e4c186dc213a822a262fe75489b6a97f3d551d0a41928814212be0e97d",
  "crypto-token-research-quiz":
    "5fd9e73a6e3178d1a22b6f8e0315dd94687cd8e3c6ad6c0ae00a1580ced9b947",
  "crypto-wallet-security-quiz":
    "9b4ea7b4e70a2894ce9dae668821318f9ed0f53267083b74e6db2e28a0723b88",
};
const quizzes = assessmentRegistry.filter((q) => q.learningPath === "crypto");
const ordinalReference =
  /Correct choice\s+[A-D]\.|\boption [A-D]\b|(?:^|\n\n)[A-D]\.\s|\b[A-D] (?:is|uses|confuses|describes|forgets)\b|\bin [A-D] are\b/i;

describe("M16-H4 editorial integrity", () => {
  it("labels every published Crypto level with its actual order", () => {
    const path = getLearningPath("crypto");
    expect(path).toBeDefined();
    for (const level of path!.levels)
      expect(level.title).toBe(`Level ${level.order}`);
  });
  it("keeps all eleven Crypto quizzes and 160 questions", () => {
    expect(quizzes).toHaveLength(11);
    expect(
      quizzes.reduce((total, quiz) => total + quiz.questions.length, 0),
    ).toBe(160);
  });
  for (const quiz of quizzes) {
    it(`${quiz.id}: preserves the frozen contract and grading key`, () => {
      const contract = {
        ...quiz,
        questions: quiz.questions.map(({ explanation, ...question }) => {
          expect(explanation).toBeTruthy();
          return question;
        }),
      };
      expect(
        createHash("sha256").update(JSON.stringify(contract)).digest("hex"),
      ).toBe(contracts[quiz.id]);
    });
    it(`${quiz.id}: uses explanations independent of choice order`, () => {
      for (const question of quiz.questions) {
        expect(question.explanation, question.id).toMatch(/^Correct choice: /);
        expect(question.explanation, question.id).not.toMatch(ordinalReference);
        expect(question.explanation, question.id).not.toMatch(/ {2,}/);
      }
    });
  }
  it("keeps readable source titles without conversion spacing", () => {
    expect(cryptoLessonDocuments).toHaveLength(50);
    for (const lesson of cryptoLessonDocuments) {
      for (const source of lesson.sources) {
        expect(source.title, lesson.id).not.toMatch(/ {2,}|Investor gov/);
      }
      for (const block of lesson.blocks) {
        if (block.type === "references") {
          for (const source of block.items)
            expect(source.title, lesson.id).not.toMatch(/ {2,}|Investor gov/);
        }
      }
    }
  });
  it("restores punctuation in the learner-facing titles", () => {
    expect(
      cryptoLessonDocuments.find(
        (x) => x.slug === "crypto-using-owning-investing-trading",
      )?.title,
    ).toBe("Using, Owning, Investing and Trading Crypto");
    expect(
      cryptoLessonDocuments.find(
        (x) => x.slug === "keys-signatures-and-bitcoin-transactions",
      )?.title,
    ).toBe("Keys, Signatures and Bitcoin Transactions");
  });
});
