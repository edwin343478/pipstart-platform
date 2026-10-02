import type { LessonSection } from "../../lesson-content";

export const tradingSessionsSections: LessonSection[] = [
  {
    title: "Why a global market follows the clock",
    shortTitle: "The global day",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Forex trades across global financial centres throughout the working week. Activity is commonly discussed through the Sydney, Tokyo, London and New York sessions, whose opening hours overlap.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A shop in South Africa can be closing while another in the United States is still serving afternoon customers. Global currency trading follows a similar pattern. Financial centers in Asia, Europe, and the Americas are active during their own business hours, so price discovery continues across time zones on business days.",
        ],
      },
      {
        type: "definition",
        term: "Trading session",
        children:
          "A convenient name for the period when a major financial center is normally open. It describes typical local activity, not a promise that a particular currency will move or that an individual trade is safe.",
      },
      {
        type: "example",
        title: "Calling someone abroad",
        children: [
          "Before calling a friend in another country, you check the local time rather than assuming it is daytime everywhere. Before observing a Forex market, check which financial centers are open and whether your screen shows local time, UTC, or server time.",
        ],
      },
    ],
  },
  {
    title: "Asia, Europe and the Americas",
    shortTitle: "Session map",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Sydney, Tokyo, London, and New York are the four reference centers most teaching material uses. They do not represent every institution — trading also happens in Frankfurt, Singapore, Hong Kong, Toronto and elsewhere — but they are a useful, simple map of the trading day because each one anchors a region that is awake and working while another region sleeps. Some of their hours overlap, meaning more than one region’s banks, funds and traders may be active at the same moment. Trading volume can vary by pair, day, news, and calendar events even within a single session.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "These approximate UTC windows illustrate a common teaching convention. They are not today's live timetable, and the Sydney, UK, and US seasonal clocks do not change together.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Approximate session teaching windows in UTC, by local season",
        columns: [
          "Center",
          "Local winter convention",
          "Local summer convention",
        ],
        rows: [
          [
            "Sydney",
            "22:00–07:00, crosses midnight",
            "21:00–06:00, crosses midnight",
          ],
          ["Tokyo", "00:00–09:00", "00:00–09:00 (no daylight saving)"],
          ["London", "08:00–17:00", "07:00–16:00"],
          ["New York", "13:00–22:00", "12:00–21:00"],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Read the table as overlapping local business windows. Sydney wraps across midnight in UTC; Tokyo overlaps it. Tokyo and London also overlap around 08:00–09:00 UTC in the winter reference convention. London and New York overlap around 13:00–17:00 UTC when both use winter time. There is no universal quiet gap after Tokyo closes. Pair-specific liquidity and actual spreads still need observation.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Why does “busier” matter to a beginner, beyond curiosity? More active participants making prices at once tends to mean tighter typical spreads and faster order execution, while the quieter hours — late in the New York afternoon, or in the gap between the Tokyo close and the London open — can mean wider spreads, slower fills, and prices that move in larger, choppier steps on less information. None of that is a promise: a quiet hour can still move sharply on a surprise headline, and a busy hour is not automatically cheap or safe. The practical use of the session map is simply to explain why the same pair can look and cost differently depending on what time you observe it, so that a demo-account observation made at 3 a.m. local London time is not compared unfairly with one made during the London/New York overlap.",
        ],
      },
      {
        type: "warning",
        children:
          "Daylight saving rules differ by country and change over the year, and not every country observes them the same way or on the same date. Avoid memorizing a single local-hour table as permanent; check an up-to-date world clock and the particular product's trading schedule before relying on session timing for anything.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/trading-sessions-guide.svg",
        width: 600,
        height: 370,
        alt: "Illustrative UTC session map: Sydney 22:00–07:00 across midnight, Tokyo 00:00–09:00, London 08:00–17:00, New York 13:00–22:00. The London/New York overlap is shaded at 13:00–17:00. These reference conventions are not a date-specific schedule.",
        caption:
          "This combines local winter reference conventions for teaching. Sydney seasons differ from London and New York; use the date-sensitive table and actual provider schedule before applying a local time.",
      },
    ],
  },
  {
    title: "A market can be open but still costly",
    shortTitle: "Open and costly",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A busy market often has more participants making prices, but that does not guarantee a particular spread or quick execution. Around a market pause, holiday, major announcement, or sudden surprise, available prices can change quickly. A platform being online is not the same as an inexpensive or low-risk opportunity.",
        ],
      },
      {
        type: "example",
        title: "The quiet food market",
        children: [
          "A fruit market at lunchtime has many sellers; late at night there may be one stall left and a wider gap between the price offered to buy and sell. Forex is different in important ways, but this analogy helps explain why you must inspect actual quotes instead of assuming every hour is equally liquid.",
        ],
      },
      {
        type: "warning",
        children:
          "News, thin trading, and market closures can cause wider spreads or gaps; an order may execute at a different price from the one you expected.",
      },
    ],
  },
  {
    title: "Plan your practice around your life",
    shortTitle: "Plan observation",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Learning does not require waking at an uncomfortable hour. Pick a short period when you are alert and can study a chart, note the local and UTC time, and observe the bid, ask, and spread in a demo account. Compare several ordinary days without placing a trade. Keep regular work, sleep, and family commitments in view.",
        ],
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Check your understanding",
        points: [
          "Record which financial centers appear active.",
          "Record the pair and both sides of the quote.",
          "Note holidays and scheduled news without assuming their outcome.",
          "Do not turn observation into a deadline to trade.",
        ],
      },
    ],
  },
  {
    title: "A real-life worked example",
    shortTitle: "Worked example",
    blocks: [
      {
        type: "example",
        title: "Everyday example",
        children: [
          "A worker in India studies USD/JPY after dinner, while a worker in Brazil studies in the morning. Their local times can correspond to different parts of the global business day. Even when both see quotes, the spread and available liquidity can differ. A five-pip spread and a two-pip spread also represent different costs at the same position size. Compare recorded quotes rather than choosing a time because its session name sounds attractive.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through. Write local time, UTC time, pair, bid, ask, and spread on three separate demo observations. Compare actual recorded spreads rather than assuming a session label guarantees a better price.",
      },
    ],
  },
  {
    title: "Read the clock and the calendar together",
    shortTitle: "Dates and clocks",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "The familiar four-session schedule is a teaching convention, not a set of exchange opening bells for all spot Forex. Tokyo is often shown as 00:00–09:00 UTC. London is approximately 08:00–17:00 UTC in UK winter and 07:00–16:00 in UK summer; New York is about 13:00–22:00 UTC in US winter and 12:00–21:00 in US summer. Sydney is often shown as 22:00–07:00 UTC during its winter and 21:00–06:00 during its summer. Providers may use different boundaries, and the US, UK and Australia change clocks on different dates. An overlap between Tokyo and London exists around London's open in the winter reference schedule, so there is no universal gap after Tokyo closes and before London opens.",
        ],
      },
      {
        type: "example",
        title: "Work through the example",
        children: [
          "For a learner in South Africa (UTC+2), a winter London 08:00 UTC open corresponds to 10:00 local, while a summer 07:00 UTC open corresponds to 09:00 local. Set the date first, then convert the time. The overlap of London and New York is roughly 13:00–17:00 UTC when both are on winter time, 12:00–16:00 when both are on summer time, and shifts during transition weeks. Activity often concentrates there, but a particular pair can still have a wide spread or surprise gap. Compare actual bid and ask observations on equivalent dates rather than assume the session name fixes execution quality.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "South African learner: UTC+2 conversion",
        columns: ["Reference window", "UTC", "South Africa local time"],
        rows: [
          ["London winter open", "08:00", "10:00"],
          ["London summer open", "07:00", "09:00"],
          ["London/New York: both winter", "13:00–17:00", "15:00–19:00"],
          ["London/New York: both summer", "12:00–16:00", "14:00–18:00"],
        ],
      },
    ],
  },
  {
    title: "Keep a useful observation record",
    shortTitle: "Demo observation",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Choose three short study periods that fit your normal day. Record the date as well as local time and UTC, because a clock conversion without a date can be wrong when daylight saving changes. Compare the same pair and provider when possible; otherwise a difference could come from the source rather than the time.",
          "Use actual displayed bid and ask values, not a guessed spread. If a news release or holiday occurs, note it as context. Three observations help you practise recording; they do not establish a reliable pattern or a strategy.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Example observation worksheet — these are invented quotes",
        columns: [
          "Date and UTC time",
          "EUR/USD bid / ask",
          "Spread",
          "Context",
        ],
        rows: [
          [
            "Illustrative Day A, 08:30 UTC",
            "1.1000 / 1.1002",
            "2 pips",
            "Record actual local time and session convention.",
          ],
          [
            "Illustrative Day B, 14:00 UTC",
            "1.1010 / 1.1013",
            "3 pips",
            "Record any scheduled news or holiday.",
          ],
          [
            "Illustrative Day C, 21:30 UTC",
            "1.0990 / 1.0995",
            "5 pips",
            "Check provider pauses or rollover arrangements.",
          ],
        ],
      },
      {
        type: "exercise",
        prompt:
          "Why can the 14:00 observation have a larger spread than 08:30 even if both fall in active teaching windows? Explain why the table does not establish the best trading time.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Answer: activity is only one influence. Provider pricing, the pair, available liquidity, news, and the observation date can all matter. A session label does not fix the spread. Keep watching without turning the exercise into pressure to trade.",
        ],
      },
    ],
  },
  {
    title: "Understand the weekend and provider schedule",
    shortTitle: "Open does not mean safe",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "“24 hours a day, five days a week” describes the broad spot-Forex working-week convention. Your particular product can have daily pauses, holiday closures, or a different timetable. A website can remain online while its trading service is closed.",
          "Prices can reopen away from the previous available quote after a weekend or closure. That difference is a gap. Orders, stops, and margin rules depend on the product, and the next available fill may differ from the level you expected. Do not assume the session diagram guarantees a continuous executable price.",
          "You do not need a calculator to find a profitable hour. Use the date, world clock, provider schedule, and a careful observation record. Pip Value Calculator can explain what a recorded spread represents at a hypothetical size; it cannot predict liquidity or a safe time.",
        ],
      },
    ],
  },
  {
    title: "Check your time-zone understanding",
    shortTitle: "Practice",
    blocks: [
      {
        type: "keyPoint",
        title: "Check your understanding",
        points: [
          "Why can another market center be active while your local banks are closed?",
          "Why might a fixed session table be wrong after a daylight saving change?",
          "Does a busy overlap guarantee profit or a narrow spread?",
          "What two prices should you write down when comparing times of day?",
        ],
      },
      {
        type: "takeaway",
        children:
          "Sessions help you understand who may be active and when. They do not predict the next price or erase trading costs.",
      },
      {
        type: "comparisonTable",
        caption: "Try the questions first, then compare your answers",
        columns: ["Question", "Answer and explanation"],
        rows: [
          [
            "Another center active",
            "Local working days and hours occur in different time zones.",
          ],
          [
            "A table changes seasonally",
            "Some regions move their clocks on different dates.",
          ],
          [
            "Busy overlap",
            "It guarantees neither profit nor a particular spread.",
          ],
          [
            "Quote record",
            "Write the bid and ask, plus date, UTC/local time, pair, and provider.",
          ],
        ],
      },
    ],
  },
  {
    title: "Before moving on",
    shortTitle: "Final check",
    blocks: [
      {
        type: "keyPoint",
        checklist: true,
        title: "Check what you can explain",
        points: [
          "I can read session windows as date-sensitive teaching conventions.",
          "I can convert UTC to local time and account for differing daylight-saving dates.",
          "I can compare demo quotes without assuming activity guarantees a safe or profitable trade.",
        ],
      },
      {
        type: "takeaway",
        children:
          "Use the examples to explain the idea in your own words. Correct units, clear assumptions, and careful questions matter more than rushing to place a trade.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "All rates, fees, position sizes, and calculator entries in this lesson are invented for learning. No example recommends a trade or predicts a future price.",
        ],
      },
      {
        type: "riskStatement",
        children:
          "Trading involves uncertainty and can cause losses. Leverage, costs, execution, product terms, and provider reliability matter. This lesson is education, not personalized financial advice.",
      },
      {
        type: "references",
        items: [
          {
            title:
              "BIS — The global foreign exchange market in a higher-volatility environment",
            url: "https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment",
          },
          {
            title: "Bank of England — Who sets exchange rates?",
            url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
          {
            title:
              "OANDA — Forex trading sessions (provider teaching convention, not a universal schedule)",
            url: "https://www.oanda.com/us-en/skills-and-insights/education/trading-asset-classes/forex/when-is-the-best-time-for-forex-trading/",
          },
          {
            title: "UK Government — When do the clocks change?",
            url: "https://www.gov.uk/when-do-the-clocks-change",
          },
          {
            title: "NIST — Daylight Saving Time Rules",
            url: "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst",
          },
        ],
      },
    ],
  },
];
