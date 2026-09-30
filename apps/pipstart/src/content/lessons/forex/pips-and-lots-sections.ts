import type { LessonSection } from "../../lesson-content";

export const pipsAndLotsSections: LessonSection[] = [
  {
    title: "Small price changes add up",
    shortTitle: "Pips",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A pip is a standard way to describe a small price movement, while a lot describes trade size. Together they help traders compare movement and calculate how much money may be gained or lost.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A shop may change a price by a few coins. A currency pair can change by a tiny fraction of its quoted price. Traders need a convenient way to describe that move, but a small-looking change in a quote does not mean a small cash result. The position size matters too.",
        ],
      },
      {
        type: "definition",
        term: "Pip",
        children:
          "A conventional unit for a small exchange-rate move. For many pairs such as EUR/USD, one pip is 0.0001. For many pairs quoted in Japanese yen, one pip is 0.01. Check the instrument's quote convention rather than assuming every pair uses the same decimal place.",
      },
      {
        type: "example",
        title: "Count the movement",
        children: [
          "If an illustrative EUR/USD quote moves from 1.1000 to 1.1005, it has moved 0.0005, or five pips. If USD/JPY moves from 150.00 to 150.05, it has moved five pips using the usual yen convention.",
        ],
      },
    ],
  },
  {
    title: "Pipettes and extra digits",
    shortTitle: "Extra digits",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Some screens show an extra decimal place. On EUR/USD, a move from 1.10000 to 1.10001 is one tenth of a conventional pip, sometimes called a pipette. A different screen may display a smaller increment for a different pair or instrument.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Illustrative quote steps — confirm the instrument",
        columns: ["Pair", "One conventional pip", "One tenth of a pip"],
        rows: [
          ["EUR/USD", "0.0001", "0.00001"],
          ["USD/JPY", "0.01", "0.001"],
        ],
      },
      {
        type: "warning",
        children:
          "Do not convert a pip movement straight into a cash gain or loss without knowing the number of currency units, the quote currency, and any conversion into your account currency.",
      },
    ],
  },
  {
    title: "What a lot describes",
    shortTitle: "Lots and units",
    blocks: [
      {
        type: "definition",
        term: "Lot or position size",
        children:
          "The amount of base currency involved in a position. A conventional standard lot is often 100,000 units, a mini lot 10,000 units, and a micro lot 1,000 units. Providers can have different minimum sizes or contract specifications; always check the product.",
      },
      {
        type: "comparisonTable",
        caption: "Conventional Forex lot sizes",
        columns: ["Lot name", "Base currency units", "Share of a standard lot"],
        rows: [
          ["Standard", "100,000", "1 lot"],
          ["Mini", "10,000", "0.1 lot"],
          ["Micro", "1,000", "0.01 lot"],
        ],
      },
      {
        type: "example",
        title: "Counting boxes at a shop",
        children: [
          "A price change of 10 Japanese yen per apple costs 10 yen if you buy one apple and 1,000 yen if you buy 100. The same idea applies to currency: the rate move and the number of units together determine the amount before costs.",
        ],
      },
      {
        type: "warning",
        children:
          "A small initial margin does not make a large position small. Leverage can magnify losses, and some products can lose more than the initial amount deposited.",
      },
    ],
  },
  {
    title: "Work through a pip-value example",
    shortTitle: "Value per pip",
    blocks: [
      {
        type: "example",
        title: "Work through the example",
        children: [
          "For a hypothetical EUR/USD position of 1,000 euros, a one-pip move is 0.0001 US dollars per euro. Multiplying 1,000 × 0.0001 gives US$0.10 per pip before the spread, fees, and any account-currency conversion. At 10,000 euros, the same move is US$1; at 100,000 euros it is US$10. Those are arithmetic illustrations, not a trade size recommendation.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "One EUR/USD pip with a USD account, before costs",
        columns: ["Position in euros", "Calculation", "USD per pip"],
        rows: [
          ["1,000", "1,000 × 0.0001", "$0.10"],
          ["10,000", "10,000 × 0.0001", "$1.00"],
          ["100,000", "100,000 × 0.0001", "$10.00"],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "If the account is in a different currency, the platform may convert the result. If the pair does not have USD as its quote currency, this simple USD calculation does not apply directly.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/pips-and-lots-guide.svg",
        desktopSrc: "/images/lessons/forex/pips-and-lots-guide-desktop.svg",
        alt: "For EUR/USD with a conventional 0.0001 pip and a USD account, 1,000 euro units have a value of 10 US cents per pip, 10,000 have a value of 1 dollar, and 100,000 have a value of 10 dollars, before costs. These are arithmetic examples, not recommended sizes.",
        caption:
          "For EUR/USD with a conventional 0.0001 pip and a USD account, 1,000 euro units have a value of 10 US cents per pip, 10,000 have a value of 1 dollar, and 100,000 have a value of 10 dollars, before costs. These are arithmetic examples, not recommended sizes.",
        width: 600,
        height: 525,
      },
    ],
  },
  {
    title: "Going long, going short, and finding the result",
    shortTitle: "Long and short",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "To go long EUR/USD is to take a position that benefits, before costs, when the euro rises relative to the dollar. To go short EUR/USD is to take the opposite direction; it can benefit when the pair falls, but a rise can create a loss. A short position is still risky, and its product rules matter. Neither direction is a prediction.",
        ],
      },
      {
        type: "example",
        title: "Work through the example",
        children: [
          "Follow two imaginary positions of 10,000 euros. For the long, suppose the executable buy ask is 1.1002 and the later sell bid is 1.1020. The difference is 0.0018 dollars per euro, so the gross price-move result is 10,000 × 0.0018 = US$18. If the later bid were 1.0980, the difference would be −0.0022 and the gross result would be −US$22. For the short, suppose the initial sell bid is 1.1000 and the later buy ask is 1.0982. The favorable difference is again 0.0018, yielding US$18 gross. If instead the ask rises to 1.1020, the short's gross result is −US$20. Using ask at buy and bid at sell makes the spread visible in the example. Commissions, overnight financing, currency conversion and slippage still need separate treatment.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Check yourself. With a long 10,000-euro position bought at 1.1002 and sold at 1.1012, what is the gross dollar result? Answer: 10,000 × 0.0010 = US$10 before other costs. Now explain why a different account currency requires one more conversion.",
      },
      {
        type: "comparisonTable",
        caption: "10,000 EUR units, using the executable sides",
        columns: ["Direction", "Entry", "Exit", "Gross result"],
        rows: [
          ["Long", "Buy ask 1.1002", "Sell bid 1.1020", "$18"],
          ["Long", "Buy ask 1.1002", "Sell bid 1.0980", "−$22"],
          ["Short", "Sell bid 1.1000", "Buy ask 1.0982", "$18"],
          ["Short", "Sell bid 1.1000", "Buy ask 1.1020", "−$20"],
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
          "Suppose a Canadian learner observes a fictional EUR/USD move from 1.1000 to 1.1005. That is five pips because a pip for this pair is conventionally 0.0001. If a simulated position contains 10,000 euros, the change in dollar value is 10,000 × 0.0005 = US$5, before spread, fees, and conversion into Canadian dollars. If the position were 100,000 euros, the same move would be US$50. The market move was identical; the size changed the cash result.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through. Label the units at every step: euros × dollars per euro = dollars. A platform’s lot convention must be checked, and the money outcome may differ for another pair or account currency.",
      },
    ],
  },
  {
    title: "Convert a pip into an amount of money",
    shortTitle: "Account conversion",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "For 10,000 units of EUR/USD, a move of one conventional 0.0001 pip is 10,000 EUR × 0.0001 USD/EUR = US$1 before costs. At 100,000 euro units, the same move is US$10. In USD/JPY, a conventional pip is often 0.01 yen per dollar: 10,000 dollar units × ¥0.01/USD = ¥100 per pip. If your account is in a different currency, convert that yen or dollar result at an appropriate rate. Contract sizes, pip conventions and fractional “pipettes” vary, so confirm the instrument specification.",
        ],
      },
      {
        type: "example",
        title: "Work through the example",
        children: [
          "If a German learner buys 10,000 euros against dollars at an ask of 1.1002 and exits at a bid of 1.1012, the executable-side difference is 0.0010 USD/EUR, or ten pips: gross price-move result US$10 before any commission and financing. A short begins by selling at bid and closes by buying at ask. The size and the quote sides matter as much as the number of pips. Use the Pip Value Calculator for the unit check and the Profit-and-Loss Calculator for a gross estimate, then account separately for costs and fill differences.",
        ],
      },
    ],
  },
  {
    title: "Separate position size, margin, and risk",
    shortTitle: "Size is not the deposit",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A lot describes the exposure, not the cash you deposited. Margin is the amount required to support a leveraged position. Planned risk is an estimate of loss under stated price and execution assumptions. These quantities answer different questions and should not be treated as interchangeable.",
          "For example, 10,000 EUR units and a ten-pip EUR/USD adverse movement imply about US$10 of price-move loss before other costs. That does not tell you the margin requirement. Nor does it guarantee a stop order limits the final loss to exactly that amount: a gap or different fill can change it.",
        ],
      },
      {
        type: "warning",
        children:
          "The lot sizes here are for arithmetic practice, not a recommendation for your account. Read the provider's contract size, minimum volume, volume step, and pip definition before applying a calculator result.",
      },
    ],
  },
  {
    title: "Use the calculators with a worked example",
    shortTitle: "Calculator practice",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "In Pip Value Calculator, choose EUR/USD, 0.1 lots, and USD as the account currency. Under its 100,000-unit contract convention, that is 10,000 EUR units and US$1 per pip. Change only the lots to 0.01: the estimate becomes US$0.10 per pip.",
          "For a yen example, choose USD/JPY, 0.1 lots, and a JPY account: the estimate is ¥100 per pip. If you instead use a USD account and manually assume USD/JPY 150, enter 1 ÷ 150, approximately 0.006666667 USD per JPY, as the conversion rate. The result is about US$0.67 per pip. The conversion assumption matters.",
        ],
      },
      {
        type: "learningLink",
        title: "Open Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Work the units on paper, then compare the tool's estimated value per pip.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "In Profit-and-Loss Calculator, choose Long, EUR/USD, 0.1 lots, USD account, entry 1.1002, and exit 1.1012. The gross estimate is US$10. Use entry ask and exit bid for a long; use entry bid and exit ask for a short. The tool estimates the price-move result, not every fee.",
        ],
      },
      {
        type: "learningLink",
        title: "Open Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Enter the assumed executable entry and exit prices. Account separately for commission, financing, conversion charges, and fill differences.",
      },
      {
        type: "takeaway",
        children:
          "If executable bid/ask prices are already used, their spread effect is already in the price difference. Do not subtract the same spread a second time.",
      },
    ],
  },
  {
    title: "Check the units before trading",
    shortTitle: "Practice",
    blocks: [
      {
        type: "keyPoint",
        title: "Check your understanding",
        points: [
          "What decimal change is normally one pip on EUR/USD?",
          "How is USD/JPY commonly different?",
          "If 1,000 EUR/USD units move two pips, what is the illustrative US dollar change before costs?",
          "Why can two trades with the same pip movement have different cash results?",
        ],
      },
      {
        type: "takeaway",
        children:
          "Pips describe a rate move; position size turns that move into a cash amount. Always check the exact contract and costs.",
      },
      {
        type: "comparisonTable",
        caption: "Try the questions first, then compare your answers",
        columns: ["Question", "Answer and explanation"],
        rows: [
          ["One EUR/USD pip", "Conventionally 0.0001; check the instrument."],
          ["One USD/JPY pip", "Conventionally 0.01."],
          [
            "1,000 EUR/USD units move two pips",
            "1,000 × 0.0002 = US$0.20 before costs.",
          ],
          [
            "Long 10,000 EUR: 1.1002 to 1.1012",
            "10,000 × 0.0010 = US$10 gross before other charges.",
          ],
          [
            "Different cash results",
            "Units, quote currency, account conversion, costs, and fills may differ.",
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
        title: "Check what you can explain",
        points: [
          "I can distinguish pips, pipettes, units, lots, and margin.",
          "I can calculate a pip value and gross long or short result using executable sides.",
          "I can check quote-to-account conversion and use the PipStart calculators with stated assumptions.",
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
