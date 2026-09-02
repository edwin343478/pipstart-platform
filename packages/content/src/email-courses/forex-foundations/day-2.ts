import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay2: SixDayEmailLesson = {
  day: 2,
  jobType: "course_day_2",

  subject: "Day 2: Meet the Currency Seesaw",
  previewText:
    "Learn how to read a currency pair and understand pips and spreads without getting lost in decimals.",
  heading: "Currency Pairs, Pips & Spreads",

  intro:
    "A currency pair behaves a little like a seesaw. When one side becomes stronger compared with the other, the quoted price moves.",

  paragraphs: [
    "The first currency is the base currency. The second is the quote currency. EUR/USD at 1.0800 means one euro is being compared with 1.08 US dollars.",
    "A pip is a common unit used to describe a small price movement. The spread is the gap between the displayed buy and sell prices—similar to a shop buying a toy from you for $9 and selling it for $10.",
  ],

  illustrationPath: "/email/forex-foundations/day-2.png",

  example:
    "EUR/USD moves from 1.0800 to 1.0810. For many non-yen pairs, that is 10 pips. But '10 pips' alone does not tell you the money gained or lost; position size and costs matter too.",

  keyPoints: [
    "First currency = base; second currency = quote.",
    "A pip describes price movement.",
    "The spread is a trading cost built into buy and sell prices.",
    "Pips alone do not measure total risk.",
  ],

  activity:
    "Which is larger: 1.0800 → 1.0805 or 1.0800 → 1.0810? Answer: the second movement—10 pips in this simplified example.",
  teaser:
    "Tomorrow: market, limit, and stop orders become instructions for a very busy waiter.",

  riskNote:
    "Spreads can widen, and orders may execute at different prices when markets move quickly.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing: "Keep learning,\nSkillcima",
};
