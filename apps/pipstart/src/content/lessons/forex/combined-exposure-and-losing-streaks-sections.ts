import type { LessonSection } from "../../lesson-content";

export const combinedExposureAndLosingStreaksSections: LessonSection[] = [
  {
    title: "Look at the account, not only the ticket",
    shortTitle: "Look at the account, not only the ticket",
    blocks: [
      {
        type: "paragraph",
        children:
          "Three small positions can create one large shared risk. Your per-idea budget is only the starting point: add the risks of ideas open together, pending orders that could activate together and costs that may accumulate across the account. Think in scenarios. Which event could hurt several positions at once, and what would happen if their intended exits filled worse than planned?",
      },
      {
        type: "example",
        title: "Two umbrellas in the same wind",
        children: [
          "A learner in South Korea buys two umbrellas from different shops. Different labels do not guarantee that one will survive the same strong wind that damages the other. Currency-pair names can be different while the positions still share a currency, news event, provider or execution problem.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This lesson connects currency exposure, correlation, daily and weekly rules, losing streaks and the possibility of becoming unable to continue. It finishes with a usable demo policy. Its numbers are teaching assumptions, not suggested live limits. A policy is useful even when its conclusion is to pause learning trades or never use real money.",
      },
    ],
  },
  {
    title: "Write the direction of both currency legs",
    shortTitle: "Write the direction of both currency legs",
    blocks: [
      {
        type: "paragraph",
        children:
          "A conventional long EUR/USD position has exposure to euro strength against the dollar: describe it as long EUR and short USD. A short EUR/USD reverses those directions. Use this directional inventory before relying on a correlation table. It helps reveal overlap without pretending the two legs are separate cash accounts or that every derivative involves a physical exchange.",
      },
      {
        type: "comparisonTable",
        caption: "Directional inventory under conventional pair notation",
        columns: [
          "Position",
          "Long currency exposure",
          "Short currency exposure",
          "Possible shared adverse driver",
        ],
        rows: [
          ["Long EUR/USD", "EUR", "USD", "USD strengthens against EUR"],
          ["Long GBP/USD", "GBP", "USD", "USD strengthens against GBP"],
          ["Long AUD/USD", "AUD", "USD", "USD strengthens against AUD"],
          ["Short USD/JPY", "JPY", "USD", "USD strengthens against JPY"],
          ["Short EUR/USD", "USD", "EUR", "EUR strengthens against USD"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A long EUR/USD and a short USD/JPY both have short-USD directional exposure, even though “long” and “short” appear on different tickets. A long EUR/USD and a short EUR/USD may offset some price exposure under particular sizes and account rules, but spread, financing, provider margin rules and closing order remain. A netting account may combine them instead of retaining two positions.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-5/shared-dollar-exposure.svg",
        desktopSrc:
          "/images/lessons/forex/level-5/shared-dollar-exposure-desktop.svg",
        width: 720,
        height: 400,
        alt: "Long EUR/USD, long GBP/USD and short USD/JPY each include short US-dollar directional exposure.",
        caption:
          "Different pair names and different buy/sell labels can still share the same currency direction. This inventory does not predict a common move.",
      },
    ],
  },
  {
    title: "Add planned cash risk and stress it",
    shortTitle: "Add planned cash risk and stress it",
    blocks: [
      {
        type: "paragraph",
        children:
          "Put risks into one account currency before summing. If two ideas each have US$10 planned stop losses, their combined planned loss is US$20 if both fail under those assumptions. The sum is not a worst possible account loss. It omits any charges you have not included, changes in conversion and exits that miss the intended price. Even apparently unrelated pairs can lose together.",
      },
      {
        type: "example",
        title: "The same dollar event reaches two tickets",
        children: [
          "A South Korean learner’s simulated long EUR/USD and long GBP/USD positions each plan to lose US$10. A broad dollar-strengthening event could hurt both, though their exact moves need not match. The learner records US$20 of combined planned loss before costs and a second scenario with worse fills.",
          "Suppose the rounded positions each expose US$0.50 per pip. If each exit is ten pips worse than its planned stop, that adds US$5 each. The scenario is now US$30 before other charges. Ten pips is an invented stress input, not a guaranteed worst gap.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Also identify concentration in a single dealer, platform, connection, holding window or news event. A correlation matrix covers price relationships in its sample; it does not measure every common failure. A total cap, a shared-currency cap and a rule for pending orders address different parts of the problem. Record gross and net exposure so offsetting tickets do not hide large commitments.",
      },
    ],
  },
  {
    title: "Understand what correlation measures",
    shortTitle: "Understand what correlation measures",
    blocks: [
      {
        type: "paragraph",
        children:
          "Pearson correlation summarises the direction and strength of a linear relationship between two data series over a stated sample. It lies from −1 to +1 when both series have nonzero variation. Positive means above-average observations in one tend to align with above-average observations in the other; negative means they tend to align with below-average observations. Perfect ±1 describes an exact straight-line relationship in the sample, not equal cash gains or a permanent law.",
      },
      {
        type: "paragraph",
        children:
          "For market comparisons, use aligned returns or price changes with a clearly defined timeframe and window. Correlation between raw trending price levels can be misleading. Check timestamps, missing observations, holiday effects, data source and whether both series represent the same time intervals. A 20-observation daily calculation and a 200-observation hourly calculation answer different sample questions.",
      },
      {
        type: "formula",
        expression:
          "r = sum of paired deviations multiplied together ÷ square root of (sum of first-series squared deviations × sum of second-series squared deviations)",
        explanation:
          "A deviation is an observation minus its sample mean. Both series must vary; otherwise the denominator is zero. You may use software, but record the inputs.",
      },
      {
        type: "example",
        title: "Ice cream sales and temperature",
        children: [
          "A shop in Italy notices that warmer days often coincide with more ice cream sold. That is a relationship in those observations, not proof that temperature is the only cause. In currencies, a shared driver can create a relationship too, but that relationship does not determine the next trade.",
        ],
      },
    ],
  },
  {
    title: "Read a matrix without treating it as a forecast",
    shortTitle: "Read a matrix without treating it as a forecast",
    blocks: [
      {
        type: "paragraph",
        children:
          "A matrix shows many pairwise coefficients at once. Read the row for one pair and the column for another. The diagonal is +1 because each varying series is compared with itself; the table is symmetric. These are mathematical properties, not evidence of a profitable rule. The native table below uses seven synthetic log-change series created from eight invented observations only to practise reading; it contains no live or historical market measurements.",
      },
      {
        type: "comparisonTable",
        caption:
          "Illustrative seven-pair correlation matrix — synthetic teaching returns",
        columns: [
          "Pair",
          "EUR/USD",
          "GBP/USD",
          "AUD/USD",
          "USD/CAD",
          "USD/JPY",
          "EUR/GBP",
          "EUR/JPY",
        ],
        rows: [
          [
            "EUR/USD",
            "+1.00",
            "+0.89",
            "+0.80",
            "-0.77",
            "+0.90",
            "+0.45",
            "+0.97",
          ],
          [
            "GBP/USD",
            "+0.89",
            "+1.00",
            "+0.78",
            "-0.79",
            "+0.84",
            "+0.00",
            "+0.89",
          ],
          [
            "AUD/USD",
            "+0.80",
            "+0.78",
            "+1.00",
            "-0.77",
            "+0.90",
            "+0.22",
            "+0.87",
          ],
          [
            "USD/CAD",
            "-0.77",
            "-0.79",
            "-0.77",
            "+1.00",
            "-0.84",
            "-0.14",
            "-0.83",
          ],
          [
            "USD/JPY",
            "+0.90",
            "+0.84",
            "+0.90",
            "-0.84",
            "+1.00",
            "+0.34",
            "+0.97",
          ],
          [
            "EUR/GBP",
            "+0.45",
            "+0.00",
            "+0.22",
            "-0.14",
            "+0.34",
            "+1.00",
            "+0.40",
          ],
          [
            "EUR/JPY",
            "+0.97",
            "+0.89",
            "+0.87",
            "-0.83",
            "+0.97",
            "+0.40",
            "+1.00",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "For reproducibility, these are the input currency-versus-USD log changes in arbitrary scaled teaching units, not current percentages or market records. USD against itself is zero. Derive USD/CAD as minus CAD/USD, USD/JPY as minus JPY/USD, EUR/GBP as EUR/USD minus GBP/USD, and EUR/JPY as EUR/USD minus JPY/USD. Then use the coefficient formula above; round only the displayed result.",
      },
      {
        type: "comparisonTable",
        caption:
          "Synthetic inputs for the matrix — arbitrary scaled log-change units",
        columns: [
          "Observation",
          "EUR/USD",
          "GBP/USD",
          "AUD/USD",
          "CAD/USD",
          "JPY/USD",
        ],
        rows: [
          ["1", "2", "2", "1", "1", "-1"],
          ["2", "1", "2", "2", "1", "-2"],
          ["3", "-1", "-1", "-2", "-2", "2"],
          ["4", "-2", "-2", "-1", "-1", "1"],
          ["5", "1", "0", "2", "0", "-1"],
          ["6", "-1", "-1", "-2", "-1", "1"],
          ["7", "2", "1", "1", "2", "-2"],
          ["8", "-2", "-1", "-1", "0", "2"],
        ],
      },
      {
        type: "paragraph",
        children:
          "For this practice matrix, a number closer to +1 indicates a stronger positive linear relationship in the invented sample, and a number closer to −1 indicates a stronger negative one. There is no universal coefficient cutoff that guarantees useful diversification. A number near zero means little measured linear relationship in that sample; it does not prove independence, no relationship of another kind or safety during a common shock.",
      },
      {
        type: "paragraph",
        children:
          "Position direction changes the interpretation. A pair-return coefficient describes the two quoted return series, not the cash P&L of any possible combination of long/short positions. If one return series is multiplied by −1 to model opposite direction under a simple constant-exposure assumption, the sign of its correlation changes. Different sizes, account conversions, nonlinear products and costs need further analysis.",
      },
      {
        type: "example",
        title: "A number and a position are different",
        children: [
          "Imagine the matrix reports a negative relationship between EUR/USD and USD/JPY. Buying EUR/USD while selling USD/JPY does not automatically diversify dollar direction: both positions include short USD. Use the currency inventory and cash scenario alongside the coefficient.",
        ],
      },
    ],
  },
  {
    title: "Recheck relationships when conditions change",
    shortTitle: "Recheck relationships when conditions change",
    blocks: [
      {
        type: "paragraph",
        children:
          "A correlation estimate belongs to its sample window. Central-bank news, changing interest-rate expectations, risk sentiment and currency-specific events can alter relationships. Moving the window changes which observations are included. Stress periods may cause losses to cluster even when an earlier average relationship looked weak. Do not copy a coefficient once and keep it as a permanent fact.",
      },
      {
        type: "paragraph",
        children:
          "A small sample can create a striking coefficient by chance. Looking through many windows until one supports the desired position introduces selection bias. Record the window before testing the claim, compare another time period and state how uncertain the estimate is. Correlation does not prove which series causes the other, does not create an entry signal and does not establish the chance of both stops being hit.",
      },
      {
        type: "example",
        title: "A delivery route changes",
        children: [
          "Two shops in Canada might experience similar delays while their stock arrives on the same road. If one changes supplier, the old relationship can weaken. The practical lesson is to check shared causes and changed conditions, rather than assuming yesterday’s relationship must hold tomorrow.",
        ],
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Never treat two different symbols or a near-zero correlation as permission to double total risk. Use both a conservative cash-risk inventory and explicit adverse scenarios; neither should depend on a coefficient remaining unchanged.",
        ],
      },
    ],
  },
  {
    title: "Set daily and weekly rules before the session",
    shortTitle: "Set daily and weekly rules before the session",
    blocks: [
      {
        type: "paragraph",
        children:
          "A loss-limit policy controls your own actions. It can require no new orders after a defined loss amount, an agreed number of errors, a weekly threshold or a process failure. It cannot instruct the market to stop losing at that amount. Define the day’s timezone, when the week starts, whether the measure is gross realised losses or net P&L, how open exposure is counted and what happens to positions and pending orders at the trigger.",
      },
      {
        type: "comparisonTable",
        caption: "A demo policy template — fill in your own definitions",
        columns: ["Field", "Question to settle before practice"],
        rows: [
          ["Per idea", "What cash budget and account reference apply?"],
          [
            "All open/pending ideas",
            "What aggregate and shared-currency gates apply?",
          ],
          ["Day/week", "What amount, timezone and reset rule apply?"],
          [
            "Open positions at a trigger",
            "What predefined exit/cancel procedure applies?",
          ],
          ["Process failure", "What requires an immediate pause?"],
          ["Restart", "What review and conditions are required?"],
        ],
      },
      {
        type: "example",
        title: "A worked gate, not a live recommendation",
        children: [
          "Use an invented conservative daily gate of US$30 in a demo notebook. Closed losing trades have consumed US$20, an existing idea has US$8 planned total entry-to-stop loss, and a new idea would add US$10. Under this explicitly conservative gate, 20 + 8 + 10 = US$38, so no new idea is allowed.",
          "This gate sums gross closed losses and full planned losses on still-open ideas; it is a decision rule, not a mark-to-market account-value equation. Do not count an open loss twice under a different net-equity convention. If a weekly gate is already reached, a fresh day does not erase it.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Define whether profitable trades restore room. A policy can choose not to let profits increase the day’s allowed risk. Do not redefine the rule during an emotional session or move the boundary to a new timezone to make a loss disappear. Resetting a personal counter does not repair account drawdown.",
      },
    ],
  },
  {
    title: "Compare fixed-cash and fixed-fraction losses",
    shortTitle: "Compare fixed-cash and fixed-fraction losses",
    blocks: [
      {
        type: "paragraph",
        children:
          "A fixed-cash method uses the same planned cash loss each time; as equity falls, that cash amount becomes a larger percentage of what remains. A fixed-fraction method recalculates a chosen fraction of current equity for each idea. Under ideal exact fills, its cash size shrinks after losses. Minimum volume, steps, charges and conversion can prevent the neat percentage from being achievable.",
      },
      {
        type: "formula",
        expression:
          "After n ideal full-loss trades: remaining equity = starting equity × (1 − fraction)^n",
        explanation:
          "Assumes the fraction is recomputed each time, exact losses, no extra charges, no deposits/withdrawals and no overlapping trades. This is sequence arithmetic, not a probability model.",
      },
      {
        type: "comparisonTable",
        caption: "Six ideal consecutive losses from US$1,000",
        columns: ["Method", "Remaining equity", "Drawdown after six"],
        rows: [
          ["US$10 fixed cash", "US$940.00", "6.00%"],
          ["1% of remaining equity", "US$941.48", "5.85%"],
          ["5% of remaining equity", "US$735.09", "26.49%"],
          ["10% of remaining equity", "US$531.44", "46.86%"],
          ["20% of remaining equity", "US$262.14", "73.79%"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The table holds the loss sequence fixed and varies the sizing rule. It does not estimate how often six losses occur or prove that the smallest fraction is suitable. Fixed-fraction ideal mathematics may never hit zero in a finite number of losses, yet a real account can become unable to place its minimum order or meet its margin requirement much earlier.",
      },
    ],
  },
  {
    title: "A losing streak does not make a win due",
    shortTitle: "A losing streak does not make a win due",
    blocks: [
      {
        type: "paragraph",
        children:
          "Several losses can occur even under an assumed model with a favourable average outcome. The next trade does not owe repayment. Believing a win becomes inevitable because losses already happened is the gambler’s fallacy. In an independent model with constant probabilities, the chance of the next outcome does not change because of the previous sequence. Real trades may also be dependent, so the simple model needs evidence rather than faith.",
      },
      {
        type: "example",
        title: "Six losses in a specified toy block",
        children: [
          "Suppose purely for a probability exercise that each of six independent trades has a 55% loss probability and that probability never changes. The chance that this particular six-trade block is all losses is 0.55^6, about 2.77%.",
          "That is not the chance of seeing a six-loss run somewhere in a long trading history. More blocks create more opportunities, and overlapping blocks are not independent. It is also not a probability supplied by a chart pattern or a small demo record.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Journal the sequence, costs, rule adherence and market conditions. A streak may reflect ordinary variation, a changed environment, a flawed rule or implementation errors; the sequence alone cannot choose among them. A pause lets you investigate. It is more useful than taking an extra position just to force the day’s outcome back to zero.",
      },
    ],
  },
  {
    title: "See why doubling after losses can fail",
    shortTitle: "See why doubling after losses can fail",
    blocks: [
      {
        type: "paragraph",
        children:
          "A doubling plan, often called a martingale-style plan, increases the next cash risk after a loss to try to recover earlier losses with one later win. That argument assumes unlimited funds, allowed size, sufficient margin, predictable payouts and no damaging costs or gaps. Real accounts have limits. The next required stake can become unaffordable long before a hoped-for win.",
      },
      {
        type: "comparisonTable",
        caption: "Invented doubling risks starting at US$10",
        columns: ["Loss number", "Risk on this trade", "Total lost after it"],
        rows: [
          ["1", "US$10", "US$10"],
          ["2", "US$20", "US$30"],
          ["3", "US$40", "US$70"],
          ["4", "US$80", "US$150"],
          ["5", "US$160", "US$310"],
          ["6", "US$320", "US$630"],
        ],
      },
      {
        type: "example",
        title: "A budget cannot double forever",
        children: [
          "After those six losses, a US$1,000 teaching account has US$370 before charges. The next proposed risk is US$640, already more than remains. A household in Japan would face the same budget problem if it repeatedly doubled uncertain purchases after each failure. The arithmetic is not rescued by calling the next attempt “certain.”",
        ],
      },
      {
        type: "paragraph",
        children:
          "Adding to a losing position, moving its stop or opening another highly overlapping ticket can create a similar escalation even without exact doubling. Recalculate the whole idea and all open exposure. A risk policy should specify what changes are permitted and what requires stopping; an emotional recovery aim is not a replacement for that rule.",
      },
    ],
  },
  {
    title: "Define practical ruin and model assumptions",
    shortTitle: "Define practical ruin and model assumptions",
    blocks: [
      {
        type: "paragraph",
        children:
          "Ruin means reaching a condition where the activity cannot continue under the stated constraints. It might mean zero or negative equity, inability to meet minimum size or margin, a personal hard-stop drawdown or losing money that should never have been committed. State the threshold. Different definitions can produce different probabilities, so a percentage labelled “risk of ruin” is incomplete without its model.",
      },
      {
        type: "paragraph",
        children:
          "A meaningful model needs initial equity; size rules; a ruin threshold; outcome probabilities and sizes; costs; a time horizon; dependencies between outcomes; and treatment of gaps, conversion and funding. A win rate alone cannot provide all that. The same 45% win rate can describe tiny wins and large losses or large wins and small losses, with very different implications.",
      },
      {
        type: "example",
        title: "Same win rate, different average outcome",
        children: [
          "In an invented 45%-win model, US$20 wins and US$10 losses give 0.45 × 20 − 0.55 × 10 = US$3.50 before costs. With US$5 wins and US$10 losses, the same win rate gives −US$3.25. These are model averages, not forecasts or probabilities of ruin.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This foundations lesson deliberately does not present an invented ruin-probability table from a win rate alone. The consecutive-loss table above is transparent arithmetic with stated assumptions. Lower size can reduce the damage of a specified loss sequence, but it does not guarantee survival, remove a negative average outcome or protect against every gap. A useful beginner decision is to remain in demo whenever the model, product or personal budget is unclear.",
      },
    ],
  },
  {
    title: "Write a personal demo risk policy",
    shortTitle: "Write a personal demo risk policy",
    blocks: [
      {
        type: "paragraph",
        children:
          "Turn the ideas into a short document you can read before practice. Protect essential money; name the account currency and reference; list allowed demo instruments and contract assumptions; define per-idea risk, aggregate risk, shared-currency gates, daily/weekly rules, event/overnight handling and a process for stops and pending orders. Describe what you will record when the planned and actual results differ.",
      },
      {
        type: "comparisonTable",
        caption:
          "An example policy structure — numbers intentionally left blank",
        columns: ["Policy line", "What to write"],
        rows: [
          [
            "Protected funds",
            "Rent, food, healthcare, education, emergency savings and debt payments remain outside trading",
          ],
          [
            "Sizing",
            "Budget reference; cash limit; permitted step; costs; conversion; zero-size condition",
          ],
          [
            "Portfolio",
            "All open/pending ideas; common currency directions; stress scenarios",
          ],
          [
            "Session",
            "Timezone; daily/weekly gate; predefined trigger actions",
          ],
          [
            "Behaviour",
            "No unplanned doubling, stop widening or rule change to erase a loss",
          ],
          [
            "Learning record",
            "Prices, actual fills, charges, margin snapshots, drawdown and reasons",
          ],
          [
            "Review/restart",
            "Scheduled review and evidence required before resuming demo",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Use a change log. A policy revision should follow review of the records, not occur while trying to keep a losing position open. A missed stop, misunderstood unit, unexplained margin figure, unreliable connection or urge to recover urgently can be a process trigger to pause. Account for open exposure and cancel unwanted pending orders using your predefined procedure; simply closing the notebook does not close positions.",
      },
      {
        type: "learningLink",
        title: "Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Use starting 1,000 and the six-loss 1% example’s decline of about 5.852%. Compare roughly 941.48 remaining and about 6.22% needed to recover. It checks the decline/recovery arithmetic, not the chance of that sequence.",
      },
      {
        type: "paragraph",
        children:
          "For review, distinguish decisions you can control—whether to enter, intended size, rules and record keeping—from outcomes you cannot guarantee—price movement, fill quality or future relationships. Level 6 will build on this foundation by describing price-action rules; those rules still need the risk boundaries established here.",
      },
    ],
  },
  {
    title: "Practise an account-wide decision",
    shortTitle: "Practise an account-wide decision",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A demo portfolio is long EUR/USD and short USD/JPY. Which currency direction is shared? If each idea has US$10 planned loss, what is the combined planned amount?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Both include short-USD directional exposure. The combined planned amount is US$20 under the stated stop assumptions; costs, conversion and worse simultaneous fills can increase it. Different buy/sell labels do not prove diversification.",
      },
      {
        type: "exercise",
        prompt:
          "Does a sample correlation of zero prove independence or that the positions cannot lose together?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. It describes no measured linear relationship in that sample, not every possible relationship or shared event. Record the return definition, window and directions, and test cash scenarios separately.",
      },
      {
        type: "exercise",
        prompt:
          "Starting with US$1,000, six ideal losses of 1% of remaining equity occur. Estimate what remains. Is the next win guaranteed?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "1,000 × 0.99^6 = about US$941.48 before costs. The next win is not guaranteed or owed. This is sequence arithmetic; a probability statement requires a separate model.",
      },
      {
        type: "exercise",
        prompt:
          "Your policy uses a US$30 gross-loss daily gate and a US$60 weekly gate. Today is a new day but the weekly threshold is reached. May the daily reset override it?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No, under this policy both gates must be satisfied. The weekly rule still blocks new activity. Define trigger handling for existing exposure and review before resuming; resetting a counter cannot reverse a loss.",
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
          "Inventory shared currency directions and total planned cash loss.",
          "Interpret sample correlation, loss-limit rules and losing-streak arithmetic.",
          "Write a personal demo policy and explain why ruin probabilities require stated assumptions.",
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
            title: "NIST — Correlation coefficient",
            url: "https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/correlat.htm",
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
