import { afterEach, describe, expect, it, vi } from "vitest";

import {
  calculateCryptoPositionSize,
  calculateDrawdown,
  calculateGainRecovery,
  calculatePositionSize,
  calculateProfitLoss,
} from "./calculator-engine";
import {
  formatCalculatorNumber,
  parseCalculatorNumber,
} from "./calculator-format";
import { floorCalculatorRatioToStep } from "./calculator-precision";
import { withCalculatorDeadline } from "./calculator-request";
import { fetchReferenceRate, isReferenceRateStale } from "./exchange-rate";
import {
  isUsableCalculatorRate,
  loadCalculatorRate,
} from "./calculator-reference-rate";
import { validateNumericFields } from "../app/tools/calculator-validation";

const now = new Date("2026-10-08T10:00:00.000Z");
const rate = {
  baseCurrency: "GBP",
  quoteCurrency: "USD",
  rate: 1.25,
  rateDate: "2026-10-08",
  retrievedAt: now.toISOString(),
  source: "Test reference rate",
  stale: false,
};
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("M18 exact numerical boundaries", () => {
  it.each([
    [100, 144, 20, 2],
    [100, 143.99999999999997, 20, 2],
    [100, 144.00000000000003, 20, 3],
    [100, 103.0301, 1, 3],
    [100, 104.04, 2, 2],
    [100, 248.832, 20, 5],
    [1000, 2000, 0.01, 6932],
  ])(
    "recovery %s -> %s at %s%% requires %s periods",
    (current, target, gain, periods) => {
      const result = calculateGainRecovery(current, target, gain, "USD");
      expect(result.periods).toBe(periods);
      expect(result.projectedBalance).toBeGreaterThanOrEqual(target);
    },
  );

  it.each([
    [205, 2.05],
    [204.99999999999997, 2.04],
    [205.00000000000003, 2.05],
    [213, 2.13],
  ])("floors the decimal lot boundary for balance %s", (balance, expected) => {
    const result = calculatePositionSize(balance, 1, 0.1, 1, "EUR/USD", "USD");
    expect(result.lots).toBe(expected);
    expect(result.riskAmount).toBeLessThanOrEqual(result.riskLimit);
  });

  it("does not raise a genuinely sub-step value to a minimum step", () => {
    expect(floorCalculatorRatioToStep([0.009999999999999998], [1], 0.01)).toBe(
      0,
    );
    expect(floorCalculatorRatioToStep([0.1], [3], 0.01)).toBe(0.03);
  });

  it.each([0, -1, NaN, Infinity])("rejects unsafe step %s", (step) => {
    expect(() => floorCalculatorRatioToStep([1], [1], step)).toThrow(
      RangeError,
    );
  });

  it("rejects a step count beyond exact integer representation", () => {
    expect(() => floorCalculatorRatioToStep([1e100], [1], 1e-8)).toThrow(
      RangeError,
    );
  });

  it("keeps a valid eight-decimal crypto quantity", () => {
    const result = calculateCryptoPositionSize(
      1,
      0.01,
      60000,
      50000,
      "BTC",
      "USD",
      "spot",
      "long",
      1e-8,
      1e-8,
    );
    expect(result.positionQuantity).toBe(1e-8);
    expect(result.meetsMinimumOrder).toBe(true);
    expect(formatCalculatorNumber(result.positionQuantity, 6, 8)).toBe(
      "0.00000001",
    );
  });

  it("distinguishes risk budget from risk after the cash cap", () => {
    const result = calculateCryptoPositionSize(
      1000,
      1,
      60000,
      59990,
      "BTC",
      "USD",
      "spot",
      "long",
      0.0001,
      0.0001,
    );
    expect(result.riskAmount).toBe(10);
    expect(result.modeledRiskAmount).toBeCloseTo(0.166, 12);
    expect(result.positionValue).toBeLessThanOrEqual(result.balance);
    expect(result.modeledRiskAmount).toBeLessThanOrEqual(result.riskAmount);
    const capped = calculateCryptoPositionSize(
      1000,
      1,
      0.000001,
      0.0000009999999999,
      "DOGE",
      "USD",
      "spot",
      "long",
      0.0001,
      0.0001,
    );
    expect(capped.positionQuantity).toBe(1_000_000_000);
    expect(capped.positionValue).toBeLessThanOrEqual(capped.balance);
  });

  it("sizes decimal crypto stop distances without losing an exact step", () => {
    const result = calculateCryptoPositionSize(
      1,
      1,
      0.3,
      0.2,
      "BTC",
      "USD",
      "leveraged",
      "long",
      0.01,
      0.01,
    );
    expect(result.riskPerCoin).toBe(0.1);
    expect(result.positionQuantity).toBe(0.1);
  });

  it("supports zero gross P&L and zero drawdown", () => {
    expect(
      calculateProfitLoss("long", "EUR/USD", 1, 1.1, 1.1, 1, "USD").profitLoss,
    ).toBe(0);
    expect(calculateDrawdown(1000, 0, "percent", "USD").recoveryPercent).toBe(
      0,
    );
    expect(() => calculateDrawdown(1000, 100, "percent", "USD")).toThrow(
      RangeError,
    );
  });
});

