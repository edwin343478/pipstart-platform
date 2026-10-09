import { isReferenceRateStale, type ReferenceRate } from "./exchange-rate";
import { withCalculatorDeadline } from "./calculator-request";

export function isUsableCalculatorRate(
  value: unknown,
  base: string,
  quote: string,
  now = new Date(),
): value is ReferenceRate {
  if (!value || typeof value !== "object") return false;
  const rate = value as Partial<ReferenceRate>;
  return (
    rate.baseCurrency === base &&
    rate.quoteCurrency === quote &&
    typeof rate.rate === "number" &&
    Number.isFinite(rate.rate) &&
    rate.rate > 0 &&
    typeof rate.rateDate === "string" &&
    !isReferenceRateStale(rate.rateDate, now) &&
    rate.stale === false &&
    typeof rate.source === "string" &&
    rate.source.trim().length > 0 &&
    typeof rate.retrievedAt === "string" &&
    Number.isFinite(Date.parse(rate.retrievedAt))
  );
}

export async function loadCalculatorRate(
  base: string,
  quote: string,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<ReferenceRate> {
  if (signal.aborted) {
    throw new DOMException("The request was cancelled.", "AbortError");
  }
  if (base === quote) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: 1,
      rateDate: now.toISOString().slice(0, 10),
      retrievedAt: now.toISOString(),
      source: "Matching currencies",
      stale: false,
    };
  }
  return withCalculatorDeadline(
    async (requestSignal) => {
      const response = await fetcher(
        "/api/exchange-rate?base=" +
          encodeURIComponent(base) +
          "&quote=" +
          encodeURIComponent(quote),
        { signal: requestSignal, cache: "no-store" },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !isUsableCalculatorRate(payload, base, quote, now)) {
        throw new Error("The reference rate is unavailable or invalid.");
      }
      return payload;
    },
    signal,
    10_000,
  );
}
