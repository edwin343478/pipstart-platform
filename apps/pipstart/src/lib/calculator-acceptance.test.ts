import { describe, expect, it } from "vitest";
import {
  calculateCompoundGrowth,
  calculateCryptoPositionSize,
  calculateDollarCostAveraging,
  calculateMargin,
  calculatePipValue,
  calculateProfitLoss,
  generatePurchaseSchedule,
} from "./calculator-engine";

// Fixed independent arithmetic expectations, not snapshots of implementation output.
describe("M18 final instrument/conversion acceptance", () => {
  it.each([
    ["EUR/USD", 0.1, 1, 1],
    ["USD/JPY", 0.1, 0.01, 1],
    ["XAU/USD", 0.1, 0.8, 0.08],
    ["XAG/USD", 0.1, 0.8, 0.4],
  ])(
    "%s has the documented contract and account-currency pip value",
    (instrument, lots, rate, expected) => {
      expect(
        calculatePipValue(instrument, lots, rate, "USD").valuePerPip,
      ).toBeCloseTo(expected, 12);
    },
  );
  it.each([
    ["long", "EUR/USD", 1.1, 1.105, 0.8, 40],
    ["short", "EUR/USD", 1.1, 1.105, 0.8, -40],
    ["long", "USD/JPY", 150, 149, 0.01, -100],
    ["short", "USD/JPY", 150, 149, 0.01, 100],
    ["long", "XAU/USD", 2000, 2010, 0.8, 80],
    ["short", "XAU/USD", 2000, 2010, 0.8, -80],
    ["long", "XAG/USD", 25, 26, 0.8, 400],
    ["short", "XAG/USD", 25, 26, 0.8, -400],
  ] as const)(
    "%s %s converts gains and losses once",
    (direction, instrument, entry, exit, rate, expected) => {
      expect(
        calculateProfitLoss(
          direction,
          instrument,
          0.1,
          entry,
          exit,
          rate,
          "USD",
        ).profitLoss,
      ).toBeCloseTo(expected, 10);
    },
  );
  it("converts gold margin once before applying leverage", () => {
    expect(
      calculateMargin("XAU/USD", 0.1, 2000, 50, 0.8, "USD").requiredMargin,
    ).toBe(320);
  });
});

describe("M18 final calendar/illustration acceptance", () => {
  it("retains the preferred monthly day across leap February and the new year", () => {
    expect(
      generatePurchaseSchedule("2023-12-31", "2024-03-31", "monthly"),
    ).toEqual(["2023-12-31", "2024-01-31", "2024-02-29", "2024-03-31"]);
  });
  it("biweekly dates cross a year without rounding to months", () => {
    expect(
      generatePurchaseSchedule("2025-12-20", "2026-01-18", "biweekly"),
    ).toEqual(["2025-12-20", "2026-01-03", "2026-01-17"]);
  });
  it("invalid calendar dates are rejected and reversed ranges stay empty", () => {
    expect(() =>
      generatePurchaseSchedule("2026-02-30", "2026-03-31", "weekly"),
    ).toThrow();
    expect(
      generatePurchaseSchedule("2026-03-31", "2026-01-31", "monthly"),
    ).toEqual([]);
  });
  it("bounds very long purchase schedules at 2400", () => {
    expect(
      generatePurchaseSchedule("1970-01-01", "2050-01-01", "weekly"),
    ).toHaveLength(2400);
  });
  it("falling linear prices do not imply a guaranteed DCA gain", () => {
    const result = calculateDollarCostAveraging(
      "USD",
      "BTC",
      100,
      "monthly",
      "2026-01-01",
      "2026-03-01",
      200,
      100,
    );
    expect(result.units).toBeCloseTo(13 / 6, 12);
    expect(result.averageCost).toBeCloseTo(1800 / 13, 12);
    expect(result.endingValue).toBeCloseTo(650 / 3, 10);
    expect(result.endingValue).toBeLessThan(300);
  });
  it.each(["start", "end"] as const)(
    "zero-growth %s contributions at 1200 periods stay exact",
    (timing) => {
      const result = calculateCompoundGrowth("USD", 0, 1, 1200, 0, timing);
      expect(result.endingBalance).toBe(1200);
      expect(result.illustratedGrowth).toBe(0);
    },
  );
});

describe("M18 final crypto sizing invariants", () => {
  it.each(["long", "short"] as const)(
    "leveraged %s never exceeds its modeled risk budget",
    (direction) => {
      const result = calculateCryptoPositionSize(
        1000,
        1,
        100,
        direction === "long" ? 90 : 110,
        "BTC",
        "USD",
        "leveraged",
        direction,
        0.01,
        0.03,
      );
      expect(result.positionQuantity).toBe(0.99);
      expect(result.modeledRiskAmount).toBeCloseTo(9.9, 12);
      expect(result.modeledRiskAmount).toBeLessThanOrEqual(result.riskAmount);
      expect(result.cappedByBalance).toBe(false);
    },
  );
  it("a genuinely sub-step risk size is zero and not a valid minimum order", () => {
    const result = calculateCryptoPositionSize(
      1,
      1,
      100,
      90,
      "BTC",
      "USD",
      "spot",
      "long",
      0.01,
      0.01,
    );
    expect(result.positionQuantity).toBe(0);
    expect(result.meetsMinimumOrder).toBe(false);
  });
});
