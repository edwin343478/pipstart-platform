import { describe, expect, it } from "vitest";

import {
  tradeChartUrl,
  tradeIdeaProblem,
  tradeIdeasEnabled,
  tradeOutcome,
  tradeRiskReward,
  tradeStatusText,
  type TradeIdea,
} from "./trade-idea";
import { checkContentBody } from "./validate";

const trade: TradeIdea = {
  instrument: "EUR/USD",
  timeframe: "h4",
  direction: "buy-limit",
  entry: "1.0845",
  stopLoss: "1.0810",
  takeProfit: "1.0920",
  chart: {
    path: "eurusd-4h-2026-11-27.png",
    alt: "EUR/USD 4-hour chart with the 1.0845 support zone",
    width: 1600,
    height: 900,
  },
  status: {
    state: "active",
    reason: "pending",
    updatedAt: "2026-11-27T14:30:00.000Z",
  },
};

const withTrade = (value: unknown, category = "technical") => ({
  metadata: { title: "EUR/USD retest", category, excerpt: "A retest." },
  paragraphs: ["Why this setup."],
  trade: value,
});

const edit = (change: (t: Record<string, unknown>) => void) => {
  const copy = structuredClone(trade) as unknown as Record<string, unknown>;
  change(copy);
  return copy;
};
const status = (t: Record<string, unknown>) =>
  t.status as Record<string, unknown>;

describe("trade idea rule (TA-a, mirrors SQL analysis_trade_ok)", () => {
  it("accepts a complete trade idea and posts without one", () => {
    expect(tradeIdeaProblem(trade)).toBeNull();
    expect(checkContentBody("analysis", withTrade(trade))).toEqual({
      ok: true,
    });
    const plain = withTrade(trade);
    delete (plain as { trade?: unknown }).trade;
    expect(checkContentBody("analysis", plain)).toEqual({ ok: true });
  });

  it("keeps trade ideas to technical posts", () =>
    expect(
      checkContentBody("analysis", withTrade(trade, "fundamental")),
    ).toEqual({
      ok: false,
      reason: "Only technical posts carry trade information",
    }));

  it.each([
    [
      "lower-case instrument",
      (t: Record<string, unknown>) => (t.instrument = "eur/usd"),
    ],
    ["unknown timeframe", (t: Record<string, unknown>) => (t.timeframe = "h2")],
    [
      "unknown direction",
      (t: Record<string, unknown>) => (t.direction = "long"),
    ],
    ["number price", (t: Record<string, unknown>) => (t.entry = 1.0845)],
    ["comma price", (t: Record<string, unknown>) => (t.entry = "1,0845")],
    [
      "buy with stop above entry",
      (t: Record<string, unknown>) => (t.stopLoss = "1.0850"),
    ],
    [
      "sell with buy-side levels",
      (t: Record<string, unknown>) => (t.direction = "sell"),
    ],
    [
      "chart path with ..",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).path = "../x.png"),
    ],
    [
      "chart path svg",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).path = "x.svg"),
    ],
    [
      "invalid thumbnail path",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).thumbnailPath = "../small.png"),
    ],
    [
      "blank chart credit",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).credit = "  "),
    ],
    [
      "blank alt",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).alt = "  "),
    ],
    [
      "fractional width",
      (t: Record<string, unknown>) =>
        ((t.chart as Record<string, unknown>).width = 10.5),
    ],
    [
      "state not matching reason",
      (t: Record<string, unknown>) => (status(t).state = "inactive"),
    ],
    [
      "unknown reason",
      (t: Record<string, unknown>) => (status(t).reason = "toString"),
    ],
    [
      "note on a preset reason",
      (t: Record<string, unknown>) => (status(t).note = "x"),
    ],
    [
      "outcome on a preset reason",
      (t: Record<string, unknown>) => (status(t).outcome = "loss"),
    ],
    [
      "impossible date",
      (t: Record<string, unknown>) =>
        (status(t).updatedAt = "2026-02-30T10:00:00Z"),
    ],
    [
      "local time",
      (t: Record<string, unknown>) =>
        (status(t).updatedAt = "2026-11-27T14:30:00"),
    ],
  ])("refuses %s", (_name, change) =>
    expect(tradeIdeaProblem(edit(change))).not.toBeNull(),
  );

  it("needs a short note for Other, and an outcome for Other inactive", () => {
    const other = (s: Record<string, unknown>) =>
      edit((t) => (t.status = { ...status(t), ...s }));
    expect(
      tradeIdeaProblem(
        other({ reason: "active-other", note: "Waiting for the NFP release" }),
      ),
    ).toBeNull();
    expect(tradeIdeaProblem(other({ reason: "active-other" }))).not.toBeNull();
    expect(
      tradeIdeaProblem(
        other({ reason: "active-other", note: "x".repeat(141) }),
      ),
    ).not.toBeNull();
    expect(
      tradeIdeaProblem(
        other({
          state: "inactive",
          reason: "inactive-other",
          note: "Closed by news",
        }),
      ),
    ).not.toBeNull();
    expect(
      tradeIdeaProblem(
        other({
          state: "inactive",
          reason: "inactive-other",
          note: "Closed by news",
          outcome: "void",
        }),
      ),
    ).toBeNull();
  });
});

