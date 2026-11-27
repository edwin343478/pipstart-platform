// TA-a: the optional trade idea on a technical analysis post. One module holds the shape, the
// labels readers see and the structural rule, which is the same rule for rule as the SQL
// `pipstart_editorial_private.analysis_trade_ok` (migration 20261127090000), so the server
// refuses exactly what the store refuses. Prices stay strings so "1.0920" keeps its last zero.

import { instruments } from "../../app/tools/position-size-calculator/instruments";

export const tradeTimeframes = [
  "m1",
  "m5",
  "m15",
  "m30",
  "h1",
  "h4",
  "d1",
  "w1",
] as const;
export type TradeTimeframe = (typeof tradeTimeframes)[number];

export const tradeDirections = [
  "buy",
  "sell",
  "buy-limit",
  "sell-limit",
  "buy-stop",
  "sell-stop",
] as const;
export type TradeDirection = (typeof tradeDirections)[number];

export const tradeOutcomes = ["profit", "loss", "breakeven", "void"] as const;
export type TradeOutcome = (typeof tradeOutcomes)[number];

/** Every status reason, with the state it implies and, when fixed, the outcome. */
export const tradeReasons = {
  pending: { state: "active", outcome: null },
  triggered: { state: "active", outcome: null },
  "breakeven-stop": { state: "active", outcome: null },
  "partial-profit": { state: "active", outcome: null },
  "active-other": { state: "active", outcome: null },
  "take-profit": { state: "inactive", outcome: "profit" },
  "stop-loss": { state: "inactive", outcome: "loss" },
  breakeven: { state: "inactive", outcome: "breakeven" },
  "closed-early-profit": { state: "inactive", outcome: "profit" },
  "closed-early-loss": { state: "inactive", outcome: "loss" },
  "missed-entry": { state: "inactive", outcome: "void" },
  "conditions-changed": { state: "inactive", outcome: "void" },
  expired: { state: "inactive", outcome: "void" },
  "inactive-other": { state: "inactive", outcome: null },
} as const satisfies Record<
  string,
  { state: "active" | "inactive"; outcome: TradeOutcome | null }
>;
export type TradeReason = keyof typeof tradeReasons;
export type TradeState = "active" | "inactive";

export type TradeStatus = {
  state: TradeState;
  reason: TradeReason;
  /** Required for the two "other" reasons; the analyst's own words. */
  note?: string;
  /** Required for "inactive-other"; fixed by the reason otherwise and never stored. */
  outcome?: TradeOutcome;
  updatedAt: string;
};

export type TradeChart = {
  /** Object path inside the public `analysis-charts` storage bucket. */
  path: string;
  /** Optional smaller copy with the same aspect ratio as the original. */
  thumbnailPath?: string;
  credit?: string;
  alt: string;
  width: number;
  height: number;
};

export type TradeIdea = {
  instrument: string;
  timeframe: TradeTimeframe;
  direction: TradeDirection;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  chart: TradeChart;
  status: TradeStatus;
};

export const tradeLimits = {
  instrumentLength: 20,
  noteLength: 140,
  altLength: 300,
  creditLength: 200,
  chartPathLength: 200,
  imageSide: 10000,
} as const;

export const TRADE_CHART_BUCKET = "analysis-charts";

// Patterns shared with the SQL rule (POSIX-compatible, no lookarounds).
export const PRICE_PATTERN = /^[0-9]{1,7}(\.[0-9]{1,6})?$/;
export const INSTRUMENT_PATTERN = /^[A-Z0-9][A-Z0-9/.]{0,19}$/;
export const CHART_PATH_PATTERN =
  /^[a-z0-9]+([-_/][a-z0-9]+)*\.(png|jpg|webp)$/;
export const ISO_INSTANT_PATTERN =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?Z$/;
/** A UTC instant written exactly as `toISOString` would (milliseconds optional); no Feb 30. */
const isInstant = (value: unknown): value is string => {
  if (typeof value !== "string" || !ISO_INSTANT_PATTERN.test(value))
    return false;
  const time = Date.parse(value);
  return (
    Number.isFinite(time) &&
    new Date(time).toISOString() ===
      (value.includes(".") ? value : value.replace("Z", ".000Z"))
  );
};

