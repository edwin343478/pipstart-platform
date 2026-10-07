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
  course: "crypto-orientation",
  description:
    "Explain cryptocurrency in ordinary language and identify realistic reasons to study it.",
  estimatedMinutes: 12,
  learningPath: "crypto",
  level: "level-0",
  module: "crypto-orientation-and-safety",
  objectives: [
    "Explain cryptocurrency in ordinary language and identify realistic reasons to study it.",
  ],
  position: 1,
  prerequisites: [],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["crypto-using-owning-investing-trading"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain cryptocurrency in ordinary language and identify realistic reasons to study it.",
  seoTitle: "Start Here and Understand Cryptocurrency",
  slug: "crypto-start-here",
  sources: [
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "NIST: Blockchain Technology Overview NISTIR 8202",
      url: "https://csrc.nist.gov/pubs/ir/8202/final",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "Bitcoin community: Bitcoin FAQ",
      url: "https://bitcoin.org/en/faq",
    },
    {
      title: "Bank of England: Bank of England — The digital pound",
      url: "https://www.bankofengland.co.uk/the-digital-pound",
    },
    {
      title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title: "FCA: Qualifying retail crypto ETNs and continuing restrictions",
      url: "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
    },
    {
      title: "SEC: Crypto asset interpretation effective March 2026",
      url: "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
    },
  ],
  status: "published",
  title: "Start Here and Understand Cryptocurrency",
};
const sections1: LessonSection[] = [
  {
    title: "Money you already use",
    shortTitle: "Money you already use",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain cryptocurrency in ordinary language and identify realistic reasons to study it.",
      },
      {
        type: "paragraph",
        children:
          "You can learn about cryptocurrency without buying it. Start with a question you already understand: when money moves, who keeps the record, and how do other people know that the record is right? This course follows that question from everyday payments to Bitcoin, wallets, markets and applications. You will also learn how things fail. Understanding a system includes knowing which promises it can keep, which people or services you still depend on, and which mistakes may be difficult to reverse.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Ask who keeps the record, who can authorise a change and who can help if something goes wrong.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Start with the money you already use",
      },
      {
        type: "paragraph",
        children:
          "Before talking about crypto, think about the money that passes through your hands each week. Priya, a teacher in Pune, has three kinds. She has a few rupee notes in her purse. She has a salary in her bank account. And she has a payments app she uses to pay the vegetable seller ₹200 (an invented amount for this example).",
      },
      {
        type: "paragraph",
        children:
          'All three feel like "money", yet they differ. The notes are physical objects. Her bank balance is not a pile of notes with her name on it; it is a number in the bank\'s records, a promise that the bank owes her that amount. Her payments app works the same way, with a company keeping the number.',
      },
      {
        type: "paragraph",
        children:
          "So most money is already digital: entries in someone's record book. Crypto is also a record. The big difference is who keeps it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask who keeps the record",
      },
      {
        type: "paragraph",
        children:
          "A balance is a record about value and rights. Your bank maintains the record for a deposit; a payment firm maintains its service balance under its own terms. Changing the number on your own screen would not change what either provider owes.",
      },
      {
        type: "paragraph",
        children:
          "Now imagine a savings group in Mumbai. If only one person keeps the notebook, everyone relies on that person's honesty, availability and corrections. Sharing copies makes changes easier to inspect, but the group still needs rules for accepting a new entry and resolving disagreement.",
      },
      {
        type: "paragraph",
        children:
          "A blockchain adds software rules and a method for agreeing on accepted activity. It does not automatically make the recorded asset valuable or the people using it honest. The first useful question is who keeps the record; the next is what authority and rights that record actually gives you.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare crypto with cash, bank and mobile money",
      },
      {
        type: "paragraph",
        children:
          "Cash, bank deposits, payment-app balances and crypto can all appear to do the same everyday job: help you pay someone. The arrangements behind them differ.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Form",
          "Who or what maintains the record",
          "What you control",
          "Reversal and protection questions",
        ],
        rows: [
          [
            "Physical cash",
            "Issuer and physical possession",
            "Notes or coins in your possession",
            "Handing it over has no routine digital undo; possession does not settle every legal ownership dispute",
          ],
          [
            "Bank deposit",
            "Bank under applicable law",
            "A claim on the bank accessed through its account system",
            "Error procedures and eligible deposit protection depend on country and account",
          ],
          [
            "Payment-app balance",
            "Bank, payment firm or e-money issuer under its terms",
            "A service balance or claim",
            "Safeguarding, refunds and protection vary by provider and jurisdiction",
          ],
          [
            "Native bitcoin in self-custody",
            "Bitcoin's accepted ledger and spending rules",
            "Signing authority over relevant outputs",
            "No general bank-style reversal; price and access risks remain",
          ],
          [
            "Other crypto token",
            "Its network and token rules",
            "The authority or claim defined by that arrangement",
            "An issuer or administrator may have powers; insurance is not automatic",
          ],
        ],
      },
      {
        type: "example",
        title: "Example — Four ways to pay for lunch",
        children:
          "A customer in Toronto can hand over C$20 in cash, use a bank card, pay through an app or transfer crypto. The café may receive a similar apparent value, but a refund, dispute and failed service follow different routes in each case. Checking those routes matters more than how similar the payment screens look.**",
      },
      {
        type: "paragraph",
        children:
          "When you pay a shop, the banking system changes account records rather than moving a particular banknote across the country. Other networks may track account balances or run programs. The ledger analogy helps explain records; it does not mean that a blockchain has the same permissions, refund process or legal protections as a family spreadsheet or a bank.",
      },
    ],
  },
  {
    title: "A shared record and decentralisation",
    shortTitle: "A shared record and decentralisation",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "So what is a cryptocurrency",
      },
      {
        type: "paragraph",
        children:
          "Imagine neighbours keeping a shared list of who paid for a community garden. Instead of one neighbour owning the only copy, several keep copies and use agreed rules to check new entries. A distributed ledger uses a related idea, although its software and security rules are far more exact than a neighbourhood list.",
      },
      {
        type: "definition",
        term: "Definition — Crypto asset",
        children:
          "An asset recorded and transferred using a blockchain or a related distributed ledger. It may be a network's native coin or a token whose rules are implemented by a contract. Different assets can have very different issuers, administrators, rights and risks.",
      },
      {
        type: "paragraph",
        children:
          "Cryptography helps check data and authorise actions. In a typical self-custody arrangement, private signing material lets the holder approve spending, while public information lets other participants verify that approval. A provider account can work differently: you log in to the provider and ask it to act using keys it controls.",
      },
      {
        type: "paragraph",
        children:
          "A blockchain groups accepted activity into blocks linked by cryptographic references. The network's rules determine which activity is valid and how participants select an accepted history. The word crypto does not tell you whether one company can freeze a token, whether an application can be upgraded, or whether a deposit is insured. Those questions belong to the particular asset and service.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand decentralised without the jargon",
      },
      {
        type: "paragraph",
        children:
          "Compare two ways of running a football league table. In one, the league office keeps the official table. In the other, every club keeps a copy, and a result counts only when most clubs agree it followed the rules. The second league has no head office that can change a score alone.",
      },
      {
        type: "definition",
        term: "Definition — Decentralised",
        children:
          "Run by many independent participants, so that no single person, company or government controls the record or can change it alone.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin.org compares this to email: nobody owns the Bitcoin network, much as nobody owns the technology behind email. An individual company does not ordinarily control the entire Bitcoin ledger. Particular gateways, miners, networks or services can still restrict access, and continued operation depends on the network functioning.",
      },
      {
        type: "paragraph",
        children:
          "The matching risk matters as much. If no one is in charge, there is often no one to call: no help desk, no manager to cancel a mistaken payment, no built-in compensation fund. And because most people use crypto through companies such as exchanges, you often trust a company again, sometimes without the protections you are used to (the loss and safety lesson in Level 0 and Level 3).",
      },
      {
        type: "paragraph",
        children: "Now put the four kinds of money side by side.",
      },
      {
        type: "paragraph",
        children:
          "A system may distribute one of these activities while concentrating another. Shared software does not remove people. Different arrangements make different trade-offs in speed, cost, privacy and control. Rather than accepting a label such as decentralised or trustless, identify the specific party or rule you rely on.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-0/lesson-1-rId15.png",
        description: [
          "Start with the example purchase: CAD 90 of groceries. Record it, share the entries with participants, then check them under agreed rules.",
          "The lower boxes distinguish a family spreadsheet, where people can agree an edit, from a blockchain ledger, where network acceptance rules apply.",
        ],
        width: 1187,
        height: 556,
        alt: "A purchase record flows to sharing and rule checks, with separate spreadsheet and blockchain boxes.",
        caption:
          "A shared record is an analogy. The rules for accepting and correcting entries differ between a spreadsheet and a blockchain.",
      },
    ],
  },
  {
    title: "Origins, families and central bank digital money",
    shortTitle: "Origins families and central bank digital money",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "See where crypto came from",
      },
      {
        type: "paragraph",
        children:
          'In 2008 the world was in a financial crisis. Large banks failed or needed rescue, and many people lost trust in the institutions holding their money. In October 2008 someone using the name Satoshi Nakamoto published a short paper, "Bitcoin: A Peer-to-Peer Electronic Cash System". It described a way to send value online directly between people, without a bank in the middle.',
      },
      {
        type: "paragraph",
        children:
          "In January 2009 the Bitcoin software was released and the network began running. Bitcoin.org notes that Satoshi left the project in late 2010 without revealing much about himself. The name is a pseudonym, and the real identity is still unknown. Level 1 tells the full story, including earlier attempts at digital cash.",
      },
      {
        type: "paragraph",
        children:
          'Bitcoin was the first working cryptocurrency, but not the last. Developers copied and changed the idea, and price sites now list many thousands of coins and tokens, while many others have vanished. No single person invented "crypto" as a whole.',
      },
      {
        type: "paragraph",
        children:
          "Bitcoin's central design goal, working without a bank in the middle, has a name you will hear constantly: decentralisation.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know the main families of crypto",
      },
      {
        type: "paragraph",
        children:
          "Open a crypto price website and you will see a long list of names. Most fall into a few families. This lesson only names them; later levels teach each one.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin (BTC) is the first cryptocurrency, launched in 2009, and is used mostly to hold and send value (Level 1). Platform coins belong to networks that can run programs on the shared record; the best known is ether (ETH) on Ethereum (Level 4). Stablecoins are tokens that aim to keep a steady value, often one US dollar; they are not bank deposits and their steadiness is not assured (Level 3). Other tokens cover the rest: app tokens, voting tokens, meme coins and more (Level 5).",
      },
      {
        type: "example",
        title: "Example — The long list in São Paulo",
        children:
          'Lucas, a student in São Paulo, scrolls a long price list. A friend says the coins near the bottom are "cheap" at R$0.01 each (an invented price for this example). Lucas now knows a low price per coin says nothing about value or safety. He notes the name to research in Level 5 instead of buying it.**',
      },
      {
        type: "paragraph",
        children:
          'The word "digital" can also mislead, because governments are working on digital money too.',
      },
      {
        type: "heading",
        level: 3,
        children: "Tell crypto apart from central bank digital money",
      },
      {
        type: "paragraph",
        children:
          "A central bank digital currency, or CBDC, is digital money issued as a central-bank liability under its design. A retail CBDC would be intended for ordinary users; a wholesale version is intended for defined financial-market participants. A bank-account balance is already digital, but it is normally a commercial-bank liability, so digital does not mean CBDC.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin has no central-bank issuer. A privately issued stablecoin instead aims to track a reference value through its reserves, collateral or another mechanism. These are separate arrangements even when they appear in wallet-shaped applications.",
      },
      {
        type: "example",
        title: "Example — Three balances in Jakarta",
        children:
          "Dewi imagines Rp1,000,000 represented by a bank deposit, a possible retail CBDC and a dollar stablecoin converted into rupiah terms. She asks who owes her value, how she can spend or redeem it, and which currency can move against the rupiah. The same displayed number does not create the same rights.**",
      },
      {
        type: "paragraph",
        children:
          "CBDC projects range from research and pilots to launched systems. Check the relevant central bank's current publication before describing a country's status. A pilot announcement is not proof that a product is available to everyone.",
      },
    ],
  },
  {
    title: "Useful possibilities and realistic limits",
    shortTitle: "Useful possibilities and realistic limits",
    blocks: [
      {
        type: "paragraph",
        children:
          "Crypto assets can lose substantial value, and some can become worthless. Access can also be lost through theft, a failed provider, an incorrect transfer or a lost key. These risks are separate from whether the underlying technology is interesting. Regulators emphasise that protections vary by product, provider and country. A familiar brand, a professional website or a large online following does not establish that an activity is protected.",
      },
      {
        type: "paragraph",
        children:
          "For this course, use fictional balances and supplied examples. Never include real passwords, recovery words or private keys in an assignment. Later lessons introduce tools that illustrate arithmetic under stated assumptions. Their outputs are learning aids rather than instructions to trade. A useful beginner goal is to explain a product, identify the dependencies, and calculate an example correctly. You do not need to predict the next price move to meet that goal.",
      },
    ],
  },
  {
    title: "Local checks and the learning journey",
    shortTitle: "Local checks and the learning journey",
    blocks: [
      {
        type: "paragraph",
        children:
          "Level 0 builds orientation and safety. Levels 1 and 2 explain Bitcoin and wallet security before any transfer exercise. Level 3 introduces exchanges and spot markets. Levels 4 to 6 explain Ethereum, token research and decentralised finance. Level 7 develops careful analysis, and Level 8 connects position size, portfolio concentration and record keeping. Level 9 teaches research practice and decision habits. Level 10 brings the parts together in a graduation dossier.",
      },
      {
        type: "paragraph",
        children:
          "Read a lesson in order on your first visit. After a teaching section, stop and explain the idea aloud using an ordinary example. Work through the supplied practice before reading the answer. If your explanation relies on a word you cannot define, return to that section or the glossary. The level quiz then checks several ideas together. A wrong answer is useful information about what to revisit; it is not a reason to rush ahead.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check the legal status where you live",
      },
      {
        type: "paragraph",
        children:
          "Legal status is a question about an activity, a product, a provider and a place. A country may permit holding an asset while restricting its use for payments, the promotion of investment products, or access to leveraged trading. Tax duties can also exist even when an activity is unregulated.",
      },
      {
        type: "paragraph",
        children:
          "Use your central bank, financial regulator and tax authority as separate starting points. Compare the exact legal entity in a provider's terms with an official register. Record the date and the permission's scope. A licence for one service is not approval of every token, and a foreign licence does not establish permission to serve you locally.",
      },
      {
        type: "paragraph",
        children:
          "This course uses historical regulatory examples to teach a checking method. It cannot turn one country's rule into a global answer. If a notice is a proposal, consultation or pilot, describe it that way. Before an actual decision, obtain the current official guidance relevant to your residence and activity.",
      },
      {
        type: "example",
        title: "Example — Sophie checks a platform in Lyon",
        children:
          "Sophie, an engineer in Lyon, sees an advert for a crypto app offering a €50 welcome bonus (an invented amount for this example). She finds the company on neither ESMA's interim MiCA register nor the French regulator's site, so she closes the advert and notes the name.**",
      },
      {
        type: "heading",
        level: 3,
        children: "Everyday example",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "**Example  A family grocery ledger. Aisha buys CAD 90 of groceries for three adults sharing equally. The spreadsheet records CAD 30 owed by each adult, including Aisha's own share. One relative notices a duplicated entry and asks the family to correct it. In their spreadsheet, an agreed edit can remove the mistake. A public blockchain usually follows a different correction process: an accepted transfer is not simply erased by calling a help desk. The family example introduces shared records while showing why you must also ask who can change a record and what happens after a mistake.**",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Watch out  Do not fund an account to satisfy a lesson. All assessed activities can be completed with fictional information.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Write one question about technology and one about markets that you want this course to answer.",
          "2. Choose a practice activity that needs no money.",
          "3. In the grocery example, explain one similarity and one difference between a spreadsheet and a blockchain.",
        ],
        answers: [
          "1. A technology question could ask how a transaction is validated; a market question could ask how an order book produces an execution price. They require different evidence.",
          "2. Reading a public explorer or calculating a fictional order is sufficient. No wallet funding is necessary.",
          "3. Both record entries. The family can agree to edit its spreadsheet; a blockchain follows network rules for accepting history and cannot promise the same correction process.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does completing a blockchain course prove that a learner can predict market prices?",
        ],
        answers: [
          "Answer. No. Technical understanding and price forecasting are different skills. The course assesses understanding, risk awareness and the quality of practice.",
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "What to remember",
      },
      {
        type: "keyPoint",
        points: [
          "A ledger records entries; a blockchain is one method of maintaining a ledger.",
          "Control must be examined function by function.",
          "Learning can remain entirely separate from holding or trading.",
        ],
        checklist: false,
      },
      {
        type: "heading",
        level: 3,
        children: "Lesson completion check",
      },
      {
        type: "keyPoint",
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
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "NIST: Blockchain Technology Overview NISTIR 8202",
            url: "https://csrc.nist.gov/pubs/ir/8202/final",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "Bitcoin community: Bitcoin FAQ",
            url: "https://bitcoin.org/en/faq",
          },
          {
            title: "Bank of England: Bank of England — The digital pound",
            url: "https://www.bankofengland.co.uk/the-digital-pound",
          },
          {
            title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "FCA: Qualifying retail crypto ETNs and continuing restrictions",
            url: "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
          },
          {
            title: "SEC: Crypto asset interpretation effective March 2026",
            url: "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
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
  course: "crypto-orientation",
  description:
    "Distinguish a currency, an asset, a token, a service account and a trading contract.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-0",
  module: "crypto-orientation-and-safety",
  objectives: [
    "Distinguish a currency, an asset, a token, a service account and a trading contract.",
  ],
  position: 2,
  prerequisites: ["crypto-start-here"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["crypto-start-here", "crypto-loss-and-risk"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Distinguish a currency, an asset, a token, a service account and a trading contract.",
  seoTitle: "Using, Owning, Investing and Trading Crypto",
  slug: "crypto-using-owning-investing-trading",
  sources: [
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Circle: USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "ethereum.org: ethereum.org — Networks (testnets, faucets)",
      url: "https://ethereum.org/en/developers/docs/networks/",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — Etherscan: What It Is and How to Use It",
      url: "https://www.ledger.com/academy/topics/blockchain/etherscan-what-is-it-and-how-to-use-it",
    },
  ],
  status: "published",
  title: "Using, Owning, Investing and Trading Crypto",
};
const sections2: LessonSection[] = [
  {
    title: "Using, owning, investing and trading",
    shortTitle: "Using owning investing and trading",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Distinguish a currency, an asset, a token, a service account and a trading contract.",
      },
      {
        type: "paragraph",
        children:
          "Two items can display the same price while giving their holders very different rights. A bank balance, a shop voucher and a token worth EUR 50 are all expressed as value, but they are not interchangeable. This lesson gives you the vocabulary to separate money from an asset, possession from a service claim, and direct ownership from a contract that follows a price. These distinctions prevent many misunderstandings later in the course.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A balance is meaningful only when you can explain what it represents and who must perform for it to be usable.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what you want crypto to do",
      },
      {
        type: "paragraph",
        children:
          "Think about a house. You can use one by renting a room for a night. You can own one and live in it. You can invest in one, buying it to hold for many years. Or you can trade houses, buying and selling quickly to profit from price changes. Same object, four very different activities, each with its own time, effort and risk.",
      },
      {
        type: "paragraph",
        children:
          "The same distinction helps when discussing crypto. Before touching any, it helps to know which of the four you mean, because people who mix them up often take risks they never chose.",
      },
      {
        type: "definition",
        term: "Definition — Investing",
        children:
          "Putting money into an asset you plan to hold for a long time, accepting that its value may fall, in the hope it is worth more later.",
      },
      {
        type: "definition",
        term: "Definition — Trading",
        children:
          "Buying and selling frequently to try to profit from short-term price moves. It needs more time, skill and discipline than investing, and many people who try it lose money.",
      },
      {
        type: "paragraph",
        children:
          "Using crypto means spending or sending it, perhaps to pay someone abroad. Owning means holding some, for any reason, and taking responsibility for keeping it safe. The house analogy stops working on one point: a house still gives you shelter when prices fall. Most crypto produces nothing you can live in, so its value depends heavily on what others will pay.",
      },
      {
        type: "paragraph",
        children: "With those four words in mind, set them side by side.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare using, owning, investing and trading",
      },
      {
        type: "comparisonTable",
        columns: ["Activity", "Purpose", "Time horizon", "Effort", "Main risk"],
        rows: [
          [
            "Using",
            "Pay or send value",
            "Minutes to days",
            "Low, but careful",
            "Sending wrongly; price moves while you hold it",
          ],
          [
            "Owning",
            "Hold some, for any reason",
            "Any",
            "Ongoing security work",
            "Loss, theft or forgotten access",
          ],
          [
            "Investing",
            "Hold for possible long-term growth",
            "Years",
            "Research, then patience",
            "Long, deep price falls; the asset failing",
          ],
          [
            "Trading",
            "Profit from short-term moves",
            "Minutes to weeks",
            "High and constant",
            "Fast losses, fees, emotional mistakes",
          ],
        ],
        caption: "Four ways people deal with crypto",
      },
      {
        type: "example",
        title: "Example — Two friends in Toronto",
        children:
          'Aisha and Ben in Toronto each say they are "getting into crypto". Aisha means she might, one day, hold a small amount for years. Ben means he wants to trade every evening after work. They are talking about different activities with different risks, and Ben\'s plan needs far more skill and time than either of them yet has.**',
      },
      {
        type: "paragraph",
        children:
          "Whichever activity you choose, you will meet the same force: prices move a lot.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice how a 24/7 market feels different",
      },
      {
        type: "paragraph",
        children:
          "Stock markets close in the evening and at weekends. Forex pauses at the weekend. Crypto trades 24 hours a day, 7 days a week, every day of the year. Prices can move while you sleep, during a family meal or on a public holiday.",
      },
      {
        type: "paragraph",
        children:
          "That has practical effects. There is no closing bell to give you a pause. A sharp move on a Sunday night can greet you on Monday morning. And because price feeds are commonly available around the clock, it is tempting to check it constantly. Constant checking feeds emotional decisions, which Level 9 covers in depth.",
      },
      {
        type: "example",
        title: "Example — Sunday in Rome",
        children:
          "Marco in Rome spends a Sunday lunch checking his phone every ten minutes, watching an invented coin swing up and down by 8%. By evening he has changed his mind three times and enjoyed none of the meal. Nothing about the coin changed his long-term plan; the open market changed his mood.**",
      },
      {
        type: "paragraph",
        children:
          "So how do you build skill in markets that commonly operate around the clock, without risking money while you learn?",
      },
    ],
  },
  {
    title: "Coins, tokens and stablecoins",
    shortTitle: "Coins tokens and stablecoins",
    blocks: [
      {
        type: "paragraph",
        children:
          "A coin is commonly the native asset of its own network, such as BTC on Bitcoin or ETH on Ethereum. A token is commonly an asset represented by a contract or other issuance mechanism on an existing network. Terminology varies, so inspect the actual system. A token can represent access, governance participation, a claim, a collectible or very little beyond a transferable entry. Its name alone cannot establish those rights.",
      },
      {
        type: "paragraph",
        children:
          "A stablecoin aims to maintain a reference value, often one unit of a national currency. That target does not make it identical to the referenced currency. Reserves, redemption rights, market liquidity and issuer powers must be examined. A central bank digital currency, where issued, is a different arrangement involving a central bank; it is not another name for Bitcoin or a privately issued stablecoin. We will examine stablecoins in detail at Level 3 before relying on them in any DeFi example.",
      },
    ],
  },
  {
    title: "Signing control and provider claims",
    shortTitle: "Signing control and provider claims",
    blocks: [
      {
        type: "paragraph",
        children:
          "In self custody, a person controls signing material that the network recognises as authority to spend. The wallet does not normally contain the coins as files; it helps manage keys and interact with ledger records. If someone else acquires that authority, the network may accept their validly signed transaction. Legal ownership disputes can still exist, but they do not automatically prevent an on-chain transfer.",
      },
      {
        type: "paragraph",
        children:
          "In third-party custody, a provider controls some or all of the keys and shows you an account balance. Your ability to withdraw depends on its procedures, obligations and financial condition. The provider may pool assets or impose restrictions under its terms. Ask whether customer assets are segregated, what happens in insolvency and what insurance actually covers. A login password restores access to a service account; it does not necessarily give you independent control of the underlying crypto asset.",
      },
      {
        type: "paragraph",
        children: "Identify the right and the dependency",
      },
      {
        type: "comparisonTable",
        columns: ["Holding", "Main right or control", "Important dependency"],
        rows: [
          [
            "Bank deposit",
            "Claim against bank under account terms",
            "Bank and applicable protection scheme",
          ],
          [
            "Shop voucher",
            "Purchase entitlement under voucher terms",
            "Shop honouring the voucher",
          ],
          [
            "Self-custodied BTC",
            "Network-recognised spending authority",
            "Keys and network rules",
          ],
          [
            "Exchange BTC balance",
            "Provider account claim and withdrawal rights",
            "Provider custody and solvency",
          ],
          [
            "Stablecoin",
            "Token rights defined by issuer and contract",
            "Reserves redemption terms and network",
          ],
          [
            "Perpetual contract",
            "Contractual price exposure",
            "Margin execution and venue terms",
          ],
        ],
      },
    ],
  },
  {
    title: "Spot holdings and contracts on price",
    shortTitle: "Spot holdings and contracts on price",
    blocks: [
      {
        type: "paragraph",
        children:
          "Buying an asset in a spot market generally involves an exchange of assets for current delivery or credit under the venue's settlement arrangement. A derivative is a contract whose value depends on something else, such as a crypto price. A futures or perpetual position can gain or lose with a price without giving the holder the same rights as holding the underlying asset. Margin, liquidation and contract terms introduce additional risks.",
      },
      {
        type: "paragraph",
        children:
          "A token also does not automatically represent company shares. Governance rights may concern software parameters rather than company profits. A tokenised claim needs enforceable terms that identify the claim, its issuer and any restrictions. Treat statements about dividends, property ownership or redemption as claims to verify in legal and product documentation. For a beginner, a useful description is: I hold this particular asset or contract, through this custody arrangement, with these stated rights and dependencies.",
      },
    ],
  },
  {
    title: "Fractions prices and paper practice",
    shortTitle: "Fractions prices and paper practice",
    blocks: [
      {
        type: "paragraph",
        children:
          "Most crypto assets can be divided into smaller units. One bitcoin contains 100 million satoshis. Buying 0.01 BTC is buying a fraction of a bitcoin, not a different asset that is inherently cheaper in economic terms. If the illustrative price is EUR 40,000 for one BTC, 0.01 BTC has a quoted value of EUR 400 before costs. A high whole-unit price does not require you to buy a whole unit.",
      },
      {
        type: "paragraph",
        children:
          "Always attach units to numbers. A quantity of 50 tokens, a price of EUR 2 per token and a position value of EUR 100 describe three different things. The currency after the slash in a market such as BTC/EUR is the quote currency used to state the price. Your home-currency result can also change with currency conversion. Keeping quantity, price and total value separate will make later fee, position-size and portfolio calculations easier.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand why crypto has no demo account",
      },
      {
        type: "paragraph",
        children:
          "You can learn crypto without buying anything. Many services offer simulated trading, and a paper record needs only fictional prices and a notebook. Those exercises help you practise decisions and arithmetic while keeping real money out of the activity.",
      },
      {
        type: "paragraph",
        children:
          "A demo is a model. It may omit thin liquidity, queue position, partial fills, network fees, funding, withdrawal holds and the pressure of a real loss. A profitable simulation therefore does not prove that the same result could have been executed or would recur.",
      },
      {
        type: "paragraph",
        children:
          "Start by writing what you intended to do, the information available then, the assumed fill and all costs. Add the outcome later without rewriting the original decision. Level 9 develops this into a complete paper-testing method. No part of the course requires a funded account.",
      },
      {
        type: "paragraph",
        children:
          "Think of a birdwatcher. They learn the birds by watching and taking notes, not by catching them.",
      },
      {
        type: "example",
        title: "Example — Arjun's eight weeks in Bengaluru",
        children:
          'Arjun, a software tester in Bengaluru, keeps a paper record for eight weeks. He imagines a ₹10,000 holding (an invented amount for this example) and writes a line every Sunday. By week five he notices he wants to "buy" after every rise and "sell" after every fall. That pattern would have cost real money. He found it for free.**',
      },
      {
        type: "heading",
        level: 3,
        children: "Meet testnets the practice networks",
      },
      {
        type: "paragraph",
        children:
          "A testnet is a separate network used for development and practice. Its test assets generally have no intended real-money value. It can help you understand addresses, transaction status and signing, but its fees, activity and security conditions need not match a production network.",
      },
      {
        type: "paragraph",
        children:
          "Treat a testnet as a practice road with its own rules. Use a separate empty practice wallet with fresh recovery material and no connection to real holdings. Reach documentation and any faucet through verified channels. A faucet is a service that distributes test assets; a fake faucet can still ask you for secrets or harmful permissions.",
      },
      {
        type: "paragraph",
        children:
          "This manuscript supplies paper examples instead of requiring a testnet. You can complete every learning objective using those examples. Never import a wallet holding savings merely to make a classroom exercise easier.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand tiny test amounts later and why fees matter",
      },
      {
        type: "paragraph",
        children:
          "A small transfer can help check whether a supported route currently works. It is useful only when its asset, network, address, memo and amount meet the recipient's rules. A test below a deposit minimum may fail to credit and teach the wrong lesson.",
      },
      {
        type: "paragraph",
        children:
          "A successful test does not certify the recipient or insure a second transfer. Details can change, an interface can be malicious, and a larger amount may face different limits. Repeat the entire check before any later action. The course itself remains a paper exercise.",
      },
      {
        type: "example",
        title: "Example — A fee inside a small budget",
        children:
          "A learner in Chicago models a US$20 purchase with a US$2 fee deducted from that budget. Only US$18 buys the asset. Before exit costs, that asset must rise from US$18 to US$20, about 11.11%, to recover the original spending. If the fee were added on top, the cash outlay would instead be US$22. State the fee convention before calculating.**",
      },
      {
        type: "heading",
        level: 3,
        children: "Everyday example",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "**Example  Three things labelled EUR 50. Luc in France has EUR 50 in a bank account, a EUR 50 bookshop voucher and 25 fictional tokens quoted at EUR 2 each. The bank balance can support ordinary payments under the account's terms. The voucher can usually be used only with the shop and may expire. The token's quoted value depends on a market and an available buyer; its issuer may promise no redemption at all. Luc cannot conclude that all three items have identical liquidity or protection just because each currently displays EUR 50.**",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Watch out  Never assume that a token, exchange balance or derivative receives bank deposit protection.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Classify cash, a shop voucher, self-custodied BTC, an exchange balance, a perpetual position and a bank deposit using the table.",
          "2. At EUR 40,000 per BTC, calculate the quoted value of 0.025 BTC before fees.",
          "3. Explain what you still need to know about a token described as digital property.",
        ],
        answers: [
          "1. Cash is directly held money; the voucher and bank deposit are claims under different terms; self-custodied BTC provides signing control; the exchange balance is custodial; the perpetual is a derivative.",
          "2. 0.025 multiplied by EUR 40,000 equals EUR 1,000. The unit is euros of quoted value, not 1,000 BTC.",
          "3. Read the terms to identify the property, issuer, enforceability, transfer restrictions and redemption process. A label is insufficient.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a token quoted in dollars automatically have the protections of a dollar bank deposit?",
        ],
        answers: [
          "Answer. No. A quotation or peg target does not determine the issuer, custody arrangement, redemption right or deposit protection.",
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "What to remember",
      },
      {
        type: "keyPoint",
        points: [
          "Identify rights before comparing prices.",
          "Separate custody from market exposure.",
          "Write quantities and currencies alongside every number.",
        ],
        checklist: false,
      },
      {
        type: "heading",
        level: 3,
        children: "Lesson completion check",
      },
      {
        type: "keyPoint",
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
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "Circle: USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "ethereum.org: ethereum.org — Networks (testnets, faucets)",
            url: "https://ethereum.org/en/developers/docs/networks/",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — Etherscan: What It Is and How to Use It",
            url: "https://www.ledger.com/academy/topics/blockchain/etherscan-what-is-it-and-how-to-use-it",
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
  course: "crypto-orientation",
  description:
    "Recognise price risk, access risk and operational risk before considering any exposure.",
  estimatedMinutes: 11,
  learningPath: "crypto",
  level: "level-0",
  module: "crypto-orientation-and-safety",
  objectives: [
    "Recognise price risk, access risk and operational risk before considering any exposure.",
  ],
  position: 3,
  prerequisites: ["crypto-using-owning-investing-trading"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "crypto-using-owning-investing-trading",
    "crypto-scams-and-safe-learning",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Recognise price risk, access risk and operational risk before considering any exposure.",
  seoTitle: "Understand the Different Ways Money Can Be Lost",
  slug: "crypto-loss-and-risk",
  sources: [
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title: "ethereum.org: ethereum.org — Networks (testnets, faucets)",
      url: "https://ethereum.org/en/developers/docs/networks/",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — Etherscan: What It Is and How to Use It",
      url: "https://www.ledger.com/academy/topics/blockchain/etherscan-what-is-it-and-how-to-use-it",
    },
    {
      title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
      url: "https://bitcoin.org/en/you-need-to-know",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — What To Know About Cryptocurrency and Scams",
      url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
    },
    {
      title: "Coinbase Help: Coinbase Help — Crypto sent to the wrong address",
      url: "https://help.coinbase.com/en/coinbase/trading-and-funding/sending-or-receiving-cryptocurrency/i-sent-funds-to-the-wrong-address-how-do-i-get-them-back",
    },
  ],
  status: "published",
  title: "Understand the Different Ways Money Can Be Lost",
};
const sections3: LessonSection[] = [
  {
    title: "Price falls and recovery arithmetic",
    shortTitle: "Price falls and recovery arithmetic",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Recognise price risk, access risk and operational risk before considering any exposure.",
      },
      {
        type: "paragraph",
        children:
          "When someone says they lost money in crypto, ask how the loss happened. A falling price, a stolen key and an insolvent exchange can all reduce a person's wealth, but they are different failures. Each calls for different precautions. This lesson turns a vague warning about risk into a practical map you can use throughout the course.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Name the failure mechanism before selecting a safety measure.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Feel how volatile crypto can be",
      },
      {
        type: "paragraph",
        children:
          "Volatility describes how far and how fast a price moves. A savings account barely moves. Crypto can move more in a day than many shares move in a year.",
      },
      {
        type: "paragraph",
        children:
          "A real example shows the scale. In November 2022, CNBC reported that bitcoin had peaked at more than US$68,000 a year earlier and was trading below US$18,000. Bitcoin fell roughly 75% from its November 2021 high to its November 2022 low. Over the same period the whole crypto market, once valued at roughly US$3 trillion, fell to around US$900 billion.",
      },
      {
        type: "paragraph",
        children:
          'The US Commodity Futures Trading Commission (CFTC) notes that virtual currencies are more volatile than traditional currencies, and warns of sudden price swings and "flash crashes". None of this tells you what prices will do next. It tells you what they have done, which is enough to plan for.',
      },
      {
        type: "example",
        title: "Example — A fall in Seoul",
        children:
          "Ji-woo in Seoul buys ₩1,000,000 of a coin (an invented amount for this example). A year later, after a 75% fall like the one above, her holding is worth ₩250,000. She has lost ₩750,000 on paper. The next section shows why getting it back is harder than it sounds.**",
      },
      {
        type: "heading",
        level: 3,
        children: "Do the recovery arithmetic",
      },
      {
        type: "paragraph",
        children:
          "Losses and gains are not symmetrical. If something falls by half, a 50% rise only takes it back to three-quarters of where it started. To return to the start, it must double.",
      },
      {
        type: "formula",
        expression:
          "Gain needed to recover = L ÷ (1 − L), where L is the loss as a decimal.",
        explanation:
          "a 50% loss (L = 0.5) needs 0.5 ÷ 0.5 = 1, a 100% gain. A 75% loss needs 0.75 ÷ 0.25 = 3, a 300% gain.",
      },
      {
        type: "comparisonTable",
        columns: ["Fall", "Gain needed to get back to the start"],
        rows: [
          ["10%", "about 11%"],
          ["25%", "about 33%"],
          ["50%", "100%"],
          ["75%", "300%"],
          ["90%", "900%"],
        ],
        caption: "Gain needed to recover from a fall",
      },
      {
        type: "paragraph",
        children:
          "So Ji-woo's ₩250,000 would need to quadruple to reach ₩1,000,000 again. There is no rule saying it ever will; many coins never recover.",
      },
      {
        type: "learningLink",
        title: "Explore the Drawdown calculator",
        description:
          "enter a starting amount such as A$1,000 and a fall of 50%, then 75%. Notice how the gain needed grows much faster than the fall. The tool gives estimates for learning, not guarantees.",
        href: "/tools/drawdown-calculator",
      },
      {
        type: "paragraph",
        children:
          "Big falls hurt more when you watch them hour by hour, and crypto markets commonly continue around the clock.",
      },
      {
        type: "paragraph",
        children:
          "Selling realises the trading result under the applicable accounting rules, but leaving the holding unsold does not remove the economic loss or guarantee recovery. A price may recover, remain low or fall further. A plan based solely on waiting until the price returns to your purchase price may never be completed. The purchase price matters for your records, but buyers in the current market are not obliged to restore it.",
      },
    ],
  },
  {
    title: "Access mistakes, theft and permanent loss",
    shortTitle: "Access mistakes theft and permanent loss",
    blocks: [
      {
        type: "paragraph",
        children:
          "Access risk concerns the ability to control or retrieve assets. A lost recovery method may leave a self-custody wallet inaccessible. A leaked key may let another person transfer assets. A frozen provider account or an exchange failure may block withdrawals. Operational mistakes include selecting an unsupported network, omitting a required memo, or signing a harmful transaction. The ledger may function exactly as designed while the user suffers a loss.",
      },
      {
        type: "paragraph",
        children:
          "Other failures involve the asset or application itself. A stablecoin can depart from its target price, a contract can be exploited, and a bridge can fail. These failures can occur while a user's own key remains secure. A strong password addresses one problem; it cannot repair an underfunded issuer or a vulnerable contract. Later lessons teach specific checks for each activity. For now, describe the failure mechanism before choosing a precaution.",
      },
      {
        type: "heading",
        level: 3,
        children: "Guard against mistakes and lost access",
      },
      {
        type: "paragraph",
        children:
          "A valid address can still be the wrong destination. Many address formats include checksums that detect typing errors, so a one-character typo may be rejected. A checksum cannot tell that a correctly formed address belongs to an attacker rather than your friend.",
      },
      {
        type: "example",
        title: "Example — The wrong saved contact",
        children:
          "A learner in Berlin intends to pay a supplier but copies a look-alike address from transaction history. The wallet accepts the format because it is a valid address. The funds follow the address that was actually authorised. Using a verified source and comparing the complete destination addresses the real risk.**",
      },
      {
        type: "paragraph",
        children:
          "Lost signing material creates a different problem. If no usable backup or recovery arrangement remains, a ledger holding may still exist while nobody can authorise spending. If someone copies usable signing material, both people may be able to act. Changing an app password does not revoke the copied key.",
      },
      {
        type: "paragraph",
        children:
          "Levels 2 and 3 teach the practical distinctions: asset identity, networks, memos, backups, permissions and provider records. Avoid guessing which remedy fits before identifying the failure.",
      },
      {
        type: "example",
        title: "Example — The shared screen in Jakarta",
        children:
          'Budi in Jakarta joins a video call with someone claiming to be from "wallet support" who asks him to share his screen. While Budi follows instructions, the caller sees his recovery words. Within minutes his balance of Rp5,000,000 (an invented amount for this example) is gone. Real support staff never need to see your recovery words or keys.**',
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-0/lesson-3-rId16.png",
        description: [
          "Market: price or demand changes.",
          "Access: keys or a provider become unavailable.",
          "Operation: the wrong route or permission causes loss. These branches identify different mechanisms, not mutually exclusive guarantees.",
        ],
        width: 1187,
        height: 556,
        alt: "A loss tree branches into market, access and operational failures.",
        caption:
          "Name the failure mechanism. One precaution does not address every branch, and asset or contract failures can affect several branches.",
      },
    ],
  },
  {
    title: "Money for everyday needs comes first",
    shortTitle: "Money for everyday needs comes first",
    blocks: [
      {
        type: "paragraph",
        children:
          "The US Consumer Financial Protection Bureau describes an emergency fund as cash set aside for unplanned expenses or financial emergencies. Without one, a surprise bill can push you into debt. It belongs in a safe, accessible place such as a bank or credit union account.",
      },
      {
        type: "paragraph",
        children:
          "The order matters. Emergency fund first; any crypto later, and only with money you can afford to lose completely. The CFTC advises speculating only with money you can afford to lose. Australia's ASIC Moneysmart says that if a crypto-asset fails, you will most likely lose all the money you put in. A 2023 SEC investor alert also suggests paying off high-interest debt before speculative investments. The UK FCA's message is \"be prepared to lose all your money\".",
      },
      {
        type: "paragraph",
        children:
          "Realistic expectations follow from this. Nobody can promise you a return in crypto. Some people have made money; many have lost it. The CFTC states plainly that no investment or trading strategy comes with a guarantee. If you hear otherwise, you are probably hearing a sales pitch, or a scam, which the scam and learning routine lesson in Level 0 covers.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Warning — Never use essential money. Rent, school fees, food money, loan repayments and your emergency fund should never go into crypto. A 75% fall in that money would be a crisis, not a lesson.",
      },
      {
        type: "paragraph",
        children: "Now put these ideas into practice.",
      },
      {
        type: "paragraph",
        children:
          "Food, rent, school costs, debt payments and emergency needs do not become less important because a market looks exciting. Money that must be available next month cannot safely be treated as a long-term experiment that might become inaccessible. A loss budget is an amount whose loss would not disrupt the needs and obligations it is meant to respect. This course does not prescribe a percentage of your income or savings to invest. People have different obligations, income stability and local protections.",
      },
    ],
  },
  {
    title: "What borrowing adds to a loss",
    shortTitle: "What borrowing adds to a loss",
    blocks: [
      {
        type: "paragraph",
        children:
          "Borrowed money introduces an obligation that can survive a failed investment. A person who borrows GBP 500 to buy an asset still owes the lender if the asset becomes worthless. Trading with leverage also changes the relationship between the position's size and the funds supporting it. Adverse movement can trigger liquidation under contract rules before the learner expects it.",
      },
      {
        type: "paragraph",
        children:
          "Leverage is often advertised through possible gains. Examine the loss mechanism with the same arithmetic. A small percentage move on a large position can consume a substantial part of the supporting margin, and fees or funding add costs. We will calculate these relationships at Level 8. At this stage, identify borrowing and leverage as additional obligations rather than a shortcut around a small budget. A beginner practice exercise does not require either.",
      },
    ],
  },
  {
    title: "Match each precaution to its risk",
    shortTitle: "Match each precaution to its risk",
    blocks: [
      {
        type: "paragraph",
        children:
          "Diversifying holdings may reduce concentration in one asset, but it does not restore a lost wallet key. A test transfer may reveal that a route currently works, but it does not prove that the next transaction is correctly addressed. A stop order can be triggered without filling at the desired price, and it cannot force a failed exchange to reopen. Precautions have specific jobs and limits.",
      },
      {
        type: "paragraph",
        children:
          "Build layered protection: understand the asset, protect access, check the service, inspect each action and limit affordable exposure. Record the assumptions you cannot verify. An unresolved risk can be a reason to stop an activity even when other checks look good. This is a practical skill rather than pessimism: the learner who identifies the actual failure mechanism can choose a relevant response instead of relying on one reassuring feature.",
      },
      {
        type: "paragraph",
        children:
          "Think about the last time a payment went wrong for you. Perhaps a shop charged you twice, or a card was used by someone else. In many countries you could call your bank, explain, and after some forms the money came back. That ability to undo is so normal that most people never notice it.",
      },
      {
        type: "heading",
        level: 3,
        children: "See why a crypto transfer usually cannot be reversed",
      },
      {
        type: "paragraph",
        children:
          "A refund in everyday life usually depends on someone with authority and a process: the shop, a bank or a payment provider. A confirmed native Bitcoin transfer has no general customer-service reversal procedure. The recipient can voluntarily make a new return payment, but that is different from the sender cancelling the first one.",
      },
      {
        type: "paragraph",
        children:
          "Other crypto systems can have issuer freeze powers, administrator interventions or recovery arrangements. Recent blocks can also be affected by reorganisations under a network's consensus rules. These possibilities do not give an ordinary sender a reliable undo button.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Warning — Check before you authorise. Identify the network, spending conditions and service rules rather than assuming every asset behaves alike. Public transaction visibility helps document an event; it does not itself grant anyone the power to reverse it.",
      },
      {
        type: "example",
        title: "Example — A second loss in Istanbul",
        children:
          'Mehmet in Istanbul loses ₺20,000 (an invented amount for this example) to a fake trading site. A week later a "recovery firm" messages him, saying it has traced his funds and needs ₺5,000 to release them. He checks: the firm has no record with any regulator, and it contacted him first. He reports the original scam to the police and ignores the offer.**',
      },
      {
        type: "example",
        title: "Example — Grace's spreadsheet in Sydney",
        children:
          "Grace in Sydney sets up a simple spreadsheet before she ever buys anything. It has columns for the date, what happened, the amount, its value in Australian dollars, fees and a note. Later, she can compare her columns with her tax authority's own guidance and add anything it asks for, instead of rebuilding a year of history from memory.**",
      },
      {
        type: "heading",
        level: 3,
        children: "Build the “test small, check twice” habit",
      },
      {
        type: "paragraph",
        children:
          "Build a pre-send routine around the asset, network, destination, memo or tag, recipient minimum, amount and fee. Obtain the instructions independently and inspect the final request, including the trusted device display where available. If you cannot understand the action, pause.",
      },
      {
        type: "paragraph",
        children:
          "A valid small test may help check the route. Wait for the expected recipient credit, then repeat the checks for the actual transfer. Do not send a duplicate just because a display is slow. Identify whether the first action is pending, confirmed or awaiting service processing.",
      },
      {
        type: "example",
        title: "Example — Checking a route in Rome",
        children:
          "Giulia models a €3,000 transfer with an extra €1.50 network fee for a valid test. That extra fee is 1.50 ÷ 3,000 × 100 = 0.05% of the planned amount. It buys information about one transfer route at one time. It does not buy insurance or guarantee a later transfer.**",
      },
      {
        type: "heading",
        level: 3,
        children: "Everyday example",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "**Example  Two losses with different causes. Maya in the UK studies a fictional GBP 100 holding. In Case A its market value falls to GBP 60; the access credentials still work. In Case B the market price is unchanged, but someone obtains the wallet's signing material and transfers the whole holding. Waiting for a market recovery might change Case A's value, but it cannot retrieve Case B's transferred assets. A protective measure must address the specific cause. Maya records Case A as market risk and Case B as key compromise, rather than calling both volatility.**",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Watch out  Neither a stop order nor a test transfer removes every way an asset can be lost.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Calculate the percentage fall from GBP 100 to GBP 60.",
          "2. Which risk is addressed by a backup of recovery material? Which is not?",
          "3. An exchange is unavailable during a price fall. Identify two simultaneous risks.",
        ],
        answers: [
          "1. The loss is GBP 40 divided by GBP 100, or 40 percent. Returning from GBP 60 to GBP 100 would require a 66.67 percent gain on the smaller balance.",
          "2. A secure usable backup addresses loss of access. It does not prevent a market fall and does not make an exposed secret safe.",
          "3. The learner faces market movement and provider or operational unavailability. A sell instruction may not be executable during the outage.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Can a stop order protect assets from a leaked recovery phrase?",
        ],
        answers: [
          "Answer. No. A stop order concerns trade execution. Recovery material concerns signing authority, and a thief may bypass the venue where the stop exists.",
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "What to remember",
      },
      {
        type: "keyPoint",
        points: [
          "Different loss mechanisms need different precautions.",
          "An unsold loss is still a reduction in current value.",
          "An affordability boundary should be decided before market pressure arrives.",
        ],
        checklist: false,
      },
      {
        type: "heading",
        level: 3,
        children: "Lesson completion check",
      },
      {
        type: "keyPoint",
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
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title: "ethereum.org: ethereum.org — Networks (testnets, faucets)",
            url: "https://ethereum.org/en/developers/docs/networks/",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — Etherscan: What It Is and How to Use It",
            url: "https://www.ledger.com/academy/topics/blockchain/etherscan-what-is-it-and-how-to-use-it",
          },
          {
            title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
            url: "https://bitcoin.org/en/you-need-to-know",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — What To Know About Cryptocurrency and Scams",
            url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
          },
          {
            title:
              "Coinbase Help: Coinbase Help — Crypto sent to the wrong address",
            url: "https://help.coinbase.com/en/coinbase/trading-and-funding/sending-or-receiving-cryptocurrency/i-sent-funds-to-the-wrong-address-how-do-i-get-them-back",
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
  course: "crypto-orientation",
  description:
    "Recognise pressure tactics and make a safe plan for the rest of the course.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-0",
  module: "crypto-orientation-and-safety",
  objectives: [
    "Recognise pressure tactics and make a safe plan for the rest of the course.",
  ],
  position: 4,
  prerequisites: ["crypto-loss-and-risk"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["crypto-loss-and-risk"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Recognise pressure tactics and make a safe plan for the rest of the course.",
  seoTitle: "Spot Scams and Build a Safe Learning Routine",
  slug: "crypto-scams-and-safe-learning",
  sources: [
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "CFTC: Beware Virtual Currency Pump and Dump Schemes",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "MetaMask: I have been hacked or scammed",
      url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — What To Know About Cryptocurrency and Scams",
      url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
    },
    {
      title:
        "CFTC: CFTC — Six Warning Signs of Online Financial Romance Frauds",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/RomanceScam.html",
    },
    {
      title: "Trezor: Trezor — Dusting attacks and airdrop scam tokens",
      url: "https://trezor.io/support/troubleshooting/coins-tokens/dusting-attacks-airdrop-scam-tokens",
    },
  ],
  status: "published",
  title: "Spot Scams and Build a Safe Learning Routine",
};
const sections4: LessonSection[] = [
  {
    title: "The request behind a convincing story",
    shortTitle: "The request behind a convincing story",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Recognise pressure tactics and make a safe plan for the rest of the course.",
      },
      {
        type: "paragraph",
        children:
          "Scams often begin with an ordinary conversation or an apparently helpful message. The attacker wants you to act before you verify. You do not need to memorise every scam name to defend your learning routine. Focus on the request: what authority, money or private information is someone asking you to hand over, and how did you independently confirm that request?",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Before acting, state exactly what you would give the requester: money, information or authority.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "See why crypto attracts scammers",
      },
      {
        type: "paragraph",
        children:
          "Pickpockets love crowded markets: everyone is distracted, and a stolen wallet vanishes into the crowd. Crypto gives scammers similar conditions online. It moves fast, crosses borders in minutes and, as the loss and safety lesson in Level 0 showed, a confirmed transfer generally cannot be reversed.",
      },
      {
        type: "paragraph",
        children:
          "The US Federal Trade Commission (FTC) offers one rule worth remembering: only scammers demand payment in cryptocurrency. A real tax office, utility company or employer will not insist you pay in crypto.",
      },
      {
        type: "paragraph",
        children:
          "Scammers use many stories, but a few patterns repeat. The most damaging one starts with a friendly message.",
      },
      {
        type: "heading",
        level: 3,
        children: "Recognise the relationship investment scam",
      },
      {
        type: "paragraph",
        children:
          'Imagine a stranger who befriends you at a bus stop, chats every day for weeks, and only then mentions a "sure" investment their uncle runs. By then you trust them. That slow build is the heart of this scam.',
      },
      {
        type: "definition",
        term: 'Definition — Relationship investment scam ("pig butchering")',
        children:
          'A fraud in which a scammer builds a friendship or romance over weeks, then persuades the victim to "invest" in crypto on a fake platform, encouraging ever larger deposits before taking everything. The slang name comes from the idea of fattening a pig before slaughter.',
      },
      {
        type: "paragraph",
        children:
          'The FBI describes a clear sequence. Contact begins on social media, dating apps, messaging groups or a "wrong number" text, and soon moves to a private messaging app. The scammer builds trust with flattery and shared stories, sometimes using deepfake video. Then comes the pitch: crypto trading, an "AI" programme or gold.',
      },
      {
        type: "paragraph",
        children:
          "The US Commodity Futures Trading Commission (CFTC) lists six warning signs: the new friend wants to move to a private app; they message often but can never meet; they claim to be wealthy from crypto or currency trading; they recommend a trading website that only accepts crypto; they tell you to send funds to their wallet or platform; and you seem to make a lot of money quickly.",
      },
      {
        type: "example",
        title: "Example — The wrong-number message in Toronto",
        children:
          'Claire, a pharmacist in Toronto, receives a text meant for "Amy". She replies politely, and the sender, "David", apologises and keeps chatting. After three weeks of friendly messages he mentions his crypto earnings and offers to "teach" her. Claire remembers the CFTC\'s warning signs: a private app, no meetings, wealth from trading. She stops replying and reports the number.**',
      },
      {
        type: "paragraph",
        children:
          "The pitch may lead to a platform, and those platforms deserve a closer look.",
      },
      {
        type: "heading",
        level: 3,
        children: "See through fake platforms and withdrawal fees",
      },
      {
        type: "paragraph",
        children:
          "A fake trading platform can display whatever numbers its operator chooses. A rising balance or an early withdrawal may be part of the deception rather than evidence of real trading. The next request often asks for more money to unlock a withdrawal, pay an invented tax or repair an account.",
      },
      {
        type: "example",
        title: "Example — A second payment in Toronto",
        children:
          "Amira sees an apparent C$800 profit on an unfamiliar site. A message demands C$150 to release it. She opens no new payment instruction. She preserves the message and checks the company through independent official routes. A number on a dashboard is not proof that withdrawable assets exist.**",
      },
      {
        type: "paragraph",
        children:
          "Legitimate services can have disclosed charges, and a self-custody transaction may need a native network fee. The red flag is an unsolicited, unexplained advance-payment demand combined with claimed profits or authority. Verify the actual fee process independently. Paying a stranger because a screen says tax does not satisfy a real tax duty.",
      },
      {
        type: "paragraph",
        children:
          "Fake support messages claim that an account needs urgent repair. Pump groups encourage coordinated purchases while insiders may sell. A claim that a market strategy cannot lose conflicts with the risks of price, access and counterparties. Evaluate the actual service and its rights, rather than treating a convincing conversation as evidence that the investment exists.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-0/lesson-4-rId17.png",
        description: [
          "First contact → move to a private app → build trust → investment pitch → small deposit and an allowed early withdrawal → fake profits and pressure to add more → a claimed withdrawal fee or tax, then silence.",
          "The image flags the private-app move and the small early withdrawal. A dashed branch marks a follow-up recovery scam promising to recover lost money for a fee.",
        ],
        width: 1980,
        height: 1061,
        alt: "Seven connected scam stages lead from first contact to a fake withdrawal fee; a later recovery scam branches off.",
        caption:
          "A possible relationship-fraud sequence. An early withdrawal does not establish a genuine investment.",
      },
    ],
  },
  {
    title: "False support, giveaways and recruitment",
    shortTitle: "False support giveaways and recruitment",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Spot impersonation, fake giveaways and fake support",
      },
      {
        type: "paragraph",
        children:
          "Impersonation means pretending to be someone you already trust. The FTC warns that scammers pose as well-known companies, banks, government agencies and celebrities, contacting people by text, email, social media or pop-up warnings, and demanding payment in crypto.",
      },
      {
        type: "paragraph",
        children:
          'A common version is the fake giveaway: a post, often using a famous face or a hacked account, promising to send back double whatever you send. No genuine giveaway asks you to pay first. Another is fake support: you post a problem online, and a "helpdesk agent" messages you privately, pointing you to a fake website or asking for screen access or recovery words.',
      },
      {
        type: "example",
        title: "Example — The helpful agent in Paris",
        children:
          'Camille in Paris posts on a forum that a transfer is delayed. A message arrives from "Official Support", with a logo and a ticket number, asking her to "validate" her wallet by entering her twelve recovery words on a form. Camille remembers the rule: legitimate support staff do not need your recovery words or private keys. She ignores the message and contacts the company through its own website instead. Level 2 covers phishing in detail.**',
      },
      {
        type: "paragraph",
        children:
          "Impersonation borrows trust. The next group of scams sells a promise of growth instead.",
      },
      {
        type: "heading",
        level: 3,
        children: "Avoid doubling fake mining and recruitment schemes",
      },
      {
        type: "paragraph",
        children:
          'Some schemes promise fixed daily or weekly returns: "earn 2% a day", "double your money in a month". Often they claim the profit comes from secret trading, "mining" machines you rent, or an AI robot. In a Ponzi scheme, early investors are paid with later investors\' money, so it collapses when new money slows. Many add multi-level marketing: bonuses for recruiting friends and family.',
      },
      {
        type: "definition",
        term: "Definition — Ponzi scheme",
        children:
          'A fraud that pays "returns" to existing investors from new investors\' deposits rather than from any real profit, so it must collapse once new money dries up.',
      },
      {
        type: "paragraph",
        children:
          'A related trap is the pump-and-dump group, where organisers hype a small token so that members buy, then sell their own holdings at the top. The token research lesson in Level 5 explains these in detail. "Cloud mining" offers are covered in the mining and fee lessons in Level 1.',
      },
      {
        type: "paragraph",
        children:
          "All of these promise a fixed, high return with little risk. As the ownership and paper practice lesson in Level 0 showed, crypto prices fall as well as rise, so steady profit does not fit the asset. Scams can also arrive through ordinary payments between people.",
      },
      {
        type: "paragraph",
        children:
          "Do not use the message's phone number, link or QR code as the verification route. A sender name, profile picture or blue badge can be copied or obtained; it is not enough by itself. A password manager may help notice an unfamiliar domain, but it cannot certify an application's safety. If you cannot establish the source independently, pause rather than letting the message supply both the claim and its supposed proof.",
      },
    ],
  },
  {
    title: "Secrets, signatures and airdrop bait",
    shortTitle: "Secrets signatures and airdrop bait",
    blocks: [
      {
        type: "paragraph",
        children:
          "Recovery words and private keys are not normal support information. Someone who obtains them may gain authority over assets, even without the device or account password. A legitimate-looking form that asks for them should stop the process. Remote-access software is also powerful: it can expose screens, files and account sessions. Do not install it because an unsolicited caller claims it is necessary for a refund or wallet repair.",
      },
      {
        type: "paragraph",
        children:
          "A signature request may be dangerous even when no network fee is shown. Some signatures authorise orders or permissions that can be used later. At this level, use a simple rule: if you cannot explain the message and the authority it grants, do not approve it. Level 2 will separate connecting, signing, sending and approving in detail. Familiarity with a site's colours does not replace inspection of the action.",
      },
      {
        type: "paragraph",
        children: "Read the action rather than the promise",
      },
      {
        type: "comparisonTable",
        columns: ["Message", "Requested action", "Reason to stop"],
        rows: [
          [
            "Double your deposit today",
            "Send money before receiving reward",
            "Advance-payment giveaway pattern",
          ],
          [
            "Support must synchronise your wallet",
            "Reveal recovery material",
            "Transfers signing authority",
          ],
          [
            "Only our group knows the next pump",
            "Buy under secrecy and urgency",
            "Manipulation and insider exit risk",
          ],
          [
            "We can recover stolen coins",
            "Pay unverified recovery agent",
            "Additional fraud risk",
          ],
          [
            "Scan this code to update your account",
            "Visit an unverified encoded destination",
            "QR code does not prove identity",
          ],
        ],
      },
    ],
  },
  {
    title: "Payment pressure and independent checks",
    shortTitle: "Payment pressure and independent checks",
    blocks: [
      {
        type: "paragraph",
        children:
          "An address copied from recent transaction history may belong to an attacker who inserted a lookalike entry. This is often called address poisoning. Shortened displays can hide differences in the middle of a long address. Obtain the destination through the intended recipient's verified instructions and compare the full information. A QR code is a method of encoding information, not a certificate of identity.",
      },
      {
        type: "paragraph",
        children:
          "Urgency narrows attention. A message that threatens immediate loss, promises a vanishing opportunity or asks you not to tell anyone is trying to shorten your checking time. Make a pause routine: identify the sender, name the requested action, identify the authority involved, verify independently and decide whether the action is necessary. A genuine issue should be assessed through the provider's actual procedures, not through the caller's deadline.",
      },
      {
        type: "heading",
        level: 3,
        children: "Handle P2P and mobile money payments with care",
      },
      {
        type: "paragraph",
        children:
          "In a peer-to-peer sale, a platform may hold crypto in escrow while the buyer pays through a bank or payment service. That arrangement protects only what its rules actually cover. A screenshot, SMS alert or urgent message is not proof of settled receipt.",
      },
      {
        type: "paragraph",
        children:
          "Check your own account through its genuine application and follow the platform's identity, payment and dispute procedures. A payment from a different person's account can involve fraud or later disputes. Some payment methods remain reversible after a visible credit. Ask the payment provider what finality means for that method.",
      },
      {
        type: "paragraph",
        children:
          "Do not release escrow solely because someone is rushing you, and do not move the deal into private chat for a discount. If details do not match, pause and use the platform's official process. This course asks you to analyse the scenario, not conduct a real trade.",
      },
    ],
  },
  {
    title: "Build a safe, repeatable learning plan",
    shortTitle: "Build a safe repeatable learning plan",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use a notebook with three headings: what I understand, what I still need to verify and what I will not do. Keep examples fictional and omit private account details from screenshots. Schedule short study sessions, complete the practice answers and revisit difficult terms. Before any optional real-world activity, repeat the relevant safety checks rather than assuming that passing a quiz makes every application safe.",
      },
      {
        type: "paragraph",
        children:
          "If you suspect a scam, stop engaging with the requester, preserve non-secret evidence such as messages and transaction identifiers, and use independently verified provider or local reporting channels. Do not pay an unsolicited recovery agent. Some incidents need urgent technical help, but urgency should not give an unknown person your secrets. The incident lesson later in the course supplies a more specific response tree. For now, your best first action is to prevent the next harmful authorisation.",
      },
      {
        type: "example",
        title: "Example — Lena's plan in Berlin",
        children:
          'Lena, a designer in Berlin, pins a one-page plan above her desk: €0 in crypto until she finishes Level 3, and never act on a message she did not start. When a stranger later offers "guidance" on an investment app, she reads her plan and deletes the message.**',
      },
      {
        type: "heading",
        level: 3,
        children: "Everyday example",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "**Example  The urgent refund message. Thabo in South Africa receives a message saying that an exchange owes him ZAR 2,000. To claim it, he must scan a QR code and enter recovery words before midnight. The refund amount makes the request attractive, but the requested secret would hand over signing authority. Thabo closes the message, opens the provider through his verified bookmark and checks its support procedure. He does not need to prove the sender's criminal identity before declining an unnecessary request for recovery material.**",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Watch out  Never share real recovery material, private keys or authentication secrets with support, course reviewers or recovery agents.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Write a response plan for the refund message without contacting the sender.",
          "2. List three pieces of information that must never appear in a course submission.",
          "3. A familiar site asks for an unexplained signature without a fee. Should you approve? Explain.",
        ],
        answers: [
          "1. Stop, preserve the message without exposing secrets, verify support through a known official route, and decline the recovery-word request. Report through appropriate verified channels if needed.",
          "2. Real private keys, recovery words and account passwords. Optional passphrases and authentication backup codes also belong outside submissions.",
          "3. No. A fee-free signature can still grant valuable authority. Inspect the message and its purpose; decline if you cannot explain it.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is a QR code from an apparent support agent an independent verification method?",
        ],
        answers: [
          "Answer. No. It is supplied by the same requester and may encode an attacker-controlled destination. Verify through a separate known source.",
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "What to remember",
      },
      {
        type: "keyPoint",
        points: [
          "A persuasive story does not establish a legitimate request.",
          "Independent verification uses a separate known route.",
          "A pause checklist works across many scam names.",
        ],
        checklist: false,
      },
      {
        type: "heading",
        level: 3,
        children: "Lesson completion check",
      },
      {
        type: "keyPoint",
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
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "CFTC: Beware Virtual Currency Pump and Dump Schemes",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "MetaMask: I have been hacked or scammed",
            url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — What To Know About Cryptocurrency and Scams",
            url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
          },
          {
            title:
              "CFTC: CFTC — Six Warning Signs of Online Financial Romance Frauds",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/RomanceScam.html",
          },
          {
            title: "Trezor: Trezor — Dusting attacks and airdrop scam tokens",
            url: "https://trezor.io/support/troubleshooting/coins-tokens/dusting-attacks-airdrop-scam-tokens",
          },
        ],
      },
    ],
  },
];

export const cryptoLevel0Lessons: LessonDocument[] = [
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
];
