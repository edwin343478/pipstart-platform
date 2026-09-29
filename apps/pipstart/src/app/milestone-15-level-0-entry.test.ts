import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

describe("Milestone 15 Level 0 Forex entry", () => {
  it("makes Levels 0 and 1 available while keeping later levels locked", () => {
    const forexPage = read("learn/forex/page.tsx");

    expect(forexPage).toContain("{index <= 1 ? (");
    expect(forexPage).toContain('"/learn/forex/level-0"');
    expect(forexPage).toContain("Start Level 0: Orientation and Safety");
    expect(forexPage).toContain("Start Level 1: Forex Kindergarten");
    expect(forexPage).toContain(
      '{index === 0 ? "Start Level 0" : levelAction} →',
    );
    expect(forexPage).toContain("<strong>Coming soon</strong>");
  });

  it("preserves the existing Level 1 continuation destination", () => {
    const forexPage = read("learn/forex/page.tsx");

    expect(forexPage).toContain("continueState.lesson.href");
    expect(forexPage).toContain(
      '"/learn/forex/level-1/forex-kindergarten/forex-foundations"',
    );
    expect(forexPage).toContain('"Review completed module"');
  });
});
