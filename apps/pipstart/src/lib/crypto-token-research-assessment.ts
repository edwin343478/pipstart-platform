import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoTokenResearchQuizV1: AssessmentDefinition = {
  id: "crypto-token-research-quiz",
  version: 1,
  title: "Tokens Supply and Research quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-tokens-and-research",
  moduleId: "token-supply-and-research",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://ethereum.org/dao/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
      "https://ethereum.org/developers/docs/standards/tokens/",
      "https://www.circle.com/legal/usdc-terms",
      "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
      "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
      "https://blog.uniswap.org/uni",
      "https://www.sec.gov/newsroom/press-releases/2017-131",
      "https://developer.bitcoin.org/devguide/block_chain.html",
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://ethereum.org/security/",
      "https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread",
      "https://www.sec.gov/newsroom/press-releases/2022-183",
      "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
      "https://docs.glassnode.com/basic-api/endpoints/entities",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
      "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
    ],
  },
  questions: [
    {
      id: "crypto-token-research-1",
      prompt:
        'Kenji in Osaka compares two invented cloud-storage projects. Project A requires its token to pay for every gigabyte, and storage providers are paid in it. Project B lets users pay by bank card; its token only gives holders a "community badge". Which conclusion fits what you have learned?',
      explanation:
        "Correct choice: Project A's token is part of how its service works, while Project B's token could disappear without users noticing.\n\nA token has a real use when something actually requires it, and only Project A's service does. The answer “Project A's token will rise in price, because the service needs it” is the tempting trap: a real use promises nothing about price, because a token can be needed by a service few people want or be created in far greater numbers than its use needs.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Project A's token will rise in price, because the service needs it.",
        },
        {
          id: "b",
          label:
            "Both tokens have the same use, because both projects call them utility tokens.",
        },
        {
          id: "c",
          label:
            "Project B's token is lower risk, because users can also pay by card.",
        },
        {
          id: "d",
          label:
            "Project A's token is part of how its service works, while Project B's token could disappear without users noticing.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-token-research-2",
      prompt:
        "How does an initial exchange offering (IEO) differ from an initial coin offering (ICO)?",
      explanation:
        "Correct choice: In an IEO a centralised exchange runs the sale and does some checks, while in an ICO the project usually sells directly to the public.\n\nIn an IEO the exchange handles the sale and some due diligence, which an ICO often lacks. The answer “An IEO runs on a decentralised exchange that anyone can join, while an ICO runs through a regulated bank” is tempting, but a sale on a decentralised exchange is an IDO, which usually has less vetting, not more.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "An IEO gives tokens away free to many wallets, while an ICO sells them to the public for crypto.",
        },
        {
          id: "b",
          label:
            "In an IEO a centralised exchange runs the sale and does some checks, while in an ICO the project usually sells directly to the public.",
        },
        {
          id: "c",
          label:
            "An IEO runs on a decentralised exchange that anyone can join, while an ICO runs through a regulated bank.",
        },
        {
          id: "d",
          label:
            "An IEO promises the token will trade above its sale price, while an ICO makes no such promise.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-token-research-3",
      prompt:
        'Inès in Marseille notices an unknown token in her wallet. Its name contains a web address and the words "Claim your reward", and the wallet shows it as worth €3,000 (an invented amount). What is the safest thing to do?',
      explanation:
        "Correct choice: Leave the token untouched, and check for any genuine airdrop only through the project's official channels, reached from her own bookmark.\n\nUnexpected tokens with a link in their name are a common airdrop-scam bait, so the safest move is not to interact at all. The answer “Visit the web address in the token's name and connect her wallet, to see whether the reward is real” is tempting, but connecting and signing on that site could grant an approval that lets the scammer move her real tokens; and no genuine team ever needs a seed phrase.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Leave the token untouched, and check for any genuine airdrop only through the project's official channels, reached from her own bookmark.",
        },
        {
          id: "b",
          label:
            "Visit the web address in the token's name and connect her wallet, to see whether the reward is real.",
        },
        {
          id: "c",
          label:
            "Sell the token quickly on a decentralised exchange before its value falls.",
        },
        {
          id: "d",
          label:
            "Contact the token's support team and share her seed phrase so they can confirm the reward.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-token-research-4",
      prompt:
        "At the same moment, two aggregators use the same quoted token price but show different market caps. What could explain the difference?",
      explanation:
        "Correct choice: Circulating supply involves judgement about which holdings to exclude, so the sites may count different numbers of tokens.\n\nDifferent circulating-supply definitions, exclusions and source updates can give different indicated market caps at the same supplied price. If prices also differ, that is another possible cause. Compare the actual fields and timestamps.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "One of the two sites must be showing a fake copy of the token.",
        },
        {
          id: "b",
          label:
            "One site calculates market cap with maximum supply, while the other uses circulating supply.",
        },
        {
          id: "c",
          label:
            "Circulating supply involves judgement about which holdings to exclude, so the sites may count different numbers of tokens.",
        },
        {
          id: "d",
          label:
            "Market cap includes 24-hour trading volume, which each site measures in its own way.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-token-research-5",
      prompt:
        "An invented token trades at INR 20, with 30 million circulating units, 120 million total units and a 200 million maximum. Using maximum supply as the stated FDV basis, what are market cap and FDV?",
      explanation:
        "Correct choice: Market cap ₹600 million; FDV ₹4 billion\n\nMarket cap is INR 20 × 30 million = INR 600 million. FDV on the question's maximum basis is INR 20 × 200 million = INR 4 billion. A provider using total supply would report a different basis, so the word FDV alone cannot decide the denominator.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Market cap ₹600 million; FDV ₹2.4 billion",
        },
        {
          id: "b",
          label: "Market cap ₹600 million; FDV ₹4 billion",
        },
        {
          id: "c",
          label: "Market cap ₹2.4 billion; FDV ₹4 billion",
        },
        {
          id: "d",
          label: "Market cap ₹4 billion; FDV ₹600 million",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-token-research-6",
      prompt:
        "An invented token has market cap USD 45 million and FDV USD 300 million. Both use the same unit price, and FDV explicitly uses maximum supply. What share of that supply is counted as circulating?",
      explanation:
        "Correct choice: 15%\n\nThe common price cancels: 45 divided by 300 is 15 percent. This conclusion depends on the supplied maximum-supply basis. The remaining 85 percent is outside that circulating estimate, not necessarily a scheduled future sale.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "85%",
        },
        {
          id: "b",
          label: "45%",
        },
        {
          id: "c",
          label: "30%",
        },
        {
          id: "d",
          label: "15%",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-token-research-7",
      prompt:
        "In an invented project, team members and investors hold 240 million tokens. After a one-year cliff, 25% unlocks at once and the rest unlocks in equal monthly amounts over the next three years. How many tokens unlock on the cliff date, and how many each month after that?",
      explanation:
        "Correct choice: 60 million on the cliff date, then 5 million a month\n\n25% of 240 million is 60 million on the cliff date, leaving 180 million to spread over 36 months: 180 ÷ 36 = 5 million a month. The answer “60 million on the cliff date, then about 6.7 million a month” is tempting, but it divides all 240 million by 36 and forgets that 60 million were already released at the cliff.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "60 million on the cliff date, then about 6.7 million a month",
        },
        {
          id: "b",
          label: "Nothing on the cliff date, then about 6.7 million a month",
        },
        {
          id: "c",
          label: "60 million on the cliff date, then 5 million a month",
        },
        {
          id: "d",
          label: "20 million on the cliff date, then 20 million a month",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-token-research-8",
      prompt:
        "Hyun-woo in Busan looks at an invented token launching at ₩800. Only 8% of its maximum supply is circulating. Private investors paid ₩40 per token two years earlier, hold 25% of the supply and can sell after a one-year cliff. What is the main concern for a later buyer like him?",
      explanation:
        "Correct choice: Insiders with a much lower purchase price can remain profitable after a fall, and future releases create a supply-and-incentive question for later buyers.\n\nAt half the fictional launch price, an investor who paid one-twentieth of that price still has a large gross gain. Low circulation and future release rights deserve investigation. Eligibility to sell does not show that all tokens will be sold or force a particular price.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            'None in particular: with so little supply circulating, the token is small and still "early".',
        },
        {
          id: "b",
          label:
            "Insiders with a much lower purchase price can remain profitable after a fall, and future releases create a supply-and-incentive question for later buyers.",
        },
        {
          id: "c",
          label:
            "The investors' tokens are locked, so they cannot affect the price at any point.",
        },
        {
          id: "d",
          label:
            "The price will certainly drop on the cliff date, so he should plan to sell the day before.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-token-research-9",
      prompt:
        'What does it mean when a block explorer such as Etherscan shows a token\'s contract as "verified"?',
      explanation:
        "Correct choice: The explorer's verification procedure matches published source and build information to the identified deployed bytecode; it does not certify safety.\n\nCheck the relevant contract, build settings and current implementation. A proxy can point to other code, and upgrades can change the operative version. Source verification, a security review and legal rights are separate questions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The explorer's verification procedure matches published source and build information to the identified deployed bytecode; it does not certify safety.",
        },
        {
          id: "b",
          label:
            "A security firm has reviewed the code and confirmed that it is safe to use.",
        },
        {
          id: "c",
          label:
            "A financial regulator has approved the token for sale to the public.",
        },
        {
          id: "d",
          label:
            "The explorer has checked the real identities of the team behind the token.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-token-research-10",
      prompt:
        "Lukas in Munich sees an invented token whose price has only risen for three days. The explorer shows 900 buy transactions and 3 sells, all three from the address that deployed the contract. What is the best reading?",
      explanation:
        "Correct choice: It looks like a possible honeypot, and a small test purchase would not be a safe check, so he should avoid it.\n\nMany buys and almost no sells, with only the creator selling, fits the honeypot pattern where buyers cannot get out. The answer “It looks like a possible honeypot, so he should buy a small amount first to test whether selling works” is tempting, but a test is not safe, because the contract may let small sells through or change its rules later.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The pattern shows strong demand, because nobody wants to sell.",
        },
        {
          id: "b",
          label:
            "It looks like a possible honeypot, so he should buy a small amount first to test whether selling works.",
        },
        {
          id: "c",
          label:
            "It looks like a possible honeypot, and a small test purchase would not be a safe check, so he should avoid it.",
        },
        {
          id: "d",
          label:
            "It looks like a soft rug pull, so he should buy now and sell before the team does.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-token-research-11",
      prompt:
        'Ayşe in Ankara is filling in the "Unlocks" row of her token research template for an invented token. Its maximum supply is 1 billion and its circulating supply is 50 million. A team wallet holding 30% of the maximum supply unlocks in two weeks. How many tokens could the team sell after the unlock, compared with today\'s circulating supply?',
      explanation:
        "Correct choice: 300 million, which is six times today's circulating supply\n\nThirty percent of one billion is 300 million units, six times the supplied circulating estimate of 50 million. That is potential release capacity under the stated terms, not six times today's trading volume, proof of a sale or a forecast of price.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "15 million, which is 30% of today's circulating supply",
        },
        {
          id: "b",
          label: "300 million, which is six times today's circulating supply",
        },
        {
          id: "c",
          label: "300 million, which is 30% of today's circulating supply",
        },
        {
          id: "d",
          label: "350 million, which is seven times today's circulating supply",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-token-research-12",
      prompt:
        "At USD 0.50 with 80 million circulating units and 200 million maximum units, what are the indicated values?",
      explanation:
        "Correct choice: USD 40 million market cap and USD 100 million FDV on the maximum basis\n\nUSD 0.50 for both. Unit price omits the supply dimension.\n\nUSD 40 million market cap and USD 100 million FDV on the maximum basis. Each uses price multiplied by its specified supply.\n\nUSD 100 million market cap and USD 40 million FDV. The supply bases are reversed.\n\nUSD 280 million for both. Adding supply figures does not calculate either metric.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "USD 0.50 for both",
        },
        {
          id: "b",
          label:
            "USD 40 million market cap and USD 100 million FDV on the maximum basis",
        },
        {
          id: "c",
          label: "USD 100 million market cap and USD 40 million FDV",
        },
        {
          id: "d",
          label: "USD 280 million for both",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-token-research-13",
      prompt: "What does market capitalisation represent?",
      explanation:
        "Correct choice: Price multiplied by a stated circulating estimate\n\nThe project's treasury bank balance. Treasury assets are a separate measure.\n\nCumulative deposits made into the project. The metric is not a cash-flow ledger.\n\nPrice multiplied by a stated circulating estimate. It is an indicated valuation under those inputs.\n\nCash guaranteed available for all holders to exit. Liquidity may be much smaller.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The project's treasury bank balance",
        },
        {
          id: "b",
          label: "Cumulative deposits made into the project",
        },
        {
          id: "c",
          label: "Price multiplied by a stated circulating estimate",
        },
        {
          id: "d",
          label: "Cash guaranteed available for all holders to exit",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-token-research-14",
      prompt:
        "A cliff releases 3 million units, followed by two monthly releases of 750,000. How many have unlocked?",
      explanation:
        "Correct choice: 4.5 million units\n\n4.5 million units. Three million plus 1.5 million gives 4.5 million.\n\n1.5 million units. This ignores the cliff release.\n\n12 million units. That is the complete example allocation, not the current release.\n\nAll circulating units by definition. Unlock and circulation are different classifications.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "4.5 million units",
        },
        {
          id: "b",
          label: "1.5 million units",
        },
        {
          id: "c",
          label: "12 million units",
        },
        {
          id: "d",
          label: "All circulating units by definition",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-token-research-15",
      prompt:
        "An audit covers version 1 but version 2 is deployed. What is the appropriate dossier statement?",
      explanation:
        "Correct choice: Current changes and applicable review remain to be checked\n\nVersion 2 is fully certified by the old report. The conclusion exceeds the evidence.\n\nNo version information is needed. Version is central to security-report scope.\n\nOnly a price chart can resolve the code question. Price history cannot establish reviewed code behaviour.\n\nCurrent changes and applicable review remain to be checked. An older scope cannot automatically cover a later version.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Version 2 is fully certified by the old report",
        },
        {
          id: "b",
          label: "No version information is needed",
        },
        {
          id: "c",
          label: "Only a price chart can resolve the code question",
        },
        {
          id: "d",
          label: "Current changes and applicable review remain to be checked",
        },
      ],
      correctChoiceIds: ["d"],
    },
  ],
};
