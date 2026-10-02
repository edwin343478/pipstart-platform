import type { LessonSection } from "../../lesson-content";

export const decideTheLossBeforeTheSizeSections: LessonSection[] = [
  {
    title: "Begin with money you can keep separate",
    shortTitle: "Begin with money you can keep separate",
    blocks: [
      {
        type: "paragraph",
        children:
          "A chart idea can look attractive before anyone asks what it could cost. This lesson changes the order. First decide the planned cash loss, then identify where the idea would be invalidated, then calculate a permitted size. The question is not “How large a position can the platform let me open?” It is “What would this position lose under my stated exit assumptions, and what could make that loss larger?”",
      },
      {
        type: "paragraph",
        children:
          "All balances, prices and percentages here are invented demo examples. A 1% example is a convenient calculation, not a recommended risk level or evidence that trading is suitable for you. Money for rent, food, healthcare, education, emergencies or loan repayments belongs outside a trading experiment. A percentage of money you cannot afford to lose is still money you cannot afford to lose.",
      },
      {
        type: "example",
        title: "Keep the household envelope closed",
        children: [
          "A family in France sets aside €700 for rent and €250 for groceries. They do not turn those envelopes into an experiment because someone calls it “only a small percentage.” A demo account lets them practise the calculations without treating essential money as spare money. The first risk decision can be to take no live position.",
        ],
      },
    ],
  },
  {
    title: "Define risk per idea in account currency",
    shortTitle: "Define risk per idea in account currency",
    blocks: [
      {
        type: "paragraph",
        children:
          "Planned risk is the estimated cash loss if a stated position closes at its stated adverse exit, plus the charges included in your model. It is different from the price distance alone, the required margin and the full face value of the position. Choose one account currency and keep every component in that currency before adding it. Write whether your budget uses a fixed amount or a percentage, and what account value supplies the percentage.",
      },
      {
        type: "formula",
        expression:
          "Demo cash-risk budget = chosen account reference × chosen percentage ÷ 100",
        explanation:
          "The reference might be current equity or another explicitly documented value. Do not silently switch between balance and equity.",
      },
      {
        type: "example",
        title: "Make a small number explicit",
        children: [
          "An invented US$1,000 demo equity and a 1% classroom limit give US$10. This is the total planned budget for the idea, not US$10 for every order that happens to support it. Splitting one idea into three tickets does not create three independent budgets.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A planned stop loss is not a guarantee of the final loss. A gap, changing conversion rate, commission, financing or poor fill can alter the result. “Maximum planned loss” means a limit in the worksheet under the worksheet assumptions. It does not mean the market or provider has promised a maximum payable amount. Keep a separate adverse-fill scenario rather than hiding that difference.",
      },
    ],
  },
  {
    title: "Read balance and equity before sizing",
    shortTitle: "Read balance and equity before sizing",
    blocks: [
      {
        type: "paragraph",
        children:
          "Balance generally records closed transactions and booked account adjustments. Equity includes the effect of open positions under the platform’s rules. A simple teaching account with no credit adjustments has equity equal to balance plus floating profit or loss. An open loss is not harmless simply because it has not appeared as a closed trade in the balance. The account is already exposed to it.",
      },
      {
        type: "comparisonTable",
        caption: "A simplified demo account in US dollars",
        columns: ["Item", "Amount", "What it tells you"],
        rows: [
          ["Balance", "US$1,000", "Closed-account reference"],
          ["Floating open loss", "−US$100", "Open position effect"],
          ["Equity", "US$900", "Balance plus floating result here"],
          ["1% of balance", "US$10", "Budget using the old reference"],
          ["1% of equity", "US$9", "Budget using the current reference"],
        ],
      },
      {
        type: "example",
        title: "Your wallet and a bill due today",
        children: [
          "A Canadian student sees C$100 in a wallet but has a C$30 bill due. Counting only the visible C$100 can overstate what is available. The analogy is imperfect—an open market loss can still change—but it helps explain why one account number is not the full financial picture.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Read the provider’s treatment of commission, credits, swaps and blocked amounts. The simplified equation is a teaching aid, not a substitute for the account agreement. If you choose an equity-based demo policy, record equity before sizing each new idea and include the risk of positions already open. Lesson 2 will connect these account values to margin.",
      },
    ],
  },
  {
    title: "Locate invalidation before choosing size",
    shortTitle: "Locate invalidation before choosing size",
    blocks: [
      {
        type: "paragraph",
        children:
          "An invalidation point is a price or condition that contradicts the particular idea you are testing. The chart lessons taught you to define rules before seeing later prices. Use the same habit here: describe the intended entry, the condition that would make the idea wrong and how an exit order would operate. A stop placed solely to obtain a bigger lot count does not make the idea stronger.",
      },
      {
        type: "example",
        title: "Budget first, quantity second",
        children: [
          "A shopper in India has ₹200 for fruit. At ₹20 per mango, the budget buys ten; at ₹40, it buys five. The shopper cannot keep ten mangoes within the same budget by rewriting the price label. Similarly, when a meaningful stop is farther away, reduce size or skip the idea rather than moving the stop only to force the calculation.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Use the distance from the executable entry side to the planned exit side. For a conventional retail quote, a long enters at ask and exits by selling at bid; a short enters at bid and exits by buying at ask. Confirm trigger rules and whether the chart displays bid, ask or another series. A drawn line measured from a different price series can understate the distance you would actually pay.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Do not widen a stop after opening merely to avoid recording a loss, add to the position without recalculating total risk, or remove the exit because the trade feels certain. Each change creates a new risk problem and needs a fresh calculation. A stop-limit order may fail to fill; an ordinary stop may fill at a worse price.",
        ],
      },
    ],
  },
  {
    title: "Turn distance into loss per unit",
    shortTitle: "Turn distance into loss per unit",
    blocks: [
      {
        type: "paragraph",
        children:
          "Forex quotations express quote currency per one unit of base currency. Under a conventional linear contract, base units multiplied by an adverse price change give the price loss in quote currency. Convert that result into the account currency. A standard lot often represents 100,000 base units in the examples here, but the actual contract specification controls. A lot, a pip, a point and a unit are not interchangeable.",
      },
      {
        type: "formula",
        expression:
          "Price loss in quote currency = base units × adverse price distance",
        explanation:
          "For an illustrative linear Forex position. Product-specific multipliers, fees and conversion may change the account result.",
      },
      {
        type: "comparisonTable",
        caption: "EUR/USD at a 20-pip adverse distance, before costs",
        columns: [
          "Size",
          "Euro units",
          "US dollars per pip",
          "Planned price loss",
        ],
        rows: [
          ["0.01 lot", "1,000", "US$0.10", "US$2"],
          ["0.02 lot", "2,000", "US$0.20", "US$4"],
          ["0.05 lot", "5,000", "US$0.50", "US$10"],
          ["0.10 lot", "10,000", "US$1.00", "US$20"],
        ],
      },
      {
        type: "paragraph",
        children:
          "For EUR/USD, a conventional pip is 0.0001 USD per euro. A 20-pip distance is 0.0020. Thus 5,000 euros × 0.0020 USD per euro equals US$10. On many JPY-quoted pairs a conventional pip is 0.01 yen, so reusing 0.0001 would be a serious unit error. Check the Pip Value Calculator’s instrument definition before comparing results.",
      },
      {
        type: "learningLink",
        title: "Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Try EUR/USD at 0.01 and 0.05 lot with a US-dollar account and conversion 1. Compare US$0.10 and US$0.50 per pip. Verify the contract and the tool’s quote-to-account conversion direction.",
      },
    ],
  },
  {
    title: "Calculate size and round down",
    shortTitle: "Calculate size and round down",
    blocks: [
      {
        type: "paragraph",
        children:
          "Divide the cash budget by the cash loss for one unit or one standard lot at the proposed stop distance. The denominator and numerator must use the same account currency. Then round down to a permitted volume step. Rounding to the nearest step can round upward and exceed the budget. Check the minimum, maximum, step and contract size separately; a computed number is not automatically an allowed order.",
      },
      {
        type: "formula",
        expression:
          "Unrounded lots = cash-risk budget ÷ (stop pips × account-currency pip value per standard lot)",
        explanation:
          "This price-only expression assumes a linear contract and the stated conversion. Add charges and execution scenarios separately.",
      },
      {
        type: "example",
        title: "The approved US-dollar sizing example",
        children: [
          "For US$10 of planned price risk, a 20-pip EUR/USD distance and US$10 per pip per standard lot give 10 ÷ (20 × 10) = 0.05 lot. If distance doubles to 40 pips, the unrounded result is 0.025 lot.",
          "With 0.01-lot steps, round 0.025 down to 0.02. Its price loss is 40 × US$10 × 0.02 = US$8. Rounding up to 0.03 would produce US$12 before costs. The unused US$2 is not an invitation to spend more.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-5/size-and-distance.svg",
        desktopSrc:
          "/images/lessons/forex/level-5/size-and-distance-desktop.svg",
        width: 720,
        height: 400,
        alt: "For the same US$10 price-risk budget, 20 pips implies 0.05 lot; 40 pips implies 0.025 lot before rounding and 0.02 lot at a 0.01 step.",
        caption:
          "Distance and size move in opposite directions when the planned cash budget stays fixed. The table and example provide the exact values.",
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Enter demo balance 1,000, risk 1%, EUR/USD, USD account, conversion 1 and 20 stop pips; compare 0.05 lot. Change only the distance to 40 and compare 0.02 after rounding. The tool estimates price risk, not a guaranteed total loss.",
      },
    ],
  },
  {
    title: "Allow for charges and worse fills",
    shortTitle: "Allow for charges and worse fills",
    blocks: [
      {
        type: "paragraph",
        children:
          "A price-only size may consume the whole budget before commission or a worse exit is considered. Build one coherent price convention. If the entry is the actual ask and the stop exit is the actual bid, their distance already reflects those sides: do not add the same spread a second time. If you start from a mid-price or bid chart, work out the executable-side adjustment first. Record round-trip commission, financing for the assumed holding period and any conversion charge separately.",
      },
      {
        type: "example",
        title: "Reserve room in a demo worksheet",
        children: [
          "Take the 40-pip EUR/USD example at 0.02 lot: US$8 price loss. Suppose a hypothetical provider charges US$7 per standard lot for the full round trip; 0.02 lot costs US$0.14. A stress exit five pips worse adds 5 × US$0.20 = US$1.00. Total in this particular scenario is US$9.14 before any other charges.",
          "These are invented charge and fill assumptions. Five pips is not a worst possible gap, and passing this scenario does not cap a later loss. Compare the provider’s real charging units: “per side” and “round trip” mean different totals.",
        ],
      },
      {
        type: "paragraph",
        children:
          "If a provider has a minimum fixed commission, charges may not shrink proportionally with volume. Calculate allowed sizes one by one until the price loss plus the chosen cost allowance fits, or select no position. Recheck after partial fills and partial closes. A platform accepting the order only proves that its current acceptance conditions were met.",
      },
    ],
  },
  {
    title: "Convert a quote-currency loss carefully",
    shortTitle: "Convert a quote-currency loss carefully",
    blocks: [
      {
        type: "paragraph",
        children:
          "Conversion answers a simple question: how much account currency is one unit of the loss currency worth under the stated rate? Multiply a USD loss by CAD per USD for a CAD account; divide a JPY loss by JPY per USD for a USD account. Do not multiply merely because a rate field exists. Write the units beside the rate and cancel them on paper.",
      },
      {
        type: "example",
        title: "A Canadian account and a Japanese quote",
        children: [
          "A USD/CAD demo idea with 1,000 US-dollar units and a 0.0050 CAD-per-USD adverse distance has a C$5 price loss. The account is in CAD, so no further conversion is needed in this simplified example.",
          "For 1,000 USD units of USD/JPY, a 20-pip distance is 0.20 yen per dollar, giving ¥200. At an invented conversion of ¥150 per US dollar, ¥200 ÷ 150 is about US$1.33. At ¥140 per US dollar, the same ¥200 is about US$1.43. The quote-currency loss and account-currency loss are different quantities.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A rate supplied to a calculator may be quote currency to account currency, not the currency pair’s displayed market price. Use a supported instrument and account currency, read the conversion guidance and verify the result with a small paper example. Conversion can change between the plan and the exit, so record the rate and timestamp rather than treating it as permanent.",
      },
    ],
  },
  {
    title: "Compare proposed reward with planned risk",
    shortTitle: "Compare proposed reward with planned risk",
    blocks: [
      {
        type: "paragraph",
        children:
          "A target is a proposed favourable exit, not money already earned. Reward-to-risk divides proposed cash gain by planned cash loss using consistent charges and fill assumptions. A ratio of 2 means two units of proposed gain for one unit of planned loss. Some displays call this “risk-to-reward 1:2”; others show “reward/risk 2.” State your convention to prevent the same numbers being read backwards.",
      },
      {
        type: "formula",
        expression:
          "Proposed reward-to-risk = proposed net gain ÷ planned total loss",
        explanation:
          "Use cash in one currency or consistent price distances before costs. Do not mix a net numerator with an unexplained gross denominator.",
      },
      {
        type: "example",
        title: "A target is like a possible game prize",
        children: [
          "A practice game pays 20 points for a win and costs 10 for a loss. A large prize sounds attractive, but you still need to know how often each outcome occurs. A EUR/USD target 40 pips away with a 20-pip stop has a price-only 2:1 reward-to-risk ratio; it does not have a two-thirds chance of winning.",
        ],
      },
      {
        type: "learningLink",
        title: "Risk-to-Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Use a long EUR/USD example with entry 1.1000, stop 1.0980 and target 1.1040. The price distances give 2:1 and a theoretical break-even rate before costs. Check the executable-side assumptions separately.",
      },
    ],
  },
  {
    title: "Connect the ratio to outcomes and costs",
    shortTitle: "Connect the ratio to outcomes and costs",
    blocks: [
      {
        type: "paragraph",
        children:
          "Expectancy is an average outcome under a stated model: win probability times average win minus loss probability times average loss. It is not the profit of the next trade. In the simplest two-outcome model, ignoring costs, break-even win probability is loss divided by win plus loss. With a proposed win of US$20 and loss of US$10, this is 10/30, or about 33.3%. Real outcomes may include partial exits, gaps, time exits and varying sizes.",
      },
      {
        type: "comparisonTable",
        caption: "Invented average outcomes; no forecast",
        columns: [
          "Assumed win rate",
          "Average win",
          "Average loss",
          "Model average before costs",
        ],
        rows: [
          ["30%", "US$20", "US$10", "−US$1.00"],
          ["40%", "US$20", "US$10", "US$2.00"],
          ["50%", "US$20", "US$10", "US$5.00"],
        ],
      },
      {
        type: "paragraph",
        children:
          "At 40%, the arithmetic is 0.40 × 20 − 0.60 × 10 = US$2. If a hypothetical US$1 charge applies to every trade, net expectancy becomes US$1. Net outcomes are +US$19 and −US$11, so break-even is 11/30, about 36.7%. Do not subtract that cost again if the averages already include it. A historical win rate from a few selected trades is not a reliable future probability.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A smaller size does not turn a negative-expectancy idea into a positive one. It changes how much that idea can cost. Increasing a target on paper does not prove it will be reached more often, and increasing size does not repair poor evidence.",
        ],
      },
    ],
  },
  {
    title: "Know when the permitted size is zero",
    shortTitle: "Know when the permitted size is zero",
    blocks: [
      {
        type: "paragraph",
        children:
          "Suppose the cash budget is US$1, distance is 20 pips and the minimum is 0.01 EUR/USD lot. The minimum price loss is US$2 before costs, already above the budget. The answer is not to round up or borrow another envelope. Under that worksheet the permitted size is zero. A demo calculation can be valuable even when it rules out the position.",
      },
      {
        type: "paragraph",
        children:
          "Pending orders also belong in the plan: several orders may activate during the same move. Treat a staged entry as one idea where appropriate and calculate its total risk if all intended portions fill. Check whether orders truly cancel each other, and how a netting or hedging account handles them. Moving a stop to the displayed entry does not guarantee zero cash loss because fees and a worse fill can remain.",
      },
      {
        type: "example",
        title: "A whole ticket costs more than your allowance",
        children: [
          "A learner in the United Kingdom has a £3 transport allowance but the smallest available ticket costs £4. Buying one ticket is still over budget even if the ticket office is willing to sell it. Minimum trade sizes work in the same way: availability and affordability are separate checks.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Keep the final pre-order record: account reference and currency; idea and invalidation; entry/exit side; stop distance; contract and pip value; conversion; costs; permitted step; rounded size; total existing exposure; and a decision to proceed in demo or skip. Lesson 3 will show why several individually small positions can still create one large shared risk.",
      },
    ],
  },
  {
    title: "Practise the complete calculation",
    shortTitle: "Practise the complete calculation",
    blocks: [
      {
        type: "exercise",
        prompt:
          "An invented US$1,000 demo account uses a 1% price-only budget. EUR/USD entry is 1.1000 and stop is 1.0960. Assume 100,000 units per lot and 0.01-lot steps. Calculate the unrounded size, permitted size and price loss.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Budget is US$10; distance is 0.0040, or 40 pips. Risk per standard lot is US$400. Unrounded size is 0.025; round down to 0.02. Its price loss is US$8. Add costs and adverse-fill scenarios before calling the worksheet complete.",
      },
      {
        type: "exercise",
        prompt:
          "A Canadian demo budget is C$10. One hypothetical small unit loses C$0.50 at the planned exit. How many whole units fit? What if loss per unit is C$1?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Twenty units in the first simplified case and ten in the second, before charges and possible worse fills. Verify what “unit” means for this specific product; it is not necessarily a lot.",
      },
      {
        type: "exercise",
        prompt:
          "A proposed gross win is US$20 and gross loss US$10, with a US$1 cost on every trade. What two net outcomes belong in the break-even calculation?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Net win is US$19; net loss magnitude is US$11. Break-even win probability is 11/(19+11), about 36.7%, under this two-outcome model. The actual strategy may not follow these assumed outcomes.",
      },
    ],
  },
  {
    title: "Reflect, check and keep a record",
    shortTitle: "Reflect, check and keep a record",
    blocks: [
      {
        type: "reflection",
        title: "Explain it in your own words",
        points: [
          "Calculate planned cash risk and rounded position size with explicit units.",
          "Compare balance, equity, costs and currency conversion before sizing.",
          "Explain proposed reward-to-risk and break-even assumptions without implying a forecast.",
        ],
        closing: [
          "Use a demo notebook to keep intended risk, actual outcomes and unexplained differences separate. If you cannot explain a unit or assumption, pause and check it.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All numeric market and account examples are invented teaching data, not live recommendations. Position sizing, stops and loss limits cannot guarantee a maximum actual loss. Product terms, leverage, conversion, charges, gaps and execution can change results. Keep essential living money outside trading experiments.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can repeat the worked arithmetic and state its currency units.",
          "I can distinguish account values, planned losses and actual outcomes.",
          "I can identify a cost or execution assumption that could fail.",
          "I can explain the exercises and use the linked tools as estimates.",
          "I can state when a zero-size decision or a learning pause is appropriate.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group — Proper Position Size",
            url: "https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
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
