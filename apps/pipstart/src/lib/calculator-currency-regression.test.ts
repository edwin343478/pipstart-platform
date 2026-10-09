import { describe, expect, it } from "vitest";
import {
  calculateCompoundGrowth,
  calculateCryptoPositionSize,
  calculateDollarCostAveraging,
  calculateDrawdown,
  calculateGainRecovery,
  calculateMargin,
  calculatePipValue,
  calculatePositionSize,
  calculateProfitLoss,
  calculateRiskReward,
} from "./calculator-engine";
import { formatCalculatorNumber } from "./calculator-format";
import { accountCurrencies } from "../app/tools/position-size-calculator/instruments";
import { cryptoAccountCurrencies } from "../app/tools/crypto-options";

// Synthetic USD-to-account fixtures, NOT live rates or trading recommendations.
const rates = [
  ["USD", 1, 4000],
  ["EUR", 0.8, 5000],
  ["GBP", 0.75, 5000],
  ["JPY", 150, 0],
  ["CHF", 0.9, 4000],
  ["CAD", 1.25, 3000],
  ["AUD", 1.5, 2000],
  ["NZD", 2, 2000],
  ["TZS", 2500, 0],
  ["KES", 125, 0],
  ["GHS", 10, 0],
] as const;

describe("M18 all-account-currency zero-output regression", () => {
  it("covers every supported Forex account currency exactly once", () => {
    expect(rates.map(([currency]) => currency)).toEqual(accountCurrencies);
  });
  it.each(rates)(
    "%s: unchanged 1000 balance obeys risk budget and minimum step",
    (currency, rate, expectedUnits) => {
      const result = calculatePositionSize(
        1000,
        1,
        25,
        rate,
        "EUR/USD",
        currency,
      );
      expect(result.positionSize).toBe(expectedUnits);
      expect(result.minimumRiskAmount).toBeCloseTo(2.5 * rate, 12);
      expect(result.riskAmount).toBeLessThanOrEqual(result.riskLimit);
      expect(result.meetsMinimumVolume).toBe(expectedUnits > 0);
      expect(result).toMatchObject({
        conversionRate: rate,
        riskPercent: 1,
        stopLoss: 25,
        instrument: "EUR/USD",
      });
    },
  );
  it.each(rates)(
    "%s: equal monetary buying power gives the same permitted position",
    (currency, rate) => {
      const result = calculatePositionSize(
        1000 * rate,
        1,
        25,
        rate,
        "EUR/USD",
        currency,
      );
      expect(result.positionSize).toBe(4000);
      expect(result.meetsMinimumVolume).toBe(true);
    },
  );
  it.each(rates)(
    "%s: pip value, P&L and margin convert without an artificial zero",
    (currency, rate) => {
      const pip = calculatePipValue("EUR/USD", 0.1, rate, currency);
      const profit = calculateProfitLoss(
        "long",
        "EUR/USD",
        0.1,
        1.1,
        1.105,
        rate,
        currency,
      );
      const margin = calculateMargin("EUR/USD", 0.1, 1.1, 50, rate, currency);
      expect(pip.valuePerPip).toBeCloseTo(rate, 12);
      expect(profit.profitLoss).toBeCloseTo(50 * rate, 10);
      expect(margin.requiredMargin).toBeCloseTo(220 * rate, 10);
      for (const value of [
        pip.valuePerPip,
        profit.profitLoss,
        margin.requiredMargin,
      ]) {
        expect(value).toBeGreaterThan(0);
        expect(Number(formatCalculatorNumber(value))).toBeGreaterThan(0);
      }
      expect(pip.conversionRate).toBe(rate);
      expect(profit).toMatchObject({
        conversionRate: rate,
        entryPrice: 1.1,
        exitPrice: 1.105,
      });
      expect(margin).toMatchObject({ conversionRate: rate, marketPrice: 1.1 });
    },
  );
  it.each(rates)(
    "%s: drawdown and recovery use account-denominated amounts, not exchange rates",
    (currency) => {
      expect(
        calculateDrawdown(1000, 20, "percent", currency).recoveryPercent,
      ).toBe(25);
      expect(calculateGainRecovery(100, 144, 20, currency).periods).toBe(2);
    },
  );
  it.each(cryptoAccountCurrencies)(
    "%s: crypto/DCA/compound supported currency labels do not create zeros",
    (currency) => {
      expect(
        calculateCryptoPositionSize(
          1000,
          1,
          100,
          90,
          "BTC",
          currency,
          "spot",
          "long",
          0.01,
          0.01,
        ).positionQuantity,
      ).toBe(1);
      expect(
        calculateDollarCostAveraging(
          currency,
          "BTC",
          100,
          "monthly",
          "2026-01-01",
          "2026-03-01",
          100,
          200,
        ).endingValue,
      ).toBeGreaterThan(0);
      expect(
        calculateCompoundGrowth(currency, 1000, 100, 2, 10, "end")
          .endingBalance,
      ).toBeCloseTo(1420, 10);
    },
  );
  it("risk/reward has no account-currency conversion", () => {
    expect(calculateRiskReward("long", 100, 90, 120).ratio).toBe(2);
  });
  it("JPY at the exact minimum risk budget passes; genuinely below remains blocked", () => {
    expect(
      calculatePositionSize(37500, 1, 25, 150, "EUR/USD", "JPY").lots,
    ).toBe(0.01);
    expect(
      calculatePositionSize(37499.99, 1, 25, 150, "EUR/USD", "JPY").lots,
    ).toBe(0);
  });
  it("tiny 10-pip values stay nonzero in the formatter used by the breakdown", () => {
    const result = calculatePipValue("EUR/USD", 0.0001, 0.000001, "GHS");
    expect(result.valuePerPip).toBeCloseTo(1e-9, 18);
    expect(formatCalculatorNumber(result.valuePerPip * 10, 2)).toBe(
      "0.00000001",
    );
  });
});
