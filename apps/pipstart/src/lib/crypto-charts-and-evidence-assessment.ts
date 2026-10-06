import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoChartsEvidenceQuizV1: AssessmentDefinition = {
  id: "crypto-charts-and-evidence-quiz",
  version: 1,
  title: "Charts Market Context and Evidence quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-charts-and-evidence",
  moduleId: "charts-market-context-and-evidence",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://www.tradingview.com/support/solutions/43000745269-introduction-to-candlestick-charts-and-patterns/",
      "https://www.tradingview.com/support/solutions/43000696841-simple-moving-average/",
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://www.imf.org/en/blogs/articles/2022/01/11/crypto-prices-move-more-in-sync-with-stocks-posing-new-risks",
      "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.cmegroup.com/education/courses/introduction-to-options/introduction-to-options",
      "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
      "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
      "https://www.cmegroup.com/education/courses/introduction-to-futures/open-interest",
      "https://docs.glassnode.com/basic-api/endpoints/entities",
      "https://docs.glassnode.com/basic-api/endpoints/addresses",
      "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://ethereum.org/developers/docs/transactions/",
      "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses",
      "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/wallets/active-wallets",
      "https://research.glassnode.com/exchange-metrics/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://alternative.me/crypto/fear-and-greed-index/",
      "https://support.google.com/trends/answer/4365533?hl=en",
    ],
  },
  questions: [
    {
      id: "crypto-charts-and-evidence-1",
      prompt:
        'Kenji in Tokyo and Emily in London look at the same coin on the same exchange. Their daily candles for "Tuesday" have different highs and closes. What is the most likely reason?',
      explanation:
        'Correct choice: Their charts cut the 24/7 market into days at different times, such as midnight UTC and midnight Japan time.\n\nCrypto never closes, so a "daily close" is a charting convention set by a cut-off time, often 00:00 UTC, and changing it reshapes the daily candles. The answer “Crypto exchanges close for a few hours each night, and the gap is handled differently” is tempting, but crypto trades 24 hours a day, 7 days a week, so there is no nightly closure.',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "One of the two charts is showing fake prices.",
        },
        {
          id: "b",
          label:
            "Crypto exchanges close for a few hours each night, and the gap is handled differently.",
        },
        {
          id: "c",
          label:
            "Their charts cut the 24/7 market into days at different times, such as midnight UTC and midnight Japan time.",
        },
        {
          id: "d",
          label:
            "Daily candles in crypto are averages of all trades, so they always differ slightly.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-charts-and-evidence-2",
      prompt:
        "On a logarithmic price scale, which two moves of invented coins would look the same height?",
      explanation:
        "Correct choice: US$100 to US$200, and US$20,000 to US$40,000\n\nBoth moves in “US$100 to US$200, and US$20,000 to US$40,000” are 100% rises, and on a log scale equal distances mean equal percentage changes. The answers “US$100 to US$200, and US$20,000 to US$20,100” and “US$1,000 to US$2,000, and US$50,000 to US$51,000” are tempting because they compare equal dollar amounts or a doubling with a small rise, but equal dollar steps only look equal on a linear scale.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$100 to US$200, and US$20,000 to US$20,100",
        },
        {
          id: "b",
          label: "US$100 to US$200, and US$20,000 to US$40,000",
        },
        {
          id: "c",
          label: "US$100 to US$300, and US$20,000 to US$20,200",
        },
        {
          id: "d",
          label: "US$1,000 to US$2,000, and US$50,000 to US$51,000",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-charts-and-evidence-3",
      prompt:
        "An invented coin peaked at US$120 and later fell to US$30. What was the drawdown, and what gain would be needed to get back to the peak?",
      explanation:
        "Correct choice: A 75% drawdown, needing a 300% gain\n\nDrawdown = (120 − 30) ÷ 120 = 75%, and the gain needed is 0.75 ÷ (1 − 0.75) = 3, or 300%. The answer “A 75% drawdown, needing a 75% gain” is tempting, but a gain is measured from the lower price, so recovering a 75% loss needs far more than 75%.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A 75% drawdown, needing a 300% gain",
        },
        {
          id: "b",
          label: "A 75% drawdown, needing a 75% gain",
        },
        {
          id: "c",
          label: "A 90% drawdown, needing a 300% gain",
        },
        {
          id: "d",
          label: "A 25% drawdown, needing a 400% gain",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-charts-and-evidence-4",
      prompt:
        "Using invented numbers, Bitcoin's market cap is US$1.8 trillion and the total crypto market cap is US$3.0 trillion. Later, Bitcoin's market cap is unchanged but the total grows to US$3.6 trillion. What happens to Bitcoin dominance?",
      explanation:
        "Correct choice: It falls from 60% to 50%.\n\n1.8 ÷ 3.0 = 60%, then 1.8 ÷ 3.6 = 50%. The answer “It stays at 60%, because Bitcoin's value did not change” is tempting, but dominance is a share of the whole market, so it falls when other assets or stablecoins grow even if Bitcoin stays still.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It stays at 60%, because Bitcoin's value did not change.",
        },
        {
          id: "b",
          label: "It rises from 50% to 60%.",
        },
        {
          id: "c",
          label: "It falls from 60% to 50%.",
        },
        {
          id: "d",
          label: "It falls from 60% to 40%.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-charts-and-evidence-5",
      prompt:
        "A perpetual futures contract on an invented coin is trading above its spot index price, and the funding rate is positive. Who pays funding for that interval?",
      explanation:
        "Correct choice: Traders holding long positions pay traders holding short positions.\n\nA positive funding rate means longs pay shorts, which encourages traders to pull the perp's price back towards spot. The answer “Both sides pay the exchange a funding fee” is tempting, but funding is a transfer between traders, not a fee the exchange collects.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Traders holding long positions pay traders holding short positions.",
        },
        {
          id: "b",
          label:
            "Traders holding short positions pay traders holding long positions.",
        },
        {
          id: "c",
          label: "Both sides pay the exchange a funding fee.",
        },
        {
          id: "d",
          label: "Nobody pays until the contract expires.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-charts-and-evidence-6",
      prompt:
        "Lerato in Johannesburg holds a long perpetual position covering 2 units of an invented coin with a mark price of US$2,500. The funding rate for the interval is +0.02%. Roughly how much funding does she pay or receive?",
      explanation:
        "Correct choice: She pays about US$1.00.\n\nNotional = 2 × 2,500 = US$5,000, and 5,000 × 0.0002 = US$1.00; with a positive rate, longs pay. The answer “She receives about US$1.00” uses the right amount but the wrong direction.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "She receives about US$1.00.",
        },
        {
          id: "b",
          label: "She pays about US$0.50.",
        },
        {
          id: "c",
          label: "She pays about US$10.00.",
        },
        {
          id: "d",
          label: "She pays about US$1.00.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-charts-and-evidence-7",
      prompt:
        "An exchange defines its long/short ratio as the number of net-long accounts divided by the number of net-short accounts. Its reported value is 3.0. What does that defined metric tell you?",
      explanation:
        "Correct choice: About three accounts are net long for every one account that is net short, which says nothing about how much money each side holds.\n\nUnder this account-count definition, there are about three net-long accounts per net-short account. It does not reveal their position sizes. Other providers can publish ratios based on different populations or measures, so inspect the definition.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "There are three times as many long contracts open as short contracts.",
        },
        {
          id: "b",
          label:
            "About three accounts are net long for every one account that is net short, which says nothing about how much money each side holds.",
        },
        {
          id: "c",
          label: "The price will rise, because most traders are long.",
        },
        {
          id: "d",
          label: "Longs are paying three times more funding than shorts.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-charts-and-evidence-8",
      prompt:
        "On a futures exchange, Diego in Monterrey closes his long position by selling one contract to Sophie, who is opening a brand-new long position. What happens to open interest?",
      explanation:
        "Correct choice: It stays the same, although volume rises by one contract.\n\nOne trader is closing and one is opening, so the position changes hands and open interest is unchanged, while the trade still adds to volume. The answer “It rises by one contract” is tempting, but open interest only rises when new positions are opened on both sides.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It rises by one contract.",
        },
        {
          id: "b",
          label: "It falls by one contract.",
        },
        {
          id: "c",
          label: "It stays the same, although volume rises by one contract.",
        },
        {
          id: "d",
          label: "It falls to zero.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-charts-and-evidence-9",
      prompt:
        'A post says "10,000 BTC just left Exchange X, so buyers are moving to self-custody." What is the most important caution?',
      explanation:
        "Correct choice: The move may be the exchange shifting coins between its own wallets, and the data may be revised once new exchange addresses are labelled.\n\nGlassnode warns that big single flows can be internal transfers, such as a new cold wallet not yet identified, and that exchange metrics are subject to revision. The answer “Outflows always mean selling” is tempting, but it reverses the usual reading and still ignores the labelling problem.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Outflows always mean selling.",
        },
        {
          id: "b",
          label:
            "Exchange data is never published, so the post must be invented.",
        },
        {
          id: "c",
          label:
            "The move may be the exchange shifting coins between its own wallets, and the data may be revised once new exchange addresses are labelled.",
        },
        {
          id: "d",
          label: "Large outflows are always reversed within a day.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-charts-and-evidence-10",
      prompt:
        "An invented coin has 5 million units in circulation and a realised capitalisation of US$100 billion. The market price is US$30,000. What are the realised price and MVRV?",
      explanation:
        "Correct choice: Realised price US$20,000; MVRV 1.5\n\nRealised price is USD 100 billion divided by five million units = USD 20,000. Indicated market cap is USD 150 billion, so MVRV is 1.5. The realised-cap method uses specified ledger movement values; it is not a verified purchase-price record for every owner.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Realised price US$30,000; MVRV 1.0",
        },
        {
          id: "b",
          label: "Realised price US$20,000; MVRV 0.67",
        },
        {
          id: "c",
          label: "Realised price US$50,000; MVRV 1.5",
        },
        {
          id: "d",
          label: "Realised price US$20,000; MVRV 1.5",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-charts-and-evidence-11",
      prompt:
        "A price fall coincides with a lower Fear and Greed reading. Why should you avoid counting the index as completely independent confirmation?",
      explanation:
        "Correct choice: Its inputs can reuse volatility, momentum or volume related to the same market movement.\n\nInspect the current methodology and component overlap. A composite index can partly summarise data already used in the chart. Its agreement does not automatically add a separate source of evidence or predict the next move.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Its inputs can reuse volatility, momentum or volume related to the same market movement.",
        },
        {
          id: "b",
          label: "It is based only on Google searches.",
        },
        {
          id: "c",
          label: "It measures stablecoin supply, not mood.",
        },
        {
          id: "d",
          label: "It is updated only once a year.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-charts-and-evidence-12",
      prompt: "What is a five-period SMA of 100, 102, 101, 105 and 107?",
      explanation:
        "Correct choice: 103\n\nA guaranteed next close of 103. The average summarises past observations.\n\n103. The sum is 515 divided by five.\n\n107. That is the final close only.\n\n515. That is the sum before averaging.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed next close of 103",
        },
        {
          id: "b",
          label: "103",
        },
        {
          id: "c",
          label: "107",
        },
        {
          id: "d",
          label: "515",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-charts-and-evidence-13",
      prompt: "What can rising open interest alone establish?",
      explanation:
        "Correct choice: More outstanding contracts under the metric definition\n\nEvery liquidation heatmap level is exact. Heatmaps can use estimates and incomplete coverage.\n\nMore outstanding contracts under the metric definition. It does not identify bullish intent by itself.\n\nAll new positions are long without shorts. Outstanding contracts have counterparties.\n\nSpot holders must be buying. Derivative contracts do not prove spot transactions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Every liquidation heatmap level is exact",
        },
        {
          id: "b",
          label: "More outstanding contracts under the metric definition",
        },
        {
          id: "c",
          label: "All new positions are long without shorts",
        },
        {
          id: "d",
          label: "Spot holders must be buying",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-charts-and-evidence-14",
      prompt:
        "An exchange-labelled inflow is observed. Which interpretation is careful?",
      explanation:
        "Correct choice: It is a captured transfer that may need further explanation\n\nThe holder definitely sold immediately. A deposit does not prove a sale.\n\nThe exchange is definitely solvent. Flows do not establish all liabilities.\n\nEvery address in the ecosystem is covered. Provider coverage can be incomplete.\n\nIt is a captured transfer that may need further explanation. Internal movement, attribution limits and later use remain uncertain.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The holder definitely sold immediately",
        },
        {
          id: "b",
          label: "The exchange is definitely solvent",
        },
        {
          id: "c",
          label: "Every address in the ecosystem is covered",
        },
        {
          id: "d",
          label: "It is a captured transfer that may need further explanation",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-charts-and-evidence-15",
      prompt: "What strengthens a research note?",
      explanation:
        "Correct choice: Contrary evidence and an observable invalidation condition\n\nAdding many indicators from the same inputs. More lines do not ensure independent information.\n\nContrary evidence and an observable invalidation condition. They make the interpretation reviewable and bounded.\n\nRemoving every uncertainty. Hiding limitations overstates confidence.\n\nCounting repeated promotional claims as independent proof. Reposts can share one unsupported origin.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Adding many indicators from the same inputs",
        },
        {
          id: "b",
          label: "Contrary evidence and an observable invalidation condition",
        },
        {
          id: "c",
          label: "Removing every uncertainty",
        },
        {
          id: "d",
          label: "Counting repeated promotional claims as independent proof",
        },
      ],
      correctChoiceIds: ["b"],
    },
  ],
};
