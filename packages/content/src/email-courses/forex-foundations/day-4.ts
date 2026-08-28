import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay4: SixDayEmailLesson = {
  day: 4,
  jobType: "course_day_4",

  subject: "Day 4: Leverage & Risk",
  previewText:
    "See why leverage can magnify both gains and losses, and why risk management matters.",
  heading: "Leverage & Risk",

  intro:
    "Leverage is often one of the most misunderstood parts of Forex trading.",

  paragraphs: [
    "Leverage allows a trader to control a larger market position with a smaller amount of capital. That may sound attractive, but the same mechanism also magnifies losses.",
    "Risk management involves setting boundaries before a trade, including how much capital is exposed, rather than reacting only after the market moves against you.",
    "Position size, stop-loss decisions, available capital, volatility, and leverage all interact. None of them should be considered in isolation.",
  ],

  keyPoints: [
    "Leverage magnifies both gains and losses.",
    "More leverage does not make a trade better.",
    "Risk should be considered before entering a position.",
    "Protecting capital is more important than chasing a single opportunity.",
  ],

  riskNote:
    "Highly leveraged trading can result in rapid and substantial losses. Never risk money you cannot afford to lose.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing:
    "Tomorrow is the final lesson: how to continue learning safely without rushing into live trading.",
};
