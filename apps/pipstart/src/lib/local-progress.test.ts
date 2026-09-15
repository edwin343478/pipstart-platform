import { describe, expect, it } from "vitest";

import {
  parseLocalProgress,
  serializeLocalProgress,
  toggleLocalProgress,
} from "./local-progress";

const validIds = ["first", "second", "third"];

describe("shared local lesson progress", () => {
  it("recovers safely from empty, corrupt and unsupported data", () => {
    expect(parseLocalProgress(null, validIds)).toEqual([]);
    expect(parseLocalProgress("not-json", validIds)).toEqual([]);
    expect(
      parseLocalProgress(
        '{"version":2,"completedLessonIds":["first"]}',
        validIds,
      ),
    ).toEqual([]);
  });

  it("filters unknown and duplicate IDs while preserving lesson order", () => {
    expect(
      parseLocalProgress(
        '{"version":1,"completedLessonIds":["third","unknown","first","third"]}',
        validIds,
      ),
    ).toEqual(["first", "third"]);
  });

  it("reads the existing Forex completedLessonSlugs payload", () => {
    expect(
      parseLocalProgress(
        '{"version":1,"completedLessonSlugs":["second"]}',
        validIds,
      ),
    ).toEqual(["second"]);
  });

  it("serializes and toggles valid progress", () => {
    const stored = serializeLocalProgress(["first"]);
    expect(parseLocalProgress(stored, validIds)).toEqual(["first"]);
    expect(
      parseLocalProgress(
        toggleLocalProgress(stored, "second", validIds),
        validIds,
      ),
    ).toEqual(["first", "second"]);
  });
});
