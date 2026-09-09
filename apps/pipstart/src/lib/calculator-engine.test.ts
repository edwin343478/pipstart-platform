import { describe, expect, it } from "vitest";

import {
  calculateCompoundGrowth,
  calculateCryptoPositionSize,
  calculateDollarCostAveraging,
  calculateDrawdown,
  calculateGainRecovery,
  generatePurchaseSchedule,
  calculateMargin,
  calculatePipValue,
  calculatePositionSize,
  calculateProfitLoss,
  calculateRiskReward,
} from "./calculator-engine";

describe("calculator engine", () => {
  describe("risk-to-reward", () => {
    it("calculates a 1:2 long trade and its gross break-even rate", () => {
      const result = calculateRiskReward("long", 1.1, 1.095, 1.11);

      expect(result.ratio).toBeCloseTo(2, 10);
      expect(result.breakEvenWinRate).toBeCloseTo(33.3333333333, 8);
    });

    it("calculates the same distances for a valid short trade", () => {
      const result = calculateRiskReward("short", 1.1, 1.105, 1.09);

      expect(result.riskDistance).toBeCloseTo(0.005, 10);
      expect(result.rewardDistance).toBeCloseTo(0.01, 10);
    });
  });

  describe("position size", () => {
    it("calculates 4,000 EUR/USD units for the default example", () => {
      const result = calculatePositionSize(1_000, 1, 25, 1, "EUR/USD", "USD");

      expect(result.riskAmount).toBe(10);
      expect(result.positionSize).toBe(4_000);
      expect(result.lots).toBe(0.04);
    });

    it("applies quote-to-account conversion before rounding down", () => {
      const result = calculatePositionSize(
        1_000,
        1,
        25,
        1.27,
        "EUR/GBP",
        "USD",
      );

      expect(result.positionSize).toBe(3_149);
    });

    it("rejects an unsupported instrument", () => {
      expect(() =>
        calculatePositionSize(1_000, 1, 25, 1, "UNKNOWN", "USD"),
      ).toThrow("Unsupported instrument.");
    });
  });

  describe("pip value", () => {
    it("calculates USD 10 per pip for one EUR/USD standard lot", () => {
      const result = calculatePipValue("EUR/USD", 1, 1, "USD");

      expect(result.positionSize).toBe(100_000);
      expect(result.valuePerPip).toBe(10);
    });

    it("applies a non-unit conversion rate", () => {
      const result = calculatePipValue("EUR/GBP", 1, 1.27, "USD");

      expect(result.valuePerPip).toBeCloseTo(12.7, 10);
    });
  });

  describe("profit and loss", () => {
    it("calculates a USD 500 gross profit for the reference long trade", () => {
      const result = calculateProfitLoss(
        "long",
        "EUR/USD",
        1,
        1.1,
        1.105,
        1,
        "USD",
      );

      expect(result.pipMovement).toBeCloseTo(50, 8);
      expect(result.profitLoss).toBeCloseTo(500, 8);
    });

    it("makes a falling market profitable for a short trade", () => {
      const result = calculateProfitLoss(
        "short",
        "EUR/USD",
        1,
        1.105,
        1.1,
        1,
        "USD",
      );

      expect(result.profitLoss).toBeCloseTo(500, 8);
    });
  });

  describe("margin", () => {
    it("calculates USD 1,085 for one EUR/USD lot at 1:100", () => {
      const result = calculateMargin("EUR/USD", 1, 1.085, 100, 1, "USD");

      expect(result.notionalValue).toBe(108_500);
      expect(result.requiredMargin).toBe(1_085);
      expect(result.marginRate).toBe(1);
    });
  });

  describe("drawdown", () => {
    it("shows that a 20% loss requires a 25% recovery", () => {
      const result = calculateDrawdown(10_000, 20, "percent", "USD");

      expect(result.remainingBalance).toBe(8_000);
      expect(result.recoveryPercent).toBe(25);
    });

    it("shows that a 50% loss requires a 100% recovery", () => {
      const result = calculateDrawdown(10_000, 5_000, "amount", "USD");

      expect(result.drawdownPercent).toBe(50);
      expect(result.recoveryPercent).toBe(100);
    });
  });

  describe("gain recovery", () => {
    it("rounds recovery up to the next complete period", () => {
      const result = calculateGainRecovery(8_000, 10_000, 5, "USD");

      expect(result.periods).toBe(5);
      expect(result.projectedBalance).toBeCloseTo(10_210.2525, 8);
      expect(result.totalGainNeeded).toBe(25);
    });
  });

  describe("crypto position size", () => {
    it("sizes quantity from account risk and stop distance", () => {
      const result = calculateCryptoPositionSize(
        1_000,
        1,
        60_000,
        58_800,
        "BTC",
        "USD",
        "spot",
        "long",
        0.0001,
        0.0001,
      );

      expect(result.positionQuantity).toBe(0.0083);
      expect(result.riskAmount).toBe(10);
      expect(result.stopDistancePercent).toBe(2);
      expect(result.cappedByBalance).toBe(false);
      expect(result.meetsMinimumOrder).toBe(true);
    });

    it("caps a spot position at the cash-affordable quantity", () => {
      const result = calculateCryptoPositionSize(
        1_000,
        1,
        60_000,
        59_990,
        "BTC",
        "USD",
        "spot",
        "long",
        0.0001,
        0.0001,
      );

      expect(result.riskSizedQuantity).toBe(1);
      expect(result.positionQuantity).toBe(0.0166);
      expect(result.positionValue).toBe(996);
      expect(result.cappedByBalance).toBe(true);
    });

    it("reports when a rounded quantity is below the venue minimum", () => {
      const result = calculateCryptoPositionSize(
        100,
        1,
        60_000,
        50_000,
        "BTC",
        "USD",
        "spot",
        "long",
        0.001,
        0.0001,
      );

      expect(result.positionQuantity).toBe(0.0001);
      expect(result.meetsMinimumOrder).toBe(false);
    });
  });

  describe("dollar-cost averaging", () => {
    it("generates exact weekly dates including the end date", () => {
      expect(
        generatePurchaseSchedule("2026-09-09", "2026-09-30", "weekly"),
      ).toEqual(["2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30"]);
    });

    it("clamps monthly purchases to the final day of shorter months", () => {
      expect(
        generatePurchaseSchedule("2026-01-31", "2026-04-30", "monthly"),
      ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
    });

    it("calculates units and average cost across a linear price path", () => {
      const result = calculateDollarCostAveraging(
        "USD",
        "BTC",
        100,
        "monthly",
        "2026-01-01",
        "2026-03-01",
        100,
        200,
      );

      expect(result.purchaseCount).toBe(3);
      expect(result.units).toBeCloseTo(2.1666666667, 8);
      expect(result.averageCost).toBeCloseTo(138.4615384615, 8);
    });

    it("uses the starting price for a single purchase", () => {
      const result = calculateDollarCostAveraging(
        "USD",
        "BTC",
        100,
        "monthly",
        "2026-01-01",
        "2026-01-01",
        50_000,
        60_000,
      );

      expect(result.units).toBeCloseTo(0.002, 10);
      expect(result.averageCost).toBe(50_000);
      expect(result.endingValue).toBeCloseTo(120, 10);
      expect(result.firstPurchaseDate).toBe("2026-01-01");
      expect(result.lastPurchaseDate).toBe("2026-01-01");
    });
  });

  describe("compound growth", () => {
    it("compounds end-of-period contributions", () => {
      const result = calculateCompoundGrowth("USD", 1_000, 100, 2, 10, "end");

      expect(result.totalContributed).toBe(1_200);
      expect(result.endingBalance).toBeCloseTo(1_420, 10);
      expect(result.illustratedGrowth).toBeCloseTo(220, 10);
    });

    it("compounds start-of-period contributions for one extra period", () => {
      const result = calculateCompoundGrowth("USD", 1_000, 100, 2, 10, "start");

      expect(result.endingBalance).toBeCloseTo(1_441, 10);
    });

    it("keeps total growth at zero when the rate is zero", () => {
      const result = calculateCompoundGrowth("USD", 1_000, 100, 24, 0, "end");

      expect(result.endingBalance).toBe(3_400);
      expect(result.illustratedGrowth).toBe(0);
    });
  });
});
