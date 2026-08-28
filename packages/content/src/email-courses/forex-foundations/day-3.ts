import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay3: SixDayEmailLesson = {
  day: 3,
  jobType: "course_day_3",

  subject: "Day 3: Orders & Trading Platforms",
  previewText:
    "Understand the basic order types and what a trading platform is designed to do.",
  heading: "Orders & Trading Platforms",

  intro:
    "Knowing how an order works is essential before thinking about entering or exiting a market.",

  paragraphs: [
    "A market order is an instruction to buy or sell at the best available current price. The final execution price may differ slightly when markets are moving quickly.",
    "A limit order is generally used to request execution at a specified price or better, while a stop order becomes active after a chosen price level is reached.",
    "A trading platform is the software used to view prices, charts, account information, and order controls. At this stage, focus on learning how these tools work rather than choosing a particular provider.",
  ],

  keyPoints: [
    "Different order types serve different purposes.",
    "Execution price is not always guaranteed.",
    "Platforms are tools; understanding risk comes first.",
  ],

  riskNote:
    "Incorrect order settings or misunderstanding execution can increase losses. Practice with educational or demonstration tools before risking real funds.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing:
    "Tomorrow we will cover leverage — one of the most important risk concepts for every new trader to understand.",
};
