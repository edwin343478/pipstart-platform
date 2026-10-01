import type { LessonSection } from "../../lesson-content";

export const buildATestableObservationSections: LessonSection[] = [
  {
    title: "Turn an impression into an observable condition",
    shortTitle: "Turn an impression into an observable condition",
    blocks: [
      {
        type: "paragraph",
        children:
          "A testable observation is a condition someone else can check using the same information you had at the same time. “It looks ready to rise” is not enough. Name the pair and product, price series, timeframe, cutoff, reference area, trigger, expiry and what result will be recorded. You can test an observation without placing an order.",
      },
      {
        type: "example",
        title: "The picnic plan needs a condition",
        children: [
          "A family in Canada wants to picnic on Saturday. “Go if the weather is good” leaves room for disagreement. “Check the forecast at 08:00, use this location, and cancel if rain is predicted during 12:00–15:00” is clearer. The plan can still be wrong about the weather, but its decision rule is now reproducible.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Level 1 explained the market, Level 3 taught chart records, Level 4 showed calculations and Level 5 set cash boundaries. A price-action idea must fit all of those foundations. A rule that can be repeated is not automatically useful or profitable. This lesson first makes the observation measurable; the following lesson connects it to a demo exit and cost-aware checklist.",
      },
    ],
  },
  {
    title: "Define a zone from data available then",
    shortTitle: "Define a zone from data available then",
    blocks: [
      {
        type: "paragraph",
        children:
          "A supply or demand zone is usually an area inferred from earlier price behaviour. A demand label suggests an earlier upward reaction, and a supply label an earlier downward reaction, under the method being used. There is no universally agreed candle selection or boundary rule. Fix yours before testing. The rectangle is an annotated reference, not a visible store of guaranteed future orders.",
      },
      {
        type: "example",
        title: "Yesterday’s queue does not reserve today’s customers",
        children: [
          "A fruit seller in India sees shoppers gather near a stall one afternoon. Drawing that corner on a map records where buying seemed active. It does not prove that the same customers, money or stock will be there tomorrow. A past price reaction also needs a future observation before it can support a new interpretation.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Specify the rectangle, not just its colour",
        columns: ["Field", "Teaching-rule choice"],
        rows: [
          [
            "Anchor selection",
            "A specified completed bar Z at the predeclared sample cutoff",
          ],
          ["Price side", "The named demo feed’s bid bars"],
          ["Lower/upper boundary", "Z’s low 1.0980 and high 1.1000"],
          ["Creation time", "Only after Z has completed"],
          ["Touch", "A later completed bar intersects that interval"],
          [
            "Discard condition",
            "A later completed bid close strictly below 1.0980",
          ],
          ["Expiry", "Ten completed hourly bars after creation"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This intentionally simple EUR/USD rule uses the full anchor bar’s high/low. Another method might use its body or several bars, but that is a different rule version. Do not switch to a narrower rectangle after seeing which boundary happened to work. Record the anchor-selection method and the creation timestamp as carefully as the boundary prices.",
      },
    ],
  },
  {
    title: "Separate a touch, a rejection and a close",
    shortTitle: "Separate a touch, a rejection and a close",
    blocks: [
      {
        type: "paragraph",
        children:
          "A touch rule can be expressed as interval overlap: a later bar’s low is at or below the zone’s upper edge and its high is at or above the lower edge. That only tells you the bar reached the area. A rejection description might also require a close away from it or a defined wick/body relationship. A close-only rule ignores a wick that returns before the interval ends.",
      },
      {
        type: "comparisonTable",
        caption: "Invented EUR/USD bars after zone creation",
        columns: [
          "Bar",
          "Low",
          "High",
          "Completed bid close",
          "What can be said",
        ],
        rows: [
          [
            "C1",
            "1.0990",
            "1.1005",
            "1.0995",
            "Touches 1.0980–1.1000; closes inside",
          ],
          [
            "C2",
            "1.0990",
            "1.1020",
            "1.1010",
            "Touches zone; closes above its upper edge",
          ],
          [
            "C3",
            "1.1002",
            "1.1030",
            "1.1020",
            "No overlap with zone; remains above",
          ],
          [
            "C4",
            "1.0960",
            "1.1000",
            "1.0970",
            "Closes below lower edge; discard condition met",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The touch test is not a profitable entry rule. C1 and C2 both intersect the zone, but their closes differ. At C2’s completion, C3 and C4 are unknown. The later C4 does not retroactively erase the fact that the earlier condition occurred; it changes the later status. Keep event records separate from the eventual outcome.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-6/zone-and-trigger.svg",
        desktopSrc:
          "/images/lessons/forex/level-6/zone-and-trigger-desktop.svg",
        width: 720,
        height: 400,
        alt: "A marked EUR/USD area from 1.0980 to 1.1000 is touched; a later teaching bar closes at 1.1010 above it.",
        caption:
          "A touch and a completed close are different conditions. The native table supplies exact invented values; no fill or profitable outcome is implied.",
      },
    ],
  },
  {
    title: "Write confirmation and a trigger in one sentence",
    shortTitle: "Write confirmation and a trigger in one sentence",
    blocks: [
      {
        type: "paragraph",
        children:
          "Confirmation is additional evidence that fits an interpretation; it is not proof that the interpretation is true. An entry trigger is the exact condition that starts considering a demo action. You may decide that one completed close is enough, require another condition or record observations only. Each choice changes when the condition becomes available and which cases qualify.",
      },
      {
        type: "example",
        title: "A complete teaching trigger",
        children: [
          "After the zone is created, require at least one of the preceding three completed hourly bars to intersect it, and require the current completed hourly bid close to be strictly above 1.1000. The zone must still be active under its discard and expiry rules. The anchor bar itself does not count as a later touch.",
          "At C2’s close in the table, C1 is a prior touching bar and C2 closes at 1.1010, so the condition is met if the zone is still active. The rule has produced an observation candidate, not a guaranteed market entry at 1.1010.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Write exactly when evaluation occurs and how equality is handled. If the current close is 1.1000, this strict-above rule is false. If the right-hand confirming bar for a swing has not completed, that swing cannot be used yet. Multiple signs drawn from the same price data are not automatically independent confirmations.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not use an extra indicator or timeframe only after the initial condition fails. A changed confirmation rule is a new version and needs new observations. More conditions can reduce the number of examples without making the remaining ones reliable.",
        ],
      },
    ],
  },
  {
    title: "Give every candidate a lifetime and a failure rule",
    shortTitle: "Give every candidate a lifetime and a failure rule",
    blocks: [
      {
        type: "paragraph",
        children:
          "An idea needs an expiry as well as a price condition. Without expiry, you can keep an old zone until a much later reaction makes it look successful. Choose a fixed count of completed bars, session end or another explicit time limit before collecting outcomes. Define whether a valid trigger is allowed only once per zone or repeatedly after new touches.",
      },
      {
        type: "example",
        title: "The bus ticket has an expiry",
        children: [
          "A UK traveller has a ticket valid until 18:00. A bus arriving at 19:00 does not make the old ticket valid again. Similarly, a trigger that appears after a zone’s predeclared ten-bar lifetime is not a qualifying event for that version of the rule.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For the teaching zone, a close strictly below 1.0980 discards it. A touch below 1.0980 followed by a close above might not discard it under this close-based version; another rule could discard on a wick. That difference must be stated beforehand. Do not draw a replacement zone from the same losing event without labelling its own selection rule and creation time.",
      },
      {
        type: "comparisonTable",
        caption: "Candidate states help prevent hindsight",
        columns: ["State", "Meaning"],
        rows: [
          ["Active", "Created, not discarded and not expired"],
          [
            "Triggered",
            "The predeclared observable condition occurred while active",
          ],
          ["Discarded", "Specified invalidation condition occurred"],
          ["Expired", "Time limit elapsed"],
          [
            "Unclassified",
            "Input missing or rule cannot be evaluated consistently",
          ],
        ],
      },
    ],
  },
  {
    title: "Use multiple timeframes with an information cutoff",
    shortTitle: "Use multiple timeframes with an information cutoff",
    blocks: [
      {
        type: "paragraph",
        children:
          "A larger timeframe can describe background while a smaller one gives detail. Choose the combination before examining results, such as the last completed daily structure with completed hourly observations. Avoid using the final high, low or close of the current daily candle while assessing an hour earlier in that day. Those final values did not yet exist.",
      },
      {
        type: "example",
        title: "The report is not finished at lunchtime",
        children: [
          "A learner in Japan evaluates a USD/JPY hourly bar at midday. The provider’s daily bar will not close until later. The learner may use the last completed daily bar and currently available quotes, but cannot use today’s final daily close to decide what was supposedly known at midday.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "A reproducible timeframe record",
        columns: ["Input", "Availability rule"],
        rows: [
          [
            "Daily context",
            "Most recent fully completed daily bars at decision time",
          ],
          [
            "Hourly condition",
            "Evaluate only after the specified hour completes",
          ],
          [
            "Live quote",
            "Record bid/ask and timestamp when considering an order",
          ],
          ["Daily timezone", "Keep the provider’s session definition fixed"],
          ["Conflict", "Use a predeclared skip or classification rule"],
          [
            "Revision",
            "Log a new rule version instead of changing the old result",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A daily rise and an hourly fall can both describe their selected windows. Define whether that conflict makes you skip, merely annotate or use a different observation. If you inspect many timeframes until one agrees, the successful-looking example is being selected after the result. More views do not erase uncertainty.",
      },
    ],
  },
  {
    title: "Separate a chart trigger from an executable order",
    shortTitle: "Separate a chart trigger from an executable order",
    blocks: [
      {
        type: "paragraph",
        children:
          "A chart condition occurs on the price series you selected. A market order can be considered only after the condition is known; it is filled according to the provider’s execution rules and current price. The bar close used to recognise the condition is not necessarily an executable future entry. Record signal time, order time and fill time separately.",
      },
      {
        type: "example",
        title: "The offer changes while you decide",
        children: [
          "An Australian shopper sees an advertised ticket price, then reaches checkout after the offer changes. Seeing the old price did not guarantee buying at it later. In demo trading, the bid close at 1.1010 can be followed by a new ask of 1.1012 or a much larger gap.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For a conventional long, an entry is bought at ask and its exit is sold at bid; the short direction reverses the transaction sides. A bid-chart close above a level does not automatically imply an ask-side order fills at that close. Pending orders can also activate without waiting for a candle close, so do not describe a buy-stop placed earlier as a close-confirmed entry unless the actual order logic enforces that condition.",
      },
      {
        type: "paragraph",
        children:
          "Before a simulated order, set limits for acceptable spread, price deviation and delay under your demo policy. If they are exceeded, record a skipped candidate. A clean chart condition can remain true while the execution decision is no. This avoids quietly excluding awkward fills from the results.",
      },
    ],
  },
  {
    title: "Choose an outcome measure before advancing the chart",
    shortTitle: "Choose an outcome measure before advancing the chart",
    blocks: [
      {
        type: "paragraph",
        children:
          "An observation test needs a measurable outcome. You might record the next ten completed closes relative to the signal close, whether price reached a stated level within a window, or the complete simulated cash outcome under a specified order model. These are different questions. A ten-bar later close is not the same as a stop/target trade result.",
      },
      {
        type: "comparisonTable",
        caption: "Two legitimate questions that need different records",
        columns: ["Question", "Necessary definition", "Limitation"],
        rows: [
          [
            "Did later closes move higher?",
            "Fixed reference close, horizon and price series",
            "Does not describe an executable trade",
          ],
          [
            "Did a target occur before a stop?",
            "Entry model, levels, sequence data and costs",
            "Bar high/low alone may not reveal first hit",
          ],
          [
            "What was maximum adverse movement?",
            "Reference, intrabar observations and window",
            "A descriptive statistic is not a guaranteed loss cap",
          ],
          [
            "Was this setup reproducible?",
            "Independent markings using frozen rules",
            "Agreement does not prove profitability",
          ],
        ],
      },
      {
        type: "example",
        title: "One bar visits both boundaries",
        children: [
          "An invented hourly bar has low 1.0970 and high 1.1050. A simulated long has stop 1.0980 and target 1.1040. Both lie inside the bar’s range. Its OHLC values do not tell you which happened first or whether an executable-side fill was available.",
          "Use suitable finer data or a predeclared conservative/ambiguous-case rule. Do not always award the target simply because the candle closed upward. Missing order-of-events information must remain visible in the test.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Define outcome handling for incomplete windows, missing quotes and weekends before counting results. If a ten-bar outcome is unavailable at the sample end, label it incomplete instead of silently treating it as a winner or discarding it after reading the result.",
      },
    ],
  },
  {
    title: "Record every eligible case, including no signal",
    shortTitle: "Record every eligible case, including no signal",
    blocks: [
      {
        type: "paragraph",
        children:
          "Choose the sample dates and instruments before collecting cases. Log all observations that meet the rule, failed candidates, skipped execution decisions and relevant no-signal periods. Keep separate counts: charts examined, conditions triggered, demo actions accepted, and outcomes available. Mixing those denominators can make an ordinary result look more impressive.",
      },
      {
        type: "example",
        title: "A complete Indian learner’s study",
        children: [
          "A student studies an announced USD/INR release. “News makes the pair jump” becomes a dated rule: name the release, use a stated quote source, fix a pre-release reference, record a chosen post-release window and a movement threshold, then note bid/ask costs and missing data. The student records quiet releases as well as large moves.",
          "USD/INR is an observation example here. Do not assume it is supported by a PipStart calculator or can be traded under the same product and legal conditions as another pair. Calculator practice below uses supported EUR/USD.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A collection of ten memorable rebounds is not a test of how often rebounds occurred. If you marked only the reactions that later looked good, the failed or absent reactions are missing. A screenshot can illustrate an event; it cannot supply an unbiased sample of all eligible events. Keep a simple row-per-event record and retain the original chart cutoff.",
      },
    ],
  },
  {
    title: "Handle revisions and disagreements honestly",
    shortTitle: "Handle revisions and disagreements honestly",
    blocks: [
      {
        type: "paragraph",
        children:
          "Test a rule on unseen dates or use replay with later bars hidden. Have a second learner apply the same written rule. Differences reveal unclear inputs, ambiguous boundaries or availability mistakes. Clarify the rule, label a new version and reserve later observations for checking it. Do not rewrite the earlier version’s failures as if the clearer rule had always existed.",
      },
      {
        type: "comparisonTable",
        caption: "A small rule-change log",
        columns: ["Version", "Change", "Treatment of earlier data"],
        rows: [
          [
            "v1",
            "Strict close above fixed zone; ten-bar expiry",
            "Original results retained",
          ],
          [
            "v2",
            "Adds predeclared spread gate",
            "Test on reserved/later observations",
          ],
          [
            "v3",
            "Changes anchor selection",
            "New setup definition; do not merge silently",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Backtesting examines historical observations; forward demo testing uses later conditions as they arrive. Neither guarantees live results. Choosing settings from the same sample used to advertise the result is an overfitting risk. Level 9 will examine strategy evidence in more depth. Here the basic requirement is that the observation can be evaluated without inventing its rules after seeing the outcome.",
      },
      {
        type: "example",
        title: "Change the recipe, label the batch",
        children: [
          "A baker in Germany changes flour after a batch fails. It is sensible to improve the recipe, but the new recipe was not used in the old batch. Treat chart-rule revisions the same way: keep the original result and evaluate the new version separately.",
        ],
      },
    ],
  },
  {
    title: "Add money and cost checks without changing the signal",
    shortTitle: "Add money and cost checks without changing the signal",
    blocks: [
      {
        type: "paragraph",
        children:
          "Once a candidate is identified, it still needs an invalidation, a possible exit, permitted size, conversion, costs and total account-risk check. Define these in a separate demo execution worksheet. A trigger can be recorded even if the worksheet says no trade. Do not increase size or move the invalidation merely because the chart observation seems convincing.",
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "For supported EUR/USD in a USD demo account, compare a US$10 price-risk budget with 20-pip and 40-pip stop distances. Confirm permitted steps and add cost/worse-fill scenarios yourself. The tool does not validate the zone, trigger or sample.",
      },
      {
        type: "learningLink",
        title: "Risk-to-Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Check a separate long teaching example: entry 1.1000, stop 1.0980 and target 1.1040. A 2:1 distance ratio is arithmetic, not proof that the observation has an edge.",
      },
      {
        type: "paragraph",
        children:
          "Read both the observation record and the cash worksheet. If the minimum size exceeds the budget, the quote is unavailable, or your weekly gate blocks new activity, the demo decision is to skip. Keep the candidate in the observation dataset with the reason for the execution skip. This makes the limitations reviewable rather than invisible.",
      },
    ],
  },
  {
    title: "Build a complete observation card",
    shortTitle: "Build a complete observation card",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A reusable card for demo or historical study",
        columns: ["Line", "What to record"],
        rows: [
          [
            "Identity",
            "Rule version, pair/product, feed, price side, timeframe and timezone",
          ],
          ["Inputs", "Cutoff and only confirmed/available references"],
          [
            "Zone/context",
            "Anchor method, exact boundaries and timeframe rule",
          ],
          [
            "Condition",
            "Touch, close threshold, equality/buffer rule and availability time",
          ],
          ["Lifetime", "Creation, expiry, discard and repeat-trigger rules"],
          ["Execution", "Order model, delay/spread gates and no-trade reasons"],
          [
            "Outcome",
            "Fixed horizon, stop/target ordering, costs and missing-data handling",
          ],
          [
            "Review",
            "Eligible count, exclusions, failures and version changes",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Read the card to someone who has not seen the chart. If they must ask “which candle?” or “how far above?” the observation is still incomplete. Complete the definition before examining the later path. A compact written card can hold a detailed rule without needing a collection of vague labels.",
      },
      {
        type: "example",
        title: "A German learner’s twenty-session condition",
        children: [
          "At the daily cutoff, record whether the current completed EUR/USD bid close is strictly above the highest close of the previous 20 completed daily sessions, excluding the current bar. Fix timezone, missing-bar handling and an outcome window of the next ten completed sessions.",
          "This is a reproducible price observation, not an instruction to buy. Replacing “highest close” with “highest wick” or including the current close in the reference changes the test. Keep execution assumptions separate if you later simulate a position.",
        ],
      },
    ],
  },
  {
    title: "Practise the yes-or-no rule",
    shortTitle: "Practise the yes-or-no rule",
    blocks: [
      {
        type: "exercise",
        prompt:
          "An active EUR/USD zone is 1.0980–1.1000. A preceding completed bar touches it; the current completed bid close is exactly 1.1000. Does a strict-close-above trigger qualify?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Equality is not strictly above. A rule allowing equality would be a different rule version. Confirm all input times and the zone lifetime before classifying the event.",
      },
      {
        type: "exercise",
        prompt:
          "An hourly long simulation’s bar reaches both 1.0980 stop and 1.1040 target. Can the bar’s final upward close establish target-first?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. OHLC does not give the full intrabar ordering. Use appropriate sequence data or retain the predeclared ambiguous/conservative handling. Do not assign a profitable outcome from a pleasing candle shape.",
      },
      {
        type: "exercise",
        prompt:
          "At midday, may a daily/hourly rule use the same day’s eventual closing price as completed daily context?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. That final close was unavailable at midday. Use the last completed daily input or an explicitly defined live input, and record the timestamp.",
      },
      {
        type: "exercise",
        prompt:
          "A trigger qualifies but spread exceeds the predeclared gate. What belongs in the study record?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Record the qualifying chart event and the skipped execution decision with its reason. Do not remove the candidate from the observation count or pretend a fill occurred under better conditions.",
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
          "Define a zone, touch, trigger, expiry and discard condition reproducibly.",
          "Align multiple timeframes and distinguish chart events from executable fills.",
          "Record all eligible cases, ambiguous outcomes and rule revisions honestly.",
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
            title: "CME Group — Technical Analysis",
            url: "https://www.cmegroup.com/education/courses/technical-analysis",
          },
          {
            title: "CME Group — Support and Resistance",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/support-and-resistance",
          },
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
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
