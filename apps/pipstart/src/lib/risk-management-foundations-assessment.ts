import type { AssessmentDefinition } from "./assessment";

export const riskManagementFoundationsQuizV1: AssessmentDefinition = {
  id: "risk-management-foundations-quiz",
  version: 1,
  title: "Risk Management Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "risk-management",
  moduleId: "risk-management-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Decide the loss before the size",
      "PipStart: Margin, leverage and drawdown",
      "PipStart: Combined exposure and losing streaks",
    ],
  },
  questions: [
    {
      id: "risk-account-reference",
      prompt:
        "A simplified demo balance is US$1,000 and floating open loss is US$100, with no other adjustments. Under an equity-based 1% worksheet, what is the cash budget?",
      explanation:
        "Equity is US$900, so 1% is US$9. Using balance instead would use a different reference. The percentage is teaching arithmetic, not a recommended live limit.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$10",
        },
        {
          id: "b",
          label: "US$9",
        },
        {
          id: "c",
          label: "US$100",
        },
        {
          id: "d",
          label: "US$1,100",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "risk-rounded-size",
      prompt:
        "An invented US$10 price-risk budget and 40-pip EUR/USD distance imply 0.025 lot. If permitted steps are 0.01 lot, which size stays within that budget before costs?",
      explanation:
        "Round down to 0.02 lot. At US$10 per pip per standard lot, 40 × 10 × 0.02 = US$8; 0.03 lot would produce US$12.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.03 lot",
        },
        {
          id: "b",
          label: "0.05 lot",
        },
        {
          id: "c",
          label: "0.02 lot",
        },
        {
          id: "d",
          label: "Any size the platform accepts",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "risk-minimum-size",
      prompt:
        "Your demo cash budget is US$1, but the provider’s minimum size has a US$2 planned price loss before costs. What fits the stated budget?",
      explanation:
        "The minimum is already above the budget. Order acceptance does not mean affordability; do not change the budget or stop just to force a size.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "No permitted position; size is zero under this worksheet",
        },
        {
          id: "b",
          label: "Round up to the minimum",
        },
        {
          id: "c",
          label: "Remove the stop",
        },
        {
          id: "d",
          label: "Double the budget automatically",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "risk-conversion",
      prompt:
        "A teaching USD/JPY price loss is ¥200. At an invented conversion of ¥150 per US dollar, approximately what is the USD loss before charges?",
      explanation:
        "Divide yen by yen per US dollar: 200/150 ≈ US$1.33. Write units beside the conversion; multiplying would use the wrong direction.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$30,000",
        },
        {
          id: "b",
          label: "US$200",
        },
        {
          id: "c",
          label: "US$150",
        },
        {
          id: "d",
          label: "US$1.33",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "risk-net-reward",
      prompt:
        "A model has a gross US$20 win, gross US$10 loss and a US$1 cost on every trade. What is its break-even win rate in this two-outcome model?",
      explanation:
        "Net outcomes are +US$19 and −US$11, so break-even is 11/(19+11) ≈ 36.7%. This does not estimate a real strategy’s win probability.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "33.3%",
        },
        {
          id: "b",
          label: "About 36.7%",
        },
        {
          id: "c",
          label: "50%",
        },
        {
          id: "d",
          label: "75%",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "risk-planned-loss",
      prompt:
        "Which statements about a risk worksheet are correct? Select all that apply.",
      explanation:
        "Planned risk is conditional on inputs and fills. Costs, conversion and gaps can change results, and a proposed target-distance ratio is not a probability.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Ordinary stops guarantee the worksheet’s maximum loss",
        },
        {
          id: "b",
          label: "Margin is the same as the planned stop loss",
        },
        {
          id: "c",
          label: "Costs and worse exits can increase the actual loss",
        },
        {
          id: "d",
          label:
            "A 2:1 reward-to-risk ratio does not establish the chance of reaching the target",
        },
      ],
      correctChoiceIds: ["c", "d"],
    },
    {
      id: "risk-notional-margin",
      prompt:
        "A conventional EUR/USD position contains 10,000 euros at 1.1000 USD per euro. In a simple 20:1 margin model, what notional and required margin apply?",
      explanation:
        "10,000 × 1.1000 = US$11,000; divide by 20 to obtain US$550. Actual provider margin methods can differ.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$11,000 notional and US$550 margin",
        },
        {
          id: "b",
          label: "US$550 notional and US$11,000 margin",
        },
        {
          id: "c",
          label: "US$10,000 notional and US$20 margin",
        },
        {
          id: "d",
          label: "US$1,100 notional and US$55 margin",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "risk-same-position",
      prompt:
        "Keep 10,000 EUR of EUR/USD exposure fixed. Does changing only the margin allowance from 20:1 to 50:1 change the price loss from a 10-pip adverse move?",
      explanation:
        "The position and price distance are unchanged: 10,000 × 0.0010 = US$10. Using extra capacity to open a larger position would change exposure separately.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, the loss becomes 2.5 times larger",
        },
        {
          id: "b",
          label: "Yes, it becomes zero",
        },
        {
          id: "c",
          label: "No; the simplified price loss remains US$10 before costs",
        },
        {
          id: "d",
          label: "Only the margin can be lost",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "risk-effective-leverage",
      prompt:
        "An invented A$1,000-equity account holds A$2,000 of currency exposure with A$200 required margin. What is effective exposure relative to equity?",
      explanation:
        "Effective exposure/equity is 2,000/1,000 = 2:1. The 10:1 exposure/margin relationship answers a different question.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "10:1",
        },
        {
          id: "b",
          label: "2:1",
        },
        {
          id: "c",
          label: "20:1",
        },
        {
          id: "d",
          label: "0.2:1",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "risk-account-capacity",
      prompt:
        "A simplified USD account has US$900 equity and US$550 used margin. Which free margin and margin level are correct?",
      explanation:
        "Free margin = 900 − 550 = 350; margin level = 900/550 × 100 ≈ 163.64%. Neither figure is a guarantee that another trade is safe.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$550 and 100%",
        },
        {
          id: "b",
          label: "US$1,450 and 61.11%",
        },
        {
          id: "c",
          label: "US$900 and 200%",
        },
        {
          id: "d",
          label: "US$350 and about 163.64%",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "risk-forced-closure",
      prompt:
        "Which statement about margin warnings and forced close-out is accurate?",
      explanation:
        "Margin-call and stop-out conditions vary and may use percentages or amounts. A warning is not a guaranteed grace period or executable close price.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The exact trigger and closure rules come from the provider’s terms; a fast move can produce a worse fill",
        },
        {
          id: "b",
          label: "Every provider promises a telephone warning",
        },
        {
          id: "c",
          label: "An ordinary stop overrides all provider margin rules",
        },
        {
          id: "d",
          label: "Positive free margin guarantees no loss",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "risk-drawdown-recovery",
      prompt:
        "A teaching account peaks at US$1,200 and later reaches US$960. What are the drawdown and percentage gain needed to return to the peak?",
      explanation:
        "The loss is 240/1,200 = 20%; recovery is 240/960 = 25%. The denominators differ, and the calculation promises no recovery.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "25% drawdown and 20% recovery",
        },
        {
          id: "b",
          label: "20% drawdown and 20% recovery",
        },
        {
          id: "c",
          label: "20% drawdown and 25% recovery",
        },
        {
          id: "d",
          label: "10% drawdown and 25% recovery",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "risk-shared-currency",
      prompt:
        "A demo account is long EUR/USD and short USD/JPY. Which directional exposure is shared, and what is combined planned risk if each idea plans US$10 loss?",
      explanation:
        "Long EUR/USD is long EUR/short USD; short USD/JPY is short USD/long JPY. Both include short-USD direction, and the planned losses add to US$20 under the exit assumptions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Long USD; US$10",
        },
        {
          id: "b",
          label: "Short USD; US$20 before costs and worse fills",
        },
        {
          id: "c",
          label: "No common currency; US$0",
        },
        {
          id: "d",
          label: "Short EUR; US$10",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "risk-correlation-limits",
      prompt:
        "Which statements about sample correlation are correct? Select all that apply.",
      explanation:
        "A sample linear relationship is not a permanent law or proof of independence. A short position changes the P&L interpretation, and common shocks may cause simultaneous losses.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Near-zero Pearson correlation proves independence",
        },
        {
          id: "b",
          label: "A coefficient never changes after it is calculated",
        },
        {
          id: "c",
          label: "It describes a linear relationship over the stated sample",
        },
        {
          id: "d",
          label:
            "Position direction, data window and cash scenarios still need checking",
        },
      ],
      correctChoiceIds: ["c", "d"],
    },
    {
      id: "risk-daily-weekly-gates",
      prompt:
        "A demo policy’s weekly loss gate is reached. The next day begins with a fresh daily counter. What follows under a policy requiring both gates to pass?",
      explanation:
        "A new day does not override a weekly rule. The policy also needs predefined handling for existing positions, pending orders, timezone and restart review.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The weekly gate still blocks new activity until its defined review/reset conditions are met",
        },
        {
          id: "b",
          label: "The daily reset erases the weekly loss",
        },
        {
          id: "c",
          label: "Increase size to recover the week",
        },
        {
          id: "d",
          label: "Ignore pending orders",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "risk-fixed-fraction",
      prompt:
        "Starting with US$1,000, six ideal losses each equal 1% of remaining equity, with no costs or overlapping trades. What remains?",
      explanation:
        "1,000 × 0.99^6 ≈ 941.48. This is conditional sequence arithmetic, not a probability of six losses and not evidence that a win is now due.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$400",
        },
        {
          id: "b",
          label: "US$1,060",
        },
        {
          id: "c",
          label: "US$940 exactly",
        },
        {
          id: "d",
          label: "About US$941.48",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "risk-doubling",
      prompt:
        "A US$1,000 teaching account loses US$10, US$20, US$40, US$80, US$160 and US$320 in a doubling sequence. Can its US$370 remaining cover the next proposed US$640 risk?",
      explanation:
        "The six losses total US$630. The next doubled amount is US$640, greater than the US$370 left. Finite equity, margin, volume rules and costs undermine the unlimited-recovery argument.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes, because the next win is due",
        },
        {
          id: "b",
          label: "Yes, because US$640 is only planned",
        },
        {
          id: "c",
          label: "No; the proposed risk exceeds what remains before costs",
        },
        {
          id: "d",
          label: "Yes, if the stop is removed",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "risk-ruin-model",
      prompt:
        "A win rate alone is enough to establish a strategy’s future risk-of-ruin probability.",
      explanation:
        "A ruin model also needs payoff sizes, sizing rules, costs, dependence, initial capital, a threshold and a time horizon. Historical estimates and execution uncertainty must be examined.",
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
