import type { LessonSection } from "../../lesson-content";

export const volumeAndChartLimitsSections: LessonSection[] = [
  {
    title: "Ask what the number counts",
    shortTitle: "Start with the measure",
    blocks: [
      {
        type: "paragraph",
        children:
          "A volume bar is meaningful only after you know what was counted, over which interval and by which source. The word “volume” can refer to contracts traded, currency units, notional value, quote ticks or activity visible to one provider. These are different measures, not interchangeable labels for one global number.",
      },
      {
        type: "paragraph",
        children:
          "The global spot Forex market is over the counter rather than one exchange with a single public tape of every transaction. A retail platform therefore cannot turn one local series into the entire market’s live traded volume merely by placing a bar below its chart. Exchange-traded currency futures report activity for their own contracts and venue.",
      },
      {
        type: "paragraph",
        children:
          "This lesson builds a data-checking habit. You will compare only measures with compatible units and scopes, recognise what tick counts leave unknown and finish Level 3 with a complete chart-reading record. A taller bar is an observation about a documented series, not a ready-made buy or sell instruction.",
      },
      {
        type: "example",
        title: "One shop is not the whole city",
        children: [
          "A grocery shop in Australia counts 120 customers in an afternoon. That may help describe its own activity, but does not count every shopper in the city. A provider’s chart can have a similar scope limit.",
        ],
      },
    ],
  },
  {
    title: "Separate traded volume from tick volume",
    shortTitle: "Different kinds of activity",
    blocks: [
      {
        type: "paragraph",
        children:
          "Traded volume counts completed transactions in a specified unit. An exchange futures series may report the number of contracts traded for one contract or defined aggregation. Currency units or notional turnover are different units; converting between them requires the product specifications and methodology.",
      },
      {
        type: "paragraph",
        children:
          "Tick volume counts ticks received or price/quote updates under the feed’s definition. It does not normally tell you how many euros or yen changed hands in those updates. One update can follow a small or large transaction, multiple transactions or a quote revision without an observable transaction in your feed.",
      },
      {
        type: "paragraph",
        children:
          "Provider-specific transaction activity, where supplied, can be actual activity within that provider’s scope. It still does not describe every dealer or venue. Find the documentation rather than assuming “real volume” means the total global Forex market.",
      },
      {
        type: "paragraph",
        children:
          "A tick-based chart is also not the same thing as a tick-volume indicator under a time-based chart. A tick-based chart can create a new bar after a specified number of ticks or transactions under its rule, while a time-based volume bar counts activity inside a fixed interval. Record which construction is used.",
      },
      {
        type: "comparisonTable",
        caption: "Name the unit and the population",
        columns: ["Measure", "Possible unit", "Scope question"],
        rows: [
          [
            "Listed futures volume",
            "Contracts traded",
            "Which exchange and which contract or expiry?",
          ],
          [
            "Provider transaction activity",
            "Units, trades or notional amount",
            "What activity does this provider include?",
          ],
          [
            "Tick volume",
            "Ticks or quote updates received",
            "How does this feed define and filter a tick?",
          ],
          [
            "Broad FX turnover survey",
            "Reported notional value over a survey period",
            "Which instruments, dealers and adjustments are included?",
          ],
        ],
      },
    ],
  },
  {
    title: "Understand the limits of a retail feed",
    shortTitle: "The feed matters",
    blocks: [
      {
        type: "paragraph",
        children:
          "A feed may combine or filter quotes, suppress repeated values, lose observations during a connection problem or use a different sampling method from another feed. Two platforms can therefore display different tick counts for the same pair and hour without either count representing the whole market.",
      },
      {
        type: "paragraph",
        children:
          "The MetaTrader 5 price-data guide, for example, defines tick volume as ticks received during a bar and distinguishes it from available transaction volume. Its Volumes indicator documentation also describes Forex price-change activity. These are implementation examples; check your platform’s current definition rather than assuming all developers count identically.",
      },
      {
        type: "paragraph",
        children:
          "An empty or zero “real volume” field can mean the data are unavailable for that symbol. It does not automatically mean no trades occurred anywhere. A sudden low tick count may reflect a quiet feed, missing data or a connection problem. Check the meaning and availability flags before turning it into an economic explanation.",
      },
      {
        type: "paragraph",
        children:
          "Colour can mislead too. Some volume indicators colour a bar by whether its count exceeds the previous count, while other displays use price direction or custom settings. A green volume bar need not mean buying exceeded selling. Read the legend and configuration.",
      },
      {
        type: "example",
        title: "Timetable updates are not passengers",
        children: [
          "A Japanese commuter counts how often a bus timetable app updates. Ten updates do not imply ten passengers or ten buses. Counting quote updates has a similar limit: the update count is a specific kind of activity, not the amount of currency exchanged.",
        ],
      },
    ],
  },
  {
    title: "Read exchange data in its own context",
    shortTitle: "Exchange volume",
    blocks: [
      {
        type: "paragraph",
        children:
          "A listed currency future has a specified contract size, quote convention, venue and expiry. Its reported volume concerns transactions in that contract or a documented aggregate. It does not become global spot EUR/USD or AUD/USD volume simply because the underlying currency pair is related.",
      },
      {
        type: "paragraph",
        children:
          "Activity can move from one futures expiry to another as traders change contracts. A fall in one expiry’s volume might coincide with a rise in another. A continuous chart can combine contracts using a vendor’s roll rule and price adjustment. Read those details before comparing a bar with an unadjusted single-contract chart.",
      },
      {
        type: "paragraph",
        children:
          "Volume and open interest are different concepts. Volume records trading activity during an interval; open interest records outstanding contracts at the reporting point under the exchange’s methodology. A contract can trade many times during a day without each transaction creating an additional outstanding contract. Neither measure is an automatic directional forecast.",
      },
      {
        type: "paragraph",
        children:
          "You can use a related futures series as additional context only after describing its differences and limitations. Do not multiply a broker’s tick count by a futures contract size to estimate global spot turnover: that combines unrelated units and populations.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/volume-and-chart-limits-guide.svg",
        desktopSrc:
          "/images/lessons/forex/volume-and-chart-limits-guide-desktop.svg",
        alt: "Two separate illustrative records: retail AUD/USD feed reports 1,000 quote updates, while a listed currency future reports 50,000 contracts on its own venue. The numbers measure different populations and cannot be directly compared as global spot volume.",
        caption:
          "Separate illustrative units and scopes. These counts are not current market figures and are not a common-scale comparison.",
        width: 600,
        height: 600,
      },
    ],
  },
  {
    title: "Place broad market surveys in the right role",
    shortTitle: "Surveys versus live bars",
    blocks: [
      {
        type: "paragraph",
        children:
          "The Bank for International Settlements coordinates a broad FX turnover survey using reports collected through participating authorities and dealers. Its methodology deals with instruments, reporting scope and adjustments such as inter-dealer double-counting. A survey is a structured statistical estimate, not a live consolidated tick feed for your platform.",
      },
      {
        type: "paragraph",
        children:
          "Do not compare a survey’s average daily notional turnover across multiple FX instruments with an hourly tick count for one retail spot symbol as if they were the same quantity. The periods, units, products and reporting populations differ. A large market-size number cannot tell you how much liquidity is available for your particular order at this moment.",
      },
      {
        type: "paragraph",
        children:
          "A broad survey can help explain market structure and the need to name sources. A local feed can help describe observations in that feed. Each answers a different question. Keep the publication date and methodology with any statistical figure; older averages are not promises about today’s execution.",
      },
      {
        type: "comparisonTable",
        caption: "Match the source to the question",
        columns: ["Question", "Useful source type", "Limit to retain"],
        rows: [
          [
            "How active was this feed during this hour?",
            "Its documented tick or transaction series",
            "Local scope and data completeness.",
          ],
          [
            "How much traded in this listed contract?",
            "Exchange or documented venue record",
            "Contract, expiry and reporting interval.",
          ],
          [
            "How is broad OTC FX activity measured?",
            "BIS survey methodology and dated release",
            "Survey coverage and averaging, not live order liquidity.",
          ],
        ],
      },
    ],
  },
  {
    title: "Do not read buyer counts into a tall bar",
    shortTitle: "Direction and liquidity",
    blocks: [
      {
        type: "paragraph",
        children:
          "Every completed transaction has a buyer and a seller. A large transaction-volume bar does not mean there were simply “more buyers than sellers.” Price direction and volume are separate observations. A bar by itself does not identify trader motives or the initiator of every transaction.",
      },
      {
        type: "paragraph",
        children:
          "At some venues, specialised data can classify trade initiation or show displayed order-book interest under a stated method. A simple retail volume histogram does not supply that analysis. An order book also shows the interest visible in its own scope, not a guaranteed complete view of every hidden or future order.",
      },
      {
        type: "paragraph",
        children:
          "High observed activity does not guarantee a narrow spread, adequate depth at your price or a better fill. A scheduled release can produce many updates and rapid price changes at the same time. A low count also does not prove safety. Record the relevant quotes and execution separately.",
      },
      {
        type: "paragraph",
        children:
          "If you use the word “confirmation,” state the additional condition precisely. For example, a completed close above a premarked zone and a documented tick count above a prewritten threshold are two measured conditions. Their joint occurrence does not prove an effective strategy without a fair test and executable-price assumptions.",
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Volume describes documented activity. It does not reveal every participant, cause or future outcome.",
      },
    ],
  },
  {
    title: "Compare like with like before drawing conclusions",
    shortTitle: "Fair comparisons",
    blocks: [
      {
        type: "paragraph",
        children:
          "For an initial observation exercise, stay with the same product, source, volume definition and interval. Comparing a one-minute count of 100 with an hourly count of 1,000 mostly compares different window lengths. A count in one source’s busy hour and another source’s quiet hour also confounds the comparison.",
      },
      {
        type: "paragraph",
        children:
          "Choose the lookback and reference measure beforehand. If ten previous comparable hourly counts are 400, 500, 450, 550, 600, 500, 450, 550, 500 and 500, their average is 500. A later completed hour with 1,000 ticks has twice that reference count. It does not have twice the global traded currency or twice the chance of a favourable move.",
      },
      {
        type: "paragraph",
        children:
          "The median or another summary can be useful for a different question, but changing the reference after seeing the result can hide how you selected it. Note holidays, missing intervals and session changes. A valid count with a different context is not necessarily comparable.",
      },
      {
        type: "paragraph",
        children:
          "You may later investigate relationships between documented activity and price movement. Keep that as a separate analysis with a defined sample. This lesson asks you to calculate and describe a local observation honestly, not to discover a guaranteed volume signal.",
      },
      {
        type: "example",
        title: "Comparing two shop afternoons",
        children: [
          "A Canadian shopkeeper compares customer counts for the same shop, same opening hours and comparable weekdays. Comparing Monday’s full day with Friday’s first ten minutes would be misleading. A chart activity comparison needs the same care about the window.",
        ],
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
          "An Australian learner sees “volume 1,000” below AUD/USD in a retail platform and “50,000 contracts” on a futures chart. They first label the retail product, provider, timeframe, time zone and definition. The first number is a hypothetical local tick count; the second is a hypothetical transaction count for a specified listed contract.",
      },
      {
        type: "paragraph",
        children:
          "The learner does not say that the futures market was fifty times more active than the global spot market. The ratio mixes units and populations. Instead, they write two observations with their own definitions. If either definition is missing, they mark it unknown and ask for documentation.",
      },
      {
        type: "paragraph",
        children:
          "For a separate exercise on the same retail feed, they compare the completed 1,000-tick hour with the prewritten 500-tick reference average. “Twice this feed’s reference count” is supported. “Twice global volume,” “buyers outnumbered sellers” and “AUD/USD must rise” are not.",
      },
      {
        type: "comparisonTable",
        caption: "Keep each conclusion within its evidence",
        columns: ["Observed item", "Supported description", "Unsupported leap"],
        rows: [
          [
            "Retail feed: 1,000 ticks",
            "This source recorded the stated tick count.",
            "All spot markets traded 1,000 contracts.",
          ],
          [
            "Listed future: 50,000 contracts",
            "That documented contract/venue reported its count.",
            "The retail spot count has the same unit.",
          ],
          [
            "1,000 against a comparable 500 reference",
            "Twice that defined reference activity.",
            "Twice the probability of a profitable trade.",
          ],
        ],
      },
    ],
  },
  {
    title: "Finish a chart-reading record",
    shortTitle: "Put Level 3 together",
    blocks: [
      {
        type: "paragraph",
        children:
          "Choose one completed historical segment or an invented record. Label the product, feed, price basis, date, zone and timeframe. Read one candle’s OHLC and its body and range. Identify swings under a written confirmation rule and mark one dated reaction zone. Define a breakout event before revealing the next data.",
      },
      {
        type: "paragraph",
        children:
          "If a volume field exists, record exactly what it counts. Save its source definition and say what part of the market it cannot see. If the field is undocumented, leaving it unknown is more accurate than filling the gap with a familiar explanation.",
      },
      {
        type: "paragraph",
        children:
          "Finally, separate description, interpretation and a hypothetical trading result. Description states the recorded values and rule outcomes. Interpretation proposes an explanation that may be uncertain. A trading result requires direction, size, executable entry and exit, costs and the ordering of instructions. A drawing alone supplies none of those complete records.",
      },
      {
        type: "learningLink",
        title:
          "Keep hypothetical arithmetic separate with the Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "For arithmetic only, use long AUD/USD, 0.01 lots, entry 0.6502, exit 0.6512, USD account and conversion factor 1. The assumed 1,000-AUD position gives US$1 gross before separate charges. Volume does not establish those fills or predict that result.",
      },
    ],
  },
  {
    title: "Practise a volume audit and chart review",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A retail AUD/USD hour reports 1,000 ticks and a listed future reports 50,000 contracts. List the definitions, units, product, provider or venue, expiry if relevant, interval and time zone needed for each. Then compare a 1,000-tick completed hour with the stated ten-hour reference and write only conclusions the data support.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "The ten reference counts sum to 5,000, so the mean is 500 and the later count is twice that reference. The 1,000-tick and 50,000-contract measures cannot be treated as the same population. Zero in an unavailable transaction-volume field does not prove the whole market was inactive. A tall green bar does not automatically identify buying pressure or predict the next candle.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Your final note should include at least one unknown. That is not a weakness in the exercise: it shows you can distinguish a recorded fact from a missing definition. Continue to later indicators and patterns with this habit. More annotations do not repair poorly understood input data.",
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
        checklist: true,
        title: "I can explain this without guessing",
        points: [
          "I can name the unit, source, interval and population behind a volume bar.",
          "I can distinguish ticks, provider activity, listed contract volume and a broad turnover survey.",
          "I can check unavailable fields, indicator colours, feed gaps and futures expiry effects.",
          "I can compare compatible observations without treating activity as a directional guarantee.",
          "I can produce a chart-reading record that separates observations, interpretations and hypothetical execution.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "MetaTrader 5 — Price Data (platform-specific guide)",
            url: "https://www.metatrader5.com/en/terminal/help/trading_advanced/price_data",
          },
          {
            title: "MetaTrader 5 — Volumes (platform-specific indicator)",
            url: "https://www.metatrader5.com/en/terminal/help/indicators/volume_indicators/volumes",
          },
          {
            title:
              "BIS — OTC foreign exchange turnover in April 2025 (survey methodology)",
            url: "https://www.bis.org/publications/202509-commentary-otc-derivatives",
          },
          {
            title: "CME Group — Chart Types: candlestick, line, bar",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar",
          },
        ],
      },
    ],
  },
];
