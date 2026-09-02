import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay3: SixDayEmailLesson = {
  day: 3,
  jobType: "course_day_3",

  subject: "Day 3: Three Instructions for a Very Busy Market",
  previewText:
    "Meet market, limit, and stop orders—and learn why the market does not always follow instructions perfectly.",
  heading: "Orders & Trading Platforms",

  intro:
    "Imagine a restaurant with a very busy waiter. 'Bring it now,' 'only at this price,' and 'act when this level is reached' are three different instructions.",

  paragraphs: [
    "A market order says, 'Do it now at the best available price.' A limit order says, 'Only at my chosen price or better.' A stop order says, 'Take action after this price is reached.'",
    "Your trading platform is the menu and order desk: it shows prices, charts, balances, and controls. It passes your instruction along, but it cannot promise the market will serve the exact price you imagined.",
  ],

  illustrationPath: "/email/forex-foundations/day-3.png",
  example:
    "A market order may fill quickly but at a slightly changed price. A limit order may never fill. A stop-loss expresses an exit plan, but a gap or fast market can produce a worse exit price.",

  keyPoints: [
    "Market order: act now at the best available price.",
    "Limit order: only at the chosen price or better.",
    "Stop order: activate after a selected level is reached.",
    "An order is an instruction—not a guarantee.",
  ],

  activity:
    "Match them: 'Do it now' = market. 'Only at my price or better' = limit. 'Act after this level' = stop.",
  teaser:
    "Tomorrow: leverage—the financial megaphone that makes every outcome louder.",

  riskNote:
    "Incorrect direction, size, or price can cause unintended losses. Practise in a demonstration environment before risking money.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing: "Keep learning,\nSkillcima",
};
