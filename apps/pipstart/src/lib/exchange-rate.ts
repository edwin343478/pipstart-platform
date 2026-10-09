import { withCalculatorDeadline } from "./calculator-request";

export type ReferenceRate = {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  rateDate: string;
  retrievedAt: string;
  source: string;
  stale: boolean;
};

type FrankfurterRate = {
  base?: unknown;
  date?: unknown;
  quote?: unknown;
  rate?: unknown;
};

const CURRENCY_CODE = /^[A-Z]{3}$/;
const MAX_REFERENCE_AGE_DAYS = 7;
const DAY_MS = 86_400_000;

function hasValidReferenceDate(rateDate: string, now: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rateDate)) return false;
  const start = new Date(rateDate + "T00:00:00.000Z");
  return (
    Number.isFinite(now.getTime()) &&
    Number.isFinite(start.getTime()) &&
    start.toISOString().slice(0, 10) === rateDate &&
    // Official sources may use a local calendar date ahead of UTC.
    start.getTime() <= now.getTime() + DAY_MS
  );
}

export function normalizeCurrencyCode(value: string | null): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  return CURRENCY_CODE.test(normalized) ? normalized : null;
}

export function isReferenceRateStale(
  rateDate: string,
  now = new Date(),
): boolean {
  if (!hasValidReferenceDate(rateDate, now)) return true;
  const published = new Date(rateDate + "T23:59:59.999Z");

  return now.getTime() - published.getTime() > MAX_REFERENCE_AGE_DAYS * DAY_MS;
}

export async function fetchReferenceRate(
  baseCurrency: string,
  quoteCurrency: string,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<ReferenceRate> {
  if (!CURRENCY_CODE.test(baseCurrency) || !CURRENCY_CODE.test(quoteCurrency)) {
    throw new Error(
      "A valid three-letter base and quote currency is required.",
    );
  }

  if (baseCurrency === quoteCurrency) {
    return {
      baseCurrency,
      quoteCurrency,
      rate: 1,
      rateDate: now.toISOString().slice(0, 10),
      retrievedAt: now.toISOString(),
      source: "Matching currencies",
      stale: false,
    };
  }

  const payload = await withCalculatorDeadline(async (signal) => {
    const response = await fetcher(
      `https://api.frankfurter.dev/v2/rate/${baseCurrency}/${quoteCurrency}`,
      { next: { revalidate: 3600 }, signal },
    );
    if (!response.ok) {
      throw new Error(`Reference-rate provider returned ${response.status}.`);
    }
    return (await response.json()) as FrankfurterRate;
  });
  if (
    !payload ||
    payload.base !== baseCurrency ||
    payload.quote !== quoteCurrency ||
    typeof payload.date !== "string" ||
    !hasValidReferenceDate(payload.date, now) ||
    typeof payload.rate !== "number" ||
    !Number.isFinite(payload.rate) ||
    payload.rate <= 0
  ) {
    throw new Error("Reference-rate provider returned invalid data.");
  }

  return {
    baseCurrency,
    quoteCurrency,
    rate: payload.rate,
    rateDate: payload.date,
    retrievedAt: now.toISOString(),
    source: "Frankfurter central-bank reference rate",
    stale: isReferenceRateStale(payload.date, now),
  };
}