describe("M18 parsing and display policy", () => {
  it.each(["", " ", "\t"])("keeps missing input invalid: %j", (value) => {
    const parsed = parseCalculatorNumber(value);
    expect(Number.isNaN(parsed)).toBe(true);
    expect(
      validateNumericFields([
        { field: "growth", label: "growth", minimum: 0, value: parsed },
      ]),
    ).toEqual({ field: "growth", message: "Enter a valid growth." });
  });
  it("preserves explicit zero", () => {
    expect(parseCalculatorNumber("0")).toBe(0);
    expect(
      validateNumericFields([
        {
          field: "growth",
          label: "growth",
          minimum: 0,
          value: parseCalculatorNumber("0"),
        },
      ]),
    ).toBeNull();
  });
  it.each([
    [13.84615385, 2, 2, "13.85"],
    [0.0083, 6, 8, "0.008300"],
    [0.0001, 2, 4, "0.0001"],
    [0.001, 2, 2, "0.001"],
    [0.000001, 2, 2, "0.000001"],
    [0.000001, 4, 8, "0.000001"],
    [0, 2, 2, "0.00"],
    [-0.001, 2, 2, "-0.001"],
  ])(
    "formats %s without changing ordinary precision",
    (value, minimum, maximum, expected) => {
      expect(formatCalculatorNumber(value, minimum, maximum)).toBe(expected);
    },
  );
  it("uses scientific notation rather than a false zero or enormous string", () => {
    expect(formatCalculatorNumber(1e-25, 0, 8)).toBe("1.0000e-25");
    expect(formatCalculatorNumber(1e25)).toBe("1.0000e+25");
    expect(formatCalculatorNumber(NaN)).toBe("—");
    expect(formatCalculatorNumber(12345.678, 0, 8, true)).toBe("12,345.678");
  });
});

describe("M18 reference rate validation and deadlines", () => {
  it.each(["2099-01-01", "2026-02-30", "2026-13-01", "not-a-date"])(
    "rejects invalid or implausibly future rate date %s",
    (date) => {
      expect(isReferenceRateStale(date, now)).toBe(true);
      expect(
        isUsableCalculatorRate({ ...rate, rateDate: date }, "GBP", "USD", now),
      ).toBe(false);
    },
  );
  it("allows a source-local next-day date within the documented one-day tolerance", () => {
    expect(isReferenceRateStale("2026-10-09", now)).toBe(false);
    expect(isReferenceRateStale("2026-10-10", now)).toBe(true);
  });
  it.each([
    null,
    {},
    { ...rate, rate: 0 },
    { ...rate, rate: Infinity },
    { ...rate, baseCurrency: "EUR" },
    { ...rate, stale: true },
    { ...rate, rateDate: "2026-09-01" },
    { ...rate, retrievedAt: "invalid" },
  ])("does not accept malformed client payload %j", (payload) => {
    expect(isUsableCalculatorRate(payload, "GBP", "USD", now)).toBe(false);
  });

  it("bounds a provider that never resolves, including an abort-ignoring transport", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation((_url, options) => {
        signal = options?.signal as AbortSignal;
        return new Promise(() => {});
      });
    const pending = expect(
      fetchReferenceRate("GBP", "USD", fetcher, now),
    ).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(8000);
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("bounds JSON body reading too", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => new Promise(() => {}),
    } as Response);
    const pending = expect(
      fetchReferenceRate("GBP", "USD", fetcher, now),
    ).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(8000);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels without retaining timeout timers", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const pending = expect(
      withCalculatorDeadline(() => new Promise(() => {}), controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects future upstream dates instead of blessing them as fresh", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          base: "GBP",
          quote: "USD",
          date: "2099-01-01",
          rate: 1.25,
        }),
      ),
    );
    await expect(
      fetchReferenceRate("GBP", "USD", fetcher, now),
    ).rejects.toThrow("invalid data");
  });

  it("returns matching currencies without a network request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await loadCalculatorRate(
      "USD",
      "USD",
      new AbortController().signal,
      fetcher,
      now,
    );
    expect(result.rate).toBe(1);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refreshes by making a new request rather than restoring an old rate", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(JSON.stringify(rate)));
    await loadCalculatorRate(
      "GBP",
      "USD",
      new AbortController().signal,
      fetcher,
      now,
    );
    await loadCalculatorRate(
      "GBP",
      "USD",
      new AbortController().signal,
      fetcher,
      now,
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenLastCalledWith(
      "/api/exchange-rate?base=GBP&quote=USD",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("makes cancellation win over a late old response", async () => {
    let finish!: (value: Response) => void;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const controller = new AbortController();
    const pending = expect(
      loadCalculatorRate("GBP", "USD", controller.signal, fetcher, now),
    ).rejects.toMatchObject({ name: "AbortError" });
    await Promise.resolve();
    controller.abort();
    finish(new Response(JSON.stringify(rate)));
    await pending;
  });
});
