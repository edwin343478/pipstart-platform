import type { LessonSection } from "../../lesson-content";

export const volatilityToolsSections: LessonSection[] = [
  {
    title: "Volatility describes distance, not direction",
    shortTitle: "Volatility describes distance, not direction",
    blocks: [
      {
        type: "paragraph",
        children:
          "Volatility is the variability of a price series under a specified measure. Two charts can have the same upward net change but very different journeys: one rises quietly and another swings sharply up and down before ending at the same level. A volatility tool summarises parts of that journey. It does not choose buy or sell, and it cannot set a maximum possible future loss.",
      },
      {
        type: "paragraph",
        children:
          "This lesson compares average true range, which summarises ranges and certain gaps, with Bollinger Bands, which place a dispersion measure around an average. Keep timeframe and units visible. A daily range in yen cannot be compared directly with an hourly range in dollars; the number is meaningful only alongside its definition.",
      },
      {
        type: "example",
        title: "Allowing time for a busy road",
        children: [
          "A traveller in Japan knows that journey times vary a lot on a busy road. Allowing extra time may improve planning, but the usual variation does not promise the longest possible delay or say which vehicle will arrive first. Price variability has the same distinction between recent description and future certainty.",
        ],
      },
    ],
  },
  {
    title: "Find the true range before averaging",
    shortTitle: "Find the true range before averaging",
    blocks: [
      {
        type: "paragraph",
        children:
          "An ordinary bar range is its high minus its low. That can miss a jump from the previous close. True range compares three non-negative distances: current high minus current low, the absolute distance from current high to previous close, and the absolute distance from current low to previous close. The largest is selected. Absolute distance means ignore the sign when measuring how far apart two prices are.",
      },
      {
        type: "formula",
        expression:
          "TR = max(high − low, |high − previous close|, |low − previous close|)",
        explanation:
          "The previous close captures a gap that may not appear inside the current high–low range.",
      },
      {
        type: "comparisonTable",
        caption: "Invented USD/JPY bar after a gap",
        columns: ["Input or calculation", "Value"],
        rows: [
          ["Previous close", "150.00"],
          ["Current high", "151.20"],
          ["Current low", "150.80"],
          ["High − low", "0.40 yen"],
          ["|High − previous close|", "1.20 yen"],
          ["|Low − previous close|", "0.80 yen"],
          ["True range", "1.20 yen = 120 conventional pips"],
        ],
      },
      {
        type: "paragraph",
        children:
          "If you used only the 0.40-yen high–low range, you would miss much of the move from the earlier close. This matters around weekend openings, session differences and any instrument with discontinuous quotes. True range still summarises observed prices; it does not guarantee an executable fill existed at every intermediate price.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-4/true-range-gap.svg",
        desktopSrc: "/images/lessons/forex/level-4/true-range-gap-desktop.svg",
        width: 720,
        height: 400,
        alt: "Previous close 150.00 below a current USD/JPY range of 150.80 to 151.20; true range spans 1.20 yen.",
        caption:
          "A gap can make true range larger than the current candle’s high–low range.",
      },
    ],
  },
  {
    title: "Build and interpret ATR",
    shortTitle: "Build and interpret ATR",
    blocks: [
      {
        type: "paragraph",
        children:
          "Average true range, or ATR, smooths successive true ranges. J. Welles Wilder developed ATR and presented it in his 1978 work on technical trading systems. A common lookback is 14 periods. Wilder-style smoothing uses the previous ATR multiplied by n − 1, adds the latest true range, then divides by n. Different platforms can use different averaging choices, so check their documentation.",
      },
      {
        type: "formula",
        expression:
          "Updated Wilder ATR = ((n − 1) × previous ATR + latest TR) ÷ n",
        explanation:
          "The initial ATR may be seeded from an average of earlier true ranges. A simple average of three ranges is a teaching exercise, not an exact live 14-period ATR.",
      },
      {
        type: "example",
        title: "First learn the units",
        children: [
          "Three invented USD/JPY true ranges are 0.60, 1.20 and 0.90 yen. Their simple mean is 0.90 yen, or 90 conventional 0.01-yen pips.",
          "For a separate update example, suppose a previous 14-period ATR is 0.80 yen and the latest TR is 1.20. The updated value is (13 × 0.80 + 1.20)/14, about 0.82857 yen. It reacts to the latest range but does not instantly become 1.20.",
        ],
      },
      {
        type: "paragraph",
        children:
          "ATR has no positive or negative direction. A large fall and a large rise can both increase it. A daily EUR/USD ATR of 0.0060 corresponds to 60 conventional pips, whereas USD/JPY uses a conventional 0.01 pip step. Always label the quote units before calling a number small or large.",
      },
    ],
  },
  {
    title: "Compare like with like",
    shortTitle: "Compare like with like",
    blocks: [
      {
        type: "paragraph",
        children:
          "A daily ATR and a five-minute ATR summarise different observations. Two pairs with different quote magnitudes can have different raw ATR numbers even if their percentage variability is similar. For a descriptive cross-market comparison, ATR divided by a suitable price and multiplied by 100 produces an approximate percentage measure. Use comparable timeframes and price conventions; this still is not a prediction.",
      },
      {
        type: "example",
        title: "Keep both the ruler and the unit",
        children: [
          "An invented EUR/USD daily ATR of 0.0060 at price 1.1000 is roughly 0.545% of that price. A USD/JPY ATR of 0.90 at price 150.00 is 0.60%. The raw numbers 0.0060 and 0.90 look very different, but their percentage descriptions are closer.",
          "Neither percentage says how much the pair will move tomorrow. A large event, thin liquidity or a gap can produce movement outside the recent sample.",
        ],
      },
      {
        type: "paragraph",
        children:
          "ATR often increases after the price movement has already occurred. Waiting for a larger number does not guarantee calmer execution, and a low number does not prove safety. A calm sample can be followed by a sharp announcement-driven move.",
      },
    ],
  },
  {
    title: "Translate distance into a demo risk plan",
    shortTitle: "Translate distance into a demo risk plan",
    blocks: [
      {
        type: "paragraph",
        children:
          "A planned stop distance is a price distance from an intended entry to an invalidation level. Some learners compare this distance with recent ATR as a descriptive check. An ATR multiple is not automatically a good stop: the reason the idea fails, trading costs, instrument specification and execution still matter. A stop can be wider yet expose less money if the position is smaller.",
      },
      {
        type: "example",
        title: "A fixed cash budget with two distances",
        children: [
          "For an invented US$1,000 demo account, a 1% planning budget is US$10. On EUR/USD with standard 100,000-unit lots and a USD account, a conventional pip is US$10 per standard lot. At a 20-pip stop, the ideal size is 10/(20 × 10) = 0.05 lots. At a 40-pip stop, it is 0.025 lots.",
          "If the provider only permits 0.01-lot steps, round down to 0.02, giving a planned US$8 price-distance loss before extra costs. Rounding up to 0.03 gives US$12 and exceeds the US$10 plan. Minimum volume may mean no allowable trade fits the budget; skipping is a valid result.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Same ideal cash budget; different price distance",
        columns: ["Stop distance", "Ideal size", "Planned price loss"],
        rows: [
          ["20 pips", "0.05 lots", "US$10"],
          ["40 pips", "0.025 lots", "US$10"],
          ["40 pips rounded down", "0.02 lots", "US$8 before costs"],
        ],
      },
      {
        type: "learningLink",
        title: "Open the Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Use a demo balance of US$1,000, risk input 1%, EUR/USD and a USD account. Compare 20 and 40 pips, check the permitted volume step and leave room for costs. The percentage is a teaching assumption, not a recommendation.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A stop order is not a guaranteed loss ceiling. Spread, commissions, conversion, gaps and slippage may change the cash outcome. Widening the stop while keeping the same position increases planned price-distance loss; it does not solve risk by itself.",
        ],
      },
    ],
  },
  {
    title: "Understand the three Bollinger lines",
    shortTitle: "Understand the three Bollinger lines",
    blocks: [
      {
        type: "paragraph",
        children:
          "John Bollinger developed Bollinger Bands in the 1980s. A conventional setup places a 20-period simple moving average in the middle and outer lines two standard deviations above and below it. These are defaults, not instructions that every market or timeframe should use them. The middle line describes a recent centre; standard deviation describes dispersion around a mean under a calculation convention.",
      },
      {
        type: "formula",
        expression:
          "Upper band = mean + k × standard deviation; lower band = mean − k × standard deviation",
        explanation:
          "Choose a lookback, input price and multiplier k. Confirm whether the implementation uses population or sample standard deviation and how it handles the initial window.",
      },
      {
        type: "example",
        title: "Scores around a class average",
        children: [
          "A teacher in South Korea sees a class mean score of 70. A group with scores tightly clustered around 70 has less dispersion than one with scores spread far apart. A band calculation uses a similar idea about spread around a centre. It cannot determine the next pupil’s score from those earlier scores.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In an invented EUR/USD example, a mean of 1.1000 and standard deviation of 0.0020 with k = 2 give upper 1.1040 and lower 1.0960. The total band width is 0.0080, or 80 conventional pips. This arithmetic uses given inputs; calculating the standard deviation itself requires the whole window and its convention.",
      },
    ],
  },
  {
    title: "Read width, touches and squeezes carefully",
    shortTitle: "Read width, touches and squeezes carefully",
    blocks: [
      {
        type: "paragraph",
        children:
          "Bands widen when dispersion in the chosen sample grows and narrow when it shrinks. A squeeze is a description of unusually narrow bands under a comparison rule. It does not reveal the direction of a later breakout or ensure one arrives immediately. Define what “narrow” means relative to an earlier period rather than choosing an attractive example after the event.",
      },
      {
        type: "paragraph",
        children:
          "A price touching the upper band is relatively high under the current calculation, not an automatic sell. A lower-band touch is not an automatic buy. During a trend, successive closes can stay near an outer band. An older extreme leaving the window can also change the bands even if the latest candle is uneventful.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not claim that two standard-deviation bands guarantee 95% of future prices remain inside them. Rolling market observations are not automatically independent, normally distributed forecasts. A statistical convention in the formula does not create a reliable future probability.",
        ],
      },
      {
        type: "example",
        title: "Two ways the same touch can develop",
        children: [
          "In a fictional GBP/USD demo sequence, a close reaches the upper band. The next close may fall back toward the average, or it may rise while the upper band also moves higher. Both paths are compatible with the first observation. Write the competing possibilities before choosing a story.",
        ],
      },
    ],
  },
  {
    title: "Avoid counting the same evidence twice",
    shortTitle: "Avoid counting the same evidence twice",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Different summaries of recent variability",
        columns: [
          "Measure",
          "What it summarises",
          "What it does not establish",
        ],
        rows: [
          [
            "True range",
            "One bar’s range including certain gaps",
            "Direction of the next bar",
          ],
          [
            "ATR",
            "Smoothed recent true ranges",
            "Maximum future move or safe leverage",
          ],
          [
            "Band width",
            "Dispersion around the chosen average",
            "Guaranteed breakout direction",
          ],
          [
            "Band touch",
            "Position relative to calculated outer line",
            "Automatic reversal",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "ATR and Bollinger width are related descriptions derived from market prices, though their formulas differ. Adding both can help answer different questions, but agreement does not mean two independent witnesses have confirmed a trade. Averages, RSI and band calculations can all be responding to the same input history.",
      },
      {
        type: "example",
        title: "Two thermometers in one room",
        children: [
          "A family in Italy checks two thermometers beside each other. Similar readings can reassure them that the measurements agree, but they do not supply two separate forecasts of tomorrow’s weather. Likewise, several price-derived indicators cannot erase gaps, spreads or news uncertainty.",
        ],
      },
    ],
  },
  {
    title: "Write a volatility observation notebook",
    shortTitle: "Write a volatility observation notebook",
    blocks: [
      {
        type: "paragraph",
        children:
          "On one demo feed, record the pair, completed-bar time, timeframe, ATR lookback, smoothing, quote units, band lookback, multiplier and price input. Record the actual numbers before interpreting them. Note scheduled events separately. If you compare a quiet session with a busy one, use the same settings and define the sample rather than discarding inconvenient observations.",
      },
      {
        type: "paragraph",
        children:
          "Next, translate an observed distance into pips and an ideal cash amount. Keep the quote distance, position units, conversion and fees as separate entries. This helps expose a common mistake: treating a volatility reading as account risk even though no position size has been specified.",
      },
      {
        type: "learningLink",
        title: "Open the Profit / Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "For an invented EUR/USD long of 0.01 lot with a USD account, compare entry 1.1000 with exits 1.0980 and 1.0960. Check the price-distance losses of US$2 and US$4, then identify the costs or execution differences the calculation does not model.",
      },
    ],
  },
  {
    title: "Practise range and sizing arithmetic",
    shortTitle: "Practise range and sizing arithmetic",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Previous USD/JPY close is 150.00; today’s high is 151.20 and low is 150.80. Find high–low range, true range and conventional pips.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "High–low is 0.40 yen or 40 pips. Distances to the previous close are 1.20 and 0.80 yen; TR is the largest, 1.20 yen or 120 pips.",
      },
      {
        type: "exercise",
        prompt:
          "Given mean 1.1000, standard deviation 0.0020 and multiplier two, find both bands. If the stop distance doubles with cash budget and pip value fixed, what happens to ideal size?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Bands are 1.1040 and 1.0960. Ideal size halves. Recheck permitted volume increments and costs rather than rounding upward.",
      },
      {
        type: "paragraph",
        children:
          "To finish the exercise, explain why ATR cannot choose direction and why a band touch cannot supply its own probability. If you can calculate the value but cannot state the unknowns, revisit the interpretation sections.",
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
          "Calculate true range and interpret ATR units and smoothing.",
          "Explain Bollinger Band construction and its statistical limits.",
          "Translate distance into a rounded demo size without confusing volatility with cash risk.",
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
            title: "MetaTrader 5 — Average True Range",
            url: "https://www.metatrader5.com/en/terminal/help/indicators/oscillators/atr",
          },
          {
            title: "Fidelity — Average True Range",
            url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/atr",
          },
          {
            title: "John Bollinger — Bollinger Band rules",
            url: "https://www.bollingerbands.com/bollinger-band-rules",
          },
          {
            title: "John Bollinger — Bollinger Bands",
            url: "https://www.bollingerbands.com/bollinger-bands",
          },
        ],
      },
    ],
  },
];
