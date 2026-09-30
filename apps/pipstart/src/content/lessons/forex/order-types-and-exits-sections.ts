import type { LessonSection } from "../../lesson-content";

export const orderTypesAndExitsSections: LessonSection[] = [
  {
    title: "Choose an instruction for a specific job",
    shortTitle: "Orders are instructions",
    blocks: [
      {
        type: "paragraph",
        children:
          "An order tells the platform what you want done, under which conditions and for how long. It does not predict where the market will go. Start with your actual requirement: act promptly, accept only a specified price, or wait for a trigger. Then choose the instruction whose documented behaviour matches that requirement.",
      },
      {
        type: "paragraph",
        children:
          "An entry creates exposure; an exit reduces or removes exposure. The same order family can serve either purpose. A sell order might open a short position or close an existing long depending on the account and the way you submit it. A stop-loss names the purpose of an intended protective exit; it does not make every stop a guaranteed loss ceiling.",
      },
      {
        type: "paragraph",
        children:
          "This lesson covers the common order families used in beginner practice. Venues and providers add variants and use different trigger and fill rules. Learn your product’s definition before treating an instruction as equivalent to an order on another platform.",
      },
      {
        type: "example",
        title: "A chair at the right price",
        children: [
          "A buyer in Brazil tells a furniture seller, “I will pay R$50 or less for that chair.” That is a price condition. Saying “Buy it now at the available price” is a different instruction. Saying “When the delivery alert arrives, ask to buy it” introduces a trigger. Keep these three jobs separate.",
        ],
      },
    ],
  },
  {
    title: "Market orders prioritise prompt execution",
    shortTitle: "Market orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "A market order asks to transact at the available price. In a simple two-sided Forex quote, buying generally uses the ask and selling uses the bid. The last candle, last transaction or previously displayed quote is not a guaranteed fill. Prices and available size can change while the instruction is being handled.",
      },
      {
        type: "paragraph",
        children:
          "An accepted order may fill in parts where that product supports partial fills. A request can also be rejected under account or market rules. “Market” therefore describes an execution instruction, not an unconditional promise of instant execution under every circumstance. Record both the status and the prices actually received.",
      },
      {
        type: "paragraph",
        children:
          "Slippage is the difference between an expected price and the actual fill. It may be favourable or adverse. If the observed EUR/USD ask was 1.1002 and a buy fills at 1.1004, the two-pip difference is adverse. A buy fill at 1.1001 would be one pip favourable relative to that observed ask. For sells, a lower fill is adverse and a higher fill is favourable.",
      },
      {
        type: "example",
        title: "The checkout receipt matters",
        children: [
          "A Canadian shopper saw C$10 on a shelf but agrees to purchase at the price available at checkout. The receipt, not the earlier label, records the transaction. For a demo market order, keep the fill record rather than replacing it in your journal with the price you hoped to receive.",
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A market instruction favours prompt execution over control of an exact price.",
      },
    ],
  },
  {
    title: "Limit orders control the acceptable price",
    shortTitle: "Limit orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "A true buy limit specifies the highest price you will accept; it can fill at that price or lower. A true sell limit specifies the lowest price you will accept; it can fill at that price or higher. Price control comes with the possibility of no fill, or a partial fill where supported. A fee schedule can still make the cash cost different from the limit price alone.",
      },
      {
        type: "paragraph",
        children:
          "With EUR/USD near 1.1000, a buy limit at 1.0950 waits for a lower acceptable buy price. A sell limit at 1.1050 waits for a higher acceptable sale price. A limit does not have to sit away from the market on every venue: a marketable limit may execute promptly while retaining its price boundary. Provider interfaces may restrict where particular pending orders can be placed.",
      },
      {
        type: "paragraph",
        children:
          "For retail Forex, confirm the applicable bid or ask trigger and execution conditions. Seeing a chart touch the limit is insufficient if the relevant side did not qualify, available size was insufficient or the provider’s rules were not met. If the true limit condition cannot be satisfied, remaining unfilled is the expected trade-off, not automatically a platform malfunction.",
      },
      {
        type: "example",
        title: "A price condition can mean no purchase",
        children: [
          "The Brazilian chair never falls to R$50 or less. The buyer does not get a chair, but the price condition was respected. Likewise, a EUR/USD buy limit at 1.0950 can remain waiting if the executable ask never qualifies.",
        ],
      },
    ],
  },
  {
    title: "Stops wait for a trigger",
    shortTitle: "Stop entries and exits",
    blocks: [
      {
        type: "paragraph",
        children:
          "A conventional stop-market instruction waits for a trigger and then seeks market execution. A buy stop is commonly placed above the relevant current buy price, and a sell stop below the relevant current sell price. A stop entry can be used to seek participation after a move through a level, but triggering does not prove the move will continue.",
      },
      {
        type: "paragraph",
        children:
          "For a long position, a sell stop-loss is a common exit below the current market. For a short position, a buy stop-loss is a common exit above it. Check which price triggers the instruction: bid, ask, last price or a specified condition. Do not assume a single candle tells the whole story.",
      },
      {
        type: "paragraph",
        children:
          "An ordinary stop can fill beyond its trigger during a gap or rapid movement. A long EUR/USD position with stop trigger 1.0900 might exit at 1.0895, creating five additional pips of adverse movement. A specifically guaranteed stop, if offered, has a different contract with its own charges, eligibility and conditions. The word “stop” alone does not supply that guarantee.",
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "A trigger tells the system when to act; it does not freeze the market at the trigger price.",
        ],
      },
      {
        type: "example",
        title: "An alarm is not a barrier",
        children: [
          "A water-level alarm in a Japanese household sounds at a mark. It tells someone to respond, but does not physically hold the water at that mark. Similarly, an ordinary stop starts an execution process rather than creating a fixed boundary around the eventual cash loss.",
        ],
      },
    ],
  },
  {
    title: "Stop-limit orders add a second condition",
    shortTitle: "Stop-limit trade-off",
    blocks: [
      {
        type: "paragraph",
        children:
          "A stop-limit combines a trigger with a limit instruction. Once triggered, it seeks execution at the limit price or better. The stop price and limit price have separate jobs: one activates the instruction; the other controls the acceptable fill. The order can remain unfilled after activation.",
      },
      {
        type: "paragraph",
        children:
          "Suppose a long EUR/USD position has a sell stop-limit trigger of 1.0900 and sell limit of 1.0895. If it activates and eligible buyers are available at 1.0895 or higher, it may fill under the venue’s rules. If the next eligible bid is 1.0880 and never returns, the sell limit cannot accept that lower price. The original long position can remain exposed while losses grow.",
      },
      {
        type: "paragraph",
        children:
          "A buy stop-limit has the opposite price boundary: after activation it will not pay more than its buy limit. Some platforms offer named buy-stop-limit and sell-stop-limit entry variants with particular price relationships. Read those definitions; do not transplant the example into an unfamiliar ticket without checking.",
      },
      {
        type: "comparisonTable",
        caption: "Two ways to respond after a trigger",
        columns: ["Instruction", "Price behaviour", "Main remaining risk"],
        rows: [
          [
            "Ordinary stop-market",
            "Seeks a market fill after activation",
            "Fill may be worse than the trigger.",
          ],
          [
            "Stop-limit",
            "Seeks a fill within the limit boundary after activation",
            "May remain unfilled while exposure continues.",
          ],
          [
            "Specifically guaranteed stop, where available",
            "Depends on a separate guarantee agreement",
            "Eligibility, premium and conditions must be checked.",
          ],
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Price control and getting out are different requirements. A stop-limit can protect the price condition while failing to close the position.",
      },
    ],
  },
  {
    title: "Understand targets and trailing stops",
    shortTitle: "Targets and trailing stops",
    blocks: [
      {
        type: "paragraph",
        children:
          "A take-profit is an intended favourable exit. It is often implemented as a limit-type instruction, such as selling a long position at a target or higher. Other platforms use a trigger followed by a market operation. Its name states the purpose, not a universal execution rule. Verify which implementation applies and whether partial fills or rejection are possible.",
      },
      {
        type: "paragraph",
        children:
          "A trailing stop updates a stop level according to a stated rule as price moves favourably. In a simple long-position example with a 20-pip trailing distance, a qualifying bid rise from 1.1000 to 1.1030 could move the stop from 1.0980 to 1.1010 after activation. A later fall would not ordinarily loosen the stop under that rule. The actual initial activation, step size and reference side depend on the implementation.",
      },
      {
        type: "paragraph",
        children:
          "A trailing instruction can still slip after its stop triggers. Some trailing features require your application to remain connected; others run on the provider’s system. MetaTrader 5 documents its built-in trailing stop as terminal-side. Read the current guide for your platform instead of assuming every automated exit survives logout.",
      },
      {
        type: "paragraph",
        children:
          "Moving a stop to the entry price also does not necessarily mean a cash break-even exit. Commission, financing, conversion and execution differences can leave a net loss. Confirm the active exit after any amendment; changing a drawing is not the same as changing an accepted order.",
      },
      {
        type: "example",
        title: "Keeping a moving alarm",
        children: [
          "A learner in the United Kingdom imagines raising a water-level marker when conditions improve, but never lowering it again. The trailing rule adjusts when to respond. It does not promise what price will be available when the response happens.",
        ],
      },
    ],
  },
  {
    title: "Set duration and linked-order behaviour",
    shortTitle: "Duration and linked orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "Time-in-force specifies how long an instruction remains eligible. A day order expires at the relevant session boundary, which may not be midnight where you live. Good-till-cancelled, or GTC, lasts until cancellation or a provider-defined expiry. Good-till-date uses a specified expiry. Check the clock, time zone and provider limits.",
      },
      {
        type: "paragraph",
        children:
          "Where offered, immediate-or-cancel, or IOC, attempts prompt execution and cancels the unfilled remainder. Fill-or-kill, or FOK, seeks the entire requested quantity immediately or none. These are distinct from an instruction that may wait on the book. Availability and precise timing rules depend on the venue.",
      },
      {
        type: "paragraph",
        children:
          "One-cancels-the-other, or OCO, links two instructions so execution of one cancels the other according to the implementation. A bracket commonly links an entry with protective and target exits. Confirm when the exits become active, how partial fills affect their quantities, and what happens if cancellation is delayed or fails. Standalone exit orders can accidentally open an opposite position after the original exposure is gone.",
      },
      {
        type: "paragraph",
        children:
          "Reduce-only or close-only settings, where offered, are designed to restrict an instruction to reducing exposure. They are useful controls, but not universal features. Verify the remaining position and linked-order statuses after a manual exit, partial close or change of size.",
      },
      {
        type: "comparisonTable",
        caption: "Duration choices where supported",
        columns: ["Setting", "Plain-language purpose"],
        rows: [
          ["Day", "Remain eligible for this defined session."],
          [
            "GTC / good-till-date",
            "Wait until cancellation, a stated date or the provider’s limit.",
          ],
          ["IOC", "Try immediately; cancel the part not filled."],
          ["FOK", "Fill the entire amount immediately or do not fill it."],
          [
            "OCO / bracket",
            "Link instructions under stated activation and cancellation rules.",
          ],
        ],
      },
    ],
  },
  {
    title: "Keep the common order family together",
    shortTitle: "Order reference",
    blocks: [
      {
        type: "comparisonTable",
        caption:
          "A practical order reference — verify the product’s exact rules",
        columns: ["Instruction", "Typical job", "What can still go wrong"],
        rows: [
          [
            "Market buy / sell",
            "Seek prompt execution at available prices",
            "Slippage, partial fill or rejection under the rules.",
          ],
          [
            "Buy limit",
            "Buy at the specified maximum price or lower",
            "No fill or only a partial fill.",
          ],
          [
            "Sell limit",
            "Sell at the specified minimum price or higher",
            "No fill or only a partial fill.",
          ],
          [
            "Buy stop",
            "Activate a buy after the relevant price rises to a trigger",
            "Fill can be above the trigger; move can reverse.",
          ],
          [
            "Sell stop",
            "Activate a sale after the relevant price falls to a trigger",
            "Fill can be below the trigger; move can reverse.",
          ],
          [
            "Buy / sell stop-limit",
            "Activate a limit after a separate trigger",
            "Activated order can remain unfilled.",
          ],
          [
            "Stop-loss exit",
            "Seek to reduce exposure after adverse movement",
            "Ordinary stops can slip; loss is not capped.",
          ],
          [
            "Take-profit exit",
            "Seek an exit after favourable movement",
            "Limit-style or trigger-style behaviour varies.",
          ],
          [
            "Trailing stop",
            "Adjust a stop under a favourable-movement rule",
            "Activation, connectivity and fill risks remain.",
          ],
          [
            "Linked OCO / bracket",
            "Coordinate related instructions",
            "Partial fills and cancellations require verification.",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Read this table as a vocabulary reference. It is not a recommendation to use every order or to open a position. Your decision should start with the requirement, the available product rules and the loss you could face. A line labelled “target” or “stop” on a chart is not evidence that a valid exit has been accepted.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/order-types-and-exits-guide.svg",
        desktopSrc:
          "/images/lessons/forex/order-types-and-exits-guide-desktop.svg",
        alt: "A limit controls the acceptable fill price, an ordinary stop starts execution after a trigger, and a stop-limit combines a trigger with a price boundary while allowing no fill.",
        caption:
          "Three distinct jobs: a price condition, an activation condition, or both. None predicts the next move.",
        width: 600,
        height: 525,
      },
    ],
  },
  {
    title: "A real-life worked example",
    shortTitle: "Worked example",
    blocks: [
      {
        type: "paragraph",
        children:
          "A French learner writes an entirely hypothetical EUR/USD demo plan: buy limit 1.0950, sell stop-loss trigger 1.0900, and intended take-profit 1.1050. With an assumed 100,000-unit standard lot, 0.01 lot is 1,000 euros and one conventional pip is US$0.10 in a USD account. The buy may never qualify or fill.",
      },
      {
        type: "paragraph",
        children:
          "If the actual entry is 1.0950 and the ordinary stop fills at 1.0900, the 50-pip movement produces −US$5 before separate costs. An exit at 1.1050 produces +US$10 from the 100-pip movement before separate costs. The price distances form a planned 1:2 risk-to-reward relationship. It is not a prediction of win probability, profitability or the maximum loss.",
      },
      {
        type: "paragraph",
        children:
          "If the stop triggers at 1.0900 but fills at 1.0895, the executable loss becomes 55 pips, or US$5.50 before separate charges. If the entry fills at a different allowed price, recalculate the distances from that fill. Track the active instructions at each stage instead of assuming the original plan remains intact.",
      },
      {
        type: "learningLink",
        title:
          "Compare the planned distances with the Risk-to-Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Use long direction, entry 1.0950, stop 1.0900 and target 1.1050. The planned ratio is 1:2. The tool measures price distances; it does not predict fills, fees or win rate.",
      },
      {
        type: "learningLink",
        title: "Check actual fills with the Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use long EUR/USD, 0.01 lots, USD account and conversion factor 1. Compare entry 1.0950 with exits 1.0900, 1.1050 and 1.0895: gross results are −US$5, +US$10 and −US$5.50 respectively.",
      },
    ],
  },
  {
    title: "Rehearse states rather than clicking quickly",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "On paper or demo, follow waiting, accepted, triggered, filled, cancelled, expired, rejected and closed states. For each state, say which position exists and which instructions remain active. Practise cancelling a pending limit and closing a filled position through their separate controls.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "A buy limit at 1.0950 never sees an eligible ask at or below that price: it need not fill. A sell stop triggers at 1.0900 and fills at 1.0895: the trigger was not a fixed loss ceiling. A sell stop-limit activates but all eligible bids stay below its limit: the long can remain open. A take-profit uses a true sell limit: it must respect its limit price, but execution is not assured.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Finally, rehearse an amendment: request a new stop, wait for acceptance and confirm the active price. A rejected change may leave the previous instruction in place or require another action under the provider’s rules. Record exactly what the system reports. If you cannot explain the remaining exposure, pause before sending another instruction.",
      },
    ],
  },
  {
    title: "References and before moving on",
    shortTitle: "Before moving on",
    blocks: [
      {
        type: "riskStatement",
        children:
          "Learning material and hypothetical examples only. Leveraged Forex can cause substantial losses. Demo results, planned exits and calculators do not guarantee live fills or profits. Product rules and protections depend on the actual provider, account and jurisdiction.",
      },
      {
        type: "keyPoint",
        title: "I can explain this without guessing",
        points: [
          "I can choose between prompt execution, a limit price and a stop trigger.",
          "I can explain buy and sell limits and stops for both entries and exits.",
          "I understand why an ordinary stop can slip and a stop-limit may not close a position.",
          "I can check take-profit, trailing-stop, duration and linked-order rules.",
          "I can distinguish a planned result from an actual fill and confirm all active instructions.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "Investor.gov — Types of Orders (securities primer)",
            url: "https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders",
          },
          {
            title:
              "CME Group — Futures Order Types (exchange-specific examples)",
            url: "https://www.cmegroup.com/education/courses/futures-trading-mechanics-and-regulation/futures-order-types",
          },
          {
            title: "MetaTrader 5 — Basic trading principles and trailing stops",
            url: "https://www.metatrader5.com/en/terminal/help/trading/general_concept",
          },
        ],
      },
    ],
  },
];
