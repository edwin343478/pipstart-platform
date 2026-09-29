import { describe, expect, it } from "vitest";

import {
  forexProgressStorageKey,
  getGenericForexLevelContext,
  getGenericForexLevelParams,
  getGenericForexLevelRootLesson,
  getGenericForexModule,
  getGenericForexModuleParams,
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
} from "./forex-level-routing";

describe("generic Forex level routing", () => {
  it("keeps the existing Level 1 route owned by the legacy route tree", () => {
    expect(getGenericForexLevelContext("level-1")).toBeUndefined();
    expect(getGenericForexLevelRootLesson("level-1")).toBeUndefined();
    expect(
      getGenericForexSecondSegment("level-1", "currency-pairs"),
    ).toBeUndefined();
    expect(
      getGenericForexModule(
        "level-1",
        "forex-kindergarten",
        "forex-foundations",
      ),
    ).toBeUndefined();
  });

  it("publishes Level 0 while keeping later Forex levels unavailable", () => {
    expect(getGenericForexLevelParams()).toEqual([{ level: "level-0" }]);
    expect(getGenericForexSecondSegmentParams()).toEqual([
      { level: "level-0", segment: "forex-orientation" },
      { level: "level-0", segment: "trading-versus-investing" },
      { level: "level-0", segment: "money-risk-and-demo" },
      { level: "level-0", segment: "spot-forex-scams-and-safety" },
    ]);
    expect(getGenericForexModuleParams()).toEqual([
      {
        level: "level-0",
        module: "orientation-and-safety",
        segment: "forex-orientation",
      },
    ]);

    expect(getGenericForexLevelRootLesson("level-0")).toMatchObject({
      lesson: {
        href: "/learn/forex/level-0",
        id: "orientation-course-purpose",
      },
      progressKey: "pipstart:learn:forex:level-0:forex-orientation:progress",
      quizTarget: null,
    });
    expect(
      getGenericForexSecondSegment("level-0", "forex-orientation"),
    ).toMatchObject({ kind: "course" });
    expect(
      getGenericForexSecondSegment("level-0", "trading-versus-investing"),
    ).toMatchObject({
      kind: "lesson",
      lesson: { id: "trading-versus-investing" },
    });
    expect(
      getGenericForexModule(
        "level-0",
        "forex-orientation",
        "orientation-and-safety",
      ),
    ).toBeDefined();

    expect(
      getGenericForexSecondSegment("level-2", "broker-purpose"),
    ).toBeUndefined();
    expect(
      getGenericForexModule(
        "level-2",
        "brokers-and-platforms",
        "broker-foundations",
      ),
    ).toBeUndefined();
  });

  it("preserves Level 1 browser data and isolates Level 0 progress", () => {
    expect(forexProgressStorageKey("level-1", "forex-kindergarten")).toBe(
      "pipstart:learn:forex:level-1:progress",
    );
    expect(forexProgressStorageKey("level-0", "forex-orientation")).toBe(
      "pipstart:learn:forex:level-0:forex-orientation:progress",
    );
    expect(
      forexProgressStorageKey("level-2", "brokers-and-platforms"),
    ).not.toBe(forexProgressStorageKey("level-0", "forex-orientation"));
  });
});
