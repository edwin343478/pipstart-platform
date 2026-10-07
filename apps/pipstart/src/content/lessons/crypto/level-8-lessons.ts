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
  course: "crypto-risk-and-portfolios",
  description:
    "Calculate a planned spot quantity and explain why the result is only an estimate.",
  estimatedMinutes: 10,
  learningPath: "crypto",
  level: "level-8",
  module: "sizing-leverage-and-portfolio-risk",
  objectives: [
    "Calculate a planned spot quantity and explain why the result is only an estimate.",
  ],
  position: 1,
  prerequisites: ["sentiment-narratives-and-an-evidence-based-research-note"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["leverage-margin-and-liquidation-risk"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Calculate a planned spot quantity and explain why the result is only an estimate.",
  seoTitle: "Choose the Loss Budget Before the Position Size",
  slug: "choose-the-loss-budget-before-the-position-size",
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
      title: "Coinbase: Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title:
        "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
    {
      title:
        "Investor.gov: Investor.gov — Beginners' Guide to Asset Allocation, Diversification, and Rebalancing",
      url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
    },
  ],
  status: "published",
  title: "Choose the Loss Budget Before the Position Size",
};
const sections1: LessonSection[] = [
  {
    title: "Essential money and your loss budget",
    shortTitle: "Essential money and your loss budget",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Calculate a planned spot quantity and explain why the result is only an estimate.",
      },
      {
        type: "paragraph",
        children:
          "Position sizing begins with a loss boundary, not with the number of units you would like to own. Even then, a planned loss is an estimate that depends on execution. We will calculate a simple fully paid spot example, include a cost allowance and check the units. The exercise does not prescribe a suitable real-world allocation or risk percentage.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Size from an explicit loss allowance and then stress the assumptions.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Start with the money that must stay out",
      },
      {
        type: "paragraph",
        children:
          'Think of a family in Recife, Brazil, who keep their money in labelled envelopes. One says "rent", one says "food", one says "school". When a friend suggests a promising side business, they don\'t open the rent envelope to fund it, however small the share sounds. The first decision about risk is which money is never at risk at all.',
      },
      {
        type: "paragraph",
        children:
          "You met this idea in Level 0. An emergency fund is cash kept for surprise bills in a safe, accessible place such as a bank account, and it comes first. Money for rent, food, healthcare, school fees and loan repayments stays outside crypto too. The US Commodity Futures Trading Commission (CFTC) advises speculating only with money you can afford to lose, and the UK Financial Conduct Authority (FCA) says crypto investors should be prepared to lose all their money.",
      },
      {
        type: "example",
        title: "The envelope that stays closed",
        children:
          'Mariana in Recife has R$3,000 in an emergency account and pays R$1,500 a month in rent (invented amounts for this example). A colleague says, "Put in only 10% of your rent money." Mariana replies that 10% of money she needs is still money she needs.',
      },
      {
        type: "paragraph",
        children:
          'The envelope picture stops working in one way: envelopes hold a fixed amount, while crypto changes value every minute. So the next step is to turn "spare money" into a firm number.',
      },
      {
        type: "heading",
        level: 3,
        children: "Set a personal loss budget",
      },
      {
        type: "paragraph",
        children:
          "A shop owner in Melbourne trying a new product line decides in advance how much unsold stock she could write off. She doesn't wait to see how sales feel, and that written number protects her from deciding under pressure.",
      },
      {
        type: "definition",
        term: "Loss budget",
        children:
          "The total amount of money, written as a cash figure in your home currency, that you have decided in advance you could lose on crypto without touching essential money or your emergency fund.",
      },
      {
        type: "paragraph",
        children:
          "A loss budget works on two levels: the whole crypto pot, and a smaller slice for each separate idea or position.",
      },
      {
        type: "example",
        title: "Two numbers on one page",
        children:
          'Hannah in Toronto has her emergency fund in place and C$5,000 of spare savings (invented amounts). She writes: "Total crypto loss budget this year: C$1,000. Most I will risk on any single idea: C$50." These are her own limits, not recommendations.',
      },
      {
        type: "paragraph",
        children:
          "Hannah's numbers are about loss, not about how much she buys. Confusing the two is a common sizing mistake, so the next section turns a loss number into a size.",
      },
      {
        type: "paragraph",
        children:
          "A fictional learning balance is not an instruction to use an equivalent real sum. A loss budget should not be increased merely because the latest idea feels compelling. Two learners with the same savings can have different obligations and appropriate choices. This course therefore does not supply a universal percentage of capital to risk. A mathematically correct quantity can still be unsuitable if the underlying funds cannot be lost.",
      },
    ],
  },
  {
    title: "Define the idea and calculate the size",
    shortTitle: "Define the idea and calculate the size",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Decide the loss before the size",
      },
      {
        type: "paragraph",
        children:
          "A shopper in Kolkata has ₹300 for mangoes. At ₹30 each, that buys ten; at ₹60, five. The budget stays fixed and the quantity changes. Position sizing works the same way, except you divide by the distance to your planned exit.",
      },
      {
        type: "paragraph",
        children:
          "For a trade, first decide the price at which your idea is wrong. Measure how far that is from your entry, as a fraction of the entry price, and divide your loss budget by that fraction. CME Group's trading course describes the same two steps: place the exit at a logical level first, then size the position so the money at risk matches what you accept.",
      },
      {
        type: "formula",
        expression:
          "Position size = amount at risk ÷ distance to exit (as a fraction), where distance to exit = (entry price − exit price) ÷ entry price for a purchase.",
        explanation:
          "if you accept a £50 loss and your exit is 10% below your entry, the position can be £50 ÷ 0.10 = £500. Then units = position size ÷ entry price.",
      },
      {
        type: "example",
        title: "The same budget, two exits",
        children:
          "James in Leeds will risk at most £50 on one idea. He plans to buy an invented coin at £2.00 and sell if it falls to £1.80 (invented prices). The distance is 0.20 ÷ 2.00 = 10%, so his position is £50 ÷ 0.10 = £500, or 250 coins. If his idea needed an exit at £1.60, the distance doubles to 20% and the position halves to £250. A wider exit means a smaller position, never a bigger budget.",
      },
      {
        type: "paragraph",
        children:
          "Two adjustments keep this honest. First, costs: if James expects about £5 in fees and a worse fill, he sizes from £45, giving £450. Second, rounding: exchanges sell in fixed steps, so always round units down. If even the smallest allowed order would lose more than £50 at the exit, the answer is zero, and skipping the trade is a valid result.",
      },
      {
        type: "warning",
        title: "A planned exit is not a promised price",
        children:
          "Crypto trades 24/7 and can drop sharply in minutes. A stop order may fill below the price you set, especially in a thin market. Your loss budget is a plan under stated assumptions, not a ceiling the market has agreed to.",
      },
      {
        type: "paragraph",
        children:
          "This formula assumes you have a planned exit. Many people who hold crypto for years don't. How do you size a holding with no exit price at all?",
      },
      {
        type: "heading",
        level: 3,
        children: "Size a holding with no exit price",
      },
      {
        type: "paragraph",
        children:
          "A long-term holding is like lending your car to a relative for a year: you hope it comes back in good shape, but you accept it might not. With no planned exit, the honest distance to assume is the whole amount.",
      },
      {
        type: "formula",
        expression: "Holding size ≤ amount you could lose entirely",
        explanation:
          'with no planned exit, the distance is 100%: assume the whole holding could go to zero, as many tokens have. This is the "money you can afford to lose" rule written as arithmetic.',
      },
      {
        type: "paragraph",
        children:
          "Is 100% too gloomy for large assets? Test at least a severe fall. Bitcoin fell roughly 75% from its November 2021 high to its November 2022 low, and CNBC reported that the whole crypto market shrank from roughly US$3 trillion to around US$900 billion over that period.",
      },
      {
        type: "example",
        title: "Sizing against history",
        children:
          "Aarav in Bengaluru has a ₹50,000 loss budget (invented). Holding ₹50,000 of coins keeps even a total loss inside it. Holding ₹200,000 instead, a 75% fall like 2021–22 would cost ₹150,000, three times what he said he could lose.",
      },
      {
        type: "paragraph",
        children:
          "So far every coin has been treated the same, but some swing far more than others.",
      },
      {
        type: "heading",
        level: 3,
        children: "Let volatility change the size",
      },
      {
        type: "paragraph",
        children:
          "On a motorway near Cape Town, 100 km/h is normal; on a gravel mountain pass, the same speed is reckless. The road decides the safe speed. In markets, the road is volatility: how far and how fast a price usually moves.",
      },
      {
        type: "paragraph",
        children:
          "The CFTC notes that virtual currencies are more volatile than traditional currencies. Within crypto, volatility differs too: a large, heavily traded coin often moves less day to day than a small token with thin liquidity, which you met in Level 5. A planned exit must sit outside an asset's normal noise, so more volatile assets need wider exits, and wider exits mean smaller positions.",
      },
      {
        type: "comparisonTable",
        caption: "The same £60 budget across three invented coins",
        columns: [
          "Invented coin",
          "Typical daily swing (invented)",
          "Exit distance chosen (twice the swing)",
          "Position for £60 at risk",
        ],
        rows: [
          ["Coin A, large and liquid", "3%", "6%", "£1,000"],
          ["Coin B, mid-sized", "6%", "12%", "£500"],
          ["Coin C, small and thin", "12%", "24%", "£250"],
        ],
      },
      {
        type: "paragraph",
        children:
          'The "twice the swing" rule is invented for the table, not a recommended setting. The loss is the same in each row while the size shrinks as volatility rises, and volatility itself changes over time.',
      },
      {
        type: "learningLink",
        title: "Open the Crypto Position Size Calculator",
        href: "/tools/crypto-position-size-calculator",
        description:
          "Try the PipStart tool: Crypto position size calculator — use the documented spot assumptions to compare a fictional USD 1,000 balance, a one-percent price-loss allowance, entry USD 60,000 and planned exit USD 57,000. With costs omitted, the USD 10 allowance supports about USD 200 entry value. Doubling the exit distance halves that value. Check quantity rounding and a worse fill manually. Tool setup: choose USD, Spot and BTC, a fictional 1,000 account balance, 1 percent risk, entry 60,000 and stop-loss 57,000. With minimum quantity and quantity step both 0.0001 BTC, rounding gives 0.0033 BTC, an entry value of USD 198 and a planned price loss of USD 9.90 before costs. The unrounded classroom value is USD 200. A wider exit distance reduces the size; actual losses can exceed the plan.",
      },
      {
        type: "paragraph",
        children:
          "Sizing one position well is half the job. The other half is noticing when several positions quietly become one large one.",
      },
      {
        type: "paragraph",
        children:
          "Capital committed and planned price loss must not be confused.",
      },
    ],
  },
  {
    title: "Costs, units, rounding and worse fills",
    shortTitle: "Costs units rounding and worse fills",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Include costs and round within the budget",
      },
      {
        type: "paragraph",
        children:
          "Reserve GBP 1 of the loss budget for specified estimated costs, leaving GBP 19 for the price-distance calculation. Dividing by GBP 5 gives 3.8 units. At entry the purchase value is GBP 190. Under an exact exit at GBP 45, the price loss is GBP 19; stated costs up to GBP 1 would bring planned loss to GBP 20.",
      },
      {
        type: "paragraph",
        children:
          "If the venue's permitted quantity step is 0.1, 3.8 is valid. If it is one whole unit, round down to three rather than up to four, because rounding up exceeds the price-risk allowance. Check minimum order value as well. A fee charged in the base asset can alter the quantity left to sell. Review how the cost estimate was built, and do not count spread or impact twice if already embedded in the assumed fills.",
      },
      {
        type: "comparisonTable",
        caption: "Size the fictional fully paid spot position",
        columns: ["Input or result", "Value", "Meaning"],
        rows: [
          ["Entry", "GBP 50 per unit", "Assumed average entry"],
          ["Planned exit", "GBP 45 per unit", "Assumed exit not guaranteed"],
          ["Price distance", "GBP 5 per unit", "Entry minus exit"],
          ["Planned loss budget", "GBP 20", "Supplied exercise boundary"],
          ["Cost allowance", "GBP 1", "Explicit estimate"],
          ["Price-risk allowance", "GBP 19", "Budget minus costs"],
          ["Quantity", "3.8 units", "19 divided by 5"],
          ["Purchase value", "GBP 190", "3.8 multiplied by 50"],
          [
            "Exit at GBP 43",
            "GBP 26.60 before costs",
            "Adverse execution exceeds plan",
          ],
        ],
      },
      {
        type: "diagram",
        alt: "A GBP 20 budget becomes GBP 19 price risk and 3.8 units; a lower exit price produces GBP 26.60 loss before costs.",
        caption:
          "Loss-budget sizing depends on fills, costs and quantity rules. The adverse example exceeds the original planned boundary.",
        src: "/lessons/crypto/level-8/lesson-1-rId46.png",
        description: [
          "GBP 20 budget minus GBP 1 costs leaves GBP 19 for price risk.",
          "GBP 19 ÷ GBP 5 risk per unit = 3.8 units before venue rounding.",
          "An exit at GBP 43 gives GBP 26.60 price loss in the supplied example, before costs. A planned budget does not control the actual fill.",
        ],
        width: 1187,
        height: 556,
      },
      {
        type: "heading",
        level: 3,
        children: "Use consistent account and quote currencies",
      },
      {
        type: "paragraph",
        children:
          "If prices are in USD and the budget is in GBP, convert consistently. Under a supplied fixed assumption of GBP 0.80 per USD, a USD 5 price distance is GBP 4 per unit. A GBP 20 budget before costs then permits five units by arithmetic, not four. The conversion rate can change between entry and exit, so a static illustration does not remove currency risk.",
      },
      {
        type: "paragraph",
        children:
          "PipStart's Crypto Position Size Calculator can illustrate a compatible simple price-distance example. Use the calculator only within its documented spot assumptions and verify units manually. The Risk Reward Calculator can compare planned reward and risk distances, but the ratio does not determine win probability or actual execution. Contract multipliers, inverse settlement and lending liquidations require their own worksheets.",
      },
      {
        type: "heading",
        level: 3,
        children: "Stress the planned exit",
      },
      {
        type: "paragraph",
        children:
          "If the 3.8-unit holding exits at GBP 43 instead of 45, the price loss becomes GBP 26.60 before costs. Gaps, disappearing liquidity, outages and provider failure can prevent the assumed exit. An invalidation condition can occur without an order filling. A wallet or exchange becoming inaccessible introduces a different failure from ordinary price distance.",
      },
      {
        type: "paragraph",
        children:
          "Stress the plan using adverse fills and total loss of the holding. Record what action is possible and what remains uncertain. A small calculated size is useful only when the learner understands its scope. The next lesson examines leverage, where a position larger than its supporting margin creates a different relationship between price movement and account equity.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A repair budget with a travel allowance",
        children:
          "Mina in the UK has a GBP 20 budget for a small repair. She reserves GBP 1 for travel, leaving GBP 19 for materials. Spending the whole GBP 20 on materials and adding travel afterward would break the budget. A position-size worksheet similarly reserves explicit costs before solving for quantity. The lesson's 3.8 units respect the supplied planned budget only under the stated exit and cost assumptions; a worse fill can still exceed it.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A planned exit level and calculator result cannot guarantee actual loss containment.",
      },
      {
        type: "learningLink",
        title: "Open the Crypto Position Size Calculator",
        href: "/tools/crypto-position-size-calculator",
        description:
          "Try the PipStart tool: Crypto Position Size Calculator — Suitable for the calculator's documented simplified assumptions. Review minimums and rounding; account separately for omitted costs and execution uncertainty. Do not treat it as a universal liquidation model. Tool setup: choose USD, Spot and BTC, a fictional 1,000 account balance, 1 percent risk, entry 60,000 and stop-loss 57,000. With minimum quantity and quantity step both 0.0001 BTC, rounding gives 0.0033 BTC, an entry value of USD 198 and a planned price loss of USD 9.90 before costs. The unrounded classroom value is USD 200. A wider exit distance reduces the size; actual losses can exceed the plan.",
      },
      {
        type: "learningLink",
        title: "Open the Risk Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Try the PipStart tool: Risk Reward Calculator — Compare entry, stop and target distances under stated price units. A reward-to-risk ratio is not the probability of success, actual net expectancy or a guaranteed fill. Tool setup: choose Long / Buy, entry 50,000, stop-loss 47,500 and target 55,000 in matching price units. The displayed risk-to-reward ratio is 1 : 2.00. It excludes fees, funding, liquidation rules and fill uncertainty.",
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
          "1. Round the table’s 3.8-unit result down if only whole units are permitted.",
          "2. At an exact GBP 45 exit, calculate the price loss on three units.",
          "3. Convert USD 5 per-unit risk to GBP at the supplied GBP 0.80 per USD.",
        ],
        answers: [
          "1. Three units. Four units would use GBP 20 of price risk before the reserved costs.",
          "2. Three times GBP 5 equals GBP 15, before costs.",
          "3. USD 5 × GBP 0.80 per USD = GBP 4 per unit. Both currencies must be labelled.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does the position-size output guarantee the maximum realised loss?",
        ],
        answers: [
          "No. It depends on entry, exit and cost assumptions. Adverse fills, outages and other failures can produce larger losses.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Choose the boundary before solving for quantity.",
          "Committed capital and planned price loss are different amounts.",
          "Round and convert units consistently.",
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
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "FCA: Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "Coinbase: Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title:
              "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
          {
            title:
              "Investor.gov: Investor.gov — Beginners' Guide to Asset Allocation, Diversification, and Rebalancing",
            url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
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
  course: "crypto-risk-and-portfolios",
  description:
    "Explain why collateral posted is not the same as the exposure or maximum possible loss.",
  estimatedMinutes: 9,
  learningPath: "crypto",
  level: "level-8",
  module: "sizing-leverage-and-portfolio-risk",
  objectives: [
    "Explain why collateral posted is not the same as the exposure or maximum possible loss.",
  ],
  position: 2,
  prerequisites: ["choose-the-loss-budget-before-the-position-size"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "choose-the-loss-budget-before-the-position-size",
    "concentration-correlation-and-shared-dependencies",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Explain why collateral posted is not the same as the exposure or maximum possible loss.",
  seoTitle: "Leverage, Margin and Liquidation Risk",
  slug: "leverage-margin-and-liquidation-risk",
  sources: [
    {
      title:
        "Kraken: Managing margin and liquidations in multi collateral trading",
      url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
    },
    {
      title: "Coinbase: What is the funding rate",
      url: "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
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
      title:
        "Financial Conduct Authority: Financial Conduct Authority — FCA bans the sale of crypto-derivatives to retail consumers",
      url: "https://www.fca.org.uk/news/press-releases/fca-bans-sale-crypto-derivatives-retail-consumers",
    },
    {
      title:
        "ESMA: ESMA — ESMA agrees to prohibit binary options and restrict CFDs to protect retail investors (27 March 2018)",
      url: "https://www.esma.europa.eu/sites/default/files/library/esma71-98-128_press_release_product_intervention.pdf",
    },
    {
      title:
        "CFTC: CFTC — CFTC Issues Final Interpretive Guidance on Actual Delivery for Digital Assets (24 March 2020)",
      url: "https://www.cftc.gov/PressRoom/PressReleases/8139-20",
    },
  ],
  status: "published",
  title: "Leverage, Margin and Liquidation Risk",
};
const sections2: LessonSection[] = [
  {
    title: "Leverage, margin and contract conventions",
    shortTitle: "Leverage margin and contract conventions",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Explain why collateral posted is not the same as the exposure or maximum possible loss.",
      },
      {
        type: "paragraph",
        children:
          "Leverage lets a contract position have a notional value larger than the funds initially supporting it. That magnifies both gains and losses relative to margin and can introduce forced liquidation. This lesson uses a deliberately simple simulation to explain the relationship. It does not provide a universal liquidation formula or encourage a leveraged trade.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Calculate exposure first and then read the maintenance and loss-handling rules.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notional, initial margin and maintenance equity",
      },
      {
        type: "paragraph",
        children:
          "Notional is the position's reference exposure, calculated under the contract's rules. Initial margin is the required support when the position is opened. Maintenance margin is the level required to keep it open. Equity incorporates collateral and relevant profit or loss, costs and valuation adjustments. These are different numbers.",
      },
      {
        type: "paragraph",
        children:
          "In a fictional linear contract, ten practice units entered at USD 100 create USD 1,000 notional. Initial supporting margin is USD 100, producing ten-times notional relative to that margin. A USD 5 adverse move per unit creates USD 50 loss, half the initial margin, before costs. A five-percent asset-price move therefore does not mean a five-percent margin loss. Notional is the base for the exposure calculation.",
      },
      {
        type: "paragraph",
        children:
          "Picture a buyer in Sydney who puts down a small deposit to control something much more valuable. If the value rises, her small deposit seems to grow fast. If it falls, the deposit disappears first, and quickly. Leverage works the same way: it multiplies both directions.",
      },
      {
        type: "paragraph",
        children:
          "Think of a deposit on a hired car in Bologna. You pay a deposit to drive away. If you damage the car, the company takes repair costs from that deposit, and below a certain amount it takes the car back. Futures have the same two thresholds.",
      },
      {
        type: "heading",
        level: 3,
        children: "Isolated and cross margin",
      },
      {
        type: "paragraph",
        children:
          "Isolated margin allocates support to a defined position under the venue rules. Cross margin draws on a shared eligible balance across positions or contracts. Cross arrangements can keep one position open longer while transmitting losses to funds supporting other activity. Isolated arrangements can limit some sharing but do not make the allocated funds safe.",
      },
      {
        type: "paragraph",
        children:
          "Read automatic top-up settings, collateral eligibility, haircuts and the treatment of deficits. A collateral haircut reduces the value recognised for margin and can change independently of the asset's market quote. An application label may not describe every rule. Identify exactly which balances can be used, when liquidation is triggered and what obligations can remain afterward. Jurisdiction and product access also matter; classroom simulation requires no live account.",
      },
      {
        type: "paragraph",
        children:
          "A family in Durban can keep separate expense envelopes or a shared balance. The analogy explains which resources a shortfall can draw on; actual margin systems also have contractual and automatic-top-up rules that envelopes do not.",
      },
      {
        type: "example",
        title: "Two account scopes",
        children:
          "Thabo models an R100,000 long and an R50,000 account balance. One fictional configuration allocates R10,000 to that position with automatic top-up disabled. Another permits all R50,000 of eligible equity to support it. The same position has more initial support in the second arrangement, but more of the shared account can be drawn into a loss. If other positions use that shared balance, their gains, losses and collateral values also affect it. A fixed R500 teaching maintenance boundary would leave initial cushions of R9,500 and R49,500 respectively before costs; those are classroom inputs, not an actual venue promise.",
      },
      {
        type: "paragraph",
        children:
          "Name the allocation, eligible assets, top-up settings and deficit treatment in the worksheet. The word isolated cannot establish that all losses end at the displayed margin, and the word cross cannot establish that every account asset is eligible. Read the exact product terms.",
      },
      {
        type: "heading",
        level: 3,
        children: "Linear and inverse contract conventions",
      },
      {
        type: "paragraph",
        children:
          "A simple linear contract's PnL can be proportional to quantity multiplied by price change, settled in a stated quote asset. An inverse contract uses a different convention and may settle in the base asset, creating different arithmetic and collateral exposure. Contract size and multiplier are essential. Do not copy a spot formula into an inverse or option position.",
      },
      {
        type: "paragraph",
        children:
          "Our example assumes a long linear contract with no funding, fees, interest, collateral haircut or changing margin tiers. At a USD 95 mark, the price PnL is ten times negative USD 5, or negative USD 50. Equity becomes USD 50 from the original USD 100. The example is intentionally limited so the effect of notional is visible. Real results require all contract-specific cash flows and reference prices.",
      },
      {
        type: "comparisonTable",
        caption: "Simulate the linear contract without costs",
        columns: [
          "Mark price",
          "Position notional at mark",
          "Price PnL",
          "Equity from USD 100",
        ],
        rows: [
          ["USD 100", "USD 1,000", "USD 0", "USD 100"],
          ["USD 98", "USD 980", "Negative USD 20", "USD 80"],
          ["USD 95", "USD 950", "Negative USD 50", "USD 50"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Ten-unit long entered at USD 100. The fixed USD 50 maintenance boundary is a fictional teaching rule, not a live venue formula.",
      },
    ],
  },
  {
    title: "Liquidation costs, exits and the limits of shortcuts",
    shortTitle: "Liquidation costs exits and the limits of shortcuts",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Liquidation references, fees and loss handling",
      },
      {
        type: "paragraph",
        children:
          "Liquidation commonly uses a mark price and maintenance rules rather than the last trade visible on a chart. Fees, funding, collateral price and other positions can move the boundary. A stop triggered by a different reference may not act before liquidation. Venue insurance funds and automatic deleveraging mechanisms address specified system losses under their rules; they are not personal deposit insurance or a promise that every loss stops at initial margin.",
      },
      {
        type: "paragraph",
        children:
          "Automatic deleveraging can reduce counterparties' positions under defined extreme conditions. Liquidation processes may use partial reduction, auctions or other methods. Read the current product specifications rather than assuming every venue behaves alike. The presence of a loss-handling fund does not make leverage suitable or guarantee uninterrupted execution during stress.",
      },
      {
        type: "heading",
        level: 3,
        children: "Add fees and funding liquidation comes sooner",
      },
      {
        type: "paragraph",
        children:
          "For a cost illustration, keep the same fictional ten-unit long entered at USD 100, supported initially by USD 100 margin. The teaching model fixes its maintenance boundary at USD 50 and excludes price changes in collateral. Suppose an opening cost of USD 2 and a later net funding payment of USD 5 are deducted. At an unchanged mark, equity becomes USD 93.",
      },
      {
        type: "example",
        title: "Costs use part of the cushion",
        children:
          "The remaining cushion above the fixed maintenance boundary is USD 43. Ten units lose USD 43 when the price falls USD 4.30 per unit, so the boundary is reached at a USD 95.70 mark in this artificial model. Without those costs it was reached at USD 95. The costs have narrowed the modeled distance even though quantity is unchanged.",
      },
      {
        type: "paragraph",
        children:
          "Real maintenance requirements can change with mark value, position tiers and product rules. Funding can be received or paid and does not stay at one rate. This fixed-boundary example explains a mechanism; it cannot calculate a live liquidation price. Match every fee and funding entry to the relevant quantity, interval and settlement asset before using a product-specific calculator.",
      },
      {
        type: "paragraph",
        children:
          "If a venue cannot close a position before a deficit arises, its rules determine how the shortfall is handled. Possible mechanisms include a loss-handling fund, partial position reductions or automatic deleveraging, which can reduce an opposing position under specified conditions. Those mechanisms can affect a position that was profitable or part of a hedge.",
      },
      {
        type: "paragraph",
        children:
          "A venue's fund is not personal deposit insurance. Its coverage, funding and exhaustion rules must be read separately. Some products or arrangements can leave obligations beyond the originally posted margin. Record the actual deficit terms, reference prices and account scope rather than assuming an isolated label or a profitable position removes every risk.",
      },
      {
        type: "heading",
        level: 3,
        children: "Keep your exit well before liquidation",
      },
      {
        type: "paragraph",
        children:
          "A loss budget and a liquidation boundary answer different questions. Keep the price-loss calculation visible even when the required supporting margin looks small.",
      },
      {
        type: "example",
        title: "A boundary before the planned exit",
        children:
          "Dewi in Surabaya uses a paper long with entry USD 50,000, planned exit USD 47,500 and a USD 50 price-loss allowance. The five-percent distance gives USD 1,000 entry notional, or 0.02 BTC of linear exposure. In this separate classroom model, maintenance equity is fixed at USD 5, with no fees, funding or other balances. At two-times entry notional to margin, initial margin is USD 500 and the fixed boundary is reached after a USD 495 loss, at USD 25,250. At twenty-times, initial margin is USD 50 and the boundary is reached after a USD 45 loss, at USD 47,750. That second boundary lies above her planned exit.",
      },
      {
        type: "paragraph",
        children:
          "The numbers rely on those fixed fictional rules. Real venues can use changing maintenance requirements and different trigger references. A stop also does not guarantee its fill, so the exercise must stress both liquidation rules and execution rather than treating either calculation as a protected loss limit.",
      },
      {
        type: "learningLink",
        title: "Open the Risk Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Try the PipStart tool: Risk reward calculator — compare the supplied entry 50,000, planned exit 47,500 and target 55,000. Then state which liquidation rules and actual-fill uncertainties that ratio cannot answer. Tool setup: choose Long / Buy, entry 50,000, stop-loss 47,500 and target 55,000 in matching price units. The displayed risk-to-reward ratio is 1 : 2.00. It excludes fees, funding, liquidation rules and fill uncertainty.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why simple shortcuts fail and spot comes first",
      },
      {
        type: "paragraph",
        children:
          "Entry divided by leverage describes a rough price-distance intuition only under narrow assumptions. It omits maintenance margin, fees, funding, collateral valuation, contract conventions and shared positions. In a toy rule with fixed USD 50 maintenance equity, our position reaches that boundary at USD 95, a five-percent fall, rather than waiting for the ten-percent fall that would arithmetically exhaust initial margin.",
      },
      {
        type: "paragraph",
        children:
          "That toy rule is not a venue's actual liquidation price. It demonstrates why ignoring maintenance produces false reassurance. For practice, identify omitted rules and calculate the loss relationship without placing an order. A conclusion that you do not understand a contract well enough to use it is a valid learning outcome. The next lesson examines whole-portfolio concentration, which leverage can intensify.",
      },
      {
        type: "paragraph",
        children:
          "A learner driver practises a basic manoeuvre before studying a busier road. The useful comparison is complexity: a fully paid, unpledged spot holding has fewer financing and margin rules than a leveraged contract. Paper study is still sufficient for both.",
      },
      {
        type: "paragraph",
        children:
          "For that specified spot arrangement, a falling price does not by itself create a maintenance-margin liquidation, and holding it does not itself require perpetual funding. It can still lose its entire purchase value, incur costs, become inaccessible or be hard to sell. A spot asset pledged to a lender or bought with borrowing adds other obligations and can be sold under those arrangements.",
      },
      {
        type: "paragraph",
        children:
          "Borrowing against crypto in DeFi is another way to add leverage. Collateral, debt, interest, price feeds and liquidation thresholds then matter together. Connect those dependencies to the health-factor lesson rather than applying a derivatives shortcut to a lending account.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "A purchase supported by a small deposit",
        children:
          "A buyer in Australia commits to a fictional AUD 1,000 price-sensitive contract with AUD 100 supporting it. A five-percent adverse change in the full exposure is AUD 50, half of the supporting amount. The illustration resembles the leverage arithmetic without importing the legal rights of a house deposit or instalment purchase. Margin contracts can force closure under their own rules, which must be understood separately from the percentage calculation.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Use simulation only. A simple leverage ratio is insufficient to determine a safe or exact liquidation level.",
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
          "1. Calculate price PnL at USD 97 for the ten-unit position.",
          "2. Why does a five-percent adverse price move consume 50 percent of initial margin here?",
          "3. Name four inputs omitted by an entry-divided-by-leverage liquidation shortcut.",
        ],
        answers: [
          "1. Ten times negative USD 3 gives negative USD 30; equity is USD 70 before costs under the example.",
          "2. The USD 1,000 initial exposure is ten times the USD 100 margin. Five percent of exposure is USD 50.",
          "3. Maintenance rules, fees, funding, collateral prices or haircuts, cross positions, mark price and contract multipliers are relevant.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is a venue insurance fund equivalent to bank deposit insurance for your margin?",
        ],
        answers: [
          "No. It serves specified system loss-handling purposes under venue terms, with no general promise to reimburse a trader.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Margin and notional are different amounts.",
          "Cross margin connects eligible balances.",
          "Liquidation depends on contract and valuation rules.",
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
              "Kraken: Managing margin and liquidations in multi collateral trading",
            url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
          },
          {
            title: "Coinbase: What is the funding rate",
            url: "https://help.coinbase.com/en/international-exchange/funding/what-is-the-funding-rate",
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
            title:
              "Financial Conduct Authority: Financial Conduct Authority — FCA bans the sale of crypto-derivatives to retail consumers",
            url: "https://www.fca.org.uk/news/press-releases/fca-bans-sale-crypto-derivatives-retail-consumers",
          },
          {
            title:
              "ESMA: ESMA — ESMA agrees to prohibit binary options and restrict CFDs to protect retail investors (27 March 2018)",
            url: "https://www.esma.europa.eu/sites/default/files/library/esma71-98-128_press_release_product_intervention.pdf",
          },
          {
            title:
              "CFTC: CFTC — CFTC Issues Final Interpretive Guidance on Actual Delivery for Digital Assets (24 March 2020)",
            url: "https://www.cftc.gov/PressRoom/PressReleases/8139-20",
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
  course: "crypto-risk-and-portfolios",
  description: "Assess combined exposure beyond the number of assets held.",
  estimatedMinutes: 9,
  learningPath: "crypto",
  level: "level-8",
  module: "sizing-leverage-and-portfolio-risk",
  objectives: ["Assess combined exposure beyond the number of assets held."],
  position: 3,
  prerequisites: ["leverage-margin-and-liquidation-risk"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "leverage-margin-and-liquidation-risk",
    "dca-rebalancing-exits-and-useful-records",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription: "Assess combined exposure beyond the number of assets held.",
  seoTitle: "Concentration, Correlation and Shared Dependencies",
  slug: "concentration-correlation-and-shared-dependencies",
  sources: [
    {
      title:
        "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
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
      title: "Circle: USDC Terms",
      url: "https://www.circle.com/legal/usdc-terms",
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
      title: "CFTC: Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title:
        "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
    {
      title:
        "Investor.gov: Investor.gov — Beginners' Guide to Asset Allocation, Diversification, and Rebalancing",
      url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
    },
  ],
  status: "published",
  title: "Concentration, Correlation and Shared Dependencies",
};
const sections3: LessonSection[] = [
  {
    title: "Concentration and custody exposure",
    shortTitle: "Concentration and custody exposure",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children: "Assess combined exposure beyond the number of assets held.",
      },
      {
        type: "paragraph",
        children:
          "A portfolio can contain many asset names while relying on one exchange, stablecoin or bridge. Diversification requires examining both price relationships and operational dependencies. This lesson builds a stress worksheet that looks beyond the number of holdings and keeps assumptions about correlation modest.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Count the shared dependency behind each apparently separate holding.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch concentration grow on its own",
      },
      {
        type: "paragraph",
        children:
          "A farmer in Mendoza, Argentina, plants half her field with grapes and half with olives. If the vines grow wildly, by autumn they shade most of the field, though she planted nothing new. Portfolios drift the same way.",
      },
      {
        type: "definition",
        term: "Concentration",
        children:
          "The share of your total holdings that depends on a single asset, provider or risk. High concentration means one failure can cause most of your loss.",
      },
      {
        type: "paragraph",
        children:
          "Investor.gov, the US Securities and Exchange Commission's education site, sums up diversification as \"don't put all your eggs in one basket\", across types of investment and within each type. In crypto, a rise in one token can make it dominate your holdings without any new purchase.",
      },
      {
        type: "example",
        title: "The token that took over",
        children:
          "Fernanda in Monterrey holds MX$5,000 of bitcoin and MX$5,000 of an invented token. The token triples while bitcoin stays flat (invented moves). The token is now 15,000 ÷ 20,000 = 75% of her holdings, so a 50% fall in it alone would cut her total by 37.5%. The recurring purchase and records lesson in Level 8 shows how rebalancing can bring a drifting mix back to plan.",
      },
      {
        type: "paragraph",
        children:
          "Spreading money across many tokens looks like the answer. But crypto adds a twist: different baskets often fall at the same time.",
      },
      {
        type: "heading",
        level: 3,
        children: "Map the hidden exposures",
      },
      {
        type: "paragraph",
        children:
          "A house in Frankfurt can be well built and still flood, burn or be burgled, and each risk needs a different defence. A crypto holding is similar: price is one risk, and where and how it is held add others.",
      },
      {
        type: "comparisonTable",
        caption: "Exposure types, what can fail and the question to ask",
        columns: [
          "Exposure",
          "What can go wrong",
          "Where you studied it",
          "Question to ask",
        ],
        rows: [
          [
            "Price and correlation",
            "Many assets fall together",
            "This lesson; Level 7",
            "If bitcoin fell 50%, what would my total lose?",
          ],
          [
            "Stablecoin",
            "Loses its peg; reserves frozen",
            "Level 3",
            "Which stablecoins do I hold, and how much in each?",
          ],
          [
            "Exchange or lender",
            "Withdrawals paused; insolvency or fraud",
            "Level 3",
            "How much sits with any single provider?",
          ],
          [
            "Custody",
            "Lost keys, lost backup, theft",
            "Level 2",
            "Who holds the keys, and is the backup tested?",
          ],
          [
            "Smart contract and bridge",
            "Bug, exploit, admin-key abuse",
            "Levels 4 and 6",
            "Which contracts hold my money right now?",
          ],
          [
            "Chain",
            "Outage or attack on the network",
            "Levels 1 and 4",
            "Is everything on one network?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Writing your holdings against this table often reveals surprises. The next two sections look at the layers that most often catch people out.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check stablecoin custody and exchange concentration",
      },
      {
        type: "paragraph",
        children:
          "A traveller in Paris who keeps cash, cards and passport in one bag has turned one theft into a disaster. Spreading them across pockets doesn't stop theft, but it limits what one theft can take.",
      },
      {
        type: "paragraph",
        children:
          "Stablecoins aim to hold a peg, but they are not promised to and are not bank deposits. On the evening of 10 March 2023, Circle, the issuer of USDC, announced that US$3.3 billion of its reserves sat at the failed Silicon Valley Bank; Chainalysis puts that at about 8% of USDC's backing. By 2am on 11 March, USDC had dropped to US$0.87, and by the time of Chainalysis's report on 16 March it had regained its peg. Anyone holding only USDC saw a 13% paper loss over a weekend.",
      },
      {
        type: "paragraph",
        children:
          "Exchange concentration works the same way. Level 3 showed how FTX collapsed in November 2022, and how customers of failed platforms such as Mt. Gox and Celsius faced slow, partial and uncertain recoveries. Custody is the mirror image: moving everything to one self-custody wallet removes exchange risk but puts it all behind one seed phrase backup.",
      },
      {
        type: "warning",
        title: "One login, one point of failure",
        children:
          "If your coins, stablecoins and records all sit on one platform, one failure there can freeze them all. Decide in advance the largest share any single provider, stablecoin or wallet may hold.",
      },
      {
        type: "paragraph",
        children:
          "Providers and stablecoins are visible names on a statement. Code is less visible, and that is the next layer to map.",
      },
      {
        type: "paragraph",
        children:
          "For example, three tokens on one network may use the same stablecoin quote and sit at the same exchange. Their price charts can differ while withdrawal risk remains shared. Adding another token at the same custodian may change asset weights without reducing custody concentration.",
      },
      {
        type: "diagram",
        alt: "Concentric exposure layers surround a holding, with a separate personal-mistakes warning.",
        caption:
          "Price exposure sits alongside custody, issuer, contract, bridge and network dependencies.",
        src: "/lessons/crypto/level-8/lesson-3-rId47.png",
        description: [
          "Price and correlation: does it fall with bitcoin? Stablecoin: could it lose its peg? Exchange or lender: could withdrawals freeze?",
          "Custody: who holds the keys? Smart contract and bridge: could the code be exploited? Chain: could the network halt?",
          "The separate user warning lists mistakes, phishing and lost backups. These exposures can overlap.",
        ],
        width: 1980,
        height: 1318,
      },
    ],
  },
  {
    title: "Correlation and shared dependencies",
    shortTitle: "Correlation and shared dependencies",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Several names can share the same storm",
      },
      {
        type: "paragraph",
        children:
          "Picture ten fishing boats in Incheon that all leave on the same morning. Different boats, different crews, but one storm reaches all of them. Owning ten crypto tokens can be like owning ten boats in the same storm.",
      },
      {
        type: "definition",
        term: "Correlation",
        children:
          "A number from −1 to +1 that summarises how closely two price series moved together over a stated past period. Near +1 means they tended to move the same way; near 0 means little straight-line relationship. It describes the sample, not the future.",
      },
      {
        type: "paragraph",
        children:
          "Many crypto assets have tended to move with bitcoin, and in sell-offs they have often fallen together: in 2022 the whole market shrank by roughly 70%, not one or two coins. Crypto can also move with shares. An International Monetary Fund (IMF) blog from January 2022 found that the correlation between bitcoin and US S&P 500 returns rose from 0.01 in 2017–19 to 0.36 in 2020–21, and that spillovers grew during market turmoil.",
      },
      {
        type: "example",
        title: "Five coins, one bet",
        children:
          "Sofia in Rome spreads €1,000 across five altcoins and feels diversified. In a sell-off where bitcoin falls 30%, all five fall between 35% and 60% (invented amounts and moves). She had spread the names, not the risk.",
      },
      {
        type: "paragraph",
        children:
          'So treat most crypto holdings as one connected exposure to "crypto market risk", and size the total accordingly. Price is only one exposure, though; the next ones don\'t show on a chart.',
      },
      {
        type: "paragraph",
        children:
          "Positive correlation means the measured returns tend to move together under that sample; it is not a permanent law. A pair with different past trends can still fall together when financing or confidence weakens. A low estimated correlation also does not capture a common operational failure, such as a frozen custodian.",
      },
      {
        type: "heading",
        level: 3,
        children: "Trace shared chains contracts bridges and issuers",
      },
      {
        type: "paragraph",
        children:
          "Map where assets are held, which tokens provide quote or collateral value, and which applications rely on the same bridge or oracle. A bridged representation can connect several positions to one mechanism. A liquid-staking token used across protocols can propagate a common redemption or price disruption. Different websites may be separate interfaces to shared infrastructure.",
      },
      {
        type: "paragraph",
        children:
          "Assign amounts to each dependency without pretending overlapping exposure categories must add to 100 percent. The same USD 1,000 position can count toward asset, custodian and bridge concentration simultaneously. State the purpose of each total. This avoids double counting in portfolio value while still showing multiple risk channels. A dependency total is an exposure view, not another holding to add to wealth.",
      },
      {
        type: "comparisonTable",
        caption: "Stress the fictional USD 10,000 portfolio",
        columns: [
          "Holding",
          "Starting value",
          "Supplied shock",
          "Value after shock",
        ],
        rows: [
          ["BTC exposure", "USD 4,000", "Negative 30 percent", "USD 2,800"],
          ["Token A", "USD 3,000", "Negative 50 percent", "USD 1,500"],
          ["Stable B", "USD 3,000", "Negative 10 percent", "USD 2,700"],
          [
            "Total",
            "USD 10,000",
            "Record your notes and evidence here",
            "USD 7,000",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "No execution, tax or additional costs assumed. Custodian suspension would affect access separately from these market values.",
      },
      {
        type: "example",
        title: "Six layers in one deposit",
        children:
          "Ji-ho in Busan bridges ether to a layer 2, receives a wrapped token and deposits it in a lending pool (an invented plan). That deposit depends on ether's price, the bridge, the wrapped token, the lending contract, its price oracle and the website he uses. Any one failing can lose his deposit, even if ether's price never moves.",
      },
    ],
  },
  {
    title: "Policy boundaries, stress tests and recovery",
    shortTitle: "Policy boundaries stress tests and recovery",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Set explicit policy boundaries",
      },
      {
        type: "paragraph",
        children:
          "A written policy can specify maximum hypothetical exposure by asset or dependency, review intervals and rebalancing conditions. The boundaries should fit the exercise's stated purpose and constraints, rather than follow a universal allocation formula. Include what happens when a price change breaches a limit and whether liquidity or tax considerations affect the response.",
      },
      {
        type: "paragraph",
        children:
          "Separate normal review from emergency response. A market-weight drift, a custodian suspension and a key compromise need different actions. Define observable triggers and the information required before acting. A policy cannot force market execution, but it can stop emotional improvisation from changing the rules unnoticed. Record any exception and its rationale so the reviewer can compare the action with the original boundary.",
      },
      {
        type: "heading",
        level: 3,
        children: "Stress prices access drawdown and recovery",
      },
      {
        type: "paragraph",
        children:
          "Use a fictional USD 10,000 portfolio: USD 4,000 BTC exposure, USD 3,000 Token A and USD 3,000 Stable B. A 30 percent BTC fall, 50 percent Token A fall and 10 percent stablecoin depeg leave USD 7,000 before costs. The USD 3,000 loss is 30 percent of starting value. A simultaneous withdrawal suspension can prevent the planned rebalance.",
      },
      {
        type: "paragraph",
        children:
          "Drawdown measures a decline from a prior equity peak to a subsequent lower value. Recovery arithmetic uses the reduced base: a 30 percent fall requires about 42.86 percent growth to return to the original value, ignoring cash flows. PipStart's Drawdown Calculator and Gain Recovery Calculator illustrate these relationships, not recovery probability. Reconcile deposits and withdrawals before interpreting an equity series. The next lesson adds purchase schedules, exits and records.",
      },
      {
        type: "example",
        title: "Four what-ifs for one portfolio",
        children:
          "Liam in Brisbane holds A$10,000 in crypto (invented amounts for this example): A$5,000 of bitcoin on one exchange, A$3,000 of ether in self-custody and A$2,000 of a stablecoin in a DeFi lending pool. He tests four scenarios, one at a time.",
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Try the PipStart tools: Drawdown calculator and Gain recovery calculator — model a 30-percent decline and the approximately 42.86-percent gain needed to recover. State the changed denominator and identify what neither result says about time or likelihood. Tool setup: choose USD, starting balance 1,000, drawdown 30 and unit percent. Remaining balance is USD 700 and recovery requires 42.86 percent. Supply a reconciled peak and drawdown yourself: this tool does not ingest a complete equity history or adjust cash flows automatically.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Try the PipStart tools: Drawdown calculator and Gain recovery calculator — model a 30-percent decline and the approximately 42.86-percent gain needed to recover. State the changed denominator and identify what neither result says about time or likelihood. Tool setup: choose USD, current balance 700 and recovery target 1,000. The gain needed is 42.86 percent. A fictional planned gain of 5 percent per period produces 8 model periods, not a predicted recovery time. It assumes a constant compounded rate and omits losses, costs and changing conditions.",
      },
      {
        type: "diagram",
        alt: "Paired before-and-after bars compare BTC exposure, Token A and Stable B under the supplied shocks.",
        caption:
          "The supplied shocks reduce USD 10,000 to USD 7,000 before costs. An access suspension is a separate stress not shown by market values.",
        src: "/lessons/crypto/level-8/lesson-3-rId48.png",
        description: [
          "BTC exposure falls from USD 4,000 to USD 2,800. Token A falls from USD 3,000 to USD 1,500. Stable B falls from USD 3,000 to USD 2,700.",
          "The total falls from USD 10,000 to USD 7,000 before costs.",
          "An access suspension is a separate stress: a displayed market value does not establish the ability to withdraw.",
        ],
        width: 1451,
        height: 659,
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Shopping in several departments of one store",
        children:
          "A household in France buys food, clothing and household supplies from different departments of one store. The products are varied, but a store closure affects access to all three. A crypto portfolio can similarly diversify token names while retaining one custodian dependency. Reviewing EUR-valued exposure means counting both the asset mix and where access can fail. A price correlation table alone would miss that shared operational problem.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Diversification and recovery calculators cannot guarantee an available exit or future recovery.",
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Try the PipStart tool: Drawdown Calculator — Measure peak-to-trough percentage on a clearly defined equity series. State whether deposits, withdrawals, fees and valuation changes have been reconciled. Tool setup: choose USD, starting balance 1,000, drawdown 30 and unit percent. Remaining balance is USD 700 and recovery requires 42.86 percent. Supply a reconciled peak and drawdown yourself: this tool does not ingest a complete equity history or adjust cash flows automatically.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Try the PipStart tool: Gain Recovery Calculator — Explain the percentage gain required after a loss using an unchanged base definition. It describes arithmetic, not the likelihood or time of recovery. Tool setup: choose USD, current balance 700 and recovery target 1,000. The gain needed is 42.86 percent. A fictional planned gain of 5 percent per period produces 8 model periods, not a predicted recovery time. It assumes a constant compounded rate and omits losses, costs and changing conditions.",
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
          "1. Calculate the percentage loss in the USD 10,000 to USD 7,000 scenario.",
          "2. What gain returns USD 7,000 to USD 10,000?",
          "3. Explain why the same holding can appear in more than one dependency category without being added twice to portfolio value.",
        ],
        answers: [
          "1. USD 3,000 divided by USD 10,000 equals 30 percent.",
          "2. USD 3,000 divided by USD 7,000 equals about 42.86 percent. It is arithmetic, not a recovery forecast.",
          "3. Dependency views describe different failure paths for the same exposure. They are not additional assets and must not be summed as wealth.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does holding five tokens guarantee diversification against an exchange suspension?",
        ],
        answers: [
          "No. If all are held at the same provider, access can be concentrated despite different asset names.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Price and operational concentration need separate views.",
          "Correlation depends on the sample and can change.",
          "Stress tests should include blocked exits as well as falling prices.",
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
              "SEC Investor.gov: Crypto Asset Custody Basics for Retail Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
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
            title: "Circle: USDC Terms",
            url: "https://www.circle.com/legal/usdc-terms",
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
            title: "CFTC: Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title:
              "Financial Conduct Authority: Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
          {
            title:
              "Investor.gov: Investor.gov — Beginners' Guide to Asset Allocation, Diversification, and Rebalancing",
            url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
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
  course: "crypto-risk-and-portfolios",
  description:
    "Compare a recurring-purchase plan and maintain a record that explains the outcome.",
  estimatedMinutes: 17,
  learningPath: "crypto",
  level: "level-8",
  module: "sizing-leverage-and-portfolio-risk",
  objectives: [
    "Compare a recurring-purchase plan and maintain a record that explains the outcome.",
  ],
  position: 4,
  prerequisites: ["concentration-correlation-and-shared-dependencies"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["concentration-correlation-and-shared-dependencies"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Compare a recurring-purchase plan and maintain a record that explains the outcome.",
  seoTitle: "DCA, Rebalancing, Exits and Useful Records",
  slug: "dca-rebalancing-exits-and-useful-records",
  sources: [
    {
      title: "IRS: Digital assets",
      url: "https://www.irs.gov/filing/digital-assets",
    },
    {
      title: "Kraken: How to deposit cryptocurrencies to your Kraken account",
      url: "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
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
      title: "Investor.gov: Investor.gov — Dollar Cost Averaging",
      url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging",
    },
    {
      title:
        "Vanguard: Vanguard — Cost averaging: Invest now or temporarily hold your cash? (Finlay and Zorn, February 2023)",
      url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf",
    },
    {
      title:
        "Vanguard: Vanguard — Lump-sum investing versus cost averaging: Which is better?",
      url: "https://investor.vanguard.com/investor-resources-education/news/lump-sum-investing-versus-cost-averaging-which-is-better",
    },
  ],
  status: "published",
  title: "DCA, Rebalancing, Exits and Useful Records",
};
const sections4: LessonSection[] = [
  {
    title: "Recurring purchases, fees and average cost",
    shortTitle: "Recurring purchases fees and average cost",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Compare a recurring-purchase plan and maintain a record that explains the outcome.",
      },
      {
        type: "paragraph",
        children:
          "A recurring purchase schedule can make a process easier to follow, but it cannot make a poor asset safe. Rebalancing and exits also require rules, liquidity and records. This lesson calculates a simple DCA schedule, examines cash-out planning and explains the information needed to distinguish market results from deposits and transfers.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Keep a ledger that can explain every change in units and account value.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "What recurring purchases change",
      },
      {
        type: "heading",
        level: 3,
        children: "Choose how money goes in",
      },
      {
        type: "paragraph",
        children:
          "A parent in Guadalajara can buy all the school uniforms in January, or one piece a month as money comes in. Either way the family ends up with uniforms; what changes is when the money is spent, and how she feels if prices move meanwhile.",
      },
      {
        type: "paragraph",
        children:
          "Putting money into crypto raises the same question. You can invest a lump sum, the whole amount at once, or spread it out in equal parts over time. The second approach has a name.",
      },
      {
        type: "definition",
        term: "Dollar-cost averaging (DCA)",
        children:
          "Investing a fixed amount at regular intervals, regardless of price. Investor.gov, the US Securities and Exchange Commission's education site, describes it as buying more when the price is low and less when it is high. In the UK it is often called pound-cost averaging.",
      },
      {
        type: "paragraph",
        children:
          "The sizing and exposure lessons in Level 8 still apply: whichever method you choose, the total must fit your loss budget. DCA changes the timing of purchases, not the risk of the asset, as the numbers show.",
      },
      {
        type: "heading",
        level: 3,
        children: "Weigh DCA against a lump sum honestly",
      },
      {
        type: "paragraph",
        children:
          "Suppose the price had risen steadily instead: ¥500, ¥600, ¥700, ¥800, ¥1,000 (invented). Haruto's ¥10,000 a month would buy about 20, 16.7, 14.3, 12.5 and 10 units, about 73.5 in total, worth about ¥73,500 at the end. A lump sum of ¥50,000 in month 1 would have bought 100 units, worth ¥100,000. When prices rise, waiting costs money.",
      },
      {
        type: "paragraph",
        children:
          "Which path is more common? Nobody knows for crypto. One widely cited study comes from traditional markets. In February 2023, Vanguard researchers Megan Finlay and Josef Zorn compared investing a lump sum with spreading it over time for balanced stock-and-bond portfolios. They found lump-sum investing beat cost averaging roughly two-thirds of the time, with similar results in the US, UK, Canada, Australia and Europe. Their explanation: money waiting in cash misses whatever the market earns in the meantime.",
      },
      {
        type: "paragraph",
        children:
          "The same research gives DCA its fair due. Cost averaging temporarily lowers risk and can limit the damage if prices fall soon after you start, which helps people who would deeply regret a badly timed lump sum. Vanguard's guidance for investors puts it this way: DCA offers emotional comfort and less timing regret, at the likely cost of lower returns in a rising market.",
      },
      {
        type: "warning",
        title: "Research on shares is not a forecast for crypto",
        children:
          "Vanguard studied diversified stock-and-bond portfolios over decades. Crypto is far more volatile, much younger and can fall to zero. Neither DCA nor a lump sum protects you from an asset that keeps falling. DCA reduces timing regret; it does not promise a better result.",
      },
      {
        type: "paragraph",
        children:
          "So DCA is a choice about regret and discipline, not a way to beat the market, and it has a cost that grows when amounts are small.",
      },
      {
        type: "heading",
        level: 3,
        children: "Count the fees on every purchase",
      },
      {
        type: "paragraph",
        children:
          "A commuter in Calgary who tops up a transit card in tiny amounts, paying a flat charge each time, loses a bigger share to charges than someone who tops up monthly. DCA with fixed fees works the same way.",
      },
      {
        type: "formula",
        expression:
          "Fee as a percentage of each purchase = fee ÷ purchase amount × 100",
        explanation:
          "a flat C$2 fee on a C$25 purchase is 8%; on a C$100 purchase it is 2% (invented fees for this example).",
      },
      {
        type: "example",
        title: "Weekly or monthly",
        children:
          "Mei-Ling in Vancouver plans to invest C$100 a month. Bought weekly at C$25, with an invented flat fee of C$2, she pays about C$8 to C$10 in fees a month, roughly 8–10% of what she invests. Bought once a month, she pays C$2, or 2%. With a percentage fee instead, splitting purchases would not change the total, so read the fee schedule, including spreads, before choosing a frequency.",
      },
      {
        type: "learningLink",
        title: "Open the Dollar Cost Averaging Calculator",
        href: "/tools/dollar-cost-averaging-calculator",
        description:
          "Try the PipStart tool: Dollar cost averaging calculator — reproduce three fictional GBP 200 purchases at GBP 20, GBP 25 and GBP 10 per unit. The quantities total 38 units and the average purchase cost is about GBP 15.79 before fees. Add the lesson fee case manually and explain whether costs are inside the spending budget or added to it. Calculator scope: complete the original GBP 20, GBP 25 and GBP 10 three-price worksheet on paper; the tool cannot accept three independently chosen prices. Its prices are spread evenly between a starting and ending price. For a separate supported comparison, choose GBP, investment per purchase 200, Monthly, first purchase 2026-01-01, plan end 2026-03-01, starting price 20 and ending price 10. This generates prices 20, 15 and 10: about 43.33333333 units, average cost GBP 13.85 and ending value GBP 433.33 before fees. Keep the original worksheet result of 38 units and GBP 15.79 distinct from this generated path. Add fees manually.",
      },
      {
        type: "paragraph",
        children:
          "Getting money in is one decision. Over time your holdings drift from the plan, which needs a second.",
      },
      {
        type: "paragraph",
        children:
          "It spreads entry timing but does not ensure a favourable average relative to future value.",
      },
      {
        type: "heading",
        level: 3,
        children: "Calculate average cost using total units",
      },
      {
        type: "paragraph",
        children:
          "Suppose GBP 200 is spent on each of three dates at GBP 20, GBP 25 and GBP 10 per unit, ignoring fees. The purchases acquire ten, eight and twenty units, giving 38 units at a total cost of GBP 600. Average cost is GBP 600 divided by 38, or approximately GBP 15.79 per unit. Averaging the three prices directly would produce GBP 18.33 and answer the wrong question.",
      },
      {
        type: "paragraph",
        children:
          "At a final price of GBP 10, the holding is worth GBP 380 before sale costs, a GBP 220 decline from the cash spent. Buying more at the lower price reduced average cost but did not prevent a loss. If each GBP 200 budget instead includes a GBP 2 fee, only GBP 198 buys units each time; accumulated quantity becomes 37.62 and the fee-inclusive average cost is approximately GBP 15.95.",
      },
      {
        type: "example",
        title: "Haruto's five months",
        children:
          "Haruto in Fukuoka invests ¥10,000 a month in an invented coin for five months, ignoring fees. The prices are invented for this example.",
      },
      {
        type: "diagram",
        alt: "Five equal JPY 10,000 purchase bars are paired with unit quantities and a varying price line.",
        caption:
          "Five fictional JPY 10,000 purchases with fees omitted. This chart illustrates quantity changes, not a recommended purchase schedule.",
        src: "/lessons/crypto/level-8/lesson-4-rId49.png",
        description: [
          "Months 1–5 prices per unit are JPY 1,000; 800; 500; 800; 1,000.",
          "At JPY 10,000 each month, quantities are 10; 12.5; 20; 12.5; 10 units.",
          "Fees are omitted. Total spending is JPY 50,000 for 65 units, giving about JPY 769.23 per unit. This illustrates quantity changes, not a recommended schedule.",
        ],
        width: 2352,
        height: 1374,
      },
    ],
  },
  {
    title: "Rebalancing and written exit rules",
    shortTitle: "Rebalancing and written exit rules",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Rebalance back to your plan",
      },
      {
        type: "paragraph",
        children:
          "A gardener in Canberra trims her hedge back to its chosen shape each spring; otherwise the fastest branches take over. Rebalancing is the trim.",
      },
      {
        type: "definition",
        term: "Rebalancing",
        children:
          "Bringing a portfolio back to the mix you originally chose after price moves have shifted it. Investor.gov names three ways: selling some of what has grown too large and buying what has shrunk, buying only the smaller parts with new money, or directing new contributions to them.",
      },
      {
        type: "paragraph",
        children:
          "In the sizing and exposure lessons in Level 8, Fernanda's token drifted from half to three-quarters of her holdings. The same drift happens between crypto and the rest of your savings.",
      },
      {
        type: "example",
        title: "Giulia's 5% limit",
        children:
          "Giulia in Turin has €20,000 of savings and a personal rule that crypto may be at most 5%, or €1,000 (an invented limit, not a recommendation). Her crypto doubles to €2,000 while the rest stays at €19,000 (invented moves). Crypto is now €2,000 ÷ €21,000 ≈ 9.5% of her savings, almost twice her limit. To return to 5%, she would hold €1,050 in crypto and sell about €950. If the next fall halves her crypto, she loses about €525 rather than €1,000.",
      },
      {
        type: "paragraph",
        children:
          "Rebalancing sells some of what has risen, which can feel wrong in a rising market. It is not a prediction that prices will fall, only a way to keep your risk where you decided. The next question is when to do it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Choose calendar or threshold rebalancing",
      },
      {
        type: "paragraph",
        children:
          "A car in Johannesburg can be serviced every 12 months or whenever a warning light comes on. Investor.gov describes the same two approaches for portfolios.",
      },
      {
        type: "comparisonTable",
        caption: "Calendar and threshold rebalancing compared",
        columns: ["Comparison point", "Calendar", "Threshold"],
        rows: [
          [
            "Rule",
            "Rebalance on set dates, for example every six or twelve months",
            "Rebalance when a holding drifts more than a set amount from its target",
          ],
          [
            "Example",
            '"Every 1 January and 1 July"',
            '"When crypto goes above 7.5% or below 2.5% of my savings" (invented)',
          ],
          [
            "Strength",
            "Simple to remember; fewer decisions",
            "Responds to big moves; may act less often in calm periods",
          ],
          [
            "Weakness",
            "Can leave large drift in place for months",
            "In crypto's 24/7 market a threshold can be crossed at any hour, tempting constant checking",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Investor.gov notes that rebalancing tends to work best when done relatively infrequently. Each sale can carry fees and may have tax consequences where you live, so a rule that triggers every week can cost more than it saves. Many people combine the two: check on set dates, and act only if the drift is beyond a threshold.",
      },
      {
        type: "paragraph",
        children:
          "Rebalancing keeps the mix in shape. It does not decide when you leave altogether, which deserves its own plan.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write your exit plan before you need it",
      },
      {
        type: "paragraph",
        children:
          "Imagine a hiking group on Mount Fuji that agrees a turnaround time before setting off: if they haven't reached the summit by then, they go down, however close it feels. The decision is made at the bottom, with a calm head, not near the top when excitement and tiredness are high.",
      },
      {
        type: "paragraph",
        children:
          "An exit plan does the same for an investment, and it has four parts. A goal exit says what you are investing for and what you will do if you reach it. Partial profit-taking sells set fractions at prices written in advance, so you never have to pick the perfect top. A thesis invalidation names the facts that would show your reason for buying was wrong, whatever the price. Finally, a time and life exit sets a review date and says what you will sell if you suddenly need the money.",
      },
      {
        type: "example",
        title: "Faisal's written exits",
        children:
          'Faisal in Jeddah buys 40 units of an invented token at SAR 100, spending SAR 4,000 (invented numbers, not suggested levels). He writes: "If the price reaches SAR 200, I sell 10 units. If it reaches SAR 300, I sell 10 more. If the team abandons the project or the token\'s main use disappears, I sell everything, whatever the price. Every six months I review the plan, and changes need a written reason." At SAR 200, his first sale returns SAR 2,000, half his original outlay.',
      },
      {
        type: "paragraph",
        children:
          "Order tools help, with limits. Kraken's support pages explain that a take-profit order triggers when the last traded price touches your level and then executes as a market order, so in a fast or thin market it can fill noticeably below your trigger. It is also an independent order that you may have to cancel yourself if you exit another way. Swapping into a stablecoin is not the same as cashing out to your bank, as Level 3 showed, and Level 9 looks at the feelings that tempt people to tear up exit plans.",
      },
      {
        type: "paragraph",
        children:
          "Every buy, sale, rebalance and exit creates a record, and keeping them is the next habit.",
      },
      {
        type: "paragraph",
        children:
          "The process may require sales, purchases or directing new contributions, each with costs and possible tax consequences. A rule should identify the target, review time and action, rather than say rebalance when needed. A sell signal does not guarantee that the desired amount can be moved into a bank account immediately. Emergency spending needs should not depend on an untested assumption about instant liquidation.",
      },
    ],
  },
  {
    title: "Complete records, local requirements and the policy",
    shortTitle: "Complete records local requirements and the policy",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Keep a complete transaction and transfer ledger",
      },
      {
        type: "paragraph",
        children:
          "Record date, time zone, asset, quantity, network, venue, price, fee asset, currency value, transaction ID and purpose. Preserve statements and source documents. A transfer between your own wallets can change location without creating a trading profit; fees and local tax rules may still matter. Rewards, disposals and conversions need their own entries.",
      },
      {
        type: "paragraph",
        children:
          "Realised and unrealised describe different result stages under an accounting convention. A valuation change in an unsold holding is not a cash receipt. A deposit increases account value but is not market performance. A withdrawal reduces account value without necessarily being a trading loss. Reconcile external cash flows before using drawdown or return tools. Clear records prevent a larger balance caused by new deposits from being mistaken for successful investing.",
      },
      {
        type: "heading",
        level: 3,
        children: "Keep a record of every transaction",
      },
      {
        type: "paragraph",
        children:
          "A fabric trader in Istanbul's Grand Bazaar keeps a receipt book. At the end of the year, the book, not memory, shows what was bought, for how much, and what was sold. Crypto needs the same book, and nobody will keep it for you.",
      },
      {
        type: "definition",
        term: "Cost basis",
        children:
          "What you paid to acquire an asset, usually including the fees of buying it, recorded in your home currency. It is the starting point for working out a gain or loss when you later sell or swap.",
      },
      {
        type: "paragraph",
        children:
          "HMRC, the UK tax authority, warns that exchanges may keep transaction records only for a short time, or may no longer exist when you need them, so the responsibility falls on the individual. Level 3 showed how quickly an exchange can disappear.",
      },
      {
        type: "comparisonTable",
        caption: "Fields to record for every crypto transaction",
        columns: ["Field", "Why it matters"],
        rows: [
          ["Date and time", "Values and rules depend on when it happened"],
          ["Type", "Buy, sell, swap, transfer, reward, gift or fee"],
          ["Asset and number of units", "Tracks what you hold"],
          [
            "Value in your home currency",
            "Gains and losses are usually measured in it",
          ],
          [
            "Fees paid, and in what asset",
            "Fees can affect cost basis; a fee paid in crypto may itself be a transaction",
          ],
          [
            "Platform or wallet, with addresses",
            "Shows where the asset moved from and to",
          ],
          [
            "Transaction ID or exchange reference",
            "Lets you prove the record later",
          ],
          ["Running total held", "Catches errors early"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The UK, US and Australian tax authorities list similar items, and the Australian Taxation Office (ATO) says to keep records for at least five years after you dispose of crypto. One kind of record causes more confusion than any other: moving coins between your own wallets.",
      },
      {
        type: "heading",
        level: 3,
        children: "Record transfers between your own wallets",
      },
      {
        type: "paragraph",
        children:
          "Moving cash from your jacket to your wallet in Manchester isn't spending it, and moving crypto from an exchange to your own hardware wallet is similar: you still own it. But on a blockchain it looks like coins leaving one address for another, and without a record it can be mistaken for a sale.",
      },
      {
        type: "paragraph",
        children:
          "Official guidance in different countries shows why the detail matters. The IRS says that moving digital assets between wallets or accounts you own does not by itself count as a digital asset transaction for the yes-or-no question on its tax return, unless you paid a transaction fee with digital assets. The ATO says a transfer between your own wallets is not a disposal as long as you keep ownership, but if your holding is reduced to pay a network fee, that fee is a disposal with capital gains consequences. These are dated examples of how two authorities treat it, not rules for you.",
      },
      {
        type: "example",
        title: "Olivia's move to self-custody",
        children:
          'Olivia in Perth withdraws 0.5 ETH from an exchange to her own hardware wallet, and the network fee is paid in ETH (invented amounts). She records the date and time, the exchange account, both addresses, the transaction ID, 0.5 ETH sent and slightly less received, the fee in ETH and its value in Australian dollars, and a note: "Own wallet to own wallet." Months later, her records explain the move in seconds.',
      },
      {
        type: "warning",
        title: "Records are part of security, too",
        children:
          "Keep records of addresses, amounts and transaction IDs, never seed phrases or private keys. A spreadsheet with your recovery words in it turns your tax file into a theft target. Level 2 covered where backups belong, and your recovery plan from that level should also tell trusted people where these records live.",
      },
      {
        type: "paragraph",
        children:
          "Knowing what to record is half the task; knowing whose rules apply is the other half.",
      },
      {
        type: "heading",
        level: 3,
        children: "Find local record requirements and write the policy",
      },
      {
        type: "paragraph",
        children:
          "Tax treatment varies by jurisdiction, asset and activity. Sales, exchanges, rewards, transfers and losses may be treated differently. The IRS digital-asset guidance is a US example of why transaction records matter; it is not a global tax rule. A learner in Canada, India or Germany must check the relevant current official authority and obtain suitable advice for personal circumstances.",
      },
      {
        type: "paragraph",
        children:
          "Use a complete fictional ledger in the course and label the accounting assumptions. Do not upload real account numbers or secrets. Finish with a review date and triggers for revising the plan, such as changed redemption rights or loss of an off-ramp. The next level focuses on habits and testing so that a well-written policy is evaluated through consistent paper practice rather than emotion.",
      },
      {
        type: "heading",
        level: 3,
        children: "Find your own tax authority's guidance",
      },
      {
        type: "paragraph",
        children:
          "Tax rules for crypto differ by country, change often and depend on personal circumstances. This course gives no tax advice, but it can show you where to look.",
      },
      {
        type: "paragraph",
        children:
          'Start with your national tax authority\'s website and search for "crypto" or "digital assets". Examples include HMRC\'s Cryptoassets Manual in the UK, the IRS digital assets pages in the US and the ATO\'s crypto pages in Australia; Canada, India, South Africa and others have their own. Check the date on each page, because guidance is updated. The IRS, for example, notes that brokers must report digital asset sales on a new form, 1099-DA, for transactions from 1 January 2025.',
      },
      {
        type: "paragraph",
        children:
          "If your situation includes staking rewards, airdrops, DeFi, business activity or more than one country, consider a qualified tax professional. Good records make their job, and yours, far easier. You now have every piece for one written document.",
      },
      {
        type: "heading",
        level: 3,
        children: "Draft your portfolio risk policy",
      },
      {
        type: "paragraph",
        children:
          "A household in Washington, D.C., that writes down its budget and who pays which bill argues less when money gets tight. A written portfolio-risk policy makes decisions in calm moments so you don't have to make them in loud ones.",
      },
      {
        type: "comparisonTable",
        caption:
          "Portfolio-risk policy template (fill in your own; numbers deliberately left blank)",
        columns: ["Section", "What to write"],
        rows: [
          ["Purpose and time horizon", "Why I hold crypto, and for how long"],
          [
            "Money that stays out",
            "Emergency fund status; essential money never used",
          ],
          [
            "Total loss budget",
            "______ in my home currency, reviewed on ______",
          ],
          ["Per-idea risk", "Most I will lose on one idea: ______"],
          [
            "Concentration limits",
            "Largest share in one asset ___, one provider ___, one stablecoin ___, one smart contract ___",
          ],
          [
            "Leverage and borrowing",
            'My rule (for example "none while learning")',
          ],
          ["How money goes in", "Lump sum or DCA; frequency; fee limit"],
          [
            "Rebalancing",
            "Calendar, threshold or both; my target mix and bands",
          ],
          [
            "Exit plan",
            "Goal, partial profit-taking, thesis invalidation, time and life exits",
          ],
          [
            "Records",
            "Where I keep them; what I record; who knows where they are",
          ],
          ["Review and pause", "Review date; what makes me stop and reassess"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This template is the first draft of the portfolio-risk policy in your graduation project in Level 10. Level 9 will fold it into a wider personal crypto plan and show you how to review it honestly.",
      },
    ],
  },
  {
    title: "Everyday example, practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Buying the same amount of groceries",
        children:
          "A shopper in the UK spends GBP 20 on rice each month. Lower prices buy more kilograms, while higher prices buy fewer. The average paid per kilogram is total spending divided by total kilograms, not the simple average of posted prices. DCA uses the same quantity-weighted arithmetic. Unlike groceries consumed for a known purpose, a speculative asset can keep losing value; the shopping analogy explains the calculation, not the investment outcome.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Tax examples are jurisdiction specific; check current official rules for the actual location and activity.",
      },
      {
        type: "learningLink",
        title: "Open the Dollar Cost Averaging Calculator",
        href: "/tools/dollar-cost-averaging-calculator",
        description:
          "Try the PipStart tool: Dollar Cost Averaging Calculator — Use fictional recurring purchases, reproduce accumulated units and average cost, then add costs omitted by the illustration. It does not forecast a profitable outcome. Calculator scope: complete the original GBP 20, GBP 25 and GBP 10 three-price worksheet on paper; the tool cannot accept three independently chosen prices. Its prices are spread evenly between a starting and ending price. For a separate supported comparison, choose GBP, investment per purchase 200, Monthly, first purchase 2026-01-01, plan end 2026-03-01, starting price 20 and ending price 10. This generates prices 20, 15 and 10: about 43.33333333 units, average cost GBP 13.85 and ending value GBP 433.33 before fees. Keep the original worksheet result of 38 units and GBP 15.79 distinct from this generated path. Add fees manually.",
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Try the PipStart tool: Drawdown Calculator — Measure peak-to-trough percentage on a clearly defined equity series. State whether deposits, withdrawals, fees and valuation changes have been reconciled. Tool setup: choose USD, starting balance 1,000, drawdown 30 and unit percent. Remaining balance is USD 700 and recovery requires 42.86 percent. Supply a reconciled peak and drawdown yourself: this tool does not ingest a complete equity history or adjust cash flows automatically.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Try the PipStart tool: Gain Recovery Calculator — Explain the percentage gain required after a loss using an unchanged base definition. It describes arithmetic, not the likelihood or time of recovery. Tool setup: choose USD, current balance 700 and recovery target 1,000. The gain needed is 42.86 percent. A fictional planned gain of 5 percent per period produces 8 model periods, not a predicted recovery time. It assumes a constant compounded rate and omits losses, costs and changing conditions.",
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
          "1. Calculate total quantity with GBP 2 deducted from each purchase budget.",
          "2. Why is a transfer between owned wallets not automatically a trading gain?",
          "3. Write three details needed in a cash-out plan.",
        ],
        answers: [
          "1. 198 ÷ 20 + 198 ÷ 25 + 198 ÷ 10 = 9.9 + 7.92 + 19.8 = 37.62 units.",
          "2. It moves an existing holding rather than creating a price profit. Fees and local reporting treatment still need review.",
          "3. Executable market and size, supported withdrawal and bank route, fees and conversion, processing time and outage contingency are relevant.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Does DCA prevent an asset from losing most or all of its value?",
        ],
        answers: [
          "No. It spreads entry under a schedule; the underlying asset and access risks remain.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Average cost equals total relevant cost divided by acquired units.",
          "An exit plan includes the cash-out route.",
          "Separate cash flows, transfers and performance in records.",
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
            title: "IRS: Digital assets",
            url: "https://www.irs.gov/filing/digital-assets",
          },
          {
            title:
              "Kraken: How to deposit cryptocurrencies to your Kraken account",
            url: "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
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
            title: "Investor.gov: Investor.gov — Dollar Cost Averaging",
            url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging",
          },
          {
            title:
              "Vanguard: Vanguard — Cost averaging: Invest now or temporarily hold your cash? (Finlay and Zorn, February 2023)",
            url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf",
          },
          {
            title:
              "Vanguard: Vanguard — Lump-sum investing versus cost averaging: Which is better?",
            url: "https://investor.vanguard.com/investor-resources-education/news/lump-sum-investing-versus-cost-averaging-which-is-better",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel8Lessons: LessonDocument[] = [
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
