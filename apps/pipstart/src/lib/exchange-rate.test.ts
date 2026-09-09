import { describe, expect, it, vi } from "vitest";

import {
  fetchReferenceRate,
  isReferenceRateStale,
  normalizeCurrencyCode,
} from "./exchange-rate";

describe("exchange-rate service", () => {
  it("normalizes valid currency codes and rejects invalid input", () => {
    expect(normalizeCurrencyCode(" usd ")).toBe("USD");
    expect(normalizeCurrencyCode("US")).toBeNull();
    expect(normalizeCurrencyCode("US1")).toBeNull();
  });

  it("returns a safe unit rate without calling a provider for matching currencies", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const now = new Date("2026-09-09T10:00:00.000Z");

    const result = await fetchReferenceRate("USD", "USD", fetcher, now);

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.rate).toBe(1);
    expect(result.stale).toBe(false);
  });

  it("validates and returns the latest provider rate", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          base: "GBP",
          date: "2026-09-08",
          quote: "USD",
          rate: 1.3521,
        }),
        { status: 200 },
      ),
    );

    const result = await fetchReferenceRate(
      "GBP",
      "USD",
      fetcher,
      new Date("2026-09-09T10:00:00.000Z"),
    );

    expect(result.rate).toBe(1.3521);
    expect(result.rateDate).toBe("2026-09-08");
    expect(result.stale).toBe(false);
  });

  it("rejects invalid provider data", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ rate: 0 }), { status: 200 }),
      );

    await expect(fetchReferenceRate("GBP", "USD", fetcher)).rejects.toThrow(
      "invalid data",
    );
  });

  it("flags reference data older than seven days", () => {
    expect(
      isReferenceRateStale("2026-09-01", new Date("2026-09-09T10:00:00.000Z")),
    ).toBe(true);
  });
});
