import { describe, expect, it } from "vitest";

import { getLearningProgressStorageKey } from "./learning-progress-storage";

describe("learning progress storage keys", () => {
  it("preserves the shipped Level 1 keys for existing browser data", () => {
    expect(
      getLearningProgressStorageKey(
        "forex",
        "level-1",
        "forex-kindergarten",
      ),
    ).toBe("pipstart:learn:forex:level-1:progress");
    expect(
      getLearningProgressStorageKey("crypto", "level-1", "bitcoin"),
    ).toBe("pipstart:learn:crypto:level-1:progress");
  });

  it("isolates future course progress by path, level and course", () => {
    const levelZero = getLearningProgressStorageKey(
      "forex",
      "level-0",
      "forex-orientation",
    );
    const levelTwo = getLearningProgressStorageKey(
      "forex",
      "level-2",
      "brokers-and-platforms",
    );

    expect(levelZero).toBe(
      "pipstart:learn:forex:level-0:forex-orientation:progress",
    );
    expect(levelTwo).toBe(
      "pipstart:learn:forex:level-2:brokers-and-platforms:progress",
    );
    expect(levelZero).not.toBe(levelTwo);
  });
});
