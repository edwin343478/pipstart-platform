import type { AssessmentDefinition } from "./assessment";

export const technicalToolFoundationsQuizV1: AssessmentDefinition = {
  id: "technical-tool-foundations-quiz",
  version: 1,
  title: "Technical Tool Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "technical-tools",
  moduleId: "technical-tool-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 approved lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Averages and momentum",
      "PipStart: Volatility tools",
      "PipStart: Levels, patterns and limits",
    ],
  },
  questions: [
    {
      id: "technical-rolling-average",
      prompt:
        "Five invented EUR/USD closes are 1.0800, 1.0900, 1.1000, 1.1100 and 1.1200. Drop 1.0800 and add a new close of 1.0900. What is the new five-period SMA?",
      explanation:
        "The new sum is 5.5100; divide by five to get 1.1020. The average can rise while the latest close falls because the new value is higher than the value removed.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.0900",
        },
        {
          id: "b",
          label: "1.1000",
        },
        {
          id: "c",
          label: "1.1020",
        },
        {
          id: "d",
          label: "1.1200",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "technical-ema-delay",
      prompt: "Which description of an EMA is accurate?",
      explanation:
        "An EMA changes the weights, not the availability of future information. Its lookback, smoothing and initialisation need to be documented.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "It weights recent observations more heavily under its smoothing rule, but still depends on observed prices",
        },
        {
          id: "b",
          label: "It knows the next close",
        },
        {
          id: "c",
          label: "It has no initialisation convention",
        },
        {
          id: "d",
          label: "It is always more profitable than an SMA",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "technical-rsi-extreme",
      prompt:
        "EUR/USD RSI reads 75 under the chosen settings. What can you conclude from that reading alone?",
      explanation:
        "RSI summarises recent gains relative to losses. An overbought label is not a guarantee of reversal, an economic valuation or a winning probability.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A reversal must occur next",
        },
        {
          id: "b",
          label: "The pair is economically overvalued",
        },
        {
          id: "c",
          label: "There is a 75% chance of profit",
        },
        {
          id: "d",
          label:
            "Recent measured upward momentum is relatively strong; an extreme can persist",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "technical-macd-components",
      prompt:
        "A teaching MACD value is +0.0020 and its signal is +0.0015. Under the MACD-minus-signal convention, what is the histogram value?",
      explanation:
        "Subtract signal from MACD: 0.0020 − 0.0015 = 0.0005. Check the platform’s display convention because some implementations plot different quantities as bars.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "−0.0035",
        },
        {
          id: "b",
          label: "+0.0005",
        },
        {
          id: "c",
          label: "+0.0035",
        },
        {
          id: "d",
          label: "75",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "technical-stochastic",
      prompt:
        "An unsmoothed AUD/USD stochastic window has low 0.6500, high 0.6600 and close 0.6575. What does %K = 75 mean?",
      explanation:
        "100 × (0.6575 − 0.6500)/(0.6600 − 0.6500) is 75. This is a range-position calculation, not a probability or account return.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed reversal",
        },
        {
          id: "b",
          label: "A 75% chance of a rise",
        },
        {
          id: "c",
          label: "The close sits 75% of the way through that selected range",
        },
        {
          id: "d",
          label: "The account gained 75%",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "technical-true-range",
      prompt:
        "USD/JPY’s previous close is 150.00, current high 151.20 and current low 150.80. What is true range?",
      explanation:
        "The three distances are 0.40, 1.20 and 0.80 yen. True range selects their maximum, capturing the gap from the previous close.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.40 yen",
        },
        {
          id: "b",
          label: "0.80 yen",
        },
        {
          id: "c",
          label: "0.20 yen",
        },
        {
          id: "d",
          label: "1.20 yen",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "technical-atr-units",
      prompt:
        "EUR/USD daily ATR is 0.0060. With a conventional pip of 0.0001, which description is accurate?",
      explanation:
        "0.0060/0.0001 is 60 pips. ATR is a price-distance measure; cash depends on size/conversion, and future direction or maximum is not guaranteed.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "It summarises about 60 pips of recent true-range movement, without predicting tomorrow’s direction or maximum",
        },
        {
          id: "b",
          label: "It guarantees a 60-pip rise tomorrow",
        },
        {
          id: "c",
          label: "It caps every possible loss at 60 pips",
        },
        {
          id: "d",
          label: "It equals US$60 for every position",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "technical-band-arithmetic",
      prompt:
        "Given EUR/USD mean 1.1000, standard deviation 0.0020 and band multiplier two, what are the upper and lower bands?",
      explanation:
        "Two standard deviations are 0.0040. Adding/subtracting from 1.1000 gives 1.1040 and 1.0960 under the stated inputs.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.1020 and 1.0980",
        },
        {
          id: "b",
          label: "1.1040 and 1.0960",
        },
        {
          id: "c",
          label: "1.1200 and 1.0800",
        },
        {
          id: "d",
          label: "1.1000 and 1.1000",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "technical-band-limits",
      prompt:
        "Which statements about Bollinger Bands are correct? Select all that apply.",
      explanation:
        "A band touch is a relative position, and a squeeze describes the selected sample’s dispersion. Neither guarantees reversal, direction or future statistical containment.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "An upper-band touch is automatically a sell signal",
        },
        {
          id: "b",
          label: "A trend can continue near an outer band",
        },
        {
          id: "c",
          label:
            "Two-standard-deviation bands guarantee 95% future containment",
        },
        {
          id: "d",
          label:
            "A squeeze does not establish the direction of a later breakout",
        },
      ],
      correctChoiceIds: ["b", "d"],
    },
    {
      id: "technical-rounded-size",
      prompt:
        "A US$10 demo cash-risk budget and 40-pip EUR/USD stop imply 0.025 standard lots before costs. If the provider permits only 0.01-lot steps, which allowed size stays below that ideal price-risk budget?",
      explanation:
        "Round down to 0.02 lots under that step rule: 40 pips × US$10 per pip per standard lot × 0.02 = US$8 before extra costs. Rounding up to 0.03 gives US$12.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.03 lots",
        },
        {
          id: "b",
          label: "0.05 lots",
        },
        {
          id: "c",
          label: "0.02 lots",
        },
        {
          id: "d",
          label: "0.025 lots is automatically permitted",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "technical-fibonacci",
      prompt:
        "An invented EUR/USD upswing runs from 1.0800 to 1.1200. What is the 38.2% retracement measured downward from the high?",
      explanation:
        "The move is 0.0400. Subtract 0.382 × 0.0400 from 1.1200 to obtain 1.10472. It is a calculated reference, not guaranteed support.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.10472",
        },
        {
          id: "b",
          label: "1.09528",
        },
        {
          id: "c",
          label: "1.13528",
        },
        {
          id: "d",
          label: "1.10000",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "technical-classic-pivot",
      prompt:
        "The previous completed period’s high, low and close are 1.1200, 1.0800 and 1.1000. What is the classic central pivot?",
      explanation:
        "The classic central pivot is (high + low + close)/3. The sum 3.3000 divided by three is 1.1000; different sessions or pivot families may give other references.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.1200",
        },
        {
          id: "b",
          label: "1.0800",
        },
        {
          id: "c",
          label: "1.1400",
        },
        {
          id: "d",
          label: "1.1000",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "technical-divergence",
      prompt:
        "GBP/USD makes a higher swing high while RSI at the corresponding selected swing is lower. What does this observation alone establish?",
      explanation:
        "This is a price/momentum disagreement under the selected swings and settings. Weakening measured momentum can coexist with a continued rise.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The next price must fall",
        },
        {
          id: "b",
          label:
            "The stated bearish-divergence relationship, without guaranteeing a reversal",
        },
        {
          id: "c",
          label: "A risk-free sell trade",
        },
        {
          id: "d",
          label: "A definite error in the price feed",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "technical-engulfing-body",
      prompt:
        "Under a body-based engulfing definition, a candle’s real body can engulf the prior real body without covering every prior wick.",
      explanation:
        "The definition compares open-to-close bodies. Wick-to-wick coverage is a separate condition and must not be silently added or assumed.",
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
      id: "technical-testable-pattern",
      prompt: "What should be recorded before testing a double-top idea?",
      explanation:
        "A repeatable test fixes its inputs and rules before the later outcome is known, includes failures and accounts for execution/cost assumptions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only the pattern name",
        },
        {
          id: "b",
          label: "Only the examples where price later fell",
        },
        {
          id: "c",
          label:
            "Timeframe, peak tolerance, confirmation and failure rules, available-at-the-time data and costs",
        },
        {
          id: "d",
          label: "Only a chosen target after the trade wins",
        },
      ],
      correctChoiceIds: ["c"],
    },
  ],
};
