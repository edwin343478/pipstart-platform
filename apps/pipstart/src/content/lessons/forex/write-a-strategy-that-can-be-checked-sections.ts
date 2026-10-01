import type { LessonSection } from "../../lesson-content";

export const writeAStrategyThatCanBeCheckedSections: LessonSection[] = [
  {
    title: "Treat a strategy as a hypothesis with instructions",
    shortTitle: "Treat a strategy as a hypothesis with instructions",
    blocks: [
      {
        type: "paragraph",
        children:
          "A trading strategy is a set of rules describing what to observe, when an action is eligible, how exposure is limited and how the action ends. “Buy when it looks good” is an opinion, not a specification someone else can apply. A useful strategy document tells another learner how to classify a new date using the same available information.",
      },
      {
        type: "paragraph",
        children:
          "The document is a hypothesis: you think particular conditions may produce a useful result under stated costs and constraints. Writing the conditions clearly makes them testable; it does not establish a profitable edge. Keep observation-only work, simulated historical results and demo order rehearsal distinct. None requires you to deposit money or open a live position.",
      },
      {
        type: "example",
        title: "The cooking recipe",
        children: [
          "A cook in Italy writes ingredients, quantities, temperature and timing. Another cook can repeat the instructions and record what happened. “Cook until it is wonderful” leaves too much unstated. A Forex rule needs equivalent detail about data, decisions and costs.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This lesson uses invented rules and prices to teach specification, not to recommend a breakout or moving-average method. The next two lessons examine how to test such a document and describe its results honestly. If a term is unclear, clarify it before treating a chart as an eligible trade.",
      },
    ],
  },
  {
    title: "Choose a holding style that fits ordinary life",
    shortTitle: "Choose a holding style that fits ordinary life",
    blocks: [
      {
        type: "paragraph",
        children:
          "Scalping usually describes very short intraday holding periods seeking small movements. Day trading generally closes exposure within the defined day or session. Swing trading may hold across several days, and position trading may hold longer. These labels vary between educators; define the actual holding and session rules rather than relying only on the name.",
      },
      {
        type: "comparisonTable",
        caption: "Holding horizons and practical questions",
        columns: ["Style description", "What needs checking"],
        rows: [
          [
            "Very short intraday",
            "Spread/fees relative to small movement, available attention and quote quality",
          ],
          [
            "Within the session",
            "Exact session boundary, entry cutoff and procedure for closing or failed closure",
          ],
          [
            "Across days",
            "Financing, overnight/weekend gaps, event exposure and availability",
          ],
          [
            "Longer holding",
            "Broader conditions, changing product costs, account exposure and review schedule",
          ],
        ],
      },
      {
        type: "example",
        title: "The worker cannot watch every minute",
        children: [
          "A worker in Japan has two reliable evening study slots. A daily-chart observation task may fit better than promising to watch minute-by-minute moves during work. That is a practical choice, not evidence that a daily method earns more.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Screen time is not the same as holding time. A daily signal can create a position needing handling while the learner is unavailable. Specify who or what monitors required conditions, what instructions exist on the platform and what happens when the connection fails. Automated orders have product-specific limitations and do not remove all gaps or operational risk.",
      },
      {
        type: "paragraph",
        children:
          "There is no ladder in which a shorter or longer style automatically means higher skill or profit. Choose a scope that you can observe and document, then investigate its costs and risks. If it does not fit life, an observation-only project or no active trading can be a reasonable course outcome.",
      },
    ],
  },
  {
    title: "Fix the market and the study scope before selection",
    shortTitle: "Fix the market and the study scope before selection",
    blocks: [
      {
        type: "paragraph",
        children:
          "Name the pair, product, provider, date range and eligibility window before searching for attractive examples. EUR/CAD, EUR/USD and USD/JPY have different quote currencies and may have different spreads, activity and product terms. A chart from one provider is not automatically an execution record for another. Specify the universe of observations from which candidates may be selected.",
      },
      {
        type: "example",
        title: "One sunny garden is not every garden",
        children: [
          "A gardener in Canada tests a plant in one sunny patch. That does not establish how it grows in another soil or season. A strategy checked only on a chosen favourable chart also has a limited scope. Keep the dates and conditions in the report.",
        ],
      },
      {
        type: "paragraph",
        children:
          "State whether the study includes only long candidates, both directions or observation events without orders. Define permitted weekdays or sessions, how holidays and missing observations are handled and whether a position already open blocks another entry. Avoid switching to the pair that happened to produce the best result after seeing the evaluation data.",
      },
      {
        type: "comparisonTable",
        caption: "Scope fields",
        columns: ["Field", "What another learner needs"],
        rows: [
          [
            "Instrument/product",
            "Exact pair, contract assumptions and provider",
          ],
          [
            "Population",
            "Dates and chart observations eligible for examination",
          ],
          ["Direction", "Long, short or both under separate stated conditions"],
          ["Holding", "Exit rules and maximum holding/time boundary"],
          [
            "Capacity",
            "One position or multiple; shared-currency and pending-order gates",
          ],
          [
            "Exceptions",
            "Holidays, missing data, news and operational interruptions",
          ],
        ],
      },
    ],
  },
  {
    title: "Specify the data, price side and observation clock",
    shortTitle: "Specify the data, price side and observation clock",
    blocks: [
      {
        type: "paragraph",
        children:
          "Record the timeframe, session timezone, completed-bar rule, source and price side. A bid candle, ask candle and midpoint candle are different inputs. A daily bar’s boundary may differ across providers. Specify the latest information that exists when a condition is checked, and do not use the later completed close of a bar still forming.",
      },
      {
        type: "example",
        title: "Two clocks, two descriptions",
        children: [
          "A family in Germany and a relative in the United States arrange a call with a date and timezone. “Call at eight” is incomplete without the clock. “Enter after the daily close” is similarly incomplete without the provider’s session boundary and the next permitted decision time.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A historical chart may have revised data, missing quotes or retrospective markers. If the rule uses an indicator, state its settings, input field, smoothing, warm-up and when its value is available. A confirmed swing may require later bars. The chart timestamp and the time when a signal becomes usable are not always the same.",
      },
      {
        type: "paragraph",
        children:
          "For the classroom example below, the source is a named teaching series of completed daily bid bars. Five earlier completed highs define the reference. The sixth bar’s completed bid close is checked only after it exists. A later bid/ask snapshot illustrates a possible entry comparison. All prices are invented; the snapshot cannot prove available liquidity or a real fill.",
      },
    ],
  },
  {
    title: "Define the reference window without including the signal bar",
    shortTitle: "Define the reference window without including the signal bar",
    blocks: [
      {
        type: "paragraph",
        children:
          "A setup describes context; a trigger is the precise condition that completes eligibility. Here the reference is the highest high among exactly five completed daily bid bars immediately before the current bar. The current bar is excluded from that lookback. The trigger asks whether its completed bid close is strictly greater than the stored reference.",
      },
      {
        type: "comparisonTable",
        caption: "Invented EUR/CAD prior-five-bar reference",
        columns: ["Prior bar", "Completed bid high"],
        rows: [
          ["D1", "1.4590"],
          ["D2", "1.4610"],
          ["D3", "1.4600"],
          ["D4", "1.4620"],
          ["D5", "1.4615"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The maximum is 1.4620. Store the five observations and the reference before classifying D6. If D6 later closes at 1.4630, the strict comparison is true. If it closes at exactly 1.4620, it is false. A rule allowing equality or using the current high would be a different rule version.",
      },
      {
        type: "example",
        title: "Yesterday’s record must be fixed first",
        children: [
          "A learner in Australia compares today’s walk with the longest of the previous five walks. Including today while claiming the comparison used only earlier walks changes the question. The reference window on a chart needs the same clarity.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-9/reference-and-trigger.svg",
        desktopSrc:
          "/images/lessons/forex/level-9/reference-and-trigger-desktop.svg",
        width: 720,
        height: 400,
        alt: "Five invented EUR/CAD bid highs create a 1.4620 reference; a later completed bid close at 1.4630 exceeds it.",
        caption:
          "The current signal bar is excluded from the prior-five-bar maximum. A qualifying close is an observation, not a guaranteed fill or favourable next move.",
      },
    ],
  },
  {
    title: "Make trigger, expiry and re-entry separate conditions",
    shortTitle: "Make trigger, expiry and re-entry separate conditions",
    blocks: [
      {
        type: "paragraph",
        children:
          "A complete rule specifies when the setup starts, how long its trigger remains usable and when it expires. A close-based trigger cannot be acted on earlier in the same bar. “Breakout” should not mean either a wick or a completed close depending on which later result looks better. Fix the crossing, equality and confirmation rules beforehand.",
      },
      {
        type: "example",
        title: "The ticket has an expiry",
        children: [
          "A passenger in France has a ticket valid for a specified journey. An expired ticket does not become valid because a later train looks attractive. A trading candidate also needs a time window; a missed condition is not permanent permission to enter.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In this teaching specification, D6’s qualifying close produces one candidate for the first recorded bid/ask snapshot after that close. If the required snapshot is missing or an entry gate fails, the candidate is skipped; no later quote is substituted to make it work. This is a deliberately narrow research rule, not a claim that one-snapshot validity is best for trading.",
      },
      {
        type: "paragraph",
        children:
          "If an earlier position is still open, the stated one-position rule blocks a new entry. A later re-entry needs a fresh candidate under the same definition; a previous gain or loss does not authorise it. Specify whether the reference rolls on the next completed bar and how the study avoids duplicating the same event in several records.",
      },
    ],
  },
  {
    title: "Separate entry permission from order execution",
    shortTitle: "Separate entry permission from order execution",
    blocks: [
      {
        type: "paragraph",
        children:
          "The entry rule checks a quote available after the completed signal. An order type then determines the instruction sent to the product or platform. For a conventional long, the ask is the relevant purchase side. A market order requests execution at available prices; the observed ask is not a promise that it will be filled there. A limit order adds a price constraint but may remain unfilled.",
      },
      {
        type: "comparisonTable",
        caption: "Invented post-close entry snapshot",
        columns: ["Field", "Value or condition"],
        rows: [
          ["Signal reference", "1.4620; completed bid close 1.4630"],
          ["Next recorded bid", "1.4630"],
          ["Next recorded ask", "1.4632"],
          ["Observed spread", "2 conventional pips"],
          ["Teaching spread gate", "No more than 3 pips"],
          ["Teaching ask ceiling", "No more than 1.4633"],
          [
            "State",
            "Quote gates pass; fill remains an assumption or later platform fact",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The gates pass for this snapshot. For a simple historical calculation, the study may explicitly assume entry at 1.4632 and label the result simulated. For a demo market-order rehearsal, record the actual accepted status and fill; it may differ. If the intention is a price-capped limit order, write its price, lifetime and unfilled/cancellation handling as a separate execution model.",
      },
      {
        type: "paragraph",
        children:
          "A quote can change between the check and submission. Do not describe a pre-order ceiling check as a guarantee of the final market-order price. If the simulation lacks size/liquidity or sequence data, state that limitation. Changing order type after viewing outcomes blends different strategies and execution assumptions.",
      },
    ],
  },
  {
    title: "Write stop, target and time exits explicitly",
    shortTitle: "Write stop, target and time exits explicitly",
    blocks: [
      {
        type: "paragraph",
        children:
          "State the invalidation idea, protective order instruction and any time exit separately. A chart-close invalidation can occur at a different time from an intrabar stop trigger. For the teaching long entered at ask 1.4632, a hypothetical bid-side stop level of 1.4612 is 20 conventional pips away, and a bid-side target of 1.4672 is 40 pips away.",
      },
      {
        type: "learningLink",
        title: "Risk-to-Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Enter long, entry 1.4632, stop 1.4612 and target 1.4672. The price-distance ratio is 2:1. It does not estimate win probability, include every cost or guarantee that either exit is available.",
      },
      {
        type: "paragraph",
        children:
          "Define which event exits first: stop, target, maximum holding period or another specified condition. Our teaching example ends at the first applicable stop/target event, or at the bid close of the third completed daily bar after the entry if neither event is identified sooner. A bar touching both levels without sequence information is ambiguous and handled under the disclosed test policy in the next lesson.",
      },
      {
        type: "paragraph",
        children:
          "Ordinary stop orders can fill worse than the trigger price. Limit exits may not fill merely because a chart touches their price. A stop-limit can remain unfilled beyond its limit. Trailing or partial-close rules require additional definitions about activation, quote side, size and fees. Do not insert them into a losing historical case just to improve its score.",
      },
      {
        type: "example",
        title: "The school trip needs a return plan",
        children: [
          "A school in India lists departure, destination, fare and what to do if transport is delayed. A position plan likewise needs more than an entry. A time exit should name the clock and failed-closure procedure instead of simply saying “close later.”",
        ],
      },
    ],
  },
  {
    title: "Connect size, costs and combined exposure",
    shortTitle: "Connect size, costs and combined exposure",
    blocks: [
      {
        type: "paragraph",
        children:
          "Size belongs in the specification before the result. Name the account currency, balance/equity reference, budget, stop distance, contract, account conversion, volume increment and minimum. Then include charges, financing and worse-fill scenarios consistently. A planned price-risk calculation is not a guaranteed maximum loss.",
      },
      {
        type: "example",
        title: "The Canadian worksheet",
        children: [
          "A learner in Canada uses an invented C$1,000 demo reference, 1% planned price risk, EUR/CAD and a 20-pip stop distance. With a conventional 100,000-unit contract and conversion 1 from CAD quote currency to CAD account currency, 0.05 lot corresponds to C$0.50 per pip and C$10 planned price loss. The percentage is a teaching input, not a universal safe limit.",
        ],
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Use supported EUR/CAD, balance 1,000, risk 1%, stop distance 20, CAD account and conversion 1. The tool returns 0.05 lot under its assumptions. Check fees, financing, size increments, minimum volume, adverse fills, available margin and total account exposure separately.",
      },
      {
        type: "paragraph",
        children:
          "If an invented separate C$0.50 fee is charged on that completed case, a stop filled exactly at 1.4612 makes the net loss C$10.50, before any other costs. If the same exit fills at 1.4607, the 25-pip price loss is C$12.50 and the separate fee makes C$13. The worksheet must state which scenario its gate actually checks.",
      },
      {
        type: "paragraph",
        children:
          "Several positions can share a currency, and pending orders can add exposure. A per-case calculation does not replace daily/weekly gates or a combined account worksheet. If rounding or minimum size makes the action exceed the stated gate, record no entry under the policy rather than changing the budget until the platform allows it.",
      },
    ],
  },
  {
    title: "Define filters before searching for a better score",
    shortTitle: "Define filters before searching for a better score",
    blocks: [
      {
        type: "paragraph",
        children:
          "A filter excludes circumstances outside the intended scope, such as a spread above a declared threshold, an unavailable quote or a specified scheduled-news window. Write the measurement, boundary, timing and action for each filter. “Avoid bad conditions” is too vague for another learner to reproduce.",
      },
      {
        type: "example",
        title: "The marking scheme stays fixed",
        children: [
          "A student in the United Kingdom keeps changing a quiz’s marking rules after seeing their answers. Eventually the score looks excellent, but it no longer measures the original test. Adding historical filters only to remove losses creates a similar problem.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Filter definition checklist",
        columns: ["Filter", "Definition needed"],
        rows: [
          [
            "Spread",
            "Bid/ask source, pip unit, threshold, equality and observation time",
          ],
          [
            "News",
            "Named releases, verified date/timezone, exclusion window and related events",
          ],
          ["Session", "Provider clock, start/end and candidate expiry"],
          ["Data", "Missing, stale, duplicate or disputed input handling"],
          ["Account", "Existing/pending exposure, margin and loss gates"],
          [
            "Availability",
            "What happens when the learner cannot complete required checks",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A news window is a predeclared teaching-policy choice, not a universally safe interval. Unscheduled events remain possible. A spread filter can discard an otherwise valid chart candidate, so keep both candidate eligibility and the execution skip reason. Do not erase the event from the denominator simply because the quote gate failed.",
      },
      {
        type: "paragraph",
        children:
          "Each additional filter is another decision that might be fitted to old data. Keep the number of settings and tried variants in the development log. A simpler rule with documented limitations is easier to evaluate than a complicated rule whose exclusions were chosen after every loss.",
      },
    ],
  },
  {
    title: "Assemble one complete teaching specification",
    shortTitle: "Assemble one complete teaching specification",
    blocks: [
      {
        type: "comparisonTable",
        caption: "EUR/CAD daily-close research version 1",
        columns: ["Part", "Explicit classroom instruction"],
        rows: [
          [
            "Scope",
            "Named invented daily bid series; long candidates only; one simulated position at a time",
          ],
          [
            "Reference",
            "Maximum of the previous five completed bid-bar highs; exclude current bar",
          ],
          [
            "Trigger",
            "Current completed bid close strictly above the stored reference",
          ],
          [
            "Availability",
            "Only after that close; first next recorded bid/ask snapshot",
          ],
          [
            "Quote gates",
            "Spread ≤3 pips and ask ≤signal close +3 pips; unknown input means skip",
          ],
          [
            "Entry model",
            "Historical assumed fill at that next ask, disclosed as simulated; demo fills recorded separately",
          ],
          [
            "Stop/target",
            "From assumed entry: stop bid 20 pips below, target bid 40 pips above",
          ],
          [
            "Time exit",
            "Bid close of third completed daily bar after entry if no earlier resolved exit",
          ],
          [
            "Ambiguity",
            "Both stop/target touched with unknown order: retain ambiguous classification and disclose chosen scenario policy",
          ],
          [
            "Size/account",
            "CAD account, defined reference/budget, volume rounding/minimum and combined gates",
          ],
          [
            "Costs",
            "Quote-side price result plus separate stated fees/financing; adverse-fill scenarios reported",
          ],
          [
            "Study record",
            "Dates/cutoffs, all candidates/skips, status, prices, costs, rule version and reasons",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "This card joins the conditions into one document. It still needs the named data file, date range, calendar-filter choice and exact account-gate definitions before a complete study can run. Those inputs belong beside the card; do not leave them to be chosen after seeing results. A compact card and an attached assumptions sheet can work together.",
      },
      {
        type: "paragraph",
        children:
          "Another example can use an invented five-period and twenty-period moving-average cross on completed EUR/USD daily closes. It must define the average type, warm-up, crossing/equality rule, next available entry, exits, costs and gates just as carefully. An indicator name alone does not replace the specification. Neither example is an endorsement.",
      },
    ],
  },
  {
    title: "Let another learner reproduce the rules and log changes",
    shortTitle: "Let another learner reproduce the rules and log changes",
    blocks: [
      {
        type: "paragraph",
        children:
          "Give the rule and a dated input set to another learner without showing the results. Compare their eligible dates and skip reasons with yours. A disagreement may reveal an unclear equality rule, timezone, warm-up period, quote side or handling of missing data. Correct definitions before drawing conclusions from a score.",
      },
      {
        type: "example",
        title: "Two Canadian readers disagree",
        children: [
          "Two learners in Canada examine the same EUR/CAD record. One uses the signal bar’s high in the five-bar maximum; the other uses only the five prior bars. Their different candidates expose an input-definition problem. The correction is to make the window explicit, not to keep whichever result earns more.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Keep a version log with the change, reason, date and information already viewed. A factual correction and a new trading rule are different. If you change a filter after seeing July, that July sample has influenced development of the new version. Do not report it as untouched evidence for that version.",
      },
      {
        type: "paragraph",
        children:
          "The first milestone is reproducibility: another person can apply the instructions and account for unresolved cases. Reproducibility does not imply profitability. The next lesson adds a fair test sequence, including a reserved period and new demo observations, so a clear recipe is not mistaken for a proven method.",
      },
    ],
  },
  {
    title: "Practise a complete rule comparison",
    shortTitle: "Practise a complete rule comparison",
    blocks: [
      {
        type: "exercise",
        prompt:
          "The five prior EUR/CAD bid highs are 1.4590, 1.4610, 1.4600, 1.4620 and 1.4615. What is the reference? Does a close exactly at it meet a strictly-above trigger?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The maximum is 1.4620. Equality does not meet strictly above. A completed close at 1.4630 does; it becomes available only after that bar completes.",
      },
      {
        type: "exercise",
        prompt:
          "After a signal close of 1.4630, bid/ask is 1.4630/1.4632. Do spread ≤3 pips and ask ≤1.4633 pass? Does that guarantee a fill?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The spread is 2 pips and ask is below the ceiling, so these quote gates pass. Actual order permission still needs other gates, and the snapshot cannot guarantee a fill.",
      },
      {
        type: "exercise",
        prompt:
          "A simulated long enters at 1.4632, has stop 1.4612 and target 1.4672. What are the price distances and ratio?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "20 and 40 conventional pips, giving 2:1 before costs and execution differences. The ratio is not a probability.",
      },
      {
        type: "exercise",
        prompt:
          "At 0.05 lot in the stated CAD account, exit is 1.4607 and a separate C$0.50 charge applies. What is the net loss?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "25 pips × C$0.50 = C$12.50 price loss, plus C$0.50 charge = C$13. This adverse scenario does not bound every possible gap.",
      },
      {
        type: "exercise",
        prompt:
          "An otherwise eligible candidate has a missing next ask. May the study choose a later attractive quote silently?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Apply the predeclared missing-data/expiry rule and record the skip or unresolved status. A later substitute changes the test and must be disclosed as a different assumption or version.",
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
          "Specify market, data, trigger, entry, exits, size and skip rules another learner can reproduce.",
          "Separate chart eligibility, executable-order assumptions and account gates.",
          "Calculate a complete quote-side risk scenario and preserve method versions.",
        ],
        closing: [
          "Keep the frozen rules, original inputs, all candidates, costs, uncertainties and ledger. State what the evidence describes without treating it as a promise of future performance.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices, balances, periods, thresholds and results are invented teaching data, not trade recommendations or universal safe limits. Historical simulation, demo results and clear rules cannot guarantee profit, exact fills or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential money outside trading experiments. A quiz pass does not certify live-trading readiness.",
      },
      {
        type: "keyPoint",
        title: "Before you mark this lesson complete",
        points: [
          "I can name the rule version, product, inputs, timeframe and information cutoff.",
          "I can separate observation, assumed execution and actual platform outcomes.",
          "I can repeat the calculation with its units, costs and denominator.",
          "I can keep skips, ambiguous cases, losses and revisions visible.",
          "I can explain an evidence limitation and a valid no-action or further-study decision.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group — Trading Strategies in Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/trading-strategies-in-your-trade-plan",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
          {
            title: "CME Group — Proper Position Size",
            url: "https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size",
          },
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
          },
        ],
      },
    ],
  },
];
