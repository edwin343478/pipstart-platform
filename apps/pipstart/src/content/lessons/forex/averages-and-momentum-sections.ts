import type { LessonSection } from "../../lesson-content";

export const averagesAndMomentumSections: LessonSection[] = [
  {
    title: "Start with price, then add a question",
    shortTitle: "Start with price, then add a question",
    blocks: [
      {
        type: "paragraph",
        children:
          "An indicator is a calculation made from a chosen data series. Most tools in this lesson use earlier prices: they rearrange information already on the chart rather than receiving tomorrow’s price in advance. An average asks about the recent centre of prices; a momentum tool asks about recent changes or the close’s place in a range. Those are useful descriptive questions, but neither is the same as finding a profitable trade.",
      },
      {
        type: "paragraph",
        children:
          "Level 3 taught you to identify the instrument, timeframe, quote source and completed bars. Keep that habit here. A 14-period setting on a one-hour chart uses hourly observations, while 14 periods on a daily chart uses daily observations. There may be different trading-session boundaries, weekend gaps and available history. Write the complete input before comparing two readings.",
      },
      {
        type: "example",
        title: "A shopkeeper’s weekly notebook",
        children: [
          "A shopkeeper in Germany records daily sales in euros. A five-day average can make the daily ups and downs easier to see. It cannot know that tomorrow the road outside the shop will close. Price indicators have a similar blind spot: a tidy line does not include every cause of the next change.",
        ],
      },
    ],
  },
  {
    title: "Calculate a simple moving average",
    shortTitle: "Calculate a simple moving average",
    blocks: [
      {
        type: "paragraph",
        children:
          "A simple moving average, or SMA, gives each observation in its window equal weight. If you choose five completed closes, add those five closes and divide by five. When a new close arrives, remove the oldest observation, add the new one and calculate again. “Moving” means the window rolls through the data; it does not mean the indicator looks ahead.",
      },
      {
        type: "formula",
        expression: "SMA = sum of the last n selected prices ÷ n",
        explanation:
          "n is the number of observations. Specify whether the input is close, open or another price series.",
      },
      {
        type: "comparisonTable",
        caption: "Five invented EUR/USD closes",
        columns: ["Observation", "Close", "Included in first average?"],
        rows: [
          ["1", "1.0800", "Yes"],
          ["2", "1.0900", "Yes"],
          ["3", "1.1000", "Yes"],
          ["4", "1.1100", "Yes"],
          ["5", "1.1200", "Yes"],
        ],
      },
      {
        type: "example",
        title: "Build the number yourself",
        children: [
          "The five closes total 5.5000. Divide by five and the average is 1.1000 US dollars per euro. If the sixth close is 1.0900, remove 1.0800. The new sum is 5.5100 and the new SMA is 1.1020.",
          "The newest close fell, yet the average rose slightly. The incoming 1.0900 is higher than the outgoing 1.0800. The average’s change depends on both numbers, not simply on whether the most recent candle rose or fell.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-4/rolling-average.svg",
        desktopSrc: "/images/lessons/forex/level-4/rolling-average-desktop.svg",
        width: 720,
        height: 400,
        alt: "Five old observations roll forward by removing the oldest price and adding the newest.",
        caption:
          "A moving window uses completed observations. The native table above contains the exact values.",
      },
    ],
  },
  {
    title: "Understand weighting and lag",
    shortTitle: "Understand weighting and lag",
    blocks: [
      {
        type: "paragraph",
        children:
          "An exponential moving average, or EMA, puts more weight on recent observations. A common EMA update uses a smoothing factor of 2 divided by n + 1: new EMA equals that factor times the new price plus the remaining weight times the previous EMA. A five-period factor is 2/6, or one third. Platforms need an initial value, often seeded from an earlier average, so a short history can cause small differences.",
      },
      {
        type: "formula",
        expression:
          "New EMA = α × new price + (1 − α) × previous EMA; α = 2/(n + 1)",
        explanation:
          "This common exponential weighting differs from Wilder’s smoothing, whose update factor is 1/n.",
      },
      {
        type: "example",
        title: "A new number changes the balance",
        children: [
          "Suppose a teaching EMA is 1.1000, n is five and the new EUR/USD close is 1.0900. One third of 1.0900 plus two thirds of 1.1000 is about 1.09667. This example assumes the previous EMA is already given; it is not a claim that every platform will seed the series identically.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A short average follows recent changes more closely and can wobble more. A long average is smoother but can take longer to reflect a turn. More responsive does not mean more accurate about the future. Both remain dependent on the observations and weighting rule. Moving averages are general statistical smoothing methods; there is no single inventor of every moving average used in finance.",
      },
    ],
  },
  {
    title: "Read crossings without turning them into promises",
    shortTitle: "Read crossings without turning them into promises",
    blocks: [
      {
        type: "paragraph",
        children:
          "A price crossing an average means the selected price moved to the other side of that calculated line. A short average crossing a longer one means two summaries changed their ordering. Define whether a crossing is allowed during an unfinished bar or only after the close; those are different rules. A line can be crossed several times in a sideways market, producing whipsaw: repeated changes of direction without a sustained move.",
      },
      {
        type: "example",
        title: "A bus timetable that keeps changing",
        children: [
          "A commuter in the United Kingdom compares a short average of recent journey times with a longer average. The short average rises after several delays. That describes those journeys; it cannot guarantee the next bus will be late. Likewise, an average crossing is a record of a change, not an appointment with a future price.",
        ],
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A rising average does not guarantee a rising next candle. A buy/sell interpretation also needs an explicit entry, invalidation, cost model and evidence from later observations. Do not move the average length after seeing the result and then call the adjusted rule a successful prediction.",
        ],
      },
    ],
  },
  {
    title: "RSI measures changes, not value",
    shortTitle: "RSI measures changes, not value",
    blocks: [
      {
        type: "paragraph",
        children:
          "The relative strength index, or RSI, compares the size of recent upward close-to-close changes with downward changes. It is normally shown on a 0–100 scale. The standard interpretation does not compare one currency’s national economy with another; “relative strength” here concerns the selected price changes. J. Welles Wilder introduced RSI, and 14 periods is a commonly used starting setting, not a universally best one.",
      },
      {
        type: "paragraph",
        children:
          "Separate positive changes from negative ones. A gain contributes its magnitude to the gain series and zero to losses; a decline contributes its magnitude to losses and zero to gains. Wilder-style calculations start with averages and then smooth later values. A smaller lookback changes the response, and different smoothing conventions can produce different readings. A beginner should understand the ratio before expecting exact agreement across platforms.",
      },
      {
        type: "formula",
        expression:
          "RS = average gain ÷ average loss; RSI = 100 − 100/(1 + RS)",
        explanation:
          "Use gain/loss magnitudes under a documented averaging convention. If average loss is zero with positive gains, the limiting RSI is 100. If both are zero, check the platform’s flat-series convention.",
      },
      {
        type: "example",
        title: "Read a ratio without predicting the next day",
        children: [
          "If a simplified example has average upward changes of 0.0030 and average downward changes of 0.0010 in EUR/USD, RS is three and RSI is 75. That expresses the recent imbalance under the assumed inputs. It does not tell you that the euro must fall tomorrow or that a reversal is due.",
        ],
      },
    ],
  },
  {
    title: "Overbought and oversold are descriptions",
    shortTitle: "Overbought and oversold are descriptions",
    blocks: [
      {
        type: "paragraph",
        children:
          "RSI readings above 70 and below 30 are commonly called overbought and oversold. These labels do not mean “too expensive according to economic value” or “guaranteed bargain.” They describe the indicator’s selected momentum calculation. A strong trend can remain at an extreme for many observations, and a quiet range can create frequent crossings.",
      },
      {
        type: "example",
        title: "A runner who keeps a fast pace",
        children: [
          "A runner in Canada has accelerated during several recent minutes. A pace gauge reports a high reading. That runner might slow down, continue at speed or accelerate again. The reading describes recent movement; it does not decide the next movement.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A reading near 50 means the smoothed average gains and losses are similar under the method. It does not mean price is fair, the spread is small or the market is risk-free. Always return to the price chart: where were the swings, was the last bar complete, and what would contradict your explanation?",
      },
    ],
  },
  {
    title: "Separate the parts of MACD",
    shortTitle: "Separate the parts of MACD",
    blocks: [
      {
        type: "paragraph",
        children:
          "Moving average convergence divergence, or MACD, compares a faster exponential average with a slower one. A common configuration subtracts a 26-period EMA from a 12-period EMA. The signal line smooths the MACD series, commonly over nine periods. A histogram convention plots MACD minus its signal line. MACD is not bounded to 0–100: a value of 70 here does not carry RSI’s meaning.",
      },
      {
        type: "formula",
        expression: "MACD = fast EMA − slow EMA; histogram = MACD − signal",
        explanation:
          "Specify the averaging and display convention. Some platform implementations display MACD itself as bars and use a different smoothing method for the signal.",
      },
      {
        type: "example",
        title: "Three different facts on one display",
        children: [
          "Suppose a teaching EUR/USD fast EMA is 1.1050 and slow EMA is 1.1030. MACD is +0.0020. If the signal is +0.0015, MACD minus signal is +0.0005.",
          "A shrinking positive histogram can mean MACD is getting closer to its signal while both are still positive. “Less positive” is not the same as “negative,” and a histogram crossing zero is not the same as MACD crossing its own zero line.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Above MACD’s zero line, the faster EMA exceeds the slower EMA. Below it, their order is reversed. A signal-line cross concerns MACD relative to its smoothed value. Check the legend rather than assuming every platform draws the same histogram. MetaTrader documentation illustrates why the actual platform’s calculation matters.",
      },
    ],
  },
  {
    title: "Locate a close with the stochastic oscillator",
    shortTitle: "Locate a close with the stochastic oscillator",
    blocks: [
      {
        type: "paragraph",
        children:
          "The stochastic oscillator asks where the selected close lies within the recent highest-high to lowest-low range. A basic %K calculation subtracts the lowest low from the close, divides by highest high minus lowest low and multiplies by 100. A %D line smooths %K. Fast, slow and full versions change the smoothing, so record the complete settings rather than only one number.",
      },
      {
        type: "formula",
        expression:
          "%K = 100 × (close − lowest low)/(highest high − lowest low)",
        explanation:
          "A zero high–low denominator needs a platform-defined convention. The input window and smoothing must be specified.",
      },
      {
        type: "example",
        title: "A thermometer within a weekly range",
        children: [
          "In Japan, a week’s fictional temperatures range from 20 to 30 degrees. A closing reading of 28 lies 80% of the way from the low to the high. That position says nothing about whether tomorrow will be hotter.",
          "With an invented USD/JPY lookback low of 150.00, high of 151.00 and close of 150.80, the unsmoothed %K is 80. A close of 150.20 would give 20. Those are positions inside the chosen window, not probabilities of a winning trade.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Stochastic readings above 80 and below 20 are conventional reference areas. A close can stay near the top of successive windows during a trend. RSI and stochastic both concern momentum but calculate different things: RSI compares changes, while stochastic locates a close in a range.",
      },
    ],
  },
  {
    title: "Compare tools before combining them",
    shortTitle: "Compare tools before combining them",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Ask one clear question of each tool",
        columns: ["Tool", "Input question", "Important limit"],
        rows: [
          [
            "SMA / EMA",
            "Where is a weighted or equal-weight recent centre?",
            "Length and weighting affect delay",
          ],
          [
            "RSI",
            "How do recent gains compare with losses?",
            "Extremes can persist",
          ],
          [
            "MACD",
            "How do faster and slower summaries compare?",
            "Unbounded; display convention matters",
          ],
          [
            "Stochastic",
            "Where is the close inside a recent range?",
            "Smoothing and anchors affect the reading",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Putting three price-derived indicators under the same chart does not create three independent sources of evidence. They often respond to the same closes. A clearer chart usually starts with one question and the smallest set of tools needed to answer it. Remove a tool if you cannot explain its inputs, units and limitation.",
      },
      {
        type: "paragraph",
        children:
          "For a USD account, a MACD difference on EUR/USD is quoted in price units, not account profit. For USD/JPY, the pip convention usually differs from EUR/USD. Use the actual contract and quote units before translating any price movement into cash.",
      },
      {
        type: "learningLink",
        title: "Open the Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Compare the cash value of a conventional pip for EUR/USD and USD/JPY under documented lot size and account-currency conversion. The calculator translates units; it does not forecast an indicator signal.",
      },
    ],
  },
  {
    title: "Use a completed-bar observation routine",
    shortTitle: "Use a completed-bar observation routine",
    blocks: [
      {
        type: "paragraph",
        children:
          "Choose a demo chart and save the pair, provider, timeframe, price input, lookback and smoothing. Let one bar finish. Record price, the indicator value and the time of that close. Then write one descriptive sentence: “The faster average is above the slower average,” for example. Keep that separate from your hypothesis about a later move.",
      },
      {
        type: "paragraph",
        children:
          "If an indicator changes during the current bar, that may be ordinary recalculation on live data rather than dishonest repainting. Other tools use future bars to confirm a swing and can retrospectively mark an earlier point. Read the method and distinguish what was actually available at decision time. Never use a future close to evaluate an earlier real-time decision.",
      },
      {
        type: "example",
        title: "Two learners using different clocks",
        children: [
          "A learner in France uses 14 daily bars while a learner in Australia uses 14 hourly bars. Their RSI numbers need not agree even on the same currency pair. Different feeds, bar boundaries or unfinished closes add further differences. First align the inputs; only then discuss the readings.",
        ],
      },
    ],
  },
  {
    title: "Practise the calculations and explain the limits",
    shortTitle: "Practise the calculations and explain the limits",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Using the five EUR/USD closes 1.0800, 1.0900, 1.1000, 1.1100 and 1.1200, calculate the original SMA and the next SMA after adding 1.0900. Then explain why the average can rise while the new close falls.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The first average is 1.1000. Removing 1.0800 and adding 1.0900 gives 1.1020. The replacement exceeds the dropped value; the rolling average is not simply the newest price’s direction.",
      },
      {
        type: "exercise",
        prompt:
          "An unsmoothed stochastic window has low 0.6500, high 0.6600 and close 0.6575 in AUD/USD. Calculate %K. Is it a 75% chance of a rise?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "%K is 100 × 0.0075/0.0100 = 75. It locates the close 75% of the way through that range. It is not a probability.",
      },
      {
        type: "paragraph",
        children:
          "Write one situation where each indicator can mislead you: a crossover during a range, persistent RSI extremes in a trend, a histogram change confused with a zero-line cross, or a stochastic setting compared with a differently smoothed version. Explaining a limit is part of understanding the tool, not an optional footnote.",
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
          "Calculate and update simple and exponential averages.",
          "Explain RSI, MACD and stochastic inputs without turning readings into forecasts.",
          "Compare completed-bar settings and recognise correlated evidence.",
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
            title: "MetaTrader 5 — Moving Average",
            url: "https://www.metatrader5.com/en/terminal/help/indicators/trend_indicators/ma",
          },
          {
            title: "MetaTrader 5 — RSI",
            url: "https://www.metatrader5.com/en/terminal/help/indicators/oscillators/rsi",
          },
          {
            title: "MetaTrader 5 — MACD (platform convention)",
            url: "https://www.metatrader5.com/en/terminal/help/indicators/oscillators/macd",
          },
          {
            title: "CME Group — Oscillators: MACD, RSI, Stochastics",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/oscillators-macd-rsi-stochastics",
          },
        ],
      },
    ],
  },
];
