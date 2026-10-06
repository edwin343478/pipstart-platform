import type {
  LessonDocument,
  LessonMetadata,
  LessonSection,
} from "../../lesson-content";
import { flattenSections } from "../../lesson-content";
const metadata1: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "crypto-charts-and-evidence",
  description:
    "Describe a chart consistently before forming a trading hypothesis.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-7",
  module: "charts-market-context-and-evidence",
  objectives: [
    "Describe a chart consistently before forming a trading hypothesis.",
  ],
  position: 1,
  prerequisites: ["defi-dependencies-stablecoins-and-governance"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["cycles-dominance-and-market-context"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Describe a chart consistently before forming a trading hypothesis.",
  seoTitle: "Read Charts and Describe Price Structure",
  slug: "read-charts-and-describe-price-structure",
  sources: [
    {
      title: "TradingView: Introduction to candlestick charts and patterns",
      url: "https://www.tradingview.com/support/solutions/43000745269-introduction-to-candlestick-charts-and-patterns/",
    },
    {
      title: "TradingView: Simple Moving Average",
      url: "https://www.tradingview.com/support/solutions/43000696841-simple-moving-average/",
    },
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "Coinbase: Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title:
        "IMF Blog: IMF Blog — Crypto Prices Move More in Sync With Stocks, Posing New Risks (11 January 2022)",
      url: "https://www.imf.org/en/blogs/articles/2022/01/11/crypto-prices-move-more-in-sync-with-stocks-posing-new-risks",
    },
    {
      title:
        "US SEC: US SEC — Statement on the Approval of Spot Bitcoin Exchange-Traded Products",
      url: "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023",
    },
  ],
  status: "published",
  title: "Read Charts and Describe Price Structure",
};
const sections1: LessonSection[] = [
  {
    title: "Read the chart feed and candle",
    shortTitle: "Read the chart feed and candle",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Describe a chart consistently before forming a trading hypothesis.",
      },
      {
        type: "paragraph",
        children:
          "A chart condenses recorded prices into a picture. Before interpreting it, identify the asset, quote currency, venue, timeframe and scale. Those choices can change the story the picture appears to tell. We will read ordinary candles and simple price structure, then use indicators as summaries of data rather than promises about the next move.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "State what the chart records before stating what you think it means.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why does a crypto chart need extra care",
      },
      {
        type: "paragraph",
        children:
          'Picture a weather station on a mountain in Canada that records the temperature every minute, all year. There is no "closing time" for weather. For a daily summary, someone has to choose when each day begins, and people in Toronto and Vancouver might choose different midnights.',
      },
      {
        type: "paragraph",
        children:
          "Crypto prices are like that station. As you learned in Level 0, crypto trades 24 hours a day, 7 days a week, every day of the year. A chart still has to cut that endless stream into pieces, so every crypto chart rests on choices someone made for you: which exchange, which trading pair, which time zone, which time window and which scale.",
      },
      {
        type: "paragraph",
        children:
          'This lesson teaches you to read those choices before you read the shape, the same habit the PipStart Forex path builds. The aim is description: "this is what the record shows", and no further. The analogy stops working in one place. Weather does not react to people reading the thermometer, but markets do react to people reading charts. Start with the smallest building block: the candle.',
      },
      {
        type: "heading",
        level: 3,
        children: "Read a candle on a market that never closes",
      },
      {
        type: "paragraph",
        children:
          "A candlestick summarises one time window with four prices: open, high, low and close. The body runs from open to close; thin wicks reach to the high and the low. Up and down colours are settings, so check the legend.",
      },
      {
        type: "example",
        title: "One day of an invented coin",
        children:
          "Ananya in Bengaluru looks at a daily candle for an invented token. It opened at US$100, rose to US$112, fell to US$94 and closed at US$108 (all invented for this example). The body runs from 100 to 108, with wicks up to 112 and down to 94. The candle cannot tell her whether the high came before the low.",
      },
      {
        type: "paragraph",
        children:
          'On a Forex chart, the daily candle follows a provider\'s trading day. Crypto has no session, so the "daily close" is a convention. Many crypto charts use midnight in Coordinated Universal Time (UTC), but some let you switch to local time. A trader in Tokyo on Japan time and a trader in London on UTC can see differently shaped daily candles from identical trades.',
      },
      {
        type: "definition",
        term: "Daily close (crypto)",
        children:
          "The last price recorded before a chosen cut-off time, often 00:00 UTC. It is a charting convention, not a moment when the market actually stops.",
      },
      {
        type: "paragraph",
        children:
          'Because there is no weekend pause, crypto charts rarely show the "gaps" you see on stock charts. That does not make crypto calmer: large moves can happen at 3 a.m. on a Sunday, when fewer people are watching. Once you know what one candle shows, the next choice is how much time each candle covers, and how the price axis is drawn.',
      },
      {
        type: "heading",
        level: 3,
        children: "Ask whose price and whose volume you are seeing",
      },
      {
        type: "paragraph",
        children:
          'Imagine checking the price of a mango in three Jakarta markets: Rp10,000, Rp10,500 and Rp9,800 (invented prices). None is "the" price of a mango. Each is the price at that stall, at that moment.',
      },
      {
        type: "paragraph",
        children:
          'The same distinction helps when discussing crypto. As you saw in Level 3, a coin trades on many exchanges at once, each with its own order book. Prices are usually close, because traders buy where it is cheap and sell where it is dear, but in a sudden crash they can drift far apart. "BTC/USDT on Exchange A" and "BTC/USD on Exchange B" are two different records.',
      },
      {
        type: "paragraph",
        children:
          "Volume bars show how much traded in each window. Crypto volume is split across hundreds of centralised exchanges, decentralised exchanges and over-the-counter desks, so any single chart shows only a slice. Data sites add the slices together, and that is where a bigger problem appears.",
      },
      {
        type: "definition",
        term: "Wash trading",
        children:
          "Buying and selling the same asset at nearly the same time without any real change in who owns it, usually to make trading look busier than it is.",
      },
      {
        type: "paragraph",
        children:
          'Wash trading inflates volume. Coin Metrics, a data firm, recalls a 2019 Bitwise study that claimed around 95% of reported volume was "fake", and screens exchanges for suspicious patterns, such as buys and sells that look like random coin tosses. Chainalysis estimated up to about US$2.57 billion of suspected wash trading on three blockchains\' decentralised exchanges in 2024, and called that an upper-bound estimate. In October 2024, US authorities charged several market-making firms over wash trading (the token research lesson in Level 5 describes the case).',
      },
      {
        type: "warning",
        title: "Big volume can be manufactured",
        children:
          "Enormous volume on a little-known exchange is not proof of real interest. Check whether it appears on several reputable venues.",
      },
      {
        type: "paragraph",
        children:
          "So prices differ by venue, and some volume is not real. With those cautions in mind, revisit the most familiar chart tool of all.",
      },
      {
        type: "paragraph",
        children:
          "It does not tell you the exact sequence of every intervening trade. Synthetic chart types may transform prices and are not ordinary execution records. Candlestick charting has historical roots in Japan's eighteenth-century rice markets, rather than beginning with cryptocurrency. This history does not make a pattern predictive by itself; any claim about future usefulness still needs a defined method and evidence.",
      },
    ],
  },
  {
    title: "Describe structure, volume and indicators",
    shortTitle: "Describe structure volume and indicators",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Trends, ranges, support and resistance",
      },
      {
        type: "paragraph",
        children:
          "A sequence of higher swing highs and higher swing lows can describe an observed upward structure. Lower highs and lower lows can describe a downward structure. A range describes repeated movement within a broad area. Support and resistance are reference areas where buying or selling has previously been associated with a reaction; they are not physical barriers.",
      },
      {
        type: "paragraph",
        children:
          "How you choose swings and areas matters. State the timeframe and rule used, and avoid moving a line afterward to make it look perfect. A breakout can fail and a previously respected area can stop producing a reaction. A chart annotation is an observation or hypothesis. A useful beginner description says what happened and what evidence would change the interpretation, without predicting that a level must hold.",
      },
      {
        type: "example",
        title: "A line that held, then didn't",
        children:
          "Chloé in Lyon marks support at €40,000 on a daily chart because price bounced there twice (an invented price). A month later, price falls through it in an hour and keeps falling. Her line described the past. It was never a promise.",
      },
      {
        type: "heading",
        level: 3,
        children: "Volume averages and momentum",
      },
      {
        type: "paragraph",
        children:
          "Volume describes recorded trading activity under a feed's unit convention. It may count base units, quote value or contracts, so compare like with like. A simple moving average takes the arithmetic average of a chosen number of values, commonly closes. With closes 100, 102, 101, 105 and 107, a five-period average is 103. It summarises past data and can lag a rapid change.",
      },
      {
        type: "paragraph",
        children:
          "Momentum indicators, such as RSI, summarise aspects of past changes under specified settings. A high reading does not force a fall, and a low reading does not force a recovery. Several indicators based on the same price series are not independent evidence simply because their lines have different names. Use a small number of clearly understood measures and record settings. A complex display can conceal the absence of a testable decision rule.",
      },
      {
        type: "comparisonTable",
        caption: "Read the supplied OHLC and average",
        columns: ["Item", "Supplied values", "Interpretation"],
        rows: [
          ["Open", "USD 100", "First included trade"],
          ["High", "USD 108", "Highest included trade"],
          ["Low", "USD 97", "Lowest included trade"],
          ["Close", "USD 104", "Last included trade"],
          ["Five closes", "100 102 101 105 107", "Sum 515"],
          ["Five-period SMA", "515 divided by 5", "103"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Ordinary fictional candles are assumed. These observations do not forecast the next interval.",
      },
      {
        type: "diagram",
        alt: "The body spans open to close; wicks show the full high-low range. The candle does not reveal every intrainterval trade sequence.",
        caption:
          "The body spans open to close; wicks show the full high-low range. The candle does not reveal every intrainterval trade sequence.",
        src: "/lessons/crypto/level-7/lesson-1-rId42.png",
        width: 1451,
        height: 657,
      },
    ],
  },
  {
    title: "Compare timeframes, venues and scales",
    shortTitle: "Compare timeframes venues and scales",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Timeframes and venue differences",
      },
      {
        type: "paragraph",
        children:
          "A daily candle contains many shorter-period candles. Short-term structure can therefore move against a longer-term trend without either chart being mathematically wrong. A feed from one exchange can differ from another because of liquidity, trading pairs, outages and participant activity. Index data combines sources under a methodology and is not necessarily an executable quote.",
      },
      {
        type: "paragraph",
        children:
          "Check timezone, missing intervals and whether a candle is still open. A closing-price rule cannot legitimately use the final close before the interval ends. Volume from a thin pair may not represent the wider market. Compare data quality and source definitions before diagnosing a contradiction. These habits also prevent look-ahead mistakes when we test rules at Level 9.",
      },
      {
        type: "heading",
        level: 3,
        children: "Linear and logarithmic scales",
      },
      {
        type: "paragraph",
        children:
          "Think of a family photo album. One page shows a single birthday party in twenty photos; another shows twenty years in twenty photos. Both are true, but they tell different stories. A chart's timeframe works the same way: a one-minute chart shows tiny wiggles, a weekly chart the long journey.",
      },
      {
        type: "paragraph",
        children:
          "The Forex rule still applies: to combine shorter candles into a longer one, take the first open, the highest high, the lowest low and the last close. Never average them. A calm-looking weekly candle can hide a very rough Tuesday.",
      },
      {
        type: "paragraph",
        children:
          "The second choice is the price scale. On a linear scale, each step up the axis adds the same number of dollars. On a logarithmic (log) scale, each step multiplies the price by the same amount, so equal distances mean equal percentage changes.",
      },
      {
        type: "formula",
        expression:
          "Percentage change = (new price − old price) ÷ old price × 100",
        explanation:
          "the change is measured relative to where the price started. A US$1,000 rise is huge from US$1,000 but small from US$50,000.",
      },
      {
        type: "example",
        title: "The same US$1,000 step",
        children:
          "Lucas in São Paulo compares two moves of an invented coin. From US$1,000 to US$2,000 is (2,000 − 1,000) ÷ 1,000 × 100 = 100%. From US$50,000 to US$51,000 is (51,000 − 50,000) ÷ 50,000 × 100 = 2%. On a linear chart both moves look the same height; on a log chart the first looks far bigger, matching its percentage size. (Prices invented for this example.)",
      },
      {
        type: "comparisonTable",
        caption: "Linear and log scales compared",
        columns: ["Comparison point", "Linear scale", "Log scale"],
        rows: [
          [
            "Equal distance means",
            "Equal dollar change",
            "Equal percentage change",
          ],
          [
            "Good for",
            "Short periods, small price ranges",
            "Long histories where price rose or fell many times over",
          ],
          [
            "Risk of misreading",
            "Early years look flat; recent moves look enormous",
            "Large dollar losses can look gentle",
          ],
          ["What to check", "The axis labels", "The axis labels"],
        ],
      },
      {
        type: "paragraph",
        children:
          'Bitcoin\'s history spans prices thousands of times apart, so long-term Bitcoin charts often use a log scale. Neither scale is "the truth"; each answers a different question. Once you have chosen window and scale, a quieter question remains: whose prices are on the chart at all?',
      },
      {
        type: "paragraph",
        children:
          "A move from 10 to 20 and from 100 to 200 has the same percentage change but different absolute amounts. Long histories with large price ranges can look very different under the two scales. A chart cannot by itself explain token rights, custody or contract risk.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The temperature chart and the forecast",
        children:
          "A family in Canada records daily temperatures of 10, 12, 11, 15 and 17 degrees. The average of 13 degrees describes those days; it does not guarantee tomorrow's temperature. A moving average of asset prices has the same descriptive boundary. Unlike temperature, prices also reflect market transactions and incentives, but the arithmetic still summarises observations. A learner should be able to explain the input and window before treating an indicator as useful evidence.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not use transformed chart prices or unfinished candles as though they were known executable historical values.",
      },
      {
        type: "paragraph",
        children:
          "Try the following questions aloud or on paper before opening the worked answers. Compare your reasoning as well as your final answer.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Use the table’s candle: open 100, high 108, low 97, close 104. Describe its body and wick range.",
          "2. Calculate a three-period average of 102, 105 and 108.",
          "3. What is wrong with testing a daily-close signal using the final close at noon?",
        ],
        answers: [
          "1. The body runs from 100 to 104; wicks extend to 97 and 108.",
          "2. The sum is 315 and the average is 105.",
          "3. The final daily close is not yet known. Using it early introduces future information into the test.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does a resistance area guarantee a price reversal?"],
        answers: [
          "No. It is an observed or hypothesised reference area. Price can pass through it or react differently later.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Identify data source, interval and units before interpretation.",
          "Indicators summarise inputs under settings.",
          "A descriptive pattern is not a guaranteed forecast.",
        ],
      },
      {
        type: "keyPoint",
        title: "Lesson completion check",
        points: [
          "I can explain the learning goal in my own words.",
          "I have completed the paper practice and compared my reasoning with the worked answers.",
          "I can name a limitation or risk that the example does not remove.",
        ],
        checklist: true,
      },
      {
        type: "heading",
        level: 3,
        children: "References and further reading",
      },
      {
        type: "references",
        items: [
          {
            title:
              "TradingView: Introduction to candlestick charts and patterns",
            url: "https://www.tradingview.com/support/solutions/43000745269-introduction-to-candlestick-charts-and-patterns/",
          },
          {
            title: "TradingView: Simple Moving Average",
            url: "https://www.tradingview.com/support/solutions/43000696841-simple-moving-average/",
          },
          {
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "Coinbase: Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title:
              "IMF Blog: IMF Blog — Crypto Prices Move More in Sync With Stocks, Posing New Risks (11 January 2022)",
            url: "https://www.imf.org/en/blogs/articles/2022/01/11/crypto-prices-move-more-in-sync-with-stocks-posing-new-risks",
          },
          {
            title:
              "US SEC: US SEC — Statement on the Approval of Spot Bitcoin Exchange-Traded Products",
            url: "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023",
          },
        ],
      },
    ],
  },
];
const metadata2: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "crypto-charts-and-evidence",
  description:
    "Use market-wide measures with explicit definitions rather than treating a narrative as a timetable.",
  estimatedMinutes: 11,
  learningPath: "crypto",
  level: "level-7",
  module: "charts-market-context-and-evidence",
  objectives: [
    "Use market-wide measures with explicit definitions rather than treating a narrative as a timetable.",
  ],
  position: 2,
  prerequisites: ["read-charts-and-describe-price-structure"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "read-charts-and-describe-price-structure",
    "derivatives-funding-open-interest-and-liquidations",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Use market-wide measures with explicit definitions rather than treating a narrative as a timetable.",
  seoTitle: "Cycles, Dominance and Market Context",
  slug: "cycles-dominance-and-market-context",
  sources: [
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title:
        "IMF Blog: IMF Blog — Crypto Prices Move More in Sync With Stocks, Posing New Risks (11 January 2022)",
      url: "https://www.imf.org/en/blogs/articles/2022/01/11/crypto-prices-move-more-in-sync-with-stocks-posing-new-risks",
    },
    {
      title:
        "US SEC: US SEC — Statement on the Approval of Spot Bitcoin Exchange-Traded Products",
      url: "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023",
    },
  ],
  status: "published",
  title: "Cycles, Dominance and Market Context",
};
const sections2: LessonSection[] = [
  {
    title: "Cycles, dominance and the denominator",
    shortTitle: "Cycles dominance and the denominator",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Use market-wide measures with explicit definitions rather than treating a narrative as a timetable.",
      },
      {
        type: "paragraph",
        children:
          "Market stories often describe accumulation, expansion, euphoria and decline as a cycle. Such descriptions can help organise history, but the future does not have to follow the same timetable. This lesson examines market context, Bitcoin dominance and event calendars while keeping observations separate from predictions.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Make a narrative measurable before treating it as evidence for a decision.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Cycles describe history",
      },
      {
        type: "paragraph",
        children:
          "Farmers in Australia talk about good seasons and drought years. Seasons follow the calendar; droughts do not. Crypto markets have had long rising periods and long falling periods, called bull markets and bear markets. Like droughts, they are clear afterwards and hard to time in advance.",
      },
      {
        type: "definition",
        term: "Drawdown",
        children:
          "The fall from a previous peak to a later low, written as a percentage of the peak.",
      },
      {
        type: "formula",
        expression: "Drawdown = (peak − trough) ÷ peak × 100",
        explanation:
          "it tells you how much of the peak value was lost at the worst point, measured from the top.",
      },
      {
        type: "paragraph",
        children:
          "The clearest recent example is the 2022 bear market. Bitcoin fell roughly 75% from its November 2021 high to its November 2022 low. CNBC reported in November 2022, during the FTX collapse, that the two largest cryptocurrencies had lost about three-quarters of their value over twelve months, and that the total crypto market had shrunk from roughly US$3 trillion to around US$900 billion.",
      },
      {
        type: "paragraph",
        children:
          "A fall that large is hard to climb back from. The gain needed to recover a loss is L ÷ (1 − L). For a 75% loss, that is 0.75 ÷ 0.25 = 3: a 300% gain only to return to the old high. Level 0 showed the same maths with a 50% fall.",
      },
      {
        type: "paragraph",
        children:
          "Many people link Bitcoin's past cycles to its halvings, about every four years. Be careful with this story. Four halvings (2012, 2016, 2020 and 2024) are far too few to prove a pattern, and the market has changed a great deal since 2012. A halving changes how fast new bitcoin is created. It does not set a timetable for prices.",
      },
      {
        type: "warning",
        title: "Cycles are not calendars",
        children:
          'No cycle chart can tell you when a peak or a low will come. Anyone selling a "cycle top date" is selling a guess. Plan for the possibility of a long, deep fall at any time.',
      },
      {
        type: "paragraph",
        children:
          "So far you have looked at one coin's chart. The next tool compares Bitcoin with the whole market.",
      },
      {
        type: "paragraph",
        children:
          "Two analysts can apply different phase names to the same current market, and the boundaries are rarely objective without a stated method. Use cycle language as context rather than a calendar promise. A historical sequence is not enough to establish the probability, timing or size of a future move. The later testing lessons supply a more disciplined way to examine a repeated claim.",
      },
      {
        type: "heading",
        level: 3,
        children: "Calculate Bitcoin dominance",
      },
      {
        type: "paragraph",
        children:
          "Think of a shopping centre in Riyadh. If the largest store's share of total sales falls, either the big store sold less, the smaller stores sold more, or new stores opened. The share alone does not say which.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin dominance is that share for crypto. You learned market capitalisation in Level 5; dominance compares Bitcoin's market cap with the market cap of all crypto-assets together.",
      },
      {
        type: "formula",
        expression:
          "Bitcoin dominance = Bitcoin market cap ÷ total crypto market cap × 100",
        explanation:
          "Bitcoin's slice of the whole pie, as a percentage. It moves when Bitcoin's value, other assets' values or the list of counted assets changes.",
      },
      {
        type: "example",
        title: "The pie grows, the slice shrinks",
        children:
          "Hannah in Hamburg uses invented numbers. Bitcoin's market cap is US$2.0 trillion and the total market is US$3.5 trillion, so dominance is 2.0 ÷ 3.5 × 100 ≈ 57%. A month later, Bitcoin's market cap has not changed, but stablecoins and new tokens have added US$0.5 trillion, so the total is US$4.0 trillion. Dominance is now 2.0 ÷ 4.0 × 100 = 50%, although nothing happened to Bitcoin itself.",
      },
      {
        type: "paragraph",
        children:
          "CoinGecko's dominance chart shows stablecoins as their own slice. That matters: when people move money into stablecoins, Bitcoin's share can drop while the total holds up. Data sites may also count different token lists, so their dominance figures can differ.",
      },
      {
        type: "paragraph",
        children:
          "Dominance compares crypto assets with each other. The next question is how crypto as a whole moves compared with everything else.",
      },
      {
        type: "paragraph",
        children:
          "The calculation measures a share of indicated values within that universe, not the share of every person's holdings or the share of all actual cash invested. The ratio alone cannot identify which mechanism caused the movement.",
      },
      {
        type: "diagram",
        alt: "Fictional indicated values. Bitcoin stays at US$2 trillion while the selected total changes, so its share falls.",
        caption:
          "Fictional indicated values. Bitcoin stays at US$2 trillion while the selected total changes, so its share falls.",
        src: "/lessons/crypto/level-7/lesson-2-rId43.png",
        width: 2156,
        height: 1145,
      },
      {
        type: "heading",
        level: 3,
        children: "Check what the denominator includes",
      },
      {
        type: "paragraph",
        children:
          "Including stablecoins adds assets whose purpose differs from volatile network tokens. Excluding certain assets or using different circulating definitions changes the total. Thinly traded tokens with large indicated values can distort comparisons. A data provider may also add or remove coverage, creating a discontinuity that resembles a market event.",
      },
      {
        type: "paragraph",
        children:
          "For the fictional USD 1,000 billion total, excluding USD 100 billion of stablecoins leaves USD 900 billion. BTC dominance then becomes 66.67 percent rather than 60 percent, with BTC unchanged. Neither result is automatically wrong; they answer differently defined questions. A learner should name the universe and avoid comparing unlike series as though a change must represent buying or selling pressure.",
      },
      {
        type: "comparisonTable",
        caption: "Show the denominator explicitly",
        columns: [
          "BTC indicated value",
          "Selected market total",
          "Dominance",
          "Definition",
        ],
        rows: [
          [
            "USD 600 billion",
            "USD 1,000 billion",
            "60.00 percent",
            "Includes supplied stablecoin value",
          ],
          [
            "USD 600 billion",
            "USD 900 billion",
            "66.67 percent",
            "Excludes USD 100 billion stablecoins",
          ],
          [
            "USD 600 billion",
            "USD 1,200 billion",
            "50.00 percent",
            "Other indicated values increased",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Fictional inputs. Dominance is not cumulative cash flow or an inevitable rotation forecast.",
      },
    ],
  },
  {
    title: "Macro conditions, flows and testable narratives",
    shortTitle: "Macro conditions flows and testable narratives",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Macro conditions, exchange rates, flows and events",
      },
      {
        type: "paragraph",
        children:
          "Interest-rate conditions, access to financing, exchange outages, legal developments and major network events can influence markets. Token unlocks, governance changes and product launches may also matter. Record the event date, announcement date and the source. Markets may anticipate a known event, so the price response need not begin when the event occurs.",
      },
      {
        type: "paragraph",
        children:
          "Separate confirmed notices from rumours. A regulator's consultation is not the same as a final rule; a planned upgrade is not the same as a completed one. Context should identify plausible mechanisms and uncertainty rather than offer a single explanation for every price move. A broad market fall could reflect several forces together, and the data may not establish which was dominant.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask how closely crypto moves with other markets",
      },
      {
        type: "paragraph",
        children:
          "Think of two friends walking in Seoul: sometimes side by side, sometimes apart. Correlation measures how closely two things move together, on a scale from −1 (always opposite) through 0 (little measured linear relationship) to +1 (always together).",
      },
      {
        type: "paragraph",
        children:
          "Some people have described Bitcoin as moving independently of stock markets. The data tell a more complicated story. An International Monetary Fund (IMF) blog from January 2022 found that the correlation between Bitcoin's and the US S&P 500 index's daily returns was about 0.01 in 2017–19, close to little measured linear relationship, but rose to about 0.36 in 2020–21. The authors warned that this closer co-movement could spread shocks between crypto and wider markets.",
      },
      {
        type: "paragraph",
        children:
          "Correlation describes the past over a chosen period, and it changes. You will use it again in Level 8, when you map how much of your money is exposed to the same risk. It tells you that two things moved together, not why. For that, analysts look at the bigger forces behind many markets at once.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow the macro drivers: rates, the dollar and liquidity",
      },
      {
        type: "paragraph",
        children:
          "Think of a harbour in Istanbul. When the tide comes in, all the boats float higher; when it goes out, they all sink a little. Macro drivers are the tides of the whole economy: interest rates, the strength of major currencies and the amount of money available to invest, often called liquidity. Unlike a tide, they have no timetable.",
      },
      {
        type: "paragraph",
        children:
          'When central banks raise interest rates, safe savings pay more, borrowing costs more and many investors take less risk. An IMF working paper from 2023, "The Crypto Cycle and US Monetary Policy", found that one common factor explained about 80% of the ups and downs in crypto prices, and that US Federal Reserve tightening reduced that factor through investors\' appetite for risk. In plain words, crypto has tended to behave like a risky asset, not like a shelter.',
      },
      {
        type: "paragraph",
        children:
          "The US dollar matters in a more direct way too. Most crypto prices are quoted in US dollars or dollar stablecoins. If you think in another currency, your price moves with both the coin and the exchange rate.",
      },
      {
        type: "example",
        title: "Two moves in one number",
        children:
          'Thabo in Cape Town holds an invented coin worth US$1,000. Over a month its dollar price is unchanged, but the rand weakens from R18 to R19 per US dollar (invented rates). In rands, his holding rises from R18,000 to R19,000. The "gain" came entirely from the exchange rate, and it can reverse the same way.',
      },
      {
        type: "paragraph",
        children:
          "Macro links are tendencies, not laws. Analysts use them to explain the backdrop, not to call the next move. Since 2024, a newer channel has joined that backdrop: funds traded on ordinary stock exchanges.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch spot ETF flows as data not a promise",
      },
      {
        type: "paragraph",
        children:
          'An exchange-traded fund (ETF) is a fund whose shares trade on a stock exchange. A "spot" bitcoin ETF holds bitcoin itself. The US SEC approved spot bitcoin ETPs in January 2024; in his statement of 10 January 2024, SEC Chair Gary Gensler stressed that approval was not an endorsement and called bitcoin "primarily a speculative, volatile asset". Spot ether ETFs began trading in the US in July 2024, on 23 July according to a law firm briefing dated the next day.',
      },
      {
        type: "paragraph",
        children:
          "Flows are the money moving into or out of these funds each day. When buyers of fund shares outnumber sellers, the fund usually needs to hold more of the coin; when sellers dominate, it holds less. Analysts track flows as one sign of demand from people who use brokers rather than crypto exchanges. But flows describe yesterday. A week of inflows does not oblige next week to bring more, and outflows can follow quickly. ETFs also carry their own fees and risks, which Level 10 covers.",
      },
      {
        type: "example",
        title: "A headline and a question",
        children:
          'Marco in Milan reads "Record inflows into bitcoin funds". He asks: over what period, compared with what, and what happened the following week? The answers turn a headline into a description.',
      },
      {
        type: "paragraph",
        children:
          "Flows, rates and dominance all change with news. Some news, though, is announced in advance, and that is where description and prediction are most often confused.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read event calendars and keep analysis as description",
      },
      {
        type: "paragraph",
        children:
          'In Mexico City, flower prices rise before Mother\'s Day, and sellers who stocked up early may already be selling on the day itself. Markets have a saying for this: "buy the rumour, sell the news". It describes prices moving before a known event, then sometimes reversing when it arrives.',
      },
      {
        type: "paragraph",
        children:
          'Crypto has many scheduled events: token unlocks (Level 5), network upgrades, Bitcoin halvings and regulatory deadlines. Analysts keep calendars of them, because a large unlock adds supply and an upgrade changes how a network works. But the saying describes one behaviour that has been seen, not a rule. Sometimes prices rise before and after an event, sometimes they fall, and sometimes nothing visible happens. "Upgrade on the 15th" is context. "Price will rise before the 15th" is a prediction.',
      },
      {
        type: "paragraph",
        children:
          "That difference runs through every tool in this lesson. Candles, scales, volume, dominance, correlation, macro data and ETF flows all describe the record. None of them sees the future. When several tools seem to agree, they may be repeating one piece of information, because many are built from the same prices.",
      },
      {
        type: "paragraph",
        children:
          "A good habit is a three-column note: what the chart shows, what you think it might mean, and what would prove you wrong. Never leave the third column empty. Now practise that habit.",
      },
      {
        type: "heading",
        level: 3,
        children: "Make the narrative testable",
      },
      {
        type: "paragraph",
        children:
          "Instead of saying falling dominance always causes an altcoin season, define the measure, threshold, asset universe, period and outcome to be examined. Include costs and a comparison with an appropriate benchmark if testing a trading idea. Specify what would count as a failure. A narrative without a measurable boundary can be adjusted endlessly after the fact.",
      },
      {
        type: "paragraph",
        children:
          "Consider an alternative explanation. Dominance might fall because a few large non-BTC assets rise, without a broad increase across smaller tokens. A correlation in one period may disappear in another. The next lesson adds derivative measures, which also require careful definitions. No single ratio can replace asset rights, liquidity and a documented research method.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A household spending share",
        children:
          "A household in Spain spends EUR 600 on rent out of EUR 1,000 of measured monthly expenses, giving a 60 percent rent share. If the family excludes EUR 100 of savings-related spending from the comparison, rent's share becomes 66.67 percent even though rent has not changed. Bitcoin dominance similarly depends on the selected denominator. The comparison teaches ratio interpretation rather than claiming household spending and asset valuations are economically identical.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A cycle story or dominance ratio does not guarantee an altcoin rally.",
      },
      {
        type: "paragraph",
        children:
          "Try the following questions aloud or on paper before opening the worked answers. Compare your reasoning as well as your final answer.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Calculate dominance for USD 450 billion BTC in a USD 900 billion universe.",
          "2. Name two causes of a dominance change with BTC value unchanged.",
          "3. Convert the claim the cycle repeats into one measurable research question.",
        ],
        answers: [
          "1. 450 divided by 900 equals 50 percent.",
          "2. Other assets' indicated values can change, or the provider can change coverage or supply methodology.",
          "3. An acceptable question specifies a dated dominance series, a threshold, a defined set of assets and a fixed later return window, including contrary outcomes and costs if used for a trade test.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does falling BTC dominance prove every smaller token is rising?",
        ],
        answers: [
          "No. The aggregate ratio can change because of a subset of assets, supply estimates or universe changes.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Cycle labels are easier to assign retrospectively.",
          "Ratios require defined numerators and denominators.",
          "Event context should distinguish notice, implementation and expectation.",
        ],
      },
      {
        type: "keyPoint",
        title: "Lesson completion check",
        points: [
          "I can explain the learning goal in my own words.",
          "I have completed the paper practice and compared my reasoning with the worked answers.",
          "I can name a limitation or risk that the example does not remove.",
        ],
        checklist: true,
      },
      {
        type: "heading",
        level: 3,
        children: "References and further reading",
      },
      {
        type: "references",
        items: [
          {
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title:
              "IMF Blog: IMF Blog — Crypto Prices Move More in Sync With Stocks, Posing New Risks (11 January 2022)",
            url: "https://www.imf.org/en/blogs/articles/2022/01/11/crypto-prices-move-more-in-sync-with-stocks-posing-new-risks",
          },
          {
            title:
              "US SEC: US SEC — Statement on the Approval of Spot Bitcoin Exchange-Traded Products",
            url: "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023",
          },
        ],
      },
    ],
  },
];
const metadata3: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "crypto-charts-and-evidence",
  description:
    "Distinguish derivative measurements and explain why they do not establish a certain direction.",
  estimatedMinutes: 16,
  learningPath: "crypto",
  level: "level-7",
  module: "charts-market-context-and-evidence",
  objectives: [
    "Distinguish derivative measurements and explain why they do not establish a certain direction.",
  ],
  position: 3,
  prerequisites: ["cycles-dominance-and-market-context"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "cycles-dominance-and-market-context",
    "on-chain-data-explorers-and-measurement-limits",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Distinguish derivative measurements and explain why they do not establish a certain direction.",
  seoTitle: "Derivatives, Funding, Open Interest and Liquidations",
  slug: "derivatives-funding-open-interest-and-liquidations",
  sources: [
    {
      title: "CME Group: Introduction to Options",
      url: "https://www.cmegroup.com/education/courses/introduction-to-options/introduction-to-options",
    },
    {
      title:
        "Kraken: Managing margin and liquidations in multi collateral trading",
      url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
    },
    {
      title: "Coinbase: What is the funding rate",
      url: "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
    },
    {
      title: "CME Group: Open Interest",
      url: "https://www.cmegroup.com/education/courses/introduction-to-futures/open-interest",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
  ],
  status: "published",
  title: "Derivatives, Funding, Open Interest and Liquidations",
};
const sections3: LessonSection[] = [
  {
    title: "Derivative types, prices and basis",
    shortTitle: "Derivative types prices and basis",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Distinguish derivative measurements and explain why they do not establish a certain direction.",
      },
      {
        type: "paragraph",
        children:
          "Derivative data can add context, but it is easy to misread. Funding is not a guaranteed income stream, open interest is not buy volume, and a liquidation heatmap is often an estimate. This lesson explains the contracts and measurements before Level 8 examines margin and leverage losses.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Read units, reference prices and coverage before interpreting a derivatives dashboard.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Dated futures, perpetuals and options",
      },
      {
        type: "paragraph",
        children:
          "A dated future has contract specifications and a maturity or settlement process. A perpetual generally has no scheduled expiry and uses mechanisms such as funding to influence its relationship with the reference market. An option gives its buyer a specified right under terms such as strike, expiry and exercise style. The seller has the corresponding obligation. Premium, settlement and margin rules matter.",
      },
      {
        type: "paragraph",
        children:
          "These are contracts, not interchangeable forms of spot ownership. A call commonly relates to buying at a specified strike, while a put relates to selling, but some products are cash-settled or reference futures. An option can expire without value, and selling options can create substantial obligations. This course teaches recognition and risk awareness, not an options strategy. Always identify contract size, quote, settlement asset and eligibility before interpreting its price.",
      },
      {
        type: "paragraph",
        children:
          "Think of a bet between two neighbours in Melbourne about the price of petrol. Neither buys any petrol. They only agree that whoever guesses wrong pays the other the difference. A derivative works in a similar way: it is a contract whose value comes from the price of something else.",
      },
      {
        type: "heading",
        level: 3,
        children: "Last, index, mark and futures basis",
      },
      {
        type: "paragraph",
        children:
          "Last price is the latest trade in the particular instrument. An index aggregates reference prices according to a methodology. Mark price is a calculated valuation used for functions such as unrealised PnL and margin assessment under venue rules. It can differ from both the last trade and an executable price. Do not assume every venue uses the same formula.",
      },
      {
        type: "paragraph",
        children:
          "Basis is a defined difference between a derivative price and its reference, sometimes expressed as an amount or percentage. State the convention. A price discrepancy can reflect carrying conditions, funding expectations, liquidity or contract terms rather than a free guaranteed opportunity. Margin and stop triggers may use different references. A chart based on last trades can therefore cross a line at a different time from a mark-price liquidation assessment.",
      },
      {
        type: "paragraph",
        children:
          "In Tokyo, a train ticket booked months ahead can cost more or less than one bought on the day. The gap between the two prices tells you something about what people expect and how much they value waiting. In futures markets, that gap is called the basis.",
      },
      {
        type: "paragraph",
        children:
          "CME Group defines the basis as the difference between the spot price of an asset and its futures price. In this lesson we write it as futures minus spot, so a positive number means futures cost more. Some sources use the opposite sign, so always check.",
      },
      {
        type: "formula",
        expression:
          "Basis = futures price − spot price and Basis % = basis ÷ spot price × 100",
        explanation:
          "a positive basis means futures trade at a premium to spot; a negative basis means a discount.",
      },
      {
        type: "example",
        title: "A premium on a dated future",
        children:
          "Rizky in Jakarta compares an invented spot bitcoin price of US$100,000 with a three-month future at US$101,500. The basis is 101,500 − 100,000 = US$1,500, or 1.5% of spot. (Numbers invented for this example.)",
      },
      {
        type: "paragraph",
        children:
          "When futures cost more than spot, the market is in contango; when they cost less, it is in backwardation. A CME article from September 2021 describes contango as the usual state in crypto, and recalls that in March 2020, when crypto prices fell by about half, the market moved into extreme backwardation. For perps, the gap between the perp and the index plays a similar role and feeds directly into funding.",
      },
      {
        type: "paragraph",
        children:
          "A wide basis can reflect strong demand for leveraged exposure; a negative one can reflect fear. Both describe the moment. Neither tells you the next move. One more popular number claims to show how the crowd is leaning.",
      },
    ],
  },
  {
    title: "Funding direction, payments and intervals",
    shortTitle: "Funding direction payments and intervals",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Why does a perpetual need a funding rate",
      },
      {
        type: "paragraph",
        children:
          "Imagine a ferry ticket in Istanbul that can be resold forever but never used. If enough people want the ticket, its resale price could drift far above the real fare, because nothing pulls it back. A perp faces the same problem: with no expiry, nothing forces its price to meet the spot price.",
      },
      {
        type: "paragraph",
        children:
          "Exchanges solve this with funding: small, regular payments between the traders holding long positions (who gain if the price rises) and those holding short positions (who gain if it falls). Binance Academy explains that funding is not a fee the exchange collects. It is a transfer from one group of traders to the other.",
      },
      {
        type: "paragraph",
        children:
          "Exchanges track two prices to work this out. The index price is an average of the asset's spot price across several exchanges. The mark price is the exchange's fair estimate of the perp's value, used to value positions. When the perp trades above the index, the market is paying a premium to be long; when it trades below, longs are cheaper than spot.",
      },
      {
        type: "definition",
        term: "Funding rate",
        children:
          "A percentage, reset at regular intervals, that decides how much one side of a perpetual futures market pays the other. It is designed to pull the perp's price towards the spot price.",
      },
      {
        type: "paragraph",
        children:
          "The payment encourages traders to take the side that pulls the price back: if longs must pay, holding a short earns a little, so some traders switch. So when the rate is positive, who actually pays?",
      },
      {
        type: "heading",
        level: 3,
        children: "Work out who pays whom",
      },
      {
        type: "paragraph",
        children:
          "On Binance's description, the rule is short. When the funding rate is positive, longs pay shorts. When it is negative, shorts pay longs. Kraken's learning centre describes the same direction: if contracts trade above spot, longs pay; if below, shorts pay.",
      },
      {
        type: "comparisonTable",
        caption: "The funding rule in one place",
        columns: [
          "Perp price compared with spot",
          "Funding rate",
          "Who pays",
          "Who receives",
          "What the payment encourages",
        ],
        rows: [
          [
            "Above spot (premium)",
            "Positive",
            "Long positions",
            "Short positions",
            "More shorts, fewer longs",
          ],
          [
            "Below spot (discount)",
            "Negative",
            "Short positions",
            "Long positions",
            "More longs, fewer shorts",
          ],
          [
            "Close to spot",
            "Near zero or a small default",
            "Very little either way",
            "—",
            "Little change",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A positive rate tells you that, at that moment, demand to be long pushed the perp above spot, so longs paid to keep their positions. That describes crowd positioning. It is not a forecast: crowded longs can stay crowded for weeks, or unwind in minutes.",
      },
      {
        type: "example",
        title: "Two views of the same number",
        children:
          'Min-jun in Seoul sees a positive funding rate on an invented coin\'s perp. His friend says "everyone is bullish, so it must go up". His cousin says "everyone is bullish, so it must crash". Both turn one data point into a prediction. A careful reading is: "for the last interval, longs paid shorts, which means the perp traded above spot".',
      },
      {
        type: "paragraph",
        children:
          "Knowing the direction is half the picture. The other half is how much money actually changes hands.",
      },
      {
        type: "heading",
        level: 3,
        children: "Calculate a funding payment",
      },
      {
        type: "paragraph",
        children:
          "Funding is charged on the full size of your position, called its notional value, not on the deposit you put down. That one detail surprises many beginners.",
      },
      {
        type: "definition",
        term: "Notional value",
        children:
          "The full market value of a derivatives position: the number of units it covers multiplied by the current mark price.",
      },
      {
        type: "formula",
        expression: "Funding payment ≈ position notional × funding rate",
        explanation:
          "multiply the full position value by the rate for that interval. A positive result is paid by longs to shorts; a negative rate reverses the direction. Exchanges may add small adjustments, so treat this as an approximation.",
      },
      {
        type: "example",
        title: "A long that pays",
        children:
          "Aiko in Osaka holds a long perp position covering 0.1 BTC, with an invented mark price of US$100,000, so her notional is 0.1 × 100,000 = US$10,000. The funding rate is +0.01% per interval (an invented rate), so she pays 10,000 × 0.0001 = US$1 to shorts. With three intervals a day, that is US$3 a day, or US$90 over 30 days if the rate never changed. If she backed the position with a US$2,000 deposit, US$90 would be 4.5% of that deposit in a month, before any price move. (All numbers invented for this example.)",
      },
      {
        type: "example",
        title: "A short that pays",
        children:
          "Oliver in Manchester holds a short perp position with a notional value of £5,000. The funding rate is −0.03% for the interval (invented). Because the rate is negative, shorts pay longs: 5,000 × 0.0003 = £1.50 for that interval, or £4.50 if three intervals in a row had the same rate.",
      },
      {
        type: "paragraph",
        children:
          'Some sites "annualise" funding to make it comparable: 0.01% × 3 intervals × 365 days ≈ 10.95% a year. Treat that as a translation, not a prediction, because funding is reset every interval and can swing sharply in volatile markets.',
      },
      {
        type: "warning",
        title: "Funding drains quietly",
        children:
          "A small rate on a large notional, paid several times a day, can eat a deposit even while the price goes nowhere. Funding is one reason holding a leveraged position for a long time costs more than it first appears. Level 8 looks at these costs over time.",
      },
      {
        type: "paragraph",
        children:
          "The examples assumed three payments a day. That is common, but not universal, which is worth checking before any number makes sense.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check how often funding is paid",
      },
      {
        type: "paragraph",
        children:
          "A bus pass in Toronto might be charged weekly or monthly; the price per day depends on which. Funding works the same way. On Binance Futures, funding has typically settled every eight hours, three times a day, and Binance Academy notes that since 2025 some contracts can switch to four-hour intervals. Kraken's learning centre says its funding interval is every eight hours for US clients and every hour for clients in the European Economic Area and other regions.",
      },
      {
        type: "paragraph",
        children:
          'So a rate of 0.01% means different things on different venues: three payments a day, six, or twenty-four. Formulas differ too; Binance\'s includes a "clamp" that dampens swings, and other exchanges use their own rules.',
      },
      {
        type: "paragraph",
        children:
          'Before comparing funding across exchanges, check each contract\'s information page for the interval, the formula and any cap. Data sites that line up funding "across exchanges" may be comparing different intervals. Next, a number that tells you how big the whole perp market is.',
      },
      {
        type: "paragraph",
        children:
          "Funding commonly involves payments between positions under a perpetual's rules, with direction, timing and calculation specified by the venue. A negative rate reverses direction under that convention. Rates can vary, intervals differ, and the notional or rate may be sampled under specific rules. Funding is therefore one cash flow in a position, not a standalone guaranteed return. Read the instrument's current specifications and do not annualise a brief high rate as though it stays fixed.",
      },
    ],
  },
  {
    title: "Open interest, ratios and liquidation cascades",
    shortTitle: "Open interest ratios and liquidation cascades",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Open interest, volume and long-short ratios",
      },
      {
        type: "heading",
        level: 3,
        children: "Count open interest not only volume",
      },
      {
        type: "paragraph",
        children:
          "Picture a book club in Buenos Aires. Volume is how many times books were swapped this week. Open interest is how many books are currently out on loan. Lots of swapping can leave the number on loan unchanged.",
      },
      {
        type: "definition",
        term: "Open interest (OI)",
        children:
          "The number of derivatives contracts still open at a point in time. Each contract has one long side and one short side, and it is counted once.",
      },
      {
        type: "paragraph",
        children:
          "CME Group's futures course puts it this way: volume counts every contract traded, while open interest counts only the contracts that remain active. Open interest rises when new positions are opened on both sides, stays the same when one trader hands a position to another, and falls when both sides close.",
      },
      {
        type: "comparisonTable",
        caption: "How open interest changes (invented trades)",
        columns: [
          "Step",
          "What happens",
          "Volume this step",
          "Open interest after",
        ],
        rows: [
          [
            "1",
            "Ana opens 2 long contracts; Ben opens 2 short contracts",
            "2",
            "2",
          ],
          [
            "2",
            "Ana closes 1 long by selling to Caro, who opens 1 new long",
            "1",
            "2 (unchanged)",
          ],
          [
            "3",
            "Caro closes her long by selling to Ben, who closes 1 of his shorts",
            "1",
            "1",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Analysts watch open interest alongside price. Rising OI with a rising price means new money is entering positions; falling OI means positions are closing. But OI does not tell you who is right, and in crypto it is often quoted in US dollars, so it rises when the price rises even if no new contracts are opened.",
      },
      {
        type: "paragraph",
        children:
          "Open interest tells you the size of the bet. The next number tells you how expensive the futures are compared with the coin itself.",
      },
      {
        type: "heading",
        level: 3,
        children: "Treat the long short ratio with care",
      },
      {
        type: "paragraph",
        children:
          'Every futures contract has a buyer and a seller. That means the total long contracts and total short contracts on an exchange are always equal. So what does a "long/short ratio" measure?',
      },
      {
        type: "paragraph",
        children:
          "Binance explains that its ratio compares accounts, not contracts. It divides the number of accounts with net long positions by the number with net short positions. For example, if 60% of accounts are net long and 40% net short, the ratio is 60 ÷ 40 = 1.5. Binance gave a real example: on 21 March 2023, its BTCUSDT ratio was 0.77, with about 56% of accounts holding a position net short.",
      },
      {
        type: "example",
        title: "Many small, few large",
        children:
          "Imagine 900 small accounts in Mexico each long 1 contract, and 100 large accounts each short 9 contracts (invented). Contracts balance: 900 long, 900 short. But the account ratio is 900 ÷ 100 = 9. The ratio describes how many people lean one way, not how much money is behind each side.",
      },
      {
        type: "paragraph",
        children:
          'The ratio is also exchange-specific, so a reading from one venue may not represent the whole market. Some sites show "top trader" versions with their own definitions. Use the ratio as a rough crowd snapshot, labelled with its source and definition.',
      },
      {
        type: "paragraph",
        children:
          "All these numbers matter most in one situation: when positions are closed by force.",
      },
      {
        type: "paragraph",
        children:
          "Increasing open interest alone therefore does not prove net bullish intent. It may reflect hedging, arbitrage, speculation or combinations. Compare price, basis and context with explicit limitations rather than assigning one inevitable direction to the number.",
      },
      {
        type: "heading",
        level: 3,
        children: "Liquidations, cascades and estimated heatmaps",
      },
      {
        type: "paragraph",
        children:
          "Reported liquidations describe events captured by a provider's feed. A heatmap may estimate possible levels from assumptions about entry, leverage and positions, rather than observe every account's actual liquidation price. Venue coverage, reporting delays, missing events and changing collateral can affect accuracy. A colourful chart is not a complete map of future forced orders.",
      },
      {
        type: "paragraph",
        children:
          "State what is measured and what is inferred. A cluster of estimates can be a context observation, but it does not prove price must move there. Liquidation mechanics depend on mark prices, margins and contract rules, which the next level explores. For practice, use supplied figures and explain the measurement boundary rather than opening a leveraged position to validate a dashboard.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand liquidation without the maths",
      },
      {
        type: "paragraph",
        children:
          "Think of a car loan in Germany. If you stop making payments, the lender can take the car and sell it, whether or not you agree, and often at a poor price. A liquidation is the derivatives version.",
      },
      {
        type: "definition",
        term: "Liquidation",
        children:
          "The forced closing of a leveraged position by the exchange when the trader's margin falls below the required minimum, called the maintenance margin.",
      },
      {
        type: "paragraph",
        children:
          "Kraken's learning centre describes it this way: when the market moves against a position and funds fall below the platform's maintenance margin requirement, the platform closes the position automatically. The trader usually loses most or all of the margin in that position, and fees can make it worse.",
      },
      {
        type: "paragraph",
        children:
          "Exactly where liquidation happens depends on the leverage, the margin, fees and the exchange's rules. Level 8 works through a simplified liquidation-price calculation. For now, keep one idea: the higher the leverage, the smaller the price move needed to trigger liquidation.",
      },
      {
        type: "warning",
        title: "A liquidation is a sale at the worst moment",
        children:
          "A forced sale happens when the price is already moving against you, often into a thin market. You do not choose the price. The safest way to learn this lesson is by reading about it, not by experiencing it.",
      },
      {
        type: "paragraph",
        children:
          "One trader's liquidation is personal. When thousands happen at once, they can move the whole market, as the next section shows.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow a liquidation cascade",
      },
      {
        type: "paragraph",
        children:
          "A liquidation cascade is a feedback process. An initial price move reduces leveraged equity. Positions hit their maintenance rules and are reduced or closed. That action can worsen prices in thin markets, pushing additional positions toward liquidation.",
      },
      {
        type: "example",
        title: "Two holders in one fictional sell-off",
        children:
          "Valentina in Argentina holds fully paid spot units, while Sam in Australia has a highly leveraged long. Both see a price fall. Sam's position can be forced closed under the venue's rules; Valentina's market value falls but the spot holding is not automatically liquidated merely because its price changed. Her custody and other obligations still matter.",
      },
      {
        type: "paragraph",
        children:
          "A reported liquidation total covers the venues and events captured by the source. A heatmap often estimates possible levels from assumptions. Keep observed events and inferred future levels separate. The feedback can also operate in the other direction when shorts are forced to close.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read these numbers as information not signals",
      },
      {
        type: "paragraph",
        children:
          'A weather forecaster in Johannesburg looks at pressure, wind and humidity together, and still says "60% chance of rain", not "it will rain". Derivatives data deserve even more humility.',
      },
      {
        type: "paragraph",
        children:
          "Funding, open interest, basis, the long/short ratio and liquidation totals are all useful descriptions of how traders are positioned. But they are noisy. Each exchange calculates them differently, intervals differ, data sites combine venues in different ways, and some figures are estimates. Liquidation totals depend on what exchanges choose to report. In a crash, prices on different venues can split apart, as the USDe example showed.",
      },
      {
        type: "paragraph",
        children:
          'They are also reflexive: when many people watch the same number, their reactions change it. "Funding is very high" can lead some traders to close longs, which lowers funding, before anything else happens.',
      },
      {
        type: "paragraph",
        children:
          "So write these numbers down with their source, venue, time and definition, and use them to describe the market's mood. Do not treat them as instructions. Now practise reading them.",
      },
      {
        type: "diagram",
        alt: "A feedback mechanism in a fictional sell-off. Reported events and estimated liquidation levels are different forms of data.",
        caption:
          "A feedback mechanism in a fictional sell-off. Reported events and estimated liquidation levels are different forms of data.",
        src: "/lessons/crypto/level-7/lesson-3-rId44.png",
        width: 1980,
        height: 1254,
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The stadium occupancy and the turnstile count",
        children:
          "A stadium in Italy can have 10,000 people inside while recording 2,000 turnstile passages over an hour. Occupancy and activity are different measures. Open interest and volume also answer different questions, although contracts always have counterparties and do not map exactly to people in seats. A learner should not interpret a busy trading period as proof that outstanding exposure increased, nor infer a price direction from the outstanding count alone.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Received funding and estimated liquidation clusters do not guarantee profitable exposure.",
      },
      {
        type: "paragraph",
        children:
          "Try the following questions aloud or on paper before opening the worked answers. Compare your reasoning as well as your final answer.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Calculate funding at positive 0.03 percent on USD 5,000 under the supplied convention.",
          "2. One existing long transfers its position to a new long while the short remains. Can volume rise without open interest rising?",
          "3. Name two limitations of a liquidation heatmap.",
        ],
        answers: [
          "1. USD 5,000 × 0.0003 = USD 1.50 paid by the long under the stated convention.",
          "2. Yes. A trade occurs, but the outstanding contract remains rather than a new pair being created.",
          "3. Coverage can be incomplete and levels can depend on estimated entry, leverage or collateral. Delays and feed definitions also matter.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does increasing open interest alone prove a bullish market?",
        ],
        answers: [
          "No. Outstanding contracts have counterparties and can reflect many motives. Direction requires additional evidence and remains uncertain.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Contract terms determine the meaning of derivative prices.",
          "Funding is a variable cash flow within exposure.",
          "Open interest, volume and estimated liquidations have different scopes.",
        ],
      },
      {
        type: "keyPoint",
        title: "Lesson completion check",
        points: [
          "I can explain the learning goal in my own words.",
          "I have completed the paper practice and compared my reasoning with the worked answers.",
          "I can name a limitation or risk that the example does not remove.",
        ],
        checklist: true,
      },
      {
        type: "heading",
        level: 3,
        children: "References and further reading",
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group: Introduction to Options",
            url: "https://www.cmegroup.com/education/courses/introduction-to-options/introduction-to-options",
          },
          {
            title:
              "Kraken: Managing margin and liquidations in multi collateral trading",
            url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
          },
          {
            title: "Coinbase: What is the funding rate",
            url: "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
          },
          {
            title: "CME Group: Open Interest",
            url: "https://www.cmegroup.com/education/courses/introduction-to-futures/open-interest",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
        ],
      },
    ],
  },
];
const metadata4: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "crypto-charts-and-evidence",
  description: "Interpret a metric using its method, coverage and timestamp.",
  estimatedMinutes: 12,
  learningPath: "crypto",
  level: "level-7",
  module: "charts-market-context-and-evidence",
  objectives: ["Interpret a metric using its method, coverage and timestamp."],
  position: 4,
  prerequisites: ["derivatives-funding-open-interest-and-liquidations"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "derivatives-funding-open-interest-and-liquidations",
    "sentiment-narratives-and-an-evidence-based-research-note",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Interpret a metric using its method, coverage and timestamp.",
  seoTitle: "On-Chain Data, Explorers and Measurement Limits",
  slug: "on-chain-data-explorers-and-measurement-limits",
  sources: [
    {
      title: "Glassnode: Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title: "Glassnode: Addresses metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/addresses",
    },
    {
      title: "Glassnode: Exchange Data Transparency Notice",
      url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Ethereum: Transactions",
      url: "https://ethereum.org/developers/docs/transactions/",
    },
    {
      title:
        "Coin Metrics: Coin Metrics — Active Addresses (network data documentation)",
      url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses",
    },
    {
      title:
        "Coin Metrics: Coin Metrics — Active Wallets (network data documentation)",
      url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/wallets/active-wallets",
    },
    {
      title:
        "Glassnode: Glassnode — Bitcoin On-Chain Exchange Metrics: The Good, The Bad, The Ugly (2021, updated 2025)",
      url: "https://research.glassnode.com/exchange-metrics/",
    },
  ],
  status: "published",
  title: "On-Chain Data, Explorers and Measurement Limits",
};
const sections4: LessonSection[] = [
  {
    title: "Addresses, people and exchange transfers",
    shortTitle: "Addresses people and exchange transfers",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Interpret a metric using its method, coverage and timestamp.",
      },
      {
        type: "paragraph",
        children:
          "A public ledger contains rich information, but a dashboard often adds labels and estimates before showing a simple number. Addresses are not people, exchange flows are not automatically sales, and activity can include internal movement or bots. This lesson helps you read on-chain evidence without stretching the observation into a certainty it cannot support.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Describe what the data measures before explaining what may have caused it.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Addresses, transactions and people",
      },
      {
        type: "heading",
        level: 3,
        children: "What is on chain data",
      },
      {
        type: "paragraph",
        children:
          "Think of a land registry office in Toronto. Anyone can look up which parcel changed hands, when, and for how much. What the registry does not tell you is who really lives there, why they sold, or whether two parcels belong to the same family. It is a public record of transfers, not a diary of intentions.",
      },
      {
        type: "paragraph",
        children:
          "A public blockchain is a little like that registry. As you learned in Level 1, every confirmed transaction is recorded in blocks that anyone can read. On-chain data is information taken directly from that public record: which addresses sent and received coins, how much, when, and how many coins sit at each address. You can read it yourself through a block explorer, a website that displays the blockchain in readable form, such as mempool.space for Bitcoin or Etherscan for Ethereum.",
      },
      {
        type: "paragraph",
        children:
          "Analytics firms such as Glassnode and Coin Metrics process this raw record into charts and metrics. That processing is useful, because nobody can read millions of transactions by hand. It is also where judgement creeps in: firms have to guess which addresses belong together, which belong to exchanges, and which transfers matter.",
      },
      {
        type: "paragraph",
        children:
          "The registry analogy stops working in one way. A land registry usually records the owner's name. A blockchain records only addresses, which are strings of characters with no name attached. That single difference shapes almost every limit in this lesson. Start with the most quoted number of all: how many addresses are active.",
      },
      {
        type: "heading",
        level: 3,
        children: "Count active addresses carefully",
      },
      {
        type: "paragraph",
        children:
          "Picture a café in Rome counting how many cups it served today. That number tells you something about how busy it was. But one customer might order five cups, and one office might send a single person to collect fifty. Cups are not customers.",
      },
      {
        type: "definition",
        term: "Active addresses",
        children:
          "The number of unique addresses that sent or received coins on a blockchain during a set period, such as a day. Each address is counted once per period.",
      },
      {
        type: "paragraph",
        children:
          'Coin Metrics describes active addresses as a popular way to estimate the number of users, while warning that the match is imperfect. Its documentation notes that on blockchains where creating addresses and sending transactions is cheap or free, active addresses "can still be trivially forged". It also counts addresses that send zero coins, send to themselves, or take part in failed transactions.',
      },
      {
        type: "example",
        title: "Five addresses, one person",
        children:
          "Priya in Pune uses a Bitcoin wallet that creates a fresh receiving address each time, as many wallets do. In one day she receives two payments and sends one, with change going to a new address. She alone can add four or five active addresses to the day's count. Meanwhile, an exchange deposit address used by thousands of customers counts as one.",
      },
      {
        type: "paragraph",
        children:
          'To get closer to people, Coin Metrics also publishes "wallet" metrics, which group addresses it estimates belong to the same owner, because, in its words, users often own more than one address. Those groupings are estimates too. So treat active addresses as a rough measure of activity, best compared with itself over time on the same chain. The next set of metrics tries to track one special kind of owner: exchanges.',
      },
      {
        type: "heading",
        level: 3,
        children: "See how holdings are spread out",
      },
      {
        type: "paragraph",
        children:
          "A school in Seoul can report how pocket money is spread among pupils: how many have a little, how many have a lot. Crypto analysts do the same with addresses. Holder distribution groups addresses by balance, for example under 1 coin, 1–10, 10–100 and so on, and shows how much of the supply sits in each group.",
      },
      {
        type: "paragraph",
        children:
          'You met holder concentration in Level 5, where a few wallets holding most of a token was a red flag. The same caution applies when reading distribution charts. The biggest addresses are often not individuals at all. They can be exchanges holding coins for millions of customers, smart contracts such as bridges or staking contracts, or project treasuries. A chart might show "whales" accumulating when an exchange has consolidated its own wallets.',
      },
      {
        type: "paragraph",
        children:
          'Some data firms publish "entity-adjusted" versions that try to group addresses by owner before counting. These are more realistic, but they inherit every error in the grouping. Before reading a distribution chart, check whether it counts addresses or estimated entities, and whether known exchange and contract addresses are excluded.',
      },
      {
        type: "paragraph",
        children:
          "Distribution shows where coins sit. The next metric tries to show how much is moving, and it is the one most easily misread.",
      },
      {
        type: "paragraph",
        children:
          "A transaction is a network action, while a token transfer is an asset movement that may appear inside that action. The grouping may rely on heuristics rather than verified identity. Active addresses therefore do not directly count unique human users. A metric may count senders, receivers or both during a chosen interval. A dashboard's convenient label should not hide what the data actually measures.",
      },
      {
        type: "diagram",
        alt: "Several addresses can serve one person; one service address can serve many people. Address counts cannot directly count users.",
        caption:
          "Several addresses can serve one person; one service address can serve many people. Address counts cannot directly count users.",
        src: "/lessons/crypto/level-7/lesson-4-rId45.png",
        width: 1980,
        height: 1254,
      },
      {
        type: "heading",
        level: 3,
        children: "Exchange inflows do not prove a sale",
      },
      {
        type: "paragraph",
        children:
          "Think of a car park in Sydney. Cars driving in might be there to shop; cars driving out might be going home. Watching the gate tells you something about traffic, but not what each driver plans to do.",
      },
      {
        type: "paragraph",
        children:
          "Exchange inflows are coins moving into addresses believed to belong to exchanges; exchange outflows are coins moving out. Analysts watch them because coins usually go to an exchange to be sold or used as margin, and leave an exchange to be held elsewhere. Glassnode tracks exchange balances, flows and counts of deposits and withdrawals.",
      },
      {
        type: "paragraph",
        children:
          "The hard part is knowing which addresses belong to exchanges. Glassnode explains that it combines addresses confirmed by the exchanges, labels from outside sources, and clustering, which uses statistical rules to link addresses to a few known ones. Exchange wallets are constantly changing: Glassnode reports that one exchange it studied had nearly 25 million associated addresses.",
      },
      {
        type: "example",
        title: "The outflow that was not",
        children:
          'Matteo in Turin sees a headline: "10,000 BTC leave an exchange." It sounds like buyers moving coins into self-custody. Glassnode warns that a sudden outflow of that size may be an internal transfer, such as an exchange moving coins to a new cold wallet that has not yet been labelled. Once the new wallet is identified, the "outflow" can disappear from the data.',
      },
      {
        type: "paragraph",
        children:
          "So exchange flows are clues about intentions, filtered through guesses about ownership. Glassnode advises treating single large flows as preliminary until verified. From who is moving coins, the natural next question is who is holding them.",
      },
      {
        type: "paragraph",
        children:
          "It does not prove that the deposited asset was sold. The service may move assets among its own wallets, and a provider may not recognise every exchange-controlled address. Net inflow is a calculation from captured flows under those definitions, not a complete view of exchange liabilities or customer intentions. Use a flow as a question to investigate rather than an instruction to trade.",
      },
    ],
  },
  {
    title: "Transfer value, valuation and stablecoin supply",
    shortTitle: "Transfer value valuation and stablecoin supply",
    blocks: [
      {
        type: "paragraph",
        children:
          "Transaction count, transfer value, fees and protocol usage measure different things. A large value transfer can occur in one transaction, and many tiny transfers can increase counts without comparable economic activity. Fees may indicate demand for a network resource, but unusual activity or congestion can change the relationship. A USD-valued series can rise because the asset price rises even when unit activity is unchanged.",
      },
      {
        type: "paragraph",
        children:
          "Bots, wash activity and circular transfers can distort interpretations of growth. Applications may report gross flows that count repeated movements of the same value. A useful note identifies whether the metric counts distinct actions, units, users or value, and whether adjustments are applied. Compare more than one measure before describing adoption. A rising line is evidence of the defined series, not automatically of genuine independent demand.",
      },
      {
        type: "comparisonTable",
        caption: "Interpret the metric cautiously",
        columns: [
          "Metric",
          "What is observed or estimated",
          "What is not proven",
        ],
        rows: [
          [
            "Active addresses",
            "Defined addresses active in an interval",
            "Unique people",
          ],
          [
            "Entity count",
            "Heuristic groups under methodology",
            "Verified legal identities",
          ],
          [
            "Exchange inflow",
            "Captured transfers to labelled addresses",
            "Completed customer sales",
          ],
          [
            "Transfer value",
            "Value under counting and price rules",
            "Independent economic activity",
          ],
          [
            "Fees",
            "Payments for network resources",
            "Guaranteed token valuation",
          ],
          [
            "Revised history",
            "Updated classifications",
            "Information available at the old date",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'Imagine Thandiwe in Durban pays for a R30 coffee with a R200 note and gets R170 back. Did R200 change hands, or R30? If you counted every note that moved, you would record R370 of "volume" for one coffee.',
      },
      {
        type: "heading",
        level: 3,
        children: "Read realised price and MVRV in plain words",
      },
      {
        type: "paragraph",
        children:
          "Realised capitalisation commonly values coins at the market price associated with when they last moved, using a provider's defined methodology. Dividing that estimate by a matching supply basis gives realised price. Market value divided by realised value gives MVRV.",
      },
      {
        type: "example",
        title: "An invented network",
        children:
          "If realised value is US$100 billion and the matching supply is 5 million units, realised price is US$20,000 per unit. At a US$30,000 current price, matching market value is US$150 billion and MVRV is 1.5.",
      },
      {
        type: "paragraph",
        children:
          "These are analytical estimates, not a census of what every owner paid. A transfer between one person's wallets, exchange custody movements or provider adjustments can break the simple last-moved-equals-last-bought interpretation. State the methodology and timestamp. A ratio does not establish an inevitable top, bottom or future return.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch the stablecoin supply",
      },
      {
        type: "paragraph",
        children:
          "Think of a currency exchange counter at an airport in Jeddah. If the counter's drawer of US dollars grows, more people may be preparing to spend dollars somewhere. It does not tell you where or when.",
      },
      {
        type: "paragraph",
        children:
          "Stablecoins, which you met in Level 3, are often the cash of crypto trading. The total stablecoin supply is how many stablecoin units exist. DeFiLlama, a data site, tracks the total stablecoin market cap and circulating supply over time, flows into and out of each stablecoin, how far each is from its peg, and which blockchains they sit on.",
      },
      {
        type: "paragraph",
        children:
          'Some analysts read a growing stablecoin supply as more "dry powder" available to buy crypto. Be careful. Stablecoins are also used for payments, savings in countries with weak currencies, and settlement between firms. Supply can grow because an issuer minted coins for one large client, and coins can sit on a chain for months unused. A falling supply might mean redemptions to cash, or a move to a different stablecoin not in the chart.',
      },
      {
        type: "paragraph",
        children:
          "So stablecoin supply describes how much crypto-dollar liquidity exists, not what it will be used for. On-chain data is only half of this lesson. The other half measures something softer: mood.",
      },
    ],
  },
  {
    title: "Methodology, timestamps and bounded conclusions",
    shortTitle: "Methodology timestamps and bounded conclusions",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Timestamps, revised history and methodology",
      },
      {
        type: "paragraph",
        children:
          "Record provider methodology, timezone, interval, asset coverage and whether observations can be revised. Entity clustering can change when new information links addresses. A historical chart downloaded today may therefore differ from what was available at the time. This matters when testing whether an old signal would have been usable.",
      },
      {
        type: "paragraph",
        children:
          "A retrospective test using newly classified historical data can accidentally give itself future information. Preserve snapshots or use point-in-time datasets where needed. Also check whether values are daily totals, end-of-day balances or moving averages. Mixing them can create false correlations. Measurement discipline is part of analysis, not a tedious appendix to it.",
      },
      {
        type: "paragraph",
        children:
          "Every metric so far rests on one fragile step: turning addresses into owners. That step fails in both directions.",
      },
      {
        type: "paragraph",
        children:
          'Exchange wallets are the biggest source of confusion. One exchange can control millions of addresses and move coins between them at any time. Until those addresses are labelled, internal moves look like real flows. Glassnode notes that exchange metrics "are subject to change" when new addresses are discovered, so past charts can be revised. A chart you screenshot today may look different next month.',
      },
      {
        type: "paragraph",
        children:
          "Data can also be lagging. On-chain data shows a transfer once it is confirmed, but analytics firms need time to label and adjust it. By the time a clear pattern appears, the market may already have moved.",
      },
      {
        type: "warning",
        title: "Check before you share",
        children:
          "A dramatic on-chain chart can be wrong, revised or misread within hours. Before you act on one, or forward it, ask: which firm, which metric, raw or adjusted, and has the underlying move been confirmed? If you cannot answer, treat it as unverified.",
      },
      {
        type: "paragraph",
        children:
          "Technical limits are honest mistakes. The next limits are not always honest.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write an appropriately limited conclusion",
      },
      {
        type: "paragraph",
        children:
          "State the observation, definition, possible explanation, alternative and unresolved issue. For example: captured deposits to labelled exchange addresses rose over three days; this could indicate greater availability for sale, but internal movement and incomplete attribution remain possible. That sentence communicates more honestly than holders are definitely selling.",
      },
      {
        type: "paragraph",
        children:
          "Use fictional or public protocol examples in class work without exposing your own financial addresses. Inspecting public data does not require connecting a wallet. The next lesson combines market, on-chain and sentiment evidence into a note that distinguishes calculations from forecasts. Good analysis makes the limits visible so a reviewer can see how much confidence the evidence warrants.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Counting doors rather than residents",
        children:
          "An apartment complex in Canada has 100 doors. Some households use two connected units, while a shared building serves many residents. Counting doors does not directly count people. On-chain addresses have a similar attribution problem: one person may use many, and one service may represent many customers. A chart labelled users may in fact count active addresses. The learner should inspect the method before claiming that 100 new addresses means 100 new people.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not expose personal addresses or treat inferred labels as verified identities.",
      },
      {
        type: "paragraph",
        children:
          "Try the following questions aloud or on paper before opening the worked answers. Compare your reasoning as well as your final answer.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Why can USD transfer value rise with unchanged token-unit flow?",
          "2. A large exchange-labelled transfer appears. Give two alternative explanations besides selling.",
          "3. What should you preserve for a point-in-time research test?",
        ],
        answers: [
          "1. The conversion price can rise while the quantity is unchanged.",
          "2. An internal wallet reorganisation, custody migration or a deposit held without sale are possible explanations.",
          "3. The dataset or snapshot available at the decision time, definitions, timestamps, coverage and revision information.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does an exchange inflow prove that the recipient sold the asset?",
        ],
        answers: [
          "No. It records a captured transfer under attribution rules. Subsequent sale and motivation need separate evidence.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Addresses and entities are not automatically people.",
          "Flow attribution has coverage and classification limits.",
          "Revised historical data can affect a retrospective test.",
        ],
      },
      {
        type: "keyPoint",
        title: "Lesson completion check",
        points: [
          "I can explain the learning goal in my own words.",
          "I have completed the paper practice and compared my reasoning with the worked answers.",
          "I can name a limitation or risk that the example does not remove.",
        ],
        checklist: true,
      },
      {
        type: "heading",
        level: 3,
        children: "References and further reading",
      },
      {
        type: "references",
        items: [
          {
            title: "Glassnode: Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title: "Glassnode: Addresses metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/addresses",
          },
          {
            title: "Glassnode: Exchange Data Transparency Notice",
            url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Ethereum: Transactions",
            url: "https://ethereum.org/developers/docs/transactions/",
          },
          {
            title:
              "Coin Metrics: Coin Metrics — Active Addresses (network data documentation)",
            url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses",
          },
          {
            title:
              "Coin Metrics: Coin Metrics — Active Wallets (network data documentation)",
            url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/wallets/active-wallets",
          },
          {
            title:
              "Glassnode: Glassnode — Bitcoin On-Chain Exchange Metrics: The Good, The Bad, The Ugly (2021, updated 2025)",
            url: "https://research.glassnode.com/exchange-metrics/",
          },
        ],
      },
    ],
  },
];
const metadata5: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "crypto-charts-and-evidence",
  description:
    "Combine information while keeping observation separate from speculation.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-7",
  module: "charts-market-context-and-evidence",
  objectives: [
    "Combine information while keeping observation separate from speculation.",
  ],
  position: 5,
  prerequisites: ["on-chain-data-explorers-and-measurement-limits"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["on-chain-data-explorers-and-measurement-limits"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Combine information while keeping observation separate from speculation.",
  seoTitle: "Sentiment, Narratives and an Evidence-Based Research Note",
  slug: "sentiment-narratives-and-an-evidence-based-research-note",
  sources: [
    {
      title: "CFTC: Beware Virtual Currency Pump and Dump Schemes",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "Glassnode: Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title: "Glassnode: Exchange Data Transparency Notice",
      url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    },
    {
      title:
        "Coin Metrics: Coin Metrics — Active Addresses (network data documentation)",
      url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses",
    },
    {
      title:
        "Coin Metrics: Coin Metrics — Active Wallets (network data documentation)",
      url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/wallets/active-wallets",
    },
    {
      title:
        "Glassnode: Glassnode — Bitcoin On-Chain Exchange Metrics: The Good, The Bad, The Ugly (2021, updated 2025)",
      url: "https://research.glassnode.com/exchange-metrics/",
    },
    {
      title:
        "Alternative.me: Crypto Fear and Greed Index: published methodology",
      url: "https://alternative.me/crypto/fear-and-greed-index/",
    },
    {
      title: "Google Trends Help: FAQ about Google Trends data",
      url: "https://support.google.com/trends/answer/4365533?hl=en",
    },
  ],
  status: "published",
  title: "Sentiment, Narratives and an Evidence-Based Research Note",
};
const sections5: LessonSection[] = [
  {
    title: "Sentiment measures, claims and incentives",
    shortTitle: "Sentiment measures claims and incentives",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Combine information while keeping observation separate from speculation.",
      },
      {
        type: "paragraph",
        children:
          "A persuasive market narrative can combine real facts with unsupported conclusions. Your research note should make that boundary visible. This lesson brings charts, protocol information, on-chain data and sentiment together in a short explanation that a reviewer can question and reproduce.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A research conclusion should reveal the steps between observation and expectation.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "What sentiment measures",
      },
      {
        type: "paragraph",
        children:
          "A restaurant owner in New York can sense a busy night by the noise from the street. Noise is a real signal, but it can mislead: a parade is loud, too. Sentiment data tries to measure the market's mood from prices, social media and search behaviour.",
      },
      {
        type: "paragraph",
        children:
          'The best known is the Crypto Fear & Greed Index published by Alternative.me. It runs from 0 ("extreme fear") to 100 ("extreme greed") and currently covers Bitcoin only. Its methodology page lists the ingredients. The publisher marks surveys as paused. The table lists published components without assuming how a paused input is reweighted.',
      },
      {
        type: "comparisonTable",
        caption: "What goes into the Alternative.me Fear & Greed Index",
        columns: ["Component", "Weight", "What it looks at"],
        rows: [
          [
            "Volatility",
            "25%",
            "Bitcoin's current volatility and drawdowns compared with 30- and 90-day averages",
          ],
          [
            "Market momentum and volume",
            "25%",
            "Current volume and momentum compared with recent averages",
          ],
          [
            "Social media",
            "15%",
            "Bitcoin posts, hashtags and interaction rates on X (Twitter)",
          ],
          ["Surveys", "15%", "Weekly polls (paused at the time of writing)"],
          [
            "Bitcoin dominance",
            "10%",
            "Bitcoin's share of the market (Lesson C7.2)",
          ],
          [
            "Search trends",
            "10%",
            "Google Trends data for Bitcoin-related searches",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'Notice that half the index comes from price behaviour itself. A big fall raises volatility and lowers momentum, which pushes the index towards "fear". So the index partly re-describes the chart you already saw.',
      },
      {
        type: "paragraph",
        children:
          "Social volume counts how often a coin is mentioned on social media. It can be inflated by bots and coordinated posting. Google Trends shows search interest. Google explains that its figures are scaled from 0 to 100 relative to all searches in that place and period, where 100 is the peak for that search, not an absolute count. It uses a sample and contains some random noise. A score of 100 in one country and 100 in another can mean very different numbers of searches.",
      },
      {
        type: "paragraph",
        children:
          "Sentiment is real information about mood. But mood can be manufactured, which brings you to the limits.",
      },
      {
        type: "paragraph",
        children:
          "They do not directly measure future demand at a particular price. People who post are not necessarily representative of all holders or potential buyers. A search spike may reflect a security incident rather than positive interest.",
      },
      {
        type: "heading",
        level: 3,
        children: "Verify the central claim and promotional incentives",
      },
      {
        type: "paragraph",
        children:
          "On 3 October 2022, the US SEC announced charges against Kim Kardashian for promoting a crypto token on Instagram without disclosing that she had been paid US$250,000 to do so. She agreed to pay US$1.26 million to settle the charges. SEC Chair Gary Gensler warned that a celebrity or influencer endorsement does not mean an investment is right for you.",
      },
      {
        type: "paragraph",
        children:
          'That case shows a wider problem. Sentiment and "on-chain insight" posts can be paid for, coordinated or written by people who already hold the asset. Social volume can be bought. A chart can be cropped to the period that supports a story. When a post pairs a striking chart with a strong opinion, ask who benefits if you believe it.',
      },
      {
        type: "paragraph",
        children:
          'The other trap is false cause. Ice-cream sales and sunburn rise together in a hot summer in Italy, but ice cream does not cause sunburn; the sun causes both. In crypto, "exchange outflows rose and the price rose" may share a cause, such as good news, or be coincidence. Correlation, which you met in the chart and context lessons in Level 7, describes moving together. It never proves that one thing caused the other.',
      },
      {
        type: "example",
        title: "Two facts, one story",
        children:
          'Grace in Leeds reads: "Whales bought, so the price jumped." She checks. The "whale" addresses turn out to be an exchange reorganising its wallets, and the price jump came the same hour as an interest-rate announcement. Both facts were true. The link between them was invented.',
      },
      {
        type: "paragraph",
        children:
          "With all these limits, how can on-chain and sentiment data still be useful?",
      },
      {
        type: "paragraph",
        children:
          "If it claims a regulator approved something, inspect the official document and its scope. A project's official source is useful for its announcement, while product performance and legal implications may need other evidence. Do not attach an official link to a broader conclusion that it does not establish.",
      },
    ],
  },
  {
    title: "Label evidence, test alternatives and write a research note",
    shortTitle: "Label evidence test alternatives and write a research note",
    blocks: [
      {
        type: "heading",
        level: 3,
        children:
          "Separate facts, calculations, estimates, hypotheses and forecasts",
      },
      {
        type: "paragraph",
        children:
          "Facts are documented claims about current or past conditions. Calculations follow stated inputs. Estimates use a methodology with uncertainty. Hypotheses propose an explanation or relationship. Forecasts describe future outcomes. A note can contain all five, but it should identify them rather than make every sentence sound equally certain.",
      },
      {
        type: "paragraph",
        children:
          "For example, a dated unlock schedule is evidence; a percentage increase in available units is a calculation; likely seller behaviour is an estimate or hypothesis; a future price fall is a forecast. The steps do not automatically prove one another. A natural explanation says why one fact may matter and then names the assumptions that connect it to the possible outcome.",
      },
      {
        type: "comparisonTable",
        caption: "Build a research note from supplied evidence",
        columns: ["Statement", "Type", "Limit or next check"],
        rows: [
          [
            "Official notice lists a future launch date",
            "Documented fact about the notice",
            "Implementation still needs verification",
          ],
          [
            "Circulating estimate rises 10 percent",
            "Calculation under supplied definition",
            "Method and schedule may change",
          ],
          [
            "New units may increase available selling supply",
            "Hypothesis",
            "Holder behaviour and demand remain unknown",
          ],
          [
            "Posts increased in the sampled channel",
            "Observation",
            "Bots and sample bias possible",
          ],
          [
            "Price will rise next week",
            "Forecast",
            "Not established by these facts",
          ],
          [
            "Research paused pending contract confirmation",
            "Decision boundary",
            "Observable missing evidence",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Test contrary evidence and invalidation",
      },
      {
        type: "paragraph",
        children:
          "A useful note tests the strongest reasonable alternative. A token may face an unlock while demand or liquidity also increases. A rising address count may reflect bots. A price breakout may occur on a thin venue. Include the evidence that weakens the preferred interpretation rather than hiding it in a separate file.",
      },
      {
        type: "paragraph",
        children:
          "Define an observable invalidation condition. If a thesis depends on a feature launching by a date, failure to launch changes the thesis. If it depends on broad activity, evidence that one bot creates most activity weakens it. Invalidation concerns the research claim; a trading stop is an execution instruction and may serve a different purpose. Both should be explicit if a later practice plan uses them.",
      },
      {
        type: "paragraph",
        children:
          "A detective in Mexico City does not solve a case from one footprint. She looks for several independent clues and stays open to the possibility that she is wrong. Crypto data needs the same approach.",
      },
      {
        type: "paragraph",
        children:
          "First, prefer evidence that comes from different sources. Price, the Fear & Greed Index and momentum indicators are partly the same information, so three of them agreeing is not three clues. An on-chain metric, a derivatives metric from the derivatives data lesson in Level 7 and a macro fact from the chart and context lessons in Level 7 are more independent.",
      },
      {
        type: "paragraph",
        children:
          'Second, avoid overfitting: tuning a rule until it fits the past perfectly. With enough metrics and enough settings, you can always find a combination that "would have" called every top. That rule describes the past, not the future. Write your rule down before you look at the result, and keep the failures.',
      },
      {
        type: "paragraph",
        children:
          "Third, write each observation with its source, metric definition, time and whether it was raw or adjusted. Then add what would prove your reading wrong, as in the chart and context lessons in Level 7. Now practise.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write the bounded research note",
      },
      {
        type: "paragraph",
        children:
          "A concise note contains the question, exact product, dated evidence, calculations, interpretation, alternatives, unresolved issues and next step. It can conclude that more information is needed. Avoid a price target if the evidence does not support one. A well-documented declined action can demonstrate stronger reasoning than a confident trade based on a popular story.",
      },
      {
        type: "paragraph",
        children:
          "No single chart, flow metric or sentiment measure guarantees an outcome. Combining weak correlated signals does not make them independent proof. Review the underlying definitions and dependencies first. The next level translates a hypothetical idea into a risk budget and records, so even a plausible thesis is not allowed to override affordability or execution uncertainty.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The restaurant queue",
        children:
          "A restaurant in Germany has a long queue on Saturday. It might be popular, understaffed, offering a one-day discount or recovering from a delayed opening. The queue is a real observation, while its explanation needs more evidence. A token's social engagement spike has a similar distinction. A learner can report increased attention without claiming that buyers must pay a higher EUR price next week.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not let a compelling narrative bypass rights, liquidity or affordability checks.",
      },
      {
        type: "paragraph",
        children:
          "Try the following questions aloud or on paper before opening the worked answers. Compare your reasoning as well as your final answer.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Write a two-sentence note separating a documented unlock from a price forecast.",
          "2. Give an alternative explanation for a search-interest spike.",
          "3. Write one observable condition that would weaken a launch-based thesis.",
        ],
        answers: [
          "1. Example: the dated schedule lists one million units becoming available. This may affect potential supply, but recipient selling and future prices remain uncertain.",
          "2. A hack, controversy, promotion or repeated bot activity can attract searches without positive demand.",
          "3. The verified launch does not occur by the defined date, or the deployed contract lacks the feature on which the thesis depends.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Do five indicators based on the same price series necessarily provide five independent confirmations?",
        ],
        answers: [
          "No. They can summarise overlapping information. Independence and predictive usefulness require evidence.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Attention and demand are different measurements.",
          "Label facts, calculations and hypotheses by their evidence.",
          "Contrary evidence and invalidation make a note reviewable.",
        ],
      },
      {
        type: "keyPoint",
        title: "Lesson completion check",
        points: [
          "I can explain the learning goal in my own words.",
          "I have completed the paper practice and compared my reasoning with the worked answers.",
          "I can name a limitation or risk that the example does not remove.",
        ],
        checklist: true,
      },
      {
        type: "heading",
        level: 3,
        children: "References and further reading",
      },
      {
        type: "references",
        items: [
          {
            title: "CFTC: Beware Virtual Currency Pump and Dump Schemes",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "Glassnode: Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title: "Glassnode: Exchange Data Transparency Notice",
            url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
          },
          {
            title:
              "Coin Metrics: Coin Metrics — Active Addresses (network data documentation)",
            url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses",
          },
          {
            title:
              "Coin Metrics: Coin Metrics — Active Wallets (network data documentation)",
            url: "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/wallets/active-wallets",
          },
          {
            title:
              "Glassnode: Glassnode — Bitcoin On-Chain Exchange Metrics: The Good, The Bad, The Ugly (2021, updated 2025)",
            url: "https://research.glassnode.com/exchange-metrics/",
          },
          {
            title:
              "Alternative.me: Crypto Fear and Greed Index: published methodology",
            url: "https://alternative.me/crypto/fear-and-greed-index/",
          },
          {
            title: "Google Trends Help: FAQ about Google Trends data",
            url: "https://support.google.com/trends/answer/4365533?hl=en",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel7Lessons: LessonDocument[] = [
  {
    metadata: metadata1,
    sections: sections1,
    blocks: flattenSections(sections1),
  },
  {
    metadata: metadata2,
    sections: sections2,
    blocks: flattenSections(sections2),
  },
  {
    metadata: metadata3,
    sections: sections3,
    blocks: flattenSections(sections3),
  },
  {
    metadata: metadata4,
    sections: sections4,
    blocks: flattenSections(sections4),
  },
  {
    metadata: metadata5,
    sections: sections5,
    blocks: flattenSections(sections5),
  },
];
