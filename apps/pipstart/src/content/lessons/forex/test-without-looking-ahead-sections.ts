import type { LessonSection } from "../../lesson-content";

export const testWithoutLookingAheadSections: LessonSection[] = [
  {
    title: "Know what each kind of test can tell you",
    shortTitle: "Know what each kind of test can tell you",
    blocks: [
      {
        type: "paragraph",
        children:
          "A backtest applies stated rules to historical observations with a declared execution and cost model. It can reveal unclear instructions, arithmetic mistakes and how a rule would be classified under those assumptions. It is not a record of orders actually filled unless the data really come from those orders. A chart-only simulation cannot manufacture missing bid/ask, liquidity or sequence evidence.",
      },
      {
        type: "paragraph",
        children:
          "Forward testing records a frozen rule on observations that arrive after the rule is dated. A demo platform can add order-status and fill records, but demo fills and emotions can differ from live conditions. Live trading is not required for this beginner exercise. Keep historical simulation, forward observation and demo rehearsal clearly labelled.",
      },
      {
        type: "example",
        title: "The forecast is written before the rain",
        children: [
          "A family in the United Kingdom writes a weather expectation before tomorrow arrives, then records what happened. Editing the expectation after the rain would make it look perfect. A testing notebook needs the same separation between decisions made earlier and outcomes seen later.",
        ],
      },
      {
        type: "paragraph",
        children:
          "The purpose is to build evidence with limits, not to make a beautiful chart prove a future income. A valid test can reveal that the rule is unsuitable, too costly, difficult to execute or still uncertain. Those are useful findings rather than failures to be hidden.",
      },
    ],
  },
  {
    title: "Understand why polished historical results can mislead",
    shortTitle: "Understand why polished historical results can mislead",
    blocks: [
      {
        type: "paragraph",
        children:
          "Systematic testing has developed through many methods and contributors; it has no single universal founder. Research on backtest overfitting, including work by David Bailey, Jonathan Borwein, Marcos López de Prado and Qiji Jim Zhu, examines how selecting strategies from many trials can make historical success misleading. You do not need the paper’s advanced mathematics to understand the beginner problem: searching more possibilities can produce a flattering winner by chance.",
      },
      {
        type: "example",
        title: "The best quiz score out of many attempts",
        children: [
          "An Australian student tries many different answer sheets, then shows only the one with the highest score. That score hides the number of attempts. A researcher who tries many settings and displays only the best equity curve also needs to disclose the search.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Regulators such as NFA highlight limitations of hypothetical performance, including hindsight, missing liquidity effects and the absence of actual financial risk. These references explain why a simulated record must be labelled and its assumptions shown. They do not establish that one disclaimer or one reserved sample makes a method safe or profitable.",
      },
      {
        type: "paragraph",
        children:
          "Keep a development log of tried rules, filters, costs and samples. The selected version may be clearly written and still have been chosen using favourable noise. Avoid calling a tuned backtest a prediction. Later evidence should be reported separately with the same honesty about limitations.",
      },
    ],
  },
  {
    title: "Divide time into development, evaluation and forward observation",
    shortTitle:
      "Divide time into development, evaluation and forward observation",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A fictional chronological study plan",
        columns: ["Stage", "Example period", "What is allowed"],
        rows: [
          [
            "Development",
            "January–June of an unspecified teaching year",
            "Clarify rules and test chosen settings; keep all trials",
          ],
          [
            "Reserved evaluation",
            "July–September of that same teaching year",
            "Apply the frozen version once under predeclared assumptions",
          ],
          [
            "New forward observations",
            "After the version/evaluation plan is dated",
            "Record incoming cases without silently changing the rule",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "In the USD/JPY teaching example, a US-based student uses January–June to develop a rule and keeps July–September unseen. Freeze the rule, costs, measurements and exclusions before opening the later period. A later sample is reserved information; it is not necessarily statistically independent of the earlier market conditions.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-9/test-timeline.svg",
        desktopSrc: "/images/lessons/forex/level-9/test-timeline-desktop.svg",
        width: 720,
        height: 400,
        alt: "A chronology separates January–June development, July–September reserved evaluation and later forward observation.",
        caption:
          "These are fictional study periods. Viewing the evaluation data while tuning the rule turns those data into development information.",
      },
      {
        type: "paragraph",
        children:
          "Decide how many observations are reserved and why before looking at their outcomes. Ensure required indicator warm-up uses only earlier data. If an outcome needs later bars, avoid using a development case whose label reaches into the reserved period to choose the rule without accounting for that overlap. State the boundary and handling of positions still open there.",
      },
      {
        type: "paragraph",
        children:
          "Repeatedly retesting a changed rule on the same “unseen” dates does not keep them unseen. If July caused a revision, July influenced development. Date a new version and reserve genuinely later or unviewed observations. Keep the old evaluation result even when it is disappointing.",
      },
    ],
  },
  {
    title: "Use only information available at the decision time",
    shortTitle: "Use only information available at the decision time",
    blocks: [
      {
        type: "paragraph",
        children:
          "At each simulated decision, ask when every input became available. A daily-close condition cannot justify entry at the same day’s morning price. A swing requiring later bars cannot be treated as confirmed earlier. Revised economic data cannot replace the initially published figure in a rule that depended on what was known at release.",
      },
      {
        type: "example",
        title: "The final exam mark arrives later",
        children: [
          "A student in India cannot use their final exam score to explain what they knew while preparing the previous week. A later chart close or revised report similarly belongs to a later information set.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Information and availability",
        columns: ["Input", "When it can be used"],
        rows: [
          [
            "Completed D6 daily close",
            "After D6 completes under the named session clock",
          ],
          [
            "Next recorded bid/ask snapshot",
            "At its later timestamp, subject to data quality",
          ],
          ["One-bar-each-side swing", "After the required later bar completes"],
          [
            "First official release estimate",
            "After publication/retrieval; retain its vintage",
          ],
          [
            "Later revision or final outcome",
            "Only after its own availability time",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Store both the chart/event timestamp and the availability timestamp when they differ. Indicators that revise prior marks require particular care. A final historical marker can be useful for description without being a usable earlier entry signal. Missing availability information makes a claimed decision unresolved, not automatically valid.",
      },
      {
        type: "paragraph",
        children:
          "Do not let whole-sample calculations leak into earlier decisions. A threshold chosen from all later volatility, a future maximum used to scale earlier values or selecting the best pair after viewing the evaluation period uses information the earlier rule did not possess. Document how each reference is formed from permitted inputs.",
      },
    ],
  },
  {
    title: "Audit the historical data before scoring a rule",
    shortTitle: "Audit the historical data before scoring a rule",
    blocks: [
      {
        type: "paragraph",
        children:
          "Identify the product, provider, quote side, timeframe, timezone, date range and file version. Check missing or duplicated timestamps, stale quotes, abnormal values, session gaps and changes in definitions. Save the original input and a dated cleaning log. Deleting inconvenient observations after seeing their losses creates another selection problem.",
      },
      {
        type: "example",
        title: "The missing receipt stays visible",
        children: [
          "A shop in Brazil cannot call its monthly accounts complete by deleting the day with a missing receipt. It needs to investigate or mark the gap. A historical study also needs a defined response to missing data rather than quietly replacing them with a favourable price.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Data audit",
        columns: ["Issue", "Predeclared handling question"],
        rows: [
          [
            "Bid-only bars",
            "Can the rule be observed but executable results remain unresolved?",
          ],
          [
            "Missing ask or quote snapshot",
            "Skip, label unresolved or use a disclosed model chosen before results?",
          ],
          [
            "Duplicate/missing timestamp",
            "Which source correction or exclusion rule applies?",
          ],
          [
            "Uncompleted/incorrect session bar",
            "What is the correct cutoff and aggregation?",
          ],
          [
            "Spikes or corrections",
            "What evidence justifies a dated correction?",
          ],
          [
            "Historical releases",
            "Are original vintages and timestamps available?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "If only midpoint bars exist, a separate spread model may create a hypothetical executable-price series, but it does not create historical observed spreads. Label that model and show sensitivity to wider costs. Avoid treating daily high/low as an order book or a guarantee that a given quantity could trade.",
      },
      {
        type: "paragraph",
        children:
          "A longer file is not automatically a better file. Quality, relevance and consistent definitions matter. A large dataset with future information or incorrect quote sides can produce a precise-looking but misleading score. Resolve input limitations before presenting performance as if execution were known.",
      },
    ],
  },
  {
    title: "Replay the rule one cutoff at a time",
    shortTitle: "Replay the rule one cutoff at a time",
    blocks: [
      {
        type: "paragraph",
        children:
          "A manual replay hides later observations until the rule comparison is recorded. For each eligible date, save the prior reference, completed trigger, next permitted quote, gates and decision. Then reveal the observations needed to classify the outcome. The sequence is more important than how quickly you complete the exercise.",
      },
      {
        type: "example",
        title: "The Canadian reader uses the same dates",
        children: [
          "A Canadian learner applies the EUR/CAD five-prior-high rule from the previous lesson. They write the reference and eligibility before moving to the next bar. A second reader compares the same cutoffs. Different classifications reveal definitions to fix before the results are scored.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For an automated test, the same requirements become explicit data indexing and decision timestamps. A script can repeat an incorrect assumption faster than a person, so compare a few worked cases with the manual record. Use cases involving equality, missing data, gaps and rejected gates, not only an easy winning example.",
      },
      {
        type: "paragraph",
        children:
          "Keep the original rule version, all decisions and corrections. If a previously ambiguous definition is clarified using a viewed outcome, report the change as development work. Do not quietly alter old decisions and describe the entire record as though the clarified rule existed from the beginning.",
      },
    ],
  },
  {
    title: "State the fill model and its limitations",
    shortTitle: "State the fill model and its limitations",
    blocks: [
      {
        type: "paragraph",
        children:
          "A simulation needs instructions about what counts as an entry or exit fill. Name the order type, quote side, allowed price/time, size and handling of missing liquidity or sequence. “Enter at the signal close” may be impossible when the completed close is known only after that price has passed. A next-quote assumption is more explicit but still an assumption.",
      },
      {
        type: "comparisonTable",
        caption: "Execution cases that need a policy",
        columns: ["Case", "What cannot be assumed silently"],
        rows: [
          ["Market entry", "Observed ask/bid is not a guaranteed final fill"],
          [
            "Limit touch",
            "A touched chart price does not prove fill or queue availability",
          ],
          ["Stop gap", "Fill need not equal the trigger level"],
          ["Stop-limit beyond limit", "The position can remain open"],
          [
            "Partial/rejected order",
            "Accepted size/state may differ from the intended worksheet",
          ],
          [
            "No quote/size data",
            "A hypothetical fill needs a disclosed model or unresolved category",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "In a conventional long simulation, use ask entry and bid exit. In a short, use bid entry and ask exit. If the record already uses these sides, do not subtract the same spread again as a separate fee. A bid-only chart-based entry requires a different conversion or spread model, clearly named.",
      },
      {
        type: "paragraph",
        children:
          "A simulation may compare a baseline fill model with adverse slippage scenarios. Keep the scenario results separate; the favourable one is not “actual,” and the adverse one is not a guaranteed worst case. For demo rehearsal, preserve actual order status and fills alongside the intended model so differences are visible.",
      },
    ],
  },
  {
    title: "Keep an unknown intrabar sequence unknown",
    shortTitle: "Keep an unknown intrabar sequence unknown",
    blocks: [
      {
        type: "paragraph",
        children:
          "An OHLC bar contains open, high, low and close, not the order of every movement inside it. Suppose a simulated EUR/USD long has stop 1.0980 and target 1.1040. A later bar has high 1.1050 and low 1.0970. Both levels were visited in the price series, but those four values alone cannot establish which came first after entry.",
      },
      {
        type: "example",
        title: "Two shops visited in one afternoon",
        children: [
          "A traveller in Japan records the first and last locations plus the farthest points of an afternoon. That summary may not tell you whether the pharmacy or grocery shop came first. A bar’s summary likewise may not reveal stop/target ordering.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Disclosed ambiguity policies",
        columns: ["Policy", "Limit to explain"],
        rows: [
          [
            "Finer sequence data",
            "Verify timeframe, quote side and whether order/size assumptions are supported",
          ],
          [
            "Pessimistic stop-first scenario",
            "Conservative scenario convention; not proof of the actual order",
          ],
          [
            "Separate unresolved outcome",
            "Retain the case and show metrics/bounds affected by it",
          ],
          [
            "Compare stop-first and target-first bounds",
            "Illustrates uncertainty under the model; other execution limits can remain",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Choose the policy before inspecting which choice makes performance look better. A green closing candle does not prove target-first. Dropping every ambiguous case can improve the remaining sample artificially, so report how many cases were affected and how the policy changes the ledger.",
      },
      {
        type: "paragraph",
        children:
          "Even finer price data may not establish executable fills for your size or provider. It can resolve some ordering questions while leaving liquidity or trigger rules uncertain. Write which uncertainty has been reduced and which remains, rather than claiming that tick data remove every limitation.",
      },
    ],
  },
  {
    title: "Build one coherent cost ledger",
    shortTitle: "Build one coherent cost ledger",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use the entry/exit price convention consistently. With actual or modelled ask/bid fills, the price result already reflects crossing those quotes. Add separately charged commission, financing and conversion costs once. If a midpoint model deducts a spread allowance instead, explain that different convention. Mixing the two can charge the same spread twice.",
      },
      {
        type: "comparisonTable",
        caption:
          "Invented EUR/USD long cash scenarios at 0.01 lot, USD account, conversion 1",
        columns: [
          "Entry ask",
          "Exit bid",
          "Price result",
          "Separate fee",
          "Net under stated assumptions",
        ],
        rows: [
          ["1.1001", "1.1011", "+US$1.00", "US$0.20", "+US$0.80"],
          ["1.1001", "1.0981", "−US$2.00", "US$0.20", "−US$2.20"],
          ["1.1001", "1.0976", "−US$2.50", "US$0.20", "−US$2.70"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The third row is a worse exit than the second, adding five adverse pips. The fixed US$0.20 fee is invented for teaching and financing is assumed zero in this table. Real schedules can vary by size, day, product and provider. A credit, when genuinely part of the product, should also be recorded with its sign and source.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use supported EUR/USD, USD account, conversion 1 and 0.01 lot with entry 1.1001 and exits 1.1011, 1.0981 and 1.0976. The price results are +US$1, −US$2 and −US$2.50. Subtract the table’s separate US$0.20 charge once in the ledger; the tool does not model liquidity or guarantee fills.",
      },
      {
        type: "paragraph",
        children:
          "If quote currency differs from account currency, record the conversion convention and observation time. Conversion can change the reported cash outcome. Keep taxes or other costs separate if not modelled, and disclose the scope rather than calling an incomplete price result an all-cost profit.",
      },
    ],
  },
  {
    title: "Count opportunities, skips, fills and unresolved cases",
    shortTitle: "Count opportunities, skips, fills and unresolved cases",
    blocks: [
      {
        type: "paragraph",
        children:
          "The study needs a denominator for each metric. All eligible chart candidates, accepted execution opportunities and completed filled cases are different counts. Retain rejected candidates and their reasons. A skipped quote gate is not automatically a completed trade with zero profit, and a missing outcome is not automatically a confirmed loss or win.",
      },
      {
        type: "comparisonTable",
        caption: "Invented candidate audit",
        columns: ["Category", "Count", "How it is reported"],
        rows: [
          [
            "Completed chart candidates examined",
            "20",
            "Total candidate population",
          ],
          ["Spread-gate skips", "5", "Eligible chart; no accepted execution"],
          [
            "Missing required quote",
            "2",
            "Data-related skip under the stated rule",
          ],
          ["Assumed entries", "13", "20 − 5 − 2; simulated, not actual fills"],
          [
            "Resolved completed outcomes",
            "11",
            "Ledger cases under the chosen model",
          ],
          [
            "Intrabar outcomes unresolved",
            "2",
            "Remain visible; metrics need policy/bounds",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The counts reconcile: 20 candidates become 13 assumed entries after seven skips; those entries divide into eleven resolved and two unresolved outcomes. A performance statistic based only on eleven needs that denominator stated, and the unresolved cases need a disclosed treatment. Do not describe eleven as every opportunity without mentioning the others.",
      },
      {
        type: "paragraph",
        children:
          "Include rule breaches and operational failures in the appropriate forward/demo record rather than hiding them from a tidy strategy report. You may analyse rule-following cases separately, but show the full account or study record and the exclusion definition. A sub-record is not the whole experience.",
      },
    ],
  },
  {
    title: "Report sample size without inventing a universal threshold",
    shortTitle: "Report sample size without inventing a universal threshold",
    blocks: [
      {
        type: "paragraph",
        children:
          "A handful of cases is fragile evidence. More relevant observations can help show variation, but more data cannot fix biased selection, look-ahead, inconsistent costs or a changing product. There is no universal number of trades after which a strategy becomes proven. The question depends on variability, dependence, conditions, effects being studied and data quality.",
      },
      {
        type: "example",
        title: "One rainy Monday",
        children: [
          "A family in South Africa sees rain on one Monday. That does not establish what every Monday will be like, especially across seasons and locations. A small set of Forex observations also needs dates and context, not only a count.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Overlapping positions may share the same news shock, and several pairs may share USD exposure. One hundred such outcomes are not necessarily one hundred independent experiments. Record the sampling frequency, overlap, currency concentration and regimes covered. A thousand one-minute observations do not automatically provide more independent evidence than a smaller set at another horizon.",
      },
      {
        type: "paragraph",
        children:
          "Use uncertainty language appropriate to the record: “under these rules and assumptions, this period produced these outcomes.” Avoid announcing a precise future win probability from a tiny sample. Advanced statistical evaluation requires assumptions and methods beyond counting wins. The beginner’s responsibility is complete definitions, a full denominator and honest limits.",
      },
      {
        type: "paragraph",
        children:
          "A comparison period can contain very different volatility or costs. Report those differences rather than silently deleting the difficult period. If the method is only intended for certain conditions, those conditions must be identifiable using available information and defined before the reserved evaluation, not labelled after the losses.",
      },
    ],
  },
  {
    title: "Forward-test a frozen version without pretending demo is live",
    shortTitle: "Forward-test a frozen version without pretending demo is live",
    blocks: [
      {
        type: "paragraph",
        children:
          "Date the rule and the forward observation plan before new data arrive. Use the same eligibility, inputs, gates, outcome definition and ledger as far as possible. Save misses, skipped days, platform states and practical interruptions. The Japan after-work routine from Level 8 can support this exercise without requiring a trade each day.",
      },
      {
        type: "example",
        title: "A new meal is a new check",
        children: [
          "A cook in Canada freezes a recipe before preparing meals they have not yet cooked. Changing salt and timing after each meal may be useful development, but the cook must label the new versions. The original recipe’s results and revised recipe’s results are different records.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For the US-based USD/JPY learner, forward observation begins after the written historical/evaluation plan is locked. Save source/local times and price sides. A demo order can be used for control rehearsal if the policy allows it, but a demo accepted fill is not proof that a live account would receive the same price or size.",
      },
      {
        type: "paragraph",
        children:
          "If you discover a bug, missing input or unsafe assumption, pause new actions and preserve the existing record. Correct the issue with a dated note and new version as appropriate. “Frozen” does not mean continuing a known faulty plan; it means avoiding silent retrospective changes and being honest about which evidence belongs to which version.",
      },
    ],
  },
  {
    title: "Check robustness without retuning the evaluation forever",
    shortTitle: "Check robustness without retuning the evaluation forever",
    blocks: [
      {
        type: "paragraph",
        children:
          "Robustness asks whether the conclusion depends on one convenient assumption or narrow choice. You can predeclare tests with somewhat wider spreads, additional fees, delayed entries or nearby parameter settings, then report all results. The goal is to expose sensitivity, not select whichever variation wins and erase the rest.",
      },
      {
        type: "paragraph",
        children:
          "A walk-forward design can repeatedly use earlier information for development and a later window for evaluation under a plan fixed beforehand. Every update must respect the chronology and label overlap. It is not a licence to keep inspecting the same later data until a profitable rule appears. Advanced search and statistical safeguards require careful methodology.",
      },
      {
        type: "example",
        title: "The coat fits only one person",
        children: [
          "A tailor in the United Kingdom cuts a coat to one person’s exact measurements. It fits that person but may fit no one else. A rule with many historical exceptions can likewise fit one dataset closely while failing elsewhere.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Record the number of versions tried, all parameter ranges and the source of each revision. A reserved sample can still mislead if it is repeatedly reused or selected because it looked favourable. Keep a simple starting rule and a clear explanation of why each condition exists. Stop a study with an uncertain or negative result when that is what the evidence supports.",
      },
    ],
  },
  {
    title: "Practise a fair test sequence",
    shortTitle: "Practise a fair test sequence",
    blocks: [
      {
        type: "exercise",
        prompt:
          "You tuned a USD/JPY rule on January–June, then changed it after seeing July. Is July still untouched evaluation for the changed version?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. July has influenced development. Keep the original result, date the revised version and reserve genuinely unviewed or later observations.",
      },
      {
        type: "exercise",
        prompt:
          "A rule needs D6’s completed daily close. Can a historical test enter using an earlier D6 morning quote?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. The closing condition did not exist then. Use the next permitted available input and a disclosed fill model.",
      },
      {
        type: "exercise",
        prompt:
          "A bar visits both the stop and target. Does its green close prove target-first?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Use suitable sequence data or the predeclared ambiguity policy, retain affected cases and show how the policy changes metrics.",
      },
      {
        type: "exercise",
        prompt:
          "Twenty candidates have five spread skips and two missing-quote skips. Thirteen assumed entries include eleven resolved and two unresolved outcomes. What must the report show?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "All counts and reasons, with simulated entries clearly labelled. Any metric using eleven resolved cases must disclose that denominator and the policy/bounds for the two unresolved cases.",
      },
      {
        type: "exercise",
        prompt:
          "A 0.01-lot EUR/USD long enters at 1.1001 and exits at 1.0981, then pays a separate US$0.20 fee. What is net under the table’s assumptions?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "−US$2 price result minus US$0.20 = −US$2.20. Do not deduct the same quote-side spread a second time. Financing is assumed zero only in this teaching table.",
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
          "Build a chronological development, reserved evaluation and forward-observation plan.",
          "Keep future information, fill uncertainty and repeated costs out of earlier decisions.",
          "Reconcile candidates, skips, completed cases and unresolved outcomes under disclosed assumptions.",
        ],
        closing: [
          "Keep the frozen rules, original inputs, all candidates, costs, uncertainties and ledger. State what the evidence describes without treating it as a promise of future performance.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices, balances, periods, thresholds and results are invented teaching data, not trade recommendations or universal safe limits. Historical simulation, demo results and clear rules cannot guarantee profit, exact fills or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential money outside trading experiments. A quiz pass does not certify live-trading readiness.",
      },
      {
        type: "keyPoint",
        title: "Before you mark this lesson complete",
        points: [
          "I can name the rule version, product, inputs, timeframe and information cutoff.",
          "I can separate observation, assumed execution and actual platform outcomes.",
          "I can repeat the calculation with its units, costs and denominator.",
          "I can keep skips, ambiguous cases, losses and revisions visible.",
          "I can explain an evidence limitation and a valid no-action or further-study decision.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title:
              "NFA — Hypothetical Performance Results: limitations and presentation",
            url: "https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9",
          },
          {
            title:
              "Bailey, Borwein, López de Prado and Zhu — The Probability of Backtest Overfitting",
            url: "https://scholarworks.wmich.edu/math_pubs/42/",
          },
          {
            title: "CME Group — Trading Strategies in Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/trading-strategies-in-your-trade-plan",
          },
          {
            title: "CME Group — Keep a Trade Log",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/keep-a-trade-log",
          },
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
          },
        ],
      },
    ],
  },
];
