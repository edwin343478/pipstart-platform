import type { LessonSection } from "../../lesson-content";

export const relationshipsThatCanChangeSections: LessonSection[] = [
  {
    title: "Look beyond the names of the pairs",
    shortTitle: "Look beyond the names of the pairs",
    blocks: [
      {
        type: "paragraph",
        children:
          "Two pair names can look different while hiding the same currency direction. A long EUR/USD position buys euro exposure against dollars. A long GBP/USD position buys pound exposure against dollars. Both are short the dollar side, although the euro and pound can move differently. Start by writing those directions before asking whether a chart statistic makes the positions diversified.",
      },
      {
        type: "example",
        title: "Three deliveries, one road",
        children: [
          "A shopkeeper in France buys supplies from three companies, but all deliveries cross the same bridge. Three invoices do not remove the risk of that bridge closing. Two currency pairs sharing the dollar can likewise share an important source of risk.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A relationship is an observed connection under stated conditions. It is not an instruction to buy two pairs, a permanent economic law or proof that one movement causes another. This lesson connects the pair mechanics from earlier levels with sample measurements, cross-asset context and changing conditions. You can do every activity with paper, invented prices or historical observations; no live order is needed.",
      },
      {
        type: "paragraph",
        children:
          "Keep three questions separate: what currency directions do I hold, what did these series do in a particular sample, and what joint adverse cash scenario could affect my account? Exposure answers the first, correlation helps describe the second, and a consistent scenario worksheet addresses the third. None alone settles all three.",
      },
    ],
  },
  {
    title: "Define the observations before measuring a relationship",
    shortTitle: "Define the observations before measuring a relationship",
    blocks: [
      {
        type: "paragraph",
        children:
          "A correlation calculation needs paired observations taken on a consistent basis. Choose the instrument, provider, price side, time zone, return interval and start/end dates. Pair the return for one interval with the other series over that same interval. A London close compared with a different session boundary may include different news. Mixing a daily movement with a monthly movement asks an unclear question.",
      },
      {
        type: "formula",
        expression:
          "Simple return (%) = (ending price / starting price − 1) × 100",
        explanation:
          "Use the same price convention at both ends. This describes the quoted rate change, not a leveraged account return or the full result after costs.",
      },
      {
        type: "example",
        title: "The euro quote changes",
        children: [
          "An invented EUR/USD reference rises from 1.1000 to 1.1110 during a defined interval. Its simple quoted-rate return is (1.1110/1.1000 − 1) × 100 = 1%. A UK learner comparing GBP/USD needs the return over the same clock interval, rather than choosing a convenient later close.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Comparing raw price levels can be misleading when both series drift over time. Returns are usually a clearer starting point for studying co-movement, but their choice still matters. Daily, weekly and monthly returns can produce different coefficients. Overlapping multi-day returns reuse observations and introduce dependence; do not call each overlapping row an independent new experiment.",
      },
      {
        type: "comparisonTable",
        caption: "Record the measurement setup",
        columns: ["Field", "Why it matters"],
        rows: [
          ["Series", "Exact pair or asset, provider and price side"],
          [
            "Direction",
            "Raw quoted-pair return or explicitly defined exposure",
          ],
          ["Clock", "Date, time zone and common interval endpoints"],
          ["Window", "Start/end dates and number of paired observations"],
          [
            "Data treatment",
            "Missing, stale, duplicate or disputed observations",
          ],
          ["Return definition", "Simple or logarithmic; frequency and overlap"],
          [
            "Conclusion",
            "What the sample describes and what it cannot establish",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Do not fill missing days with a made-up zero return just to obtain a number. State a consistent matching policy, retain exclusions and explain how they change the sample. If the observations cannot be aligned reliably, an honest “not measured” is more useful than a confident-looking coefficient.",
      },
    ],
  },
  {
    title: "Understand what the coefficient actually describes",
    shortTitle: "Understand what the coefficient actually describes",
    blocks: [
      {
        type: "paragraph",
        children:
          "The method has roots in nineteenth-century statistical work rather than retail trading. Karl Pearson’s 1896 Royal Society paper discussed regression and correlation in a biological research setting. Today the coefficient is used across many fields. Its long history does not turn a sample relationship into a market law; the definition and data still need checking.",
      },
      {
        type: "paragraph",
        children:
          "Pearson correlation measures linear association between two varying series in a chosen sample. Its coefficient runs from −1 to +1 when defined. Positive values mean above-average movements in one tend to accompany above-average movements in the other; negative values describe the opposite tendency. A value near zero means little measured linear association under that setup, not that the two series have no possible relationship.",
      },
      {
        type: "paragraph",
        children:
          "The calculation centres each series by subtracting its own sample mean. It multiplies the paired deviations and adds them, then divides by the square root of the product of the two sums of squared deviations. This normalisation gives a dimensionless coefficient. If either series has no variation in the sample, the denominator is zero and this correlation is undefined; it is not automatically zero.",
      },
      {
        type: "formula",
        expression: "r = Σ[(x − x̄)(y − ȳ)] / √{Σ(x − x̄)² × Σ(y − ȳ)²}",
        explanation:
          "x and y are matched observations; x̄ and ȳ are their sample means. The sums use the same complete paired rows. The number describes linear association within this sample.",
      },
      {
        type: "comparisonTable",
        caption: "Interpret the sign without making a promise",
        columns: ["Coefficient", "Careful interpretation"],
        rows: [
          [
            "+1",
            "A perfect positive linear relationship in the nonconstant sample",
          ],
          [
            "+0.65",
            "Positive linear association in the stated sample; not a 65% probability",
          ],
          [
            "0",
            "No measured linear association; nonlinear connections may remain",
          ],
          ["−0.30", "Negative linear association in the stated sample"],
          [
            "−1",
            "A perfect negative linear relationship in the nonconstant sample",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "“Perfect” here concerns the recorded sample, not the next price change. An unusual observation can affect the coefficient substantially, especially in a small sample. Inspect the actual paired rows or a scatter plot as well as the summary number. There is no universal coefficient threshold that turns two leveraged positions into a safe portfolio.",
      },
    ],
  },
  {
    title: "Work through two small windows",
    shortTitle: "Work through two small windows",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented aligned interval returns, in percent",
        columns: [
          "Interval",
          "Series A",
          "Series B in window one",
          "Series B in window two",
        ],
        rows: [
          ["1", "−1", "−2", "+2"],
          ["2", "0", "0", "0"],
          ["3", "+1", "+2", "−2"],
          ["4", "+2", "+4", "−4"],
        ],
      },
      {
        type: "paragraph",
        children:
          "In window one, B is exactly twice A, so the correlation is +1 for these four nonconstant paired rows. In window two, B is exactly minus twice A, so it is −1. These are deliberately simple teaching sequences, not reported EUR/USD or GBP/USD returns. They show how a relationship can depend on the chosen window without pretending four rows provide reliable forecasting evidence.",
      },
      {
        type: "example",
        title: "Cold drinks and ice cream",
        children: [
          "A family in Italy notices that cold-drink and ice-cream sales rise together on warm days. Later, a school changes its drink policy while ice-cream sales stay similar. The earlier connection did not force the later behaviour. A shared weather influence and a separate policy influence can coexist.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For window one, A has mean 0.5 and B has mean 1. Their centred cross-products total 10; their squared-deviation totals are 5 and 20. Thus r = 10/√(5 × 20) = 1. Reversing B changes the numerator sign and gives −1. You do not need to calculate many coefficients by hand, but you should be able to explain why the paired rows, means and denominator matter.",
      },
      {
        type: "paragraph",
        children:
          "When comparing actual nonoverlapping windows, keep the frequency, data source and matching rules the same. Record both results, not only the stronger one. Changes may reflect different economic conditions, a few large observations, sampling variation or data problems. The number alone cannot tell you which explanation is correct.",
      },
    ],
  },
  {
    title: "Read the teaching matrix carefully",
    shortTitle: "Read the teaching matrix carefully",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented correlation matrix of monthly returns",
        columns: ["Hypothetical return pair", "EUR/USD", "GBP/USD", "USD/JPY"],
        rows: [
          ["EUR/USD", "+1.00", "+0.65", "−0.30"],
          ["GBP/USD", "+0.65", "+1.00", "−0.20"],
          ["USD/JPY", "−0.30", "−0.20", "+1.00"],
        ],
      },
      {
        type: "paragraph",
        children:
          "This is the course’s deliberately invented teaching matrix, not current market data and not calculated from the four-row exercise above. Each diagonal is +1 because a varying series matches itself. The matrix is symmetric: EUR/USD versus GBP/USD has the same coefficient as GBP/USD versus EUR/USD. It uses raw quoted-pair monthly returns under one hypothetical common sample.",
      },
      {
        type: "example",
        title: "Two longs share a dollar concern",
        children: [
          "A learner in Germany considers long EUR/USD and long GBP/USD. The +0.65 entry describes positive historical co-movement in this invented sample. Both longs also sell dollar exposure. A dollar-strengthening scenario could harm both, while a UK-specific event could make their outcomes differ. The coefficient gives neither exact cash losses nor a fixed future relationship.",
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-10/changing-relationships.svg",
        desktopSrc:
          "/images/lessons/forex/level-10/changing-relationships-desktop.svg",
        width: 720,
        height: 400,
        alt: "Two currency exposures share a dollar direction; their observed relationship can change between date windows.",
        caption:
          "Look through pair names first, then state the measurement window. Historical co-movement does not guarantee future diversification.",
      },
      {
        type: "paragraph",
        children:
          "Do not multiply one trade’s planned loss by 0.65 to estimate the other’s loss, or call +0.65 a 65% chance of simultaneous gains. Cash results depend on direction, size, entry/exit, account conversion and costs. A matrix assembled from mismatched date windows may also be internally inconsistent; a valid collection of pairwise-looking numbers is not automatically one valid joint portfolio model.",
      },
      {
        type: "paragraph",
        children:
          "Read negative raw-pair coefficients alongside the actual position directions. If one position is short rather than long, its directional exposure changes. A negative coefficient between EUR/USD and USD/JPY does not mean every combination of those trades offsets risk. Long EUR/USD and short USD/JPY both sell USD exposure.",
      },
    ],
  },
  {
    title: "Keep quote inversion and trade direction distinct",
    shortTitle: "Keep quote inversion and trade direction distinct",
    blocks: [
      {
        type: "paragraph",
        children:
          "EUR/USD describes dollars per euro; its inverse describes euros per dollar. A rise in one corresponds to a fall in the other. But the exact arithmetic depends on the return definition. For a simple return r expressed as a decimal, the inverse-rate simple return is −r/(1+r), not exactly −r. At small changes the difference may be modest; at larger changes it matters.",
      },
      {
        type: "example",
        title: "Reverse the holiday exchange quote",
        children: [
          "A British traveller sees an invented rate move from US$1.00 to US$1.10 per pound, a 10% rise. The inverse moves from £1.00 to about £0.9091 per dollar, a fall of about 9.09%, not exactly 10%. The same exchange movement has a different numerical description when the quote is reversed.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Logarithmic returns, defined as the logarithm of ending price divided by starting price, change sign exactly when the rate is inverted. Therefore consistently inverting one log-return series flips its correlation sign, when the coefficient is defined. With simple returns, inversion is nonlinear, so do not promise an exact sign-reversed coefficient for every finite-change sample.",
      },
      {
        type: "paragraph",
        children:
          "Separately, taking a short exposure rather than a long changes the sign of a fixed-size directional price result under consistent conversion assumptions. It does not reverse the quote itself. Financing, differing execution prices and changing conversion rates may keep the actual net account-result series from being a simple negative copy. Label what is being compared before interpreting a coefficient.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A sign change on a screen can be a quotation or position-definition change rather than a new economic relationship. Never compare matrices without checking quote orientation, return method and trade direction.",
        ],
      },
    ],
  },
  {
    title: "Ask what could connect currencies and other assets",
    shortTitle: "Ask what could connect currencies and other assets",
    blocks: [
      {
        type: "paragraph",
        children:
          "Cross-asset analysis compares currencies with such things as bond yields, commodity prices or equity prices. Possible links include expected interest-rate paths, import/export income, financing conditions and broad changes in risk-taking. A plausible explanation is a question to examine, not proof that an asset always controls a currency.",
      },
      {
        type: "example",
        title: "The Australian exporter",
        children: [
          "An Australian business sells a commodity priced internationally and pays many expenses in Australian dollars. Changes in the commodity price and exchange rate both affect its receipts. This gives a reason to study the connection, but production costs, foreign demand, policy news and other influences may change the observed relationship.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A bond yield is not the same variable as a bond price, and a yield change in percentage points is not the same unit as a currency percentage return. Define the variables and timing clearly. Comparing a US yield with USD/JPY without considering Japanese yields, expectations and other events gives only part of the context.",
      },
      {
        type: "comparisonTable",
        caption: "A useful cross-asset question",
        columns: ["Possible connection", "What must stay uncertain"],
        rows: [
          [
            "Currency and relative yields",
            "Expectations, risk premiums and currency movement can dominate",
          ],
          [
            "Currency and commodity prices",
            "Export/import mix, hedge behaviour and other drivers differ",
          ],
          [
            "Currency and equity prices",
            "Domestic and global influences can work in different directions",
          ],
          [
            "Funding currency and risk-taking",
            "Borrowing, hedging and unwinding behaviour can change",
          ],
          [
            "Two currencies and a shared event",
            "Local news can separate them even when a common driver exists",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Do not turn a familiar label such as “risk-on currency” or “safe haven” into a rule that must work during every event. Such descriptions depend on period and context. Record when the idea failed as well as when it appeared to fit; a post-event story can sound convincing without being a rule available beforehand.",
      },
    ],
  },
  {
    title: "Separate a yield difference from the total result",
    shortTitle: "Separate a yield difference from the total result",
    blocks: [
      {
        type: "paragraph",
        children:
          "A yield or interest-rate difference can influence the cost or income associated with holding currency exposure. It does not settle the total home-currency result. The exchange-rate movement, funding expense, conversion, product terms and other charges all matter. A central-bank policy rate is also not automatically the interest rate a customer receives or the financing rate a retail leveraged product applies.",
      },
      {
        type: "example",
        title: "More interest, less home money",
        children: [
          "A learner in Japan imagines an unleveraged foreign asset initially worth ¥100,000 after conversion. It earns 5% in its own currency, but that currency falls 10% against the yen over the same period. Under the stated simple conversion assumptions, the ending yen value is ¥100,000 × 1.05 × 0.90 = ¥94,500: a 5.5% loss before separate conversion charges, taxes or funding.",
        ],
      },
      {
        type: "formula",
        expression:
          "Home-currency value = initial home value × (1 + foreign-asset return) × (1 + foreign-currency return)",
        explanation:
          "Use decimal returns measured consistently over the same interval. This simplified unhedged illustration assumes no external cash flows or separate charges. It is not the formula for every leveraged Forex product.",
      },
      {
        type: "paragraph",
        children:
          "If the position is financed with borrowing, the amount still owed and its interest must be considered separately. A falling foreign asset can compound the currency loss. If a hedge exists, its size, term, execution and cost change the calculation; merely saying “hedged” does not establish a risk-free result.",
      },
      {
        type: "paragraph",
        children:
          "Retail overnight credits or debits depend on the exact contract, provider schedule, direction and dates. They may reflect markups and settlement conventions, and can change. Do not enter two central-bank rates into a worksheet and call their difference the guaranteed daily income on a leveraged account. The next lesson examines carry trades more directly.",
      },
    ],
  },
  {
    title: "Describe a regime without pretending to know it in advance",
    shortTitle: "Describe a regime without pretending to know it in advance",
    blocks: [
      {
        type: "paragraph",
        children:
          "A market regime is a description of conditions over a period, such as relatively quiet movement, a sustained directional trend, a range or unusually large price changes. Different characteristics can overlap: a trend can also be volatile. Labels are useful for organising evidence only when the measurement, observation window and classification rule are clear.",
      },
      {
        type: "example",
        title: "A cloudy morning is not a season",
        children: [
          "A family in South Africa packs a raincoat during a wet season. One cloudy morning in a dry spell does not prove the season changed. Likewise, one large candle does not automatically establish a lasting high-volatility regime.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For an observation exercise, you might define a completed-bar range measure over an explicit lookback, compare it with a previously available reference and state what value counts as elevated under that project. Choose the threshold before examining evaluation outcomes. This is a research definition, not a recommended universal setting. ATR, reviewed in Level 4, measures movement magnitude under specified inputs; it does not predict direction or guarantee a fill.",
      },
      {
        type: "paragraph",
        children:
          "A label based on the next month’s prices was not available at today’s decision. Distinguish a retrospective description from a rule that could classify conditions in real time. Conditions near a boundary may be uncertain, and a delayed measure can change only after the market already moved.",
      },
      {
        type: "paragraph",
        children:
          "A rule that appeared successful in one setting can fail in another. That observation may justify a new hypothesis, but adding regime filters after seeing the losses is development work. Preserve the old result and test the new version on genuinely later or unviewed observations as Level 9 requires.",
      },
    ],
  },
  {
    title: "Watch for relationships changing under stress",
    shortTitle: "Watch for relationships changing under stress",
    blocks: [
      {
        type: "paragraph",
        children:
          "A shared shock can affect several currencies, asset classes and funding markets at once. Participants reducing exposure may sell positions that previously seemed unrelated. A historical coefficient from calm conditions may then give a poor picture of joint risk. Conversely, local events can break a previously strong connection. Neither outcome is inevitable.",
      },
      {
        type: "paragraph",
        children:
          "Changing volatility, spread and execution conditions matter alongside changing co-movement. A plan that assumes independent stop fills at exact prices may underestimate losses when several positions face gaps or poor execution together. A scenario is a stated “what if,” not a predicted probability or guaranteed worst case.",
      },
      {
        type: "example",
        title: "The shared transport disruption",
        children: [
          "A worker in Canada budgets three journeys separately. A snowstorm delays every route and raises all replacement fares. Adding the ordinary fares was correct for the ordinary case; it did not capture the shared disruption. A portfolio worksheet needs both ordinary assumptions and a jointly adverse case.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Compare the same setup in two windows",
        columns: ["Keep fixed", "Record separately"],
        rows: [
          [
            "Series and return definition",
            "Coefficient for each nonoverlapping window",
          ],
          [
            "Provider, price side and clock",
            "Missing rows and exclusions in each window",
          ],
          [
            "Measurement frequency",
            "Number of observations and unusual movements",
          ],
          [
            "Exposure definition",
            "Direction and size of actual hypothetical positions",
          ],
          [
            "Reporting policy",
            "Possible drivers, alternative explanations and uncertainty",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Do not use a chosen stress label as a reason to select only impressive history. Keep all predeclared windows, including weak or contradictory evidence. A sample can suggest a concentration worth investigating without providing enough evidence to estimate its future frequency.",
      },
    ],
  },
  {
    title: "Convert the idea into an account scenario",
    shortTitle: "Convert the idea into an account scenario",
    blocks: [
      {
        type: "paragraph",
        children:
          "List each proposed or open position, direction, size, account currency and exit/fill assumptions. Calculate each cash result under the same scenario, then add amounts expressed in the same account currency. Separate fees and financing consistently. This is more informative for a beginner than treating a correlation coefficient as a fixed loss multiplier.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use supported pairs and explicit long/short, volume, entry, exit, account currency and conversion assumptions. Record each price result, then reconcile charges separately. The tool does not turn a correlation matrix into a portfolio forecast.",
      },
      {
        type: "example",
        title: "Two dollar exposures",
        children: [
          "A learner in the United Kingdom records long EUR/USD and long GBP/USD in a hypothetical USD-account study. Both may lose if the dollar strengthens, but the cash amounts depend on the specific prices and sizes. Add the independently calculated USD scenario results; do not reduce the second result to 65% merely because the teaching matrix contains +0.65.",
        ],
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Review each position’s planned price-risk amount under the stated contract and account conversion. Then check combined currency directions, existing/pending exposure, costs and adverse fills in a separate worksheet.",
      },
      {
        type: "paragraph",
        children:
          "Opposite-looking positions also need arithmetic. Long EUR/USD and short GBP/USD may partly offset a broad dollar movement at particular sizes, but they retain euro-versus-pound exposure and product/cost risk. Calling them a hedge does not prove exact offset under every exchange movement. A historical coefficient cannot replace the contract and scenario details.",
      },
      {
        type: "paragraph",
        children:
          "If the combined scenario conflicts with your written practice policy, revise the hypothetical plan or record no action. Do not invent a lower correlation to make the worksheet pass. Keep essential household money outside trading experiments; a well-labelled worksheet still cannot cap a live leveraged loss.",
      },
    ],
  },
  {
    title: "Practise explaining the evidence",
    shortTitle: "Practise explaining the evidence",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Write the currency directions in simultaneous long EUR/USD and long GBP/USD. What does +0.65 in the teaching matrix establish?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Both sell USD exposure while buying different currencies. +0.65 describes linear association in the invented monthly-return sample, not a probability, a cause or an exact future cash-loss multiplier.",
      },
      {
        type: "exercise",
        prompt:
          "The rate for a currency rises 10%. Is the simple return of the inverse rate exactly −10%?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. The inverse simple return is −0.10/1.10, about −9.09%. Logarithmic-return inversion changes sign exactly; always state the method.",
      },
      {
        type: "exercise",
        prompt:
          "One return series never changes across the matched rows. Should its Pearson correlation be reported as zero?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. With zero variation the normalising denominator is zero, so the coefficient is undefined. Keep that limitation instead of inventing a measurement.",
      },
      {
        type: "exercise",
        prompt:
          "An unhedged asset worth ¥100,000 earns 5% abroad while the foreign currency falls 10% against the yen. Compute the ending home value before separate charges.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "¥94,500: 100,000 × 1.05 × 0.90. More foreign interest did not prevent a home-currency loss; borrowing or other charges would need additional entries.",
      },
      {
        type: "exercise",
        prompt:
          "A learner labels losing historical days “high volatility” after seeing their outcomes and removes them. Is that an untouched evaluation of the original rule?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. The new selection uses outcome information. Preserve the full original result, define a new version and evaluate it fairly on genuinely unviewed or later observations.",
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
          "Identify shared currency directions and interpret a dated correlation matrix without treating it as a forecast.",
          "Distinguish return orientation, cross-asset context, yield and changing conditions.",
          "Construct a consistent joint cash scenario rather than using a coefficient as a risk discount.",
        ],
        closing: [
          "Keep the exposure inventory, dated inputs, scenario assumptions and complete review record. Explain the limits of a market measurement and the valid choice to take no action.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices, balances, periods, thresholds and results are invented teaching data, not trade recommendations or universal safe limits. Historical simulation, demo results and clear rules cannot guarantee profit, exact fills or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential money outside trading experiments. A quiz pass does not certify live-trading readiness.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can name the product, units, source, observation window and information cutoff.",
          "I can separate observation, assumed execution and actual platform outcomes.",
          "I can repeat the calculation with its units, costs and denominator.",
          "I can keep shared exposure, uncertainty, costs and adverse outcomes visible.",
          "I can explain an evidence limitation and a valid no-action or further-study decision.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title:
              "Royal Society — Karl Pearson, regression and correlation (1896)",
            url: "https://doi.org/10.1098/rsta.1896.0007",
          },
          {
            title: "NIST — Correlation coefficient",
            url: "https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/correlat.htm",
          },
          {
            title:
              "BIS — The global foreign exchange market in a higher-volatility environment",
            url: "https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment",
          },
          {
            title: "CFTC — Eight Things You Should Know Before Trading Forex",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
        ],
      },
    ],
  },
];
