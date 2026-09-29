import { describe, expect, it } from "vitest";

import { getPublishedLessons } from "../content/lesson-registry";

describe("Milestone 15 Level 0 reference fidelity", () => {
  const lessons = getPublishedLessons({
    course: "forex-orientation",
    learningPath: "forex",
    level: "level-0",
    module: "orientation-and-safety",
  });

  it("preserves approved Level 0 wording and examples", () => {
    const serialized = JSON.stringify(lessons);

    expect(serialized).toContain(
      "Before learning currency pairs, pips, charts, brokers, or trading strategies, it is important to understand what learning Forex actually means.",
    );
    expect(serialized).toContain(
      "No lesson, strategy, indicator, teacher, broker, influencer, or trading system can promise that every trade will make money.",
    );
    expect(serialized).toContain("The tomato trader");
    expect(serialized).toContain("MX$800");
    expect(serialized).toContain("US$200 × 2% = US$4 loss");
    expect(serialized).toContain("US$4 ÷ US$20 = 20% of cash");
    expect(serialized).toContain(
      "Earn 15% every week. Send C$500 before midnight.",
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
