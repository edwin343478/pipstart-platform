import type { AssessmentDefinition } from "./assessment";

export const chartFoundationsQuizV1: AssessmentDefinition = {
  id: "chart-foundations-quiz",
  version: 1,
  title: "Chart Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "charts",
  moduleId: "chart-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 approved lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Read a chart before interpreting it",
      "PipStart: Trends and price landmarks",
      "PipStart: Swings, breakouts and false signals",
      "PipStart: Volume and chart limits",
    ],
  },
  questions: [
    {
      id: "chart-four-prices",
      prompt:
        "What do a candle’s open, high, low and close tell you about its interval?",
      explanation:
        "OHLC summarises four prices. It cannot reconstruct every movement inside the interval or establish what happens next.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The exact order of every transaction",
        },
        {
          id: "b",
          label: "Four recorded prices, without the complete intrabar path",
        },
        {
          id: "c",
          label: "The number of profitable traders",
        },
        {
          id: "d",
          label: "Tomorrow’s closing price",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "chart-aggregation",
      prompt:
        "Four invented hourly EUR/USD bars begin at 1.1000, reach a highest high of 1.1060 and lowest low of 1.0980, and finish at 1.1040. What is their combined four-hour OHLC?",
      explanation:
        "The aggregate uses the first open, maximum high, minimum low and final close. It is not an average of the component candles.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.1000 / 1.1060 / 1.0980 / 1.1040",
        },
        {
          id: "b",
          label: "The average of the four opens for every field",
        },
        {
          id: "c",
          label: "1.1040 / 1.1060 / 1.0980 / 1.1000",
        },
        {
          id: "d",
          label: "Only the fourth hourly candle",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "chart-current-candle",
      prompt:
        "An unfinished candle’s high, low and close can still change before its interval ends.",
      explanation:
        "The live bar is still collecting data. A rule requiring a completed close must wait for the stated interval to finish.",
      type: "true-false",
      choices: [
        {
          id: "true",
          label: "True",
        },
        {
          id: "false",
          label: "False",
        },
      ],
      correctChoiceIds: ["true"],
    },
    {
      id: "chart-trend-definition",
      prompt:
        "Under a stated swing-selection rule, which sequence is consistent with an uptrend?",
      explanation:
        "Higher selected swing highs and lows can describe an uptrend under the chosen rule. One candle or activity bar does not establish that sequence.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Lower highs and lower lows",
        },
        {
          id: "b",
          label: "Any green candle, regardless of surrounding swings",
        },
        {
          id: "c",
          label: "Higher highs and higher lows",
        },
        {
          id: "d",
          label: "A high tick-volume reading alone",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "chart-reference-zone",
      prompt:
        "A German learner marks a EUR/USD support area. What does that area establish?",
      explanation:
        "Support is a selected historical reference, often an area rather than one exact tick. It can fail and does not guarantee a trade or a fill.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed floor that cannot break",
        },
        {
          id: "b",
          label: "A guaranteed buy order fill",
        },
        {
          id: "c",
          label: "A promise that every participant sees the same line",
        },
        {
          id: "d",
          label:
            "A selected price reference whose future behaviour remains uncertain",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "chart-timeframe-context",
      prompt:
        "Two learners disagree about the trend because one uses hourly GBP/USD swings and the other uses daily swings. What should they compare first?",
      explanation:
        "Different aggregation and selection rules can produce different structures. Align the inputs before deciding whether the observations actually conflict.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Their timeframe, data source and swing-selection rules",
        },
        {
          id: "b",
          label: "Only which learner drew more lines",
        },
        {
          id: "c",
          label: "Only their account balances",
        },
        {
          id: "d",
          label: "Which drawing looks more attractive",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "chart-breakout-close",
      prompt:
        "A written breakout rule requires a completed hourly close above 1.2800 in GBP/USD. Price briefly reaches 1.2805 but the hour closes at 1.2790. Has this close-based condition been met?",
      explanation:
        "The brief excursion is an intrabar breach, not the completed close required by that particular rule. Changing the rule afterwards introduces hindsight.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, any touch counts",
        },
        {
          id: "b",
          label: "No, the required completed close is absent",
        },
        {
          id: "c",
          label: "Yes, because the wick is long",
        },
        {
          id: "d",
          label: "Only if a later chart looks bullish",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "chart-false-breakout",
      prompt:
        "Why must a false-breakout test define its boundary and failure window before seeing the later chart?",
      explanation:
        "A fixed boundary, confirmation condition and failure window make the classification repeatable. They do not guarantee the price will reverse.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "So every trade becomes profitable",
        },
        {
          id: "b",
          label: "So spread can be ignored",
        },
        {
          id: "c",
          label:
            "So the result can be classified consistently without choosing the rule after the outcome",
        },
        {
          id: "d",
          label: "So a wick guarantees reversal",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "chart-hindsight",
      prompt:
        "A learner draws a swing boundary only after revealing the next week’s price movement. What is the main testing problem?",
      explanation:
        "This introduces look-ahead or hindsight into the rule. Record the boundary using only information available at the claimed decision time.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The chart has too many colours",
        },
        {
          id: "b",
          label: "The timeframe is necessarily wrong",
        },
        {
          id: "c",
          label: "Every later observation must be discarded",
        },
        {
          id: "d",
          label:
            "The supposed earlier decision uses information unavailable at the time",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "chart-volume-scope",
      prompt:
        "Which statements about chart activity measures are correct? Select all that apply.",
      explanation:
        "Feed tick counts and exchange contract volume describe different measures and populations. Neither can be silently relabelled as all global spot Forex activity.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Tick volume may count quote updates visible to one feed",
        },
        {
          id: "b",
          label: "One retail spot feed counts every global Forex transaction",
        },
        {
          id: "c",
          label:
            "Listed currency-futures volume describes a specified exchange/product scope",
        },
        {
          id: "d",
          label: "Tick counts and traded contracts are interchangeable units",
        },
      ],
      correctChoiceIds: ["a", "c"],
    },
    {
      id: "chart-volume-comparison",
      prompt:
        "A retail AUD/USD chart shows 1,000 ticks and a futures chart shows 50,000 contracts. What must you check before interpreting the numbers?",
      explanation:
        "The counts use different units and scopes. Identify the instrument, venue, time interval and definition before drawing any comparison.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only which number is larger",
        },
        {
          id: "b",
          label:
            "Unit, source, instrument or contract, interval and population",
        },
        {
          id: "c",
          label: "Only the colour of the bars",
        },
        {
          id: "d",
          label: "Whether both are plotted below a candle",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "chart-complete-record",
      prompt: "Which is the most useful chart observation record?",
      explanation:
        "A complete record makes the observation reproducible and separates chart information from executable price and trading costs.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Pair, feed, timeframe, timezone, completed-bar status, selection rule and execution limits",
        },
        {
          id: "b",
          label: "Only a screenshot with a buy arrow",
        },
        {
          id: "c",
          label: "Only the most successful historical examples",
        },
        {
          id: "d",
          label: "Only the indicator colour",
        },
      ],
      correctChoiceIds: ["a"],
    },
  ],
};
