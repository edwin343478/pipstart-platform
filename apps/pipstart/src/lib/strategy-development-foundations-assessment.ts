import type { AssessmentDefinition } from "./assessment";

export const strategyDevelopmentFoundationsQuizV1: AssessmentDefinition = {
  id: "strategy-development-foundations-quiz",
  version: 1,
  title: "Strategy Development Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "strategy-development",
  moduleId: "strategy-development-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-10-01",
    nextReviewAt: "2027-04-01",
    sources: [
      "PipStart: Write a strategy that can be checked",
      "PipStart: Test without looking ahead",
      "PipStart: Read the results honestly",
    ],
  },
  questions: [
    {
      id: "strategy-development-specification",
      prompt:
        "Which belong in a reproducible strategy specification? Select all that apply.",
      explanation:
        "A complete specification covers observable conditions, execution/account assumptions and exceptions. A favourable screenshot cannot supply the missing rules.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Product, data source/side, timeframe and decision cutoff",
        },
        {
          id: "b",
          label: "Entry, exit, size, costs and skip conditions",
        },
        {
          id: "c",
          label: "Only a screenshot that later won",
        },
        {
          id: "d",
          label: "Rule version, missing-data handling and account gates",
        },
      ],
      correctChoiceIds: ["a", "b", "d"],
    },
    {
      id: "strategy-development-prior-reference",
      prompt:
        "Prior-five-bar EUR/CAD bid highs are 1.4590, 1.4610, 1.4600, 1.4620 and 1.4615. Under a strictly-above completed-close rule, what is correct?",
      explanation:
        "The prior maximum is 1.4620. Strictly above excludes equality, and the current signal bar is excluded from the prior-five-bar window.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Reference 1.4615; equality always qualifies",
        },
        {
          id: "b",
          label:
            "Reference 1.4620; close 1.4630 qualifies, equality at 1.4620 does not",
        },
        {
          id: "c",
          label: "Include the future bar before computing the prior maximum",
        },
        {
          id: "d",
          label: "Use whichever reference produces the largest gain",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "strategy-development-quote-gates",
      prompt:
        "After a signal close of 1.4630, bid/ask is 1.4630/1.4632. Gates require spread no more than 3 pips and ask no more than 1.4633. What follows?",
      explanation:
        "The spread is 0.0002 = 2 conventional pips and ask is within the ceiling. A quote snapshot cannot guarantee execution or replace other checks.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed market-order fill at 1.4632",
        },
        {
          id: "b",
          label: "Every account gate automatically passes",
        },
        {
          id: "c",
          label:
            "These quote gates pass with a 2-pip spread; actual fill and other gates remain separate",
        },
        {
          id: "d",
          label: "The spread is 20 pips",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "strategy-development-risk-ratio",
      prompt:
        "A simulated EUR/CAD long enters 1.4632, with stop 1.4612 and target 1.4672. What is its price-distance reward-to-risk ratio?",
      explanation:
        "Distances are 20 and 40 conventional pips. The ratio is 2, while costs, fills and probabilities require separate evidence.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "2:1, without establishing win probability or final cash outcome",
        },
        {
          id: "b",
          label: "1:2 with a guaranteed loss limit",
        },
        {
          id: "c",
          label: "4:1 after all financing",
        },
        {
          id: "d",
          label: "A 50% probability of a win",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "strategy-development-adverse-fill",
      prompt:
        "A teaching EUR/CAD long of 0.05 lot exits from entry 1.4632 at 1.4607. Assume 100,000 units per lot, CAD account, conversion 1 and a separate C$0.50 fee. What is the net loss?",
      explanation:
        "The 25-pip distance is C$12.50 price loss at C$0.50 per pip. Add the separate C$0.50 fee once for C$13; this scenario is not a guaranteed worst case.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "C$10",
        },
        {
          id: "b",
          label: "C$10.50",
        },
        {
          id: "c",
          label: "C$12.50",
        },
        {
          id: "d",
          label: "C$13",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "strategy-development-filter-change",
      prompt:
        "A filter chosen after viewing July losses can be added silently while July is still reported as untouched evaluation for that changed version.",
      explanation:
        "Viewing July to choose the filter makes it development information for the revised version. Keep the old result, version the change and reserve genuinely unviewed or later observations.",
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
      id: "strategy-development-close-availability",
      prompt:
        "A backtest using a completed daily-close trigger may enter at that same day’s earlier morning quote.",
      explanation:
        "The completed-close condition did not exist at the morning quote. Use only inputs available at the stated decision time and a disclosed later fill model.",
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
      id: "strategy-development-chronology",
      prompt:
        "A student develops a USD/JPY rule on January–June, then changes it after opening July. Which report is fair?",
      explanation:
        "A reserved period stops being unviewed when it is used for selection or revision. Keep chronology and all versions visible; a later sample is not automatically statistically independent.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "July remains unseen forever",
        },
        {
          id: "b",
          label: "The changed rule proves a future edge",
        },
        {
          id: "c",
          label:
            "July influenced development; preserve original results and date a new version before a genuinely new check",
        },
        {
          id: "d",
          label: "Delete the original July result",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "strategy-development-intrabar",
      prompt:
        "A later bar reaches both a simulated long’s stop and target, with no finer sequence data. Its close is green. Which conclusion is justified?",
      explanation:
        "OHLC does not reveal the full movement sequence. A disclosed stop-first scenario is a convention, not proof of actual ordering or executable fills.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "OHLC alone cannot establish stop/target order; apply the predeclared ambiguity policy and retain the case",
        },
        {
          id: "b",
          label: "Target-first is certain",
        },
        {
          id: "c",
          label: "Stop-first is proven by the low alone",
        },
        {
          id: "d",
          label: "Delete the case because it is inconvenient",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "strategy-development-cost-ledger",
      prompt:
        "A 0.01-lot EUR/USD long in a USD account enters ask 1.1001 and exits bid 1.0981, with conversion 1 and a separate US$0.20 fee. What is net under the stated contract?",
      explanation:
        "Price loss is US$2 and the separate fee makes US$2.20. Ask/bid entry/exit already reflect those quote sides; counting the same spread again is inconsistent.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "−US$2 before and after the fee",
        },
        {
          id: "b",
          label: "−US$2.20; do not deduct the same quote-side spread again",
        },
        {
          id: "c",
          label: "+US$2.20",
        },
        {
          id: "d",
          label: "A guaranteed maximum loss",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "strategy-development-candidate-counts",
      prompt:
        "Twenty chart candidates include five spread skips and two missing-quote skips. Thirteen assumed entries have eleven resolved and two unresolved outcomes. Which reporting practices are correct? Select all that apply.",
      explanation:
        "Different populations need different denominators. Keep the two unresolved entries visible and explain any metric based only on eleven resolved cases.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "State all candidate/skip counts and reasons",
        },
        {
          id: "b",
          label: "Call the eleven resolved cases every opportunity",
        },
        {
          id: "c",
          label:
            "Label the entries simulated and disclose the unresolved-outcome policy",
        },
        {
          id: "d",
          label:
            "Treat missing results silently as zero-profit completed trades",
        },
      ],
      correctChoiceIds: ["a", "c"],
    },
    {
      id: "strategy-development-sample-size",
      prompt:
        "A sufficiently long dataset automatically repairs look-ahead bias and proves that a strategy will remain profitable.",
      explanation:
        "More data cannot repair future information, biased selection or incorrect costs. Dependence, changing conditions and quality matter; no universal count proves a future edge.",
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
      id: "strategy-development-nine-wins",
      prompt:
        "Ten invented completed net outcomes are nine £1 gains and one £12 loss after stated costs. Which set of measures is correct?",
      explanation:
        "Positive total is 9 and loss magnitude is 12. Net is −3, mean −3/10 = −0.30 and profit factor 9/12 = 0.75. Do not subtract the already-stated costs again.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "90% wins, +£9 net, +£0.90 mean, profit factor 9",
        },
        {
          id: "b",
          label: "90% wins, −£3 net, −£0.30 mean, profit factor 0.75",
        },
        {
          id: "c",
          label: "10% wins, −£12 net, −£1.20 mean, profit factor 12",
        },
        {
          id: "d",
          label: "90% wins guarantees a future gain",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "strategy-development-zero-denominator",
      prompt:
        "For completed net results +3, +3, −2, −2, 0, 0, what is correct?",
      explanation:
        "Total is 2 across six cases; positive total 6 divided by negative magnitude 4 gives 1.5. The two zeros keep win/loss fractions from being complementary.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Mean 0.5 because zeros disappear automatically",
        },
        {
          id: "b",
          label: "Loss fraction is always one minus win fraction",
        },
        {
          id: "c",
          label:
            "Mean 1/3 unit, profit factor 1.5; win and loss fractions are each 2/6",
        },
        {
          id: "d",
          label: "Profit factor is 3/2 regardless of case totals",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "strategy-development-peak-trough",
      prompt:
        "The ordered closed-result ledger starts at £100, rises to £109 and then falls to £97. What is the observed peak-to-trough percentage drawdown?",
      explanation:
        "Drawdown uses the running peak: 12/109 ≈ 11.01%. 12/97 ≈ 12.37% is recovery to the peak. A closed-result path may miss intratrade equity declines.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "About 11.01%, using £12/£109; it differs from the −3% start-to-end change",
        },
        {
          id: "b",
          label: "3% using only the original deposit",
        },
        {
          id: "c",
          label: "About 12.37%, using the trough denominator",
        },
        {
          id: "d",
          label: "A guarantee of the largest future loss",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "strategy-development-no-loss-factor",
      prompt:
        "A ledger with gains and no losses has a zero profit-factor denominator, so an infinite-looking display proves future losses are impossible.",
      explanation:
        "No finite ratio is observed when the loss denominator is zero. Disclose the convention and sample; an absent losing category does not guarantee future outcomes.",
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
      id: "strategy-development-honest-report",
      prompt:
        "Which belong in an honest strategy-review report? Select all that apply.",
      explanation:
        "A reader needs enough information to trace results to the ledger and research process. Selecting flattering subgroups or deleting inconvenient losses changes the evidence.",
      type: "multiple-answer",
      choices: [
        {
          id: "a",
          label: "Complete denominators, costs, sizes and unresolved cases",
        },
        {
          id: "b",
          label: "Only the most profitable subgroup found after many searches",
        },
        {
          id: "c",
          label: "Version/search history and development/evaluation boundaries",
        },
        {
          id: "d",
          label:
            "Observed valuation path, sensitivity and what remains uncertain",
        },
      ],
      correctChoiceIds: ["a", "c", "d"],
    },
    {
      id: "strategy-development-equity-path",
      prompt:
        "A curve sampled only after closed trades necessarily shows every intratrade equity decline and establishes live-trading readiness.",
      explanation:
        "Sampling can miss deeper open-position declines. The record and quiz describe learning evidence; they cannot certify execution, future profitability or readiness for live leverage.",
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
