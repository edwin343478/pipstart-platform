import { describe, expect, it } from "vitest";
import {
  actionLimitMessage,
  limitedFrom,
  retryAfterFromHint,
} from "./staff-action-limit";

describe("staff action limit (Package 4)", () => {
  it.each([
    ["retry_after=600", 600],
    ["retry_after=1", 1],
    ["retry_after=3600", 3600],
    ["retry_after=0", null],
    ["retry_after=3601", null],
    ["retry_after=60s", null],
    ["retry_after=", null],
    [" retry_after=60", null],
    [null, null],
    [600, null],
  ])("reads the store hint %j as %j", (hint, seconds) => {
    expect(retryAfterFromHint(hint)).toBe(seconds);
  });
  it("recognises only PT429 as the action limit", () => {
    expect(limitedFrom({ code: "PT429", hint: "retry_after=90" })).toEqual({
      kind: "limited",
      retryAfter: 90,
    });
    expect(limitedFrom({ code: "PT429" })).toEqual({
      kind: "limited",
      retryAfter: null,
    });
    for (const code of ["PT409", "42501", "40001", "429", ""])
      expect(limitedFrom({ code, hint: "retry_after=90" }), code).toBeNull();
    expect(limitedFrom(null)).toBeNull();
  });
  it("says nothing changed and when to try again, rounding up to whole minutes", () => {
    expect(actionLimitMessage(30)).toBe(
      "Too many changes in the last hour. Nothing was changed; your work is still here. Try again in about 1 minute.",
    );
    expect(actionLimitMessage(61)).toContain("about 2 minutes.");
    expect(actionLimitMessage(3600)).toContain("about 60 minutes.");
    expect(actionLimitMessage(null)).toContain("Try again later.");
  });
});
