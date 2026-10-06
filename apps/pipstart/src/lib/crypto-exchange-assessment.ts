import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoExchangeQuizV1: AssessmentDefinition = {
  id: "crypto-exchange-markets-quiz",
  version: 1,
  title: "Exchanges Stablecoins and Market Orders quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-exchanges-and-markets",
  moduleId: "exchanges-stablecoins-and-orders",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
      "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
      "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
      "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
      "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
      "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
      "https://www.fca.org.uk/consumers/cryptoassets",
      "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
      "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
      "https://www.sec.gov/newsroom/press-releases/2023-32",
      "https://www.bis.org/publ/arpdf/ar2025e3.htm",
      "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
      "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
      "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-143-transitional-measures",
      "https://www.fsca.co.za/News%20Documents/FSCA%20Press%20Release_Declaration%20of%20Crypto%20Assets%20As%20A%20Financial%20Product_20%20October%202022.pdf",
      "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
      "https://www.circle.com/legal/usdc-terms",
      "https://www.circle.com/legal/usdc-risk-factors",
      "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
      "https://www.kraken.com/gb/proof-of-reserves",
      "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
      "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
      "https://www.mtgox.com",
      "https://www.justice.gov/archives/opa/pr/samuel-bankman-fried-sentenced-25-years-his-orchestration-multiple-fraudulent-schemes",
      "https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-reaches-settlement-crypto-platform-celsius-network-charges-former-executives-duping-consumers",
      "https://www.osc.gov.on.ca/quadrigacxreport/",
    ],
  },
  questions: [
    {
      id: "crypto-exchange-markets-1",
      prompt:
        "An invented ETH/USDT order book shows asks of 0.3 ETH at 2,000 and 0.7 ETH at 2,010, and a best bid of 1,990. Wei in Shanghai places a market buy for 1 ETH. What are his average price and his slippage against the best ask?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "2,005 USDT; 0.25%",
        },
        {
          id: "b",
          label: "2,010 USDT; 0.50%",
        },
        {
          id: "c",
          label: "2,007 USDT; about 0.35%",
        },
        {
          id: "d",
          label: "2,007 USDT; about 0.85%",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. 2,007 USDT; about 0.35%\n\nHe pays 0.3 × 2,000 + 0.7 × 2,010 = 600 + 1,407 = 2,007 USDT for 1 ETH, and (2,007 − 2,000) ÷ 2,000 × 100% = 0.35%. Option A averages the two price levels equally, ignoring that more of the order filled at 2,010.",
    },
    {
      id: "crypto-exchange-markets-2",
      prompt:
        "Lukas in Munich is selling USDT on a P2P marketplace. A bank transfer arrives from a name different from the buyer's verified name, and the buyer asks him to release the crypto quickly. What should he do?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Release it, because the platform's escrow protects both the crypto and the bank payment.",
        },
        {
          id: "b",
          label:
            "Release it, then move the conversation to a private chat so the buyer can explain.",
        },
        {
          id: "c",
          label:
            "Release half now and the rest once the buyer explains the different name.",
        },
        {
          id: "d",
          label:
            "Do not release crypto; use the verified platform dispute procedure to investigate the mismatch and follow its cancellation rules.",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Do not release crypto; use the verified platform dispute procedure to investigate the mismatch and follow its cancellation rules.\n\nA name mismatch is a payment and compliance warning, not proof that the crypto side of escrow protects the bank transfer. Verify the issue through the platform's actual process rather than accepting a screenshot or pressure from the buyer.",
    },
    {
      id: "crypto-exchange-markets-3",
      prompt:
        "Sophie in Lyon finds a crypto app advertised on social media. Its terms name a company in another EU country. Which check is the right one?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Open ESMA's interim MiCA register from ESMA's own website, search the exact legal name from the terms, then search her national regulator's warning list.",
        },
        {
          id: "b",
          label:
            'Click the "Licensed in the EU" badge in the advert and check the licence page it opens.',
        },
        {
          id: "c",
          label:
            "Check that the app looks professional and has many five-star reviews in the app store.",
        },
        {
          id: "d",
          label:
            "Call the support number at the top of her search results and ask if the firm is regulated.",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. Open ESMA's interim MiCA register from ESMA's own website, search the exact legal name from the terms, then search her national regulator's warning list.\n\nRegisters should be reached from the regulator's own website and searched by the firm's exact legal name, and warning lists show firms operating without permission. Option B is tempting, but a link in an advert can lead to a page copied by a clone firm.",
    },
    {
      id: "crypto-exchange-markets-4",
      prompt:
        "Faisal in Riyadh withdraws crypto from an exchange to his own hardware wallet. The exchange asks whether the address is his own wallet or belongs to another provider. What is happening?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "It is a phishing attempt, and he should cancel the withdrawal and close his account.",
        },
        {
          id: "b",
          label:
            "The exchange needs his recovery words to confirm that the wallet is really his.",
        },
        {
          id: "c",
          label:
            "It may be a compliance question linked to identity and locally implemented transfer-information rules; verify the official request and answer accurately.",
        },
        {
          id: "d",
          label:
            "It means his withdrawal has been frozen on suspicion of money laundering.",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. It may be a compliance question linked to identity and locally implemented transfer-information rules; verify the official request and answer accurately.\n\nFATF standards inform national implementation, which varies by jurisdiction, transaction and provider. An official compliance question should be distinguished from a request for signing secrets. Recovery words are not needed to answer an ownership question.",
    },
    {
      id: "crypto-exchange-markets-5",
      prompt:
        'Giulia in Turin wants €2,000 of BTC sent to her own wallet (all fees invented). Provider A advertises "zero trading fees" but charges 2.5% for card deposits, has a 1% spread and a withdrawal fee worth €10. Provider B has a free bank deposit, a 0.4% trading fee, a 0.5% spread and a withdrawal fee worth €15. Which is cheaper in total? For this classroom comparison, apply each percentage once to the same EUR 2,000 base; none is already included in another listed item.',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Provider A, costing €30 against B's €33",
        },
        {
          id: "b",
          label: "Provider B, costing €33 (1.65%) against A's €80 (4%)",
        },
        {
          id: "c",
          label: "Provider A, because it charges no trading fee at all",
        },
        {
          id: "d",
          label: "Neither; they cost about €50 each",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. Provider B, costing €33 (1.65%) against A's €80 (4%)\n\nFor this classroom comparison, apply every listed percentage once to the same EUR 2,000 base and assume it is not already embedded elsewhere in the quote. A costs 50 + 20 + 10 = EUR 80; B costs 8 + 10 + 15 = EUR 33. Actual quotes must be reconciled without counting an included spread or fill cost twice.",
    },
    {
      id: "crypto-exchange-markets-6",
      prompt:
        "An exchange publishes a proof of reserves showing a 104% reserve ratio for BTC on 30 June (invented figures). What does this report show?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "That the exchange is solvent and has no other debts",
        },
        {
          id: "b",
          label: "That customers' BTC is insured against hacks and failure",
        },
        {
          id: "c",
          label:
            "That the exchange will keep at least 104% of customer BTC at all times after 30 June",
        },
        {
          id: "d",
          label:
            "That on 30 June the exchange controlled slightly more BTC than the customer BTC balances included in the check",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. That on 30 June the exchange controlled slightly more BTC than the customer BTC balances included in the check\n\nProof of reserves is a snapshot of certain assets at one moment. It does not show other debts, whether assets were borrowed for the snapshot, or anything after the date, so option A is the misreading the SEC warned against.",
    },
    {
      id: "crypto-exchange-markets-7",
      prompt:
        "Tom in Leeds gets an email saying a new withdrawal address on his exchange account will be usable in 48 hours. He did not add it. What should he do?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Log in through the official app or a web address he types himself, remove the address, change his password, check 2FA and logged-in devices, and contact official support.",
        },
        {
          id: "b",
          label:
            "Click the link in the email straight away to cancel the new address before the 48 hours pass.",
        },
        {
          id: "c",
          label:
            "Do nothing, because the 48-hour wait on new addresses means no crypto can be taken.",
        },
        {
          id: "d",
          label:
            "Reply to the email with his current 2FA code to prove to support that the account is his.",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. Log in through the official app or a web address he types himself, remove the address, change his password, check 2FA and logged-in devices, and contact official support.\n\nAn address he did not add suggests someone has access to his account, and the waiting period gives him time to act. Option B is risky because the email itself could be phishing, so he should reach the account only through the official app or a typed address.",
    },
    {
      id: "crypto-exchange-markets-8",
      prompt:
        "How did Terra's UST claim it would hold its US dollar peg before it collapsed in May 2022?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "By holding one US dollar in a bank for every token issued",
        },
        {
          id: "b",
          label: "By locking ether worth 150% of the tokens issued",
        },
        {
          id: "c",
          label: "Through deposit insurance provided by the US government",
        },
        {
          id: "d",
          label:
            "Through automated rules letting UST be exchanged for Terra's other token, LUNA",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Through automated rules letting UST be exchanged for Terra's other token, LUNA\n\nUST was an algorithmic stablecoin: as holders swapped UST for LUNA, new LUNA flooded the market and confidence in the swap promise collapsed. Option A describes a fiat-backed stablecoin, not UST's design.",
    },
    {
      id: "crypto-exchange-markets-9",
      prompt:
        "Pierre in Marseille locks crypto worth US$3,000 to mint 2,000 crypto-backed stablecoins (invented amounts). What is his collateral ratio after his collateral falls in value by 20%?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "130%",
        },
        {
          id: "b",
          label: "120%",
        },
        {
          id: "c",
          label: "150%",
        },
        {
          id: "d",
          label: "100%",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. 120%\n\nAfter a 20% fall the collateral is worth US$2,400, and 2,400 ÷ 2,000 × 100% = 120%. Option A subtracts 20 percentage points from the starting 150%, but the fall is 20% of the collateral's value.",
    },
    {
      id: "crypto-exchange-markets-10",
      prompt:
        'Noah in Vancouver buys crypto by card and tries to withdraw it an hour later. The exchange says withdrawals are on hold, and a forum post lists a "support hotline". What is the most likely explanation, and the best action?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Card payments can be reversed, so exchanges often hold withdrawals after card purchases; he should read the provider's help pages or use in-app support and ignore the forum number.",
        },
        {
          id: "b",
          label:
            "The hold shows the exchange is failing, so he should ring the forum hotline straight away.",
        },
        {
          id: "c",
          label:
            "The hold means his card was stolen, so he should give the hotline his password to unlock it.",
        },
        {
          id: "d",
          label:
            "Holds apply only to small amounts, so he should try withdrawing a larger amount instead.",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        'Correct choice  A. Card payments can be reversed, so exchanges often hold withdrawals after card purchases; he should read the provider\'s help pages or use in-app support and ignore the forum number.\n\nProviders wait before letting crypto leave after a reversible payment; Kraken, for example, describes 72-hour holds after card purchases. Option B is wrong because a routine hold is not a sign of failure, and forum "support" numbers are a common scam.',
    },
    {
      id: "crypto-exchange-markets-11",
      prompt:
        "Camila in Recife held 3 ETH on a failed exchange when ETH was US$1,600, and her claim is fixed in US dollars at that date (invented prices). At payout, ETH is US$4,000. If she is repaid in full, what does she receive, and how much ETH could it buy?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "US$12,000, enough for 3 ETH",
        },
        {
          id: "b",
          label: "US$4,800, enough for 3 ETH",
        },
        {
          id: "c",
          label: "US$4,800, enough for 1.2 ETH",
        },
        {
          id: "d",
          label: "US$1,600, enough for 0.4 ETH",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. US$4,800, enough for 1.2 ETH\n\nHer claim is 3 × 1,600 = US$4,800, and 4,800 ÷ 4,000 = 1.2 ETH. Option A values the claim at the later price, which is exactly what a claim fixed in dollars, as in FTX's case, does not do.",
    },
    {
      id: "crypto-exchange-markets-12",
      prompt: "Can a limit order be a taker?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Yes when it immediately removes resting liquidity",
        },
        {
          id: "b",
          label: "No every limit is a maker",
        },
        {
          id: "c",
          label: "Only if no fee is charged",
        },
        {
          id: "d",
          label: "Only after withdrawing from the venue",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. Yes when it immediately removes resting liquidity\n\nA. Yes when it immediately removes resting liquidity. Order behaviour determines maker or taker treatment.\n\nB. No every limit is a maker. Marketable limits can execute immediately.\n\nC. Only if no fee is charged. Fee size does not define liquidity removal.\n\nD. Only after withdrawing from the venue. Withdrawal is unrelated to this classification.",
    },
    {
      id: "crypto-exchange-markets-13",
      prompt:
        "What is the market value of 250 tokens at USD 0.96 before costs?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "USD 10",
        },
        {
          id: "b",
          label: "USD 260",
        },
        {
          id: "c",
          label: "USD 240",
        },
        {
          id: "d",
          label: "USD 250 regardless of price",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. USD 240\n\nA. USD 10. That is the shortfall from target, not current value.\n\nB. USD 260. A depeg below target does not add value.\n\nC. USD 240. Quantity multiplied by the actual quotation gives 240.\n\nD. USD 250 regardless of price. The peg target is not the executable market price.",
    },
    {
      id: "crypto-exchange-markets-14",
      prompt: "How does selling a stablecoin differ from redeeming directly?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "They are always identical for every holder",
        },
        {
          id: "b",
          label: "Both automatically receive bank deposit insurance",
        },
        {
          id: "c",
          label: "A wrapper always inherits every issuer right",
        },
        {
          id: "d",
          label:
            "Sale uses market bids; issuer redemption follows eligibility and terms",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Sale uses market bids; issuer redemption follows eligibility and terms\n\nA. They are always identical for every holder. Issuer access can be restricted.\n\nB. Both automatically receive bank deposit insurance. Neither obtains protection merely from the token label.\n\nC. A wrapper always inherits every issuer right. Representations can add separate dependencies.\n\nD. Sale uses market bids; issuer redemption follows eligibility and terms. The routes have different counterparties and conditions.",
    },
    {
      id: "crypto-exchange-markets-15",
      prompt:
        "A withdrawal is pending with no transaction ID. Which possibility remains?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The asset must have doubled in value",
        },
        {
          id: "b",
          label: "The provider has not broadcast it yet",
        },
        {
          id: "c",
          label: "It must already have six confirmations",
        },
        {
          id: "d",
          label: "It is definitely in every node's mempool",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. The provider has not broadcast it yet\n\nA. The asset must have doubled in value. Withdrawal status does not establish price movement.\n\nB. The provider has not broadcast it yet. Service processing can precede network submission.\n\nC. It must already have six confirmations. There is no such evidence.\n\nD. It is definitely in every node's mempool. A request is not necessarily a broadcast transaction.",
    },
  ],
};