describe("trade idea display helpers", () => {
  it("derives outcome and status text", () => {
    expect(tradeOutcome(trade.status)).toBeNull();
    expect(tradeStatusText(trade.status)).toBe(
      "Pending: waiting for price to reach the entry",
    );
    const closed = {
      state: "inactive" as const,
      reason: "inactive-other" as const,
      note: "Central bank comments",
      outcome: "void" as const,
      updatedAt: trade.status.updatedAt,
    };
    expect(tradeOutcome(closed)).toBe("void");
    expect(tradeStatusText(closed)).toBe("Central bank comments");
    expect(
      tradeOutcome({
        ...trade.status,
        state: "inactive",
        reason: "take-profit",
      }),
    ).toBe("profit");
  });

  it("accepts an optional thumbnail and chart credit", () => {
    expect(
      tradeIdeaProblem({
        ...trade,
        chart: {
          ...trade.chart,
          thumbnailPath: "eurusd-4h-small.webp",
          credit: "PipStart Editorial Team",
        },
      }),
    ).toBeNull();
  });

  it("calculates distances from entered prices and the instrument's pip size", () => {
    expect(tradeRiskReward(trade)).toEqual({
      risk: 35,
      reward: 75,
      unit: "pip",
      ratio: "2.1",
    });
    expect(
      tradeRiskReward({
        instrument: "USD/JPY",
        entry: "156.2000",
        stopLoss: "156.900",
        takeProfit: "154.800",
      }),
    ).toEqual({ risk: 70, reward: 140, unit: "pip", ratio: "2.0" });
    expect(
      tradeRiskReward({
        instrument: "EUR/USD",
        entry: "1.08001",
        stopLoss: "1.07986",
        takeProfit: "1.08035",
      }),
    ).toEqual({ risk: 1.5, reward: 3.4, unit: "pip", ratio: "2.3" });
    expect(
      tradeRiskReward({
        instrument: "DXY",
        entry: "104.20",
        stopLoss: "104.60",
        takeProfit: "103.40",
      }),
    ).toEqual({ risk: 0.4, reward: 0.8, unit: "price unit", ratio: "2.0" });
    expect(
      tradeRiskReward({
        instrument: "XAU/USD",
        entry: "2640.50",
        stopLoss: "2636.00",
        takeProfit: "2649.50",
      }),
    ).toEqual({ risk: 4.5, reward: 9, unit: "point", ratio: "2.0" });
    expect(
      tradeRiskReward({
        instrument: "US500",
        entry: "6030",
        stopLoss: "6020",
        takeProfit: "6055",
      }),
    ).toEqual({ risk: 10, reward: 25, unit: "point", ratio: "2.5" });
    expect(tradeRiskReward({ ...trade, entry: "" })).toBeNull();
    expect(tradeRiskReward({ ...trade, stopLoss: trade.entry })).toBeNull();
  });

  it("builds chart URLs only from a valid origin and path", () => {
    expect(tradeChartUrl("a/b.png", "https://project.supabase.co")).toBe(
      "https://project.supabase.co/storage/v1/object/public/analysis-charts/a/b.png",
    );
    expect(tradeChartUrl("a/b.png", undefined)).toBeNull();
    expect(tradeChartUrl("a/b.png", "http://example.com")).toBeNull();
    expect(tradeChartUrl("a/b.png", "https://example.com/path")).toBeNull();
    expect(tradeChartUrl("../b.png", "https://project.supabase.co")).toBeNull();
  });

  it("is switched off unless set to exactly true", () => {
    expect(tradeIdeasEnabled({})).toBe(false);
    expect(tradeIdeasEnabled({ PIPSTART_TRADE_IDEAS_ENABLED: "1" })).toBe(
      false,
    );
    expect(tradeIdeasEnabled({ PIPSTART_TRADE_IDEAS_ENABLED: "true" })).toBe(
      true,
    );
  });
});

describe("status history rule (TA-c, mirrors SQL analysis_trade_status_ok)", () => {
  const withHistory = (history: unknown) => ({ ...trade, history });
  const entry = {
    state: "active",
    reason: "pending",
    at: "2026-11-27T14:30:00.000Z",
  };
  it("accepts 1 to 50 earlier statuses", () => {
    expect(tradeIdeaProblem(withHistory([entry]))).toBeNull();
    expect(tradeIdeaProblem(withHistory(Array(50).fill(entry)))).toBeNull();
    expect(
      tradeIdeaProblem(
        withHistory([
          {
            state: "active",
            reason: "active-other",
            note: "Waiting",
            at: entry.at,
          },
        ]),
      ),
    ).toBeNull();
  });
  it.each([
    ["an empty history", []],
    ["a non-list", {}],
    ["51 entries", Array(51).fill(entry)],
    ["an impossible time", [{ ...entry, at: "2026-02-30T10:00:00Z" }]],
    [
      "updatedAt instead of at",
      [{ state: "active", reason: "pending", updatedAt: entry.at }],
    ],
    ["a state not matching the reason", [{ ...entry, state: "inactive" }]],
    ["a note on a preset reason", [{ ...entry, note: "x" }]],
  ])("refuses %s", (_name, history) =>
    expect(tradeIdeaProblem(withHistory(history))).not.toBeNull(),
  );
});
