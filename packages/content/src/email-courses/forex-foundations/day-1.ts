import type { FiveDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay1: FiveDayEmailLesson = {
  day: 1,
  jobType: "course_day_1",

  subject: "Day 1: What Forex Really Is",
  previewText:
    "Start with what the foreign exchange market is, why it exists, and what beginners should understand first.",
  heading: "What Forex Really Is",

  intro:
    "Welcome to Day 1 of Forex Foundations. Before charts, indicators, or trading strategies, it helps to understand what the Forex market actually is.",

  paragraphs: [
    "Forex means foreign exchange. It is the global market where one currency is exchanged for another. Businesses, banks, governments, travellers, investors, and traders all participate for different reasons.",
    "Currencies are quoted relative to one another, so Forex trading always involves a pair. When the value of one currency changes relative to another, the price of that pair moves.",
    "For a beginner, the goal is not to rush into trading. The goal is to understand how the market works, the language it uses, and the risks involved before making financial decisions.",
  ],

  keyPoints: [
    "Forex is the exchange of one currency for another.",
    "Currencies are traded and quoted in pairs.",
    "Learning the market structure comes before taking financial risk.",
  ],

  riskNote:
    "Forex trading involves significant risk. Education and practice do not remove the possibility of financial loss.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing:
    "Tomorrow we will look at currency pairs, pips, and spreads — three terms you will see constantly in Forex.",
};
