import type { LessonSection } from "../../lesson-content";

export const howThinkingCanGoWrongSections: LessonSection[] = [
  {
    title: "Treat a bias as a pattern to check",
    shortTitle: "Treat a bias as a pattern to check",
    blocks: [
      {
        type: "paragraph",
        children:
          "A cognitive bias is a recurring tendency in how information is selected, remembered or interpreted. It can affect a decision without the person intending to be careless. In this course, the labels help ask better questions about a record. They are not diagnoses, insults or proof that a particular person always thinks incorrectly.",
      },
      {
        type: "paragraph",
        children:
          "Separate the observation from your explanation. “I kept only winning screenshots” is a checkable action. “Confirmation bias may have affected my selection” is a possible explanation. The remedy starts with preserving the missing observations and applying the same selection rule. Calling someone biased does not repair the dataset.",
      },
      {
        type: "example",
        title: "The café that is always slow",
        children: [
          "A customer in France remembers one delayed meal and forgets three quick visits. A dated log could reveal whether “always slow” fits the full record. A learner who remembers only dramatic chart reactions needs the same habit of checking what was omitted.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Several patterns can overlap. A favourite entry price may become an anchor; an uncomfortable loss may encourage delaying an exit; selected screenshots may support the story that the delay was sensible. Use the labels to identify where the process needs evidence, not to invent one psychological explanation for every price outcome.",
      },
    ],
  },
  {
    title: "Know the research background and its limits",
    shortTitle: "Know the research background and its limits",
    blocks: [
      {
        type: "paragraph",
        children:
          "Researchers have studied judgement and decisions under uncertainty for many decades. Daniel Kahneman and Amos Tversky made influential contributions, including their 1979 paper introducing prospect theory. That work examined how choices can depend on gains and losses relative to a reference point and on how uncertain outcomes are evaluated. It is part of the background to behavioural economics and finance, not a trading strategy.",
      },
      {
        type: "paragraph",
        children:
          "There is no single founder of all trading psychology. Different researchers, educators and market participants contributed to the subject. Findings from a study with a particular task or population do not automatically tell you an individual learner’s next action, and they cannot forecast a currency pair. Avoid turning a memorable research result into a fixed rule that all people feel losses by an exact multiple.",
      },
      {
        type: "example",
        title: "Knowing the name does not solve the exercise",
        children: [
          "A student in Germany learns the name of a maths error but still needs to check their own calculation. Likewise, learning “loss aversion” or “confirmation bias” gives you a question to investigate; it does not prove that your decisions are now immune to the pattern.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Use primary references to understand the original work and its context. For practice, focus on the evidence you can save: a time-stamped plan, the complete sample, quotes, changes and outcomes. A research concept should make the review more careful rather than replace that evidence.",
      },
    ],
  },
  {
    title: "Catch confirmation bias in evidence selection",
    shortTitle: "Catch confirmation bias in evidence selection",
    blocks: [
      {
        type: "paragraph",
        children:
          "Confirmation bias can appear when you search for, prefer or interpret information that supports an existing view while giving less attention to conflicting information. A learner who expects EUR/USD to rise may keep every rising example and dismiss a similar failure as “not really the setup.” The selected record then becomes difficult to challenge.",
      },
      {
        type: "example",
        title: "The favourite café gets special excuses",
        children: [
          "A customer in Canada gives their favourite café an excuse for every delayed order but criticises another café for the same delay. Applying the same timing rule to both cafés makes the comparison fairer. In a chart study, apply the eligibility definition to favourable and unfavourable cases alike.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Check the selection before the outcome",
        columns: ["Question", "Evidence to keep"],
        rows: [
          ["What qualified?", "Exact rule and information cutoff"],
          [
            "What contradicted the idea?",
            "Relevant dated facts, not only supportive comments",
          ],
          [
            "Were similar failures included?",
            "All eligible cases under the same rule",
          ],
          ["Was a case excluded?", "Predeclared exclusion rule and reason"],
          ["Was the rule changed?", "Separate version and change time"],
          [
            "What remains unresolved?",
            "Unknown data, ambiguous sequence or missing assumptions",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "An alternative view is not automatically correct because it disagrees with yours. Assess relevance, source quality and available information consistently. A rumour does not deserve equal weight with an official release merely to make the notebook look balanced. The aim is a fair test, not equal space for every claim.",
      },
    ],
  },
  {
    title: "Make a competing explanation explicit",
    shortTitle: "Make a competing explanation explicit",
    blocks: [
      {
        type: "paragraph",
        children:
          "Before looking at the later chart, write the strongest relevant reason your idea might fail. Name a condition that could invalidate it and a reasonable alternative explanation. If every possible observation is described as supporting the idea, the idea is not currently testable. Leave room for “unclear” instead of forcing each case into a favourable story.",
      },
      {
        type: "example",
        title: "Two explanations for a shop’s sales",
        children: [
          "A shop in Brazil sells more umbrellas in one week. The owner might credit a new display, but unusually rainy weather is another possibility. A dated comparison cannot automatically prove which caused the increase. A currency move likewise may have several plausible influences.",
        ],
      },
      {
        type: "paragraph",
        children:
          "For a Forex observation, write “EUR/USD’s selected daily highs rose; an hourly close below the chosen reference would weaken this particular continuation description.” Keep the pair, source, price side, timeframe and cutoff. A later weakening condition is a new fact, not a reason to move the old reference out of the way.",
      },
      {
        type: "paragraph",
        children:
          "If a commentator agrees with your interpretation, that agreement is not independent confirmation of every input. Check whether the commentator uses the same data and may be repeating the same source. If the contrary case exposes missing information, resolve the input or keep the observation unclassified. You do not need to force an order while the explanation is unsettled.",
      },
    ],
  },
  {
    title: "Keep recency in proportion to the whole record",
    shortTitle: "Keep recency in proportion to the whole record",
    blocks: [
      {
        type: "paragraph",
        children:
          "Recency bias gives the latest experiences too much influence relative to the wider relevant record. Three wins can feel like permanent skill; three losses can feel like permanent failure. Neither short run alone establishes a stable pattern or says what will happen next. Outcomes, sizes, costs, definitions and market conditions all need context.",
      },
      {
        type: "example",
        title: "Three sunny days are not a whole season",
        children: [
          "A family in South Africa sees three sunny days and forgets the earlier rainy weeks. Planning every future outing on that short run may be misleading. A demo learner should also avoid replacing the complete notebook with the last few memorable outcomes.",
        ],
      },
      {
        type: "paragraph",
        children:
          "In this example, an Argentina-based learner sees three winning EUR/USD demo trades and calls the method reliable. The next ten could differ, and even the earlier three may omit fees or rule breaches. Keep all qualifying cases and distinguish observation dates from the time the result became known. A win count without losses, sizes or costs is incomplete.",
      },
      {
        type: "paragraph",
        children:
          "Recent information can genuinely matter when conditions change. The answer is not to ignore it. Compare the new evidence with the stated method, note what changed and schedule a versioned review. Do not infer that a new spread regime or product change is irrelevant simply because an older sample was larger. Recency and relevance are different questions.",
      },
    ],
  },
  {
    title: "Distinguish loss aversion, sunk costs and exit rules",
    shortTitle: "Distinguish loss aversion, sunk costs and exit rules",
    blocks: [
      {
        type: "paragraph",
        children:
          "Loss aversion describes a tendency for losses to carry more weight than comparable gains around a reference point. It does not mean every person responds identically in every situation. The disposition effect describes a pattern of holding losing investments too long and selling winners too soon. These concepts can help investigate an exit decision, but the written rule and facts still determine what actually happened.",
      },
      {
        type: "paragraph",
        children:
          "Sunk-cost reasoning is related but different: treating a cost already incurred as a reason to commit more now, even though that past cost cannot be recovered by wishing. A learner may say “I spent hours finding this trade, so I must keep it.” Study time already spent does not make the current price condition true or remove the current risk.",
      },
      {
        type: "example",
        title: "The broken phone",
        children: [
          "A person in Italy keeps an unused broken phone because admitting the purchase was disappointing feels uncomfortable. Keeping it does not restore its value. In a demo position, refusing to acknowledge an adverse result likewise does not change the current quote or the account exposure.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Not every long holding period or early exit proves a bias. A plan may contain a legitimate time exit or management rule. Compare the action with the prewritten conditions, source and decision time before interpreting it. Do not automatically reverse your decision merely because it resembles a textbook example; first identify whether the necessary rule or information was present.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Avoid removing or widening an exit solely to hide a loss, or treating “unrealised” as “not economically relevant.” Open losses and margin exposure matter. Stops, modifications and close requests remain subject to product and execution rules.",
        ],
      },
    ],
  },
  {
    title: "Notice anchoring on an entry or balance",
    shortTitle: "Notice anchoring on an entry or balance",
    blocks: [
      {
        type: "paragraph",
        children:
          "Anchoring means relying too heavily on an initial number or reference when judging later information. The entry price, yesterday’s high or a preferred account balance can become an emotional anchor. A learner may insist on waiting until price returns to entry even when the current plan no longer supports the position.",
      },
      {
        type: "example",
        title: "The old price tag",
        children: [
          "A shopper in the United States remembers an item’s earlier US$100 price and judges every later offer only against that number. The item’s current usefulness and alternatives still matter. A trading entry price is also one historical number, not a promise that the market will return to it.",
        ],
      },
      {
        type: "paragraph",
        children:
          "An entry price is relevant to cash-result arithmetic, but relevance to arithmetic is different from evidence about future movement. Similarly, the previous account peak is relevant to a drawdown record, not a repayment target the market owes. Reassess a candidate using current permitted information and the original rule rather than demanding a particular recovery path.",
      },
      {
        type: "learningLink",
        title: "Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Enter an invented USD starting reference of 1,000 and a 20% drawdown. It shows US$200 lost, US$800 remaining and a 25% gain needed to return to 1,000 before other flows or costs. This is recovery arithmetic, not a reason to increase risk or a prediction of when recovery will happen.",
      },
      {
        type: "paragraph",
        children:
          "A reference point needs a definition. A peak-equity record differs from an initial-deposit comparison, and deposits or withdrawals complicate naive balance comparisons. Keep the reference, cash flows and valuation time beside the number. Psychology labels cannot fix an incorrectly defined account metric.",
      },
    ],
  },
  {
    title: "Avoid the claim that a win is due",
    shortTitle: "Avoid the claim that a win is due",
    blocks: [
      {
        type: "paragraph",
        children:
          "The gambler’s fallacy treats a sequence of previous outcomes as if it forces a compensating next outcome when that reasoning is unsupported. In a classroom experiment with independent fair coin tosses, the next toss remains 50% heads after several tails. The coin has no obligation to balance a short run immediately.",
      },
      {
        type: "example",
        title: "The coin exercise has a limited purpose",
        children: [
          "A learner in the United Kingdom flips an explicitly assumed fair, independent coin and sees four tails. The next head probability in that model remains one half. This demonstrates independence; it does not assert that Forex trades are coin flips or have a known 50% win probability.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Real trading outcomes may be dependent, affected by changing conditions or generated by inconsistent rules. Therefore neither “the next win is due” nor “the next chance is always 50%” follows from a recent trading streak. You need a stated method, valid data and appropriate analysis before estimating probabilities. One streak alone cannot supply them.",
      },
      {
        type: "paragraph",
        children:
          "Doubling after losses changes the cash exposure, not the missing evidence. A position-size tool can calculate a chosen scenario, but it cannot establish that a recovery is more likely now. Follow the earlier loss gates and pause conditions rather than treating a streak as permission to escalate.",
      },
    ],
  },
  {
    title: "Keep hindsight and outcome bias separate",
    shortTitle: "Keep hindsight and outcome bias separate",
    blocks: [
      {
        type: "paragraph",
        children:
          "Hindsight bias makes a completed event feel more obvious or predictable than it was beforehand. Outcome bias judges the quality of a decision mainly from the result rather than the information and rules available when the decision was made. They can occur together: a winning chart looks obvious, and an unplanned entry is then praised because it won.",
      },
      {
        type: "comparisonTable",
        caption: "Two review questions, not one",
        columns: [
          "Decision process",
          "Later teaching result",
          "What can be concluded",
        ],
        rows: [
          [
            "Written rule followed",
            "Gain",
            "Rule-following case with a gain; not proof of an edge",
          ],
          [
            "Written rule followed",
            "Loss",
            "Rule-following case with a loss; not proof of personal failure",
          ],
          [
            "Written rule breached",
            "Gain",
            "Breach remains; gain does not validate the change",
          ],
          [
            "Written rule breached",
            "Loss",
            "Record breach and loss; identify the specific process error",
          ],
        ],
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-8/process-and-outcome.svg",
        desktopSrc:
          "/images/lessons/forex/level-8/process-and-outcome-desktop.svg",
        width: 720,
        height: 400,
        alt: "Four separate cards show rule followed/breached crossed with later gain/loss.",
        caption:
          "Assess the available-data decision and the later result separately. Neither one case nor consistent rule-following proves that the method is profitable.",
      },
      {
        type: "paragraph",
        children:
          "Save an unannotated chart or data snapshot at the cutoff when possible, then add the later outcome separately. A completed swing marked at an earlier candle may have required later confirmation. A revised release number may not have been available initially. Hindsight is reduced by keeping these timestamps visible, not by pretending the full later chart existed at the start.",
      },
      {
        type: "example",
        title: "The exam answer looks easy afterward",
        children: [
          "An Australian student sees the solution and says the question was obvious. Their earlier working shows where they were unsure. A before-and-after record helps a learner respect the uncertainty that existed at the decision time.",
        ],
      },
    ],
  },
  {
    title: "Check overconfidence and social proof",
    shortTitle: "Check overconfidence and social proof",
    blocks: [
      {
        type: "paragraph",
        children:
          "Overconfidence can appear when a learner treats limited evidence as a stronger demonstration than it is: “I understand the chart, so my fill will be exact,” or “three wins prove my forecast.” Confidence may make a task feel easier, but it does not establish the reliability of the data, method or execution. Keep uncertainty and alternative outcomes in the worksheet.",
      },
      {
        type: "example",
        title: "A busy restaurant is not a guarantee",
        children: [
          "A traveller in Japan sees a queue outside a restaurant and assumes every meal will suit them. The queue is one observation, not a full quality report. A large following or many agreeing messages can similarly create social proof without verifying a trading claim.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A familiar home currency may feel safer because its name is comfortable, but the pair, product, leverage and exposure still matter. A popular commentator may omit losses or receive compensation. Verify claims with complete records and credible sources; do not infer that popularity, familiarity or confident presentation supplies the missing denominator.",
      },
      {
        type: "paragraph",
        children:
          "Ask “What would change my conclusion?” and “What has not been measured?” A useful answer may mention costs, sample selection, future information, changing spreads or ambiguous fills. That is a better record than attaching an impressive label to a few screenshots. Do not assume that simply learning about biases makes you immune to them.",
      },
    ],
  },
  {
    title: "Keep the denominator and the costs",
    shortTitle: "Keep the denominator and the costs",
    blocks: [
      {
        type: "paragraph",
        children:
          "A denominator is the total number of relevant cases used in a comparison. Eight selected winning screenshots do not describe twenty eligible observations. Keep the selection rule, total sample, sizes, results and costs so a reader can see what was omitted. Count eligible observations and actual executions separately when some cases are skipped.",
      },
      {
        type: "comparisonTable",
        caption: "Invented equal-size set of 20 completed demo cases",
        columns: [
          "Part of the set",
          "Count",
          "Price result per case",
          "Price subtotal",
        ],
        rows: [
          ["Winners", "8", "+US$8", "+US$64"],
          ["Losers", "12", "−US$6", "−US$72"],
          ["All cases", "20", "Mixed", "−US$8 before charges"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Assume a separate invented US$0.50 charge for every completed case and no other costs: charges are 20 × 0.50 = US$10, so net result is −US$18. The selected eight screenshots would hide twelve losses and the charges. The full set still does not prove future performance; it merely makes this particular example’s arithmetic honest.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "For supported EUR/USD, USD account, conversion 1 and 0.01 lot: long entry 1.1000/exit 1.1080 gives +US$8 price result; entry 1.1000/exit 1.0940 gives −US$6. Use these to check the table’s invented equal-size cases, then subtract the stated separate charges in the worksheet.",
      },
      {
        type: "paragraph",
        children:
          "Do not count a chart-only skip as an executed zero-profit trade unless that is explicitly the metric being studied. A missing result, ambiguous intrabar path and a confirmed loss are also different categories. Later strategy lessons will examine larger samples and evaluation measures. Here, the essential habit is to preserve the full denominator and its definitions.",
      },
    ],
  },
  {
    title: "Use a result-hidden review and versioned corrections",
    shortTitle: "Use a result-hidden review and versioned corrections",
    blocks: [
      {
        type: "paragraph",
        children:
          "Ask a reviewer to assess the rule evidence before seeing the outcome where practical. Share the cutoff chart, rule version and worksheet with private details removed. Can they tell whether the candidate qualified and which gates passed? Then reveal the outcome and discuss what changed. This reduces one source of outcome influence; it is not a perfect blind experiment or proof of an edge.",
      },
      {
        type: "example",
        title: "The Argentina journal gets a second reader",
        children: [
          "The Argentina-based learner shares five EUR/USD demo entries without saying which won. A friend cannot identify the entry condition in two records. The first correction is clearer evidence, not searching for more flattering charts. Include losses and skips in later review, and do not share passwords or account identifiers.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A correction to a factual error needs a dated note preserving the original where possible. A method change needs a new version: what changed, why, when and which earlier observations used the old definition. Do not apply a better-looking rule retrospectively and report the old cases as though that rule was used at the time.",
      },
      {
        type: "paragraph",
        children:
          "New information may justify changing the plan. Good discipline includes reviewing a flawed plan, not defending it forever. Keep the review separate from an urgent open-position decision and follow existing exposure procedures while changes are considered. Do not credit every winning revision to skill or blame every original loss on a bias without checking the evidence.",
      },
    ],
  },
  {
    title: "Practise a fair interpretation",
    shortTitle: "Practise a fair interpretation",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A French learner keeps eight winning screenshots from twenty eligible demo cases and claims a perfect record. What is missing?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "The other twelve eligible observations, the consistent eligibility rule, sizes, outcomes, costs and any skips/ambiguities. Eight selected successes cannot establish a 100% record for the full set.",
      },
      {
        type: "exercise",
        prompt:
          "In the invented table, eight gains are US$8 each and twelve losses are US$6 each, with US$0.50 charged for all twenty cases. What is the net result?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "64 − 72 − 10 = −US$18. The example uses equal size and separate stated charges; it is not a forecast of the method’s next result.",
      },
      {
        type: "exercise",
        prompt:
          "A learner loses four times, then says a win is due. Does the streak prove that?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Previous losses alone do not establish a compensating next win. A fair independent coin model retains 50%, but real Forex trade probabilities are not established by that analogy.",
      },
      {
        type: "exercise",
        prompt:
          "An entry breaks the written rule but later gains. Is the entry process now rule-following?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Record the breach and gain separately. A favourable outcome does not change the information or permission available at the entry time.",
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
          "Recognise evidence-selection, recency, loss, anchoring and hindsight patterns without diagnosing a person.",
          "Keep the full sample, costs and available-data decision separate from the later outcome.",
          "Use competing explanations, result-hidden review and versioned corrections honestly.",
        ],
        closing: [
          "Keep the original plan and information cutoff. Record feelings, actions, process quality and later outcomes separately, including skips and uncertainties.",
        ],
      },
      {
        type: "riskNotice",
        children:
          "All prices, balances, thresholds and schedules are invented teaching examples, not trade recommendations or universal safe limits. Psychology knowledge, routines and rule-following do not guarantee profit, exact fills or a maximum loss. Leverage, costs, conversion, gaps and product terms matter. Keep essential money outside trading experiments. This course is educational, not mental-health treatment.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "Before you mark this lesson complete",
        points: [
          "I can distinguish a fact, a feeling, an urge and an action.",
          "I can compare the decision with the saved rule without using the later outcome.",
          "I can keep all relevant records, costs, skips and uncertainties visible.",
          "I can explain a valid pause or no-action reason.",
          "I can use the highlighted tools as arithmetic checks and state their limitations.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title:
              "Kahneman and Tversky (1979) — Prospect Theory: An Analysis of Decision under Risk",
            url: "https://www.jstor.org/stable/1914185",
          },
          {
            title: "Investor.gov — Behavioral Patterns of U.S. Investors",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-72",
          },
          {
            title: "CME Group — Risk Management and Your Trade Plan",
            url: "https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan",
          },
          {
            title:
              "Investor.gov — Risks of short-term trading based on social media",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/investor-alert-thinking-about-investing-latest-hot-stock-understand-significant-risks-short-term",
          },
        ],
      },
    ],
  },
];
