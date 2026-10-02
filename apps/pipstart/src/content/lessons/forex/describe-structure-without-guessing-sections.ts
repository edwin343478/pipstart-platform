import type { LessonSection } from "../../lesson-content";

export const describeStructureWithoutGuessingSections: LessonSection[] = [
  {
    title: "Describe price before telling its story",
    shortTitle: "Describe price before telling its story",
    blocks: [
      {
        type: "paragraph",
        children:
          "Price action means studying the movements recorded on a price chart: where a period opened and closed, how far it moved, and how successive highs and lows relate. It can include candles, swings, ranges and reactions at marked areas. It is a way to organise observations. It does not let the chart explain every cause of a move or reveal the next one in advance.",
      },
      {
        type: "paragraph",
        children:
          "You already learned chart inputs, indicator limitations and cash-risk planning. Keep those foundations visible. Every example here uses invented data for observation or demo practice, not a recommendation to buy or sell. A good description remains useful when the next candle contradicts the interpretation. Your task is to make the description reproducible and state what would change it.",
      },
      {
        type: "example",
        title: "A staircase and a landing",
        children: [
          "A learner in France watches someone climb two steps, rest on a landing and take one step down. “They climbed and then paused” describes what happened. “They will keep climbing” is an interpretation. A still photograph cannot tell you whether they will continue upward or turn back. A chart needs the same separation.",
        ],
      },
    ],
  },
  {
    title: "Know the background and the limits of the labels",
    shortTitle: "Know the background and the limits of the labels",
    blocks: [
      {
        type: "paragraph",
        children:
          "Studying trends has a long history. Charles Dow’s stock-market observations and the later work known as Dow Theory form part of the background to technical trend analysis. Modern Forex price-action teaching covers many definitions and methods; it should not be presented as one founder’s universal system. A historic idea can help organise observations without proving a profitable rule in a different market.",
      },
      {
        type: "paragraph",
        children:
          "Terms such as market structure, swing, break of structure and change of character may have different meanings in different courses. Here, market structure describes the arrangement of selected highs and lows on a specified price series and timeframe. If you use another label, write its rule alongside it. Two people using the same word may still be identifying different events.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A chart label is not a verified account of who traded or where future orders must be. Retail Forex feeds do not reveal the entire global market’s order book. Do not turn a pattern into an unsupported claim that a particular institution is defending a price.",
        ],
      },
    ],
  },
  {
    title: "Fix the chart inputs and observation time",
    shortTitle: "Fix the chart inputs and observation time",
    blocks: [
      {
        type: "paragraph",
        children:
          "Record the pair, product, source, timeframe, timezone and price side before marking structure. Identify the most recent completed bar and the information available at the moment you claim the observation was made. A daily bar can differ when providers use different session boundaries, and a bid chart may not show the ask-side price relevant to an exit.",
      },
      {
        type: "comparisonTable",
        caption: "A description that another learner can reproduce",
        columns: ["Field", "Example entry in a teaching notebook"],
        rows: [
          [
            "Instrument/product",
            "AUD/USD; conventional linear Forex demo example",
          ],
          ["Feed and price side", "Named demo feed; completed bid-price bars"],
          ["Timeframe/timezone", "Daily; provider’s stated session boundary"],
          ["Cutoff", "Only bars completed by the stated date/time"],
          [
            "Swing rule",
            "One completed bar on each side; strict high/low comparison",
          ],
          [
            "Equality rule",
            "Equal highs or lows do not qualify under this rule",
          ],
          ["Purpose", "Describe observed structure; no order instruction"],
        ],
      },
      {
        type: "example",
        title: "The same trip on two maps",
        children: [
          "A traveller in Japan uses a city map to locate a station and a street map to find its entrance. A description from one map is incomplete without its scale. In a chart notebook, “the market is rising” is incomplete without timeframe, data and the selection rule.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Missing bars, price spikes, different quote streams and uncompleted candles need a written handling rule. Do not silently remove an inconvenient bar after seeing the result. Keep a copy of the original input and state whether a questionable observation was excluded, corrected or left unclassified.",
      },
    ],
  },
  {
    title: "Mark a swing with an explicit rule",
    shortTitle: "Mark a swing with an explicit rule",
    blocks: [
      {
        type: "paragraph",
        children:
          "A swing high is a selected local high and a swing low a selected local low. A simple classroom rule calls a middle bar a swing high only when its high is strictly greater than the high of the completed bar immediately before and immediately after it. A swing low uses the corresponding lower-low comparison. This is one possible rule, not a universal definition.",
      },
      {
        type: "comparisonTable",
        caption: "Three invented AUD/USD bars",
        columns: ["Bar", "High", "Low", "Known when this bar closes?"],
        rows: [
          ["A", "0.6680", "0.6580", "Only A and older bars"],
          ["B", "0.6720", "0.6610", "A and B; C unavailable"],
          ["C", "0.6700", "0.6570", "All three bars now completed"],
        ],
      },
      {
        type: "paragraph",
        children:
          "B is a swing high under this rule only after C completes, because 0.6720 exceeds both neighbouring highs. At B’s close, you do not yet know C’s high. The swing is drawn at B’s timestamp but becomes confirmed at a later timestamp. That difference matters in replay and testing: an earlier entry cannot use a pivot whose right-hand confirmation did not yet exist.",
      },
      {
        type: "example",
        title: "A bus delay is only known later",
        children: [
          "A UK commuter cannot call Tuesday the slowest journey of Monday–Wednesday before Wednesday has happened. Once all three trips finish, Tuesday can be identified retrospectively. Likewise, a swing marker can belong to one candle while its confirmation requires a later candle.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A two-bars-on-each-side rule needs two later completed bars and may select fewer swings. An inside bar, equal high or outside bar can complicate an informal drawing. State how your rule handles these cases, and allow “not yet confirmed” when the required observations do not exist.",
      },
    ],
  },
  {
    title: "Compare highs and lows in order",
    shortTitle: "Compare highs and lows in order",
    blocks: [
      {
        type: "paragraph",
        children:
          "An uptrend description commonly uses selected higher highs and higher lows. A downtrend uses lower highs and lower lows. Both comparisons need at least two comparable highs and two comparable lows under a fixed selection rule. A rising last close alone does not establish all of that structure, and a single large candle cannot supply a complete sequence of confirmed swings.",
      },
      {
        type: "comparisonTable",
        caption: "Invented AUD/USD confirmed swings",
        columns: ["Swing", "Price", "Comparison"],
        rows: [
          ["Low 1", "0.6500", "First low reference"],
          ["High 1", "0.6650", "First high reference"],
          ["Low 2", "0.6550", "Higher than Low 1"],
          ["High 2", "0.6700", "Higher than High 1"],
          ["Low 3", "0.6600", "Higher than Low 2"],
          ["High 3", "0.6750", "Higher than High 2"],
        ],
      },
      {
        type: "paragraph",
        children:
          "These dated, already-confirmed observations fit the stated higher-high/higher-low description. They do not establish that High 4 must be higher. If the next confirmed high is lower, or a specified close breaks the chosen low, record that new information instead of moving the old reference. A wider timeframe may still have a different structure.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-6/trend-and-range.svg",
        desktopSrc: "/images/lessons/forex/level-6/trend-and-range-desktop.svg",
        width: 720,
        height: 400,
        alt: "Two schematic paths compare higher selected highs/lows with oscillation inside a marked range.",
        caption:
          "The paths illustrate descriptions of earlier movement. Read the native swing table for the exact teaching prices; neither path forecasts the next swing.",
      },
    ],
  },
  {
    title: "Recognise consolidation without forcing a trend",
    shortTitle: "Recognise consolidation without forcing a trend",
    blocks: [
      {
        type: "paragraph",
        children:
          "Consolidation describes movement repeatedly contained within chosen approximate boundaries without sustained progression under your trend rule. Mark how you chose the upper and lower areas and how many completed observations are required. A range drawn after the breakout can be very different from a range you could have drawn before it. Record the boundary’s creation time.",
      },
      {
        type: "example",
        title: "Pacing between two doors",
        children: [
          "A child in a German classroom walks repeatedly between two ends of the room. You can describe the pacing, but it does not tell you which door the child will eventually choose. A price range can end upward, downward or continue longer than the observer expects.",
        ],
      },
      {
        type: "paragraph",
        children:
          "An invented EUR/USD range between 1.0980 and 1.1020 spans 40 conventional pips. That width is a description, not 40 pips of obtainable profit on every crossing. Spreads, adverse fills and the entry/exit rule can consume a substantial part of short moves. Some bars may touch a boundary without giving the confirmation your rule requires.",
      },
      {
        type: "comparisonTable",
        caption: "A range record needs more than two lines",
        columns: ["Decision", "Question to write down"],
        rows: [
          ["Boundary selection", "Which completed highs/lows define the area?"],
          ["Touch", "Does a wick, bid, ask or completed close count?"],
          ["Confirmation", "What qualifies as leaving the range?"],
          ["Failure", "What counts as returning, and within how long?"],
          ["Expiry", "When is the old range no longer used?"],
          ["Uncertainty", "Can the current evidence remain unclassified?"],
        ],
      },
      {
        type: "learningLink",
        title: "Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "For supported EUR/USD in a USD account with conversion 1, 0.01 lot has about US$0.10 per pip under a conventional contract. A 40-pip range is a US$4 price-distance equivalent at that size, not a promise of capturing the range. The tool does not classify structure.",
      },
    ],
  },
  {
    title: "Distinguish a pullback from a tested reversal",
    shortTitle: "Distinguish a pullback from a tested reversal",
    blocks: [
      {
        type: "paragraph",
        children:
          "A pullback is movement against an earlier directional sequence. Continuation means subsequent movement resumes that earlier direction under your definition. Reversal means a change in the selected structure or direction under a stated rule. These are descriptions of a sequence as it unfolds; a pause is not already a continuation and one countertrend candle is not automatically a reversal.",
      },
      {
        type: "example",
        title: "The bus stops or turns around",
        children: [
          "A bus in South Korea stops to collect passengers. It may continue on its route or later turn back. From one photograph of the stationary bus you cannot choose the future path. The next observations matter, and the route you are describing must be specified.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In the AUD/USD swing example, Low 3 is 0.6600. A learner may define a continuation candidate as a later completed close above 0.6750 while the chosen low remains intact. Another condition, such as a completed daily bid close below 0.6600, may invalidate that specific candidate. A subsequent lower high and lower low might satisfy a fuller reversal description. These are separate conditions, not one guaranteed chain of events.",
      },
      {
        type: "paragraph",
        children:
          "Do not use “trend ended” to mean that every timeframe now trends in the opposite direction. A failed uptrend condition can leave a range or an uncertain structure. Define an unclassified outcome rather than making every observation fit either buy or sell.",
      },
    ],
  },
  {
    title: "Define a structure break by price and time",
    shortTitle: "Define a structure break by price and time",
    blocks: [
      {
        type: "paragraph",
        children:
          "A break needs a reference and a crossing rule. Specify whether the reference is a wick high, a close, a confirmed swing or a zone edge, and whether a live quote or completed close is required. A small intrabar excursion and a close beyond the level are different observations. A buffer may be specified to avoid counting equality or a tiny breach, but it must be chosen before the later result.",
      },
      {
        type: "example",
        title: "The close condition is absent",
        children: [
          "Use a hypothetical GBP/USD rule requiring a completed hourly bid close strictly above 1.2800. During the hour, bid reaches 1.2805 but the completed close is 1.2790. The close-based break condition is not met. Calling the wick a confirmed close because a later bar rallies would rewrite the original rule.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A close exactly at 1.2800 is not strictly above it. A different rule might count equality or require a two-pip buffer, but that would be a different test. Specify what happens after a qualifying close: how long you wait for a retest, whether the setup expires and what return inside the earlier area means. A break by your rule can still fail later.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A claimed structure break is not evidence that a guaranteed trend has begun or that a stop will fill at the planned level. Chart conditions, order execution and cash outcomes are separate parts of the record.",
        ],
      },
    ],
  },
  {
    title: "Keep major and minor structure relative",
    shortTitle: "Keep major and minor structure relative",
    blocks: [
      {
        type: "paragraph",
        children:
          "Major and minor structure are relative labels. A swing visible on a daily chart may contain many hourly swings. A lower timeframe can reverse several times while the higher timeframe’s selected low remains intact. Define the reference scale and observation rule; do not call a swing “major” merely because it later produced a successful example.",
      },
      {
        type: "comparisonTable",
        caption: "Two descriptions can both be true at a cutoff",
        columns: [
          "View",
          "Available observation",
          "What it does not establish",
        ],
        rows: [
          [
            "Completed daily bars",
            "Higher selected highs/lows in the recorded window",
            "Every hourly movement must rise",
          ],
          [
            "Completed hourly bars",
            "Lower highs inside the latest daily pullback",
            "The entire daily structure has reversed",
          ],
          [
            "Latest unfinished daily bar",
            "Current quote below its open",
            "Final daily close or confirmed daily swing",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The higher timeframe is context, not an automatic permission slip. Choose the relationship you want to test—such as daily context with an hourly observation—before inspecting outcomes. Adding more timeframes until one supports a preferred position creates selection after the result. Lesson 2 will show how to freeze a higher-timeframe input at the actual decision time.",
      },
    ],
  },
  {
    title: "Observe a level without inventing future orders",
    shortTitle: "Observe a level without inventing future orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "A previous high, low or reaction area can be a useful reference. “Price previously bounced here” is an observation; “buyers will certainly defend it again” is a prediction. A historical reaction does not reveal the quantity, identity or intentions of future participants. The same area can be crossed rapidly, revisited several times or ignored under changed conditions.",
      },
      {
        type: "example",
        title: "A market corner changes",
        children: [
          "A shopper in India remembers a busy fruit stall at a particular corner. A road closure or new seller can change where customers go next week. The old crowd is information about yesterday, not a reservation of future demand. A chart zone has a similar limitation.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Separate a price zone from actual order-book data. A visible depth display covers a specified venue or provider and can change before execution; it is not all worldwide Forex liquidity. Describing inferred supply or demand from candles should not be presented as reading a hidden global inventory. Lesson 2 will use fixed zone boundaries so the inference itself can be tested.",
      },
    ],
  },
  {
    title: "Write facts, interpretation and invalidation separately",
    shortTitle: "Write facts, interpretation and invalidation separately",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use three short statements. First, a dated fact: the last confirmed low is higher than the earlier one. Second, a possible interpretation: a continuation candidate might form after this pause. Third, a condition that would weaken or invalidate that candidate. Add an alternative interpretation, such as consolidation, and acknowledge that the next candle might satisfy neither condition.",
      },
      {
        type: "comparisonTable",
        caption: "A French learner’s invented EUR/USD notebook",
        columns: ["Layer", "Written entry"],
        rows: [
          [
            "Observation",
            "Two selected completed daily swing lows are higher; last two bars remain inside a narrow area",
          ],
          ["Interpretation A", "Possible continuation after a pause"],
          [
            "Interpretation B",
            "Earlier rise may be losing direction; consolidation remains possible",
          ],
          [
            "Evidence to watch",
            "A predeclared completed-close rule at the marked boundaries",
          ],
          [
            "Invalidation",
            "Specified close below the selected prior low invalidates Interpretation A under this rule",
          ],
          [
            "Current decision",
            "Observation only; no entry condition has occurred",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "This separation makes a failed interpretation visible without making the original factual record wrong. Avoid emotional adjectives such as “obvious,” “strong” or “certain” unless you define their measurement. A second learner should be able to check the facts without being asked to believe your story.",
      },
    ],
  },
  {
    title: "Practise with a chart cutoff",
    shortTitle: "Practise with a chart cutoff",
    blocks: [
      {
        type: "exercise",
        prompt:
          "AUD/USD confirmed lows are 0.6500, 0.6550 and 0.6600, with highs 0.6650, 0.6700 and 0.6750. What structure is described, and what future outcome is not established?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The sequence contains higher selected highs and lows, consistent with an uptrend under the stated rule. It does not establish the next swing, a profitable entry or a guarantee that 0.6600 holds.",
      },
      {
        type: "exercise",
        prompt:
          "A one-bar-on-each-side swing high occurs at bar B. At B’s close the next bar C has not completed. Can a historical test already use B as a confirmed swing under this rule?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Confirmation requires C’s completed high. Record B’s swing timestamp and the later availability timestamp separately; using the finished marker at B’s close introduces future information.",
      },
      {
        type: "exercise",
        prompt:
          "Write a close-based invalidation for a continuation interpretation, then name an outcome that is neither confirmation nor invalidation.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "For example: a completed daily bid close strictly below the preselected low invalidates this candidate. A close inside the marked area may satisfy neither condition. Specify the pair, source, cutoff, level and expiry rather than borrowing a later chart’s answer.",
      },
      {
        type: "paragraph",
        children:
          "Use replay or cover the right-hand side of a dated chart. Record the description before revealing the next bar. Keep mistakes and uncertain cases in the notebook. This exercise tests whether your labels can be used consistently; it does not prove that a trading method is profitable.",
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
          "Describe confirmed swings, trend and range with a fixed timeframe and information cutoff.",
          "Separate continuation/reversal interpretations from observable facts.",
          "Define structure-break and invalidation conditions without using future bars.",
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
            title: "CME Group — Technical Analysis",
            url: "https://www.cmegroup.com/education/courses/technical-analysis",
          },
          {
            title: "CME Group — Support and Resistance",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/support-and-resistance",
          },
          {
            title: "CMT Association — 2026 Program Guide: Dow Theory",
            url: "https://cmtassociation.org/wp-content/uploads/2025/12/CMT-PROGRAM-GUIDE-2026-1.pdf",
          },
        ],
      },
    ],
  },
];
