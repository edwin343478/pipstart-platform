import type { LessonSection } from "../../lesson-content";

export const marketParticipantsSections: LessonSection[] = [
  {
    title: "Many people need currencies",
    shortTitle: "Who participates",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "The Forex market includes central banks, commercial banks, companies, investment funds, brokers and individual traders. Each group participates for different reasons and with very different resources.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "A parent paying tuition abroad, a store ordering imported supplies, and a company receiving export payments all need currencies. Financial institutions help handle larger flows, and some market users manage risk or speculate on price moves. Their reasons, tools, and financial resources differ.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Different participants, different needs",
        columns: ["Participant", "Typical purpose", "Everyday connection"],
        rows: [
          [
            "Households",
            "Travel, purchases, or family payments",
            "A Japanese parent pays for a US book.",
          ],
          [
            "Businesses",
            "Imports, exports, or hedging existing bills",
            "A Mexican importer needs dollars to pay a supplier.",
          ],
          [
            "Commercial banks and dealers",
            "Customer service, funding, inventories, and managing exposures",
            "A bank handles a business payment and quotes a rate.",
          ],
          [
            "Investment funds",
            "Overseas investing, hedging, or taking exposures",
            "A UK fund holds US assets and faces USD/GBP changes.",
          ],
          [
            "Central banks",
            "Monetary policy, reserves, and sometimes intervention",
            "Policy can affect demand for a currency.",
          ],
          [
            "Brokers and agents",
            "Arrange access or route transactions under disclosed terms",
            "A service helps a customer reach a counterparty.",
          ],
          [
            "Retail speculators",
            "Attempt to profit from currency-price changes",
            "A person takes a position without an underlying foreign bill.",
          ],
        ],
      },
    ],
  },
  {
    title: "Banks, dealers and providers",
    shortTitle: "Dealers and agents",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A dealer may quote a bid and an ask and stand on the other side of a customer's off-exchange transaction. Another service may route or arrange orders differently. The words 'broker' and 'dealer' are sometimes used loosely in marketing, so read the account terms: who is your counterparty, how are prices set, and what happens when you want to withdraw?",
        ],
      },
      {
        type: "example",
        title: "A bus ticket agent",
        children: [
          "A ticket agent may sell directly from their own allocation, or arrange a seat with an operator. You would want to know who actually owes you the seat if plans change. In an OTC Forex account, identifying who owes you the currency transaction matters even more.",
        ],
      },
      {
        type: "warning",
        children:
          "In many retail OTC Forex arrangements, a customer trades against the dealer rather than on a centralized exchange. Check the provider and its terms before giving it money or personal information.",
      },
    ],
  },
  {
    title: "Businesses and risk management",
    shortTitle: "Business needs",
    blocks: [
      {
        type: "example",
        title: "The bakery's flour bill",
        children: [
          "A bakery in South Africa orders flour priced in US dollars. If the exchange rate moves before payment, the bill measured in rand may change. The bakery may plan its purchases or use a currency product to reduce uncertainty. Managing a real bill is different from opening a leveraged retail position simply because someone expects a chart to rise. The same market can serve very different purposes.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Large institutions may use spot, forwards, swaps, or other contracts. At this beginner level, it is enough to see why different users appear in the market; each instrument's rules and risks require separate learning.",
        ],
      },
    ],
  },
  {
    title: "The individual learner's place",
    shortTitle: "Your learning role",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A retail learner may see a simple app interface and assume they are competing on equal terms with a large bank. In reality, participants differ in information, execution, costs, and capital. You do not need to imitate an institution to learn. An account balance is not a measure of skill, and there is no need to fund a live account to finish this level.",
        ],
      },
      {
        type: "warning",
        children:
          "A large market and a polished app do not guarantee that a particular provider is trustworthy. Verify its identity and registration where relevant, read the risk disclosure, and keep your one-time codes private.",
      },
    ],
  },
  {
    title: "A real-life worked example",
    shortTitle: "Worked example",
    blocks: [
      {
        type: "example",
        title: "Everyday example",
        children: [
          "An importer in Mexico owes a US supplier US$1,000 next month. At a fictional 18 Mexican pesos per dollar, the bill is MXN 18,000. At 19 pesos per dollar it would be MXN 19,000, an extra MXN 1,000. The importer may look for a way to manage that payment uncertainty. A tourist exchanging cash has a smaller and immediate need. A speculator has a different motive: taking rate risk in the hope of a gain.",
        ],
      },
      {
        type: "exercise",
        prompt:
          "Work it through. Identify who needs the currency, when they need it, and whether their main goal is a payment or a profit from a price change. These motives should not be confused.",
      },
      {
        type: "comparisonTable",
        caption: "The Mexican importer's unchanged US$1,000 invoice",
        columns: ["Assumed USD/MXN", "Dollar bill", "Peso cost before charges"],
        rows: [
          ["18 MXN per USD", "US$1,000", "MXN 18,000"],
          ["19 MXN per USD", "US$1,000", "MXN 19,000"],
          ["Difference", "Same dollar invoice", "MXN 1,000 more"],
        ],
      },
    ],
  },
  {
    title: "Follow a payment through the network",
    shortTitle: "Payment network",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "A Mexican importer owing US$1,000 has a real dollar bill. Its bank or payment provider may source dollars through its own inventory or another institution, quote a price and charge for the service. A fund holding US assets may hedge a currency exposure. A central bank may influence rates through policy or, in some circumstances, intervention. A retail learner using a dealer's app sees only the terms offered on that account. These participants can all affect currency demand, but their time horizons and purposes differ.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Distinguish a dealer from an agent. In an OTC transaction the dealer may be your contractual counterparty and quote both sides. An agency arrangement may route an order to a venue or another counterparty, but the exact routing, mark-up, commission and fill policy need to be disclosed. “Direct market access” or “institutional liquidity” is marketing until the agreement explains what actually happens. Ask who records the position, who owes a withdrawal, and which body can hear a complaint.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/market-participants-guide.svg",
        desktopSrc:
          "/images/lessons/forex/market-participants-guide-desktop.svg",
        alt: "A Mexican importer needs 1,000 US dollars for a supplier invoice. Its bank or payment provider quotes a conversion under its own arrangements. The supplier receives the agreed dollar payment. The participants have different roles and responsibilities.",
        caption:
          "A Mexican importer needs 1,000 US dollars for a supplier invoice. Its bank or payment provider quotes a conversion under its own arrangements. The supplier receives the agreed dollar payment. The participants have different roles and responsibilities.",
        width: 600,
        height: 525,
      },
    ],
  },
  {
    title: "Understand the tools that institutions use",
    shortTitle: "Spot and contracts",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A first look at common currency arrangements",
        columns: ["Arrangement", "Plain-language purpose", "Important limit"],
        rows: [
          [
            "Spot",
            "Exchange currencies for near-term settlement under the agreement.",
            "Spot does not always mean physical cash changes hands instantly.",
          ],
          [
            "Forward",
            "Agree terms today for a currency transaction at a later date.",
            "A contract creates obligations and counterparty exposure.",
          ],
          [
            "FX swap",
            "Combine an exchange with an agreed reverse exchange later.",
            "Funding and currency obligations require their own analysis.",
          ],
          [
            "Option",
            "Pay for a contractual right under specified terms.",
            "The premium and product rules matter.",
          ],
          [
            "Currency futures",
            "Use a standardized exchange-traded contract.",
            "Contract size, expiry, margin, and settlement rules still apply.",
          ],
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "These names explain why institutions may use Forex beyond guessing the next chart move. They are an introduction, not a guide to using those products. A business can reduce one uncertainty while taking on another cost or obligation.",
          "A Mexican importer can decide to buy dollars before a bill is due, or discuss a forward with an appropriate provider. Buying early ties up money; a forward has agreed terms and credit considerations. The goal is to manage an existing obligation, not to turn every business into a currency speculator.",
        ],
      },
    ],
  },
  {
    title: "Ask practical questions about the provider",
    shortTitle: "Know who owes what",
    blocks: [
      {
        type: "section",
        title: "",
        paragraphs: [
          "Separate the provider's brand name from the legal entity in the agreement. The firm taking your deposit may differ from the group advertised on the website. Check who holds funds, who records the position, who quotes the price, and who handles a complaint.",
          "A dealer being the counterparty creates interests that need to be understood and managed; it is not by itself proof of fraud. Equally, an agency label or a claim of institutional liquidity is not proof that every order is routed as you imagine. Read the disclosed execution model and costs.",
        ],
      },
      {
        type: "keyPoint",
        title: "Questions to take to the next level",
        points: [
          "What is the legal name of the entity in my agreement?",
          "Is the service a dealer, an agent, or another arrangement?",
          "How are quotes, mark-ups, commissions, and fills determined?",
          "What are the funding and withdrawal terms?",
          "Which regulator or complaint process applies to this product and jurisdiction?",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "CFTC and SEC references describe US arrangements; they are useful background, not a promise that US protections apply to an account opened elsewhere. Check the relevant authority and product rules in your own circumstances.",
        ],
      },
    ],
  },
  {
    title: "How participants affect prices without revealing the next move",
    shortTitle: "Prices and liquidity",
    blocks: [
      {
        type: "definition",
        term: "Liquidity",
        children:
          "How readily a transaction of a given size can be arranged at available prices without a large price impact. High total market activity does not guarantee liquidity for your exact pair, size, provider, and moment.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "Banks and other dealers may quote prices while managing their own inventories and obligations. Investment funds may rebalance overseas assets. A business may have a deadline for a bill. The resulting flows can interact, and the explanation for one participant's transaction may be unrelated to a short-term forecast.",
          "Not everyone observing the same pair wants the same outcome. A weaker domestic currency can make an import bill more expensive while increasing the domestic-currency amount an exporter receives for the same foreign sale. Neither business needs to believe it has discovered a winning trading signal.",
        ],
      },
      {
        type: "example",
        title: "The importer and exporter see the same rate differently",
        children: [
          "A Mexican importer owes US$1,000. At an illustrative USD/MXN move from 18 to 19, its peso bill rises from MXN 18,000 to MXN 19,000. A Mexican exporter receiving US$1,000 would instead see the peso equivalent of that receipt rise by MXN 1,000 before charges. Their dollar amounts are unchanged, but their existing business exposures differ.",
        ],
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "An institution may offset exposures in several instruments or over several dates. Copying one visible position, or following a social-media claim about “where banks are buying,” does not reveal that institution's complete portfolio, obligations, or purpose. A learner should understand the quote and their own assumptions rather than infer a profitable trade from a participant's name.",
          "Counterparty risk concerns whether the other party can meet its obligations. Market risk concerns how a price moves. A favorable price change does not solve a withdrawal problem, and a legitimate provider does not prevent a losing trade. Keep those questions separate when reviewing an account agreement.",
        ],
      },
    ],
  },
  {
    title: "Put the whole level together",
    shortTitle: "Level review",
    blocks: [
      {
        type: "keyPoint",
        title: "Check your understanding",
        points: [
          "Why would an importer need another currency?",
          "Who might quote the bid and ask in an OTC retail transaction?",
          "How are a bank's needs different from a learner's?",
          "Why should a beginner check a provider before making any deposit?",
        ],
      },
      {
        type: "takeaway",
        children:
          "The Forex market joins people and organizations with different currency needs. Understanding their roles helps you ask better questions; it does not make a trade profitable.",
      },
      {
        type: "comparisonTable",
        caption: "Try the questions first, then compare your answers",
        columns: ["Question", "Answer and explanation"],
        rows: [
          [
            "Importer needs dollars",
            "It has a foreign-currency invoice to pay.",
          ],
          [
            "Who quotes an OTC bid and ask?",
            "The dealer may quote both sides and be the contractual counterparty.",
          ],
          [
            "Bank versus learner",
            "Resources, obligations, execution arrangements, and purposes differ.",
          ],
          [
            "Why check the provider?",
            "The legal entity, terms, withdrawal rights, and applicable oversight matter.",
          ],
        ],
      },
    ],
  },
  {
    title: "Before moving on",
    shortTitle: "Final check",
    blocks: [
      {
        type: "keyPoint",
        checklist: true,
        title: "Check what you can explain",
        points: [
          "I can compare the purposes of households, businesses, banks, funds, and central banks.",
          "I can distinguish a dealer from an agent and identify contractual responsibilities.",
          "I can connect currency needs, quotes, transaction size, timing, costs, and provider checks.",
        ],
      },
      {
        type: "takeaway",
        children:
          "Use the examples to explain the idea in your own words. Correct units, clear assumptions, and careful questions matter more than rushing to place a trade.",
      },
      {
        type: "section",
        title: "",
        paragraphs: [
          "All rates, fees, position sizes, and calculator entries in this lesson are invented for learning. No example recommends a trade or predicts a future price.",
        ],
      },
      {
        type: "riskStatement",
        children:
          "Trading involves uncertainty and can cause losses. Leverage, costs, execution, product terms, and provider reliability matter. This lesson is education, not personalized financial advice.",
      },
      {
        type: "references",
        items: [
          {
            title:
              "BIS — The global foreign exchange market in a higher-volatility environment",
            url: "https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment",
          },
          {
            title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
        ],
      },
    ],
  },
];
