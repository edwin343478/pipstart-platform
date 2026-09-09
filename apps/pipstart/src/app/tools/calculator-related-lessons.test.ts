import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const calculatorLessons = {
  "compound-growth-illustration": "/learn/crypto/level-1",
  "crypto-position-size-calculator": "/learn/crypto/level-1",
  "dollar-cost-averaging-calculator": "/learn/crypto/level-1",
  "drawdown-calculator": "/learn/forex/level-1",
  "gain-recovery-calculator": "/learn/forex/level-1",
  "margin-calculator": "/learn/forex/level-1",
  "pip-value-calculator": "/learn/forex/level-1",
  "position-size-calculator": "/learn/forex/level-1",
  "profit-loss-calculator": "/learn/forex/level-1",
  "risk-reward-calculator": "/learn/forex/level-1",
} as const;

describe("calculator related lessons", () => {
  for (const [route, lessonHref] of Object.entries(calculatorLessons)) {
    it(`${route} links to its learning path`, () => {
      const source = readFileSync(
        join(process.cwd(), "src", "app", "tools", route, "page.tsx"),
        "utf8",
      );

      expect(source).toContain("<RelatedLesson");
      expect(source).toContain(`href="${lessonHref}"`);
    });
  }
});
