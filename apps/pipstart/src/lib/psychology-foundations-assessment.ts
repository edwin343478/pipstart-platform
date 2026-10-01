import type { AssessmentDefinition } from "./assessment";

export const psychologyFoundationsQuizV1: AssessmentDefinition = {
  id: "psychology-foundations-quiz",
  version: 1,
  title: "Psychology Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "psychology",
  moduleId: "psychology-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Emotions around a decision",
      "PipStart: How thinking can go wrong",
      "PipStart: A repeatable practice habit",
    ],
  },
  questions: [
    {
      id: "psychology-facts-feelings",
      prompt:
        "Which items belong in separate parts of a decision record? Select all that apply.",
      explanation:
        "Facts, feelings/urges and actual actions are distinct. Keep later outcomes separately; an intention to cancel is not proof that cancellation succeeded.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "The quote and rule available at the cutoff",
        },
        {
          id: "b",
          label: "The feeling and urge noticed then",
        },
        {
          id: "c",
          label: "A later gain used to rewrite the original rule",
        },
        {
          id: "d",
          label: "The action and platform confirmation, if any",
        },
      ],
      correctChoiceIds: ["a", "b", "d"],
    },
    {
      id: "psychology-missed-entry",
      prompt:
        "An AUD/USD demo rule permits entry only at ask strictly below 0.6600 within its window. Ask is now 0.6640. What is process-correct?",
      explanation:
        "0.6640 is not below 0.6600. Later movement cannot rewrite permission at the decision time; a new candidate needs its own qualifying conditions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Buy because the last candle rose",
        },
        {
          id: "b",
          label:
            "Record missed, no entry, along with the quote/time and feeling",
        },
        {
          id: "c",
          label: "Change the old ceiling after seeing the rally",
        },
        {
          id: "d",
          label: "Enter because missing the move creates an obligation",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "psychology-late-distance",
      prompt:
        "A paper AUD/USD long uses stop exit 0.6575. Compare original ask 0.6595 and late ask 0.6640 at 0.01 lot in a USD account with a 100,000-unit contract. What are the price losses before charges?",
      explanation:
        "The distances are 20 and 65 conventional pips, at about US$0.10 per pip. The late scenario changes risk and remains ineligible under the original below-0.6600 rule. Actual loss can differ.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Both US$2",
        },
        {
          id: "b",
          label: "US$6.50 originally and US$2 late",
        },
        {
          id: "c",
          label: "US$2 originally and US$6.50 late",
        },
        {
          id: "d",
          label: "Both guaranteed maximum losses",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "psychology-revenge-size",
      prompt:
        "Four hypothetical full-risk losses use US$10, US$20, US$40 and US$80. What follows?",
      explanation:
        "The sum is 150. Escalation changes cash exposure; earlier losses alone do not establish the next probability or permission to ignore risk limits.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "US$150 lost before other costs; the sequence does not make a win due",
        },
        {
          id: "b",
          label: "US$80 lost and the next result must win",
        },
        {
          id: "c",
          label: "US$40 lost and doubling guarantees recovery",
        },
        {
          id: "d",
          label: "US$150 lost, so a larger next size is authorised",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "psychology-overtrading",
      prompt: "Which is the best definition of overtrading for this lesson?",
      explanation:
        "Judge actions against explicit conditions and gates. One unsupported entry can be excessive; structured observations need not include orders.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Any day with more than one observation",
        },
        {
          id: "b",
          label: "Any profitable session",
        },
        {
          id: "c",
          label: "The same fixed number of trades for every learner",
        },
        {
          id: "d",
          label:
            "Actions exceeding what the method, policy or practical schedule supports",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "psychology-pause-exposure",
      prompt:
        "Pausing new demo submissions automatically cancels every pending order and removes all existing exposure.",
      explanation:
        "Pending orders and positions remain subject to the product-specific procedure. Verify actual confirmations and the current state; a pause is not automatic cancellation.",
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
      id: "psychology-confirmation",
      prompt:
        "A learner keeps rising EUR/USD examples but excludes comparable failures without a predeclared rule. What needs correction?",
      explanation:
        "Selective evidence can support confirmation bias. A fair record keeps relevant contrary cases, exclusion reasons and rule versions, rather than merely adding agreement.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The missing cases should remain hidden",
        },
        {
          id: "b",
          label:
            "Preserve all eligible cases and apply the same selection rule",
        },
        {
          id: "c",
          label: "Replace the old rule after every loss",
        },
        {
          id: "d",
          label: "Find a commentator who agrees",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "psychology-recency",
      prompt:
        "Three recent demo wins establish that a method has a reliable edge and justify increasing size.",
      explanation:
        "A short run does not establish reliability or authorise a size change. Keep the wider relevant record, costs, sizes, conditions and gates; recent genuinely changed inputs can be reviewed separately.",
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
      id: "psychology-loss-cost",
      prompt:
        "A learner says, “I spent hours finding this position, so I must keep it even though the written exit condition occurred.” Which review is useful?",
      explanation:
        "Past effort is not permission to ignore the rule or exposure. Check evidence rather than diagnosing the person; actual exit and order terms still matter.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Past study time cannot make the present condition true; check the rule, current exposure and decision record",
        },
        {
          id: "b",
          label: "The time spent guarantees recovery",
        },
        {
          id: "c",
          label: "Unrealised losses cannot matter",
        },
        {
          id: "d",
          label: "Every long holding period proves a psychological diagnosis",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "psychology-independent-model",
      prompt:
        "An explicitly fair, independent coin shows four tails. Which statement fits the classroom model and its limit?",
      explanation:
        "Independence keeps the coin model’s next probability unchanged. Forex outcomes need not be independent, and a streak alone does not establish their probabilities.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A head is certain next, just like a currency win",
        },
        {
          id: "b",
          label: "Every Forex trade therefore has 50% win probability",
        },
        {
          id: "c",
          label:
            "The next head probability remains 50%; that does not establish real Forex probabilities",
        },
        {
          id: "d",
          label: "The next head probability is 100% after enough tails",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "psychology-full-sample",
      prompt:
        "Twenty invented equal-size completed demo cases have eight US$8 gains, twelve US$6 losses and a separate US$0.50 charge for every case. What is the net total?",
      explanation:
        "Gains 64 minus losses 72 give −8 price result. Charges are 20 × 0.50 = 10, so net is −18. Selected winning screenshots hide the losses and costs.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "+US$64",
        },
        {
          id: "b",
          label: "−US$8 after all charges",
        },
        {
          id: "c",
          label: "+US$18",
        },
        {
          id: "d",
          label: "−US$18",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "psychology-fair-review",
      prompt:
        "Which review practices help distinguish decision process from later outcome? Select all that apply.",
      explanation:
        "Available-data evidence, complete records and versioned changes make review fairer. A later gain cannot change whether the earlier action followed the rule.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label:
            "Keep the plan and cutoff evidence before revealing the outcome",
        },
        {
          id: "b",
          label: "Call every profitable breach compliant",
        },
        {
          id: "c",
          label: "Show all relevant cases, costs and uncertainty",
        },
        {
          id: "d",
          label:
            "Keep revisions and new rule versions separate from the original record",
        },
      ],
      correctChoiceIds: ["a", "c", "d"],
    },
    {
      id: "psychology-twenty-minutes",
      prompt: "Which matches the approved twenty-minute teaching routine?",
      explanation:
        "5 + 10 + 5 = 20. No setup, tired-day skips and unclear inputs can be recorded; the schedule can be adapted to ordinary responsibilities.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "5 minutes preparation, 10 one observation, 5 recording; no order required",
        },
        {
          id: "b",
          label: "20 minutes finding a trade that must win",
        },
        {
          id: "c",
          label: "5 minutes preparation, 20 trading, 5 recording",
        },
        {
          id: "d",
          label: "Only completed trades count as sessions",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "psychology-worksheet-size",
      prompt:
        "An invented EUR/USD sizing worksheet uses US$1,000, 1% planned price risk, 20 pips, USD account and conversion 1. Under the stated tool contract, which comparison is correct?",
      explanation:
        "The tool returns 0.05 lot and US$10 planned price risk. Doubling size doubles that price-risk amount; the teaching percentage is not a recommendation or maximum-loss guarantee.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.10 lot gives US$10 at that distance",
        },
        {
          id: "b",
          label:
            "0.05 lot gives US$10; doubling to 0.10 gives US$20 before other costs/fill differences",
        },
        {
          id: "c",
          label: "A calculator authorises any emotionally preferred size",
        },
        {
          id: "d",
          label: "1% is a universal safe live-trading limit",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "psychology-account-gate",
      prompt:
        "A teaching policy blocks new demo risk when recorded losses plus the next scenario exceed US$20. Losses are US$19 and the next scenario is US$2 before further costs. The chart condition qualifies. What follows?",
      explanation:
        "19 + 2 = 21, above the stated gate. Chart, account and execution checks are separate. Include costs and existing/pending exposure under the actual policy definition.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Proceed because chart permission overrides the account gate",
        },
        {
          id: "b",
          label: "Ignore the previous losses",
        },
        {
          id: "c",
          label:
            "Record the qualifying chart and blocked action: the sum is US$21",
        },
        {
          id: "d",
          label: "Increase leverage to make the gate disappear",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "psychology-review-denominator",
      prompt:
        "Six sessions have four followed, one breached and one unclear process classification. What is a fair report?",
      explanation:
        "Four followed out of five assessable is 80%. Keep the sixth unclear record visible. This restricted process rate is not a win rate or evidence of profitability.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "80% of all six sessions followed",
        },
        {
          id: "b",
          label: "Ignore the unclear case and never mention it",
        },
        {
          id: "c",
          label: "The method is profitable because four followed",
        },
        {
          id: "d",
          label:
            "4/5 = 80% among five assessable sessions, with all six shown and the unclear exclusion disclosed",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "psychology-valid-routine",
      prompt:
        "Which statements belong in a repeatable practice habit? Select all that apply.",
      explanation:
        "A routine includes honest skips and review. Neither identity nor exposure is determined by the study timer or one result; existing orders need their own handling.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "A permitted no-setup or tired-day skip can be a valid entry",
        },
        {
          id: "b",
          label: "A gain proves the learner’s worth",
        },
        {
          id: "c",
          label: "A flawed plan may need scheduled, versioned review",
        },
        {
          id: "d",
          label: "A session timer automatically closes positions",
        },
      ],
      correctChoiceIds: ["a", "c"],
    },
    {
      id: "psychology-quiz-readiness",
      prompt:
        "Passing this quiz certifies a profitable method and readiness for a live leveraged account.",
      explanation:
        "The quiz checks course answers. It cannot establish an edge, live execution competence or emotional readiness, and the course does not require a deposit or live trading.",
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
  ],
};
