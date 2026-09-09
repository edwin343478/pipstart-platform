import { describe, expect, it } from "vitest";

import {
  parseLessonProgress,
  serializeLessonProgress,
  toggleLessonProgress,
} from "./progress";

const lessons = ["what-is-forex", "currency-pairs", "pips-and-lots"];

describe("local Forex lesson progress", () => {
  it("starts with zero progress when nothing has been stored", () => {
    expect(parseLessonProgress(null, lessons)).toEqual([]);
  });

  it("restores valid completed lessons", () => {
    const stored = serializeLessonProgress(["what-is-forex", "currency-pairs"]);

    expect(parseLessonProgress(stored, lessons)).toEqual([
      "what-is-forex",
      "currency-pairs",
    ]);
  });

  it("safely resets malformed or unsupported stored data", () => {
    expect(parseLessonProgress("not-json", lessons)).toEqual([]);
    expect(
      parseLessonProgress(
        JSON.stringify({ completedLessonSlugs: lessons, version: 2 }),
        lessons,
      ),
    ).toEqual([]);
  });

  it("filters unknown and duplicate lesson identifiers", () => {
    const stored = JSON.stringify({
      completedLessonSlugs: ["what-is-forex", "unknown", "what-is-forex", 42],
      version: 1,
    });

    expect(parseLessonProgress(stored, lessons)).toEqual(["what-is-forex"]);
  });

  it("toggles completion and produces valid versioned storage", () => {
    const completed = toggleLessonProgress(null, "currency-pairs", lessons);
    expect(parseLessonProgress(completed, lessons)).toEqual(["currency-pairs"]);

    const uncompleted = toggleLessonProgress(
      completed,
      "currency-pairs",
      lessons,
    );
    expect(parseLessonProgress(uncompleted, lessons)).toEqual([]);
  });
});
