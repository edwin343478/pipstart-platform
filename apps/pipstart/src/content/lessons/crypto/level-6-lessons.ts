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
  course: "crypto-defi-foundations",
  description:
    "Trace a swap and distinguish the protocol from its interface and quote.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-6",
  module: "defi-liquidity-lending-and-rewards",
  objectives: [
    "Trace a swap and distinguish the protocol from its interface and quote.",
  ],
  position: 1,
  prerequisites: ["build-a-token-dossier-and-check-liquidity"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["liquidity-provision-and-impermanent-loss"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Trace a swap and distinguish the protocol from its interface and quote.",
  seoTitle: "Decentralised Exchanges, Pools and Swaps",
  slug: "decentralised-exchanges-pools-and-swaps",
  sources: [
    {
      title: "Uniswap: How Uniswap works",
      url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
    },
    {
      title: "Hayden Adams and Uniswap: A Short History of Uniswap",
      url: "https://blog.uniswap.org/uniswap-history",
    },
    {
      title: "Uniswap: What is price impact",
      url: "https://support.uniswap.org/hc/en-us/articles/40074715860365-What-is-price-impact",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "MetaMask: What is a token approval",
      url: "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
    },
    {
      title: "MetaMask: Disconnect wallet from a dapp",
      url: "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
    },
    {
      title:
        "Uniswap docs: Uniswap docs — How Uniswap works (v2 protocol overview)",
      url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works",
    },
    {
      title: "Uniswap docs: Uniswap docs — Concentrated liquidity",
      url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity",
    },
  ],
  status: "published",
  title: "Decentralised Exchanges, Pools and Swaps",
};
const sections1: LessonSection[] = [
  {
    title: "DeFi exchanges and the AMM story",
    shortTitle: "DeFi exchanges and the AMM story",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Trace a swap and distinguish the protocol from its interface and quote.",
      },
      {
        type: "paragraph",
        children:
          "A decentralised exchange can execute through contracts rather than a provider's internal customer ledger. Many use liquidity pools, but not every DEX uses the same model. We will study one simple constant-product pool to understand reserves and price impact, then keep its assumptions separate from real applications and versions.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "State the pool model and its assumptions before calculating.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what decentralised finance means",
      },
      {
        type: "paragraph",
        children:
          "Think about a self-service petrol station at night. Nobody stands behind the counter. You insert your card, pick the pump and the machine follows its rules. It works at 3 a.m. because the rules are built into the equipment, not carried in a person's head.",
      },
      {
        type: "paragraph",
        children:
          "Decentralised finance, usually shortened to DeFi, applies that idea to money. In Level 4 you met smart contracts, the vending machines of Ethereum. DeFi is the family of financial services built from them: swapping tokens, lending, borrowing and staking. Anyone with a wallet and some ether for gas can use them, at any hour, without opening an account.",
      },
      {
        type: "definition",
        term: "Decentralised finance (DeFi)",
        children:
          "Financial services, such as swapping, lending and borrowing, that run as smart contracts on a blockchain rather than through a company that holds your money.",
      },
      {
        type: "paragraph",
        children:
          "That openness is the attraction, and it is also the risk. There is no branch to visit, no complaints desk and usually no compensation scheme. A mistake in the code, or in what you sign, can be permanent. Regulators are watching: in December 2023 IOSCO, the international body for securities regulators, published nine policy recommendations for DeFi, aiming for consistent investor protection across countries.",
      },
      {
        type: "paragraph",
        children:
          "The analogy stops working in one place. A petrol station has an owner who fixes a broken pump; many DeFi contracts have no one who can step in (the DeFi dependency lesson in Level 6 examines who can). The most-used DeFi service is the swap, so start there.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare a DEX with a centralised exchange",
      },
      {
        type: "paragraph",
        children:
          "In the exchange and order lessons in Level 3 you learned that a centralised exchange (CEX) is a company that holds your funds and matches orders in an order book. A decentralised exchange (DEX) also swaps one token for another, but the trade happens between your wallet and a smart contract. Your tokens stay in your wallet until the swap, which settles on the blockchain in a single transaction.",
      },
      {
        type: "comparisonTable",
        caption:
          "A centralised exchange compared with a decentralised exchange",
        columns: [
          "Question",
          "Centralised exchange (CEX)",
          "Decentralised exchange (DEX)",
        ],
        rows: [
          [
            "Who holds your funds?",
            "The exchange, in its own wallets",
            "You, in your own wallet, until the swap",
          ],
          [
            "How is the price set?",
            "Buyers' and sellers' orders in an order book",
            "A formula applied to the tokens in a pool",
          ],
          [
            "Sign-up and identity checks",
            "Usually an account and identity checks",
            "Usually none: connect a wallet",
          ],
          [
            "Bank money in and out",
            "Often possible",
            "Not directly; token-to-token only",
          ],
          [
            "Who can help if it goes wrong?",
            "Support team, possibly a regulator",
            "Usually nobody; transactions are final",
          ],
          [
            "Main risks",
            "Exchange failure, hacks, frozen withdrawals",
            "Code bugs, fake tokens, harmful approvals, your own mistakes",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'Neither column is "safe". A DEX removes the risk of a company losing your deposits (the exchange failure lesson in Level 3) but hands every other check to you. Many DEXs list any token anyone creates, so the red flags in the token research lesson in Level 5 matter here.',
      },
      {
        type: "paragraph",
        children:
          "How can a contract quote a price without anyone placing orders? The answer came from a small group of builders in 2017 and 2018.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet the people behind the first popular AMM",
      },
      {
        type: "paragraph",
        children:
          'Order books on Ethereum struggled, because every order and cancellation cost gas. In June 2017 Vitalik Buterin, Ethereum\'s co-founder, wrote a blog post called "On Path Independence". It discussed an automated market maker that keeps the balance of one token multiplied by the balance of the other at a fixed number. A market maker is someone always ready to buy or sell; here, the "someone" is a formula.',
      },
      {
        type: "paragraph",
        children:
          "On 6 July 2017, a mechanical engineer named Hayden Adams was laid off from Siemens. His friend Karl Floersch encouraged him to learn Ethereum programming, and Adams chose to build the market-maker idea. In 2018 the project received an Ethereum Foundation grant. On 2 November 2018, the last day of the Devcon 4 conference in Prague, Adams announced Uniswap and deployed it on Ethereum. Uniswap launched in November 2018 and popularised the constant-product automated market maker, x × y = k.",
      },
      {
        type: "definition",
        term: "Automated market maker (AMM)",
        children:
          "A smart contract that holds two tokens and sets the price between them with a formula, so anyone can swap at any time without waiting for another person to take the other side.",
      },
      {
        type: "paragraph",
        children:
          "Many DEXs have since adapted the design. Before looking at the formula in symbols, picture it in a market.",
      },
      {
        type: "paragraph",
        children:
          "A common interface does not establish common contract behaviour. You still depend on token contracts, network inclusion, permissions and the application route. DEX does not mean that every dependency has disappeared. This is a project's history, not a claim that one person invented every automated market maker or that all current DEXs use its original rules.",
      },
    ],
  },
  {
    title: "Pool models, swap calculations and routes",
    shortTitle: "Pool models swap calculations and routes",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "One constant product model",
      },
      {
        type: "paragraph",
        children:
          "In a simple two-asset model, reserves x and y satisfy x multiplied by y equals k. A swap removes one asset and adds the other, with the curve changing the effective price. For teaching, begin with 100 practice units and 10,000 quote units, so k is one million. We ignore fees and assume no other trades, arbitrage or reserve changes during the calculation.",
      },
      {
        type: "paragraph",
        children:
          "If a buyer removes ten practice units, the remaining x is 90. Keeping k fixed requires y to become 1,000,000 divided by 90, or approximately 11,111.11 quote units. The buyer therefore adds approximately 1,111.11 quote units. The average cost is about 111.11 quote units per practice unit, above the initial reserve ratio of 100. This simplified model explains why order size matters; it does not describe every pool version.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a fruit stall in Mexico City with two baskets: one holds 100 mangoes, the other MX$2,000 in coins (invented amounts for this example). The stallholder follows one strange rule: after every sale, mangoes multiplied by pesos must still equal 200,000.",
      },
      {
        type: "heading",
        level: 3,
        children: "Work through a swap and a route",
      },
      {
        type: "heading",
        level: 3,
        children: "Work through a swap in a liquidity pool",
      },
      {
        type: "paragraph",
        children:
          "A liquidity pool is the crypto version of the baskets: a smart contract holding two tokens, such as ether and a US-dollar stablecoin. Uniswap's documentation explains that each trade shifts the ratio of the reserves, and that ratio is the new price.",
      },
      {
        type: "example",
        title: "Ananya swaps in Bengaluru",
        children:
          "An invented pool holds 100 ETH and 200,000 USDC, so k = 20,000,000 and the price is 2,000 USDC per ETH (invented figures for this example). Ananya sells 1 ETH into the pool. Ignoring fees, ETH rises to 101, so USDC must fall to 20,000,000 ÷ 101 = 198,019.80. She receives 200,000 − 198,019.80 = 1,980.20 USDC, about 1% below the 2,000 she saw.",
      },
      {
        type: "paragraph",
        children:
          "That gap is price impact: the change in price caused by your own trade. It grows quickly with size. Selling 10 ETH into the same pool returns 200,000 − (20,000,000 ÷ 110) = 18,181.82 USDC, an average of 1,818.18 per ETH, about 9.1% below the starting price. Uniswap's documentation notes that trades large relative to the pool always get worse rates.",
      },
      {
        type: "paragraph",
        children:
          "Then there is the fee. In Uniswap's version 2 pools each trade pays 0.30%, which stays in the pool for liquidity providers. With the fee, only 0.997 of Ananya's 1 ETH counts towards the formula, and she receives about 1,974.32 USDC.",
      },
      {
        type: "paragraph",
        children:
          "After her trade the pool's ETH is cheaper than elsewhere, so arbitrage traders buy it and sell it on other markets until prices match. Arbitrage keeps pools in line with the wider market, and it drives a cost for liquidity providers you will meet soon.",
      },
      {
        type: "paragraph",
        children:
          "Price impact comes from your trade size. Other people's trades can also move the pool before yours lands.",
      },
      {
        type: "heading",
        level: 3,
        children: "Use aggregators knowing what they add",
      },
      {
        type: "paragraph",
        children:
          "A flight comparison website checks many airlines at once and may suggest a route with a change of planes because it is cheaper overall.",
      },
      {
        type: "paragraph",
        children:
          "A DEX aggregator does the same for swaps. As 1inch's learning guide describes, it compares prices across many DEXs and routes your order along the best path. For a large trade, it may split the order across several pools so each piece causes less price impact, or route through a third token.",
      },
      {
        type: "paragraph",
        children:
          "The trade-offs are real. Each extra pool adds gas, slippage settings still matter, and you are trusting another set of smart contracts. The gas and token lessons in Level 4 showed that approvals outlive the moment; an aggregator is one more address that may hold a permission over your tokens, so set a limited approval and revoke it when finished.",
      },
      {
        type: "paragraph",
        children: "Now put the formula, the settings and the risks together.",
      },
      {
        type: "paragraph",
        children:
          "A pool with larger reserves can ordinarily absorb the same relative trade more easily under otherwise identical model assumptions. Version-specific concentrated liquidity can produce a different depth profile from the simple full-range model. A low headline fee does not guarantee the lowest total cost. A pool containing a token with transfer restrictions can behave unexpectedly, and an apparent large balance may be unavailable for the intended action.",
      },
      {
        type: "diagram",
        alt: "A falling constant-product curve marks pool points A, B and C, with a close-up of the two trades.",
        caption:
          "The supplied 100 ETH and 200,000 quote-unit model, before fees. It is distinct from the smaller classroom model in the preceding step.",
        src: "/lessons/crypto/level-6/lesson-1-rId37.png",
        description: [
          "The illustrative pool has x × y = 20,000,000 with x in ETH and y in quote units labelled USDC. Point A is (100, 200,000).",
          "Point B is (101, 198,019.80); point C is (110, 181,818.18), rounded. The inset contrasts the small A-to-B move with the larger A-to-C move.",
          "The schematic labels approximately 1% and 9% impact; the comparison measure must be identified when calculating impact. Fees are ignored. This 100-ETH model differs from the smaller classroom example.",
        ],
        width: 2156,
        height: 1363,
      },
    ],
  },
  {
    title: "Execution limits, ordering and security",
    shortTitle: "Execution limits ordering and security",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Impact slippage limits and transaction ordering",
      },
      {
        type: "paragraph",
        children:
          "Price impact is the effect of the trade itself interacting with the liquidity curve or book. Slippage is the difference between the expected reference or quote and actual execution. Market movement, transaction ordering and your own impact can contribute depending on how the reference is defined. Keep the definitions explicit so the same effect is not counted twice.",
      },
      {
        type: "paragraph",
        children:
          "Slippage tolerance usually sets an execution condition such as a minimum received amount. A wide tolerance can permit a worse result; a narrow one can cause failure if conditions change. It is not a guarantee against all losses, token problems or malicious transaction ordering. A transaction that fails the condition may still cost gas. Inspect the exact minimum output and route rather than assuming a percentage label is a complete protection.",
      },
      {
        type: "example",
        title: "Lukas sets a limit in Munich",
        children:
          "Lukas is quoted 1,974.32 USDC for 1 ETH (an invented figure for this example). At 0.5% tolerance, his minimum is 1,974.32 × 0.995 = 1,964.45 USDC. At 5% it would be 1,875.60 USDC, almost 100 USDC below his quote, and he would have agreed to accept it.",
      },
      {
        type: "paragraph",
        children:
          "Imagine telling a queue at a Johannesburg market that you are about to buy all the tomatoes on one stall. A fast trader overhears, buys them first, then sells them to you at a higher price.",
      },
      {
        type: "heading",
        level: 3,
        children: "Apply the security checks to the swap",
      },
      {
        type: "paragraph",
        children:
          "Verify token identity and allowances, obtain the application independently and read the transaction effect. Consider whether an approval is needed, its amount and the spender. After the action, check the receipt, received asset and remaining permission. A successful swap does not prove that the destination token is valuable or easily sellable later.",
      },
      {
        type: "paragraph",
        children:
          "For course practice, use the supplied pool reserves and paper calculations. Do not connect a funded wallet to test a new token. If an interface asks you to increase tolerance dramatically or grant unexplained permission, pause and investigate. The next lesson examines liquidity provision, which exposes a holder to a different position from simply buying through the pool.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Buying from a small fruit stand",
        children:
          "A fruit seller in South Africa has a limited supply of oranges. A request for nearly all the stock may require a higher average price than buying one bag. A pool's changing exchange ratio provides a mathematical version of size-dependent pricing, though its mechanism differs from a seller's discretion. The fictional pool initially implies 100 quote units per practice unit, but taking ten out of only 100 costs approximately 111.11 each on average before fees. The initial price cannot be applied unchanged to the whole order.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A low fee and an attractive preview do not establish token safety or a guaranteed final output.",
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
          "1. Start with 100 practice units and 10,000 quote units. Ignoring fees, calculate the quote input needed to remove five practice units.",
          "2. In that practice pool, does the initial ratio of 100 guarantee ten units at a total cost of 1,000?",
          "3. Why can a tight slippage tolerance still leave a fee cost?",
        ],
        answers: [
          "1. Remaining x is 95. New y is 1,000,000 ÷ 95 = 10,526.3158. Quote input is 526.3158; average is about 105.2632.",
          "2. No. Removing units changes reserves and the curve. Ten units require about 1,111.11 under the stated model.",
          "3. An included action can revert after consuming gas. The output condition does not make computation free.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does every DEX obey the same x times y formula?"],
        answers: [
          "No. It is one illustrative model. Designs and versions can use different mechanisms.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Execution depends on a specific contract route.",
          "Order size changes the average in the illustrated pool.",
          "Tolerance is an execution condition with limited scope.",
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
            title: "Uniswap: How Uniswap works",
            url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
          },
          {
            title: "Hayden Adams and Uniswap: A Short History of Uniswap",
            url: "https://blog.uniswap.org/uniswap-history",
          },
          {
            title: "Uniswap: What is price impact",
            url: "https://support.uniswap.org/hc/en-us/articles/40074715860365-What-is-price-impact",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "MetaMask: What is a token approval",
            url: "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
          },
          {
            title: "MetaMask: Disconnect wallet from a dapp",
            url: "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
          },
          {
            title:
              "Uniswap docs: Uniswap docs — How Uniswap works (v2 protocol overview)",
            url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works",
          },
          {
            title: "Uniswap docs: Uniswap docs — Concentrated liquidity",
            url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity",
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
  course: "crypto-defi-foundations",
  description:
    "Compare liquidity-provider proceeds with the result of simply holding the same initial assets.",
  estimatedMinutes: 7,
  learningPath: "crypto",
  level: "level-6",
  module: "defi-liquidity-lending-and-rewards",
  objectives: [
    "Compare liquidity-provider proceeds with the result of simply holding the same initial assets.",
  ],
  position: 2,
  prerequisites: ["decentralised-exchanges-pools-and-swaps"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "decentralised-exchanges-pools-and-swaps",
    "lending-borrowing-collateral-and-liquidation",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Compare liquidity-provider proceeds with the result of simply holding the same initial assets.",
  seoTitle: "Liquidity Provision and Impermanent Loss",
  slug: "liquidity-provision-and-impermanent-loss",
  sources: [
    {
      title: "Uniswap: How Uniswap works",
      url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
    },
    {
      title: "Uniswap: What is Impermanent Loss",
      url: "https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss",
    },
    {
      title: "Chainlink: Understanding Impermanent Loss in DeFi",
      url: "https://chain.link/article/impermanent-loss-defi",
    },
    {
      title:
        "Uniswap docs: Uniswap docs — How Uniswap works (v2 protocol overview)",
      url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works",
    },
    {
      title: "Uniswap docs: Uniswap docs — Concentrated liquidity",
      url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity",
    },
    {
      title: "Hayden Adams and Uniswap: A Short History of Uniswap",
      url: "https://blog.uniswap.org/uniswap-history",
    },
  ],
  status: "published",
  title: "Liquidity Provision and Impermanent Loss",
};
const sections2: LessonSection[] = [
  {
    title: "Provide liquidity and compare with holding",
    shortTitle: "Provide liquidity and compare with holding",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Compare liquidity-provider proceeds with the result of simply holding the same initial assets.",
      },
      {
        type: "paragraph",
        children:
          "Providing liquidity is not the same as holding two assets unchanged. A pool changes the provider's asset mix as relative prices move. The term impermanent loss describes a comparison with a hold-only benchmark under specified assumptions. It does not always mean a cash loss, and it does not promise that the difference will disappear.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Name the benchmark whenever you describe a liquidity-provider result.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "What a liquidity provider contributes",
      },
      {
        type: "paragraph",
        children:
          "Think of a community library in Melbourne where neighbours donate books and share the small late-return fees. The more they put in, the larger their share.",
      },
      {
        type: "paragraph",
        children:
          "A liquidity provider (LP) deposits both tokens of a pair in equal value, for example 1 ETH and 2,000 USDC at an invented price of 2,000. The contract issues LP tokens as a receipt for their share. Uniswap's documentation describes these as pro-rata shares that can be redeemed for the reserves at any time. Fees are added to the pool, so when the LP redeems, their share includes fees collected.",
      },
      {
        type: "definition",
        term: "LP token",
        children:
          "A token that records your share of a liquidity pool and lets you withdraw that share of both tokens, plus accumulated fees, when you return it.",
      },
      {
        type: "paragraph",
        children:
          "Here the library analogy breaks down. A donated book stays the same book, but every swap changes a pool's balance, so what you withdraw can differ greatly from what you put in. That change has a name.",
      },
      {
        type: "paragraph",
        children:
          "A liquidity provider deposits assets into a pool under its rules and receives an accounting interest or position representing a share of the pool. A withdrawal generally returns the asset mix the position then represents, not necessarily the original quantities. Fees, ranges and position structure depend on the version. Do not compare a displayed yield with a savings account without examining how the principal can change.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow a relative price change",
      },
      {
        type: "paragraph",
        children:
          "Use a full-range, two-asset constant-product pool, ignoring fees and costs. Initially it holds ten practice coins priced at USD 100 and 1,000 stable quote units assumed worth USD 1. Its value is USD 2,000 and product k is 10,000. If the coin's outside price rises to USD 200 and arbitrage brings the pool ratio into line, x becomes approximately 7.0711 and y approximately 1,414.2136.",
      },
      {
        type: "paragraph",
        children:
          "The pool has fewer rising coins and more quote units. At the new price, each side is worth about USD 1,414.21, giving total value USD 2,828.43. The assumptions include a stable quote value and adjustment to the outside price. Real pools may differ because of fees, ranges, other flows and market conditions. This example isolates the rebalancing effect rather than forecasting a live position.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare with holding the original assets",
      },
      {
        type: "paragraph",
        children:
          "If the original ten coins and 1,000 quote units had simply been held, their value at USD 200 per coin would be USD 3,000. The pool value is approximately USD 171.57 lower. Relative to the hold-only benchmark, that is about 5.72 percent less. This is the illustrated impermanent loss before fees and costs.",
      },
      {
        type: "paragraph",
        children:
          "Notice that the pool still gained USD 828.43 compared with the initial USD 2,000. A position can rise in cash value while underperforming the hold-only alternative. Always state the benchmark and denominator. Comparing only with the starting cash would answer a different question and could hide the opportunity cost. If the quote asset also changes value, the benchmark and pool calculation must both reflect that change.",
      },
      {
        type: "comparisonTable",
        caption: "Compare the same starting assets",
        columns: ["Measure", "Starting position", "After coin price doubles"],
        rows: [
          ["Coin price", "USD 100", "USD 200"],
          ["Hold-only coins", "10", "10"],
          ["Hold-only quote", "1,000", "1,000"],
          ["Hold-only value", "USD 2,000", "USD 3,000"],
          ["Pool coins", "10", "About 7.0711"],
          ["Pool quote", "1,000", "About 1,414.2136"],
          ["Pool value", "USD 2,000", "About USD 2,828.43"],
          [
            "Pool minus hold",
            "Record your notes and evidence here",
            "About negative USD 171.57",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Full-range constant-product illustration. Stable quote, no fees, no incentives and no costs are assumed.",
      },
      {
        type: "paragraph",
        children:
          "Imagine two friends in Rome keeping a joint box split 50/50 by value between euros and a fast-moving stock. Each time the stock rises, the rule forces them to sell some, so they end up holding less of it than if they had left it alone.",
      },
      {
        type: "example",
        title: "Kenji's pool share in Tokyo",
        children:
          "Kenji deposits 1 ETH and 2,000 USDC when ETH is 2,000 USDC (invented prices for this example), worth 4,000 USDC. Later ETH doubles to 4,000. His share now holds about 0.7071 ETH and 2,828.43 USDC, worth 5,656.85 USDC. Had he kept the tokens in his wallet, they would be worth 4,000 + 2,000 = 6,000 USDC. The gap, 343.15 USDC or about 5.7%, is his impermanent loss before fees.",
      },
      {
        type: "diagram",
        alt: "Three bars compare USD 2,000 initial assets, USD 2,828.43 pool value and USD 3,000 holding value.",
        caption:
          "The pool gains against initial cash yet trails holding by about USD 171.57, or 5.72 percent of the hold-only benchmark. No fees or costs are assumed.",
        src: "/lessons/crypto/level-6/lesson-2-rId38.png",
        description: [
          "Initial assets: USD 2,000. After the illustrated price doubles, pool value: approximately USD 2,828.43. Holding the original assets: USD 3,000.",
          "The pool gains against initial cash but trails the hold-only benchmark by about USD 171.57, or 5.72%.",
          "The comparison assumes no fees or costs.",
        ],
        width: 1451,
        height: 642,
      },
    ],
  },
  {
    title: "Fees, rewards and concentrated liquidity",
    shortTitle: "Fees rewards and concentrated liquidity",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Fees, incentives and impermanent loss",
      },
      {
        type: "paragraph",
        children:
          "Trading fees can offset some or all of the benchmark difference, but the result is not guaranteed. Incentive tokens may change price or be difficult to sell. Subtract entry and exit costs, network fees and other relevant charges. Compare the full net position with the same initial assets held under a fair benchmark.",
      },
      {
        type: "paragraph",
        children:
          "The term impermanent refers to the fact that the relative difference can change as prices change before withdrawal. It is not a promise that prices will return, that losses will recover or that the provider should wait indefinitely. Asset collapse, a stablecoin depeg or a contract exploit introduces risks beyond the isolated model. A complete result distinguishes modelled rebalancing from those additional failures.",
      },
      {
        type: "paragraph",
        children:
          "The percentage shortfall is tied to a particular benchmark and pool model. For a full-range equal-value two-asset constant-product position without fees, the relative factor can be written as 2√r ÷ (1+r), where r is the new relative price divided by the starting relative price. Subtract one for the signed difference, or subtract the factor from one for a positive shortfall percentage. At r=2, the shortfall is about 5.72% of holding.",
      },
      {
        type: "paragraph",
        children:
          "Do not describe that as a 5.72% loss of the initial cash. In the supplied doubling example, the pool gains against initial cash and still trails simply holding the starting assets. If both assets fall in the home currency, a position can also lose against initial cash. Relative underperformance and absolute loss are separate measurements.",
      },
      {
        type: "heading",
        level: 3,
        children: "Concentrated liquidity needs its own analysis",
      },
      {
        type: "paragraph",
        children:
          "In a standard pool, your liquidity is spread across every price from near zero to near infinity, and most sits where trades never happen. Uniswap's documentation gives the example of a dollar-stablecoin pair trading between US$0.99 and US$1.01, where only about 0.5% of an older-style pool's money was used.",
      },
      {
        type: "paragraph",
        children:
          "Uniswap's version 3 introduced concentrated liquidity: an LP chooses a price range, and their money only works inside it, earning more fees per dollar there. Outside the range, the position stops earning, and as the price moves through the range it gradually turns into only one of the two tokens.",
      },
      {
        type: "paragraph",
        children:
          "Think of a street vendor in Seoul who sets up only where the crowd is, and earns nothing once it moves on. Narrow ranges need watching and adjusting, each adjustment costs gas, and losses from price moves are sharper. Higher fees here come with more work and more risk.",
      },
      {
        type: "paragraph",
        children:
          "Whatever the pool design, your swap waits in public before it enters a block. Some people make a business of that wait.",
      },
      {
        type: "paragraph",
        children:
          "Within the range, the position can be more sensitive to price changes and earn fees under the version's rules. Outside the active range, it may hold predominantly or entirely one asset and stop earning trading fees until conditions or the position change. Do not apply the simple full-range percentage to every concentrated position. A displayed high APR may reflect a narrow range or a recent short period rather than a stable result. The next lesson examines lending collateral, which has a different loss mechanism: liquidation.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The café changes its stock mix",
        children:
          "A café in Italy begins with coffee beans and cash. As customers buy beans, the café has fewer beans and more cash. If beans become much more valuable, keeping the original beans might have produced a different result from selling them along the way. A pool's automatic rebalancing creates a related benchmark question. In the supplied example, USD 2,828.43 is above the initial value but below simply holding the starting mix worth USD 3,000. The difference is meaningful even though the cash-value result is positive.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Impermanent does not mean temporary by guarantee, and full-range arithmetic does not describe every concentrated position.",
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
          "1. Calculate the pool's gain against the initial USD 2,000.",
          "2. Calculate the shortfall as a percentage of the USD 3,000 benchmark.",
          "3. If net fees add USD 100, does that fully offset the illustrated shortfall?",
        ],
        answers: [
          "1. USD 2,828.43 minus USD 2,000 equals about USD 828.43.",
          "2. USD 171.57 divided by USD 3,000 is about 5.72 percent.",
          "3. No. It reduces the shortfall to about USD 71.57 before any additional costs or reward-value changes.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Can impermanent loss coexist with a positive cash-value gain?",
        ],
        answers: [
          "Yes. It measures performance relative to holding the starting assets, not automatically a loss from the initial cash amount.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Liquidity provision changes the asset mix.",
          "The benchmark must hold the same starting assets.",
          "Fees and incentives require a separate net calculation.",
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
            title: "Uniswap: How Uniswap works",
            url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
          },
          {
            title: "Uniswap: What is Impermanent Loss",
            url: "https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss",
          },
          {
            title: "Chainlink: Understanding Impermanent Loss in DeFi",
            url: "https://chain.link/article/impermanent-loss-defi",
          },
          {
            title:
              "Uniswap docs: Uniswap docs — How Uniswap works (v2 protocol overview)",
            url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works",
          },
          {
            title: "Uniswap docs: Uniswap docs — Concentrated liquidity",
            url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity",
          },
          {
            title: "Hayden Adams and Uniswap: A Short History of Uniswap",
            url: "https://blog.uniswap.org/uniswap-history",
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
  course: "crypto-defi-foundations",
  description:
    "Explain a collateralised loan and calculate a simplified health factor.",
  estimatedMinutes: 9,
  learningPath: "crypto",
  level: "level-6",
  module: "defi-liquidity-lending-and-rewards",
  objectives: [
    "Explain a collateralised loan and calculate a simplified health factor.",
  ],
  position: 3,
  prerequisites: ["liquidity-provision-and-impermanent-loss"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "liquidity-provision-and-impermanent-loss",
    "staking-yield-and-the-source-of-rewards",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain a collateralised loan and calculate a simplified health factor.",
  seoTitle: "Lending, Borrowing, Collateral and Liquidation",
  slug: "lending-borrowing-collateral-and-liquidation",
  sources: [
    {
      title: "Aave: Borrow Tokens",
      url: "https://aave.com/help/borrowing/borrow-tokens",
    },
    {
      title:
        "Stani Kulechov interview on Ethereum: Building ETHLend and naming Aave",
      url: "https://ethereum.org/videos/stani-kulechov-building-aave/",
    },
    {
      title: "Aave Labs: Aave Labs Contributions Report",
      url: "https://governance.aave.com/t/aave-labs-contributions-report/24155",
    },
    {
      title: "Aave: Health Factor and Liquidations",
      url: "https://aave.com/help/borrowing/liquidations",
    },
    {
      title: "Chainlink: What is a Blockchain Oracle",
      url: "https://chain.link/education/blockchain-oracles",
    },
    {
      title: "Aave: Aave — Aave documentation overview",
      url: "https://aave.com/docs",
    },
    {
      title: "ethereum.org: ethereum.org — Ethereum staking",
      url: "https://ethereum.org/en/staking/",
    },
  ],
  status: "published",
  title: "Lending, Borrowing, Collateral and Liquidation",
};
const sections3: LessonSection[] = [
  {
    title: "Lending, collateral and borrowing limits",
    shortTitle: "Lending collateral and borrowing limits",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain a collateralised loan and calculate a simplified health factor.",
      },
      {
        type: "paragraph",
        children:
          "A lending protocol can let a user supply assets, use eligible collateral and borrow another asset. The available borrowing limit is not a recommendation. Debt, interest and collateral prices can move against the borrower, and the protocol may liquidate under its rules. We will follow the balance sheet and calculate a simplified health factor.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Stress both sides of the balance sheet, including interest and oracle assumptions.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Supplying collateral and borrowing",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask where the interest on a crypto deposit comes from",
      },
      {
        type: "paragraph",
        children:
          "When a bank in Frankfurt pays you interest on savings, the money has a source. The bank lends your deposit to borrowers, charges them more than it pays you and keeps the difference. In many countries a deposit guarantee also protects you if the bank fails.",
      },
      {
        type: "paragraph",
        children:
          "DeFi apps also advertise returns on deposits, often called yield. Some are modest, some are startling. Every one of them is paid by someone, and the first job of this lesson is to find out who. The second is to see what can go wrong, because crypto yields carry no deposit guarantee.",
      },
      {
        type: "definition",
        term: "Yield",
        children:
          "The return you earn on crypto you deposit, lend or stake, usually shown as a yearly percentage. It is a variable estimate, not a promise.",
      },
      {
        type: "paragraph",
        children:
          "You met one source in the swap and liquidity lessons in Level 6: trading fees paid to liquidity providers. The biggest other source is lending, so start with how a DeFi lending pool works.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how a lending pool works",
      },
      {
        type: "paragraph",
        children:
          "Think of a family savings box in Jakarta. Several relatives put money in, and any relative who needs a loan borrows from the box and pays interest back into it. Nobody lends to one particular person; everyone shares the box.",
      },
      {
        type: "paragraph",
        children:
          "A DeFi lending pool works the same way, but the box is a smart contract and the relatives are strangers. Aave, which began as ETHLend in 2017, founded by Stani Kulechov, describes itself as a non-custodial protocol where users take part as suppliers or borrowers. Compound is another long-running example. Suppliers deposit a token, such as a stablecoin, into the pool and receive a token representing their deposit (Aave calls these aTokens), which grows as interest accrues. Borrowers take tokens out and pay interest in.",
      },
      {
        type: "paragraph",
        children:
          "The interest rate is not set by a manager. Aave's documentation explains that rates follow utilisation: the share of the pool's money currently borrowed. When most of the pool is lent out, rates rise to attract more suppliers and discourage borrowing. When little is borrowed, rates fall. Supplier interest therefore changes from day to day.",
      },
      {
        type: "paragraph",
        children:
          "The savings-box analogy breaks down on trust. Relatives know each other and can chase a missed payment. A DeFi pool knows nothing about its borrowers, cannot take them to court and has no credit check. So how does it stop borrowers walking away with the money?",
      },
      {
        type: "heading",
        level: 3,
        children: "Borrow against collateral over collateralisation",
      },
      {
        type: "paragraph",
        children:
          "A pawnshop in Rio de Janeiro answers the same problem. It does not know you, so it holds your gold watch worth R$1,000 and lends you perhaps R$600. If you do not repay, the shop sells the watch.",
      },
      {
        type: "paragraph",
        children:
          "DeFi lending uses the same idea, called over-collateralisation. You deposit collateral worth more than you borrow. Aave's documentation states that borrowers must pledge assets worth more than their loan, protecting the protocol from defaults. Each collateral asset has a loan-to-value (LTV) ratio: the most you can borrow against it. With a 75% LTV, US$20,000 of collateral lets you borrow up to US$15,000 (invented figures for this example).",
      },
      {
        type: "definition",
        term: "Over-collateralised loan",
        children:
          "A loan where the borrower locks up collateral worth more than the amount borrowed, so the lender can recover its money by selling the collateral if needed.",
      },
      {
        type: "paragraph",
        children:
          "Why borrow at all if you must lock up more than you get? People borrow stablecoins to spend without selling their crypto, or to borrow more crypto and bet on a price rise, which is leverage. The BIS has pointed out a system-wide risk here: when collateral prices fall, forced sales of collateral can push prices down further, triggering more sales. DeFi lending can amplify a crash rather than absorb it.",
      },
      {
        type: "paragraph",
        children:
          "A pawnshop asset can also change value. Crypto collateral can change sharply and continuously, so the pool needs a way to watch every loan continuously. That is the health factor.",
      },
      {
        type: "paragraph",
        children:
          "Supplying an asset makes it available under the protocol's pool rules and may earn variable interest. Not every supplied asset is eligible collateral, and choosing collateral status can change risk. Withdrawals depend on available pool liquidity and the account's collateral obligations. A displayed supplied balance does not necessarily mean every unit can be withdrawn immediately. Receipt or accounting tokens also depend on the protocol. A lending interface should be read as a set of connected assets and obligations rather than a high-yield deposit screen.",
      },
      {
        type: "heading",
        level: 3,
        children: "LTV and liquidation threshold are different",
      },
      {
        type: "paragraph",
        children:
          "Loan-to-value, or LTV, concerns permitted borrowing relative to collateral under defined rules. A liquidation threshold is the level used to assess liquidation eligibility. They serve different purposes and can differ by asset and configuration. Some systems combine multiple assets through weighted rules, with additional restrictions or modes.",
      },
      {
        type: "paragraph",
        children:
          "Borrowing at a permitted maximum leaves little room for price changes, interest or rule adjustments. The protocol allowing an action does not make it prudent. Read the current configuration and distinguish maximum eligibility from your own affordable risk boundary. Liquidation can involve a bonus or penalty and the sale or transfer of collateral. The exact mechanics and portion liquidated depend on the protocol and state, so do not impose one universal percentage.",
      },
    ],
  },
  {
    title: "Health factor and liquidation boundaries",
    shortTitle: "Health factor and liquidation boundaries",
    blocks: [
      {
        type: "paragraph",
        children:
          "For the supplied example, health factor equals eligible collateral value multiplied by its liquidation threshold, divided by debt value. With USD 1,000 collateral, an 80 percent threshold and USD 500 debt, the health factor is 1.6. If collateral falls to USD 600 while debt remains USD 500, it becomes 0.96.",
      },
      {
        type: "paragraph",
        children:
          "Under the stated example's rule, a result below one indicates liquidation eligibility. At exactly USD 625 collateral, the calculation gives one, which is the boundary rather than a comfortable buffer. Real protocols can use multiple assets, weighted thresholds, accrued interest and special rules. The example isolates the ratio; it is not a live borrowing instruction or a guarantee of the precise liquidation outcome.",
      },
      {
        type: "comparisonTable",
        caption: "Stress the simplified health factor",
        columns: [
          "Collateral value",
          "Threshold",
          "Debt value",
          "Health factor",
        ],
        rows: [
          ["USD 1,000", "80 percent", "USD 500", "1.60"],
          ["USD 800", "80 percent", "USD 500", "1.28"],
          ["USD 625", "80 percent", "USD 500", "1.00"],
          ["USD 600", "80 percent", "USD 500", "0.96"],
          ["USD 700", "80 percent", "USD 560", "1.00"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Single eligible collateral, one debt and unchanged threshold are assumed. Boundary and liquidation rules remain protocol specific.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a fuel gauge for your loan. Full means plenty of room; empty means trouble. In Aave, the gauge is a single number called the health factor.",
      },
      {
        type: "example",
        title: "Ana borrows in Buenos Aires",
        children:
          "Ana deposits 10 ETH as collateral when ETH is US$2,000 (an invented price for this example), so her collateral is worth US$20,000. The invented LTV is 75% and the liquidation threshold 80%. She could borrow US$15,000 but cautiously borrows US$10,000 of a stablecoin. Her health factor is 20,000 × 0.80 ÷ 10,000 = 1.6.",
      },
      {
        type: "diagram",
        alt: "A rising health-factor line crosses a horizontal boundary at 1 when collateral reaches USD 625.",
        caption:
          "With USD 500 debt and an 80 percent liquidation threshold, USD 625 collateral is the illustrated boundary. Real protocol rules and weighted inputs can differ.",
        src: "/lessons/crypto/level-6/lesson-3-rId39.png",
        description: [
          "Horizontal axis: eligible collateral value in USD. Vertical axis: simplified health factor = collateral × 0.80 ÷ USD 500 debt.",
          "Examples: USD 600 gives 0.96; USD 625 gives 1; USD 1,000 gives 1.6.",
          "The dashed boundary is 1 under the supplied rule. Real weighted inputs and liquidation rules can differ.",
        ],
        width: 1451,
        height: 655,
      },
    ],
  },
  {
    title: "Stress scenarios, liquidation and exit limits",
    shortTitle: "Stress scenarios liquidation and exit limits",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Stress debt, collateral, interest and data",
      },
      {
        type: "paragraph",
        children:
          "Collateral price can fall, debt price can rise and interest can accumulate. A stablecoin used as debt or collateral can depeg. An oracle can update late or deliver a manipulated value, affecting the protocol's assessment. Configuration changes can also alter thresholds. Several changes may occur together during stress.",
      },
      {
        type: "paragraph",
        children:
          "For example, with USD 700 collateral and USD 560 debt, an 80 percent threshold produces health factor one. Even without a collateral fall, debt interest can push the ratio lower. An external chart showing a different spot price does not necessarily determine the protocol's liquidation reference. Record which oracle and valuation rules the system uses. A safe-looking ratio based on the wrong inputs is not useful protection.",
      },
      {
        type: "heading",
        level: 3,
        children: "Liquidation and the limits of an exit",
      },
      {
        type: "paragraph",
        children:
          "Liquidation eligibility allows specified actors or mechanisms to act under the protocol rules. An attempted repayment or collateral addition may arrive too late, face congestion or fail. A stop order on another venue cannot force an on-chain lending protocol to wait. Holding extra tokens in a wallet does not help unless they are usable through a timely appropriate action.",
      },
      {
        type: "paragraph",
        children:
          "This course requires a paper worksheet and dependency explanation rather than a loan. Record collateral, debt, units, rate assumptions, threshold, oracle and stress cases. Explain what fails first and which exit action would be needed. The result should include uncertainty about fees and execution. The next lesson compares lending yield with native staking and other reward arrangements so that distinct risks are not hidden under one earn label.",
      },
      {
        type: "example",
        title: "Ana's loan is liquidated",
        children:
          "ETH falls to US$1,200 (invented). Ana's collateral is now worth US$12,000 and her health factor is 12,000 × 0.80 ÷ 10,000 = 0.96. A liquidator repays half her debt, US$5,000. In return they receive US$5,000 of her ETH plus an invented 5% bonus: US$5,250, which is 4.375 ETH. Ana now has 5.625 ETH (worth US$6,750) and US$5,000 of debt. Her health factor is back to 6,750 × 0.80 ÷ 5,000 = 1.08, but she has permanently lost US$250 of value to the bonus, and more ETH than she would have needed to sell at a fair price.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A secured loan and a changing collateral value",
        children:
          "A homeowner in Canada understands that a lender's acceptance of collateral does not make the loan free of obligations. In the fictional crypto example, the collateral is initially worth USD 1,000 and debt USD 500. A fall to USD 600 produces health factor 0.96 under the supplied threshold. The example is not a description of Canadian mortgage rules: it illustrates how a collateral ratio can deteriorate while the debt remains due. Protocol liquidation can operate much faster and under different rights.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A stop order elsewhere cannot guarantee prevention of an on-chain liquidation.",
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
          "1. Calculate health factor at USD 900 collateral and USD 600 debt with the same threshold.",
          "2. At USD 500 debt, what collateral value produces a factor of one?",
          "3. Name two changes besides a collateral fall that can reduce the factor.",
        ],
        answers: [
          "1. 900 × 0.8 ÷ 600 = 1.2.",
          "2. 500 ÷ 0.8 = USD 625. This is a boundary, not a recommended buffer.",
          "3. Debt interest, a rise in debt-asset price, a lower liquidation threshold or an adverse oracle update can reduce it.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is the maximum permitted borrowing amount a prudent borrowing recommendation?",
        ],
        answers: [
          "No. It is a protocol eligibility limit. Affordability, price movement and execution risk need separate judgment.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Debt units and collateral value must both be tracked.",
          "LTV and liquidation threshold have different roles.",
          "Health factor is useful only with correct current inputs.",
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
            title: "Aave: Borrow Tokens",
            url: "https://aave.com/help/borrowing/borrow-tokens",
          },
          {
            title:
              "Stani Kulechov interview on Ethereum: Building ETHLend and naming Aave",
            url: "https://ethereum.org/videos/stani-kulechov-building-aave/",
          },
          {
            title: "Aave Labs: Aave Labs Contributions Report",
            url: "https://governance.aave.com/t/aave-labs-contributions-report/24155",
          },
          {
            title: "Aave: Health Factor and Liquidations",
            url: "https://aave.com/help/borrowing/liquidations",
          },
          {
            title: "Chainlink: What is a Blockchain Oracle",
            url: "https://chain.link/education/blockchain-oracles",
          },
          {
            title: "Aave: Aave — Aave documentation overview",
            url: "https://aave.com/docs",
          },
          {
            title: "ethereum.org: ethereum.org — Ethereum staking",
            url: "https://ethereum.org/en/staking/",
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
  course: "crypto-defi-foundations",
  description:
    "Identify where a quoted return comes from and which risks accompany it.",
  estimatedMinutes: 12,
  learningPath: "crypto",
  level: "level-6",
  module: "defi-liquidity-lending-and-rewards",
  objectives: [
    "Identify where a quoted return comes from and which risks accompany it.",
  ],
  position: 4,
  prerequisites: ["lending-borrowing-collateral-and-liquidation"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "lending-borrowing-collateral-and-liquidation",
    "defi-dependencies-stablecoins-and-governance",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Identify where a quoted return comes from and which risks accompany it.",
  seoTitle: "Staking, Yield and the Source of Rewards",
  slug: "staking-yield-and-the-source-of-rewards",
  sources: [
    {
      title: "Ethereum: Proof of stake",
      url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Aave: Borrow Tokens",
      url: "https://aave.com/help/borrowing/borrow-tokens",
    },
    {
      title: "Ethereum: Pooled staking",
      url: "https://ethereum.org/staking/pools/",
    },
    {
      title: "Chainlink: Understanding Real Yield in DeFi",
      url: "https://chain.link/article/real-yield-defi",
    },
    {
      title: "Ethereum: Restaking",
      url: "https://ethereum.org/restaking/",
    },
    {
      title: "Aave: Aave — Aave documentation overview",
      url: "https://aave.com/docs",
    },
    {
      title: "Aave: Health Factor and Liquidations",
      url: "https://aave.com/help/borrowing/liquidations",
    },
    {
      title: "ethereum.org: ethereum.org — Ethereum staking",
      url: "https://ethereum.org/en/staking/",
    },
  ],
  status: "published",
  title: "Staking, Yield and the Source of Rewards",
};
const sections4: LessonSection[] = [
  {
    title: "Reward sources, staking and provider risks",
    shortTitle: "Reward sources staking and provider risks",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Identify where a quoted return comes from and which risks accompany it.",
      },
      {
        type: "paragraph",
        children:
          "A reward rate is incomplete until you can explain where the reward comes from and what happens to the principal. Native staking, lending, liquidity incentives and centralised earn accounts are different activities. This lesson separates them, explains APR and APY, and shows why a high displayed rate is not a complete measure of return.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Every yield figure needs a source, a denominator, a period and a risk explanation.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Name the activity that earns a reward",
      },
      {
        type: "heading",
        level: 3,
        children: "Trace where yield comes from",
      },
      {
        type: "paragraph",
        children:
          "Think of a market trader in Shanghai asking where her profit came from: customers paying for goods, a supplier's discount, or a one-off promotional voucher. Only the first is likely to last.",
      },
      {
        type: "paragraph",
        children:
          "DeFi yield has a similar set of sources. Kraken's learning guide names three main ones: lending interest paid by borrowers, trading fees paid by swappers to liquidity providers, and token rewards, often newly created tokens a protocol hands out to attract deposits. Staking rewards, covered below, are a fourth.",
      },
      {
        type: "comparisonTable",
        caption: "Where DeFi yield comes from and what can go wrong",
        columns: ["Source", "Who pays", "What it depends on", "Main risk"],
        rows: [
          [
            "Lending interest",
            "Borrowers",
            "Demand to borrow",
            "Bad debt, liquidation failures, code bugs",
          ],
          [
            "Trading fees",
            "Traders swapping in a pool",
            "Trading volume",
            "Impermanent loss, low volume",
          ],
          [
            "Token rewards (emissions)",
            "New tokens created by the protocol, ultimately buyers of those tokens",
            "The token's market price",
            "Token price falling as rewards are sold",
          ],
          [
            "Staking rewards",
            "The blockchain's protocol and transaction fees",
            "The network's rules and activity",
            "Slashing, lock-ups, intermediaries",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Token rewards deserve a closer look, because they produce the largest numbers.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask who is paying when yield looks too good",
      },
      {
        type: "paragraph",
        children:
          "A shop in Toronto offering a free C$50 voucher with every purchase can run that promotion for a while. It cannot run it forever unless the vouchers are funded by something real.",
      },
      {
        type: "paragraph",
        children:
          "Token emissions are the crypto version. A protocol creates new units of its own token and gives them to depositors. In the supply and allocation lessons in Level 5 you saw that new supply dilutes holders. Kraken notes that a very high yield can reflect how risky the underlying assets are, and rewards paid in new tokens last only while the protocol keeps creating them and buyers still want them.",
      },
      {
        type: "example",
        title: "Daniel's 40% offer",
        children:
          "Daniel in Toronto sees an invented stablecoin pool advertising 40% a year: 5% from borrowers' interest and 35% paid in the protocol's own new token. He deposits the equivalent of US$1,000. Over a year, the interest part pays about US$50. The token rewards are worth US$350 at today's token price, but many depositors sell their rewards as they arrive, and the price halves. His rewards are now worth US$175, so his real return is about 22.5%, not 40%, before any loss on his deposit.",
      },
      {
        type: "paragraph",
        children:
          'The deeper rule is this: if you cannot see where the yield comes from, you may be the yield. In a Ponzi scheme, new deposits pay earlier depositors. Centralised "earn" products can hide their sources too. In the exchange failure lesson in Level 3 you saw how Celsius, a lending platform that paid high yields, paused withdrawals in June 2022 and filed for bankruptcy in July 2022. DeFi at least lets you inspect the contracts, but inspection only helps if you check.',
      },
      {
        type: "paragraph",
        children:
          "Once you know the source, you can compare offers fairly, and that means reading the percentage correctly.",
      },
      {
        type: "paragraph",
        children:
          "Native consensus staking commits an asset to a network's validation process under its rules. A BTC earn account, for example, is not Bitcoin native proof-of-stake participation. It may involve lending, custody or another arrangement. Compare products by source, control, loss mechanism and exit conditions rather than by one advertised percentage.",
      },
      {
        type: "diagram",
        alt: "Five possible yield sources feed advertised yield; reward issuance and depositor money have warning styles.",
        caption:
          "Identify who funds each reward. Newly issued reward tokens have value only under their own market and transfer conditions.",
        src: "/lessons/crypto/level-6/lesson-4-rId40.png",
        description: [
          "Borrower interest, trader swap fees and blockchain staking rewards are shown as possible sources.",
          "Minted reward tokens have a separate dashed path because their value depends on buyers and transfer conditions.",
          "Depositors’ own money is a warning path. Identify who pays each reward; an advertised percentage does not establish its sustainability.",
        ],
        width: 1980,
        height: 1286,
      },
      {
        type: "heading",
        level: 3,
        children: "Native staking and added provider dependencies",
      },
      {
        type: "paragraph",
        children:
          "Validators may earn rewards while facing inactivity penalties, slashing for specified violations and operational requirements. Exit timing depends on network rules and demand. A pool or provider can introduce fees, contract risks, operator concentration and custody arrangements. A displayed staked quantity can have different withdrawal conditions from an ordinary liquid balance.",
      },
      {
        type: "paragraph",
        children:
          "Check how rewards are calculated and who controls withdrawal credentials or equivalent authority. A product that simplifies operation may change the user's rights and dependencies. A service fee can reduce rewards, and loss of the underlying asset's national-currency value can exceed reward income. Earning more units does not guarantee earning more purchasing power. The principal and reward asset must both be included in the result.",
      },
      {
        type: "paragraph",
        children:
          "In the Ethereum and contract lessons in Level 4 you learned that Ethereum's validators lock up ETH as a deposit to secure the network. ethereum.org describes staking as two things at once: the security mechanism of proof of stake and a way to earn rewards for honest work. Running your own validator needs 32 ETH, hardware and technical skill, but you keep full control.",
      },
      {
        type: "paragraph",
        children:
          "Rewards come with penalties. Validators that go offline lose small amounts. Slashing is harsher: for clearly dishonest behaviour, such as signing two conflicting blocks, part of the stake is destroyed and the validator is removed.",
      },
      {
        type: "definition",
        term: "Slashing",
        children:
          "A penalty that destroys part of a validator's staked deposit and removes it from the network, for actions that break the protocol's rules.",
      },
      {
        type: "paragraph",
        children:
          "Staked ETH is not instantly available either. Withdrawals are enabled, but exiting a validator means waiting in a queue that grows when many people leave at once. ethereum.org compares four routes, each trading control for convenience.",
      },
      {
        type: "comparisonTable",
        caption: "Ways to stake ETH (based on ethereum.org's comparison)",
        columns: [
          "Route",
          "Minimum",
          "Who runs the validator",
          "Extra risk you take on",
        ],
        rows: [
          ["Solo home staking", "32 ETH", "You", "Your own technical mistakes"],
          [
            "Staking as a service",
            "32 ETH",
            "An operator; you keep withdrawal control",
            "Operator errors",
          ],
          [
            "Pooled or liquid staking",
            "Small amounts",
            "Many operators via a smart contract",
            "Smart-contract and token risks",
          ],
          [
            "Centralised exchange",
            "Any amount",
            "The exchange",
            "Custody; the exchange holds your ETH",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "For most people the pooled route is the practical one, and it introduces a new kind of token.",
      },
    ],
  },
  {
    title: "APR, APY and the value of rewards",
    shortTitle: "APR APY and the value of rewards",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "APR, APY and compounding assumptions",
      },
      {
        type: "paragraph",
        children:
          "A savings account in Paris might quote one rate per year but add interest monthly. Interest added in January earns interest in February, so you end the year with slightly more than the quoted rate.",
      },
      {
        type: "paragraph",
        children:
          "DeFi apps show two kinds of figure. APR (annual percentage rate) is simple yearly interest, ignoring compounding. APY (annual percentage yield) includes the effect of reinvesting returns, as Kraken's guide explains. The same pool can look better quoted as APY.",
      },
      {
        type: "formula",
        expression: "APY = (1 + APR ÷ n)^n − 1",
        explanation:
          "n is how many times per year returns are added and reinvested. More frequent compounding gives a slightly higher APY from the same APR.",
      },
      {
        type: "example",
        title: "Fatimah compares quotes in Riyadh",
        children:
          "Fatimah sees an invented 10% APR. Compounded once a year it stays 10%. Compounded monthly, APY = (1 + 0.10 ÷ 12)^12 − 1 ≈ 10.47%. Compounded daily, (1 + 0.10 ÷ 365)^365 − 1 ≈ 10.52%. The gap is small at 10%; the bigger lesson is that DeFi rates change daily, so neither number is a promise, and compounding may cost gas each time.",
      },
      {
        type: "learningLink",
        title: "Open the Compound-Growth Illustration",
        href: "/tools/compound-growth-illustration",
        description:
          "Try the compounding worksheet: Open the calculation reference — compare a constant ten-percent APR compounded monthly with about 10.47 percent APY. Then explain the assumed reinvestment, fixed rate and omitted fees. A greater unit balance does not establish a positive currency return. Use a fictional starting amount of 1,000, zero contributions, 12 periods and approximately 0.833333 percent growth per period (10 divided by 12). Treat each period as one month. The ending amount is about 1,104.71 units, or 10.47 percent above the starting amount. This tool illustrates constant-rate arithmetic; it does not model variable DeFi rates, gas costs, token-price losses, slashing or protocol failure.",
      },
      {
        type: "paragraph",
        children:
          "Compare these annualised figures with the native staking rewards discussed in Step 2. Both the reward source and the compounding assumptions matter.",
      },
      {
        type: "paragraph",
        children:
          "APR is commonly presented as an annualised rate without the effect of compounding under stated assumptions. Starting with 1,000 units produces about 1,104.71 units under that artificial fixed-rate model. Actual rates may vary, rewards may require manual reinvestment and fees may reduce the result. If rewards are paid in a different token, its price changes and conversion costs matter. The compounding worksheet in the calculation reference demonstrates the arithmetic; it does not forecast a protocol's rate or the asset's future price.",
      },
      {
        type: "heading",
        level: 3,
        children: "Revenue, emissions and the passive-income claim",
      },
      {
        type: "paragraph",
        children:
          "Rewards can come from user fees, borrower interest, new token issuance or treasury subsidies. New emissions can increase the holder's units while diluting other holders or adding potential selling supply. A rate funded by temporary incentives may end when the budget is exhausted. Fee revenue can vary with activity and may not all accrue to the relevant position.",
      },
      {
        type: "paragraph",
        children:
          "Ask whether the quoted rate is gross or net, historical or forward-looking, and measured in token units or national currency. The phrase real yield should still be traced to its source and beneficiary. A project can earn revenue while a particular token has no entitlement to it. A credible explanation names the payer, mechanism, costs and risks rather than relying on the attractiveness of the number.",
      },
      {
        type: "paragraph",
        children:
          "Adverts often promise passive income: money that arrives while you sleep. The phrase is misleading in DeFi for three reasons.",
      },
      {
        type: "paragraph",
        children:
          "First, the returns are not fixed. Rates move with borrowing demand, trading volume and token prices, and they can fall to almost nothing. Second, the risks are active. Liquidations, depegs, slashing and contract bugs can strike overnight, so a position needs regular checking, which is work. Third, the phrase hides the question of who pays. A return that really is passive and also high is a classic sign of a scheme paying old depositors with new money.",
      },
      {
        type: "paragraph",
        children:
          'A fairer description is "a variable return for taking specific risks". When you see a yield, write down its source, the risks in each layer and what you would do if the rate dropped or the token lost its peg.',
      },
      {
        type: "paragraph",
        children: "Now test yourself on the numbers and the questions.",
      },
    ],
  },
  {
    title: "Receipt tokens, liquid staking and restaking",
    shortTitle: "Receipt tokens liquid staking and restaking",
    blocks: [
      {
        type: "paragraph",
        children:
          "Liquid-staking arrangements can issue a receipt or representation associated with staked assets. The token may trade away from the underlying redemption value because of liquidity, fees, exit delays or confidence. Using it in another protocol adds that protocol's collateral, oracle and liquidation risks. A liquid label does not make every exit immediate at par.",
      },
      {
        type: "paragraph",
        children:
          "Restaking can expose stake or its representation to additional validation or security services under extra rules. That can introduce additional penalty, operator and contract dependencies. We examine the wider security path at Level 10. At this stage, draw the chain from underlying stake to provider to receipt token to any further application. More layers can generate more advertised rewards while also creating more ways the principal or access can fail.",
      },
      {
        type: "heading",
        level: 3,
        children: "Use liquid staking tokens and know their risks",
      },
      {
        type: "paragraph",
        children:
          "Think of a coat-check ticket in Milan. Your coat stays in the cloakroom, but you hold a ticket you could hand to someone else.",
      },
      {
        type: "paragraph",
        children:
          "Liquid staking works like that. Lido, a well-known example, takes ETH from many users, stakes it through professional node operators and issues a token, stETH, representing each user's share. Lido's documentation says the token stays freely transferable, so holders can use it in other DeFi apps while earning rewards, and that Lido takes a 10% fee on staking rewards, split between node operators and the treasury of Lido's governing community (the DeFi dependency lesson in Level 6 explains how such communities govern).",
      },
      {
        type: "definition",
        term: "Liquid staking token",
        children:
          "A token you receive when you stake through a pooled service, representing your staked coins plus rewards, which you can hold, sell or use elsewhere.",
      },
      {
        type: "paragraph",
        children:
          "Lido's own public risk disclosure lists the risks: smart-contract bugs, slashing that in severe cases can exceed rewards, governance changes, node-operator failures, withdrawal queues, and the token trading below the value of the ETH behind it during market stress. Concentration matters too: if one service controls a large share of all staked ETH, a failure there affects the whole network.",
      },
      {
        type: "example",
        title: "Emma needs cash in Sydney",
        children:
          "Emma stakes 10 ETH through an invented liquid staking service and holds 10 staking tokens. The service's rewards are an invented 3% before its 10% fee, so she earns about 2.7% a year. During a market panic she needs money fast. The withdrawal queue is long, and on DEXs her tokens trade at 0.95 ETH each (invented). Selling now returns 9.5 ETH; waiting means bearing the market until her turn comes.",
      },
      {
        type: "paragraph",
        children:
          "Liquid staking stacks one layer of risk on another. Restaking adds a third.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look briefly at restaking and its extra risks",
      },
      {
        type: "paragraph",
        children:
          "ethereum.org describes restaking as using ETH that is already staked to secure additional services, in return for extra rewards. EigenLayer pioneered the idea in 2023. Restakers commit their stake to outside services, and those services can slash it if their rules are broken. Liquid restaking tokens then represent those positions, the same way stETH represents a staked position.",
      },
      {
        type: "paragraph",
        children:
          "Picture lending your house keys to a neighbour, who also lends them to a building manager, who also uses them for a second building. Each step pays you a little more, and each adds someone whose mistake could cost you. ethereum.org lists the risks: extra slashing, chain reactions where a failure in one service spreads to others, centralisation among a few operators, and longer withdrawal delays. For a beginner, it is enough to recognise restaking as yield built on top of yield, with risks stacked the same way.",
      },
      {
        type: "paragraph",
        children:
          "These added dependencies reinforce the caution about passive income in Step 4: more reward streams can also mean more ways to lose value or access.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Interest paid in shop vouchers",
        children:
          "A shop in the UK offers a loyalty benefit paid in vouchers. Receiving more vouchers does not ensure that the goods you can buy become more valuable, and the shop may change the programme. Crypto rewards paid in a separate token require similar care about redemption and price. If a learner gains 10 percent more token units but their GBP price falls 30 percent, the resulting value factor is 1.10 × 0.70 = 0.77, a 23 percent decline before costs. Unit growth and purchasing-power growth differ.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not treat receipt tokens, restaking or earn accounts as equivalent to risk-free cash.",
      },
      {
        type: "learningLink",
        title: "Open the Compound-Growth Illustration",
        href: "/tools/compound-growth-illustration",
        description:
          "Use the worksheet: Compounding worksheet — Illustrate assumed compounding and compare APR with APY. A fixed rate model does not capture token price changes, variable rewards, withdrawals, losses or protocol failure.",
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
          "1. Calculate approximate ending units on 1,000 at fixed 10 percent APR with monthly compounding.",
          "2. What happens to value with 10 percent more units and a 30 percent price fall?",
          "3. Name three facts missing from a claim of 20 percent yield.",
        ],
        answers: [
          "1. Approximately 1,104.71 units before fees under the stated constant-rate assumptions.",
          "2. Value becomes 77 percent of the starting amount, a 23 percent decline before costs.",
          "3. Reward source, principal risk, reward asset, fees, compounding basis, variability and exit terms are relevant missing facts.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is a high APY a guarantee of a positive national-currency return?",
        ],
        answers: [
          "No. Rates, asset prices, fees, access and principal risks can change the result.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Name the economic activity behind the reward.",
          "APR and APY require stated assumptions.",
          "Count principal value and exit terms as well as reward units.",
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
            title: "Ethereum: Proof of stake",
            url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "Aave: Borrow Tokens",
            url: "https://aave.com/help/borrowing/borrow-tokens",
          },
          {
            title: "Ethereum: Pooled staking",
            url: "https://ethereum.org/staking/pools/",
          },
          {
            title: "Chainlink: Understanding Real Yield in DeFi",
            url: "https://chain.link/article/real-yield-defi",
          },
          {
            title: "Ethereum: Restaking",
            url: "https://ethereum.org/restaking/",
          },
          {
            title: "Aave: Aave — Aave documentation overview",
            url: "https://aave.com/docs",
          },
          {
            title: "Aave: Health Factor and Liquidations",
            url: "https://aave.com/help/borrowing/liquidations",
          },
          {
            title: "ethereum.org: ethereum.org — Ethereum staking",
            url: "https://ethereum.org/en/staking/",
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
  course: "crypto-defi-foundations",
  description:
    "Describe a protocol's linked failure points before interpreting its return.",
  estimatedMinutes: 16,
  learningPath: "crypto",
  level: "level-6",
  module: "defi-liquidity-lending-and-rewards",
  objectives: [
    "Describe a protocol's linked failure points before interpreting its return.",
  ],
  position: 5,
  prerequisites: ["staking-yield-and-the-source-of-rewards"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["staking-yield-and-the-source-of-rewards"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Describe a protocol's linked failure points before interpreting its return.",
  seoTitle: "DeFi Dependencies, Stablecoins and Governance",
  slug: "defi-dependencies-stablecoins-and-governance",
  sources: [
    {
      title: "Ethereum: Introduction to blockchain bridges",
      url: "https://ethereum.org/bridges/",
    },
    {
      title: "Circle: USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
    },
    {
      title: "Aave: Health Factor and Liquidations",
      url: "https://aave.com/help/borrowing/liquidations",
    },
    {
      title: "Chainlink: What is a Blockchain Oracle",
      url: "https://chain.link/education/blockchain-oracles",
    },
    {
      title: "Ethereum: Decentralised Autonomous Organisations",
      url: "https://ethereum.org/dao/",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "Circle: USDC Risk Factors",
      url: "https://www.circle.com/legal/usdc-risk-factors",
    },
    {
      title: "DeFiLlama: DeFiLlama — Hacks database",
      url: "https://defillama.com/hacks",
    },
    {
      title: "ethereum.org: ethereum.org — Upgrading smart contracts",
      url: "https://ethereum.org/en/developers/docs/smart-contracts/upgrading/",
    },
    {
      title:
        "ethereum.org: ethereum.org — Decentralised autonomous organisations (DAOs)",
      url: "https://ethereum.org/en/dao/",
    },
  ],
  status: "published",
  title: "DeFi Dependencies, Stablecoins and Governance",
};
const sections5: LessonSection[] = [
  {
    title: "Map dependencies, oracles and stablecoins",
    shortTitle: "Map dependencies oracles and stablecoins",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Describe a protocol's linked failure points before interpreting its return.",
      },
      {
        type: "paragraph",
        children:
          "DeFi applications can compose several familiar components into one unfamiliar risk path. A lending position might depend on a stablecoin, bridge, oracle and upgrade authority at the same time. This lesson makes those dependencies visible and shows why several applications are not necessarily independent sources of safety.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Inspect the path that must keep working for the position to retain value and exit.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Draw the whole dependency stack",
      },
      {
        type: "paragraph",
        children:
          "Think about a flat on the tenth floor of a building in Istanbul. Your door lock might be excellent, but you also depend on the foundations, the lifts, the wiring and the people who manage the building. A failure on any floor below can reach you.",
      },
      {
        type: "paragraph",
        children:
          "Using a DeFi app is similar. You depend on the blockchain it runs on, the smart contracts, the price data those contracts read, any stablecoins involved, the website you use to reach it, the people who govern it, and finally your own wallet and habits. Failures have happened at many of these layers, some costing hundreds of millions of US dollars.",
      },
      {
        type: "paragraph",
        children:
          "We will trace the data, assets, code and people in this stack, connecting each layer to the others.",
      },
      {
        type: "paragraph",
        children:
          "A keeper may submit actions such as liquidations or updates; its availability and incentives can matter under the design.",
      },
      {
        type: "diagram",
        alt: "Seven stacked dependency layers sit beneath a deposit, crossed by a failure path.",
        caption:
          "Dependencies can fail together. A diagram is an inventory of questions, rather than a safety rating.",
        src: "/lessons/crypto/level-6/lesson-5-rId41.png",
        description: [
          "From the bottom upward: blockchain outages or reorganisations; smart-contract bugs, upgrades or admin keys; oracle manipulation; stablecoin depegging; front-end or DNS hijacking; governance and treasury attacks; and the user’s approvals, signatures and settings.",
          "A red path illustrates failure reaching the deposit through the stack. Layers can fail together; the diagram is an inventory for questions, not a safety score.",
        ],
        width: 1980,
        height: 1318,
      },
      {
        type: "heading",
        level: 3,
        children: "Oracles, depegs and a rush to exit",
      },
      {
        type: "paragraph",
        children:
          "A stale oracle can assess collateral differently from the current market. Manipulation can make a price feed or thin pool misleading. A stablecoin depeg can reduce collateral value or increase the cost of repaying debt measured in another asset. An exit route may also lack liquidity precisely when many users want to leave.",
      },
      {
        type: "paragraph",
        children:
          "Apply a combined stress case. If collateral value falls while debt interest grows and network congestion delays a repayment, the health factor can deteriorate faster than a single-price example suggests. A reassuring wallet balance does not show whether the protocol can be exited. Record which value the protocol uses, which value a market can execute and what action would be needed. These can diverge under stress.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how oracles can be manipulated",
      },
      {
        type: "paragraph",
        children:
          "An oracle supplies information that a contract uses, such as a collateral price. A thin pool can be moved by relatively little trading, so using its momentary price as the only borrowing reference can let an attacker overstate collateral value.",
      },
      {
        type: "example",
        title: "A manipulated reference",
        children:
          "An invented lending app accepts a token that trades in one small pool. An attacker pushes that pool's quote up, borrows against the inflated valuation, and leaves the pool exposed when the price returns. A price visible on-chain can be genuine as a transaction record while still being unsuitable as a reliable valuation input.",
      },
      {
        type: "paragraph",
        children:
          "Inspect source diversity, liquidity, update timing, averaging, deviation limits and fallback behaviour. Multiple reporters do not provide independent evidence if they all read the same fragile source.",
      },
      {
        type: "heading",
        level: 3,
        children: "Remember stablecoin and run risk inside DeFi",
      },
      {
        type: "paragraph",
        children:
          "Much of DeFi is priced in stablecoins. Lending pools lend them, liquidity pools pair them, and yields are quoted in them. If a stablecoin loses its peg, every position built on it is hit at once. In the stablecoin and transfer lessons in Level 3 you studied how the algorithmic stablecoin UST lost its US dollar peg in May 2022, and LUNA collapsed; that collapse spread through every DeFi app that relied on it.",
      },
      {
        type: "paragraph",
        children:
          "Run risk is the second problem. A lending pool lends out most of its deposits. If many suppliers try to withdraw together, the money may not be there until borrowers repay or are liquidated, much like a bank run. The BIS has warned that DeFi has few of the shock absorbers banks have, and that forced liquidations can deepen a fall.",
      },
      {
        type: "paragraph",
        children:
          "Think of a busy restaurant in Cape Town where everyone tries to leave by one door when the fire alarm sounds. The exit was fine for normal traffic, not for everyone at once. Ask how a protocol behaves in a rush, not only on a calm day.",
      },
      {
        type: "paragraph",
        children:
          "These data and asset risks belong alongside the code and governance checks in the next two steps.",
      },
    ],
  },
  {
    title: "Contract interactions, bugs and flash loans",
    shortTitle: "Contract interactions bugs and flash loans",
    blocks: [
      {
        type: "paragraph",
        children:
          "Composability means applications can interact and reuse assets or functions. This can enable useful services, but it also transmits failures. A receipt token used as collateral connects the lender to the original pool's accounting and exit rules. A contract that assumes another token transfers normally may fail with a restrictive or unusual implementation.",
      },
      {
        type: "paragraph",
        children:
          "An economic exploit can use permitted actions in a way that undermines incentives or valuations. The code might execute as written while the design's assumptions fail. Short-lived borrowed liquidity, transaction ordering and concentrated voting power can matter depending on the mechanism. Beginners need not reproduce an exploit. They should recognise that code correctness and economic robustness are separate questions, both of which require review.",
      },
      {
        type: "comparisonTable",
        caption: "A fictional protocol dependency review",
        columns: ["Dependency", "Observed evidence", "Stress question"],
        rows: [
          ["Collateral", "Bridged Token A", "What if bridge redemption fails"],
          ["Debt", "Stable Token B", "What if repayment price changes"],
          ["Oracle", "Feed C with update rules", "What if data becomes stale"],
          ["Contract", "Version 2", "Does the report cover this version"],
          [
            "Administrator",
            "Three of five signers",
            "Can they upgrade or pause exit",
          ],
          [
            "Liquidity",
            "Pool and withdrawal conditions",
            "Can the intended size leave during stress",
          ],
          [
            "Network",
            "Execution and fee rules",
            "Can needed transactions be included in time",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Understand smart contract bugs",
      },
      {
        type: "paragraph",
        children:
          "A smart-contract bug can allow an unintended action, such as withdrawing too much collateral or bypassing a required check. Economic weaknesses can also produce loss when code runs as designed. Keep those mechanisms separate when reading an incident report.",
      },
      {
        type: "paragraph",
        children:
          "An upgrade deserves fresh review because new code or changed parameters can introduce a failure absent from the older version. A past audit applies to its actual scope and version, not to every later change.",
      },
      {
        type: "example",
        title: "An omitted collateral check",
        children:
          "In a fictional lending app, a new function lets an account reduce recorded collateral without checking the debt it still owes. An attacker combines permitted actions to leave the pool with bad debt. The learning question is which invariant failed and whether the deployed upgrade was reviewed. It does not require recreating an exploit or using real funds.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know what a flash loan is and how attackers use it",
      },
      {
        type: "paragraph",
        children:
          "Imagine a bank in New York lending you US$100 million for one second, on one condition: if the money is not back by the end of that second, the loan never happened. It sounds impossible in ordinary finance. In DeFi it exists.",
      },
      {
        type: "paragraph",
        children:
          "A flash loan is a loan with no collateral that must be borrowed and repaid within a single blockchain transaction. If repayment fails, the whole transaction is undone, so the lender takes no credit risk. Honest uses include arbitrage between DEXs and refinancing loans.",
      },
      {
        type: "definition",
        term: "Flash loan",
        children:
          "An uncollateralised loan that is borrowed, used and repaid inside one transaction; if it is not repaid, the transaction is cancelled as if it never happened.",
      },
      {
        type: "paragraph",
        children:
          "The danger is that a flash loan gives anyone huge temporary buying power. An attacker can borrow millions, push a thin market or a vote, exploit a flaw while the effect lasts, repay the loan and keep the profit, all in seconds. The Euler attacker used flash-loaned funds, and you will see an even bolder case in the governance section. A flash loan is a tool, not a bug; the bug is any design that trusts something a flash loan can move.",
      },
      {
        type: "paragraph",
        children:
          "Bugs and manipulation come from outside. The next risk comes from the people who built the protocol.",
      },
    ],
  },
  {
    title: "Administrators, governance and risk checklist",
    shortTitle: "Administrators governance and risk checklist",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Front ends, administrators and governance capture",
      },
      {
        type: "heading",
        level: 3,
        children: "Check who holds the admin keys",
      },
      {
        type: "paragraph",
        children:
          "In the Ethereum and contract lessons in Level 4 you learned that smart contracts usually cannot be changed once deployed unless their builders designed a way. Many protocols do build one. ethereum.org explains the common proxy pattern: users talk to a contract that stays at the same address, while the logic behind it can be swapped for a new version.",
      },
      {
        type: "paragraph",
        children:
          "Upgrades let teams fix bugs. They also mean someone holds the power to change the rules. An admin key is the key, or set of keys, allowed to upgrade a contract, change settings or pause it. In the token research lesson in Level 5 you saw how an upgrade can become a rug pull. ethereum.org lists the risks plainly: whoever controls upgrades must be trusted, and developers could change contracts without users' consent.",
      },
      {
        type: "example",
        title: "Reading the controls before depositing",
        children:
          "Pedro in Porto Alegre compares two invented lending protocols. In the first, one developer's address can upgrade the contracts instantly. In the second, upgrades need five of nine named signers and then wait 48 hours in a public queue before taking effect. He notes that the second gives depositors time to see a change coming and withdraw.",
      },
      {
        type: "paragraph",
        children:
          "Those two safeguards have names. A multisig requires several keys to approve an action, so one stolen or rogue key is not enough. A timelock delays approved changes, giving users time to leave. Neither is perfect: the multisig signers may all work for one company, and a timelock does not help someone who never checks. The bridge lesson in Level 4 showed why the authority that verifies transfers is itself a dependency to inspect.",
      },
      {
        type: "paragraph",
        children:
          "Even with sound contracts and careful admins, you can still be attacked through the website you use to reach them.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch the front end and apply your approvals lesson",
      },
      {
        type: "paragraph",
        children:
          "The front end is the website or application through which a user reaches the contracts. It can be compromised even when the underlying contracts have not changed. An attacker may insert an additional approval or prepare a transaction with different effects.",
      },
      {
        type: "example",
        title: "A familiar website asks for more",
        children:
          "Valeria in Guadalajara opens an app she has used before. It suddenly asks for unlimited spending of a stablecoin unrelated to her intended swap. She rejects the request and verifies the incident through independent project channels. A familiar address bar does not make an unexpected authorisation safe.",
      },
      {
        type: "paragraph",
        children:
          "This is why contract review and signing review belong together. A hardware signer can help display what it is asked to authorise, but cannot decide whether the contract or instruction is suitable. Review the asset, spender, amount and action each time.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet governance tokens and DAOs",
      },
      {
        type: "paragraph",
        children:
          "Many DeFi protocols are run, at least on paper, by their users. ethereum.org describes a DAO (decentralised autonomous organisation) as a collectively owned organisation whose rules and treasury are managed by smart contracts. You met The DAO's story in the Ethereum and contract lessons in Level 4; today the word covers thousands of groups.",
      },
      {
        type: "paragraph",
        children:
          "In token-based DAOs, holding the governance token gives voting power, usually one token, one vote. Anyone can write a proposal, such as changing a fee or spending treasury funds, and holders vote. Because tokens trade on exchanges, anyone can buy influence. Many holders delegate their votes to active community members, a little like electing a representative. The DAO's treasury is held by contracts that pay out only when a vote passes.",
      },
      {
        type: "definition",
        term: "Governance token",
        children:
          "A token that gives its holders voting power over a protocol's rules, settings or treasury.",
      },
      {
        type: "paragraph",
        children:
          "Think of a housing co-operative in Berlin where each share carries one vote. It sounds democratic, until one investor buys half the shares. Level 10 looks at how protocols decide on upgrades, from improvement proposals to on-chain votes. Here, the practical question is who actually holds the votes.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask who really holds the votes",
      },
      {
        type: "paragraph",
        children:
          'The BIS has called this the "decentralisation illusion". Every DeFi protocol needs some central decision-making, and governance tokens are often concentrated: many projects allocate a large part of their tokens to insiders, as you saw in the supply and allocation lessons in Level 5. Turnout can also be low, which makes a large holder even more powerful.',
      },
      {
        type: "formula",
        expression: "Share of the decision = your votes ÷ total votes cast",
        explanation:
          "what counts is your share of the votes actually cast, not of all tokens. Low turnout makes each vote cast count for more.",
      },
      {
        type: "example",
        title: "Low turnout in an invented DAO",
        children:
          "An invented protocol has 100 million governance tokens, but only 8% vote on a proposal, so 8 million votes are cast. One early investor holds 4.1 million tokens, about 4% of all tokens but 4.1 ÷ 8 = 51% of the votes cast. That single holder decides the outcome.",
      },
      {
        type: "paragraph",
        children:
          "Treasuries make this matter. A DAO treasury may hold large sums, and a vote can move them. The Mango Markets attacker later used governance tokens obtained in the attack to vote on a proposal returning part of the funds on their own terms. Governance can be bought, borrowed or captured, and the next case shows how fast.",
      },
      {
        type: "heading",
        level: 3,
        children: "Learn from a governance attack",
      },
      {
        type: "paragraph",
        children:
          "Governance can become vulnerable when temporary voting power is enough to execute a valuable change. Borrowed tokens, low turnout, weak proposal checks or concentrated delegates can alter the outcome.",
      },
      {
        type: "example",
        title: "Borrowed membership cards",
        children:
          "A fictional club lets anyone holding membership cards vote to transfer its treasury. Someone borrows many cards for an afternoon, passes the transfer and returns the cards. The cards were counted correctly, but the decision system failed to distinguish temporary control from the intended governance process.",
      },
      {
        type: "paragraph",
        children:
          "Protocols can use snapshots, borrowing-resistant voting rules, timelocks, quorum requirements and execution reviews. Each has a scope and trade-off. A delay is useful notice only if users can discover the change and make a feasible response. Examine the actual governance pipeline rather than treating the label DAO as protection.",
      },
      {
        type: "paragraph",
        children:
          "A timelock may provide notice but does not guarantee a liquid exit. An upgrade can invalidate assumptions used in an earlier report, so review dates and versions are important. Audit reports, public code, long operating history and insurance claims each have a scope. Insurance may involve a separate provider, exclusions, discretionary claims or limited funds. A past absence of loss cannot prove future safety.",
      },
      {
        type: "heading",
        level: 3,
        children: "TVL, incident history and stop conditions",
      },
      {
        type: "paragraph",
        children:
          "Your protocol worksheet should cover identity, versions, assets, permissions, data, authority, liquidity, fees and exit. Add unresolved questions and explicit reasons to stop, such as unsupported token identity, unclear redemption or an unexplained administrator power. A stop condition should be observable; the project feels risky is less useful than the deployed address does not match current documentation.",
      },
      {
        type: "paragraph",
        children:
          "Use paper practice and published information. You do not need a live deposit to demonstrate understanding. A sound conclusion can decline further action while identifying evidence that would permit further research. The next level introduces analysis tools, which should be used to describe observed information rather than conceal these underlying dependencies behind a price chart.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check protocol data and incident histories",
      },
      {
        type: "paragraph",
        children:
          "Public dashboards can help organise research. A TVL figure estimates the value counted under a stated method; it does not certify safe custody or count independent capital perfectly. A recorded-incident database can suggest questions about code, keys, oracles and governance. Verify a specific incident against primary disclosures before repeating its cause or loss amount, and record the date and coverage of any numerical total.",
      },
      {
        type: "definition",
        term: "Total value locked (TVL)",
        children:
          "The combined market value of the crypto deposited in a DeFi protocol's smart contracts at a given moment.",
      },
      {
        type: "paragraph",
        children:
          "Read TVL carefully. It rises and falls with token prices, not only with deposits. The same money can be counted twice when a token from one protocol is deposited in another. And a large TVL tells you people have deposited, not that the code is safe; Euler and Beanstalk both held large sums. Use incident histories to ask whether a protocol, or code it copied, has failed before, and how the team responded.",
      },
      {
        type: "example",
        title: "Ji-woo's two-minute check in Busan",
        children:
          "Ji-woo finds an invented lending app offering high stablecoin yields. On DeFiLlama she sees its TVL tripled in a month, mostly in its own reward token. The hacks list shows a fork of the same code was exploited last year. She decides the yield is not worth the unknowns.",
      },
      {
        type: "paragraph",
        children:
          "Put all of this together in one list you can use every time.",
      },
      {
        type: "heading",
        level: 3,
        children: "Use a DeFi risk checklist",
      },
      {
        type: "comparisonTable",
        caption: "A pre-use DeFi risk checklist",
        columns: ["Layer", "Question to ask", "Where to look"],
        rows: [
          [
            "Purpose",
            "Do I understand what this does and where its yield comes from?",
            "Docs; Lesson C6.4",
          ],
          [
            "Contract",
            "Is the code verified, audited, and has it changed since the audit?",
            "Docs, explorer, audit reports",
          ],
          [
            "Control",
            "Who can upgrade or pause it? Is there a multisig and a timelock?",
            "Docs, governance forum",
          ],
          [
            "Oracle",
            "Where do prices come from? Can a thin market move them?",
            "Docs",
          ],
          [
            "Stablecoins",
            "Which stablecoins are involved, and what backs them?",
            "Lesson C3.4",
          ],
          [
            "History",
            "Has it, or code it copied, been exploited?",
            "DeFiLlama hacks, rekt.news",
          ],
          [
            "Governance",
            "Who holds the votes, and how fast can a vote move funds?",
            "Governance pages, token holders",
          ],
          [
            "Exit",
            "Can I withdraw quickly in a rush?",
            "Pool utilisation, withdrawal rules",
          ],
          [
            "You",
            "Correct site from a bookmark? Limited approval? Separate wallet? Amount I can lose entirely?",
            "Your wallet; Lesson C2.4",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "No checklist makes a protocol safe. It tells you which risks you are choosing to accept, and whether you can afford the worst case. Choosing not to use an app is always a valid result.",
      },
      {
        type: "paragraph",
        children: "Now try the checklist on some scenarios.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Three shops using one supplier",
        children:
          "Three cafés in Italy appear to diversify where a family buys breakfast. All three rely on the same bakery. If the bakery closes, all three can lose their main product together. Three DeFi positions can likewise depend on one stablecoin issuer or bridge. A learner comparing EUR-valued holdings should count both the application names and their shared suppliers of value, data and settlement. Different front ends do not necessarily mean independent exposure.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Several protocol names can conceal one concentrated underlying failure risk.",
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
          "1. Name three shared dependencies that can connect apparently different applications.",
          "2. Write one observable stop condition for protocol research.",
          "3. Does a long incident-free history prove a new upgrade is safe?",
        ],
        answers: [
          "1. A stablecoin issuer, bridge, oracle, chain, custodian or common administrator can connect them.",
          "2. The verified contract cannot be established, redemption terms are missing, or the current upgrade is outside the available security review.",
          "3. No. The upgrade may introduce new code or powers. Historical operation is evidence within a period, not certification of a changed implementation.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Can a DeFi protocol follow its code while suffering an economic failure?",
        ],
        answers: [
          "Yes. Incentives, valuations, liquidity or dependencies can fail even when execution matches the programmed rules.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Map components and shared dependencies.",
          "Stress price, access and execution together.",
          "Use explicit stop conditions rather than a universal safety score.",
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
            title: "Ethereum: Introduction to blockchain bridges",
            url: "https://ethereum.org/bridges/",
          },
          {
            title: "Circle: USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
          },
          {
            title: "Aave: Health Factor and Liquidations",
            url: "https://aave.com/help/borrowing/liquidations",
          },
          {
            title: "Chainlink: What is a Blockchain Oracle",
            url: "https://chain.link/education/blockchain-oracles",
          },
          {
            title: "Ethereum: Decentralised Autonomous Organisations",
            url: "https://ethereum.org/dao/",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "Circle: USDC Risk Factors",
            url: "https://www.circle.com/legal/usdc-risk-factors",
          },
          {
            title: "DeFiLlama: DeFiLlama — Hacks database",
            url: "https://defillama.com/hacks",
          },
          {
            title: "ethereum.org: ethereum.org — Upgrading smart contracts",
            url: "https://ethereum.org/en/developers/docs/smart-contracts/upgrading/",
          },
          {
            title:
              "ethereum.org: ethereum.org — Decentralised autonomous organisations (DAOs)",
            url: "https://ethereum.org/en/dao/",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel6Lessons: LessonDocument[] = [
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