export const timeframeLabels: Record<TradeTimeframe, string> = {
  m1: "1 min",
  m5: "5 min",
  m15: "15 min",
  m30: "30 min",
  h1: "1H",
  h4: "4H",
  d1: "Daily",
  w1: "Weekly",
};

export const directionLabels: Record<TradeDirection, string> = {
  buy: "Buy",
  sell: "Sell",
  "buy-limit": "Buy limit",
  "sell-limit": "Sell limit",
  "buy-stop": "Buy stop",
  "sell-stop": "Sell stop",
};

export const reasonLabels: Record<TradeReason, string> = {
  pending: "Pending: waiting for price to reach the entry",
  triggered: "Triggered: the trade is running",
  "breakeven-stop": "Running: stop loss moved to breakeven",
  "partial-profit": "Running: partial profit taken",
  "active-other": "Other active reason",
  "take-profit": "Take profit reached: closed in profit",
  "stop-loss": "Stop loss hit: closed at a loss",
  breakeven: "Closed at breakeven",
  "closed-early-profit": "Closed early in profit",
  "closed-early-loss": "Closed early at a loss",
  "missed-entry": "Invalidated: price moved away without reaching the entry",
  "conditions-changed": "Invalidated: market conditions changed",
  expired: "Expired: the setup’s time window has passed",
  "inactive-other": "Other inactive reason",
};

export const outcomeLabels: Record<TradeOutcome, string> = {
  profit: "Profit",
  loss: "Loss",
  breakeven: "Breakeven",
  void: "No longer valid",
};

export const isBuy = (direction: TradeDirection) => direction.startsWith("buy");
export const isOtherReason = (reason: TradeReason) =>
  reason === "active-other" || reason === "inactive-other";

/** The outcome readers see: fixed by the reason, or the analyst's pick for "inactive-other". */
export function tradeOutcome(status: TradeStatus): TradeOutcome | null {
  return status.reason === "inactive-other"
    ? (status.outcome ?? null)
    : tradeReasons[status.reason].outcome;
}

/** The status line readers see: the reason's label, or the analyst's note for "other". */
export function tradeStatusText(status: TradeStatus): string {
  return isOtherReason(status.reason) && status.note
    ? status.note
    : reasonLabels[status.reason];
}

const priceScale = 1_000_000;
const pipSizes = new Map(
  instruments.map(({ label, pipSize }) => [
    label.replace("/", ""),
    Math.round(pipSize * priceScale),
  ]),
);

// Six decimal places fit safely in a scaled integer for every accepted price.
function scaledPrice(price: string): number {
  const [whole, fraction = ""] = price.split(".");
  return Number(whole + fraction.padEnd(6, "0"));
}

/** Calculate from the manually entered levels. Unknown instruments use quote-price units. */
export function tradeRiskReward(
  trade: Pick<TradeIdea, "instrument" | "entry" | "stopLoss" | "takeProfit">,
) {
  const { entry, stopLoss, takeProfit } = trade;
  if (
    ![entry, stopLoss, takeProfit].every((price) => PRICE_PATTERN.test(price))
  )
    return null;

  const risk = Math.abs(scaledPrice(entry) - scaledPrice(stopLoss));
  const reward = Math.abs(scaledPrice(takeProfit) - scaledPrice(entry));
  if (risk === 0 || reward === 0) return null;

  const pipSize = pipSizes.get(trade.instrument.replace("/", ""));
  const unitSize = pipSize ?? priceScale;
  return {
    risk: risk / unitSize,
    reward: reward / unitSize,
    unit: pipSize ? "pip" : "price unit",
    ratio: (Math.round((reward * 10) / risk) / 10).toFixed(1),
  };
}

