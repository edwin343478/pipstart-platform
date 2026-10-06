import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoAdvancedGraduationQuizV1: AssessmentDefinition = {
  id: "crypto-advanced-and-graduation-quiz",
  version: 1,
  title: "Advanced Awareness and Graduation quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-advanced-and-graduation",
  moduleId: "advanced-awareness-and-graduation",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://csrc.nist.gov/pubs/ir/8202/final",
      "https://developer.bitcoin.org/devguide/block_chain.html",
      "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
      "https://bitcoin.org/bitcoin.pdf",
      "https://bitcoin.org/en/bitcoin-core/features/validation",
      "https://ethereum.org/layer-2/",
      "https://ethereum.org/bridges/",
      "https://ethereum.org/guides/how-to-use-a-bridge/",
      "https://ethereum.org/staking/pools/",
      "https://ethereum.org/restaking/",
      "https://developer.bitcoin.org/devguide/mining.html",
      "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/",
      "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
      "https://ethereum.org/en/governance/",
      "https://ethereum.org/en/developers/docs/bridges/",
      "https://ethereum.org/en/developers/docs/oracles/",
      "https://ethereum.org/en/developers/docs/smart-contracts/security/",
      "https://ethereum.org/dao/",
      "https://chain.link/education/blockchain-oracles",
      "https://ethereum.org/security/",
      "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/ETPBulletinSeptember2024",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/funds-trading-bitcoin-futures-investor-bulletin",
      "https://ethereum.org/developers/docs/mev/",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
      "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
      "https://www.irs.gov/filing/digital-assets",
      "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.bis.org/publ/arpdf/ar2025e3.htm",
      "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
      "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
      "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://docs.glassnode.com/basic-api/endpoints/entities",
      "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    ],
  },
  questions: [
    {
      id: "crypto-advanced-and-graduation-1",
      prompt:
        "A Bitcoin upgrade only tightens the rules, so blocks made under the new rules are still accepted by nodes that have not upgraded. What kind of change is it?",
      explanation:
        "Correct choice: A soft fork, like SegWit in August 2017\n\nA soft fork makes only previously valid blocks or transactions invalid, so old nodes still accept new blocks. A hard fork changes the rules so that non-upgraded nodes reject new blocks, which can split the chain.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A hard fork, because the rules changed",
        },
        {
          id: "b",
          label: "A soft fork, like SegWit in August 2017",
        },
        {
          id: "c",
          label: "A chain reorganisation",
        },
        {
          id: "d",
          label: "A long-range attack",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-advanced-and-graduation-2",
      prompt:
        "Suppose more than two-thirds of Ethereum's active validator stake uses one consensus client. Why can that concentration create a serious risk?",
      explanation:
        "Correct choice: A correlated client failure can impair finality or create conflicting votes; slashing depends on the violation that actually occurs.\n\nThe relevant voting weight is stake, not a simple count of operators. Correlated software errors can affect a large share of consensus at once. Slashing requires the applicable conditions; client concentration alone is not proof that every failure causes it.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It would make transactions more expensive for everyone.",
        },
        {
          id: "b",
          label:
            "The client's developers would gain the power to change Ethereum's rules alone.",
        },
        {
          id: "c",
          label:
            "A correlated client failure can impair finality or create conflicting votes; slashing depends on the violation that actually occurs.",
        },
        {
          id: "d",
          label:
            "Validators using minority clients would be automatically slashed.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-advanced-and-graduation-3",
      prompt:
        "Which statement best describes how Bitcoin and Ethereum change their protocol rules?",
      explanation:
        "Correct choice: Changes are proposed as BIPs or EIPs, debated publicly, and only take effect if node operators and others choose to run the new software.\n\nBoth use off-chain governance: proposals, discussion and voluntary upgrades. Developers cannot force adoption. The answer “Token holders vote on-chain, and the code applies the result automatically” describes on-chain governance, which some other networks use.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Token holders vote on-chain, and the code applies the result automatically.",
        },
        {
          id: "b",
          label: "A foundation decides and pushes updates to every node.",
        },
        {
          id: "c",
          label:
            "Miners or validators alone decide, and users must accept the result.",
        },
        {
          id: "d",
          label:
            "Changes are proposed as BIPs or EIPs, debated publicly, and only take effect if node operators and others choose to run the new software.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-advanced-and-graduation-4",
      prompt:
        "A bridge releases funds on the destination chain whenever 5 of its 9 signers approve. Which design is this, and what are you mainly trusting?",
      explanation:
        "Correct choice: A trusted bridge; you trust the signers' honesty and the security of their keys.\n\nThe supplied external signer quorum makes its honesty, key protection and release rules central dependencies. Alternative proof-based bridges rely on other verification assumptions as well as code, data and upgrade controls. The label trustless is not a complete safety diagnosis.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A trustless bridge; you trust only the two blockchains.",
        },
        {
          id: "b",
          label:
            "A trusted bridge; you trust the signers' honesty and the security of their keys.",
        },
        {
          id: "c",
          label: "A liquidity network; you trust the providers' pools.",
        },
        {
          id: "d",
          label:
            "An optimistic bridge; you trust that a watcher will object in time.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-advanced-and-graduation-5",
      prompt: 'Why is the "oracle problem" a problem?',
      explanation:
        "Correct choice: Smart contracts cannot fetch outside data on their own, so a contract is only as reliable as the data source it trusts.\n\nBlockchains are deliberately isolated, so prices and other outside facts must be brought in. If one oracle can decide the input, it can decide the outcome, which undermines the contract's decentralisation. Oracles cannot reverse transactions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Smart contracts cannot fetch outside data on their own, so a contract is only as reliable as the data source it trusts.",
        },
        {
          id: "b",
          label: "Oracles make blockchains slower than banks.",
        },
        {
          id: "c",
          label: "Oracles can reverse confirmed transactions.",
        },
        {
          id: "d",
          label: "Oracles are only needed for NFTs.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-advanced-and-graduation-6",
      prompt:
        "An oracle receives five price reports: US$20, US$21, US$19, US$20 and a manipulated US$120 (invented figures). What are the median and the simple average?",
      explanation:
        "Correct choice: Median US$20; average US$40\n\nSorted reports are 19, 20, 20, 21 and 120, so the median is USD 20. Their sum is 200 and the mean is USD 40. This example shows reduced sensitivity to one extreme value; it does not establish trustworthy sources or safety against coordinated manipulation.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Median US$40; average US$20",
        },
        {
          id: "b",
          label: "Median US$21; average US$20",
        },
        {
          id: "c",
          label: "Median US$20; average US$40",
        },
        {
          id: "d",
          label: "Median US$19; average US$40",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-advanced-and-graduation-7",
      prompt:
        'Fatima reads an audit report dated last year that covers version 1 of a lending app. The app now runs version 2, and one high-severity finding is marked "acknowledged". What is the most accurate conclusion?',
      explanation:
        'Correct choice: The audit says little about version 2, and the accepted high-severity issue needs an explanation before she relies on it.\n\nAn audit is a point-in-time review of a defined scope; later code was not checked. "Acknowledged" usually means accepted without a fix, not resolved, so the answer “Acknowledged means the issue was fixed and re-checked” is wrong.',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The app is safe because it has been audited.",
        },
        {
          id: "b",
          label:
            "The audit says little about version 2, and the accepted high-severity issue needs an explanation before she relies on it.",
        },
        {
          id: "c",
          label: "Acknowledged means the issue was fixed and re-checked.",
        },
        {
          id: "d",
          label: "Severity levels are marketing labels and can be ignored.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-advanced-and-graduation-8",
      prompt:
        'A protocol says its core contract is "formally verified". What does that mean, and what is its limit?',
      explanation:
        "Correct choice: Within the stated model and assumptions, code has been proven to satisfy a written specification; unmodeled properties and outside dependencies remain.\n\nFormal verification is powerful evidence for a defined property, model and code scope. A missing property, incorrect specification, changed implementation or outside-data failure can still matter. It does not certify all real-world outcomes.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It has been proven bug-free in every way.",
        },
        {
          id: "b",
          label: "An auditor tested it with many example transactions.",
        },
        {
          id: "c",
          label: "It is insured against hacks.",
        },
        {
          id: "d",
          label:
            "Within the stated model and assumptions, code has been proven to satisfy a written specification; unmodeled properties and outside dependencies remain.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-advanced-and-graduation-9",
      prompt:
        "Why is valuing most crypto-assets harder than valuing a company's shares?",
      explanation:
        "Correct choice: Many tokens lack an enforceable claim to an issuer's profits or dividends, making assumptions about holder benefits and demand difficult to establish.\n\nNetwork use, fees or popularity are not automatically distributable cash flow to a token holder. Some tokens have specified benefits, which must be examined on their own terms. A valuation needs an actual rights mechanism and stated assumptions.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Many tokens lack an enforceable claim to an issuer's profits or dividends, making assumptions about holder benefits and demand difficult to establish.",
        },
        {
          id: "b",
          label: "Crypto prices are reported in too many currencies.",
        },
        {
          id: "c",
          label: "Regulators forbid crypto valuation.",
        },
        {
          id: "d",
          label: "Blockchains hide all transaction data.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-advanced-and-graduation-10",
      prompt:
        "An invented network has market capitalisation USD 12 billion and users paid USD 300 million in fees over a year. What is the network-value-to-fees ratio, and what does it not show?",
      explanation:
        "Correct choice: 40; it does not show whether token holders capture any of the fees\n\n12,000,000,000 ÷ 300,000,000 = 40. The ratio compares value with fees paid, but fees may go to validators or liquidity providers rather than holders, and they may not last. The answer “40; it proves the token is fairly valued” claims a certainty no ratio can give.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "4; it shows the price is too low",
        },
        {
          id: "b",
          label: "40; it proves the token is fairly valued",
        },
        {
          id: "c",
          label: "400; it shows holders earn 0.25% a year",
        },
        {
          id: "d",
          label:
            "40; it does not show whether token holders capture any of the fees",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-advanced-and-graduation-11",
      prompt:
        "Leila in Toronto finishes her graduation project. Her research report concludes, with evidence, that she will not buy any crypto-asset for now. Her backup plan, security checklist and other parts are complete and dated. How should she judge the outcome?",
      explanation:
        "Correct choice: A responsible graduation decision; the project checks a careful, documented process, not a purchase or profit.\n\nNo deposit, trade or profit is required, and choosing not to invest is one of three equally valid decisions. Opening accounts is not needed: the exchange comparison uses public information.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "A responsible graduation decision; the project checks a careful, documented process, not a purchase or profit.",
        },
        {
          id: "b",
          label:
            "Incomplete, because the project requires at least one purchase.",
        },
        {
          id: "c",
          label: "Failed, because the research report must recommend a token.",
        },
        {
          id: "d",
          label:
            "Incomplete until she opens an exchange account to prove the comparison.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-advanced-and-graduation-12",
      prompt: "What can a majority-work ordering attack not automatically do?",
      explanation:
        "Correct choice: Forge every user's spending signature\n\nForge every user's spending signature. Reordering valid history is different from possessing every key.\n\nAttempt to censor transactions. Censorship can be an attack capability under relevant conditions.\n\nAttempt a recent-history reorganisation. That is a relevant competing-work threat.\n\nReverse the attacker's own recent payment under suitable conditions. This is a known double-spend concern.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Forge every user's spending signature",
        },
        {
          id: "b",
          label: "Attempt to censor transactions",
        },
        {
          id: "c",
          label: "Attempt a recent-history reorganisation",
        },
        {
          id: "d",
          label:
            "Reverse the attacker's own recent payment under suitable conditions",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-advanced-and-graduation-13",
      prompt: "What makes a governance review complete?",
      explanation:
        "Correct choice: Following proposals votes delegation and actual execution powers\n\nAssuming every voter has equal power. Distribution and delegation can concentrate influence.\n\nIgnoring emergency authorities. Those can change the ordinary control path.\n\nFollowing proposals votes delegation and actual execution powers. The full authority path determines practical control.\n\nCounting forum likes only. Advisory sentiment may not execute changes.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Assuming every voter has equal power",
        },
        {
          id: "b",
          label: "Ignoring emergency authorities",
        },
        {
          id: "c",
          label:
            "Following proposals votes delegation and actual execution powers",
        },
        {
          id: "d",
          label: "Counting forum likes only",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-advanced-and-graduation-14",
      prompt: "What should a reviewer do with an audit title?",
      explanation:
        "Correct choice: Inspect version scope findings and assumptions\n\nInspect version scope findings and assumptions. The title alone cannot define the evidence boundary.\n\nTreat it as proof of all future upgrades. Later code can differ from reviewed code.\n\nTreat it as proof of legal ownership. Code review does not establish all outside rights.\n\nIgnore every unresolved finding. Those findings are material to the review.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Inspect version scope findings and assumptions",
        },
        {
          id: "b",
          label: "Treat it as proof of all future upgrades",
        },
        {
          id: "c",
          label: "Treat it as proof of legal ownership",
        },
        {
          id: "d",
          label: "Ignore every unresolved finding",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-advanced-and-graduation-15",
      prompt:
        "A dossier calls a bridged lending receipt risk-free cash. What should happen?",
      explanation:
        "Correct choice: Correct the description and map its dependencies\n\nCorrect the description and map its dependencies. Bridge lending receipt and access risks contradict the label.\n\nKeep the label if the last price is stable. Price stability does not remove other risks.\n\nDelete the transfer route to hide complexity. The connected route must be reviewed.\n\nAssume an audit covers all redemption rights. Report scope and legal rights are separate.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Correct the description and map its dependencies",
        },
        {
          id: "b",
          label: "Keep the label if the last price is stable",
        },
        {
          id: "c",
          label: "Delete the transfer route to hide complexity",
        },
        {
          id: "d",
          label: "Assume an audit covers all redemption rights",
        },
      ],
      correctChoiceIds: ["a"],
    },
  ],
};
