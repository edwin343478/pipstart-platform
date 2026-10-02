import type { LessonSection } from "../../lesson-content";

export const readAChartSections: LessonSection[] = [
  {
    title: "Read the labels before the shape",
    shortTitle: "Start with the labels",
    blocks: [
      {
        type: "paragraph",
        children:
          "A chart is a visual record of selected price data. Before interpreting its shape, identify what was recorded, where it came from and how the periods were grouped. EUR/USD on a retail quote feed, a currency CFD and a listed future can be different records even if their names look similar. A screenshot without its labels leaves important questions unanswered.",
      },
      {
        type: "paragraph",
        children:
          "The horizontal axis normally shows time or an ordered sequence; the vertical axis shows price. For GBP/USD, a price of 1.2500 means US$1.25 per pound under that pair convention. Check the symbol, product, feed, quote side, date, time zone, timeframe and whether the last candle is complete. Then read the visible scale rather than guessing from the slope.",
      },
      {
        type: "paragraph",
        children:
          "You are learning observation first. Saying “the selected closing prices rose” is a description of the data. Saying “the next price must rise” adds a prediction the chart does not supply. Careful chart reading means keeping those two statements separate.",
      },
      {
        type: "example",
        title: "The weather chart needs a label",
        children: [
          "A worker in the United Kingdom sees a temperature line rising sharply. Is it degrees Celsius or Fahrenheit? Hourly or monthly? London or another city? A Forex chart needs the same basic checks. A dramatic picture is less useful than a modest one whose source and units are clear.",
        ],
      },
    ],
  },
  {
    title: "Compare line, bar and candle views",
    shortTitle: "Three chart types",
    blocks: [
      {
        type: "paragraph",
        children:
          "A line chart connects one selected price for each period, often the close. It makes the broad sequence easy to follow, but does not retain every period’s high and low. If the line uses a midpoint, bid or another measure, name that measure. “Line chart” describes the display, not a guarantee that every platform chose the same input.",
      },
      {
        type: "paragraph",
        children:
          "An OHLC bar records the open, high, low and close for one defined period. In a conventional bar, the vertical line spans low to high, the left tick marks the open and the right tick marks the close. A candlestick displays the same four prices through a body and wicks. Changing between bar and candle views of the same feed does not add new transactions to the record.",
      },
      {
        type: "paragraph",
        children:
          "Candlestick charting comes from Japanese charting traditions. Steve Nison helped introduce these methods to Western readers; his own biography describes that role. Popularising a method is different from inventing every version of it. For this course, the useful starting point is the four prices it records, rather than a story that promises special predictive power.",
      },
      {
        type: "comparisonTable",
        caption: "Different displays, different visible detail",
        columns: ["Display", "What you normally see", "What remains missing"],
        rows: [
          [
            "Selected-price line",
            "One chosen value per period connected across time",
            "Other prices within the period and their order.",
          ],
          [
            "OHLC bar",
            "Open, high, low and close with ticks and a vertical range",
            "The complete path between the four prices.",
          ],
          [
            "Candlestick",
            "The same OHLC data with body and wicks",
            "The complete path and reasons for the movement.",
          ],
        ],
      },
      {
        type: "example",
        title: "Evening readings hide the midday heat",
        children: [
          "A family in Japan writes down the temperature at 8 p.m. each day. A line joining those readings cannot reveal how hot lunchtime became. Adding each day’s highest and lowest readings supplies more detail, but still does not tell the order of every temperature change.",
        ],
      },
    ],
  },
  {
    title: "Build a candle from four prices",
    shortTitle: "Candle anatomy",
    blocks: [
      {
        type: "paragraph",
        children:
          "The open is the first recorded price in the chosen interval; the close is the last recorded price for that interval. The high is its maximum and the low its minimum. These values belong to a specific feed and price basis. A quoted high is not automatically a price at which your order could have filled.",
      },
      {
        type: "paragraph",
        children:
          "The candle body lies between open and close. An upper wick connects the top of the body to the high, and a lower wick connects the bottom of the body to the low. A close above the open is often shown in an up colour and a close below it in a down colour. Platform colours and special candle modes can differ, so read the legend.",
      },
      {
        type: "paragraph",
        children:
          "A candle whose open and close are equal or very close is often described as a doji. “Very close” needs a tolerance and context. It does not mean price did nothing: a small body can sit within a large high-to-low range. A large body or long wick describes the selected period; it does not independently reveal participants’ identities or prove why they acted.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/read-a-chart-before-interpreting-it-guide.svg",
        desktopSrc:
          "/images/lessons/forex/read-a-chart-before-interpreting-it-guide-desktop.svg",
        alt: "Hypothetical GBP/USD candle: open 1.2500, high 1.2550, low 1.2470 and close 1.2520. The body is 20 conventional pips and the high-to-low range is 80 pips. The open and close form the body; the extremes form the wicks.",
        caption:
          "The four prices record one defined interval. The diagram cannot show whether the high came before the low.",
        width: 600,
        height: 600,
      },
    ],
  },
  {
    title: "Measure the body, wicks and range",
    shortTitle: "Read the distances",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use a hypothetical GBP/USD candle with open 1.2500, high 1.2550, low 1.2470 and close 1.2520. Under the usual 0.0001 pip convention, the body is |1.2520 − 1.2500| = 0.0020, or 20 pips. The full range is 1.2550 − 1.2470 = 0.0080, or 80 pips.",
      },
      {
        type: "paragraph",
        children:
          "The upper wick is 1.2550 minus the higher of open and close, 1.2520: 30 pips. The lower wick is the lower of open and close, 1.2500, minus 1.2470: another 30 pips. For a down candle, the body endpoints reverse, but use the higher endpoint for the upper wick and the lower endpoint for the lower wick.",
      },
      {
        type: "paragraph",
        children:
          "A 20-pip body is not automatically a 20-pip trading profit. There is no recorded entry, exit, direction or size in that description. The candle’s range is also not a loss limit. If you want to translate a pip distance into money, state the hypothetical contract size and account currency separately.",
      },
      {
        type: "comparisonTable",
        caption: "The invented GBP/USD candle",
        columns: ["Measure", "Calculation", "Distance"],
        rows: [
          ["Body", "|1.2520 − 1.2500|", "20 pips"],
          ["Upper wick", "1.2550 − 1.2520", "30 pips"],
          ["Lower wick", "1.2500 − 1.2470", "30 pips"],
          ["Total range", "1.2550 − 1.2470", "80 pips"],
        ],
      },
      {
        type: "learningLink",
        title: "Explore the units with the Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "For GBP/USD, 0.01 lots, USD account and conversion factor 1 under the assumed 100,000-unit standard lot, one pip is US$0.10. A 20-pip distance corresponds to US$2 at that size; it is not an actual result without entry and exit fills.",
      },
    ],
  },
  {
    title: "Change timeframe without changing the story",
    shortTitle: "Timeframe aggregation",
    blocks: [
      {
        type: "paragraph",
        children:
          "A timeframe sets the window summarised by each time-based bar. A five-minute candle covers a shorter window than a one-hour candle; a daily candle covers the provider’s defined trading day. Lower timeframes expose more recorded detail, while higher timeframes group it. Neither view is automatically more truthful for every question.",
      },
      {
        type: "paragraph",
        children:
          "To combine complete consecutive bars from the same feed and compatible boundaries, take the first open, the highest high, the lowest low and the last close. Do not average the opens and closes to produce an ordinary larger candle. Do not add high prices together. The same underlying moves can look busy in the shorter view and simple in the longer one.",
      },
      {
        type: "paragraph",
        children:
          "A higher-timeframe up candle can contain several down candles. A brief fall can be large on a one-minute screen and minor within a week. Identify the window before using words such as “strong” or “small.” There is no single timeframe that removes noise, execution costs or uncertainty.",
      },
      {
        type: "comparisonTable",
        caption: "Four invented one-hour bars forming one four-hour bar",
        columns: ["Hour", "Open", "High", "Low", "Close"],
        rows: [
          ["1", "1.2500", "1.2530", "1.2490", "1.2510"],
          ["2", "1.2510", "1.2550", "1.2500", "1.2540"],
          ["3", "1.2540", "1.2540", "1.2470", "1.2490"],
          ["4", "1.2490", "1.2530", "1.2480", "1.2520"],
          ["Combined", "1.2500", "1.2550", "1.2470", "1.2520"],
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A larger candle summarises the smaller windows; it does not preserve the entire order of their internal moves.",
      },
    ],
  },
  {
    title: "Check quote side, clock and completeness",
    shortTitle: "Feed and time",
    blocks: [
      {
        type: "paragraph",
        children:
          "One platform may plot bid candles while another uses ask, midpoint or last-traded prices. On some OTC products there is no exchange last-trade series. Know the platform’s definition. For a long position, buying uses an available ask-side fill and closing by selling uses bid; a bid candle alone does not supply both sides of that transaction.",
      },
      {
        type: "paragraph",
        children:
          "Daily cut-offs and server time zones affect which observations enter each candle. A provider starting its trading day at a different hour can show another candle shape from overlapping data. Daylight-saving changes, holidays and missing observations need attention. A timestamp without its date and zone is incomplete evidence.",
      },
      {
        type: "paragraph",
        children:
          "The current candle is still forming until the interval ends under the feed’s rules. Its close, high, low and colour can change as new observations arrive. A close-based rule cannot be confirmed using a candle that has not closed. Mark whether a saved example is complete or still forming.",
      },
      {
        type: "paragraph",
        children:
          "Also examine chart settings. A compressed price axis can make a movement look gentle; zooming in vertically can make the same movement look dramatic. Alternative candles such as Heikin-Ashi transform price inputs and should not be mistaken for unmodified OHLC. Use ordinary bars or candles for the foundational exercises.",
      },
      {
        type: "example",
        title: "Two different diaries of the same day",
        children: [
          "A German learner records a day from midnight to midnight, while a colleague groups it from 5 p.m. to 5 p.m. Their summaries can differ even when both recorded the same hours. Compare chart boundaries before accusing one feed of being wrong.",
        ],
      },
    ],
  },
  {
    title: "Know what one candle cannot resolve",
    shortTitle: "Unknown sequence",
    blocks: [
      {
        type: "paragraph",
        children:
          "Open, high, low and close do not say whether the high came before the low. Our invented GBP/USD candle could follow open → high → low → close or open → low → high → close. Both paths match its OHLC values. Many other paths match too.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a hypothetical long entry at 1.2500 with intended stop trigger 1.2480 and target 1.2540. Both levels lie inside the candle’s recorded range. Daily OHLC alone cannot establish which was reached first, whether the entry was active at the relevant time, or which executable side qualified. Declaring a win from that candle would add information you do not have.",
      },
      {
        type: "paragraph",
        children:
          "Finer historical data may help investigate sequence, but has its own quote basis, missing ticks and execution limits. Even a complete price path does not prove the order would fill at the planned price. Keep an ambiguous observation marked ambiguous rather than choosing the favourable path.",
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "A candle is a summary, not a complete execution log. Do not use its high and low as evidence of a guaranteed stop or target fill.",
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
          "A worker in the United Kingdom saves the hypothetical GBP/USD candle and labels the product, source, daily interval, time zone and price basis. They write O = 1.2500, H = 1.2550, L = 1.2470 and C = 1.2520, all measured in US dollars per pound. The close is 20 pips above the open, within an 80-pip range.",
      },
      {
        type: "paragraph",
        children:
          "They switch to an hourly chart to investigate the day, making sure the boundaries and feed match. The extra candles can help describe when recorded moves occurred, but do not transform the daily candle into a reason to trade. The learner writes two separate notes: “what the data show” and “what remains unknown.”",
      },
      {
        type: "paragraph",
        children:
          "The first note says that this feed recorded the listed four values in the selected window. The second says that the daily record alone does not establish the path, the cause, the global order flow or the outcome of an imagined entry. This is a more accurate reading than saying “buyers won, so tomorrow must rise.”",
      },
      {
        type: "example",
        title: "Describe before explaining",
        children: [
          "A shopkeeper in India records opening cash, closing cash and the day’s highest and lowest till balances. Those numbers do not say whether lunch orders or evening orders produced the high. The candle’s four values have a similar limit.",
        ],
      },
    ],
  },
  {
    title: "Practise a complete chart description",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Using an invented or historical completed candle, record the product, source, timeframe, date, time zone and price basis. Write OHLC, calculate body and range in the proper pip convention, and name two things the candle cannot establish. Then combine four compatible shorter bars by the OHLC rule.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "For the listed GBP/USD values, body is 20 pips and total range is 80. High-before-low is unknown from that candle alone. A current candle’s close is not final. A bid chart line is not a promised buy price. The combined four-hour open is the first open, not an average of the four opens.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Finish by explaining the record to someone who has never traded. Start with the units and the chosen window, then the four values, then the limits. If your explanation requires a prediction to make sense, return to the observation. This is the base for later chart analysis, not a trading signal.",
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
          "I can label the product, source, price basis, timeframe and time zone.",
          "I can read line, bar and candle displays and calculate body, wicks and range.",
          "I can aggregate compatible bars using first open, maximum high, minimum low and last close.",
          "I can distinguish complete candles from forming candles and account for feed differences.",
          "I understand why OHLC alone cannot resolve intraperiod order or prove an imagined trade outcome.",
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
            title: "MetaTrader 5 — Price Data (platform-specific guide)",
            url: "https://www.metatrader5.com/en/terminal/help/trading_advanced/price_data",
          },
          {
            title: "CandleCharts — About Steve Nison (historical reading)",
            url: "https://candlecharts.com/about-steve-nison/",
          },
        ],
      },
    ],
  },
];
