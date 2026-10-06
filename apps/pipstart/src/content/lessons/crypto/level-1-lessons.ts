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
  course: "bitcoin",
  description:
    "Explain Bitcoin's purpose and early history without assuming it solves every payment problem.",
  estimatedMinutes: 14,
  learningPath: "crypto",
  level: "level-1",
  module: "bitcoin-foundations",
  objectives: [
    "Explain Bitcoin's purpose and early history without assuming it solves every payment problem.",
  ],
  position: 1,
  prerequisites: ["crypto-scams-and-safe-learning"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["shared-ledger-checks-and-security"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain Bitcoin's purpose and early history without assuming it solves every payment problem.",
  seoTitle: "What Is Bitcoin",
  slug: "what-is-bitcoin",
  sources: [
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin community: Bitcoin FAQ",
      url: "https://bitcoin.org/en/faq",
    },
    {
      title: "MIT OpenCourseWare: Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title: "NIST: Blockchain Technology Overview NISTIR 8202",
      url: "https://csrc.nist.gov/pubs/ir/8202/final",
    },
    {
      title: "Bitcoin community: Bitcoin Core Validation",
      url: "https://bitcoin.org/en/bitcoin-core/features/validation",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — When Was Bitcoin Invented? The Complete History and Timeline",
      url: "https://www.ledger.com/academy/topics/crypto/when-was-bitcoin-invented",
    },
  ],
  status: "published",
  title: "What Is Bitcoin",
};
const sections1: LessonSection[] = [
  {
    title: "Why copying money is a problem",
    shortTitle: "Why copying money is a problem",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain Bitcoin's purpose and early history without assuming it solves every payment problem.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin is both the name of a network and, in ordinary conversation, the name of the asset used on that network. The system is easier to understand when you separate those meanings. First examine the payment problem it was designed to address. Then look at the rules that define the asset. Its history explains the design, while its current usefulness and price require their own evidence.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Study the network rules and the market asset as related but different subjects.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Start in 2008 when trust in banks was shaken",
      },
      {
        type: "paragraph",
        children:
          "Inventions make more sense once you know what was happening when they appeared. Bitcoin's design was published in the autumn of 2008, in the middle of the worst financial crisis many people alive had seen.",
      },
      {
        type: "paragraph",
        children:
          "The US Federal Reserve's own history describes December 2007 to June 2009 as the longest recession since the Second World War. Housing was at the centre of it: US home prices fell by about 30% from mid-2006 to mid-2009, and US unemployment peaked at 10%. Governments and central banks stepped in with rescue packages, near-zero interest rates and large asset purchases.",
      },
      {
        type: "paragraph",
        children:
          "For ordinary people, the crisis raised an uncomfortable question. Your savings sit in a bank, and the bank's records say how much is yours. What happens when the institutions keeping those records get into trouble? Many people began to wonder whether money had to depend so heavily on a few trusted middlemen.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin's creator seems to have had that question in mind, as a newspaper headline hidden in Bitcoin's first block will show. But the crisis did not invent the idea of digital cash. People had been trying to build it for decades, and to see why they kept failing, you need to meet the problem that blocked them.",
      },
      {
        type: "heading",
        level: 3,
        children: "See why digital money is hard to make",
      },
      {
        type: "paragraph",
        children:
          'Think about a ¥1,000 note in your wallet. Once you hand it to a shopkeeper, it has left your hand, and you cannot give the same note to someone else. Physical cash solves the "spend it once" problem without anyone checking.',
      },
      {
        type: "paragraph",
        children:
          "Digital things behave differently. A photo or a document is a string of data, and data can be copied perfectly. That is wonderful for holiday pictures and a disaster for money.",
      },
      {
        type: "example",
        title: "The voucher that was copied",
        children:
          "Kenji in Osaka has a digital voucher worth ¥5,000 (an invented amount for this example) saved as a file on his phone. Nothing stops him emailing the same file to a bakery and a bookshop at once. If neither shop can check with anyone, Kenji has spent ¥5,000 twice, and one shop holds a worthless copy.",
      },
      {
        type: "definition",
        term: "Double-spending",
        children:
          "Spending the same digital money more than once, by sending copies of it to different people. A digital cash system needs a rule for preventing conflicting spends from both becoming accepted payments under its operating assumptions.",
      },
      {
        type: "paragraph",
        children:
          "A file can show what it is, but on its own it cannot prove that it hasn't already been given to someone else. Somebody has to keep track. For most of the history of digital payments, that somebody has been a bank.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice how banks solve the problem today",
      },
      {
        type: "paragraph",
        children:
          "When you pay with a bank card or app, you are not sending a file of money. You are asking your bank to change two numbers in a record it controls: yours goes down, the shop's goes up. Because the bank holds the only official record, a second attempt to spend the same balance is refused.",
      },
      {
        type: "example",
        title: "Paying through the middleman",
        children:
          "Lucía in Mexico City pays MX$900 for a pair of shoes using her banking app (an invented amount for this example). Her bank checks her balance, reduces it by MX$900 and tells the shop's bank to add MX$900 on the other side. If Lucía tries to spend the same MX$900 again a second later, the bank's record already shows it gone, so the payment is declined.",
      },
      {
        type: "paragraph",
        children:
          "This can bring benefits. If the shoes never arrive, Lucía may be able to dispute the payment under the applicable terms, and the bank can freeze stolen cards. It also has costs. The Bitcoin whitepaper pointed out that because banks must handle disputes, payments are never completely final, and the cost of that mediation is passed on as fees. Everyone also depends on the record-keeper staying honest, solvent and online.",
      },
      {
        type: "definition",
        term: "Trusted third party",
        children:
          "An organisation, such as a bank or payment company, that both sides of a payment rely on to keep the record and settle disputes.",
      },
      {
        type: "paragraph",
        children:
          "So the challenge was clear: could people build digital cash with rules for rejecting conflicting accepted spends, without putting one company in charge of the record? Several brilliant people tried before Bitcoin.",
      },
      {
        type: "paragraph",
        children:
          "If a digital money file worked that way, the sender could copy it and claim to pay two different shops with the same value. A signature can show that a spending instruction is authorised, but signatures alone do not tell everyone which of two conflicting instructions came first.",
      },
    ],
  },
  {
    title: "The ideas before Bitcoin",
    shortTitle: "The ideas before Bitcoin",
    blocks: [
      {
        type: "paragraph",
        children:
          "Bitcoin grew out of a small online community of programmers and cryptographers, often called cypherpunks, who believed strong cryptography could change how money worked. Each of their experiments solved part of the puzzle.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Project",
          "Person",
          "When",
          "Main idea",
          "What was still missing",
        ],
        rows: [
          [
            "DigiCash / eCash",
            "David Chaum",
            "1980s–90s",
            "Private digital payments using clever cryptography",
            "A central company still issued the money and checked for double-spending; the company did not survive",
          ],
          [
            "Hashcash",
            "Adam Back",
            "1997",
            "Make the sender do a small amount of computer work, to make spam costly",
            'It was an anti-spam tool, not money, but the "costly work" idea became important',
          ],
          [
            "b-money",
            "Wei Dai",
            "1998",
            "Everyone keeps a record of who owns what; money created through computer work",
            "Stayed a proposal; never built as a working network",
          ],
          [
            "Bit Gold",
            "Nick Szabo",
            "proposed around 1998–2005",
            '"Unforgeable" units created by computer work, recorded in a shared title registry',
            "Stayed a proposal; agreeing on one shared record was not fully solved",
          ],
        ],
        caption: "Earlier digital-cash ideas and what each was missing",
      },
      {
        type: "paragraph",
        children:
          'Look at the pattern. DigiCash showed digital payments could be private, but kept a company at the centre. Hashcash showed that "proof of costly work" could be checked cheaply by anyone. B-money and Bit Gold imagined money living in a shared record with no central issuer; Szabo argued that money depending on a trusted third party is exposed to that party\'s failures.',
      },
      {
        type: "paragraph",
        children:
          "Earlier research had already explored distributed agreement, digital cash and proof of work. Bitcoin combined such ideas into a working open network for recording and checking payments. A paper published on 31 October 2008 set out to provide that missing piece.",
      },
    ],
  },
  {
    title: "Satoshi and the beginning of Bitcoin",
    shortTitle: "Satoshi and the beginning of Bitcoin",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Read the whitepaper of 31 October 2008",
      },
      {
        type: "paragraph",
        children:
          'On 31 October 2008, someone using the name Satoshi Nakamoto posted a nine-page paper to an email list for people interested in cryptography. Its title was "Bitcoin: A Peer-to-Peer Electronic Cash System".',
      },
      {
        type: "definition",
        term: "Peer-to-peer",
        children:
          "A system where participants deal with each other directly, instead of routing everything through one central organisation.",
      },
      {
        type: "paragraph",
        children:
          "The paper's opening set out the goal plainly. Digital signatures already solved part of the problem, it said, but the main benefits are lost if a trusted third party is still needed to prevent double-spending. Its answer was to make the history of transactions public. Every payment would be announced to a network of computers that agree on one time-ordered record, so anyone receiving bitcoin could check the coins hadn't been spent before.",
      },
      {
        type: "paragraph",
        children:
          "Participants who did the costly work of adding new pages to the record would be rewarded with new coins and fees. The whitepaper cites Wei Dai's b-money and Adam Back's Hashcash directly. You'll see how the shared record fits together in the next lesson, and how the costly work (mining) operates in the mining and fee lessons in Level 1.",
      },
      {
        type: "paragraph",
        children:
          "Satoshi Nakamoto is a pseudonym whose real identity has not been reliably established in public. Yet the paper never asked readers to trust its author; its whole point was that you shouldn't have to. Within a few months, the idea moved from paper to working software.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look inside the genesis block",
      },
      {
        type: "paragraph",
        children:
          "In January 2009, the first Bitcoin software was released, and the network began. Its very first block of transactions, known as the genesis block, carries the date 3 January 2009.",
      },
      {
        type: "paragraph",
        children:
          'Inside that block, Satoshi placed a line of text: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks". It was the front-page headline of the British newspaper The Times that day, about the UK government considering more help for struggling banks.',
      },
      {
        type: "paragraph",
        children:
          "The headline did two jobs. It worked like a timestamp: a photo of someone holding today's newspaper cannot be older than that paper, and in the same way the block could not have been made before that date. It also read like a comment on why Bitcoin existed. Whatever Satoshi's exact intention, the link to the 2008 crisis is hard to miss.",
      },
      {
        type: "paragraph",
        children:
          "One curious detail: the 50 bitcoin reward in the genesis block cannot be spent, because of the way the software treats that first block. The course does not infer a motive from this technical detail. The first block was symbolic; an early documented transfer between two people came days later.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow the first payment to Hal Finney",
      },
      {
        type: "paragraph",
        children:
          'One of the first people to run the software was Hal Finney, a cryptographer from the same online community. In 2004 he had built RPOW (reusable proofs of work), which extended Hashcash so that pieces of "proof of work" could be passed from person to person.',
      },
      {
        type: "paragraph",
        children:
          "On 12 January 2009, Satoshi sent 10 bitcoin to Finney. The payment was recorded in block 170 and is remembered as the first Bitcoin transaction between two people. Bitcoin had no market price at all then. It was a test between enthusiasts, showing the system did what the paper described.",
      },
      {
        type: "example",
        title: "A test with no price tag",
        children:
          'Priya in Pune and her cousin in Bengaluru install a new messaging app on its first day, and Priya sends "hello" to check it works. Nobody would call that message valuable, yet it proves the system runs end to end. Finney\'s 10 bitcoin were similar: a working test, not a purchase. Years later, though, bitcoin came to have a market price, which brings us to pizza.',
      },
      {
        type: "paragraph",
        children:
          "The Bitcoin white paper appeared in 2008 under the name Satoshi Nakamoto. That name is pseudonymous; it does not establish a verified person's identity. It is a design document, not a promise of a rising price or a complete description of every feature added later. Historical attribution should therefore distinguish the original author, earlier research and subsequent development rather than inventing a single known founder with permanent control.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-1-rId18.png",
        width: 1980,
        height: 1272,
        alt: "Selected historical milestones. Dates are historical; the spacing is schematic and shows no price forecast.",
        caption:
          "Selected historical milestones. Dates are historical; the spacing is schematic and shows no price forecast.",
      },
    ],
  },
  {
    title: "The network, the coin and early use",
    shortTitle: "The network the coin and early use",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Count the cost of Bitcoin Pizza Day",
      },
      {
        type: "paragraph",
        children:
          "For more than a year, bitcoin was mostly swapped between hobbyists. Then on 22 May 2010, a programmer named Laszlo Hanyecz paid 10,000 BTC for two pizzas. He had posted an offer online days earlier, and a forum user known as Jercos ordered the pizzas and received the bitcoin. It is recorded as the first documented purchase of a good with bitcoin. The coins were worth about US$41 at the time, and those two numbers show how little each bitcoin was worth that day.",
      },
      {
        type: "formula",
        expression:
          "Implied price per bitcoin = total value of the purchase ÷ number of bitcoin paid",
        explanation:
          "divide what the goods were worth by the number of coins handed over. Here that is US$41 ÷ 10,000 BTC ≈ US$0.0041, or less than half a US cent per bitcoin.",
      },
      {
        type: "paragraph",
        children:
          'Today, 22 May is celebrated as Bitcoin Pizza Day, often told as a joke about "the most expensive pizzas ever". The more useful point is that bitcoin had become something people would accept for goods, which is what the whitepaper hoped for.',
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'Hindsight is not a strategy. Stories like Pizza Day are often used to make people feel they are "missing out" and must buy now. The people involved could not know what would happen. A famous story tells you nothing about what any price will do next, and scammers use such stories to rush you.',
      },
      {
        type: "paragraph",
        children:
          "Pizza Day showed Bitcoin working as money. Soon after, the person who started it all stepped away.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice when Satoshi stepped away",
      },
      {
        type: "paragraph",
        children:
          "According to bitcoin.org, Satoshi left the project in late 2010 without revealing much about themselves. Other volunteers carried on improving the software, and Bitcoin has kept running without its founder.",
      },
      {
        type: "paragraph",
        children:
          "This shows something unusual about Bitcoin. There is no chief executive, head office or customer-service line. Bitcoin.org compares it to email: nobody owns the network, and developers cannot force changes onto everyone. Changes need broad agreement from the people running the software.",
      },
      {
        type: "paragraph",
        children:
          "That brings freedom and responsibility. With a bank, someone can reverse a mistake. With Bitcoin, nobody can step in to undo a payment or restore lost access for you. The loss and safety lesson in Level 0 explained why such losses are often permanent, and the transaction and fee lessons in Level 1 will show how confirmations increase confidence in settlement.",
      },
      {
        type: "paragraph",
        children:
          "With the founder gone and the network open to anyone, people were left to argue about what Bitcoin should become.",
      },
      {
        type: "paragraph",
        children:
          "Wallets can display the same holding in BTC or satoshis, which may make the number look very different without changing its value. A denomination change does not change the holding.",
      },
    ],
  },
  {
    title: "What Bitcoin can and cannot promise",
    shortTitle: "What Bitcoin can and cannot promise",
    blocks: [
      {
        type: "paragraph",
        children:
          "Bitcoin can be used for transfers, held as an asset or studied as an example of distributed verification. Public participation and independent validation can be useful, particularly when a person wants to inspect rules rather than accept a provider's balance statement. These features have trade-offs: on-chain fees vary, confirmation takes time, and public records can reveal information when linked to people.",
      },
      {
        type: "paragraph",
        children:
          "A merchant also has practical concerns. The merchant must decide how to price goods, handle refunds, manage exchange-rate movement and accept a confirmation policy. A BTC payment is not automatically cheaper or faster than every existing payment method. A service that makes the process convenient may introduce custody and provider dependence. Judge the actual route, including any conversion and service fees, rather than treating the network's general description as a complete retail payment comparison.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin rules can let a validating participant reject an invalid spend or a block that violates those rules. They do not certify that a recipient is honest, that an exchange is solvent or that a purchase contract will be honoured. A correctly authorised payment to a fraudster can still be accepted by the network. Technical validity and a good economic decision are different questions.",
      },
      {
        type: "paragraph",
        children:
          "Decentralisation also does not eliminate all concentration or outages. Mining, software distribution, internet access and service providers are separate dependencies. You can improve your understanding by asking which dependency matters for your activity. A learner reading an explorer, a merchant receiving payment and a customer leaving assets on an exchange rely on different arrangements. The next lesson examines how a full node checks the ledger rather than assuming every published record is trustworthy.",
      },
      {
        type: "example",
        title: "Two views at one dinner table",
        children:
          "Chloé in Lyon wants to send €40 (an invented amount for this example) to a friend abroad and sees Bitcoin as a payment tool. Her uncle in Munich only thinks of it as a long-term holding. Both describe real ways people use it, and neither view makes bitcoin a sensible place for money Chloé needs.",
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
          "One cake paid for twice. A bakery in Germany sells a cake for EUR 20. Imagine that a customer could copy a digital payment file and send it to both the bakery and a bookshop. Each shop might believe it had received the same EUR 20. A reliable payment system needs an agreed record that prevents the same available value from being accepted twice. Bitcoin applies transaction rules and a shared chain to its own asset; it does not turn a copied euro file into an authorised euro payment. The analogy explains the problem, rather than claiming that Bitcoin and euro banking have identical rights.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  A public ledger does not establish that a merchant, exchange or investment promise is trustworthy.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Explain double spending without using the word blockchain.",
          "2. Convert 0.0035 BTC to satoshis.",
          "3. Name one thing the network can validate and one thing it cannot promise.",
        ],
        answers: [
          "1. It is an attempt to spend the same available value more than once. A system needs consistent records to reject conflicting spends.",
          "2. 0.0035 multiplied by 100,000,000 equals 350,000 satoshis.",
          "3. It can check spending authorisation and transaction rules. It cannot promise a recipient will deliver goods or that a market price will rise.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Is Satoshi Nakamoto a publicly verified personal identity?"],
        answers: [
          "Answer. No. It is the pseudonymous name associated with the 2008 white paper and early development. The course does not speculate about identity.",
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
          "Bitcoin addresses double spending through rules and ordered history.",
          "BTC quantities and home-currency valuations describe different things.",
          "A valid transfer is not proof of a safe purchase.",
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
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin community: Bitcoin FAQ",
            url: "https://bitcoin.org/en/faq",
          },
          {
            title: "MIT OpenCourseWare: Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title: "NIST: Blockchain Technology Overview NISTIR 8202",
            url: "https://csrc.nist.gov/pubs/ir/8202/final",
          },
          {
            title: "Bitcoin community: Bitcoin Core Validation",
            url: "https://bitcoin.org/en/bitcoin-core/features/validation",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — When Was Bitcoin Invented? The Complete History and Timeline",
            url: "https://www.ledger.com/academy/topics/crypto/when-was-bitcoin-invented",
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
  course: "bitcoin",
  description:
    "Explain blocks, hashes, nodes and consensus as connected parts of one system.",
  estimatedMinutes: 14,
  learningPath: "crypto",
  level: "level-1",
  module: "bitcoin-foundations",
  objectives: [
    "Explain blocks, hashes, nodes and consensus as connected parts of one system.",
  ],
  position: 2,
  prerequisites: ["what-is-bitcoin"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "what-is-bitcoin",
    "keys-signatures-and-bitcoin-transactions",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain blocks, hashes, nodes and consensus as connected parts of one system.",
  seoTitle: "How a Shared Ledger Is Checked and Secured",
  slug: "shared-ledger-checks-and-security",
  sources: [
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
      url: "https://developer.bitcoin.org/devguide/block_chain.html",
    },
    {
      title: "NIST: Blockchain Technology Overview NISTIR 8202",
      url: "https://csrc.nist.gov/pubs/ir/8202/final",
    },
    {
      title: "Bitcoin community: Bitcoin Core Validation",
      url: "https://bitcoin.org/en/bitcoin-core/features/validation",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
      url: "https://developer.bitcoin.org/devguide/p2p_network.html",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Mining",
      url: "https://developer.bitcoin.org/devguide/mining.html",
    },
  ],
  status: "published",
  title: "How a Shared Ledger Is Checked and Secured",
};
const sections2: LessonSection[] = [
  {
    title: "Transactions become linked blocks",
    shortTitle: "Transactions become linked blocks",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain blocks, hashes, nodes and consensus as connected parts of one system.",
      },
      {
        type: "paragraph",
        children:
          "A shared ledger is useful only if participants can check it. In Bitcoin, a full node checks transactions and blocks against its rules rather than accepting a miner's claim at face value. This lesson explains blocks, hashes and validation in plain language. You do not need to write code to understand the separation between proposing a record and checking whether that record is acceptable.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A block must satisfy validation rules before accumulated work can matter for its acceptance.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask who keeps the record when nobody is in charge",
      },
      {
        type: "paragraph",
        children:
          "Earlier in the course you saw Bitcoin's big promise: digital cash with rules for rejecting conflicting accepted spends, with no bank keeping the books. That raises a practical question. If nobody is in charge, who keeps the record, and why should anyone believe it?",
      },
      {
        type: "paragraph",
        children:
          "Picture a tool library run by neighbours in Toronto. Each loan of a drill or ladder is written in one book, so the system depends on one keeper. Now imagine every member keeps a full copy of the loan book and adds each new line at the same time. If one person quietly changes their copy, the other copies disagree, and the change is noticed.",
      },
      {
        type: "paragraph",
        children:
          "That is the heart of a blockchain: a record that many independent computers store and check, so no single keeper can rewrite it unseen. The analogy soon stops working, though. Neighbours trust one another's handwriting; Bitcoin nodes independently check applicable rules. They rely on mathematics that makes any change to the record stand out.",
      },
      {
        type: "paragraph",
        children:
          "The tool that makes this possible is called hashing, and it is where the record's security starts.",
      },
      {
        type: "heading",
        level: 3,
        children: "Pack transactions into blocks",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin does not add payments to the record one at a time. It groups them into blocks, like pages in a ledger. Each block has two main parts: a list of transactions and a short summary at the top called the block header.",
      },
      {
        type: "definition",
        term: "Block",
        children:
          "A batch of Bitcoin transactions plus a header that summarises them and links the block to the one before it.",
      },
      {
        type: "paragraph",
        children:
          "The header does not repeat every transaction. Instead it holds a single fingerprint that summarises all of them, called the merkle root. You can picture it as a hash of hashes: each transaction is hashed, those hashes are paired and hashed again, and so on, until one hash remains. If any transaction in the block changes, the merkle root changes too.",
      },
      {
        type: "paragraph",
        children:
          "The header also contains the hash of the previous block's header. That one detail is what turns a pile of pages into a chain. You'll study what is inside an individual transaction in the transaction and fee lessons in Level 1. For now, focus on how the pages are tied together.",
      },
      {
        type: "heading",
        level: 3,
        children: "Link each block to the one before it",
      },
      {
        type: "paragraph",
        children:
          "Think of a numbered receipt book where every new receipt must quote the fingerprint of the receipt before it. Receipt 3 quotes receipt 2's fingerprint, receipt 2 quotes receipt 1's, and so on back to the start. Bitcoin's chain works the same way, starting with the genesis block you met in the Bitcoin origins lesson in Level 1. The developer guide calls a block's distance from that first block its block height.",
      },
      {
        type: "formula",
        expression:
          "Block N's header contains: hash of block (N − 1)'s header + merkle root of block N's transactions + other details",
        explanation:
          "each block points back to its parent by quoting the parent's hash, and summarises its own transactions in the merkle root. The block's own hash is then calculated from this header (Bitcoin runs SHA-256 twice over it).",
      },
      {
        type: "paragraph",
        children:
          "This chaining sounds simple, but it has a powerful consequence. It means you cannot quietly change one page without disturbing every page after it.",
      },
      {
        type: "paragraph",
        children:
          "The order matters because an output that has already been spent cannot be used again in a later accepted spend. A block is not merely a screenshot of balances; it is part of a history whose rules must hold from one accepted state to the next.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-2-rId19.png",
        width: 1980,
        height: 1542,
        alt: "Changing recorded data alters the later references. Validity checks and accumulated work are also required.",
        caption:
          "Changing recorded data alters the later references. Validity checks and accumulated work are also required.",
      },
    ],
  },
  {
    title: "Hashes as data fingerprints",
    shortTitle: "Hashes as data fingerprints",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Make a fingerprint of any piece of data",
      },
      {
        type: "paragraph",
        children:
          "Think about a fingerprint. It is tiny compared with a whole person, yet it identifies them. If you are given a fingerprint, you cannot rebuild the person from it, but you can check whether a particular person matches.",
      },
      {
        type: "paragraph",
        children:
          "A hash does the same job for data. Feed any data into a hash function, from one word to an entire book, and it produces a short, fixed-length code. Bitcoin uses SHA-256, part of the Secure Hash Standard published by the US National Institute of Standards and Technology (NIST), which explains that such digests are used to detect whether a message has changed.",
      },
      {
        type: "definition",
        term: "Hash",
        children:
          "A short, fixed-length code produced from any amount of data by a hash function. For the same specified function, identical data gives the same hash. A changed input will ordinarily produce a different output, although collisions are mathematically possible.",
      },
      {
        type: "paragraph",
        children:
          "SHA-256 always produces 256 bits. Written in hexadecimal (the digits 0–9 and letters a–f), that becomes a string of 64 characters.",
      },
      {
        type: "formula",
        expression:
          "Number of hex characters = 256 bits ÷ 4 bits per hex character = 64",
        explanation:
          "each hexadecimal character carries 4 bits of information, so a 256-bit hash is always written as 64 characters, however large the original data was.",
      },
      {
        type: "paragraph",
        children:
          "A fingerprint is only useful if it behaves predictably, so it helps to look at the rules a good hash follows.",
      },
      {
        type: "heading",
        level: 3,
        children: "Test the four rules of a good hash",
      },
      {
        type: "paragraph",
        children:
          "A good cryptographic hash gives the same output for the same exact input. Small changes normally produce a very different fingerprint. It should also be impractical to reconstruct a suitable original input from its hash, or find two distinct inputs with the same hash.",
      },
      {
        type: "paragraph",
        children:
          "The last point is an important qualification: possible inputs outnumber the fixed-size outputs, so collisions can exist mathematically. Security depends on finding a useful collision being computationally impractical under the function's assumptions. Say extremely unlikely to find, rather than claiming collisions are impossible.",
      },
      {
        type: "example",
        title: "One amount changes",
        children:
          'Compare the classroom messages "Pay Ji-woo 50000 won" and "Pay Ji-woo 90000 won". Their SHA-256 fingerprints differ even though only one part of the instruction changed. The changed fingerprint helps reveal altered data. It does not tell you whether the original payment instruction was truthful or sensible.',
      },
      {
        type: "heading",
        level: 3,
        children: "Use a hash to spot a change",
      },
      {
        type: "paragraph",
        children:
          "Suppose a project publishes a file and its expected hash through a trusted channel. After downloading the file, comparing its calculated hash with that value can help detect a damaged or different file.",
      },
      {
        type: "paragraph",
        children:
          "That check is only as trustworthy as the reference. If an attacker replaces both a file and the hash shown on a fake website, the two can match perfectly. Obtain software through verified channels and use the publisher's documented signature-verification process where appropriate. A matching hash does not prove that a publisher is honest or that software is harmless.",
      },
      {
        type: "paragraph",
        children:
          "The same distinction applies to a ledger: a hash makes data changes detectable, while validation rules and consensus determine which data the system accepts. Hashing a false statement does not turn it into a true one.",
      },
      {
        type: "paragraph",
        children:
          "Changing the data will ordinarily produce a different result. It is not encryption: hashing does not provide a decryption key that recovers the original text. It is also not a user password or proof that the input was truthful.",
      },
    ],
  },
  {
    title: "What a full node actually checks",
    shortTitle: "What a full node actually checks",
    blocks: [
      {
        type: "paragraph",
        children:
          "A full node independently validates the relevant Bitcoin history and new blocks under its configured consensus rules. Checks include valid spending authorisation, no spending of an already spent output, acceptable transaction structure and permitted issuance. If a miner proposes an invalid block, compliant nodes reject it even if its producer expended computing effort.",
      },
      {
        type: "paragraph",
        children:
          "Validation is different from looking up a balance on a website. An explorer presents information based on its own infrastructure. A full node checks the underlying records itself, although running one still requires appropriate software, storage and connectivity. You are not required to operate a node for this course. The important idea is that a miner proposes a block while a validating participant can check its rules. Large computing power does not grant permission to invent a spend from someone else's key.",
      },
      {
        type: "paragraph",
        children: "Different jobs in checking a ledger",
      },
      {
        type: "comparisonTable",
        columns: ["Component", "Job", "Does not establish"],
        rows: [
          [
            "Hash",
            "Fingerprint data and link references",
            "Truth of all input data",
          ],
          [
            "Digital signature",
            "Demonstrate spending authorisation",
            "Honesty of recipient",
          ],
          [
            "Full node",
            "Validate blocks and transactions",
            "Profitability of an investment",
          ],
          [
            "Miner",
            "Propose a block with acceptable work",
            "Permission to break consensus rules",
          ],
          [
            "Explorer",
            "Display indexed ledger information",
            "Independent verification by the viewer",
          ],
        ],
      },
      {
        type: "example",
        title: "A laptop in São Paulo",
        children:
          "Rafael in São Paulo runs a full node on an old laptop with a large external drive. Bitcoin.org's guide, at the time of writing, listed around 740 GB for the first download, or about 7 GB of disk if the node is set to discard old data after checking it (\"pruning\"). Rafael's node checks every block from the genesis block onward. He doesn't need anyone's permission, and his node is one of many independent judges of what counts as valid.",
      },
    ],
  },
  {
    title: "Proof of work and the guessing race",
    shortTitle: "Proof of work and the guessing race",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Ask who gets to write the next page",
      },
      {
        type: "paragraph",
        children:
          "Earlier in the course your payment waited in the mempool until a miner picked it for a block. But thousands of computers hold the same record, so who decides which of them writes the next page?",
      },
      {
        type: "paragraph",
        children:
          'Think of a savings group\'s shared notebook. If members voted on who writes next, one cheat could invent a hundred fake members and win every vote. Online, fake identities cost almost nothing, so "one person, one vote" cannot work.',
      },
      {
        type: "paragraph",
        children:
          'The Bitcoin whitepaper made votes cost something real. It proposed "one-CPU-one-vote": the right to add a block goes to whoever proves they have done a large amount of computing work. It built on Adam Back\'s Hashcash, the anti-spam idea from the Bitcoin origins lesson in Level 1.',
      },
      {
        type: "definition",
        term: "Mining",
        children:
          "Creating valid Bitcoin blocks, which requires showing proof of work. A miner is a person who runs mining machines, or the machine itself.",
      },
      {
        type: "paragraph",
        children: "That work turns out to be a guessing game.",
      },
      {
        type: "heading",
        level: 3,
        children: "Play the guessing game nonce and target",
      },
      {
        type: "paragraph",
        children:
          "Picture a lottery where anyone may print as many tickets as they like, but each ticket costs a little electricity. A ticket wins if its number is below a set limit. Nobody can predict a winning number, so the only strategy is to print tickets fast.",
      },
      {
        type: "paragraph",
        children:
          "That is close to what miners do. A miner builds a candidate block and hashes its header with SHA-256. The developer guide says the block is valid only if that hash is below a threshold called the target. Because any change scrambles a hash completely (the shared ledger lesson in Level 1), the miner cannot steer towards a winner. They change one small field, hash again and check.",
      },
      {
        type: "definition",
        term: "Nonce",
        children:
          "A number in the block header that miners change freely. Each new nonce gives ordinarily a different hash, like printing a new ticket.",
      },
      {
        type: "definition",
        term: "Target",
        children:
          "The threshold a block header's hash must fall below for the block to be valid. A lower target means fewer winning hashes, so more guesses are needed.",
      },
      {
        type: "example",
        title: "A toy version in Montréal",
        children:
          "Sophie in Montréal tries a classroom version on her laptop: a hash written in hexadecimal wins if it starts with four zeros. Each hex character has 16 possible values, so one guess has a 1 in 16 × 16 × 16 × 16 chance, which is 1 in 65,536. Add a fifth zero and it becomes 1 in 1,048,576. Real Bitcoin targets are far harder than Sophie's.",
      },
      {
        type: "formula",
        expression:
          "Expected number of guesses ≈ 1 ÷ (chance that one guess is below the target)",
        explanation:
          "at a 1 in 65,536 chance, you expect around 65,536 guesses before a win. It is an average, so a lucky miner wins sooner and an unlucky one later.",
      },
      {
        type: "paragraph",
        children:
          "The lottery analogy breaks down in a useful place. A lottery needs an official to confirm the winner. Bitcoin does not.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check the winner's work in a split second",
      },
      {
        type: "paragraph",
        children:
          "Finding a valid hash takes the network an enormous number of guesses. Checking it takes one: any node hashes the header once and compares it with the target. Hard to produce, quick to verify: that is what makes proof of work useful.",
      },
      {
        type: "paragraph",
        children:
          "Nodes check far more than the hash. A block with perfect proof of work but one invalid transaction, such as one spending an already-spent output, is rejected. So miners choose which transactions go in and in what order, while nodes decide what is valid. Miners usually prefer the highest fee rates, which is why your sat/vB choice in the transaction and fee lessons in Level 1 affected the wait.",
      },
      {
        type: "paragraph",
        children: "How long is that wait on average, and what keeps it steady?",
      },
      {
        type: "heading",
        level: 3,
        children: "Keep blocks near 10 minutes with the difficulty dial",
      },
      {
        type: "paragraph",
        children:
          "On average a new block arrives about every 10 minutes. No timer enforces this. It comes from how hard the guessing game is compared with how much guessing power is working on it, and because each guess is random, individual gaps vary widely.",
      },
      {
        type: "example",
        title: "New machines in Texas",
        children:
          "In an invented scenario, a mining company in Texas switches on thousands of new machines. The network now guesses faster, and blocks start arriving every 8 or 9 minutes.",
      },
      {
        type: "paragraph",
        children:
          "To correct such drift, every node recalculates the target every 2,016 blocks. The developer guide says the network aims for 2,016 blocks to take two weeks: 2,016 × 10 minutes = 20,160 minutes, or exactly 14 days. Faster than that, and mining becomes harder; slower, and it becomes less hard.",
      },
      {
        type: "definition",
        term: "Difficulty",
        children:
          "A number showing how hard it currently is to find a valid block, compared with the easiest possible block. Higher difficulty means a lower target.",
      },
      {
        type: "formula",
        expression:
          "New difficulty ≈ old difficulty × (14 days ÷ days the last 2,016 blocks actually took)",
        explanation:
          "if blocks came faster than two weeks, the fraction is above 1 and difficulty rises. The developer guide notes that one adjustment can raise difficulty by at most 300% (four times) or cut it by at most 75%.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Time for the last 2,016 blocks",
          "Calculation",
          "Change in difficulty",
        ],
        rows: [
          ["12 days", "14 ÷ 12 ≈ 1.167", "Up about 16.7%"],
          ["14 days", "14 ÷ 14 = 1", "No change"],
          ["16 days", "14 ÷ 16 = 0.875", "Down 12.5%"],
          ["3 days", "14 ÷ 3 ≈ 4.67, capped at 4", "Up 300% (the maximum)"],
        ],
        caption: "How the dial responds (invented timings for this example)",
      },
      {
        type: "paragraph",
        children:
          "If the Texas machines made 2,016 blocks take 12 days, difficulty would rise about 16.7%, pulling the pace back towards 10 minutes. If miners switch off, the dial turns the other way. All this guessing costs money, so why do miners keep going?",
      },
      {
        type: "paragraph",
        children:
          "The network adjusts the difficulty under its rules so that block production responds to changes in total mining effort. Individual block times still vary; a target average is not an appointment for the next block.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-2-rId20.png",
        width: 1980,
        height: 1318,
        alt: "A schematic guessing race. A valid hash is only one of the checks required for an accepted block.",
        caption:
          "A schematic guessing race. A valid hash is only one of the checks required for an accepted block.",
      },
    ],
  },
  {
    title: "Competing valid histories and tamper resistance",
    shortTitle: "Competing valid histories and tamper resistance",
    blocks: [
      {
        type: "paragraph",
        children:
          "Two valid blocks can briefly appear near the same time, so different nodes may initially see different tips. Subsequent work can resolve that competition, leaving transactions in the discarded branch to be reconsidered. This is a reorganisation. Deeper accepted history is ordinarily harder to replace because a competing valid history must overcome more accumulated work, but the word irreversible is too absolute for every situation.",
      },
      {
        type: "paragraph",
        children:
          "Security depends on assumptions about software correctness, network conditions and competing work. A rewrite attempt may reorder or exclude transactions and reverse the attacker's own recent payments under certain conditions. It does not magically reveal every private key or authorise arbitrary theft from every address. When discussing an attack, state exactly which rule or assumption is affected. The next lessons show how signatures authorise spending and how confirmations communicate a transaction's position in accepted history.",
      },
      {
        type: "example",
        title: "An edit that gives itself away",
        children:
          "Ayu in Jakarta, in an invented scenario, wants to alter an old payment so a record shows she received Rp500,000 more (an invented amount). She edits her copy of the transaction. Instantly the block's hash changes, and the following block's \"previous hash\" no longer fits. To hide the edit she would have to rebuild that block and every block after it, and then persuade the rest of the network to accept her version. Every other computer still holds the original chain, so her copy is rejected.",
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
          "Checking a club expense book. A sports club in Australia records AUD 300 collected and AUD 80 spent on equipment. A member proposes a page claiming AUD 500 was spent, although the club never held that much. Other members should reject the page even if it took a long time to prepare. Similarly, proof of work does not excuse an invalid Bitcoin spend or excess issuance. In the club the checking rule is an ordinary accounting rule; in Bitcoin the rules are enforced by software and cryptographic verification. Work supports ordering, while validity remains a separate check.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Do not interpret an explorer screenshot as independent validation or a guarantee of permanent finality.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. A record changes but its old identifying hash is kept. What should a hash check reveal?",
          "2. Can a miner create extra BTC beyond valid issuance just by expending more work?",
          "3. Explain why a confirmation count can change after a reorganisation.",
        ],
        answers: [
          "1. The recalculated hash will not match the old reference, except for an extraordinarily unlikely collision under the security assumptions.",
          "2. No. A compliant full node rejects a block that violates its issuance rules regardless of work.",
          "3. The accepted branch may change. A transaction can move to a different block or become unconfirmed if it is not in the new branch.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does hashing a claim prove that the claim is true?"],
        answers: [
          "Answer. No. Hashing identifies the data. Truth, authorisation and validity require separate evidence or rules.",
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
          "Hashes link records and reveal mismatches.",
          "Nodes check validity; miners propose ordering through work.",
          "Tamper resistance is a more careful description than an unconditional guarantee.",
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
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
            url: "https://developer.bitcoin.org/devguide/block_chain.html",
          },
          {
            title: "NIST: Blockchain Technology Overview NISTIR 8202",
            url: "https://csrc.nist.gov/pubs/ir/8202/final",
          },
          {
            title: "Bitcoin community: Bitcoin Core Validation",
            url: "https://bitcoin.org/en/bitcoin-core/features/validation",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title:
              "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
            url: "https://developer.bitcoin.org/devguide/p2p_network.html",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Mining",
            url: "https://developer.bitcoin.org/devguide/mining.html",
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
  course: "bitcoin",
  description:
    "Trace how a transaction is authorised while keeping secrets separate from public information.",
  estimatedMinutes: 11,
  learningPath: "crypto",
  level: "level-1",
  module: "bitcoin-foundations",
  objectives: [
    "Trace how a transaction is authorised while keeping secrets separate from public information.",
  ],
  position: 3,
  prerequisites: ["shared-ledger-checks-and-security"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "shared-ledger-checks-and-security",
    "mining-fees-confirmations-and-finality",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Trace how a transaction is authorised while keeping secrets separate from public information.",
  seoTitle: "Keys, Signatures and Bitcoin Transactions",
  slug: "keys-signatures-and-bitcoin-transactions",
  sources: [
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Glassnode: Addresses metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/addresses",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
      url: "https://developer.bitcoin.org/devguide/p2p_network.html",
    },
    {
      title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
      url: "https://bitcoin.org/en/you-need-to-know",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
      url: "https://developer.bitcoin.org/devguide/wallets.html",
    },
  ],
  status: "published",
  title: "Keys, Signatures and Bitcoin Transactions",
};
const sections3: LessonSection[] = [
  {
    title: "Private keys, public keys and addresses",
    shortTitle: "Private keys public keys and addresses",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Trace how a transaction is authorised while keeping secrets separate from public information.",
      },
      {
        type: "paragraph",
        children:
          "A Bitcoin wallet helps authorise transactions using keys. Those keys do not work like a shared account password, and sending BTC does not usually mean subtracting a number from one centrally managed bank account. Bitcoin spends previously created transaction outputs. We will follow a small fictional payment to see how authorisation, change and fees fit together.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A signature can be technically valid even when the user approved the wrong destination.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "A private key is secret signing material. A corresponding public key lets others verify appropriate signatures. An address is an encoded destination associated with spending conditions; it is not simply a public-key string in every address format. You can share a receiving address where appropriate without handing over the private key needed to authorise spending.",
      },
      {
        type: "paragraph",
        children:
          "Wallet software may manage many keys and addresses behind one familiar interface. Different address types and spending conditions exist, including arrangements that require more than one signature. The beginner distinction is authority: a receiving address tells a sender where to create an output, while secret signing material helps satisfy the conditions for spending it. A wallet password commonly protects a local application or file. Changing that password cannot revoke a private key that someone has copied.",
      },
      {
        type: "paragraph",
        children:
          "Think of the mailboxes in the lobby of an apartment block in Chicago. Anyone can push a letter through the slot of box 4B. Under the simplified mailbox design, a matching key opens box 4B. Copied keys or a master key would change that arrangement. The building manager never checks who you are; the lock does the checking.",
      },
      {
        type: "example",
        title: "A combination nobody chose",
        children:
          "Thabo in Durban installs wallet software. It creates his private key from random data, so not even Thabo picked the number. Think of a 78-dial combination lock set by rolling dice, not by choosing a birthday.",
      },
      {
        type: "heading",
        level: 3,
        children: "Shorten the public key into an address",
      },
      {
        type: "paragraph",
        children:
          "An address tells a sending wallet how to create a destination under a particular format. It is not always simply a shortened public key. Legacy key-hash addresses, script-hash addresses and newer witness or Taproot formats encode different spending information.",
      },
      {
        type: "paragraph",
        children:
          "For a beginner, the mailbox picture is enough if its limit is clear: the public destination can be shared for receiving, while private signing material remains secret. A receiving address need not reveal a person's name. A valid format does not establish a trustworthy recipient.",
      },
      {
        type: "comparisonTable",
        columns: ["Item", "Job", "Sharing consideration"],
        rows: [
          [
            "Private key or usable recovery material",
            "Authorise or recreate signing authority",
            "Keep secret",
          ],
          [
            "Public verification information",
            "Help check an appropriate signature or spending condition",
            "Not a spending secret; disclosure can affect privacy",
          ],
          [
            "Receiving address",
            "Encode a destination under the chosen network format",
            "Share where needed, after verifying the network and purpose",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Wallets can manage many addresses and more complex spending conditions, including multiple signatures. Do not extrapolate the simplest one-key example to every Bitcoin output or every wallet.",
      },
    ],
  },
  {
    title: "A signature proves authority",
    shortTitle: "A signature proves authority",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Sign without showing the key",
      },
      {
        type: "paragraph",
        children:
          'On paper, you authorise a cheque or a contract with a handwritten signature. In earlier centuries, important letters were closed with a wax seal pressed from a ring only the sender owned. Both say "this came from me, and I agree to it".',
      },
      {
        type: "paragraph",
        children:
          "A digital signature does the same job for a Bitcoin transaction. Your wallet takes the transaction's details and your private key, and produces a signature. Anyone with your public key can check that signature, but recovering a properly generated private key from it is computationally impractical under the signature scheme's assumptions.",
      },
      {
        type: "definition",
        term: "Digital signature",
        children:
          "A value created from a message and a private key, which anyone can check against the matching public key. It proves the holder of the private key approved that exact message, without revealing the key.",
      },
      {
        type: "paragraph",
        children:
          "Here the analogy stops working, in Bitcoin's favour. A handwritten signature looks much the same on every document, so it can be copied. A digital signature is different for every transaction and tied to its exact contents; copy it onto a different payment and it fails the check.",
      },
      {
        type: "paragraph",
        children:
          "The whitepaper defines a coin as a chain of digital signatures: each owner passes it on by signing it over to the next owner's public key. To see one link in action, watch a node check it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch a node check a signature",
      },
      {
        type: "paragraph",
        children:
          "Chiara in Rome makes a fictional Bitcoin payment to David in Chicago. Later, David spends the received output. His wallet supplies the information needed to satisfy that output's spending conditions, including an appropriate signature.",
      },
      {
        type: "paragraph",
        children:
          "Other nodes check the authorisation and the transaction's validity without learning David's private key. In the ordinary classroom signature model, the signature commits to the relevant transaction details, so changing the destination invalidates it. Bitcoin also has different signature modes and script conditions; the simple example is not an exhaustive account of them.",
      },
      {
        type: "paragraph",
        children:
          "A valid signature establishes that the required signing authority approved the instruction. It does not establish that David understood it, that his device was clean, or that the recipient will deliver promised goods. Inspecting the request and protecting the secret are complementary jobs.",
      },
      {
        type: "paragraph",
        children:
          "It does not prove the signer understood the request, nor that the transaction was wise.",
      },
    ],
  },
  {
    title: "Inputs, outputs and change",
    shortTitle: "Inputs outputs and change",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Read what is inside a transaction",
      },
      {
        type: "paragraph",
        children:
          'A Bitcoin transaction is a short message that says, in effect, "take these coins I control, and lock them to these new owners". It has two main lists.',
      },
      {
        type: "definition",
        term: "Transaction",
        children:
          "A signed message that spends earlier Bitcoin outputs (its inputs) and creates new ones (its outputs), each output locked so that only its new owner can spend it later.",
      },
      {
        type: "paragraph",
        children:
          "Each input points back to a coin you received earlier, naming the previous transaction and which of its outputs is being spent. Each output holds an amount and a lock that only the recipient can open. Your wallet proves you may spend the inputs by attaching digital signatures; the keys and signing lesson in Level 1 explains how.",
      },
      {
        type: "paragraph",
        children:
          'So outputs are where coins "live", and inputs are how they move on. But outputs need somewhere to be sent, which is what addresses are for.',
      },
      {
        type: "heading",
        level: 3,
        children: "Find out what an address is",
      },
      {
        type: "paragraph",
        children:
          "A Bitcoin address is a string of letters and numbers that tells a wallet how to lock an output so only the intended person can spend it. It is more like a lockable letterbox slot than an account name: it doesn't carry your name, and one person can have many.",
      },
      {
        type: "definition",
        term: "Address",
        children:
          "A code that a payer's wallet uses to lock bitcoin to a recipient. It identifies who can spend an output, not who the person is.",
      },
      {
        type: "paragraph",
        children:
          "You'll see several formats. Older addresses start with 1 or 3. Newer ones start with bc1: bc1q… for SegWit addresses and bc1p… for Taproot addresses. Bitcoin Optech explains that the bc1 format uses only lowercase letters and numbers and includes error checking that catches almost all typing mistakes. That helps, but it cannot catch the case where you paste a valid address that belongs to someone else.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Check the whole address, every time. If you send to the wrong valid address, the network will deliver it there, and nobody can redirect it. Malware and look-alike addresses exist to exploit hurried copying. The transfer checking lesson in Level 2 gives you a full pre-send checklist; use the supplied fictional examples while learning.",
      },
      {
        type: "paragraph",
        children:
          "With outputs and addresses in place, you can see how Bitcoin keeps track of who owns what.",
      },
      {
        type: "heading",
        level: 3,
        children: "Pay with notes and get change back",
      },
      {
        type: "paragraph",
        children:
          "Imagine Emma in Sydney buying a A$30 lunch with a A$50 note (invented amounts for this example). She cannot tear off A$30 of the note. She hands over the whole note and gets A$20 back in change.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin works similarly. Your wallet doesn't hold one running balance like a bank account. It holds separate unspent outputs, each like a note of a particular value. When you pay, it spends one or more whole outputs as inputs and creates new outputs: one for the person you're paying, and usually one returning the leftover to you as change.",
      },
      {
        type: "definition",
        term: "UTXO (unspent transaction output)",
        children:
          "An output that has been received but not yet spent. Your wallet's balance is the total of all the UTXOs it can spend.",
      },
      {
        type: "paragraph",
        children:
          "The developer guide explains that each output can be spent only once. That is how Bitcoin solves the double-spending problem from the Bitcoin origins lesson in Level 1: once an output is spent in a confirmed transaction, any later attempt to spend it again is invalid.",
      },
      {
        type: "paragraph",
        children:
          'The analogy stops working in two places. Bitcoin "notes" can be any amount, not fixed denominations. And there is no till to count the change: your wallet writes the change output itself. The fee isn\'t a separate line either; it is whatever is left over.',
      },
      {
        type: "formula",
        expression: "Fee = total of inputs − total of outputs",
        explanation:
          "subtract everything coming out (payment plus change) from everything going in. If a wallet forgot the change output, the whole leftover would become fee.",
      },
      {
        type: "example",
        title: "Arjun pays a friend",
        children:
          "Arjun in Bengaluru sends 0.004 BTC to a friend (all amounts invented for this example). His wallet spends one UTXO of 0.01 BTC and creates two outputs: 0.004 BTC to the friend and 0.005986 BTC back to a new change address of his own. The fee is 0.01 − (0.004 + 0.005986) = 0.000014 BTC.",
      },
      {
        type: "paragraph",
        children:
          "That fee looks tiny written in bitcoin, which is why fees are counted in a much smaller unit.",
      },
      {
        type: "paragraph",
        children:
          "Outputs cannot generally be spent in fractions while leaving the rest of that same output untouched; a new change output represents the remainder. The wallet may use a fresh change address, so an explorer showing two outputs does not necessarily mean there were two external purchases. Real wallets may combine several inputs and create more outputs than this simple example.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-3-rId21.png",
        width: 1187,
        height: 556,
        alt: "The input is fully consumed. Recipient and change outputs total 0.0098 BTC, leaving 0.0002 BTC as the fee.",
        caption:
          "The input is fully consumed. Recipient and change outputs total 0.0098 BTC, leaving 0.0002 BTC as the fee.",
      },
    ],
  },
  {
    title: "Read a transaction record",
    shortTitle: "Read a transaction record",
    blocks: [
      {
        type: "paragraph",
        children:
          "A transaction identifier, or transaction ID, identifies a transaction for lookup. An explorer can display inputs, outputs, status, block information and a fee. A pending transaction has not yet been included in an accepted block known to that explorer. Confirmation count ordinarily includes the transaction's own block and subsequent blocks on the accepted branch.",
      },
      {
        type: "paragraph",
        children:
          "For the fictional record, total inputs are 0.0100 BTC, total outputs are 0.0098 BTC and the fee is 0.0002 BTC. Do not add the fee to outputs and call that the recipient amount. Nor should you assume every output is someone else's income. An exchange may credit a deposit only after its own confirmation requirement, and a transaction appearing on-chain does not automatically prove the service account has been credited. Read network status and provider accounting as separate records.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin has no ordinary chargeback system for a confirmed payment. More accepted blocks above it increase the work needed for a competing valid history to remove it. That is practical, probabilistic settlement under the network's assumptions, not a promise that every theoretical reorganisation is impossible.",
      },
      {
        type: "paragraph",
        children:
          "For a recipient, choose and apply a confirmation policy appropriate to the service. An exchange can require additional confirmations and account checks. For a sender, independently verify the destination before authorisation. A recipient's voluntary refund is a new transaction.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A recovery promise is not reversal authority. A stranger cannot reverse a confirmed native Bitcoin payment simply by charging an upfront fee. Preserve non-secret evidence and use genuine support or official reporting routes without sharing signing secrets.",
      },
    ],
  },
  {
    title: "Public records and privacy",
    shortTitle: "Public records and privacy",
    blocks: [
      {
        type: "paragraph",
        children:
          "Bitcoin records are public, but addresses are not automatically verified personal identities. A person can use multiple addresses, and an exchange can control addresses serving many customers. Analysts may infer connections from patterns, but inferences can be incomplete or wrong. A transaction record therefore establishes activity under particular spending conditions rather than a complete description of the people involved.",
      },
      {
        type: "paragraph",
        children:
          "Privacy can still be reduced when an address is linked to a person's name, invoice, social post or exchange account. An explorer operator may also observe your queries and related network information. Avoid publishing real addresses or transaction IDs in course exercises when they could reveal personal financial activity. Use the supplied fictional records. Later on-chain analysis lessons examine why counting addresses is different from counting people.",
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
          "Change from a grocery purchase. In Japan, Ken pays for JPY 700 of groceries with a JPY 1,000 note and receives change. A simple Bitcoin transaction has a related idea, though the mechanics differ. Ken's fictional input is 0.0100 BTC, the recipient output is 0.0030 BTC, the change output is 0.0068 BTC and the fee is 0.0002 BTC. The old input is fully spent, and the change becomes a new spendable output. The fee is not a secret amount inside the wallet; it is the difference between the input total and output total.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Never place real keys or identifiable personal transaction records in a lesson submission.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. A 0.0200 BTC input funds a 0.0050 BTC payment and a 0.0001 BTC fee. Calculate change.",
          "2. Which item should a recipient share for a payment: an address or a private key?",
          "3. Why does an explorer with two outputs not prove that two outside customers were paid?",
        ],
        answers: [
          "1. Change is 0.0200 minus 0.0050 minus 0.0001, or 0.0149 BTC.",
          "2. A verified receiving address, plus any applicable route instructions. A private key must remain secret.",
          "3. One output may be change. Ownership cannot always be established from the output list alone.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a valid signature prove that the signer understood a payment?",
        ],
        answers: [
          "Answer. No. It establishes authorisation under the transaction rules, not informed intention or recipient honesty.",
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
          "Private signing material and receiving addresses have different jobs.",
          "Input value equals output value plus fee.",
          "A public address does not automatically identify a person.",
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
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "Glassnode: Addresses metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/addresses",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title:
              "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
            url: "https://developer.bitcoin.org/devguide/p2p_network.html",
          },
          {
            title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
            url: "https://bitcoin.org/en/you-need-to-know",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
            url: "https://developer.bitcoin.org/devguide/wallets.html",
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
  course: "bitcoin",
  description:
    "Explain why a broadcast transaction and a settled payment are different stages.",
  estimatedMinutes: 13,
  learningPath: "crypto",
  level: "level-1",
  module: "bitcoin-foundations",
  objectives: [
    "Explain why a broadcast transaction and a settled payment are different stages.",
  ],
  position: 4,
  prerequisites: ["keys-signatures-and-bitcoin-transactions"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "keys-signatures-and-bitcoin-transactions",
    "bitcoin-supply-halvings-and-claims",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain why a broadcast transaction and a settled payment are different stages.",
  seoTitle: "Mining, Fees, Confirmations and Finality",
  slug: "mining-fees-confirmations-and-finality",
  sources: [
    {
      title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
      url: "https://developer.bitcoin.org/devguide/block_chain.html",
    },
    {
      title: "Bitcoin community: Bitcoin Core Validation",
      url: "https://bitcoin.org/en/bitcoin-core/features/validation",
    },
    {
      title: "Bitcoin Core: Current mempool replacement policy",
      url: "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/mempool-replacements.md",
    },
    {
      title: "Lightning Labs: Payment channels",
      url: "https://docs.lightning.engineering/the-lightning-network/payment-channels",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
      url: "https://developer.bitcoin.org/devguide/p2p_network.html",
    },
    {
      title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
      url: "https://bitcoin.org/en/you-need-to-know",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Mining",
      url: "https://developer.bitcoin.org/devguide/mining.html",
    },
  ],
  status: "published",
  title: "Mining, Fees, Confirmations and Finality",
};
const sections4: LessonSection[] = [
  {
    title: "From broadcast to a waiting transaction",
    shortTitle: "From broadcast to a waiting transaction",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain why a broadcast transaction and a settled payment are different stages.",
      },
      {
        type: "paragraph",
        children:
          "A wallet can broadcast a transaction before it is confirmed. That gap matters when a payment is time-sensitive. This lesson follows a transaction from the waiting area to a block, explains how fees are measured, and shows why different recipients can require different confirmation counts. It also introduces fee replacement and Lightning without requiring a live transfer.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Check network status and recipient crediting policy separately.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Picture a payment from start to finish",
      },
      {
        type: "paragraph",
        children:
          "Earlier in the course you saw how blocks are chained together and checked by nodes. Now follow a single payment all the way into the chain.",
      },
      {
        type: "paragraph",
        children:
          "Think about posting a letter. You write and sign it, drop it in a postbox, it waits at a sorting office, goes out for delivery, and is finally filed in an archive that grows thicker every day. A Bitcoin payment has a similar journey. Your wallet builds and signs the transaction and broadcasts it. It waits with other unconfirmed payments, gets included in a block, then sinks deeper as more blocks are added on top.",
      },
      {
        type: "paragraph",
        children:
          "The postal analogy breaks down in one place: there is no post office in charge. Independent computers handle every step under shared rules. To see what they check, start with what is inside the envelope.",
      },
      {
        type: "heading",
        level: 3,
        children: "Wait in the mempool",
      },
      {
        type: "paragraph",
        children:
          "When your wallet broadcasts a transaction, nearby nodes check it, and if it is valid they pass it to their peers. Within seconds it spreads across the network. Each node keeps valid, unconfirmed transactions in its mempool (memory pool), a waiting area for payments not yet in a block.",
      },
      {
        type: "definition",
        term: "Mempool",
        children:
          "A node's list of valid transactions that have been broadcast but not yet included in a block.",
      },
      {
        type: "paragraph",
        children:
          "There is no single, official mempool. The developer guide notes that it lives in temporary memory and is lost if a node shuts down, and nodes can hold different mempools because of their own memory limits and policies. So during very busy periods, a low-fee transaction can drop out of some nodes' lists.",
      },
      {
        type: "paragraph",
        children:
          "From the mempool, miners choose which transactions to put in the next block, generally favouring higher fee rates; the mining and fee lessons in Level 1 explains how mining works. Once your transaction makes it into a block, the counting begins.",
      },
      {
        type: "paragraph",
        children:
          "Transactions propagate through the network, and local policy can affect whether a node retains them. A transaction visible in one explorer's mempool may not yet be visible everywhere. Inclusion is not guaranteed merely because a wallet displayed sent. The transaction may be unconfirmed, conflict with another spend, or fail to propagate adequately. Check the transaction's actual status rather than relying only on a wallet animation.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-4-rId22.png",
        width: 1980,
        height: 1125,
        alt: "Broadcast, mempool, inclusion and confirmations are separate stages. Provider credit follows its own rules.",
        caption:
          "Broadcast, mempool, inclusion and confirmations are separate stages. Provider credit follows its own rules.",
      },
    ],
  },
  {
    title: "Mining rewards, machines and pools",
    shortTitle: "Mining rewards machines and pools",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Collect the reward subsidy plus fees",
      },
      {
        type: "paragraph",
        children:
          "The first transaction in every block, the coinbase transaction, has no inputs and pays the winning miner. The whitepaper compared this to gold miners spending resources to add gold to circulation, except that bitcoin miners spend computer time and electricity.",
      },
      {
        type: "definition",
        term: "Block reward",
        children:
          "What a miner may claim for a valid block: the block subsidy (newly created bitcoin) plus all transaction fees paid by the transactions in that block.",
      },
      {
        type: "formula",
        expression: "Block reward = block subsidy + total fees in the block",
        explanation:
          "the subsidy is fixed by the rules for each period; fees depend on which transactions the miner included and how busy the network was.",
      },
      {
        type: "example",
        title: "One winning block",
        children:
          "Since April 2024 the subsidy has been 3.125 BTC. Suppose a block's transactions pay 0.05 BTC in fees in total (an invented figure for this example). The block reward is 3.125 + 0.05 = 3.175 BTC.",
      },
      {
        type: "paragraph",
        children:
          "Two safeguards apply. New coins cannot be spent for at least 100 blocks, in case their block goes stale (the shared ledger lesson in Level 1). And a miner who pays itself more than the rules allow sees the whole block rejected. The subsidy also halves on a schedule, which the supply and halving lesson in Level 1 covers. First, meet the competitors.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow mining from laptops to specialised machines",
      },
      {
        type: "paragraph",
        children:
          "In 2009 bitcoin was mined on ordinary computers, hence the whitepaper's \"one-CPU-one-vote\". As competition grew, ordinary processors could no longer keep up. Today's miners use ASICs (application-specific integrated circuits), machines built only to run Bitcoin's hash function. The Cambridge Centre for Alternative Finance tracks more than 100 ASIC models and compares them by joules of electricity per terahash (a trillion hashes).",
      },
      {
        type: "example",
        title: "A mining room in Bavaria",
        children:
          "Lena, in an invented example, runs a small mining room in Germany. When power prices or difficulty rise, an older machine can cost more to run than it earns. Mining is a competitive business with thin margins, not a money machine.",
      },
      {
        type: "paragraph",
        children:
          "Even with good machines, Lena might wait years to win a block alone. So most miners join forces.",
      },
      {
        type: "heading",
        level: 3,
        children: "Share the luck in a mining pool",
      },
      {
        type: "paragraph",
        children:
          "A mining pool lets miners combine work and receive payments under a stated payout method, instead of each waiting alone for an occasional block. Think of colleagues pooling lottery tickets: the pool makes individual income less erratic, while adding an organiser to trust.",
      },
      {
        type: "paragraph",
        children:
          "Miners submit shares that satisfy an easier pool target. A share demonstrates work; occasionally one also meets Bitcoin's network target and produces a block. Payout methods differ. Some share actual rewards, while others pay an estimated amount per accepted share and shift part of the luck risk to the operator.",
      },
      {
        type: "example",
        title: "A proportional classroom pool",
        children:
          "Jack in Perth supplies 0.02% of eligible shares during a period in which a fictional proportional pool earns 3.2 BTC. His share before pool fees is 3.2 × 0.0002 = 0.00064 BTC. This calculation applies to that supplied proportional arrangement, not every pool's contract.",
      },
      {
        type: "paragraph",
        children:
          "Read fees, eligibility and payout rules. Pool operators can influence transaction selection, and concentration matters. Individual miners can switch pools, but that does not make operator control disappear.",
      },
      {
        type: "paragraph",
        children:
          "The subsidy is newly issued BTC under the issuance schedule. Fees come from spending transactions and do not represent additional creation beyond that subsidy. A miner earning a block reward is not evidence that an ordinary holder earns yield merely by holding BTC.",
      },
    ],
  },
  {
    title: "Calculate size, fee rate and fee",
    shortTitle: "Calculate size fee rate and fee",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Measure the fee in sat/vB",
      },
      {
        type: "paragraph",
        children:
          "A satoshi (sat) is the smallest unit of bitcoin: 0.00000001 BTC, or one hundred-millionth. You'll learn more about it in the supply and halving lesson in Level 1. Arjun's fee of 0.000014 BTC is 1,400 sats.",
      },
      {
        type: "paragraph",
        children:
          "Fees are priced by size, not by the amount sent. The developer guide notes that transactions pay fees based on their size in bytes. Bitcoin measures that size in virtual bytes (vB), so fee rates are quoted in satoshis per virtual byte (sat/vB). A transaction with many inputs is bigger, and so costs more, even if it moves a small amount.",
      },
      {
        type: "formula",
        expression: "Fee (sats) = transaction size (vB) × fee rate (sat/vB)",
        explanation:
          "multiply how big the transaction is by the price per unit of space. Arjun's invented transaction is 140 vB at 10 sat/vB: 140 × 10 = 1,400 sats.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Fee rate",
          "Fee in sats",
          "Fee in BTC",
          "Priority when the network is busy",
        ],
        rows: [
          ["2 sat/vB", "280", "0.0000028", "Low; may wait a long time"],
          ["10 sat/vB", "1,400", "0.000014", "Middle"],
          ["50 sat/vB", "7,000", "0.00007", "High; likely to be picked sooner"],
        ],
        caption:
          "The same 140 vB transaction at different fee rates (rates invented for this example)",
      },
      {
        type: "paragraph",
        children:
          "Sending 0.004 BTC or 4 BTC in the same 140 vB transaction costs the same fee. What changes the right rate is how crowded the network is.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand why fees rise and fall",
      },
      {
        type: "paragraph",
        children:
          'Think of a bus with a fixed number of seats. On a quiet afternoon any fare will do; at rush hour, passengers outbid each other for a place. Block space is limited in the same way, so when many people send at once, they compete on fee rate. Bitcoin Optech describes fee estimation as working out the rate needed for a good chance of confirming within a chosen number of blocks. Wallets do this for you, often offering "fast" or "slow".',
      },
      {
        type: "example",
        title: "A busy day in Riyadh",
        children:
          "Fatimah in Riyadh wants to pay a supplier on a day when the network is crowded. Her wallet suggests 40 sat/vB for the next block or 8 sat/vB if she can wait several hours (invented rates for this example). She isn't in a hurry, so she chooses the lower rate and accepts the wait. If plans change, some wallets let her raise the fee later using a feature called replace-by-fee.",
      },
      {
        type: "paragraph",
        children:
          "Where does Fatimah's transaction wait while it hopes for a seat? In a place called the mempool.",
      },
      {
        type: "paragraph",
        children:
          "A transaction with more inputs or a different structure can cost more at the same rate. The amount being transferred is therefore not the only determinant of cost. When demand for block space increases, a low rate may wait longer. Wallet estimates reflect changing conditions and uncertainty, not an exact delivery appointment. A recipient or exchange can also charge a separate service fee that should not be confused with the network fee. These are arithmetic examples, not recommended live fee settings.",
      },
    ],
  },
  {
    title: "Confirmations and practical finality",
    shortTitle: "Confirmations and practical finality",
    blocks: [
      {
        type: "paragraph",
        children:
          "Inclusion in the first accepted block normally gives one confirmation. Each subsequent accepted block adds another. More confirmations generally make a transaction harder to remove through a competing-work reorganisation, but no fixed count removes every theoretical or operational risk. Temporary competing tips are part of distributed operation, and rare deeper reorganisations require more careful handling.",
      },
      {
        type: "paragraph",
        children:
          "A shop accepting a low-value purchase may use a different policy from an exchange processing a large deposit. The policy reflects the amount at risk, the system and the provider's own procedures. Do not assume that a wallet showing three confirmations means every recipient must credit immediately. The recipient may require more confirmations or additional compliance checks. Also distinguish a blockchain confirmation from a successful delivery of the goods promised in exchange.",
      },
      {
        type: "example",
        title: "A seller in Berlin waits",
        children:
          "Hans sells a used bicycle in Berlin for €400 paid in bitcoin (an invented amount for this example). For a small sale he might accept one confirmation, but here he waits for several, because an unconfirmed payment may never confirm and a very recent block could still be replaced.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand confirmation and practical finality",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin has no ordinary chargeback system for a confirmed payment. More accepted blocks above it increase the work needed for a competing valid history to remove it. That is practical, probabilistic settlement under the network's assumptions, not a promise that every theoretical reorganisation is impossible.",
      },
      {
        type: "paragraph",
        children:
          "For a recipient, choose and apply a confirmation policy appropriate to the service. An exchange can require additional confirmations and account checks. For a sender, independently verify the destination before authorisation. A recipient's voluntary refund is a new transaction.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A recovery promise is not reversal authority. A stranger cannot reverse a confirmed native Bitcoin payment simply by charging an upfront fee. Preserve non-secret evidence and use genuine support or official reporting routes without sharing signing secrets.",
      },
    ],
  },
  {
    title: "Fee replacement and Lightning",
    shortTitle: "Fee replacement and Lightning",
    blocks: [
      {
        type: "paragraph",
        children:
          "An unconfirmed Bitcoin transaction may be replaceable by another transaction spending conflicting inputs under the policies of relevant nodes and miners. Replace-by-fee can help increase a fee, but its support, eligibility and effect depend on the wallet and current network policies. It is not a universal cancel button and cannot undo a confirmed transfer. Our course stops at understanding this behaviour; it does not ask you to rescue a live payment.",
      },
      {
        type: "paragraph",
        children:
          "Lightning uses payment channels anchored to Bitcoin to support updates and routed payments without recording every payment as a separate base-layer transfer. Channel liquidity, routing, monitoring and custody arrangements create additional considerations. A custodial Lightning application adds provider risk, while an independently controlled channel has its own operational requirements. An advertised quick payment should therefore be examined for its actual route and dependencies.",
      },
      {
        type: "paragraph",
        children:
          "Imagine opening a tab at a café in Cape Town by leaving R400 behind the counter (an invented amount for this example). With each coffee, you and the owner update a signed note of who is owed what, and you settle the final balance once at the end of the month.",
      },
      {
        type: "example",
        title: "Coffee in Cape Town",
        children:
          "Lerato pays for a R40 coffee (an invented amount) with a Lightning wallet. The payment arrives in seconds with a very small fee and never waits in the mempool.",
      },
    ],
  },
  {
    title: "Energy, economics and cloud mining claims",
    shortTitle: "Energy economics and cloud mining claims",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Weigh the energy debate fairly",
      },
      {
        type: "paragraph",
        children:
          "Proof of work consumes electricity through specialised computation. Environmental impact depends on electricity demand, the generation mix, hardware production and local conditions. Those are different measurements, so an electricity figure cannot by itself establish an emissions figure.",
      },
      {
        type: "paragraph",
        children:
          "Cambridge's electricity index publishes estimates with methodological assumptions and uncertainty. Its mining-industry surveys provide additional evidence about participating firms. A survey's coverage does not automatically establish the same proportions for every miner worldwide. Always record the report date and sample before quoting a percentage.",
      },
      {
        type: "paragraph",
        children:
          "Critics question the energy, emissions and opportunity cost required to secure the network. Supporters argue that an open settlement system can justify a resource cost and that particular operations can use otherwise stranded energy. These are arguments to assess alongside measured evidence, not reasons to treat every mining operation alike.",
      },
      {
        type: "paragraph",
        children:
          "Compare systems carefully: a payment count may omit activity on additional layers, while a competing system's estimate may include a different boundary. You can explain the trade-off without inventing an exact universal cost per payment.",
      },
      {
        type: "heading",
        level: 3,
        children: "Spot cloud mining offers that are scams",
      },
      {
        type: "paragraph",
        children:
          'Cloud mining means paying a company to "rent" mining power in its data centre in return for a share of the coins mined. The format is risky by design, because you cannot see the machines or check that they exist.',
      },
      {
        type: "paragraph",
        children:
          "In February 2025, the US Department of Justice announced that the two founders of HashFlare, a cloud-mining service, had pleaded guilty to conspiracy to commit wire fraud. According to the department, HashFlare sold about US$577 million of mining contracts from 2015 to 2019 without the computing power to do most of the promised mining, and showed customers dashboards with made-up figures.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          '"Rent a miner, earn every day." Rina in Surabaya sees an advert: rent a mining machine for Rp1,500,000 and earn 3% a day (invented figures for this example). Real mining income moves with difficulty, fees and the bitcoin price, so it cannot be fixed. Fixed daily returns, recruitment bonuses and "withdrawal fees" are the scam and learning routine lesson in Level 0 red flags.',
      },
      {
        type: "paragraph",
        children:
          "You now know the mining story from guessing game to scams. Time to practise.",
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
          "A parcel delivery estimate. Elena in Italy sees two parcel options: a lower price with a broad arrival window and a higher price for a prioritised service. Bitcoin fee selection has a related idea of competition for limited capacity, although miners do not offer the same contractual delivery promise as a courier. Her fictional 200-vbyte transaction at 15 sat/vbyte pays 3,000 satoshis. If demand rises, that estimate may no longer be competitive. Elena checks the transaction status and the recipient's policy instead of treating the original wallet estimate as a guaranteed time.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Fee replacement and Lightning have additional rules and dependencies; neither is a universal reversal mechanism.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Calculate the fee for 250 vbytes at 12 sat/vbyte.",
          "2. A deposit has two confirmations and the provider requires four. Has the provider necessarily made an error by not crediting it?",
          "3. Can fee replacement reverse a confirmed transfer?",
        ],
        answers: [
          "1. 250 multiplied by 12 equals 3,000 satoshis, or 0.00003 BTC.",
          "2. No. It has not yet met the stated confirmation requirement. Other service checks may also apply.",
          "3. No. Replacement concerns unconfirmed conflicting transactions under applicable policies, not reversal of accepted history.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a wallet displaying sent mean a recipient has credited a deposit?",
        ],
        answers: [
          "Answer. No. Broadcasting, block inclusion, required confirmations and provider crediting are separate stages.",
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
          "A mempool is a local collection of waiting transactions.",
          "Size and fee rate determine the illustrated network fee.",
          "Recipient confirmation requirements can differ.",
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
            title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
            url: "https://developer.bitcoin.org/devguide/block_chain.html",
          },
          {
            title: "Bitcoin community: Bitcoin Core Validation",
            url: "https://bitcoin.org/en/bitcoin-core/features/validation",
          },
          {
            title: "Bitcoin Core: Current mempool replacement policy",
            url: "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/mempool-replacements.md",
          },
          {
            title: "Lightning Labs: Payment channels",
            url: "https://docs.lightning.engineering/the-lightning-network/payment-channels",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title:
              "Bitcoin Developer Guide: Bitcoin Developer Guide — P2P Network",
            url: "https://developer.bitcoin.org/devguide/p2p_network.html",
          },
          {
            title: "Bitcoin.org: Bitcoin.org — Some things you need to know",
            url: "https://bitcoin.org/en/you-need-to-know",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Mining",
            url: "https://developer.bitcoin.org/devguide/mining.html",
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
  course: "bitcoin",
  description:
    "Explain issuance and the halving while separating known rules from uncertain market outcomes.",
  estimatedMinutes: 11,
  learningPath: "crypto",
  level: "level-1",
  module: "bitcoin-foundations",
  objectives: [
    "Explain issuance and the halving while separating known rules from uncertain market outcomes.",
  ],
  position: 5,
  prerequisites: ["mining-fees-confirmations-and-finality"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["mining-fees-confirmations-and-finality"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain issuance and the halving while separating known rules from uncertain market outcomes.",
  seoTitle: "Supply, Halvings and Common Bitcoin Claims",
  slug: "bitcoin-supply-halvings-and-claims",
  sources: [
    {
      title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
      url: "https://developer.bitcoin.org/devguide/block_chain.html",
    },
    {
      title: "Bitcoin community: Bitcoin FAQ",
      url: "https://bitcoin.org/en/faq",
    },
    {
      title: "Ethereum: Introduction to blockchain bridges",
      url: "https://ethereum.org/bridges/",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin community: Bitcoin Core Validation",
      url: "https://bitcoin.org/en/bitcoin-core/features/validation",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title:
        "Bitcoin Developer Documentation: Bitcoin Developer Documentation — Glossary",
      url: "https://developer.bitcoin.org/glossary.html",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
      url: "https://developer.bitcoin.org/devguide/wallets.html",
    },
  ],
  status: "published",
  title: "Supply, Halvings and Common Bitcoin Claims",
};
const sections5: LessonSection[] = [
  {
    title: "How issuance approaches its limit",
    shortTitle: "How issuance approaches its limit",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain issuance and the halving while separating known rules from uncertain market outcomes.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin's issuance rules are often discussed alongside claims about its future price. Keep those subjects separate. A rule can specify the amount newly issued in a valid block, while the market still decides what people will pay. This lesson explains the supply schedule, the meaning of a halving and several common claims that sound more certain than the evidence supports.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Keep the protocol rule, the supply estimate and the price hypothesis in separate sentences.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask where new bitcoin comes from",
      },
      {
        type: "paragraph",
        children:
          "Earlier in the course you saw that every winning miner receives a block subsidy of newly created bitcoin, which has been 3.125 BTC since April 2024. That raises a natural question. Who decided on 3.125, and what stops someone from creating more?",
      },
      {
        type: "paragraph",
        children:
          "Think about how a country's money supply grows. A central bank and the commercial banks it supervises can create more money when they judge the economy needs it. People can debate their decisions, but somebody is deciding.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin has no such decision-maker. The issuance rules were written into the software Satoshi Nakamoto released in January 2009, and every full node enforces them. As the mining and fee lessons in Level 1 showed, if a miner pays itself even slightly more than the rules allow, nodes reject the whole block. Bitcoin.org describes the result: bitcoin is created at a decreasing and predictable rate.",
      },
      {
        type: "definition",
        term: "Issuance",
        children:
          "The creation of new units of a currency. In Bitcoin, all new coins are issued through the block subsidy paid to miners.",
      },
      {
        type: "paragraph",
        children:
          "Because the rules are public, anyone can work out how many bitcoin will ever exist. The answer is a fraction under 21 million.",
      },
      {
        type: "heading",
        level: 3,
        children: "Count to 21 million",
      },
      {
        type: "paragraph",
        children:
          "The first blocks paid a subsidy of 50 BTC. Every 210,000 blocks, the subsidy halves: 50, then 25, then 12.5, and so on. Each period of 210,000 blocks is often called an era.",
      },
      {
        type: "paragraph",
        children:
          "Add up the coins from every era and you get a total that approaches a fixed number but never passes it.",
      },
      {
        type: "formula",
        expression:
          "Total supply ≈ 210,000 × 50 × (1 + ½ + ¼ + ⅛ + …) = 210,000 × 50 × 2 = 21,000,000 BTC",
        explanation:
          "the first era issues 210,000 × 50 = 10,500,000 BTC, and each later era issues half as much as the one before. Halves that keep halving add up to the same again, so the total approaches double the first era: 21 million.",
      },
      {
        type: "definition",
        term: "Supply cap",
        children:
          "The maximum number of units that can ever exist. For Bitcoin, the protocol rules mean no more than 21 million BTC will ever exist.",
      },
      {
        type: "paragraph",
        children:
          "There is a small twist. The subsidy is counted in whole satoshis, the smallest unit, so eventually halving it rounds down to zero. Trezor's guide explains that this happens at block 6,930,000, estimated to be sometime around 2140. Working the schedule through exactly, the final total comes to about 20,999,999.98 BTC, a fraction short of 21 million.",
      },
      {
        type: "paragraph",
        children:
          "You could picture this as a book with a fixed print run, but the analogy needs one caution. Rules are software, and software can change. Bitcoin.org explains that changes only take effect if users, miners and node operators voluntarily adopt them, so raising the cap would need near-universal agreement. That is very unlikely, but the cap is a social agreement as well as code.",
      },
      {
        type: "paragraph",
        children:
          "So if there will only ever be about 21 million bitcoin, how can millions of people use it? The answer is in how finely each coin divides.",
      },
      {
        type: "paragraph",
        children:
          "This is a protocol description, not a forecast of economic value. A halving is triggered by block height rather than by a fixed date appointment. Calendar estimates depend on future block production. You do not need to memorise future dates to understand that the scheduled subsidy per block becomes smaller.",
      },
    ],
  },
  {
    title: "Satoshis and the halving schedule",
    shortTitle: "Satoshis and the halving schedule",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Break a bitcoin into satoshis",
      },
      {
        type: "paragraph",
        children:
          "You met the satoshi in the transaction and fee lessons in Level 1 when counting fees. It is the smallest unit of bitcoin: 1 satoshi = 0.00000001 BTC, one hundred-millionth of a bitcoin. Bitcoin.org notes that bitcoin can be divided to 8 decimal places, and possibly further if ever needed.",
      },
      {
        type: "paragraph",
        children:
          "Think of a pizza cut into 100 million slices. Nobody needs to buy a whole pizza; you buy the slices you want. In the same way, most people who hold bitcoin hold a fraction of one coin.",
      },
      {
        type: "formula",
        expression: "Satoshis = BTC × 100,000,000",
        explanation:
          "move the decimal point eight places to the right. To go back from sats to BTC, divide by 100,000,000.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Amount in BTC",
          "Amount in satoshis",
          "Where you might see it",
        ],
        rows: [
          ["1", "100,000,000", "A whole coin"],
          ["0.01", "1,000,000", "A larger purchase"],
          ["0.0005", "50,000", "A small purchase"],
          ["0.000014", "1,400", "Arjun's fee in Lesson C1.4"],
          ["0.00000001", "1", "The smallest unit"],
        ],
        caption: "Bitcoin amounts in satoshis",
      },
      {
        type: "example",
        title: "A small purchase in Busan",
        children:
          "Min-jun in Busan wants to buy ₩50,000 of bitcoin. Suppose, at a price invented for this example, 1 BTC costs ₩100,000,000. Then ₩50,000 buys 50,000 ÷ 100,000,000 = 0.0005 BTC, which is 50,000 satoshis. A whole coin is not needed to take part.",
      },
      {
        type: "paragraph",
        children:
          "Divisibility explains how a limited supply can be shared. Next, see how quickly it is released.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow the halving schedule",
      },
      {
        type: "paragraph",
        children:
          "Imagine a fountain that pours at a set rate, then halves its flow every four years. It never stops completely within your lifetime, but the stream becomes thinner and thinner. Bitcoin's issuance works like that.",
      },
      {
        type: "definition",
        term: "Halving",
        children:
          "The scheduled event, every 210,000 blocks, at which the block subsidy paid to miners is cut in half.",
      },
      {
        type: "comparisonTable",
        columns: [
          "Era",
          "Starts at block",
          "When it began",
          "Subsidy per block",
          "New BTC issued in the era",
        ],
        rows: [
          ["1", "0", "January 2009", "50 BTC", "10,500,000"],
          ["2", "210,000", "November 2012", "25 BTC", "5,250,000"],
          ["3", "420,000", "July 2016", "12.5 BTC", "2,625,000"],
          ["4", "630,000", "May 2020", "6.25 BTC", "1,312,500"],
          ["5", "840,000", "April 2024", "3.125 BTC", "656,250"],
          ["6", "1,050,000", "Expected around 2028", "1.5625 BTC", "328,125"],
        ],
        caption: "Bitcoin's subsidy eras",
      },
      {
        type: "paragraph",
        children:
          'Notice that the halving is set by block height, not by the calendar. That is why every date for a future halving comes with the word "about".',
      },
      {
        type: "heading",
        level: 3,
        children: "See why every four years is only approximate",
      },
      {
        type: "paragraph",
        children:
          "At about 10 minutes per block, 210,000 blocks should take roughly four years.",
      },
      {
        type: "formula",
        expression:
          "Time per era ≈ 210,000 blocks × 10 minutes ≈ 2,100,000 minutes ≈ 4 years",
        explanation:
          "2,100,000 minutes is about 1,458 days, a little under four years. It is an average, because block times vary.",
      },
      {
        type: "paragraph",
        children:
          "As the mining and fee lessons in Level 1 explained, blocks sometimes arrive faster than 10 minutes when new mining power joins, and difficulty only catches up every 2,016 blocks. So eras can run slightly short or long. Kraken's history notes that the exact date of the next halving cannot be pinpointed in advance; it is expected around 2028, at block 1,050,000.",
      },
      {
        type: "example",
        title: "Two countdowns in Toronto",
        children:
          "Aisha in Toronto checks two halving countdown websites and sees dates a few days apart. Neither is wrong: each estimates when block 1,050,000 will arrive from recent block times, and the estimate moves as they change.",
      },
      {
        type: "paragraph",
        children:
          "Whatever the exact date, the effect on new supply is precise, and you can measure it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch new supply shrink",
      },
      {
        type: "paragraph",
        children:
          "About 144 blocks are found in an average day (24 hours × 6 blocks an hour). Multiply by the subsidy, and you get roughly how many new bitcoin enter circulation each day.",
      },
      {
        type: "formula",
        expression: "New BTC per day ≈ 144 blocks × subsidy per block",
        explanation:
          "at 3.125 BTC, that is about 450 BTC a day. Before April 2024, at 6.25 BTC, it was about 900. It is an average, because the number of blocks varies from day to day.",
      },
      {
        type: "paragraph",
        children:
          "You can also measure how much of the total already exists. By block 840,000 in April 2024, the first four eras had issued 10,500,000 + 5,250,000 + 2,625,000 + 1,312,500 = 19,687,500 BTC. That is 93.75% of 21 million. The remaining 6.25% will trickle out over more than a century.",
      },
      {
        type: "example",
        title: "A miner in Alberta",
        children:
          "Marc runs a mining site in Alberta (an invented example). Overnight in April 2024, the subsidy on any block his pool wins fell from 6.25 to 3.125 BTC, while his electricity bill stayed the same. Kraken's history notes that reduced income pushes miners towards more efficient machines and cheaper power. Some older machines may switch off, and as the mining and fee lessons in Level 1 explained, the difficulty dial then adjusts.",
      },
      {
        type: "paragraph",
        children:
          "Halvings clearly matter to miners. The question that attracts the most hype is what they change for everyone else.",
      },
      {
        type: "paragraph",
        children:
          "Existing supply is BTC already issued under the rules. A reduction in new issuance does not mean half the existing BTC disappears. At a halving, a holder's 0.01 BTC does not automatically become 0.005 BTC. The rule changes the permitted new subsidy, not everyone's balance. Coins may be inaccessible because signing material was lost, but proving all such losses is difficult. A dormant address is not automatically a lost address. The protocol's issuance rule and an analyst's estimate of economically available supply answer different questions.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-1/lesson-5-rId23.png",
        width: 2136,
        height: 1379,
        alt: "Subsidy by block height. Future calendar dates are estimates, and total issuance also depends on integer-unit rules and claimed rewards.",
        caption:
          "Subsidy by block height. Future calendar dates are estimates, and total issuance also depends on integer-unit rules and claimed rewards.",
      },
    ],
  },
  {
    title: "Halvings and price claims",
    shortTitle: "Halvings and price claims",
    blocks: [
      {
        type: "paragraph",
        children:
          "Past subsidy reductions provide useful history about the network's rules and miner incentives. Market prices around those events also reflect demand, liquidity, broader economic conditions and expectations formed before the event. A chart showing a later price rise cannot isolate the halving as the sole cause, and selecting only favourable periods creates a misleading sample.",
      },
      {
        type: "paragraph",
        children:
          "Claims such as a halving always leads to a specific return ignore both uncertainty and the small number of past events. A widely known event may be anticipated by market participants. Other conditions may dominate it. Treat historical patterns as observations to investigate, using a stated period and comparison, rather than as promises. Later research lessons explain how to avoid selecting evidence after seeing the result.",
      },
      {
        type: "paragraph",
        children: "Separate a valid fact from an unsupported conclusion",
      },
      {
        type: "comparisonTable",
        columns: [
          "Statement",
          "What it establishes",
          "What it does not establish",
        ],
        rows: [
          [
            "Subsidy halves at a block interval",
            "Rule for new permitted issuance",
            "An exact future calendar time",
          ],
          [
            "Supply approaches a protocol limit",
            "Constraint under current consensus rules",
            "Guaranteed purchasing power",
          ],
          [
            "An address has not moved funds",
            "Observed inactivity",
            "Proof the owner lost the key",
          ],
          [
            "A past event preceded a price rise",
            "Historical sequence",
            "Sole cause or future return",
          ],
          [
            "A token represents BTC elsewhere",
            "A product claim to investigate",
            "Identical custody and network risk",
          ],
        ],
      },
    ],
  },
  {
    title: "Lost coins, scarcity and demand",
    shortTitle: "Lost coins scarcity and demand",
    blocks: [
      {
        type: "paragraph",
        children:
          "A limited supply can matter, but scarcity alone does not create value. A one-of-a-kind broken chair is scarce and may have little demand. For an asset, people must be willing and able to use, hold or exchange it. Market depth determines how much can be sold near a quoted price, and the quote can change as orders arrive.",
      },
      {
        type: "paragraph",
        children:
          "Distinguish a reason to study an asset from a reason to expect a return at a particular price. A useful network could already be valued optimistically, while a low unit price could hide a large total supply. Bitcoin's supply rules are one input into analysis, alongside demand, security, liquidity, custody and legal conditions. A complete explanation should state what the supply fact establishes and what additional evidence the price claim needs.",
      },
      {
        type: "paragraph",
        children:
          "Imagine banknotes sealed in a jar and buried in a garden that has since been built over. The notes still exist, and the central bank still counts them as issued, but nobody will ever spend them.",
      },
      {
        type: "example",
        title: "A shopping basket in Manchester",
        children:
          "Oliver in Manchester buys a basket of groceries for £100. The Bank of England's own illustration is that with 2% inflation, the same basket would cost £102 a year later. His £100 note has not changed, but it buys a little less.",
      },
    ],
  },
  {
    title: "The future security budget and separate representations",
    shortTitle: "The future security budget and separate representations",
    blocks: [
      {
        type: "paragraph",
        children:
          "A change in rules can produce a different network if participants follow incompatible histories or conditions. Assets on different chains may have related histories yet different security, users and market prices. A similar name or ticker does not make them the same BTC asset. Always identify the network and actual product rather than relying on branding.",
      },
      {
        type: "paragraph",
        children:
          "Wrapped representations of BTC on other networks introduce additional mechanisms such as custody, issuance or bridge arrangements. A representation may aim to track BTC's value while relying on an issuer or contract that native BTC does not require in the same way. Redemption may be restricted, suspended or fail. A claim labelled Bitcoin exposure can also be an exchange balance or a fund share. We will revisit these dependencies in bridges and institutional products.",
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
          "A limited print run. A publisher in the UK prints only 1,000 copies of a cookbook. The limit makes the book scarce, but buyers still consider its usefulness, condition and asking price. Printing fewer new copies next year would not force existing buyers to pay more. Bitcoin's supply rules are much more formal than a publisher's promise, yet the same economic question remains: what demand exists at the offered price? A supply fact alone is insufficient to calculate a future GBP price.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Do not turn a small set of historical price patterns into a guaranteed trading rule.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. If a subsidy falls from an illustrative 6.25 BTC to 3.125 BTC, what happens to a holder with 0.02 BTC?",
          "2. Why should a dormant-address supply estimate state its assumptions?",
          "3. Name two facts needed before treating a wrapped token as equivalent to native BTC.",
        ],
        answers: [
          "1. The holding remains 0.02 BTC. The new subsidy per valid block changes; existing quantities are not halved.",
          "2. Dormancy does not prove loss. The estimate depends on classifications that can be uncertain or revised.",
          "3. Identify custody or bridge mechanisms, redemption rights and restrictions, contract identity, network and failure procedures. Price tracking alone is insufficient.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a fixed supply guarantee a positive investment return?",
        ],
        answers: [
          "Answer. No. Returns depend on the purchase price, later demand, liquidity, costs and the asset remaining usable.",
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
          "Halvings reduce permitted new subsidy at defined block heights.",
          "Inactivity and permanent loss are different claims.",
          "Scarcity is one economic factor rather than a price guarantee.",
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
            title: "Bitcoin community: Bitcoin Developer Guide Block Chain",
            url: "https://developer.bitcoin.org/devguide/block_chain.html",
          },
          {
            title: "Bitcoin community: Bitcoin FAQ",
            url: "https://bitcoin.org/en/faq",
          },
          {
            title: "Ethereum: Introduction to blockchain bridges",
            url: "https://ethereum.org/bridges/",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin community: Bitcoin Core Validation",
            url: "https://bitcoin.org/en/bitcoin-core/features/validation",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title:
              "Bitcoin Developer Documentation: Bitcoin Developer Documentation — Glossary",
            url: "https://developer.bitcoin.org/glossary.html",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
            url: "https://developer.bitcoin.org/devguide/wallets.html",
          },
        ],
      },
    ],
  },
];

export const cryptoLevel1Lessons: LessonDocument[] = [
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
