import "server-only";
import type { AssessmentDefinition } from "./assessment";

export const cryptoOrientationQuizV1: AssessmentDefinition = {
  id: "crypto-orientation-quiz",
  version: 1,
  title: "Crypto Orientation and Safety quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-orientation",
  moduleId: "crypto-orientation-and-safety",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://csrc.nist.gov/pubs/ir/8202/final",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://bitcoin.org/en/faq",
      "https://www.bankofengland.co.uk/the-digital-pound",
      "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
      "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
      "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
      "https://www.circle.com/legal/usdc-terms",
      "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://ethereum.org/en/developers/docs/networks/",
      "https://www.ledger.com/academy/topics/blockchain/etherscan-what-is-it-and-how-to-use-it",
      "https://bitcoin.org/en/you-need-to-know",
      "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
      "https://help.coinbase.com/en/coinbase/trading-and-funding/sending-or-receiving-cryptocurrency/i-sent-funds-to-the-wrong-address-how-do-i-get-them-back",
      "https://ethereum.org/security/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
      "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/RomanceScam.html",
      "https://trezor.io/support/troubleshooting/coins-tokens/dusting-attacks-airdrop-scam-tokens",
    ],
  },
  questions: [
    {
      id: "crypto-orientation-1",
      prompt:
        "Which activity can complete a beginner learning exercise without exposing real funds?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Join a guaranteed-return group",
        },
        {
          id: "b",
          label: "Calculate a supplied fictional order",
        },
        {
          id: "c",
          label: "Buy an asset to activate the course",
        },
        {
          id: "d",
          label: "Give support your recovery phrase",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. Calculate a supplied fictional order\n\nA. Join a guaranteed-return group. A promise is not evidence and introduces scam risk.\n\nB. Calculate a supplied fictional order. A paper calculation demonstrates understanding without a deposit.\n\nC. Buy an asset to activate the course. The course does not require purchasing an asset.\n\nD. Give support your recovery phrase. That exposes signing authority and is unnecessary.",
    },
    {
      id: "crypto-orientation-2",
      prompt:
        "A network distributes transaction validation but a customer uses one custodial exchange. Which description is most accurate?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Every network function is equally distributed",
        },
        {
          id: "b",
          label: "The exchange password is a blockchain private key",
        },
        {
          id: "c",
          label: "Network and customer custody have different dependencies",
        },
        {
          id: "d",
          label: "The customer has no counterparty risk",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. Network and customer custody have different dependencies\n\nA. Every network function is equally distributed. Control must be examined separately for each function.\n\nB. The exchange password is a blockchain private key. A service login and signing material have different roles.\n\nC. Network and customer custody have different dependencies. Distributed validation does not remove the customer's provider dependence.\n\nD. The customer has no counterparty risk. Custody still depends on the provider and its terms.",
    },
    {
      id: "crypto-orientation-3",
      prompt: "What does a shared-ledger analogy help explain?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Why every transfer has a bank-style refund",
        },
        {
          id: "b",
          label: "Why cryptocurrency prices must rise",
        },
        {
          id: "c",
          label: "Why software removes all human choices",
        },
        {
          id: "d",
          label: "How entries can be recorded for several participants",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. How entries can be recorded for several participants\n\nA. Why every transfer has a bank-style refund. Blockchain transfers do not inherit a spreadsheet or bank refund process.\n\nB. Why cryptocurrency prices must rise. Ledger design does not establish future demand or price.\n\nC. Why software removes all human choices. People still develop, operate and select systems.\n\nD. How entries can be recorded for several participants. The analogy introduces records while actual verification and correction rules still differ.",
    },
    {
      id: "crypto-orientation-4",
      prompt:
        "A EUR 50 voucher and a token quoted at EUR 50 display the same amount. What follows?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Their rights and liquidity still need separate review",
        },
        {
          id: "b",
          label: "Both can be redeemed at any bank",
        },
        {
          id: "c",
          label: "Both receive deposit insurance",
        },
        {
          id: "d",
          label: "Both are company shares",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. Their rights and liquidity still need separate review\n\nA. Their rights and liquidity still need separate review. Matching numerical value does not make issuer obligations identical.\n\nB. Both can be redeemed at any bank. Redemption depends on the specific item and its terms.\n\nC. Both receive deposit insurance. Protection is not created by an EUR quotation.\n\nD. Both are company shares. Neither label establishes corporate ownership.",
    },
    {
      id: "crypto-orientation-5",
      prompt:
        "At fictional EUR 40,000 per BTC, what is 0.025 BTC worth before fees?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "EUR 40,000",
        },
        {
          id: "b",
          label: "EUR 1,000",
        },
        {
          id: "c",
          label: "EUR 100",
        },
        {
          id: "d",
          label: "1,000 BTC",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. EUR 1,000\n\nA. EUR 40,000. That is the supplied price of a whole BTC.\n\nB. EUR 1,000. Quantity multiplied by price gives 0.025 × 40,000.\n\nC. EUR 100. This understates the product by a factor of ten.\n\nD. 1,000 BTC. The result is quote-currency value, not additional BTC.",
    },
    {
      id: "crypto-orientation-6",
      prompt:
        "Which holding is primarily a derivative contract rather than direct spot control?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A self-custodied BTC output",
        },
        {
          id: "b",
          label: "An ordinary shop voucher",
        },
        {
          id: "c",
          label: "A perpetual position",
        },
        {
          id: "d",
          label: "Cash in your hand",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. A perpetual position\n\nA. A self-custodied BTC output. It is controlled through spending authority on the network.\n\nB. An ordinary shop voucher. It is a limited claim under voucher terms, not the stated price derivative.\n\nC. A perpetual position. Its payoff and obligations follow contract terms.\n\nD. Cash in your hand. Cash is directly held money rather than this derivative.",
    },
    {
      id: "crypto-orientation-7",
      prompt:
        "A GBP 100 holding falls to GBP 60 while access remains intact. What is the price loss?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "GBP 60 or 60 percent",
        },
        {
          id: "b",
          label: "GBP 40 or 66.67 percent loss",
        },
        {
          id: "c",
          label: "No loss until sale",
        },
        {
          id: "d",
          label: "GBP 40 or 40 percent",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. GBP 40 or 40 percent\n\nA. GBP 60 or 60 percent. That is the remaining value, not the loss.\n\nB. GBP 40 or 66.67 percent loss. 66.67 percent describes the gain needed from 60 to recover to 100.\n\nC. No loss until sale. Current economic value has fallen even before realisation.\n\nD. GBP 40 or 40 percent. The difference is 40 and the denominator is the original 100.",
    },
    {
      id: "crypto-orientation-8",
      prompt:
        "Which precaution directly addresses accidental loss of wallet access?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A secure usable recovery plan",
        },
        {
          id: "b",
          label: "A market stop order",
        },
        {
          id: "c",
          label: "A predicted price recovery",
        },
        {
          id: "d",
          label: "More token names at the same wallet",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. A secure usable recovery plan\n\nA. A secure usable recovery plan. It preserves the means to restore authority under the wallet scheme.\n\nB. A market stop order. It concerns execution rather than lost signing material.\n\nC. A predicted price recovery. Price changes do not recreate authority.\n\nD. More token names at the same wallet. Additional holdings do not repair the recovery mechanism.",
    },
    {
      id: "crypto-orientation-9",
      prompt:
        "An unsolicited refund message supplies a QR code and asks for recovery words. What should happen first?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Trust the displayed support logo",
        },
        {
          id: "b",
          label: "Pause and verify through a separate known official route",
        },
        {
          id: "c",
          label: "Scan and enter words before the deadline",
        },
        {
          id: "d",
          label: "Send a small deposit to test the agent",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. Pause and verify through a separate known official route\n\nA. Trust the displayed support logo. Logos and sender names can be copied.\n\nB. Pause and verify through a separate known official route. The message's own link cannot independently establish its legitimacy.\n\nC. Scan and enter words before the deadline. Urgency does not justify exposing signing authority.\n\nD. Send a small deposit to test the agent. A test payment can still be lost and proves little.",
    },
    {
      id: "crypto-orientation-10",
      prompt:
        "Why is an unexplained signature concerning even when no fee is displayed?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Every message signature is harmless",
        },
        {
          id: "b",
          label: "Only expensive transactions can be scams",
        },
        {
          id: "c",
          label: "It may authorise a valuable action for later use",
        },
        {
          id: "d",
          label: "No fee means the wallet is disconnected",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. It may authorise a valuable action for later use\n\nA. Every message signature is harmless. Its effect depends on the message and protocol.\n\nB. Only expensive transactions can be scams. Scam risk concerns the action, not just its charge.\n\nC. It may authorise a valuable action for later use. A message can carry authority without immediate on-chain cost.\n\nD. No fee means the wallet is disconnected. Fee display does not determine connection or authority.",
    },
  ],
};
