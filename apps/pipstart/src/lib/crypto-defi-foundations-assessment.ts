import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoDefiQuizV1: AssessmentDefinition = {
  id: "crypto-defi-foundations-quiz",
  version: 1,
  title: "DeFi Liquidity Lending and Rewards quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-defi-foundations",
  moduleId: "defi-liquidity-lending-and-rewards",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
      "https://blog.uniswap.org/uniswap-history",
      "https://support.uniswap.org/hc/en-us/articles/40074715860365-What-is-price-impact",
      "https://ethereum.org/security/",
      "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
      "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
      "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works",
      "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity",
      "https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss",
      "https://chain.link/article/impermanent-loss-defi",
      "https://aave.com/help/borrowing/borrow-tokens",
      "https://ethereum.org/videos/stani-kulechov-building-aave/",
      "https://governance.aave.com/t/aave-labs-contributions-report/24155",
      "https://aave.com/help/borrowing/liquidations",
      "https://chain.link/education/blockchain-oracles",
      "https://aave.com/docs",
      "https://ethereum.org/en/staking/",
      "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://ethereum.org/staking/pools/",
      "https://chain.link/article/real-yield-defi",
      "https://ethereum.org/restaking/",
      "https://ethereum.org/bridges/",
      "https://www.circle.com/legal/usdc-terms",
      "https://ethereum.org/dao/",
      "https://www.circle.com/legal/usdc-risk-factors",
      "https://defillama.com/hacks",
      "https://ethereum.org/en/developers/docs/smart-contracts/upgrading/",
      "https://ethereum.org/en/dao/",
    ],
  },
  questions: [
    {
      id: "crypto-defi-foundations-1",
      prompt:
        "An invented pool holds 200 ETH and 400,000 USDC. Ignoring fees, how much USDC would Ravi in Chennai receive for selling 10 ETH into it?",
      explanation:
        "Correct choice  B. 19,047.62 USDC\n\nk = 200 × 400,000 = 80,000,000; after the swap the pool holds 210 ETH, so USDC = 80,000,000 ÷ 210 = 380,952.38, and Ravi receives 400,000 − 380,952.38 = 19,047.62. Option A uses the starting price of 2,000 and ignores the price impact of his own trade.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "20,000.00 USDC",
        },
        {
          id: "b",
          label: "19,047.62 USDC",
        },
        {
          id: "c",
          label: "19,000.00 USDC",
        },
        {
          id: "d",
          label: "18,181.82 USDC",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-defi-foundations-2",
      prompt:
        "For a successful exact-input swap with no extra token-transfer charge, a route quotes 2,500 USDC and applies a 0.5-percent minimum-output tolerance. What minimum accepted output does that rule set?",
      explanation:
        "Correct choice  C. 2,487.50 USDC\n\nThe supplied minimum is 2,500 × 0.995 = 2,487.50 USDC. Falling below the checked minimum can make the transaction revert; it does not guarantee that a transaction will succeed or be included.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "2,375.00 USDC",
        },
        {
          id: "b",
          label: "2,497.50 USDC",
        },
        {
          id: "c",
          label: "2,487.50 USDC",
        },
        {
          id: "d",
          label: "2,512.50 USDC",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-defi-foundations-3",
      prompt:
        "Which statement correctly separates price impact from slippage on a DEX?",
      explanation:
        "Correct choice  A. Price impact comes from the order's own effect on the pool; slippage is a difference from the expected execution that can arise as conditions or timing change.\n\nSeparate the modeled impact already in the quote from a later worse fill. Other transactions, liquidity changes and stale quotes can matter. A larger tolerance permits a greater departure; it does not reduce impact or ensure success.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Price impact comes from the order's own effect on the pool; slippage is a difference from the expected execution that can arise as conditions or timing change.",
        },
        {
          id: "b",
          label:
            "Price impact is caused by other traders, while slippage comes only from the size of your own trade.",
        },
        {
          id: "c",
          label:
            "They are the same thing, and a higher slippage tolerance reduces both of them.",
        },
        {
          id: "d",
          label:
            "Price impact happens only on centralised exchanges, and slippage only on DEXs.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-defi-foundations-4",
      prompt:
        "In a full-range equal-value two-asset constant-product model without fees, Kenji provides ETH and a stable quote asset. Which statement correctly compares his pool share with holding the starting assets?",
      explanation:
        "Correct choice  C. Whether ETH halves or doubles, his share trails holding by about the same 5.7%, because the size of the move matters, not its direction.\n\nThe relative factor 2√r divided by (1+r) gives the same roughly 5.72-percent shortfall for r equal to two or one-half. It is a hold-benchmark comparison. Under the unchanged ideal model, returning to the original relative price removes that rebalancing difference; the economic shortfall is already meaningful before withdrawal.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "It happens only when ETH's price falls; if ETH rises, providing liquidity always beats holding.",
        },
        {
          id: "b",
          label:
            "It is a charge the pool makes when you return your LP tokens early.",
        },
        {
          id: "c",
          label:
            "Whether ETH halves or doubles, his share trails holding by about the same 5.7%, because the size of the move matters, not its direction.",
        },
        {
          id: "d",
          label:
            "It becomes permanent as soon as the price moves, even if the price later returns.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-defi-foundations-5",
      prompt:
        "Takeshi in Kobe deposits collateral worth US$12,000 with a liquidation threshold of 80% and borrows US$6,000 of a stablecoin (invented figures). What is his health factor, and at what collateral value does it reach 1?",
      explanation:
        "Correct choice  A. 1.6; US$7,500\n\nHealth factor = 12,000 × 0.80 ÷ 6,000 = 1.6, and it reaches 1 when collateral × 0.80 = 6,000, so at US$7,500, a fall of 37.5%. Option B leaves out the liquidation threshold and divides collateral by debt.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "1.6; US$7,500",
        },
        {
          id: "b",
          label: "2.0; US$6,000",
        },
        {
          id: "c",
          label: "1.6; US$6,000",
        },
        {
          id: "d",
          label: "1.25; US$9,600",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-defi-foundations-6",
      prompt:
        "A pool quotes 12% APR, compounded monthly (an invented rate). Using APY = (1 + APR ÷ n)^n − 1, what is the APY?",
      explanation:
        "Correct choice  B. About 12.68%\n\n(1 + 0.12 ÷ 12)^12 − 1 = 1.01^12 − 1 ≈ 12.68%. Option A is the APR itself, which ignores compounding, and either figure can change daily because DeFi rates are variable.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "12.00%",
        },
        {
          id: "b",
          label: "About 12.68%",
        },
        {
          id: "c",
          label: "About 13.50%",
        },
        {
          id: "d",
          label: "About 1.00%",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-defi-foundations-7",
      prompt:
        "A stablecoin pool advertises 30% a year: 4% from borrowers' interest and 26% paid in the protocol's own newly created token (invented figures). Which question matters most before depositing?",
      explanation:
        "Correct choice  C. Who ultimately pays the 26%: it is only worth what buyers will pay for the token, and its price can fall as depositors sell their rewards\n\nIdentify who funds each component and how the reward token is valued and sold. Compounding cannot supply that answer or protect purchasing power. Variable rates, reward-token price, principal risk, costs and exit conditions belong in the same assessment.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Whether the 30% is quoted as APR or APY, since compounding explains most of the gap with ordinary savings",
        },
        {
          id: "b",
          label:
            "Whether the stablecoin's issuer has promised to pay the 26% if the token falls",
        },
        {
          id: "c",
          label:
            "Who ultimately pays the 26%: it is only worth what buyers will pay for the token, and its price can fall as depositors sell their rewards",
        },
        {
          id: "d",
          label:
            "Whether the borrowers' 4% will rise to 30% once the pool is full",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-defi-foundations-8",
      prompt:
        "Which statement about liquid staking tokens such as Lido's stETH is accurate?",
      explanation:
        "Correct choice  A. They represent staked ETH plus rewards and can be transferred, but they add smart-contract risk and can trade below the value of the ETH behind them during market stress.\n\nLiquid staking adds a layer of risk on top of staking, including contract bugs, withdrawal queues and the token trading at a discount. Option B is wrong because Lido's own risk disclosure says slashing can, in severe cases, exceed rewards.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "They represent staked ETH plus rewards and can be transferred, but they add smart-contract risk and can trade below the value of the ETH behind them during market stress.",
        },
        {
          id: "b",
          label:
            "They remove slashing risk, because professional node operators run the validators.",
        },
        {
          id: "c",
          label:
            "They can always be redeemed instantly for exactly 1 ETH each.",
        },
        {
          id: "d",
          label:
            "They need a minimum of 32 ETH, the same as solo home staking.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-defi-foundations-9",
      prompt:
        "Pedro in Porto Alegre compares invented lending protocols. Which control setup gives depositors the best chance to see a harmful upgrade coming and withdraw?",
      explanation:
        "Correct choice  B. Upgrades need five of nine named signers, then wait 48 hours in a public queue.\n\nAmong the stated controls, requiring several signers and publishing a delay provides more notice than an immediate single-key change. It does not guarantee detection, an available withdrawal or that emergency powers cannot bypass the delay. Review the complete execution path.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "One developer's address can upgrade the contracts instantly.",
        },
        {
          id: "b",
          label:
            "Upgrades need five of nine named signers, then wait 48 hours in a public queue.",
        },
        {
          id: "c",
          label:
            "Upgrades need two of three keys, all held by the founder, and take effect at once.",
        },
        {
          id: "d",
          label:
            "The code was audited once, so the team says no upgrade controls are needed.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-defi-foundations-10",
      prompt:
        "Valeria in Guadalajara visits a DEX she uses every week. Before a swap, the site suddenly asks her to approve unlimited spending of every stablecoin in her wallet. The address bar looks correct. What should she do?",
      explanation:
        "Correct choice  C. Reject it, close the page, check the project's official channels and review her existing approvals.\n\nA new, unlimited approval request on a familiar site fits the BadgerDAO front-end hijack, where the real web address still showed. Option B is tempting, but an attacker can move tokens as soon as an approval is granted.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Approve it, because a correct address bar proves the site is genuine.",
        },
        {
          id: "b",
          label:
            "Approve it, then revoke the approvals as soon as her swap is complete.",
        },
        {
          id: "c",
          label:
            "Reject it, close the page, check the project's official channels and review her existing approvals.",
        },
        {
          id: "d",
          label:
            "Approve it from a different browser, which keeps the approval separate.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-defi-foundations-11",
      prompt:
        "An invented DAO has 200 million tokens and one vote per token. Quorum is met and only a simple majority of the 12 million votes cast is required. One investor casts 6.3 million yes votes. What share of votes cast does that investor control?",
      explanation:
        "Correct choice  A. 52.5%\n\nThe vote share is 6.3 divided by 12 = 52.5 percent. Under the expressly supplied quorum and majority rules, that is a majority of votes cast. Other DAOs can have additional thresholds, delegation, abstention treatment and execution powers.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "52.5%",
        },
        {
          id: "b",
          label: "About 3.2%",
        },
        {
          id: "c",
          label: "About 6.3%",
        },
        {
          id: "d",
          label: "About 48%",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-defi-foundations-12",
      prompt:
        "The pool is worth USD 2,828.43 while holding the starting assets would be USD 3,000. Which comparison defines the illustrated impermanent loss?",
      explanation:
        "Correct choice  B. The shortfall against the hold-only benchmark\n\nA. Only the native fee asset spent. Fees are an additional cost, not the rebalancing comparison.\n\nB. The shortfall against the hold-only benchmark. The denominator and starting assets must match.\n\nC. Only the gain over the initial USD 2,000. That answers a different cash-value question.\n\nD. The number of transactions in the pool. Activity does not define this benchmark difference.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only the native fee asset spent",
        },
        {
          id: "b",
          label: "The shortfall against the hold-only benchmark",
        },
        {
          id: "c",
          label: "Only the gain over the initial USD 2,000",
        },
        {
          id: "d",
          label: "The number of transactions in the pool",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-defi-foundations-13",
      prompt:
        "With USD 1,000 collateral, an 80 percent threshold and USD 500 debt, what is health factor?",
      explanation:
        "Correct choice  D. 1.6\n\nA. 2.0. This ignores the liquidation threshold.\n\nB. 0.8. That is the threshold alone.\n\nC. 0.625. That reverses the intended ratio.\n\nD. 1.6. 1,000 × 0.8 divided by 500 gives 1.6.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "2.0",
        },
        {
          id: "b",
          label: "0.8",
        },
        {
          id: "c",
          label: "0.625",
        },
        {
          id: "d",
          label: "1.6",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-defi-foundations-14",
      prompt:
        "A holding gains ten percent more units while unit price falls 30 percent. What happens to value before costs?",
      explanation:
        "Correct choice  C. It falls 23 percent\n\nA. It falls 20 percent exactly. Adding the percentages misses the multiplicative relationship.\n\nB. It remains unchanged. Neither input supports a constant value.\n\nC. It falls 23 percent. 1.10 × 0.70 equals 0.77 of starting value.\n\nD. It rises ten percent. That ignores the price change.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It falls 20 percent exactly",
        },
        {
          id: "b",
          label: "It remains unchanged",
        },
        {
          id: "c",
          label: "It falls 23 percent",
        },
        {
          id: "d",
          label: "It rises ten percent",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-defi-foundations-15",
      prompt: "Which is an observable reason to pause protocol research?",
      explanation:
        "Correct choice  A. The current contract identity cannot be verified\n\nA. The current contract identity cannot be verified. A specific missing fact can prevent informed assessment.\n\nB. The website uses several colours. Appearance alone is not the decisive evidence.\n\nC. An influencer dislikes the logo. Opinion does not establish contract or rights.\n\nD. The token count is a large number. Quantity alone does not determine safety.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The current contract identity cannot be verified",
        },
        {
          id: "b",
          label: "The website uses several colours",
        },
        {
          id: "c",
          label: "An influencer dislikes the logo",
        },
        {
          id: "d",
          label: "The token count is a large number",
        },
      ],
      correctChoiceIds: ["a"],
    },
  ],
};