/** The public address of a chart, or null without a valid public Supabase origin. */
export function tradeChartUrl(
  path: string,
  supabaseUrl: string | undefined,
): string | null {
  if (!CHART_PATH_PATTERN.test(path)) return null;
  if (
    tradeIdeasVisualPreview() &&
    (path === "ta-review-eur.png" || path === "ta-review-aud.png")
  )
    return "/ta-visual-preview/" + path.replace(".png", ".svg");
  try {
    const base = new URL((supabaseUrl ?? "").trim());
    const loopback =
      base.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(base.hostname);
    if (
      (base.protocol !== "https:" && !loopback) ||
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash
    )
      return null;
    return `${base.origin}/storage/v1/object/public/${TRADE_CHART_BUCKET}/${path}`;
  } catch {
    return null;
  }
}

/** Temporary visual review deployment. The release branch does not include this fixture. */
export function tradeIdeasVisualPreview(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === "codex/ta-a-visual-preview"
  );
}

/** The reader-facing switch. Off (default): trade fields are kept but pages look as before. */
export function tradeIdeasEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    tradeIdeasVisualPreview(env) || env.PIPSTART_TRADE_IDEAS_ENABLED === "true"
  );
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const btrim = (value: string) => value.replace(/^ +| +$/g, "");
const charLength = (value: string) => [...value].length;
const text = (value: unknown, max: number) =>
  typeof value === "string" &&
  charLength(btrim(value)) >= 1 &&
  charLength(value) <= max;
const side = (value: unknown) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= tradeLimits.imageSide;

/** Structural rule for a trade idea; null when valid, else the reason it is refused. */
export function tradeIdeaProblem(trade: unknown): string | null {
  if (!isObject(trade)) return "Trade information must be an object";
  if (
    typeof trade.instrument !== "string" ||
    !INSTRUMENT_PATTERN.test(trade.instrument)
  )
    return "Instrument must be 1 to 20 capital letters, digits, / or .";
  if (!(tradeTimeframes as readonly unknown[]).includes(trade.timeframe))
    return "Unsupported timeframe";
  if (!(tradeDirections as readonly unknown[]).includes(trade.direction))
    return "Unsupported trade direction";
  for (const key of ["entry", "stopLoss", "takeProfit"] as const)
    if (typeof trade[key] !== "string" || !PRICE_PATTERN.test(trade[key]))
      return "Entry, stop loss and take profit must be prices such as 1.0845";
  const entry = Number(trade.entry);
  const stop = Number(trade.stopLoss);
  const target = Number(trade.takeProfit);
  if (
    isBuy(trade.direction as TradeDirection)
      ? !(stop < entry && entry < target)
      : !(target < entry && entry < stop)
  )
    return "A buy needs stop loss < entry < take profit; a sell the reverse";
  const chart = trade.chart;
  if (
    !isObject(chart) ||
    typeof chart.path !== "string" ||
    chart.path.length > tradeLimits.chartPathLength ||
    !CHART_PATH_PATTERN.test(chart.path) ||
    ("thumbnailPath" in chart &&
      (typeof chart.thumbnailPath !== "string" ||
        chart.thumbnailPath.length > tradeLimits.chartPathLength ||
        !CHART_PATH_PATTERN.test(chart.thumbnailPath))) ||
    ("credit" in chart && !text(chart.credit, tradeLimits.creditLength)) ||
    !text(chart.alt, tradeLimits.altLength) ||
    !side(chart.width) ||
    !side(chart.height)
  )
    return "A chart image with a description is required";
  const status = trade.status;
  if (!isObject(status)) return "A trade status is required";
  const rule =
    typeof status.reason === "string" &&
    Object.prototype.hasOwnProperty.call(tradeReasons, status.reason)
      ? tradeReasons[status.reason as TradeReason]
      : null;
  if (!rule || status.state !== rule.state)
    return "The status reason does not match Active or Inactive";
  const other = isOtherReason(status.reason as TradeReason);
  if (other ? !text(status.note, tradeLimits.noteLength) : "note" in status)
    return "A written explanation (up to 140 characters) goes with “Other” only";
  if (
    status.reason === "inactive-other"
      ? !(tradeOutcomes as readonly unknown[]).includes(status.outcome)
      : "outcome" in status
  )
    return "Choose an outcome for “Other inactive reason” only";
  if (!isInstant(status.updatedAt))
    return "The status needs the time it was set";
  return null;
}
