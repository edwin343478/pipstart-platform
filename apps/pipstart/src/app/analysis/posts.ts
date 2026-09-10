export type AnalysisCategory = "fundamental" | "technical";

export interface AnalysisPost {
  slug: string;
  category: AnalysisCategory;
  tag: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  reviewedAt: string;
  cluster: AnalysisCategory;
}

export const analysisPageCopy = {
  heading: "Analysis",
  subheading:
    "Educational commentary on market conditions, written to build understanding — not to call trades. Not financial advice.",
};

export function formatPublishedDate(publishedAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(publishedAt));
}

export const analysisPosts: AnalysisPost[] = [
  {
    slug: "central-bank-rate-hold-signal",
    category: "fundamental",
    tag: "Interest Rates",
    title: "What a central bank rate hold actually signals",
    excerpt:
      "Why markets often react more to the tone of a statement than the rate decision itself, and what that means for a beginner reading the news.",
    body: [
      "When a central bank leaves its policy rate unchanged, the immediate headline can look uneventful. But markets rarely react to the number alone — they react to the tone of what comes with it.",
      "A “hold” paired with cautious language about future hikes is read very differently from a “hold” paired with a warning that inflation risks are rising. The same decision, two different signals.",
      "For a beginner, the useful habit isn't predicting the next move — it's noticing which part of a statement moved the market, and asking why.",
    ],
    publishedAt: "2026-09-06T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "fundamental",
  },
  {
    slug: "reading-a-jobs-report",
    category: "fundamental",
    tag: "Employment Data",
    title: "Reading a jobs report without overreacting to it",
    excerpt:
      "Headline numbers versus revisions, and why the market's first reaction isn't always the lasting one.",
    body: [
      "A monthly jobs report usually lands as one headline number, but that number is rarely the whole story. Prior-month revisions often move markets just as much as the new figure itself.",
      "The first few minutes of reaction can also be misleading — algorithmic trading responds to the raw number before anyone has read the details underneath it.",
      "Waiting for the initial volatility to settle before drawing any conclusion is a habit worth building early.",
    ],
    publishedAt: "2026-09-03T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "fundamental",
  },
  {
    slug: "risk-on-risk-off-explained",
    category: "fundamental",
    tag: "Risk Sentiment",
    title: '"Risk-on" and "risk-off" — what the phrase really means',
    excerpt:
      "How broader sentiment moves currencies together, separate from any single country's news.",
    body: [
      "Currencies don't only move on their own country's news. Broad shifts in investor confidence — “risk-on” when confidence is high, “risk-off” when it drops — can move several currencies in the same direction at once.",
      "Recognizing this pattern helps explain days when unrelated currencies all seem to move together for no obvious individual reason.",
    ],
    publishedAt: "2026-09-01T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "fundamental",
  },
  {
    slug: "head-and-shoulders-without-forcing-it",
    category: "technical",
    tag: "Chart Patterns",
    title: "Spotting a head-and-shoulders pattern, without forcing it",
    excerpt:
      "Why this pattern is widely taught, and the common mistake of seeing it everywhere once you know the shape.",
    body: [
      "The head-and-shoulders pattern is one of the first reversal patterns most beginners learn to recognize — three peaks, the middle one highest, with a “neckline” connecting the troughs.",
      "The common mistake isn't misunderstanding the shape; it's starting to see it in almost every chart once you know what to look for. A pattern is only meaningful with the structure and volume around it to support it.",
    ],
    publishedAt: "2026-09-07T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "technical",
  },
  {
    slug: "why-old-support-does-not-always-hold",
    category: "technical",
    tag: "Support & Resistance",
    title: "Why old support doesn't always hold twice",
    excerpt:
      "A level that worked once isn't a guarantee — what actually changes its reliability over time.",
    body: [
      "A support level that held firmly last month can fail without warning the next time price approaches it. Support and resistance aren't fixed walls; they're zones shaped by the orders sitting near them at a given time.",
      "As those orders get filled or cancelled, a level's strength genuinely changes — which is why treating any single level as guaranteed is a common early mistake.",
    ],
    publishedAt: "2026-09-05T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "technical",
  },
  {
    slug: "higher-highs-higher-lows",
    category: "technical",
    tag: "Trend Structure",
    title: "Higher highs, higher lows — and when that stops being true",
    excerpt:
      "The plain-language definition of an uptrend, and the first sign that a trend may be weakening.",
    body: [
      "An uptrend, in its simplest form, is a sequence of higher highs and higher lows. As long as each pullback finds a floor above the previous one, the trend structure is intact.",
      "The first warning sign isn't a single red candle — it's a low that fails to clear the prior low, breaking the pattern that defined the trend in the first place.",
    ],
    publishedAt: "2026-09-02T09:00:00.000Z",
    reviewedAt: "2026-09-10T09:00:00.000Z",
    cluster: "technical",
  },
];
