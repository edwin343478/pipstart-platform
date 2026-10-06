import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoBitcoinQuizV1: AssessmentDefinition = {
  id: "bitcoin-foundations-quiz",
  version: 1,
  title: "Bitcoin and Shared Ledgers quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "bitcoin",
  moduleId: "bitcoin-foundations",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://bitcoin.org/bitcoin.pdf",
      "https://bitcoin.org/en/faq",
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://csrc.nist.gov/pubs/ir/8202/final",
      "https://bitcoin.org/en/bitcoin-core/features/validation",
      "https://www.ledger.com/academy/topics/crypto/when-was-bitcoin-invented",
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://developer.bitcoin.org/devguide/block_chain.html",
      "https://developer.bitcoin.org/devguide/p2p_network.html",
      "https://developer.bitcoin.org/devguide/mining.html",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://docs.glassnode.com/basic-api/endpoints/addresses",
      "https://bitcoin.org/en/you-need-to-know",
      "https://developer.bitcoin.org/devguide/wallets.html",
      "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/mempool-replacements.md",
      "https://docs.lightning.engineering/the-lightning-network/payment-channels",
      "https://ethereum.org/bridges/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://developer.bitcoin.org/glossary.html",
    ],
  },
  questions: [
    {
      id: "bitcoin-foundations-1",
      prompt:
        "Rohan in Delhi has a digital gift card worth ₹2,000 (an invented amount) saved as a file on his phone. He emails the same file to two online shops at the same moment, and neither shop can check with anyone. Which problem does this show?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A chain reorganisation",
        },
        {
          id: "b",
          label: "Double-spending",
        },
        {
          id: "c",
          label: "A hash collision",
        },
        {
          id: "d",
          label: "A 51% attack",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. Double-spending\n\nA digital file can be copied perfectly, so without a record-keeper the same money can be spent twice. A 51% attack is a different problem: a miner majority trying to replace recent blocks, and no blockchain is involved here.",
    },
    {
      id: "bitcoin-foundations-2",
      prompt:
        'Which statement best describes what "immutable" means for Bitcoin\'s record?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "No block can ever be changed, even in theory, from the moment it is created.",
        },
        {
          id: "b",
          label:
            "It is very hard to change, and harder the older the block; the most recent block can occasionally be replaced in a short reorganisation.",
        },
        {
          id: "c",
          label:
            "Miners can freely change a block until it has six confirmations, after which a protocol rule locks it.",
        },
        {
          id: "d",
          label:
            "Only the genesis block is protected; full nodes can edit later blocks by agreement.",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. It is very hard to change, and harder the older the block; the most recent block can occasionally be replaced in a short reorganisation.\n\nShort reorganisations of a block or two happen from time to time, so recent blocks are less settled than older ones. Option C is tempting, but six confirmations is a common rule of thumb for large amounts, not a protocol rule.",
    },
    {
      id: "bitcoin-foundations-3",
      prompt:
        "Fatimah in Riyadh is sending bitcoin. Her wallet estimates the transaction at 180 vB, and she chooses a fee rate of 12 sat/vB (invented figures). What fee will she pay?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "216 sats (0.00000216 BTC)",
        },
        {
          id: "b",
          label: "2,160 sats (0.000216 BTC)",
        },
        {
          id: "c",
          label: "21,600 sats (0.000216 BTC)",
        },
        {
          id: "d",
          label: "2,160 sats (0.0000216 BTC)",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. 2,160 sats (0.0000216 BTC)\n\nFee = size × fee rate = 180 × 12 = 2,160 sats, and 2,160 ÷ 100,000,000 = 0.0000216 BTC. Option B has the right number of sats but converts it to BTC wrongly, by one decimal place.",
    },
    {
      id: "bitcoin-foundations-4",
      prompt: "Which description of the Lightning Network is accurate?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "In a basic payment-channel model, parties commit bitcoin on the main chain and update balances off-chain; ordinary cooperative use mainly records opening and closing on-chain.",
        },
        {
          id: "b",
          label:
            "It is a separate coin that replaces bitcoin for small payments and has its own supply cap.",
        },
        {
          id: "c",
          label:
            "It broadcasts every small payment to every node, but with a faster block time.",
        },
        {
          id: "d",
          label:
            "It is a network run by banks that can reverse mistaken bitcoin payments.",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. In a basic payment-channel model, parties commit bitcoin on the main chain and update balances off-chain; ordinary cooperative use mainly records opening and closing on-chain.\n\nLightning channels can avoid broadcasting each payment to the base chain. Unilateral closes, dispute handling and other channel actions can involve additional on-chain transactions. The simplified opening-and-closing description is not every channel outcome.",
    },
    {
      id: "bitcoin-foundations-5",
      prompt:
        "The last 2,016 blocks took 20 days instead of the 14-day target (an invented timing). Roughly how will Bitcoin's difficulty change?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Up about 43%",
        },
        {
          id: "b",
          label: "Down about 30%",
        },
        {
          id: "c",
          label: "Down about 43%",
        },
        {
          id: "d",
          label: "No change, because difficulty only changes at a halving",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice  B. Down about 30%\n\nNew difficulty ≈ old × (14 ÷ 20) = old × 0.7, a fall of about 30% that pulls blocks back towards 10 minutes. Option A flips the fraction to 20 ÷ 14, which would wrongly make mining harder when blocks are already slow.",
    },
    {
      id: "bitcoin-foundations-6",
      prompt:
        'A forum post says: "Anyone with 51% of Bitcoin\'s hash rate can do whatever they like." Which action could such an attacker realistically attempt?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Spend coins from other people's addresses without their private keys",
        },
        {
          id: "b",
          label:
            "Pay themselves a 100 BTC subsidy in a block that nodes would accept",
        },
        {
          id: "c",
          label:
            "Release a secret chain with more work to reverse their own recent payment, double-spending a seller who accepted it too early",
        },
        {
          id: "d",
          label:
            "Raise the 21 million supply cap overnight without anyone's agreement",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. Release a secret chain with more work to reverse their own recent payment, double-spending a seller who accepted it too early\n\nA majority attacker can try to replace recent blocks to undo their own payments or leave transactions out. They cannot forge signatures, so option A is wrong, and nodes reject any block that pays more than the rules allow.",
    },
    {
      id: "bitcoin-foundations-7",
      prompt:
        "Rina in Surabaya sees an advert: rent a mining machine for Rp1,500,000 and earn a fixed 3% a day (invented figures). Which reasoning is correct?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "It is plausible, because the block subsidy fixes mining income in advance.",
        },
        {
          id: "b",
          label:
            "It is trustworthy if the company shows a dashboard of her daily earnings.",
        },
        {
          id: "c",
          label:
            "It is reasonable as long as the company's machines use cheap electricity.",
        },
        {
          id: "d",
          label:
            "Treat the fixed three-percent daily promise as a serious red flag; an advert does not demonstrate actual mining revenue or the ability to fund that promise.",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Treat the fixed three-percent daily promise as a serious red flag; an advert does not demonstrate actual mining revenue or the ability to fund that promise.\n\nUnderlying mining revenue varies with output, difficulty, fees, equipment costs and price. A contract may promise a payment, but that adds counterparty and evidence questions rather than making the underlying income fixed. Fake dashboards cannot establish production.",
    },
    {
      id: "bitcoin-foundations-8",
      prompt:
        "Min-jun in Busan holds 0.0042 BTC. He then receives 80,000 satoshis (invented amounts). What is his new balance in BTC?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.005 BTC",
        },
        {
          id: "b",
          label: "0.0122 BTC",
        },
        {
          id: "c",
          label: "0.00428 BTC",
        },
        {
          id: "d",
          label: "0.05 BTC",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. 0.005 BTC\n\n0.0042 BTC is 420,000 sats; adding 80,000 gives 500,000 sats, and 500,000 ÷ 100,000,000 = 0.005 BTC. Option B treats 80,000 sats as 0.008 BTC, ten times too much.",
    },
    {
      id: "bitcoin-foundations-9",
      prompt:
        'Ana in Belo Horizonte receives a message: "Halving in 30 days. Price always doubles. Send R$1,000 now and we\'ll trade it for you" (an invented amount). What is the best response?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Send the money, because halvings are written into the code and so a price rise is certain.",
        },
        {
          id: "b",
          label:
            "Send half the money, because the price is sure to rise even if it does not double.",
        },
        {
          id: "c",
          label:
            "Decline: a halving cuts the new bitcoin created per block but does not set the price, and urgency plus promised returns plus someone else holding her money is a scam pattern.",
        },
        {
          id: "d",
          label:
            "Decline, because a halving cuts the value of every coin already held by half.",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. Decline: a halving cuts the new bitcoin created per block but does not set the price, and urgency plus promised returns plus someone else holding her money is a scam pattern.\n\nA halving is a scheduled change in issuance, not a promise about price, and four past halvings are far too few to prove a rule. Option D is also wrong: a halving does not change the coins anyone already holds.",
    },
    {
      id: "bitcoin-foundations-10",
      prompt:
        'Hana in Sapporo sells a camera, and the buyer asks for "your Bitcoin details" so they can pay her. What should she share?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Her seed phrase, so the buyer can check her wallet is working",
        },
        {
          id: "b",
          label: "Her private key, because a payer needs it to send to her",
        },
        {
          id: "c",
          label:
            "Her public key together with her private key, to speed up confirmation",
        },
        {
          id: "d",
          label: "Only a receiving address, ideally a fresh one",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Only a receiving address, ideally a fresh one\n\nAn address is all a payer needs, and a fresh one helps privacy. Receiving bitcoin never requires a private key or seed phrase, and anyone who has either can take her coins, which rules out option B.",
    },
    {
      id: "bitcoin-foundations-11",
      prompt:
        "David signs a standard Bitcoin payment using a mode that commits to the relevant inputs and all outputs. Someone copies its signature to a payment with a different recipient and amount. Why does that fail?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The changed payment does not match the spending details committed by that signature.",
        },
        {
          id: "b",
          label:
            "Signatures are kept secret on David's device, so nobody else can ever see them.",
        },
        {
          id: "c",
          label:
            "A signature looks the same on every transaction, but nodes keep a list of signatures already used.",
        },
        {
          id: "d",
          label:
            "Only the miner who adds the block is able to read the signatures in it.",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. The changed payment does not match the spending details committed by that signature.\n\nSignature scope is defined by the applicable signing mode. In this supplied all-outputs example, changing the recipient or amount changes committed data. Other modes can have different scopes; do not generalise this to every byte of every possible transaction.",
    },
    {
      id: "bitcoin-foundations-12",
      prompt: "What does a cryptographic hash primarily provide in the lesson?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A data fingerprint useful for checking references",
        },
        {
          id: "b",
          label: "A decryption key for the original message",
        },
        {
          id: "c",
          label: "Proof every input statement is true",
        },
        {
          id: "d",
          label: "A customer password reset",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice  A. A data fingerprint useful for checking references\n\nA. A data fingerprint useful for checking references. It helps detect changed data; validity still requires rules.\n\nB. A decryption key for the original message. A hash is not reversible encryption.\n\nC. Proof every input statement is true. False data can also be hashed.\n\nD. A customer password reset. Hashing has a different system role.",
    },
    {
      id: "bitcoin-foundations-13",
      prompt:
        "A 0.0200 BTC input pays 0.0050 BTC with a 0.0001 BTC fee. What is change?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.0251 BTC",
        },
        {
          id: "b",
          label: "0.0001 BTC",
        },
        {
          id: "c",
          label: "0.0149 BTC",
        },
        {
          id: "d",
          label: "0.0150 BTC",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice  C. 0.0149 BTC\n\nA. 0.0251 BTC. This incorrectly adds payment and fee to the input.\n\nB. 0.0001 BTC. That is the fee, not the change.\n\nC. 0.0149 BTC. Input minus recipient amount minus fee gives the change output.\n\nD. 0.0150 BTC. This omits the supplied fee.",
    },
    {
      id: "bitcoin-foundations-14",
      prompt: "What does a valid transaction signature establish?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The recipient will deliver goods",
        },
        {
          id: "b",
          label: "The signer understood every consequence",
        },
        {
          id: "c",
          label: "Every address identifies a known person",
        },
        {
          id: "d",
          label: "Required spending authorisation under the rules",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. Required spending authorisation under the rules\n\nA. The recipient will deliver goods. Goods delivery is a separate obligation.\n\nB. The signer understood every consequence. A user can approve a harmful instruction.\n\nC. Every address identifies a known person. Address attribution requires separate evidence.\n\nD. Required spending authorisation under the rules. It does not establish informed intent or recipient honesty.",
    },
    {
      id: "bitcoin-foundations-15",
      prompt:
        "Why is a wrapped BTC representation a separate research subject?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A matching name guarantees identical rights",
        },
        {
          id: "b",
          label: "It removes every custody risk",
        },
        {
          id: "c",
          label: "It must always have a higher price",
        },
        {
          id: "d",
          label: "It adds a representation and redemption mechanism",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice  D. It adds a representation and redemption mechanism\n\nA. A matching name guarantees identical rights. Names do not establish the mechanism.\n\nB. It removes every custody risk. The representation can introduce additional custody.\n\nC. It must always have a higher price. No such price rule follows.\n\nD. It adds a representation and redemption mechanism. Custody, bridge or contract dependencies can differ from native BTC.",
    },
  ],
};
