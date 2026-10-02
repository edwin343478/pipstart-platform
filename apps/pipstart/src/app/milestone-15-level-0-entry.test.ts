import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

describe("Milestone 15 Level 0 Forex entry", () => {
  it("makes Levels 0, 1, 2 and 3 available while keeping later levels locked", () => {
    const forexPage = read("learn/forex/forex-index-client.tsx");

    expect(forexPage).toContain("{index <= 10 ? (");
    expect(forexPage).toContain('"/learn/forex/level-0"');
    expect(forexPage).toContain("Start Level 0: Orientation and Safety");
    expect(forexPage).toContain("Start Level 1: Forex Kindergarten");
    expect(forexPage).toContain("Start Level 2: Brokers and Platforms");
    expect(forexPage).toContain('"/learn/forex/level-2"');
    expect(forexPage).toContain("Start Level 3: Charts");
    expect(forexPage).toContain("Start Level 4: Indicators and Patterns");
    expect(forexPage).toContain("/learn/forex/level-4");
    expect(forexPage).toContain("/learn/forex/level-5");
    expect(forexPage).toContain("/learn/forex/level-6");
    expect(forexPage).toContain("/learn/forex/level-7");
    expect(forexPage).toContain("/learn/forex/level-8");
    expect(forexPage).toContain("/learn/forex/level-9");
    expect(forexPage).toContain("/learn/forex/level-10");
    expect(forexPage).toContain("Start Level 10: Advanced Forex");
    expect(forexPage).toContain("Start Level 9: Strategy Development");
    expect(forexPage).toContain("Start Level 8: Psychology");
    expect(forexPage).toContain("Start Level 7: Fundamental Analysis");
    expect(forexPage).toContain("Start Level 6: Price Action");
    expect(forexPage).toContain("Start Level 5: Risk Management");
    expect(forexPage).toContain('"/learn/forex/level-3"');
    expect(forexPage).toContain("<strong>Coming soon</strong>");
  });

  it("preserves the existing Level 1 continuation destination", () => {
    const forexPage = read("learn/forex/forex-index-client.tsx");

    expect(forexPage).toContain("continueState.lesson.href");
    expect(forexPage).toContain(
      '"/learn/forex/level-1/forex-kindergarten/forex-foundations"',
    );
    expect(forexPage).toContain('"Review completed module"');
  });
});
