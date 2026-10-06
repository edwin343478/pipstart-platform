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
  course: "crypto-tokens-and-research",
  description:
    "Describe an asset's claimed role and identify which rights the holder actually receives.",
  estimatedMinutes: 17,
  learningPath: "crypto",
  level: "level-5",
  module: "token-supply-and-research",
  objectives: [
    "Describe an asset's claimed role and identify which rights the holder actually receives.",
  ],
  position: 1,
  prerequisites: ["layer-one-layer-two-and-bridges"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["supply-market-capitalisation-and-fully-diluted-value"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Describe an asset's claimed role and identify which rights the holder actually receives.",
  seoTitle: "Altcoins Utility Governance and Hype",
  slug: "altcoins-utility-governance-and-hype",
  sources: [
    {
      title: "FCA  Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "FINRA  Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title: "Ethereum  Decentralised Autonomous Organisations",
      url: "https://ethereum.org/dao/",
    },
    {
      title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
    },
    {
      title: "Ethereum  Token standards",
      url: "https://ethereum.org/developers/docs/standards/tokens/",
    },
    {
      title: "Circle  USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
    },
    {
      title:
        "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
      url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
    },
    {
      title: "ethereum.org  ethereum.org — ERC-20 token standard",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
    },
    {
      title: "Uniswap  Uniswap — Introducing UNI",
      url: "https://blog.uniswap.org/uni",
    },
    {
      title:
        "US SEC  US SEC — SEC Issues Investigative Report Concluding DAO Tokens, a Digital Asset, Were Securities (25 July 2017)",
      url: "https://www.sec.gov/newsroom/press-releases/2017-131",
    },
  ],
  status: "published",
  title: "Altcoins Utility Governance and Hype",
};
const sections1: LessonSection[] = [
  {
    title: "Coins tokens and their claimed roles",
    shortTitle: "Coins tokens and their claimed roles",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Describe an asset's claimed role and identify which rights the holder actually receives.",
      },
      {
        type: "paragraph",
        children:
          "Altcoin is a broad label commonly applied to crypto assets other than Bitcoin. It says little about quality, purpose or rights. Some assets support networks or applications; others mainly attract attention. This lesson helps you test the connection between a product's usefulness and the specific token you are being asked to value.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children: "Ask what the holder can do, receive or enforce today.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why are there thousands of crypto assets not one",
      },
      {
        type: "paragraph",
        children:
          "Walk through a large shopping centre in Sydney and count the ways you can pay. There is the national currency in your wallet, plus gift cards for single shops, supermarket loyalty points and tokens for the arcade. Each was created by someone who hoped you would want it.",
      },
      {
        type: "paragraph",
        children:
          "Crypto grew in a similar way. Bitcoin came first in 2009. Within a few years, other people copied its code, changed some rules and launched their own coins. After Ethereum went live on 30 July 2015, anyone who could write a smart contract could create a new token in an afternoon.",
      },
      {
        type: "definition",
        term: "Altcoin",
        children:
          'Short for "alternative coin": any crypto-asset other than bitcoin. The word is informal; some people use it only for coins with their own blockchain, others for every token too.',
      },
      {
        type: "paragraph",
        children:
          "Most of these assets will never be widely used and many are already abandoned, so a new name on a price list tells you nothing on its own. To start sorting them, you need the most basic split of all: coins and tokens.",
      },
      {
        type: "heading",
        level: 3,
        children: "Tell a coin from a token",
      },
      {
        type: "paragraph",
        children:
          "Think of a country's money and an arcade token. The rand is part of South Africa's monetary system and works almost anywhere in the country. An arcade token is created by one business and works only in its machines, and the arcade still pays its rent in rand.",
      },
      {
        type: "definition",
        term: "Coin",
        children:
          "The native asset of a blockchain, built into its rules. It usually pays transaction fees and rewards the people who secure the network. Bitcoin (BTC) and ether (ETH) are coins.",
      },
      {
        type: "definition",
        term: "Token",
        children:
          "An asset created by a smart contract running on an existing blockchain. The contract keeps the list of balances and the rules for moving them.",
      },
      {
        type: "paragraph",
        children:
          "In Level 4 you met the ERC-20 standard, proposed by Fabian Vogelsteller in November 2015. It gives every fungible Ethereum token the same basic functions, such as reporting total supply and balances and moving tokens between accounts. Because of that shared standard, wallets and exchanges can support a new token without custom work.",
      },
      {
        type: "example",
        title: "Paying the building's fee",
        children:
          "Hana in Seoul holds an invented 500 units of a game token on Ethereum and wants to send 100 to a friend in Busan. Even though she is moving the token, the network charges gas in ETH. If her wallet holds no ETH, the transfer cannot be sent. The token lives inside Ethereum's \"building\" and pays the building's fee in its coin.",
      },
      {
        type: "paragraph",
        children:
          "Here the analogy stops working. An arcade token is usually worth a fixed amount of money, while a crypto token has no fixed value unless its design aims for one, as stablecoins do. The same token name can also exist on several blockchains through bridges, as you saw in Level 4. With this split clear, you can meet the biggest families of coins.",
      },
      {
        type: "heading",
        level: 3,
        children: "Meet payment coins and smart contract platforms",
      },
      {
        type: "paragraph",
        children:
          "Some coins were built mainly to be sent and spent, like digital cash. Others were built mainly to run programs, like a shared computer anyone can rent.",
      },
      {
        type: "paragraph",
        children:
          "Payment coins focus on transfers. Bitcoin is the original, and several coins later copied or forked its design, such as Litecoin and Bitcoin Cash, usually changing block time or size to make payments faster or cheaper. The key question is whether people actually pay with them, and whether the network stays secure.",
      },
      {
        type: "paragraph",
        children:
          "Smart-contract platforms are blockchains that run programs. Ethereum is the best known. Others, such as Solana, Cardano or Avalanche, take different approaches to speed, fees and decentralisation, and each has a native coin that pays fees and rewards validators. If people want to run applications there, they need the coin.",
      },
      {
        type: "paragraph",
        children:
          "Stablecoins aim to hold a steady value against a currency such as the US dollar. You studied them, including how they can lose their peg, in Level 3.",
      },
      {
        type: "paragraph",
        children:
          "None of these names is a recommendation. A faster network may rely on fewer, more powerful computers; a more decentralised one may be slower or dearer. Benefit and risk usually arrive together. Coins are only half the story, though, because most crypto-assets are tokens, sorted by what they claim to do.",
      },
      {
        type: "heading",
        level: 3,
        children: "Sort tokens by what they claim to do",
      },
      {
        type: "paragraph",
        children:
          "A cinema ticket, a club card and a shareholder voting form are all paper, but they give very different rights. Tokens work the same way: two tokens can share the ERC-20 standard and do completely different jobs.",
      },
      {
        type: "paragraph",
        children:
          "Utility tokens are meant to give access to a product or service, such as paying for storage or unlocking features in an app. Governance tokens are meant to let holders vote on how a protocol changes, such as its fee settings. You will study voting and governance attacks in Level 6.",
      },
      {
        type: "paragraph",
        children:
          "A well-known example is UNI. On 16 September 2020, Uniswap introduced UNI as a governance token, creating 1 billion tokens at the start. Most were set aside for the community, and the rest went to team members, investors and advisers over four years, an allocation you will return to in the next lesson.",
      },
      {
        type: "example",
        title: "The coupon that changed shape",
        children:
          'Matteo in Milan holds a token that gives discounts on cloud storage. The website calls it "pure utility". Six months later, the team announces holders will also receive a share of revenue. His token now looks less like a coupon and more like an investment in a business, even though the label has not changed.',
      },
      {
        type: "paragraph",
        children:
          "So judge a token by its rights, its rules and how it is promoted, not by its label. Some tokens do not even claim a use, and that is where memecoins come in.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand memecoins",
      },
      {
        type: "paragraph",
        children:
          "Think of a viral joke in a group chat. Nobody planned it, it has no purpose beyond being funny, and its fame depends on how many people share it. Memecoins are crypto-assets built around that kind of joke or internet culture.",
      },
      {
        type: "paragraph",
        children:
          "According to CoinGecko, Dogecoin started the category. Billy Markus and Jackson Palmer created it in 2013, partly as a joke, and it later became widely known after celebrity attention. Thousands of memecoins have followed, because creating one needs very little coding knowledge.",
      },
      {
        type: "definition",
        term: "Memecoin",
        children:
          "A crypto-asset whose appeal comes mainly from a joke, theme or online community rather than from a product or service.",
      },
      {
        type: "paragraph",
        children:
          "Unlike a joke, a memecoin costs real money. Its price depends almost entirely on attention, and when attention moves on there is often nothing else to support it. CoinGecko notes that memecoins are vulnerable to pump-and-dump schemes, which the token research lesson in Level 5 covers. At the other end of the family sit tokens issued by exchanges.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look at exchange tokens and the rest of the family",
      },
      {
        type: "paragraph",
        children:
          "A department store in Toronto may offer a store card with discounts. The card is only as useful as the store; if the store closes, the benefits go with it.",
      },
      {
        type: "paragraph",
        children:
          "Exchange tokens are similar. Some centralised exchanges issue a token that gives holders perks such as lower trading fees or access to new token sales. BNB, linked to Binance, is a widely known example. The key risk is that the token's fortunes are tied to its exchange.",
      },
      {
        type: "paragraph",
        children:
          "The collapse of FTX in November 2022, from Level 3, showed this. In its complaint against FTX's founder, the US Securities and Exchange Commission (SEC) said FTX was exposed to Alameda Research's large holdings of overvalued, illiquid assets, including FTX-affiliated tokens. When trust broke, token and exchange fell together.",
      },
      {
        type: "paragraph",
        children:
          "Two more branches complete the picture: wrapped tokens, which represent a coin from one chain on another, and NFTs, which record ownership of a unique item. Both appeared in Level 4.",
      },
      {
        type: "comparisonTable",
        caption: "The token family at a glance",
        columns: ["Category", "Aims to", "Examples (neutral)", "Key question"],
        rows: [
          [
            "Payment coin",
            "Be sent and spent",
            "Litecoin, Bitcoin Cash",
            "Do people really pay with it?",
          ],
          [
            "Platform coin",
            "Pay for programs on its chain",
            "Ether, SOL, ADA",
            "Do people build and transact there?",
          ],
          [
            "Stablecoin",
            "Hold a steady value",
            "Dollar-backed stablecoins",
            "What backs it?",
          ],
          [
            "Utility token",
            "Give access to a service",
            "Storage or game tokens",
            "Does the service need it?",
          ],
          [
            "Governance token",
            "Give votes over a protocol",
            "UNI",
            "Who holds the votes?",
          ],
          [
            "Memecoin",
            "Ride a joke or community",
            "Dogecoin",
            "What supports it when attention fades?",
          ],
          [
            "Exchange token",
            "Give perks on one platform",
            "BNB",
            "What if the exchange fails?",
          ],
          [
            "Wrapped token",
            "Represent a coin on another chain",
            "Wrapped bitcoin",
            "Who holds the originals?",
          ],
          [
            "NFT",
            "Record a unique item",
            "Digital art, tickets",
            "What does owning it give you?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A category does not tell you whether anyone actually needs the token. That is the next question.",
      },
      {
        type: "paragraph",
        children:
          "Utility tokens may claim a role in access or payment. Governance tokens may enable participation in decisions. Meme tokens often depend heavily on community attention and cultural narratives. Begin with a concrete question: what can this holder do with this token today under verified rules? A promise of future utility depends on development, adoption and permissions that may be uncertain. Do not assume a category is inherently safe or inherently valuable.",
      },
    ],
  },
  {
    title: "Product usefulness governance and holder rights",
    shortTitle: "Product usefulness governance and holder rights",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "A useful product does not ensure token value",
      },
      {
        type: "paragraph",
        children:
          "Imagine a bus company in Jakarta with its own travel tokens. If the bus accepts only those tokens, riders need them. If it also takes cards and cash, the token is optional and fewer people hold it. A token's use depends on whether something real requires it.",
      },
      {
        type: "paragraph",
        children:
          "You can test this with plain questions. Does the network or app refuse to work without the token? Is it needed to pay fees, to secure the network through staking, or as collateral? Would the service work as well if users paid in a stablecoin? And who decides the token's role: a contract that is hard to change, or a team that can rewrite the rules?",
      },
      {
        type: "example",
        title: "Two storage tokens",
        children:
          "Klaus in Berlin compares two invented storage projects. Project A requires its token to pay for every gigabyte, and storage providers are paid in it. Project B lets users pay by bank card and converts the money behind the scenes; its token only gives a \"community badge\". Project A's token is part of how the service works, while Project B's could vanish unnoticed.",
      },
      {
        type: "paragraph",
        children:
          "A real use promises nothing about price: a token can be essential to a service few people want, or be created in far greater numbers than its use needs, as the supply and allocation lessons in Level 5 explains. Still, a token with no clear use relies only on attention. Next, look at how tokens reach the market.",
      },
      {
        type: "paragraph",
        children:
          "An application can be useful while its token has no necessary role in the service or no claim on its revenue. A fee paid to an operator is not automatically paid to token holders. A buyback policy may be discretionary rather than an enforceable right. Treat future value-capture claims as hypotheses requiring documentation and assumptions.",
      },
      {
        type: "heading",
        level: 3,
        children: "Governance influence and outside legal rights",
      },
      {
        type: "paragraph",
        children:
          "Governance may allow proposals, votes, delegation or control of specified parameters. Delegation lets another participant exercise defined voting power without necessarily taking asset custody. The actual power depends on quorum, proposal requirements, execution rules and administrator permissions. A poll on a forum may be advisory rather than binding.",
      },
      {
        type: "paragraph",
        children:
          "Inspect token distribution and participation. A small holder may have a nominal vote while a few large holders or delegates dominate outcomes. Some proposals also depend on a committee or multi-signature execution step. Record who can change the rules and whether emergency powers bypass ordinary voting. The word community does not establish equal influence. Governance can be a real right while still being concentrated and unsuitable as proof of investor protection.",
      },
      {
        type: "comparisonTable",
        caption: "Test the token claim",
        columns: ["Claim category", "Question to verify", "Evidence needed"],
        rows: [
          [
            "Utility",
            "Is the token required for an implemented action",
            "Current application and protocol rules",
          ],
          [
            "Governance",
            "What can a vote actually change",
            "Voting and execution procedures",
          ],
          [
            "Revenue benefit",
            "Who receives fees or distributions",
            "Enforceable terms and mechanism",
          ],
          [
            "Meme narrative",
            "What sustains demand beyond attention",
            "Honest statement of uncertainty",
          ],
          [
            "Real-world claim",
            "What legal entitlement is held",
            "Issuer custody and redemption documents",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A token described as representing a bond, property or commodity requires an outside legal arrangement. Identify the issuer, underlying asset, custodian, enforceable entitlement, transfer restrictions and redemption process. A ledger entry can track a claim while the actual property remains governed by local law and external records. The token's technical transfer may not be sufficient to transfer every legal right.",
      },
      {
        type: "paragraph",
        children:
          "Ask what happens if the issuer fails, the custodian loses the asset or the holder is ineligible to redeem. Reports about backing must match the actual claim and current product. A tokenised asset may also include currency, liquidity and settlement risks familiar from ordinary finance, plus contract and custody risks. The next lesson introduces supply and valuation metrics without assuming that a token's low unit price makes it cheap.",
      },
    ],
  },
  {
    title: "Promotion airdrops and launch methods",
    shortTitle: "Promotion airdrops and launch methods",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Attention promotion and airdrop hazards",
      },
      {
        type: "paragraph",
        children:
          'A free sample in a Lyon supermarket is pleasant. A stranger saying you have "won" a prize, if you first hand over your bank card, is a trick. Crypto airdrops can look like either.',
      },
      {
        type: "paragraph",
        children:
          "Genuine airdrops exist: when Uniswap launched UNI in September 2020, it said 400 UNI could be claimed by each address that had ever used its earlier contracts. Scammers exploit the idea that free tokens are normal.",
      },
      {
        type: "paragraph",
        children:
          'Binance Academy describes the patterns. Fake websites copy a real project\'s name and design and push a "claim" page on social media. Unknown tokens appear in your wallet with a web address in their name, inviting you to "redeem" them. When you connect and sign, you may grant an approval that lets the scammer move your real tokens, the allowance mechanism from Level 4. The bluntest version asks for your seed phrase.',
      },
      {
        type: "warning",
        title: "Real airdrops never need your seed phrase",
        children:
          "No genuine project, exchange or support team ever needs your seed phrase or private key. Do not interact with tokens that arrive unexpectedly, and check any airdrop only through the project's official channels, reached from a bookmark you saved yourself.",
      },
      {
        type: "example",
        title: "The token that came with a link",
        children:
          'Lucas in Curitiba sees an unknown token in his wallet showing an apparent R$5,000 (invented for this example), its name containing a web address. He finds no announcement on the project\'s official site and leaves it untouched. That protects his real balance, because the "value" was bait for a draining site.',
      },
      {
        type: "paragraph",
        children:
          "Every launch raises one more question: if people pay for a token hoping it grows in value, what have they bought?",
      },
      {
        type: "paragraph",
        children:
          "Influencers may hold allocations, receive compensation or benefit from a referral link. An apparently independent review may therefore have a conflict of interest. A disclaimer does not turn weak evidence into strong evidence; it helps identify the incentive behind the claim. The contract has a verified mint limit is a testable technical claim. A screenshot of rising prices does not establish future demand or an exit route for your order size. Use dated primary evidence rather than the number of times a claim is repeated.",
      },
      {
        type: "heading",
        level: 3,
        children: "How launches developed",
      },
      {
        type: "heading",
        level: 3,
        children: "Trace how tokens launch the ICO boom",
      },
      {
        type: "paragraph",
        children:
          "A small business raising money might sell shares, take a loan or run crowdfunding, where backers often get a product rather than a share. Early token launches mixed these ideas, often without the rules that protect buyers.",
      },
      {
        type: "paragraph",
        children:
          "An initial coin offering (ICO) is a sale in which a project creates tokens and sells them directly to the public, usually for bitcoin or ether, to fund a platform that is often not yet built. Unlike crowdfunding, buyers often hoped to resell the tokens later at a higher price.",
      },
      {
        type: "paragraph",
        children:
          "2017 brought an ICO boom, as cheap token creation met rising prices and buyers worldwide. Binance Academy notes that the 2017–2018 wave exposed scams, abandoned projects and offerings that may have broken securities rules.",
      },
      {
        type: "paragraph",
        children:
          "The turning point came on 25 July 2017, when the SEC published its report on The DAO, the 2016 Ethereum project you met in Level 4. It concluded that DAO tokens were securities under US law, whether the issuer was a company or a decentralised organisation, and whether buyers paid in dollars or crypto.",
      },
      {
        type: "warning",
        title: "A whitepaper is not a product",
        children:
          "In an ICO, you usually pay for a plan, not a working service. Many 2017-era projects never delivered, and some were fraudulent from the start. If you are asked to pay now for something that may be built later, treat that money as at risk of total loss.",
      },
      {
        type: "paragraph",
        children:
          "The problems of the ICO era pushed the industry towards new launch formats, each changing who checks the project.",
      },
      {
        type: "heading",
        level: 3,
        children: "Compare IEOs IDOs fair launches and airdrops",
      },
      {
        type: "paragraph",
        children:
          "Picture three ways to sell a new snack in Mexico City: from the maker's own van, on a supermarket shelf after the store checks the label, or at an open street market with no checks. Token launches follow the same patterns, plus a fourth: free samples.",
      },
      {
        type: "paragraph",
        children:
          "An initial exchange offering (IEO) is a token sale run through a centralised exchange. According to Binance Academy, the exchange handles the sale and some due diligence, and usually lists the token soon after. An initial DEX offering (IDO) runs on a decentralised exchange, so anyone can join, but there is usually less vetting. A fair launch is a marketing term for a launch with no presale and no special insider allocation; always check the actual distribution rather than trusting the term.",
      },
      {
        type: "definition",
        term: "Airdrop",
        children:
          "A free distribution of tokens to many wallet addresses, often to reward early users or spread ownership.",
      },
      {
        type: "comparisonTable",
        caption: "Comparing token launch methods",
        columns: ["Method", "Run by", "Checked by", "Main buyer risk"],
        rows: [
          [
            "ICO",
            "The project",
            "Often nobody independent",
            "Unbuilt product, fraud, legal problems",
          ],
          [
            "IEO",
            "A centralised exchange",
            "The exchange, to its own standard",
            "Over-trusting the listing; falls after launch",
          ],
          [
            "IDO",
            "A decentralised exchange",
            "Usually nobody",
            "Little vetting, fake copies",
          ],
          [
            "Fair launch",
            "The project, no presale",
            "Nobody in particular",
            "Label hides insider holdings",
          ],
          ["Airdrop", "The project", "Nobody", "Fake airdrops, draining sites"],
        ],
      },
      {
        type: "example",
        title: "A shelf is not a promise",
        children:
          "Ahmed in Riyadh buys an invented SAR 400 of a new token in an IEO, reassured that a big exchange listed it. A month later it trades at half the sale price. The exchange's checks reduced some risks, such as buying a fake copy, but not price risk. Binance Academy itself lists volatility after listing as an IEO drawback.",
      },
      {
        type: "paragraph",
        children:
          "Any method can be honest or dishonest, but scammers imitate airdrops most of all.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A useful delivery app with a separate voucher",
        children:
          "A delivery application in Australia saves customers time. It also sells a fictional AUD 2 voucher token described as part of its ecosystem. The app's usefulness does not by itself establish that the voucher gives profits, voting power or redemption. Zoe asks whether customers must use it, whether the company can create more, and what happens if the programme ends. These questions connect product use to holder rights rather than assuming every useful business makes every associated token valuable.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Popularity and a useful application do not establish that an associated token is fairly valued.",
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
          "1. A service earns fees but its token grants no distribution right. Can you assume holders receive those fees?",
          "2. Name three governance rules to inspect.",
          "3. For a property token, why is a contract address insufficient evidence of ownership?",
        ],
        answers: [
          "1. No. Revenue to a service and value accruing to token holders are different claims. A documented mechanism is needed.",
          "2. Quorum, proposal eligibility, delegation, execution authority and emergency powers are relevant.",
          "3. Outside legal ownership, issuer obligations, custody, jurisdiction and redemption must be established independently.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does the term altcoin measure the quality of an asset?"],
        answers: [
          "No. It is a broad descriptive label. Quality and suitability require specific evidence.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Categories organise research but do not establish quality.",
          "Product usefulness and token benefit need a demonstrated connection.",
          "Governance and legal claims require their actual rules.",
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
            title: "FCA  Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "FINRA  Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title: "Ethereum  Decentralised Autonomous Organisations",
            url: "https://ethereum.org/dao/",
          },
          {
            title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
          },
          {
            title: "Ethereum  Token standards",
            url: "https://ethereum.org/developers/docs/standards/tokens/",
          },
          {
            title: "Circle  USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
          },
          {
            title:
              "ESMA and the European Supervisory Authorities  Consumer warning on crypto assets and limited protection",
            url: "https://www.esma.europa.eu/press-news/esma-news/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain",
          },
          {
            title: "ethereum.org  ethereum.org — ERC-20 token standard",
            url: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
          },
          {
            title: "Uniswap  Uniswap — Introducing UNI",
            url: "https://blog.uniswap.org/uni",
          },
          {
            title:
              "US SEC  US SEC — SEC Issues Investigative Report Concluding DAO Tokens, a Digital Asset, Were Securities (25 July 2017)",
            url: "https://www.sec.gov/newsroom/press-releases/2017-131",
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
  course: "crypto-tokens-and-research",
  description: "Calculate valuation labels and explain their limits.",
  estimatedMinutes: 12,
  learningPath: "crypto",
  level: "level-5",
  module: "token-supply-and-research",
  objectives: ["Calculate valuation labels and explain their limits."],
  position: 2,
  prerequisites: ["altcoins-utility-governance-and-hype"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "altcoins-utility-governance-and-hype",
    "allocations-vesting-unlocks-and-control",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription: "Calculate valuation labels and explain their limits.",
  seoTitle: "Supply Market Capitalisation and Fully Diluted Value",
  slug: "supply-market-capitalisation-and-fully-diluted-value",
  sources: [
    {
      title: "Bitcoin community  Bitcoin Developer Guide Block Chain",
      url: "https://developer.bitcoin.org/devguide/block_chain.html",
    },
    {
      title: "Ethereum  Token standards",
      url: "https://ethereum.org/developers/docs/standards/tokens/",
    },
    {
      title: "Ethereum  Decentralised Autonomous Organisations",
      url: "https://ethereum.org/dao/",
    },
    {
      title: "MIT OpenCourseWare  Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
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
      title: "Uniswap  Uniswap — Introducing UNI",
      url: "https://blog.uniswap.org/uni",
    },
  ],
  status: "published",
  title: "Supply Market Capitalisation and Fully Diluted Value",
};
const sections2: LessonSection[] = [
  {
    title: "Read the supply numbers",
    shortTitle: "Read the supply numbers",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children: "Calculate valuation labels and explain their limits.",
      },
      {
        type: "paragraph",
        children:
          "A low price per token can be misleading when there are many tokens. Market capitalisation and fully diluted value combine price with a supply figure, but they also have limits. We will calculate both, state the supply definition and show why neither number is the amount of money invested in the project or the cash every holder could withdraw.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Write the price, supply definition and timestamp beside each valuation.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why does the number of tokens matter as much as the price",
      },
      {
        type: "paragraph",
        children:
          'Imagine two pizza shops in Rome, each selling a pizza for €12 (an invented price). One cuts its pizza into 8 slices; the other cuts its pizza into 80. A slice costs €1.50 at the first shop and €0.15 at the second. The second slice is not "cheaper" in any useful sense; it is a smaller piece of the same pizza.',
      },
      {
        type: "paragraph",
        children:
          "Token prices work the same way. An invented price of US$0.001 per token tells you nothing until you know how many tokens exist. To understand what a token's price really means, you need to read its supply, and then combine supply with price to get market capitalisation and fully diluted valuation.",
      },
      {
        type: "paragraph",
        children:
          "The pizza analogy stops working in one way: a pizza has a fixed size, while many tokens keep changing in number as new ones are created, released or burned. So start with the three supply numbers every data page shows.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read circulating total and maximum supply",
      },
      {
        type: "paragraph",
        children:
          "Think of a company that has printed concert tickets. Some are on sale to the public now. Some are printed but held back for staff and sponsors. And the venue has a maximum number of seats that can never be exceeded. Token supply has the same three layers.",
      },
      {
        type: "definition",
        term: "Circulating supply",
        children:
          "The data provider's best estimate of how many tokens are available to the public and trading now. Locked tokens, unvested team and investor allocations and project treasuries are usually excluded.",
      },
      {
        type: "definition",
        term: "Total supply",
        children:
          "All tokens created so far, minus any that have been verifiably burned. It includes tokens that are still locked.",
      },
      {
        type: "definition",
        term: "Maximum supply",
        children:
          "The most tokens that can ever exist under the project's rules. Some assets have no maximum.",
      },
      {
        type: "paragraph",
        children:
          'CoinGecko and CoinMarketCap both publish their methods. CoinGecko excludes tokens locked in smart contracts, vested allocations for teams, advisers and investors, escrowed funds, foundation and treasury holdings, and some core stakeholder holdings. CoinMarketCap calls circulating supply the crypto version of "public float", excluding private-sale allocations, team and foundation holdings, and locked or staked tokens.',
      },
      {
        type: "example",
        title: "Three numbers for one token",
        children:
          "Sipho in Durban looks up an invented token. The page shows a circulating supply of 150 million, a total supply of 600 million and a maximum supply of 1 billion. So 150 million can trade now, 600 million exist in some form, and up to 1 billion could exist one day: three-quarters of the tokens already created are not yet in public hands.",
      },
      {
        type: "paragraph",
        children:
          "Bitcoin is the best-known example of a capped asset: no more than 21 million BTC will ever exist by protocol rules, as you learned in Level 1. Ether, by contrast, has no fixed maximum. Knowing which kind of asset you are looking at leads straight to the next question: how supply changes over time.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch supply change emissions inflation and burns",
      },
      {
        type: "paragraph",
        children:
          "Picture a central bank that prints new notes each year, and a shop that buys back its own gift vouchers and shreds them. One adds supply; the other removes it. Tokens can do both.",
      },
      {
        type: "paragraph",
        children:
          "Emissions are new tokens entering the supply, for example as rewards to validators or miners, or as incentives for using an app. When emissions are ongoing, the token has inflation in the plain sense of more units over time. Burns permanently remove tokens, usually by sending them to an address nobody controls. Tokenomist, a data site formerly called Token Unlocks, describes a token's emission as the net of inflation and deflation, where deflation comes from burning.",
      },
      {
        type: "paragraph",
        children:
          "You have already seen one burn. Since Ethereum's London upgrade in August 2021, the base fee of every transaction is burned. Binance Academy notes that during busy periods this burn can exceed new issuance, so ether's supply can shrink as well as grow.",
      },
      {
        type: "comparisonTable",
        caption: "Three broad supply designs",
        columns: [
          "Design",
          "How supply behaves",
          "Example",
          "Main thing to check",
        ],
        rows: [
          [
            "Capped",
            "Grows towards a fixed maximum, then stops",
            "Bitcoin (21 million)",
            "How fast new units still arrive",
          ],
          [
            "Inflationary",
            "Keeps growing with no fixed end",
            "Tokens with permanent staking rewards",
            "Annual issuance rate and who receives it",
          ],
          [
            "Burn-adjusted",
            "Grows and shrinks depending on usage or burns",
            "Ether since August 2021",
            "Whether burns depend on activity that may fade",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Designs can also be set or changed by decision: Uniswap's announcement set a permanent 2% yearly inflation rate for UNI, starting after four years.",
      },
      {
        type: "warning",
        title: "A burn is not a promise about price",
        children:
          'Burning tokens reduces supply, but price depends on demand as well. A project can burn tokens while demand falls faster, and the price can still drop. Treat "deflationary" as a description of supply, never as a reason to expect gains.',
      },
      {
        type: "paragraph",
        children: "With supply understood, you can now combine it with price.",
      },
      {
        type: "paragraph",
        children:
          "Circulating supply generally estimates units available to the public under a provider's methodology. Locked, vested, treasury-held and inaccessible units may be treated differently by different data providers. A contract's total does not automatically tell you the economic float. An allocation schedule may not reflect current unlocks. Record uncertainties rather than filling every field with a confident number.",
      },
    ],
  },
  {
    title: "Market capitalisation and fully diluted value",
    shortTitle: "Market capitalisation and fully diluted value",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Market capitalisation is an indicated value",
      },
      {
        type: "paragraph",
        children:
          'On a street in Toronto, one house sells for C$900,000 (an invented figure). An estate agent might say every similar house on the street is now "worth" C$900,000, so the street\'s ten houses are worth C$9 million. No one paid C$9 million. One buyer paid for one house, and the rest is an estimate based on that last sale.',
      },
      {
        type: "formula",
        expression: "Market cap = price × circulating supply",
        explanation:
          'Multiply the latest trading price of one token by the number of tokens in public circulation. The answer estimates what all circulating tokens would be "worth" at that last price.',
      },
      {
        type: "example",
        title: "The token in the thin market",
        children:
          "Jessica in Toronto studies an invented token with 10 million tokens circulating at C$1 each, a market cap of C$10 million. Very few tokens are offered for sale. One buyer spends C$5,000 and, by clearing the few sell orders, pushes the price to C$2. The market cap now reads C$20 million, although only C$5,000 of new money arrived.",
      },
      {
        type: "paragraph",
        children:
          "CoinGecko makes this point directly: market cap applies the last traded price to every token and does not measure how much money has actually flowed into the asset. It also notes that a high market cap does not mean you could sell a large amount at that price, that a few holders may own a large share, and that smaller assets are easier to manipulate.",
      },
      {
        type: "definition",
        term: "Market capitalisation",
        children:
          "The latest price of one token multiplied by its circulating supply: a snapshot estimate, not money invested or money that could be withdrawn.",
      },
      {
        type: "paragraph",
        children:
          "Where the house analogy stops working is speed. House prices change slowly, but a token's last trade can move in seconds, so its market cap can swing far faster. Market cap also ignores every token not yet circulating, which is why a second number exists.",
      },
      {
        type: "paragraph",
        children:
          "A different circulating estimate changes it without any trade occurring. Market capitalisation is not the amount of cash deposited into a project. It can help compare scale under consistent assumptions, but its interpretation must not exceed the arithmetic.",
      },
      {
        type: "heading",
        level: 3,
        children: "FDV and its stated supply basis",
      },
      {
        type: "paragraph",
        children:
          "An illustrative fully diluted value multiplies current price by a specified future or maximum supply basis. Using USD 2 and 100 million maximum units gives USD 200 million. Some providers use total supply rather than maximum supply, and some assets have continuing issuance. Label the chosen basis instead of presenting every FDV number as directly comparable.",
      },
      {
        type: "paragraph",
        children:
          "FDV assumes the current marginal price can be applied to the stated larger supply for measurement. It does not forecast that future price or prove that all units will circulate on the assumed schedule. It highlights a supply dimension that current market capitalisation may omit. The ratio between current circulating value and the illustrative diluted value can prompt questions about future distribution, but it cannot by itself tell you whether to buy or sell.",
      },
      {
        type: "comparisonTable",
        caption: "Compare fictional valuation inputs",
        columns: [
          "Asset",
          "Unit price",
          "Circulating supply",
          "Circulating value",
          "Stated FDV basis",
        ],
        rows: [
          [
            "Token A",
            "USD 0.01",
            "10 billion",
            "USD 100 million",
            "20 billion gives USD 200 million",
          ],
          [
            "Token B",
            "USD 10",
            "1 million",
            "USD 10 million",
            "2 million gives USD 20 million",
          ],
          [
            "Practice token",
            "USD 2",
            "10 million",
            "USD 20 million",
            "100 million gives USD 200 million",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The supply definitions are supplied for the exercise. These values do not represent available cash or a price forecast.",
      },
      {
        type: "heading",
        level: 3,
        children: "Calculate fully diluted valuation",
      },
      {
        type: "paragraph",
        children:
          'Go back to the concert tickets. If the promoter has sold 1,000 tickets at A$100 each so far, but 10,000 seats will eventually be sold, the "fully sold" value of the show at today\'s price is A$1 million, not A$100,000. The extra 9,000 tickets have not reached buyers yet, but they are coming.',
      },
      {
        type: "formula",
        expression:
          "FDV = price × maximum supply (or price × total supply when there is no maximum)",
        explanation:
          "Multiply today's price by every token that could ever exist. The answer shows what the whole supply would be valued at if all of it were circulating at today's price.",
      },
      {
        type: "definition",
        term: "Fully diluted valuation (FDV)",
        children:
          "Today's token price multiplied by the maximum supply, or by the total supply where no maximum exists. Data sites differ: CoinMarketCap uses maximum supply, while CoinGecko's guide uses total supply.",
      },
      {
        type: "paragraph",
        children:
          "FDV is hypothetical. Prices rarely stay still while new tokens arrive, and some future tokens may never be released. Still, the gap between market cap and FDV tells you how much supply is waiting. The clearest way to see this is to work through one example end to end.",
      },
      {
        type: "heading",
        level: 3,
        children: "Work through a full example",
      },
      {
        type: "comparisonTable",
        caption:
          "Follow one invented token through the calculations. Liam in Sydney studies fictional Kestrel tokens at an A$2 quote. The supplied circulating estimate is 100 million, total issued supply is 400 million and the stated maximum is one billion. All figures are classroom inputs rather than live prices.",
        columns: ["Measure", "Calculation", "Result"],
        rows: [
          [
            "Indicated market capitalisation",
            "A$2 × 100 million circulating units",
            "A$200 million",
          ],
          [
            "FDV on the stated maximum basis",
            "A$2 × one billion units",
            "A$2 billion",
          ],
          [
            "Circulating share of that basis",
            "100 million ÷ one billion",
            "10%",
          ],
          [
            "Market capitalisation divided by FDV",
            "A$200 million ÷ A$2 billion",
            "10%",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The two ratios match because both indicated valuations use the same unit price and the chosen FDV denominator is maximum supply. If a data provider uses total supply for FDV, the denominator and the result change. Always name the basis rather than comparing unlabeled figures.",
      },
      {
        type: "paragraph",
        children:
          "Suppose 50 million units become eligible for release next month. That unlock does not, on its own, establish that all 50 million immediately enter the circulating estimate or are sold. The recipients, restrictions and data provider's method matter. For a separate sensitivity calculation, assume the circulating estimate actually rises to 150 million and the indicated market capitalisation stays at A$200 million. Division gives about A$1.33 per unit. This is a conditional arithmetic scenario, not a rule that supply changes force that price. Demand, executable liquidity and the measured supply can all differ.",
      },
      {
        type: "example",
        title: "More slices do not prove a cheaper meal",
        children:
          "A bakery cuts an unchanged cake into more portions. A portion price only makes sense alongside portion size and the whole cake's value. Tokens are more complicated because rights and demand can change, but the comparison reminds Liam to study supply and value together.",
      },
      {
        type: "diagram",
        alt: "Ten million circulating units imply USD 20 million; a 100 million maximum basis implies USD 200 million. Neither value measures cash available for exit.",
        caption:
          "Ten million circulating units imply USD 20 million; a 100 million maximum basis implies USD 200 million. Neither value measures cash available for exit.",
        src: "/lessons/crypto/level-5/lesson-2-rId36.png",
        width: 1455,
        height: 601,
      },
    ],
  },
  {
    title: "Unit prices data definitions and exit limits",
    shortTitle: "Unit prices data definitions and exit limits",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Unit price does not establish cheapness",
      },
      {
        type: "paragraph",
        children:
          "Compare Token A at USD 0.01 with 10 billion circulating units and Token B at USD 10 with one million. A's indicated circulating value is USD 100 million; B's is USD 10 million. The smaller unit price belongs to the larger indicated valuation. Buying more token units is not inherently acquiring more economic value.",
      },
      {
        type: "paragraph",
        children:
          "Splitting each unit into smaller denominations can lower the quoted unit price without changing the total position. The meaningful questions concern rights, supply, demand, liquidity and price paid for exposure. A high unit count can encourage the impression that a small move will make everyone wealthy, but a target price also implies a much larger aggregate valuation. Calculate that implication and examine whether the underlying demand assumption has evidence.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read aggregator definitions and liquidity limits",
      },
      {
        type: "paragraph",
        children:
          "If only a few units trade at USD 2, a holder of a large allocation may be unable to sell near that price. Selling can move through lower bids or change a pool price. A restricted token may also be difficult to transfer or sell. Market capitalisation therefore cannot replace an exit-liquidity check.",
      },
      {
        type: "paragraph",
        children:
          "Use more than one reputable data view and primary supply documentation where possible, reconcile differences and date the worksheet. Unknown mint permissions, unclear treasury allocations or inconsistent circulating figures should appear in the conclusion. The next lesson examines how allocations and unlocks alter available supply over time. The goal is to make the metric useful while resisting the false precision of a large headline number.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The small slice and the whole cake",
        children:
          "A baker in Japan sells 100 small slices at JPY 100 each. Another sells ten large slices at JPY 500 each. The cheaper slice does not mean the first whole cake is cheaper: its total listed value is JPY 10,000 versus JPY 5,000. Token unit prices require the same supply awareness. The example is arithmetic, not a claim that all slices or all tokens have equal quality or can be sold simultaneously at the displayed price.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Market capitalisation and FDV do not measure guaranteed exit proceeds.",
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
          "1. At USD 0.50 with 80 million circulating and 200 million maximum units, calculate both values.",
          "2. If the circulating estimate changes from 80 to 60 million at the same price, what happens to the first value?",
          "3. Why cannot all holders assume they can sell at the last trade price?",
        ],
        answers: [
          "1. Circulating value is USD 40 million. FDV on the maximum basis is USD 100 million.",
          "2. It becomes USD 30 million. The change in the estimate alone changes the metric.",
          "3. The last trade is marginal; aggregate sales can exceed available depth, change prices or encounter restrictions.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is market capitalisation the amount of money invested in the project?",
        ],
        answers: [
          "No. It is price multiplied by a stated supply figure, not a record of cumulative cash inflows.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Supply labels need methods and dates.",
          "FDV needs an explicit supply basis.",
          "Low unit price and low valuation are different ideas.",
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
            title: "Bitcoin community  Bitcoin Developer Guide Block Chain",
            url: "https://developer.bitcoin.org/devguide/block_chain.html",
          },
          {
            title: "Ethereum  Token standards",
            url: "https://ethereum.org/developers/docs/standards/tokens/",
          },
          {
            title: "Ethereum  Decentralised Autonomous Organisations",
            url: "https://ethereum.org/dao/",
          },
          {
            title: "MIT OpenCourseWare  Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
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
            title: "Uniswap  Uniswap — Introducing UNI",
            url: "https://blog.uniswap.org/uni",
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
  course: "crypto-tokens-and-research",
  description: "Read who can receive, release or change the token supply.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-5",
  module: "token-supply-and-research",
  objectives: ["Read who can receive, release or change the token supply."],
  position: 3,
  prerequisites: ["supply-market-capitalisation-and-fully-diluted-value"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "supply-market-capitalisation-and-fully-diluted-value",
    "build-a-token-dossier-and-check-liquidity",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription: "Read who can receive, release or change the token supply.",
  seoTitle: "Allocations Vesting Unlocks and Control",
  slug: "allocations-vesting-unlocks-and-control",
  sources: [
    {
      title: "Ethereum  Token standards",
      url: "https://ethereum.org/developers/docs/standards/tokens/",
    },
    {
      title: "Ethereum  Decentralised Autonomous Organisations",
      url: "https://ethereum.org/dao/",
    },
    {
      title: "Ethereum  Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title: "Uniswap  Uniswap — Introducing UNI",
      url: "https://blog.uniswap.org/uni",
    },
    {
      title:
        "US Department of Justice  US Department of Justice — Eighteen Individuals and Entities Charged in International Operation Targeting Widespread Fraud and Manipulation in the Cryptocurrency Markets",
      url: "https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread",
    },
    {
      title:
        "US SEC  US SEC — SEC Charges Kim Kardashian for Unlawfully Touting Crypto Security (3 October 2022)",
      url: "https://www.sec.gov/newsroom/press-releases/2022-183",
    },
    {
      title:
        "Federal Trade Commission  Federal Trade Commission — What To Know About Cryptocurrency and Scams",
      url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
    },
  ],
  status: "published",
  title: "Allocations Vesting Unlocks and Control",
};
const sections3: LessonSection[] = [
  {
    title: "Allocations cliffs and vesting",
    shortTitle: "Allocations cliffs and vesting",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children: "Read who can receive, release or change the token supply.",
      },
      {
        type: "paragraph",
        children:
          "Supply is distributed among people and organisations with different incentives. Some units are locked, some are vested and some can be created later. An allocation chart is therefore a starting point for asking who can sell, vote or change the rules. This lesson connects schedules to control without assuming that every unlock must cause a price fall.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children: "Read allocation, availability and control together.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Who received the allocations",
      },
      {
        type: "paragraph",
        children:
          "Common allocation labels include founders, early investors, treasury, community and incentives. The labels must correspond to actual quantities and destinations. A community allocation can still be held by a treasury, and incentives can be distributed through the same wallet. Adding both as independent holdings can double count units.",
      },
      {
        type: "paragraph",
        children:
          "Reconcile percentages to the stated supply basis and identify overlaps. Ask who controls each allocation, what restrictions apply and whether addresses or disclosures support the chart. A large community label does not prove wide distribution. It may mean units reserved for future programmes under concentrated control. Distinguish planned allocation from current ownership and current circulating supply. These three views can differ legitimately, but the differences should be explained rather than hidden.",
      },
      {
        type: "paragraph",
        children:
          "Imagine a family business in Guadalajara that issues shares. If the founders keep 80% and sell 20% to the public, the public's say is small and a single founder's decision to sell could flood the market. Token allocations raise the same issue.",
      },
      {
        type: "paragraph",
        children:
          "Messari groups allocations into four broad buckets: public sale, foundations and similar entities, insiders such as team and investors, and community allocations. A healthy-looking split depends on the project, but you should always know how large each slice is and when it unlocks.",
      },
      {
        type: "paragraph",
        children:
          "UNI offers a real, published example. Uniswap's announcement in September 2020 set out how the 1 billion UNI created at launch would be shared.",
      },
      {
        type: "comparisonTable",
        caption: "UNI's published allocation at launch (September 2020)",
        columns: ["Group", "Share of 1 billion UNI", "Release"],
        rows: [
          ["Community", "60%", "Over four years, including the airdrop"],
          ["Team members", "21.266%", "Vesting over four years"],
          ["Investors", "18.044%", "Vesting over four years"],
          ["Advisers", "0.69%", "Vesting over four years"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Reading a table like this is a starting point, not a verdict. Ask whether insiders hold a large share, how long their tokens are locked, whether the schedule is enforced by a smart contract or only promised in a document, and whether insiders paid far less per token than public buyers. That last question leads to one of the most discussed problems in recent token launches.",
      },
      {
        type: "heading",
        level: 3,
        children: "Cliffs and linear vesting",
      },
      {
        type: "paragraph",
        children:
          'Many companies give employees shares that "vest" over several years. An engineer in Bengaluru might receive shares but be able to sell only a quarter after the first year, and the rest month by month after that. The aim is to keep people committed rather than letting them sell and leave.',
      },
      {
        type: "paragraph",
        children:
          "Token projects use the same tool. Vesting means tokens are allocated to someone but released over time. A cliff is a waiting period before anything is released, often followed by a large first release. An unlock is the moment tokens become transferable.",
      },
      {
        type: "paragraph",
        children:
          "Tokenomist separates two kinds of release. Cliff unlocks release tokens in lumps at intervals longer than a day, such as monthly or yearly. Linear unlocks release a set amount daily. Messari, another research firm, makes the same split.",
      },
      {
        type: "example",
        title: "The one-year cliff",
        children:
          "Wei in Shanghai reads an invented project's documents. Team and investors hold 300 million tokens with a one-year cliff, after which 25% unlocks at once and the rest unlocks monthly over three years. He marks the cliff date in his calendar, because on that day 75 million tokens could become sellable. An unlock does not have to move the price, since many buyers may already expect it, but it changes who can sell.",
      },
      {
        type: "paragraph",
        children:
          "The schedule tells you when. The allocation tells you to whom.",
      },
      {
        type: "paragraph",
        children:
          "Vesting describes when allocated rights or units become available under a schedule. In a fictional 12 million-unit allocation, a one-year cliff may release 3 million, followed by 750,000 each month for twelve months. Read the quantities, not only the label.",
      },
    ],
  },
  {
    title: "Unlocks incentives and potential selling",
    shortTitle: "Unlocks incentives and potential selling",
    blocks: [
      {
        type: "paragraph",
        children:
          "Unlocked means units can become available under the relevant restriction; circulating is a supply classification; sold means an actual market transaction or distribution occurred. They are related but different. Unlocked units can remain held, be delegated, used as collateral or transferred privately. An exchange deposit may suggest possible sale activity but does not prove a completed sale.",
      },
      {
        type: "paragraph",
        children:
          "An unlock can increase potential available supply and create selling pressure, yet the price effect depends on demand, expectations, liquidity and recipient behaviour. A known schedule may already be anticipated. Some data services estimate circulating supply differently. Describe the event and plausible mechanism before predicting a price effect. Later analysis lessons use the same distinction between observable facts and interpretations.",
      },
      {
        type: "comparisonTable",
        caption: "Reconcile the fictional allocation release",
        columns: [
          "Stage",
          "Release",
          "Cumulative unlocked",
          "Remaining locked",
        ],
        rows: [
          ["Before cliff", "0", "0", "12,000,000"],
          ["Cliff", "3,000,000", "3,000,000", "9,000,000"],
          ["After 4 monthly releases", "3,000,000", "6,000,000", "6,000,000"],
          ["After all 12 releases", "9,000,000", "12,000,000", "0"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This is a supplied schedule. Unlocked units are not assumed sold or classified as circulating.",
      },
      {
        type: "paragraph",
        children:
          "Think of a concert where only 10% of tickets are released at first, and a high resale price makes the whole show look enormously valuable. Early buyers pay a price set by very few tickets.",
      },
      {
        type: "paragraph",
        children:
          "Low float means a small share of the supply is circulating. High FDV means that, at today's price, the full supply would be valued very highly. Together, a small market sets a price at which a much larger future supply must later be absorbed.",
      },
      {
        type: "paragraph",
        children:
          "Binance Research studied this in a May 2024 report. It found that the group of tokens launched in 2024 had a market cap of about 12.3% of their FDV, and estimated that roughly US$155 billion worth of tokens would unlock between 2024 and 2030. The report argued that high launch valuations leave limited room for later buyers, because much of the gain had already gone to private investors before public trading, and that steady unlocks can add selling pressure unless demand grows to match.",
      },
      {
        type: "example",
        title: "The early and the late price",
        children:
          "Giulia in Turin learns that private investors in an invented token paid €0.05 per token two years before launch. The public launch price is €1. Those investors hold 20% of the supply, unlocking after a one-year cliff. Even if the price halves to €0.50, they would still be ten times above what they paid, so they may be willing to sell. Giulia realises she would be buying at the top of a long queue of potential sellers.",
      },
      {
        type: "warning",
        title: "Check the unlock calendar before you buy",
        children:
          'A low circulating supply can make a token look small and "early" when most of its supply is still locked. Before buying any token, find its unlock schedule and the share held by insiders, and ask who could sell, and at what profit, in the coming months.',
      },
      {
        type: "paragraph",
        children:
          "So where do you find all these numbers? Mostly on data aggregator pages, which deserve a careful read.",
      },
    ],
  },
  {
    title: "Contract powers treasury and practical control",
    shortTitle: "Contract powers treasury and practical control",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Who can change supply or restrict transfers",
      },
      {
        type: "paragraph",
        children:
          "Inspect mint permissions, burning authority, pause functions, blacklists, transfer charges and upgrade control where the token allows them. A public maximum supply can be misleading if an administrator can change the relevant implementation or create additional units. A transfer tax or restrictive selling rule can also make an ordinary order-book valuation unrealistic.",
      },
      {
        type: "paragraph",
        children:
          "Identify who holds each power and whether there are thresholds, timelocks or notices. A timelock may give users time to inspect an announced change, but it does not guarantee a convenient exit. Concentrated administrator control can affect both supply and usability. The technical permissions must therefore be considered alongside the economic allocation chart rather than placed in an unrelated security footnote.",
      },
      {
        type: "paragraph",
        children:
          "Think of signing a rental agreement in Paris. If the landlord refuses to show you the full contract, or reserves the right to change the rent whenever they like, you would want to know before signing. A token's smart contract is its rulebook, and you can often read it.",
      },
      {
        type: "example",
        title: "The mint button",
        children:
          'Chloé in Lyon reads an invented token\'s verified contract with help from a community explainer. She finds that one address can create new tokens at any time, with no limit. The project says it "will never use it". Chloé notes that a promise is not a control: if that address can mint, it could dilute every holder overnight.',
      },
      {
        type: "heading",
        level: 3,
        children: "Treasury records and practical control",
      },
      {
        type: "paragraph",
        children:
          "A treasury can fund development, liquidity or incentives, but its spending and control should be documented. Compare stated policies with dated transactions and governance records. Large holdings may be exchange or custody addresses serving many people, so avoid treating every large address as one investor without evidence. Record the classification and uncertainty.",
      },
      {
        type: "paragraph",
        children:
          "When schedules change, preserve the old and new documents with dates and ask who authorised the change. A research dossier should identify material unresolved issues, including unexplained transfers, overlapping allocations and discretionary emissions. You do not need to prove wrongdoing to decline further action. The next lesson combines identity, supply, control and liquidity into a concise evidence-based conclusion.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A workplace bonus released over time",
        children:
          "A company in Canada promises a CAD 12,000 bonus subject to a schedule. CAD 3,000 becomes available after a year, followed by CAD 750 monthly for twelve months. The employee may save each payment rather than spend it immediately. Token unlocks similarly change availability without proving immediate selling. The comparison also shows why exact amounts and conditions matter: a short description such as annual bonus could conceal a very different cash-flow schedule.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A published vesting chart does not establish enforceability or an inevitable price outcome.",
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
          "1. How many units unlock in the first two monthly releases after the cliff?",
          "2. Why can community and treasury labels overlap?",
          "3. What evidence is needed before calling a large address one wealthy individual?",
        ],
        answers: [
          "1. Two times 750,000 equals 1.5 million units. Including the cliff, cumulative unlocked is 4.5 million.",
          "2. The treasury may hold a community allocation for future distribution. Adding both independently can count the same units twice.",
          "3. Reliable address attribution and context. The address may be a custodian, contract or exchange serving many holders.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does an unlock prove that all released tokens were immediately sold?",
        ],
        answers: [
          "No. It changes availability under a schedule. Selling requires separate evidence.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Reconcile allocations to a defined supply basis.",
          "Unlocking, circulation and selling are separate events.",
          "Permissions can alter the economic meaning of a schedule.",
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
            title: "Ethereum  Token standards",
            url: "https://ethereum.org/developers/docs/standards/tokens/",
          },
          {
            title: "Ethereum  Decentralised Autonomous Organisations",
            url: "https://ethereum.org/dao/",
          },
          {
            title: "Ethereum  Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title: "Uniswap  Uniswap — Introducing UNI",
            url: "https://blog.uniswap.org/uni",
          },
          {
            title:
              "US Department of Justice  US Department of Justice — Eighteen Individuals and Entities Charged in International Operation Targeting Widespread Fraud and Manipulation in the Cryptocurrency Markets",
            url: "https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread",
          },
          {
            title:
              "US SEC  US SEC — SEC Charges Kim Kardashian for Unlawfully Touting Crypto Security (3 October 2022)",
            url: "https://www.sec.gov/newsroom/press-releases/2022-183",
          },
          {
            title:
              "Federal Trade Commission  Federal Trade Commission — What To Know About Cryptocurrency and Scams",
            url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
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
  course: "crypto-tokens-and-research",
  description:
    "Produce a balanced research record with verifiable facts and unresolved questions.",
  estimatedMinutes: 17,
  learningPath: "crypto",
  level: "level-5",
  module: "token-supply-and-research",
  objectives: [
    "Produce a balanced research record with verifiable facts and unresolved questions.",
  ],
  position: 4,
  prerequisites: ["allocations-vesting-unlocks-and-control"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["allocations-vesting-unlocks-and-control"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Produce a balanced research record with verifiable facts and unresolved questions.",
  seoTitle: "Build a Token Dossier and Check Liquidity",
  slug: "build-a-token-dossier-and-check-liquidity",
  sources: [
    {
      title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
    },
    {
      title: "FCA  Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "Glassnode  Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title: "Ethereum  Ethereum security and scam prevention",
      url: "https://ethereum.org/security/",
    },
    {
      title:
        "SEC Investor gov  Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
    },
    {
      title: "Coinbase  Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Uniswap  How Uniswap works",
      url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
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
        "US Department of Justice  US Department of Justice — Eighteen Individuals and Entities Charged in International Operation Targeting Widespread Fraud and Manipulation in the Cryptocurrency Markets",
      url: "https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread",
    },
    {
      title:
        "US SEC  US SEC — SEC Charges Kim Kardashian for Unlawfully Touting Crypto Security (3 October 2022)",
      url: "https://www.sec.gov/newsroom/press-releases/2022-183",
    },
    {
      title:
        "Federal Trade Commission  Federal Trade Commission — What To Know About Cryptocurrency and Scams",
      url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
    },
  ],
  status: "published",
  title: "Build a Token Dossier and Check Liquidity",
};
const sections4: LessonSection[] = [
  {
    title: "Build a research file from evidence",
    shortTitle: "Build a research file from evidence",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Produce a balanced research record with verifiable facts and unresolved questions.",
      },
      {
        type: "paragraph",
        children:
          "A token dossier is a short, organised account of what you know, how you know it and what remains uncertain. It is more useful than a collection of favourable links. We will assemble identity, rights, supply, control and liquidity evidence, then practise writing a conclusion that can include a reason to stop.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A dossier should make its evidence and its limits easy to review.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "A research file begins with evidence",
      },
      {
        type: "heading",
        level: 3,
        children: "Why check a token before you buy",
      },
      {
        type: "paragraph",
        children:
          "Before buying a used car in Johannesburg, a careful buyer checks the logbook, asks a mechanic to look underneath and walks away if the seller insists on cash today. None of those checks proves the car is perfect. They do catch the most common tricks, and they cost far less than a bad car.",
      },
      {
        type: "paragraph",
        children:
          "Tokens deserve the same habit, because the tricks are common and the losses are often permanent. Chainalysis, a blockchain-analysis firm, estimated that more than US$2.8 billion was taken through rug pulls in 2021, making them 37% of all crypto-scam revenue that year, up from 1% in 2020. It explained why: creating a token and listing it on a decentralised exchange is cheap and needs no code audit.",
      },
      {
        type: "paragraph",
        children:
          "In the token purpose lesson in Level 5 you learned what tokens are for, and in the supply and allocation lessons in Level 5 how to read their supply. This lesson turns that knowledge into a set of checks. Where the car analogy stops working is recourse: a car dealer usually has an address and a licence, but an anonymous token team may have neither, and a confirmed blockchain transfer generally cannot be reversed. So the first checks are about the people behind the token.",
      },
      {
        type: "heading",
        level: 3,
        children: "Look for red flags in the people and the promises",
      },
      {
        type: "paragraph",
        children:
          "Imagine a stranger in Istanbul offering to double your ₺10,000 (an invented amount) within a month. You would ask who they are, what their track record is and how they can promise such a result. Those three questions work for tokens too.",
      },
      {
        type: "paragraph",
        children:
          "Anonymous teams with no track record. Some honest projects have anonymous founders; Bitcoin's creator used a pseudonym. But anonymity removes accountability. If nobody can be identified, there is nobody to hold responsible if funds vanish. The risk is highest when an anonymous team also controls the treasury, the contract and a large share of the tokens. Check whether team claims can be verified: past projects, public code and consistent identities over years.",
      },
      {
        type: "paragraph",
        children:
          'Promised returns. The US Federal Trade Commission (FTC) warns that scammers promise you will make money, often big amounts quickly. No legitimate investment can promise that. A token whose website talks mainly about future price, daily rewards or "x100 potential" is selling a hope, not a product.',
      },
      {
        type: "paragraph",
        children:
          'Pressure and secrecy. Countdown timers, "last chance" messages and requests to keep the deal quiet are designed to stop you thinking. The FTC also lists vague explanations, unverified testimonials and unsolicited contact as warning signs.',
      },
      {
        type: "example",
        title: "The team page that went nowhere",
        children:
          'Mehmet in Istanbul looks at an invented token whose website lists five team members. He searches each name and finds no past work, no public code and photos that appear on unrelated sites. The website promises "steady daily returns". He stops there. He has not proved fraud, but he has found two strong red flags and no reason to accept the risk.',
      },
      {
        type: "paragraph",
        children:
          "People and promises are only the outside of the box. Next, look inside, at the contract.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read a whitepaper critically",
      },
      {
        type: "paragraph",
        children:
          "A whitepaper is like a business plan handed out by someone asking you for money in Mexico City. A good one explains a real problem, a workable solution and how money will be spent. A bad one is full of grand words and short on checkable facts. Bitcoin's nine-page whitepaper from 2008 is a reminder that a strong idea can be explained plainly.",
      },
      {
        type: "paragraph",
        children:
          "Read it with a pencil. For every big claim, ask what evidence would show it is true, and whether you can find that evidence yourself. The table gives common claims and the checks that match them.",
      },
      {
        type: "comparisonTable",
        caption: "Whitepaper claims and how to check them",
        columns: ["Claim in the whitepaper", "What to check"],
        rows: [
          [
            '"Partnered with major companies"',
            "Does each company confirm it on its own website or channels?",
          ],
          [
            '"Audited and secure"',
            "Is the audit report public, from a named firm, for the current contract?",
          ],
          [
            '"Fair distribution"',
            "Do the explorer's top holders and the unlock schedule match?",
          ],
          [
            '"Real utility"',
            "Does the product exist, and does it need this token (Lesson C5.1)?",
          ],
          [
            '"Experienced team"',
            "Can you verify names, past projects and public code?",
          ],
          [
            '"High returns for holders"',
            "Where would the money come from? Promised returns are a red flag",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Watch for copied text, vague technical language that never explains how anything works, a roadmap with dates that keep slipping, and token allocations that differ from what the contract shows. Then bring everything together in one place, so that your judgement is written down rather than left to mood.",
      },
      {
        type: "paragraph",
        children:
          "Team disclosures can help identify accountability, but a public biography is not proof of competence or honesty. A source being official does not make every promotional interpretation correct. The dossier should remain understandable to a reader who has not watched the promotional videos.",
      },
      {
        type: "heading",
        level: 3,
        children: "Facts estimates claims and forecasts",
      },
      {
        type: "paragraph",
        children:
          "A fact might be that a contract reports a specific total supply at a timestamp. An observation might be a visible order-book depth. An estimate might classify addresses into entities. An interpretation might conclude that concentration increases a governance risk. A prediction concerns a future outcome. These categories need different levels of certainty.",
      },
      {
        type: "paragraph",
        children:
          "Use sentences that reveal the distinction: the published terms state, the sampled book shows, the provider estimates, or our interpretation is. Identify conflicts of interest and alternative explanations. A sponsored review can point you toward a question but should not become the only proof. Repetition across websites may simply repeat one original claim. Trace important statements to their origin and record disagreements rather than averaging incompatible definitions.",
      },
      {
        type: "paragraph",
        children:
          "If a famous footballer advertises a sports drink, you probably assume they were paid. The same logic applies to tokens, but the stakes are much higher.",
      },
      {
        type: "paragraph",
        children:
          "On 3 October 2022, the US SEC charged Kim Kardashian for promoting EMAX tokens, offered by EthereumMax, on Instagram without disclosing that she had been paid US$250,000 for the post. She agreed to pay US$1.26 million to settle the charges, without admitting or denying the findings. The SEC stressed that anyone promoting a crypto asset security must disclose the nature, source and amount of payment received.",
      },
      {
        type: "paragraph",
        children:
          "The FTC adds a separate warning: celebrities are not contacting you through social media, and an account that seems to be a famous person offering a crypto deal is a scammer. Impersonation was covered in Level 0; here the point is that even genuine promotions are often paid advertising, not independent advice.",
      },
      {
        type: "example",
        title: "The post with no disclosure",
        children:
          'Emma in Leeds sees a well-known presenter praising an invented token. The post has no "ad" or "paid" label, but the token\'s website lists the presenter as a "brand partner". Emma treats the post as an advertisement and checks the token against her checklist instead of trusting the face.',
      },
      {
        type: "paragraph",
        children:
          "Paid promotion manufactures attention. Wash trading manufactures activity.",
      },
    ],
  },
  {
    title: "Liquidity holders and manipulation",
    shortTitle: "Liquidity holders and manipulation",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "See who holds the tokens and where the liquidity sits",
      },
      {
        type: "paragraph",
        children:
          "Imagine a small town market in Brazil where one trader owns most of the beans. That trader can set the price, and if they decide to sell everything at once, the price collapses for everyone else. Token markets work the same way.",
      },
      {
        type: "paragraph",
        children:
          'Holder concentration means a small number of addresses own a large share of the supply. Most explorers have a "holders" tab listing the top addresses. Read it with care. Some top addresses belong to exchanges holding tokens for many customers, to locked vesting contracts or to the project treasury. Others may be one person spread across many wallets. Ask: who are the top ten holders, and could any of them sell enough to crash the price?',
      },
      {
        type: "paragraph",
        children:
          "Liquidity is how easily you can sell without moving the price. Many new tokens trade mainly in a liquidity pool on a decentralised exchange: a contract holding two tokens that lets people swap between them. You will study how pools work in Level 6. For now, what matters is how much is in the pool, who supplied it and whether it is locked. Binance Academy lists unlocked liquidity as a red flag, because whoever supplied it can withdraw it.",
      },
      {
        type: "example",
        title: "Too thin to leave",
        children:
          "Daniel in Cape Town finds an invented token whose pool holds only R50,000 worth of value. He calculates that selling his intended R10,000 position later would take a large share of the pool and push the price sharply down. Thin liquidity means he could get in at one price and be unable to get out near it.",
      },
      {
        type: "paragraph",
        children:
          "When the people supplying liquidity also hold most of the tokens, the stage is set for the most famous token scam of all.",
      },
      {
        type: "heading",
        level: 3,
        children: "Understand rug pulls hard and soft",
      },
      {
        type: "paragraph",
        children:
          "The name comes from the image of someone pulling a rug from under your feet. One moment the market looks solid; the next, it is gone.",
      },
      {
        type: "definition",
        term: "Rug pull",
        children:
          "A scam in which a token's creators abandon the project and take the money, leaving buyers with tokens that are worth little or nothing.",
      },
      {
        type: "paragraph",
        children:
          'Coinbase Learn distinguishes hard rug pulls, which are sudden and leave holders losing almost everything within a short time, from soft rug pulls, where the team keeps up an appearance of activity while quietly winding down and selling. Definitions vary between sources: some use "hard" for exits built into malicious code and "soft" for teams that dump their holdings without code tricks. Whatever the label, the mechanisms are similar.',
      },
      {
        type: "paragraph",
        children:
          "The most common is liquidity removal. The creators launch a token, pair it with ether or a stablecoin in a pool, promote it until buyers pour in, then withdraw the pool's valuable side. The token is left with nothing to swap against. Chainalysis described AnubisDAO, launched on 28 October 2021, which raised nearly US$60 million in about 20 hours before the liquidity was withdrawn. Other routes include minting huge numbers of new tokens and selling them, or upgrading the contract to change the rules.",
      },
      {
        type: "paragraph",
        children:
          "Chainalysis also counted the 2021 collapse of Thodex, a centralised exchange in Türkiye whose chief executive disappeared after halting withdrawals, as a rug pull. It accounted for about 90% of that year's rug-pull losses. Rug pulls are not only a decentralised-exchange problem.",
      },
      {
        type: "warning",
        title: "Locked does not mean safe",
        children:
          'A project may say its liquidity is "locked". Check for how long, by which contract, and whether the team holds enough tokens elsewhere to dump them anyway. A lock that ends next week, or a team that holds half the supply, leaves the door open.',
      },
      {
        type: "paragraph",
        children:
          "Some traps do not need anyone to run away. The contract itself stops you leaving.",
      },
      {
        type: "heading",
        level: 3,
        children: "Recognise honeypots",
      },
      {
        type: "paragraph",
        children:
          "A lobster pot lets the lobster climb in, but the shape of the trap makes it almost impossible to climb out. A honeypot token works the same way.",
      },
      {
        type: "definition",
        term: "Honeypot token",
        children:
          "A token whose contract lets people buy but blocks or heavily penalises selling, usually through hidden rules that only the creator can bypass.",
      },
      {
        type: "paragraph",
        children:
          "Binance Academy lists blocking users from selling among the ways a malicious contract can trap buyers. The chart of a honeypot often looks wonderful, because every trade is a buy and the price only rises. That is exactly what makes it convincing. The creator, who is exempt from the restriction, can sell at any time.",
      },
      {
        type: "example",
        title: "The chart that only went up",
        children:
          'Hiroshi in Tokyo sees an invented token whose price has risen steadily for two days with hundreds of buyers and, he notices, almost no sells. He opens the explorer\'s transaction list and finds that only one address has ever sold. He reads that as a possible honeypot and does not buy. Buying a small amount "to test" would not be a safe check, because the trap may let small sells through or change its rules later.',
      },
      {
        type: "paragraph",
        children:
          "Honeypots and rug pulls are often launched alongside heavy promotion. That promotion sometimes takes the shape of a coordinated pump.",
      },
      {
        type: "heading",
        level: 3,
        children: "See how pump and dump schemes work",
      },
      {
        type: "paragraph",
        children:
          "In a crowded market in Delhi, a few traders loudly praise one stall's mangoes, draw a crowd and sell their own stock to the crowd at a high price, then disappear. The crowd is left holding expensive mangoes. Crypto pump-and-dumps follow that script.",
      },
      {
        type: "definition",
        term: "Pump-and-dump",
        children:
          "A scheme in which insiders buy a token cheaply, hype it to attract buyers, and sell their holdings into the rising price, leaving later buyers with losses.",
      },
      {
        type: "paragraph",
        children:
          "Chainalysis studied about 2.06 million tokens launched in 2024 and found that 3.59%, more than 74,000 tokens, showed patterns matching pump-and-dump schemes. In around 94% of the suspected cases, the liquidity pool was later drained by the same address that created it. Chainalysis is careful to say its method tracks patterns of behaviour, not intent, so a pattern alone does not prove manipulation.",
      },
      {
        type: "paragraph",
        children:
          "Memecoins are especially exposed, because their price rests almost entirely on attention. A new memecoin can be launched, promoted through chat groups and social media, pumped and dumped within hours. You will study the emotions that make this work, such as fear of missing out, in Level 9.",
      },
      {
        type: "paragraph",
        children:
          "These schemes can also use the celebrity promotion discussed in Step 2. A familiar face is not evidence that liquidity or holder incentives are sound.",
      },
      {
        type: "heading",
        level: 3,
        children: "Recognise wash trading and fake activity",
      },
      {
        type: "paragraph",
        children:
          "Imagine a café in Hamburg where the owner pays friends to queue outside all day so passers-by think the coffee must be excellent. The queue is real people, but the demand is fake. Wash trading is the crypto version.",
      },
      {
        type: "definition",
        term: "Wash trading",
        children:
          "Buying and selling the same asset, at the same time, without any real change in who owns it, to create a false picture of trading volume and demand.",
      },
      {
        type: "paragraph",
        children:
          "Chainalysis estimated that suspected wash trading on Ethereum, BNB Smart Chain and Base in 2024 may have reached up to US$2.57 billion of decentralised-exchange volume. In October 2024, US prosecutors announced charges against 18 people and companies after Operation Token Mirrors, in which the FBI created its own token, NexFundAI, to catch firms offering fake trading services. More than US$25 million in crypto was seized and bots behind wash trades in around 60 tokens were switched off.",
      },
      {
        type: "paragraph",
        children:
          "For you, the lesson is that high volume on a data page, as in the supply and allocation lessons in Level 5, does not prove real interest. Compare volume with holder numbers, liquidity and the spread of trading venues. You will analyse on-chain metrics and their limits in Level 7. Bring these observations back to the whitepaper claims examined in Step 1. The dossier should connect promises with observable activity rather than treating each check in isolation.",
      },
      {
        type: "paragraph",
        children:
          "For a pool, examine reserves, route, fee and expected impact under the actual version. Compare activity across a reasonable sample of times rather than relying on one calm screenshot. A simplified full sale receives USD 1,400 before fees, not USD 2,000. The book can change, so this is an illustration rather than a prediction.",
      },
    ],
  },
  {
    title: "Audit scope conclusions and research template",
    shortTitle: "Audit scope conclusions and research template",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Read audit claims within scope",
      },
      {
        type: "paragraph",
        children:
          "An audit or security review identifies a specific code version, scope, method and set of findings. Read unresolved issues and later changes. A report for an earlier contract version cannot automatically certify an upgrade. A report focused on code does not establish safe administrators, sound token economics, honest reserves or legal enforceability.",
      },
      {
        type: "paragraph",
        children:
          "Also inspect bug-bounty scope, incident history and response procedures where available. Absence of a public incident is not proof that all vulnerabilities are absent. Published code improves inspectability, but most beginners cannot independently verify every property. State where you rely on specialist review and what it does not cover. The purpose of the dossier is honest reasoning, not a checklist that automatically produces a safe label.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write a conclusion with clear stop conditions",
      },
      {
        type: "paragraph",
        children:
          "A useful conclusion identifies the researched product, important evidence, key dependencies, unresolved questions and the next permissible research step. It can say that evidence is insufficient or that an activity is unsuitable for the stated purpose. Avoid replacing uncertainty with a price target. Research quality is judged by the reasoning and documentation, not by whether the price later moves favourably.",
      },
      {
        type: "paragraph",
        children:
          "Finish with a version date and conditions that would require revision, such as a contract upgrade, changed redemption terms or a major supply release. Use fictional quantities and no real account secrets. The next level applies the same evidence discipline to DeFi protocols, where several individually familiar assets and mechanisms can combine into a more complex risk path.",
      },
      {
        type: "paragraph",
        children:
          "A pilot in Melbourne runs through a checklist before every flight, however experienced they are. The checklist does not fly the plane, but it stops important steps being skipped under pressure. Your token checklist does the same.",
      },
      {
        type: "paragraph",
        children:
          "Use the template below for any token you consider. Record what you checked, the evidence and the date. A single red flag may be enough to walk away; several together almost always are. This template is the seed of the token research deliverable in the Level 10 graduation project, so keep your filled-in copies.",
      },
      {
        type: "comparisonTable",
        caption: "Token research template",
        columns: ["Area", "Questions", "My notes and evidence"],
        rows: [
          [
            "Purpose",
            "What is it for? Does anything require it? (C5.1)",
            "Record your notes and evidence here",
          ],
          [
            "Launch",
            "ICO, IEO, IDO, airdrop? Who checked it? (C5.1)",
            "Record your notes and evidence here",
          ],
          [
            "Supply",
            "Circulating, total, max; market cap and FDV (C5.2)",
            "Record your notes and evidence here",
          ],
          [
            "Unlocks",
            "Insider share, cliffs, next large unlock (C5.3)",
            "Record your notes and evidence here",
          ],
          [
            "Team",
            "Identifiable? Track record?",
            "Record your notes and evidence here",
          ],
          [
            "Contract",
            "Verified? Audited? Mint, pause, blacklist or upgrade powers?",
            "Record your notes and evidence here",
          ],
          [
            "Holders",
            "Top ten share; exchanges vs individuals",
            "Record your notes and evidence here",
          ],
          [
            "Liquidity",
            "Pool size, who supplied it, locked until when?",
            "Record your notes and evidence here",
          ],
          [
            "Trading",
            "Do sells happen? Does volume match holders?",
            "Record your notes and evidence here",
          ],
          [
            "Promotion",
            "Paid promoters? Promised returns? Pressure?",
            "Record your notes and evidence here",
          ],
          [
            "Regulation",
            "Any warning from my national regulator?",
            "Record your notes and evidence here",
          ],
          [
            "Decision",
            "Walk away, watch only, or research further?",
            "Record your notes and evidence here",
          ],
        ],
      },
      {
        type: "paragraph",
        children: "Now practise using these checks.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Researching a second-hand car",
        children:
          "Before spending EUR 5,000 on a car in Germany, Malik checks its identity, records, condition and ownership documents. A seller's attractive photographs are helpful but insufficient. A token dossier similarly connects the exact asset to its documents, permissions and practical exit. If the seller cannot establish ownership or an important defect remains unresolved, Malik can stop without needing to prove fraud. An evidence gap is a valid decision reason.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not let an audit title, volume statistic or sponsored review stand in for the complete research process.",
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
          "1. Fictional bids offer 100 units at USD 2, 200 at USD 1.80 and 700 at USD 1.20. Calculate proceeds before fees from selling 1,000 units.",
          "2. Write one factual and one interpretive sentence about that book.",
          "3. An audit covers version 1 but version 2 is deployed. What should the dossier state?",
        ],
        answers: [
          "1. 100 × 2 + 200 × 1.80 + 700 × 1.20 = USD 1,400 before fees. Average is USD 1.40.",
          "2. Fact: the supplied bids cover 1,000 units at stated levels. Interpretation: the last-price valuation may overstate immediate exit proceeds at this size.",
          "3. The report's scope is version 1; changes and a relevant review for version 2 remain to be checked. Do not extend the old conclusion automatically.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Must a research dossier end with a recommendation to trade?",
        ],
        answers: [
          "No. Insufficient evidence or unacceptable dependencies can justify stopping. Research and trading are separate activities.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Trace important claims to primary evidence.",
          "Test liquidity at a relevant size.",
          "A clear uncertainty can be more useful than a confident price target.",
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
            title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
          },
          {
            title: "FCA  Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "Glassnode  Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title: "Ethereum  Ethereum security and scam prevention",
            url: "https://ethereum.org/security/",
          },
          {
            title:
              "SEC Investor gov  Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
          },
          {
            title: "Coinbase  Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Uniswap  How Uniswap works",
            url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works",
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
              "US Department of Justice  US Department of Justice — Eighteen Individuals and Entities Charged in International Operation Targeting Widespread Fraud and Manipulation in the Cryptocurrency Markets",
            url: "https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread",
          },
          {
            title:
              "US SEC  US SEC — SEC Charges Kim Kardashian for Unlawfully Touting Crypto Security (3 October 2022)",
            url: "https://www.sec.gov/newsroom/press-releases/2022-183",
          },
          {
            title:
              "Federal Trade Commission  Federal Trade Commission — What To Know About Cryptocurrency and Scams",
            url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel5Lessons: LessonDocument[] = [
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
