import type { SixDayEmailLesson } from "../../email-course";

export const forexFoundationsEmailDay4: SixDayEmailLesson = {
  day: 4,
  jobType: "course_day_4",

  subject: "Day 4: Leverage Is a Megaphone, Not a Superpower",
  previewText:
    "See how leverage magnifies exposure and why risk must be planned before entering a trade.",
  heading: "Leverage, Margin and Risk Size",

  intro:
    "A megaphone makes every sound louder. It does not check whether the sound is beautiful or terrible. Leverage works the same way.",

  paragraphs: [
    "Leverage lets someone control a position larger than the money set aside as margin. Margin supports the position; it is not the maximum possible loss. Position size decides how strongly a price movement affects the account.",
    "With 20:1 leverage, $1,000 of margin may support $20,000 of market exposure. A 1% adverse move on $20,000 is $200 before costs—20% of the $1,000 margin in this simplified example.",
  ],

  illustrationPath: "/email/forex-foundations/day-4.png",
  example:
    "Suppose a $1,000 practice account uses a $10 maximum-loss illustration and the planned exit is 20 pips away: $10 ÷ 20 pips = $0.50 per pip. This excludes spread, slippage, and other costs.",

  keyPoints: [
    "Leverage magnifies gains, losses, and mistakes.",
    "Margin is not the maximum possible loss.",
    "Position size controls how strongly movement affects the account.",
    "Plan acceptable loss before calculating position size.",
  ],

  activity:
    "If the same $10 loss illustration uses an exit 40 pips away, should pip value be larger or smaller? Answer: smaller, to keep the simplified loss limit the same.",
  teaser:
    "Tomorrow: build a safer learning path and spot promises that smell like burnt toast.",

  riskNote:
    "Leverage can cause rapid losses. Stops may execute at worse prices during gaps or fast markets, and protection rules vary.",

  cta: {
    label: "No action required",
    destination: "none",
    path: null,
  },

  closing: "Keep learning,\nSkillcima",
};
