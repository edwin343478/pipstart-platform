import type { LessonSection } from "../../lesson-content";

export const useAnEconomicCalendarSafelySections: LessonSection[] = [
  {
    title: "Use the calendar to prepare, not to predict",
    shortTitle: "Use the calendar to prepare, not to predict",
    blocks: [
      {
        type: "paragraph",
        children:
          "An economic calendar organises scheduled releases and policy events. It can help you know when information is expected, which country or currency is involved and what comparisons need recording. It cannot tell you exactly what will be published, how quotes will move or whether an order will fill as intended. Unscheduled events can occur between calendar entries.",
      },
      {
        type: "example",
        title: "A timetable is useful without guaranteeing the journey",
        children: [
          "A commuter in South Korea checks a train timetable before leaving. The timetable helps planning, but delays and disruptions remain possible. An economic calendar plays a similar role: useful preparation without control over the outcome.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In this lesson, your main practice is observation or demo preparation. You will save a forecast before publication, read the actual and revisions carefully, check the clock and document spread changes. You do not need to place a trade to learn from a release.",
      },
      {
        type: "example",
        title: "A South African observation with no order",
        children: [
          "A learner in South Africa prepares a demo USD/ZAR observation around a scheduled US release. They verify the official event time, convert it for the actual date, save the forecast and prior, and observe bid and ask without placing a position or pending order. USD/ZAR is an observation example here; do not assume that the PipStart calculators support it. The later calculator exercises use supported EUR/USD so the units and tool inputs can be checked.",
        ],
      },
    ],
  },
  {
    title: "Start with the original publisher",
    shortTitle: "Start with the original publisher",
    blocks: [
      {
        type: "paragraph",
        children:
          "A third-party calendar is a convenient summary, but the issuing statistics agency or central bank is the primary source for the release, definitions and schedule. Check the publisher’s event page when timing or meaning matters. A calendar entry can be stale, shortened, delayed or corrected. Provider forecasts and impact ratings are separate from official data.",
      },
      {
        type: "comparisonTable",
        caption: "Sources and their roles",
        columns: ["Source", "Useful role", "Important limit"],
        rows: [
          [
            "Statistics agency",
            "Release, definitions, methodology, revisions and schedule",
            "Numbers may be provisional or later revised",
          ],
          [
            "Central bank",
            "Decision, statement, projections and event timetable",
            "Communication may contain several parts",
          ],
          [
            "Calendar provider",
            "Combined schedule and external forecasts",
            "Definitions, updates and impact labels vary",
          ],
          [
            "Your saved record",
            "What information was available before the event",
            "A later edited screenshot cannot recreate it",
          ],
        ],
      },
      {
        type: "example",
        title: "The shop notice and the delivery company",
        children: [
          "A French shop displays an estimated delivery day. The delivery company’s official tracking page shows the latest status. Both may be useful, but if they disagree, investigate the original information and timestamp rather than treating the shop’s older notice as definitive.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Identify the exact series, release frequency, unit and period. “Inflation” may refer to a monthly rate, annual rate, headline index or core measure. An employment event may contain multiple surveys and revisions. A title alone is not enough to compare the numbers.",
      },
    ],
  },
  {
    title: "Read every calendar field before the event",
    shortTitle: "Read every calendar field before the event",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A practical calendar record",
        columns: ["Field", "What to write"],
        rows: [
          ["Event", "Full series or decision name, publisher and source URL"],
          [
            "Economy/currency",
            "Country or area; relevant currency and the pair being observed",
          ],
          [
            "Scheduled time",
            "Date, source timezone and date-specific UTC offset",
          ],
          ["Measured period", "Month, quarter or other period covered"],
          [
            "Units",
            "Percent, percentage points, index, thousands or another unit",
          ],
          [
            "Previous",
            "Previously available value, vintage and revision status",
          ],
          [
            "Forecast",
            "Provider estimate saved before release, with timestamp",
          ],
          [
            "Actual",
            "Initially published value after release, with retrieval time",
          ],
          [
            "Related parts",
            "Components, revisions, statement or press conference",
          ],
          [
            "Observation",
            "Quote source/side, spreads, timestamps and limitations",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Previous can be revised at the same time the new actual arrives. Save the earlier prior before publication, then record the revised prior separately. Forecasts can change before the scheduled time and differ between providers. Without the saved estimate and its timestamp, an apparent surprise may be based on information that was not available beforehand.",
      },
      {
        type: "example",
        title: "Do not replace the old shopping list",
        children: [
          "A German family saves a grocery estimate before shopping, then records the receipt and a corrected old bill separately. Editing the estimate to match the receipt would hide the comparison. Keep the calendar’s pre-release and post-release records separate for the same reason.",
        ],
      },
    ],
  },
  {
    title: "Convert the time using the correct date and offset",
    shortTitle: "Convert the time using the correct date and offset",
    blocks: [
      {
        type: "paragraph",
        children:
          "A timezone name alone may not establish the UTC offset on the event date. Daylight-saving rules differ between countries and change the relationship during some weeks. Check the original schedule and date-specific offsets rather than assuming that two cities remain the same number of hours apart throughout the year.",
      },
      {
        type: "comparisonTable",
        caption: "Invented clock exercise with supplied offsets",
        columns: [
          "Source time and supplied offset",
          "UTC",
          "Learner at UTC+3",
          "Learner at UTC+2",
        ],
        rows: [
          ["08:30 at UTC−4", "12:30", "15:30", "14:30"],
          ["08:30 at UTC−5", "13:30", "16:30", "15:30"],
        ],
      },
      {
        type: "paragraph",
        children:
          "For a source offset of UTC−4, add four hours to get UTC, then add the destination offset. For UTC−5, add five hours first. These are invented same-date exercises with explicitly supplied offsets, not a statement of any current country’s release schedule. Real conversions also need the date, including possible movement to the previous or following day.",
      },
      {
        type: "example",
        title: "The family call moves by one hour",
        children: [
          "A family member in the United States changes to a different seasonal offset while a relative’s location keeps its offset. A call formerly made at one local time may shift by an hour. An event reminder needs the same date-aware check.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Check whether your calendar and chart platform use browser time, a selected timezone, server time or exchange/session time. Record all timestamps with an explicit offset where possible. A chart label that reads 08:30 is not enough to prove it refers to the calendar’s 08:30.",
      },
    ],
  },
  {
    title: "Treat impact labels as editorial hints",
    shortTitle: "Treat impact labels as editorial hints",
    blocks: [
      {
        type: "paragraph",
        children:
          "Calendar colours, stars or labels such as high impact are usually provider classifications. They are not probabilities of a move, guaranteed move sizes or a safety rating for an account. A supposedly minor release can matter in a particular context, while a highly anticipated event can produce a limited or complicated response.",
      },
      {
        type: "example",
        title: "A busy-store symbol does not predict your queue",
        children: [
          "A shopping app in Australia marks a store as usually busy. On one visit, the queue is short; on another, an unexpected issue makes it long. The label can guide preparation without predicting the exact experience. A calendar impact symbol deserves the same caution.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Read the provider’s definition when available. Use the label to prompt a closer look at timing, related events and account exposure. Do not size an order by the number of stars or assume an event has become harmless because a provider labels it low impact. Liquidity and product conditions remain separate questions.",
      },
    ],
  },
  {
    title: "Plan an observation window and related events",
    shortTitle: "Plan an observation window and related events",
    blocks: [
      {
        type: "paragraph",
        children:
          "A scheduled decision may be followed by a statement, projections, minutes at a later date or a press conference. Several statistics may be published at the same time. The first headline is not always the end of the information flow. Record the related timetable and allow the explanation to remain unsettled while other parts arrive.",
      },
      {
        type: "comparisonTable",
        caption: "Before, during and after an observation",
        columns: ["Stage", "Useful action", "What it does not guarantee"],
        rows: [
          [
            "Before",
            "Save schedule, forecast, prior, units and exposure notes",
            "The schedule or forecast cannot promise the actual",
          ],
          [
            "At publication",
            "Retrieve the original release and initial quotes",
            "Fast retrieval cannot ensure executable prices",
          ],
          [
            "During explanation",
            "Check components, revisions and related communication",
            "A first interpretation may change",
          ],
          [
            "After",
            "Keep dated observations, costs and unresolved questions",
            "A later chart cannot prove an earlier available signal",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Choose an observation window that matches your purpose and practical availability. There is no universal safe number of minutes before or after every event. A personal policy can specify a pause, conditions for resuming and how existing exposure is handled, but those conditions still cannot remove gaps or all uncertainty.",
      },
      {
        type: "example",
        title: "The school meeting has more than an opening sentence",
        children: [
          "Parents in Canada hear an opening announcement and then a detailed explanation at a school meeting. Leaving after the first sentence can miss important conditions. A policy press conference can similarly add context after the initial decision.",
        ],
      },
      {
        type: "paragraph",
        children:
          "The schedule also leaves gaps. Elections, conflict, sanctions, disasters and unexpected policy changes can alter prices, payment routes and confidence outside a calendar entry. Verify the original facts and timestamp; an early headline can be incomplete or corrected. Treat human suffering respectfully and allow “I do not know.” A preparation policy needs an action for unexpected events as well as scheduled ones.",
      },
    ],
  },
  {
    title: "Read the surprise, revisions and components together",
    shortTitle: "Read the surprise, revisions and components together",
    blocks: [
      {
        type: "paragraph",
        children:
          "Subtract the saved forecast from the actual using the same series, unit and period. A positive difference means actual is numerically above that particular forecast; it does not mean the news is good, the currency must rise or a position should be opened. The economic meaning depends on the variable and the wider context.",
      },
      {
        type: "example",
        title: "The sign depends on the question",
        children: [
          "For an invented payroll estimate, actual 190 thousand minus forecast 150 thousand is +40 thousand. If the forecast was 220 thousand, the same actual gives −30 thousand. For an unemployment rate, a larger actual may indicate a different kind of economic change. A positive arithmetic surprise is not a universal positive economic signal.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Read revised prior values, core or component measures and any caveats. GDP, employment and inflation releases contain details that a one-line calendar may omit. Avoid mixing a monthly rate with an annual rate or one survey’s job count with another survey’s population estimate. Save the source version so a later revision is not mistaken for the initially released value.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not turn a release comparison into a guaranteed entry rule. Price may already reflect expectations, respond to other components, move in both directions or be dominated by another event.",
        ],
      },
    ],
  },
  {
    title: "Distinguish midpoint movement from an executable result",
    shortTitle: "Distinguish midpoint movement from an executable result",
    blocks: [
      {
        type: "paragraph",
        children:
          "A displayed midpoint or chart move is not the same as the prices available for buying and selling. Under the conventional quote, a buyer pays the ask and a seller receives the bid. The spread is ask minus bid. A widening spread can make a visually favourable movement produce little or no executable gain.",
      },
      {
        type: "comparisonTable",
        caption: "Invented EUR/USD quotes, one conventional pip = 0.0001",
        columns: ["Moment", "Bid", "Ask", "Midpoint", "Spread"],
        rows: [
          ["Before release", "1.0999", "1.1001", "1.1000", "2 pips"],
          ["Later observation", "1.1001", "1.1009", "1.1005", "8 pips"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The midpoint rose by 5 pips. A hypothetical long bought at the first ask 1.1001 and sold at the later bid 1.1001 has zero price gain before charges. A new buy at the later ask 1.1009, immediately sold at the same observed bid 1.1001, has an 8-pip price loss. These are different actions; neither equals the midpoint’s 5-pip rise.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-7/spread-and-midpoint.svg",
        desktopSrc:
          "/images/lessons/forex/level-7/spread-and-midpoint-desktop.svg",
        width: 720,
        height: 400,
        alt: "Before and after EUR/USD quote cards show a 5-pip midpoint rise while the spread widens from 2 to 8 pips.",
        caption:
          "Use the native quote table for exact values. A midpoint move is not an executable profit; actual fills and charges may differ.",
      },
      {
        type: "learningLink",
        title: "Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "For supported EUR/USD, a USD account, conversion 1 and 0.01 lot, a conventional pip is about US$0.10 under the tool’s contract assumptions. The 8-pip immediate-exit example is therefore a US$0.80 price loss before charges. The calculator does not forecast spread changes or guarantee a fill.",
      },
      {
        type: "paragraph",
        children:
          "A bid-only chart may not show the ask involved in an entry or stop condition. Quote snapshots are not promises that an order could have filled for the displayed size at that moment. Record product, feed, side and timestamps, and keep spread widening, slippage and gaps as separate concepts.",
      },
    ],
  },
  {
    title: "Check existing positions and pending orders",
    shortTitle: "Check existing positions and pending orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "Before observing an event, list relevant open positions, pending entries and attached exits. Check shared currencies, minimum sizes, available margin, expected financing and the handling of rejected or partially filled orders. A pending order can become new exposure during a fast move, so an empty open-position list does not necessarily mean no potential exposure.",
      },
      {
        type: "example",
        title: "Two delivery orders can arrive together",
        children: [
          "A UK household has not yet received two purchases, but both pending orders can become payments on the same day. Likewise, pending trading orders deserve attention even before they become open positions. Shared currency exposure can make several activations relevant to the same event.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A stop order is an instruction subject to product and execution rules, not a universal promise of the specified price. Spreads, gaps, available liquidity and broker trigger conventions can affect the outcome. A stop-limit order may fail to execute beyond its limit. Review the contract rather than replacing these details with “my stop protects me.”",
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Use a supported pair to check a stated planned stop distance, account balance and risk percentage under the tool’s assumptions. Then separately inspect adverse-fill distances, costs, size increments and existing exposure. A calculator’s planned amount is not a guaranteed maximum event loss.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not increase size to recover a missed first move or assume that a strong forecast permits higher leverage. An unclear product rule, failed account gate or unreliable data can justify a documented skip.",
        ],
      },
    ],
  },
  {
    title: "Write a pause policy without inventing a safe interval",
    shortTitle: "Write a pause policy without inventing a safe interval",
    blocks: [
      {
        type: "paragraph",
        children:
          "A personal observation or demo policy can say when new orders are paused, which conditions must be checked before resuming and how existing orders are handled. Define the trigger and action precisely. A policy that mentions only “avoid big news” leaves the event list, timing and required checks unclear.",
      },
      {
        type: "comparisonTable",
        caption: "An example policy template to personalise",
        columns: ["Item", "What needs a written decision"],
        rows: [
          ["Events", "Named releases and related communications to watch"],
          [
            "Before",
            "When to review exposure and whether new demo entries pause",
          ],
          [
            "Existing orders",
            "Product-specific procedure for positions and pending orders",
          ],
          [
            "Resume checks",
            "Reliable release, stable data, stated spread gate and account gates",
          ],
          [
            "Unknowns",
            "Action when schedule, quotes, conversion or terms are unclear",
          ],
          ["Record", "Version, timestamp, decision and any deviation"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This is a template, not a universal trading recommendation. Cancelling or modifying an order can fail, arrive late or alter exposure; do not assume that clicking a control completed the action. Check the platform’s confirmation and current position/order list. If you choose observation only, record that choice explicitly and do not convert the exercise into a live trade.",
      },
      {
        type: "example",
        title: "Waiting for visibility is a valid decision",
        children: [
          "A Japanese traveller pauses a journey when visibility is poor and checks conditions again before leaving. The pause is a decision with a reason. A learner can likewise record “observation only because spread or information conditions remain unclear.”",
        ],
      },
    ],
  },
  {
    title: "Keep a fair before-and-after journal",
    shortTitle: "Keep a fair before-and-after journal",
    blocks: [
      {
        type: "paragraph",
        children:
          "Save the pre-release schedule, forecast, prior, plan and quote snapshot before seeing the actual. After publication, add the original release link, initial actual, revisions, quotes and any platform outcomes. Keep the original entries intact. A later edited calendar may contain revised data and cannot prove what was known at the earlier moment.",
      },
      {
        type: "example",
        title: "The weather forecast stays in the notebook",
        children: [
          "A family in South Africa saves a weather forecast before planning a picnic, then records what happened. Replacing the saved forecast with the observed weather would make the forecast look perfect. An economic-event journal needs the same protection from hindsight.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Include quiet events, contradictory reactions and skipped observations rather than only dramatic examples. Describe observations separately from explanations: “midpoint rose, spread widened, no order was placed” is different from “policy caused every move.” If the feed or release timing was uncertain, write that limitation rather than inventing precision.",
      },
      {
        type: "paragraph",
        children:
          "A review asks whether the preparation, units and process were correct before judging the outcome. One profitable or losing event does not validate or disprove a complete method. Later strategy lessons will add structured testing; this beginner exercise builds reliable records first.",
      },
    ],
  },
  {
    title: "Practise a complete calendar observation",
    shortTitle: "Practise a complete calendar observation",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A fictional event is at 08:30 with a supplied source offset UTC−4. What are UTC and local time at UTC+3? What if the source offset is UTC−5?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "UTC−4 gives 12:30 UTC and 15:30 at UTC+3. UTC−5 gives 13:30 UTC and 16:30 at UTC+3. Check the date-specific real offsets and possible date rollover when using an actual schedule.",
      },
      {
        type: "exercise",
        prompt:
          "Using the quote table, the midpoint rises 5 pips. What is the price result of buying at the first ask and selling at the later bid?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Zero price gain: 1.1001 to 1.1001. Charges can make the cash result negative. The midpoint rise is not the executable long result.",
      },
      {
        type: "exercise",
        prompt:
          "Buying at the later ask 1.1009 and immediately selling at bid 1.1001 loses how many pips? At 0.01 lot and US$0.10 per pip, what is the price loss?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "8 conventional pips, or US$0.80 before charges under the stated contract and conversion assumptions. An actual fill could differ.",
      },
      {
        type: "exercise",
        prompt:
          "A calendar labels an event low impact, but the release definition and current quote side are unclear. Is the label enough to proceed?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Clarify the series, time, units, source and execution assumptions, or record observation only/a skip under the policy. A provider’s label is not a safety guarantee.",
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
          "Prepare a source-verified calendar record with date-aware time conversion.",
          "Compare saved forecasts, actuals and revisions without hindsight.",
          "Check spreads, pending exposure and pause conditions in an observation or demo exercise.",
        ],
        closing: [
          "Keep the source, units, observation time and saved expectations in your notebook. Describe possible explanations without presenting them as certain causes or trading signals.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All numerical examples are invented teaching scenarios, not forecasts or trade recommendations. News, policy, calendars and relationships cannot guarantee price direction, execution or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential living money outside trading experiments.",
      },
      {
        type: "keyPoint",
        title: "Before you mark this lesson complete",
        points: [
          "I can name the source, series, period, unit and timestamp.",
          "I can distinguish a fact, an expectation and an interpretation.",
          "I can repeat the arithmetic and explain its assumptions.",
          "I can state an alternative explanation or an unresolved question.",
          "I can use the highlighted tools as arithmetic checks and explain their limits.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "BLS — Employment Situation release schedule",
            url: "https://www.bls.gov/schedule/news_release/empsit.htm",
          },
          {
            title: "BLS — Current Employment Statistics FAQ",
            url: "https://www.bls.gov/web/empsit/cesfaq.htm",
          },
          {
            title: "BLS — Consumer Price Index FAQ",
            url: "https://www.bls.gov/cpi/questions-and-answers.htm",
          },
          {
            title: "BEA — Gross Domestic Product learning guide",
            url: "https://www.bea.gov/resources/learning-center/what-to-know-gdp",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
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
