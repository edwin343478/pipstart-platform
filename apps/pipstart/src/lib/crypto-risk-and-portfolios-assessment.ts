import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoRiskPortfoliosQuizV1: AssessmentDefinition = {
  id: "crypto-risk-and-portfolios-quiz",
  version: 1,
  title: "Sizing Leverage and Portfolio Risk quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-risk-and-portfolios",
  moduleId: "sizing-leverage-and-portfolio-risk",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
      "https://www.fca.org.uk/consumers/cryptoassets",
      "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
      "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
      "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.fca.org.uk/news/press-releases/fca-bans-sale-crypto-derivatives-retail-consumers",
      "https://www.esma.europa.eu/sites/default/files/library/esma71-98-128_press_release_product_intervention.pdf",
      "https://www.cftc.gov/PressRoom/PressReleases/8139-20",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://www.circle.com/legal/usdc-risk-factors",
      "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
      "https://www.circle.com/legal/usdc-terms",
      "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
      "https://www.irs.gov/filing/digital-assets",
      "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
      "https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging",
      "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf",
      "https://investor.vanguard.com/investor-resources-education/news/lump-sum-investing-versus-cost-averaging-which-is-better",
    ],
  },
  questions: [
    {
      id: "crypto-risk-and-portfolios-1",
      prompt:
        'Lerato in Cape Town has R4,000 of savings and no emergency fund. Her rent is paid from her salary each month. A friend urges her to start buying crypto this week "before it\'s too late". Following this level, what should she do first?',
      explanation:
        "Correct choice  B. Build an emergency fund first, and only later set a loss budget from spare money beyond it.\n\nThe emergency fund comes first, and any crypto comes later from money she could lose entirely, sized by a written loss budget. C is tempting, but DCA changes when money goes in, not whether it is money she can afford to lose.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Put half the R4,000 into bitcoin, since it is the largest coin.",
        },
        {
          id: "b",
          label:
            "Build an emergency fund first, and only later set a loss budget from spare money beyond it.",
        },
        {
          id: "c",
          label: "Use DCA with the full R4,000 so that timing does not matter.",
        },
        {
          id: "d",
          label:
            "Buy a small amount with leverage so that the money she risks stays low.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-risk-and-portfolios-2",
      prompt:
        "Marco in Naples will risk at most US$30 on one idea. He plans to buy an invented coin at US$10 and exit if it falls to US$9 (invented prices, ignore fees). Using the position-size formula, how large can the position be?",
      explanation:
        "Correct choice  A. US$300, or 30 coins\n\nThe distance to exit is 1 ÷ 10 = 10%, so the position is 30 ÷ 0.10 = US$300, which is 30 coins at US$10. B confuses the loss budget with the position size; the budget is what he could lose at the exit, not what he buys.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$300, or 30 coins",
        },
        {
          id: "b",
          label: "US$30, or 3 coins",
        },
        {
          id: "c",
          label: "US$270, or 27 coins",
        },
        {
          id: "d",
          label: "US$3,000, or 300 coins",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-risk-and-portfolios-3",
      prompt:
        "With the same loss budget, Ji-woo moves her planned exit further away from her entry because the coin is more volatile. What must happen to her position size?",
      explanation:
        "Correct choice  D. It must get smaller.\n\nPosition size = amount at risk ÷ distance to exit, so a wider distance with the same budget gives a smaller position. C is tempting, but keeping the size while widening the exit would increase the loss if the exit is reached.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It doubles, because volatility doubles the possible gain.",
        },
        {
          id: "b",
          label: "It must get larger, because the exit is safer.",
        },
        {
          id: "c",
          label: "It stays the same, because the budget has not changed.",
        },
        {
          id: "d",
          label: "It must get smaller.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-4",
      prompt:
        "Kemal holds five different altcoins and one stablecoin, all on the same exchange, and says he is well diversified. Which description of his position is most accurate?",
      explanation:
        "Correct choice  B. His coins may move together like one bet, and one exchange failure could freeze everything at once.\n\nMany crypto assets have tended to fall together in sell-offs, and holding everything on one platform concentrates exchange risk. A is tempting, but different names do not mean independent risks; in 2022 the whole market shrank by roughly 70%.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "He is diversified, because five different coins cannot all fall together.",
        },
        {
          id: "b",
          label:
            "His coins may move together like one bet, and one exchange failure could freeze everything at once.",
        },
        {
          id: "c",
          label:
            "He has no exchange risk, because the coins are on a blockchain.",
        },
        {
          id: "d",
          label: "His only real risk is the stablecoin losing its peg.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-risk-and-portfolios-5",
      prompt:
        "A crypto portfolio falls 60% from its high. Using gain needed = L ÷ (1 − L), what gain would bring it back to where it started?",
      explanation:
        "Correct choice  C. 150%\n\n0.60 ÷ 0.40 = 1.5, a 150% gain. A is the tempting wrong answer: after a fall, the remaining amount is smaller, so the same percentage gain does not get you back.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "60%",
        },
        {
          id: "b",
          label: "100%",
        },
        {
          id: "c",
          label: "150%",
        },
        {
          id: "d",
          label: "40%",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-risk-and-portfolios-6",
      prompt: "What is the maintenance margin on a leveraged position?",
      explanation:
        "Correct choice  D. The required equity support for keeping a position open; breaching the applicable boundary can trigger liquidation under the venue rules.\n\nInitial margin and maintenance requirements are different. Product rules determine the reference price, threshold, reduction process and deficit treatment. Reaching a boundary does not promise an instantaneous fill at that price.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The profit you must make before you can withdraw.",
        },
        {
          id: "b",
          label: "The amount you must post to open the position.",
        },
        {
          id: "c",
          label: "The fee the exchange charges each time funding is paid.",
        },
        {
          id: "d",
          label:
            "The required equity support for keeping a position open; breaching the applicable boundary can trigger liquidation under the venue rules.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-7",
      prompt:
        "Tomás holds a 10× leveraged long for several weeks. The price has not moved, yet the liquidation price shown by his exchange has crept closer to the current price. What is the most likely reason?",
      explanation:
        "Correct choice  D. Trading fees and funding payments have been taken from his margin, shrinking his cushion.\n\nCosts come out of margin, so the adverse move needed to reach maintenance margin gets smaller over time. B is tempting if you have watched liquidation prices change, but the change follows from the arithmetic of margin minus costs, not from sentiment.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The exchange changed his leverage to 20× without telling him.",
        },
        {
          id: "b",
          label: "Liquidation prices move randomly with market sentiment.",
        },
        {
          id: "c",
          label: "His maintenance margin has been paid back to him.",
        },
        {
          id: "d",
          label:
            "Trading fees and funding payments have been taken from his margin, shrinking his cushion.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-8",
      prompt:
        "Aditi has USD 5,000 in a derivatives account. Which statement correctly describes a possible cross-margin arrangement?",
      explanation:
        "Correct choice  A. Eligible shared balances can support a position, but losses can affect those balances and other positions using them.\n\nRead asset eligibility, collateral haircuts, automatic settings and deficit rules. Shared support can provide a larger cushion than a smaller isolated allocation while increasing dependencies. It is not a universal promise that every account asset is usable or that losses end at one displayed amount.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Eligible shared balances can support a position, but losses can affect those balances and other positions using them.",
        },
        {
          id: "b",
          label: "Under isolated margin, her whole balance backs the position.",
        },
        {
          id: "c",
          label: "Cross margin removes liquidation risk completely.",
        },
        {
          id: "d",
          label:
            "Isolated margin moves the liquidation price further from entry than cross margin.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-risk-and-portfolios-9",
      prompt:
        "Pedro in Curitiba buys an invented coin three times: R$300 at R$30, R$300 at R$20 and R$300 at R$60 (no fees). What is his average cost per unit?",
      explanation:
        "Correct choice  D. R$30.00\n\nHe buys 10 + 15 + 5 = 30 units for R$900, so his average cost is 900 ÷ 30 = R$30. A is the simple average of the three prices, which is higher because DCA buys more units when the price is low.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "R$36.67",
        },
        {
          id: "b",
          label: "R$25.00",
        },
        {
          id: "c",
          label: "R$20.00",
        },
        {
          id: "d",
          label: "R$30.00",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-10",
      prompt:
        "Faisal wrote an exit plan before buying a token. Which line is an example of a thesis-invalidation exit?",
      explanation:
        "Correct choice  B. If independently verified project abandonment invalidates my thesis, I follow the documented exit procedure and record execution limits.\n\nA thesis-invalidation rule names evidence that challenges the original reason for holding. The decision to attempt an exit and the ability to execute it at a particular price are separate. Profit-taking answers a different question.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: '"If the price reaches SAR 200, I sell 10 units."',
        },
        {
          id: "b",
          label:
            "If independently verified project abandonment invalidates my thesis, I follow the documented exit procedure and record execution limits.",
        },
        {
          id: "c",
          label: '"Every six months I review the plan."',
        },
        {
          id: "d",
          label: '"If I need money for a family emergency, I sell first."',
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-risk-and-portfolios-11",
      prompt:
        "Olivia moves 0.5 ETH from an exchange to her own hardware wallet, paying the network fee in ETH. What should she record?",
      explanation:
        "Correct choice  D. The date and time, both addresses, the transaction ID, the amounts sent and received, and the fee with its value in her home currency.\n\nA full record shows it was her own transfer, and some authorities, such as the ATO, treat a fee paid from your crypto as a disposal. C is dangerous: records should never contain seed phrases or private keys.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only the amount received, because the fee was small.",
        },
        {
          id: "b",
          label:
            "Nothing, because moving coins between her own wallets is never relevant for tax anywhere.",
        },
        {
          id: "c",
          label: "Her seed phrase, so the record proves she owns the wallet.",
        },
        {
          id: "d",
          label:
            "The date and time, both addresses, the transaction ID, the amounts sent and received, and the fee with its value in her home currency.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-12",
      prompt:
        "The 3.8-unit position exits at GBP 43 instead of 45. What is price loss before costs?",
      explanation:
        "Correct choice  D. GBP 26.60\n\nA. GBP 19. That assumes the original planned exit.\n\nB. GBP 20 exactly. The budget cannot force the actual fill.\n\nC. GBP 7. That is per-unit distance, not total loss.\n\nD. GBP 26.60. 3.8 × (50 − 43) equals 26.60.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "GBP 19",
        },
        {
          id: "b",
          label: "GBP 20 exactly",
        },
        {
          id: "c",
          label: "GBP 7",
        },
        {
          id: "d",
          label: "GBP 26.60",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-13",
      prompt: "What is a key cross-margin dependency?",
      explanation:
        "Correct choice  B. Eligible shared balances can support several positions\n\nA. Entry divided by leverage gives every liquidation exactly. Maintenance and other rules invalidate that shortcut.\n\nB. Eligible shared balances can support several positions. Losses can transmit across the shared account arrangement.\n\nC. Every position is completely isolated. That describes a different allocation model.\n\nD. Collateral prices never matter. Valuation and haircuts can affect margin.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Entry divided by leverage gives every liquidation exactly",
        },
        {
          id: "b",
          label: "Eligible shared balances can support several positions",
        },
        {
          id: "c",
          label: "Every position is completely isolated",
        },
        {
          id: "d",
          label: "Collateral prices never matter",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-risk-and-portfolios-14",
      prompt:
        "Five tokens are held at one exchange. Which concentration clearly remains?",
      explanation:
        "Correct choice  D. Custodian and withdrawal dependence\n\nA. No common risk. The provider is a shared dependency.\n\nB. Only denomination risk. Operational access is also concentrated.\n\nC. Guaranteed negative correlation. Holding location does not establish statistical relationships.\n\nD. Custodian and withdrawal dependence. Different asset names do not distribute provider access.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "No common risk",
        },
        {
          id: "b",
          label: "Only denomination risk",
        },
        {
          id: "c",
          label: "Guaranteed negative correlation",
        },
        {
          id: "d",
          label: "Custodian and withdrawal dependence",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-risk-and-portfolios-15",
      prompt: "Which entry must be separated from market performance?",
      explanation:
        "Correct choice  C. A new deposit from the owner\n\nA. A trading fee. It is a relevant performance cost.\n\nB. A realised sale result. It is part of the trading-result ledger under stated accounting.\n\nC. A new deposit from the owner. External cash flow can raise equity without a trading gain.\n\nD. A price change in an existing holding. That is relevant to valuation performance.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A trading fee",
        },
        {
          id: "b",
          label: "A realised sale result",
        },
        {
          id: "c",
          label: "A new deposit from the owner",
        },
        {
          id: "d",
          label: "A price change in an existing holding",
        },
      ],
      correctChoiceIds: ["c"],
    },
  ],
};
