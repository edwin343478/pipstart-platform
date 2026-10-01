import type { LessonSection } from "../../lesson-content";

export const reviewTheWholePortfolioSections: LessonSection[] = [
  {
    title: "Review the account as one connected picture",
    shortTitle: "Review the account as one connected picture",
    blocks: [
      {
        type: "paragraph",
        children:
          "The whole portfolio is the collection of relevant positions and obligations, not just the most recent trade. A beginner’s review should connect open positions, active pending instructions, currency directions, cash risk scenarios, used margin, costs and operational responsibilities. Looking at each pair separately can hide a common driver or a combined loss that conflicts with the written policy.",
      },
      {
        type: "example",
        title: "Different stalls, the same flooded road",
        children: [
          "A family in Canada buys fruit from three stalls, but every stall uses the same flooded delivery road. Three sellers do not remove that shared disruption. Three currency positions can likewise carry a common dollar exposure despite different pair names.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This final lesson brings together risk, execution, journaling and the strategy-review process. Its examples use invented account amounts and prices. Your graduation project can stay entirely observation-only, historical or demo. Course completion does not require a deposit, a funded-account challenge, a live trade or a profitable result.",
      },
      {
        type: "paragraph",
        children:
          "A good review asks what was planned, what actually happened, what evidence supports each calculation and what remains uncertain. Keep process quality and monetary outcomes separate. A rule followed carefully can lose; an unauthorised risk increase can win. Neither one outcome settles the quality of the learning.",
      },
    ],
  },
  {
    title: "Write out the currency directions",
    shortTitle: "Write out the currency directions",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Look through the pair name",
        columns: ["Hypothetical position", "Bought exposure", "Sold exposure"],
        rows: [
          ["Long EUR/USD", "EUR", "USD"],
          ["Long GBP/USD", "GBP", "USD"],
          ["Short USD/JPY", "JPY", "USD"],
          ["Short EUR/USD", "USD", "EUR"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The first three positions all sell dollar exposure. Long EUR/USD and short USD/JPY therefore share a dollar direction even though one is labelled long and the other short. The other currencies, quantities and quote conversions still matter. Direction labels identify a concentration; they do not tell you the exact joint cash loss.",
      },
      {
        type: "paragraph",
        children:
          "Keep position size and contract alongside the direction. A small exposure does not cancel a much larger opposite exposure merely because the currencies match. If account currency differs from the quote currency, the conversion to account cash can itself change. Two retail contracts can also have different financing and execution conditions.",
      },
      {
        type: "example",
        title: "Two bills, one exchange-rate worry",
        children: [
          "A student in the United Kingdom plans a euro-zone visit and a Japanese visit. Paying for both from pounds exposes the budget to more than one currency, and amounts matter. Simply naming two destinations does not establish how much currency risk the household has.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For this course worksheet, focus on the hypothetical trading account and clearly stated related obligations. Essential savings, rent and debt payments should remain outside trading experiments. A broader real household or business portfolio can require professional advice appropriate to its circumstances; the course’s classroom table is not a complete personal financial plan.",
      },
    ],
  },
  {
    title: "Build a position inventory before adding totals",
    shortTitle: "Build a position inventory before adding totals",
    blocks: [
      {
        type: "comparisonTable",
        caption: "One-row-per-position inventory",
        columns: ["Field", "Information required"],
        rows: [
          ["Identity", "Product, provider, pair and rule version"],
          ["Direction/size", "Long or short, actual quantity and contract"],
          ["Currency exposure", "Currencies bought/sold and account currency"],
          [
            "Entry/exit",
            "Price side, fill, invalidation and order instructions",
          ],
          [
            "Risk scenario",
            "Assumed exit/fill, conversion, fees and financing",
          ],
          ["Account state", "Used/free margin, open equity and pending orders"],
          [
            "Operational plan",
            "Monitoring time, event exposure and status-check procedure",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Use actual filled quantity for open exposure. Record an unfilled pending order separately, including whether it can open while other positions remain. If several orders could be triggered during one event, the combined scenario should consider that possibility under the product’s rules. Do not count a cancelled instruction as active, or an uncertain cancellation as confirmed.",
      },
      {
        type: "paragraph",
        children:
          "A protective stop is an instruction, not a guaranteed cash ceiling. State the intended trigger and a separate adverse-fill case. For an ordinary stop, a gap can create a worse result. With a stop-limit, exposure can remain if the price runs beyond the limit. A worksheet that ignores the unfilled state may falsely imply the position was closed.",
      },
      {
        type: "example",
        title: "The family calendar",
        children: [
          "A family in Australia checks confirmed appointments and pending invitations together before planning a day. Treating every invitation as cancelled would create clashes. An account review likewise needs both active positions and instructions that could still create exposure.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Date the inventory and refresh it after fills, cancellations, new information or relevant price/account changes. A table copied from last week is not a statement of today’s exposure. Keep status evidence so another reader can trace the totals to the same point in time.",
      },
    ],
  },
  {
    title: "Add account cash under consistent assumptions",
    shortTitle: "Add account cash under consistent assumptions",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented Canadian demo portfolio scenarios",
        columns: [
          "Position",
          "Planned price-loss CAD",
          "Adverse price-loss CAD",
          "Separate scenario charges CAD",
        ],
        rows: [
          ["Long EUR/USD", "8", "10", "1"],
          ["Long GBP/USD", "10", "13", "1"],
          ["Short USD/JPY", "12", "17", "1"],
          ["Total", "30", "40", "3"],
        ],
      },
      {
        type: "paragraph",
        children:
          "These are already-converted invented CAD price-loss amounts, not results inferred from pair names or a correlation matrix. Actual worksheets must retain the underlying sizes, exit prices and conversion assumptions. The planned price-loss total is C$30. With the stated separate C$3 charges, that planned case is C$33; the adverse price-loss case plus the same charges is C$43.",
      },
      {
        type: "paragraph",
        children:
          "Suppose this learner’s classroom policy permits no more than C$35 in the specified combined after-charge scenario. The planned case fits that teaching gate, but the adverse case does not. The response is to revise or skip the hypothetical combination under that policy, not to hide the stress case or call C$35 a universal safe limit.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-10/portfolio-review.svg",
        desktopSrc:
          "/images/lessons/forex/level-10/portfolio-review-desktop.svg",
        width: 720,
        height: 400,
        alt: "Three invented CAD price-loss amounts sum to 30; a jointly adverse case sums to 40, with 3 separate charges giving 43.",
        caption:
          "Add amounts in one account currency under consistent assumptions. The adverse scenario is a teaching test, not a guaranteed maximum loss.",
      },
      {
        type: "paragraph",
        children:
          "Do not sum one position in dollars, another in yen and another in euros as if the numerals were comparable. Convert consistently to the stated account currency at the disclosed scenario rates. Costs already included in a net figure must not be deducted again. Preserve a distinction between price-only results and complete after-charge results.",
      },
      {
        type: "paragraph",
        children:
          "Do not apply +0.65 from the earlier teaching matrix as a fixed cash-risk discount. Correlations can change and the actual position directions matter. Separate scenarios can examine one local shock, a common currency move, simultaneous poor fills or an operational failure. Label every scenario’s assumptions and avoid describing any selected one as the worst possible outcome.",
      },
    ],
  },
  {
    title: "Distinguish margin, equity and the loss policy",
    shortTitle: "Distinguish margin, equity and the loss policy",
    blocks: [
      {
        type: "paragraph",
        children:
          "Margin is collateral required under the product/account rules. It is not the planned loss and not the total amount you can lose. Equity includes the provider’s valuation of open results and charges; free margin and liquidation rules depend on the exact contract. A position set may have an acceptable classroom price-loss budget yet face unacceptable margin or gap conditions.",
      },
      {
        type: "learningLink",
        title: "Margin Calculator",
        href: "/tools/margin-calculator",
        description:
          "Use a supported instrument, the stated account currency/conversion, price, volume and leverage assumptions to study an estimate. Verify the provider’s actual margin, netting/hedging and liquidation rules separately. Margin is not a stop-loss amount or a portfolio-risk guarantee.",
      },
      {
        type: "learningLink",
        title: "Position Size Calculator",
        href: "/tools/position-size-calculator",
        description:
          "Calculate each supported position’s planned price risk using the actual stop distance and account conversion. Apply minimum/step rounding, separate charges, adverse-fill scenarios and the combined account policy before treating a size as eligible.",
      },
      {
        type: "paragraph",
        children:
          "If opposite positions share a pair, do not assume the platform treats them as separate hedges or automatically reduces margin. Some account models net positions; others permit separate positions with product-specific collateral rules. Read the account model rather than copying an estimate from a different provider.",
      },
      {
        type: "example",
        title: "The rental deposit",
        children: [
          "A renter in Germany pays a deposit to obtain a vehicle. The deposit is not the price of every possible repair or accident. Collateral for a leveraged product similarly does not define a maximum loss.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A daily loss gate also needs a clear reference, clock and treatment of open losses, costs and withdrawals/deposits. Copying yesterday’s percentage without those definitions can hide risk. Stop-for-the-day rules govern your process, but may not prevent further losses on exposure still open or an order that cannot be cancelled or filled as intended.",
      },
    ],
  },
  {
    title: "Compare planned and actual execution on the correct sides",
    shortTitle: "Compare planned and actual execution on the correct sides",
    blocks: [
      {
        type: "paragraph",
        children:
          "An execution review compares a specified reference with the actual outcome. Record the quote time and side, submitted order, accepted status, filled quantity, entry/exit timestamps, fees, financing and conversion. Preserve favourable and adverse differences. An entry screenshot without the actual fill is not a complete execution record.",
      },
      {
        type: "comparisonTable",
        caption: "Invented EUR/USD long in a USD account",
        columns: ["Field", "Planned case", "Actual teaching case"],
        rows: [
          ["Quantity", "0.05 lot", "0.05 lot"],
          ["Entry ask/fill", "1.1001", "1.1003"],
          ["Exit bid/fill", "1.1021", "1.1018"],
          ["Price distance", "20 pips", "15 pips"],
          ["Price-only result", "US$10.00", "US$7.50"],
          ["Separate commission", "US$0.50", "US$0.50"],
          ["Separate financing", "US$0.00", "US$0.20"],
          ["Net under stated charges", "US$9.50", "US$6.80"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Assume a conventional 100,000-unit contract, a 0.0001 pip and conversion 1 from USD quote to USD account. At 0.05 lot, a pip is US$0.50. The entry is 2 pips worse than planned and the exit is 3 pips worse, reducing the price-only result by US$2.50. The separate financing adds US$0.20 to that difference, so actual net is US$2.70 below planned net.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use EUR/USD, long, 0.05 lot, USD account and conversion 1. Compare entry/exit 1.1001/1.1021 with 1.1003/1.1018. Price-only results are US$10 and US$7.50; reconcile the stated separate commission and financing afterward.",
      },
      {
        type: "paragraph",
        children:
          "The entry and exit already use purchase ask and sale bid sides. Do not deduct the same quote-side spread again. If you instead use midpoint chart prices, explain how executable-side adjustments enter the calculation. Keep independently charged commission/financing separate and only subtract each charge once.",
      },
      {
        type: "paragraph",
        children:
          "The reference must match the instruction. A market-order comparison might use the quote available at submission; an unfilled limit has a different outcome from a market order filled worse. A changed holding duration can affect financing. If quantity or conversion also changes, separate those contributions instead of calling the entire cash difference “slippage.”",
      },
    ],
  },
  {
    title: "Turn the execution record into a useful investigation",
    shortTitle: "Turn the execution record into a useful investigation",
    blocks: [
      {
        type: "paragraph",
        children:
          "One adverse fill does not prove misconduct or a faulty strategy, and one favourable fill does not establish typical execution. Review comparable records over a predefined period. Compare product, size, session, instruction and quote freshness; retain rejects, partial fills and unfilled orders. Missing cases can otherwise make the averages look misleadingly good.",
      },
      {
        type: "example",
        title: "The travel receipts",
        children: [
          "A traveller in India budgets train fare, luggage and a taxi at arrival. Actual receipts show which assumption changed. They do not explain the difference if the traveller discards the expensive receipt or compares a different journey. An execution review needs the same complete trail.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Execution-review questions",
        columns: ["Question", "Evidence to retain"],
        rows: [
          [
            "Was the reference available?",
            "Timestamp, quote source/side and freshness",
          ],
          [
            "What did the instruction request?",
            "Order type, price constraint, lifetime and quantity",
          ],
          [
            "What occurred?",
            "Status, fills, partial quantities, cancellations/rejections",
          ],
          [
            "What else changed?",
            "Holding time, account conversion and separate costs",
          ],
          [
            "Was the procedure followed?",
            "Contemporaneous checklist and any operational interruption",
          ],
          [
            "What can be concluded?",
            "Comparable sample, unresolved items and alternatives",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Measure entry and exit differences separately with a stated sign convention. For a long, a higher entry or lower exit is adverse; for a short, a lower entry or higher exit is adverse. A consistent adverse-pip convention avoids calling a numerically positive subtraction favourable for every direction.",
      },
      {
        type: "paragraph",
        children:
          "If the record is incomplete, write what is missing. A timestamp mismatch can make the comparison invalid. If a provider discrepancy needs clarification, gather the order IDs and documented facts; keep private identifiers secure. A classroom exercise should not label an institution dishonest from an unexplained chart difference.",
      },
    ],
  },
  {
    title: "Keep a journal of decisions, not only closed wins",
    shortTitle: "Keep a journal of decisions, not only closed wins",
    blocks: [
      {
        type: "paragraph",
        children:
          "A useful journal records the date, rule version, market/product, available information, candidate classification, reason to enter or skip, planned risk, actual instruction/status, costs and outcome. It also records uncertainty, breaches and corrective actions. Include no-action decisions, not just trades that make a good screenshot.",
      },
      {
        type: "comparisonTable",
        caption: "A compact complete journal entry",
        columns: ["Part", "Record at the appropriate time"],
        rows: [
          [
            "Before action",
            "Data clock, setup, trigger and eligibility/skip reason",
          ],
          [
            "Risk check",
            "Position/account scenarios, size, costs, margin and invalidation",
          ],
          [
            "During rehearsal",
            "Submitted instruction, fills/status and operational issues",
          ],
          [
            "After resolution",
            "Exit, separate charges, net result and remaining uncertainty",
          ],
          ["Process review", "Rules followed/breached and evidence"],
          ["Learning", "Correction, question or versioned development idea"],
        ],
      },
      {
        type: "example",
        title: "The bread notebook",
        children: [
          "A cook in Italy writes oven temperature, ingredients and timing for every loaf, including disappointing ones. Recording only perfect loaves would hide the conditions that need attention. A Forex journal has the same purpose: learning from a complete record rather than presenting a flattering collection.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Write the reason while the information is available, before the outcome colours memory. Preserve original entries and append dated corrections. A new rule version should not rewrite old decisions as if the new rule existed then. Link the journal to the strategy specification and any historical/demo ledger from Level 9.",
      },
      {
        type: "paragraph",
        children:
          "Screenshots help explain context but do not replace numerical inputs, timestamp, units and status. Hide personal account numbers and unnecessary identifiers in shared learning work. A clear record should let a reviewer reproduce the calculation without needing your memory of what happened.",
      },
    ],
  },
  {
    title: "Review a fixed period and separate process from outcomes",
    shortTitle: "Review a fixed period and separate process from outcomes",
    blocks: [
      {
        type: "paragraph",
        children:
          "Choose the review interval and measures before selecting the cases. Reconcile candidates, skips, entered cases, completed results and unresolved exposure. Read after-cost totals, win/loss/zero counts, sample averages, size changes and valuation path under the Level 9 definitions. Include cash flows and distinguish balance from equity when relevant.",
      },
      {
        type: "learningLink",
        title: "Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Enter a stated peak and loss in one account currency to understand percentage drawdown and recovery. Find the peak-to-trough path from your dated ledger first; the calculator cannot discover intratrade equity declines missing from the record.",
      },
      {
        type: "comparisonTable",
        caption: "Two separate review dimensions",
        columns: ["Process finding", "Outcome finding"],
        rows: [
          [
            "Rule followed; inputs and costs recorded",
            "The case can still lose normally",
          ],
          [
            "Rule breached or size exceeded",
            "A gain does not make the breach acceptable",
          ],
          [
            "Missing fill/cost evidence",
            "A displayed profit remains incomplete evidence",
          ],
          [
            "Complete negative study",
            "Useful evidence may support stopping or revising",
          ],
          [
            "Well-documented positive sample",
            "Still limited by sample, conditions and execution assumptions",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Avoid changing the method after every individual loss. A predeclared rule may fail in a new context; discipline alone will not make it profitable. If evidence suggests a revision, document the reason, keep the original results, freeze a new version and begin a fair new check. Do not silently delete the awkward period.",
      },
      {
        type: "paragraph",
        children:
          "A review can conclude “continue observing,” “data insufficient,” “do not pursue this method,” or “clarify the missing product assumption.” Each can be a responsible learning decision. The goal is an honest, reproducible conclusion, not a requirement to trade more or recover money quickly.",
      },
    ],
  },
  {
    title: "Assemble seven graduation deliverables",
    shortTitle: "Assemble seven graduation deliverables",
    blocks: [
      {
        type: "paragraph",
        children:
          "The final project gathers evidence you have learned the foundations. Use your existing paper, spreadsheet or demo records; this lesson does not add a platform upload or automatic portfolio-grading feature. The quiz checks knowledge, while the project checks whether you can explain and document a process. A quiz score alone does not certify live-trading competence.",
      },
      {
        type: "comparisonTable",
        caption: "The seven-part learning portfolio",
        columns: ["Deliverable", "Evidence to include"],
        rows: [
          [
            "1. Written risk policy",
            "Essential money excluded; chosen practice budget; combined-loss and stop-for-the-day definitions",
          ],
          [
            "2. Trading/practice plan",
            "Life-compatible scope, supported products, observation times and no-action conditions",
          ],
          [
            "3. Strategy specification",
            "Reproducible data, timing, trigger, entry, exit, size, costs and exceptions",
          ],
          [
            "4. Historical check",
            "Frozen version, date boundaries, all qualifying observations, costs and limitations",
          ],
          [
            "5. Dated journal",
            "Demo/observation decisions, skips, errors, status/fill evidence and version links",
          ],
          [
            "6. Performance review",
            "Complete net measures, valuation path, process findings, uncertainty and decision",
          ],
          [
            "7. Risk/scam-awareness check",
            "Hypothetical provider/entity checks and explanation of guarantees, bots and challenge risks",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Deliverable one should state what happens when a limit is reached, an input is missing or an order cannot be confirmed. Define the account reference, time zone and whether open losses and pending orders count. The chosen numbers are your project assumptions, not universal recommendations.",
      },
      {
        type: "paragraph",
        children:
          "Deliverable two explains what the learner can realistically monitor and when no action is permitted. Deliverable three should let another learner classify a fresh observation without asking what you “felt.” Deliverable four keeps development and evaluation separate and labels simulated fills, incomplete data and any reserved-period reuse honestly.",
      },
      {
        type: "paragraph",
        children:
          "Deliverable five includes skipped candidates and mistakes as well as gains. Deliverable six traces every headline measure back to the ledger and describes what the evidence cannot establish. Deliverable seven uses a hypothetical provider investigation; it does not require registering, paying or giving identity documents to a service.",
      },
      {
        type: "paragraph",
        children:
          "An honest unprofitable or inconclusive study can satisfy the learning purpose. Do not invent profitable results, inflate a demo balance or remove losses to make the portfolio appear successful. If evidence is missing, name the gap and the correction rather than claiming completion of a task that cannot yet be reviewed.",
      },
    ],
  },
  {
    title: "Use a clear graduation review standard",
    shortTitle: "Use a clear graduation review standard",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Review standard for the learning portfolio",
        columns: ["Criterion", "What a satisfactory explanation shows"],
        rows: [
          [
            "Reproducible",
            "Inputs, units, clock and rule version allow another reader to repeat the work",
          ],
          [
            "Complete",
            "All required cases, skips, costs and unresolved items are visible",
          ],
          [
            "Consistent",
            "Price sides, account currency, conversion and denominators reconcile",
          ],
          ["Time-aware", "Only information available at the decision is used"],
          [
            "Risk-aware",
            "Combined exposure, possible worse fills and operational failures are considered",
          ],
          [
            "Honest",
            "Outcome evidence and process quality are separate; limitations are explicit",
          ],
          [
            "Correctable",
            "Errors are dated, fixed and explained without erasing the original record",
          ],
        ],
      },
      {
        type: "example",
        title: "A useful school science result",
        children: [
          "A student in Brazil tests whether a plant grows faster under a particular condition. A carefully recorded result showing no improvement is still good science. Likewise, a complete negative trading study can demonstrate stronger understanding than an unexplained profitable screenshot.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A reviewer can use “evidence shown,” “needs clarification” and “missing” for each criterion. These are review labels for your document, not a new automated website certification system. A missing conversion rate, reused evaluation sample or unsupported fill assumption deserves clarification even if the total is positive.",
      },
      {
        type: "paragraph",
        children:
          "Describe a few errors and how you corrected them. For example, you may have confused ask and bid, deducted spread twice, forgotten a pending order or treated +0.65 as a probability. The correction should show the revised arithmetic and the effect on the conclusion. Hiding the error would weaken the evidence.",
      },
      {
        type: "paragraph",
        children:
          "There is no profit target required to prove learning, no live-money deadline and no promise that a finished portfolio will earn income. Completing foundations demonstrates understanding of these materials under the review evidence, while actual leveraged participation remains a separate decision with additional risks.",
      },
    ],
  },
  {
    title: "Evaluate funded-account challenges without needing to buy one",
    shortTitle: "Evaluate funded-account challenges without needing to buy one",
    blocks: [
      {
        type: "paragraph",
        children:
          "Some services sell evaluation or funded-account arrangements. Their business models and legal terms vary; the name alone does not establish whether activity is simulated, whether actual capital is traded, who owns the account, what regulation applies or when a payment is owed. Understanding this distinction belongs in the risk-awareness deliverable.",
      },
      {
        type: "comparisonTable",
        caption: "Hypothetical challenge due-diligence worksheet",
        columns: ["Term to investigate", "Question to answer from evidence"],
        rows: [
          [
            "Legal entity/jurisdiction",
            "Who contracts with the customer; which official oversight applies to this activity?",
          ],
          [
            "Account environment",
            "Simulated or live; who owns funds and how results are valued?",
          ],
          [
            "Fees/refunds",
            "Upfront, recurring/reset costs and precise refund conditions",
          ],
          [
            "Loss limits",
            "Static/trailing drawdown, balance/equity basis and open-loss treatment",
          ],
          [
            "Clock/reset",
            "Daily boundary, time zone and when thresholds change",
          ],
          [
            "Restrictions",
            "News/weekend holding, automation, copying and prohibited strategies",
          ],
          [
            "Payout",
            "Eligibility, discretion, schedules, verification and grounds for refusal",
          ],
          [
            "Disputes",
            "Documented complaint route, governing terms and realistic remedies",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A trailing drawdown threshold can move with a stated high-water reference, while a static threshold may remain tied to a fixed reference. The definitions vary. A balance-based measure can differ from an equity-based one, and a daily reset can use a provider clock rather than your local midnight. Read worked examples in the actual terms and ask for clarification before assuming what is permitted.",
      },
      {
        type: "example",
        title: "The competition entry fee",
        children: [
          "A learner in South Africa sees a competition with a fee and prize rules. Paying the fee does not guarantee a prize or create a job. A trading evaluation fee likewise does not guarantee a funded account, salary or withdrawal.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Do not assume every arrangement is fraudulent, and do not assume a popular brand or payout screenshot proves reliability. Verify the legal entity and relevant official records independently; registration claims must match the activity and jurisdiction. Terms may change, and a service can refuse an activity under its written conditions even when a learner thinks it was reasonable.",
      },
      {
        type: "paragraph",
        children:
          "No challenge is needed to graduate from PipStart. Keep the exercise hypothetical and compare the claims with documentary evidence. Pressure to pay quickly, recover fees by increasing risk or treat evaluation trading as assured employment conflicts with the course’s careful learning approach.",
      },
    ],
  },
  {
    title: "Recheck scams, automation and persuasive claims",
    shortTitle: "Recheck scams, automation and persuasive claims",
    blocks: [
      {
        type: "paragraph",
        children:
          "A guarantee of high trading returns, a supposed secret institution signal or a bot advertised as removing all losses should trigger careful investigation. Automation can execute instructions; it cannot establish that the instructions have a profitable edge, predict every shock or remove product/counterparty risk. A smooth screenshot may be simulated, selected or fabricated.",
      },
      {
        type: "paragraph",
        children:
          "Distinguish a legitimate educational demonstration from an offer requiring deposits, identity documents, account passwords or payment to unlock a withdrawal. Independently check the provider’s legal name, relevant official register, warning records, permissions and complaint route in the appropriate jurisdiction. The course’s US regulator references illustrate questions, not a claim that US rules govern every reader.",
      },
      {
        type: "example",
        title: "The guaranteed harvest message",
        children: [
          "A worker in India receives a message promising a guaranteed crop return if they pay immediately and recruit friends. The confident wording is not evidence about the farm. A trading message promising effortless profits needs the same independent checks rather than trust in urgency or testimonials.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For the graduation risk-awareness note, explain what information would be checked, what you found in the hypothetical scenario and what remains unknown. Do not submit payment or personal details to prove you completed the task. If a claim cannot be verified independently, record that limitation rather than replacing evidence with a marketer’s answer.",
      },
      {
        type: "paragraph",
        children:
          "When reviewing automated strategies, ask for the exact rule, data period, cost/fill assumptions, all variants tried, drawdown path and genuinely later evidence. A backtest is not a guarantee, an AI label is not proof and a high win rate can coexist with a net loss, as Level 9 showed. Keep essential money and access credentials protected.",
      },
    ],
  },
  {
    title: "Explain one complete learning case aloud",
    shortTitle: "Explain one complete learning case aloud",
    blocks: [
      {
        type: "paragraph",
        children:
          "Choose one hypothetical case from your specification or journal. Explain the pair direction in plain language, which information was available, why the candidate qualified or was skipped, the planned invalidation, size assumptions, complete costs and a possible adverse outcome. Then show how it affects the combined portfolio rather than presenting it alone.",
      },
      {
        type: "example",
        title: "The plain-language walkthrough",
        children: [
          "A learner in Canada says: “This paper case is long EUR/USD, so it buys euro exposure and sells dollar exposure. It uses a stated quote after a completed signal, not a future price. Its loss amount is a scenario with units and conversion, not a guarantee. Two other paper positions also sell USD, so I checked them together.” That is clearer than saying “three diversified trades with a good setup.”",
        ],
      },
      {
        type: "paragraph",
        children:
          "Invite a reviewer to ask where a number came from. If you cannot point to an input, formula, dated record or documented assumption, mark the gap. A strong walkthrough can explain a rejected candidate or a losing case just as well as a gain. The exercise tests understanding, not salesmanship.",
      },
      {
        type: "paragraph",
        children:
          "Keep a final decision that fits the evidence: continue observation, improve a missing input, revise and reserve new data, or stop. None requires a live account. Do not infer that finishing the course removes leverage risk or that the next step must be paid trading.",
      },
      {
        type: "paragraph",
        children:
          "Keep your seven deliverables and this review together so later learning starts from a traceable record. If you need personal financial, legal or tax decisions, seek appropriate qualified help for your circumstances; the classroom examples cannot supply an individual plan.",
      },
    ],
  },
  {
    title: "Practise the whole-account review",
    shortTitle: "Practise the whole-account review",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Long EUR/USD, long GBP/USD and short USD/JPY: which currency direction do all three share?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "They all sell USD exposure. The euro, pound and yen exposures and different sizes still matter; three pair names do not establish diversification.",
      },
      {
        type: "exercise",
        prompt:
          "Planned price losses are C$8, C$10 and C$12; adverse price losses are C$10, C$13 and C$17. Each case has a separate C$1 charge. Calculate both totals and compare with the invented C$35 gate.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Planned after-charge total C$33; adverse after-charge total C$43. The former fits this teaching gate, the latter does not. Revise or skip under the stated policy; the gate is not a universal safe limit.",
      },
      {
        type: "exercise",
        prompt:
          "A 0.05-lot EUR/USD long in a USD account moves from actual entry 1.1003 to actual exit 1.1018, conversion 1. Deduct US$0.50 commission and US$0.20 financing. What is net?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Fifteen pips at US$0.50 per pip gives US$7.50 price profit. Net is US$6.80. The ask/bid-side movement already reflects those sides, so do not subtract the same spread again.",
      },
      {
        type: "exercise",
        prompt:
          "A rule breach earned money, while a correctly followed case lost. Which record demonstrates acceptable process?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The followed case can demonstrate acceptable process despite a normal loss. The profitable breach remains a breach. Review both monetary outcomes and rule-following separately.",
      },
      {
        type: "exercise",
        prompt:
          "Must the seven-part graduation portfolio show profit, buy a challenge or use live money?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. It needs complete, reproducible, honest evidence, including limitations and corrections. Observation/demo and negative results are valid learning evidence; no live account or challenge is required.",
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
          "Reconcile currency exposure, combined after-charge risk scenarios, margin and execution records.",
          "Separate process quality from outcomes in a complete dated journal and performance review.",
          "Assemble seven reproducible graduation deliverables and critically examine provider and challenge claims.",
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
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
          {
            title: "CME Group — Proper Position Size",
            url: "https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size",
          },
          {
            title: "MetaTrader 5 — Executing Trades and account information",
            url: "https://www.metatrader5.com/en/terminal/help/trading/performing_deals",
          },
          {
            title: "CME Group — Keep a Trade Log",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/keep-a-trade-log",
          },
          {
            title: "CFTC — Forex fraud",
            url: "https://www.cftc.gov/LearnAndProtect/forexfrauds",
          },
          {
            title: "CFTC — AI will not turn trading bots into money machines",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/AITradingBots.html",
          },
        ],
      },
    ],
  },
];
