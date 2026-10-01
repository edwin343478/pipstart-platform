import type { LessonSection } from "../../lesson-content";

export const marginLeverageAndDrawdownSections: LessonSection[] = [
  {
    title: "Separate three numbers that look similar",
    shortTitle: "Separate three numbers that look similar",
    blocks: [
      {
        type: "paragraph",
        children:
          "Position value, required margin and account equity answer different questions. Position value describes exposure. Required margin is the provider’s current collateral requirement. Equity describes the account value including open results under the provider’s rules. Confusing them can make a large position look small simply because it needed a small deposit.",
      },
      {
        type: "example",
        title: "The deposit is not the full responsibility",
        children: [
          "An Australian learner hires equipment worth A$2,000 and pays an A$200 deposit. The deposit is not the equipment’s value or a promise that every possible bill is capped at A$200. This is only an everyday analogy: leveraged trading is governed by its own product and account terms. It helps separate collateral from exposure.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Leverage means obtaining exposure larger than the money supporting it. Depending on the product, this may involve borrowing, financing or a derivative position rather than a literal loan paid into your bank account. There is no single founder of the broad idea of leverage or margin; they are financing and collateral concepts used across different markets. This lesson teaches their arithmetic, while the exact legal arrangement must come from the provider’s documents.",
      },
    ],
  },
  {
    title: "Calculate the full exposure first",
    shortTitle: "Calculate the full exposure first",
    blocks: [
      {
        type: "paragraph",
        children:
          "In a conventional linear EUR/USD example, 0.10 lot represents 10,000 euros. At 1.1000 USD per euro, that is US$11,000 of notional exposure. Notional means the face-value reference for the position; it is not the cash profit, the stop risk or necessarily the cash paid to enter. Its account-currency equivalent changes with the chosen conversion rate.",
      },
      {
        type: "formula",
        expression:
          "Illustrative account-currency notional = base units × pair price × quote-to-account conversion",
        explanation:
          "Use the actual contract multiplier and the units of each conversion. This simplified linear model is not universal across products.",
      },
      {
        type: "example",
        title: "A US-dollar worksheet",
        children: [
          "10,000 EUR × 1.1000 USD per EUR = US$11,000. In a USD account the additional quote-to-account conversion is 1. If the price falls from 1.1000 to 1.0990, the long’s price result is 10,000 × (−0.0010) = −US$10 before charges, whatever margin was required.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For a short, the sign reverses: a rise is adverse and a fall favourable before costs. Check the instrument’s specifications rather than assuming every platform symbol is spot Forex. A futures contract, CFD or another derivative can have different multipliers, margin methods and settlement. Use one declared product throughout the example.",
      },
    ],
  },
  {
    title: "Read quoted leverage and required margin",
    shortTitle: "Read quoted leverage and required margin",
    blocks: [
      {
        type: "paragraph",
        children:
          "A stated leverage allowance such as 20:1 describes an illustrative relationship between notional and required margin. Under a simple fixed-rate model, required margin is notional divided by that leverage. The corresponding margin rate is 100 divided by leverage, expressed as a percentage. A provider can use tiers, separate long/short rules, different instruments or changed requirements, so the platform’s actual rule takes priority.",
      },
      {
        type: "comparisonTable",
        caption: "Same US$11,000 exposure under invented fixed margin rates",
        columns: [
          "Allowance",
          "Margin rate",
          "Required margin",
          "10-pip price loss on 10,000 EUR",
        ],
        rows: [
          ["10:1", "10%", "US$1,100", "US$10"],
          ["20:1", "5%", "US$550", "US$10"],
          ["50:1", "2%", "US$220", "US$10"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The table keeps the position size and price move fixed. Changing the margin allowance changes the collateral requirement; it does not change that position’s US$10 price loss. If someone uses the released collateral to open a larger position, the cash exposure then increases because size changed. Keep those two situations separate.",
      },
      {
        type: "learningLink",
        title: "Margin Calculator",
        href: "/tools/margin-calculator",
        description:
          "Use EUR/USD, 0.10 lot, price 1.1000, USD account and conversion 1. Compare leverage inputs 10, 20 and 50. Expected simplified margins are US$1,100, US$550 and US$220. The tool does not model provider-specific tiers or liquidation.",
      },
    ],
  },
  {
    title: "Measure effective account leverage",
    shortTitle: "Measure effective account leverage",
    blocks: [
      {
        type: "paragraph",
        children:
          "Allowed leverage and used leverage are different. Effective account leverage compares the notional exposure actually held with account equity. In a multi-position worksheet, state whether you are summing gross absolute exposures or using a net convention. Gross exposure helps reveal large offsetting tickets that a net figure can hide. Neither number alone describes every risk.",
      },
      {
        type: "formula",
        expression:
          "Illustrative effective leverage = gross account-currency notional ÷ current equity",
        explanation:
          "A simplified exposure ratio. Use consistent conversion and account valuation; gross and net conventions must be labelled.",
      },
      {
        type: "example",
        title: "An Australian demo account",
        children: [
          "A$1,000 of equity supports an invented A$2,000 currency exposure requiring A$200 margin. Effective exposure is 2:1, even though exposure relative to this margin is 10:1. In a simplified 5% adverse move measured on that account-currency exposure, the price loss is A$100, or 10% of the initial account equity—not 5% of the A$200 margin.",
        ],
      },
      {
        type: "paragraph",
        children:
          "When equity falls while the position remains open, effective leverage can rise without adding a ticket. If equity fell to A$800 and exposure remained approximately A$2,000, the ratio would be 2.5:1. Exchange-rate conversion can also change the numerator. This is why a leverage allowance is not a risk budget and a displayed maximum is not a target to use.",
      },
    ],
  },
  {
    title: "See the amplification with equal assumptions",
    shortTitle: "See the amplification with equal assumptions",
    blocks: [
      {
        type: "paragraph",
        children:
          "To isolate the arithmetic, assume a linear account-currency exposure equal to equity multiplied by an effective leverage ratio. Then a 1% adverse exposure move produces a loss equal to that ratio times 1% of starting equity, before costs and close-out effects. These examples deliberately hold other inputs constant; they do not assert how often a currency moves 1% or that a provider would allow every position to remain open.",
      },
      {
        type: "comparisonTable",
        caption: "Invented US$1,000 account; 1% adverse move before costs",
        columns: [
          "Effective exposure ratio",
          "Notional exposure",
          "Price loss",
          "Loss as % of initial equity",
        ],
        rows: [
          ["1:1", "US$1,000", "US$10", "1%"],
          ["2:1", "US$2,000", "US$20", "2%"],
          ["10:1", "US$10,000", "US$100", "10%"],
          ["50:1", "US$50,000", "US$500", "50%"],
          ["100:1", "US$100,000", "US$1,000", "100%"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A favourable move has the opposite price effect under the same simplified assumptions. Leverage amplifies both directions; it does not improve the forecast. At very high exposure, a comparatively small adverse move can consume the equity or trigger close-out before the worksheet’s final price. Losses can exceed the deposit for some products and jurisdictions; protections must be verified, not assumed.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not describe margin as the amount you are willing to lose. Do not infer that a small price move creates a small cash loss. Calculate the full position’s sensitivity and examine account terms before comparing percentages.",
        ],
      },
    ],
  },
  {
    title: "Follow equity, margin and free margin",
    shortTitle: "Follow equity, margin and free margin",
    blocks: [
      {
        type: "paragraph",
        children:
          "A common simple account display uses free margin equal to equity minus used margin, and margin level equal to equity divided by used margin times 100. Actual credit, blocked-profit and margin rules can add details. Free margin is a capacity calculation under those rules; it is not money that is automatically safe to risk. An open position can continue losing while the number is positive.",
      },
      {
        type: "comparisonTable",
        caption: "Invented USD account; used margin held at US$550",
        columns: [
          "State",
          "Balance",
          "Floating result",
          "Equity",
          "Free margin",
          "Margin level",
        ],
        rows: [
          [
            "Before open loss",
            "US$1,000",
            "US$0",
            "US$1,000",
            "US$450",
            "181.82%",
          ],
          [
            "After US$100 open loss",
            "US$1,000",
            "−US$100",
            "US$900",
            "US$350",
            "163.64%",
          ],
          [
            "After US$450 open loss",
            "US$1,000",
            "−US$450",
            "US$550",
            "US$0",
            "100%",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "This table is an arithmetic snapshot, not a promised sequence of permitted trades. The provider might intervene earlier, and used margin might change with prices, rules or exposure. When used margin is zero, the equity-to-margin percentage is undefined; a blank or special display must not be interpreted as a numeric guarantee.",
      },
      {
        type: "example",
        title: "A changing capacity display",
        children: [
          "A Japanese household can see the same bank deposit while expected expenses rise. The amount available for a new commitment falls. On a trading account, open results and margin requirements can both change, so a balance screenshot alone cannot show the current capacity or risk.",
        ],
      },
    ],
  },
  {
    title: "Distinguish a margin warning from forced closure",
    shortTitle: "Distinguish a margin warning from forced closure",
    blocks: [
      {
        type: "paragraph",
        children:
          "A margin-call condition means the account has reached the provider’s warning or requirement threshold. A stop-out or liquidation condition allows or requires forced closure under its rules. There may be no phone call and no period to wait for a recovery. Some systems block new orders; others close positions in a specified order. Thresholds may be percentages or amounts. Read the contract, not another learner’s platform screenshot.",
      },
      {
        type: "example",
        title: "A hypothetical threshold calculation",
        children: [
          "Suppose an invented policy warns at a 100% margin level and starts forced closure at 50%. With used margin held at US$550, the warning equity is US$550 and the 50% threshold is US$275. These numbers are not PipStart recommendations or a statement of any broker’s real policy.",
          "A fast move might pass the threshold before an orderly fill is available. Used margin can change as positions close. Therefore this simple calculation identifies a condition in an assumed model, not an exact liquidation price or final account loss.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Adding funds does not make an unsound position sound. If a demo worksheet relies on transferring household money to keep a losing position open, stop and review the policy rather than treating the transfer as risk control. Essential money stays outside the experiment. Confirm whether negative-balance protection applies to your entity, client classification and product; it cannot be inferred from a familiar brand name.",
      },
      {
        type: "paragraph",
        children:
          "Before any live consideration, independently verify the provider and its account terms, margin-change rights, order triggers, close-out method and complaint process. A profitable-looking chart cannot answer those contract questions. The broker lessons remain relevant here.",
      },
    ],
  },
  {
    title: "Prepare for changes in margin and execution",
    shortTitle: "Prepare for changes in margin and execution",
    blocks: [
      {
        type: "paragraph",
        children:
          "A margin requirement can increase while price has not moved against the position. If US$11,000 exposure initially needs US$220 at a 2% rate, a hypothetical change to 5% needs US$550. With US$1,000 equity, free margin falls from US$780 to US$450 under the simple equation. An unchanged account balance does not mean unchanged capacity.",
      },
      {
        type: "paragraph",
        children:
          "News, session transitions, gaps, poor liquidity, technology problems and provider policy can affect execution. A personal stop may be triggered and filled after an adverse move; an account-level forced closure can occur independently of your intended chart invalidation. Even a position whose intended stop risk looked small can be unsuitable if margin capacity and execution assumptions are fragile.",
      },
      {
        type: "example",
        title: "A travel deposit changes",
        children: [
          "A traveller in Germany reserves a rental with a €100 deposit. If the contract allows the deposit to rise to €250, the planned spending capacity changes even if the rental has not been damaged. The lesson is to read the requirement and keep room for changes, not to assume trading contracts operate exactly like rentals.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In demo, document separate checks: planned stop loss, adverse-fill loss, current margin, a higher-margin scenario, and combined positions. Do not use the Margin Calculator’s simple result as proof that a provider will accept the order or that forced closure will happen at the same number.",
      },
    ],
  },
  {
    title: "Measure drawdown from a recorded peak",
    shortTitle: "Measure drawdown from a recorded peak",
    blocks: [
      {
        type: "paragraph",
        children:
          "Drawdown is the fall from a previous account high to a later value. Choose a consistent series: balance-only drawdown omits open losses, while equity drawdown captures the account valuation including them. Record both where available rather than presenting the smaller one as the whole story. Maximum drawdown over a period is the largest recorded peak-to-subsequent-trough decline, not the sum of every losing trade.",
      },
      {
        type: "formula",
        expression:
          "Drawdown % = (previous peak − later account value) ÷ previous peak × 100",
        explanation:
          "Use the same account-value convention and adjust the record for deposits/withdrawals when assessing performance.",
      },
      {
        type: "example",
        title: "A peak, a fall, then a partial recovery",
        children: [
          "An invented account moves from US$1,000 to US$1,200, falls to US$960, then rises to US$1,080. The drawdown at US$960 is US$240/US$1,200 = 20%. At US$1,080 it is 10% below the same peak. The peak does not reset to US$960 merely because that is convenient.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Fresh deposits can hide trading losses if you look only at the ending balance; withdrawals can look like losses when they are not. Separate external cash flows from trading results. An intraday trough may be deeper than an end-of-day record captures, so state the observation frequency as well as the account convention.",
      },
    ],
  },
  {
    title: "Calculate why recovery percentages grow",
    shortTitle: "Calculate why recovery percentages grow",
    blocks: [
      {
        type: "paragraph",
        children:
          "A loss percentage uses the old amount as its denominator. Recovery uses the smaller amount remaining. A 20% fall from 100 to 80 loses 20, but gaining those 20 back requires 20/80 = 25%. This arithmetic explains why “I will just gain the same percentage back” is wrong. It does not promise a recovery path.",
      },
      {
        type: "formula",
        expression:
          "Required recovery % = drawdown % ÷ (100 − drawdown %) × 100",
        explanation:
          "Valid for a decline below 100%. At a 100% loss there is no remaining capital from which to grow.",
      },
      {
        type: "comparisonTable",
        caption: "Loss and recovery on a US$1,000 teaching account",
        columns: [
          "Drawdown",
          "Remaining value",
          "Gain required to regain US$1,000",
        ],
        rows: [
          ["5%", "US$950", "5.26%"],
          ["10%", "US$900", "11.11%"],
          ["20%", "US$800", "25%"],
          ["30%", "US$700", "42.86%"],
          ["50%", "US$500", "100%"],
          ["75%", "US$250", "300%"],
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-5/drawdown-and-recovery.svg",
        desktopSrc:
          "/images/lessons/forex/level-5/drawdown-and-recovery-desktop.svg",
        width: 720,
        height: 400,
        alt: "A teaching account falls from 100 to 80: loss is 20% of 100; regaining 20 is 25% of 80.",
        caption:
          "The amount needed is the same 20; the denominator changes. Recovery is arithmetic, not a target the market owes you.",
      },
      {
        type: "example",
        title: "A water tank makes the denominator visible",
        children: [
          "A household in South Africa has 100 litres in a tank and uses 20. The 80 litres remaining need 20 added, which is one quarter of 80. The tank example uses the same arithmetic as the account, without suggesting that money can be replenished as predictably as water.",
        ],
      },
      {
        type: "learningLink",
        title: "Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Enter a hypothetical USD account of 1,000 and a 20% decline. Compare US$800 remaining and 25% recovery required. The tool does not predict when or whether recovery occurs.",
      },
    ],
  },
  {
    title: "Keep recovery planning separate from recovery pressure",
    shortTitle: "Keep recovery planning separate from recovery pressure",
    blocks: [
      {
        type: "paragraph",
        children:
          "A recovery calculation describes the distance back to an earlier value. It does not justify increasing leverage, doubling size or taking a new idea to erase a loss quickly. A new trade must pass the same independent rules as the first one. Time spent learning can be more useful than taking another position; a loss is not a deadline to earn it back.",
      },
      {
        type: "learningLink",
        title: "Gain-Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Use current demo value 800 and recovery target 1,000. A constant 5% gain per period would require five whole periods in the model. That assumed growth rate is not a forecast, income promise or appropriate objective.",
      },
      {
        type: "paragraph",
        children:
          "The constant-growth model compounds a chosen rate. Four 5% periods give about 972.41 from 800; five give about 1,021.03. Real trading can alternate gains and losses, costs and withdrawals; a fixed growth path conceals that uncertainty. Label the assumption clearly and do not convert the calculator’s output into a date by which the account must recover.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A smaller remaining balance, a larger recovery percentage and emotional pressure can combine badly. Pause, review total exposure and check whether the original learning activity still fits your circumstances. No course completion, calculator or broker allowance makes essential money available for risk.",
        ],
      },
    ],
  },
  {
    title: "Practise the account arithmetic",
    shortTitle: "Practise the account arithmetic",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A EUR/USD teaching position is 0.10 lot, or 10,000 euros, at 1.1000. In a USD account and a simple 20:1 margin model, find notional and required margin. What is a 10-pip adverse price loss?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Notional is US$11,000 and margin is US$550. The price loss is US$10 before costs. Margin does not cap that loss, and provider rules may differ from the fixed-rate model.",
      },
      {
        type: "exercise",
        prompt:
          "A demo balance is US$1,000, floating result −US$100 and used margin US$550. Assume no other adjustments. Find equity, free margin and margin level.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Equity is US$900; free margin US$350; margin level 900/550 × 100 = about 163.64%. The positive free margin is not a statement that another trade is safe.",
      },
      {
        type: "exercise",
        prompt:
          "An account peaks at US$1,200 and later reaches US$960. Find drawdown and the gain needed to regain the peak.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Drawdown is 20%. Recovery requires US$240/US$960 = 25%, before costs and external cash flows. These are different denominators.",
      },
    ],
  },
  {
    title: "Reflect, check and keep a record",
    shortTitle: "Reflect, check and keep a record",
    blocks: [
      {
        type: "reflection",
        title: "Explain it in your own words",
        points: [
          "Distinguish notional exposure, required margin and effective account leverage.",
          "Calculate equity, free margin and hypothetical margin-level conditions.",
          "Measure drawdown and recovery with consistent account references.",
        ],
        closing: [
          "Use a demo notebook to keep intended risk, actual outcomes and unexplained differences separate. If you cannot explain a unit or assumption, pause and check it.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All numeric market and account examples are invented teaching data, not live recommendations. Position sizing, stops and loss limits cannot guarantee a maximum actual loss. Product terms, leverage, conversion, charges, gaps and execution can change results. Keep essential living money outside trading experiments.",
      },
      {
        type: "keyPoint",
        title: "Before you mark this lesson complete",
        points: [
          "I can repeat the worked arithmetic and state its currency units.",
          "I can distinguish account values, planned losses and actual outcomes.",
          "I can identify a cost or execution assumption that could fail.",
          "I can explain the exercises and use the linked tools as estimates.",
          "I can state when a zero-size decision or a learning pause is appropriate.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
        ],
      },
    ],
  },
];
