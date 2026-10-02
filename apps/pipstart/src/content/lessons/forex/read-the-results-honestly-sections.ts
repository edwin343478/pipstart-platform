import type { LessonSection } from "../../lesson-content";

export const readTheResultsHonestlySections: LessonSection[] = [
  {
    title: "Begin with a complete ledger and named units",
    shortTitle: "Begin with a complete ledger and named units",
    blocks: [
      {
        type: "paragraph",
        children:
          "Performance measures describe a particular record. Before calculating them, identify the strategy version, dates, product, account currency, position sizes, execution model, costs and outcome definition. A percentage without this context can make two very different studies look comparable. Historical simulation, demo and actual account records must stay distinctly labelled.",
      },
      {
        type: "paragraph",
        children:
          "Use one net result per completed case under a consistent allocation rule. If a position has partial exits, define how its costs and cash results are combined into that case. Counting each partial exit as a separate win while leaving the rest open changes the denominator. Open positions, pending orders, missing outcomes and skipped candidates need separate entries.",
      },
      {
        type: "example",
        title: "The shop’s till and its sales count",
        children: [
          "A shop in Canada records many sales but also refunds and expenses. A sales count alone cannot describe the final cash result. A trading win count similarly needs the amounts, costs and complete population.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In this lesson the central example is a British learner’s ten invented GBP/USD net outcomes: nine gains of £1 and one loss of £12, after all stated costs. The figures are teaching ledger results, not current trades or a recommended method. The specified order matters when we later calculate drawdown.",
      },
    ],
  },
  {
    title: "Define wins, losses and zero outcomes",
    shortTitle: "Define wins, losses and zero outcomes",
    blocks: [
      {
        type: "paragraph",
        children:
          "A win is a completed case with a positive net result under the stated cost convention; a loss has a negative net result; a net zero is neither. A small positive price result can become a net loss after charges. Write whether the record is price-only, after selected costs or after all modelled costs rather than using “net” ambiguously.",
      },
      {
        type: "formula",
        expression: "Win rate = number of net wins / number of completed cases",
        explanation:
          "Multiply by 100 for a percentage. Keep losses and zero outcomes in the denominator if completed cases are the stated population.",
      },
      {
        type: "paragraph",
        children:
          "The loss rate uses the same denominator. If there are zeros, win rate plus loss rate is less than 100%; the remaining share is the zero rate. Do not assume loss rate = 1 − win rate unless there are no zero outcomes under the definition. Unresolved results are not zeros and need a disclosed policy.",
      },
      {
        type: "example",
        title: "Not every game round scores",
        children: [
          "A family in Japan plays rounds that can gain points, lose points or end level. Excluding level rounds changes the percentage question. A ledger with zero results needs the same clarity.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Counts needed before a percentage",
        columns: ["Category", "Meaning"],
        rows: [
          ["Completed wins", "Net amount strictly positive"],
          ["Completed losses", "Net amount strictly negative"],
          [
            "Completed zeros",
            "Net amount exactly zero under the declared rounding rule",
          ],
          [
            "Unresolved/open",
            "Not silently inserted as zero or omitted without disclosure",
          ],
          [
            "Skipped candidates",
            "Observation records; not executed completed cases by default",
          ],
        ],
      },
    ],
  },
  {
    title: "Calculate average win and average loss consistently",
    shortTitle: "Calculate average win and average loss consistently",
    blocks: [
      {
        type: "paragraph",
        children:
          "Average win is total positive net amounts divided by the number of winning cases. Average loss here means the positive magnitude of total negative net amounts divided by the number of losing cases. State the sign convention so the expectancy formula does not subtract a negative loss twice.",
      },
      {
        type: "formula",
        expression:
          "Average win = total positive net gains / win count; average loss magnitude = total negative-result magnitudes / loss count",
        explanation:
          "These are conditional averages within the winners and losers. They are different from the average across every completed case.",
      },
      {
        type: "example",
        title: "Small frequent purchases, one large refund",
        children: [
          "A shop in Italy can have many small sales and one large refund. The frequency of positive entries does not resolve their size. Nine £1 gains and one £12 loss have average win £1 and average loss magnitude £12.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A mean can hide variation and outliers. Show the distribution or at least the individual cases when the sample is small. If there are no winners, average win is undefined, not an observed zero-sized win. If there are no losers, average loss is also undefined. The full-sample arithmetic mean can still be calculated from the ledger without inventing the absent category.",
      },
      {
        type: "paragraph",
        children:
          "When sizes vary, cash averages include that sizing policy. A larger winning position can dominate the cash record. Keep sizes and percentage/R measures alongside cash if useful, with each definition explicit. Do not quietly normalise losses to one size while leaving gains at their larger actual sizes.",
      },
    ],
  },
  {
    title: "Use sample expectancy as a description, not a promise",
    shortTitle: "Use sample expectancy as a description, not a promise",
    blocks: [
      {
        type: "paragraph",
        children:
          "The arithmetic mean result of completed cases is their total net result divided by the case count. A common sample expectancy expression gives the same mean when rates and conditional averages use one consistent ledger. It describes what the sample produced; it is not a guaranteed expected return of future trades.",
      },
      {
        type: "formula",
        expression:
          "Sample expectancy = win fraction × average win − loss fraction × average loss magnitude",
        explanation:
          "Use decimal fractions. If net-zero cases exist, their contribution is zero but their count stays in the fractions’ denominator.",
      },
      {
        type: "example",
        title: "Five gains and five losses",
        children: [
          "An Australian learner records five hypothetical gains of 3 units and five losses of 2 units, with those results already after stated costs. Total is 15 − 10 = 5 units across ten cases, or 0.5 unit per case. The weighted calculation is 0.5 × 3 − 0.5 × 2 = 0.5.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In the British example, 0.9 × £1 − 0.1 × £12 = −£0.30. That equals −£3 divided by ten. A high win fraction does not rescue the negative mean because the loss magnitude matters. Future rates and amounts are unknown and may change with costs, conditions and execution.",
      },
      {
        type: "paragraph",
        children:
          "An estimated future expectation needs more than this formula: relevant evidence, uncertainty assessment and justified assumptions. Avoid naming a tiny sample’s win fraction “the probability of winning” as if it were established for every later trade. This beginner calculation is deliberately a sample description.",
      },
    ],
  },
  {
    title: "Interpret profit factor and its edge cases",
    shortTitle: "Interpret profit factor and its edge cases",
    blocks: [
      {
        type: "paragraph",
        children:
          "Profit factor divides the total positive results by the magnitude of total negative results in the chosen ledger. In this lesson those are net per-case results after stated costs. Some reports use price-only or other conventions; name yours so a reader knows which results were classified and summed.",
      },
      {
        type: "formula",
        expression:
          "Profit factor = sum of positive net results / absolute sum of negative net results",
        explanation:
          "Use the same cases and units in numerator and denominator. It is not the average win divided by the average loss.",
      },
      {
        type: "paragraph",
        children:
          "For nine £1 gains and one £12 loss, profit factor is £9/£12 = 0.75. In a record with £15 positive and £10 negative totals, it is 1.5: £1.50 of positive results for each £1 of negative results in that sample. Neither ratio says how the gains were distributed in time or guarantees the next sample.",
      },
      {
        type: "comparisonTable",
        caption: "When a ratio needs special handling",
        columns: ["Ledger situation", "Honest report"],
        rows: [
          ["Positive gains and negative losses", "Calculate the stated ratio"],
          [
            "Gains but no negative results",
            "Denominator zero; ratio not a finite observed value",
          ],
          [
            "Losses but no positive gains",
            "Profit factor 0 if loss denominator is positive",
          ],
          [
            "No completed cases or only zeros",
            "No meaningful gain/loss ratio; disclose the empty/zero record",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Software may display infinity or a blank for a zero denominator. Explain the convention instead of advertising an infinite edge. For a sample with no losers, the missing category is uncertainty, not proof that losses cannot occur. A high ratio can also come from one exceptional gain or a small selected sample.",
      },
    ],
  },
  {
    title: "Work through the nine-wins/one-loss ledger",
    shortTitle: "Work through the nine-wins/one-loss ledger",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented GBP/USD outcomes after all stated costs",
        columns: ["Case", "Net result", "Closed-result balance from £100"],
        rows: [
          ["1", "+£1", "£101"],
          ["2", "+£1", "£102"],
          ["3", "+£1", "£103"],
          ["4", "+£1", "£104"],
          ["5", "+£1", "£105"],
          ["6", "+£1", "£106"],
          ["7", "+£1", "£107"],
          ["8", "+£1", "£108"],
          ["9", "+£1", "£109"],
          ["10", "−£12", "£97"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The counts are nine wins and one loss. Positive total is £9; loss magnitude is £12; net total is −£3. Win rate is 90%; average win is £1; average loss magnitude is £12; sample mean is −£0.30; profit factor is 0.75. These results all describe the same ten-case ledger after its stated costs.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-9/wins-and-drawdown.svg",
        desktopSrc:
          "/images/lessons/forex/level-9/wins-and-drawdown-desktop.svg",
        width: 720,
        height: 400,
        alt: "A closed-result teaching balance rises from £100 to £109 after nine £1 gains, then falls to £97 after a £12 loss.",
        caption:
          "The 90% win rate coexists with −£3 net and a £12 fall from the prior £109 peak. The line omits any unobserved intratrade equity movement.",
      },
      {
        type: "paragraph",
        children:
          "Do not subtract the same costs again from these already-after-cost outcomes. The later calculator exercise uses a separate price-only scenario plus a separately specified fee. Different conventions can be valid, but mixing them produces incorrect totals.",
      },
      {
        type: "paragraph",
        children:
          "Ten invented cases are not reliable evidence of future probabilities. The example teaches why a headline win rate can hide a loss. An attractive chart of the first nine cases would omit the final loss and misrepresent the population. Keep all ten and their order visible.",
      },
    ],
  },
  {
    title: "Check zero cases and the cost convention",
    shortTitle: "Check zero cases and the cost convention",
    blocks: [
      {
        type: "comparisonTable",
        caption:
          "Six invented completed net results, already after stated costs",
        columns: ["Case", "Net units"],
        rows: [
          ["1", "+3"],
          ["2", "+3"],
          ["3", "−2"],
          ["4", "−2"],
          ["5", "0"],
          ["6", "0"],
        ],
      },
      {
        type: "paragraph",
        children:
          "There are two wins, two losses and two zeros. Total is 6 − 4 = 2 units across six cases, so mean is 2/6 ≈ 0.333 unit. Win and loss fractions are each 2/6, and the zero fraction is 2/6. Weighted sample expectancy is (2/6 × 3) − (2/6 × 2) = 1/3. Profit factor is 6/4 = 1.5.",
      },
      {
        type: "paragraph",
        children:
          "Using 1 − win fraction as the loss fraction would wrongly treat the zero cases as losses. Removing zeros would create a different denominator and give a different per-case mean. State any rounding rule used to classify very small results; do not round losing entries to zero merely because the amounts are inconvenient.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "For a separate USD example, use supported EUR/USD, USD account, conversion 1 and 0.01 lot: long entry 1.1000/exit 1.1012 gives +US$1.20 price result. Subtract an invented separate US$0.20 fee once to obtain +US$1. This USD exercise is distinct from the pound ledger; dollars and pounds are not interchangeable.",
      },
      {
        type: "paragraph",
        children:
          "For a real or demo multi-currency record, preserve quote-currency results and the account-conversion convention, rate and timing. Financing and currency conversion can change whether a case is a net win. If some costs are missing, label the reported scope and do not silently compare it with an all-cost ledger.",
      },
    ],
  },
  {
    title: "Separate balance, equity and the path of results",
    shortTitle: "Separate balance, equity and the path of results",
    blocks: [
      {
        type: "paragraph",
        children:
          "Balance generally reflects booked account cash results under the platform’s rules; equity includes the current valuation of open positions and relevant account adjustments. Check the product’s own definition. A closed-result ledger like the £100-to-£97 example does not reveal intratrade equity drawdowns or the lowest equity reached while a position was open.",
      },
      {
        type: "example",
        title: "The bill has not yet been paid",
        children: [
          "A family in Germany sees money in the bank but also an unpaid obligation. Looking only at booked payments can give an incomplete picture of current commitments. An account with open losses can likewise have different balance and equity readings.",
        ],
      },
      {
        type: "paragraph",
        children:
          "To describe a path, specify observation frequency, valuation convention and whether costs/cash flows are included. Daily closing equity, tick-by-tick equity and equity only after closed trades can produce different measured maximum drawdowns. A coarser record can miss a deeper decline between observations.",
      },
      {
        type: "paragraph",
        children:
          "Deposits and withdrawals can make naive balance changes look like performance. Keep cash flows separate, use an appropriate return/adjustment convention and disclose it. The simple examples assume no external cash flows, no open positions between ledger points and already-stated costs. Do not apply their percentages unchanged to an account with deposits or withdrawals.",
      },
      {
        type: "paragraph",
        children:
          "Two records with identical final profit can have different paths, concentration and stress. Read the path beside the final result. A large later gain does not erase the exposure or practical difficulty faced during an earlier decline.",
      },
    ],
  },
  {
    title: "Calculate maximum observed peak-to-trough drawdown",
    shortTitle: "Calculate maximum observed peak-to-trough drawdown",
    blocks: [
      {
        type: "paragraph",
        children:
          "At each observation, keep the highest earlier-or-current account value, called the running peak. Drawdown amount is running peak minus current value. Percentage drawdown divides that amount by the same peak. Maximum drawdown is the largest decline observed under the chosen sampling and valuation convention.",
      },
      {
        type: "formula",
        expression:
          "Drawdown % at an observation = (running peak − current value) / running peak × 100",
        explanation:
          "The denominator is the relevant prior peak, not automatically the starting deposit or the current trough.",
      },
      {
        type: "paragraph",
        children:
          "In the British closed-result ledger, the running peak is £109 after case nine and the later trough is £97. The decline is £12, or 12/109 × 100 ≈ 11.01%. The final balance is also £3 below the original £100, but that −3% start-to-end change is a different measurement.",
      },
      {
        type: "learningLink",
        title: "Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Use starting/reference value 109, drawdown 12 in amount mode, and GBP account units. It returns 97 remaining, about 11.01% drawdown and about 12.37% recovery needed to return to 109. You select the peak/trough from the ledger; the calculator does not reconstruct the path or predict recovery.",
      },
      {
        type: "paragraph",
        children:
          "A fall from 100 to 80 is a 20% drawdown, but returning from 80 to 100 needs 25% because the recovery denominator is the smaller 80. For the £97 trough, recovering £12 to £109 needs 12/97 × 100 ≈ 12.37%. Neither calculation says the account will recover.",
      },
      {
        type: "learningLink",
        title: "Gain-Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Use current value 97, target 109 and a hypothetical constant 1% compounded gain per period in GBP units. The tool reaches the target in 12 whole periods under that fixed-rate model with no other flows or costs. This is an arithmetic scenario, not a trading return forecast or a promised recovery timetable.",
      },
    ],
  },
  {
    title: "Keep size, cash return and R multiples distinct",
    shortTitle: "Keep size, cash return and R multiples distinct",
    blocks: [
      {
        type: "paragraph",
        children:
          "A cash mean includes the sizing policy used in the record. An R multiple divides a case’s result by its defined initial planned risk reference. If you use R, state whether the numerator is price-only or after costs, whether the denominator includes planned costs and what happens when the risk reference is missing or changes.",
      },
      {
        type: "example",
        title: "A bigger parcel changes the delivery bill",
        children: [
          "A business in Brazil sends different-size parcels. The average cash delivery charge reflects those sizes; it is not the price of one standard parcel. A cash trading average also reflects size, while an R measure asks a different normalisation question.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For a teaching case with a stored US$10 initial price-risk reference, +US$20 price result is +2R and −US$12.50 price result is −1.25R. If a separate US$0.50 fee applies, the net results become +US$19.50 and −US$13, giving +1.95R and −1.30R when the denominator remains the stored US$10 price-risk reference. Label both conventions.",
      },
      {
        type: "paragraph",
        children:
          "Do not resize the denominator after seeing the loss to make it appear smaller. A changed stop or added position needs a recorded exposure change, while the initial reference can remain for a clearly named metric. An ordinary protective stop does not guarantee the actual result will be no worse than −1R.",
      },
      {
        type: "paragraph",
        children:
          "Percent returns, R multiples and currency amounts are not interchangeable. A compound account return depends on the sequence and sizing/cash-flow conventions. Adding trade percentages is not generally the same as a compounded account return. Keep each unit’s calculation and purpose alongside it.",
      },
    ],
  },
  {
    title: "Inspect sensitivity, outliers and concentration",
    shortTitle: "Inspect sensitivity, outliers and concentration",
    blocks: [
      {
        type: "paragraph",
        children:
          "Ask whether the result depends on one exceptional case, one narrow period or one optimistic cost assumption. Report the full result first, then any predeclared sensitivity view with its definition. Removing the largest loss without a legitimate prior rule changes the sample; it is not a repair of the original performance.",
      },
      {
        type: "example",
        title: "One large sale in the shop",
        children: [
          "An Indian shop earns most of a month’s profit from one unusually large order. That is useful to know, but it does not justify pretending that every next month will contain the same order. A strategy record concentrated in one large gain needs the same caution.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Wider spreads or extra fees can change a small positive mean into a negative one. In the six-case net-units example, an additional hypothetical 0.50 unit charge per case would subtract 3 units from the total 2, leaving −1 overall and −1/6 ≈ −0.167 per case. That additional-charge scenario is different from the already-stated-cost baseline.",
      },
      {
        type: "paragraph",
        children:
          "Compare periods and relevant conditions under definitions chosen before evaluation where possible. If you search many subgroups and show only the profitable one, the subgroup has become another fitted selection. A rule intended for high volatility needs an available-data definition of high volatility, not a label applied after seeing which dates won.",
      },
      {
        type: "paragraph",
        children:
          "Keep uncertainty, unresolved fills and missing costs visible. A stress scenario can reveal a weakness without being a guaranteed worst case. Historical maximum drawdown is an observed measurement, not a ceiling on future account loss.",
      },
    ],
  },
  {
    title: "Recognise curve fitting without rejecting every revision",
    shortTitle: "Recognise curve fitting without rejecting every revision",
    blocks: [
      {
        type: "paragraph",
        children:
          "Curve fitting or overfitting happens when choices fit historical quirks so closely that apparent performance may not carry to new observations. Many filters, parameter searches and repeated looks at an evaluation set increase opportunities to select noise. A revision can be useful development, but it must not be advertised as if it were decided before the evidence that inspired it.",
      },
      {
        type: "example",
        title: "The tailor’s exact coat",
        children: [
          "A tailor in the United Kingdom makes a coat fit one person perfectly by adding many precise adjustments. The result says little about its fit on another person. A complicated trading rule tailored to one history needs a genuinely new check.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Prefer clear reasons and a manageable set of assumptions. Keep all tried variants, development/evaluation boundaries and the chosen version. Nearby-parameter or cost checks can expose fragility when planned fairly, but picking the best of those checks is another selection. A strong-looking ratio cannot substitute for a fair research process.",
      },
      {
        type: "paragraph",
        children:
          "An honest negative or uncertain result is useful. You may decide to stop, simplify the rule, improve data or begin a new development version. Do not keep relabelling the same later sample untouched. Neither a high win rate, positive sample mean nor profit factor above one by itself establishes an applicable future edge.",
      },
    ],
  },
  {
    title: "Write a report a reader can challenge",
    shortTitle: "Write a report a reader can challenge",
    blocks: [
      {
        type: "comparisonTable",
        caption: "A compact strategy-review report",
        columns: ["Part", "What to disclose"],
        rows: [
          [
            "Identity",
            "Rule version/date, pair/product, provider, timeframe and study scope",
          ],
          [
            "Evidence type",
            "Historical simulation, forward observation, demo or actual record",
          ],
          [
            "Research process",
            "Development/evaluation boundaries and all relevant versions tried",
          ],
          [
            "Population",
            "Candidates, skips, assumed/actual entries, completed and unresolved counts",
          ],
          [
            "Execution/costs",
            "Quote sides, fill model, fees, financing, conversion and missing assumptions",
          ],
          [
            "Results",
            "Net total, count, win/loss/zero rates, conditional averages, sample mean and profit factor",
          ],
          [
            "Path/risk",
            "Valuation frequency, cash flows, size policy and maximum observed drawdown",
          ],
          [
            "Sensitivity",
            "All predeclared alternatives and important concentration",
          ],
          [
            "Process",
            "Rule breaches, missing evidence and operational constraints",
          ],
          [
            "Conclusion",
            "What the record supports, what remains uncertain and the next research decision",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A learner should be able to trace a headline figure back to the ledger and recompute it. Include the data/assumptions version and enough information to understand corrections. Protect personal account identifiers when sharing. A report can be compact while still being explicit about every denominator and unit.",
      },
      {
        type: "paragraph",
        children:
          "Read process quality and performance separately. A well-followed rule can have a negative record, and a profitable breach can be unreliable learning. Do not conclude that more discipline alone will make a weak strategy profitable. A quiz pass checks course understanding; it is not certification to trade live or a promise of income.",
      },
      {
        type: "paragraph",
        children:
          "The next level examines changing relationships, liquidity, positioning and broader review. Those ideas add context without removing the testing requirements here. Keep this ledger, specification and journal for later learning rather than replacing them with a single attractive screenshot.",
      },
    ],
  },
  {
    title: "Practise reading the whole record",
    shortTitle: "Practise reading the whole record",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Nine net £1 gains and one net £12 loss: calculate win rate, average win/loss, net total, sample mean and profit factor.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "90%; average win £1 and loss magnitude £12; net −£3; mean −£0.30 per completed case; profit factor 9/12 = 0.75. All describe this tiny invented after-cost sample.",
      },
      {
        type: "exercise",
        prompt:
          "The same ordered ledger rises from £100 to £109, then falls to £97. What are observed drawdown and required recovery to the peak?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Drawdown is £12/£109 ≈ 11.01%. Recovery is £12/£97 ≈ 12.37%. The −3% start-to-end change is different; unobserved intratrade equity may have fallen more.",
      },
      {
        type: "exercise",
        prompt:
          "For net results +3, +3, −2, −2, 0, 0, what is the full-sample mean and profit factor? May loss fraction be taken as one minus win fraction?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Mean is 2/6 = 1/3 unit; profit factor is 6/4 = 1.5. No: two zero cases mean win and loss fractions are each 2/6, not complementary.",
      },
      {
        type: "exercise",
        prompt:
          "A report has gains but no losses. Does an infinite-looking profit factor prove losses cannot occur?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. The loss denominator is zero, so no finite ratio is observed. State the convention, sample and missing losing category without claiming a future guarantee.",
      },
      {
        type: "exercise",
        prompt:
          "A method’s largest historical loss is removed solely because it makes the curve unattractive. Is the revised total the honest original result?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Preserve the full result. A separately labelled sensitivity view cannot silently replace the original sample, and a new exclusion rule needs versioned development and later evaluation.",
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
          "Calculate consistent net win/loss/zero rates, averages, sample expectancy and profit factor.",
          "Read the account path and distinguish observed drawdown from final change and future risk.",
          "Report complete denominators, costs, sensitivity and version history without overstating evidence.",
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
        checklist: true,
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
            title: "CME Group — Keep a Trade Log",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/keep-a-trade-log",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
          {
            title:
              "Bailey, Borwein, López de Prado and Zhu — The Probability of Backtest Overfitting",
            url: "https://scholarworks.wmich.edu/math_pubs/42/",
          },
          {
            title:
              "NFA — Hypothetical Performance Results: limitations and presentation",
            url: "https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9",
          },
        ],
      },
    ],
  },
];
