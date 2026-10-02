import type { LessonSection } from "../../lesson-content";

export const bidAskSpreadSections: LessonSection[] = [
  {
    title: "A shop has two exchange prices",
    shortTitle: "Bid and ask",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A Forex quote normally contains two prices. The bid is the price available when selling the base currency, the ask is the price available when buying it, and the difference is the spread.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "At an airport money counter, the price to sell your dollars is usually different from the price to buy dollars back. A quoted Forex pair also commonly has two prices at the same moment: a bid and an ask. The difference is one trading cost.",
        ],
      },
      {
        type: "definition",
        term: "Bid",
        children:
          "The price at which a dealer is willing to buy the base currency from you. If you sell the base currency, the bid is usually the relevant quoted price.",
      },
      {
        type: "definition",
        term: "Ask or offer",
        children:
          "The price at which a dealer is willing to sell the base currency to you. If you buy the base currency, the ask is usually the relevant quoted price.",
      },
      {
        type: "example",
        title: "A two-sided EUR/USD quote",
        children: [
          "Suppose an illustrative EUR/USD quote is bid 1.1000 and ask 1.1002. Buying one euro would use the ask of US$1.1002; selling one euro would use the bid of US$1.1000. The available quotes can change before a transaction completes.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/bid-ask-spread-guide.svg",
        desktopSrc: "/images/lessons/forex/bid-ask-spread-guide-desktop.svg",
        alt: "At an unchanged illustrative EUR/USD quote, a customer buys euros at ask 1.1002 and sells at bid 1.1000. The difference is 0.0002 dollars per euro, or two conventional pips, before separate charges.",
        caption:
          "At an unchanged illustrative EUR/USD quote, a customer buys euros at ask 1.1002 and sells at bid 1.1000. The difference is 0.0002 dollars per euro, or two conventional pips, before separate charges.",
        width: 600,
        height: 525,
      },
    ],
  },
  {
    title: "Calculate the spread",
    shortTitle: "Spread calculation",
    blocks: [
      {
        type: "definition",
        term: "Spread",
        children:
          "The ask minus the bid at a stated moment. It is often quoted in pips. The spread is not a separate bill in every pricing model, but it is an inherent difference between the two quoted sides.",
      },
      {
        type: "formula",
        expression: "Ask − Bid = Spread",
        explanation:
          "Ask − Bid = Spread. At the made-up EUR/USD bid 1.1000 and ask 1.1002, the difference is 0.0002, or two conventional pips.",
      },
      {
        type: "comparisonTable",
        caption: "Two hypothetical EUR/USD quotes",
        columns: ["Quote", "Bid", "Ask", "Spread in pips"],
        rows: [
          ["A", "1.1000", "1.1002", "(1.1002 − 1.1000) ÷ 0.0001 = 2"],
          ["B", "1.1000", "1.1005", "(1.1005 − 1.1000) ÷ 0.0001 = 5"],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A five-pip spread costs more than a two-pip spread for the same position size, if everything else is equal. A low advertised spread does not tell you the full cost if commission, financing, conversion charges, or execution differences also apply.",
        ],
      },
    ],
  },
  {
    title: "What happens immediately after opening",
    shortTitle: "The initial loss",
    blocks: [
      {
        type: "example",
        title: "Buying and selling straight back",
        children: [
          "Imagine buying the base currency at an ask of 1.1002 and, without any market change, selling it at the bid of 1.1000. You receive 0.0002 less per unit than you paid. At 1,000 base units, the difference is US$0.20, assuming USD is the quote currency and ignoring all other charges. This is why a new position can initially show a small unrealized loss even when the chart has barely moved. The price needs to move enough to cover the spread and any other costs before the position could show a net gain.",
        ],
      },
      {
        type: "warning",
        children:
          "A tight displayed spread does not guarantee the transaction will execute at the displayed price, especially when conditions change quickly.",
      },
    ],
  },
  {
    title: "Compare the total cost",
    shortTitle: "Complete costs",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A provider may charge an explicit commission, a conversion charge when settling into another currency, or a financing charge for holding a leveraged position. The relevant list depends on the product and provider. Ask what you would pay to enter and exit a hypothetical position and what could change before execution.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Questions to ask about the complete transaction",
        columns: ["Item", "Question"],
        rows: [
          [
            "Entry and exit",
            "Which bid or ask can I actually use for my size?",
          ],
          ["Commission", "Is it charged on entry, exit, or both?"],
          [
            "Financing",
            "What charges or credits apply if I hold the position?",
          ],
          [
            "Conversion",
            "What rate and charge turn the result into my account currency?",
          ],
          ["Execution", "Can the fill differ from the displayed quote?"],
          [
            "Account charges",
            "Are there separate funding, withdrawal, or inactivity fees?",
          ],
        ],
      },
      {
        type: "warning",
        children:
          "The smallest spread advertisement does not necessarily mean the lowest final cost. Compare the full schedule and use a demo account to inspect how quotes and charges appear.",
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
          "An Australian visitor wants euros. A pretend EUR/AUD quote shows bid 1.6500 and ask 1.6504 Australian dollars per euro. Buying €100 at the ask costs A$165.04. Selling the same €100 immediately at the unchanged bid yields A$165.00. The A$0.04 gap is the spread cost for this small conversion, before any other charge. If either quote moves while the transaction is processed, the outcome changes.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through. Ask which side you would use to buy the base currency and which to sell it. The smaller displayed price is not always “your price”; the direction of the exchange decides.",
      },
    ],
  },
  {
    title: "Why a two-sided quote matters at entry and exit",
    shortTitle: "Entry and exit",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "The bid is the price at which you can sell the base currency to a quoted provider, and the ask is the price at which you can buy it, subject to the size and quote actually available. If EUR/USD is 1.1000 bid and 1.1002 ask, a person buying one euro and immediately selling it back pays 1.1002 dollars and receives 1.1000 dollars. The 0.0002 difference is two conventional pips. For 10,000 base units, that immediate round-trip difference is US$2 before a separate commission, if the same quote remained available and fills occurred as displayed.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A “zero spread” advertisement can still have a commission or a variable spread at other times. Some providers quote different prices, minimum sizes or execution rules. Compare a complete, dated example: entry ask, exit bid, commission both ways, overnight financing if held, conversion charge, slippage and withdrawal fees. Do not add a quoted spread twice when your P&L calculation already uses the actual ask and bid.",
        ],
      },
    ],
  },
  {
    title: "From gross price movement to net result",
    shortTitle: "A complete cost example",
    blocks: [
      {
        type: "example",
        title: "A German learner checks a demo calculation",
        children: [
          "Suppose a long 10,000-euro position opens at ask 1.1002 and closes at bid 1.1012. The executable difference is 0.0010, or ten pips, giving US$10 of gross price-move gain. Assume commission of US$1 on entry and US$1 on exit, and a US$0.50 financing charge. The net result under those assumptions is US$7.50.",
          "If the actual exit fills at 1.1010 instead, gross gain is US$8 and the same charges leave US$5.50. The fill difference has changed the result. These examples are hypothetical; no commission or financing amount is a real provider quote.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Track each cost once",
        columns: ["Step", "Amount", "Treatment"],
        rows: [
          [
            "Gross executable-price result",
            "$10.00",
            "Ask-to-bid price difference already includes the spread effect.",
          ],
          [
            "Two commissions",
            "−$2.00",
            "Separate charge in this hypothetical example.",
          ],
          [
            "Financing charge",
            "−$0.50",
            "Separate assumed charge for the holding period.",
          ],
          [
            "Net under these assumptions",
            "$7.50",
            "No additional conversion or account fees assumed.",
          ],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Slippage is a difference between the price you expected and the price you actually receive. It can help or hurt, depending on direction and circumstances. A chart's last price may also be a bid, ask, or midpoint; the line alone does not tell you both executable sides.",
        ],
      },
    ],
  },
  {
    title: "Check the example in the Profit-and-Loss Calculator",
    shortTitle: "Tool practice",
    blocks: [
      {
        type: "learningLink",
        title: "Open Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Select Long, EUR/USD, 0.1 lots, USD account, entry 1.1002, and exit 1.1012. Expect a gross estimate of US$10.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Subtract the separately assumed US$2 commission and US$0.50 financing charge on paper to get US$7.50. The calculator does not promise those fees or that an order will fill at your entered prices. It also requires different entry and exit values, so use the nonzero round-trip example if you want to demonstrate a spread loss.",
          "To model that loss, enter Long, EUR/USD, 0.1 lots, USD account, entry 1.1002, and exit 1.1000. The gross estimate is −US$2. That difference already represents the spread in this unchanged-quote illustration.",
        ],
      },
    ],
  },
  {
    title: "Check break-even and fractional spreads",
    shortTitle: "Break-even arithmetic",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Break-even means the result is zero after the costs included in your calculation. Covering the opening spread alone may not be enough if commission, financing, or conversion charges also apply. State which charges you included; do not label a gross price result as a final net result.",
          "The pip count need not be a whole number. A EUR/USD bid of 1.10000 and ask of 1.10008 differ by 0.00008, or 0.8 conventional pips. An extra display digit changes the precision of the quote; it does not change the conventional 0.0001 pip into 0.00001.",
        ],
      },
      {
        type: "example",
        title: "An arithmetic break-even check",
        children: [
          "Return to the hypothetical German learner who bought 10,000 EUR units at ask 1.1002. If separately assumed total charges are US$2.50, those charges represent 2.50 ÷ 10,000 = 0.00025 USD per EUR, or 2.5 pips. An exit bid of 1.10045 would give US$2.50 gross, leaving zero under those assumptions.",
          "This is a calculation, not a prediction that the bid will reach that price or that an order will fill there. If the charges, position size, conversion, or fill changes, break-even changes too. The entry ask already includes the quoted buying side; do not subtract the opening spread again.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "When comparing providers, use the same hypothetical size, pair, holding period, and transaction direction. A different minimum size or commission basis can make a headline comparison misleading. Write whether each charge is per side, per round trip, per lot, or per account action.",
        ],
      },
    ],
  },
  {
    title: "Read a quote carefully",
    shortTitle: "Practice",
    blocks: [
      {
        type: "keyPoint",
        title: "Check your understanding",
        points: [
          "Which price normally applies when buying the base currency?",
          "Which price normally applies when selling it?",
          "If the bid is 1.1000 and the ask is 1.1003, how many conventional EUR/USD pips apart are they?",
          "Name two costs or uncertainties beyond the displayed spread.",
        ],
      },
      {
        type: "takeaway",
        children:
          "Bid is the selling side for the customer, ask is the buying side, and their difference is the spread. Compare the whole transaction cost before acting.",
      },
      {
        type: "comparisonTable",
        caption: "Try the questions first, then compare your answers",
        columns: ["Question", "Answer and explanation"],
        rows: [
          ["Buy the base currency", "Normally use the ask."],
          ["Sell the base currency", "Normally use the bid."],
          [
            "Bid 1.1000 and ask 1.1003",
            "0.0003 ÷ 0.0001 = 3 conventional EUR/USD pips.",
          ],
          [
            "Beyond the spread",
            "Commission, financing, conversion charges, and fill differences can matter.",
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
          "I can choose the bid or ask for a customer transaction.",
          "I can calculate a spread in pips and money.",
          "I can separate gross price-move results from total costs without double counting the spread.",
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
