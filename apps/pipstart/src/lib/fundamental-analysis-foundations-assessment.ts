import type { AssessmentDefinition } from "./assessment";

export const fundamentalAnalysisFoundationsQuizV1: AssessmentDefinition = {
  id: "fundamental-analysis-foundations-quiz",
  version: 1,
  title: "Fundamental Analysis Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "fundamental-analysis",
  moduleId: "fundamental-analysis-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Economic news and currency demand",
      "PipStart: Policy and market relationships",
      "PipStart: Use an economic calendar safely",
    ],
  },
  questions: [
    {
      id: "fundamental-analysis-import-payment",
      prompt:
        "A Brazilian importer owes US$100. Invented USD/BRL rises from 5.00 to 5.20. What happens to the before-fee payment in reais?",
      explanation:
        "USD/BRL is reais per US dollar: 100 × 5.00 = 500 and 100 × 5.20 = 520. The increase is 20/500 = 4%; this payment arithmetic does not establish causation.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It falls from R$520 to R$500",
        },
        {
          id: "b",
          label: "It stays R$100",
        },
        {
          id: "c",
          label: "It rises from R$500 to R$520, a 4% increase",
        },
        {
          id: "d",
          label: "It proves which news caused the rate change",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "fundamental-analysis-pair-relative",
      prompt: "What does a currency pair require you to consider?",
      explanation:
        "A quoted exchange rate is relative. Different counterparts and quote conventions can produce different comparisons, and several influences can matter at once.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Both currencies and the quote convention, not only one country’s headline",
        },
        {
          id: "b",
          label: "Only the first country",
        },
        {
          id: "c",
          label: "A guaranteed direction from higher inflation",
        },
        {
          id: "d",
          label: "Only the colour of the last candle",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "fundamental-analysis-disinflation",
      prompt:
        "An invented price index rises from 100 to 104, then 106 over equal periods. Which description fits?",
      explanation:
        "104/100 − 1 = 4%; 106/104 − 1 ≈ 1.92%. Slower inflation is not the same as a falling price level. State the series and period.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The price level falls in the second period",
        },
        {
          id: "b",
          label:
            "Inflation slows from 4% to about 1.92%, while the price level still rises",
        },
        {
          id: "c",
          label: "The index guarantees the currency will rise",
        },
        {
          id: "d",
          label: "The second change is 6%",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "fundamental-analysis-payroll-revision",
      prompt:
        "Which items should an employment-release record keep? Select all that apply.",
      explanation:
        "Retain the information available before release, the initial actual and revisions separately. Other components and survey definitions matter; an edited forecast introduces hindsight.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "The saved forecast and its source/time",
        },
        {
          id: "b",
          label: "Only the first positive headline",
        },
        {
          id: "c",
          label: "The initial actual and separate prior revision",
        },
        {
          id: "d",
          label: "An edited forecast matching the actual",
        },
      ],
      correctChoiceIds: ["a", "c"],
    },
    {
      id: "fundamental-analysis-annualised",
      prompt:
        "A real GDP change of 1% quarter-on-quarter, if hypothetically repeated for four quarters, corresponds to approximately what annualised arithmetic?",
      explanation:
        "(1.01^4 − 1) × 100 ≈ 4.06%. Annualisation uses a convention of repetition; it does not turn one quarter into four observed quarters or a forecast.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1% for four already observed quarters",
        },
        {
          id: "b",
          label: "100%",
        },
        {
          id: "c",
          label: "A promise of next year’s output",
        },
        {
          id: "d",
          label: "4.06%, without predicting future quarters",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "fundamental-analysis-headline-signal",
      prompt:
        "An actual economic release above a saved forecast guarantees that the related currency will rise.",
      explanation:
        "The numeric comparison is not a guaranteed price response. Units, components, revisions, prior expectations, the counterpart currency and other flows can matter.",
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
      correctChoiceIds: ["false"],
    },
    {
      id: "fundamental-analysis-policy-authority",
      prompt: "Which distinction is correct?",
      explanation:
        "The authorities and tools differ, even though their effects may interact. Check the institution, instrument, mandate and timing.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Fiscal policy is every central-bank press conference",
        },
        {
          id: "b",
          label:
            "Monetary policy concerns central-bank instruments; fiscal policy concerns government spending, taxation and borrowing",
        },
        {
          id: "c",
          label: "Monetary and fiscal policy always have identical effects",
        },
        {
          id: "d",
          label:
            "A government budget and policy-rate decision are the same event",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "fundamental-analysis-basis-points",
      prompt: "A policy rate moves from 4.00% to 4.25%. What is the change?",
      explanation:
        "One basis point is 0.01 percentage point. The difference is 0.25 percentage point = 25 basis points; the new level is 4.25%.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "25 percentage points",
        },
        {
          id: "b",
          label: "4.25 basis points",
        },
        {
          id: "c",
          label: "0.25 percentage point, or 25 basis points",
        },
        {
          id: "d",
          label: "A new rate of 25%",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "fundamental-analysis-guidance",
      prompt:
        "Leaving today’s policy rate unchanged can still accompany communication that changes expectations about later policy.",
      explanation:
        "The current setting and the future-path interpretation are separate. A statement or explanation can change expectations without guaranteeing a currency response.",
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
      id: "fundamental-analysis-current-yield",
      prompt:
        "A simplified bond pays an annual coupon of 4 units and trades at 80. What is its current yield, and what does the calculation omit?",
      explanation:
        "4/80 = 5%. Current yield does not include the full timing and redemption calculation of yield to maturity or all investment risks.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "5%; it is coupon/price and is not a complete yield-to-maturity calculation",
        },
        {
          id: "b",
          label: "4%; price never affects the ratio",
        },
        {
          id: "c",
          label: "80%; redemption does not matter",
        },
        {
          id: "d",
          label: "A guaranteed total return of 5%",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "fundamental-analysis-foreign-return",
      prompt:
        "An initial home value of 100 earns 4% in a foreign asset, while that foreign currency’s home value falls 8%. What is the final value before fees and taxes?",
      explanation:
        "100 × 1.04 × 0.92 = 95.68, a 4.32% home-currency loss. A positive foreign return or rate differential cannot guarantee a positive total home return.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "104",
        },
        {
          id: "b",
          label: "108",
        },
        {
          id: "c",
          label: "96",
        },
        {
          id: "d",
          label: "95.68",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "fundamental-analysis-relationships",
      prompt:
        "Which statements are appropriately conditional? Select all that apply.",
      explanation:
        "Risk appetite and commodity channels can be useful hypotheses. They do not establish permanent correlations or automatic directions for every pair.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Oil rising always makes CAD rise",
        },
        {
          id: "b",
          label:
            "Risk-on/risk-off interpretations need dated evidence and alternatives",
        },
        {
          id: "c",
          label:
            "Commodity prices can affect export/import channels alongside other forces",
        },
        {
          id: "d",
          label: "A currency called defensive cannot lose value",
        },
      ],
      correctChoiceIds: ["b", "c"],
    },
    {
      id: "fundamental-analysis-calendar-fields",
      prompt:
        "Which information belongs in a calendar record? Select all that apply.",
      explanation:
        "Definitions, timing and available-data comparisons are necessary. A provider’s editorial impact label alone does not identify the release or assure safety.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Series, publisher, period and units",
        },
        {
          id: "b",
          label: "Date, timezone and date-specific offset",
        },
        {
          id: "c",
          label: "Only the impact colour",
        },
        {
          id: "d",
          label: "Saved forecast/prior, initial actual and separate revisions",
        },
      ],
      correctChoiceIds: ["a", "b", "d"],
    },
    {
      id: "fundamental-analysis-calendar-time",
      prompt:
        "In a fictional same-date exercise, an event is at 08:30 at UTC−4. What time is it at UTC+3?",
      explanation:
        "08:30 plus four hours is 12:30 UTC; plus three is 15:30. For a real event, verify the date-specific offsets and possible date rollover.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "11:30",
        },
        {
          id: "b",
          label: "08:30",
        },
        {
          id: "c",
          label: "15:30",
        },
        {
          id: "d",
          label: "16:30",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "fundamental-analysis-impact-rating",
      prompt:
        "A calendar provider’s low-impact label guarantees that an event cannot create an execution problem.",
      explanation:
        "Impact labels are provider classifications, not probabilities or safety guarantees. Unscheduled events, spread changes and product rules remain relevant.",
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
      correctChoiceIds: ["false"],
    },
    {
      id: "fundamental-analysis-midpoint-fill",
      prompt:
        "Invented EUR/USD quotes change from bid/ask 1.0999/1.1001 to 1.1001/1.1009. A long buys at the first ask and sells at the later bid. What is its price result before charges?",
      explanation:
        "Entry ask and exit bid are both 1.1001. The later spread is wider; a midpoint rise is not the executable long result. Quotes do not guarantee actual fills.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Zero, even though the midpoint rose 5 pips",
        },
        {
          id: "b",
          label: "A guaranteed 5-pip gain",
        },
        {
          id: "c",
          label: "An 8-pip gain",
        },
        {
          id: "d",
          label: "A guaranteed fill at the midpoint",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "fundamental-analysis-pending-exposure",
      prompt: "Before a scheduled release, which preparation is useful?",
      explanation:
        "Pending entries can activate and stops can fill differently. Check shared currencies, product rules, costs, margin and account gates; observation only or a skip can be a valid decision.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Ignore pending orders because they are not positions yet",
        },
        {
          id: "b",
          label: "Assume stops guarantee their exact prices",
        },
        {
          id: "c",
          label: "Increase size because the calendar is available",
        },
        {
          id: "d",
          label:
            "Review open and pending exposure, quote/trigger rules and the written pause policy",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "fundamental-analysis-hindsight-record",
      prompt: "What makes a before-and-after event record fair?",
      explanation:
        "Preserve the information available before publication and add later versions explicitly. Include quiet, contradictory and skipped cases rather than editing the past.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Replace the forecast with the final actual",
        },
        {
          id: "b",
          label:
            "Keep the original timed forecast and plan, then add initial actual, revisions and observations separately",
        },
        {
          id: "c",
          label: "Keep only dramatic winning examples",
        },
        {
          id: "d",
          label: "Use later revised data as if it were initially published",
        },
      ],
      correctChoiceIds: ["b"],
    },
  ],
};
