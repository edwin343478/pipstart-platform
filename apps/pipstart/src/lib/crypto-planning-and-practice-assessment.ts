import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoPlanningPracticeQuizV1: AssessmentDefinition = {
  id: "crypto-planning-and-practice-quiz",
  version: 1,
  title: "Psychology Planning and Paper Practice quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-planning-and-practice",
  moduleId: "psychology-planning-and-paper-practice",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Behavioral_Decision_Theory/Kahneman_Tversky_1979_Prospect_theory.pdf",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
      "https://www.fca.org.uk/investsmart/investing-crypto",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://www.sec.gov/newsroom/press-releases/2023-59",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/social-media-and-investment-fraud-investor-alert",
      "https://www.fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media",
      "https://www.nobelprize.org/prizes/economic-sciences/2002/press-release/",
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-72",
      "https://www.fca.org.uk/publications/fca-research/research-note-cryptoassets-consumer-research-2024",
      "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
      "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
      "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
      "https://scholarworks.wmich.edu/math_pubs/42/",
      "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
      "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
      "https://docs.glassnode.com/basic-api/endpoints/entities",
      "https://www.fca.org.uk/consumers/cryptoassets",
      "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
      "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    ],
  },
  questions: [
    {
      id: "crypto-planning-and-practice-1",
      prompt:
        "Omar in Jeddah sees an invented coin jump 35% in one evening. Two friends post their profits in a group chat, but Omar has learned nothing new about the coin itself. He feels he must buy before bedtime. What is the best description of what is happening, and the most sensible response?",
      explanation:
        "Correct choice: This is FOMO: speed and other people's gains with no new information. He should record the feeling and apply his cooling-off rule rather than buy now.\n\nFear of missing out typically arrives with a fast move, other people's gains and nothing new about the asset; urgency cannot answer whether the coin passes his checks. The answer “The price jump is new information about the coin, so buying quickly is the disciplined choice” is tempting because the price did move, but a price change alone says nothing about whether the coin fits his plan or checklist.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "The price jump is new information about the coin, so buying quickly is the disciplined choice.",
        },
        {
          id: "b",
          label:
            "This is FOMO: speed and other people's gains with no new information. He should record the feeling and apply his cooling-off rule rather than buy now.",
        },
        {
          id: "c",
          label: "This is FUD, so he should sell any coins he already holds.",
        },
        {
          id: "d",
          label:
            "His friends' profits prove the coin will keep rising, so the only risk is waiting.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-planning-and-practice-2",
      prompt:
        "Yuki in Kyoto holds an invented token. A post says her national regulator has added the token's platform to its warning list, and the token's community replies \"ignore it, that's FUD\". What should she do?",
      explanation:
        "Correct choice: Check the regulator's own website; if the warning is there, treat it as evidence, not FUD.\n\n\"That's FUD\" is a label, not evidence, and a regulator's warning does not become false because a community dislikes it; checking the primary source settles the question. The answer “Trust the community, because people who hold the token know it best” is tempting because communities sound confident, but holders have every reason to wave criticism away.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Check the regulator's own website; if the warning is there, treat it as evidence, not FUD.",
        },
        {
          id: "b",
          label:
            "Sell everything immediately, because every negative post is true.",
        },
        {
          id: "c",
          label:
            "Wait until the price falls before deciding whether the warning matters.",
        },
        {
          id: "d",
          label:
            "Trust the community, because people who hold the token know it best.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-planning-and-practice-3",
      prompt:
        "Liam in Brisbane has an account worth A$600 (an invented amount) and is thinking of joining a signal group that costs A$30 a month. What is the monthly cost drag, and what would a year cost as a share of the account?",
      explanation:
        "Correct choice: 5% a month; A$360 a year, or 60% of the account\n\nMonthly cost drag = A$30 ÷ A$600 × 100 = 5%, and 12 × A$30 = A$360, which is 60% of A$600, before any trade wins or loses. The answer “20% a month; A$360 a year, or 60% of the account” is tempting because the yearly figure is right, but it divides the account by the fee (600 ÷ 30 = 20) instead of the fee by the account.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.5% a month; A$36 a year, or 6% of the account",
        },
        {
          id: "b",
          label: "5% a month; A$60 a year, or 10% of the account",
        },
        {
          id: "c",
          label: "5% a month; A$360 a year, or 60% of the account",
        },
        {
          id: "d",
          label: "20% a month; A$360 a year, or 60% of the account",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-planning-and-practice-4",
      prompt:
        'Pedro in Recife holds two invented coins. One is up 40% and the other is down 45%. He sells the winner "before it disappears" and keeps the loser "because selling would make the loss real". Which pattern does this show?',
      explanation:
        "Correct choice: The disposition effect, driven by loss aversion\n\nThe disposition effect is selling winners too soon and holding losers too long, and loss aversion makes turning a paper loss into a real one feel especially painful. The answer “The gambler's fallacy” is tempting because Pedro hopes the loser will recover, but the gambler's fallacy is about believing a run of outcomes makes the opposite \"due\".",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Herding",
        },
        {
          id: "b",
          label: "Survivorship bias",
        },
        {
          id: "c",
          label: "The disposition effect, driven by loss aversion",
        },
        {
          id: "d",
          label: "The gambler's fallacy",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-planning-and-practice-5",
      prompt:
        'Hannah in Frankfurt has spent eight months and €200 in fees on an invented project. The team has stopped posting updates and liquidity is shrinking. She says, "I\'ve put too much in to stop now." Which bias is this, and which question helps?',
      explanation:
        'Correct choice: The sunk-cost fallacy; she should ask, "What would I do if I found this project today, starting fresh?"\n\nThe €200 and the eight months are gone whatever she does next, so they are no reason to add more; the fresh-start question takes them out of the decision. The answer “Anchoring; she should wait until the price returns to her entry” is tempting because both involve the past, but anchoring is about fixing on an earlier number such as a price, not on effort or costs already spent.',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Confirmation bias; she should read only posts that support the project.",
        },
        {
          id: "b",
          label:
            "Recency bias; she should look only at the last week of price data.",
        },
        {
          id: "c",
          label:
            'The sunk-cost fallacy; she should ask, "What would I do if I found this project today, starting fresh?"',
        },
        {
          id: "d",
          label:
            "Anchoring; she should wait until the price returns to her entry.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-planning-and-practice-6",
      prompt:
        "Arif in Surabaya hears that a colleague turned Rp1,000,000 into Rp40,000,000 (invented amounts) on a memecoin. He feels foolish for missing it. Which question best protects him from survivorship bias?",
      explanation:
        "Correct choice: How many people bought comparable tokens and lost, and how were cases selected for the story?\n\nLooking only at visible survivors omits the unsuccessful cases. Even an independently verified success does not establish the frequency or odds of success. A screenshot alone may not verify even that one result.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: '"Which memecoin should I buy next to catch up?"',
        },
        {
          id: "b",
          label: '"Did my colleague post a screenshot of the gain?"',
        },
        {
          id: "c",
          label: '"Is my colleague more experienced than me?"',
        },
        {
          id: "d",
          label:
            "How many people bought comparable tokens and lost, and how were cases selected for the story?",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-planning-and-practice-7",
      prompt:
        "What makes a decision journal different from an ordinary transaction record?",
      explanation:
        'Correct choice: It records why you decided, what you knew and how you felt at the time, with the later outcome added in a separate field.\n\nTransaction records show what happened; the journal records your reasons, evidence, feelings and expectations at the time, so you can review your thinking without hindsight. The answer “It is rewritten after each result so that the reasons match what happened” is tempting because it keeps the journal "accurate", but editing earlier reasons after the result destroys exactly what the journal is for.',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It lists only profitable trades, so you can repeat them.",
        },
        {
          id: "b",
          label:
            "It is rewritten after each result so that the reasons match what happened.",
        },
        {
          id: "c",
          label:
            "It records why you decided, what you knew and how you felt at the time, with the later outcome added in a separate field.",
        },
        {
          id: "d",
          label: "It replaces the need to keep dates, amounts and fees.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-planning-and-practice-8",
      prompt:
        "Nisha in Chennai's written plan bans buying any token she first heard about that day. She breaks the rule after a group-chat tip, and the token rises 30%. How should she classify this at her review?",
      explanation:
        "Correct choice: A broken rule with a good outcome: it stays a breach, and the gain does not prove the rule was wrong.\n\nRecord the gain and the rule breach separately. A favourable outcome does not show that the procedure was followed or that the rule is unnecessary. Revising a rule requires a deliberate evidence-based review, not retrospective relabeling of this action.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "A broken rule with a good outcome: it stays a breach, and the gain does not prove the rule was wrong.",
        },
        {
          id: "b",
          label: "A good decision, because the outcome was a gain.",
        },
        {
          id: "c",
          label: "Proof that her cooling-off rule should be removed.",
        },
        {
          id: "d",
          label: "An unclear entry that should be left out of the review.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-planning-and-practice-9",
      prompt:
        'Diego in Rosario paper-tests the rule "buy whenever the price falls 20% in a week" for three months. Afterwards he sees that "25%" would have looked better, so he changes the number and reports the old three months as if the new rule had been tested. What is wrong?',
      explanation:
        "Correct choice: He has used hindsight; a changed rule needs a new version and a new test period that starts after the change.\n\nRules must be written before a test, and applying a better-looking rule to old dates is hindsight, not evidence. The answer “Nothing, because the new rule uses the same data” is tempting because the data are the same, but that is exactly the problem: the new rule was chosen because it fitted results he had already seen.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "He has used hindsight; a changed rule needs a new version and a new test period that starts after the change.",
        },
        {
          id: "b",
          label: "Paper tests are not allowed to use percentages.",
        },
        {
          id: "c",
          label: "He should have tested the rule with real money instead.",
        },
        {
          id: "d",
          label: "Nothing, because the new rule uses the same data.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-planning-and-practice-10",
      prompt:
        "Sophie in Marseille reviews 15 journal entries for the quarter: 10 followed her plan, 3 broke it, and 2 have no time recorded, so she cannot tell. How should she report her process-followed rate?",
      explanation:
        "Correct choice: 10 ÷ 13 ≈ 77% of 13 assessable entries, keeping the 2 unclear entries visible.\n\nThe rate uses the entries she can assess (10 + 3 = 13), so 10 ÷ 13 × 100 ≈ 77%, and the two unclear entries stay visible rather than hidden or counted as successes. The answer “12 ÷ 15 = 80%, counting the unclear entries as followed” is tempting because it gives a higher number, but missing evidence cannot be treated as a confirmed rule-following decision.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "10 ÷ 15 ≈ 67% of all entries, ignoring the unclear ones.",
        },
        {
          id: "b",
          label:
            "10 ÷ 13 ≈ 77% of 13 assessable entries, keeping the 2 unclear entries visible.",
        },
        {
          id: "c",
          label: "12 ÷ 15 = 80%, counting the unclear entries as followed.",
        },
        {
          id: "d",
          label: "10 ÷ 3 ≈ 333%, comparing followed with broken.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-planning-and-practice-11",
      prompt:
        "Ahmed in Dammam notices that he is losing sleep checking prices, has started thinking about borrowing to win back a loss, and is hiding his activity from his family. According to the course, what is the most sensible step?",
      explanation:
        "Correct choice: Pause all new crypto decisions under his stop conditions, follow his existing exit and security rules, and talk to someone he trusts or a support service.\n\nThese are clear stop signs, and pausing means no new decisions until written restart conditions are met, while support from trusted people or services is a sensible step, not a failure. The answer “Sell every holding immediately in a panic to end the stress” is tempting because it ends the activity, but a pause is a plan, not a panic, and it does not require hurried selling.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Borrow a small amount to recover the loss quickly, then stop.",
        },
        {
          id: "b",
          label: "Sell every holding immediately in a panic to end the stress.",
        },
        {
          id: "c",
          label:
            "Increase his trading so that he can recover faster and sleep better.",
        },
        {
          id: "d",
          label:
            "Pause all new crypto decisions under his stop conditions, follow his existing exit and security rules, and talk to someone he trusts or a support service.",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-planning-and-practice-12",
      prompt:
        "A rule-breaking action makes money. What should the journal record?",
      explanation:
        "Correct choice: The gain and the rule breach separately\n\nThe gain and the rule breach separately. Outcome cannot certify adherence.\n\nOnly the gain. That hides the process issue.\n\nThe action followed the rule because it won. Success does not retroactively change the instruction.\n\nNo entry because it was profitable. All relevant observations belong in the sample.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The gain and the rule breach separately",
        },
        {
          id: "b",
          label: "Only the gain",
        },
        {
          id: "c",
          label: "The action followed the rule because it won",
        },
        {
          id: "d",
          label: "No entry because it was profitable",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-planning-and-practice-13",
      prompt: "Which test specification is missing a critical field?",
      explanation:
        "Correct choice: Buy when the trend looks strong and exit when it feels weak\n\nRecord fee and fill assumptions. These support net feasibility.\n\nDo nothing when required data is absent. That is an explicit no-action rule.\n\nBuy when the trend looks strong and exit when it feels weak. The signal and exit are not reproducible conditions.\n\nUse a named pair and UTC intervals. These define environment and timing.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Record fee and fill assumptions",
        },
        {
          id: "b",
          label: "Do nothing when required data is absent",
        },
        {
          id: "c",
          label: "Buy when the trend looks strong and exit when it feels weak",
        },
        {
          id: "d",
          label: "Use a named pair and UTC intervals",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-planning-and-practice-14",
      prompt:
        "A researcher tunes a rule repeatedly after inspecting the holdout. What happened?",
      explanation:
        "Correct choice: The holdout influenced development\n\nThe holdout influenced development. It is no longer untouched evaluation evidence.\n\nIndependence increased automatically. Repeated tuning weakens the separation.\n\nThe old results became real trades. A simulation remains a simulation.\n\nAll future uncertainty disappeared. Selection and changing conditions remain.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The holdout influenced development",
        },
        {
          id: "b",
          label: "Independence increased automatically",
        },
        {
          id: "c",
          label: "The old results became real trades",
        },
        {
          id: "d",
          label: "All future uncertainty disappeared",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-planning-and-practice-15",
      prompt:
        "Six gross wins of USD 20 and four gross losses of USD 40, with USD 1 cost per trade, produce what net result?",
      explanation:
        "Correct choice: Negative USD 50\n\nNegative USD 40. That excludes the costs.\n\nPositive USD 120. That counts gains while omitting losses and costs.\n\nNegative USD 50. 120 minus 160 minus 10 equals negative 50.\n\nPositive USD 60. A 60 percent win rate is not a USD result.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Negative USD 40",
        },
        {
          id: "b",
          label: "Positive USD 120",
        },
        {
          id: "c",
          label: "Negative USD 50",
        },
        {
          id: "d",
          label: "Positive USD 60",
        },
      ],
      correctChoiceIds: ["c"],
    },
  ],
};
