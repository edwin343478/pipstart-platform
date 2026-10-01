import type { AssessmentDefinition } from "./assessment";

export const priceActionFoundationsQuizV1: AssessmentDefinition = {
  id: "price-action-foundations-quiz",
  version: 1,
  title: "Price Action Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "price-action",
  moduleId: "price-action-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Describe structure without guessing",
      "PipStart: Build a testable observation",
      "PipStart: Stops, targets and a checklist",
    ],
  },
  questions: [
    {
      id: "price-action-structure",
      prompt:
        "Confirmed AUD/USD lows are 0.6500, 0.6550 and 0.6600, with highs 0.6650, 0.6700 and 0.6750. Which description fits these selected observations?",
      explanation:
        "The selected sequence has higher highs and higher lows. It describes observed structure on the stated timeframe, not a guaranteed future path or profitable entry.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed next rise",
        },
        {
          id: "b",
          label: "Higher selected highs and lows under the stated rule",
        },
        {
          id: "c",
          label: "Proof that every timeframe is rising",
        },
        {
          id: "d",
          label: "A risk-free entry",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "price-action-swing-availability",
      prompt:
        "A middle bar B can qualify as a swing high only after the next bar C completes under a one-bar-on-each-side rule. At B’s close, can a test use B as already confirmed?",
      explanation:
        "The swing timestamp and confirmation-availability timestamp differ. Using the finished historical marker at B’s close introduces future information.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, because later history shows it",
        },
        {
          id: "b",
          label: "Yes, if B is a green candle",
        },
        {
          id: "c",
          label: "Yes, if the trade later wins",
        },
        {
          id: "d",
          label: "No, the required later bar is not yet available",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "price-action-range",
      prompt:
        "An invented EUR/USD range spans 1.0980 to 1.1020. What does that width establish?",
      explanation:
        "The 0.0040 interval is 40 conventional pips. Entry rules, price sides, costs and later movement determine any executable outcome.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "A 40-pip historical price interval under the stated boundaries, not obtainable profit on every crossing",
        },
        {
          id: "b",
          label: "A 40-pip guaranteed gain",
        },
        {
          id: "c",
          label: "Which boundary will break first",
        },
        {
          id: "d",
          label: "That spreads do not matter",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "price-action-break-close",
      prompt:
        "A rule needs a completed GBP/USD hourly bid close strictly above 1.2800. Bid reaches 1.2805 during the hour but closes at 1.2790. What follows?",
      explanation:
        "An intrabar excursion is not the close required by this rule. A later result cannot change the earlier yes-or-no classification.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The close rule is met because price touched higher",
        },
        {
          id: "b",
          label: "The next bar must reverse",
        },
        {
          id: "c",
          label: "The required completed-close condition is absent",
        },
        {
          id: "d",
          label: "The stop is guaranteed",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "price-action-facts-interpretations",
      prompt:
        "Which entries properly separate facts and interpretations? Select all that apply.",
      explanation:
        "A dated comparison can be checked from available data. A continuation idea is conditional; neither it nor a zone establishes future certainty.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label:
            "Two dated selected lows are higher than their predecessors is an observation",
        },
        {
          id: "b",
          label: "Continuation is now certain because the lows rose",
        },
        {
          id: "c",
          label:
            "Possible continuation after a pause is an interpretation to test",
        },
        {
          id: "d",
          label: "A historical zone reveals every future order",
        },
      ],
      correctChoiceIds: ["a", "c"],
    },
    {
      id: "price-action-timeframe-description",
      prompt:
        "A daily selected uptrend and an hourly selected decline can both describe their respective windows at the same cutoff.",
      explanation:
        "Aggregation and swing rules differ across timeframes. Name the context and the detail; one hourly decline does not automatically reverse every daily definition.",
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
      id: "price-action-zone-trigger",
      prompt:
        "An active EUR/USD zone is 1.0980–1.1000. A prior completed bar touches it and the current completed bid close is exactly 1.1000. Does a strictly-above-upper-edge trigger qualify?",
      explanation:
        "The strict comparison is false at equality. A rule allowing equality is a different version; zone status and input availability must also be checked.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, equality always qualifies",
        },
        {
          id: "b",
          label: "No, equality is not strictly above",
        },
        {
          id: "c",
          label: "Yes, if a future candle rallies",
        },
        {
          id: "d",
          label: "Only after changing the old rule",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "price-action-zone-inference",
      prompt: "What does a candle-derived supply/demand rectangle identify?",
      explanation:
        "The rectangle records a chosen area from past prices. It is not a visible global inventory or a promise of another reaction.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Guaranteed future orders",
        },
        {
          id: "b",
          label: "All global Forex liquidity",
        },
        {
          id: "c",
          label: "A historical reference inferred under its specified method",
        },
        {
          id: "d",
          label: "A fixed exchange rate",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "price-action-higher-timeframe",
      prompt:
        "At midday, a daily/hourly observation may use the same day’s eventual final daily close as completed daily context.",
      explanation:
        "That eventual close did not exist at midday. Use the last completed daily inputs or a separately defined live input, with timestamps.",
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
      id: "price-action-same-bar-order",
      prompt:
        "A bar’s range visits both a simulated long’s 1.0980 stop and 1.1040 target. Can its upward final close prove target-first?",
      explanation:
        "OHLC does not contain every intrabar movement or ordering. Do not award a target-first result merely from the final candle direction.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, because the candle is green",
        },
        {
          id: "b",
          label: "Yes, because the target is farther away",
        },
        {
          id: "c",
          label: "Yes, if no costs are included",
        },
        {
          id: "d",
          label:
            "No; suitable sequence data or a predeclared ambiguous-case rule is needed",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "price-action-skipped-candidate",
      prompt:
        "A chart trigger qualifies, but spread exceeds the predeclared execution gate. What belongs in the study record?",
      explanation:
        "Observation eligibility and accepted execution use different counts. Retain the event and reason so awkward execution conditions are visible.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Both the eligible chart event and the skipped execution decision with its reason",
        },
        {
          id: "b",
          label: "Only profitable-looking candidates",
        },
        {
          id: "c",
          label: "A fill at the earlier bar close anyway",
        },
        {
          id: "d",
          label: "Nothing; delete the candidate",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "price-action-rule-version",
      prompt: "Which study practices are useful? Select all that apply.",
      explanation:
        "A reproducible study records cases consistently and retains original versions. Revised rules need reserved or later observations; selected successes cannot supply the missing denominator.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Change the old rule until every loss disappears",
        },
        {
          id: "b",
          label: "Keep original results and label rule revisions separately",
        },
        {
          id: "c",
          label: "Include eligible failures and missing-data handling",
        },
        {
          id: "d",
          label: "Choose only screenshots that later rallied",
        },
      ],
      correctChoiceIds: ["b", "c"],
    },
    {
      id: "price-action-quote-sides",
      prompt:
        "For a conventional EUR/USD short, which price sides apply to entry and exit?",
      explanation:
        "The short sells at bid and buys back at ask under the conventional quote example. Confirm product trigger rules and avoid measuring every distance from a bid-only chart.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Enter ask; exit bid",
        },
        {
          id: "b",
          label: "Enter bid; exit bid",
        },
        {
          id: "c",
          label: "Enter bid; exit ask",
        },
        {
          id: "d",
          label: "Enter ask; exit ask",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "price-action-long-ratio",
      prompt:
        "For a valid EUR/USD long at 1.1000, stop 1.0980 and target 1.1040, what is the price-only reward-to-risk ratio?",
      explanation:
        "The distances are 20 and 40 pips, so favourable/adverse distance is 2. Costs and fills can change cash outcomes, and the ratio does not estimate the chance of reaching the target.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "2:1, without establishing win probability or final fills",
        },
        {
          id: "b",
          label: "1:2 with a guaranteed win",
        },
        {
          id: "c",
          label: "4:1 after every cost",
        },
        {
          id: "d",
          label: "A 50% guarantee of profit",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "price-action-worse-stop",
      prompt:
        "A teaching EUR/USD long at 0.05 lot enters 1.1000 and exits at 1.0975 instead of the intended 1.0980. Assume 100,000 units per lot and a USD account. What is the price loss before charges?",
      explanation:
        "0.05 lot is 5,000 euros. The adverse distance is 0.0025 USD per euro, so price loss is US$12.50, or 25 pips at US$0.50 per pip.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$10",
        },
        {
          id: "b",
          label: "US$2.50",
        },
        {
          id: "c",
          label: "US$25",
        },
        {
          id: "d",
          label: "US$12.50",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "price-action-scenario-size",
      prompt:
        "An invented demo gate requires a 25-pip EUR/USD adverse fill plus US$7-per-standard-lot round-trip commission to stay below US$10. Which listed size fits under those exact assumptions?",
      explanation:
        "At 0.03 lot, 25 × US$0.30 = US$7.50 plus US$0.21 fee = US$7.71. This chosen scenario is not a guaranteed worst gap or maximum actual loss.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.05 lot at US$12.85",
        },
        {
          id: "b",
          label: "0.03 lot at US$7.71",
        },
        {
          id: "c",
          label: "0.04 lot at US$10.28",
        },
        {
          id: "d",
          label: "Every listed size because the platform permits it",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "price-action-stop-invalidation",
      prompt:
        "Which statements about a demo exit plan are correct? Select all that apply.",
      explanation:
        "Chart logic and order logic must be specified separately. Ordinary stops can fill worse; stop-limits can fail to fill, and costs/slippage can remain after a stop is moved to entry.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label:
            "A chart-close invalidation and an intrabar protective stop can have different timing",
        },
        {
          id: "b",
          label: "An ordinary stop guarantees its trigger price",
        },
        {
          id: "c",
          label: "Moving a stop to displayed entry guarantees zero cash loss",
        },
        {
          id: "d",
          label:
            "A stop-limit can remain unfilled when its price condition is unavailable",
        },
      ],
      correctChoiceIds: ["a", "d"],
    },
    {
      id: "price-action-no-trade",
      prompt:
        "A valid chart trigger appears, but the weekly demo loss gate is already reached. What is the completed decision under that policy?",
      explanation:
        "Both chart and account checks matter. A qualifying observation can coexist with a blocked execution decision; retain the reason and predefined handling for existing/pending exposure.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Ignore the gate because the chart looks strong",
        },
        {
          id: "b",
          label: "Open a larger position to recover",
        },
        {
          id: "c",
          label:
            "Record the chart candidate and no new demo action, with the reason",
        },
        {
          id: "d",
          label: "Erase the week’s earlier losses",
        },
      ],
      correctChoiceIds: ["c"],
    },
  ],
};
