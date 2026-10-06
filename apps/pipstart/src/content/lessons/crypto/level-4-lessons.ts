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
  course: "crypto-ethereum-and-networks",
  description:
    "Describe Ethereum as a programmable network and Ether as its native asset.",
  estimatedMinutes: 9,
  learningPath: "crypto",
  level: "level-4",
  module: "ethereum-contracts-and-connected-networks",
  objectives: [
    "Describe Ethereum as a programmable network and Ether as its native asset.",
  ],
  position: 1,
  prerequisites: ["crypto-deposits-withdrawals-and-exchange-failure"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["smart-contracts-applications-and-outside-data"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Describe Ethereum as a programmable network and Ether as its native asset.",
  seoTitle: "Ethereum, Ether and Proof of Stake",
  slug: "ethereum-ether-and-proof-of-stake",
  sources: [
    {
      title: "Ethereum: History of Ethereum founder launch and ownership",
      url: "https://ethereum.org/ethereum-history-founder-and-ownership/",
    },
    {
      title: "Ethereum: Ethereum Whitepaper",
      url: "https://ethereum.org/whitepaper/",
    },
    {
      title: "Ethereum: Proof of stake",
      url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
    },
    {
      title: "Ethereum: The Merge",
      url: "https://ethereum.org/roadmap/merge/",
    },
    {
      title: "Ethereum: Gas fees",
      url: "https://ethereum.org/gas/",
    },
    {
      title: "Ethereum: Pooled staking",
      url: "https://ethereum.org/staking/pools/",
    },
    {
      title: "ethereum.org: ethereum.org — The history of Ethereum",
      url: "https://ethereum.org/en/history/",
    },
    {
      title: "ethereum.org: ethereum.org — Ethereum whitepaper",
      url: "https://ethereum.org/en/whitepaper/",
    },
    {
      title: "ethereum.org: ethereum.org — Introduction to smart contracts",
      url: "https://ethereum.org/en/smart-contracts/",
    },
    {
      title: "Ethereum: EIP 7702 Set Code for EOAs",
      url: "https://eips.ethereum.org/EIPS/eip-7702",
    },
    {
      title: "Ethereum: Pectra account delegation guidelines",
      url: "https://ethereum.org/roadmap/pectra/7702/",
    },
    {
      title: "Ethereum: Fusaka upgrade",
      url: "https://ethereum.org/roadmap/fusaka/",
    },
    {
      title: "Ethereum: Validator recovery and balance credentials",
      url: "https://launchpad.ethereum.org/en/faq",
    },
  ],
  status: "published",
  title: "Ethereum, Ether and Proof of Stake",
};
const sections1: LessonSection[] = [
  {
    title: "How Ethereum began",
    shortTitle: "How Ethereum began",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Describe Ethereum as a programmable network and Ether as its native asset.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum extends the idea of a shared ledger to a platform that can execute programs. ETH, also called Ether, is its native asset; Ethereum is the network and protocol. Those are related but different things. We will place its history in context, explain its current proof-of-stake system and separate issuance rules from stories about future prices.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Check the date and implemented network before using a historical technical description.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what Bitcoin was not built to do",
      },
      {
        type: "paragraph",
        children:
          'Think about a pocket calculator and a smartphone. The calculator does one job very well. The smartphone runs apps its makers never imagined. Neither is "better"; they were built for different purposes.',
      },
      {
        type: "paragraph",
        children:
          "Bitcoin is closer to the calculator. Its scripting language is deliberately limited, which keeps it simpler to check and harder to break. That suits a payment network, but you cannot easily build a lending app, a game or a voting system on top of it.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum asked a different question: what if a blockchain came with a general-purpose programming language, so anyone could write their own rules for how value moves without launching a new blockchain each time? The analogy stops working in one place. A smartphone app can be patched overnight by its company. Code on Ethereum is shared by thousands of computers, so changing it is much harder, as you'll see later in this lesson.",
      },
      {
        type: "paragraph",
        children:
          "So who had this idea, and how did it become a working network? That story starts with a teenager who had been writing about Bitcoin.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet the people who started Ethereum",
      },
      {
        type: "paragraph",
        children:
          "Ethereum was proposed by Vitalik Buterin in a whitepaper in late 2013. Buterin, born in Russia and raised in Canada, discovered Bitcoin as a teenager and co-founded Bitcoin Magazine with Mihai Alisie. He was 19 when he circulated his draft; the official Ethereum history page dates it to 27 November 2013.",
      },
      {
        type: "paragraph",
        children:
          "No single person built Ethereum, though. It was co-founded by Vitalik Buterin with others including Gavin Wood, who wrote the Yellow Paper, the formal technical description of the system (April 2014), and helped develop Solidity, the language most smart contracts are written in. The eight co-founders usually named are Buterin, Wood, Joseph Lubin, Charles Hoskinson, Anthony Di Iorio, Mihai Alisie, Amir Chetrit and Jeffrey Wilcke. They announced the project in Miami in January 2014.",
      },
      {
        type: "paragraph",
        children:
          'To pay for development, ether went on sale in July 2014 for 42 days, with buyers paying in bitcoin. Mainnet ("Frontier") launched 30 July 2015, as a bare-bones version meant mainly for developers. Today Ethereum has no CEO or owner. The Ethereum Foundation, a non-profit, funds research but does not control the network; changes happen when the people who write and run the software broadly agree.',
      },
      {
        type: "paragraph",
        children:
          "Founders and dates tell you when Ethereum arrived. Next, separate the network, its native asset and the applications built on it.",
      },
    ],
  },
  {
    title: "Ethereum accounts and shared execution",
    shortTitle: "Ethereum accounts and shared execution",
    blocks: [
      {
        type: "paragraph",
        children:
          "Ethereum is the network that maintains state and executes permitted transactions. ETH is the native asset used for fees and other protocol functions. An account can be controlled by signing keys or implemented as a contract with programmed behaviour. An application may combine contracts, an interface, databases and outside services. A token on Ethereum is not automatically ETH.",
      },
      {
        type: "paragraph",
        children:
          "Compare a city with its transport system, fare unit and shops. They interact, but owning a fare unit does not mean owning the city or every shop's profits. Likewise, holding ETH does not grant a claim on every application's revenue. When you research an application, identify its contracts and rights rather than assigning every Ethereum feature to every token built there. Network use and token-holder value require their own explanations.",
      },
      {
        type: "paragraph",
        children:
          "People often mix up two names. Ethereum is the network: the shared computer and its record. Ether (ticker ETH) is the network's own currency. Think of a country's railway system and the tickets you buy to ride it.",
      },
      {
        type: "example",
        title: "Reading a long number",
        children:
          "Kenji in Osaka sees 200,000,000,000,000,000 wei on a block explorer. Dividing by 10^18 gives 0.2 ETH, matching his wallet. (The amount is invented for this example.)",
      },
      {
        type: "heading",
        level: 3,
        children: "Know the two kinds of Ethereum account",
      },
      {
        type: "paragraph",
        children:
          "Ethereum has accounts with balances and other state. In the traditional model, an externally owned account, or EOA, is controlled by a signing key. A contract account follows deployed code when execution reaches it. A contract cannot independently wake up at midnight; someone or some system must initiate an action that reaches the code.",
      },
      {
        type: "paragraph",
        children:
          "The boundary has evolved. Pectra's EIP-7702 allows an EOA to delegate to deployed code, enabling features such as batching or sponsored fees. A smart-account arrangement may also use different signing and recovery rules. It is therefore outdated to assume every EOA has no code or every account is governed only by the simple two-column model.",
      },
      {
        type: "example",
        title: "A savings-club rule in Bengaluru",
        children:
          "Priya signs an instruction that reaches a club contract. The contract applies its rules to the accepted inputs. An automatic result still depends on the original authorisation, the code, and any authority that can change it. A new delegation request deserves its own review because delegated code may act through the account.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a recipe sent to ten thousand kitchens, each of which must follow every step in order and produce exactly the same dish. If one kitchen's result differs, everyone knows it made a mistake. Ethereum calls its shared execution environment the Ethereum Virtual Machine, or EVM. Nodes running it apply the same rules to the same transaction inputs. It is a software environment, rather than one physical computer owned by a company.",
      },
    ],
  },
  {
    title: "Validators, upgrades and supply",
    shortTitle: "Validators upgrades and supply",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Proof of stake and validator responsibilities",
      },
      {
        type: "paragraph",
        children:
          "Ethereum currently uses proof of stake. Validators commit ETH under protocol rules and participate in proposing or attesting to blocks. Rewards, penalties and slashing conditions help shape behaviour. Slashing concerns specified serious violations; ordinary missed participation and operator failures can have different penalties. Staking through a provider or pool adds that arrangement's own dependencies.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin's proof of work relies on competing computational work, while Ethereum's proof of stake relies on committed stake and its consensus procedures. Both require validation rules; neither makes a dishonest transfer request wise. A simplified comparison is useful, but do not assume their confirmation and finality behaviour is identical. Ethereum has protocol finality under stated participation and security assumptions, and operational disruptions can still affect the timing and experience of settlement.",
      },
      {
        type: "comparisonTable",
        caption: "Distinguish the components",
        columns: ["Component", "Role", "Common confusion"],
        rows: [
          [
            "Ethereum",
            "Protocol and network maintaining state",
            "Treating it as one company account",
          ],
          [
            "ETH",
            "Native asset used in network functions",
            "Assuming it is every application token",
          ],
          [
            "Validator",
            "Consensus participant with committed stake",
            "Describing current mainnet as mined",
          ],
          [
            "Contract",
            "Deployed program with state",
            "Assuming all contracts are safe",
          ],
          [
            "Interface",
            "User access layer",
            "Assuming the website is the whole application",
          ],
          [
            "Application token",
            "Rights under its design and terms",
            "Assuming automatic profit ownership",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Understand what 32 ETH buys and what it risks",
      },
      {
        type: "paragraph",
        children:
          "Ethereum's ordinary solo-validator activation minimum is 32 ETH. Operating a validator also requires appropriate software, availability and maintenance. After Pectra, validators with the relevant compounding withdrawal credentials can have an effective balance up to 2,048 ETH; this does not remove the 32 ETH activation minimum.",
      },
      {
        type: "paragraph",
        children:
          "Other staking routes can combine funds or delegate operations through contracts and providers. A person with less than 32 ETH can therefore encounter pooled products, but these introduce their own operators, fees, recovery or exit mechanisms. They are not simply smaller versions of independent solo validation.",
      },
      {
        type: "paragraph",
        children:
          "Penalties for missed participation and slashing for specified serious violations are different. ETH's price can fall regardless of rewards, and exits can involve queues. Level 6 examines these routes in detail using paper examples. No learner needs to buy 32 ETH, operate a validator or stake through a provider to complete this course.",
      },
      {
        type: "heading",
        level: 3,
        children: "The Merge and later upgrades",
      },
      {
        type: "paragraph",
        children:
          "Ethereum originally used proof of work. The Merge on 15 September 2022 changed its consensus operation to proof of stake while preserving the existing transaction history. An old article describing current ETH mining can therefore be outdated. Other networks may still use mining, including networks with related names, but that does not change Ethereum mainnet's present consensus.",
      },
      {
        type: "paragraph",
        children:
          "The transition did not give users permission to reveal recovery material or send assets to upgrade support. Protocol changes and software maintenance should be checked through verified sources. Whenever a research claim names a network upgrade, record the network and date. A description can be historically correct yet unsuitable as an instruction for today's system.",
      },
      {
        type: "comparisonTable",
        caption:
          "Ethereum's implemented system has changed over time. Use this small historical map to recognise familiar terms, then check current official documentation for the feature you are studying.",
        columns: ["Milestone", "Date", "Teaching relevance"],
        rows: [
          [
            "London",
            "August 2021",
            "Introduced the EIP-1559 base-fee mechanism",
          ],
          [
            "The Merge",
            "15 September 2022",
            "Moved Ethereum consensus from proof of work to proof of stake",
          ],
          [
            "Shapella",
            "April 2023",
            "Enabled staking withdrawals under protocol rules",
          ],
          ["Dencun", "March 2024", "Introduced blob data used by rollups"],
          [
            "Pectra",
            "May 2025",
            "Added account delegation and validator changes among other features",
          ],
          [
            "Fusaka",
            "December 2025",
            "Added further scaling changes including PeerDAS",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A historical proposal explains intent; a completed upgrade describes implemented changes. A later upgrade can make an older explanation incomplete. Verify the specific network and version.",
      },
      {
        type: "warning",
        title: "No recovery words are needed to upgrade ETH",
        children:
          "Protocol upgrades do not require a holder to send coins to an upgrade address or reveal signing secrets to a support agent. Use genuine software-maintenance instructions through verified channels.",
      },
      {
        type: "heading",
        level: 3,
        children: "Issuance fee burning and supply stories",
      },
      {
        type: "paragraph",
        children:
          "ETH issuance and fee burning are separate mechanisms. Under current Ethereum fee rules, the base-fee component is burned, while other fee components can be paid to participants. New issuance relates to proof-of-stake operation. The net supply change depends on these mechanisms and actual activity; ETH does not follow Bitcoin's fixed maximum-supply schedule.",
      },
      {
        type: "paragraph",
        children:
          "If more ETH is burned than issued over a period, net supply can fall in that period. That observation is not a promise that every later period will do so or that price must rise. Demand, liquidity, application use, security and market expectations still matter. State the measured period and source when discussing supply, and avoid turning a temporary observation into a permanent guarantee. The next lessons explore the programs that create Ethereum activity and the fees required to execute them.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A city system and a shop receipt",
        children:
          "Lena in Germany buys an EUR 3 transport ticket and separately pays EUR 15 at a café. The transport network, ticket and café are connected through daily life, but their rights differ. Ethereum, ETH and an application token also need separate descriptions. Paying an ETH transaction fee does not buy a share of the application, and holding a token does not necessarily provide a claim on business earnings. The analogy helps keep roles separate without suggesting that Ethereum has a city government's legal structure.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Protocol upgrades never require handing recovery material to an unsolicited support contact.",
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
          "1. What changed at the Merge, and what historical record was preserved?",
          "2. If 100 fictional ETH units are issued and 80 burned in a period, calculate net change.",
          "3. Does a period of net burning guarantee a positive price return?",
        ],
        answers: [
          "1. Consensus changed from proof of work to proof of stake. The existing Ethereum transaction history remained part of the network.",
          "2. Net change is an increase of 20 ETH units. If burning instead exceeded issuance, net change would be negative.",
          "3. No. Supply is one factor; demand, price paid, costs and other conditions matter.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does the original Ethereum white paper fully describe the current protocol?",
        ],
        answers: [
          "No. It is a historical design source. Use current protocol documentation for implemented behaviour.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Ethereum and ETH have different roles.",
          "Current Ethereum uses proof of stake.",
          "Supply observations need a period and do not establish returns.",
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
            title: "Ethereum: History of Ethereum founder launch and ownership",
            url: "https://ethereum.org/ethereum-history-founder-and-ownership/",
          },
          {
            title: "Ethereum: Ethereum Whitepaper",
            url: "https://ethereum.org/whitepaper/",
          },
          {
            title: "Ethereum: Proof of stake",
            url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
          },
          {
            title: "Ethereum: The Merge",
            url: "https://ethereum.org/roadmap/merge/",
          },
          {
            title: "Ethereum: Gas fees",
            url: "https://ethereum.org/gas/",
          },
          {
            title: "Ethereum: Pooled staking",
            url: "https://ethereum.org/staking/pools/",
          },
          {
            title: "ethereum.org: ethereum.org — The history of Ethereum",
            url: "https://ethereum.org/en/history/",
          },
          {
            title: "ethereum.org: ethereum.org — Ethereum whitepaper",
            url: "https://ethereum.org/en/whitepaper/",
          },
          {
            title:
              "ethereum.org: ethereum.org — Introduction to smart contracts",
            url: "https://ethereum.org/en/smart-contracts/",
          },
          {
            title: "Ethereum: EIP 7702 Set Code for EOAs",
            url: "https://eips.ethereum.org/EIPS/eip-7702",
          },
          {
            title: "Ethereum: Pectra account delegation guidelines",
            url: "https://ethereum.org/roadmap/pectra/7702/",
          },
          {
            title: "Ethereum: Fusaka upgrade",
            url: "https://ethereum.org/roadmap/fusaka/",
          },
          {
            title: "Ethereum: Validator recovery and balance credentials",
            url: "https://launchpad.ethereum.org/en/faq",
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
  course: "crypto-ethereum-and-networks",
  description:
    "Explain what a smart contract executes and where its trust assumptions remain.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-4",
  module: "ethereum-contracts-and-connected-networks",
  objectives: [
    "Explain what a smart contract executes and where its trust assumptions remain.",
  ],
  position: 2,
  prerequisites: ["ethereum-ether-and-proof-of-stake"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "ethereum-ether-and-proof-of-stake",
    "gas-transactions-and-failed-attempts",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain what a smart contract executes and where its trust assumptions remain.",
  seoTitle: "Smart Contracts, Applications and Outside Data",
  slug: "smart-contracts-applications-and-outside-data",
  sources: [
    {
      title: "Ethereum: Ethereum Whitepaper",
      url: "https://ethereum.org/whitepaper/",
    },
    {
      title: "Ethereum: Transactions",
      url: "https://ethereum.org/developers/docs/transactions/",
    },
    {
      title: "NIST: Blockchain Technology Overview NISTIR 8202",
      url: "https://csrc.nist.gov/pubs/ir/8202/final",
    },
    {
      title: "Chainlink: What is a Blockchain Oracle",
      url: "https://chain.link/education/blockchain-oracles",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "ethereum.org: ethereum.org — The history of Ethereum",
      url: "https://ethereum.org/en/history/",
    },
    {
      title: "ethereum.org: ethereum.org — Ethereum whitepaper",
      url: "https://ethereum.org/en/whitepaper/",
    },
    {
      title: "ethereum.org: ethereum.org — Introduction to smart contracts",
      url: "https://ethereum.org/en/smart-contracts/",
    },
  ],
  status: "published",
  title: "Smart Contracts, Applications and Outside Data",
};
const sections2: LessonSection[] = [
  {
    title: "Smart contracts, interfaces and outside data",
    shortTitle: "Smart contracts interfaces and outside data",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain what a smart contract executes and where its trust assumptions remain.",
      },
      {
        type: "paragraph",
        children:
          "A smart contract is a program that applies rules when the network executes the relevant action. It can make an operation predictable under its code while still applying unfair terms, using bad input or containing a bug. This lesson explains code, interfaces and outside data, then shows why automatic execution is not the same as a safe agreement.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Explain the rule, the input and the authority that can change either one.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "A vending machine for programmed rules",
      },
      {
        type: "paragraph",
        children:
          'In the 1990s, the computer scientist and legal scholar Nick Szabo, whom you met in Level 1 as the designer of bit gold, coined the term "smart contract" (his first short piece on it appeared in 1994). His favourite illustration was a vending machine. You choose a drink, put in coins, the machine checks you paid enough, and it releases the drink and any change. Nobody behind a counter decides whether to serve you; the rules are built in and run the same way for everyone.',
      },
      {
        type: "paragraph",
        children:
          "A smart contract is the same idea, written as code and stored on a blockchain. When a transaction reaches it, the code checks its conditions and, if they are met, carries out the result automatically. Because the code is public, anyone can inspect the rules before using it.",
      },
      {
        type: "definition",
        term: "Smart contract",
        children:
          "A program stored on a blockchain that runs exactly as written when a transaction calls it, moving value or recording data according to its rules, with no person needed to approve each step.",
      },
      {
        type: "example",
        title: "A deposit that releases itself",
        children:
          "Sophie in Lyon rents a studio for a summer course, and she and her landlord use a smart contract for the deposit. Sophie sends 0.5 ETH (an invented amount for this example). The code returns it to her on 1 September unless both of them sign a different instruction first, so neither can quietly take the money early.",
      },
      {
        type: "paragraph",
        children:
          'The analogy breaks down in three places. First, a broken vending machine can be opened and fixed. A smart contract usually cannot be changed once deployed unless its builders designed a way to upgrade it, a trade-off you\'ll examine in Level 6. Second, if the code contains a mistake, the "machine" follows the mistake faithfully. Third, a smart contract cannot see the outside world on its own; it only knows what is on the blockchain unless someone feeds it outside data, also a Level 6 topic.',
      },
      {
        type: "paragraph",
        children:
          "So a smart contract needs something to pay with and something to run on. The payment part brings us to ether.",
      },
      {
        type: "paragraph",
        children:
          "The program does not need to share a human's interpretation of fairness or intention. They may also remain dependent on administrators or outside data. Read what the program permits and who can change it rather than assuming the word smart implies judgment, intelligence or legal protection. Ethereum's virtual machine, or EVM, is the execution environment that applies its contract instructions under network rules.",
      },
      {
        type: "heading",
        level: 3,
        children: "The website and the contract state",
      },
      {
        type: "paragraph",
        children:
          "An application's website helps users read information and prepare actions. The contracts maintain their own state, such as balances, permissions or pool parameters. An interface can display inaccurate information or prepare a different action from the one a user expects. Conversely, a website can be unavailable while a contract still exists on the network.",
      },
      {
        type: "paragraph",
        children:
          "Identify the verified contract address, network and relevant version. Some applications also depend on hosted databases, front-end operators or specialised transaction services. A polished interface is not a code audit. A copied website can reuse the same graphics while pointing to another contract. When inspecting an action, connect the user-facing instruction to the exact contract call and its effect. Beginners can practise this using supplied records without connecting a funded wallet.",
      },
      {
        type: "heading",
        level: 3,
        children: "Code needs trustworthy outside facts",
      },
      {
        type: "paragraph",
        children:
          "Participants need to reach consistent results from the same accepted inputs. A contract cannot simply visit any website during validation and choose whatever price it happens to show. External facts, such as a market price or weather result, must enter through an agreed mechanism. An oracle supplies data or another bridge between outside information and contract use.",
      },
      {
        type: "paragraph",
        children:
          "The contract's result can be correct under the provided data while the data is wrong, delayed or manipulated. A lending contract using an unrealistic collateral price may allow an unsafe loan. Ask which data source is used, how often it updates, what happens when it is unavailable and whether extreme values are handled. Oracle quality and contract quality are separate dependencies. Neither can be ignored because the other has a reputable name.",
      },
      {
        type: "comparisonTable",
        caption: "Trace the application dependency",
        columns: ["Layer", "What it contributes", "Failure example"],
        rows: [
          [
            "Website",
            "Display and transaction preparation",
            "False destination or misleading preview",
          ],
          [
            "Contract code",
            "Rules and state changes",
            "Bug or unexpected interaction",
          ],
          ["Oracle", "External data", "Stale or manipulated value"],
          [
            "Administrator",
            "Defined control powers",
            "Compromised upgrade authority",
          ],
          [
            "Network",
            "Execution and settlement",
            "Congestion or disrupted inclusion",
          ],
          [
            "Economic design",
            "Incentives and obligations",
            "Unsustainable rewards or weak collateral",
          ],
        ],
      },
      {
        type: "diagram",
        alt: "A contract result depends on code, inputs and authority. A correct execution can still apply bad data or unsuitable terms.",
        caption:
          "A contract result depends on code, inputs and authority. A correct execution can still apply bad data or unsuitable terms.",
        width: 1187,
        height: 556,
        src: "/lessons/crypto/level-4/lesson-2-rId33.png",
      },
    ],
  },
  {
    title: "Administrative powers and The DAO",
    shortTitle: "Administrative powers and The DAO",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Administrators upgrades and emergency powers",
      },
      {
        type: "paragraph",
        children:
          "Some contracts are immutable in relevant respects; others can be upgraded or governed through defined authorities. An administrator may pause operations, change parameters or redirect implementation through a proxy. These powers can support emergency response but also create control and abuse risks. Governance votes may be one part of the process rather than the only authority.",
      },
      {
        type: "paragraph",
        children:
          "Read who holds the permissions, whether multiple approvals are required, whether there is a delay and what notice users receive. A multi-signature arrangement reduces reliance on one key only under its actual threshold and participant independence. It does not remove all collusion or compromise risk. Compare the current contract version with the version covered by any review, and track later changes that may alter the risk.",
      },
      {
        type: "heading",
        level: 3,
        children: "Code economic risk and The DAO",
      },
      {
        type: "paragraph",
        children:
          "An exploit can arise from a programming error, unexpected interaction or a mechanism that is technically allowed but economically dangerous. A protocol may follow its code while failing because incentives, liquidity or collateral assumptions break. Automatic execution is therefore not a guarantee that the terms are fair, legally enforceable or appropriate for a beginner.",
      },
      {
        type: "paragraph",
        children:
          "Use a dependency checklist: contracts, administrators, oracles, collateral, networks, interfaces and custody. Identify what can be paused or recovered and what cannot. Audits and bug-bounty programmes can improve review but do not certify the absence of every vulnerability. We return to audit scope in Level 10. For now, explain both the intended rule and at least one input or authority on which it relies.",
      },
      {
        type: "heading",
        level: 3,
        children: "Learn what went wrong with The DAO",
      },
      {
        type: "paragraph",
        children:
          "In April 2016 a project called The DAO launched on Ethereum: an investor-directed fund run by smart contracts, where people sent ether, received DAO tokens and would vote on which projects to fund. According to the US Securities and Exchange Commission (SEC), its sale ran from 30 April to 28 May 2016 and raised about 12 million ETH, worth roughly US$150 million at the time.",
      },
      {
        type: "paragraph",
        children:
          "On 17 June 2016, an attacker used a flaw in The DAO's code to move about 3.6 million ETH, roughly a third of what it had raised, into an account they controlled. Ethereum itself had not broken. It ran The DAO's code exactly as written; the code allowed something its authors never intended. This is the vending-machine warning made real: a machine with a fault pays out according to the fault.",
      },
      {
        type: "paragraph",
        children:
          "The DAO also became a regulatory landmark: in July 2017 the SEC concluded that DAO tokens were securities under US law. That is one dated example from one country; rules differ and change, so check your own national regulator.",
      },
      {
        type: "definition",
        term: "The DAO",
        children:
          "An investment fund built from smart contracts on Ethereum in 2016, whose code was exploited in June 2016, leading to Ethereum's most famous chain split.",
      },
      {
        type: "paragraph",
        children:
          "With a third of the fund in an attacker's control, the community faced a hard choice: accept the loss, or change the record.",
      },
      {
        type: "heading",
        level: 3,
        children: "See why the chain split in two",
      },
      {
        type: "paragraph",
        children:
          "After weeks of debate, most of the community chose to act. In July 2016, a hard fork, a rule change not every node has to accept, moved the affected ether into a recovery contract so DAO token holders could withdraw it. You met chain splits in the keys and signing lesson in Level 1; Level 10 compares forks in depth.",
      },
      {
        type: "paragraph",
        children:
          "Not everyone agreed. Some believed a blockchain record should never be rewritten to rescue one application. They kept running the original, unforked chain, which continued as Ethereum Classic (ETC): two networks with a shared history up to the fork and separate histories after it.",
      },
      {
        type: "example",
        title: "One balance becomes two",
        children:
          "Ahmet in Istanbul held 4 ETH before the fork (an invented amount for this example). Afterwards he held 4 ETH on Ethereum and 4 ETC on Ethereum Classic, controlled by the same private key, but they were different assets with different prices.",
      },
      {
        type: "paragraph",
        children:
          'The lasting lesson is that "immutable" has a social side: if enough users and operators agree, they can choose new rules, and others can refuse. For you, the point is narrower: contract bugs can cost real money even when the blockchain works perfectly, and a rescue is rare, not something to count on.',
      },
      {
        type: "paragraph",
        children:
          "Ethereum survived the split and kept growing. Its biggest technical change came six years later, when it stopped relying on miners altogether.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A ticket machine with a wrong price feed",
        children:
          "A station ticket machine in France charges according to a supplied EUR fare table. If the table incorrectly lists a journey at EUR 1 instead of EUR 10, the machine can follow its instructions accurately while charging the wrong economic amount. A contract using bad oracle data can similarly produce an internally valid but harmful result. Checking only that the machine runs does not establish that the data and terms are right.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A professional interface or audit reference is insufficient evidence of complete application safety.",
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
          "1. An application has audited code but uses a stale price. Which dependency is failing?",
          "2. Name two administrator powers to inspect.",
          "3. Why might an unchanged website conceal a changed risk?",
        ],
        answers: [
          "1. The oracle or data process may be failing. A code review does not make all external input reliable.",
          "2. Upgrade and pause authority; also parameter changes, minting, freezing or treasury access where relevant.",
          "3. The underlying contract, implementation, permissions or data source may change while the visual interface remains identical.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does automatic execution ensure fair terms?"],
        answers: [
          "No. A program can accurately execute terms that are unfair or unsuitable, and legal rights depend on more than code.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Contracts apply rules to accepted inputs.",
          "Interfaces and contracts are separate layers.",
          "Outside data and administrator powers must be mapped.",
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
            title: "Ethereum: Ethereum Whitepaper",
            url: "https://ethereum.org/whitepaper/",
          },
          {
            title: "Ethereum: Transactions",
            url: "https://ethereum.org/developers/docs/transactions/",
          },
          {
            title: "NIST: Blockchain Technology Overview NISTIR 8202",
            url: "https://csrc.nist.gov/pubs/ir/8202/final",
          },
          {
            title: "Chainlink: What is a Blockchain Oracle",
            url: "https://chain.link/education/blockchain-oracles",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "ethereum.org: ethereum.org — The history of Ethereum",
            url: "https://ethereum.org/en/history/",
          },
          {
            title: "ethereum.org: ethereum.org — Ethereum whitepaper",
            url: "https://ethereum.org/en/whitepaper/",
          },
          {
            title:
              "ethereum.org: ethereum.org — Introduction to smart contracts",
            url: "https://ethereum.org/en/smart-contracts/",
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
  course: "crypto-ethereum-and-networks",
  description:
    "Read an Ethereum-style transaction and estimate the fee with clearly stated inputs.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-4",
  module: "ethereum-contracts-and-connected-networks",
  objectives: [
    "Read an Ethereum-style transaction and estimate the fee with clearly stated inputs.",
  ],
  position: 3,
  prerequisites: ["smart-contracts-applications-and-outside-data"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "smart-contracts-applications-and-outside-data",
    "tokens-standards-nfts-and-asset-identity",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Read an Ethereum-style transaction and estimate the fee with clearly stated inputs.",
  seoTitle: "Gas, Transactions and Failed Attempts",
  slug: "gas-transactions-and-failed-attempts",
  sources: [
    {
      title: "Ethereum: Transactions",
      url: "https://ethereum.org/developers/docs/transactions/",
    },
    {
      title: "Ethereum: Gas fees",
      url: "https://ethereum.org/gas/",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "ethereum.org: ethereum.org — Gas and fees",
      url: "https://ethereum.org/en/developers/docs/gas/",
    },
    {
      title: "ethereum.org: ethereum.org — ERC-20 token standard",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
    },
    {
      title: "ethereum.org: ethereum.org — ERC-721 non-fungible token standard",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
    },
  ],
  status: "published",
  title: "Gas, Transactions and Failed Attempts",
};
const sections3: LessonSection[] = [
  {
    title: "Transaction stages and gas pricing",
    shortTitle: "Transaction stages and gas pricing",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Read an Ethereum-style transaction and estimate the fee with clearly stated inputs.",
      },
      {
        type: "paragraph",
        children:
          "Gas measures the work required to execute a transaction on Ethereum. It is not a second token you must buy separately: fees are paid in the relevant native fee asset under the network's rules. We will separate units of work from price per unit, calculate a fee and explain why a failed contract action can still cost money.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Read the receipt and calculate fees with units at every step.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "The transaction lifecycle and account nonce",
      },
      {
        type: "paragraph",
        children:
          "An Ethereum transaction includes information such as sender authorisation, destination, value, data and fee settings. An account nonce orders its transactions and prevents ordinary replay of the same account instruction. Signing prepares authorisation, broadcasting shares the transaction, inclusion executes it in a block, and the receipt records its result. These are separate stages.",
      },
      {
        type: "paragraph",
        children:
          "A pending transaction can affect later transactions from the same account. Wallets may offer replacement or cancellation-style actions using the same nonce, but support and outcome depend on current rules and whether inclusion has occurred. A confirmed action cannot simply be recalled through a local button. When an interface appears stuck, inspect the correct network's transaction record and nonce context rather than submitting repeated actions without diagnosis.",
      },
      {
        type: "heading",
        level: 3,
        children: "Gas used gas limit and effective price",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask why every action on Ethereum has a price",
      },
      {
        type: "paragraph",
        children:
          "Think about a taxi meter. It doesn't care who you are. It counts distance and waiting time, and the longer the trip, the more you pay.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum works in a similar way. In the Ethereum and contract lessons in Level 4 you saw that every node runs every smart-contract step through the EVM. Each step takes computing effort, measured in units called gas. A plain ETH transfer is a short trip; a contract action that touches several contracts is a long one. ethereum.org explains that charging for every computation also stops attackers flooding the network with junk code.",
      },
      {
        type: "definition",
        term: "Gas",
        children:
          "The unit that measures how much computing effort an Ethereum operation needs. You pay for gas in ether.",
      },
      {
        type: "paragraph",
        children:
          "Gas units tell you how much work a transaction needs. They don't tell you the price of each unit. That price is quoted in a tiny slice of ether called gwei.",
      },
      {
        type: "definition",
        term: "Gwei",
        children:
          "A small unit of ether used to price gas: 1 gwei is one-billionth of an ETH (0.000000001 ETH), and 1 ETH = 1,000,000,000 gwei.",
      },
      {
        type: "paragraph",
        children:
          "The taxi analogy stops working in one place. On Ethereum, the price of each gas unit also rises and falls with how many people want space in the next block, more like surge pricing at rush hour. The rules for that price changed in 2021.",
      },
      {
        type: "heading",
        level: 3,
        children: "Split the fee base fee tip and the burn",
      },
      {
        type: "paragraph",
        children:
          "In August 2021 the London upgrade brought in a change called EIP-1559. Since then, the price of each unit of gas has two parts. The base fee is set by the protocol for each block, and every transaction in that block pays it. The optional priority fee, or tip, is extra you add to encourage validators to include your transaction.",
      },
      {
        type: "paragraph",
        children:
          "Picture a toll road with a congestion charge that rises when traffic is heavy and falls when it is light. Ethereum's base fee behaves like that. Each block has a target size of half its maximum. If a block is fuller than the target, the next base fee rises, by up to 12.5%; if emptier, it falls.",
      },
      {
        type: "paragraph",
        children:
          "Here is the unusual part. When the block is created, the base fee is burned: removed from circulation for good. Only the tip goes to the validator. The toll analogy breaks down here, because a city keeps its congestion charge.",
      },
      {
        type: "paragraph",
        children:
          "Your wallet usually also sets a max fee, the most you will pay per unit of gas. If base fee plus tip comes in lower, the difference is refunded. If the base fee climbs above your max fee, your transaction waits.",
      },
      {
        type: "comparisonTable",
        caption: "The parts of an Ethereum gas fee",
        columns: ["Part", "Who sets it", "Where the money goes"],
        rows: [
          [
            "Base fee",
            "The protocol, block by block, based on demand",
            "Burned (destroyed)",
          ],
          [
            "Priority fee (tip)",
            "You, usually from your wallet's suggestion",
            "The validator who includes your transaction",
          ],
          [
            "Max fee",
            "You, as a ceiling",
            "Not a payment; any unused amount is refunded",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'You may read that the burn makes ETH "scarcer" and must push its price up. Burning changes how much ether is in circulation; it does not decide what anyone will pay for ETH. Treat any claim that a fee rule will raise the price as marketing, not fact.',
      },
      {
        type: "paragraph",
        children: "With the parts named, you can now put numbers to them.",
      },
      {
        type: "paragraph",
        children:
          "Gas units measure computational work under protocol rules. The effective price per gas combines applicable fee components under current rules. A wallet's maximum fee setting is a cap, not necessarily the amount charged for every gas unit. More complex network routes may include other fees, so the simple formula must be labelled with its scope. Unused permitted gas is not generally charged as though it were all consumed. However, a transaction can consume gas up to its limit and fail, which is different from merely setting a generous limit.",
      },
    ],
  },
  {
    title: "Calculate the fee with units",
    shortTitle: "Calculate the fee with units",
    blocks: [
      {
        type: "paragraph",
        children:
          "One gwei is one-billionth of an ETH. If an illustrative transaction uses 21,000 gas at an effective price of 20 gwei per gas, it costs 420,000 gwei. Dividing by one billion gives 0.00042 ETH. At a fictional USD 2,000 per ETH, that is USD 0.84. Neither fee input nor ETH price is a live recommendation.",
      },
      {
        type: "paragraph",
        children:
          "A basic transfer and a contract action can consume different gas amounts. Sending ETH to a contract can also trigger additional work, so 21,000 is not a universal value for every transfer-looking operation. If a hypothetical contract action uses 80,000 gas at 20 gwei, its fee is 0.0016 ETH. Always keep gas units, gwei per gas, ETH and currency valuation distinct in your worksheet.",
      },
      {
        type: "comparisonTable",
        caption: "Work the fee through its units",
        columns: ["Step", "Calculation", "Result"],
        rows: [
          ["Gas consumed", "Supplied example", "21,000 gas"],
          ["Effective price", "Supplied example", "20 gwei per gas"],
          ["Fee in gwei", "21,000 × 20", "420,000 gwei"],
          ["Fee in ETH", "420,000 ÷ 1,000,000,000", "0.00042 ETH"],
          ["USD illustration", "0.00042 × 2,000", "USD 0.84"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Simplified Ethereum execution fee only. Other network or service charges are excluded.",
      },
      {
        type: "example",
        title: "A plain transfer from Toronto",
        children:
          "Emily in Toronto sends ETH to her brother, which uses 21,000 gas. Her wallet shows a 20 gwei base fee and a 2 gwei tip (invented figures for this example). The fee is 21,000 × 22 = 462,000 gwei, which is 0.000462 ETH. If ether were priced at C$4,000 (an invented price for this example), that fee would be about C$1.85.",
      },
      {
        type: "diagram",
        alt: "Multiply work by effective price, then convert units. This is a simplified execution-fee example.",
        caption:
          "Multiply work by effective price, then convert units. This is a simplified execution-fee example.",
        width: 1187,
        height: 486,
        src: "/lessons/crypto/level-4/lesson-3-rId34.png",
      },
    ],
  },
  {
    title: "Failed actions, receipts and retries",
    shortTitle: "Failed actions receipts and retries",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Why a failed action can still cost gas",
      },
      {
        type: "paragraph",
        children:
          "A mechanic who spends two hours searching for a fault still charges for the two hours, even if they cannot fix it. The work was done.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum treats failure the same way. If a transaction runs out of gas, or a contract's rules reject it partway, every change it tried to make is undone and your tokens stay where they were. But the gas already used is not returned, because the nodes really did the computing.",
      },
      {
        type: "example",
        title: "A sale that had already ended",
        children:
          "Lucas in Hamburg tries to buy a ticket token a minute after the sale ended. The contract rejects the purchase and undoes it, so he keeps the ETH for the ticket, but his wallet shows a failed transaction and a fee of about 0.0005 ETH (an invented figure for this example). The network worked; the contract followed its rules.",
      },
      {
        type: "paragraph",
        children:
          "If your wallet warns that a transaction is likely to fail, stop and check. That is cheaper than paying for a failure.",
      },
      {
        type: "paragraph",
        children:
          "Gas explains what you pay for execution. The receipt explains which actions actually happened.",
      },
      {
        type: "paragraph",
        children:
          "A transaction may be included and then revert because a condition fails. A pre-broadcast rejection is a different stage and may not create an on-chain fee. Check receipt status rather than inferring success from a transaction ID alone. A failed swap may leave the original asset in the wallet while still reducing the native fee balance. A separate approval might have succeeded before the swap failed, leaving permission to review. The overall task's failure does not mean every earlier step was cancelled.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read the receipt before trying again",
      },
      {
        type: "paragraph",
        children:
          "Verify the account, network, transaction ID, pending status, nonce and receipt. Determine whether the fee asset is sufficient and whether the intended action failed for a stated reason. Avoid using a lookalike explorer linked by an unsolicited helper. If the account may be compromised, return to the incident-response guidance before adding fee funds.",
      },
      {
        type: "paragraph",
        children:
          "Layer-two networks can have their own fee components and native fee rules. Do not apply a mainnet illustration as a complete quote for every chain. Record the network and fee estimate at the time of the example, then compare the actual receipt afterward. This makes a gas lesson useful beyond memorising a formula: it connects cost, status and permission to the action you intended.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Paying for an unsuccessful service visit",
        children:
          "A technician in Canada spends time diagnosing an appliance but cannot complete the repair because a required part is missing. A diagnostic charge can remain even though the appliance is not repaired. A reverted blockchain action similarly can consume resources without completing the intended result. The contractual rights of a technician visit differ, but the example explains why unsuccessful does not automatically mean free.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not repeat a pending action or add fee funds to a compromised account without understanding its status.",
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
          "1. Calculate the fee for 80,000 gas at 25 gwei and value it at fictional USD 2,000 per ETH.",
          "2. An approval succeeds and a later swap reverts. Is the approval necessarily removed?",
          "3. What distinguishes a receipt marked failed from an action never broadcast?",
        ],
        answers: [
          "1. 80,000 × 25 = 2,000,000 gwei = 0.002 ETH, worth USD 4 at the supplied price.",
          "2. No. The approval is a separate action and may remain. Review it using verified permission guidance.",
          "3. The included failed transaction may have consumed gas. An action rejected before broadcast is not the same on-chain execution event.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is gas limit multiplied by the maximum fee always the actual final charge?",
        ],
        answers: [
          "No. Actual charges depend on gas consumed and effective fee components under the specific network rules.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Gas units and fee price are different inputs.",
          "A transaction ID alone does not prove success.",
          "A failed step can leave earlier permissions and costs intact.",
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
            title: "Ethereum: Transactions",
            url: "https://ethereum.org/developers/docs/transactions/",
          },
          {
            title: "Ethereum: Gas fees",
            url: "https://ethereum.org/gas/",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "ethereum.org: ethereum.org — Gas and fees",
            url: "https://ethereum.org/en/developers/docs/gas/",
          },
          {
            title: "ethereum.org: ethereum.org — ERC-20 token standard",
            url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
          },
          {
            title:
              "ethereum.org: ethereum.org — ERC-721 non-fungible token standard",
            url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
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
  course: "crypto-ethereum-and-networks",
  description:
    "Identify what a token represents without assuming the symbol establishes its rights.",
  estimatedMinutes: 9,
  learningPath: "crypto",
  level: "level-4",
  module: "ethereum-contracts-and-connected-networks",
  objectives: [
    "Identify what a token represents without assuming the symbol establishes its rights.",
  ],
  position: 4,
  prerequisites: ["gas-transactions-and-failed-attempts"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "gas-transactions-and-failed-attempts",
    "layer-one-layer-two-and-bridges",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Identify what a token represents without assuming the symbol establishes its rights.",
  seoTitle: "Tokens, Standards, NFTs and Asset Identity",
  slug: "tokens-standards-nfts-and-asset-identity",
  sources: [
    {
      title: "Ethereum: Token standards",
      url: "https://ethereum.org/developers/docs/standards/tokens/",
    },
    {
      title: "Ethereum: Introduction to blockchain bridges",
      url: "https://ethereum.org/bridges/",
    },
    {
      title: "Ethereum: How to bridge tokens to layer 2",
      url: "https://ethereum.org/guides/how-to-use-a-bridge/",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "Circle: USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "ethereum.org: ethereum.org — Gas and fees",
      url: "https://ethereum.org/en/developers/docs/gas/",
    },
    {
      title: "ethereum.org: ethereum.org — ERC-20 token standard",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
    },
    {
      title: "ethereum.org: ethereum.org — ERC-721 non-fungible token standard",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
    },
    {
      title: "ethereum.org: ethereum.org — Optimistic rollups",
      url: "https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/",
    },
    {
      title: "ethereum.org: ethereum.org — Zero-knowledge rollups",
      url: "https://ethereum.org/en/developers/docs/scaling/zk-rollups/",
    },
    {
      title: "ethereum.org: ethereum.org — Sidechains",
      url: "https://ethereum.org/en/developers/docs/scaling/sidechains/",
    },
  ],
  status: "published",
  title: "Tokens, Standards, NFTs and Asset Identity",
};
const sections4: LessonSection[] = [
  {
    title: "Fungible tokens and unique identifiers",
    shortTitle: "Fungible tokens and unique identifiers",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Identify what a token represents without assuming the symbol establishes its rights.",
      },
      {
        type: "paragraph",
        children:
          "Token standards make it easier for applications to recognise common functions. They do not guarantee genuine assets, valuable rights or safe contracts. This lesson compares interchangeable tokens, unique-token identifiers and multi-token systems, then connects technical identity to the rights a holder actually receives.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Record technical identity and legal or practical rights in separate fields.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet ERC 20 the common token standard",
      },
      {
        type: "paragraph",
        children:
          "Think about electrical sockets. Because every socket in a country follows one standard, any lamp or charger built for it plugs in and works.",
      },
      {
        type: "paragraph",
        children:
          "Token standards do the same job on Ethereum. A token is not a coin with its own blockchain; it is a set of balances kept inside a smart contract. ERC-20, proposed by Fabian Vogelsteller in November 2015, is the standard for fungible tokens, where each unit is identical to every other, like one €10 note and another. Because every ERC-20 token offers the same basic functions, wallets and apps can support a new one without custom work. Many stablecoins from the stablecoin and transfer lessons in Level 3 are ERC-20 tokens, and Level 5 sorts tokens by purpose.",
      },
      {
        type: "paragraph",
        children:
          "Four functions are worth recognising: transfer (send tokens), approve (let another address spend some of your tokens), allowance (check how much that permission covers) and transferFrom (let the approved address move them). The last three are the heart of approvals, coming shortly.",
      },
      {
        type: "example",
        title: "A token she didn't buy",
        children:
          "Siti in Jakarta sees 5,000 units of an unknown token in her wallet, with a website link in its name. Anyone can create an ERC-20 token with any name and send it to any address. Siti ignores the link, because unknown tokens are a common lure to phishing sites like those in the security lessons in Level 2.",
      },
      {
        type: "paragraph",
        children:
          "The socket analogy has limits. A socket standard is enforced by safety law; an ERC-20 contract only promises the basic functions, and what else its code does depends on its author. ethereum.org also notes that ERC-20 tokens sent to a contract not built to handle them can be stuck for good, with more than US$83 million lost this way by mid-2024.",
      },
      {
        type: "paragraph",
        children:
          "Fungible tokens are interchangeable by design. The next standard was built for things that are not.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand NFTs ERC 721 and ERC 1155",
      },
      {
        type: "paragraph",
        children:
          "Compare a banknote with a concert ticket. Any €20 note can replace any other. A ticket for seat 14, row C, cannot be swapped for seat 3, row Z without changing what you get. The ticket is non-fungible.",
      },
      {
        type: "paragraph",
        children:
          'ERC-721, proposed by William Entriken, Dieter Shirley, Jacob Evans and Nastassia Sachs in January 2018, is the standard for non-fungible tokens (NFTs). Each token has its own ID, and "contract address plus token ID" is unique worldwide. ethereum.org lists uses such as collectibles, access keys and numbered event seats. Ethereum Name Service (ENS) names, readable names ending in .eth, are NFTs too.',
      },
      {
        type: "paragraph",
        children:
          "NFTs grew from games and art. CryptoKitties, a game for collecting digital cats, launched in 2017. In March 2021 Christie's auctioned an NFT of an artwork by Beeple for US$69 million, bringing NFTs into mainstream news.",
      },
      {
        type: "paragraph",
        children:
          "A third standard, ERC-1155, is the multi-token standard. One contract can hold many kinds of token at once, some fungible and some unique: picture a game's thousands of identical gold coins and a single legendary sword. It can also move several items in one batch, which saves gas.",
      },
      {
        type: "definition",
        term: "NFT (non-fungible token)",
        children:
          "A token with its own unique ID, recorded on a blockchain, that shows which address holds that particular item.",
      },
      {
        type: "paragraph",
        children:
          "So an NFT records who holds a token ID. The harder question is what that record actually gives you.",
      },
      {
        type: "paragraph",
        children:
          "ERC-1155 can manage multiple token types with different quantities in one system. They do not determine a fair price or every implementation detail. Two tokens following a common standard are not the same asset. A marketplace thumbnail is not a complete asset identifier.",
      },
    ],
  },
  {
    title: "Asset backing and verified identity",
    shortTitle: "Asset backing and verified identity",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Native coins wrapped coins and bridged claims",
      },
      {
        type: "paragraph",
        children:
          "ETH is native to Ethereum, while a contract token is tracked through its contract state. A wrapped asset commonly represents another asset through a defined mechanism. Some wrapping occurs within one chain's contracts; bridging can move exposure between networks and introduce different parties. These arrangements should not be grouped together without explaining their actual backing and redemption.",
      },
      {
        type: "paragraph",
        children:
          "A wallet can display both a native asset and a representation with similar names. The representation's usefulness depends on the mechanism and applications accepting it. An issuer-backed representation may rely on custody, while another design may rely on a contract conversion. Map the claim and the exit route. A matching market price does not make the underlying rights and failure risks identical.",
      },
      {
        type: "paragraph",
        children:
          "A wrapped token is like a gift voucher for an item held in a shop's stockroom. The voucher is handy to pass around, but its value depends on the shop still holding the item and honouring the voucher.",
      },
      {
        type: "paragraph",
        children:
          "A wrapped token is a token on one network that stands for another asset, one for one, and can normally be swapped back for the original. There are three common kinds:",
      },
      {
        type: "paragraph",
        children:
          "•  Wrapped ether (WETH). ETH itself is not an ERC-20 token, so WETH wraps it into one, letting apps treat ETH like any other ERC-20 token. The ETH is held by a contract, not a company.",
      },
      {
        type: "paragraph",
        children:
          "•  Custodian-wrapped assets, such as wrapped bitcoin (WBTC). A custodian holds the real bitcoin, and for every WBTC on Ethereum, one BTC is meant to sit in reserve. You are trusting that custodian to keep it there.",
      },
      {
        type: "paragraph",
        children:
          '•  Bridged tokens. A token minted by a bridge, like the "1 bridged ETH" in the diagram. Its backing is the bridge vault.',
      },
      {
        type: "example",
        title: "Same name, different backing",
        children:
          "Raj in Delhi sees two tokens in his rollup wallet that both show the same stablecoin name. One was issued directly on that network by its issuer; the other was minted by a bridge. He checks each contract address in the network's block explorer and the issuer's official list, because the bridged one depends on the bridge vault staying intact.",
      },
      {
        type: "paragraph",
        children:
          "Each wrapped token adds a layer of trust: in a contract, a custodian or a bridge. In 2022, several bridges showed what happens when that layer fails.",
      },
      {
        type: "heading",
        level: 3,
        children: "Verify identity decimals and issuer documents",
      },
      {
        type: "paragraph",
        children:
          "Check the intended network, verified contract and issuer documentation. Decimals tell an interface how to display raw units. A contract with six decimals represents 1,000,000 raw units as one displayed token; a different decimal setting changes that scale. This does not change the economic value or prove the token's legitimacy. Fake tokens can copy symbols, names and images.",
      },
      {
        type: "paragraph",
        children:
          "Unsolicited tokens may appear in a wallet without any action by the user. Their names or metadata may lead to malicious sites. Do not interact just because an apparent balance has a large price label. Verify whether a genuine market and rights exist, and never follow instructions embedded in unsolicited token metadata to claim or unlock value. A displayed holding can be spam rather than a windfall.",
      },
      {
        type: "comparisonTable",
        caption: "Technical identity and actual rights",
        columns: ["Item", "Identity to check", "Separate rights question"],
        rows: [
          [
            "Fungible token",
            "Network and verified contract",
            "Issuer claim utility and transfer restrictions",
          ],
          [
            "NFT",
            "Network contract and token ID",
            "Copyright licence content and redemption",
          ],
          [
            "Multi-token item",
            "Network contract type and identifier",
            "Quantity and permissions for that item",
          ],
          [
            "Wrapped asset",
            "Contract and backing mechanism",
            "Conversion or redemption rights",
          ],
          [
            "Tokenised outside asset",
            "Contract plus legal issuer documents",
            "Enforceability custody and jurisdiction",
          ],
        ],
      },
    ],
  },
  {
    title: "NFT rights and issuer controls",
    shortTitle: "NFT rights and issuer controls",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "NFT ownership and separate rights",
      },
      {
        type: "paragraph",
        children:
          "Owning an NFT is like holding a numbered certificate for a painting. It shows you hold that item. It does not, by itself, give you the painting's copyright, and it may not even include the painting.",
      },
      {
        type: "paragraph",
        children:
          "In practice, buying an NFT usually gives you the token, not the copyright. Any rights to use or copy the image come from the licence the creator attaches, which differs between projects, so read it. The media is also often stored off the blockchain: the token points to a metadata link, and if that link stops working, your token can point to nothing.",
      },
      {
        type: "paragraph",
        children:
          "There are other risks. There may be few buyers when you want to sell, so prices can fall to near zero. Copycat collections imitate famous ones. And because NFTs sit in the same wallet as your other assets, a phishing link aimed at them can endanger everything else.",
      },
      {
        type: "comparisonTable",
        caption: "Three Ethereum token standards compared",
        columns: [
          "Standard",
          "Type",
          "Everyday comparison",
          "Common uses",
          "Main risks to check",
        ],
        rows: [
          [
            "ERC-20 (2015)",
            "Fungible",
            "Banknotes of one currency",
            "Stablecoins, governance and other tokens",
            "Fake or copycat tokens; harmful extra code; tokens stuck in the wrong contract",
          ],
          [
            "ERC-721 (2018)",
            "Non-fungible",
            "Numbered concert tickets",
            "Art, collectibles, ENS names, tickets",
            "Copyright and licence confusion; off-chain media; few buyers; copycats",
          ],
          [
            "ERC-1155",
            "Both, in one contract",
            "A game's inventory of coins and unique items",
            "Games, editions, batches of items",
            "All-or-nothing approvals; same NFT risks",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "To buy, sell or use any of these tokens, you usually connect your wallet to an app. That connection is where permissions begin.",
      },
      {
        type: "paragraph",
        children:
          "Holding an NFT generally means controlling a particular token under its contract rules. An image may be stored through a link rather than entirely in the token, and that link or hosted content may change or become unavailable. For a tokenised real-world asset, identify the legal issuer, enforceable claim, custody of the outside asset, jurisdiction and redemption restrictions. A token cannot by its own technical existence establish that a house, bond or artwork legally belongs to the holder.",
      },
      {
        type: "heading",
        level: 3,
        children: "Minting freezing transfers and upgrades",
      },
      {
        type: "paragraph",
        children:
          "Contracts may permit minting, burning, freezing, transfer restrictions or upgrades. Minting creates units under the contract's rules; burning removes units under those rules. Neither operation alone establishes a holder's return. A token with administrator powers may be unusable or altered in ways that a holder did not expect if those powers are overlooked.",
      },
      {
        type: "paragraph",
        children:
          "Inspect who holds the powers, whether limits exist and which version of the code applies. Some transfers deduct a charge or behave differently from a simple token example. A successful appearance in a wallet is not evidence that selling or transferring will work. Later token research combines these technical facts with allocation, liquidity and legal rights to produce a useful dossier instead of a list of attractive slogans.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The concert souvenir and the photograph",
        children:
          "Marco in Italy buys a numbered concert souvenir for EUR 30. Owning that object does not automatically give him copyright in the band's photograph or a share of ticket sales. An NFT can likewise identify a controlled token while providing only the rights stated in its terms. Marco checks whether he may display the image, use it commercially or redeem anything, rather than assuming every right transfers with the token.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not follow claim links embedded in unsolicited tokens or assume a displayed balance is sellable value.",
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
          "1. A token uses six decimals. How many displayed tokens are 2,500,000 raw units?",
          "2. Does buying an NFT automatically give copyright?",
          "3. Name four powers to inspect in a token contract.",
        ],
        answers: [
          "1. 2.5 displayed tokens. Divide raw units by 1,000,000.",
          "2. No. Copyright or licence rights depend on separate terms and applicable law.",
          "3. Minting, burning, freezing, transfer restrictions and upgrades are relevant examples. Inspect the actual implementation and authorities.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does compliance with a token standard establish that a token is genuine and safe?",
        ],
        answers: [
          "No. Standards support compatibility; identity, code, permissions and rights require separate review.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Standard compatibility is not asset authenticity.",
          "NFT identity and content rights are distinct.",
          "Administrator powers can affect supply and usability.",
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
            title: "Ethereum: Token standards",
            url: "https://ethereum.org/developers/docs/standards/tokens/",
          },
          {
            title: "Ethereum: Introduction to blockchain bridges",
            url: "https://ethereum.org/bridges/",
          },
          {
            title: "Ethereum: How to bridge tokens to layer 2",
            url: "https://ethereum.org/guides/how-to-use-a-bridge/",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "Circle: USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title: "ethereum.org: ethereum.org — Gas and fees",
            url: "https://ethereum.org/en/developers/docs/gas/",
          },
          {
            title: "ethereum.org: ethereum.org — ERC-20 token standard",
            url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
          },
          {
            title:
              "ethereum.org: ethereum.org — ERC-721 non-fungible token standard",
            url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
          },
          {
            title: "ethereum.org: ethereum.org — Optimistic rollups",
            url: "https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/",
          },
          {
            title: "ethereum.org: ethereum.org — Zero-knowledge rollups",
            url: "https://ethereum.org/en/developers/docs/scaling/zk-rollups/",
          },
          {
            title: "ethereum.org: ethereum.org — Sidechains",
            url: "https://ethereum.org/en/developers/docs/scaling/sidechains/",
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
  course: "crypto-ethereum-and-networks",
  description:
    "Explain scaling and transfers while recognising different security and withdrawal assumptions.",
  estimatedMinutes: 12,
  learningPath: "crypto",
  level: "level-4",
  module: "ethereum-contracts-and-connected-networks",
  objectives: [
    "Explain scaling and transfers while recognising different security and withdrawal assumptions.",
  ],
  position: 5,
  prerequisites: ["tokens-standards-nfts-and-asset-identity"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["tokens-standards-nfts-and-asset-identity"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain scaling and transfers while recognising different security and withdrawal assumptions.",
  seoTitle: "Layer One, Layer Two and Bridges",
  slug: "layer-one-layer-two-and-bridges",
  sources: [
    {
      title: "Ethereum: Layer 2",
      url: "https://ethereum.org/layer-2/",
    },
    {
      title: "Ethereum: Introduction to blockchain bridges",
      url: "https://ethereum.org/bridges/",
    },
    {
      title: "Ethereum: How to bridge tokens to layer 2",
      url: "https://ethereum.org/guides/how-to-use-a-bridge/",
    },
    {
      title: "ethereum.org: ethereum.org — Optimistic rollups",
      url: "https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/",
    },
    {
      title: "ethereum.org: ethereum.org — Zero-knowledge rollups",
      url: "https://ethereum.org/en/developers/docs/scaling/zk-rollups/",
    },
    {
      title: "ethereum.org: ethereum.org — Sidechains",
      url: "https://ethereum.org/en/developers/docs/scaling/sidechains/",
    },
  ],
  status: "published",
  title: "Layer One, Layer Two and Bridges",
};
const sections5: LessonSection[] = [
  {
    title: "Base networks, rollups and sidechains",
    shortTitle: "Base networks rollups and sidechains",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain scaling and transfers while recognising different security and withdrawal assumptions.",
      },
      {
        type: "paragraph",
        children:
          "Networks with lower fees can look similar in a wallet while relying on different security arrangements. Layer one, layer two, sidechain and bridge are not interchangeable words. We will map the route an asset takes and identify who or what must continue working for the asset to be usable and withdrawable.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Map the complete path from source asset to destination asset and back.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask why Ethereum needs to scale",
      },
      {
        type: "paragraph",
        children:
          "Think about a popular bus route at rush hour. The bus has a fixed number of seats. When more people want to ride than there are seats, the operator could raise the fare until enough people give up, and the ones who pay most get on first.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum's blocks work like that bus. In the gas and token lessons in Level 4 you saw that each block has a maximum size, and that the base fee rises when blocks are full. That space inside blocks is called blockspace, and there is only so much of it. When many people want it at once, fees climb, and small transfers become expensive compared with the amounts being moved.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum could make blocks much bigger, but bigger blocks need more powerful computers to check them. Fewer people could run a node, and the network would drift towards those who can afford the hardware. So instead of squeezing everyone onto the main bus, Ethereum adds more vehicles that report back to it, called layer 2s.",
      },
      {
        type: "paragraph",
        children:
          "The bus analogy has a limit. A bus company can buy a bigger bus overnight. Ethereum's limits are deliberate trade-offs that protect decentralisation, which is why extra capacity is built on top of Ethereum.",
      },
      {
        type: "heading",
        level: 3,
        children: "Separate layer 1 from layer 2",
      },
      {
        type: "definition",
        term: "Layer 1",
        children:
          "A base blockchain that agrees on its own blocks and secures itself, such as Bitcoin or Ethereum.",
      },
      {
        type: "definition",
        term: "Layer 2",
        children:
          "A separate network that processes transactions away from a layer 1 but relies on that layer 1 for security, for example by posting its data or proofs back to it.",
      },
      {
        type: "paragraph",
        children:
          'You have met one layer 2 already: the Lightning Network on Bitcoin, from the transaction and fee lessons in Level 1. On Ethereum, most layer 2s are rollups. In the Ethereum and contract lessons in Level 4 you also met the Dencun upgrade of March 2024, whose "blobs" gave rollups a cheaper place to store their data on Ethereum and cut their fees.',
      },
      {
        type: "paragraph",
        children:
          'The phrase "relies on that layer 1 for security" is the important part. It is what separates a true layer 2 from a network that only looks like Ethereum. To see how a rollup earns that link, look at what it actually does with your transactions.',
      },
      {
        type: "heading",
        level: 3,
        children: "Know why a sidechain is different",
      },
      {
        type: "paragraph",
        children:
          "Imagine a neighbouring town linked to your city by a bridge. It has its own council, its own police and its own rules. You can cross over and shop there cheaply, but if its council makes a bad decision, your city's courts can't overturn it.",
      },
      {
        type: "paragraph",
        children:
          "A sidechain is that neighbouring town. ethereum.org describes it as a separate blockchain that runs independently of Ethereum and connects to it through a two-way bridge. It uses its own way of agreeing on blocks, and, unlike a rollup, it does not post its transaction data back to Ethereum. Polygon PoS and Gnosis Chain are examples that ethereum.org lists, named here only to illustrate the category.",
      },
      {
        type: "paragraph",
        children:
          "Many sidechains run the EVM, so addresses and apps look exactly like Ethereum's. That is convenient but confusing: the same 0x address can exist on several networks, so check which network you are sending on, as in the transfer checking lesson in Level 2. And because a sidechain secures itself, ethereum.org warns that a group of its validators acting together could commit fraud.",
      },
      {
        type: "comparisonTable",
        caption: "Three ways to get cheaper transactions near Ethereum",
        columns: [
          "Comparison point",
          "Optimistic rollup",
          "ZK rollup",
          "Sidechain",
        ],
        rows: [
          ["Where it posts data", "Ethereum", "Ethereum", "Its own chain only"],
          [
            "How honesty is checked",
            "Assumed valid; fraud proofs during a challenge window",
            "A validity proof checked by Ethereum",
            "Its own validators",
          ],
          [
            "Withdrawal to Ethereum via its own bridge",
            "Waits about 7 days",
            "No challenge window once the proof is verified",
            "Depends on its bridge",
          ],
          [
            "Main extra trust",
            "Sequencer; someone watching for fraud; upgrade keys",
            "Sequencer; proof-system code; upgrade keys",
            "The sidechain's validators and bridge",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'You may have noticed "upgrade keys" in that table. Many rollups are still young, and their builders can change the rules. That is what L2BEAT measures.',
      },
      {
        type: "paragraph",
        children:
          "A layer-one network supplies its own base execution or settlement system under its consensus rules. A separate chain is not automatically Ethereum layer two because it uses familiar addresses or software. A lower displayed fee does not establish equivalent security. The user's route may also depend on an exchange that supports only part of the system. Names help orient you, but mechanisms explain what happens under stress.",
      },
    ],
  },
  {
    title: "Sequencers, proofs and maturity",
    shortTitle: "Sequencers proofs and maturity",
    blocks: [
      {
        type: "paragraph",
        children:
          "Optimistic rollups use a process that can challenge invalid results under their rules. Validity-proof rollups use proofs intended to establish the correctness of specified state transitions. Both descriptions cover families of implementations, not identical products. Proofs must be available and checked under the actual system, and other dependencies can remain.",
      },
      {
        type: "paragraph",
        children:
          "A sequencer commonly orders transactions and may be concentrated in an operator or limited set. Data availability concerns whether the information needed to verify or reconstruct the state can be obtained. Settlement concerns how results are accepted by the relevant base system. Ask what happens when the sequencer is unavailable, whether alternative submission exists and which administrative controls can change the system. Security should be described component by component.",
      },
      {
        type: "paragraph",
        children:
          "Picture an office where a hundred staff have expense claims. Instead of head office checking every receipt, a team leader collects a week of claims and sends one summary with copies of the receipts. Head office files the summary, and anyone can recheck it from the copies.",
      },
      {
        type: "example",
        title: "A cheaper coffee payment",
        children:
          "Chloé in Montreal repays a friend for coffee in a stablecoin on a rollup. Her fee is a few cents rather than the dollar or more it could cost on Ethereum in a busy hour (invented figures for this example). Her payment becomes one line in a batch posted to Ethereum.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare optimistic and zero knowledge rollups",
      },
      {
        type: "paragraph",
        children:
          "Return to the expense claims sent to head office. One way to check the summary is to publish it and allow a defined period for a challenge. An optimistic rollup uses a related idea: a state claim can be challenged through the actual dispute system. The challenge period and who can use that system depend on the project and its current contracts. Some common withdrawal routes involve roughly a week, but that is not a universal rule for every network or transfer.",
      },
      {
        type: "paragraph",
        children:
          "A second approach supplies a mathematical validity proof that the receiving verifier checks. A validity rollup does not need the same fraud-challenge waiting period, although proof generation, submission, settlement and the withdrawal interface can still take time. A name containing zero knowledge does not, by itself, promise private transactions. The proof may be used to establish correct computation while transaction data remains public.",
      },
      {
        type: "paragraph",
        children:
          "The office analogy has a limit. A human certificate relies on the auditor's judgement. A cryptographic proof is checked according to a verification system, whose design and implementation still need scrutiny. Both types of system also have questions about data availability, administrators, upgrades, sequencer outages and emergency exits. A sound proof mechanism is one part of the complete route.",
      },
      {
        type: "example",
        title: "The quicker route has another dependency",
        children:
          "A learner in Seoul compares the project's own withdrawal with a fast service that pays on the destination network before the ordinary route completes. The fast service may charge a fee and add liquidity, counterparty or contract risk. Its quicker quote does not shorten the underlying system's challenge period. Record the exact route, assets and conditions before comparing the two quotes.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read a layer 2 s maturity with L2BEAT",
      },
      {
        type: "paragraph",
        children:
          "L2BEAT's stages framework helps describe how much a rollup still depends on permissioned control. Broadly, Stage 0 has substantial operator control, Stage 1 meets defined limits on those powers, and Stage 2 aims for stronger control through the system's rules.",
      },
      {
        type: "paragraph",
        children:
          "The precise criteria evolve. Read the framework version, the project's current assessment, upgrade powers, proof system, data availability and exit conditions. Do not memorise a number of days from an old table and assume it applies to every project or every later framework revision.",
      },
      {
        type: "warning",
        title: "A stage is not a safety certificate",
        children:
          "Decentralised controls can coexist with bugs, fragile proofs or an unusable exit. A research conclusion should state both the stage and its limits. For this course, compare published assessments on paper instead of moving funds merely to test a project.",
      },
    ],
  },
  {
    title: "Bridges, withdrawal paths and costs",
    shortTitle: "Bridges withdrawal paths and costs",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Deposits withdrawal waits and representations",
      },
      {
        type: "paragraph",
        children:
          "A deposit route moves or represents value according to the system's bridge or messaging rules. A withdrawal can require waiting, proof submission or another sequence. Fast third-party routes may provide liquidity while introducing additional counterparties and fees. Do not assume the quickest interface uses the same process as the canonical withdrawal mechanism.",
      },
      {
        type: "paragraph",
        children:
          "Identify the exact token received. It may be an issuer-supported token, a native asset or a bridged representation with different backing. Fees may be needed on both networks, and sending out of the destination can require its native fee asset. Check supported networks and instructions at every endpoint. A successful deposit does not prove that the future exit will be cheap, immediate or available through the same service.",
      },
      {
        type: "comparisonTable",
        caption: "Map a fictional cross network route",
        columns: ["Stage", "Asset or mechanism", "Dependency to record"],
        rows: [
          [
            "Source",
            "Token A on Network R",
            "Verified contract and wallet authority",
          ],
          [
            "Source bridge",
            "Lock or other documented operation",
            "Contract and administrator powers",
          ],
          [
            "Verification",
            "Proof signers or operators",
            "Actual verification and availability rules",
          ],
          [
            "Destination",
            "Representation A on Network S",
            "Exact contract and backing",
          ],
          [
            "Return",
            "Documented withdrawal path",
            "Delay liquidity fees and pause risk",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Bridges and the full dependency path",
      },
      {
        type: "paragraph",
        children:
          "Think about a cloakroom at a concert. You hand over your coat, and the attendant gives you a numbered ticket. Inside the venue, the ticket stands for your coat. At the end of the night, you hand back the ticket and get your coat.",
      },
      {
        type: "paragraph",
        children:
          "A lock-and-mint bridge works the same way. You send ETH to a bridge contract on Ethereum, which locks it in a vault. The bridge then creates, or mints, the same amount of a matching token on the other network. When you want to return, you send that token back; the bridge burns it and unlocks your ETH on Ethereum. ethereum.org also describes burn-and-mint designs and liquidity networks, where providers hold funds on both networks and swap with you for a fee instead of locking and minting.",
      },
      {
        type: "definition",
        term: "Bridge",
        children:
          "A system that lets tokens or messages move between two blockchains, usually by locking or burning assets on one side and minting or releasing them on the other.",
      },
      {
        type: "paragraph",
        children:
          "The cloakroom analogy breaks down in an important way. Thieves in a cloakroom take a few coats. A bridge vault holds everyone's locked funds in one place, and the tokens on the other network are only worth something while it stays full. If the vault is emptied, or someone mints tokens without locking anything, those tokens can lose their backing overnight.",
      },
      {
        type: "paragraph",
        children:
          "The minted token on the other side has a name: it is a wrapped token.",
      },
      {
        type: "paragraph",
        children:
          "A bridge's past transaction volume is not a complete security assessment. You need the current design and version, not merely a label saying cross-chain.",
      },
      {
        type: "diagram",
        alt: "One lock-and-mint design. Other bridges use different verification or liquidity routes; backing and return access must be checked.",
        caption:
          "One lock-and-mint design. Other bridges use different verification or liquidity routes; backing and return access must be checked.",
        width: 1980,
        height: 1286,
        src: "/lessons/crypto/level-4/lesson-5-rId35.png",
      },
      {
        type: "heading",
        level: 3,
        children: "Costs and paper practice without a real bridge",
      },
      {
        type: "paragraph",
        children:
          "This lesson requires a route diagram and a checklist, not a real bridge transaction. Use a supplied fictional source and destination. State the asset identity, fee assets, confirmation or withdrawal assumptions, administrator powers and unresolved questions. If any endpoint is unsupported or uncertain, the correct outcome is to pause rather than fill the gap with an assumption.",
      },
      {
        type: "paragraph",
        children:
          "If you later examine a real route, use current official instructions and repeat the Level 2 transfer checks. Do not experiment with funds merely to establish whether a bridge is legitimate. A small successful transfer can test one current route without certifying contract security or long-term redemption. Understanding the dependency path is the learning objective; completing an irreversible transfer is not.",
      },
      {
        type: "example",
        title:
          "Is the trip worth it? Bruno in São Paulo wants to move 0.5 ETH from Ethereum to a rollup through a liquidity network",
        children:
          "Gas on Ethereum is 0.002 ETH, the bridge fee is 0.001 ETH, and his first transaction on the rollup costs 0.0001 ETH (all invented figures for this example). The total is 0.0031 ETH, or 0.62% of 0.5 ETH. At an invented price of R$20,000 per ETH, that is R$62. If he moved only 0.05 ETH, the same fees would be 6.2% of the amount.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A train journey with a ferry connection",
        children:
          "Emma in the UK buys a journey quoted at GBP 25. The train runs reliably, but a ferry connection is needed to reach the final destination. A ferry suspension can interrupt the journey even if both railway systems are working. Bridged assets similarly can depend on an intermediate mechanism beyond the source and destination chains. Emma maps the connection, operator and return route rather than judging the whole journey by the condition of the first train.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Cross-chain practice is optional and can be completed with diagrams and supplied records.",
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
          "1. Does a sidechain automatically share Ethereum's exact security model?",
          "2. Name three questions for a rollup sequencer outage.",
          "3. Why can a bridged stablecoin lose value while its underlying token remains near USD 1?",
        ],
        answers: [
          "1. No. It commonly has its own consensus and bridge dependencies. Inspect the actual design.",
          "2. Can users submit through another route, is needed data available, and can withdrawal or settlement proceed under the rules?",
          "3. The bridge or representation can lose backing, usability or redemption confidence independently of the underlying issuer.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a successful small bridge transfer establish that the bridge is safe?",
        ],
        answers: [
          "No. It demonstrates one route worked at one time, not that code, authorities or future exit are secure.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Scaling labels need mechanism-level explanations.",
          "Representations can have additional backing and authority risk.",
          "The return route is part of the original risk assessment.",
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
            title: "Ethereum: Layer 2",
            url: "https://ethereum.org/layer-2/",
          },
          {
            title: "Ethereum: Introduction to blockchain bridges",
            url: "https://ethereum.org/bridges/",
          },
          {
            title: "Ethereum: How to bridge tokens to layer 2",
            url: "https://ethereum.org/guides/how-to-use-a-bridge/",
          },
          {
            title: "ethereum.org: ethereum.org — Optimistic rollups",
            url: "https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/",
          },
          {
            title: "ethereum.org: ethereum.org — Zero-knowledge rollups",
            url: "https://ethereum.org/en/developers/docs/scaling/zk-rollups/",
          },
          {
            title: "ethereum.org: ethereum.org — Sidechains",
            url: "https://ethereum.org/en/developers/docs/scaling/sidechains/",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel4Lessons: LessonDocument[] = [
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
