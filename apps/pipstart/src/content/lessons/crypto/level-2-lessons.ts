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
  course: "wallets-and-security",
  description:
    "Choose a custody description based on control, recovery and dependencies.",
  estimatedMinutes: 14,
  learningPath: "crypto",
  level: "level-2",
  module: "wallet-and-personal-security",
  objectives: [
    "Choose a custody description based on control, recovery and dependencies.",
  ],
  position: 1,
  prerequisites: ["bitcoin-supply-halvings-and-claims"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["protect-recovery-material-and-accounts"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Choose a custody description based on control, recovery and dependencies.",
  seoTitle: "What a Wallet Controls and Who Holds the Keys",
  slug: "what-a-wallet-controls",
  sources: [
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
      url: "https://developer.bitcoin.org/devguide/wallets.html",
    },
    {
      title: "ethereum.org: ethereum.org — Ethereum wallets",
      url: "https://ethereum.org/en/wallets/",
    },
    {
      title: "Bitcoin.org: Bitcoin.org — Securing your wallet",
      url: "https://bitcoin.org/en/secure-your-wallet",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — What are the different types of crypto wallets?",
      url: "https://www.ledger.com/academy/topics/crypto/types-of-crypto-wallets",
    },
  ],
  status: "published",
  title: "What a Wallet Controls and Who Holds the Keys",
};
const sections1: LessonSection[] = [
  {
    title: "Your wallet manages authority",
    shortTitle: "Your wallet manages authority",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Choose a custody description based on control, recovery and dependencies.",
      },
      {
        type: "paragraph",
        children:
          "The word wallet suggests a container, but a crypto wallet usually manages authority over records on a network. Understanding who has that authority is more useful than looking at the application's balance screen. This lesson separates custody, internet exposure, signing devices and account recovery so that you can describe a wallet arrangement accurately.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Describe who can authorise a transfer and how authority can be recovered.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Ask what is really inside a crypto wallet",
      },
      {
        type: "paragraph",
        children:
          "Think about the keys you carry every day. One opens your front door, another starts the car. Neither key is your house or your car; they only let you in. Lose them, and the house still stands, but getting back in becomes a problem.",
      },
      {
        type: "paragraph",
        children:
          "A crypto wallet works in a similar way. In Level 1 you learned that a private key signs a transaction and the network checks that signature. Your coins never sit inside your phone. They are recorded on the blockchain. What the wallet holds are the private keys that prove you may move those coins, plus tools to sign and send transactions. Ethereum.org's wallet guide puts it plainly: wallet providers do not hold your funds; they give you a window to see your assets and tools to manage them.",
      },
      {
        type: "definition",
        term: "Crypto wallet",
        children:
          "Software or a device that stores (or gives access to) the private keys for your addresses, shows balances by reading the blockchain, and lets you sign and send transactions.",
      },
      {
        type: "paragraph",
        children:
          "The key-ring analogy stops working in one important place. If you lose your house keys, a locksmith can let you in once you prove who you are. In crypto there is usually no locksmith. If the only copy of a private key is lost, the coins stay on the blockchain, but nobody can move them again.",
      },
      {
        type: "example",
        title: "The broken phone in Manchester",
        children:
          "Tom, a student in Manchester, drops the phone holding his wallet app into the canal. His crypto has not sunk with it: the record is still on the blockchain. Whether he can reach it again depends on whether he kept a working backup of his keys. With one, he restores the wallet on a new phone. Without one, the coins are out of reach for good.",
      },
      {
        type: "paragraph",
        children:
          "If a wallet is really a key holder, why are there so many different kinds? The answer starts with a little history.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how wallets developed over time",
      },
      {
        type: "paragraph",
        children:
          "When Bitcoin's software was released in January 2009, the wallet was part of the same program that ran the network. It kept keys in a file on the user's computer. If the computer died without a copy of that file, the keys died with it.",
      },
      {
        type: "paragraph",
        children:
          "People soon looked for safer and more practical methods. In September 2013, developers Marek Palatinus, Pavol Rusnák, Aaron Voisine and Sean Bowe proposed BIP-39, a standard that turns a wallet's secret into a list of ordinary words a person can write down. In July 2014, Palatinus and Rusnák's company launched the Trezor Model One, which Trezor describes as the world's first hardware wallet: a small device built to keep keys away from the internet. Many wallet apps, extensions and devices followed, and exchanges began holding keys for customers.",
      },
      {
        type: "paragraph",
        children:
          'No single person invented "the crypto wallet". It grew step by step, balancing two goals that often pull apart: keeping keys safe and keeping them convenient. That tension starts with one question: who holds the keys?',
      },
      {
        type: "paragraph",
        children:
          "Deleting an application does not normally erase the ledger holding, and copying an application does not create a second holding. A compatible recovery method can restore access on another device because the authority is recreated, not because coins are downloaded from a lost phone. Conversely, a person who copies your signing secret may gain access without taking the phone. A screenshot of the balance is not a backup of that authority.",
      },
    ],
  },
  {
    title: "Custody is a trade-off",
    shortTitle: "Custody is a trade off",
    blocks: [
      {
        type: "paragraph",
        children:
          "In a custodial arrangement, a provider manages the keys or controls transactions on your behalf. You usually authenticate to its service, then request an action under its rules. Recovery may involve identity checks or a password reset, but withdrawal still depends on the provider. The account can also be restricted, compromised or affected by insolvency.",
      },
      {
        type: "paragraph",
        children:
          "In a non-custodial arrangement, the user controls the relevant authority, sometimes through more than one device or person. There may be no company that can reset it after all recovery material is lost. Some products mix arrangements, such as user-controlled signing with additional recovery participants. Ask who can sign, who can block an action, who can restore access and what happens when a party disappears. The custody label is a starting point, not a substitute for these questions.",
      },
      {
        type: "paragraph",
        children:
          "Custody asks who controls the authority to move assets. With a typical custodial account, a provider controls keys and you request action through its service. With a typical self-custody wallet, you manage the required signing authority and its recovery arrangement.",
      },
      {
        type: "paragraph",
        children:
          "Think of jewellery held through a storage service and jewellery in your own safe. The comparison explains responsibility, but a bank's safe-deposit box is not automatically protected by bank deposit insurance, and crypto custody has its own legal terms. Read the actual protection rather than borrowing reassurance from the analogy.",
      },
      {
        type: "paragraph",
        children:
          "A forgotten service login may be reset after legitimate identity checks. Lost self-custody signing material may be unrecoverable if no valid backup or recovery route remains. Providers can fail or restrict withdrawals; individuals can lose secrets, approve harmful actions or misunderstand a backup.",
      },
      {
        type: "comparisonTable",
        columns: ["Question", "Provider custody", "Typical self custody"],
        rows: [
          [
            "Who ordinarily signs",
            "Provider or its custody arrangement",
            "User under the wallet's design",
          ],
          [
            "Recovery depends on",
            "Service procedures and availability",
            "All required recovery components",
          ],
          [
            "Important failures",
            "Hack, fraud, insolvency, account restriction",
            "Secret theft, loss, device compromise, harmful approval",
          ],
          [
            "What to investigate",
            "Terms, segregation, controls and customer rights",
            "Backup, signing checks and usable recovery",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Neither choice removes market risk. Understanding both is the learning objective; no purchase or transfer is required.",
      },
      {
        type: "example",
        title: "Two siblings, two choices",
        children:
          "Valentina in Córdoba, Argentina, keeps her bitcoin on an exchange because she worries about losing a backup. Her brother Mateo holds his own keys because he worries about exchanges failing. Each has reduced one risk by accepting another. The better question is which failure each is more able to prevent.",
      },
    ],
  },
  {
    title: "Hot, cold, software and watch-only",
    shortTitle: "Hot cold software and watch only",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Separate hot wallets from cold wallets",
      },
      {
        type: "paragraph",
        children:
          "Think about cash. A little sits in your pocket for bus fares; the rest stays at home or in the bank. Pocket money is handy but exposed to pickpockets; money at home is slower to reach but safer.",
      },
      {
        type: "paragraph",
        children:
          "Crypto calls this hot and cold storage. Ledger Academy's guide to wallet types groups phone, desktop and browser wallets as hot, and hardware and paper wallets as cold.",
      },
      {
        type: "definition",
        term: "Hot wallet",
        children:
          "A wallet whose private keys are stored on an internet-connected device: convenient for regular use, but more exposed to malware and remote attacks.",
      },
      {
        type: "definition",
        term: "Cold wallet",
        children:
          "A wallet whose private keys stay offline and never touch an internet-connected computer: slower to use, but harder to attack remotely.",
      },
      {
        type: "paragraph",
        children:
          'Bitcoin.org gives the same pocket-money advice: keep only small amounts on devices you use daily, and use offline storage for savings. The analogy bends in one place. Cash at home is safe from pickpockets but not burglars; likewise, "cold" protects keys from remote attackers, but not from fire, loss, theft or coercion. The security lessons in Level 2 covers physical safety.',
      },
      {
        type: "paragraph",
        children:
          "With both axes in place, look more closely at the wallets most people meet first: software wallets.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet software wallets on phones, computers and browsers",
      },
      {
        type: "paragraph",
        children:
          "A software wallet is an app that keeps keys on a general-purpose device. Ethereum.org lists mobile apps, desktop applications and browser extensions. They are usually free and quick to set up.",
      },
      {
        type: "paragraph",
        children:
          "A mobile wallet lives on your phone and goes everywhere with you. But phones are lost, stolen and broken, and Ledger Academy notes that mobile wallets can be targeted through hacking and attacks on your phone number. A desktop wallet runs on a computer, so it is only as safe as that computer; malware on the same machine may try to read files, record keystrokes or change what you paste. A browser extension wallet sits inside your web browser and lets websites ask it to sign things. It is convenient and very exposed, because it lives where you click links. Ledger Academy notes that browser wallets commonly operate in an environment exposed to internet content, which leaves them open to online attacks.",
      },
      {
        type: "example",
        title: "Paying friends in Jakarta",
        children:
          "Dewi in Jakarta uses a mobile wallet to receive small payments from friends, about Rp 200,000 at a time (an amount invented for this example). A phone app suits her: the amounts are small and frequent, and she could absorb a theft. She would not keep years of savings there.",
      },
      {
        type: "paragraph",
        children:
          "For larger amounts, many people add a device that keeps keys away from the phone and computer entirely.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand why paper wallets are risky",
      },
      {
        type: "paragraph",
        children:
          "A paper wallet is a private key and its address printed on paper, often as QR codes. In Bitcoin's early years it was a popular way to keep coins offline.",
      },
      {
        type: "paragraph",
        children:
          'Today educators treat paper wallets as risky. Ledger Academy points to physical damage and fraudulent generator websites, which can quietly keep a copy of the key they "give" you. Printers can store copies of what they print. Paper fades, burns and gets wet. And spending usually means typing or scanning the private key into a software wallet, which exposes it to that device.',
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'Don\'t create keys on a website. Never generate a paper wallet, or any private key, on a website you reached through a search, an ad or a message. A fake generator can show you a valid-looking key while saving a copy for the scammer, who can empty the address whenever they like. Treat "free paper wallet" offers as a red flag.',
      },
      {
        type: "paragraph",
        children:
          "A paper wallet is different from a paper backup: a recovery phrase written on paper or stamped into metal is a backup, and the next lesson explains how to store one well.",
      },
      {
        type: "paragraph",
        children:
          "Paper and hardware wallets both hold keys. One more type deliberately holds no private keys at all, and it is surprisingly useful.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look without touching: watch-only wallets",
      },
      {
        type: "paragraph",
        children:
          "Think of the room board behind a hotel reception desk. Staff can see which rooms are taken, but the board cannot open any door. It is safe to have on show because it holds no keys.",
      },
      {
        type: "paragraph",
        children:
          "A watch-only wallet works the same way. It is loaded with public information only, such as your addresses or, in some Bitcoin wallets, an extended public key. River's Bitcoin glossary describes watch-only wallets as able to show balances and receive bitcoin, but unable to authorise spending, because they do not store private keys.",
      },
      {
        type: "definition",
        term: "Watch-only wallet",
        children:
          "A wallet that tracks addresses using public information only; it can show balances and incoming payments but cannot sign or send transactions.",
      },
      {
        type: "paragraph",
        children:
          "That lets you check a cold-storage balance on your phone without the hardware wallet, or, as Level 0 suggested, practise tracking addresses before putting money in.",
      },
      {
        type: "paragraph",
        children:
          'The trade-off is privacy: anyone with your watch-only details sees your balance and history. And beware a common trick: scammers show a wallet that seems to hold a large balance, then ask for a fee to "unlock" it. A balance you can see is not a balance you can spend.',
      },
      {
        type: "paragraph",
        children:
          "So far each wallet has seemed to hold one kind of coin. Many wallets now handle several networks at once, which brings a new kind of mistake.",
      },
      {
        type: "paragraph",
        children:
          "An offline backup is not automatically a cold wallet if the same secrets are also entered into an online application. Similarly, calling a product non-custodial does not mean the device is isolated from malware. Explain the actual handling of secrets rather than assuming a marketing term resolves every security question.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-1-rId24.png",
        width: 1670,
        height: 1702,
        alt: "Custody and online exposure are separate dimensions. Offline signing does not make every approved action safe.",
        caption:
          "Custody and online exposure are separate dimensions. Offline signing does not make every approved action safe.",
      },
    ],
  },
  {
    title: "Hardware signers, networks and a suitable setup",
    shortTitle: "Hardware signers, networks and a suitable setup",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "What a hardware signer helps protect",
      },
      {
        type: "paragraph",
        children:
          "A hardware wallet is a signing device designed to keep secret keys within a controlled device environment. It can reduce particular risks associated with exposing keys on a general-purpose computer. It does not make a malicious contract or wrong address safe. A user who confirms a harmful action can still authorise it, and some requests may be difficult to interpret clearly.",
      },
      {
        type: "paragraph",
        children:
          "Inspect the destination and action on the trusted device display where supported, and obtain the device and software through verified channels. A recovery phrase supplied prewritten with a device is a serious warning sign because another person may already know it. Device loss, theft, tampering and backup compromise remain considerations. No purchase is required for this course; the objective is to understand the role and limits of a signing device.",
      },
      {
        type: "paragraph",
        children:
          "Imagine signing a cheque inside a sealed booth. The cheque slides in, you read and sign it inside, and it slides back out. Your pen never leaves the booth.",
      },
      {
        type: "heading",
        level: 3,
        children: "Networks genuine software and a suitable setup",
      },
      {
        type: "paragraph",
        children:
          "A wallet interface can contain several accounts and addresses across several networks. An address format may appear on more than one compatible network, but the balances and assets belong to their respective ledgers. Viewing one network while expecting another can make a holding appear missing. A provider may not support the same asset on every network that uses a familiar format.",
      },
      {
        type: "paragraph",
        children:
          "Password reset behaviour follows the custody and recovery arrangement. Resetting an exchange login can restore service access if the provider's checks succeed. Resetting an application password may require local data or recovery material and may have no effect on the underlying key. Before choosing a wallet, write a short description of its authority, exposure, recovery and network support. The next lesson turns that description into a secret-protection and continuity plan.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a travel card holding euros, pounds and yen in separate pockets. It is one card, but each pocket follows its own rules, and paying from the wrong pocket fails or costs extra.",
      },
      {
        type: "example",
        title: "The search ad in Frankfurt",
        children:
          "Jonas in Frankfurt clicks a search ad offering a \"new version\" of a wallet. Before downloading, he opens the provider's site from his bookmark and compares: the ad's domain has one letter changed. He installs from the official page instead. The security lessons in Level 2 covers fake sites in detail.",
      },
      {
        type: "heading",
        level: 3,
        children: "Choose a set up by what the money is for",
      },
      {
        type: "paragraph",
        children:
          "Choose an arrangement by its authority, exposure, recovery and purpose, rather than by a universal claim that one wallet is best. A watch-only setup can support learning without signing. A small online spending arrangement and an offline signer can have different roles, but both still need a sound process.",
      },
      {
        type: "example",
        title: "A fictional spending layer",
        children:
          "Mia in Sydney models A$50 of weekly crypto spending over four weeks, or A$200 of planned spending. That arithmetic explains a possible working balance. It is not a recommendation to hold that amount, and a harmful permission, shared backup or connected account could expose more than one balance.",
      },
      {
        type: "paragraph",
        children:
          "Write down which assets and networks are supported, who can sign, what the backup must restore, and which failures affect other accounts. If the arrangement is too complicated to explain or maintain, a valid decision is to remain with paper learning.",
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
          "The locker and the key service. Priya in India rents a locker containing documents worth protecting. One service keeps the master key and releases access after identity checks; another gives Priya the only usable key and cannot replace it. A third uses a recovery arrangement involving two trusted participants. The convenience and failure risks differ even though every service calls the space a locker. A crypto wallet comparison likewise begins with authority and recovery, rather than the visual appearance of the balance. No INR amount on a screen tells Priya who can authorise a transfer.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  A device label or storage label does not guarantee safe transaction requests.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Is a provider using cold storage automatically non-custodial for its customers?",
          "2. A phone is lost but a valid wallet recovery method survives. Where is the asset record?",
          "3. List four questions to ask about a wallet before using it.",
        ],
        answers: [
          "1. No. The provider can still control the keys. Cold storage concerns exposure rather than customer authority.",
          "2. It remains on the relevant ledger. The recovery method may restore authority through a compatible wallet.",
          "3. Who signs, who can block, how recovery works, and what happens if the provider or device is unavailable. Network support and backup requirements also matter.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Can a hardware wallet prevent every harmful transaction?"],
        answers: [
          "Answer. No. It helps protect keys but can still sign an action the user approves. Destination and permission checks remain necessary.",
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
          "Wallet software manages authority over ledger records.",
          "Custody and hot or cold exposure describe different properties.",
          "Recovery must be understood before access is lost.",
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
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
            url: "https://developer.bitcoin.org/devguide/wallets.html",
          },
          {
            title: "ethereum.org: ethereum.org — Ethereum wallets",
            url: "https://ethereum.org/en/wallets/",
          },
          {
            title: "Bitcoin.org: Bitcoin.org — Securing your wallet",
            url: "https://bitcoin.org/en/secure-your-wallet",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — What are the different types of crypto wallets?",
            url: "https://www.ledger.com/academy/topics/crypto/types-of-crypto-wallets",
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
  course: "wallets-and-security",
  description:
    "Make a backup plan that matches the wallet's actual recovery model.",
  estimatedMinutes: 25,
  learningPath: "crypto",
  level: "level-2",
  module: "wallet-and-personal-security",
  objectives: [
    "Make a backup plan that matches the wallet's actual recovery model.",
  ],
  position: 2,
  prerequisites: ["what-a-wallet-controls"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["what-a-wallet-controls", "check-a-crypto-transfer"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Make a backup plan that matches the wallet's actual recovery model.",
  seoTitle: "Protect Recovery Material and Secure Accounts",
  slug: "protect-recovery-material-and-accounts",
  sources: [
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "MetaMask: I have been hacked or scammed",
      url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
    },
    {
      title: "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
      url: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
      url: "https://developer.bitcoin.org/devguide/wallets.html",
    },
    {
      title:
        "Bitcoin Improvement Proposals: Bitcoin Improvement Proposals — BIP-39: Mnemonic code for generating deterministic keys",
      url: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
    },
    {
      title: "Bitcoin community: Bitcoin FAQ",
      url: "https://bitcoin.org/en/faq",
    },
    {
      title: "Bitcoin.org: Bitcoin.org — Securing your wallet",
      url: "https://bitcoin.org/en/secure-your-wallet",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
      url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
    },
    {
      title:
        "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
      url: "https://www.ic3.gov/PSA/2022/PSA220208",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
      url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
    },
  ],
  status: "published",
  title: "Protect Recovery Material and Secure Accounts",
};
const sections2: LessonSection[] = [
  {
    title: "Understand the recovery material",
    shortTitle: "Understand the recovery material",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Make a backup plan that matches the wallet's actual recovery model.",
      },
      {
        type: "paragraph",
        children:
          "Several things may be called a wallet password, yet losing or exposing them has different consequences. A recovery phrase, a private key, an application password and an optional passphrase are not interchangeable. The goal of this lesson is a practical backup and account-security plan that you can explain without writing any real secret in the course document.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A recovery plan is complete only when all required components can be found and used safely.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "A recovery phrase in a wallet that uses one helps derive signing material according to the wallet's scheme. A private key is specific signing material. An application password commonly protects local access or an encrypted wallet file. An optional recovery passphrase, where supported, can change the wallet derived from the recovery words. The precise method and compatibility are product dependent.",
      },
      {
        type: "paragraph",
        children:
          "Someone with a usable recovery phrase and any required additional secret may recreate authority elsewhere without the original application's password. By contrast, a forgotten local password might be recoverable using intact recovery material. A missing optional passphrase can make the intended wallet inaccessible even when the words are correct. Never assume support can reconstruct these secrets. Write the roles in your plan, while keeping actual secret values entirely out of class notes.",
      },
      {
        type: "heading",
        level: 3,
        children: "Find out what a seed phrase really is",
      },
      {
        type: "paragraph",
        children:
          "Imagine a building where one master key opens every door. Keep it safe, and you can always cut new door keys. Let someone copy it, and they can walk into every room.",
      },
      {
        type: "paragraph",
        children:
          "Earlier in the course you saw that a wallet holds keys, not coins. Most self-custody wallets create all of those keys from one secret, shown to you as a list of ordinary words: the seed phrase, or recovery phrase. Bitcoin.org's FAQ explains that, written down and stored securely offline, it lets you restore your entire wallet if a device is lost, stolen or broken.",
      },
      {
        type: "definition",
        term: "Seed phrase (recovery phrase)",
        children:
          "A list of words, usually 12 or 24, that encodes the secret from which a wallet creates all of its private keys. Anyone who has it can rebuild the wallet and move its funds.",
      },
      {
        type: "paragraph",
        children:
          "The master-key picture has one twist. A building owner can change the locks after a master key goes missing. In crypto you cannot: if someone learns your seed phrase, the only defence is to move your funds to a brand-new wallet before they do.",
      },
      {
        type: "paragraph",
        children:
          "The words follow a public standard. In September 2013, Marek Palatinus, Pavol Rusnák, Aaron Voisine and Sean Bowe proposed BIP-39 (Bitcoin Improvement Proposal 39), which sets out how a wallet turns random numbers into words. Wallets for many cryptocurrencies now use it, so it is worth knowing how the words are chosen.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read the BIP-39 word list in plain words",
      },
      {
        type: "paragraph",
        children:
          "Think of a bingo caller who reads out a word printed on each numbered ball instead of the number. Each word stands for a number, and words are far harder to miscopy than long strings of digits.",
      },
      {
        type: "paragraph",
        children:
          "BIP-39 works like that. The wallet creates a large random number and adds a small checksum, a few bits calculated from the number so typos can be caught. The result is cut into pieces, and each piece selects one word from a fixed list of 2,048 words. The specification gives the sizes: 128 bits of randomness become 12 words, and 256 bits become 24 words (15, 18 and 21 words are also allowed, but rarer).",
      },
      {
        type: "paragraph",
        children:
          'The English list was designed with care. BIP-39 says the first four letters of every word are unique, so "aban" can only mean "abandon". Similar pairs, such as "build" and "built", were left out, and the list is sorted alphabetically, starting "abandon", "ability", "able". That is why some metal backup plates have room for only four letters per word.',
      },
      {
        type: "formula",
        expression:
          "Possible 12-word phrases = 2,048¹² = 2¹³²; valid phrases after the checksum ≈ 2¹²⁸",
        explanation:
          "each of 12 positions can hold any of 2,048 words. Four of the 132 bits are used for the checksum, so about 2¹²⁸ phrases are valid, a number with 39 digits. Nobody can guess a properly random phrase. The real danger is that someone sees or copies yours.",
      },
      {
        type: "example",
        title: "The one-letter slip in Bengaluru",
        children:
          'Arjun in Bengaluru restores his wallet and types "amout" instead of "amount". The wallet flags it at once, because "amout" is not one of the 2,048 words. Had he typed a real but wrong word, the checksum would usually have caught it, though without saying which word to fix, so he would check each one against his backup slowly.',
      },
      {
        type: "paragraph",
        children:
          "That randomness must come from the wallet, never from you: a phrase you invent, such as song lyrics, can be guessed. Next, what do the words unlock?",
      },
      {
        type: "heading",
        level: 3,
        children: "See how one phrase opens many accounts",
      },
      {
        type: "paragraph",
        children:
          "Think of a family tree: knowing the grandparent at the top, you can draw every branch below.",
      },
      {
        type: "paragraph",
        children:
          "A seed phrase is the top of such a tree. From it, the wallet calculates a master key, and from that, as many accounts and addresses as you need, on one or several blockchains. So you can use a new address for every payment yet back up only once, and the same phrase can usually restore your wallet in another app that follows the standard.",
      },
      {
        type: "paragraph",
        children:
          "The tree has a limit: wallets do not all organise their branches the same way, so a restore in a different app can look empty until the right settings are chosen. That is one reason to test a restore early. First, though, the words must be written down correctly.",
      },
    ],
  },
  {
    title: "Passphrases, multisig and other recovery models",
    shortTitle: "Passphrases multisig and other recovery models",
    blocks: [
      {
        type: "paragraph",
        children:
          "Some wallets use social recovery, multiple signatures, multi-party computation or service-assisted arrangements. These designs divide authority or recovery differently. A threshold may require a specified number of participants, and recovery may involve waiting periods, guardians or account contracts. Their risks include participant failure, collusion, compromised recovery accounts and misunderstood procedures.",
      },
      {
        type: "paragraph",
        children:
          "Do not apply a recovery-phrase tutorial to a wallet that has no such phrase. Read the actual product documentation and identify what is sufficient to restore access. Ask whether a recovery provider can act alone, whether a change takes effect immediately and how the user receives notice. A procedure that depends on two unavailable relatives is not usable simply because the design has a security label. Availability and independence matter as well as secrecy.",
      },
      {
        type: "heading",
        level: 3,
        children: "Decide whether an optional passphrase is right for you",
      },
      {
        type: "paragraph",
        children:
          "Picture a hotel safe that needs a key and a code. A thief with the key still cannot open it, but if you forget the code, it stays shut for you too.",
      },
      {
        type: "paragraph",
        children:
          'BIP-39 allows an optional passphrase, sometimes called a "25th word", although it can be any text you choose. The wallet mixes the passphrase with the seed phrase to create the wallet. The specification notes that every passphrase produces a valid wallet, so a different passphrase opens a different, usually empty, wallet. Trezor explains the practical effects: passphrases are case-sensitive, a typo opens a different wallet, and a lost passphrase cannot be reset or recovered by anyone.',
      },
      {
        type: "definition",
        term: "Passphrase (BIP-39)",
        children:
          "Optional extra text, chosen by you, that is combined with the seed phrase to create a separate wallet. Without the exact passphrase, the seed phrase alone opens a different wallet.",
      },
      {
        type: "paragraph",
        children:
          "The benefit: a thief who finds the seed phrase sees only the standard, empty wallet. The cost: a second secret that must be backed up, stored apart from the seed phrase and reproduced exactly, capitals and spaces included. Added without a plan, a passphrase can lock you out of your own funds.",
      },
      {
        type: "example",
        title: "Two secrets in Busan",
        children:
          "Ji-woo in Busan adds a passphrase to protect about ₩5,000,000 held long term (an amount invented for this example). She stores her seed phrase on a metal plate at home, and the passphrase on a card in a sealed envelope at her brother's flat across the city. The plate alone does not reproduce the intended passphrase wallet, but remains sensitive and must still be protected. If both items were stored together, the passphrase would add almost nothing.",
      },
      {
        type: "paragraph",
        children:
          "A passphrase only helps if both secrets truly work. The only way to know that is to test them.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand multisig and why it is used",
      },
      {
        type: "paragraph",
        children:
          "Think of a company cheque that needs two signatures out of three directors. No single director can empty the account alone, and if one director is away, the other two can still sign.",
      },
      {
        type: "paragraph",
        children:
          'A multisig (multi-signature) wallet works the same way. It is set up with several keys, often on separate devices kept in different places, and a rule such as "2-of-3": any two of the three keys must sign before funds can move. Trezor explains the main benefits: no single lost or stolen key can lose or steal the funds, it suits organisations where several people must approve spending, and it can help with inheritance. Bitcoin.org also lists multi-signature as a protection against theft. Trezor notes that multisig has been widely used in the Bitcoin community since 2012.',
      },
      {
        type: "definition",
        term: "Multisig wallet",
        children:
          "A wallet that needs signatures from a set number of separate keys (for example, two of three) before a transaction is valid.",
      },
      {
        type: "paragraph",
        children:
          "Multisig has real costs. It is more complex to set up and recover. Each key needs its own backup, and the wallet's setup details (for Bitcoin, the extended public keys of every signer) must be saved too, or the funds may be unspendable even with enough keys. Fees can be higher, and changing a key usually means a new wallet.",
      },
      {
        type: "paragraph",
        children:
          "Multisig also has a limit worth remembering. It protects against one key being lost or stolen, but not against every signer being fooled into approving the same bad transaction. You will see a large, dated example of that in the transfer checking lesson in Level 2.",
      },
      {
        type: "paragraph",
        children:
          "Backups, passphrases and multisig all protect you. The last question is what happens to your crypto when you cannot act at all.",
      },
    ],
  },
  {
    title: "Write, store and test backups safely",
    shortTitle: "Write store and test backups safely",
    blocks: [
      {
        type: "paragraph",
        children:
          "A backup must survive plausible accidents while resisting theft. Consider fire, water, device failure, moving house and unauthorised access. Storing every copy in one bag protects poorly against losing the bag. Leaving several copies casually accessible increases theft risk. Choose locations and methods that fit the wallet's requirements, your household and your ability to recover them.",
      },
      {
        type: "paragraph",
        children:
          "Avoid ordinary cloud notes, email, screenshots and unknown websites for recovery material. These can create additional copies and expose accounts that were not designed as signing-secret stores. A recovery check should follow verified wallet guidance in a controlled environment; it is not an invitation to type words into a random verification form. Test the documented procedure with a separate practice arrangement before relying on it. Never submit actual recovery material to PipStart or a reviewer.",
      },
      {
        type: "paragraph",
        children: "What each secret is for",
      },
      {
        type: "comparisonTable",
        columns: ["Item", "Typical role", "Dangerous misunderstanding"],
        rows: [
          [
            "Recovery phrase where used",
            "Recreate wallet signing material",
            "Treating it as harmless support data",
          ],
          [
            "Private key",
            "Authorise particular spending conditions",
            "Sharing it to prove ownership",
          ],
          [
            "Application password",
            "Protect local or service access",
            "Assuming it revokes copied keys",
          ],
          [
            "Optional recovery passphrase",
            "Select or protect a derived wallet",
            "Assuming the words alone always suffice",
          ],
          [
            "Authentication recovery code",
            "Restore an account authentication route",
            "Leaving it in an exposed account",
          ],
          [
            "Recovery participant",
            "Perform part of a defined recovery process",
            "Assuming availability without checking",
          ],
        ],
      },
      {
        type: "example",
        title: "The careful set-up in Lyon",
        children:
          "Sophie in Lyon sets up a hardware wallet with the curtains closed and her phone in another room. She writes 24 numbered words on the card supplied, compares each to the screen and passes the confirmation step.",
      },
      {
        type: "paragraph",
        children:
          "Think about where you keep a passport: not in your pocket on the bus, but somewhere dry and private that you can find again.",
      },
      {
        type: "paragraph",
        children:
          "Imagine posting your bank PIN to yourself on a postcard. It might arrive, but many people would see it on the way. Digital copies of a seed phrase are that postcard.",
      },
      {
        type: "heading",
        level: 3,
        children: "Test a restore before you rely on it",
      },
      {
        type: "paragraph",
        children:
          "A recovery check should confirm that all required backup components correspond to the intended wallet without destroying the only working access. Follow the genuine wallet's documented backup-check procedure. Some hardware devices can verify a backup without wiping the live device.",
      },
      {
        type: "paragraph",
        children:
          "For the course, rehearse with an empty practice wallet and fresh practice material. Do not enter real recovery words into a website or course file. If a device reset is involved, preserve the original access until a safe check has established that the required material and settings work. A reset should not be a beginner's first diagnostic move on a funded wallet.",
      },
      {
        type: "paragraph",
        children:
          "Record the wallet method, whether a passphrase is required, relevant account or derivation settings and the date checked. Multisig can also need policy information and public-key descriptors, not merely one set of words. A matching address is useful evidence within the documented procedure; an empty screen can mean wrong settings rather than proof that the ledger assets vanished.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-2-rId25.png",
        width: 1980,
        height: 1574,
        alt: "Illustrative storage choices for recovery material. Confidentiality, durability, compatibility and all required components must be considered.",
        caption:
          "Illustrative storage choices for recovery material. Confidentiality, durability, compatibility and all required components must be considered.",
      },
    ],
  },
  {
    title: "Phishing, devices and account recovery",
    shortTitle: "Phishing devices and account recovery",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Ask why attackers go after people not blockchains",
      },
      {
        type: "paragraph",
        children:
          "Think about a bank vault with walls a metre thick. A burglar rarely drills through the wall. It is far cheaper to phone the manager, pretend to be head office and ask for the combination.",
      },
      {
        type: "paragraph",
        children:
          "The same distinction helps when discussing crypto. Signatures are hard to forge and a random seed phrase cannot be guessed, so attackers aim at the softest part of the system: you, your devices and your phone number. They try to make you reveal a secret, install something harmful, send coins to the wrong address or sign something you did not understand.",
      },
      {
        type: "definition",
        term: "Phishing",
        children:
          "An attempt to trick you into revealing a secret, visiting a fake site, installing harmful software or approving a transaction, by pretending to be someone you trust.",
      },
      {
        type: "paragraph",
        children:
          "The vault analogy stops working in one place. A bank can often freeze a stolen transfer, but as Level 0 explained, a confirmed crypto transfer generally cannot be reversed by anyone. The defence has to happen before you click, type or sign, starting with the most common trick: a fake copy of a real website.",
      },
      {
        type: "heading",
        level: 3,
        children: "Spot fake websites and search ads",
      },
      {
        type: "paragraph",
        children:
          'Picture a shop that copies your bank\'s sign, colours and uniforms. Inside, a friendly clerk asks you to "confirm" your PIN. Everything looks right except the address on the door.',
      },
      {
        type: "paragraph",
        children:
          "Fake crypto websites work in that way. A criminal copies the look of an exchange or wallet, registers a web address with one letter changed or a word added, then pays for search ads or sends links by email, text or social media. Whatever you type into the copy, whether a password, a two-factor code or a seed phrase, goes to the criminal. Ledger Academy's security checklist warns that an email or advert claiming to be genuine is not proof that it is.",
      },
      {
        type: "paragraph",
        children:
          "You met the app-store version of this trick in the wallet and custody lesson in Level 2. For websites, type the address yourself or use a bookmark saved from the official site, and treat search ads, unexpected emails and direct messages as untrusted, however polished. No genuine website ever needs your seed phrase.",
      },
      {
        type: "example",
        title: "The urgent email in São Paulo",
        children:
          'Lucas in São Paulo gets an email saying his exchange account will be "locked in 24 hours" unless he verifies it. Instead of clicking, he opens the exchange from his bookmark and finds no warning. The email\'s link led to a site whose name had one extra letter. Urgency plus a link is the pattern he now recognises.',
      },
      {
        type: "paragraph",
        children:
          "Fake websites wait for you to arrive. The next trick comes looking for you, wearing a helpful face.",
      },
      {
        type: "heading",
        level: 3,
        children: "Recognise fake support and impersonators",
      },
      {
        type: "paragraph",
        children:
          'Imagine a stranger in a car park wearing a high-visibility vest: "I work for the council, give me your car keys and I\'ll move it for you." The vest is meant to stop you thinking.',
      },
      {
        type: "paragraph",
        children:
          'Fake support works on the same instinct. Criminals post fake helpline numbers, reply to people who complain on social media, or phone and text while pretending to be an exchange or wallet company. Coinbase\'s help centre describes the pattern: fake agents ask for passwords, two-step verification codes or seed phrases, may ask you to install software that lets them control your device, and urge you to move funds to a "safe" wallet the criminal controls.',
      },
      {
        type: "paragraph",
        children:
          "The analogy has a limit: you can see the stranger in the car park. Online, a caller's number and a profile picture can both be faked, so appearance proves nothing.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'Real support never asks for these. No genuine exchange, wallet company or support agent will ask for your seed phrase, private key, password or two-factor code, ask you to install remote-access software, or tell you to move funds to a new "safe" address. Coinbase, for example, states that it will never call or text you with a new seed phrase or wallet address. If anyone asks for any of these, stop and end the contact.',
      },
      {
        type: "example",
        title: "The helpful reply in Istanbul",
        children:
          'Elif in Istanbul posts that a withdrawal is delayed. Within minutes an account with a company logo replies, "DM us and we\'ll fix it," and sends a link to "verify your wallet" with her recovery words. She ignores it and opens a ticket through the exchange\'s own app. The delay turns out to be routine.',
      },
      {
        type: "paragraph",
        children:
          "Some attackers skip conversation altogether and go straight for your device.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand how malware reaches your devices",
      },
      {
        type: "paragraph",
        children:
          "Think about a parcel at your door that looks like something you ordered. Once you carry it inside, whatever is in it is in your home.",
      },
      {
        type: "paragraph",
        children:
          'Malware arrives the same way: inside "free" copies of paid software, fake updates, email attachments or installers from unofficial sites. In crypto, three kinds matter most. Fake wallet apps steal the keys you create (the wallet and custody lesson in Level 2). Remote-access tools, often legitimate support-desk programs, let a criminal control your screen once you are talked into installing one. And information stealers hunt for wallet files, saved passwords and anything typed or copied.',
      },
      {
        type: "definition",
        term: "Malware",
        children:
          "Software designed to harm you or your device, for example by stealing data, watching what you type or changing what you copy, paste or see.",
      },
      {
        type: "paragraph",
        children:
          "The parcel analogy falls short in one way: a parcel announces itself when opened. Malware is built to stay quiet, and you may notice nothing until funds have gone. That is why the next trick works so well.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch for malicious browser extensions",
      },
      {
        type: "paragraph",
        children:
          "Think of a houseguest you allow into every room. Most guests are honest; a dishonest one can read your post and copy your keys.",
      },
      {
        type: "paragraph",
        children:
          "A browser extension is that guest. Once installed, it can often read and change the pages you visit, including your wallet's, which is one reason the wallet and custody lesson in Level 2 called browser wallets very exposed. Ledger Academy reports that in July 2025 researchers found more than 40 fake wallet extensions in the Firefox add-on store. They copied the branding and descriptions of genuine wallets, carried fake reviews, and harvested private keys and logins once installed.",
      },
      {
        type: "paragraph",
        children:
          "The analogy stops working in one place: a guest who behaves well on day one usually stays that way. An extension can change owner or receive a harmful update later, without you doing anything.",
      },
      {
        type: "paragraph",
        children:
          'So install a wallet extension only from the link on the wallet\'s official website, keep extensions to the few you really use, and be wary of any that want to "read and change all your data on all websites" without a clear reason.',
      },
      {
        type: "paragraph",
        children:
          "An extension waits inside your browser. A drainer link tries to bring you to it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand SIM swaps and why SMS codes are weak",
      },
      {
        type: "paragraph",
        children:
          "Imagine someone persuades the post office that they are you and that you have moved. From that day, your letters, including new bank cards and security codes, go to their address.",
      },
      {
        type: "paragraph",
        children:
          'A SIM swap does this to your phone number. The US Federal Trade Commission explains that a scammer contacts your mobile provider, claims your phone was lost or damaged, and has your number moved to a SIM card they control. Your calls and texts then go to the criminal, and any account that relies on text-message codes or "forgot password" texts can be taken over.',
      },
      {
        type: "definition",
        term: "SIM swap",
        children:
          "A fraud in which a criminal takes control of your phone number by persuading or bribing your mobile provider to move it to a SIM card they hold.",
      },
      {
        type: "paragraph",
        children:
          "In February 2022, the FBI's Internet Crime Complaint Center (IC3) warned that SIM swaps were rising: 320 complaints with about US$12 million in losses from January 2018 to December 2020, then 1,611 complaints with more than US$68 million in losses in 2021 alone.",
      },
      {
        type: "example",
        title: "The silent phone in Melbourne",
        children:
          "Jack in Melbourne loses signal at home, then gets an email about a password change he did not make: two classic warning signs of a SIM swap. He calls his provider from a friend's phone, recovers his number and changes his passwords. His exchange account used an authenticator app, not SMS, so the attacker could not log in.",
      },
      {
        type: "paragraph",
        children:
          "The post-office analogy breaks down at speed: redirected letters take days, while a SIM swap can be used within minutes. The FTC suggests adding a PIN or password to your mobile account. The bigger fix is to stop relying on text messages for security.",
      },
      {
        type: "heading",
        level: 3,
        children: "Choose stronger two factor authentication",
      },
      {
        type: "paragraph",
        children:
          "Two-factor authentication combines different kinds of evidence, such as a password and possession of an authentication device. Its strength depends on the method and the recovery route.",
      },
      {
        type: "comparisonTable",
        columns: ["Method", "Useful property", "Remaining issue"],
        rows: [
          [
            "SMS code",
            "Adds a check beyond a password",
            "Phone-number takeover and phishing can capture it",
          ],
          [
            "Authenticator code",
            "Avoids reliance on the mobile number for the routine code",
            "A fake login page can still capture a code; recovery needs planning",
          ],
          [
            "Correctly implemented passkey or security key",
            "Binds authentication to the genuine service and can resist phishing",
            "Device loss, account recovery and unsafe alternative login routes still matter",
          ],
        ],
      },
      {
        type: "example",
        title: "A silent phone in Melbourne",
        children:
          "Jack loses mobile service and receives an unexpected account-change notice. He contacts his carrier and the service through verified routes using another device. An authenticator or security key can reduce specific takeover risks, but no single setting proves the whole account is safe. Review active sessions and the email or phone recovery chain too.",
      },
      {
        type: "heading",
        level: 3,
        children: "Keep devices clean and holdings private",
      },
      {
        type: "paragraph",
        children:
          "Think of a household that locks its doors, mends broken windows and does not tell strangers where the jewellery is kept. Together, these dull habits make a poor target.",
      },
      {
        type: "paragraph",
        children:
          'Device hygiene means the same steady care for phones and computers. Install updates promptly, since many fix security holes. Download software only from official sources, as Kaspersky advised, and avoid "cracked" software. Use a screen lock, unique passwords and a password manager, and, as the FBI advises, don\'t store login details on your phone. Some people keep one device or browser profile for crypto only. Update hardware-wallet firmware through the official app; Ledger Academy recommends doing so regularly.',
      },
      {
        type: "paragraph",
        children:
          "Privacy matters as much as software. The FBI's SIM-swap warning advises against publicising financial assets on social media or sharing details that help someone impersonate you. Balance screenshots and boasts at meet-ups mark you out. A criminal who believes you hold a lot may try a SIM swap, a targeted message, or even a threat in person.",
      },
      {
        type: "example",
        title: "The quiet holder in Riyadh",
        children:
          "Faisal in Riyadh talks about crypto at work, but only ideas, never amounts. He posts no screenshots, uses a separate email address for crypto accounts, and keeps his hardware wallet and seed-phrase backup in different places. Anyone who learned he owned crypto would not know how much, or where.",
      },
      {
        type: "paragraph",
        children: "These habits reinforce each other. Now practise using them.",
      },
      {
        type: "paragraph",
        children:
          "Authentication apps and SMS have different threat models; phone-number takeover can undermine SMS-based recovery. Record which account can reset which other account so that a single weak recovery path is not overlooked.",
      },
    ],
  },
  {
    title: "Continuity and inheritance without revealing secrets",
    shortTitle: "Continuity and inheritance without revealing secrets",
    blocks: [
      {
        type: "heading",
        level: 3,
        children:
          "Plan for emergencies and inheritance without exposing secrets",
      },
      {
        type: "paragraph",
        children:
          'Think of a sealed envelope left with a family solicitor: "to be opened if I cannot manage my affairs". It tells the right person what exists and where to look, without taping the house keys to the front door.',
      },
      {
        type: "paragraph",
        children:
          "Crypto needs the same planning, because there is no bank that can hand your heirs your balance. Bitcoin.org advises thinking about your testament so that your heirs can find your wallets and recover them. Ledger Academy's guide to crypto inheritance explains that what must pass on is signing authority: the ability to use your keys. It suggests keeping a guide for heirs, a letter of instructions, that says where each device and backup is kept and how recovery works for each network. It also warns that untrained heirs can be tricked into typing a seed phrase into a fake site or downloading a fake app, so naming a trusted person who understands the basics helps.",
      },
      {
        type: "paragraph",
        children:
          "The plan must let the right person in without letting the wrong person in sooner. Describe where things are, rather than writing secrets into documents several people will read. Split information so no single paper reveals everything. List any custodial accounts, since heirs must contact each company. And review it: Ledger suggests checking every six months that devices work and instructions are accurate, and updating after events such as marriage, a birth or a move.",
      },
      {
        type: "example",
        title: "A family plan in Durban",
        children:
          "Thabo in Durban has a hardware wallet and a small exchange balance. His letter of instructions says where the device is, which relative holds the sealed seed-phrase envelope, and that the exchange account should be claimed through the exchange's own process. It contains no words from the phrase. His sister knows his lawyer keeps the letter.",
      },
      {
        type: "paragraph",
        children: "That letter is the heart of a written recovery plan.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write a recovery plan you can actually use",
      },
      {
        type: "paragraph",
        children:
          "A recovery plan is a short offline document that lets you or a trusted person rebuild access calmly. It is a map, not a treasure chest.",
      },
      {
        type: "definition",
        term: "Recovery plan",
        children:
          "A written, offline summary of what crypto you hold, where the backups are, and the steps needed to recover access, designed so that it does not by itself reveal any secret.",
      },
      {
        type: "comparisonTable",
        columns: ["Include", "Never include"],
        rows: [
          [
            "A list of wallets and accounts (type, network, purpose)",
            "The seed phrase or any of its words",
          ],
          [
            "Where each device and backup is kept, and who holds which part",
            "The passphrase, written next to the seed phrase",
          ],
          [
            "Which wallet software or device restores each backup",
            "Passwords or PINs in the same document as backups",
          ],
          [
            "Whether a passphrase or multisig is used, and how many keys are needed",
            "Screenshots or photos of anything secret",
          ],
          [
            "Contacts: trusted person, lawyer, exchanges to notify",
            'Instructions to "send the phrase to support"',
          ],
          [
            "Date of the last test restore and next review date",
            "Exact balances, if the paper might be seen by others",
          ],
        ],
        caption: "What a recovery plan contains, and what it never contains",
      },
      {
        type: "paragraph",
        children:
          "Keep one copy where you can reach it and one with your trusted person or lawyer. Now try putting these ideas to work.",
      },
      {
        type: "paragraph",
        children:
          "It should not expose secrets in an ordinary will, shared course file or broadly accessible family message. Legal arrangements and local inheritance requirements may also matter. A plan that has never been checked may depend on forgotten passwords or obsolete software.",
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
          "A spare key with an extra code. Mei in Australia has a hypothetical safe that requires both a physical key and a code. Keeping the key but losing the code does not open the safe. Writing both on a public notice board defeats the protection. Some recovery schemes similarly need more than one component. Mei's course plan uses labels such as offline backup A and additional secret B, never actual values. The analogy illustrates dependency; wallet passphrases and recovery procedures must still follow the product's precise documentation.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Use placeholders in exercises. Never upload recovery words, private keys or real backup codes.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Why might changing a local password fail to protect a wallet after phrase exposure?",
          "2. Design a backup plan using placeholders for one device-loss event and one physical-damage event.",
          "3. Name a weak recovery chain involving email and a phone number.",
        ],
        answers: [
          "1. An attacker may recreate the signing authority outside that application. The copied phrase remains usable under its scheme.",
          "2. A suitable fictional plan specifies verified recovery instructions and protected independent backup locations, with a check that the necessary components survive both events. It must avoid publishing the secrets.",
          "3. An exchange resets through email, email resets through SMS, and the phone number is taken over. Securing only the exchange password leaves the recovery chain vulnerable.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Do all wallets use a recovery phrase with the same restoration steps?",
        ],
        answers: [
          "Answer. No. Wallets may use different key, guardian, threshold or service-assisted schemes. Apply the actual documented method.",
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
          "Different secrets protect different layers.",
          "A backup must remain confidential and usable.",
          "Secure account recovery paths as well as ordinary login.",
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
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "MetaMask: I have been hacked or scammed",
            url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
          },
          {
            title:
              "Bitcoin community: Bitcoin A Peer to Peer Electronic Cash System",
            url: "https://bitcoin.org/bitcoin.pdf",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Bitcoin Developer Guide: Bitcoin Developer Guide — Wallets",
            url: "https://developer.bitcoin.org/devguide/wallets.html",
          },
          {
            title:
              "Bitcoin Improvement Proposals: Bitcoin Improvement Proposals — BIP-39: Mnemonic code for generating deterministic keys",
            url: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
          },
          {
            title: "Bitcoin community: Bitcoin FAQ",
            url: "https://bitcoin.org/en/faq",
          },
          {
            title: "Bitcoin.org: Bitcoin.org — Securing your wallet",
            url: "https://bitcoin.org/en/secure-your-wallet",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
            url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
          },
          {
            title:
              "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
            url: "https://www.ic3.gov/PSA/2022/PSA220208",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
            url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
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
  course: "wallets-and-security",
  description:
    "Verify the asset, network, recipient and total cost using a repeatable checklist.",
  estimatedMinutes: 13,
  learningPath: "crypto",
  level: "level-2",
  module: "wallet-and-personal-security",
  objectives: [
    "Verify the asset, network, recipient and total cost using a repeatable checklist.",
  ],
  position: 3,
  prerequisites: ["protect-recovery-material-and-accounts"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "protect-recovery-material-and-accounts",
    "connections-signatures-and-token-permissions",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Verify the asset, network, recipient and total cost using a repeatable checklist.",
  seoTitle: "Check a Transfer Before You Send",
  slug: "check-a-crypto-transfer",
  sources: [
    {
      title: "Kraken: How to deposit cryptocurrencies to your Kraken account",
      url: "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
    },
    {
      title: "Ethereum: How to bridge tokens to layer 2",
      url: "https://ethereum.org/guides/how-to-use-a-bridge/",
    },
    {
      title: "Ethereum: Transactions",
      url: "https://ethereum.org/developers/docs/transactions/",
    },
    {
      title: "Bitcoin community: Bitcoin Developer Guide Transactions",
      url: "https://developer.bitcoin.org/devguide/transactions.html",
    },
    {
      title: "Ethereum: Token standards",
      url: "https://ethereum.org/developers/docs/standards/tokens/",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
      url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
    },
    {
      title:
        "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
      url: "https://www.ic3.gov/PSA/2022/PSA220208",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
      url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
    },
    {
      title:
        "FBI IC3: FBI IC3 — North Korea responsible for US$1.5 billion Bybit hack (26 February 2025)",
      url: "https://www.ic3.gov/PSA/2025/PSA250226",
    },
    {
      title: "Ledger Academy: Ledger Academy — What is blind signing?",
      url: "https://www.ledger.com/academy/cryptos-greatest-weakness-blind-signing-explained",
    },
    {
      title:
        "Trezor: Trezor — Trezor's Trusted Display: verify every address on your device",
      url: "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
    },
  ],
  status: "published",
  title: "Check a Transfer Before You Send",
};
const sections3: LessonSection[] = [
  {
    title: "Identify the asset and the full destination",
    shortTitle: "Identify the asset and the full destination",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Verify the asset, network, recipient and total cost using a repeatable checklist.",
      },
      {
        type: "paragraph",
        children:
          "A transfer check is a sequence, not a quick glance at the ticker. The same symbol can refer to different tokens, and a familiar address format can appear on different networks. We will build a transfer worksheet that makes those differences visible before any signing. The practice stays fictional, so a wrong answer costs time rather than money.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Check both sides of the route before signing, then distinguish confirmation from account credit.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "Begin with the intended asset and network. For a token, check the contract identity using independently verified project and recipient information. Symbols and logos can be copied. Two tokens called USDX may have unrelated issuers, contracts and redemption rights. Decimal settings affect how raw units are displayed, but do not prove that the asset is genuine.",
      },
      {
        type: "paragraph",
        children:
          "Distinguish a native asset from a wrapped or bridged representation. Sending a representation when the recipient supports only the native version may not produce the expected credit. Read the receiving service's current deposit instructions for the exact asset and route. An explorer showing that a token exists is not sufficient proof that a provider accepts it. Record the asset identity and the source used to verify it.",
      },
      {
        type: "paragraph",
        children:
          "Think about posting a letter through a postbox slot. Until it leaves your hand, you can still fix the address. Once it drops, you cannot reach in to get it back.",
      },
      {
        type: "paragraph",
        children:
          "Imagine paying a builder by bank transfer and checking only the first two and last two digits of the account number. A fraudster with a fake invoice needs to match only those four.",
      },
      {
        type: "example",
        title: "The supplier in Berlin",
        children:
          "Lena runs a small online shop in Berlin and pays a regular supplier in crypto. The supplier's address in her transaction history looks right at both ends. Out of habit, she uses her saved, labelled entry instead and compares the two. The middle characters differ: the history entry was a poisoned look-alike.",
      },
      {
        type: "heading",
        level: 3,
        children: "Catch clipboard hijackers before you paste",
      },
      {
        type: "paragraph",
        children:
          "Picture a postal worker who quietly rewrites the delivery address on every envelope you hand over. Your letter is sent, but not to the person you meant.",
      },
      {
        type: "paragraph",
        children:
          "A clipboard hijacker, or clipper, does this to crypto addresses. Addresses are long, so almost everyone copies and pastes them. The malware watches your clipboard, recognises an address and swaps it for the attacker's own between copy and paste.",
      },
      {
        type: "definition",
        term: "Clipboard hijacker",
        children:
          "Malware that watches what you copy and replaces any crypto address with the attacker's own, so a pasted address no longer matches the one you copied.",
      },
      {
        type: "paragraph",
        children:
          "In March 2023, the security firm Kaspersky reported a clipper hidden inside fake Tor Browser installers downloaded from unofficial sites. It had affected more than 15,000 users in 52 countries, and Kaspersky estimated about US$400,000 had been stolen. The researchers noted that such malware can stay silent for years, with no network activity, until an address appears on the clipboard.",
      },
      {
        type: "example",
        title: "The changed address in Shanghai",
        children:
          "Chen in Shanghai copies a friend's address to pay back ¥500 of crypto (an amount invented for this example). After pasting, he checks the first and last characters, then reads the middle too. The middle no longer matches. He cancels, scans his computer and sends nothing until the cause is found.",
      },
      {
        type: "paragraph",
        children:
          "The defence is to compare the full pasted address with the original, and the transfer checking lesson in Level 2 turns that into a routine. Clippers need malware on your device. The next trick needs only a public blockchain.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how address poisoning plants a look alike",
      },
      {
        type: "paragraph",
        children:
          "Imagine someone slips a fake card into your contacts book. It names your plumber, and its number starts and ends with the same digits as the real one. Next time you call in a hurry, you may dial the wrong one.",
      },
      {
        type: "paragraph",
        children:
          'Address poisoning works the same way. Attackers watch the blockchain for wallets that often send to the same address. They generate new addresses by computer until one starts and ends with the same characters as the real one. Then they send your wallet a tiny or zero-value transfer from that look-alike; Ledger Academy notes that a zero-value transfer leaves a record without moving real tokens. Next time you copy "the usual address" from your history, you may copy the attacker\'s.',
      },
      {
        type: "definition",
        term: "Address poisoning",
        children:
          "A scam in which an attacker places a look-alike address in your transaction history, hoping you will later copy it by mistake and send funds to them.",
      },
      {
        type: "paragraph",
        children:
          'Chainalysis studied one campaign that ran from 28 February to 4 May 2024. It seeded about 82,031 look-alike addresses, and 2,774 victim addresses sent a combined total of about US$69.7 million to them. One victim alone sent about US$68 million, which was later returned. The real and fake addresses in that case shared the same first six characters, "0xd9A1", and differed further along.',
      },
      {
        type: "paragraph",
        children:
          "Why match only the start and end? Because each extra matching character multiplies the computing work.",
      },
      {
        type: "formula",
        expression: "Average attempts to match n characters ≈ 16ⁿ",
        explanation:
          'each character in an Ethereum-style address (after the "0x") is one of 16 symbols, 0–9 and a–f (capital and small letters count as the same symbol). Matching four characters takes about 16⁴ = 65,536 tries on average; matching eight, about 16⁸ ≈ 4.3 billion. Computers manage short matches quickly, so checking only the ends is not enough.',
      },
      {
        type: "paragraph",
        children:
          "Address poisoning plays on habit. The next danger lives inside your browser.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-3-rId26.png",
        width: 1980,
        height: 1288,
        alt: "Illustrative strings, not receiving instructions. Short matching prefixes and suffixes do not establish the intended recipient.",
        caption:
          "Illustrative strings, not receiving instructions. Short matching prefixes and suffixes do not establish the intended recipient.",
      },
    ],
  },
  {
    title: "Use the supported network",
    shortTitle: "Use the supported network",
    blocks: [
      {
        type: "paragraph",
        children:
          'Picture a parcel addressed correctly to "12 King Street", but sent to the King Street in the wrong city. The house number is fine; the city is wrong, and the parcel never arrives.',
      },
      {
        type: "paragraph",
        children:
          'In crypto, the "city" is the network, or chain. The wallet and custody lesson in Level 2 explained that the same token can exist on several networks, as separate balances. When you send, you choose which network carries the transfer, and the receiver must support that same network for that token. Kraken\'s deposit guide warns that some cryptocurrencies can be sent on several networks, and that using one it does not support can mean lost funds.',
      },
      {
        type: "definition",
        term: "Network (in a transfer)",
        children:
          "The blockchain that carries a particular transfer. Sender and receiver must use the same one for the same token, even when the token's name and logo look identical elsewhere.",
      },
      {
        type: "paragraph",
        children:
          'The trap is that many networks use addresses that look alike. An address beginning "0x" can be valid on several networks that work like Ethereum, so your wallet may accept it even though the receiver will never see funds sent there. Some providers offer limited help: Coinbase\'s help centre describes a paid recovery service for certain assets and networks only, and accepts no liability for losses. Do not count on rescue.',
      },
      {
        type: "comparisonTable",
        columns: [
          "Check",
          "Where to find it",
          "What goes wrong if it doesn't match",
        ],
        rows: [
          [
            "Asset",
            "The receiver's deposit or receive page",
            "Funds may not be credited, or may be lost",
          ],
          [
            "Network",
            "The network named on the receiver's page",
            "Funds arrive on a chain the receiver does not watch",
          ],
          [
            "Address",
            "Copied from the receiver, confirmed on your device",
            "Funds go to someone else",
          ],
          [
            "Memo or tag (if asked for)",
            "The receiver's deposit page",
            "Funds reach a shared address but no individual account",
          ],
        ],
        caption: "What to match before you send",
      },
      {
        type: "example",
        title: "The two networks in Guadalajara",
        children:
          "Andrés in Guadalajara wants to send MX$1,000 worth of a dollar-pegged token (an amount invented for this example; these \"stablecoins\" are covered in Level 3) to his cousin's exchange account. His wallet offers two networks; the cousin's deposit page lists only one. Andrés picks that one, even though the other is cheaper, because a cheap transfer on an unsupported network can be a total loss.",
      },
      {
        type: "paragraph",
        children:
          "Moving tokens between networks needs special tools with their own risks, covered in Level 4. Some networks also add one more field to fill in.",
      },
      {
        type: "paragraph",
        children:
          "Similar address formats do not mean that ledgers are interchangeable. A receiving service may display an address for one supported network while not monitoring the same format on another. Do not choose a cheaper route merely because the address looks compatible. Some mistaken transfers can be recoverable under particular circumstances, but recovery may be unavailable, delayed or expensive. A beginner should not base the original decision on that possibility. The safe procedure is to establish support before sending, using current instructions rather than a screenshot from an old tutorial.",
      },
    ],
  },
  {
    title: "Memos, minimums and recipient credit",
    shortTitle: "Memos minimums and recipient credit",
    blocks: [
      {
        type: "paragraph",
        children:
          "Think of an office block with one street address and hundreds of tenants. Post with only the street address reaches the building, but the mailroom cannot tell which tenant it is for.",
      },
      {
        type: "paragraph",
        children:
          "Some exchanges work the same way on certain networks. They use one shared deposit address for many customers and tell them apart with an extra number or note, called a memo or destination tag. Kraken's XRP guide explains that the destination tag decides which account is credited, and warns that leaving it out leads to significant delays and can, in some cases, make a deposit impossible to retrieve. Its deposit guide lists other assets that need a tag or memo, such as XLM and STX, and reminds users to check that the tag or memo is included when scanning a QR code.",
      },
      {
        type: "definition",
        term: "Memo or destination tag",
        children:
          "An extra field, sent with a transfer on certain networks, that tells a receiving service which customer the funds belong to when many customers share one address.",
      },
      {
        type: "paragraph",
        children:
          "The analogy has a limit. A mailroom can often trace a parcel without a flat number. A missing tag may need a manual support claim, which can be slow and is not always successful.",
      },
      {
        type: "example",
        title: "The missing number in Seoul",
        children:
          "Min-jun in Seoul moves ₩300,000 of a token from one exchange to another (an amount invented for this example). The receiving page shows an address and, in a separate box, a destination tag. He copies and checks both. Without the tag, the funds would have reached the shared address with nothing to show they were his.",
      },
      {
        type: "paragraph",
        children:
          "If the receiving page asks for a memo or tag, it is mandatory; if it does not, leave the field empty. The next check costs a little money and can save a lot.",
      },
      {
        type: "paragraph",
        children:
          "Follow the recipient's exact instructions rather than assuming every asset uses the same fields. A small test below a minimum may not be credited, which makes it a poor test of the intended process. A network fee and a minimum deposit are different constraints and should appear separately in the worksheet.",
      },
    ],
  },
  {
    title: "Inspect the transfer, test it and check again",
    shortTitle: "Inspect the transfer, test it and check again",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Inspect the device amount and fee",
      },
      {
        type: "paragraph",
        children:
          "Obtain the destination through the intended recipient's verified route. Check the full address where practical, not just a few matching characters, and beware of copied addresses from unsolicited transaction history. Confirm the amount, unit, decimal point and whether the wallet displays a fee-inclusive or fee-exclusive amount. Clipboard malware can replace a copied destination, so inspect the final signing request.",
      },
      {
        type: "paragraph",
        children:
          "Some networks require a native asset to pay transaction fees even when the transferred item is a token. Holding the token alone may be insufficient to send it. Fee estimates can change, and a failed or cancelled attempt may still incur costs depending on the network and stage. Never send extra fee funds to an address suspected of key compromise simply to make a transfer possible; the incident-response lesson addresses that special risk.",
      },
      {
        type: "paragraph",
        children:
          "Think of a cash machine whose screen a criminal has covered with a fake overlay. You would want a second display you knew nobody could tamper with.",
      },
      {
        type: "paragraph",
        children:
          "Think of the final screen when you book a flight. You check the total, not only the fare, because charges are added at the end.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a waiter handing you a card machine with the amount already typed in. You read the number before entering your PIN. Approving a crypto transaction is the same moment.",
      },
      {
        type: "heading",
        level: 3,
        children: "A valid test and a fresh check of the final transfer",
      },
      {
        type: "paragraph",
        children:
          "A small test can help verify that the selected route is currently usable, provided it meets the recipient's rules. Wait for the expected credit and compare the asset and account. A successful test does not certify a larger transfer: the next address, network, memo or amount may differ, and a malicious interface may change details between attempts.",
      },
      {
        type: "paragraph",
        children:
          "Before the larger action, repeat the checks from the beginning. After sending, record the transaction ID, network status and receiving-service credit status separately. Do not repeat a transfer simply because a balance display is slow. First determine whether the first transfer is pending, confirmed or awaiting provider processing. An irreversible duplicate payment can be worse than a short delay.",
      },
      {
        type: "heading",
        level: 3,
        children: "Send a test transaction first",
      },
      {
        type: "paragraph",
        children:
          "A small test transfer is a check of a particular route at a particular time. It must use the intended asset, supported network, verified address and required memo, and meet any recipient minimum. Wait for the expected credit before concluding that the route worked.",
      },
      {
        type: "paragraph",
        children:
          "The next transfer remains a new authorisation. Repeat the checks, including the complete destination and final device display. A malicious interface can behave differently for a larger amount, and fees or service limits can change. Do not describe a test as insurance.",
      },
      {
        type: "example",
        title: "An extra fee in Rome",
        children:
          "For a hypothetical €3,000 transfer, Giulia calculates an extra €1.50 network fee for the test: 0.05% of the planned amount. The test amount itself is part of the intended delivery only if it is credited as expected. Different assets, fee conventions or minimums can change the calculation.",
      },
      {
        type: "paragraph",
        children:
          "Think of a train guard who spots an open door as the train is about to leave. The rule is to stop first, then work out why.",
      },
      {
        type: "example",
        title: "The changed details in Johannesburg",
        children:
          "Sipho in Johannesburg is paying R2,000 of crypto for a used laptop (an amount invented for this example). On his hardware wallet, the address ends differently from the seller's message. He rejects the transaction, phones the seller on the number from the original advert, and discovers his computer's clipboard is being changed. He cleans the computer before sending anything.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-3-rId27.png",
        width: 1187,
        height: 611,
        alt: "Use the entire checklist. A matching address format or successful earlier test is insufficient by itself.",
        caption:
          "Use the entire checklist. A matching address format or successful earlier test is insufficient by itself.",
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
          "A bank transfer with the wrong reference. Daniel in Canada pays CAD 200 to a shared bill-collection account. The correct reference tells the service which customer's bill to credit. Crypto deposit memos can perform a similar accounting role for particular assets or services. In the fictional exercise the receiving service requires a memo and a minimum of 10 units. A 2-unit test with no memo does not establish that the route is unusable; it fails the published requirements. Daniel must first design a valid test and verify both network confirmation and service credit.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Do not rely on visual address similarity or an assumed recovery service for an unsupported route.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. The sender selects Network S but the recipient supports only R. Should you proceed if the address format matches?",
          "2. A fictional recipient requires at least 10 units per deposit. Why is a 2-unit test unsuitable?",
          "3. After a successful test, which details must be checked again?",
        ],
        answers: [
          "1. No. Address format does not establish network support. Obtain a supported route before proceeding.",
          "2. It is below the supplied 10-unit minimum and cannot reliably test automatic crediting.",
          "3. Exact asset and contract, network, recipient address, memo, amount, decimals, fees and current service requirements.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does on-chain confirmation always mean an exchange account has been credited?",
        ],
        answers: [
          "Answer. No. The service must recognise the supported route, identify the account and apply its current crediting policy.",
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
          "Asset identity includes network and relevant contract.",
          "Deposit instructions can include account references and minimums.",
          "A successful test does not replace checking the next action.",
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
              "Kraken: How to deposit cryptocurrencies to your Kraken account",
            url: "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
          },
          {
            title: "Ethereum: How to bridge tokens to layer 2",
            url: "https://ethereum.org/guides/how-to-use-a-bridge/",
          },
          {
            title: "Ethereum: Transactions",
            url: "https://ethereum.org/developers/docs/transactions/",
          },
          {
            title: "Bitcoin community: Bitcoin Developer Guide Transactions",
            url: "https://developer.bitcoin.org/devguide/transactions.html",
          },
          {
            title: "Ethereum: Token standards",
            url: "https://ethereum.org/developers/docs/standards/tokens/",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
            url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
          },
          {
            title:
              "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
            url: "https://www.ic3.gov/PSA/2022/PSA220208",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
            url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
          },
          {
            title:
              "FBI IC3: FBI IC3 — North Korea responsible for US$1.5 billion Bybit hack (26 February 2025)",
            url: "https://www.ic3.gov/PSA/2025/PSA250226",
          },
          {
            title: "Ledger Academy: Ledger Academy — What is blind signing?",
            url: "https://www.ledger.com/academy/cryptos-greatest-weakness-blind-signing-explained",
          },
          {
            title:
              "Trezor: Trezor — Trezor's Trusted Display: verify every address on your device",
            url: "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
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
  course: "wallets-and-security",
  description:
    "Identify the authority granted by a wallet request before accepting it.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-2",
  module: "wallet-and-personal-security",
  objectives: [
    "Identify the authority granted by a wallet request before accepting it.",
  ],
  position: 4,
  prerequisites: ["check-a-crypto-transfer"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "check-a-crypto-transfer",
    "respond-to-a-crypto-compromise",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Identify the authority granted by a wallet request before accepting it.",
  seoTitle: "Connections, Signatures and Token Permissions",
  slug: "connections-signatures-and-token-permissions",
  sources: [
    {
      title: "MetaMask: What is a token approval",
      url: "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
    },
    {
      title: "MetaMask: Disconnect wallet from a dapp",
      url: "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
    },
    {
      title: "MetaMask: I have been hacked or scammed",
      url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
    },
    {
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
      url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
    },
    {
      title:
        "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
      url: "https://www.ic3.gov/PSA/2022/PSA220208",
    },
    {
      title:
        "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
      url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
    },
    {
      title:
        "FBI IC3: FBI IC3 — North Korea responsible for US$1.5 billion Bybit hack (26 February 2025)",
      url: "https://www.ic3.gov/PSA/2025/PSA250226",
    },
    {
      title: "Ledger Academy: Ledger Academy — What is blind signing?",
      url: "https://www.ledger.com/academy/cryptos-greatest-weakness-blind-signing-explained",
    },
    {
      title:
        "Trezor: Trezor — Trezor's Trusted Display: verify every address on your device",
      url: "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
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
  title: "Connections, Signatures and Token Permissions",
};
const sections4: LessonSection[] = [
  {
    title: "Connections, signatures and token allowances",
    shortTitle: "Connections, signatures and token allowances",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Connection, message, transaction and approval",
      },
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Identify the authority granted by a wallet request before accepting it.",
      },
      {
        type: "paragraph",
        children:
          "Connecting a wallet is not the same as granting spending permission. Signing a message is not always harmless, and disconnecting a website does not necessarily remove an existing allowance. This lesson separates the actions that interfaces often place close together, then shows how to review permissions without confusing a tidy browser session with secure on-chain authority.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "The most useful question is what another party can do after this approval.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "Connecting commonly lets a site see a selected public account and request further interactions. A message signature authorises or attests to specific data; its practical effect depends on the message and protocol. A signed transaction asks the network to perform an action. A token approval can give a specified spender permission to transfer an asset under the token contract's rules.",
      },
      {
        type: "paragraph",
        children:
          "The interface may describe all four with a simple approve button, so read the underlying request. Connecting alone commonly does not transfer assets, but it can expose an address and invite deceptive prompts. A signature may be used to submit an order or permission later. A transaction can call several contracts, so its effect may be broader than a basic payment. Your task is to identify the authority being granted, rather than judging risk by the button's colour.",
      },
      {
        type: "heading",
        level: 3,
        children: "Token allowances and their scope",
      },
      {
        type: "paragraph",
        children:
          "For an approval, identify the owner account, token, spender and permitted amount. The spender is often a contract, not the website's display name. An unlimited or very large allowance can remain after one intended swap. If the spender is malicious or later compromised, the unused authority may matter. Some permission schemes also specify deadlines or other limits; others persist until changed.",
      },
      {
        type: "paragraph",
        children:
          "An approval does not by itself guarantee an immediate transfer, but it establishes authority that may enable one. Reducing the allowance to the amount needed can limit one type of exposure where the product supports it. It does not certify the underlying transaction or contract as safe. Read the exact action and current implementation, including whether a separate signature-based permission mechanism is involved.",
      },
      {
        type: "paragraph",
        children:
          "Think about a direct debit with a gym. Instead of paying each month, you give the gym permission to take payments. If the gym is honest, that is convenient. If its systems are hacked, or it turns dishonest, the same permission lets money leave without you pressing anything.",
      },
      {
        type: "example",
        title: "A limit instead of a blank cheque",
        children:
          "Hyun-woo in Busan wants to swap 200 units of a stablecoin, and the app suggests an unlimited approval. He edits the amount in his wallet to 200, approves and swaps. The swap uses up the allowance, so the contract cannot touch his other stablecoins later. (The amounts are invented for this example.)",
      },
    ],
  },
  {
    title: "Permit signatures and other delayed authority",
    shortTitle: "Permit signatures and other delayed authority",
    blocks: [
      {
        type: "paragraph",
        children:
          "Imagine signing a permission form at home and posting it to someone. Your bank has no record of it until that person hands it in.",
      },
      {
        type: "paragraph",
        children:
          "Some tokens support a feature called permit, defined in EIP-2612. Instead of sending an approve transaction, you sign an approval message off the blockchain, for free. The app submits your signature with its own transaction, and at that moment the approval takes effect. Used honestly, this saves a separate fee and makes limited approvals more practical.",
      },
      {
        type: "paragraph",
        children:
          "The risk is that a permit request can look like a harmless log-in. revoke.cash points out that wallets often warn clearly about on-chain approvals but less clearly, or not at all, about signature requests. A scam site can ask for a permit for all your tokens, then submit it at once and drain them. Because the signature stays off-chain until used, approval checkers cannot see it in advance, and cancelling it means beating the scammer with an on-chain transaction.",
      },
      {
        type: "definition",
        term: "Permit signature",
        children:
          "An off-chain signed message that, when someone submits it, creates a token approval without you sending the approval transaction yourself.",
      },
      {
        type: "example",
        title: 'The "free claim" that wasn\'t',
        children:
          'Valentina in Córdoba, Argentina, clicks a link promising a free token claim. Her wallet asks her to sign a message with the fields "spender", "value" and "deadline", which the site says is "only to verify". Valentina recognises the words of an approval and rejects it. A real log-in message would not name a spender or a value.',
      },
      {
        type: "paragraph",
        children:
          "If a signature request names a spender, an amount or a deadline, it is a permission, not a greeting. Now put fees and permissions together in practice.",
      },
      {
        type: "paragraph",
        children:
          'Imagine a stranger at a festival offering free drinks if you sign a "guest list" that is really a form handing over your bank card.',
      },
      {
        type: "paragraph",
        children:
          'A wallet drainer works like that form. Chainalysis describes drainers as phishing tools posing as genuine crypto projects, often with "free token" offers promoted through chat communities and hacked social media accounts. Victims connect their wallet and approve a request that hands the operator control of their funds. Chainalysis gives the example of a drainer imitating a well-known marketplace that had taken about US$500,000 in more than 1,000 malicious transactions by April 2024.',
      },
      {
        type: "definition",
        term: "Wallet drainer",
        children:
          "A malicious website or script that persuades you to connect your wallet and sign a request which lets the attacker move your funds.",
      },
      {
        type: "paragraph",
        children:
          "The festival analogy has a limit. A paper form can be torn up later. A signed blockchain request can act at once, cannot generally be reversed once confirmed, and some kinds stay active after you leave the site. Reviewing and revoking permissions is the next part of this lesson. Level 4 builds on these foundations when you study smart contracts.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'Free offers that ask for a signature. Treat any link promising free tokens, sure-thing rewards or urgent "claims" as a likely drainer, especially if it arrives by direct message or a sudden post from an account you follow. Don\'t connect a wallet holding real savings to a site you have not checked. Chainalysis suggests keeping valuable or large amounts in an offline wallet and moving funds to a hot wallet only when needed; a separate wallet with little in it is a sensible habit for unfamiliar sites.',
      },
      {
        type: "paragraph",
        children:
          "Next, separate leaving a website from cancelling the authority you granted.",
      },
      {
        type: "paragraph",
        children:
          "However, a signed message can authorise a valuable action that another party submits later, such as an order or token permission. If the wallet cannot decode a request clearly, do not infer that it is safe because the site looks familiar. Check the domain independently, identify the intended action and decline anything you cannot explain. Do not sign a request merely to prove eligibility for a reward. A promotion is not a reason to grant unexplained authority over a wallet.",
      },
    ],
  },
  {
    title: "Disconnection, revocation and permission review",
    shortTitle: "Disconnection, revocation and permission review",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Disconnection is different from revocation",
      },
      {
        type: "paragraph",
        children:
          "Disconnecting usually removes a site's current connection to the wallet interface. It may stop routine account sharing and new requests through that connection. It does not generally modify an existing token allowance recorded on-chain. Revocation changes that allowance through an appropriate authorised action and may require a network fee. These are different operations.",
      },
      {
        type: "paragraph",
        children:
          "Closing a browser tab has similar limits. The ledger is not changed just because a local window disappears. Some signatures or protocol permissions need their own cancellation process, and not every authority can be neutralised through a generic allowance tool. Keep a record of significant permissions and review their actual scope using verified sources. A clean list of connected sites is not proof that no spender retains authority.",
      },
      {
        type: "example",
        title: "A clean-up in Cape Town",
        children:
          "Thabo in Cape Town checks his address on an approval checker and finds six approvals, two of them unlimited for apps he no longer uses. He revokes those two. Each revoke uses about 46,000 gas at a base fee of 18 gwei plus a 2 gwei tip (invented figures for this example), so each costs 46,000 × 20 = 920,000 gwei, or 0.00092 ETH.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-4-rId28.png",
        width: 1187,
        height: 583,
        alt: "Connection and spending authority are separate. Revocation must match the actual permission mechanism.",
        caption:
          "Connection and spending authority are separate. Revocation must match the actual permission mechanism.",
      },
      {
        type: "heading",
        level: 3,
        children: "Review permissions and understand the limit",
      },
      {
        type: "paragraph",
        children:
          "Reach permission-review tools through independently verified routes, and inspect the network and account being reviewed. A fake revocation site can ask for new harmful permissions. Read the transaction before approving it, and check the resulting status. If the problem is a copied key or recovery phrase, revoking one allowance is inadequate because the attacker still has broader signing authority.",
      },
      {
        type: "paragraph",
        children:
          "Permission review is therefore part of a wider diagnosis. Ask whether the issue is an unwanted spender, an exposed secret or a compromised service login. The next lesson uses that diagnosis to select a response. A precaution that works for one category must not create false reassurance about another. No exercise here requires connecting a funded wallet or visiting an unfamiliar revocation service.",
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
          "A shopping account and a direct debit. Sofia in Spain disconnects a shopping application from her phone. That does not necessarily cancel a bank direct debit previously authorised through a separate process. The analogy helps explain why disconnecting a wallet interface differs from changing a token allowance. In a fictional wallet, Sofia granted Contract B permission to spend 500 practice units. Closing the site leaves that permission in place. She must inspect the actual permission and use its verified revocation procedure, rather than assuming the missing browser connection has changed the ledger.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Do not use a funded wallet for permission-review practice or sign an unexplained fee-free message.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Contract B has a 500-unit allowance. You close its website. What allowance should you assume remains until verified otherwise?",
          "2. Why can a message signature be important even with no gas charge?",
          "3. When is moving to independent secure signing authority more relevant than revoking one spender?",
        ],
        answers: [
          "1. The 500-unit allowance can remain. Closing or disconnecting the site does not generally change it.",
          "2. The message may be used later to authorise an order or permission. No immediate network fee does not mean no economic effect.",
          "3. When the private key or recovery material is exposed. The attacker may create new permissions or direct transfers using that authority.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does revoking a token allowance make a copied private key safe again?",
        ],
        answers: [
          "Answer. No. Revocation changes a specific permission; it does not erase the attacker's copy of signing authority.",
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
          "Name the action and authority before approving.",
          "Check spender and amount rather than display name alone.",
          "Disconnection and revocation are different operations.",
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
            title: "MetaMask: What is a token approval",
            url: "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
          },
          {
            title: "MetaMask: Disconnect wallet from a dapp",
            url: "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
          },
          {
            title: "MetaMask: I have been hacked or scammed",
            url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — SIM swap scams: how to protect yourself",
            url: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
          },
          {
            title:
              "FBI IC3: FBI IC3 — Criminals increasing SIM swap schemes to steal millions of dollars from US public (8 February 2022)",
            url: "https://www.ic3.gov/PSA/2022/PSA220208",
          },
          {
            title:
              "Ledger Academy: Ledger Academy — What are address poisoning attacks in crypto and how to avoid them?",
            url: "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
          },
          {
            title:
              "FBI IC3: FBI IC3 — North Korea responsible for US$1.5 billion Bybit hack (26 February 2025)",
            url: "https://www.ic3.gov/PSA/2025/PSA250226",
          },
          {
            title: "Ledger Academy: Ledger Academy — What is blind signing?",
            url: "https://www.ledger.com/academy/cryptos-greatest-weakness-blind-signing-explained",
          },
          {
            title:
              "Trezor: Trezor — Trezor's Trusted Display: verify every address on your device",
            url: "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
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

const metadata5: LessonMetadata = {
  affiliateDisclosureRequired: false,
  approved: true,
  author: "PipStart Curriculum Team",
  course: "wallets-and-security",
  description:
    "Choose a response that addresses the failure rather than adding more exposure.",
  estimatedMinutes: 7,
  learningPath: "crypto",
  level: "level-2",
  module: "wallet-and-personal-security",
  objectives: [
    "Choose a response that addresses the failure rather than adding more exposure.",
  ],
  position: 5,
  prerequisites: ["connections-signatures-and-token-permissions"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["connections-signatures-and-token-permissions"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Choose a response that addresses the failure rather than adding more exposure.",
  seoTitle: "Respond to a Suspected Compromise",
  slug: "respond-to-a-crypto-compromise",
  sources: [
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
      title: "Ethereum: Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
  ],
  status: "published",
  title: "Respond to a Suspected Compromise",
};
const sections5: LessonSection[] = [
  {
    title: "Diagnose the exposure and secure independent authority",
    shortTitle: "Diagnose the exposure and secure independent authority",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Pause and identify the exposed authority",
      },
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Choose a response that addresses the failure rather than adding more exposure.",
      },
      {
        type: "paragraph",
        children:
          "A suspected compromise is stressful, and the wrong hurried action can add to the loss. Begin by identifying what may have been exposed: a signing secret, a permission or a custodial account. These cases can overlap, but they do not have identical remedies. This lesson is a response framework and explains when a generic instruction such as change your password is insufficient.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Choose the response from the failure mechanism, and state what the response cannot fix.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "Stop interacting with the suspicious site or requester. Preserve useful non-secret evidence, including the message, time, network, transaction IDs and the action you remember approving. Do not post recovery words or full private account information in a public help request. Use a clean trusted route to verified documentation and support.",
      },
      {
        type: "paragraph",
        children:
          "Ask three diagnostic questions. Was signing material revealed or entered into an untrusted place? Was an unwanted contract permission or signature granted? Was a provider login, email or authentication route compromised? If uncertain, state that uncertainty and consider whether broader authority may be exposed. An unexpected transfer can be caused by different mechanisms; a transaction ID alone does not always reveal the original cause. Diagnosis helps avoid applying a narrow remedy to a wider problem.",
      },
      {
        type: "example",
        title: "Three incidents that look similar",
        children:
          "A learner in Cape Town notices an unexpected token transfer. In one scenario, the recovery phrase was entered into a fake support form. In another, the learner approved a malicious spender. In a third, someone used an exchange login to request a withdrawal. Each can look like money disappeared, but the exposed authority differs. A local password reset cannot repair the first; closing the website cannot cancel the second; and a personal wallet setting cannot secure the third provider's account.",
      },
      {
        type: "paragraph",
        children:
          "Write a short incident timeline before changing unrelated settings. Record what was clicked or signed, what device was used, which account and network were involved, and what remains uncertain. Do not wait for perfect certainty before ending contact with the suspicious requester. The timeline helps genuine support understand the situation without receiving secrets.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-2/lesson-5-rId29.png",
        width: 1187,
        height: 611,
        alt: "Diagnosis guides the response. Suspected sweepers make blindly adding fee funds unsafe; recovery is not guaranteed.",
        caption:
          "Diagnosis guides the response. Suspected sweepers make blindly adding fee funds unsafe; recovery is not guaranteed.",
      },
      {
        type: "heading",
        level: 3,
        children: "Copied keys require fresh independent authority",
      },
      {
        type: "paragraph",
        children:
          "If a private key or recovery phrase is compromised, treat the old authority as unsafe. Changing the wallet application's password does not remove the attacker's ability to recreate it. A new account derived from the same exposed recovery material may also remain within the attacker's reach. An independent secure wallet requires fresh authority created through a trusted process in a clean environment.",
      },
      {
        type: "paragraph",
        children:
          "Whether remaining assets can be moved safely depends on the network, the available funds, active attacker behaviour and the device's condition. A malware-infected device can compromise new material too. Do not present a universal rescue sequence as guaranteed. Follow verified wallet guidance and seek qualified assistance through independently checked channels where the situation is complex. Some losses cannot be reversed, even when a new wallet is secured correctly.",
      },
      {
        type: "paragraph",
        children:
          "A fresh address is not always fresh authority. Many addresses derive from one recovery root. If that root is exposed, moving into another account generated from it can leave the attacker able to sign again. A new provider password also does not change an independent on-chain key.",
      },
      {
        type: "paragraph",
        children:
          "A clean environment matters because creating new secrets on a compromised device can expose them immediately. Follow the genuine wallet's incident guidance and preserve the only remaining access while assessing the problem. A rescue transaction can be complex, especially where an automated attacker races it. This course teaches diagnosis and boundaries rather than a universal click-by-click recovery recipe.",
      },
    ],
  },
  {
    title: "Permissions, account breaches and automated sweepers",
    shortTitle: "Permissions, account breaches and automated sweepers",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Permissions logins and service breaches",
      },
      {
        type: "paragraph",
        children:
          "If the known issue is an unwanted allowance and signing secrets remain secure, a verified revocation may reduce that spender's future authority. Inspect the correct token, spender, network and account. Some signed orders or permissions have different cancellation mechanisms, so a generic token allowance change may be incomplete. Check for additional unauthorised activity rather than assuming one visible approval is the only issue.",
      },
      {
        type: "paragraph",
        children:
          "For a custodial account breach, contact the provider through its official route, secure associated email and authentication methods, revoke unfamiliar sessions and review withdrawals under the service's procedures. Freezing a compromised service account may be useful if the provider offers it, but no procedure guarantees recovery. Preserve relevant records for the provider and appropriate authorities. A service-password reset addresses a different layer from a self-custody key leak.",
      },
      {
        type: "paragraph",
        children: "Match diagnosis to response",
      },
      {
        type: "comparisonTable",
        columns: [
          "Suspected exposure",
          "Relevant response",
          "Insufficient response",
        ],
        rows: [
          [
            "Recovery material or key",
            "Independent fresh authority and clean environment assessment",
            "Changing only local wallet password",
          ],
          [
            "Token allowance",
            "Verified permission review and appropriate revocation",
            "Closing website",
          ],
          [
            "Reusable signed order",
            "Protocol-specific cancellation or expiry review",
            "Assuming generic allowance tool covers it",
          ],
          [
            "Exchange login",
            "Official provider containment plus email and authentication security",
            "Changing unrelated wallet password",
          ],
          [
            "Automated sweeper",
            "Verified specialist assessment before funding",
            "Blindly adding fee assets",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "For a provider breach, reach the genuine service through a saved route and report the suspected unauthorised activity. Review active sessions, API keys if used, email access, authentication and withdrawal settings through the provider's documented process. A compromised email can undo a password change by enabling another reset.",
      },
      {
        type: "example",
        title: "A false support call in Toronto",
        children:
          "A caller says Amira must send assets to a safe address to protect her exchange account. She ends the call, opens the service independently and reports it. A legitimate account-containment process is checked inside the real service; a stranger's suggested transfer is a new loss opportunity.",
      },
      {
        type: "heading",
        level: 3,
        children: "Do not feed an automated sweeper",
      },
      {
        type: "paragraph",
        children:
          "An automated sweeper can watch a compromised address and rapidly transfer newly arriving assets, including funds added to pay network fees. A well-intended instruction to add a little gas can therefore feed the attacker. Moving assets from a compromised address may require specialised transaction handling and careful assessment rather than ordinary wallet clicks.",
      },
      {
        type: "paragraph",
        children:
          "Do not deposit more money into a suspected compromised address to test it or pay an unknown rescuer. Verified wallet incident guidance specifically warns about this pattern. If a rescue depends on advanced tools you do not understand, stop and obtain trustworthy technical guidance without disclosing signing secrets to unsolicited contacts. An apparent emergency does not make an unknown helper safe.",
      },
    ],
  },
  {
    title: "Secure the environment and preserve evidence",
    shortTitle: "Secure the environment and preserve evidence",
    blocks: [
      {
        type: "paragraph",
        children:
          "Review the device, downloads, email recovery, active sessions and related accounts. A new wallet does not repair a compromised computer or a weak service recovery chain. Record what happened, what action was taken, what remains uncertain and which evidence was preserved. Reports to local authorities or regulators depend on the jurisdiction and incident; use official channels rather than numbers supplied by the attacker.",
      },
      {
        type: "paragraph",
        children:
          "Be wary of anyone guaranteeing retrieval of funds for an advance fee. Blockchain visibility can help document a transfer without making it reversible. Recovery agents may invent authority they do not possess. A good incident record can support legitimate investigation and prevent repeated mistakes even when recovery is unavailable. After immediate containment, review the original failure mechanism and update the safety routine without publishing sensitive information.",
      },
      {
        type: "paragraph",
        children:
          "Maintain a simple record with four fields: observed event, verified source, action taken and unresolved question. Separate confirmed facts from suspicions. For example, a transaction receipt can show that a spender moved a token, while the original way the attacker obtained that permission may still be unknown.",
      },
      {
        type: "paragraph",
        children:
          "Keep personal records securely and redact them before sharing. Reporting can support an investigation without guaranteeing recovery. After immediate containment, change the specific process that failed: a saved download source, a verification pause, a permission record or an account recovery dependency. This turns the incident review into a useful safety habit.",
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
          "A repair that worsens the damage. Oliver in the UK has a fictional wallet with compromised signing material. A stranger tells him to add GBP 20 worth of the native fee asset so the remaining token can be rescued. An automated attacker may take that new fee asset immediately. Oliver does not fund the address. He preserves the non-secret evidence, uses verified wallet guidance and considers an independent secure environment. The lesson is not that every rescue is impossible; it is that adding funds before understanding the compromise can create another loss.",
      },
      {
        type: "example",
        title: "Everyday example",
        children:
          "Watch out  Do not fund suspected compromised addresses or pay unsolicited recovery agents.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. A recovery phrase was typed into a fake form. Is creating another account from that same phrase enough?",
          "2. An unfamiliar token allowance appears but no key leak is known. What should be checked?",
          "3. List four non-secret evidence items to preserve.",
        ],
        answers: [
          "1. No. Fresh independent signing authority is needed; a related account may still derive from exposed material. The device and process must also be assessed.",
          "2. Verify the account, network, token and spender; assess broader compromise; use the correct verified cancellation procedure if appropriate.",
          "3. Messages, approximate times, transaction IDs, network and a description of the approved action. Do not include secrets or expose personal details publicly.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Should you add gas to every compromised address before investigating?",
        ],
        answers: [
          "Answer. No. An automated sweeper may take it. The rescue method depends on the incident and may need qualified verified guidance.",
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
          "Containment begins with identifying the authority exposed.",
          "A copied secret cannot be repaired by changing a local password.",
          "Preserving evidence does not require publishing secrets.",
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
            title: "MetaMask: I have been hacked or scammed",
            url: "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
          },
          {
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "Ethereum: Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
        ],
      },
    ],
  },
];

export const cryptoLevel2Lessons: LessonDocument[] = [
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
