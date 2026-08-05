import type { EducationalCourse } from "@repo/types";

export const forexFoundationsCourse = {
  slug: "forex-foundations",
  title: "Free Five-Day Forex Foundations Course",
  shortTitle: "Forex Foundations",
  durationDays: 5,
  tagline: "Understand Forex before you risk real money.",
  description:
    "A structured introduction to Forex terminology, market mechanics and risk awareness without signals, profit promises or broker recommendations.",

  audience: [
    "Complete beginners who want to understand how Forex works",
    "Learners who prefer structured and risk-conscious education",
    "People who want to recognize misleading trading claims",
  ],

  notFor: [
    "People looking for trading signals",
    "People expecting guaranteed profits",
    "People searching for broker recommendations",
    "People seeking a quick-rich scheme",
  ],

  lessons: [
    {
      day: 1,
      slug: "what-is-forex",
      title: "What Forex Really Is",
      summary:
        "Understand what the foreign-exchange market is, why currencies are exchanged and who participates in it.",
      objectives: [
        "Explain Forex in plain language",
        "Recognize the roles of banks, businesses and individual traders",
        "Understand that Forex trading involves financial risk",
      ],
      riskNote:
        "Learning how the market works does not remove the possibility of financial loss.",
    },
    {
      day: 2,
      slug: "currency-pairs-prices-and-pips",
      title: "Currency Pairs, Prices and Pips",
      summary:
        "Learn how currencies are quoted in pairs and how price movements are commonly measured.",
      objectives: [
        "Identify base and quote currencies",
        "Read a basic currency-pair price",
        "Understand the meaning of a pip and spread",
      ],
      riskNote:
        "Small market movements can create larger losses when leverage is involved.",
    },
    {
      day: 3,
      slug: "how-forex-trades-work",
      title: "How Forex Trades Work",
      summary:
        "Explore buying, selling, order types and the mechanics behind opening and closing positions.",
      objectives: [
        "Distinguish between buying and selling a currency pair",
        "Understand market, limit and stop orders",
        "Recognize how profit and loss are calculated",
      ],
      riskNote:
        "Orders may execute at different prices during fast or illiquid market conditions.",
    },
    {
      day: 4,
      slug: "risk-before-strategy",
      title: "Risk Before Strategy",
      summary:
        "Learn why position size, leverage and loss limits matter before selecting any trading strategy.",
      objectives: [
        "Understand the effect of leverage",
        "Recognize the purpose of position sizing",
        "Explain why personal risk limits are necessary",
      ],
      riskNote:
        "Leverage can magnify losses and may result in losing all funds allocated to trading.",
    },
    {
      day: 5,
      slug: "building-a-responsible-learning-plan",
      title: "Building a Responsible Learning Plan",
      summary:
        "Create a sensible next-step plan centred on education, practice and informed decision-making.",
      objectives: [
        "Separate learning goals from profit expectations",
        "Use practice environments carefully",
        "Identify warning signs in unrealistic trading claims",
      ],
      riskNote:
        "Completing an introductory course does not mean someone is ready to trade with real money.",
    },
  ],
} as const satisfies EducationalCourse;
