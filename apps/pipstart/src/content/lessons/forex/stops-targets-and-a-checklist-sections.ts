import type { LessonSection } from "../../lesson-content";

export const stopsTargetsAndAChecklistSections: LessonSection[] = [
  {
    title: "Connect the chart idea to an exit plan",
    shortTitle: "Connect the chart idea to an exit plan",
    blocks: [
      {
        type: "paragraph",
        children:
          "A chart interpretation, an invalidation condition, a stop order and a cash-risk limit are related, but they are not the same thing. The interpretation is your conditional explanation. Invalidation states what would make that explanation fail its rule. A stop order is an instruction handled under provider terms. Cash risk is the account-currency loss estimated for the intended size and exits.",
      },
      {
        type: "comparisonTable",
        caption: "Four separate lines in a demo plan",
        columns: ["Line", "Question it answers"],
        rows: [
          ["Idea", "What observation am I testing?"],
          ["Invalidation", "What price/time condition makes it fail?"],
          [
            "Stop instruction",
            "How and on which price side would an exit be triggered?",
          ],
          [
            "Cash worksheet",
            "What would the planned and worse fills cost at the permitted size?",
          ],
        ],
      },
      {
        type: "example",
        title: "The road-closed sign belongs in the route plan",
        children: [
          "A Mexican learner plans a journey to school. If a road is closed, turning back may be part of the plan. Moving the “road closed” sign farther away does not reopen the road. Likewise, widening an exit after an adverse move does not repair the original chart idea.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This lesson joins the observations from the first two lessons to the risk boundaries from Level 5. All prices, charges and balances are invented teaching inputs. Completing the checklist can produce “no demo trade” as a successful decision. The purpose is a clear, reviewable process, not pressure to find an entry.",
      },
    ],
  },
  {
    title: "Choose invalidation from the written idea",
    shortTitle: "Choose invalidation from the written idea",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use the reference already defined before the entry. A continuation candidate might require that a chosen low remains intact; a zone idea might fail after a specified close below its lower boundary. State the exact price, timeframe, comparison and availability condition. “Exit when it looks wrong” leaves room to reinterpret every loss.",
      },
      {
        type: "paragraph",
        children:
          "A close-based chart invalidation and an intrabar protective stop can occur at different times. For example, a rule may say a completed daily close below a low invalidates the description, while a protective stop closes a demo position earlier if the bid reaches its trigger. If the stop exits and price later recovers, the stop event still occurred. Do not relabel the trade as having survived because a later chart supports the idea again.",
      },
      {
        type: "example",
        title: "Waiting for the report is different from the safety rule",
        children: [
          "A German shop evaluates its weekly sales report on Friday but closes a leaking water valve immediately on Tuesday. The report condition and the immediate protective action serve different purposes. A chart-close condition and an intrabar stop likewise need separate definitions.",
        ],
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not move the invalidation only to justify the size you want, remove a stop because a candle looks convincing, or widen it to avoid closing a loss. A changed level and size create a new risk worksheet, and the original policy may require a pause instead.",
        ],
      },
    ],
  },
  {
    title: "Check the executable entry and exit sides",
    shortTitle: "Check the executable entry and exit sides",
    blocks: [
      {
        type: "paragraph",
        children:
          "For a conventional quote, a long enters by buying at ask and closes by selling at bid. A short enters at bid and closes at ask. The chart may show only bid, so a short stop can be triggered by ask even when the visible bid wick did not reach the same level. Confirm the product’s trigger and fill rules rather than assuming the drawing tells the entire execution story.",
      },
      {
        type: "example",
        title: "An invented USD/JPY long",
        children: [
          "Suppose a demo long’s executable ask entry is 150.02, its sell-stop trigger uses bid 149.82 and its target bid is 150.42. A conventional JPY pip is 0.01 yen: planned adverse distance is 20 pips and proposed favourable distance 40 pips. These distances use the stated transaction sides; they do not guarantee either exit.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Direction checks for teaching prices",
        columns: ["Plan", "Entry", "Stop side/level", "Target side/level"],
        rows: [
          [
            "EUR/USD long",
            "Ask 1.1000",
            "Bid below entry, e.g. 1.0980",
            "Bid above entry, e.g. 1.1040",
          ],
          [
            "EUR/USD short",
            "Bid 1.1000",
            "Ask above entry, e.g. 1.1020",
            "Ask below entry, e.g. 1.0960",
          ],
          ["USD/JPY long", "Ask 150.02", "Bid 149.82", "Bid 150.42"],
        ],
      },
      {
        type: "paragraph",
        children:
          "If you use actual entry and exit sides in the distance, do not add that same bid/ask spread again as a separate fee. If you measure from a mid-price or a bid-only chart, work out the side adjustment first. Include explicit commission, financing and conversion charges separately, under one coherent convention.",
      },
    ],
  },
  {
    title: "Know what a stop instruction can and cannot do",
    shortTitle: "Know what a stop instruction can and cannot do",
    blocks: [
      {
        type: "paragraph",
        children:
          "An ordinary stop instructs an attempted exit when its trigger condition occurs. It is not a promise of that exact price. A gap or limited liquidity can lead to a worse fill. A stop-limit combines a trigger and a limit-price condition: it may control the acceptable price but can leave the position open if no acceptable fill is available. Product implementations differ, so read the provider’s terms.",
      },
      {
        type: "example",
        title: "A quote jumps past the teaching stop",
        children: [
          "For the USD/JPY long, the intended stop is 149.82. If the next available bid in a simplified gap example is 149.70, an ordinary stop could fill there instead. From 150.02 to 149.70 is 0.32 yen, or 32 pips, rather than 20. A stop-limit could remain unfilled under its price condition; that is a different risk.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Guaranteed-stop products, where available, need their own eligibility, fee and coverage terms. Never assume an ordinary stop is guaranteed because the platform lets you place it. Check minimum stop distance, permitted price increments, modification rules and whether the protection is attached to the intended position. An accepted order is not proof against every connection or provider problem.",
      },
      {
        type: "paragraph",
        children:
          "A trailing stop changes a reference as prices move according to its rule. It does not eliminate gaps or create zero-risk profit. Some trailing mechanisms depend on the terminal or connection; confirm what still operates when you disconnect. Keep the original risk reference in the journal even after an exit level is modified.",
      },
    ],
  },
  {
    title: "Allow for ordinary movement without inventing a perfect stop",
    shortTitle: "Allow for ordinary movement without inventing a perfect stop",
    blocks: [
      {
        type: "paragraph",
        children:
          "A stop can sit at a meaningful chart reference and still be triggered during normal variation. A wider stop can avoid some small excursions but increases the distance used for sizing. A tighter stop can reduce distance while increasing sensitivity to spread and small moves. There is no distance that guarantees both survival and low cash loss.",
      },
      {
        type: "example",
        title: "The chart reference and the cash budget",
        children: [
          "A hypothetical EUR/USD idea uses a selected bid low of 1.0985 and a predeclared protective stop at 1.0980, five pips lower. Entry ask is 1.1000. The exit reference, buffer and 20-pip distance are teaching choices, not an optimal setting.",
          "If a different valid reference needs a 40-pip distance, the same cash budget calls for less size. If the minimum permitted size is too large or the evidence does not justify the reference, the decision can be to skip. Bringing the stop closer merely to recover the old lot size changes the test.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Volatility tools such as ATR can describe earlier movement, as Level 4 explained. A multiple of ATR is another stop rule to define and test, not a promise about tomorrow’s range. Compare chart logic, product restrictions, executable distance and budget. Use a single stated rule for the example instead of switching methods after seeing which one would have survived.",
      },
    ],
  },
  {
    title: "Place a target for a reason, then test the consequence",
    shortTitle: "Place a target for a reason, then test the consequence",
    blocks: [
      {
        type: "paragraph",
        children:
          "A target is a proposed favourable exit condition. You might link it to a prior reaction area, a range boundary or a predeclared multiple of risk. Each method has assumptions. A farther target makes the displayed ratio larger but may be reached less often or take longer; a closer target can shrink the ratio and make costs more important. Neither is money already earned.",
      },
      {
        type: "example",
        title: "A Mexican learner’s short worksheet",
        children: [
          "Use an invented USD/MXN short entry at 18.00 pesos per dollar, an adverse exit at 18.10 and a possible favourable exit at 17.80. The price distances are 0.10 and 0.20 pesos per dollar, so proposed reward/risk is 2 before costs and execution. At 1,000 USD units, the simplified losses/gains are MX$100 and MX$200 respectively.",
          "This is paper arithmetic, not a quote or a calculator-supported trade instruction. USD/MXN support and contract/legal conditions must not be assumed. The PipStart tool exercises below use supported EUR/USD or USD/JPY.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A take-profit implementation may use a limit-style instruction or another triggered exit under product rules. A limit order prioritises a price condition but does not promise a fill. A price touching your line on one chart does not establish an executed exit on the required quote side. Write the trigger, order type, expiry and holding-period assumptions.",
      },
      {
        type: "paragraph",
        children:
          "Do not move a target farther after price approaches it just to chase a larger gain unless a predeclared, separately tested management rule allows that change. Record how time exits, partial closes and cancellation affect outcomes; the original target should remain visible in the plan.",
      },
    ],
  },
  {
    title: "Calculate the proposed ratio with the right direction",
    shortTitle: "Calculate the proposed ratio with the right direction",
    blocks: [
      {
        type: "formula",
        expression:
          "Proposed reward-to-risk = favourable price distance ÷ adverse price distance",
        explanation:
          "Use valid long/short levels and consistent quote conventions. This is a price-only ratio until size, charges and actual fills are included.",
      },
      {
        type: "example",
        title: "The familiar EUR/USD long and short",
        children: [
          "Long entry 1.1000, stop 1.0980, target 1.1040: adverse distance 0.0020 = 20 pips; favourable distance 0.0040 = 40 pips; ratio 40/20 = 2.",
          "For a short at 1.1000 with stop 1.1020 and target 1.0960, the distances are again 20 and 40 pips in the opposite direction. A calculator using absolute distances still needs you to place stop and target on valid sides. Invalid levels do not become valid because their absolute differences look attractive.",
        ],
      },
      {
        type: "learningLink",
        title: "Risk-to-Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Enter the long example, then the valid short example. Compare the 2:1 price-distance ratios. The tool’s theoretical break-even percentage assumes its model; it does not establish a signal’s win probability.",
      },
      {
        type: "paragraph",
        children:
          "A possible reward twice the planned loss does not mean a win is twice as likely. Cash outcomes can be asymmetric because of costs, conversion and different fills. Use Level 5’s net-outcome calculation if you want to compare the cost-aware ratio or break-even model, and label whether risk means price loss or total planned loss.",
      },
    ],
  },
  {
    title: "Size the position after the exit is defined",
    shortTitle: "Size the position after the exit is defined",
    blocks: [
      {
        type: "paragraph",
        children:
          "Bring the stop distance into the sizing worksheet. Under a conventional 100,000-unit EUR/USD lot and USD account, a standard lot has US$10 per conventional pip. A 20-pip distance and US$10 price-only budget give 0.05 lot. That consumes the budget before commission or worse fills, so it cannot also be described as an all-in US$10 loss limit.",
      },
      {
        type: "comparisonTable",
        caption:
          "Invented EUR/USD worksheet: 20-pip intended stop and five-pip worse-fill scenario",
        columns: [
          "Lot size",
          "Planned price loss",
          "Round-trip fee at US$7/lot",
          "Planned total",
          "Scenario total",
        ],
        rows: [
          ["0.05", "US$10.00", "US$0.35", "US$10.35", "US$12.85"],
          ["0.04", "US$8.00", "US$0.28", "US$8.28", "US$10.28"],
          ["0.03", "US$6.00", "US$0.21", "US$6.21", "US$7.71"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The fee and five-pip scenario are invented assumptions. If a demo policy specifically requires this scenario to fit a US$10 gate, 0.04 does not fit and 0.03 does among these listed sizes. Five pips is not a worst possible gap. A smaller size passing this scenario does not guarantee a maximum loss; it only passes the stated worksheet.",
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Use demo balance 1,000, risk 1%, EUR/USD, USD, conversion 1 and 20 stop pips. It returns price-only sizing. Compare the table separately to include commission and the chosen adverse-fill scenario.",
      },
      {
        type: "learningLink",
        title: "Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Check EUR/USD at 0.03 lot: US$0.30 per pip under the stated USD and contract assumptions. Twenty pips gives US$6 price loss; five extra pips adds US$1.50 before fees.",
      },
    ],
  },
  {
    title: "Compare the actual fill with the original plan",
    shortTitle: "Compare the actual fill with the original plan",
    blocks: [
      {
        type: "diagram",
        src: "/images/lessons/forex/level-6/planned-and-actual-stop.svg",
        desktopSrc:
          "/images/lessons/forex/level-6/planned-and-actual-stop-desktop.svg",
        width: 720,
        height: 400,
        alt: "A EUR/USD long enters at ask 1.1000, intends a bid stop at 1.0980 and exits at bid 1.0975: 20 planned versus 25 actual pips.",
        caption:
          "A worse fill changes the price loss. At the teaching 0.05 lot, the price-only loss changes from US$10 to US$12.50 before charges.",
      },
      {
        type: "paragraph",
        children:
          "Keep intended entry, actual entry, intended exit and actual exit in separate columns. Record size, charges and conversion. When a trade closes, compare the cash result with the original planned-risk reference. Do not redefine that reference after moving a stop or seeing the outcome; otherwise the result cannot be compared honestly across ideas.",
      },
      {
        type: "example",
        title: "A stop fill changes the cash result",
        children: [
          "A teaching EUR/USD long at 0.05 lot enters at 1.1000. Its intended stop is 1.0980, but it fills at 1.0975. Actual adverse distance is 25 pips, so price loss is US$12.50 rather than US$10. With the invented US$0.35 round-trip fee, total loss is US$12.85 before any other charges.",
        ],
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Compare a long EUR/USD, 0.05 lot, entry 1.1000 and exits 1.0980 versus 1.0975 in a USD account with conversion 1. Expected price results are −US$10 and −US$12.50. Add charges separately; the tool does not predict fills.",
      },
      {
        type: "paragraph",
        children:
          "R is a journal unit: one R equals the initial planned cash-risk amount under your stated convention. If a separate example’s original all-in planned risk is US$10, an actual net US$15 gain is +1.5R and an actual US$12 loss is −1.2R. This notation makes larger-than-planned losses visible. It does not force every losing trade to equal −1R.",
      },
      {
        type: "paragraph",
        children:
          "Deposits, withdrawals and conversion changes should not be silently mixed into a position’s outcome. Use consistent account-currency valuations and keep both gross price result and total charges visible. A single favourable result cannot validate the observation rule, just as a single failure does not prove which part caused it.",
      },
    ],
  },
  {
    title: "Plan management and time limits before entry",
    shortTitle: "Plan management and time limits before entry",
    blocks: [
      {
        type: "paragraph",
        children:
          "Define what happens if the idea neither hits its stop nor reaches its target within the observation window. A time exit, end-of-session close or overnight hold produces different financing and gap exposure. State whether partial closes or stop changes are allowed, and under which available-data conditions. Unwritten decisions made after a loss or a large gain are difficult to reproduce.",
      },
      {
        type: "example",
        title: "A savings goal needs a schedule",
        children: [
          "An Australian student sets a savings goal but also records expenses and when the money will be needed. The goal alone cannot supply income. A trade target likewise needs a holding rule, cost assumptions and a possible failure path; simply drawing a larger number is incomplete.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Moving a stop to the displayed entry is often called break-even, but commission, financing, the quote side and a worse fill can still create a cash loss. Taking part of a position off changes the remaining exposure and the distribution of possible outcomes. A platform’s netting or hedging mode can affect what modifications do, so verify the position list rather than trusting a button label.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Revenge entries, averaging into a loss, unplanned doubling and changing timeframe to keep a failed idea alive do not complete the original plan. Recalculate the whole account or pause under the personal policy. A target is not a debt the market owes you.",
        ],
      },
    ],
  },
  {
    title: "Read the checklist before a demo action",
    shortTitle: "Read the checklist before a demo action",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A complete pre-action checklist",
        columns: ["Check", "Written evidence"],
        rows: [
          [
            "Chart identity",
            "Pair/product, feed, price side, timeframe, timezone and cutoff",
          ],
          ["Context", "Dated structure facts and competing interpretations"],
          ["Condition", "Exact trigger occurred while reference was active"],
          ["Invalidation", "Price/time condition and availability rule"],
          [
            "Order",
            "Entry/exit type, side, trigger, allowed prices and expiry",
          ],
          [
            "Money",
            "Budget reference, contract, pip value, conversion, rounding and minimum",
          ],
          [
            "Costs",
            "One coherent spread convention; fees/financing and adverse-fill scenario",
          ],
          [
            "Account",
            "Existing and pending risk, shared currencies, daily/weekly gates and margin",
          ],
          [
            "Management",
            "Time exit, partial/stop-change rules and disconnection procedure",
          ],
          [
            "Decision",
            "Demo action or specific no-trade reason; rule version logged",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Read the checklist aloud or ask another learner to review it. If a required line is unknown, do not fill the space with “probably.” Find the contract information or record a skip. Check that the size and attached orders shown in the demo platform match the worksheet after submission; rejected or partially filled orders need explicit handling.",
      },
      {
        type: "example",
        title: "A checklist is a useful habit",
        children: [
          "A traveller in Japan checks passport, ticket and destination before leaving. That reduces avoidable mistakes but cannot promise that the flight will be on time. A trading checklist similarly improves process visibility without guaranteeing a market outcome.",
        ],
      },
    ],
  },
  {
    title: "Make no trade a complete recorded decision",
    shortTitle: "Make no trade a complete recorded decision",
    blocks: [
      {
        type: "paragraph",
        children:
          "No trade can mean the condition never occurred, a reference expired, the spread gate failed, a minimum size exceeded the budget, margin rules were unclear, a loss gate blocked new activity or the needed price data were unavailable. State which reason applies. A clear skip is more useful than inventing a substitute signal to avoid an empty journal.",
      },
      {
        type: "example",
        title: "One candidate, three different gates",
        children: [
          "A French learner records a valid EUR/USD close above a marked zone. The price-action condition is true. However, the weekly demo gate has already been reached, so a new demo action is blocked. The learner logs the chart candidate and the no-trade decision separately.",
          "Another candidate may pass the weekly gate but fail the execution-spread gate. A third might not produce a chart trigger at all. These are different outcomes and should not be merged into one unexplained “missed trade” category.",
        ],
      },
      {
        type: "paragraph",
        children:
          "After each observation, keep the original plan, data cutoff and reason. Review whether you followed the process before interpreting profits or losses. Later lessons will examine economic news, psychology and strategy testing; none removes the need to separate chart logic, execution logic and cash logic established here.",
      },
    ],
  },
  {
    title: "Practise the complete worksheet",
    shortTitle: "Practise the complete worksheet",
    blocks: [
      {
        type: "exercise",
        prompt:
          "For a valid EUR/USD long entry 1.1000, stop 1.0980 and target 1.1040, calculate distances and price-only ratio. If exit instead fills at 1.0975 at 0.05 lot, what is the price loss in USD?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Planned distances are 20 and 40 pips, giving 2:1. The adverse fill is 25 pips × US$0.50 per pip = US$12.50 before charges, not US$10. A proposed ratio is not a probability or maximum actual loss.",
      },
      {
        type: "exercise",
        prompt:
          "Under the table’s US$10 scenario gate, which of 0.05, 0.04 and 0.03 lot fits the 25-pip adverse fill plus US$7-per-lot round-trip fee?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "0.03 fits at US$7.71. The other totals are US$12.85 and US$10.28. This answer depends on the invented scenario; a larger gap or other costs could exceed it.",
      },
      {
        type: "exercise",
        prompt:
          "A USD/JPY long enters at ask 150.02; intended bid stop is 149.82 and target bid 150.42. What are the conventional-pip distances? What if exit bid is 149.70?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Distances are 20 and 40 pips because one conventional pip is 0.01 yen. The worse exit is 32 pips adverse. Cash depends on size, account conversion and charges.",
      },
      {
        type: "exercise",
        prompt:
          "A chart trigger is valid but your policy’s weekly gate has been reached. What is the completed decision?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No new demo action under that policy. Record the qualifying chart event and the blocked execution decision. Keep existing/pending exposure handling consistent with the written trigger procedure.",
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
          "Separate chart invalidation, stop instructions and planned cash risk.",
          "Calculate valid long/short distances, rounded sizing and worse-fill outcomes.",
          "Complete a cost-aware demo checklist and record valid no-trade decisions.",
        ],
        closing: [
          "Keep dated observations, interpretations, orders and actual outcomes in separate parts of your demo notebook. If a rule or unit is unclear, clarify it before collecting more examples.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices, fees and balances in this lesson are invented teaching data, not trade recommendations. Chart patterns, confirmation and checklists cannot guarantee price movement, fills or a maximum loss. Product terms, leverage, costs, conversion and gaps matter. Keep essential living money outside trading experiments.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can state the pair, source, price side, timeframe and data cutoff.",
          "I can repeat the example using only information available then.",
          "I can distinguish an observation, an interpretation and an execution outcome.",
          "I can explain an ambiguous case or a reason to skip.",
          "I can use the linked tools as arithmetic checks and state their limitations.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group — Proper Position Size",
            url: "https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size",
          },
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
        ],
      },
    ],
  },
];
