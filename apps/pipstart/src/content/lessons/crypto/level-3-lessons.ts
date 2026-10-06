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
  course: "crypto-exchanges-and-markets",
  description:
    "Compare services through custody, execution, access requirements and remedies.",
  estimatedMinutes: 19,
  learningPath: "crypto",
  level: "level-3",
  module: "exchanges-stablecoins-and-orders",
  objectives: [
    "Compare services through custody, execution, access requirements and remedies.",
  ],
  position: 1,
  prerequisites: ["respond-to-a-crypto-compromise"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["read-a-spot-market-and-order-book"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Compare services through custody, execution, access requirements and remedies.",
  seoTitle: "Choose an Exchange Service by What It Does",
  slug: "choose-a-crypto-exchange-service",
  sources: [
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Coinbase: Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Uniswap: How Uniswap works",
      url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
    },
    {
      title:
        "FATF: 2026 targeted update on virtual assets and service providers",
      url: "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
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
      title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
      url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
    },
    {
      title:
        "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
      url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
    },
    {
      title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title:
        "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
    {
      title:
        "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
      url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
    },
    {
      title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
      url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
    },
    {
      title:
        "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
      url: "https://www.sec.gov/newsroom/press-releases/2023-32",
    },
    {
      title:
        "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
      url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
    },
    {
      title: "FCA: Qualifying retail crypto ETNs and continuing restrictions",
      url: "https://www.fca.org.uk/news/statements/information-firms-offer-crypto-exchange-traded-notes",
    },
    {
      title: "SEC: Crypto asset interpretation effective March 2026",
      url: "https://www.sec.gov/rules-regulations/2026/03/s7-2026-09",
    },
    {
      title: "ESMA: MiCA transition measures and authorisation",
      url: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-143-transitional-measures",
    },
    {
      title:
        "FSCA: Crypto asset declaration and transitional licensing arrangements",
      url: "https://www.fsca.co.za/News%20Documents/FSCA%20Press%20Release_Declaration%20of%20Crypto%20Assets%20As%20A%20Financial%20Product_20%20October%202022.pdf",
    },
  ],
  status: "published",
  title: "Choose an Exchange Service by What It Does",
};
const sections1: LessonSection[] = [
  {
    title: "Exchange, broker and other service arrangements",
    shortTitle: "Exchange broker and other service arrangements",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Compare services through custody, execution, access requirements and remedies.",
      },
      {
        type: "paragraph",
        children:
          "An exchange label does not explain the whole service. One company may sell directly to you, another match customer orders, and a website may connect your wallet to contracts. Before comparing prices, establish what the service actually does, who controls assets and which obligations apply. This makes later execution and custody checks much clearer.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children: "Trace custody and delivery from payment to withdrawal.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Picture an exchange as a market hall with a cashier",
      },
      {
        type: "paragraph",
        children:
          "Think of a covered market in Mumbai where, before you can trade, you hand your cash or goods to the hall's cashier. The cashier keeps a ledger of what everyone owns and matches buyers with sellers for you.",
      },
      {
        type: "paragraph",
        children:
          "That is close to how a centralised exchange works. You open an account, deposit money or crypto, and the company records your balance in its own books. When you buy, it matches your order with a seller and updates both balances. Well-known examples include Coinbase, Kraken and Binance; naming them here describes the category and is not a recommendation.",
      },
      {
        type: "definition",
        term: "Centralised exchange (CEX)",
        children:
          "A company that holds customers' money and crypto and runs a marketplace where their buy and sell orders are matched. It is custodial: the company, not you, controls the keys to the crypto it holds for you.",
      },
      {
        type: "paragraph",
        children:
          "The wallet and custody lesson in Level 2 called this custody. Your exchange balance is a promise from the company, and that convenience brings a matching risk. The US SEC warned in a March 2023 investor alert that crypto platforms often combine the jobs of marketplace, broker and custodian inside one company, and that this mix creates conflicts of interest and risks for investors. The exchange failure lesson in Level 3 shows what happened when some of these companies failed.",
      },
      {
        type: "paragraph",
        children:
          "The analogy has a limit: in a real market you watch your goods change hands, but on an exchange you see only numbers until you withdraw. And not every crypto app runs a market hall.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tell an order book exchange from a broker app",
      },
      {
        type: "paragraph",
        children:
          "In Toronto you can buy a used car at an auction, where you see every bid, or from a dealer, who names one price and sells from his own stock.",
      },
      {
        type: "paragraph",
        children:
          'Crypto has both. An order-book exchange is the auction: it shows customers\' buy and sell orders and matches them by price. A broker-style app is the dealer: you tap "buy", it quotes one price, and the firm fills your order from its own inventory or by trading elsewhere for you. Many companies offer both, often as a "simple" screen and an "advanced" screen.',
      },
      {
        type: "definition",
        term: "Broker (crypto)",
        children:
          "A firm or app that quotes you a price and fills your order itself, instead of showing you other customers' orders. Its quoted price usually includes a markup over the market price.",
      },
      {
        type: "paragraph",
        children:
          "Neither model is automatically better: the broker screen is quicker, but its markup is harder to see. Both are usually custodial, and both are different from a decentralised exchange (DEX), where trades happen through programs running on a blockchain and you keep your own keys. DEXs bring their own risks, and Level 6 explains them in detail.",
      },
      {
        type: "paragraph",
        children:
          "Whichever screen you use, prices start with an order book, so learn to read one.",
      },
      {
        type: "paragraph",
        children:
          "A broker may quote a price or arrange access to another market. Peer-to-peer services connect counterparties and may provide escrow or dispute handling. The answer should describe the actual service rather than the marketing category.",
      },
    ],
  },
  {
    title: "On-ramps, payment methods and delivery",
    shortTitle: "On ramps payment methods and delivery",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Map your on ramps and off ramps",
      },
      {
        type: "paragraph",
        children:
          "Think of a motorway in Italy. Slip roads take you on and off, and each has its own toll, speed limit and queues.",
      },
      {
        type: "paragraph",
        children:
          "An on-ramp is any route that turns your local money into crypto, and an off-ramp turns it back. Common routes include bank transfers, debit or credit cards, mobile money or instant-payment apps, and P2P marketplaces (the exchange and order lessons in Level 3).",
      },
      {
        type: "definition",
        term: "On-ramp and off-ramp",
        children:
          "An on-ramp converts national currency into crypto, for example by bank transfer or card. An off-ramp converts crypto back into national currency and pays it out.",
      },
      {
        type: "comparisonTable",
        columns: ["Route", "Speed", "Typical cost", "Main risk"],
        rows: [
          [
            "Bank transfer",
            "Minutes to days",
            "Often low",
            "Delays; account checks; wrong reference",
          ],
          [
            "Card",
            "Fast",
            "Often higher",
            "Higher fees; holds because cards can be reversed",
          ],
          [
            "Mobile money or payment app",
            "Fast",
            "Varies",
            "Limits; fake payment alerts",
          ],
          [
            "P2P marketplace",
            "Varies",
            "Price set by the other party",
            "Fake or reversed payments; frozen accounts",
          ],
        ],
        caption: "Common on-ramps and off-ramps compared",
      },
      {
        type: "paragraph",
        children:
          "Each route has rules about how fast your money can leave again, which surprises many beginners.",
      },
      {
        type: "heading",
        level: 3,
        children: "Expect holds limits and delays",
      },
      {
        type: "paragraph",
        children:
          "A hotel in Rome may place a hold on your card at check-in. The money is still yours, but you cannot use it until the hold lifts.",
      },
      {
        type: "paragraph",
        children:
          "Exchanges place similar holds. Kraken's support pages explain that withdrawals can be held after deposits by methods that can be reversed: for example, 72 hours after card or digital-wallet purchases and seven days after some bank-debit purchases, while trading continues normally. After a password reset, withdrawals to new addresses are held for 24 hours for security. The reason connects to Level 0: card payments and some bank debits can be reversed, so a provider waits before letting crypto leave.",
      },
      {
        type: "paragraph",
        children:
          "Limits are common too. Deposit and withdrawal limits often depend on your verification level, and a large or unusual withdrawal may trigger extra checks under the KYC and AML rules from the provider checking lessons in Level 3. Plan transfers well before you need the money.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'A hold is not a reason to call a number from a search result. If a withdrawal is delayed, read the provider\'s help pages and use its in-app support. "Recovery agents" and support numbers posted on forums are a common scam.',
      },
      {
        type: "paragraph",
        children:
          "Once the hold lifts, one decision remains: which network to withdraw on.",
      },
      {
        type: "paragraph",
        children:
          "Payment methods may include bank transfers, cards or supported local services. Availability, fees, limits and settlement timing depend on country and provider. A displayed crypto balance may appear before the underlying payment has fully settled. For a learner in India, a price quoted in INR does not establish that the service is authorised for every Indian customer or payment method. A learner in France may face different eligibility and disclosure rules.",
      },
    ],
  },
  {
    title: "Verify the provider and the scope of its licence",
    shortTitle: "Verify the provider and the scope of its licence",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Find out who you are really trusting",
      },
      {
        type: "paragraph",
        children:
          "Before you hand your spare house key to someone in Cape Town, you want to know more than their name. Where do they live? Who vouches for them? What happens if they lose it?",
      },
      {
        type: "paragraph",
        children:
          "The exchange and order lessons in Level 3 showed that an exchange balance is a promise from a company. So choosing a provider is really choosing whom to trust with your money and keys. A polished app tells you little about that. The questions that matter are about the business behind the logo: which legal company you are contracting with, which regulator supervises it, how it holds your assets, what it charges, and how it protects your account.",
      },
      {
        type: "paragraph",
        children:
          "Brand names can mislead. One brand may run several legal companies in different countries, each with different licences and terms. A friend in another country may be served by a different company from you, under the same logo. Your account agreement names the company that owes you obligations, so start there and write the name down.",
      },
      {
        type: "paragraph",
        children:
          'There is no single "best" exchange, and this lesson names none. Instead it gives you a set of checks you can repeat for any provider. The first check is the regulator.',
      },
      {
        type: "heading",
        level: 3,
        children: "Check the licence on the regulator s own register",
      },
      {
        type: "paragraph",
        children:
          "Imagine hiring an electrician in Manchester. A certificate on the van looks reassuring, but it proves nothing until you look the person up on the official scheme's website.",
      },
      {
        type: "paragraph",
        children:
          "Financial regulators keep similar lists, called registers. A register shows which firms are authorised or registered, under which legal name, and for which activities. Many regulators also keep a warning list of firms known to be operating without permission.",
      },
      {
        type: "paragraph",
        children:
          "The checks follow a pattern in most countries. Find your national financial regulator from its official website, not from a link in an advert. Search the register for the firm's exact legal name from its terms. Confirm that the permitted activities include the service you want, such as exchange or custody of crypto-assets. Then search the warning list. Finally, contact the firm only through details shown on the register, because clone firms copy real firms' names, as Level 0 explained.",
      },
      {
        type: "paragraph",
        children:
          "Dated examples show how this varies. In the European Union, the Markets in Crypto-Assets Regulation (MiCA) brought its main service-provider rules into application from 30 December 2024. Covered entities need to meet the relevant authorisation or notification route; some already regulated entities use specific notification provisions. The European Securities and Markets Authority (ESMA) publishes an interim MiCA register, updated weekly, that lists authorised providers and non-compliant entities. ESMA also described a transitional period, which ran until 1 July 2026 at the latest, during which some firms already operating could continue while awaiting authorisation. In South Africa, the Financial Sector Conduct Authority (FSCA) declared crypto assets a financial product in October 2022, and its transition required covered providers of crypto-related financial advice or intermediary services to apply between 1 June and 30 November 2023. That statement does not classify every ecosystem participant as a licensed financial-services provider.",
      },
      {
        type: "example",
        title: "Checking in Lyon",
        children:
          "Sophie in Lyon finds an app advertised on social media. Its terms name a company in another EU country. She opens ESMA's interim MiCA register from ESMA's own website, finds no entry for that legal name, then searches her national regulator's warning list and finds the brand there. She deletes the app.",
      },
      {
        type: "paragraph",
        children:
          "Being on a register is a starting point, not a seal of approval, which the next section explains.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know what registration does not protect",
      },
      {
        type: "paragraph",
        children:
          "A driving licence shows that someone passed a test. It does not promise they will never crash.",
      },
      {
        type: "paragraph",
        children:
          'Registration works the same way. Depending on the country, it may mean a firm passed checks on its owners, anti-money-laundering controls or capital, but it does not mean your money is insured or that the firm cannot fail. The UK Financial Conduct Authority says crypto is largely unregulated in the UK, so it is highly unlikely you would be covered by the Financial Services Compensation Scheme. Its standing message is "be prepared to lose all your money".',
      },
      {
        type: "paragraph",
        children:
          "Rules are changing in many places, so these are dated examples, not statements about your country. Ask two questions of any provider: which rules apply to this service, and what protection exists if the company fails? A registered firm will also ask you questions, which is the next check.",
      },
    ],
  },
  {
    title: "Identity checks and the Travel Rule",
    shortTitle: "Identity checks and the Travel Rule",
    blocks: [
      {
        type: "paragraph",
        children:
          "Providers may request identity, source-of-funds or recipient information under anti-money-laundering and other requirements. The Travel Rule concerns transmission of specified originator and beneficiary information in applicable transfers. Implementation and thresholds depend on the jurisdiction and service. A request for identity should still be verified through the genuine provider rather than an unsolicited message.",
      },
      {
        type: "paragraph",
        children:
          "Passing identity checks does not establish that the provider is solvent, that an asset is appropriate or that losses are insured. Conversely, a delayed withdrawal may reflect a review rather than immediate proof of fraud. Read the stated procedure, preserve non-secret records and use official support. Regulatory registration has a scope; it should not be stretched into approval of every product offered by the company. Later lessons examine registration, audit and insurance claims separately.",
      },
      {
        type: "paragraph",
        children: "Questions for each service",
      },
      {
        type: "comparisonTable",
        columns: [
          "Service type",
          "Price and settlement",
          "Dependency to investigate",
        ],
        rows: [
          [
            "Centralised exchange",
            "Orders or quotes with account settlement",
            "Custody withdrawal rules and financial condition",
          ],
          [
            "Broker",
            "Provider quote or arranged execution",
            "Spread counterparty and delivery terms",
          ],
          [
            "DEX interface",
            "Contract-based execution",
            "Contract interface oracle and network",
          ],
          [
            "Peer-to-peer platform",
            "Counterparty trade with possible escrow",
            "Payment finality escrow and disputes",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Expect identity checks and understand why",
      },
      {
        type: "paragraph",
        children:
          "Opening a bank account in Frankfurt means showing your passport and proving your address. The bank is not being nosy; the law requires it to know its customers.",
      },
      {
        type: "paragraph",
        children:
          "Regulated crypto providers do the same. KYC (know your customer) means verifying who you are, usually with an ID document, a selfie and proof of address. It is part of AML (anti-money-laundering) rules, which require firms to watch for suspicious activity and report it. Since 2019, the Financial Action Task Force (FATF), the global standard-setter on money laundering, has applied its standards to virtual assets and to the firms that handle them, which it calls virtual asset service providers (VASPs).",
      },
      {
        type: "definition",
        term: "KYC and AML",
        children:
          "KYC is the process of verifying a customer's identity. AML is the wider set of rules that require financial firms to prevent, detect and report money laundering and terrorist financing.",
      },
      {
        type: "paragraph",
        children:
          "KYC has a cost: you hand sensitive documents to a company that could be hacked. So upload them only inside the official app or website, never by email or chat. A platform that asks for no checks at all may be operating without permission, or may be a fake. KYC also explains the next set of questions you may see when you withdraw.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how the Travel Rule follows your transfer",
      },
      {
        type: "paragraph",
        children:
          "When a bank in Seoul sends an international wire, details about the sender and receiver travel with the payment. The receiving bank can see who sent the money.",
      },
      {
        type: "paragraph",
        children:
          "The FATF's Travel Rule (Recommendation 16) requires originator and beneficiary information to travel with transfers, and the FATF's standards for virtual assets apply it to crypto transfers between providers. In practice, an exchange may ask you for the recipient's name, whether the address belongs to you, or which provider it belongs to. Some ask you to declare that an address is your own self-custody wallet.",
      },
      {
        type: "definition",
        term: "Travel Rule",
        children:
          "A FATF standard requiring financial firms, including crypto providers, to pass identifying information about the sender and receiver along with a transfer.",
      },
      {
        type: "paragraph",
        children:
          "Implementation is uneven. The FATF's June 2022 targeted update found that of 98 jurisdictions surveyed, only 29 had passed Travel Rule laws, and urged faster action. So the questions you see depend on where you and the receiving provider are based, and they keep changing.",
      },
      {
        type: "example",
        title: "The withdrawal question in Riyadh",
        children:
          'Faisal in Riyadh withdraws crypto to his own hardware wallet. The exchange asks whether the address is his own wallet or belongs to another provider. He answers accurately: it is his own. The question is part of compliance, not a sign of a problem. A message from "support" asking for his recovery words, by contrast, would be a scam, because real staff never need them.',
      },
      {
        type: "paragraph",
        children:
          "Compliance questions cost you a minute. Fees cost money, and they come in more forms than the trading fees you met in the exchange and order lessons in Level 3.",
      },
    ],
  },
  {
    title: "Peer-to-peer payments, spot accounts and support",
    shortTitle: "Peer-to-peer payments, spot accounts and support",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Peer to peer escrow and payment finality",
      },
      {
        type: "paragraph",
        children:
          "In a peer-to-peer trade, one party may transfer national currency while an escrow mechanism holds crypto pending confirmation. The service's rules determine when release occurs and how disputes are handled. A screenshot saying paid can be forged. A payment may also be reversible or originate from an unrelated account, creating further risk.",
      },
      {
        type: "paragraph",
        children:
          "Do not release escrow solely because the other person creates urgency or supplies a notification. Verify actual receipt and applicable finality through the payment provider, while following the platform's legitimate dispute process. Avoid off-platform arrangements that remove the protections the service actually offers. Escrow can reduce a specific delivery risk; it does not eliminate payment reversal, identity fraud or platform failure. This course uses paper scenarios rather than requiring a peer-to-peer trade.",
      },
      {
        type: "paragraph",
        children:
          "Picture selling a bicycle in Jakarta through a site that holds the buyer's payment until you hand over the bike. The site sits in the middle, so neither of you has to trust the other completely.",
      },
      {
        type: "example",
        title: "Buying in Jakarta",
        children:
          "Budi in Jakarta wants Rp1,500,000 of USDT (an invented amount for this example). He picks an advertiser with a long record, and the platform locks her USDT in escrow. Budi pays from a bank account in his own verified name and waits in the app's chat. The seller checks her own banking app, sees the money, and releases the USDT.",
      },
      {
        type: "heading",
        level: 3,
        children: "Spot contracts account security and support",
      },
      {
        type: "paragraph",
        children:
          "Spot trading concerns current exchange of assets under the settlement arrangement. Margin involves financing or collateral supporting exposure. A dated future has a defined contract maturity; a perpetual generally has no scheduled expiry and uses venue mechanisms such as funding. An option gives a specified contractual right, with terms such as strike and expiry. These products do not grant identical rights.",
      },
      {
        type: "paragraph",
        children:
          "Access on the same application does not make their risks equivalent. Some products can liquidate collateral or produce obligations different from a fully paid spot holding. Mark the category in every example, and read jurisdictional eligibility as well as product terms. We will study derivatives at Levels 7 and 8 after spot execution is clear. For now, you should be able to say whether the service delivers an asset or a contract whose payoff depends on a price.",
      },
      {
        type: "example",
        title: "The 10× offer in Istanbul",
        children:
          "Emre in Istanbul puts up ₺10,000 of margin to control a ₺100,000 BTC perpetual position (invented amounts for this example). If BTC falls about 10%, he has lost about ₺10,000, his whole margin, and is liquidated even if the price recovers the next day. A spot buyer of ₺10,000 of BTC would have lost about ₺1,000 and still own the coins.",
      },
      {
        type: "heading",
        level: 3,
        children: "Switch on the security features before you deposit",
      },
      {
        type: "paragraph",
        children:
          "A good front door in Toronto has a lock, a peephole and a chain. Each helps in a different way.",
      },
      {
        type: "paragraph",
        children:
          "Exchange accounts have similar layers. The security lessons in Level 2 explained two-factor authentication (2FA) and why app-based codes or hardware security keys are stronger than SMS. Turn it on before you deposit. Then look for a withdrawal allow-list. Coinbase's help pages describe an address-book allow-list that limits sends to addresses saved in your address book; a newly added address becomes usable only after 48 hours, and changes require your 2-step verification. That delay gives you time to notice if a thief adds their own address.",
      },
      {
        type: "definition",
        term: "Withdrawal allow-list",
        children:
          "A setting that lets your account send crypto only to addresses you have saved in advance, often with a waiting period before a new address can be used.",
      },
      {
        type: "paragraph",
        children:
          "Other useful features include an anti-phishing code, a word you choose that appears in every genuine email from the provider, alerts for new logins and withdrawals, and a list of logged-in devices you can review. None of these protects you if you hand over your codes, so the rule from Level 2 stands: real support staff never need your passwords, 2FA codes or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "Security features protect your login. What happens to the assets behind it depends on the custody terms.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read the custody terms",
      },
      {
        type: "paragraph",
        children:
          "Leaving your car with a valet in Rome, you'd want to know: will they park it in a locked garage, lend it to a friend, or put it in a shared lot with hundreds of others?",
      },
      {
        type: "paragraph",
        children:
          "Custody terms answer those questions for your crypto. The SEC's December 2025 investor bulletin on custody suggests asking whether a provider lends out or reuses deposited assets (rehypothecation) and whether that needs your consent, whether it commingles customer assets in shared wallets rather than holding them separately, how it stores assets (hot or cold wallets, or through subcontractors), what insurance exists and on what terms, and what fees apply. It warns plainly that if a third-party custodian is hacked, shuts down or goes bankrupt, you may lose access to your crypto.",
      },
      {
        type: "definition",
        term: "Rehypothecation",
        children:
          "When a custodian uses customer assets for its own purposes, such as lending them out or pledging them as collateral.",
      },
      {
        type: "paragraph",
        children:
          'Look in the terms for phrases such as "we may use", "lend" or "title transfers to us". Wording like that can mean the assets are no longer held for you in the way you assumed. The exchange failure lesson in Level 3 shows why this matters when a company fails. Before then, check one more thing: who answers when something goes wrong.',
      },
      {
        type: "heading",
        level: 3,
        children: "Test the support and complaint routes",
      },
      {
        type: "paragraph",
        children:
          "Most people only look for a shop's returns policy after something breaks. With crypto providers, look first.",
      },
      {
        type: "paragraph",
        children:
          "Find the official support channel inside the app or on the provider's own website, and check whether there is a formal complaints process and an outside body, such as an ombudsman or the regulator, that handles unresolved complaints. Then send a small, harmless question and see how support responds.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'Fake support numbers fill search results. Searching "exchange support phone number" often returns pages and posts listing numbers run by scammers. Reach support only through the app or the website address you typed yourself, and never share your recovery words, passwords or 2FA codes with anyone.',
      },
      {
        type: "paragraph",
        children:
          "You now have every piece of the check. The last step is putting them together.",
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
          "The ticket counter and the resale board. Nadia in the UK compares buying a GBP 50 concert ticket from the venue, from a reseller and through a notice board connecting buyers and sellers. All three routes may show a ticket price, but delivery, dispute handling and seller obligations differ. Crypto services similarly need to be compared by their actual roles. A familiar price screen does not tell Nadia who holds the asset or what happens if the counterparty fails. She writes the custody and settlement process before judging whether the quotation is attractive.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Never treat a payment screenshot or a compliance badge as proof of final settlement or solvency.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Name an on-ramp and an off-ramp in a fictional CAD example.",
          "2. Does completion of KYC prove deposit insurance?",
          "3. A peer presents a payment screenshot and asks you to release escrow. What evidence is missing?",
        ],
        answers: [
          "1. An on-ramp could exchange CAD from a bank account for an asset; an off-ramp could sell it and withdraw CAD to an eligible bank account. Fees and service support must be checked.",
          "2. No. Identity checks serve defined compliance purposes; insurance depends on separate terms and applicable protection.",
          "3. Actual payment receipt and its settlement or reversal conditions must be independently verified through the genuine payment route.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a decentralised exchange label remove all human and technical dependencies?",
        ],
        answers: [
          "Answer. No. Interfaces, contracts, networks, administrators and data services can remain important dependencies.",
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
          "Identify the service role before comparing prices.",
          "Compliance checks and customer protection are different questions.",
          "Product categories have different ownership and loss mechanisms.",
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
            title: "Coinbase: Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Uniswap: How Uniswap works",
            url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
          },
          {
            title:
              "FATF: 2026 targeted update on virtual assets and service providers",
            url: "https://www.fatf-gafi.org/en/news/targeted-updated-va-vasps-2026.html",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
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
            title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
            url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
          },
          {
            title:
              "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
            url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
          },
          {
            title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
          {
            title:
              "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
            url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
          },
          {
            title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
            url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
          },
          {
            title:
              "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
            url: "https://www.sec.gov/newsroom/press-releases/2023-32",
          },
          {
            title:
              "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
            url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
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
          {
            title: "ESMA: MiCA transition measures and authorisation",
            url: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-143-transitional-measures",
          },
          {
            title:
              "FSCA: Crypto asset declaration and transitional licensing arrangements",
            url: "https://www.fsca.co.za/News%20Documents/FSCA%20Press%20Release_Declaration%20of%20Crypto%20Assets%20As%20A%20Financial%20Product_20%20October%202022.pdf",
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
  course: "crypto-exchanges-and-markets",
  description:
    "Explain a quoted pair, spread and order-book depth without confusing price with a guaranteed fill.",
  estimatedMinutes: 6,
  learningPath: "crypto",
  level: "level-3",
  module: "exchanges-stablecoins-and-orders",
  objectives: [
    "Explain a quoted pair, spread and order-book depth without confusing price with a guaranteed fill.",
  ],
  position: 2,
  prerequisites: ["choose-a-crypto-exchange-service"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "choose-a-crypto-exchange-service",
    "crypto-orders-fees-and-execution-costs",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain a quoted pair, spread and order-book depth without confusing price with a guaranteed fill.",
  seoTitle: "Read a Spot Market and an Order Book",
  slug: "read-a-spot-market-and-order-book",
  sources: [
    {
      title: "Coinbase: Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Kraken: What are Maker and Taker fees",
      url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
      url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
    },
    {
      title:
        "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
      url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
    },
  ],
  status: "published",
  title: "Read a Spot Market and an Order Book",
};
const sections2: LessonSection[] = [
  {
    title: "Trading pairs, bids, asks and spread",
    shortTitle: "Trading pairs, bids, asks and spread",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Base and quote units",
      },
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain a quoted pair, spread and order-book depth without confusing price with a guaranteed fill.",
      },
      {
        type: "paragraph",
        children:
          "A displayed price is not necessarily the price for your whole order. A spot market contains quantities offered at different levels. Understanding those levels explains why a larger purchase can cost more per unit than a small one. We will read a fictional order book and calculate the average execution instead of assuming every unit trades at the top price.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Calculate total quote cost first, then divide by the filled base quantity.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "In BTC/GBP, BTC is the base asset whose quantity is traded, while GBP is the quote currency used to state its price. A price of GBP 40,000 means GBP 40,000 per one BTC. In BTC/USDC the quote asset is a stablecoin, so the number is USDC per BTC rather than automatically bank dollars. Both assets and their units matter.",
      },
      {
        type: "paragraph",
        children:
          "Quantity multiplied by price gives quote value before fees. Buying 0.01 BTC at GBP 40,000 costs GBP 400 before additional costs. An order entry field may ask for base quantity or quote spending amount; confusing the two can produce an unwanted order. Read the units beside the field and the preview. Market pairs also differ across venues, and a home-currency valuation may require another conversion after the trade.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read bids asks and spread",
      },
      {
        type: "paragraph",
        children:
          'Imagine a noticeboard at a phone market in Seoul. Buyers pin cards saying "I\'ll pay ₩400,000"; sellers pin cards saying "I\'ll sell for ₩420,000". Nobody trades until two cards agree.',
      },
      {
        type: "paragraph",
        children:
          "An order book is that noticeboard. Kraken's trading glossary describes it as a list of unfilled buy and sell limit orders. Buy orders are bids and sell orders are asks. The highest bid and the lowest ask sit closest together, and the gap between them is the spread.",
      },
      {
        type: "paragraph",
        children:
          "Every market is a trading pair. In BTC/USDT, the first asset (BTC) is the base and the second (USDT, a dollar-pegged token you'll meet in the stablecoin and transfer lessons in Level 3) is the quote. The price tells you how many units of the quote buy one unit of the base. A pair such as ETH/BTC prices ether in bitcoin, with no national currency involved.",
      },
      {
        type: "definition",
        term: "Spread",
        children:
          "The difference between the highest price a buyer is offering (best bid) and the lowest price a seller is asking (best ask).",
      },
      {
        type: "comparisonTable",
        columns: ["Side", "Price (USDT)", "Size (BTC)"],
        rows: [
          ["Ask", "50,400", "0.5"],
          ["Ask", "50,200", "0.3"],
          ["Ask (best)", "50,100", "0.2"],
          ["Bid (best)", "49,900", "0.3"],
          ["Bid", "49,800", "0.4"],
          ["Bid", "49,600", "1.0"],
        ],
        caption:
          "An order book for BTC/USDT (all prices and sizes invented for this example)",
      },
      {
        type: "paragraph",
        children:
          "The best bid is 49,900 and the best ask is 50,100, so the spread is 200 USDT. A narrow spread with plenty of size at each level marks a liquid market, where trading costs less; thin books cost more. What you pay also depends on your order type.",
      },
      {
        type: "paragraph",
        children:
          "A top ask of GBP 100 with only two units available does not mean five units can all be purchased at GBP 100. Treat a displayed book as a changing view of a particular venue rather than a guaranteed inventory lasting until your click.",
      },
    ],
  },
  {
    title: "Calculate a fill across book levels",
    shortTitle: "Calculate a fill across book levels",
    blocks: [
      {
        type: "paragraph",
        children:
          "Suppose asks offer two units at GBP 100, three at GBP 101 and five at GBP 103. A fictional immediate purchase of four units takes two at GBP 100 and two at GBP 101, assuming no changes and no other orders. The quote cost is GBP 200 plus GBP 202, or GBP 402. Dividing by four units gives a quantity-weighted average of GBP 100.50.",
      },
      {
        type: "paragraph",
        children:
          "An ordinary average of the price levels is inappropriate because the filled quantities differ. A larger six-unit purchase would use two at GBP 100, three at GBP 101 and one at GBP 103, costing GBP 606 and averaging GBP 101. The book itself explains why order size changes the average. Trading fees are then applied under the venue's rules; they are not already included in this simplified calculation.",
      },
      {
        type: "paragraph",
        children: "Walk a four unit purchase through the asks",
      },
      {
        type: "comparisonTable",
        columns: ["Ask price", "Available units", "Units bought", "Quote cost"],
        rows: [
          ["GBP 100", "2", "2", "GBP 200"],
          ["GBP 101", "3", "2", "GBP 202"],
          ["GBP 103", "5", "0", "GBP 0"],
          ["Total", "—", "4", "GBP 402"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Average fill is GBP 402 divided by 4, or GBP 100.50. The book is fictional and assumed unchanged.",
      },
      {
        type: "paragraph",
        children:
          "Imagine buying ten loaves at a bakery in Rome with only three left at the shelf price. The next batch costs more, so your average price ends up above the label.",
      },
      {
        type: "example",
        title: "Eating through the book in Johannesburg",
        children:
          "Sipho in Johannesburg places a market buy for 0.5 BTC on the invented book above, expecting the best ask of 50,100 USDT. The order takes 0.2 BTC at 50,100 (10,020 USDT) and 0.3 BTC at 50,200 (15,060 USDT). He pays 25,080 USDT in total, so his average price is 25,080 ÷ 0.5 = 50,160. Slippage is (50,160 − 50,100) ÷ 50,100 × 100% ≈ 0.12%.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-3/lesson-2-rId30.png",
        width: 1451,
        height: 672,
        alt: "A four-unit purchase uses two units at GBP 100 and two at GBP 101. Displayed depth is fictional and assumed unchanged.",
        caption:
          "A four-unit purchase uses two units at GBP 100 and two at GBP 101. Displayed depth is fictional and assumed unchanged.",
      },
    ],
  },
  {
    title: "Liquidity and your executable price",
    shortTitle: "Liquidity and your executable price",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Liquidity and separate markets",
      },
      {
        type: "paragraph",
        children:
          "Liquidity is the ability to buy or sell a relevant quantity with limited disruption and acceptable execution conditions. It depends on depth, spread, turnover, participation and how the book responds during the order. High advertised volume does not guarantee useful depth at your size. Volume may also contain activity that does not represent independent end-user demand.",
      },
      {
        type: "paragraph",
        children:
          "Crypto liquidity is distributed across venues, pairs and networks. An attractive quote elsewhere may be inaccessible because of fees, funding delays, custody restrictions or regional eligibility. During stress, orders can vanish and transfers can slow. Compare executable depth for the intended route rather than assuming all global volume is available to you. Later token research uses this distinction to test whether a quoted portfolio can realistically be sold near its displayed value.",
      },
      {
        type: "paragraph",
        children:
          "Depth is a snapshot, not a reservation. Other traders can remove orders before yours arrives, and displayed quantities can be cancelled or replenished. Hidden orders and venue matching rules can also affect a fill. An apparently thick book in a screenshot may therefore offer less executable liquidity later.",
      },
      {
        type: "paragraph",
        children:
          "Compare size with the actual levels it would consume. A market quote for one unit and a market quote for one thousand units answer different questions. If two venues show different prices, moving assets between them adds withdrawal timing, fee and custody dependencies; the difference is not automatically an available profit.",
      },
      {
        type: "heading",
        level: 3,
        children: "A last price is not your executable price",
      },
      {
        type: "paragraph",
        children:
          "The last trade price records a completed trade, perhaps for a very small quantity. An indicative quote may be a preview under assumptions. The executable result depends on the orders available when your action reaches the venue and the instructions you use. A chart line based on last trades is useful history, but it is not a standing offer for your entire holding.",
      },
      {
        type: "paragraph",
        children:
          "Before placing an order, specify size, expected execution, fee assumptions and the maximum acceptable difference where relevant. After execution, compare actual fills with the expectation. This difference leads into slippage, price impact and order types in the next lesson. A careful beginner records quantities and fills rather than saying simply that the price was 100.",
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
          "Buying fruit across stalls. At a market in Germany, one stall has two baskets of apples for EUR 10 each and another has more at EUR 11. Buying four baskets costs EUR 42, so the average is EUR 10.50 per basket. The cheapest displayed sign did not apply to the whole quantity. An order book works through offered quantities and prices rather than physical stalls, but the arithmetic is similar. This explains why the best quote and average fill can differ without an arithmetic error.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Displayed depth can change before execution and does not guarantee liquidity during stress.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Using the same asks, calculate the cost and average price for six units.",
          "2. What is the spread if the best bid is GBP 99 and best ask GBP 100?",
          "3. Why might a last trade at GBP 100 be unsuitable for valuing an immediate sale of 100 units?",
        ],
        answers: [
          "1. Cost is 2 × 100 + 3 × 101 + 1 × 103 = GBP 606. Average is GBP 101 per unit before fees.",
          "2. GBP 1 per unit. As a percentage, the reference denominator must be specified.",
          "3. The last trade may be small; available bids at that size may be lower and change during execution.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Should average fill be the unweighted average of every displayed price level?",
        ],
        answers: [
          "Answer. No. Weight only actual fills by their quantities. Unused levels do not enter the cost of the completed order.",
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
          "Prices need base and quote units.",
          "Depth determines the simplified fill for an order size.",
          "Last trade and executable price are different observations.",
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
            title: "Coinbase: Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Kraken: What are Maker and Taker fees",
            url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
            url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
          },
          {
            title:
              "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
            url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
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
  course: "crypto-exchanges-and-markets",
  description:
    "Choose an order description and calculate costs while recognising execution limits.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-3",
  module: "exchanges-stablecoins-and-orders",
  objectives: [
    "Choose an order description and calculate costs while recognising execution limits.",
  ],
  position: 3,
  prerequisites: ["read-a-spot-market-and-order-book"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "read-a-spot-market-and-order-book",
    "stablecoins-and-peg-promises",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Choose an order description and calculate costs while recognising execution limits.",
  seoTitle: "Orders, Fees and the Cost of Execution",
  slug: "crypto-orders-fees-and-execution-costs",
  sources: [
    {
      title: "Coinbase: Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Kraken: What are Maker and Taker fees",
      url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
    },
    {
      title: "Uniswap: How Uniswap works",
      url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
    },
    {
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
      url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
    },
    {
      title:
        "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
      url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
    },
    {
      title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title:
        "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
    {
      title:
        "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
      url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
    },
  ],
  status: "published",
  title: "Orders, Fees and the Cost of Execution",
};
const sections3: LessonSection[] = [
  {
    title: "Order instructions, stops and execution limits",
    shortTitle: "Order instructions, stops and execution limits",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Market limit and time instructions",
      },
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Choose an order description and calculate costs while recognising execution limits.",
      },
      {
        type: "paragraph",
        children:
          "Order instructions determine what a venue attempts to do, while costs determine how much of a result you keep. A limit order, stop order or fee discount does not remove execution uncertainty. This lesson explains the instructions and then calculates a complete fictional sale with the assumptions visible.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Write the trigger, execution instruction and fee basis separately.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "A market order requests execution against available liquidity under venue rules. It prioritises execution rather than a fixed price, and safeguards or size limits may still stop it. A limit buy sets a maximum price; a limit sell sets a minimum. A limit can remain unfilled or fill only partly. Cancellation applies to the remaining open amount, not to fills already completed.",
      },
      {
        type: "paragraph",
        children:
          "Time-in-force instructions control how long an order remains eligible. Good-till-cancelled, immediate-or-cancel and fill-or-kill are common categories, but support and precise behaviour vary. A partially filled order creates both an executed holding and a remaining instruction. Review both before submitting another order. An application timeout does not prove that an order failed; check order history and status to avoid a duplicate.",
      },
      {
        type: "example",
        title: "The careful limit order in Paris",
        children:
          "Camille in Paris places a limit buy for ETH at €1,900, below the €2,000 she sees (invented prices for this example). If the price dips to €1,900, her order fills; if not, she buys nothing. She accepts the trade-off: control over price, no promise of a fill.",
      },
      {
        type: "heading",
        level: 3,
        children: "Stops are triggers with an execution instruction",
      },
      {
        type: "paragraph",
        children:
          "A stop-market order triggers a market instruction when the venue's specified reference meets the condition. A stop-limit triggers a limit instruction. The trigger reference may be last price, mark price or another measure under the product rules. Triggering is therefore only one stage, followed by actual execution conditions.",
      },
      {
        type: "paragraph",
        children:
          "A stop-market can fill beyond the trigger during a gap or thin liquidity. A stop-limit can remain unfilled if price moves past the permitted limit. Neither guarantees the chosen loss amount. Record which price triggers the order, what follows, and what could prevent a fill. For classroom risk calculations, label a planned stop as an assumption rather than a certainty. Level 8 will include adverse execution and costs in a loss-budget example.",
      },
      {
        type: "example",
        title: "Two exits at the same trigger",
        children:
          "A fictional token is trading at £100. A learner sets a stop at £90. A stop-market can trigger at the specified reference but fill at £86 in a fast fall. A stop-limit with a £89 limit can trigger and remain unfilled if available bids drop straight to £86. One prioritises an execution attempt; the other retains a price condition. Neither guarantees a £90 loss boundary.",
      },
      {
        type: "paragraph",
        children:
          "The rule must name the reference used for triggering and the instruction sent after triggering. If a derivative uses a mark price for liquidation and a last price for an order trigger, the two events can arrive in a different order than the learner expects.",
      },
    ],
  },
  {
    title: "Maker, taker and marketable limit orders",
    shortTitle: "Maker taker and marketable limit orders",
    blocks: [
      {
        type: "paragraph",
        children:
          "A maker order adds liquidity that rests in the book; a taker order removes existing liquidity. The distinction concerns execution behaviour, not simply the order's name. A limit buy priced above an available ask can execute immediately and take liquidity. Some venues offer post-only instructions that reject or adjust an order that would immediately take, according to their rules.",
      },
      {
        type: "paragraph",
        children:
          "An order can also have different fee treatments across its fills. Part may execute immediately while the rest rests, if the venue permits it. Use the actual fee schedule and fill report, including the asset in which fees are charged. Do not copy a fictional fee into a real calculation. Discount tokens or tiered schedules add further assumptions and may change the economic result.",
      },
      {
        type: "paragraph",
        children: "Reconcile the fictional sale",
      },
      {
        type: "comparisonTable",
        columns: ["Cash flow", "Calculation", "GBP amount"],
        rows: [
          ["Purchase cost", "10 × 100", "1,000.00"],
          ["Entry fee", "Supplied", "5.00"],
          ["Total entry cost", "1,000 + 5", "1,005.00"],
          ["Gross sale", "10 × 104", "1,040.00"],
          ["Sale fee", "1,040 × 0.005", "5.20"],
          ["Withdrawal fee", "Supplied", "2.00"],
          ["Net proceeds", "1,040 − 5.20 − 2", "1,032.80"],
          ["Net gain", "1,032.80 − 1,005", "27.80"],
        ],
      },
      {
        type: "paragraph",
        children:
          "No tax, funding or conversion is assumed. Each additional cash flow must be assessed separately.",
      },
      {
        type: "example",
        title: "The round trip in São Paulo",
        children:
          "Daniela in São Paulo buys R$2,000 of BTC with a market order, then sells it with another market order. The taker fee is 0.4% and the spread is about 0.4% (invented rates for this example). Each fee is R$2,000 × 0.4% = R$8, so fees total R$16. Crossing the spread costs about R$2,000 × 0.4% = R$8. Her round trip costs about R$24, or 1.2%. Had she used limit orders at a 0.25% maker rate, each fee would have been R$5.",
      },
    ],
  },
  {
    title: "Separate fees, spread, impact and slippage",
    shortTitle: "Separate fees spread impact and slippage",
    blocks: [
      {
        type: "paragraph",
        children:
          "The spread is the gap between quoted buying and selling prices. Price impact is the effect of your order interacting with liquidity. Slippage describes the difference between an expected reference and the actual execution, which may include market movement and impact. Trading fees are explicit venue charges. Network fees, withdrawal fees and currency conversion apply at other stages.",
      },
      {
        type: "paragraph",
        children:
          "Avoid counting the same effect twice. If your actual average fill already includes walking through the book, adding another estimated impact charge may duplicate it. Similarly, use the actual conversion result or an explicit conversion assumption. A complete cost worksheet names each charge, its basis and whether it is already embedded in a quoted price. This makes results comparable and prevents a profitable-looking gross calculation from hiding a negative net outcome.",
      },
      {
        type: "paragraph",
        children:
          "A budget airline in Sydney can advertise a A$49 fare, then add charges for bags, seats and card payments. The total, not the headline, is what you pay.",
      },
      {
        type: "paragraph",
        children:
          "You have now met maker and taker fees, the spread and slippage. A provider's full fee page usually lists more:",
      },
      {
        type: "comparisonTable",
        columns: ["Fee", "When it applies", "What to check"],
        rows: [
          [
            "Deposit fee",
            "Paying in by bank, card or mobile money",
            "Card deposits often cost more than bank transfers",
          ],
          [
            "Trading fee or spread",
            "Each buy or sell",
            "Maker/taker rates, or the broker markup",
          ],
          [
            "Conversion fee",
            "Changing between currencies",
            "Is your local currency supported directly?",
          ],
          [
            "Network withdrawal fee",
            "Sending crypto out",
            "Fixed per withdrawal, varies by asset and network",
          ],
          [
            "Cash withdrawal fee",
            "Paying out to your bank",
            "Minimum amounts and processing times",
          ],
          [
            "Other charges",
            "Inactivity, account closure",
            "Read the full fee schedule",
          ],
        ],
        caption: "Fees to compare between providers",
      },
      {
        type: "formula",
        expression:
          "Total cost = deposit fee + trading fee + spread cost + withdrawal fee; Cost as a share = total cost ÷ amount × 100%",
        explanation:
          "add every charge between your money leaving the bank and your crypto arriving where you want it. Comparing providers on one fee alone can mislead.",
      },
      {
        type: "example",
        title: "Two quotes in Monterrey",
        children:
          'Carlos in Monterrey wants MX$5,000 of BTC sent to his own wallet (all fees invented for this example). Provider A: free bank deposit, 0.5% trading fee (MX$25), about 0.5% spread (MX$25) and a withdrawal fee worth MX$40, so MX$90, or 1.8%. Provider B advertises "zero trading fees" but charges 3% for card deposits (MX$150), has a 1% spread (MX$50) and a withdrawal fee worth MX$20, so MX$220, or 4.4%. The "free" headline was the more expensive route.',
      },
      {
        type: "paragraph",
        children:
          "Fees tell you what a provider charges. The next question is whether it actually holds what it owes.",
      },
    ],
  },
  {
    title: "Work out the net result",
    shortTitle: "Work out the net result",
    blocks: [
      {
        type: "paragraph",
        children:
          "Suppose ten fictional units were bought for GBP 100 each, with a GBP 5 entry fee. They later sell at an average GBP 104, producing GBP 1,040 gross proceeds. A 0.5 percent sale fee is GBP 5.20. A separate GBP 2 withdrawal charge leaves GBP 1,032.80. Against the GBP 1,005 total entry cost, the net gain is GBP 27.80.",
      },
      {
        type: "paragraph",
        children:
          "The result assumes no other fee, funding cost, tax or currency change. Those omissions must be stated rather than hidden. Keep fill records and reconcile fee assets. PipStart's Risk Reward Calculator can illustrate planned distances, but it does not calculate every crypto cash flow or guarantee a stop fill. Use the manual worksheet for actual net proceeds and the tool for the clearly defined ratio.",
      },
      {
        type: "paragraph",
        children:
          "Break-even is a cash-flow question. Include the original purchase value and entry costs on one side, and net sale proceeds after applicable costs on the other. A fee charged in a different token also needs a consistent valuation convention.",
      },
      {
        type: "example",
        title: "A small gross gain that disappears",
        children:
          "A learner in Tokyo models JPY 10,000 spent on a token plus a JPY 100 entry charge. A later sale returns JPY 10,150 before a JPY 100 exit charge and JPY 80 withdrawal charge. Net cash received is JPY 9,970 against JPY 10,100 paid, a JPY 130 loss. A chart showing a rising price does not settle that calculation.",
      },
      {
        type: "paragraph",
        children:
          "Use actual average fills when supplied. Do not add a second estimated slippage cost if the worse fill is already included. The same rule prevents misleading double counting when comparing provider quotes.",
      },
      {
        type: "learningLink",
        title: "Explore the Risk Reward Calculator",
        description:
          "compare entry 50, planned exit 45 and target 60 in one quote unit. The planned ratio is two. Reconcile fees and actual fills separately; that ratio does not supply a success probability.",
        href: "/tools/risk-reward-calculator",
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
          "The sale price and what reaches the account. Grace in the UK sells a used bicycle for GBP 104 after paying GBP 100 for it. A marketplace charge and delivery expense reduce the money she keeps. Crypto trades similarly need a net calculation, though fees are charged under different rules. In the ten-unit example, the GBP 40 gross price gain becomes GBP 27.80 after the stated entry, sale and withdrawal costs. Describing only the four-percent price rise would overstate Grace's net result.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A planned stop and a favourable ratio do not guarantee the maximum realised loss.",
      },
      {
        type: "learningLink",
        title: "Explore the Risk Reward Calculator",
        description:
          "Compare entry, stop and target distances under stated price units. A reward-to-risk ratio is not the probability of success, actual net expectancy or a guaranteed fill.",
        href: "/tools/risk-reward-calculator",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. If the average sale price is GBP 99 with the same fee rules, calculate net gain or loss.",
          "2. Can a limit order receive taker treatment?",
          "3. What should you check after a connection error during order submission?",
        ],
        answers: [
          "1. Gross sale is GBP 990; sale fee GBP 4.95; net proceeds GBP 983.05 after the GBP 2 withdrawal. Compared with GBP 1,005 entry cost, loss is GBP 21.95.",
          "2. Yes, if it executes against resting liquidity immediately under the venue rules.",
          "3. Check order history, open orders and fills before resubmitting. A missing screen response does not prove no order exists.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does a stop-limit guarantee an exit when its trigger is reached?",
        ],
        answers: [
          "Answer. No. The resulting limit may not fill if the market is outside the permitted price or lacks liquidity.",
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
          "Order types express instructions rather than guaranteed outcomes.",
          "Maker or taker treatment follows execution.",
          "Net results require all relevant cash flows without double counting.",
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
            title: "Coinbase: Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Kraken: What are Maker and Taker fees",
            url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
          },
          {
            title: "Uniswap: How Uniswap works",
            url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
          },
          {
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "Coinbase Help: Coinbase Help — Coinbase Advanced fees",
            url: "https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees",
          },
          {
            title:
              "Investor.gov (SEC): Investor.gov (SEC) — Exercise Caution with Crypto Asset Securities: Investor Alert (2023)",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — Bitcoin ATMs: a payment portal for scammers (Data Spotlight, September 2024)",
            url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers",
          },
          {
            title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
          {
            title:
              "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
            url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
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
  course: "crypto-exchanges-and-markets",
  description:
    "Evaluate the stabilisation mechanism and the actual redemption route.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-3",
  module: "exchanges-stablecoins-and-orders",
  objectives: [
    "Evaluate the stabilisation mechanism and the actual redemption route.",
  ],
  position: 4,
  prerequisites: ["crypto-orders-fees-and-execution-costs"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "crypto-orders-fees-and-execution-costs",
    "crypto-deposits-withdrawals-and-exchange-failure",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Evaluate the stabilisation mechanism and the actual redemption route.",
  seoTitle: "Stablecoins and What the Peg Promises",
  slug: "stablecoins-and-peg-promises",
  sources: [
    {
      title: "Circle: USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
    },
    {
      title: "Circle: USDC Risk Factors",
      url: "https://www.circle.com/legal/usdc-risk-factors",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
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
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
      url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
    },
    {
      title:
        "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
      url: "https://www.sec.gov/newsroom/press-releases/2023-32",
    },
    {
      title:
        "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
      url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
    },
  ],
  status: "published",
  title: "Stablecoins and What the Peg Promises",
};
const sections4: LessonSection[] = [
  {
    title: "Why stablecoins exist and how designs differ",
    shortTitle: "Why stablecoins exist and how designs differ",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Evaluate the stabilisation mechanism and the actual redemption route.",
      },
      {
        type: "paragraph",
        children:
          "A stablecoin aims to track a reference value. The word stable describes a target, not a guarantee about custody, reserves or your ability to redeem. We will separate the market price from the issuer's promise and examine how a token intended to equal one dollar can still expose a learner to several kinds of loss.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Ask how this particular holder can turn this particular token into usable value.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "See what a stablecoin is trying to do",
      },
      {
        type: "paragraph",
        children:
          "Think of a token you buy at a funfair in Brisbane. You hand over A$10 and get ten tokens, each meant to be worth A$1 at any stall. At the end of the day you can swap unused tokens back for cash at the booth. The tokens are only as good as the booth's promise and the cash in its till.",
      },
      {
        type: "paragraph",
        children:
          "A stablecoin is a crypto token built on that idea. It aims to keep a steady value, usually one US dollar, while moving on a blockchain like any other token. You met USDT in the exchange and order lessons in Level 3 as the quote currency in BTC/USDT. People use stablecoins to hold a dollar-like balance on an exchange without leaving crypto, to move value between providers, and for some payments.",
      },
      {
        type: "definition",
        term: "Stablecoin",
        children:
          "A crypto token designed to hold a steady value against a reference, usually a national currency such as the US dollar. Stablecoins aim to hold a peg; they carry no guarantee and are not bank deposits.",
      },
      {
        type: "paragraph",
        children:
          "Coinbase's learning centre makes the same point: there is no guarantee that a stablecoin will keep a stable value, or that reserves will cover every redemption. Where the funfair analogy stops working is scale and speed. A funfair booth serves a few hundred people. A stablecoin can be held by millions, traded around the clock and sold in seconds, so a loss of confidence spreads fast.",
      },
      {
        type: "paragraph",
        children:
          "Stablecoins differ in what stands behind the promise. There are three main designs, and the most common keeps ordinary money in reserve.",
      },
      {
        type: "heading",
        level: 3,
        children: "Follow a fiat backed stablecoin from mint to burn",
      },
      {
        type: "paragraph",
        children:
          "A fiat-backed stablecoin is backed by reserves of ordinary money and similar assets, such as bank deposits and short-term government bonds. Kraken's learning centre names USDT (Tether) and USDC (USD Coin) as examples. Naming them describes the category and is not a recommendation.",
      },
      {
        type: "paragraph",
        children:
          "The mechanism works like the funfair booth. When an approved customer sends dollars to the issuer, the issuer creates, or mints, the same number of new tokens. When a customer returns tokens to the issuer for dollars, the issuer destroys, or burns, them. Kraken explains that minting and burning keep supply in line with demand. Many holders never deal with the issuer; they buy and sell on exchanges, where the market price usually stays close to US$1 because traders can profit from closing any gap.",
      },
      {
        type: "example",
        title: "Dollars on the move in Córdoba",
        children:
          "Lucía, a freelance designer in Córdoba, keeps part of her earnings in a dollar stablecoin on an exchange while she decides when to convert to pesos. She knows the token is a promise from a company, not a US bank account, and keeps only what she needs there. (This describes a common use, not a recommendation.)",
      },
      {
        type: "paragraph",
        children:
          "The weak point is the reserve. If it is smaller, riskier or harder to reach than claimed, the promise weakens. Some designs try to avoid trusting a company by using crypto as collateral instead.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look inside a crypto backed stablecoin",
      },
      {
        type: "paragraph",
        children:
          "Imagine a pawnshop in Naples that lends you €100 only if you leave a watch worth €150. The extra value protects the lender if the watch's price falls.",
      },
      {
        type: "paragraph",
        children:
          "A crypto-backed stablecoin works like that pawnshop. Users lock crypto as collateral in programs on a blockchain (called smart contracts, which Level 4 explains) and mint stablecoins against it. Because crypto prices swing, the collateral must be worth more than the stablecoins issued. Kraken calls this over-collateralisation. The best-known example is DAI, a crypto-collateralised stablecoin launched by MakerDAO, with single-collateral DAI in 2017; Maker has since rebranded parts of its ecosystem as Sky.",
      },
      {
        type: "formula",
        expression:
          "Collateral ratio = value of collateral ÷ value of stablecoins issued × 100%",
        explanation:
          "a ratio of 150% means every US$1 of stablecoin is backed by US$1.50 of crypto. If the collateral's price falls far enough, the system sells it to protect the peg.",
      },
      {
        type: "example",
        title: "Minting against ether in Hamburg",
        children:
          "Jonas in Hamburg locks ether worth US$1,500 and mints 1,000 dollar stablecoins (invented amounts for this example). His collateral ratio is 1,500 ÷ 1,000 × 100% = 150%. If ether falls by a third, his collateral is worth US$1,000, a ratio of 100%, and long before that point the system would have sold his collateral. Level 6 explains how these sales, called liquidations, work.",
      },
      {
        type: "paragraph",
        children:
          "The pawnshop analogy has a limit. A pawnbroker can wait for a buyer. On a blockchain the sale happens automatically, and in a crash many sales happen at once. Over-collateralisation buys safety with capital. The third design tried to do without collateral, with famous results.",
      },
      {
        type: "heading",
        level: 3,
        children: "Learn from the collapse of Terra s UST",
      },
      {
        type: "paragraph",
        children:
          'Picture a village in Andalusia where people trust that "village credits" can always be swapped for one euro\'s worth of shares in the village co-operative. That works while the shares are valuable. If everyone rushes to swap at once and the shares lose value, the promise collapses on itself.',
      },
      {
        type: "paragraph",
        children:
          "An algorithmic stablecoin relies on rules and a second token rather than reserves. Terra's UST was the best-known. According to the SEC's February 2023 charges against Terraform Labs and its founder Do Kwon, the company claimed UST would hold its dollar peg because it could be exchanged for Terra's other token, LUNA. It also advertised returns of as much as 20% on UST through a related service called the Anchor Protocol.",
      },
      {
        type: "definition",
        term: "Algorithmic stablecoin",
        children:
          "A stablecoin that tries to hold its peg mainly through automated rules for creating and destroying tokens, often linked to a second, volatile token, rather than through reserves of safe assets.",
      },
      {
        type: "paragraph",
        children:
          "In May 2022 the algorithmic stablecoin UST lost its US dollar peg and LUNA collapsed; tens of billions of US dollars in value were wiped out. The SEC said the prices of UST and related tokens fell close to zero. As holders swapped UST for LUNA, new LUNA flooded the market, its price fell, and confidence in the swap promise fell with it, a spiral Kraken's learning centre calls a \"death spiral\". The SEC alleged that Terraform and Kwon had misled investors about UST's stability.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          'A high yield on a "stable" coin is a question, not a gift. UST offered as much as 20% through Anchor. When a dollar token pays far more than ordinary savings, ask where the money comes from. Level 6 explores where yield comes from.',
      },
      {
        type: "paragraph",
        children:
          "Terra shows what happens when the backing disappears. For coins that do hold reserves, the next question is how you know.",
      },
      {
        type: "paragraph",
        children:
          "Hybrids can combine features, so these categories are useful guides rather than complete diagnoses.",
      },
    ],
  },
  {
    title: "Peg evidence, market sales and direct redemption",
    shortTitle: "Peg evidence, market sales and direct redemption",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Peg market price and reserve evidence",
      },
      {
        type: "paragraph",
        children:
          "A peg is a target relationship, such as one token intended to track USD 1. The market price is what buyers and sellers currently exchange. Reserves are assets held under a stated arrangement. These are distinct facts. A token can trade below its target even when the issuer reports reserves, because holders face eligibility, settlement, liquidity or confidence constraints.",
      },
      {
        type: "paragraph",
        children:
          "Read reserve composition, custodians, report date and the scope of verification. A past report does not establish present availability, all liabilities or immediate redemption for every holder. Also distinguish a token backed by a claim on another token from one backed by direct eligible reserves. The additional layer can transmit the other token's failure. Good analysis identifies both economic backing and the legal route available to the particular holder.",
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-3/lesson-4-rId31.png",
        width: 2036,
        height: 1350,
        alt: "A simplified fiat-reserve arrangement. Direct issuer redemption is available only to eligible holders under the actual terms.",
        caption:
          "A simplified fiat-reserve arrangement. Direct issuer redemption is available only to eligible holders under the actual terms.",
      },
      {
        type: "heading",
        level: 3,
        children: "Selling and direct redemption",
      },
      {
        type: "paragraph",
        children:
          "Selling on an exchange means accepting another trader's bid, with venue fees and liquidity limits. Redeeming from an issuer means using the issuer's stated process to exchange eligible tokens for a specified asset. Direct redemption may require an approved account, particular jurisdictions, minimums or other conditions. A retail holder may have access only to market selling rather than a direct issuer facility.",
      },
      {
        type: "paragraph",
        children:
          "For a particular product, read current terms and avoid generalising one issuer's rights to all stablecoins. Circle's published USDC terms, for example, describe eligibility and conditions rather than an unconditional bank-style cash withdrawal for every person holding the token. The course uses that as an example of why holder-specific terms matter, not as a recommendation.",
      },
      {
        type: "paragraph",
        children: "Questions behind a stablecoin label",
      },
      {
        type: "comparisonTable",
        columns: ["Question", "Evidence to inspect", "Possible limit"],
        rows: [
          [
            "What supports the peg",
            "Reserve or collateral mechanism",
            "Backing can change or weaken",
          ],
          [
            "Who can redeem",
            "Current legal and account terms",
            "Retail holder may be ineligible",
          ],
          [
            "Who can freeze",
            "Contract and issuer powers",
            "Transfers may be blocked",
          ],
          [
            "Which representation is held",
            "Network and contract identity",
            "Wrapper introduces extra dependencies",
          ],
          [
            "What price is available",
            "Executable market depth",
            "Target is not a guaranteed bid",
          ],
          [
            "What protection applies",
            "Applicable local law and product terms",
            "No automatic deposit insurance",
          ],
        ],
      },
      {
        type: "diagram",
        src: "/lessons/crypto/level-3/lesson-4-rId32.png",
        width: 1187,
        height: 556,
        alt: "The peg target, market sale and issuer redemption are distinct. None creates automatic bank deposit protection.",
        caption:
          "The peg target, market sale and issuer redemption are distinct. None creates automatic bank deposit protection.",
      },
    ],
  },
  {
    title: "Depegs, dependencies and a stablecoin checklist",
    shortTitle: "Depegs, dependencies and a stablecoin checklist",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Depegs freezes and network dependencies",
      },
      {
        type: "paragraph",
        children:
          "Imagine a shop voucher in Johannesburg worth R100 at the issuing store. If rumours spread that the store is in trouble, people may sell their vouchers to others for R90. The voucher still says R100, but the market says otherwise.",
      },
      {
        type: "paragraph",
        children:
          'A depeg is the same thing for a stablecoin: its market price moves away from its target. The BIS argues that stablecoins struggle with what it calls "singleness": because each is a claim on a different issuer, different stablecoins can trade at a discount or a premium depending on how much people trust each issuer. Its report shows stablecoins regularly trading away from parity.',
      },
      {
        type: "formula",
        expression:
          "Loss from selling during a depeg = number of tokens × (US$1 − market price)",
        explanation:
          "if you must sell while the price is below the peg, the gap is your loss. If you can wait and the peg recovers, you may avoid it; if the issuer fails, you may not.",
      },
      {
        type: "example",
        title: "The sudden dip in Osaka",
        children:
          "Hiroshi in Osaka holds 2,000 units of a dollar stablecoin to pay a bill. Bad news about the issuer's bank breaks and the price drops to US$0.95 (invented figures for this example). If he sells now, he loses 2,000 × (1 − 0.95) = US$100. Because he had planned ahead and the bill is not due for weeks, he does not need to sell in a panic.",
      },
      {
        type: "paragraph",
        children:
          "Depegs are one reason governments have started writing rules specifically for stablecoins.",
      },
      {
        type: "paragraph",
        children:
          "Issuers or contract administrators may have powers to freeze, block or alter specified operations. A genuine asset on one supported chain and a bridged version elsewhere may have different failure paths. Stability of the displayed price does not prove stability of access.",
      },
      {
        type: "heading",
        level: 3,
        children: "A complete stablecoin checklist",
      },
      {
        type: "paragraph",
        children:
          "Record the reference asset, design, reserves or collateral, issuer powers, direct-redemption eligibility, network, contract, market liquidity and custody. Then ask what happens during a reserve problem, bank delay, frozen address or bridge failure. A useful conclusion can be that the product does not fit the planned purpose, even if it has maintained the target recently.",
      },
      {
        type: "paragraph",
        children:
          "Do not treat a stablecoin as automatically insured cash. Bank deposit protection, where applicable, has specific beneficiaries and conditions; it does not arise simply from a dollar label. For a learner measuring trades in a stablecoin, both the traded asset and the quote token contribute risk. Later portfolio and DeFi lessons will revisit this shared dependency.",
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
          "A dollar label in a euro budget. Amira in France holds 100 fictional dollar-linked tokens. If each trades at USD 0.90, their market value is USD 90 before selling costs. The label USD 1 target does not make the immediate sale worth USD 100. If Amira needs euros, the USD/EUR conversion matters too. Her account could also restrict withdrawals even at a stable market price. She therefore separates peg risk, currency exposure and access risk instead of calling the token cash.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A stablecoin is not automatically an insured bank deposit or risk-free quote asset.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. Value 250 tokens at USD 0.96 before costs.",
          "2. Why might issuer reserves not guarantee your immediate redemption?",
          "3. Name one extra risk introduced by a bridged representation.",
        ],
        answers: [
          "1. 250 × 0.96 equals USD 240, a USD 10 difference from the USD 250 target value.",
          "2. Eligibility, jurisdiction, minimums, account approval, reserve availability and operational terms may limit the holder's route.",
          "3. Bridge custody, contract failure, operator behaviour or redemption limits can affect the representation independently of the underlying token.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is market sale at the current bid the same as direct issuer redemption?",
        ],
        answers: [
          "Answer. No. They involve different counterparties, prices, conditions and access rights.",
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
          "A peg is a target relationship.",
          "Reserves and your redemption rights must both be examined.",
          "A stable quote can conceal access or wrapper risk.",
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
            title: "Circle: USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
          },
          {
            title: "Circle: USDC Risk Factors",
            url: "https://www.circle.com/legal/usdc-risk-factors",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
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
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
            url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
          },
          {
            title:
              "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
            url: "https://www.sec.gov/newsroom/press-releases/2023-32",
          },
          {
            title:
              "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
            url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
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
  course: "crypto-exchanges-and-markets",
  description:
    "Assess provider exposure and prepare records before a service interruption.",
  estimatedMinutes: 17,
  learningPath: "crypto",
  level: "level-3",
  module: "exchanges-stablecoins-and-orders",
  objectives: [
    "Assess provider exposure and prepare records before a service interruption.",
  ],
  position: 5,
  prerequisites: ["stablecoins-and-peg-promises"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["stablecoins-and-peg-promises"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Assess provider exposure and prepare records before a service interruption.",
  seoTitle: "Deposits, Withdrawals and Exchange Failure",
  slug: "crypto-deposits-withdrawals-and-exchange-failure",
  sources: [
    {
      title: "Kraken: How to deposit cryptocurrencies to your Kraken account",
      url: "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
    },
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "FINRA: Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "Kraken: Proof of Reserves",
      url: "https://www.kraken.com/gb/proof-of-reserves",
    },
    {
      title:
        "PCAOB: Investor Bulletin on claims about PCAOB registration and oversight",
      url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title: "FCA: Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "Glassnode: Exchange Data Transparency Notice",
      url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    },
    {
      title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
      url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
    },
    {
      title:
        "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
    {
      title:
        "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
      url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
    },
    {
      title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
      url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
    },
    {
      title:
        "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
      url: "https://www.sec.gov/newsroom/press-releases/2023-32",
    },
    {
      title:
        "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
      url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
    },
    {
      title:
        "Mt. Gox Rehabilitation Trustee: Mt. Gox Rehabilitation Trustee — Official notices",
      url: "https://www.mtgox.com",
    },
    {
      title:
        "US Department of Justice: US Department of Justice — Samuel Bankman-Fried Sentenced to 25 Years",
      url: "https://www.justice.gov/archives/opa/pr/samuel-bankman-fried-sentenced-25-years-his-orchestration-multiple-fraudulent-schemes",
    },
    {
      title:
        "Federal Trade Commission: Federal Trade Commission — FTC reaches settlement with crypto platform Celsius Network; charges former executives (13 July 2023)",
      url: "https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-reaches-settlement-crypto-platform-celsius-network-charges-former-executives-duping-consumers",
    },
    {
      title: "OSC staff: QuadrigaCX review",
      url: "https://www.osc.gov.on.ca/quadrigacxreport/",
    },
  ],
  status: "published",
  title: "Deposits, Withdrawals and Exchange Failure",
};
const sections5: LessonSection[] = [
  {
    title: "Deposits, withdrawals, fees and holds",
    shortTitle: "Deposits withdrawals fees and holds",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Assess provider exposure and prepare records before a service interruption.",
      },
      {
        type: "paragraph",
        children:
          "Leaving an asset on an exchange means relying on a provider as well as the network. A confirmed deposit, an internal balance and an available withdrawal describe different stages. This lesson connects the transfer checklist to custody review and shows how to read reassuring phrases such as proof of reserves, audited and insured without stretching their meaning.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Read the method and customer rights behind reassuring labels.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "paragraph",
        children:
          "For a deposit, verify the exact asset, network, contract where relevant, address, memo, minimum and crediting policy. For a withdrawal, verify the destination and the provider's supported route, charges and limits. An exchange can support an asset for trading while offering only certain deposit or withdrawal networks. Read current instructions for the direction you intend to use.",
      },
      {
        type: "paragraph",
        children:
          "Track the network transaction and account posting separately. A deposit can be confirmed but awaiting provider credit. An internal transfer between customers may update the provider's records without a corresponding public transaction for that exact event. A withdrawal request may be pending review before a transaction ID exists. These stages help distinguish a network delay from a service delay, and reduce the risk of sending duplicate deposits because the account screen has not updated.",
      },
      {
        type: "paragraph",
        children:
          "The transfer checking lesson in Level 2 showed that the same token can exist on several networks, and that sender and receiver must use the same one. Stablecoins are the classic case: one dollar stablecoin may be offered on several networks, each with a different withdrawal fee. The cheapest is useless if the receiver does not support it. Check the receiver's deposit page, pick a network it lists, include any memo, and send a small test first.",
      },
      {
        type: "formula",
        expression:
          "Amount received = amount withdrawn − withdrawal fee; Round-trip cost = deposit fee + conversion cost + withdrawal fee",
        explanation:
          "the first line tells you what actually arrives. The second adds up everything between your bank and your destination, so you can compare routes.",
      },
      {
        type: "example",
        title: "Moving savings in Edinburgh",
        children:
          "Emma in Edinburgh deposits £1,000 by bank transfer (no fee), converts it to a dollar stablecoin at a cost of about 0.5% (£5), and withdraws to her own wallet with a fee worth £2 on the network her wallet supports (invented figures for this example). Her round trip costs about £7, or 0.7%. A cheaper network was offered, but her wallet does not support it, so she ignores it.",
      },
      {
        type: "paragraph",
        children:
          "With the coins, the rules and the routes in place, practise putting them together.",
      },
    ],
  },
  {
    title: "What a displayed account balance means",
    shortTitle: "What a displayed account balance means",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Ask what you are owed when coins sit on a platform",
      },
      {
        type: "paragraph",
        children:
          "Leave your coat at a theatre cloakroom in Buenos Aires and you get a numbered ticket. Usually the ticket brings your coat back. But if the cloakroom attendant has lent coats out, or the theatre has gone bust, the ticket is only a claim, and you may be one of many people holding one.",
      },
      {
        type: "paragraph",
        children:
          "The exchange and order lessons in Level 3 showed that an exchange balance works like that ticket. The coins sit in wallets the company controls, and you hold a promise. The risk that the other side of a promise fails to keep it is called counterparty risk. The SEC's December 2025 investor bulletin on custody puts it plainly: if a third-party custodian is hacked, shuts down or goes bankrupt, you may lose access to your crypto.",
      },
      {
        type: "definition",
        term: "Counterparty risk",
        children:
          "The risk that the person or company you rely on, such as an exchange holding your crypto, cannot or will not do what it promised.",
      },
      {
        type: "paragraph",
        children:
          "The cloakroom analogy stops working in one way. A theatre's cloakroom is rarely in the news. Crypto platforms have failed often enough, and with big enough losses, that their stories form a short history of what can go wrong. Before reading them, it helps to sort failures into types.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tell hacks insolvency and fraud apart",
      },
      {
        type: "paragraph",
        children:
          "A shop in Marseille can close for three different reasons: burglars empty it, it runs out of money, or the owner has been stealing from it. Customers suffer in each case, but the causes and the warning signs differ.",
      },
      {
        type: "paragraph",
        children:
          "Crypto platforms fail in the same three ways, and often in a mixture. A hack is theft by outsiders, usually from hot wallets or through stolen keys. An insolvency means the company owes more than it holds, perhaps after bad loans or trading losses. Fraud means insiders lie about what they hold or misuse customers' assets.",
      },
      {
        type: "comparisonTable",
        columns: ["Type", "What happens", "Early signs customers might see"],
        rows: [
          [
            "Hack",
            "Outsiders steal crypto from the platform's wallets",
            'Sudden "maintenance", paused withdrawals, on-chain outflows reported',
          ],
          [
            "Insolvency",
            "Losses leave the company owing more than it holds",
            "Withdrawal limits, delays, urgent fundraising, falling prices of its own token",
          ],
          [
            "Fraud",
            "Insiders misuse or hide customer assets",
            "Opacity, implausible yields, refusal to show audited accounts",
          ],
        ],
        caption: "Three ways a platform fails",
      },
      {
        type: "paragraph",
        children:
          "The four cases below show each type, and how they overlap. The first is the oldest.",
      },
      {
        type: "paragraph",
        children:
          "The provider may apply withdrawal limits, hold periods, compliance checks or temporary suspensions. Some restrictions are legitimate operational controls; others may indicate deeper problems. Do not infer the cause from one symptom alone. An account screen may become unavailable precisely when it is needed. Records help reconcile activity and support claims, though they cannot guarantee repayment.",
      },
    ],
  },
  {
    title: "Lessons from platform failures",
    shortTitle: "Lessons from platform failures",
    blocks: [
      {
        type: "paragraph",
        children:
          "A provider can fail because of losses, fraud, operational disruption or legal proceedings. Customer assets may be segregated, pooled, lent, pledged or managed by subcontractors depending on the arrangement. Insolvency rights depend on applicable law and terms, not merely on the word custody. A customer may become a claimant in a process rather than receive immediate on-chain withdrawal.",
      },
      {
        type: "paragraph",
        children:
          "Trace outsourced custody and other parties where disclosed. Multiple service names can rely on one underlying custodian, creating concentration that is not obvious from the logos. Ask how the provider handles client assets, what claims customers have and which disclosures are independently verifiable. The course does not certify any exchange; it teaches questions that prevent a convenient interface from being mistaken for an unconditional ownership guarantee.",
      },
      {
        type: "paragraph",
        children: "Interpret evidence within its boundary",
      },
      {
        type: "comparisonTable",
        columns: [
          "Evidence",
          "Useful question it can address",
          "Further question remains",
        ],
        rows: [
          [
            "On-chain holdings",
            "What specified addresses hold now",
            "Who controls them and what obligations exist",
          ],
          [
            "Liability inclusion check",
            "Whether a stated account enters a reported set",
            "Whether all liabilities are covered",
          ],
          [
            "Financial audit",
            "Specified financial statements and period",
            "Current liquidity and product-specific rights",
          ],
          [
            "Regulatory registration",
            "Status for a defined activity",
            "Scope of customer protection",
          ],
          [
            "Insurance policy",
            "Named covered event and beneficiary",
            "Exclusions limits and claim procedure",
          ],
        ],
      },
      {
        type: "heading",
        level: 3,
        children: "Mt Gox 2014 a hack and a decade long wait",
      },
      {
        type: "paragraph",
        children:
          "Mt. Gox was a Tokyo-based Bitcoin exchange. In February 2014 it suspended withdrawals and entered insolvency proceedings after a major loss of BTC. The case became a long-running rehabilitation and repayment process, with notices issued through the court-appointed trustee.",
      },
      {
        type: "example",
        title: "Records through a long wait",
        children:
          "Kenji in Nagoya is a fictional customer caught by a platform failure. He preserves his account statements, claim evidence and the official case contact route through job changes and house moves. A message claiming to be the trustee is checked against the genuine notice rather than answered immediately.",
      },
      {
        type: "paragraph",
        children:
          "The lesson is about access and time. Even where some value is eventually recovered, it may be unavailable for years and paid under rules different from the holder's expectations. Deadlines and repayment status change; use the current official trustee notice for an actual case. Never infer present repayment instructions from an old course paragraph.",
      },
      {
        type: "heading",
        level: 3,
        children: "QuadrigaCX 2019 fraud behind a founder s death",
      },
      {
        type: "paragraph",
        children:
          "QuadrigaCX was a Canadian trading platform that ceased operations in 2019. The public story initially focused on its founder's death and inaccessible keys. The Ontario Securities Commission staff's 2020 review found that much of the shortfall instead arose from fraudulent trading and misuse of customer assets.",
      },
      {
        type: "paragraph",
        children:
          "The staff described accounts credited with fictitious balances, losses covered with other customers' deposits, and weak oversight. Its report is a staff assessment of reviewed evidence, rather than a finding tested by an OSC tribunal. That distinction belongs beside the case, not hidden in a footnote.",
      },
      {
        type: "paragraph",
        children:
          "A customer could not see those underlying activities simply by reading a displayed account balance. Ask about custody, liabilities, internal controls and conflicts of interest. A convenient dashboard can accurately display the provider's own record while that provider lacks the assets needed to honour it.",
      },
      {
        type: "heading",
        level: 3,
        children: "FTX November 2022 customer money sent next door",
      },
      {
        type: "paragraph",
        children:
          "FTX failed in November 2022. Its founder Sam Bankman-Fried was convicted of fraud in 2023 and sentenced in March 2024. The US Department of Justice described the misuse of customer funds, including transfers supporting Alameda Research and other purposes.",
      },
      {
        type: "example",
        title: "A balance that remained on screen",
        children:
          "Grace in Leeds is a fictional customer with £3,000 shown on a platform account. The number stays visible until withdrawals stop. The display cannot tell her whether matching assets are segregated, lent, pledged or already missing.",
      },
      {
        type: "paragraph",
        children:
          "The practical lesson is to investigate customer rights and related-party access before relying on a custodian. Bankruptcy distributions follow their own case rules and valuation methods. A promise of repayment in national currency is not necessarily return of the same number of coins.",
      },
      {
        type: "heading",
        level: 3,
        children: "Celsius 2022 safety and high yield both promised",
      },
      {
        type: "paragraph",
        children:
          "Celsius was a crypto lending platform that marketed rewards on customer deposits. It paused withdrawals in June 2022 and filed for bankruptcy the following month. Official consumer-protection proceedings described misleading assurances about asset safety and access.",
      },
      {
        type: "paragraph",
        children:
          "A lending platform is different from an ordinary spot exchange even when both show a wallet-shaped balance. To fund rewards, a business may lend, invest or otherwise expose deposited assets. Those activities can create credit, liquidity and custody risks.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Trace the reward and the principal. A high advertised yield is not itself proof of fraud, but it needs a clear funding explanation. Ask which activity pays it, who bears losses, and whether you can exit under stress. A label such as savings or earn does not create bank-deposit protection.",
      },
      {
        type: "heading",
        level: 3,
        children: "See the common thread commingling",
      },
      {
        type: "paragraph",
        children:
          "Commingling means combining assets rather than maintaining the separation promised or required by the arrangement. Pooling customer holdings, mixing them with company assets, and lending or pledging them are related issues that should be investigated separately.",
      },
      {
        type: "paragraph",
        children:
          "A shared blockchain wallet does not by itself prove misuse: a custodian can use omnibus addresses while keeping an accurate customer ledger. Conversely, a separate-looking address does not by itself establish insolvency protection. Legal title, accounting, contractual permissions and actual controls matter.",
      },
      {
        type: "paragraph",
        children:
          "Ask whether assets can be reused, who must consent, how customer entitlements are recorded, and which law governs a failure. Segregation can support protection under applicable rules, but a diagram showing a wall between assets cannot settle every creditor's rights.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know what bankruptcy can mean for customers",
      },
      {
        type: "paragraph",
        children:
          "In a failure, a court, administrator or trustee may collect assets, verify claims and distribute value according to applicable law. Claim priority, valuation date, currency and available recovery differ by case.",
      },
      {
        type: "example",
        title: "A claim with a fixed valuation",
        children:
          "Rafael in Brazil has a fictional 0.5 BTC balance when the supplied valuation price is US$20,000. Under this example's stated rule, the claim is US$10,000. If BTC later costs US$60,000, that cash buys about 0.1667 BTC before costs. Full payment of the example's dollar claim does not return 0.5 BTC.",
      },
      {
        type: "paragraph",
        children:
          "This is arithmetic under a supplied case rule, not a universal bankruptcy formula. Keep account records and obtain deadlines through the genuine court or trustee route. Be wary of unsolicited claim buyers, invented recovery charges and messages asking for signing secrets.",
      },
    ],
  },
  {
    title: "Proof of reserves within its actual scope",
    shortTitle: "Proof of reserves within its actual scope",
    blocks: [
      {
        type: "paragraph",
        children:
          "A proof-of-reserves exercise can provide evidence about specified assets, liabilities or customer inclusion at a point in time under a stated method. Read the date, asset coverage, liability coverage, verifier and exclusions. Evidence that selected addresses hold assets does not by itself establish every corporate liability, control over encumbered assets or future withdrawal liquidity.",
      },
      {
        type: "paragraph",
        children:
          "Some systems let a customer check inclusion of a balance in a liability set. That is useful within its stated scope, but does not show all off-platform obligations or rule out later changes. A report's name should not be expanded into a complete solvency conclusion. Compare what the methodology actually tests with the claim being made in marketing.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a savings club in Bengaluru that lets each member check that their name and balance appear on the treasurer's list, and lets an outside accountant count the cash in the box on one particular day. That is reassuring, but it does not show whether the treasurer borrowed money to fill the box for that day, or owes money elsewhere.",
      },
      {
        type: "paragraph",
        children:
          "Proof of reserves works in a similar way. Kraken describes its version as a procedure carried out by an independent accountant. Customer balances are anonymised and combined into a Merkle tree, a structure that produces one cryptographic fingerprint (using the hashing you met in Level 1) for all the balances at a snapshot time. Each customer can check that their balance was included, and the accountant checks the total against the assets the exchange holds.",
      },
      {
        type: "definition",
        term: "Proof of reserves",
        children:
          "A report showing that, at a single point in time, a provider controlled at least enough of certain assets to cover the customer balances included in the check.",
      },
      {
        type: "formula",
        expression: "Reserve ratio = assets held ÷ customer balances × 100%",
        explanation:
          "a ratio above 100% suggests the provider held more of that asset than it owed customers at the snapshot. It says nothing about other debts the company may have.",
      },
      {
        type: "paragraph",
        children:
          "The limits matter. The SEC's July 2023 investor bulletin warned that these reports are not full financial statements, may leave out liabilities, show only a moment in time, and may be produced by firms outside audit regulators' oversight and independence standards. Kraken itself lists limits: the process cannot prove exclusive control of keys, identify hidden claims on the assets, or show that assets were not borrowed temporarily for the review. Coverage may also be limited to a few listed assets.",
      },
      {
        type: "example",
        title: "Checking the entry in Busan",
        children:
          "Ji-woo in Busan opens her exchange's proof-of-reserves page, finds her account's entry and confirms her balance was included in the latest snapshot. She notes the date, which assets were covered and who carried out the check, and reminds herself that the report does not show the company's loans or other debts.",
      },
      {
        type: "paragraph",
        children:
          "Proof of reserves looks at the company. The next check looks at your own account.",
      },
    ],
  },
  {
    title: "Reports, insurance, warning signs and an incident plan",
    shortTitle: "Reports insurance warning signs and an incident plan",
    blocks: [
      {
        type: "paragraph",
        children:
          "An audit examines specified financial statements under a defined engagement. An attestation reports on a specified subject and criteria. Registration indicates a particular status with a particular authority. Insurance covers named risks, beneficiaries, limits and exclusions. These terms can matter, but they do not mean the same thing and none should be assumed to cover every customer loss.",
      },
      {
        type: "paragraph",
        children:
          "Check the underlying document, date and jurisdiction. A proposal or consultation is not enacted law, and a registration focused on one activity is not approval of every token. Ask whether insurance covers customer account compromise, provider losses or only a narrow theft event, and who receives any payment. Keep exportable records and a plan for provider unavailability. Good custody review combines documented rights, operational access and financial evidence rather than relying on a single badge.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch for the warning signs",
      },
      {
        type: "paragraph",
        children:
          "The FCA reminds people to be prepared to lose all their money in crypto, and the four cases show how that can happen. They also left clues. None proves a failure is coming, but each is a reason to look harder.",
      },
      {
        type: "paragraph",
        children:
          'Watch for withdrawal pauses, limits or delays, especially when the explanation keeps changing or the "temporary" pause keeps being extended. Watch for unexplained high yields: if you cannot see where the return comes from, the risk may be yours. Watch for opacity: no audited accounts, vague custody terms, or proof of reserves presented as if it were an audit, which the SEC warned against in 2023. Watch for conflicts, such as a sister trading firm or a platform betting with customers\' money. And watch for regulatory warnings about the firm, and for staff or leaders leaving suddenly.',
      },
      {
        type: "comparisonTable",
        columns: ["Sign", "Seen in", "Sensible response"],
        rows: [
          [
            "Withdrawals paused or limited",
            "Mt. Gox, Celsius",
            "Do not deposit more; check official news; read your terms",
          ],
          [
            "Yields far above ordinary savings",
            "Celsius",
            "Ask where the yield comes from; if unclear, stay out",
          ],
          [
            "Hidden or fictional balances",
            "QuadrigaCX, FTX",
            "Prefer providers with audited accounts and clear custody terms",
          ],
          [
            "Related company with special access",
            "FTX",
            "Treat as a serious conflict of interest",
          ],
          [
            'Fake trustee or "recovery" contacts',
            "Mt. Gox and others",
            "Use only official court or trustee sites; never pay a fee to recover",
          ],
        ],
        caption: "Warning signs and what to do",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "By the time withdrawals stop, it is usually too late to act. Reduce your exposure in calm times, not in a panic.",
      },
      {
        type: "paragraph",
        children:
          "That leads to the practical question: how much should sit with any one provider?",
      },
      {
        type: "heading",
        level: 3,
        children: "Reduce your exposure to any one provider",
      },
      {
        type: "paragraph",
        children:
          "Families in Mumbai sometimes keep savings in more than one bank, some cash at home and some gold, so that one problem cannot take everything. The same idea applies here.",
      },
      {
        type: "paragraph",
        children:
          "First, keep on any exchange only what you need for trading or near-term spending. Second, spread larger holdings so no single provider holds most of them. Third, consider moving long-term holdings to self-custody when appropriate, but only once you can manage keys and backups confidently, as Level 2 taught; self-custody removes exchange risk and adds your own responsibility. Fourth, make a small test withdrawal now and then, so you know the route works. Fifth, avoid leveraged products on any platform: as the exchange and order lessons in Level 3 explained, a derivatives position adds liquidation risk on top of the platform's own risk.",
      },
      {
        type: "formula",
        expression:
          "Exposure share = value held with one provider ÷ total crypto value × 100%",
        explanation:
          "the higher the share, the more one failure can hurt. There is no correct number; Level 8 helps you set personal limits.",
      },
      {
        type: "example",
        title: "Spreading the risk in Curitiba",
        children:
          "Ana in Curitiba holds R$20,000 of crypto, with R$18,000 on one exchange (invented amounts for this example). Her exposure share there is 18,000 ÷ 20,000 × 100% = 90%. She keeps R$2,000 on the exchange for planned purchases and, after practising recovery with a small test, moves the rest to a hardware wallet she has backed up. Her exchange exposure falls to 10%.",
      },
      {
        type: "paragraph",
        children:
          "Keep records as you go: account statements, deposit and withdrawal confirmations, and your provider checklist from the provider checking lessons in Level 3. They also help if the worst happens.",
      },
      {
        type: "paragraph",
        children:
          "Fire drills in offices in Seoul feel pointless until the alarm rings. Deciding in advance what you would do saves panic.",
      },
      {
        type: "paragraph",
        children:
          "Write a short plan. If a platform freezes withdrawals, you would download or screenshot your balances and transaction history while you still can, read only the platform's official announcements, and watch your regulator's website. You would not send more money to \"unlock\" funds, and you would ignore anyone who contacts you offering recovery for a fee. If a bankruptcy follows, you would file a claim only through the official court or trustee site and keep every confirmation. Now practise the ideas in this lesson.",
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
          "The storage company's inventory photo. A furniture storage company in Australia publishes a photo of a warehouse full of boxes. That photo may show assets exist, but it does not tell each customer whether their box is included, whether the company owes other debts or whether the building will be accessible tomorrow. A reserve statement can be more rigorous than a photo, yet its scope still matters. A learner reviewing AUD-denominated account exposure must examine assets, obligations and customer rights together.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "No proof-of-reserves snapshot alone guarantees complete solvency or future withdrawal access.",
      },
      {
        type: "practice",
        title: "Try it yourself",
        prompts: [
          "1. A withdrawal shows pending with no transaction ID. Is it necessarily waiting in a blockchain mempool?",
          "2. A report covers BTC balances on one date. Can it prove all corporate solvency today?",
          "3. List three account records to keep independently.",
        ],
        answers: [
          "1. No. The provider may not have broadcast a transaction. Check the request stage through official records.",
          "2. No. Asset coverage, liabilities, encumbrances, dates and subsequent events remain relevant.",
          "3. Trades and fills, deposits and withdrawals with transaction IDs, fees and periodic balance records. Preserve relevant terms and notices too.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does insured mean every customer loss is reimbursed?"],
        answers: [
          "Answer. No. Read the covered event, beneficiary, limits, exclusions and claim terms.",
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
          "Provider records and network records are separate.",
          "Custody can involve several counterparties.",
          "Evidence should support only the claim its scope tests.",
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
            title:
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "FINRA: Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title: "Kraken: Proof of Reserves",
            url: "https://www.kraken.com/gb/proof-of-reserves",
          },
          {
            title:
              "PCAOB: Investor Bulletin on claims about PCAOB registration and oversight",
            url: "https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-bulletin-comment-proposal-protect-investors-false-misleading-statements-pcaob-registration-oversight",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities: Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "Glassnode: Exchange Data Transparency Notice",
            url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
          },
          {
            title: "ESMA: ESMA — Markets in Crypto-Assets Regulation (MiCA)",
            url: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
          },
          {
            title:
              "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
          {
            title:
              "FATF: FATF — Targeted update on implementation of the FATF standards on virtual assets and VASPs",
            url: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Targeted-update-virtual-assets-vasps.html",
          },
          {
            title: "Coinbase Learn: Coinbase Learn — What is a stablecoin?",
            url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-stablecoin",
          },
          {
            title:
              "US SEC: US SEC — SEC charges Terraform and CEO Do Kwon with defrauding investors (16 February 2023)",
            url: "https://www.sec.gov/newsroom/press-releases/2023-32",
          },
          {
            title:
              "BIS: BIS — Annual Economic Report 2025, Chapter III: The next-generation monetary and financial system",
            url: "https://www.bis.org/publ/arpdf/ar2025e3.htm",
          },
          {
            title:
              "Mt. Gox Rehabilitation Trustee: Mt. Gox Rehabilitation Trustee — Official notices",
            url: "https://www.mtgox.com",
          },
          {
            title:
              "US Department of Justice: US Department of Justice — Samuel Bankman-Fried Sentenced to 25 Years",
            url: "https://www.justice.gov/archives/opa/pr/samuel-bankman-fried-sentenced-25-years-his-orchestration-multiple-fraudulent-schemes",
          },
          {
            title:
              "Federal Trade Commission: Federal Trade Commission — FTC reaches settlement with crypto platform Celsius Network; charges former executives (13 July 2023)",
            url: "https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-reaches-settlement-crypto-platform-celsius-network-charges-former-executives-duping-consumers",
          },
          {
            title: "OSC staff: QuadrigaCX review",
            url: "https://www.osc.gov.on.ca/quadrigacxreport/",
          },
        ],
      },
    ],
  },
];

export const cryptoLevel3Lessons: LessonDocument[] = [
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
