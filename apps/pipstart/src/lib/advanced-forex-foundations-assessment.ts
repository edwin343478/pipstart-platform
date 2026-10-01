import type { AssessmentDefinition } from "./assessment";

export const advancedForexFoundationsQuizV1: AssessmentDefinition = {
  id: "advanced-forex-foundations-quiz",
  version: 1,
  title: "Advanced Forex Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "advanced-forex",
  moduleId: "advanced-forex-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Relationships that can change",
      "PipStart: Liquidity and market positioning",
      "PipStart: Review the whole portfolio",
    ],
  },
  questions: [
    {
      id: "advanced-forex-shared-dollar",
      prompt: "Which positions all sell USD exposure?",
      explanation:
        "Long EUR/USD and GBP/USD buy their base currencies against USD; short USD/JPY sells USD against JPY. Different sizes and other currency directions still matter.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Long EUR/USD, long GBP/USD and short USD/JPY",
        },
        {
          id: "b",
          label: "Long EUR/USD, short GBP/USD and long USD/JPY",
        },
        {
          id: "c",
          label: "Every pair containing USD regardless of direction",
        },
        {
          id: "d",
          label: "Only two positions with identical pair names",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "advanced-forex-matrix",
      prompt:
        "The invented monthly-return matrix shows +0.65 for EUR/USD versus GBP/USD. What does that number establish?",
      explanation:
        "A coefficient describes the defined sample and return method. It is not a probability, a cause, a position-size instruction or a guarantee of future diversification.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A 65% chance of simultaneous gains tomorrow",
        },
        {
          id: "b",
          label:
            "Positive linear association in the stated sample, without an exact cash-loss multiplier",
        },
        {
          id: "c",
          label: "A permanent law forcing both pairs to rise",
        },
        {
          id: "d",
          label: "The second position is exactly 65% as risky",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "advanced-forex-zero",
      prompt:
        "A zero Pearson correlation means no possible relationship of any kind exists between the two series.",
      explanation:
        "Zero describes no measured linear association under the stated setup. Nonlinear relationships may remain; with a constant series the coefficient is undefined rather than automatically zero.",
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
      id: "advanced-forex-inverse",
      prompt:
        "A quoted rate rises 10%. What is the simple return of its inverse over the same interval?",
      explanation:
        "Inverse simple return is −r/(1+r). Logarithmic returns change sign exactly on inversion; state the method before comparing coefficients.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Exactly −10% in every return method",
        },
        {
          id: "b",
          label: "Exactly +10%",
        },
        {
          id: "c",
          label: "About −9.09%, because −0.10/1.10 differs from −0.10",
        },
        {
          id: "d",
          label: "Undefined even though both prices are positive",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "advanced-forex-yield",
      prompt:
        "An unhedged foreign asset starts at ¥100,000 home value, earns 5% abroad, and its currency falls 10% versus yen. What is ending home value before separate costs or borrowing?",
      explanation:
        "100,000 × 1.05 × 0.90 = 94,500. Foreign yield did not prevent a home-currency loss; funding and charges need separate entries.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "¥105,000",
        },
        {
          id: "b",
          label: "¥95,000",
        },
        {
          id: "c",
          label: "¥110,000",
        },
        {
          id: "d",
          label: "¥94,500",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "advanced-forex-windows",
      prompt:
        "Which make a relationship comparison more reproducible? Select all that apply.",
      explanation:
        "Keep consistent definitions and both windows. A selected flattering coefficient or retrospective regime label is not a fair account of the evidence.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Matched endpoints, clock, source and return definition",
        },
        {
          id: "b",
          label: "Only the window with the strongest desired coefficient",
        },
        {
          id: "c",
          label:
            "Date ranges, row counts and missing-data policy for both windows",
        },
        {
          id: "d",
          label: "Actual position directions and explicit uncertainty",
        },
      ],
      correctChoiceIds: ["a", "c", "d"],
    },
    {
      id: "advanced-forex-weighted-fill",
      prompt:
        "An invented €5,000 purchase fills €1,000 at 1.1001, €2,000 at 1.1003 and €2,000 at 1.1006. What is the quantity-weighted average?",
      explanation:
        "Total USD cost is 5,501.90; divide by €5,000 to get 1.10038. This is an invented single-venue illustration, not guaranteed retail/global execution.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.10038, assuming those exact fills remain available",
        },
        {
          id: "b",
          label: "1.1001 for every order size",
        },
        {
          id: "c",
          label: "1.100333... from ignoring quantities",
        },
        {
          id: "d",
          label: "1.1006 because only the last fill counts",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "advanced-forex-otc-depth",
      prompt:
        "An OTC depth-of-market panel necessarily shows every resting order in the global Forex market.",
      explanation:
        "OTC information may be provider quotes, limited quantities or constructed levels. No single retail panel is a complete worldwide order book.",
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
      id: "advanced-forex-market-limit",
      prompt:
        "Which statements about orders and liquidity are correct? Select all that apply.",
      explanation:
        "Quote, depth, instruction and outcome are different facts. A market order can fill at changed prices, while a limit can remain partly or wholly unfilled.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label:
            "A market order guarantees the earlier displayed quote for any size",
        },
        {
          id: "b",
          label: "A limit adds a price constraint but can remain unfilled",
        },
        {
          id: "c",
          label:
            "Filled quantity and accepted status should be recorded separately from intended size",
        },
        {
          id: "d",
          label: "A narrow spread alone guarantees deep size availability",
        },
      ],
      correctChoiceIds: ["b", "c"],
    },
    {
      id: "advanced-forex-carry",
      prompt:
        "Borrow ¥100,000 at 1% for one period. A foreign asset earns 5% but its currency falls 10% versus yen. What is the simplified difference after repaying the liability, before other costs?",
      explanation:
        "Converted asset value is ¥94,500; borrowing liability is ¥101,000. Difference is −¥6,500. The positive nominal rate difference is not the total result.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "+¥4,000",
        },
        {
          id: "b",
          label: "−¥5,500",
        },
        {
          id: "c",
          label: "−¥6,500",
        },
        {
          id: "d",
          label: "Exactly zero because carry is risk-free",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "advanced-forex-release-lag",
      prompt:
        "A COT report generally reflects Tuesday positions and is published Friday. May a Tuesday backtest entry use those figures before publication?",
      explanation:
        "Holdings date and public availability are different. COT concerns specified futures/options coverage, not every current global spot position.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, because Tuesday is the position date",
        },
        {
          id: "b",
          label:
            "No; use the actual release/acquisition time and official holiday schedule",
        },
        {
          id: "c",
          label: "Yes, if the final chart looks convincing",
        },
        {
          id: "d",
          label: "Only if the position later won",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "advanced-forex-net",
      prompt:
        "Invented category longs move 100 to 120 and shorts 90 to 100. What is current net and its change?",
      explanation:
        "Net is longs minus shorts: 120−100=20 versus prior 100−90=10. Net change differs from gross-long change and does not reveal every participant’s motive.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Current +20; change +10 contracts, without predicting the next price",
        },
        {
          id: "b",
          label: "Current +120; change +20 people",
        },
        {
          id: "c",
          label: "Current −20; change −10 contracts",
        },
        {
          id: "d",
          label: "Current +10; every trader must buy next",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "advanced-forex-combined",
      prompt:
        "Planned CAD price losses are 8, 10 and 12; adverse price losses are 10, 13 and 17. Each case has a separate C$1 charge. What are the complete totals?",
      explanation:
        "Add the three separate charges once to each scenario: 30+3=33, 40+3=43. The gate governs the written teaching policy; it is not a guaranteed maximum loss.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "C$30 and C$40, including every stated charge",
        },
        {
          id: "b",
          label:
            "C$33 and C$43; the invented C$35 gate admits only the planned case",
        },
        {
          id: "c",
          label: "C$35 for both because the gate caps execution",
        },
        {
          id: "d",
          label: "C$43 and C$33 because correlation reverses losses",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "advanced-forex-execution",
      prompt:
        "A 0.05-lot EUR/USD long in a USD account enters 1.1003 and exits 1.1018. Assume 100,000 units/lot, conversion 1, US$0.50 separate commission and US$0.20 financing. What is net?",
      explanation:
        "Fifteen conventional pips at US$0.50 per pip gives US$7.50 price profit. Deduct separate 0.50 and 0.20 once to get 6.80.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$7.50 after all stated charges",
        },
        {
          id: "b",
          label: "US$7.00",
        },
        {
          id: "c",
          label: "US$6.80; do not deduct the same ask/bid-side spread again",
        },
        {
          id: "d",
          label: "US$15.00",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "advanced-forex-margin",
      prompt:
        "Margin collateral is the planned stop loss and necessarily caps all losses on a leveraged position.",
      explanation:
        "Margin is collateral under product rules. It differs from price-risk scenarios and possible losses; gaps, costs, valuation and liquidation terms matter.",
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
      id: "advanced-forex-journal",
      prompt:
        "Which belong in a complete learning review? Select all that apply.",
      explanation:
        "A review needs a traceable complete record. A profitable breach remains a breach, and a correctly followed losing case can demonstrate sound process.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Dated candidates, skips, breaches and unresolved items",
        },
        {
          id: "b",
          label: "Only profitable screenshots",
        },
        {
          id: "c",
          label:
            "Net ledger, valuation path, cost assumptions and process findings",
        },
        {
          id: "d",
          label: "Original rule versions and dated corrections",
        },
      ],
      correctChoiceIds: ["a", "c", "d"],
    },
    {
      id: "advanced-forex-graduation",
      prompt:
        "A satisfactory seven-part learning portfolio must be profitable, use live money and buy a funded-account challenge.",
      explanation:
        "The project assesses reproducible, complete and honest evidence. Observation/demo, negative findings and a reasoned no-action decision are valid; no live deposit or challenge is required.",
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
      id: "advanced-forex-challenge",
      prompt:
        "Which should be investigated in a hypothetical funded-account or bot offer? Select all that apply.",
      explanation:
        "Names, popularity and screenshots do not establish terms or reliability. Investigate evidence without paying or sharing credentials to complete the course exercise.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label:
            "Actual entity, relevant official oversight and account simulation/live status",
        },
        {
          id: "b",
          label:
            "Fee/refund terms, drawdown definitions and payout restrictions",
        },
        {
          id: "c",
          label: "Guaranteed returns accepted as proof",
        },
        {
          id: "d",
          label: "Independent evidence, complaints route and unverified claims",
        },
      ],
      correctChoiceIds: ["a", "b", "d"],
    },
  ],
};
