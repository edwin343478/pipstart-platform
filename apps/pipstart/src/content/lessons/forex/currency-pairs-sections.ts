import type { LessonSection } from "../../lesson-content";

export const currencyPairsSections: LessonSection[] = [
  {
    title: "Why two currencies appear together",
    shortTitle: "Why pairs",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A currency pair compares the value of one currency with another. The first is the base currency and the second is the quote currency, so EUR/USD shows how many US dollars are needed for one euro.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A currency price needs something to compare against. Saying a bottle costs 200 Japanese yen is useful because it names both the bottle and what you pay. A currency pair works similarly: EUR/USD compares euros with US dollars. One currency cannot rise or fall by itself; it changes in value relative to another.",
        ],
      },
      {
        type: "definition",
        term: "Currency pair",
        children:
          "Two currencies written together, such as EUR/USD or USD/JPY. The first is the base currency; the second is the quote currency.",
      },
      {
        type: "example",
        title: "Read EUR/USD 1.1000",
        children: [
          "An illustrative EUR/USD rate of 1.1000 says one euro costs 1.1000 US dollars. For ten euros, the displayed conversion would be US$11 before the provider's spread and fees. The numbers here are invented for learning, not live prices.",
        ],
      },
    ],
  },
  {
    title: "Base and quote currency",
    shortTitle: "Read the pair",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Read each pair as one unit of the first currency",
        columns: [
          "Pair and illustrative quote",
          "Base",
          "Quote",
          "Read it aloud",
        ],
        rows: [
          [
            "EUR/USD 1.1000",
            "EUR: euro",
            "USD: US dollar",
            "One euro corresponds to US$1.10.",
          ],
          [
            "USD/JPY 150.00",
            "USD: US dollar",
            "JPY: Japanese yen",
            "One dollar corresponds to ¥150.",
          ],
          [
            "GBP/USD 1.2500",
            "GBP: British pound",
            "USD: US dollar",
            "One pound corresponds to US$1.25.",
          ],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A higher EUR/USD quote means the euro costs more dollars than before. A lower quote means it costs fewer dollars. That tells you the relative direction of the pair, not why it moved or what happens next.",
        ],
      },
      {
        type: "warning",
        children:
          "USD/JPY and JPY/USD are opposite ways of expressing the relationship. Do not treat the same number as interchangeable between them. A platform may show one convention while a different product, such as a futures contract, uses another.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/currency-pairs-guide.svg",
        desktopSrc: "/images/lessons/forex/currency-pairs-guide-desktop.svg",
        alt: "EUR is the base and USD is the quote. At an illustrative EUR/USD midpoint of 1.1000, one euro corresponds to 1.10 dollars. The inverse midpoint is approximately 0.9091 euros per dollar. Actual bid and ask reciprocals switch sides.",
        caption:
          "EUR is the base and USD is the quote. At an illustrative EUR/USD midpoint of 1.1000, one euro corresponds to 1.10 dollars. The inverse midpoint is approximately 0.9091 euros per dollar. Actual bid and ask reciprocals switch sides.",
        width: 600,
        height: 525,
      },
    ],
  },
  {
    title: "Major, minor and other pairs",
    shortTitle: "Pair categories",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "People often group pairs by which currencies they contain and how often they trade. None of these categories is an official rulebook — different providers draw the lines slightly differently — but the common teaching convention is useful for orientation.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "The conventional teaching list of seven major pairs combines the US dollar with EUR, JPY, GBP, CHF, AUD, CAD, or NZD. This is a market convention, not a current ranking of every currency's trading volume. Learn the seven names below rather than assuming every heavily traded currency belongs to this list.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "The conventional seven major pairs",
        columns: ["Pair", "Base currency", "Quote currency"],
        rows: [
          ["EUR/USD", "Euro", "US dollar"],
          ["USD/JPY", "US dollar", "Japanese yen"],
          ["GBP/USD", "British pound", "US dollar"],
          ["USD/CHF", "US dollar", "Swiss franc"],
          ["AUD/USD", "Australian dollar", "US dollar"],
          ["USD/CAD", "US dollar", "Canadian dollar"],
          ["NZD/USD", "New Zealand dollar", "US dollar"],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Minors, or crosses, combine widely traded currencies without the US dollar. Examples include EUR/GBP, EUR/JPY, GBP/JPY, EUR/AUD, AUD/JPY, EUR/CAD, and GBP/CHF.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Pairs often called exotics combine a major currency with a less commonly traded currency in a particular market. The label varies between providers. Examples include USD/ZAR, USD/MXN, USD/TRY, USD/INR, and EUR/TRY. Availability and pip conventions differ, so check the instrument rather than treating this label as a precise risk rating.",
        ],
      },
      {
        type: "example",
        title: "Three labels, three questions",
        children: [
          "EUR/USD: the euro and US dollar. EUR/GBP: the euro and British pound. USD/ZAR: the US dollar and South African rand. For any of them, first ask: Which currency is first? What does one unit cost in the second? How large is the spread? A familiar pair name does not guarantee an affordable or safe trade.",
        ],
      },
      {
        type: "warning",
        children:
          "Less frequently traded pairs may have wider spreads or sharper price moves; the category alone is not a risk rating. A “major” label describes how often a pair trades, not whether it is safe or profitable for you.",
      },
    ],
  },
  {
    title: "A real-life conversion",
    shortTitle: "Conversion example",
    blocks: [
      {
        type: "example",
        title: "A traveler budgets in euros",
        children: [
          "Suppose Asha has €20 and an illustrative EUR/USD rate is 1.1000. Ignoring costs, €20 × 1.1000 = US$22. If she instead needs to purchase €20 with dollars, a provider's actual ask price and fees determine the amount she pays. If a sign shows two rates, one for buying and another for selling, use the side that applies to Asha's action. The middle of the two rates is not necessarily an available price.",
        ],
      },
      {
        type: "keyPoint",
        title: "Check your understanding",
        points: [
          "Pair order changes how you read the price.",
          "The quoted number relates one unit of the base to the quote currency.",
          "Real conversion also depends on the provider's transaction price and fees.",
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
          "A German visitor budgets €30 for a day in the United States. At an imagined EUR/USD quote of 1.10, €30 corresponds to US$33 before costs. The pair says how many dollars one euro buys. Reversing the direction requires dividing: US$33 ÷ 1.10 = €30. A rate displayed as USD/EUR would be approximately 0.9091, rather than 1.10. The two directions express the same relationship with different units.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through. Write “one euro costs 1.10 dollars” beneath EUR/USD. Change the quote to 1.08 and explain why the euro now buys fewer dollars; do not infer what caused the change.",
      },
    ],
  },
  {
    title: "Derive a currency cross without a live quote",
    shortTitle: "Cross rates",
    blocks: [
      {
        type: "example",
        title: "Work through the example",
        children: [
          "Suppose invented EUR/USD is 1.1000 and GBP/USD is 1.2500. One euro corresponds to 1.10 dollars, while one pound corresponds to 1.25 dollars. Dividing 1.10 ÷ 1.25 gives EUR/GBP 0.88, meaning about £0.88 for one euro in this simplified mid-rate example. To check the units, (USD per EUR) ÷ (USD per GBP) leaves GBP per EUR. The inverse, GBP/EUR, is about 1 ÷ 0.88 = 1.1364 EUR per GBP.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Real executable cross rates involve the applicable bid and ask on both legs and can differ from this neat midpoint. The arithmetic helps you read the pair; it is not a free way to trade without costs.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Try it. If invented EUR/USD is 1.20 and GBP/USD is 1.50, what is EUR/GBP before costs? Check: 1.20 ÷ 1.50 = 0.80 GBP per EUR.",
      },
    ],
  },
  {
    title: "Check the units before doing any arithmetic",
    shortTitle: "Check the units",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A quote of USD/JPY 150 means 150 yen per one dollar. To convert US$20 at that illustrative mid-rate, multiply: US$20 × 150 JPY/USD = ¥3,000. To convert ¥3,000 back, divide by 150 JPY/USD. The second conversion at a real provider uses the opposite quote side, so the round trip normally returns less before any additional fee. If a pair is inverted, its approximate mid-rate is the reciprocal: JPY/USD is about 1/150, or 0.006667 dollars per yen. Bid and ask reciprocals switch sides: the reciprocal of an original ask becomes the inverted bid, and vice versa.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Pair categories are teaching shorthand. The conventional seven “majors” include NZD/USD and USD/CHF. These categories describe market conventions rather than a guarantee about costs or risk. A cross can be derived from two dollar rates for understanding, but actual executable prices on both legs produce a bid and an ask, not one costless midpoint.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Inverting an illustrative two-sided quote",
        columns: ["Original EUR/USD", "Calculation", "Inverse USD/EUR"],
        rows: [
          [
            "Bid 1.1000 / Ask 1.1002",
            "Inverse bid = 1 ÷ original ask",
            "Bid about 0.908926 EUR per USD",
          ],
          [
            "Same original quote",
            "Inverse ask = 1 ÷ original bid",
            "Ask about 0.909091 EUR per USD",
          ],
        ],
      },
    ],
  },
  {
    title: "Buying and selling a pair",
    shortTitle: "Trade direction",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Buying EUR/USD means taking the euro side against the dollar side: the position generally benefits before costs if EUR/USD rises. Selling EUR/USD takes the opposite direction and generally benefits before costs if it falls. This shorthand describes exposure; a leveraged contract does not necessarily deliver spendable banknotes.",
          "Do not confuse “the dollar strengthened” with “every dollar pair went up.” USD/JPY may rise when the dollar gains against yen, while EUR/USD may fall when the dollar gains against euros. The dollar sits on different sides. Always name the pair and the comparison.",
        ],
      },
      {
        type: "example",
        title: "Two relatives compare holiday budgets",
        children: [
          "A German visitor watches EUR/USD fall from 1.10 to 1.08. Their €100 now corresponds to US$108 instead of US$110 before charges. An American visitor buying euros finds that each euro costs fewer dollars at the lower quote. The same move affects the two budgets differently.",
        ],
      },
    ],
  },
  {
    title: "Use the Pip Value Calculator after checking the units",
    shortTitle: "Tool practice",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "First read EUR/USD and USD/JPY aloud. Then use a simulated size of 0.01 lots, or 1,000 base units under the tool's 100,000-unit convention. EUR/USD produces US$0.10 per pip in a USD account. USD/JPY produces ¥10 per pip in a JPY account. Those are different quote units, not directly comparable purchasing power.",
          "If you select a different account currency, the tool needs the number of account-currency units per one quote-currency unit. It can fetch a reference rate, or you can select manual entry for a stated learning assumption. An inverse conversion rate would produce the wrong result.",
        ],
      },
      {
        type: "learningLink",
        title: "Open Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Check the pair, lots, account currency, instrument specification, and conversion direction. This exercise compares units; it does not recommend a position size.",
      },
    ],
  },
  {
    title: "Practice reading pairs",
    shortTitle: "Practice",
    blocks: [
      {
        type: "keyPoint",
        checklist: true,
        title: "Check your understanding",
        points: [
          "In GBP/USD, which currency is the base?",
          "If USD/JPY is 150.00, how many yen correspond to one US dollar at the illustrative rate?",
          "Does a higher EUR/USD quote mean one euro costs more or fewer dollars?",
          "Why should you check the actual bid or ask before converting money?",
        ],
      },
      {
        type: "takeaway",
        children:
          "Read every pair from left to right: one unit of the base currency costs the quoted amount of the second currency.",
      },
      {
        type: "comparisonTable",
        caption: "Try the questions first, then compare your answers",
        columns: ["Question", "Answer and explanation"],
        rows: [
          ["GBP/USD base", "GBP: British pound."],
          ["USD/JPY 150", "One US dollar corresponds to ¥150."],
          ["Higher EUR/USD", "One euro costs more dollars."],
          [
            "EUR/USD 1.20 and GBP/USD 1.50",
            "EUR/GBP = 1.20 ÷ 1.50 = 0.80 GBP per EUR before costs.",
          ],
          [
            "Actual conversion quote",
            "Use the applicable bid or ask and fees, not an assumed midpoint.",
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
          "I can identify base and quote currencies and read a rate aloud.",
          "I can convert amounts, invert a quote, and derive an illustrative cross with correct units.",
          "I can recognize common pair categories without treating them as safety ratings.",
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
            title: "CME Group — Understanding FX Quote Conventions",
            url: "https://www.cmegroup.com/education/courses/introduction-to-fx/understanding-fx-quote-conventions",
          },
          {
            title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
        ],
      },
    ],
  },
];
