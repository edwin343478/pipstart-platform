import type { LessonSection } from "../../lesson-content";

export const whatIsForexSections: LessonSection[] = [
  {
    title: "Money changes hands every day",
    shortTitle: "Everyday Forex",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Imagine someone traveling from the United States to Japan. They have US dollars, but a shop in Tokyo asks for Japanese yen. Changing one currency into another is foreign exchange, often shortened to Forex or FX. A tourist, an importer, and a bank may all exchange currencies for different reasons.",
          "You do not need a trading account to encounter foreign exchange. Ordering from an overseas shop, paying a foreign supplier, or sending money to family abroad can involve a conversion. A payment company may do it behind the scenes, even when you only see the amount charged in your own currency.",
        ],
      },
      {
        type: "definition",
        term: "Forex or FX",
        children:
          "Foreign exchange: exchanging one currency for another. The Forex market is the worldwide network through which those exchanges are arranged.",
      },
      {
        type: "comparisonTable",
        caption: "Three everyday reasons to exchange money",
        columns: ["Situation", "Currency need", "Practical reason"],
        rows: [
          [
            "Travel: a US visitor in Japan",
            "USD into JPY",
            "Pay for transport, meals, and shopping.",
          ],
          [
            "Trade: a Brazilian shop buys goods from Germany",
            "BRL into EUR",
            "Pay a supplier whose invoice is in euros.",
          ],
          [
            "Family support: a worker in the UK sends money to India",
            "GBP into INR",
            "Let a family member receive money in rupees.",
          ],
        ],
      },
      {
        type: "keyPoint",
        title: "Keep these ideas in view",
        points: [
          "Currency exchange is a useful everyday service.",
          "Speculating on price changes is an additional financial risk.",
          "There is no guaranteed outcome from observing a market quote.",
        ],
      },
      {
        type: "takeaway",
        children:
          "Forex begins with a simple need: someone has one currency and needs another. Trading is only one reason people use this market.",
      },
    ],
  },
  {
    title: "Reading an exchange rate",
    shortTitle: "Exchange rates",
    blocks: [
      {
        type: "definition",
        term: "Exchange rate",
        children:
          "The price of one currency expressed in another. A made-up rate of 1 USD = 150 JPY means one US dollar is worth 150 Japanese yen at that example rate. It is an illustration, not today's market price.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Currency codes help you read a quote without confusing different kinds of dollars. USD means US dollar, JPY means Japanese yen, EUR means euro, GBP means British pound, BRL means Brazilian real, and INR means Indian rupee.",
          "A quote always compares two currencies. USD/JPY = 150 says how many yen correspond to one dollar. It does not mean that one yen is worth 150 dollars. In the next lesson, we will give the two sides their usual names: base currency and quote currency.",
        ],
      },
      {
        type: "example",
        title: "Paying for a school book",
        children: [
          "A book costs US$10. At an illustrative rate of 150 JPY per dollar, its currency price would be 10 × 150 = 1,500 JPY, before any exchange fee or card charge. If the rate or fee changes, the final amount changes too.",
        ],
      },
      {
        type: "formula",
        expression: "USD amount × JPY per USD = JPY amount",
        explanation:
          "Multiply when converting dollars into yen at this quote. US$10 × 150 JPY per USD = ¥1,500. The currency units show you which amount you are calculating.",
      },
      {
        type: "example",
        title: "Going back in the other direction",
        children: [
          "Suppose a visitor has ¥3,000 and wants to know its dollar equivalent at the same pretend rate. Divide: 3,000 ÷ 150 = US$20 before fees. Multiplying by 150 again would answer the wrong question.",
        ],
      },
      {
        type: "takeaway",
        children:
          "First name the currency you have and the currency you need. Then read the quote as a sentence before choosing multiplication or division.",
      },
    ],
  },
  {
    title: "Exchange versus trading",
    shortTitle: "Purpose of money",
    blocks: [
      {
        type: "example",
        title: "One trip, two very different decisions",
        children: [
          "A traveler changes enough money for a bus fare and lunch because they need to spend it. A trader buys currency hoping its price rises so it can later be sold for more. The traveler has a practical payment need; the trader has taken a price risk.",
          "Both may pay a spread or fee. Only the trader's reason depends primarily on a future price move. Even a sound explanation of a market does not tell anyone where the next price will go.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Everyday exchange still has consequences. A worse rate may make a trip or overseas purchase more expensive. But that is different from deliberately taking a position to profit from a price change. The reason for buying the currency matters more than the name of the app.",
          "Businesses may also hedge: they arrange a transaction to reduce uncertainty about a future currency payment. Hedging has terms and costs, and does not remove every risk. Longer-term investing is another activity again; owning an overseas investment can create currency exposure alongside the investment's own risks.",
        ],
      },
      {
        type: "warning",
        title: "A large market does not make a small trade safe",
        children:
          "Many institutions participate, but that does not make individual trades safe or profitable. Trading costs, changing prices, leverage, and unreliable counterparties all matter.",
      },
      {
        type: "takeaway",
        children:
          "Ask, “Am I making a payment, reducing an existing currency risk, investing, or trying to profit from a price move?” The same currency pair can serve very different purposes.",
      },
    ],
  },
  {
    title: "What the Forex market actually is",
    shortTitle: "A worldwide network",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "The Forex market is the worldwide network where currencies are exchanged. It is not a single building with one official price. Banks and other participants quote prices to one another, and people usually reach the market through a bank, money changer, payment company, or broker.",
          "Much of the market operates over the counter, or OTC: the parties trade through dealer relationships and electronic systems rather than sending every order to one central exchange. That does not mean there are no rules. Which rules and protections apply depends on the provider, product, and jurisdiction.",
          "For a small payment, your provider may handle the conversion as part of a larger flow of customer payments. You normally compare that provider's final quote; you are not dealing directly with every bank in the worldwide network.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/what-is-forex-payment.svg",
        desktopSrc: "/images/lessons/forex/what-is-forex-payment-desktop.svg",
        alt: "Illustrative school-book payment: a parent in Japan pays 3,140 yen to a card provider. At the assumed rate of 152 yen per US dollar, 20 dollars costs 3,040 yen, plus a 100-yen fee. The shop in the United States receives the 20-dollar book payment; the fee belongs to the provider.",
        width: 600,
        height: 520,
        caption:
          "A simplified payment path. The provider's rate and fee determine the parent's yen bill; they are not the same thing as the shop's dollar price.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A counterparty is the other party to your transaction. For an everyday payment, that may be a bank or payment provider. For an OTC trading position, it may be the dealer offering the contract. Knowing who owes what to whom helps you understand the transaction.",
        ],
      },
      {
        type: "takeaway",
        children:
          "A price chart is a view of selected prices, not a universal receipt for every Forex transaction in the world.",
      },
    ],
  },
  {
    title: "Different transactions can use the same currency pair",
    shortTitle: "What are you buying?",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A cash conversion at a bank, an OTC retail account, and a regulated currency futures contract may all refer to the same pair but have different counterparties, contract sizes, rules, settlement, and protections. The currency names alone do not tell you what the product does.",
        ],
      },
      {
        type: "comparisonTable",
        caption:
          "Currency exchange and currency contracts are different arrangements",
        columns: ["Arrangement", "What happens", "Question to ask"],
        rows: [
          [
            "Everyday conversion",
            "Money is converted for cash, an account, or a payment.",
            "How much will I pay or receive after charges?",
          ],
          [
            "OTC retail Forex position",
            "A dealer offers a contract whose value changes with a currency pair; margin or leverage may apply.",
            "Who is my counterparty, how are costs charged, and how do I close it?",
          ],
          [
            "Currency futures contract",
            "A standardized currency contract trades on an exchange with defined size, expiry, and clearing arrangements.",
            "What are the contract rules and settlement obligations?",
          ],
        ],
      },
      {
        type: "example",
        title: "A book payment and a trading screen",
        children: [
          "Imagine a Japanese parent buying a US$20 book. The parent needs dollars for payment; the card provider quotes a conversion with its own rate and charges. The parent can compare the final yen bill.",
          "A retail speculator clicking “buy USD/JPY” may instead open a margined position with a dealer and close it without receiving physical banknotes. Asking “what exactly am I buying, who quotes it, and how do I exit?” is more useful than memorizing a large market turnover figure.",
        ],
      },
      {
        type: "warning",
        title: "Do not assume every product has the same protections",
        children:
          "A regulated venue or registered provider does not guarantee a profit. Product availability, loss limits, and legal protections differ between countries and account types. Learn the specific terms before treating a trading position like a simple cash exchange.",
      },
    ],
  },
  {
    title: "Where prices come from",
    shortTitle: "Why rates move",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A currency is valuable because people want to use or hold it. International payments, investment decisions, interest-rate expectations, economic news, and many other events can change demand. If more participants want one currency relative to another, their exchange rate can change.",
          "A short-term move may have several causes at once; a simple story after the fact is not a reliable prediction. Participants react to what they expected as well as to what actually happened. That is why a headline does not automatically tell you which direction a rate will move.",
        ],
      },
      {
        type: "example",
        title: "The busy market stall",
        children: [
          "At a fruit stall in India, the price of mangoes may change when supply is low and buyers arrive at once. Currency markets are much more complex, but the idea that buyers and sellers meet at changing prices is a useful starting point.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Some countries let their exchange rates move mainly with market supply and demand. Others manage their currencies or maintain a target against another currency. Central banks can influence currencies through policy and, in some cases, intervention. There is no single worldwide rule that every currency floats freely.",
        ],
      },
      {
        type: "example",
        title: "The same book costs more yen",
        children: [
          "If USD/JPY changes from 150 to 160, a US$20 book changes from ¥3,000 to ¥3,200 before fees. One dollar now buys more yen: the dollar has strengthened against the yen, and the yen has weakened against the dollar. The book's dollar price did not change.",
        ],
      },
      {
        type: "warning",
        children:
          "Forex prices can move against a trader. A lesson about how rates work is education, not a signal to buy or sell.",
      },
    ],
  },
  {
    title: "From the displayed quote to your actual bill",
    shortTitle: "Rates and fees",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A parent in Japan orders a US$20 school book from an American shop. At a pretend USD/JPY rate of 150, the arithmetic says ¥3,000 before card and exchange charges. If the card provider uses 152 yen per dollar plus ¥100, the actual amount is ¥3,140.",
          "Both figures describe the same book, but only the second includes the assumed service terms. No one had to speculate on a future rate for this everyday conversion.",
        ],
      },
      {
        type: "comparisonTable",
        caption:
          "The complete school-book calculation — all rates and charges are made up",
        columns: ["Step", "Calculation", "Amount"],
        rows: [
          [
            "Displayed-rate illustration",
            "US$20 × 150 JPY per USD",
            "¥3,000 before charges",
          ],
          ["Provider's applied rate", "US$20 × 152 JPY per USD", "¥3,040"],
          ["Assumed fixed fee", "¥3,040 + ¥100", "¥3,140 total"],
          [
            "Difference from the illustration",
            "¥3,140 − ¥3,000",
            "¥140: rate difference plus fee",
          ],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Two providers may show different totals because they use different rates, charge different fees, or quote at different times. A provider may build a charge into the conversion rate as well as charging separately. A “no commission” label is not enough to compare the final cost.",
          "A spread is the difference between buying and selling quotes. We will study bid, ask, and spread later in Level 1. For now, ask which quote applies to your conversion and what you will actually pay or receive. Do not assume a rate shown in a search result is the rate your bank will apply.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through: write the currency need, displayed rate, applied rate, and fee in four columns. Use the book example above, then explain why its final bill is ¥3,140 rather than ¥3,000.",
      },
      {
        type: "takeaway",
        children:
          "Compare the final amount for the same payment, including the assumed rate and charges. A headline quote is only the starting point.",
      },
    ],
  },
  {
    title: "How modern Forex developed",
    shortTitle: "A short history",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Foreign exchange has no single founder. It developed as people traded and made payments across places with different money. The modern market grew through banking, international trade, and changes in monetary systems.",
          "In 1944, the Bretton Woods agreement established a system of exchange-rate parities linked to the US dollar, with the dollar linked to gold. In 1971, the United States suspended official dollar convertibility into gold. By 1973, the Bretton Woods fixed-rate system had broken down and major currencies increasingly floated.",
          "Electronic dealing later made it easier to share quotes and arrange transactions across countries. Retail platforms are one way individuals now encounter currency prices. They are not the origin of foreign exchange, and access to a screen does not remove the risks of a trade.",
        ],
      },
      {
        type: "takeaway",
        children:
          "The useful history lesson is that exchange-rate arrangements can change. Today's rules and a country's currency policy still matter.",
      },
    ],
  },
  {
    title: "Practice with everyday payments",
    shortTitle: "Practice",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A made-up quote says 1 USD = 150 JPY. Calculate the currency amount for US$4 before fees. Then name one reason your real bill could differ.",
      },
      {
        type: "exercise",
        prompt:
          "You have ¥6,000. At the same pretend quote of 150 JPY per USD, how many dollars is that before fees? Explain why you divide.",
      },
      {
        type: "exercise",
        prompt:
          "A Brazilian business changes BRL into EUR to pay a German supplier today. Another person buys EUR hoping to sell it later for more BRL. Explain how their purposes differ.",
      },
      {
        type: "comparisonTable",
        caption: "Check your calculations after trying them",
        columns: ["Question", "Worked answer", "What it shows"],
        rows: [
          [
            "US$4 into yen",
            "4 × 150 = ¥600 before fees.",
            "Multiply dollars by yen per dollar.",
          ],
          [
            "¥6,000 into dollars",
            "6,000 ÷ 150 = US$40 before fees.",
            "Divide to reverse this conversion.",
          ],
          [
            "Payment versus speculation",
            "The business needs euros for an invoice; the second person takes price risk hoping for a profit.",
            "The reason for the transaction matters.",
          ],
          [
            "Why the bill can differ",
            "The provider may apply a different rate, fee, or conversion time.",
            "A quote does not include every possible charge.",
          ],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "If you used the wrong operation, start again with the units. “Yen per dollar” tells you that each dollar corresponds to that many yen. When the arithmetic feels familiar, try explaining it to someone as if you were helping them pay an overseas bill.",
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
        title: "Explain these in your own words",
        points: [
          "I can explain why a traveler, family, or business may need to exchange currency.",
          "I can read 1 USD = 150 JPY and calculate a small conversion in either direction.",
          "I can explain how a trader's reason differs from a payment need.",
          "I can explain why two exchange providers may show different final costs.",
          "I understand that an OTC trading position may differ from receiving currency for a payment.",
          "I can name a reason prices change without claiming that I can predict the next move.",
        ],
      },
      {
        type: "takeaway",
        children:
          "Forex begins with a simple everyday act: exchanging one currency for another. Trading a changing rate adds uncertainty and financial risk.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Next, Currency pairs will explain how the two currencies in a quote fit together. You can continue learning without opening or funding a trading account. A basic calculator is enough for this lesson's conversion practice; PipStart's pip-value and position-size calculators become useful after the lessons introduce pips, lots, and risk.",
        ],
      },
      {
        type: "riskStatement",
        children:
          "All exchange rates and fees in the examples are illustrative, not live quotes. This lesson is education, not personalized financial advice or a recommendation to trade.",
      },
      {
        type: "references",
        items: [
          {
            title: "Bank of England — Who sets exchange rates?",
            url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates",
          },
          {
            title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
          },
          {
            title:
              "BIS — The global foreign exchange market in a higher-volatility environment",
            url: "https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment",
          },
          {
            title: "BIS — Sizing up global foreign exchange markets",
            url: "https://www.bis.org/publications/qr-201912/sizing-global-foreign-exchange-markets",
          },
          {
            title:
              "IMF — Evolution not Revolution: The Changing Role of the IMF in the Global Economy",
            url: "https://www.imf.org/en/news/articles/2015/09/28/04/53/sp022306",
          },
          {
            title: "BIS Triennial Central Bank Survey — 2022 historical survey",
            url: "https://www.bis.org/statistics/rpfx22.htm",
          },
        ],
      },
    ],
  },
];
