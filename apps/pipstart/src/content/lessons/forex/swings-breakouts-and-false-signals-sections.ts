import type { LessonSection } from "../../lesson-content";

export const swingsAndBreakoutsSections: LessonSection[] = [
  {
    title: "Describe a turn without looking ahead",
    shortTitle: "Observation comes first",
    blocks: [
      {
        type: "paragraph",
        children:
          "A swing is a local turning point selected by a rule. A breakout is a move beyond a boundary selected by another rule. Both sound simple until you ask when the point became known, which price counted and whether the boundary was drawn before the later move. This lesson makes those questions part of the record.",
      },
      {
        type: "paragraph",
        children:
          "You will use invented prices and historical reading exercises, not live trading signals. The purpose is to apply one definition consistently and recognise uncertainty. A breakout label does not explain why a price moved, and an impressive chart shape does not show whether a trade could have been executed at the displayed level.",
      },
      {
        type: "paragraph",
        children:
          "Start with the product, source, timeframe, price basis, dates and time zone. Use completed observations for a close-based exercise. Save the original marked chart so you can distinguish a condition defined in advance from a line adjusted afterward.",
      },
      {
        type: "example",
        title: "Recognising the hilltop",
        children: [
          "On a walking route in the United Kingdom, you recognise a hilltop after descending the other side. During the climb, a higher point may still be ahead. A swing that needs bars on both sides has the same timing issue: it becomes identifiable after later observations arrive.",
        ],
      },
    ],
  },
  {
    title: "Choose a swing rule and its confirmation time",
    shortTitle: "Swing highs and lows",
    blocks: [
      {
        type: "paragraph",
        children:
          "One simple demonstration rule calls a bar a swing high when its high is above the highs of the immediately preceding and following completed bars. A swing low has a low below the lows on both sides. This is only one rule; a wider window or minimum-movement rule can select different turns.",
      },
      {
        type: "paragraph",
        children:
          "If completed highs across three bars are 150.80, 151.10 and 150.90 on USD/JPY, the middle high qualifies under that strict rule. If lows are 150.40, 150.20 and 150.35, the middle low qualifies. A sufficiently wide middle bar could satisfy both high and low rules; OHLC does not tell the intrabar order. Mixed cases deserve explicit treatment.",
      },
      {
        type: "paragraph",
        children:
          "The middle point cannot be confirmed until the following bar is complete. An annotation drawn back onto the middle bar can visually hide that delay. When keeping a journal, record both the turning-point time and the confirmation time. Using a confirmed marker as if it were known at the original peak introduces future information.",
      },
      {
        type: "paragraph",
        children:
          "Equal highs or lows also need a rule. A strict “greater than both neighbours” condition rejects equality; a different condition may choose the first or last member of a tied group. Do not silently change treatment when one version creates a nicer chart.",
      },
      {
        type: "comparisonTable",
        caption: "A one-neighbour demonstration rule",
        columns: ["Observation", "Rule outcome", "When it is known"],
        rows: [
          [
            "Highs 150.80, 151.10, 150.90",
            "Middle high is above both neighbours.",
            "After the third bar closes.",
          ],
          [
            "Lows 150.40, 150.20, 150.35",
            "Middle low is below both neighbours.",
            "After the third bar closes.",
          ],
          [
            "Highs 150.80, 151.10, 151.10",
            "No strict middle swing high.",
            "Equality requires the stated tie rule.",
          ],
        ],
      },
    ],
  },
  {
    title: "Read the sequence rather than one marker",
    shortTitle: "Market structure",
    blocks: [
      {
        type: "paragraph",
        children:
          "Compare swings selected by the same rule. Rising swing highs and lows can describe upward structure; falling ones can describe downward structure. A higher high with a lower low is mixed information, not automatically a clean trend. A range has repeated turns within a selected area under the stated observation window.",
      },
      {
        type: "paragraph",
        children:
          "A new higher high does not guarantee another higher low will follow. A break of one selected low can challenge a previous description, but does not prove that the market has begun a lasting downtrend. Distinguish the event you observed from an interpretation about what will follow.",
      },
      {
        type: "paragraph",
        children:
          "The chosen timeframe changes the turns you see. Small intraday swings can sit within one daily candle. If you move to a lower timeframe because you want more evidence, keep its definition and confirmation delay separate rather than mixing small and large swings into one sequence.",
      },
      {
        type: "paragraph",
        children:
          "Current endpoints are especially tempting. The most recent price might look like a peak on screen, but under a neighbour-confirmed rule it is not yet a confirmed swing. Write “possible turn, not yet confirmed” when that is all the record supports.",
      },
      {
        type: "example",
        title: "Steps, a pause and one step back",
        children: [
          "A child in France climbs three steps, pauses and steps down one. You can describe the path so far. You cannot know whether the next move will continue downward or resume the climb. A sequence of labelled highs and lows needs the same restraint.",
        ],
      },
    ],
  },
  {
    title: "Define the boundary and the break separately",
    shortTitle: "Breakout rules",
    blocks: [
      {
        type: "paragraph",
        children:
          "A boundary can be a previous high, previous low, horizontal zone or projected guide. Define it using information already visible. Then choose the event that counts as a breakout: a relevant high beyond it, a completed close beyond it, two closes, or a specified buffer. These are different rules and will classify some observations differently.",
      },
      {
        type: "paragraph",
        children:
          "For an invented USD/JPY level of 151.00, a high at 151.20 and close at 150.90 meets a high-above-level rule but not a close-above-level rule. If the boundary is instead a zone of 150.90–151.10, the high exceeds the upper edge but the close does not. The exact boundary matters.",
      },
      {
        type: "paragraph",
        children:
          "Write whether equality qualifies. “Above 151.00” excludes a close exactly at 151.00. “At or above” includes it. If a rule requires two consecutive completed closes, one close is insufficient and a still-forming second candle is not confirmation.",
      },
      {
        type: "paragraph",
        children:
          "A confirmation condition means the chosen event occurred. It does not guarantee continuation or profitability. A stricter rule may classify fewer cases and become known later; it is not automatically better. Any comparison must use consistent data and a prewritten method.",
      },
      {
        type: "comparisonTable",
        caption: "Same invented candle, different rules",
        columns: [
          "Prewritten condition",
          "High 151.20 / close 150.90",
          "Reason",
        ],
        rows: [
          ["High above 151.00", "Qualifies", "151.20 is above the line."],
          ["Close above 151.00", "Does not qualify", "150.90 is below it."],
          [
            "Close above zone ending 151.10",
            "Does not qualify",
            "Close is not beyond the upper edge.",
          ],
          [
            "Two closes above 151.00",
            "Not established",
            "One candle cannot supply two qualifying closes.",
          ],
        ],
      },
    ],
  },
  {
    title: "Separate a brief test from a later failure",
    shortTitle: "False breakouts",
    blocks: [
      {
        type: "paragraph",
        children:
          "A false breakout usually describes a move beyond a watched boundary that later returns under a specified rule. It needs a definition of the original break, the return and the time allowed. The label is assigned with later evidence; it is not information that was automatically available when price first crossed.",
      },
      {
        type: "paragraph",
        children:
          "For a high-based break at 151.00, a high of 151.20 and close of 150.90 can be called a failed same-candle excursion under a rule requiring return below by the close. Under a rule requiring an initial close above, no breakout occurred in that candle, so calling it a failed close-confirmed break would misstate the rule.",
      },
      {
        type: "paragraph",
        children:
          "If a completed close is 151.15 and the following close is 150.85, a one-close breakout followed by a next-close return below 151.00 is observed. If you require two initial closes above, that sequence never qualified. Use the same definitions for exciting examples and disappointing ones.",
      },
      {
        type: "paragraph",
        children:
          "A brief move can accompany changing quotes, news, thin activity or many other conditions. The shape alone does not prove deliberate manipulation or tell you whose orders caused it. Keep suspected explanations separate from the price observations you can actually verify.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/swings-breakouts-and-false-signals-guide.svg",
        desktopSrc:
          "/images/lessons/forex/swings-breakouts-and-false-signals-guide-desktop.svg",
        alt: "Hypothetical USD/JPY boundary at 151.00. In the first example high 151.20 closes at 150.90: a high-based crossing but no close-based breakout. In a separate example two completed closes at 151.15 and 151.25 qualify under a two-close rule, without guaranteeing the next move.",
        caption:
          "Two separately defined examples. “Confirmed” means the written rule was met, not that the future is certain.",
        width: 600,
        height: 600,
      },
    ],
  },
  {
    title: "Observe a retest without assuming it must happen",
    shortTitle: "Retests and invalidation",
    blocks: [
      {
        type: "paragraph",
        children:
          "A retest describes a later return toward a watched boundary after a break. Some moves return; others do not. A return can pause, cross back or continue through. Saying “the old resistance becomes support” is a hypothesis to observe, not an instruction the market must obey.",
      },
      {
        type: "paragraph",
        children:
          "Define how near price must come, which price counts and how long you will watch. For a EUR/USD zone ending at 1.1010, you might record whether the next three completed daily bars trade inside the zone. That is an observation exercise; it does not specify an entry or promise a bounce.",
      },
      {
        type: "paragraph",
        children:
          "Invalidation is the event that contradicts your stated condition or makes an idea no longer applicable. A reading rule might stop tracking a breakout after a completed close below the lower zone boundary, or after a time limit with no retest. A trading plan would need additional sizing and exit instructions; a chart condition alone is not a risk policy.",
      },
      {
        type: "paragraph",
        children:
          "Save the original zone and invalidation rule. Moving a boundary after each return makes it impossible to know whether the original idea failed. You may revise a description as new information appears, but date the revision and keep it distinct from the earlier experiment.",
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A retest is a possible later observation. No return, a return that holds and a return that fails are all outcomes worth recording.",
      },
    ],
  },
  {
    title: "Bring quote sides and execution back into the picture",
    shortTitle: "A chart is not a fill",
    blocks: [
      {
        type: "paragraph",
        children:
          "A wick above a bid-chart line does not automatically establish the ask-side price a buyer would pay. Wider spreads can produce a different entry cost or trigger a provider’s instruction under rules you did not expect. Use the actual product’s quote and order definitions from Level 2.",
      },
      {
        type: "paragraph",
        children:
          "A price can gap across a watched level without offering a fill at that exact price. A market order may slip, a limit may remain unfilled and a stop may execute beyond its trigger. The chart’s neat crossing does not remove any of those constraints.",
      },
      {
        type: "paragraph",
        children:
          "If you later study a hypothetical response to a breakout, specify the entry time, direction, size, actual-fill assumption, exit rule, holding period and costs. Keep failed observations and unfilled orders in the record. A collection of only successful screenshots cannot establish the performance of the rule.",
      },
      {
        type: "paragraph",
        children:
          "Calculators can translate recorded price differences or compare planned distances. They cannot decide whether a breakout is genuine, certify a data source or estimate its probability of success. Use them for the arithmetic question they actually answer.",
      },
      {
        type: "learningLink",
        title: "Compare a recorded distance with the Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "For USD/JPY, 0.01 lots and a JPY account with conversion factor 1, the assumed 1,000-dollar position has ¥10 per conventional 0.01-yen pip. A 151.00-to-151.20 distance is 20 pips, corresponding to ¥200 at that size; it is not a realised trade result.",
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
          "A Japanese learner saves an invented USD/JPY chart before revealing the next day. Their boundary is 151.00 and their observation rule requires two consecutive completed daily closes strictly above it. The next day’s high is 151.20 and close is 150.90. The rule has not qualified, although the high crossed the boundary.",
      },
      {
        type: "paragraph",
        children:
          "In a separate invented sequence, the next two completed closes are 151.15 and 151.25. The two-close rule now qualifies at the end of the second day, not during the first day’s spike. The learner records the time at which that condition became known.",
      },
      {
        type: "paragraph",
        children:
          "If a later close falls below the boundary, the learner applies the previously written return or invalidation rule. They do not change “two closes” into “one wick” because the new picture looks persuasive. A consistent observation can be useful even if the later direction disappoints an expectation.",
      },
      {
        type: "example",
        title: "Stepping out of a queue",
        children: [
          "A shopper in Australia steps out of a queue to inspect another counter and then returns. The brief step outside did not prove that the shopper had left the building. A chart excursion needs its time and return condition before you label it as a lasting break or a failure.",
        ],
      },
    ],
  },
  {
    title: "Keep a fair observation log",
    shortTitle: "Review a sequence",
    blocks: [
      {
        type: "paragraph",
        children:
          "For a small practice log, take the next ten eligible examples in a stated historical window rather than ten attractive examples chosen after the fact. Record every case, including no break, qualified break, return, ambiguous data and missing observations. This is a learning sample, not enough by itself to establish a profitable method.",
      },
      {
        type: "paragraph",
        children:
          "Write the boundary, selection time, breakout rule, confirmation time and return condition before revealing the outcome. Record when a swing became confirmed, not only where the marker is drawn. If you compare two definitions, keep separate columns and apply both to the same eligible data.",
      },
      {
        type: "paragraph",
        children:
          "Do not assume a higher count of confirmed breaks means a better strategy. A rule can create many labels while producing expensive or adverse executions. A stricter rule can delay an observation until much of the move is over. Later strategy lessons address test design and performance; here, your aim is consistent chart vocabulary.",
      },
      {
        type: "comparisonTable",
        caption: "A record that separates knowledge from hindsight",
        columns: ["Field", "What to keep"],
        rows: [
          [
            "Available history",
            "The data visible when you selected the boundary.",
          ],
          [
            "Condition",
            "Exact price, side, timeframe, equality and confirmation rule.",
          ],
          [
            "Knowledge time",
            "When each required completed bar became available.",
          ],
          [
            "Later observation",
            "Return, continuation, no event or ambiguity under the rule.",
          ],
          [
            "Revision",
            "A dated change retained alongside the original version.",
          ],
        ],
      },
    ],
  },
  {
    title: "Practise two definitions on the same data",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Mark an invented level of 151.00 and apply a high-above rule and a close-above rule to high 151.20 / close 150.90. Then apply a two-close rule to completed closes 151.15 and 151.25. Separately identify a strict one-neighbour swing from highs 150.80, 151.10 and 150.90, stating when it becomes known.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "The first candle qualifies only for the high-above rule. The two-close condition becomes known after the second completed qualifying close. The middle 151.10 swing high is confirmed only after the third bar is complete. None of these labels establishes that a later order will fill profitably.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Draw both a qualifying example and a non-qualifying one in your notebook. Explain the difference with the same rule rather than different stories. If a candle does not supply enough information, state what is missing. That habit is more useful than treating every shape as a signal.",
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
          "Educational observations and hypothetical data only. Chart shapes, volume, landmarks and calculators do not guarantee future prices, execution or profits. Leveraged Forex can cause substantial losses; no live order is needed for these exercises.",
      },
      {
        type: "keyPoint",
        title: "I can explain this without guessing",
        points: [
          "I can define a swing and record its confirmation delay and tie rule.",
          "I can distinguish one local turn from the larger sequence of structure.",
          "I can define a breakout boundary, price basis, equality and confirmation condition in advance.",
          "I can explain why a false-break label depends on later observations and the original rule.",
          "I can keep retests, invalidation, actual fills and costs separate from a chart’s appearance.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group — Chart Types: candlestick, line, bar",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar",
          },
          {
            title: "CME Group — Technical Analysis",
            url: "https://www.cmegroup.com/education/courses/technical-analysis",
          },
          {
            title: "CME Group — Support and Resistance",
            url: "https://www.cmegroup.com/education/courses/trading-and-analysis/support-and-resistance",
          },
          {
            title: "MetaTrader 5 — Price Data (platform-specific guide)",
            url: "https://www.metatrader5.com/en/terminal/help/trading_advanced/price_data",
          },
        ],
      },
    ],
  },
];
