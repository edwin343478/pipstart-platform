import type { LessonSection } from "../../lesson-content";

export const levelsPatternsAndLimitsSections: LessonSection[] = [
  {
    title: "A level is a reference, not a barrier",
    shortTitle: "A level is a reference, not a barrier",
    blocks: [
      {
        type: "paragraph",
        children:
          "This lesson brings together Fibonacci retracements, pivot points, divergence, candle shapes and multi-bar patterns. These tools make chart observations easier to describe. They do not create physical walls at particular prices. Buyers and sellers can quote and transact beyond a drawn line, and transaction costs can matter more than a visually neat pattern.",
      },
      {
        type: "paragraph",
        children:
          "A repeatable description names the timeframe, data source, completed bars, boundaries and failure rule before the outcome is visible. A label added after a large move is not evidence that the same label could have predicted it. Keep observation, hypothesis and result in separate notebook columns.",
      },
      {
        type: "example",
        title: "A mark on a measuring tape",
        children: [
          "A carpenter in the United Kingdom marks half the length of a board. The mark makes discussion easier, but it does not force the board to break there. A percentage line on GBP/USD is similarly a measuring reference; the market has no obligation to stop at it.",
        ],
      },
    ],
  },
  {
    title: "Understand Fibonacci’s history and ratios",
    shortTitle: "Understand Fibonacci’s history and ratios",
    blocks: [
      {
        type: "paragraph",
        children:
          "The sequence 0, 1, 1, 2, 3, 5, 8, 13 and onward adds the previous two numbers to get the next. It is associated with Leonardo of Pisa, often called Fibonacci, whose 1202 Liber Abaci helped transmit the sequence and practical arithmetic in Europe. Related sequence work existed earlier in Indian mathematics. It is therefore misleading to say Leonardo invented every idea now associated with it.",
      },
      {
        type: "paragraph",
        children:
          "Ratios between increasingly large neighbouring numbers approach about 0.618 in one direction and 1.618 in the other. Related ratios supply familiar 38.2% and 23.6% chart marks; 78.6% is commonly associated with the square root of 0.618. A 50% retracement is included by charting convention, not because one half is a Fibonacci ratio.",
      },
      {
        type: "paragraph",
        children:
          "Borrowing a mathematical ratio does not prove an economic law. Traders can watch the same areas, but popularity alone does not establish dependable predictive power. Avoid claims that every currency swing must respect these percentages. Their useful beginner role is to make the distance from a documented swing explicit.",
      },
    ],
  },
  {
    title: "Choose anchors and calculate a retracement",
    shortTitle: "Choose anchors and calculate a retracement",
    blocks: [
      {
        type: "paragraph",
        children:
          "For an upswing, choose the low and high using a rule that existed before the later decline. Let the move be high minus low. A retracement down from the high at fraction r is high minus r times that move. For a downswing, a bounce measured upward from the low is low plus r times the decline’s distance. Reversing the anchors changes what 0% and 100% label on some platforms.",
      },
      {
        type: "formula",
        expression: "Upswing retracement level = high − r × (high − low)",
        explanation:
          "r is a fraction such as 0.382. Label which endpoint is the high and which side is being measured.",
      },
      {
        type: "comparisonTable",
        caption: "Invented EUR/USD rise from 1.0800 to 1.1200",
        columns: ["Pullback proportion", "Arithmetic", "Level"],
        rows: [
          ["23.6%", "1.1200 − 0.236 × 0.0400", "1.11056"],
          ["38.2%", "1.1200 − 0.382 × 0.0400", "1.10472"],
          ["50%", "1.1200 − 0.500 × 0.0400", "1.10000"],
          ["61.8%", "1.1200 − 0.618 × 0.0400", "1.09528"],
          ["78.6%", "1.1200 − 0.786 × 0.0400", "1.08856"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A platform may round to its quote precision. Rounding the arithmetic does not convert a line into a guaranteed execution price. A second learner choosing an earlier swing low will obtain other reference levels. Record dates and prices for both anchors, and do not keep moving them until a losing example looks successful.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-4/retracement-levels.svg",
        desktopSrc:
          "/images/lessons/forex/level-4/retracement-levels-desktop.svg",
        width: 720,
        height: 400,
        alt: "EUR/USD low 1.0800 and high 1.1200 with calculated 38.2%, 50% and 61.8% pullbacks.",
        caption:
          "Calculated reference lines use explicitly selected anchors; none is a guaranteed support level.",
      },
    ],
  },
  {
    title: "Distinguish a retracement from an extension",
    shortTitle: "Distinguish a retracement from an extension",
    blocks: [
      {
        type: "paragraph",
        children:
          "A retracement measures a partial return through a prior move. An extension projects a distance beyond a selected endpoint, sometimes using a third anchor. Because platforms offer different tools, a label such as 161.8% is incomplete without its anchor convention. State the equation instead of relying only on a drawing.",
      },
      {
        type: "example",
        title: "A projection with its rule written down",
        children: [
          "For this particular teaching convention, project 1.618 times a 0.0400 rise upward from low 1.0800: 1.0800 + 1.618 × 0.0400 = 1.14472. This is one explicitly defined projection, not the formula for every three-anchor extension tool. It does not establish a target the price must reach.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Using a line as a hypothetical target also requires an entry and a failure level before a reward-to-risk ratio can be calculated. If no entry or invalidation is defined, calling an extension “excellent reward” is incomplete. Costs and available quote precision belong in the same plan.",
      },
    ],
  },
  {
    title: "Calculate classic pivot references",
    shortTitle: "Calculate classic pivot references",
    blocks: [
      {
        type: "paragraph",
        children:
          "A classic pivot uses the previous completed period’s high, low and close. The central pivot P is their sum divided by three. Classic first reference levels are R1 = 2P − low and S1 = 2P − high; R2 = P + (high − low) and S2 = P − (high − low). These are one family of formulas. Other pivot types can use different inputs or weights.",
      },
      {
        type: "formula",
        expression: "P = (H + L + C)/3; R1 = 2P − L; S1 = 2P − H",
        explanation:
          "H, L and C belong to the selected previous completed period, not unfinished values from the current one.",
      },
      {
        type: "comparisonTable",
        caption: "Classic pivots for invented prior EUR/USD prices",
        columns: ["Reference", "Given input or result"],
        rows: [
          ["Previous high", "1.1200"],
          ["Previous low", "1.0800"],
          ["Previous close", "1.1000"],
          ["P", "1.1000"],
          ["R1 / S1", "1.1200 / 1.0800"],
          ["R2 / S2", "1.1400 / 1.0600"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A day ending at midnight on one provider can differ from another provider’s daily boundary. Their highs, lows and closes can differ and so can their pivots. Using today’s unfinished high inside a formula for yesterday’s pivot is a different calculation. Agree on the session, timezone and pivot family before comparing numbers.",
      },
    ],
  },
  {
    title: "Divergence compares corresponding swings",
    shortTitle: "Divergence compares corresponding swings",
    blocks: [
      {
        type: "paragraph",
        children:
          "A common bearish divergence definition is a higher price swing high accompanied by a lower oscillator high at the corresponding observations. A common bullish divergence compares a lower price low with a higher oscillator low. These descriptions concern disagreement between selected swings; the word divergence does not guarantee a trend reversal.",
      },
      {
        type: "example",
        title: "Price and RSI telling different recent stories",
        children: [
          "In a fictional GBP/USD chart, price highs are 1.2700 and 1.2800, while RSI values at the associated completed bars are 72 and 65. Price made a higher high while measured momentum at those selected highs was lower.",
          "The next price can still rise to 1.2900. An uptrend can weaken in measured momentum and continue. To test a claim, write the two dates, swing selection rule, RSI settings, subsequent confirmation and invalidation first.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Some traders discuss hidden divergence with different high/low relations. Definitions vary, so label the version instead of assuming every use of the word means the same pattern. Comparing a price peak from Tuesday with an unrelated oscillator reading from Friday manufactures an apparent disagreement. Match the observations deliberately.",
      },
    ],
  },
  {
    title: "Read candle anatomy and context first",
    shortTitle: "Read candle anatomy and context first",
    blocks: [
      {
        type: "paragraph",
        children:
          "A candle records open, high, low and close for a chosen interval. The real body spans open to close; wicks show the remaining range. A green candle commonly has close above open and red close below open, but platform colours are configurable. The shape does not show the exact order of all intrabar moves or the number of participants.",
      },
      {
        type: "paragraph",
        children:
          "Modern candle analysis is associated with historical Japanese market practices. Munehisa Homma is often linked to early rice-market analysis, but attributing the exact modern OHLC candle to one documented invention is too confident. English-language popularisation came much later. Knowing this history does not increase a pattern’s reliability by itself.",
      },
      {
        type: "paragraph",
        children:
          "Before naming a candle, record its body size relative to its whole range, the lengths of both wicks and the prior price context. A hammer-shaped candle after a decline is conventionally discussed differently from the same shape after a rise. “Small” and “long” need a numerical rule if you want another learner to reproduce the classification.",
      },
    ],
  },
  {
    title: "Use single-candle names as a practical vocabulary",
    shortTitle: "Use single-candle names as a practical vocabulary",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Six common one-candle shapes",
        columns: ["Name", "Shape and usual context", "What remains unknown"],
        rows: [
          [
            "Doji",
            "Open and close near each other",
            "Next direction; path inside the candle",
          ],
          [
            "Hammer",
            "Small body near top, long lower wick after decline",
            "Whether a later recovery continues",
          ],
          [
            "Inverted hammer",
            "Small body near bottom, long upper wick after decline",
            "Whether buying persists",
          ],
          [
            "Hanging man",
            "Hammer-like shape after a rise",
            "Whether the trend actually reverses",
          ],
          [
            "Shooting star",
            "Small body near bottom, long upper wick after a rise",
            "Whether sellers sustain control",
          ],
          [
            "Marubozu",
            "Little or no wick; body occupies most of range",
            "Whether the intrabar path was smooth",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A doji is not proof that every buyer and seller has become equally uncertain; it records nearly matching open and close. A marubozu does not prove price moved only one way during the interval: four OHLC values cannot reconstruct the entire path. Describe what the data records before adding a psychological story.",
      },
      {
        type: "example",
        title: "The same shape in two settings",
        children: [
          "A fictional USD/JPY bar has open 150.20, high 150.30, low 149.80 and close 150.25. Its small body is near the top with a long lower wick. After a decline it might meet a stated hammer rule; after a rise it might meet a hanging-man rule. The previous context changed the label, not the four prices.",
        ],
      },
    ],
  },
  {
    title: "Compare two-candle bodies carefully",
    shortTitle: "Compare two-candle bodies carefully",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Six common two-candle patterns",
        columns: ["Name", "Usual textbook relationship"],
        rows: [
          [
            "Bullish engulfing",
            "After decline: second rising body covers first falling body",
          ],
          [
            "Bearish engulfing",
            "After rise: second falling body covers first rising body",
          ],
          [
            "Bullish harami",
            "After decline: smaller body sits inside previous large falling body",
          ],
          [
            "Bearish harami",
            "After rise: smaller body sits inside previous large rising body",
          ],
          [
            "Piercing line",
            "Falling body then rising close above its midpoint; textbook gap conditions vary",
          ],
          [
            "Dark cloud cover",
            "Rising body then falling close below its midpoint; textbook gap conditions vary",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Engulfing usually refers to the real bodies, not necessarily the entire wick-to-wick range. Define whether equality at a boundary counts. Harami describes a smaller nested body; direction, gap requirements and thresholds can vary between references. A name alone is not a reproducible trading rule.",
      },
      {
        type: "example",
        title: "A body can engulf without covering every wick",
        children: [
          "Imagine EUR/USD candle A opens at 1.1050 and closes at 1.1020. Candle B opens at 1.1010 and closes at 1.1060. B’s body covers A’s 1.1020–1.1050 body. That comparison says nothing yet about A’s or B’s high and low, spread, prior trend or the following candle.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Near-continuous Forex quotes often show textbook opening gaps less neatly than session-based stock charts. If you relax a gap condition for Forex, write the adapted definition and test that rule. Do not claim a strict textbook pattern appeared when one of its required conditions was absent.",
      },
    ],
  },
  {
    title: "Read three-candle sequences without guessing probabilities",
    shortTitle: "Read three-candle sequences without guessing probabilities",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Four common three-candle sequences",
        columns: ["Name", "Basic description"],
        rows: [
          [
            "Morning star",
            "Falling body, small-bodied pause, then strong rising body after decline",
          ],
          [
            "Evening star",
            "Rising body, small-bodied pause, then strong falling body after rise",
          ],
          [
            "Three white soldiers",
            "Three advancing rising bodies, often discussed after decline or consolidation",
          ],
          [
            "Three black crows",
            "Three declining falling bodies, often discussed after rise or consolidation",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "These bring the practical candle vocabulary to sixteen core examples. It is not a list of every name ever used. “Strong,” “pause” and “advancing” need thresholds and close/open relationships for a repeatable test. Some definitions also require gaps, wick restrictions or a close into the first body. Record the version rather than merging incompatible descriptions.",
      },
      {
        type: "paragraph",
        children:
          "A third candle completes a three-candle pattern only after its needed data becomes available. You cannot count its eventual close as information known at the second candle. Waiting for another observation may reduce one uncertainty while giving a later entry; confirmation is a trade-off, not free certainty.",
      },
    ],
  },
  {
    title: "Separate multi-bar chart patterns from candles",
    shortTitle: "Separate multi-bar chart patterns from candles",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Common larger patterns",
        columns: ["Pattern", "Boundaries to define"],
        rows: [
          [
            "Double top / bottom",
            "Two peaks or troughs, tolerance, intervening swing and confirmation line",
          ],
          [
            "Head and shoulders / inverse",
            "Three swings, middle extreme, two shoulders and neckline",
          ],
          [
            "Triangle",
            "Converging boundaries; symmetrical, ascending or descending convention",
          ],
          [
            "Flag / pennant",
            "A prior sharp move and short consolidation; boundaries and maximum duration",
          ],
          ["Wedge", "Converging lines sloping in the same direction"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A potential double top is not a completed reversal just because two highs look similar. A rule might require a completed close below the intervening low, with tolerance for peak separation and price difference. Another rule might use an intrabar breach. Each produces a different sample. A failed confirmed pattern also needs a definition, such as return above a stated boundary.",
      },
      {
        type: "example",
        title: "Define a double top before revealing the result",
        children: [
          "A British learner records fictional GBP/USD peaks at 1.2800 and 1.2810 with an intervening low at 1.2700. Their written rule allows highs within 15 pips and requires a completed hourly close below 1.2700. A brief quote at 1.2698 followed by a 1.2710 close does not satisfy that close rule.",
          "Drawing the peaks only after a later decline introduces hindsight. A friend should be able to reproduce the same selection from the rule without seeing the future.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Pattern targets based on height are projections under a convention, not promises of movement. Changing timeframe can hide or create a shape because bars aggregate different intervals. A line drawn through chosen extremes is subjective unless the selection rule is explicit.",
      },
    ],
  },
  {
    title: "Test confirmation, failure and costs together",
    shortTitle: "Test confirmation, failure and costs together",
    blocks: [
      {
        type: "paragraph",
        children:
          "Several tools agreeing may be correlated rather than independent. Fibonacci, pivots, a moving average and a pattern neckline can cluster near one price, but the cluster is not proof of a barrier. Ask which inputs each tool used and what genuinely new information was added. Then record a plausible alternative outcome.",
      },
      {
        type: "example",
        title: "A demo plan with a measurable failure level",
        children: [
          "For an invented GBP/USD long, use entry 1.2720, stop reference 1.2680 and hypothetical target 1.2800. Price distances are 40 and 80 conventional pips, giving a gross 2:1 reward-to-risk ratio. This is a hypothetical plan, not a recommendation.",
          "If combined transaction and execution costs are represented by two additional pips of loss and two fewer pips of gain, the illustrative ratio is 78/42, about 1.86:1. A good-looking gross ratio does not establish the chance of reaching the target.",
        ],
      },
      {
        type: "learningLink",
        title: "Open the Risk / Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Enter the invented GBP/USD long’s entry, stop and target. Check the gross price distances, then write the separate spread, fee and execution assumptions. The tool measures a proposed plan; it does not validate a pattern.",
      },
      {
        type: "paragraph",
        children:
          "Separate a plan’s arithmetic from its evidence. Test the unchanged rule on later examples, retain failures, avoid counting overlapping trades as independent events and account for costs. Optimising many settings until old data looks good is overfitting. A short successful sample is not a guarantee for future prices.",
      },
    ],
  },
  {
    title: "Practise a complete chart explanation",
    shortTitle: "Practise a complete chart explanation",
    blocks: [
      {
        type: "exercise",
        prompt:
          "For EUR/USD low 1.0800 and high 1.1200, calculate the 38.2% and 61.8% retracements from the high. Which standard halfway level is not a Fibonacci ratio?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The move is 0.0400. Levels are 1.10472 and 1.09528. The halfway reference is 1.10000; 50% is included by convention.",
      },
      {
        type: "exercise",
        prompt:
          "GBP/USD makes highs at 1.2700 and 1.2800 while corresponding RSI readings are 72 and 65. What observation is present, and what cannot be concluded?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "This fits the stated bearish-divergence description: higher price high with lower RSI high. It cannot establish that the next price must fall. Define subsequent confirmation, invalidation, inputs and costs.",
      },
      {
        type: "paragraph",
        children:
          "Finally describe a pattern without using its name: specify prices, dates, candle relations, tolerance, prior trend, timeframe and completion rule. Ask whether another learner can reproduce it. If not, improve the definition before assessing results. Level 5 will build on these limits by making the planned cash loss and position size explicit.",
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
          "Calculate anchored Fibonacci retracements and classic pivots.",
          "Describe sixteen core candle patterns and common multi-bar patterns with context.",
          "Define divergence, confirmation, failure and costs before testing a chart idea.",
        ],
        closing: [
          "Use a demo notebook to distinguish what the chart shows, what your calculation describes and what remains unknown. A clear explanation includes a possible failure, not only the attractive outcome.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices and account examples in this lesson are invented teaching data. Indicators and chart patterns cannot guarantee a trade outcome. Leverage, spreads, fees, gaps and execution differences can increase losses. Practise the arithmetic and observation rules without risking essential living money.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can identify the pair, source, timeframe, completed bars and units.",
          "I can repeat the worked calculation and explain the inputs.",
          "I can state a limitation and an alternative outcome.",
          "I can explain the exercise answers without treating them as trade instructions.",
          "I know which PipStart tool supports the arithmetic and which uncertainties it cannot solve.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "MacTutor — Leonardo of Pisa (Fibonacci)",
            url: "https://mathshistory.st-andrews.ac.uk/Biographies/Fibonacci/",
          },
          {
            title: "CME Group — Technical Analysis",
            url: "https://www.cmegroup.com/education/courses/technical-analysis",
          },
          {
            title: "CME Group — Chart Types",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar",
          },
          {
            title: "John Bollinger — Indicator overlap and band limitations",
            url: "https://www.bollingerbands.com/bollinger-band-rules",
          },
        ],
      },
    ],
  },
];
