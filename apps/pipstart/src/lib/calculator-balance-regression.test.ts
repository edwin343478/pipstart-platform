import { describe, expect, it } from "vitest";
import {
  calculatePositionSize,
  calculateCryptoPositionSize,
} from "./calculator-engine";
import { ceilCalculatorRatioToStep } from "./calculator-precision";

describe("M18 calculated minimum balance", () => {
  it.each([
    ["USD", 1],
    ["EUR", 0.8],
    ["GBP", 0.75],
    ["JPY", 150],
    ["CHF", 0.9],
    ["CAD", 1.25],
    ["AUD", 1.5],
    ["NZD", 2],
    ["TZS", 2500],
    ["KES", 125],
    ["GHS", 11.7905],
  ] as const)(
    "%s: suggested cent-rounded balance actually permits the minimum, one cent less does not",
    (currency, rate) => {
      const low = calculatePositionSize(1, 1, 25, rate, "EUR/USD", currency);
      const minimum = low.minimumRequiredBalance;
      expect(minimum).toBeGreaterThan(0);
      expect(
        calculatePositionSize(minimum, 1, 25, rate, "EUR/USD", currency)
          .meetsMinimumVolume,
      ).toBe(true);
      expect(
        calculatePositionSize(
          Number((minimum - 0.01).toFixed(2)),
          1,
          25,
          rate,
          "EUR/USD",
          currency,
        ).meetsMinimumVolume,
      ).toBe(false);
    },
  );
  it("uses selected risk and stop, not a hard-coded deposit amount", () => {
    expect(
      calculatePositionSize(1000, 1, 25, 11.7905, "EUR/USD", "GHS")
        .minimumRequiredBalance,
    ).toBe(2947.63);
    expect(
      calculatePositionSize(1000, 2, 25, 11.7905, "EUR/USD", "GHS")
        .minimumRequiredBalance,
    ).toBe(1473.82);
    expect(
      calculatePositionSize(1000, 1, 250, 1, "EUR/USD", "USD")
        .minimumRequiredBalance,
    ).toBe(2500);
  });
  it("ceil rounds the explanation upwards without binary-float boundary drift", () => {
    expect(ceilCalculatorRatioToStep([0.1, 0.2], [1], 0.01)).toBe(0.02);
    expect(ceilCalculatorRatioToStep([2947.625], [1], 0.01)).toBe(2947.63);
    expect(() => ceilCalculatorRatioToStep([1], [0], 0.01)).toThrow();
    expect(() =>
      ceilCalculatorRatioToStep([Number.MAX_VALUE], [1], 0.01),
    ).toThrow();
  });
  it.each(["spot", "leveraged"] as const)(
    "%s: crypto minimum respects quantity steps, risk budget and spot affordability",
    (mode) => {
      const calculate = (balance: number) =>
        calculateCryptoPositionSize(
          balance,
          1,
          100,
          99.9,
          "BTC",
          "USD",
          mode,
          "long",
          0.015,
          0.01,
        );
      const low = calculate(0.01);
      expect(low.minimumExecutableQuantity).toBe(0.02);
      expect(low.minimumRequiredBalance).toBe(mode === "spot" ? 2 : 0.2);
      expect(calculate(low.minimumRequiredBalance).meetsMinimumOrder).toBe(
        true,
      );
      expect(
        calculate(Number((low.minimumRequiredBalance - 0.01).toFixed(2)))
          .meetsMinimumOrder,
      ).toBe(false);
    },
  );
});
