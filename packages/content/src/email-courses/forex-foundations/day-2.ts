import type { FiveDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay2: FiveDayEmailLesson = {
  day: 2,
  jobType: "course_day_2",

  subject: "Day 2: Currency Pairs, Pips & Spreads",
  previewText:
    "Learn how Forex prices are quoted and what pips and spreads mean in practical terms.",
  heading: "Currency Pairs, Pips & Spreads",

  intro:
    "Today we will break down the basic language used to read Forex prices.",

  paragraphs: [
    "A currency pair compares the value of one currency with another. In EUR/USD, for example, EUR is the base currency and USD is the quote currency.",
    "A pip is a standard unit used to describe price movement in a currency pair. For many currency pairs, one pip represents 0.0001, while many yen-quoted pairs use 0.01. Pips help describe price changes, gains, losses, and risk.",
    "The spread is the difference between the buying price and selling price shown for a market. It is one of the costs that can affect a trade.",
  ],

  keyPoints: [
    "The first currency is the base currency.",
    "The second currency is the quote currency.",
    "Pips measure price movement.",
    "The spread is a trading cost that should not be ignored.",
  ],

  riskNote:
    "Small price movements can still produce meaningful losses when position size or leverage is too high.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing:
    "Tomorrow we will cover market orders, limit orders, stop orders, and the basic role of a trading platform.",
};
