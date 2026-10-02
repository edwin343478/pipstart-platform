import type { LessonSection } from "../../lesson-content";

export const policyAndMarketRelationshipsSections: LessonSection[] = [
  {
    title: "Separate policy, expectations and outcomes",
    shortTitle: "Separate policy, expectations and outcomes",
    blocks: [
      {
        type: "paragraph",
        children:
          "Policy and market relationships help explain how economic decisions might reach currencies. They are not a shortcut from a headline to a buy or sell instruction. Begin with three separate questions: what was decided, how it differed from the expectations recorded beforehand, and which possible channels could matter. The outcome depends on other countries, market positioning, liquidity and later information as well.",
      },
      {
        type: "example",
        title: "The announced fee was already expected",
        children: [
          "A school in the United Kingdom announces a £5 increase in its monthly activity fee. If parents expected £5, the announcement confirms their plan. If they expected £10, the same increase is smaller than expected. A policy-rate increase can likewise be an increase in level without being a positive surprise relative to a saved expectation.",
        ],
      },
      {
        type: "paragraph",
        children:
          "The framework here builds on the previous lesson’s units, revisions and comparison rules. Use invented examples to practise explanation and alternative outcomes. Avoid writing “higher rates mean the currency must rise.” A conditional explanation is stronger when it names the information that could weaken it.",
      },
    ],
  },
  {
    title: "Distinguish monetary policy from fiscal policy",
    shortTitle: "Distinguish monetary policy from fiscal policy",
    blocks: [
      {
        type: "paragraph",
        children:
          "Monetary policy is conducted through a country’s central-bank framework and can involve policy interest rates, lending facilities and balance-sheet operations. Fiscal policy involves government spending, taxation and borrowing. Their authorities, legal mandates and operating arrangements differ across countries. A government budget is not the same announcement as a central-bank rate decision.",
      },
      {
        type: "comparisonTable",
        caption: "Two kinds of decisions",
        columns: ["Area", "Illustrative decision", "Questions to ask"],
        rows: [
          [
            "Monetary policy",
            "Central bank changes its policy rate",
            "What changed, what was expected, and what does the explanation imply?",
          ],
          [
            "Fiscal policy",
            "Government changes taxes or spending",
            "When does it take effect, who is affected, and how is it financed?",
          ],
          [
            "Interaction",
            "Spending supports demand while rates restrict borrowing",
            "What might happen to demand, inflation, financing and confidence?",
          ],
        ],
      },
      {
        type: "example",
        title: "The family budget and the bank loan",
        children: [
          "A Canadian household changes its spending plan while its bank changes the rate on a loan. These affect the same household through different decisions. Government spending and central-bank rates can also affect the same economy through different channels. The analogy helps separate the decisions; a country’s institutions and economy are much more complex.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Expansionary and restrictive are useful descriptions of intended effects, not certain outcomes. More spending may support demand but also raise financing or inflation concerns. Higher rates may slow borrowing but their effect takes time and varies by household and business. Check the actual measures rather than judging an entire package from one label.",
      },
      {
        type: "paragraph",
        children:
          "Quantitative easing, or QE, involves central-bank asset purchases financed through newly created central-bank reserves under the relevant programme. It aims to influence financial conditions, including borrowing costs. Quantitative tightening, or QT, unwinds purchased assets, for example through maturities without full reinvestment or through sales. Programme details matter; these are not simply a cash gift to every household or a guaranteed currency direction. The Bank of England began its UK QE programme in March 2009 during the financial crisis. That is the beginning of that programme, not the origin of all central banking.",
      },
    ],
  },
  {
    title: "Read the central bank’s role before reading its signal",
    shortTitle: "Read the central bank’s role before reading its signal",
    blocks: [
      {
        type: "paragraph",
        children:
          "Central banks have different mandates, instruments and institutional arrangements. Price stability is a common concern, but employment, financial stability and other responsibilities vary. Some exchange-rate regimes also constrain the choices available. Do not assume that the Federal Reserve, Bank of England, European Central Bank and another central bank all operate under identical objectives.",
      },
      {
        type: "paragraph",
        children:
          "There is no single founder of modern fundamental analysis or one origin date for all central banking. Institutions and analytical approaches developed over time. For a beginner, the important historical distinction is that today’s policies belong to specific legal institutions and evolving monetary arrangements. Learn the named institution’s own explanation before applying a general label.",
      },
      {
        type: "example",
        title: "Different workplaces have different rules",
        children: [
          "A worker in Germany and a worker in Japan may both receive safety instructions, but the rules at their employers are not identical. Likewise, two central banks can both discuss inflation while using different mandates and decision procedures. Read the institution’s own documents.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Identify the institution and document",
        columns: ["Field", "Why it belongs in the notebook"],
        rows: [
          [
            "Authority",
            "Central bank, treasury, statistics agency or another body",
          ],
          ["Mandate", "Official objectives and relevant legal framework"],
          ["Decision", "Instrument, amount and effective date"],
          [
            "Explanation",
            "Statement, projections, minutes or press conference",
          ],
          ["Comparison", "Saved expectation and previous decision"],
          ["Limit", "An interpretation is not a guaranteed price response"],
        ],
      },
    ],
  },
  {
    title: "Separate today’s rate from the expected path",
    shortTitle: "Separate today’s rate from the expected path",
    blocks: [
      {
        type: "paragraph",
        children:
          "A policy rate is a current setting. Market participants also consider the possible path of later settings. A decision that leaves today’s rate unchanged may still accompany an explanation that changes expectations about future decisions. Forward guidance communicates policy intentions or conditions, but it is not an unconditional promise that every later decision will follow a fixed timetable.",
      },
      {
        type: "example",
        title: "A bus is on time but the later service changes",
        children: [
          "An Australian commuter sees that the current bus leaves on time. A notice says later services may be less frequent if road work continues. Today’s departure and the future schedule are different pieces of information. A rate decision and its accompanying guidance also deserve separate entries.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Invented decision record",
        columns: ["Item", "Before announcement", "After announcement"],
        rows: [
          ["Current policy setting", "4.00%", "4.00%: unchanged"],
          [
            "External forecast",
            "No change expected",
            "Current decision matched it",
          ],
          [
            "Future-path interpretation",
            "Later reductions considered possible",
            "Statement stresses conditions; interpretation may change",
          ],
          [
            "Currency conclusion",
            "Unknown",
            "Still unknown; evaluate relative expectations and other forces",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Words such as hawkish and dovish are shorthand for an interpretation of relatively restrictive or accommodative policy intentions. They are not numerical probabilities or permanent identities. Attribute the label to the analyst using it and explain which passages support it. A statement can contain mixed messages, and a press conference may clarify or complicate the first reading.",
      },
    ],
  },
  {
    title: "Use percentage points and basis points correctly",
    shortTitle: "Use percentage points and basis points correctly",
    blocks: [
      {
        type: "paragraph",
        children:
          "A percentage point describes the difference between two percentage rates. One basis point is 0.01 percentage point, so 100 basis points equal one percentage point. A move from 4.00% to 4.25% is an increase of 0.25 percentage point or 25 basis points. It is also a 6.25% proportional increase in the numerical rate because 0.25/4.00 = 0.0625. These expressions answer different questions.",
      },
      {
        type: "formula",
        expression: "Basis-point change = (new rate − old rate) × 100",
        explanation:
          "Here the rates are entered as percentage numbers: (4.25 − 4.00) × 100 = 25 basis points.",
      },
      {
        type: "example",
        title: "A small rate change is not a 25% rate",
        children: [
          "A French learner reads “25-basis-point increase” and writes 25%. That would confuse the change with an entirely different rate. Keep the old level, new level and difference on separate lines.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A difference between two countries’ rates is also measured in percentage points or basis points when using those units. Do not silently compare a policy rate in one country with a ten-year bond yield in another and call it the same instrument. Record maturity, currency, instrument and observation time.",
      },
    ],
  },
  {
    title: "Understand bonds, prices and yields",
    shortTitle: "Understand bonds, prices and yields",
    blocks: [
      {
        type: "paragraph",
        children:
          "A bond is a debt security with terms for payments and repayment, subject to issuer and product risks. A fixed coupon is a contractual payment feature. The market price can change, and yield measures depend on the price and the yield definition. For an existing fixed-rate bond, a higher required market yield generally corresponds to a lower price, other things equal. That relationship does not remove credit, liquidity or currency risks.",
      },
      {
        type: "comparisonTable",
        caption: "Simplified current-yield illustration",
        columns: ["Annual coupon", "Market price", "Coupon / price"],
        rows: [
          ["4 currency units", "100 currency units", "4%"],
          ["4 currency units", "80 currency units", "5%"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This is current yield: annual coupon divided by market price. It is not yield to maturity. Yield to maturity also depends on the timing of payments, redemption amount and other contractual assumptions. The table deliberately omits those details so the price/coupon distinction is clear; it must not be used to value a real bond.",
      },
      {
        type: "example",
        title: "The same rental cash at a different purchase price",
        children: [
          "A property offering the same annual rent has a different simple rent-to-purchase-price ratio at two different purchase prices. That ratio is not a complete investment return because repairs, sale value and other costs matter. A coupon-to-price ratio is similarly incomplete.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A rising government bond yield can reflect changing policy expectations, inflation compensation, term premium, financing concerns or other forces. It does not prove that overseas investors must buy the currency. Some buyers hedge currency exposure; some may sell the asset. Name the possible channel and alternatives.",
      },
    ],
  },
  {
    title: "Compare nominal and inflation-adjusted returns",
    shortTitle: "Compare nominal and inflation-adjusted returns",
    blocks: [
      {
        type: "paragraph",
        children:
          "A nominal return describes the change in money units. An inflation-adjusted, or real, return compares that growth with a relevant price-level change. For a simple one-period calculation, real return = (1 + nominal return)/(1 + inflation) − 1 when both are entered as decimals. Subtracting inflation from the nominal rate is a useful approximation for small rates, not the exact compounding calculation.",
      },
      {
        type: "formula",
        expression: "Illustrative real return = 1.04 / 1.03 − 1 ≈ 0.00971",
        explanation:
          "An invented 4% nominal return and 3% inflation give about 0.97% real return before fees and taxes.",
      },
      {
        type: "example",
        title: "More cash, only a little more purchasing power",
        children: [
          "An Italian saver ends with €104 instead of €100. If the relevant basket costs €103 instead of €100, the cash balance rose by 4%, but the improvement in purchasing power is about 0.97%. A learner should not describe the full €4 as a 4% improvement in what the money can buy.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For forward-looking analysis, expected inflation and realised inflation are different inputs. Actual later inflation can differ from the expectation saved today. A quoted real yield for a market instrument can also use conventions more detailed than this household example. Label whether your calculation is hypothetical, backward-looking or based on expectations.",
      },
    ],
  },
  {
    title: "Follow the relative-rate and currency channels",
    shortTitle: "Follow the relative-rate and currency channels",
    blocks: [
      {
        type: "paragraph",
        children:
          "A foreign asset’s return matters in the investor’s home currency. A higher stated foreign yield can be outweighed by an adverse exchange-rate change, fees, taxes, credit loss or hedging costs. A change in relative rates may influence currency demand, but how much was expected and how investments are funded or hedged also matters.",
      },
      {
        type: "example",
        title: "Compare savings in euros and yen carefully",
        children: [
          "A German family compares a euro savings offer with a Japanese relative’s yen offer. Before calling one better, they identify the currency of their future bills, account terms, fees, reliability and the exchange rate for converting back. A higher quoted rate in yen or euros is only one input. Borrowing in one currency to buy another adds funding and exchange-rate risks rather than making the difference free income.",
        ],
      },
      {
        type: "example",
        title: "Interest cannot cancel every exchange-rate loss",
        children: [
          "Use a hypothetical UK saver with £100 converted into a foreign-currency asset. Assume the asset gains 4% in its own currency, and that currency’s value in pounds then falls by 8%. With no fees or taxes, home value is £100 × 1.04 × 0.92 = £95.68. That is a 4.32% loss in pounds despite the positive foreign return.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-7/yield-and-return.svg",
        desktopSrc:
          "/images/lessons/forex/level-7/yield-and-return-desktop.svg",
        width: 720,
        height: 400,
        alt: "A £100 teaching investment grows by 4% locally, then an 8% fall in the foreign currency leaves £95.68 in home value.",
        caption:
          "The invented, unleveraged arithmetic separates asset return from currency return. It does not represent a platform’s financing schedule or a recommended investment.",
      },
      {
        type: "paragraph",
        children:
          "A carry trade typically seeks to benefit from differences in funding and investment returns while accepting other risks. Retail leveraged Forex financing is a product-specific charge or credit, not automatically the simple difference between two central-bank policy rates. Contract terms, spreads, markups, holding days, account conversion and market changes matter. Never use this example as a rollover quote.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Leverage can amplify currency losses and financing costs. A positive stated rate differential does not ensure a positive total return. Keep the currency, asset, funding and product assumptions visible.",
        ],
      },
    ],
  },
  {
    title: "Explain risk appetite without permanent currency labels",
    shortTitle: "Explain risk appetite without permanent currency labels",
    blocks: [
      {
        type: "paragraph",
        children:
          "Risk-on and risk-off describe broad interpretations of willingness to take risk or preference for protection. They are not official market switches with one universal measurement. Shares, bond prices, volatility, credit conditions and currencies can offer different evidence. Relationships may vary across events and time periods.",
      },
      {
        type: "example",
        title: "Different families react differently to uncertainty",
        children: [
          "A household in the United States postpones a large purchase during uncertainty; another household in Japan needs to buy a replacement refrigerator immediately. The same news does not produce an identical action for every household. Market participants also have different obligations, positions and constraints.",
        ],
      },
      {
        type: "paragraph",
        children:
          "The US dollar or Japanese yen may be discussed as defensive currencies in some episodes, but that description does not promise their direction in every episode or against every other currency. Funding flows, interest-rate expectations, domestic news and positioning can change the result. A risk label needs dated observations and an alternative explanation.",
      },
      {
        type: "comparisonTable",
        caption: "A cautious relationship notebook",
        columns: [
          "Observation",
          "Possible explanation",
          "Alternative to keep open",
        ],
        rows: [
          [
            "Stocks fall; USD rises against EUR",
            "Demand for dollar liquidity or defensive positioning",
            "US-specific policy repricing or other flows",
          ],
          [
            "JPY rises against AUD",
            "Reduced risk-taking or funding-position adjustment",
            "Japan/Australia-specific news",
          ],
          [
            "Bond yields rise with a weaker currency",
            "Inflation or financing concern may matter",
            "Maturity, expectations and unrelated flows may differ",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Correlation observed in one sample is not a law and does not establish causation. Do not use one chart screenshot to prove that an index and a currency always move together. Record the sample, frequency and competing causes before drawing a relationship.",
      },
    ],
  },
  {
    title: "Treat commodities as one channel among several",
    shortTitle: "Treat commodities as one channel among several",
    blocks: [
      {
        type: "paragraph",
        children:
          "Commodity prices can affect countries through export receipts, import costs, business investment and government finances. Australia, Canada, Brazil and South Africa have relevant commodity sectors, but their currencies are not simple copies of one commodity chart. Trade composition, domestic conditions, global demand, policy, hedging and other financial flows also matter.",
      },
      {
        type: "example",
        title: "A Canadian exporter’s two moving prices",
        children: [
          "A Canadian business receives US$100 for a shipment in a simplified example. At invented USD/CAD 1.30 the receipt converts to C$130; at 1.25 it converts to C$125 before fees. The foreign sale price and the currency conversion both affect the home receipt. A stronger commodity price alone does not tell you the final home-currency revenue.",
        ],
      },
      {
        type: "paragraph",
        children:
          "An importing business can face a different effect from an exporter. For an Indian firm buying energy abroad, higher commodity prices can raise costs while an exchange-rate change adds another influence. A change in crude oil may have different implications for Canada and an importing economy, but the full currency outcome still depends on other forces.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Avoid “oil up means CAD up” or “gold up means every related currency up” as automatic rules. State the export/import channel, pair, horizon and alternative explanations. A commodity relationship is a hypothesis to examine, not an entry signal.",
        ],
      },
    ],
  },
  {
    title: "Keep geopolitics and unexpected events in the framework",
    shortTitle: "Keep geopolitics and unexpected events in the framework",
    blocks: [
      {
        type: "paragraph",
        children:
          "Elections, conflict, sanctions, disasters and changes in trade arrangements can affect activity, confidence, prices and payment channels. Their timing and consequences may be uncertain or unscheduled. Distinguish a verified announcement from a rumour, and an announced proposal from a measure already in force. Use responsible sources and treat people affected by these events with respect.",
      },
      {
        type: "example",
        title: "A delivery plan changes unexpectedly",
        children: [
          "A Brazilian shop has a delivery schedule, but a port disruption changes the arrival time and costs. The economic calendar did not contain that disruption as a neatly timed data release. A calendar helps organise scheduled events without covering all risks.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Look for the original authority’s statement, a timestamp and independent confirmation where appropriate. A screenshot of a headline may omit a correction, date or important condition. Do not invent a precise price target for an event whose facts are still uncertain. Pausing observation or demo activity can be a complete decision when the information or execution conditions are unclear.",
      },
    ],
  },
  {
    title: "Combine a scenario with the account’s existing exposure",
    shortTitle: "Combine a scenario with the account’s existing exposure",
    blocks: [
      {
        type: "paragraph",
        children:
          "Build a two-sided scenario: which observation might support your interpretation, which could weaken it, and which assumptions remain unknown? A narrative about rates or commodities does not replace a cash-risk worksheet or the earlier lesson on combined exposure. Several positions can share the same currency even when their pairs look different.",
      },
      {
        type: "example",
        title: "Two different pairs still depend on the dollar",
        children: [
          "A learner holds hypothetical EUR/USD and GBP/USD long positions. Both include being short USD under the conventional pair interpretation. A US policy surprise can therefore affect both positions together. Their chart labels differ, but the shared-currency question still belongs in the worksheet.",
        ],
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use supported EUR/USD and GBP/USD separately with the actual stated demo size, USD account and conversion 1. Enter hypothetical adverse exits, then add the losses and charges in the account worksheet. The tool calculates scenarios; it does not predict an event, measure correlation or guarantee an account loss limit.",
      },
      {
        type: "paragraph",
        children:
          "Check pending orders as well as open positions. A headline may arrive while several orders can activate or exits may fill worse than planned. If information, conversion or product terms are missing, keep the position calculation unresolved and record a skip instead of substituting a confident economic story.",
      },
    ],
  },
  {
    title: "Practise policy and return comparisons",
    shortTitle: "Practise policy and return comparisons",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A policy rate changes from 4.00% to 4.25%. Express the change in percentage points and basis points.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "It increases by 0.25 percentage point, or 25 basis points. The new rate is 4.25%, not 25%.",
      },
      {
        type: "exercise",
        prompt:
          "A bond pays a fixed annual coupon of 4 units. What are the simplified current yields at prices 100 and 80? Is that yield to maturity?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "4% and 5%. These are annual coupon divided by price, not yield to maturity. A full valuation needs payment timing, redemption and other terms.",
      },
      {
        type: "exercise",
        prompt:
          "A foreign asset gains 4% while its currency’s home value falls 8%. What happens to an initial home value of 100 before fees?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "100 × 1.04 × 0.92 = 95.68, a loss of 4.32%. Positive asset return does not guarantee positive home-currency return.",
      },
      {
        type: "exercise",
        prompt:
          "A central bank leaves today’s rate unchanged. Can the announcement still change expectations?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Yes. Its statement, projections or explanation may change expectations about later policy. That still does not guarantee a currency direction. Record the decision and the future-path interpretation separately.",
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
          "Distinguish monetary/fiscal decisions, current rates and future-path expectations.",
          "Calculate basis points and separate bond yield, real return and currency return.",
          "Describe conditional risk and commodity relationships without automatic trading rules.",
        ],
        closing: [
          "Keep the source, units, observation time and saved expectations in your notebook. Describe possible explanations without presenting them as certain causes or trading signals.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All numerical examples are invented teaching scenarios, not forecasts or trade recommendations. News, policy, calendars and relationships cannot guarantee price direction, execution or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential living money outside trading experiments.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can name the source, series, period, unit and timestamp.",
          "I can distinguish a fact, an expectation and an interpretation.",
          "I can repeat the arithmetic and explain its assumptions.",
          "I can state an alternative explanation or an unresolved question.",
          "I can use the highlighted tools as arithmetic checks and explain their limits.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "Federal Reserve — Monetary policy and fiscal policy",
            url: "https://www.federalreserve.gov/faqs/money_12855.htm",
          },
          {
            title: "Investor.gov — Interest rates and fixed-rate bond prices",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-86",
          },
          {
            title: "RBA — Determinants of the Australian Dollar",
            url: "https://www.rba.gov.au/publications/bulletin/2021/mar/determinants-of-the-australian-dollar-over-recent-years.html",
          },
          {
            title: "Bank of England — Who sets exchange rates?",
            url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates",
          },
          {
            title: "Bank of England — Quantitative easing and tightening",
            url: "https://www.bankofengland.co.uk/monetary-policy/quantitative-easing",
          },
          {
            title:
              "Bank of England — Evaluation of the QE programme and its 2009 launch",
            url: "https://www.bankofengland.co.uk/independent-evaluation-office/ieo-report-january-2021/ieo-evaluation-of-the-bank-of-englands-approach-to-quantitative-easing",
          },
        ],
      },
    ],
  },
];
