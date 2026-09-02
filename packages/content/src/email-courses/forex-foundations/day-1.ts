import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay1: SixDayEmailLesson = {
  day: 1,
  jobType: "course_day_1",

  subject: "Day 1: Forex Is Simply Money Changing Hands",
  previewText:
    "Meet the world's currency-exchange market without charts, signals, or confusing language.",
  heading: "What Forex Really Is",

  intro:
    "Imagine travelling to another country with money that shops there cannot accept. Your money is still valuable—it is simply wearing the wrong uniform.",

  paragraphs: [
    "When you exchange it for the currency used there, you are doing the basic thing behind Forex. Forex means foreign exchange: a worldwide market where one currency is exchanged for another.",
    "Banks, businesses, governments, travellers, and traders all use this market. A company may need another country's currency to pay a supplier. A traveller may need local money to buy lunch. A trader may try to benefit from price changes—but those changes are never guaranteed.",
  ],

  illustrationPath: "/email/forex-foundations/day-1.png",

  example:
    "If one euro can buy 1.08 US dollars, EUR/USD may be shown near 1.0800. That number describes the relationship between the two currencies now; it does not predict tomorrow.",

  keyPoints: [
    "Forex means exchanging one currency for another.",
    "Currencies are quoted in pairs because one is always compared with another.",
    "Forex exists for real-world needs—not only for trading.",
    "Forex is not a machine that produces guaranteed money.",
  ],

  activity:
    "Look at EUR/USD, GBP/USD, and USD/JPY. In each pair, point to the currency written first. That is the base currency; tomorrow we will learn what that role means.",

  teaser:
    "Tomorrow: we put currency pairs on a seesaw and meet pips and spreads.",

  riskNote:
    "Understanding Forex does not make future movements predictable. Trading can still cause financial loss.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing: "Keep learning,\nSkillcima",
};
