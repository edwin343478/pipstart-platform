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
  course: "crypto-advanced-and-graduation",
  description:
    "Compare network trust assumptions and trace linked failure risks.",
  estimatedMinutes: 20,
  learningPath: "crypto",
  level: "level-10",
  module: "advanced-awareness-and-graduation",
  objectives: [
    "Compare network trust assumptions and trace linked failure risks.",
  ],
  position: 1,
  prerequisites: ["read-results-honestly-and-build-a-practice-routine"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["daos-governance-oracles-and-audit-limits"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Compare network trust assumptions and trace linked failure risks.",
  seoTitle: "Consensus Network Security and Cross Chain Dependencies",
  slug: "crypto-consensus-network-security-and-cross-chain-dependencies",
  sources: [
    {
      title: "NIST  Blockchain Technology Overview NISTIR 8202",
      url: "https://csrc.nist.gov/pubs/ir/8202/final",
    },
    {
      title: "Bitcoin community  Bitcoin Developer Guide Block Chain",
      url: "https://developer.bitcoin.org/devguide/block_chain.html",
    },
    {
      title: "Ethereum  Proof of stake",
      url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
    },
    {
      title: "Bitcoin community  Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin community  Bitcoin Core Validation",
      url: "https://bitcoin.org/en/bitcoin-core/features/validation",
    },
    {
      title: "Ethereum  Layer 2",
      url: "https://ethereum.org/layer-2/",
    },
    {
      title: "Ethereum  Introduction to blockchain bridges",
      url: "https://ethereum.org/bridges/",
    },
    {
      title: "Ethereum  How to bridge tokens to layer 2",
      url: "https://ethereum.org/guides/how-to-use-a-bridge/",
    },
    {
      title: "Ethereum  Pooled staking",
      url: "https://ethereum.org/staking/pools/",
    },
    {
      title: "Ethereum  Restaking",
      url: "https://ethereum.org/restaking/",
    },
    {
      title: "Bitcoin Developer Guide  Bitcoin Developer Guide — Mining",
      url: "https://developer.bitcoin.org/devguide/mining.html",
    },
    {
      title: "ethereum.org  ethereum.org — Proof-of-stake (PoS)",
      url: "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/",
    },
    {
      title: "ethereum.org  ethereum.org — Client diversity",
      url: "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
    },
    {
      title: "ethereum.org  ethereum.org — Introduction to Ethereum governance",
      url: "https://ethereum.org/en/governance/",
    },
    {
      title: "ethereum.org  ethereum.org — Introduction to blockchain bridges",
      url: "https://ethereum.org/en/developers/docs/bridges/",
    },
    {
      title: "ethereum.org  ethereum.org — Oracles",
      url: "https://ethereum.org/en/developers/docs/oracles/",
    },
    {
      title: "ethereum.org  ethereum.org — Smart contract security",
      url: "https://ethereum.org/en/developers/docs/smart-contracts/security/",
    },
  ],
  status: "published",
  title: "Consensus Network Security and Cross Chain Dependencies",
};
const sections1: LessonSection[] = [
  {
    title: "Consensus assumptions finality and availability",
    shortTitle: "Consensus assumptions finality and availability",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Compare network trust assumptions and trace linked failure risks.",
      },
      {
        type: "paragraph",
        children:
          "Advanced awareness means recognising a security assumption before relying on it. It does not require you to design a consensus protocol. This lesson revisits work, stake, finality and cross-chain routes with a wider view of concentration and failure. It also connects liquid staking and restaking to the dependency maps you have already built.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Name the capability and its limits before assessing an attack or security claim.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Consensus incentives and different designs",
      },
      {
        type: "paragraph",
        children:
          "Proof of work uses computational effort within a valid-history selection process. Proof of stake uses committed stake and protocol-defined voting or participation. Both require software validation, network communication and assumptions about participant behaviour. Concentration in mining pools, validators, operators or software clients can affect these assumptions in different ways.",
      },
      {
        type: "paragraph",
        children:
          "Count the relevant control rather than only the number of visible names. Several validators can use the same operator or client, and several miners can coordinate through one pool. Protocol governance also involves people adopting software and changes. A soft fork commonly tightens validity rules in a way older nodes can accept under the relevant design; a hard fork changes rules incompatibly for participants that do not adopt them. Actual upgrade consequences depend on the system and adoption.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask how strangers agree on one record",
      },
      {
        type: "paragraph",
        children:
          "Picture forty relatives in Mexico City planning a reunion in a group chat, with messages arriving out of order. Unless the family has a rule for deciding which date is final, the chat never settles.",
      },
      {
        type: "paragraph",
        children:
          "A blockchain has the same problem, at a much larger scale and with strangers who may lie. Its consensus mechanism must make it costly to pretend to be many people at once, and give everyone the same rule for picking the right chain when two versions compete.",
      },
      {
        type: "definition",
        term: "Consensus mechanism",
        children:
          "The rules and incentives that let a network of independent computers agree on which blocks are valid and in what order, even when some participants are faulty or dishonest.",
      },
      {
        type: "paragraph",
        children:
          "The analogy stops working at one point. Relatives forgive mistakes; a blockchain assumes some participants will cheat on purpose, so its rules must make cheating expensive. The first big choice is between spending energy and putting money at risk.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare proof of work and proof of stake",
      },
      {
        type: "paragraph",
        children:
          "You know proof of work from the mining and fee lessons in Level 1: miners spend electricity guessing hashes, and the winner adds the next block. What is at risk is the cost of machines and power.",
      },
      {
        type: "paragraph",
        children:
          "Proof of stake replaces that race with a deposit. Think of a market in Lyon where every stallholder pays a large bond to the town hall. Anyone caught using false scales loses part of the bond. Ethereum has worked this way since The Merge in September 2022 (the Ethereum and contract lessons in Level 4). A validator deposits 32 ETH, and ethereum.org explains that time is divided into slots of 12 seconds and epochs of 32 slots. In each slot one validator proposes a block, and a randomly chosen committee votes on it. Honest work earns rewards; provable cheating, such as signing two different blocks for the same slot, triggers slashing, where part of the stake is destroyed and the validator is removed.",
      },
      {
        type: "definition",
        term: "Slashing",
        children:
          "A penalty in proof of stake that destroys part of a validator's deposit when it provably breaks the rules, for example by voting for two conflicting blocks.",
      },
      {
        type: "paragraph",
        children:
          "The benefit is lower energy and hardware costs. The matching risk is that influence follows wealth, and pooled staking services (the lending and staking lessons in Level 6) can gather a big share. The bond analogy also breaks down: a town hall is a trusted referee, while proof of stake has only rules that every node enforces for itself.",
      },
      {
        type: "paragraph",
        children:
          "Other designs go further and hand the work to a small group.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet delegated and BFT style systems",
      },
      {
        type: "paragraph",
        children:
          "Some networks use elected or delegated block producers. Others use BFT-style voting rules that aim to tolerate specified faulty participants. These categories can overlap: a proof-of-stake system can use a BFT-style finality process.",
      },
      {
        type: "paragraph",
        children:
          "A classroom model with n equally weighted participants and the usual n ≥ 3f + 1 assumption can tolerate f Byzantine faults under its specified network and protocol assumptions. With 60 equal-weight participants, the bound is 19. That is not a universal rule for all blockchains.",
      },
      {
        type: "paragraph",
        children:
          "Real systems may weight votes by stake, use different quorums, or distinguish honest offline participants from actively conflicting ones. Safety and continued progress have different conditions, especially during network disruption. Inspect voting power and the protocol's actual assumptions rather than counting validator names alone.",
      },
      {
        type: "heading",
        level: 3,
        children: "Safety liveness finality and availability",
      },
      {
        type: "paragraph",
        children:
          "Safety concerns avoiding conflicting accepted outcomes under the protocol's assumptions. Liveness concerns continuing to make progress. Finality concerns when an outcome is treated as settled under defined conditions. Availability concerns access to the information or service needed to use or verify the system. A network can preserve one property while temporarily losing another.",
      },
      {
        type: "paragraph",
        children:
          "For example, a halt can stop new confirmations without automatically authorising theft from all wallets. A data-availability failure can prevent participants from reconstructing needed state even if a proof or headline result is displayed. Recovery procedures may involve software, governance or operational choices. Read the actual incident and protocol, rather than describing every delay as identical to a theft or every finality label as unconditional certainty.",
      },
      {
        type: "paragraph",
        children:
          "Finality describes when a protocol treats a result as settled under defined assumptions. In Bitcoin, additional confirmations increase the work needed to remove a payment through a competing valid history. There is no universal confirmation count that makes every theoretical risk vanish.",
      },
      {
        type: "paragraph",
        children:
          "Ethereum has a proof-of-stake checkpoint finality process. Normal timing is often described in epochs and slots, but participation and network conditions can delay finalisation. Block inclusion, wallet display and finalisation are distinct observations.",
      },
      {
        type: "example",
        title: "Two sellers",
        children:
          "A seller in Osaka checks a native Bitcoin payment against a chosen confirmation policy. A seller in Hamburg checks whether an Ethereum payment's block is finalised and whether any receiving service has credited it. Neither assumes that a convenient time estimate is a guarantee or that finality proves delivery of the goods.",
      },
    ],
  },
  {
    title: "Attack capabilities and the security budget",
    shortTitle: "Attack capabilities and the security budget",
    blocks: [
      {
        type: "paragraph",
        children:
          "A majority-work attack can attempt to reorganise valid recent history, censor transactions or reverse the attacker's own payments under appropriate conditions. It does not provide every user's private key or make compliant nodes accept arbitrary invalid issuance. Proof-of-stake attacks have their own voting thresholds, penalties and recovery assumptions; do not transfer a single percentage slogan to every network.",
      },
      {
        type: "paragraph",
        children:
          "Security discussions should identify the capability, required resources, affected property and limits. A signature forgery is different from an ordering attack, and a compromised administrator is different from a consensus failure. These distinctions matter for custody decisions and incident response. A remedy must address the actual authority or assumption that failed, not simply the most dramatic term in the news report.",
      },
      {
        type: "comparisonTable",
        caption: "State the failure property precisely",
        columns: [
          "Event",
          "Property affected",
          "Conclusion that does not follow",
        ],
        rows: [
          [
            "Network stops producing blocks",
            "Liveness",
            "Every private key is exposed",
          ],
          [
            "Competing valid history replaces recent blocks",
            "Settlement confidence and ordering",
            "Arbitrary invalid spends become valid",
          ],
          [
            "Needed state data unavailable",
            "Data availability and verification access",
            "A proof solves every exit problem",
          ],
          [
            "Upgrade key compromised",
            "Administrative control",
            "Consensus cryptography necessarily failed",
          ],
          [
            "Restaking penalty",
            "Additional collateral obligation",
            "Underlying reward guarantees compensation",
          ],
        ],
      },
      {
        type: "example",
        title: "The disappearing payment in Paris",
        children:
          "An attacker buys €50,000 of jewellery in Paris with bitcoin (an invented amount for this example). In secret, they mine a version of the same blocks where those coins go to another address of theirs, then release it once it carries more work. Nodes follow the chain with the most work, so the jeweller's payment vanishes: a double-spend.",
      },
      {
        type: "heading",
        level: 3,
        children: "Count the cost of attacking a network",
      },
      {
        type: "paragraph",
        children:
          "An attack should be named by the capability it needs and the property it threatens. A majority-work attacker can attempt to reorganise valid recent history, reverse its own payments or censor transactions. It cannot make full nodes accept arbitrary invalid issuance or derive every user's signing secret.",
      },
      {
        type: "paragraph",
        children:
          "A smaller share of mining power can still have a non-zero chance of a competing-history attack. The phrase 51% describes a majority advantage, not a sharp boundary below which every attack is impossible.",
      },
      {
        type: "paragraph",
        children:
          "Proof-of-stake thresholds concern particular actions and stake weights. Conflicting finality in Ethereum exposes at least a substantial slashable stake under the protocol's accountability rules. Disrupting progress, causing conflicting outcomes and changing rules are different scenarios. Do not turn total stake divided by three into a universal cash cost of every attack.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask who pays for security",
      },
      {
        type: "paragraph",
        children:
          "Think of the guards at a shopping centre in Toronto. If the shops inside become far more valuable but the guards' wages stay the same, robbery starts to look tempting.",
      },
      {
        type: "paragraph",
        children:
          "A blockchain's security budget is what it pays, each day, to the people who protect it. For Bitcoin that is the block subsidy plus fees (the supply and halving lesson in Level 1).",
      },
      {
        type: "formula",
        expression:
          "Daily security budget ≈ blocks per day × (subsidy + average fees per block) × price",
        explanation:
          "a 10-minute target gives about 144 blocks a day. With a 3.125 BTC subsidy, an invented 0.1 BTC of fees per block and an invented price of US$50,000, that is 144 × 3.225 × 50,000 ≈ US$23.2 million a day.",
      },
      {
        type: "paragraph",
        children:
          'Economist Eric Budish argued that this security is expensive by design: the recurring "flow" paid to miners must stay large compared with the one-off "stock" an attacker could gain. Security does not build up like a bank\'s reputation; it depends on the computing power deployed that day. As the subsidy shrinks, either fees must rise or the budget falls.',
      },
      {
        type: "paragraph",
        children:
          "In proof of stake, the stake that could be slashed plays that role. Either way, security costs something, and that cost sits inside a wider trade-off.",
      },
    ],
  },
  {
    title: "Concentration forks and governance",
    shortTitle: "Concentration forks and governance",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Weigh the decentralisation trade off",
      },
      {
        type: "paragraph",
        children:
          "Diners in Seoul joke that a restaurant can be fast, cheap or excellent, but only two of the three. Blockchains face a similar trade-off.",
      },
      {
        type: "paragraph",
        children:
          "This is often called the scalability trilemma. A chain wants scalability (processing more than one ordinary laptop could check), decentralisation (no dependence on a small group of large actors) and security (resisting attack even if a large share of participants try). Bitcoin keeps decentralisation and security but limits scale; small-validator chains gain scale but lean on a few operators; many separate chains split their security. Layer 2s (the scaling and bridge lesson in Level 4) try to escape the trade-off.",
      },
      {
        type: "paragraph",
        children:
          "Unlike a kitchen, the triangle can be stretched by new research, so treat the trilemma as a thinking tool, not a law.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check who really runs the network",
      },
      {
        type: "paragraph",
        children:
          "A city with a hundred bakeries is safe from one bad batch of bread, unless all hundred buy flour from the same mill. So count the operators, and also count what they share.",
      },
      {
        type: "paragraph",
        children:
          "Mining pools gather hashing power (the mining and fee lessons in Level 1), and staking pools gather stake (the lending and staking lessons in Level 6). Less visible is client software, the program a node runs. Ethereum has several clients written by different teams, so a bug in one need not hit the whole network.",
      },
      {
        type: "paragraph",
        children:
          "ethereum.org's client diversity page explains the thresholds for consensus clients. If one client with more than a third of stake has a bug, the chain can stop finalising. If a client with more than two thirds has a serious bug, the chain could finalise the wrong history and many validators could be slashed. It gives a dated example: in 2016, a denial-of-service attack in Shanghai hit Geth, then the dominant execution client, while other clients kept running. Its figures for October 2025 showed Geth at about 41% of execution clients and Lighthouse at about 43% of consensus clients.",
      },
      {
        type: "example",
        title: "The mill that feeds everyone",
        children:
          "Arjun in Bengaluru runs an Ethereum validator at home. He chooses a minority consensus client, reasoning that if the most popular client fails, his validator is less likely to be caught on the wrong side.",
      },
      {
        type: "paragraph",
        children:
          "Concentration also matters when rules change, because whoever runs the software decides which rules it enforces. That brings you to forks.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tell a soft fork from a hard fork",
      },
      {
        type: "paragraph",
        children:
          "Think of a football league changing its rules. If it bans a type of tackle, old referees can still follow the matches, because every game under the new rules is still valid under the old ones. If it allows something new, such as a fifth substitute, old referees would call the matches invalid.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin's terms, met in the keys and signing lesson in Level 1, follow the same logic. A soft fork makes only previously valid blocks or transactions invalid; it tightens the rules, so older nodes still accept new blocks. A hard fork changes the rules so that nodes that don't upgrade can't validate the new blocks, which can cause a permanent split.",
      },
      {
        type: "comparisonTable",
        caption: "Four dated forks",
        columns: ["Fork", "Type", "Date", "What changed"],
        rows: [
          [
            "The DAO fork",
            "Hard",
            "July 2016",
            "Ethereum returned funds after The DAO exploit; the unforked chain continued as Ethereum Classic",
          ],
          [
            "SegWit",
            "Soft",
            "August 2017",
            "Bitcoin changed how signature data is stored in transactions",
          ],
          [
            "Bitcoin Cash",
            "Hard",
            "August 2017",
            "A group split off to raise the block size limit",
          ],
          [
            "Taproot",
            "Soft",
            "November 2021",
            "Bitcoin added a new, more flexible type of output",
          ],
        ],
      },
      {
        type: "example",
        title: "Fork day",
        children:
          'Giulia in Rome reads that a coin she holds is about to hard-fork. She keeps her coins in her own wallet, ignores sites offering to "claim" the new coin for her seed phrase, and checks her exchange\'s official page to see whether it will support either chain.',
      },
      {
        type: "paragraph",
        children:
          "The football analogy breaks down because a league has a governing body. Bitcoin has none, which is why one fork became a years-long argument.",
      },
      {
        type: "heading",
        level: 3,
        children: "Revisit the blocksize wars",
      },
      {
        type: "paragraph",
        children:
          "Around 2015 to 2017, Bitcoin users argued about how to grow. One side wanted bigger blocks. The other feared bigger blocks would make nodes too costly to run, the trilemma in action, and preferred SegWit plus layer 2s such as Lightning.",
      },
      {
        type: "paragraph",
        children:
          'Bitcoin Optech describes how the SegWit upgrade got stuck. Its activation needed 95% of recent blocks to signal miner support, and signalling stalled below that level. Some users proposed a user-activated soft fork (BIP148), in which their nodes would reject blocks that did not signal. Miners then adopted BIP91, which lowered the threshold, and SegWit activated in August 2017. Those who wanted bigger blocks created Bitcoin Cash through a hard fork the same month. Taproot, by contrast, used a shorter "Speedy Trial" signal, locked in during June 2021 and activated in November 2021 without a similar fight.',
      },
      {
        type: "paragraph",
        children:
          "The lesson is not who was right. In a decentralised network, changing the rules means persuading miners, node operators, exchanges and users, and failed persuasion can end in two coins. How that persuasion is organised is called governance.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow how protocols change BIPs EIPs and on chain votes",
      },
      {
        type: "paragraph",
        children:
          "Think of neighbours in Melbourne proposing a playground. Someone writes a plan and people debate it, but nothing changes until people act on it.",
      },
      {
        type: "paragraph",
        children:
          'Off-chain governance works like that. Bitcoin changes start as Bitcoin Improvement Proposals (BIPs). BIP 2, written by Luke Dashjr in 2016, describes a BIP as a design document. A BIP reaches "Final" only once it is adopted in practice: for a soft fork, a clear miner majority signalling on the blockchain; for a hard fork, adoption by the entire Bitcoin economy. Ethereum uses Ethereum Improvement Proposals (EIPs), which ethereum.org says are discussed in public forums and on AllCoreDevs calls, tested, then bundled into upgrades. Developers cannot force anyone to upgrade, so they tend to avoid changes whose contentiousness outweighs the benefits.',
      },
      {
        type: "definition",
        term: "Off-chain governance",
        children:
          "Deciding protocol changes through public proposals, discussion and voluntary software upgrades, rather than through votes recorded on the blockchain.",
      },
      {
        type: "paragraph",
        children:
          "On-chain governance records votes as transactions, and the code often applies approved changes automatically. It is clearer and faster, but it gives most power to the largest token holders.",
      },
      {
        type: "comparisonTable",
        caption: "Off-chain vs on-chain governance",
        columns: [
          "Comparison point",
          "Off-chain (Bitcoin, Ethereum)",
          "On-chain",
        ],
        rows: [
          [
            "Where proposals live",
            "BIP and EIP documents, forums, calls",
            "Proposals submitted as transactions",
          ],
          [
            "Who decides",
            "Rough consensus of developers, node operators, miners or validators, users",
            "Token holders, weighted by holdings",
          ],
          [
            "How change happens",
            "People upgrade their software",
            "Code applies the result automatically",
          ],
          [
            "Main risk",
            "Slow decisions; contested splits",
            "Vote buying, low turnout, large holders",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Ethereum's DAO fork shows both sides. ethereum.org notes that a community vote showed over 85% support for the fork, but turnout was low and only ETH holders could vote. Those who disagreed kept the old chain as Ethereum Classic. Today, on-chain voting is most visible in the descendants of The DAO, so it is worth opening one up.",
      },
      {
        type: "diagram",
        alt: "Compatibility under changed rules. A hard fork can produce two surviving networks, but does not have to.",
        caption:
          "Compatibility under changed rules. A hard fork can produce two surviving networks, but does not have to.",
        src: "/lessons/crypto/level-10/lesson-1-rId55.png",
        width: 1980,
        height: 1254,
      },
    ],
  },
  {
    title: "Cross-chain verification exits and reused stake",
    shortTitle: "Cross-chain verification exits and reused stake",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Cross chain verification data and exit paths",
      },
      {
        type: "paragraph",
        children:
          "For a rollup, examine sequencer availability, proofs or challenge processes, data availability, upgrade authorities and withdrawal routes. For a bridge, examine verification, custody or liquidity mechanisms and administrative control. A proof can verify a defined statement while other components remain centralised or unavailable. A nominally valid state does not necessarily mean a beginner can exit immediately.",
      },
      {
        type: "paragraph",
        children:
          "Map the current version and emergency powers. A fast third-party withdrawal can replace delay with counterparty risk. An unavailable front end may be bypassable in theory while still impractical for the learner's knowledge and tools. Record that operational constraint honestly. Advanced awareness is useful when it reveals what would be needed during a failure, not when it encourages a complex rescue the learner cannot assess.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what you trust when you leave one chain",
      },
      {
        type: "paragraph",
        children:
          "Think of each blockchain as a country with its own rules. The analogy helps explain why information crossing a border needs a separate verification process. Problems start at the border, where something else has to vouch for what crosses.",
      },
      {
        type: "paragraph",
        children:
          "You met that border in the scaling and bridge lesson in Level 4. A bridge locks or burns an asset on one chain and mints or releases a matching one on another, and the vault of locked funds is a magnet for attackers. The Ronin bridge lost about US$625 million in March 2022, Wormhole about US$320 million in February 2022, and Nomad about US$190 million in August 2022. None of those losses needed a user to make a mistake.",
      },
      {
        type: "paragraph",
        children:
          "This lesson asks who each design makes you trust, because that decides how it fails, then asks the same of price data and code.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare bridge designs by who you trust",
      },
      {
        type: "paragraph",
        children:
          "To send a parcel from Ankara to Berlin, you could trust a private courier, which is fast and goes everywhere, or a system where both postal services check every handover themselves, which adds no new party to trust.",
      },
      {
        type: "paragraph",
        children:
          "ethereum.org sorts bridges the same way. Trusted bridges rely on an outside group, such as a set of validators or a multisig, to confirm that funds were locked on one side before releasing them on the other. They are usually fast, cheap and connect many chains, but you inherit the security of that group, not of the blockchains. Trust-minimised bridges, often called trustless bridges, verify the connected chains' data or proofs instead of relying on an outside signer group. This can reduce one dependency, but the underlying chains, verification code, data availability and any upgrade powers still need review. The label alone does not describe every part of the deployed bridge.",
      },
      {
        type: "paragraph",
        children:
          "Two other families matter. Message-passing bridges move arbitrary data, not only tokens, so an app on one chain can trigger an action on another. Liquidity networks swap assets using providers who hold funds on both sides; ethereum.org notes they are fast and cheap but cannot pass messages.",
      },
      {
        type: "definition",
        term: "Cross-chain messaging",
        children:
          "A system that carries instructions or data, not only tokens, from a smart contract on one blockchain to a smart contract on another.",
      },
      {
        type: "comparisonTable",
        caption: "Bridge designs and what can go wrong",
        columns: ["Design", "You trust", "Typical failure"],
        rows: [
          [
            "Trusted (multisig or validator set)",
            "The signers' honesty and key security",
            "Keys stolen or colluding signers, as at Ronin",
          ],
          [
            "Optimistic verification",
            "At least one honest watcher during a challenge window",
            "Nobody objects in time; slow exits",
          ],
          [
            "Light client or proof-based",
            "The two chains and the verifying code",
            "A bug in the code that checks proofs",
          ],
          [
            "Liquidity network",
            "The providers and the swap contract",
            "Not enough liquidity; contract bugs",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The parcel analogy breaks down at one point: a lost parcel affects one sender, while a bridge failure can hit everyone holding the bridged token, even people who never used the bridge.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how cross chain risk spreads",
      },
      {
        type: "paragraph",
        children:
          "Picture a gift voucher accepted in shops all over Rio de Janeiro. If the issuing shop goes bust, every shop that took the voucher as payment is suddenly holding paper.",
      },
      {
        type: "paragraph",
        children:
          "ethereum.org calls this systemic financial risk. A bridged token, backed by a bridge vault, can be used as collateral in lending apps, paired in DEX pools and bridged again. If the vault is drained or someone mints tokens with nothing behind them, every place that accepted those tokens is exposed. ethereum.org lists three other risk types for bridges: smart-contract bugs, counterparty risk from trusted operators who could censor or steal, and open questions about how young bridges behave under stress.",
      },
      {
        type: "example",
        title: "A message, not a token",
        children:
          "Ana in Rio uses a lending app that lives on two chains. When she repays her loan on one chain, a cross-chain message tells the app on the other chain to release her collateral (an invented setup for this example). If an attacker could forge such a message, they could release collateral that was never repaid. Ana's own wallet would be untouched, but the app's pool, and every depositor in it, would carry the loss.",
      },
      {
        type: "paragraph",
        children:
          "Bridges move data between chains. Many contracts also need data from outside any chain, which raises a problem of its own.",
      },
      {
        type: "heading",
        level: 3,
        children: "Reused stake creates linked obligations",
      },
      {
        type: "paragraph",
        children:
          "A liquid-staking representation links its value and redemption to underlying staking and its provider. Restaking can connect that stake or representation to additional services, with extra penalty, operator and contract rules. Using the resulting asset as lending collateral adds oracle and liquidation dependencies. Each layer can transmit a loss or access problem to the next.",
      },
      {
        type: "paragraph",
        children:
          "Trace the whole chain and identify whether losses can occur together. More reward sources do not automatically diversify risk if they rely on the same collateral and operators. Record exit delays, receipt-token liquidity and the obligations added by each service. You can complete the exercise as a diagram without staking anything. The next lesson examines governance and audits so that reviewed code is not mistaken for reviewed control or economic behaviour.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "One vehicle used for several deliveries",
        children:
          "A courier in South Africa schedules several delivery jobs using the same van. The extra work can generate more revenue, but a breakdown affects all jobs together. Reusing stake for several security services creates a related dependency question, though its penalties and rights are governed by protocol rules rather than a transport contract. A learner should identify shared collateral and operators before treating multiple ZAR-valued reward streams as independent protection.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Advanced awareness does not require live staking, bridging or complex rescue actions.",
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
          "1. Distinguish a chain halt from a key leak.",
          "2. Name four dependencies to add to a rollup map.",
          "3. Why can several restaking reward sources share one major risk?",
        ],
        answers: [
          "1. A halt interrupts progress; a key leak exposes spending authority. They have different loss mechanisms and responses.",
          "2. Sequencer, data availability, proof or challenge process, upgrade keys and withdrawal mechanism are relevant.",
          "3. They can depend on the same collateral, operator or contract chain, so one failure can affect several streams together.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Can a majority ordering attack automatically forge every user's signature?",
        ],
        answers: [
          "No. Ordering and validation assumptions are distinct from secret-key possession or signature forgery.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Describe the affected security property.",
          "Concentration can exist behind many participant names.",
          "Reused collateral connects obligations across services.",
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
            title: "NIST  Blockchain Technology Overview NISTIR 8202",
            url: "https://csrc.nist.gov/pubs/ir/8202/final",
          },
          {
            title: "Bitcoin community  Bitcoin Developer Guide Block Chain",
            url: "https://developer.bitcoin.org/devguide/block_chain.html",
          },
          {
            title: "Ethereum  Proof of stake",
            url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
          },
          {
            title:
              "Bitcoin community  Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin community  Bitcoin Core Validation",
            url: "https://bitcoin.org/en/bitcoin-core/features/validation",
          },
          {
            title: "Ethereum  Layer 2",
            url: "https://ethereum.org/layer-2/",
          },
          {
            title: "Ethereum  Introduction to blockchain bridges",
            url: "https://ethereum.org/bridges/",
          },
          {
            title: "Ethereum  How to bridge tokens to layer 2",
            url: "https://ethereum.org/guides/how-to-use-a-bridge/",
          },
          {
            title: "Ethereum  Pooled staking",
            url: "https://ethereum.org/staking/pools/",
          },
          {
            title: "Ethereum  Restaking",
            url: "https://ethereum.org/restaking/",
          },
          {
            title: "Bitcoin Developer Guide  Bitcoin Developer Guide — Mining",
            url: "https://developer.bitcoin.org/devguide/mining.html",
          },
          {
            title: "ethereum.org  ethereum.org — Proof-of-stake (PoS)",
            url: "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/",
          },
          {
            title: "ethereum.org  ethereum.org — Client diversity",
            url: "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
          },
          {
            title:
              "ethereum.org  ethereum.org — Introduction to Ethereum governance",
            url: "https://ethereum.org/en/governance/",
          },
          {
            title:
              "ethereum.org  ethereum.org — Introduction to blockchain bridges",
            url: "https://ethereum.org/en/developers/docs/bridges/",
          },
          {
            title: "ethereum.org  ethereum.org — Oracles",
            url: "https://ethereum.org/en/developers/docs/oracles/",
          },
          {
            title: "ethereum.org  ethereum.org — Smart contract security",
            url: "https://ethereum.org/en/developers/docs/smart-contracts/security/",
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
  course: "crypto-advanced-and-graduation",
  description:
    "Assess who can change a system and what a security report actually examines.",
  estimatedMinutes: 17,
  learningPath: "crypto",
  level: "level-10",
  module: "advanced-awareness-and-graduation",
  objectives: [
    "Assess who can change a system and what a security report actually examines.",
  ],
  position: 2,
  prerequisites: [
    "crypto-consensus-network-security-and-cross-chain-dependencies",
  ],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "crypto-consensus-network-security-and-cross-chain-dependencies",
    "crypto-valuation-regulation-and-institutional-products",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Assess who can change a system and what a security report actually examines.",
  seoTitle: "DAOs Governance Oracles and Audit Limits",
  slug: "daos-governance-oracles-and-audit-limits",
  sources: [
    {
      title: "Ethereum  Decentralised Autonomous Organisations",
      url: "https://ethereum.org/dao/",
    },
    {
      title: "Chainlink  What is a Blockchain Oracle",
      url: "https://chain.link/education/blockchain-oracles",
    },
    {
      title: "Ethereum  Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title:
        "PCAOB  Investor Bulletin on claims about PCAOB registration and oversight",
      url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
    },
    {
      title: "ethereum.org  ethereum.org — Proof-of-stake (PoS)",
      url: "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/",
    },
    {
      title: "ethereum.org  ethereum.org — Client diversity",
      url: "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
    },
    {
      title: "ethereum.org  ethereum.org — Introduction to Ethereum governance",
      url: "https://ethereum.org/en/governance/",
    },
    {
      title: "ethereum.org  ethereum.org — Introduction to blockchain bridges",
      url: "https://ethereum.org/en/developers/docs/bridges/",
    },
    {
      title: "ethereum.org  ethereum.org — Oracles",
      url: "https://ethereum.org/en/developers/docs/oracles/",
    },
    {
      title: "ethereum.org  ethereum.org — Smart contract security",
      url: "https://ethereum.org/en/developers/docs/smart-contracts/security/",
    },
  ],
  status: "published",
  title: "DAOs Governance Oracles and Audit Limits",
};
const sections2: LessonSection[] = [
  {
    title: "Follow governance and identify voting rights",
    shortTitle: "Follow governance and identify voting rights",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Assess who can change a system and what a security report actually examines.",
      },
      {
        type: "paragraph",
        children:
          "Governance, data and code review shape what an application can do after you begin using it. A vote may be advisory, an oracle may be stale and an audit may cover an old version. This lesson examines those boundaries together and asks what remains unknown even after a reassuring review report.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A reassuring label should lead to its underlying procedure or report.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow a DAO proposal through execution",
      },
      {
        type: "paragraph",
        children:
          "The DeFi dependency lesson in Level 6 covered governance tokens, voting concentration and treasury basics; this section adds the machinery and the law.",
      },
      {
        type: "paragraph",
        children:
          "Think of a sailing club in İzmir. A motion is debated, passes only if enough members vote, and the treasurer waits a notice period before paying, with two signatures on every cheque.",
      },
      {
        type: "paragraph",
        children:
          "A typical DAO copies those steps in code. An idea is debated on a public forum, often tested with an off-chain poll, then submitted as an on-chain proposal holding the exact transactions to run. Holders or delegates vote within a fixed window, and it passes only with a quorum, a minimum number of votes. A timelock (the DeFi dependency lesson in Level 6) then delays it so dissenters can leave. Finally a contract executes it, or a multisig of named members carries out an off-chain vote. Whoever executes controls the treasury.",
      },
      {
        type: "paragraph",
        children:
          "The club analogy stops at the law: a registered club has a legal identity that can sign contracts and limit what members owe, and many DAOs have none.",
      },
      {
        type: "definition",
        term: "Legal wrapper",
        children:
          "A company, foundation or association set up under a country's law to give a DAO a legal identity and, depending on the law, limit its members' personal liability.",
      },
      {
        type: "paragraph",
        children:
          "Wyoming's 2021 law lets a DAO register as a limited liability company (LLC). Others use foundations or purpose trusts in offshore centres such as the Cayman Islands, or nonprofit associations in some US states; the protection each gives depends on the law and the facts. In July 2024 the Law Commission of England and Wales warned that DAOs can expose participants to significant legal liabilities.",
      },
      {
        type: "paragraph",
        children:
          'The Ooki DAO case shows why. In September 2022 the US Commodity Futures Trading Commission (CFTC) sued it as an unincorporated association of token holders who had voted. In June 2023 a federal court held that the DAO could be sued as a "person", imposed a US$643,542 penalty and ordered its website shut down. The CFTC said it would not enforce the judgment against individual holders, but voters\' personal liability remains unsettled.',
      },
      {
        type: "example",
        title: "Reading before voting",
        children:
          "Lucas in São Paulo holds tokens in an invented DAO with a R$5 million treasury (an invented figure). Before voting, he checks for a legal entity, who executes passed votes and the timelock's length. He finds no wrapper and a 3-of-5 multisig run by one company, and notes that his country's view of voters is unclear.",
      },
      {
        type: "paragraph",
        children:
          "The risks follow the pipeline. Governance capture happens when a large or borrowed holding controls the vote, as at Beanstalk. Low turnout lets a small group decide. A treasury raid sends funds to insiders or attackers, and a timelock helps only if someone is watching. Unclear liability means voters may not know what they could owe. Next, separate what a vote can authorise from the legal rights it grants.",
      },
      {
        type: "paragraph",
        children:
          "A proposal may require eligibility, quorum and a vote threshold. Execution may occur automatically or through a committee, multi-signature account or administrator. A forum vote may not bind a contract, and an emergency power may bypass normal timing. A timelock can delay a change, but it does not ensure that every user sees the notice or can exit.",
      },
      {
        type: "heading",
        level: 3,
        children: "Voting rights and legal status",
      },
      {
        type: "paragraph",
        children:
          "A governance token can grant specified protocol participation without granting company ownership, guaranteed distributions or the legal protections of a share. A DAO's legal status and participant liability depend on jurisdiction and arrangement. The existence of on-chain voting does not resolve those questions automatically.",
      },
      {
        type: "paragraph",
        children:
          "Check the token's terms and the organisation's disclosed structure. Treasury decisions may benefit a protocol without paying every holder. A promise that the community owns everything needs precise documentation of ownership, control and enforceable rights. Keep technical voting authority separate from outside legal entitlement. This prevents governance enthusiasm from replacing the rights analysis learned at Level 0 and Level 5.",
      },
    ],
  },
  {
    title: "Check oracle freshness and fallback rules",
    shortTitle: "Check oracle freshness and fallback rules",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Understand the oracle problem",
      },
      {
        type: "paragraph",
        children:
          'Think about a thermostat in a flat in Sydney. It controls the heating perfectly, but only if its temperature sensor tells the truth. Put a match next to the sensor and the "smart" system makes a bad decision with total confidence.',
      },
      {
        type: "paragraph",
        children:
          "A smart contract is that thermostat. ethereum.org explains the oracle problem: a blockchain cannot fetch outside data on its own, and that isolation is deliberate, because every node must reach the same answer from data they all hold. But a lending app needs a price, an insurance contract needs the weather, and a game needs a random number. An oracle, which you met in the DeFi dependency lesson in Level 6, brings that information on-chain.",
      },
      {
        type: "paragraph",
        children:
          "The problem is that a contract is only as trustworthy as its inputs. ethereum.org sets out three tests for an oracle: correctness (the data is authentic and unaltered), availability (it arrives on time) and incentive compatibility (honest reporting is rewarded and false reporting is punished). A single centralised oracle is weak on all three: even a reputable provider can be hacked or go rogue, and it becomes a single point of failure.",
      },
      {
        type: "paragraph",
        children:
          "The thermostat analogy has a limit. A faulty sensor in a flat wastes some heat. A faulty price in a lending app can trigger liquidations or let someone borrow against worthless collateral in seconds, as the Mango Markets case in the DeFi dependency lesson in Level 6 showed.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how oracle networks reduce manipulation",
      },
      {
        type: "paragraph",
        children:
          "If one reporter can lie, ask many and compare. That is the idea behind a decentralised oracle network. ethereum.org describes many independent nodes that each query outside data, compare several sources and agree on one answer before it goes on-chain. It names Chainlink as an example and describes the median used by Maker's oracles.",
      },
      {
        type: "formula",
        expression: "Reported price = median of the individual reports",
        explanation:
          "sort the reports and take the middle one. With five reports of US$100, US$101, US$99, US$100 and a manipulated US$250 (invented figures), the median is US$100, while a simple average would be US$130. One liar barely moves a median.",
      },
      {
        type: "example",
        title: "Two price sources",
        children:
          "Chen in Shanghai compares two lending apps that accept the same token as collateral. One reads the price from a single small DEX pool; the other uses an oracle network that combines several sources. He remembers that a thin pool can be pushed with a large trade, and treats the first app as much riskier, whatever its interest rates.",
      },
      {
        type: "paragraph",
        children:
          "Oracle networks reduce risk but do not remove it. Many nodes reading the same weak source still report a weak price, so thinly traded tokens remain dangerous inputs. Some protocols also use a time-weighted average price (TWAP), which averages a price over a period so that a brief spike moves it less, at the cost of reacting slowly to genuine moves. And, like a bridge, an oracle network adds its own trust assumption: you rely on its operators and their incentives.",
      },
      {
        type: "paragraph",
        children:
          "If the inputs need checking, so does the code that uses them, which is the job of an audit.",
      },
      {
        type: "paragraph",
        children:
          "A spot pool used as a price source may be vulnerable to thin liquidity or short-lived manipulation depending on its design. Several feeds can share underlying sources, so counting sources does not alone prove independence. Connect the data policy to the exact lending or trading action rather than describing the oracle as simply reputable.",
      },
    ],
  },
  {
    title: "Read audit scope and unresolved findings",
    shortTitle: "Read audit scope and unresolved findings",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Know what an audit promises and what it doesn t",
      },
      {
        type: "paragraph",
        children:
          "Think about a building inspection before you buy a flat in Toronto. The inspector checks the rooms you agreed on, on the day of the visit, and writes down what they found. They do not promise the roof will never leak, and they cannot inspect an extension built next year.",
      },
      {
        type: "paragraph",
        children:
          "A smart-contract audit works the same way. OpenZeppelin, a security firm, describes its process: confirm the exact code version and scope, have at least two auditors review it line by line with automated tools, report findings by severity, then review the team's fixes. ethereum.org is blunter: it says to avoid treating audits as a \"silver bullet\", because they won't catch every bug.",
      },
      {
        type: "definition",
        term: "Audit scope",
        children:
          "The exact contracts, code version and features an auditor agreed to review. Anything outside it, including later upgrades, was not checked.",
      },
      {
        type: "warning",
        title: '"Audited" is a fact, not a safety rating',
        children:
          "A project can be audited and still be exploited, as Euler was in March 2023 (the DeFi dependency lesson in Level 6). An audit badge proves nothing until you read the report and check its date and scope.",
      },
      {
        type: "paragraph",
        children:
          "Reading the report takes a few minutes once you know what to look for.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read an audit report summary",
      },
      {
        type: "paragraph",
        children:
          "Most reports open with a summary you can read without understanding the code. Answer five questions: who audited it, when, what was in scope, what was found, and what was fixed.",
      },
      {
        type: "paragraph",
        children:
          "OpenZeppelin's reports classify findings by severity: critical, high, medium, low and informational (notes on style or best practice). Reports commonly record what happened to each finding, for example fixed, partly fixed or acknowledged (accepted without change).",
      },
      {
        type: "comparisonTable",
        caption: "An invented audit summary and how to read it",
        columns: [
          "Severity",
          "Found",
          "Fixed",
          "Acknowledged, not fixed",
          "What to ask",
        ],
        rows: [
          ["Critical", "1", "1", "0", "Was the fix reviewed by the auditor?"],
          [
            "High",
            "2",
            "1",
            "1",
            "Why was one high issue left? Is the reason convincing?",
          ],
          [
            "Medium",
            "4",
            "3",
            "1",
            "Does the open issue affect funds or only edge cases?",
          ],
          ["Low", "6", "2", "4", "Usually minor; note the pattern"],
          ["Informational", "9", "5", "4", "Code quality notes"],
        ],
      },
      {
        type: "example",
        title: "Fatima reads the summary",
        children:
          'Fatima in Riyadh is researching a lending app. Its audit report, dated over a year ago, covers version 1 of the contracts. The app now runs version 2, released after the audit, and one high-severity finding is marked "acknowledged". She notes three questions in her research file: was version 2 audited, why was the high issue accepted, and does the project run a bug bounty? Until she has answers, she treats the audit as weak evidence.',
      },
      {
        type: "paragraph",
        children:
          "Two more checks help: the report should name a code commit or contract addresses you can match, and the auditor's own site should list the report, since fake reports and fake badges exist. Two other tools look at code differently.",
      },
      {
        type: "heading",
        level: 3,
        children: "Add bug bounties and formal verification",
      },
      {
        type: "paragraph",
        children:
          'A bug bounty is a standing reward for anyone who finds a flaw and reports it privately. Think of a museum in Florence paying visitors who spot a broken alarm instead of using it. ethereum.org explains that good bounties scale the reward with the funds at risk, so that reporting pays better than exploiting. It describes a white-hat researcher who found an "infinite money" bug in Optimism and was paid a bounty instead of draining funds.',
      },
      {
        type: "formula",
        expression: "Maximum bounty ≈ bounty percentage × funds at risk",
        explanation:
          "if a project offers 10% of funds at risk, capped by its own rules, and a bug threatens US$2 million (invented figures), the reward could be up to US$200,000.",
      },
      {
        type: "paragraph",
        children:
          'Formal verification goes further than testing. ethereum.org describes it as writing a precise, mathematical specification of what the contract must do, such as "no balance can ever go below zero", and then proving that the code satisfies the specified properties within the model and its assumptions. That proof is powerful, but only as good as the specification: a property nobody wrote down is never checked, and nothing off-chain is covered.',
      },
      {
        type: "comparisonTable",
        caption: "Three kinds of code review",
        columns: ["Method", "What it gives you", "What it misses"],
        rows: [
          [
            "Audit",
            "Expert human review of one code version",
            "Anything outside scope or added later",
          ],
          [
            "Bug bounty",
            "Ongoing outside eyes with a reward",
            "Bugs nobody reports; low rewards attract few",
          ],
          [
            "Formal verification",
            "Mathematical proof of written properties",
            "Properties nobody specified; off-chain risks",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Next, turn the question round: what can others learn about you from a public blockchain?",
      },
      {
        type: "paragraph",
        children:
          "Find the reviewed code commit or version, scope, date, methods, findings and assumptions. A report may exclude external dependencies, economic design or deployment procedures. Test results apply to the tested conditions and cannot certify every future interaction. Ask what an audit establishes rather than whether an audit exists. A report covering a bridge contract does not necessarily assess every signer, reserve or recipient token.",
      },
    ],
  },
  {
    title: "Privacy incidents and independent verification",
    shortTitle: "Privacy incidents and independent verification",
    blocks: [
      {
        type: "paragraph",
        children:
          "An exploit response can include pauses, upgrades, disclosures or attempted recovery. Each depends on available powers and the nature of the loss. A rapid response can limit harm while revealing concentrated control. Document both aspects rather than assuming emergency authority is always good or always bad. Check whether recovery claims are confirmed by primary evidence.",
      },
      {
        type: "paragraph",
        children:
          "Public records can expose financial relationships when addresses are linked to people. Governance participation, donations or repeated transfers can add information to that link. Avoid publishing personal addresses in a course dossier. Finish the review by stating unknowns: unreviewed upgrades, opaque authorities, unavailable data or uncertain legal claims. The next lesson evaluates products and regulation using the same scope discipline.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand pseudonymity and chain analysis",
      },
      {
        type: "paragraph",
        children:
          'Imagine a public noticeboard in Manchester where every payment is pinned up forever, signed with a nickname. Nobody knows who "BlueFox" is, until BlueFox collects a parcel and shows ID. From then on, every note signed BlueFox has a face.',
      },
      {
        type: "paragraph",
        children:
          "Public blockchains are that noticeboard. Addresses are pseudonymous: not your name, but permanently visible and linkable. Bitcoin's design, Chainalysis notes, is a balance between privacy and transparency. Chain analysis firms group addresses that seem to belong together and match them with known services. The moment funds touch an exchange that checks identity (the provider checking lessons in Level 3), the link between a nickname and a person can appear. You saw in the on-chain and sentiment lessons in Level 7 that such clustering can also be wrong.",
      },
      {
        type: "definition",
        term: "Pseudonymity",
        children:
          "Acting under a persistent identifier, such as a wallet address, that is not your name but can be linked to you if other information connects them.",
      },
      {
        type: "paragraph",
        children:
          "This matters for safety as much as privacy. The security lessons in Level 2 warned against advertising your holdings, because anyone who links your address to you can see your balance. To weaken those links, some people turn to mixers.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand privacy tools and changing legal rules",
      },
      {
        type: "paragraph",
        children:
          "Privacy tools try to make links between deposits, withdrawals or participants harder to infer. A mixer may pool activity; privacy-focused assets can use protocol features that conceal particular information. None guarantees anonymity against every observer, device compromise or analysis method.",
      },
      {
        type: "paragraph",
        children:
          "These tools also have operational and legal consequences. A provider may ask additional source-of-funds questions or restrict a supported asset. Sanctions, court decisions and listing policies can change. Read the current official notice for the exact jurisdiction and service instead of relying on an old timeline.",
      },
      {
        type: "paragraph",
        children:
          "This course requires understanding and research only. It does not require using a mixer, bypassing controls or publishing your financial addresses. A useful privacy plan can begin with limiting disclosure, checking what is public and understanding the records a service already keeps.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know why privacy coins are delisted",
      },
      {
        type: "paragraph",
        children:
          "A service can delist an asset for legal, compliance, commercial or technical reasons. A delisting announcement is about that provider's supported route; it does not by itself determine the asset's status everywhere.",
      },
      {
        type: "example",
        title: "A notice in Leeds",
        children:
          "Tom reads a fictional provider notice ending trading and later withdrawals for an asset. He records the two deadlines separately, checks supported routes and uses the genuine support process. He does not follow a direct message promising an urgent migration.",
      },
      {
        type: "paragraph",
        children:
          "A delisted holding can remain recorded on its network while becoming harder to sell or withdraw through the chosen service. Record liquidity, custody and technical access separately. Avoid adopting current country-by-country restrictions from a dated secondary article.",
      },
      {
        type: "heading",
        level: 3,
        children: "Research a protocol on chain step by step",
      },
      {
        type: "paragraph",
        children:
          "Before buying a used car in Busan, a careful buyer matches the number plate to the papers, checks who else holds a key and reads the service history. Researching a token works the same way, except that no registry certifies the answers: you compare sources yourself.",
      },
      {
        type: "paragraph",
        children:
          "A fixed routine stops you skipping a step when a token looks exciting. The token research lesson in Level 5 gave you the red flags to look for. The on-chain and sentiment lessons in Level 7 showed what on-chain metrics can and cannot prove.",
      },
      {
        type: "comparisonTable",
        caption: "An on-chain research routine",
        columns: ["Step", "What to look at", "What a warning sign looks like"],
        rows: [
          [
            "1. Find the official contract address",
            "The address in the project's own documents, cross-checked against an explorer's token page and a data site",
            "Sources disagree; the address came from an advert or message; several tokens share the name",
          ],
          [
            "2. Check it on a block explorer",
            "Whether the source code is verified, and when and by whom the contract was created",
            "Unverified code; a days-old contract; the creator holds much of the supply",
          ],
          [
            "3. Check upgradeability and admin keys",
            "Whether it is a proxy, and who can change the logic: one address, a multisig or a timelock",
            "One ordinary address can upgrade or pause it instantly",
          ],
          [
            "4. Check holder concentration",
            "Top-ten share, and which top addresses are labelled exchanges, vesting or treasury contracts",
            "A few unlabelled wallets hold most of the supply",
          ],
          [
            "5. Read the governance forum and recent proposals",
            "Recent debates, vote results, turnout and who proposes",
            "Treasury transfers passed with little debate; tiny turnout; no forum",
          ],
          [
            "6. Find audits and bug bounties",
            "Reports listed on the auditor's own site; a live bounty and its maximum reward",
            "No audit; an audit of an older version; no bounty, or a tiny one",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'Step 1 comes first because anyone can create a token with the same name and symbol as a real one; only the address is unique. Step 3 needs the most care. Etherscan explains that a proxy passes every call to a separate implementation contract, which can be swapped while the address stays the same (proxies and admin keys appeared in the DeFi dependency lesson in Level 6). It also warns that its "Read as Proxy" view cannot prove the code shown is the code that runs. So "verified" tells you what the code says today, not who can change it tomorrow.',
      },
      {
        type: "paragraph",
        children:
          'Step 6 repeats the questions Fatima asked earlier. Write every finding, with its source and the date you checked, into the token research template in the valuation and graduation lessons in Level 10\'s graduation project, and write "unknown" wherever you could not check.',
      },
      {
        type: "paragraph",
        children:
          "With a routine for gathering evidence, you are ready to practise weighing it.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The apartment committee and its emergency manager",
        children:
          "An apartment association in Germany votes on an EUR 5,000 repair budget. A separate manager can authorise emergency work under defined rules. Counting votes alone does not reveal every spending power. A DAO can similarly combine token votes, delegation and emergency administration. The learner traces who proposes, who votes and who executes, while recognising that the association's legal rights are only an analogy rather than the DAO's actual legal structure.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "An audit cannot certify every future change, outside dependency or legal entitlement.",
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
          "1. A vote passes but requires committee execution. Is the vote itself the full authority path?",
          "2. Why should an oracle report include a timestamp?",
          "3. Name three things a code audit may not establish.",
        ],
        answers: [
          "1. No. Committee authority, conditions and actual execution remain part of the path.",
          "2. Freshness affects whether the value suits the decision. An old accurate price can be unsuitable for current liquidation.",
          "3. Current reserves, safe administrators, legal rights, economic robustness, later upgrades and every external dependency may be outside scope.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does token voting automatically grant company-share rights?",
        ],
        answers: [
          "No. Voting authority and corporate or legal ownership are separate rights that require their own terms.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Trace governance to actual execution.",
          "Data quality includes freshness and failure handling.",
          "Review scope and current version together.",
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
            title: "Ethereum  Decentralised Autonomous Organisations",
            url: "https://ethereum.org/dao/",
          },
          {
            title: "Chainlink  What is a Blockchain Oracle",
            url: "https://chain.link/education/blockchain-oracles",
          },
          {
            title: "Ethereum  Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title:
              "PCAOB  Investor Bulletin on claims about PCAOB registration and oversight",
            url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
          },
          {
            title: "ethereum.org  ethereum.org — Proof-of-stake (PoS)",
            url: "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/",
          },
          {
            title: "ethereum.org  ethereum.org — Client diversity",
            url: "https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/",
          },
          {
            title:
              "ethereum.org  ethereum.org — Introduction to Ethereum governance",
            url: "https://ethereum.org/en/governance/",
          },
          {
            title:
              "ethereum.org  ethereum.org — Introduction to blockchain bridges",
            url: "https://ethereum.org/en/developers/docs/bridges/",
          },
          {
            title: "ethereum.org  ethereum.org — Oracles",
            url: "https://ethereum.org/en/developers/docs/oracles/",
          },
          {
            title: "ethereum.org  ethereum.org — Smart contract security",
            url: "https://ethereum.org/en/developers/docs/smart-contracts/security/",
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
  course: "crypto-advanced-and-graduation",
  description:
    "Compare asset exposure and product claims through rights, costs and current official evidence.",
  estimatedMinutes: 15,
  learningPath: "crypto",
  level: "level-10",
  module: "advanced-awareness-and-graduation",
  objectives: [
    "Compare asset exposure and product claims through rights, costs and current official evidence.",
  ],
  position: 3,
  prerequisites: ["daos-governance-oracles-and-audit-limits"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "daos-governance-oracles-and-audit-limits",
    "complete-the-crypto-graduation-research-and-safety-review",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Compare asset exposure and product claims through rights, costs and current official evidence.",
  seoTitle: "Valuation Regulation and Institutional Products",
  slug: "crypto-valuation-regulation-and-institutional-products",
  sources: [
    {
      title:
        "SEC Investor gov  Exchange Traded Products Providing Exposure to Bitcoin and Ether Investor Bulletin",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/ETPBulletinSeptember2024",
    },
    {
      title:
        "SEC Investor gov and CFTC  Funds Trading in Bitcoin Futures Investor Bulletin",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/funds-trading-bitcoin-futures-investor-bulletin",
    },
    {
      title: "Ethereum  Maximal extractable value",
      url: "https://ethereum.org/developers/docs/mev/",
    },
    {
      title: "FCA  Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title:
        "FATF  2026 targeted update on virtual assets and service providers",
      url: "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
    },
    {
      title: "IRS  Digital assets",
      url: "https://www.irs.gov/filing/digital-assets",
    },
    {
      title:
        "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
      url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
    },
    {
      title:
        "PCAOB  Investor Bulletin on claims about PCAOB registration and oversight",
      url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
    },
    {
      title: "CFTC  Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FINRA  Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title:
        "BIS  BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
      url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
    },
    {
      title: "ESMA  ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title: "FCA  Qualifying retail crypto ETNs and continuing restrictions",
      url: "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
    },
    {
      title: "SEC  Crypto asset interpretation effective March 2026",
      url: "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
    },
  ],
  status: "published",
  title: "Valuation Regulation and Institutional Products",
};
const sections3: LessonSection[] = [
  {
    title: "Valuation models and their limits",
    shortTitle: "Valuation models and their limits",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Compare asset exposure and product claims through rights, costs and current official evidence.",
      },
      {
        type: "paragraph",
        children:
          "A crypto asset, a fund share and a futures-based product can all follow a similar price theme while giving different rights and costs. Advanced awareness also requires distinguishing valuation assumptions from regulatory status. This lesson compares those forms of exposure, introduces transaction-ordering effects and provides a current-source checklist for jurisdictional questions.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Compare the legal and operational instrument behind the price chart.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what a crypto asset is worth",
      },
      {
        type: "paragraph",
        children:
          "When a family in Surabaya values a rice field, they can ask what it produces each year. When an investor in Frankfurt values a company, they can estimate the profits it will pay out. Both have a stream of cash to measure.",
      },
      {
        type: "paragraph",
        children:
          'Most crypto-assets have no such stream. Bitcoin pays no interest and no dividends; holding it gives you no share of any profit. Coin Metrics, reviewing crypto valuation research in 2020, wrote that valuing crypto-assets "remains very much an open question". That is why people argue so fiercely about what any coin is "worth": without cash flows, value rests on what others will pay, which depends on use, belief and scarcity.',
      },
      {
        type: "paragraph",
        children:
          "This lesson gives no price targets. It shows the main tools, what each measures and where it breaks, so you can spot a weak argument. The first tool counts users.",
      },
      {
        type: "heading",
        level: 3,
        children: "Weigh network effects and Metcalfe s law",
      },
      {
        type: "paragraph",
        children:
          "A telephone is useless if you own the only one. With two phones there is one possible call; with five, there are ten. Each new user makes the network more useful to everyone already on it. That is a network effect.",
      },
      {
        type: "paragraph",
        children:
          'Metcalfe\'s law, named after Robert Metcalfe, a co-inventor of Ethernet, says a network\'s value grows with the square of its users. Some analysts apply it to crypto, using active addresses as "users". Coin Metrics notes that crypto still lacks a clear equivalent of "daily active users" (addresses are not users, the on-chain and sentiment lessons in Level 7), and other analysts point to a slower rule proposed by Andrew Odlyzko, growing with n × log n, that may fit the data better.',
      },
      {
        type: "formula",
        expression: "Metcalfe: value ∝ n² · Odlyzko: value ∝ n × log(n)",
        explanation:
          '"∝" means "grows in proportion to". If users double from 1 million to 2 million (invented figures), Metcalfe implies value × 4, while Odlyzko implies about × 2.1, because 2 × log(2,000,000) ÷ log(1,000,000) ≈ 2 × 6.30 ÷ 6 ≈ 2.1. The same user growth gives two very different stories.',
      },
      {
        type: "paragraph",
        children:
          "The phone analogy breaks down because phone users are real people making real calls. One person can hold a thousand crypto addresses, and bots can fake activity. A model built on a shaky count stays shaky however neat its maths, so many analysts look instead at something harder to fake: fees.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow the fees to see what holders capture",
      },
      {
        type: "paragraph",
        children:
          "A busy toll road in Melbourne collects fees from every car. Whether the road's owners benefit depends on who keeps the tolls. If the money goes to the toll-booth operator, the owners see none of it.",
      },
      {
        type: "paragraph",
        children:
          "Blockchains collect fees too. Users pay them to get transactions included, and in DeFi, traders pay swap fees. Fee revenue shows that people value the service enough to pay. The harder question is value capture: does any of that money reach token holders? On Ethereum, part of each fee is burned (the gas and token lessons in Level 4), reducing supply, while validators receive tips and rewards (the lending and staking lessons in Level 6). In many DeFi apps, fees go to liquidity providers, not to governance-token holders.",
      },
      {
        type: "definition",
        term: "Value capture",
        children:
          "The share of a network's fees or other income that reaches token holders, for example through burns, buybacks or staking rewards.",
      },
      {
        type: "formula",
        expression:
          "Network value to annual fees = market capitalisation ÷ annual fees paid by users",
        explanation:
          "a network with an invented market cap of US$10 billion and US$200 million of annual fees has a ratio of 50. A lower ratio means more fees per unit of value, but it says nothing about whether holders receive those fees or whether they will last.",
      },
      {
        type: "example",
        title: "Two tokens, one question",
        children:
          "Rania in Riyadh compares two invented DeFi tokens. Protocol A earns SAR 40 million a year in fees, all paid to liquidity providers. Protocol B earns SAR 10 million, and part buys back and burns its token. She notes that A is busier, but B's holders capture more, and that a governance vote could change either rule tomorrow (the DeFi dependency lesson in Level 6).",
      },
      {
        type: "paragraph",
        children:
          "Fees are a real-world signal, but they can vanish when activity moves elsewhere. For assets with few fees, the case rests on a different story.",
      },
      {
        type: "heading",
        level: 3,
        children: "Test the store of value and cost stories",
      },
      {
        type: "paragraph",
        children:
          "Gold pays nothing either, yet people have held it for thousands of years because they expect others to keep valuing it. The store of value narrative says Bitcoin can play a similar role, helped by its 21 million cap (the supply and halving lesson in Level 1). It is a belief about future behaviour, not a measurement, so it can strengthen or fade.",
      },
      {
        type: "paragraph",
        children:
          "Two other approaches appear in Coin Metrics' review. Cost of production argues that price tends towards the cost of mining a coin, echoing a line Satoshi Nakamoto wrote about commodities. But mining cost also follows price, because miners switch machines on and off as price moves, so the logic can run in a circle. Price-regression models, such as the stock-to-flow model popularised in 2019, fit a curve to past prices; a curve that fits the past gives no reason the future must follow it.",
      },
      {
        type: "comparisonTable",
        caption: "Valuation approaches and their limits",
        columns: ["Approach", "What it measures", "Main limit"],
        rows: [
          [
            "Network effects (Metcalfe)",
            "Users or addresses",
            "Addresses are not people; the growth rule is disputed",
          ],
          [
            "Fee revenue",
            "What users pay to use the network",
            "Holders may not capture it; fees can move elsewhere",
          ],
          [
            "Store of value",
            "Expected future demand to hold",
            "A belief, not a cash flow; it can change",
          ],
          [
            "Cost of production",
            "Mining cost",
            "Cost follows price as much as price follows cost",
          ],
          [
            "Price regression",
            "Past price patterns",
            "Fitted to history; no mechanism forces it to continue",
          ],
        ],
      },
      {
        type: "warning",
        title: "A model is not a forecast",
        children:
          "Anyone who turns one of these models into a price target is selling certainty that does not exist. Use valuation tools to ask better questions in your research report, not to justify a purchase you have already decided on.",
      },
      {
        type: "paragraph",
        children:
          "Valuation is one source of uncertainty. Rules are another, and they change by country and by year.",
      },
      {
        type: "paragraph",
        children:
          "These are connected questions, but one does not automatically prove the next. Valuation approaches may compare fees, users, supply or similar assets. Each needs assumptions about measurement, future activity and what holders actually receive. A useful valuation note identifies the mechanism and sensitivity to assumptions rather than presenting one precise number as intrinsic certainty.",
      },
    ],
  },
  {
    title: "Custody product rights fees and tracking",
    shortTitle: "Custody product rights fees and tracking",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Direct custody and institutional exposure",
      },
      {
        type: "paragraph",
        children:
          "A family in Chennai can own gold three ways: bangles in a home safe, gold a jeweller keeps for them, or shares in a gold fund bought through a broker. Crypto offers the same three routes, and each moves the risk somewhere different. Unlike bangles, though, coins you hold yourself are gone for good if the key is lost.",
      },
      {
        type: "paragraph",
        children:
          "In the United States, the SEC approved spot bitcoin exchange-traded products (ETPs) in January 2024, and spot ether ETFs began trading in July 2024 (the chart and context lessons in Level 7 covered their flows). The SEC's September 2024 investor bulletin explains that holders own shares in a trust, not coins, and never handle private keys. The coins sit with a custodian; one fund's June 2024 prospectus names two trust companies it calls \"qualified custodians\", which keep the keys in cold storage. So you have no seed phrase to lose. In exchange, the fund charges an annual sponsor fee paid in its coins, so each share represents slightly less crypto over time; the share price can drift from the coin's; and shares trade only in stock-exchange hours, while crypto trades 24/7. A Saturday crash reaches fund holders at Monday's open.",
      },
      {
        type: "formula",
        expression: "Annual fund fee ≈ amount held × annual fee rate",
        explanation:
          "an invented ₹200,000 holding with an invented 0.25% fee costs about ₹500 a year, before broker charges.",
      },
      {
        type: "comparisonTable",
        caption: "Three ways to hold crypto",
        columns: [
          "Comparison point",
          "Holding coins yourself",
          "Through an exchange",
          "Through a spot ETF",
        ],
        rows: [
          [
            "What you own",
            "The coins, through your keys",
            "A claim on the exchange",
            "Shares in a fund",
          ],
          ["Who holds the keys", "You", "The exchange", "The fund's custodian"],
          [
            "Can you send coins on-chain?",
            "Yes",
            "Yes, if withdrawals are open",
            "No; you sell shares for cash",
          ],
          [
            "When you can trade",
            "Any time",
            "Any time, unless paused",
            "Stock-market hours only",
          ],
          [
            "Main costs",
            "Network fees, wallet hardware",
            "Trading, spread and withdrawal fees",
            "Annual fund fee, broker costs",
          ],
          [
            "Main risk",
            "Lost keys, scams",
            "Hack, freeze or failure",
            "Fees; price gaps while markets are shut",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Behind all three routes sits the market itself. Centralised exchanges match orders and hold customers' coins (the exchange and order lessons in Level 3); DEXs let smart contracts do the matching (the swap and liquidity lessons in Level 6). OTC desks arrange large trades privately, so a big order does not push through the public order book. Market makers quote buying and selling prices all day and earn the spread. Stablecoins are the settlement rail between them, which the BIS describes as the crypto ecosystem's on- and off-ramps.",
      },
      {
        type: "paragraph",
        children:
          "Trouble starts when one firm plays every role. An exchange that is also your broker, a market maker trading against you and your custodian faces a conflict at each step: whose order goes first, whose price is fair, whose coins get lent out. FTX, whose customer money flowed to its sister trading firm (the exchange failure lesson in Level 3), was the extreme case. When you compare providers, ask which roles each plays and how it keeps them apart.",
      },
      {
        type: "paragraph",
        children:
          "An exchange-traded product provides shares or units under an issuer's documents, generally accessed through a securities account. Do not treat all these as identical asset ownership. An ETP may reduce the need for the investor to manage signing keys personally while introducing issuer, custodian, fee and tracking considerations. Retail holders do not necessarily have the same direct creation or redemption access as authorised participants. Product listing or regulatory approval of a specific arrangement is not a promise of favourable returns or an endorsement of every underlying crypto activity.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tracking fund fees rolling and market hours",
      },
      {
        type: "paragraph",
        children:
          "A spot-based product seeks exposure under its asset and custody arrangement, but its share price can differ from the relevant net asset value or reference. A futures-based product may roll contracts, with costs or benefits depending on the curve and process. Expense ratios, spreads and brokerage fees affect the holder's result.",
      },
      {
        type: "paragraph",
        children:
          "Trading hours can differ between a listed product and an underlying crypto market that operates continuously. Overnight or weekend movement can be reflected in a later opening gap. Currency exposure and product eligibility can also matter. Compare the route that serves the learner's hypothetical purpose, not just the ticker's apparent price similarity. A regulated wrapper can change some risks while retaining market exposure.",
      },
      {
        type: "comparisonTable",
        caption: "Compare the form of exposure",
        columns: ["Form", "What is held", "Questions to verify"],
        rows: [
          [
            "Direct self custody",
            "Network asset under signing authority",
            "Key security network and token rights",
          ],
          [
            "Provider account",
            "Custodial claim under terms",
            "Withdrawals solvency and customer rights",
          ],
          [
            "Spot ETP",
            "Product shares under issuer documents",
            "Custody fees tracking and redemption access",
          ],
          [
            "Futures-based fund",
            "Fund units with contract exposure",
            "Roll costs margin policy fees and tracking",
          ],
          [
            "Perpetual position",
            "Derivative contract",
            "Funding margin liquidation and venue eligibility",
          ],
        ],
      },
    ],
  },
  {
    title: "Fragmented markets and digital-money claims",
    shortTitle: "Fragmented markets and digital-money claims",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Fragmented markets and transaction ordering",
      },
      {
        type: "paragraph",
        children:
          "Price discovery occurs across venues, pairs and liquidity conditions. An index uses a defined set of inputs rather than every executable market. Thin venues, manipulation and outages can affect quotations. On public contract networks, transaction inclusion and ordering can create maximal extractable value, or MEV, for parties arranging or exploiting the order of actions.",
      },
      {
        type: "paragraph",
        children:
          "Examples can include arbitrage, liquidation ordering and sandwich-style effects around a user's swap. Not every ordering activity has the same effect, and mitigation routes can add new trust or operational assumptions. A slippage condition limits a specified execution result but does not certify fairness or privacy. At beginner awareness level, understand that the order in which actions reach a block can influence outcomes. There is no requirement to perform or reproduce these techniques.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tokenised assets CBDCs and stablecoins",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand tokenisation and real world assets",
      },
      {
        type: "paragraph",
        children:
          "Funds bring crypto into traditional markets; tokenisation runs the other way. A cloakroom ticket stands for a coat. In the scaling and bridge lesson in Level 4 you saw that a bridged token stands for an asset held somewhere else. Tokenisation applies the same idea to traditional assets: a token on a blockchain represents a government bond, a fund share, a property or a bank deposit. People call these real-world assets (RWAs).",
      },
      {
        type: "definition",
        term: "Real-world asset (RWA) token",
        children:
          "A token that represents a claim on an asset existing outside the blockchain, such as a bond or property, held by an issuer or custodian.",
      },
      {
        type: "paragraph",
        children:
          'The appeal is speed and programmability: settlement in minutes instead of days, and assets that smart contracts can use. The BIS, in its June 2025 Annual Economic Report, sees tokenised platforms holding central bank reserves, commercial bank money and government bonds as groundwork for a next-generation financial system, with settlement and record-keeping happening on one "unified ledger".',
      },
      {
        type: "paragraph",
        children:
          "The risk is that the token is only as good as the promise behind it. You are trusting the issuer to hold the asset, the custodian to keep it, the law to treat the token as a real claim, and often an oracle to report the asset's value (the governance and audit lesson in Level 10). Some may also limit who can hold them, so they can behave less like Bitcoin and more like a digital share register. That brings you to the biggest question in digital money: who issues it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare CBDCs stablecoins and crypto",
      },
      {
        type: "paragraph",
        children:
          "You met central bank digital currencies (CBDCs) in the orientation lesson in Level 0 and stablecoins in the stablecoin and transfer lessons in Level 3; the table below sets both beside crypto-assets such as bitcoin.",
      },
      {
        type: "paragraph",
        children:
          "The BIS's June 2025 report judged stablecoins against three tests for sound money. Singleness: money should be accepted at full value without question, but stablecoins carry the issuer's name, \"much like private banknotes\" of the 19th century. Elasticity: the money supply should expand when the economy needs it, but stablecoins require full payment in advance. Integrity: money should resist crime, but stablecoins on public chains, the BIS argued, attract illicit use. This is a central bank's view, so read it alongside other perspectives.",
      },
      {
        type: "comparisonTable",
        caption: "Three kinds of digital money",
        columns: [
          "Comparison point",
          "CBDC",
          "Stablecoin",
          "Bitcoin (native BTC)",
        ],
        rows: [
          ["Issuer", "Central bank", "Private company", "No issuer"],
          [
            "Value",
            "Equal to national currency",
            "Aims to hold a peg; can break",
            "Set by the market; can fall to zero",
          ],
          [
            "Who can freeze or reverse",
            "The central bank and its rules",
            "Often the issuer, through the contract",
            "Generally no one once confirmed",
          ],
          [
            "Main risk",
            "Privacy and state control",
            "Reserves, runs, issuer failure",
            "Price, custody, scams",
          ],
        ],
      },
      {
        type: "example",
        title: "Three wallets, three promises",
        children:
          "Dewi in Jakarta imagines holding Rp1,000,000 in three forms (an invented amount): a possible future CBDC, a dollar stablecoin and bitcoin. She writes down who stands behind each one: the central bank, a company and its reserves, and no issuer promising redemption for bitcoin. That single line, she realises, explains most of the differences in risk.",
      },
      {
        type: "paragraph",
        children:
          "You now have the last tools of the course. It is time to put everything together.",
      },
    ],
  },
  {
    title: "Verify jurisdiction product and effective date",
    shortTitle: "Verify jurisdiction product and effective date",
    blocks: [
      {
        type: "paragraph",
        children:
          "Identify your country, the exact provider and product, applicable eligibility and the authority's current register or notice. Distinguish a licence's scope from approval of each asset, and a proposal from an enacted requirement. AML or Travel Rule compliance does not establish bank deposit protection. Tax obligations and reporting rules also require current local guidance.",
      },
      {
        type: "paragraph",
        children:
          "For a review exercise, use official documents and record access dates, unresolved questions and any specialist advice needed. Do not generalise an EU, UK or US notice to every country. Regulations and provider terms can change faster than a printed course. The durable skill is finding the relevant current primary source and interpreting its scope. The final lesson now brings the security, research, portfolio and practice materials into one coherent graduation dossier.",
      },
      {
        type: "paragraph",
        children:
          "Regulation is a dated map of activities and rights. Start with the country, legal entity and exact product, then find the official rule, register and effective date. An enacted law, an interpretation, a consultation and a provider licence answer different questions.",
      },
      {
        type: "paragraph",
        children:
          "Two historical changes show why a copied table can mislead. The UK FCA's 2021 retail restrictions covered crypto derivatives and certain exchange-traded notes. From 8 October 2025, access reopened for qualifying UK-listed crypto ETNs while the retail derivatives ban remained. In the US, the SEC issued a new crypto-asset interpretation in March 2026. These examples do not establish permission for a learner in another country.",
      },
      {
        type: "paragraph",
        children:
          "For an actual provider check, record the relevant authority, legal name, authorised activity, warning-list result, product eligibility and access date. Check tax and payment rules separately where relevant. If the source is unclear or outdated, that uncertainty belongs in the research conclusion.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The commodity and the shop gift certificate",
        children:
          "A shopper in Canada compares owning a bag of coffee beans, holding a claim with a storage service and buying a certificate whose price follows coffee. All relate to coffee, but access, fees and rights differ. Direct BTC, a custodial balance and a listed product also need separate descriptions. A price chart in CAD cannot tell the learner whether the product can be withdrawn as the underlying asset, what trading hours apply or who holds custody.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Use current official local sources; a printed summary cannot settle every later eligibility or tax question.",
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
          "1. Why might a listed product gap at opening after an underlying weekend move?",
          "2. Does high network revenue prove that every associated token holder receives it?",
          "3. List four fields in a jurisdictional check.",
        ],
        answers: [
          "1. Its trading hours may differ from the continuously traded underlying market. The next executable opening reflects new information and available orders.",
          "2. No. Allocation of revenue and holder rights require a documented connection.",
          "3. Country, exact provider, product, authority or register, licence scope, document date, eligibility and applicable tax guidance are relevant.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does approval of a particular ETP guarantee a profitable return or approve every crypto product?",
        ],
        answers: [
          "No. The decision has a specific legal and product scope and does not remove underlying market risk.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Exposure form determines rights and costs.",
          "Valuation needs a demonstrated holder-benefit mechanism.",
          "Regulatory claims require product, jurisdiction and date.",
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
            title:
              "SEC Investor gov  Exchange Traded Products Providing Exposure to Bitcoin and Ether Investor Bulletin",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/ETPBulletinSeptember2024",
          },
          {
            title:
              "SEC Investor gov and CFTC  Funds Trading in Bitcoin Futures Investor Bulletin",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/funds-trading-bitcoin-futures-investor-bulletin",
          },
          {
            title: "Ethereum  Maximal extractable value",
            url: "https://ethereum.org/developers/docs/mev/",
          },
          {
            title: "FCA  Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title:
              "FATF  2026 targeted update on virtual assets and service providers",
            url: "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
          },
          {
            title: "IRS  Digital assets",
            url: "https://www.irs.gov/filing/digital-assets",
          },
          {
            title:
              "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
            url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
          },
          {
            title:
              "PCAOB  Investor Bulletin on claims about PCAOB registration and oversight",
            url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
          },
          {
            title: "CFTC  Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FINRA  Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title:
              "BIS  BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
            url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
          },
          {
            title: "ESMA  ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "FCA  Qualifying retail crypto ETNs and continuing restrictions",
            url: "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
          },
          {
            title: "SEC  Crypto asset interpretation effective March 2026",
            url: "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
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
  course: "crypto-advanced-and-graduation",
  description:
    "Produce a coherent dossier that connects knowledge, evidence, risk limits and practice.",
  estimatedMinutes: 6,
  learningPath: "crypto",
  level: "level-10",
  module: "advanced-awareness-and-graduation",
  objectives: [
    "Produce a coherent dossier that connects knowledge, evidence, risk limits and practice.",
  ],
  position: 4,
  prerequisites: ["crypto-valuation-regulation-and-institutional-products"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["crypto-valuation-regulation-and-institutional-products"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Produce a coherent dossier that connects knowledge, evidence, risk limits and practice.",
  seoTitle: "Complete the Graduation Research and Safety Review",
  slug: "complete-the-crypto-graduation-research-and-safety-review",
  sources: [
    {
      title: "MIT OpenCourseWare  Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title:
        "SEC Investor gov  Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "CFTC  Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FCA  Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title: "Glassnode  Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title: "Glassnode  Exchange Data Transparency Notice",
      url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    },
    {
      title:
        "BIS  BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
      url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
    },
    {
      title: "ESMA  ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title:
        "SEC Investor gov  Exchange Traded Products Providing Exposure to Bitcoin and Ether Investor Bulletin",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/ETPBulletinSeptember2024",
    },
  ],
  status: "published",
  title: "Complete the Graduation Research and Safety Review",
};
const sections4: LessonSection[] = [
  {
    title: "Assemble a consistent seven-part dossier",
    shortTitle: "Assemble a consistent seven-part dossier",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Produce a coherent dossier that connects knowledge, evidence, risk limits and practice.",
      },
      {
        type: "paragraph",
        children:
          "Graduation means you can connect the course's ideas and explain their limits. It does not mean that you must invest, trade or demonstrate profit. Your final dossier brings together security, backup planning, token research, exchange review, portfolio rules, a scam assessment and a research report. The appendix supplies editable templates and a complete fictional practice ledger.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Review the entire route and correct contradictions before judging the conclusion.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Assemble the seven connected course outputs",
      },
      {
        type: "paragraph",
        children:
          "Prepare the security checklist, wallet backup plan, token research template, exchange-risk comparison, portfolio-risk policy, scam assessment and research report. Use fictional quantities and placeholder secret locations. Each output should reference the lesson or source that supports its reasoning. The reader should be able to understand the dossier without knowing your personal accounts.",
      },
      {
        type: "paragraph",
        children:
          "These components answer different questions. Security concerns authority and procedure; research concerns evidence and rights; portfolio policy concerns affordable exposure and dependencies; practice concerns whether a rule was applied consistently. A strong dossier keeps those questions connected without using one good result to excuse a missing check elsewhere. Do not leave a template field filled only with a reassuring adjective such as trusted or safe.",
      },
      {
        type: "paragraph",
        children:
          "Use the workbook immediately after the lessons. Start each output with the exact product, purpose and date, then supply evidence or state what is missing. The seven outputs are a security checklist, backup plan, token dossier, provider comparison, portfolio-risk policy, scam assessment and research report. They can all describe fictional situations.",
      },
      {
        type: "paragraph",
        children:
          "The research report connects the other six outputs. It should let a reviewer trace the same asset identity, custody arrangement and assumed budget through every page. A backup plan for a self-custody wallet cannot be used as evidence that an exchange holds enough assets to honour customer claims.",
      },
      {
        type: "heading",
        level: 3,
        children: "Reconcile identity rights and custody",
      },
      {
        type: "paragraph",
        children:
          "Check that the token name, network, contract and representation are the same wherever the dossier discusses them. If the example uses a custodian, the backup plan must not pretend that a personal recovery phrase controls the provider's assets. If the transfer route uses a bridge, the risk map must include that bridge. If a yield claim involves lending, do not describe it as native staking.",
      },
      {
        type: "paragraph",
        children:
          "Consistency is a practical safety test. A wrong assumption can survive in one page and contradict another. Read the file as a single route from acquiring or researching an asset to controlling it, using it and exiting. Identify each party whose performance is needed. Mark unresolved facts clearly rather than choosing the version that makes the plan look easiest.",
      },
    ],
  },
  {
    title: "Challenge the evidence and reconcile the practice record",
    shortTitle: "Challenge the evidence and reconcile the practice record",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Complete the scam and evidence assessment",
      },
      {
        type: "paragraph",
        children:
          "Use the supplied scam message and identify the requested money, information or authority. State the independent verification route and why the action should pause. Do not click a real suspicious link or contact its sender to complete the assessment. Preserve non-secret fictional evidence and describe the correct incident category if compromise is suspected.",
      },
      {
        type: "paragraph",
        children:
          "For the research report, label facts, calculations, estimates, hypotheses and forecasts. Include a contrary explanation and an observable invalidation condition. Every important claim needs a source, a date or a supplied assumption. A claim with no evidence belongs in the unresolved section. The report can recommend further research or no action; it should not manufacture a trade recommendation to seem complete.",
      },
      {
        type: "comparisonTable",
        caption: "Check the connected dossier",
        columns: [
          "Component",
          "Evidence of completion",
          "Contradiction to detect",
        ],
        rows: [
          [
            "Security checklist",
            "Specific checks and incident categories",
            "Disconnect claimed to revoke all permissions",
          ],
          [
            "Backup plan",
            "Usable non-secret recovery structure",
            "Exposed phrase called repaired by password",
          ],
          [
            "Token research",
            "Identity rights supply and liquidity",
            "Wrong network or unsupported holder rights",
          ],
          [
            "Exchange comparison",
            "Terms custody and evidence scope",
            "Registration treated as full insurance",
          ],
          [
            "Portfolio policy",
            "Amounts dependencies and stress",
            "Several names treated as independent custody",
          ],
          [
            "Scam assessment",
            "Request and independent verification",
            "Requester provides its own verification link",
          ],
          [
            "Research report",
            "Rules net results benchmark and limits",
            "Backtest presented as guaranteed profit",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Attach the complete paper practice record",
      },
      {
        type: "paragraph",
        children:
          "Attach the rule version, dataset or supplied scenario, costs, fill assumptions, complete results, benchmark and limitations. The ten-trade example in this document has six wins yet loses USD 50 net, making it useful for checking whether you understand more than win rate. Its equity path also supports a drawdown calculation.",
      },
      {
        type: "paragraph",
        children:
          "Record adherence separately from outcome. If you change a rule, preserve the old version and explain which data informed the change. A paper sample is evidence about that practice under its assumptions. It is not proof of real execution, future performance or suitability for you. Graduation assesses the honesty and completeness of the reasoning, not whether the sample happens to be positive.",
      },
      {
        type: "heading",
        level: 3,
        children: "Reflect on what you know and what needs review",
      },
      {
        type: "paragraph",
        children:
          "Explain what you can now do: distinguish rights and custody, inspect a transfer, describe a contract dependency, reconcile costs and test a claim. Then state what still requires further study, current local guidance or specialist help. A thoughtful boundary is part of competence. You should be able to recognise when a question goes beyond beginner foundations.",
      },
      {
        type: "paragraph",
        children:
          "Finish with a version date and a short maintenance plan for changing sources or product terms. Use the review checklist to correct contradictions before submission. A reviewer can ask for clarification without receiving real secrets or approving a real-money action. The course is complete when you can give a clear, sourced explanation and a defensible reason to proceed with research, continue simulation or decline an activity.",
      },
      {
        type: "paragraph",
        children:
          "Review each output as evidence shown, needs clarification or missing. If a number cannot be reconciled, fix the inputs before evaluating the conclusion. If an important source is absent, state the gap instead of filling it with confident wording.",
      },
      {
        type: "example",
        title: "A complete report that declines action",
        children:
          "Leila in Toronto verifies the supplied token identity and calculates its supply figures, but cannot establish an enforceable holder benefit or a workable exit at the intended size. Her report concludes that further research is needed and no purchase is proposed. That is a complete learning outcome when the evidence and limits are explained.",
      },
      {
        type: "paragraph",
        children:
          "Your final reflection should identify one skill you can now demonstrate, one assumption you used and one question that needs current local or specialist guidance. Keep the document dated and review material changes to code, service terms or sources. Course completion measures understanding and process; it does not approve a real product or guarantee a result.",
      },
    ],
  },
  {
    title: "Workbook security and backup plans",
    shortTitle: "Workbook security and backup plans",
    blocks: [
      {
        type: "takeaway",
        title: "Use the graduation workbook",
        children:
          "Copy these worksheet prompts into your own notebook or document and write your responses there. The website tables provide the workbook structure; they are not editable form fields. Use fictional information and never record real secrets.",
      },
      {
        type: "paragraph",
        children:
          "Complete these seven outputs with supplied or fictional information. Use the response columns as editable writing spaces. Never include actual recovery material, private keys, authentication codes, personal account identifiers or unredacted financial records. You can demonstrate the structure of a good plan without revealing the means to use a real account.",
      },
      {
        type: "paragraph",
        children:
          "A response should name an action, evidence source or unresolved question. Words such as safe, trusted and diversified are conclusions that need supporting reasons. When a field cannot be verified, write what is missing and why that prevents a stronger conclusion. The worked entries are teaching examples rather than recommendations about any real product.",
      },
      {
        type: "paragraph",
        children:
          "Use the level quizzes to identify areas to revisit. A suggested study target is 80 percent, with every safety-critical error revisited and explained. The website pass rules and publication decision are separate. A corrected explanation matters more than an answer letter.",
      },
      {
        type: "heading",
        level: 3,
        children: "1 Security checklist",
      },
      {
        type: "paragraph",
        children: "Revisit C0.4  •  C2.1  •  C2.3  •  C2.4  •  C2.5",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Identity",
            "What exact asset network and contract are being examined",
            "Record your notes and evidence here",
          ],
          [
            "Source",
            "How the application and support route are independently verified",
            "Record your notes and evidence here",
          ],
          [
            "Authority",
            "Who signs and what each requested action grants",
            "Record your notes and evidence here",
          ],
          [
            "Destination",
            "How recipient address memo and support are checked",
            "Record your notes and evidence here",
          ],
          [
            "Permissions",
            "How existing allowances or signed permissions are reviewed",
            "Record your notes and evidence here",
          ],
          [
            "Account protection",
            "How login email device and recovery paths are protected",
            "Record your notes and evidence here",
          ],
          [
            "Incident categories",
            "How key exposure allowance abuse and provider breach differ",
            "Record your notes and evidence here",
          ],
          [
            "Pause conditions",
            "Which missing fact or unexplained action stops the process",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: Practice Token A is on fictional Network R at Contract A. The exercise uses a paper wallet only. A connection is recorded separately from a spending allowance. Recipient instructions require reference 4821 and a ten-unit minimum. The plan pauses if network support or spender identity cannot be established. If signing material is exposed, a password reset is not treated as a repair; if an unwanted allowance is the only known issue, the correct verified permission procedure is investigated.",
      },
      {
        type: "heading",
        level: 3,
        children: "2 Wallet backup plan",
      },
      {
        type: "paragraph",
        children: "Revisit C2.2  •  C2.5",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Recovery design",
            "Phrase threshold guardian or other documented model",
            "Record your notes and evidence here",
          ],
          [
            "Required components",
            "Placeholder names for every component needed",
            "Record your notes and evidence here",
          ],
          [
            "Protected locations",
            "How independent backups survive plausible damage or loss",
            "Record your notes and evidence here",
          ],
          [
            "Compatibility",
            "Verified restoration instructions and supported implementation",
            "Record your notes and evidence here",
          ],
          [
            "Practice check",
            "How a separate empty practice arrangement tests understanding",
            "Record your notes and evidence here",
          ],
          [
            "Continuity",
            "How an authorised person finds instructions without public exposure",
            "Record your notes and evidence here",
          ],
          [
            "Change review",
            "When device participant or household changes trigger review",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: The fictional wallet uses recovery component A and additional secret B under its documented scheme. Protected location A and location B are independent; the course file records their roles rather than real locations or values. A separate empty practice setup is used to understand recovery. The continuity note describes how a designated person obtains lawful instructions without receiving secrets through ordinary messages. The plan is reviewed after a device change, and fresh independent authority is required if the actual signing secret is exposed.",
      },
    ],
  },
  {
    title: "Workbook token and provider research",
    shortTitle: "Workbook token and provider research",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "3 Token research template",
      },
      {
        type: "paragraph",
        children: "Revisit C5.1  •  C5.2  •  C5.3  •  C5.4",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Identity and version",
            "Network contract token type and current implementation",
            "Record your notes and evidence here",
          ],
          [
            "Purpose and rights",
            "Implemented use legal claim and holder benefit mechanism",
            "Record your notes and evidence here",
          ],
          [
            "Supply method",
            "Circulating total maximum definitions source and timestamp",
            "Record your notes and evidence here",
          ],
          [
            "Valuation arithmetic",
            "Price market cap FDV basis and their limits",
            "Record your notes and evidence here",
          ],
          [
            "Allocations and releases",
            "Beneficiaries restrictions overlap and future availability",
            "Record your notes and evidence here",
          ],
          [
            "Control",
            "Mint freeze upgrade and governance authorities",
            "Record your notes and evidence here",
          ],
          [
            "Liquidity",
            "Size-specific book or pool evidence including costs",
            "Record your notes and evidence here",
          ],
          [
            "Security evidence",
            "Review scope code version findings and later changes",
            "Record your notes and evidence here",
          ],
          [
            "Conclusion",
            "Contrary evidence uncertainty and next permitted research step",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: Practice Token A has a supplied circulating estimate of ten million and a stated maximum basis of 100 million at a fictional USD 2 quote. Indicated values are USD 20 million and USD 200 million. Neither is cash available to all holders. The supplied 1,000-unit bid sample yields only USD 1,400 before fees. No enforceable revenue entitlement is supplied. The conclusion therefore does not equate application fees with holder income and pauses further action until contract control and rights can be verified.",
      },
      {
        type: "heading",
        level: 3,
        children: "4 Exchange risk comparison",
      },
      {
        type: "paragraph",
        children: "Revisit C3.1  •  C3.5",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Service roles",
            "Custody matching broker peer-to-peer or contract interface",
            "Record your notes and evidence here",
          ],
          [
            "Eligibility",
            "Country product and current provider requirements",
            "Record your notes and evidence here",
          ],
          [
            "Custody and claims",
            "Who holds keys segregation subcontractors and failure rights",
            "Record your notes and evidence here",
          ],
          [
            "Market costs",
            "Spread depth fee asset and size-specific execution",
            "Record your notes and evidence here",
          ],
          [
            "Funding and exit",
            "Supported routes limits settlement and review stages",
            "Record your notes and evidence here",
          ],
          [
            "Evidence scope",
            "Reserve audit registration and insurance documents",
            "Record your notes and evidence here",
          ],
          [
            "Records and outage",
            "Exports account reconciliation and unavailable-service plan",
            "Record your notes and evidence here",
          ],
          [
            "Unresolved comparison",
            "What prevents a recommendation or ranking",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: Provider A is a fictional custodian with internal customer balances. Interface B is a fictional contract route with user signing. A's reserve snapshot does not establish all liabilities; B's public code does not establish safe tokens or administrators. Both need separate checks. The comparison records supported routes and total costs for the same hypothetical quantity, then states that missing customer-rights documents prevent a defensible safety ranking. A low fee alone is not used to choose a service.",
      },
    ],
  },
  {
    title: "Workbook portfolio scam assessment and research report",
    shortTitle: "Workbook portfolio scam assessment and research report",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "5 Portfolio risk policy",
      },
      {
        type: "paragraph",
        children: "Revisit C8.1  •  C8.2  •  C8.3  •  C8.4",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Purpose and affordability",
            "Fictional capital purpose and household boundaries",
            "Record your notes and evidence here",
          ],
          [
            "Instrument scope",
            "Permitted simulation categories and excluded actions",
            "Record your notes and evidence here",
          ],
          [
            "Loss calculation",
            "Budget cost allowance price assumptions and rounding",
            "Record your notes and evidence here",
          ],
          [
            "Concentration",
            "Asset issuer custodian chain bridge and protocol views",
            "Record your notes and evidence here",
          ],
          [
            "Review and rebalance",
            "Dates or observable bands and treatment of exceptions",
            "Record your notes and evidence here",
          ],
          [
            "Stress cases",
            "Market falls depeg blocked access and execution failure",
            "Record your notes and evidence here",
          ],
          [
            "Exit and records",
            "Cash-out route liquidity fees and ledger requirements",
            "Record your notes and evidence here",
          ],
          [
            "Revision conditions",
            "Facts that require pausing or rewriting the policy",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: The exercise permits fully paid spot paper positions and no live leverage. A GBP 20 planned-loss example reserves GBP 1 for costs, uses entry 50 and exit 45, and produces 3.8 units before venue rounding. The policy also tests a worse exit at 43, which exceeds the planned loss. Dependency views record shared providers rather than simply counting token names. A withdrawal suspension triggers investigation of access, not an automatic assumption that a market stop will solve it.",
      },
      {
        type: "heading",
        level: 3,
        children: "6 Scam assessment",
      },
      {
        type: "paragraph",
        children: "Revisit C0.4  •  C2.4  •  C2.5  •  C7.5",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Message and context",
            "Fictional message text date and claimed sender",
            "Record your notes and evidence here",
          ],
          [
            "Requested authority",
            "Money secret remote access signature or permission",
            "Record your notes and evidence here",
          ],
          [
            "Pressure tactic",
            "Deadline guarantee secrecy or emotional leverage",
            "Record your notes and evidence here",
          ],
          [
            "Independent verification",
            "Known official route separate from the requester",
            "Record your notes and evidence here",
          ],
          [
            "Decision",
            "Decline pause or verified legitimate follow-up with reasons",
            "Record your notes and evidence here",
          ],
          [
            "Incident response",
            "Appropriate category if an action already occurred",
            "Record your notes and evidence here",
          ],
          [
            "Evidence and reporting",
            "Non-secret evidence and verified reporting route",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked message: Support says you must synchronise your wallet before midnight to release a ZAR 2,000 refund. Its form asks for recovery words. Assessment: the request transfers signing authority, uses urgency and provides its own supposed verification. The learner declines, preserves the fictional message and checks official support independently. If real words had been entered, the incident would be treated as exposed signing material rather than an ordinary login-password problem. No recovery agent is paid.",
      },
      {
        type: "heading",
        level: 3,
        children: "7 Research report",
      },
      {
        type: "paragraph",
        children: "Revisit C7.5  •  C9.2  •  C9.3  •  C9.4  •  C10.4",
      },
      {
        type: "comparisonTable",
        caption: "Complete the editable worksheet",
        columns: ["Field", "Question to answer", "Your response"],
        rows: [
          [
            "Question and environment",
            "Asset universe venue dates timezone and sources",
            "Record your notes and evidence here",
          ],
          [
            "Evidence types",
            "Facts observations estimates hypotheses and forecasts",
            "Record your notes and evidence here",
          ],
          [
            "Rule specification",
            "Signal availability entry exit sizing and no-action rules",
            "Record your notes and evidence here",
          ],
          [
            "Costs and feasibility",
            "Fees spread depth partial fills and adverse assumptions",
            "Record your notes and evidence here",
          ],
          [
            "Data discipline",
            "Point-in-time inputs missing data and revision policy",
            "Record your notes and evidence here",
          ],
          [
            "Results",
            "Complete net ledger sample size expectancy and drawdown",
            "Record your notes and evidence here",
          ],
          [
            "Benchmark",
            "Matching capital dates currency and disclosed exposure differences",
            "Record your notes and evidence here",
          ],
          [
            "Contrary evidence",
            "Alternative explanation and invalidation condition",
            "Record your notes and evidence here",
          ],
          [
            "Conclusion and review",
            "Continue revise or abandon with limitations and date",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "example",
        title: "Worked example",
        children:
          "Worked entry: The supplied ten-trade paper sample is retained in full. Six gains and four losses produce a negative USD 50 net result after the stated USD 1 per-trade cost. The report does not call the 60 percent win rate profitable. It compares the same starting USD 1,000 with supplied hold and cash outcomes while disclosing different exposure. The conclusion is to examine costs and rule feasibility further, with no claim of proven future performance and no requirement to trade.",
      },
      {
        type: "heading",
        level: 3,
        children: "Final Dossier Review",
      },
      {
        type: "keyPoint",
        title: "Final dossier review",
        points: [
          "All seven graduation outputs are present and use fictional or safely redacted information.",
          "Asset identity, network, representation and custody model agree across the dossier.",
          "The backup plan matches the actual recovery model and contains no real secrets.",
          "Transfer routes include supported assets, networks, references, minimums and fees.",
          "Connections, signatures, transactions and permissions are described separately.",
          "Sources are dated and support only the claims their scope establishes.",
          "Supply, valuation and liquidity calculations include definitions and units.",
          "Yield explanations identify rewards, principal risk, fees and exit conditions.",
          "Portfolio stress includes shared dependencies and unavailable withdrawals.",
          "Practice includes every observation, net costs, a stated benchmark and limitations.",
          "Facts, calculations, estimates, hypotheses and forecasts are distinguishable.",
          "The final conclusion states unresolved questions and a reasoned next step.",
        ],
        checklist: true,
      },
      {
        type: "paragraph",
        children:
          "Reflection. Write one paragraph explaining what you can now assess, one paragraph identifying remaining uncertainty, and one paragraph stating when you would continue research or decline an action. Include a review date and the evidence that would require revision.",
      },
    ],
  },
  {
    title: "Complete paper-practice ledger and calculator checks",
    shortTitle: "Complete practice ledger",
    blocks: [
      {
        type: "paragraph",
        children:
          "This is a complete arithmetic dataset, not a claim that any market strategy produced these trades. For this worksheet, Rule P assumes one paper observation at each numbered interval, a permitted long simulation, ten-unit linear exposure and a preassigned gross outcome of USD 20 gain or USD 40 loss. Each completed observation incurs USD 1 total modelled costs. The starting balance is USD 1,000, there are no deposits or withdrawals, and all results are closed-trade observations. The rule is frozen for this supplied exercise rather than optimised against the outcomes.",
      },
      {
        type: "paragraph",
        children:
          "Use the sequence to reproduce win rate, average gain, average loss, expectancy and peak-to-trough drawdown. It does not supply intratrade paths, actual spreads, queue positions or asset returns, so it cannot establish feasible real execution or intratrade maximum drawdown. A genuine empirical test would need the full specification and point-in-time market data from C9.2 and C9.3. The exercise demonstrates accounting and interpretation only.",
      },
      {
        type: "comparisonTable",
        caption: "Reproduce every cash flow",
        columns: [
          "Step",
          "Gross USD",
          "Cost USD",
          "Net USD",
          "Equity USD",
          "Peak USD",
          "Drawdown percent",
        ],
        rows: [
          ["1", "+20.00", "1.00", "+19.00", "1019.00", "1019.00", "0.00"],
          ["2", "+20.00", "1.00", "+19.00", "1038.00", "1038.00", "0.00"],
          ["3", "-40.00", "1.00", "-41.00", "997.00", "1038.00", "3.95"],
          ["4", "+20.00", "1.00", "+19.00", "1016.00", "1038.00", "2.12"],
          ["5", "-40.00", "1.00", "-41.00", "975.00", "1038.00", "6.07"],
          ["6", "+20.00", "1.00", "+19.00", "994.00", "1038.00", "4.24"],
          ["7", "+20.00", "1.00", "+19.00", "1013.00", "1038.00", "2.41"],
          ["8", "-40.00", "1.00", "-41.00", "972.00", "1038.00", "6.36"],
          ["9", "+20.00", "1.00", "+19.00", "991.00", "1038.00", "4.53"],
          ["10", "-40.00", "1.00", "-41.00", "950.00", "1038.00", "8.48"],
        ],
      },
      {
        type: "paragraph",
        children:
          "All cash flows are fictional. Negative signs represent losses; no external cash flows are assumed.",
      },
      {
        type: "paragraph",
        children:
          "Ledger interpretation. The complete supplied net ledger peaks at USD 1,038 and ends at USD 950. Maximum observed closed-trade drawdown is about 8.48 percent; intratrade paths are not supplied.",
      },
      {
        type: "paragraph",
        children:
          "The six positive gross observations become six USD 19 net gains. The four negative observations become four USD 41 net losses. Win rate is 60 percent, average net gain USD 19 and average net loss USD 41 in magnitude. Net total is negative USD 50 and average net outcome is negative USD 5. The complete ledger prevents the winning observations from being reported alone.",
      },
      {
        type: "paragraph",
        children:
          "The peak is USD 1,038 after observation 2 and the final balance is USD 950. The maximum observed closed-trade drawdown is USD 88 divided by USD 1,038, or approximately 8.48 percent. Returning from USD 950 to that peak would require approximately 9.26 percent growth before costs and cash flows. This is arithmetic, not a likelihood or timetable for recovery.",
      },
      {
        type: "paragraph",
        children:
          "For a separate supplied benchmark, the same initial USD 1,000 is held in an asset whose final value is two percent lower, with USD 2 total costs, producing USD 978. Fictional zero-interest cash remains USD 1,000. These comparisons match starting capital and the exercise interval, but the hold position and Rule P have different exposure paths. No asset-price series is supplied, so the benchmark is an assumed endpoint comparison rather than a tested strategy. A real report must disclose that distinction.",
      },
      {
        type: "paragraph",
        children:
          "The process review asks whether all observations were recorded, the rule was kept fixed, costs were included and the stated limitations were preserved. A useful next step is further paper research with genuinely available data and feasible fills. Neither a favourable benchmark nor a later winning sample would automatically validate the asset rights, custody route or affordability of real exposure.",
      },
      {
        type: "paragraph",
        children: "Practice review",
      },
      {
        type: "keyPoint",
        title: "Practice review",
        points: [
          "Recalculate every equity balance without reading the explanation.",
          "Find the peak and largest subsequent closed-trade decline.",
          "Explain why a 60 percent win rate does not make this sample profitable.",
          "Write two limitations that prevent this ledger from proving a real strategy.",
        ],
        checklist: true,
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Check the complete fictional ledger above: choose USD, starting balance 1,038, drawdown 88 and Drawdown unit Currency amount. The observed peak-to-trough decline is 8.48 percent and the gain needed to recover is 9.26 percent. Identify the peak and trough from the ledger yourself: this tool does not ingest a full equity series or reveal intratrade losses.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Use the same ledger: choose USD, current balance 950 and recovery target 1,038. The gain needed is 9.26 percent. For a separate arithmetic illustration, enter a fictional planned gain of 5 percent per period; the constant-rate model reaches the target in two whole periods. This assumption does not estimate the likelihood or timing of real recovery.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A holiday plan with matching bookings",
        children:
          "A family in the UK prepares a holiday budget in GBP. Their flight, hotel and airport-transfer dates must agree. A cheap hotel does not fix a flight arriving on the wrong day. The graduation dossier needs the same consistency: a sound chart analysis cannot fix an unsupported transfer network or an incorrect custody assumption. Read the connected plan rather than grading each page in isolation.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not include real signing secrets, authentication codes or personally identifying financial records in the dossier.",
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
          "1. Name the seven required outputs without using actual account data.",
          "2. Find the inconsistency in calling a bridged lending receipt risk-free cash.",
          "3. State one valid graduation conclusion that involves no real-money action.",
        ],
        answers: [
          "1. Security checklist, wallet backup plan, token research template, exchange-risk comparison, portfolio-risk policy, scam assessment and research report.",
          "2. It carries bridge, lending, receipt, price and access dependencies. Those conflict with the risk-free cash description.",
          "3. The evidence supports understanding the supplied mechanism, but unresolved redemption or contract issues justify continued paper research or declining the activity.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Must a learner make a real trade or show profit to complete the course?",
        ],
        answers: [
          "No. Graduation requires documented understanding, safe procedure, calculations and honest paper practice.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "The seven outputs should form one coherent explanation.",
          "Secret-free templates can demonstrate real understanding.",
          "Knowing when to stop is a course skill.",
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
            title: "MIT OpenCourseWare  Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title:
              "SEC Investor gov  Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "CFTC  Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FCA  Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title: "Glassnode  Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title: "Glassnode  Exchange Data Transparency Notice",
            url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
          },
          {
            title:
              "BIS  BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
            url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
          },
          {
            title: "ESMA  ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "SEC Investor gov  Exchange Traded Products Providing Exposure to Bitcoin and Ether Investor Bulletin",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/ETPBulletinSeptember2024",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel10Lessons: LessonDocument[] = [
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
