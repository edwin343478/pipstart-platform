import type { AssessmentDefinition } from "./assessment";

export const brokerFoundationsQuizV1: AssessmentDefinition = {
  id: "broker-foundations-quiz",
  version: 1,
  title: "Broker Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "brokers-and-platforms",
  moduleId: "broker-foundations",
  passingPercentage: 70,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart curriculum team",
    reviewer: "Milestone 15 lesson alignment review",
    reviewedAt: "2026-09-30",
    nextReviewAt: "2027-03-30",
    sources: [
      "PipStart: Choosing a Forex provider",
      "PipStart: Platforms and demo practice",
      "PipStart: Order types and exits",
      "PipStart: Costs, withdrawals and safety",
    ],
  },
  questions: [
    {
      id: "provider-identity",
      prompt:
        "A provider uses a familiar brand name. What should you verify before considering funding?",
      explanation:
        "A brand or platform name does not establish the legal counterparty. Match the exact entity, relevant permissions, website and contact details using the official regulator’s register.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only its social-media follower count",
        },
        {
          id: "b",
          label:
            "The legal entity, permissions and contact details on the relevant official register",
        },
        {
          id: "c",
          label: "Only the logo on its website",
        },
        {
          id: "d",
          label: "Only whether it offers a popular platform",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "provider-clone",
      prompt:
        "A website lists a real authorised firm’s registration number, but its domain differs from the official register. What is the best next step?",
      explanation:
        "A clone can copy a genuine registration number. Use independently verified official contact details; neither a copied number nor reassurance from the suspect website proves its identity.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Deposit a small amount to test it",
        },
        {
          id: "b",
          label: "Ask the website’s salesperson to confirm it",
        },
        {
          id: "c",
          label: "Assume the number proves the website is genuine",
        },
        {
          id: "d",
          label:
            "Stop and verify through contact details independently obtained from the official register",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "execution-label",
      prompt: "What does an ECN or STP label alone establish?",
      explanation:
        "Marketing labels alone do not establish legal counterparty status, routing, conflicts or protections. Read the entity’s agreement and execution policy and verify its permissions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It guarantees every order fills at the requested price",
        },
        {
          id: "b",
          label: "It proves the provider cannot be your counterparty",
        },
        {
          id: "c",
          label:
            "It does not establish the complete legal and execution arrangement",
        },
        {
          id: "d",
          label: "It guarantees client funds are protected in every country",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "demo-limits",
      prompt:
        "You practise EUR/USD orders on a demo account for two weeks. What can you reasonably conclude?",
      explanation:
        "Demo practice helps you learn controls and procedures. It does not prove future results, real-money reactions, live liquidity or reliable withdrawals.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "You have rehearsed the controls, but live execution and emotions may differ",
        },
        {
          id: "b",
          label: "You are guaranteed the same fills with real money",
        },
        {
          id: "c",
          label: "The provider’s withdrawal process has been verified",
        },
        {
          id: "d",
          label: "A profitable demo proves future profitability",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "cancel-versus-close",
      prompt:
        "You cancel an unfilled pending GBP/USD entry order. What does that action do?",
      explanation:
        "An unfilled pending order is an instruction awaiting execution. Confirmed cancellation removes that instruction; closing an already open position is a separate action.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It closes every open GBP/USD position",
        },
        {
          id: "b",
          label: "It realises the profit on an unrelated open position",
        },
        {
          id: "c",
          label: "It withdraws unused cash automatically",
        },
        {
          id: "d",
          label:
            "It removes that pending instruction once cancellation is confirmed",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "uncertain-status",
      prompt:
        "Your connection drops just after you submit an order. What should you do before submitting it again?",
      explanation:
        "A missing screen confirmation does not establish whether the server accepted or filled the order. Check the account state first so that a repeated submission does not create unintended exposure.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Keep clicking until a confirmation appears",
        },
        {
          id: "b",
          label: "Reconnect and check orders, positions and execution history",
        },
        {
          id: "c",
          label: "Assume the order was rejected because the screen froze",
        },
        {
          id: "d",
          label: "Open the opposite trade immediately",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "buy-limit",
      prompt:
        "EUR/USD is quoted above 1.0800. You want to buy only at 1.0800 or a better price. Which instruction best expresses that price constraint?",
      explanation:
        "A buy limit specifies a maximum buying price. It may fill at that price or lower, subject to available liquidity and platform rules, but a fill is not guaranteed.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A buy market order",
        },
        {
          id: "b",
          label: "A buy stop above the market",
        },
        {
          id: "c",
          label: "A buy limit at 1.0800",
        },
        {
          id: "d",
          label: "A sell market order",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "stop-slippage",
      prompt:
        "A regular stop-loss is triggered during a fast price gap. Which outcome is possible?",
      explanation:
        "A regular stop trigger does not guarantee its execution price. Gaps and limited liquidity can produce slippage and a loss larger than the amount planned from the stop distance.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The execution price is worse than the stop level",
        },
        {
          id: "b",
          label: "It always fills exactly at the stop level",
        },
        {
          id: "c",
          label: "It always prevents any loss",
        },
        {
          id: "d",
          label: "It cancels all financing charges",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "stop-limit",
      prompt: "What is the main trade-off of a stop-limit exit?",
      explanation:
        "After the stop condition is met, a limit instruction applies. If the market moves beyond the acceptable price without enough liquidity, the position may remain open.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It guarantees both a fill and the exact stop price",
        },
        {
          id: "b",
          label: "It removes the need to monitor the position",
        },
        {
          id: "c",
          label: "It converts every loss into a gain",
        },
        {
          id: "d",
          label:
            "Its limit constrains the fill price, but the exit may remain unfilled",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "spread-double-count",
      prompt:
        "A USD account has $8 gross profit calculated from actual entry and exit fills. Separate commission is $1 and financing is a $3 charge. What is net profit, with no other charges?",
      explanation:
        "Actual entry and exit fills already reflect the prices traded, including the spread effect. Subtract only the separately stated charges: $8 − $1 − $3 = $4. Subtracting the spread again would count it twice.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "$2, after subtracting another $2 spread",
        },
        {
          id: "b",
          label: "$4",
        },
        {
          id: "c",
          label: "$8",
        },
        {
          id: "d",
          label: "$12",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "commission-sides",
      prompt:
        "Commission is $3 per side for your trade size. You open and later fully close one trade. What total commission applies, with no other charges?",
      explanation:
        "Per side means the charge applies to entry and exit: $3 + $3 = $6 for this round trip. Always check whether a quoted commission is per side or already a round-trip amount.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "$3",
        },
        {
          id: "b",
          label: "$9",
        },
        {
          id: "c",
          label: "$6",
        },
        {
          id: "d",
          label: "$0",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "withdrawal-safety",
      prompt:
        "An unexpected message asks for an additional crypto payment to “unlock” your Forex withdrawal. What should you do first?",
      explanation:
        "An unexpected payment demand is a warning sign, not proof of a legitimate withdrawal fee. Pause, verify through established official channels, preserve evidence and seek relevant reporting or payment-provider help if needed.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Pause payment, verify independently and preserve the messages",
        },
        {
          id: "b",
          label: "Pay immediately because the account shows a profit",
        },
        {
          id: "c",
          label: "Share your password to speed up the withdrawal",
        },
        {
          id: "d",
          label: "Borrow money to meet the deadline",
        },
      ],
      correctChoiceIds: ["a"],
    },
  ],
};
