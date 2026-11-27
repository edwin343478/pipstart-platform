import type { AnalysisPost } from "./posts";

const example = {
  category: "technical",
  cluster: "technical",
  status: "published",
  tag: "Illustrative example",
} as const;

export const previewTradeIdeas: AnalysisPost[] = [
  {
    ...example,
    slug: "preview-eurusd-support-retest",
    title: "EUR/USD watches for a support retest",
    excerpt:
      "Illustrative setup for visual review. A hold at 1.0845 would support the retest idea.",
    body: [
      "In this illustrative chart, buyers reclaimed a former support zone. An entry at 1.0845 depends on the next retest holding.",
      "A move below 1.0810 invalidates the setup. The example target sits at 1.0920, near the prior range high.",
    ],
    publishedAt: "2026-11-27T09:00:00.000Z",
    reviewedAt: "2026-11-27T10:00:00.000Z",
    trade: {
      instrument: "EUR/USD",
      direction: "buy-limit",
      timeframe: "h4",
      entry: "1.0845",
      stopLoss: "1.0810",
      takeProfit: "1.0920",
      chart: {
        path: "ta-review-eur.png",
        alt: "Illustrative EUR/USD chart with a support retest and all three trade levels",
        credit: "PipStart Editorial Team",
        width: 1520,
        height: 720,
      },
      status: {
        state: "active",
        reason: "pending",
        updatedAt: "2026-11-27T10:00:00.000Z",
      },
    },
  },
  {
    ...example,
    slug: "preview-audusd-channel-rebound",
    title: "AUD/USD rebound reaches its example target",
    excerpt:
      "Illustrative outcome for visual review. A higher low inside a rising channel led to a test of its upper edge.",
    body: [
      "In this illustrative chart, buyers held 0.6520 and price climbed back into the channel. The example stop was 0.6490.",
      "The setup is inactive because the chart reached its planned target at 0.6585.",
    ],
    publishedAt: "2026-11-26T09:00:00.000Z",
    reviewedAt: "2026-11-26T14:00:00.000Z",
    trade: {
      instrument: "AUD/USD",
      direction: "buy",
      timeframe: "h4",
      entry: "0.6520",
      stopLoss: "0.6490",
      takeProfit: "0.6585",
      chart: {
        path: "ta-review-aud.png",
        alt: "Illustrative AUD/USD chart climbing from 0.6520 to the 0.6585 target",
        credit: "PipStart Editorial Team",
        width: 1520,
        height: 720,
      },
      status: {
        state: "inactive",
        reason: "take-profit",
        updatedAt: "2026-11-26T14:00:00.000Z",
      },
    },
  },
];
