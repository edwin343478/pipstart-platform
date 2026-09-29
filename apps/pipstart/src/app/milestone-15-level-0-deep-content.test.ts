import { describe, expect, it } from "vitest";

import { getPublishedLessons } from "../content/lesson-registry";

describe("Milestone 15 Level 0 deep content", () => {
  const lessons = getPublishedLessons({
    course: "forex-orientation",
    learningPath: "forex",
    level: "level-0",
    module: "orientation-and-safety",
  });

  it("publishes the four approved Orientation and Safety lessons in order", () => {
    expect(lessons.map((lesson) => lesson.title)).toEqual([
      "Start Here: What This Course Can and Cannot Do",
      "Trading, Investing and Everyday Currency Exchange",
      "Money at Risk: Leverage, Losses and Demo Accounts",
      "Spot Forex Scams and Make a Safer Learning Plan",
    ]);
  });

  it("uses the approved connected manuscript structure", () => {
    for (const lesson of lessons) {
      expect(lesson.sections?.length).toBeGreaterThanOrEqual(5);
      expect(lesson.blocks.some((block) => block.type === "section")).toBe(true);
      expect(lesson.blocks.some((block) => block.type === "example" || block.type === "takeaway")).toBe(true);
      expect(
        lesson.blocks.some((block) => block.type === "riskStatement"),
      ).toBe(true);
    }
  });

  it("preserves the approved wording and localized examples", () => {
    const serialized = JSON.stringify(lessons);

    expect(serialized).toContain(
      "Before learning currency pairs, pips, charts, brokers, or trading strategies, it is important to understand what learning Forex actually means.",
    );
    expect(serialized).toContain("The tomato trader");
    expect(serialized).toContain("MX$800");
    expect(serialized).toContain("US$200 × 2% = US$4 loss");
    expect(serialized).toContain("US$4 ÷ US$20 = 20% of cash");
    expect(serialized).toContain(
      "Earn 15% every week. Send C$500 before midnight. To activate your account, send us the one-time code from your phone.",
    );
    expect(serialized).toContain(
      "You can continue to Level 1 without opening or funding a live account.",
    );
  });

  it("keeps Level 0 illustration-free", () => {
    for (const lesson of lessons) {
      expect(lesson.blocks.some((block) => block.type === "diagram")).toBe(
        false,
      );
    }
  });
});
