// Small client-safe teaching summaries. Publication/title/URL parity is tested
// against the server-only lesson registry; never import the full registry here.
export type CalculatorLearningContent = {
  question: string;
  formulas: readonly string[];
  terms: readonly { term: string; meaning: string }[];
  example: { setup: string; steps: readonly string[]; result: string };
  interpretation: string;
  limitations: string;
  lesson: {
    learningPath: "forex" | "crypto";
    slug: string;
    href: string;
    title: string;
    description: string;
  };
};

export const calculatorLearning = {
  "risk-reward-calculator": {
    question:
      "How much price distance could you gain for each unit of planned price risk?",
    formulas: [
      "Risk distance = absolute difference between entry and stop.",
      "Reward distance = absolute difference between target and entry.",
      "Reward-to-risk multiple = reward distance ÷ risk distance.",
      "Gross break-even win rate (%) = 100 ÷ (1 + reward-to-risk multiple).",
    ],
    terms: [
      {
        term: "Entry, stop and target",
        meaning:
          "The planned starting price, loss-side exit and gain-side exit. For a long trade, stop < entry < target; for a short trade, target < entry < stop.",
      },
      {
        term: "1 : 2",
        meaning:
          "One unit of planned risk for two units of potential reward. This is a distance comparison, not a chance of winning.",
      },
    ],
    example: {
      setup:
        "Paper example: choose Long / Buy, entry 100, stop 90 and target 120. These are imaginary prices, not market quotes.",
      steps: [
        "Risk distance: 100 − 90 = 10.",
        "Reward distance: 120 − 100 = 20.",
        "Multiple: 20 ÷ 10 = 2, so the ratio is 1 : 2.",
        "Gross break-even rate: 100 ÷ (1 + 2) = 33.33%.",
      ],
      result:
        "Example result: 1 : 2, with 10 units of risk distance and 20 units of reward distance.",
    },
    interpretation:
      "Think of comparing a possible 10-unit loss with a possible 20-unit gain. The break-even percentage assumes every loss is the full planned loss and every win is the full planned reward; it does not estimate your actual win rate.",
    limitations:
      "Spread, fees, financing, slippage and partial exits change real break-even results. A stop is not a guaranteed fill, and a larger ratio does not make a trade more likely to succeed.",
    lesson: {
      learningPath: "forex",
      slug: "stops-targets-and-a-checklist",
      href: "/learn/forex/level-6/stops-targets-and-a-checklist",
      title: "Stops, targets and a checklist",
      description:
        "Connect the ratio to a planned exit and a cost-aware practice checklist.",
    },
  },
  "position-size-calculator": {
    question:
      "What is the largest permitted lot step within your planned loss budget?",
    formulas: [
      "Loss budget = account balance × risk percentage ÷ 100.",
      "Risk per lot = stop distance in pips × pip size × contract size × conversion rate.",
      "Unrounded lots = loss budget ÷ risk per lot.",
      "Final lots = round unrounded lots DOWN to a whole volume step; units = final lots × contract size.",
    ],
    terms: [
      {
        term: "Pip size and contract size",
        meaning:
          "The instrument's price movement per pip and base units per lot. This tool uses EUR/USD pip size 0.0001 and 100,000 units per lot.",
      },
      {
        term: "Conversion rate",
        meaning:
          "Account-currency units for one quote-currency unit. USD to USD is 1; this is not the pair's entry price.",
      },
      {
        term: "Volume step and minimum",
        meaning:
          "The allowed lot increments and smallest order. The tool does not round a below-minimum size up.",
      },
    ],
    example: {
      setup:
        "Choose EUR/USD and USD. Enter balance 1,000, risk 1%, stop 20 pips and conversion 1. The educational lot step is 0.01.",
      steps: [
        "Loss budget: USD 1,000 × 1% = USD 10.",
        "Risk per lot: 20 × 0.0001 × 100,000 × 1 = USD 200.",
        "Lots: 10 ÷ 200 = 0.05; it already fits a 0.01 step.",
        "Units: 0.05 × 100,000 = 5,000. Modeled stop-distance risk: 0.05 × 200 = USD 10.",
      ],
      result:
        "Example result: 5,000 units / 0.0500 lots, with USD 10.00 modeled risk.",
    },
    interpretation:
      "A loss budget is like a separate envelope: the price distance determines how much can fit inside it. A wider stop means fewer units for the same budget. Rounding down can leave some of that budget unused.",
    limitations:
      "The percentage is an input, not a recommended risk level. Confirm your broker's contract, pip convention, minimum and step, especially for metals and nonstandard pairs. Costs and worse fills can exceed modeled stop-distance risk.",
    lesson: {
      learningPath: "forex",
      slug: "decide-the-loss-before-the-size",
      href: "/learn/forex/level-5",
      title: "Decide the loss before the size",
      description:
        "Follow the loss budget, units and rounding before choosing a position.",
    },
  },
  "pip-value-calculator": {
    question:
      "How much account-currency value does one pip represent at this lot size?",
    formulas: [
      "Position units = lots × contract size.",
      "Value per pip = position units × pip size × conversion rate.",
    ],
    terms: [
      {
        term: "Pip",
        meaning:
          "The instrument's defined price increment, not necessarily the smallest displayed digit. The educational EUR/USD pip is 0.0001; JPY conventions differ.",
      },
      {
        term: "Lots and conversion",
        meaning:
          "Lots specify trade size. Conversion means account-currency units for one quote-currency unit; USD to USD is 1.",
      },
    ],
    example: {
      setup:
        "Choose EUR/USD, USD account currency, 0.10 lots and conversion 1.",
      steps: [
        "Position units: 0.10 × 100,000 = 10,000.",
        "Quote-currency pip value: 10,000 × 0.0001 = USD 1.",
        "Convert to the account: USD 1 × 1 = USD 1.",
      ],
      result: "Example result: USD 1.00 per pip for 10,000 units.",
    },
    interpretation:
      "If each pip is worth USD 1, a 10-pip move changes gross value by USD 10 at this size. Direction decides whether the move helps or hurts; this tool reports the size of one pip, not a profit prediction.",
    limitations:
      "Broker symbol specifications and conversion rates can differ or change. Verify the displayed instrument convention; do not apply the EUR/USD example blindly to JPY pairs, gold or silver. Fees and execution costs are excluded.",
    lesson: {
      learningPath: "forex",
      slug: "pips-and-lots",
      href: "/learn/forex/level-1/pips-and-lots",
      title: "Pips and lots",
      description:
        "Review pip conventions, lot sizes, currency conversion and gross results.",
    },
  },
  "profit-loss-calculator": {
    question:
      "What is the gross result of a move from your entry price to your exit price?",
    formulas: [
      "Signed movement = exit − entry for a long trade, or entry − exit for a short trade.",
      "Position units = lots × contract size.",
      "Gross profit or loss = signed movement × position units × conversion rate.",
      "Pip movement = signed movement ÷ pip size.",
    ],
    terms: [
      {
        term: "Gross",
        meaning:
          "Before fees, spread, financing and other trading costs. A positive number is a gross gain; a negative number is a gross loss.",
      },
      {
        term: "Conversion rate",
        meaning:
          "Account-currency units per quote-currency unit. Use 1 when the quote and account currencies match.",
      },
    ],
    example: {
      setup:
        "Choose Long / Buy, EUR/USD, USD, 0.10 lots, entry 1.1000, exit 1.1050 and conversion 1.",
      steps: [
        "Signed movement: 1.1050 − 1.1000 = 0.0050.",
        "Units: 0.10 × 100,000 = 10,000.",
        "Gross result: 0.0050 × 10,000 × 1 = USD 50.",
        "Pip movement: 0.0050 ÷ 0.0001 = 50 pips. The same prices in Short / Sell give USD −50.",
      ],
      result:
        "Example result: USD 50.00 gross profit and +50 pips for the long trade.",
    },
    interpretation:
      "Like comparing a buying price and a selling price, direction matters. Equal entry and exit produce zero gross result, but costs can still make the net result a loss.",
    limitations:
      "This is not a net account statement. Use actual executed prices and avoid counting spread twice if those prices already reflect it. The tool does not add fees, funding or financing charges.",
    lesson: {
      learningPath: "forex",
      slug: "pips-and-lots",
      href: "/learn/forex/level-1/pips-and-lots",
      title: "Pips and lots",
      description:
        "Review pip conventions, lot sizes, currency conversion and gross results.",
    },
  },
  "margin-calculator": {
    question:
      "What margin does this simple leverage model require for the selected position?",
    formulas: [
      "Position units = lots × contract size.",
      "Account-currency notional = position units × market price × conversion rate.",
      "Required margin = account-currency notional ÷ leverage.",
      "Margin rate (%) = 100 ÷ leverage.",
    ],
    terms: [
      {
        term: "Notional",
        meaning:
          "The full modeled value of the position, not the amount deposited as margin.",
      },
      {
        term: "Leverage and margin",
        meaning:
          "For 50:1 leverage enter 50. Margin is the modeled amount set aside to support exposure, not the maximum possible loss.",
      },
      {
        term: "Conversion rate",
        meaning:
          "Account-currency units per quote-currency unit; use 1 for matching currencies.",
      },
    ],
    example: {
      setup:
        "Choose EUR/USD, USD, 0.10 lots, market price 1.1000, leverage 50 and conversion 1.",
      steps: [
        "Units: 0.10 × 100,000 = 10,000.",
        "Notional: 10,000 × 1.1000 × 1 = USD 11,000.",
        "Margin: 11,000 ÷ 50 = USD 220.",
        "Margin rate: 100 ÷ 50 = 2%.",
      ],
      result:
        "Example result: USD 220.00 required margin for USD 11,000.00 notional exposure.",
    },
    interpretation:
      "The margin is much smaller than the full exposure. Do not confuse that smaller amount with a loss limit: the market moves against the whole position.",
    limitations:
      "Actual brokers can use tiers, symbol-specific rules and different conversion methods. This tool does not model equity, free margin, liquidation or stop-out levels, and it is not a leverage recommendation.",
    lesson: {
      learningPath: "forex",
      slug: "margin-leverage-and-drawdown",
      href: "/learn/forex/level-5/margin-leverage-and-drawdown",
      title: "Margin, leverage and drawdown",
      description:
        "Compare exposure, required margin, account loss and recovery arithmetic.",
    },
  },
  "drawdown-calculator": {
    question:
      "How much growth would the remaining balance need to return to the starting balance?",
    formulas: [
      "Amount lost = starting balance × drawdown percentage ÷ 100, or the entered loss amount.",
      "Remaining balance = starting balance − amount lost.",
      "Drawdown (%) = amount lost ÷ starting balance × 100.",
      "Recovery gain (%) = amount lost ÷ remaining balance × 100.",
    ],
    terms: [
      {
        term: "Starting and remaining balance",
        meaning:
          "The chosen reference amount before the loss and the smaller amount left afterward. Use a consistent reference; deposits and withdrawals are not modeled.",
      },
      {
        term: "Different bases",
        meaning:
          "The loss percentage uses the starting balance, while the recovery percentage uses the remaining balance.",
      },
    ],
    example: {
      setup:
        "Choose USD, starting balance 1,000 and drawdown 20 with the percentage unit selected.",
      steps: [
        "Amount lost: 1,000 × 20% = USD 200.",
        "Remaining balance: 1,000 − 200 = USD 800.",
        "Recovery gain: 200 ÷ 800 × 100 = 25%.",
        "Check: 800 × 1.25 = 1,000.",
      ],
      result:
        "Example result: USD 800.00 remains; recovering USD 200.00 needs a 25.00% gain.",
    },
    interpretation:
      "If a 1,000-unit savings pot loses 200, you need to add back 200 to a smaller 800-unit pot. This is why a 20% loss needs more than a 20% recovery gain. Zero loss needs zero recovery.",
    limitations:
      "A 100% loss leaves zero: percentage growth alone cannot rebuild it, so the tool rejects total loss. Recovery arithmetic says nothing about whether or when a recovery will happen.",
    lesson: {
      learningPath: "forex",
      slug: "margin-leverage-and-drawdown",
      href: "/learn/forex/level-5/margin-leverage-and-drawdown",
      title: "Margin, leverage and drawdown",
      description:
        "Compare exposure, required margin, account loss and recovery arithmetic.",
    },
  },
  "gain-recovery-calculator": {
    question:
      "How many whole periods of a chosen constant gain would reach your target?",
    formulas: [
      "Balance after n periods = current balance × (1 + gain percentage ÷ 100) to the power n.",
      "Choose the smallest whole number n for which that balance reaches or exceeds the target.",
    ],
    terms: [
      {
        term: "Period",
        meaning:
          "One repeated interval you choose, such as a month. The entered percentage is per period, not automatically an annual rate.",
      },
      {
        term: "Whole periods",
        meaning:
          "The tool does not stop partway through an interval. The final illustrated balance can therefore be above the target.",
      },
    ],
    example: {
      setup:
        "Choose USD, current balance 100, recovery target 144 and gain per period 20%. This rate is only for easy arithmetic.",
      steps: [
        "After one period: 100 × 1.20 = USD 120, below 144.",
        "After two periods: 120 × 1.20 = USD 144.",
        "Two is the first whole period count to reach the target.",
        "Total gain needed: (144 ÷ 100 − 1) × 100 = 44%.",
      ],
      result:
        "Example result: 2 periods and an illustrated balance of USD 144.00.",
    },
    interpretation:
      "Growth applies to the changing balance, like repeatedly increasing a savings pot by the same percentage. This is a mathematical count, not a schedule for recovering trading losses.",
    limitations:
      "The model assumes a positive, identical gain every period, with no losses, costs, deposits or withdrawals. Real trading cannot guarantee that sequence; the example is not a recommended or expected return.",
    lesson: {
      learningPath: "forex",
      slug: "margin-leverage-and-drawdown",
      href: "/learn/forex/level-5/margin-leverage-and-drawdown",
      title: "Margin, leverage and drawdown",
      description:
        "Compare exposure, required margin, account loss and recovery arithmetic.",
    },
  },
  "crypto-position-size-calculator": {
    question:
      "What quantity fits both the planned loss budget and the selected trading mode?",
    formulas: [
      "Loss budget = account balance × risk percentage ÷ 100.",
      "Risk per coin = absolute difference between entry and stop.",
      "Risk-sized quantity = loss budget ÷ risk per coin.",
      "For spot, cap quantity at balance ÷ entry; then round DOWN to the exchange quantity step.",
      "Modeled stop-loss risk = final quantity × risk per coin; position value = final quantity × entry.",
    ],
    terms: [
      {
        term: "Price currency",
        meaning:
          "Enter balance, entry and stop in the selected account currency. This tool does not convert a separate crypto quote currency.",
      },
      {
        term: "Minimum and step",
        meaning:
          "Exchange-defined smallest order and quantity increment. A rounded quantity below the minimum is not increased to force a trade.",
      },
      {
        term: "Spot versus leveraged",
        meaning:
          "Spot is cash-capped and long-only. Leveraged mode is risk-sized only; margin availability and liquidation must be checked separately.",
      },
    ],
    example: {
      setup:
        "Paper example: USD balance 1,000, risk 1%, Bitcoin, Spot / cash, Long / Buy, imaginary entry 100, stop 90, minimum 0.01 and step 0.01. These are not current Bitcoin prices.",
      steps: [
        "Loss budget: 1,000 × 1% = USD 10.",
        "Risk per coin: 100 − 90 = USD 10.",
        "Risk-sized quantity: 10 ÷ 10 = 1 BTC; cash maximum: 1,000 ÷ 100 = 10 BTC.",
        "Final quantity: 1 BTC fits the step. Modeled risk: 1 × 10 = USD 10; position value: 1 × 100 = USD 100.",
      ],
      result:
        "Example result: 1.000000 BTC, USD 10.00 modeled stop-loss risk and USD 100.00 position value.",
    },
    interpretation:
      "The risk limit is your budget, while modeled risk belongs to the final rounded quantity. If cash or the quantity step reduces the position, modeled risk can be below that budget.",
    limitations:
      "A stop does not guarantee the exit price. Fees, gaps, slippage, funding and liquidation can increase losses. Leveraged output does not prove affordability or exchange eligibility; the percentage is not a risk recommendation.",
    lesson: {
      learningPath: "crypto",
      slug: "choose-the-loss-budget-before-the-position-size",
      href: "/learn/crypto/level-8",
      title: "Choose the Loss Budget Before the Position Size",
      description:
        "Check the loss budget, exit distance, exchange steps and worse fills.",
    },
  },
  "dollar-cost-averaging-calculator": {
    question:
      "What would repeated equal purchases produce under this simplified price path?",
    formulas: [
      "Units at each purchase = investment per purchase ÷ illustrated purchase price.",
      "Total units = sum of the units bought; total invested = investment per purchase × purchase count.",
      "Average cost per unit = total invested ÷ total units.",
      "Ending value = total units × ending price; illustrated difference = ending value − total invested.",
    ],
    terms: [
      {
        term: "Illustrated prices",
        meaning:
          "Prices change evenly across the generated purchases from the starting price to the ending price. They are not fetched historical prices. A single purchase uses the starting price.",
      },
      {
        term: "Calendar rule",
        meaning:
          "Weekly means every 7 days; biweekly means every 14 days. Monthly uses the original day, or the month's last day if that day does not exist.",
      },
      {
        term: "Average cost",
        meaning:
          "A units-weighted cost, not a simple average of the two prices. Prices and contributions use the selected currency.",
      },
    ],
    example: {
      setup:
        "Choose USD, Bitcoin (BTC), investment 100, Monthly, first date 2026-01-01, end date 2026-02-01, starting price 10 and ending price 20. These are imaginary teaching prices, not Bitcoin market quotes.",
      steps: [
        "Two dates are included: January 1 and February 1.",
        "First purchase: 100 ÷ 10 = 10 BTC units. Second: 100 ÷ 20 = 5 units.",
        "Total: 15 units for USD 200. Average cost: 200 ÷ 15 = about USD 13.33 per unit, not USD 15.",
        "Ending value: 15 × 20 = USD 300; illustrated difference: 300 − 200 = USD 100.",
      ],
      result:
        "Example result: 2 purchases, 15 BTC units, USD 13.33 average cost and USD 300.00 ending value.",
    },
    interpretation:
      "Like buying the same money's worth of a household item each time, lower prices buy more units and higher prices buy fewer. That changes the average cost, but it does not guarantee a profit.",
    limitations:
      "The evenly changing scenario is not a backtest or price forecast. Actual prices vary between purchases; fees, spreads, slippage, order minimums and taxes are excluded. Falling prices can produce a loss.",
    lesson: {
      learningPath: "crypto",
      slug: "dca-rebalancing-exits-and-useful-records",
      href: "/learn/crypto/level-8/dca-rebalancing-exits-and-useful-records",
      title: "DCA, Rebalancing, Exits and Useful Records",
      description:
        "Put recurring purchases and growth illustrations in context with contributions, costs and useful records.",
    },
  },
  "compound-growth-illustration": {
    question:
      "How do repeated contributions and a constant growth rate change a starting pot?",
    formulas: [
      "Let r = growth percentage ÷ 100 and C = contribution per period.",
      "End-of-period contributions: next balance = current balance × (1 + r) + C.",
      "Start-of-period contributions: next balance = (current balance + C) × (1 + r).",
      "Total contributed = starting amount + C × periods; illustrated growth = ending balance − total contributed.",
    ],
    terms: [
      {
        term: "Per-period rate",
        meaning:
          "The rate belongs to each selected interval. A monthly rate is not an annual rate, and no calendar frequency or annual-rate conversion is applied here.",
      },
      {
        term: "Contribution timing",
        meaning:
          "Start contributions receive that period's modeled growth; end contributions do not. Enter a whole number of periods.",
      },
      {
        term: "Explicit zero",
        meaning:
          "Zero growth is valid: only contributions change the pot. This model accepts non-negative growth, not a sequence of fluctuating or negative returns.",
      },
    ],
    example: {
      setup:
        "Choose USD, starting amount 100, contribution 10, periods 2, growth 10% per period and End of each period. The high rate is only for easy arithmetic.",
      steps: [
        "Period 1: 100 × 1.10 + 10 = USD 120.",
        "Period 2: 120 × 1.10 + 10 = USD 142.",
        "Total contributed: 100 + 10 × 2 = USD 120; illustrated growth: 142 − 120 = USD 22.",
        "With Start of each period instead: (100 + 10) × 1.10 = 121, then (121 + 10) × 1.10 = USD 144.10.",
      ],
      result:
        "Example result: USD 142.00 ending balance, USD 120.00 contributed and USD 22.00 illustrated growth for end timing.",
    },
    interpretation:
      "Separate money you put in from modeled growth. A bigger final pot is not all investment gain, and contribution timing changes how long each addition receives growth.",
    limitations:
      "Constant growth is a mathematical assumption, not an expected return. Fees, inflation and taxes are excluded; real returns fluctuate and may be negative. Do not use this illustration as a promise of wealth.",
    lesson: {
      learningPath: "crypto",
      slug: "dca-rebalancing-exits-and-useful-records",
      href: "/learn/crypto/level-8/dca-rebalancing-exits-and-useful-records",
      title: "DCA, Rebalancing, Exits and Useful Records",
      description:
        "Put recurring purchases and growth illustrations in context with contributions, costs and useful records.",
    },
  },
} as const satisfies Record<string, CalculatorLearningContent>;

export type CalculatorLearningRoute = keyof typeof calculatorLearning;
