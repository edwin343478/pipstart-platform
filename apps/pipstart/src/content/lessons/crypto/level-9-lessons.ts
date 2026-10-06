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
  course: "crypto-planning-and-practice",
  description: "Recognise a decision trigger and choose a deliberate response.",
  estimatedMinutes: 32,
  learningPath: "crypto",
  level: "level-9",
  module: "psychology-planning-and-paper-practice",
  objectives: [
    "Recognise a decision trigger and choose a deliberate response.",
  ],
  position: 1,
  prerequisites: ["dca-rebalancing-exits-and-useful-records"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["write-a-crypto-plan-and-define-testable-rules"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Recognise a decision trigger and choose a deliberate response.",
  seoTitle: "Emotions Biases and Attention in Crypto Markets",
  slug: "emotions-biases-and-attention-in-crypto-markets",
  sources: [
    {
      title:
        "Daniel Kahneman and Amos Tversky  Prospect Theory An Analysis of Decision under Risk",
      url: "https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Behavioral_Decision_Theory/Kahneman_Tversky_1979_Prospect_theory.pdf",
    },
    {
      title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
    },
    {
      title: "FCA  Investing in crypto",
      url: "https://www.fca.org.uk/investsmart/investing-crypto",
    },
    {
      title: "FINRA  Crypto Assets",
      url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
    },
    {
      title:
        "US SEC  US SEC — SEC Charges Crypto Entrepreneur Justin Sun and His Companies for Fraud and Other Securities Law Violations (22 March 2023)",
      url: "https://www.sec.gov/newsroom/press-releases/2023-59",
    },
    {
      title:
        "Investor.gov (SEC)  Investor.gov (SEC) — Social Media and Investment Fraud: Investor Alert (29 August 2022)",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/social-media-and-investment-fraud-investor-alert",
    },
    {
      title:
        "UK FCA  UK FCA — FG24/1: Finalised guidance on financial promotions on social media (26 March 2024)",
      url: "https://www.fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media",
    },
    {
      title:
        "Nobel Prize  Nobel Prize — Press release: The Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel 2002",
      url: "https://www.nobelprize.org/prizes/economic-sciences/2002/press-release/",
    },
    {
      title:
        "Investor.gov (SEC)  Investor.gov (SEC) — Behavioral Patterns of U.S. Investors (2014)",
      url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-72",
    },
    {
      title:
        "UK FCA  UK FCA — Research Note: Cryptoassets consumer research 2024",
      url: "https://www.fca.org.uk/publications/fca-research/research-note-cryptoassets-consumer-research-2024",
    },
  ],
  status: "published",
  title: "Emotions Biases and Attention in Crypto Markets",
};
const sections1: LessonSection[] = [
  {
    title: "FOMO FUD and the hype cycle",
    shortTitle: "FOMO FUD and the hype cycle",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Recognise a decision trigger and choose a deliberate response.",
      },
      {
        type: "paragraph",
        children:
          "A well-written plan can be abandoned in a few seconds when a price moves or a social post creates urgency. The purpose of this lesson is not to eliminate emotion. It is to make emotion visible without letting it silently change the evidence, budget or rules. These habits improve the quality of practice; they do not guarantee profit.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children: "Use a rule written before urgency changes your attention.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why does a crypto course need a level about you",
      },
      {
        type: "paragraph",
        children:
          'Think about shopping for a phone in a big online sale. A countdown ticks, a banner says "only 3 left" and friends post their new phones. Nothing about the phone has changed, yet you feel you must decide now. The pressure comes from the setting, not the product.',
      },
      {
        type: "paragraph",
        children:
          "Levels 0 to 8 taught you how crypto works and fails. This level is about the person pressing the buttons. Investor psychology studies how feelings, attention and habits shape decisions under uncertainty. It has no single founder; you will meet some of the research in the bias and psychology lesson in Level 9.",
      },
      {
        type: "paragraph",
        children:
          "One idea runs through the whole level: a feeling is real, but it is not a price signal. You do not need to feel nothing. You need to notice the feeling, name it and check it against rules you wrote while calm.",
      },
      {
        type: "paragraph",
        children:
          "The sale analogy stops working in one place. A sale ends at midnight; crypto pressure never closes, so this lesson ends with practical brakes. This course is educational, not mental-health treatment, and watching without buying is a complete way to learn.",
      },
      {
        type: "paragraph",
        children:
          "The best-known feeling in crypto even has its own acronym, so start there.",
      },
      {
        type: "heading",
        level: 3,
        children: "Recognise FOMO when it arrives",
      },
      {
        type: "paragraph",
        children:
          "Imagine a new bakery opening in Seoul with a queue round the corner. You had not planned to buy bread, but the queue makes you wonder what you are missing, and soon you have joined it.",
      },
      {
        type: "definition",
        term: "FOMO",
        children:
          "Fear of missing out: the anxious feeling that other people are gaining from something you are not part of, which pushes you to act quickly.",
      },
      {
        type: "paragraph",
        children:
          'In crypto, FOMO usually arrives with three companions: speed, other people\'s gains and no new information. A coin jumps 40%, screenshots fill your group chat and your urge says "buy now". Your plan asks other questions. Has anything changed apart from the price? Would it pass the token checklist from the token research lesson in Level 5? Does it fit your limits from Level 8? Urgency cannot answer any of them.',
      },
      {
        type: "example",
        title: "The evening rally in Riyadh",
        children:
          'Khalid, a teacher in Riyadh, has SAR 2,000 set aside for an online course (an invented amount for this example). One evening an invented coin rises 35% and two friends post their gains. He hovers over "buy", then notices the pattern: a fast move, other people\'s profit and nothing new about the coin. He writes "missed, no entry, felt FOMO" and goes to bed. Whatever the price does next week, the skip was a rule being followed, not a prediction.',
      },
      {
        type: "paragraph",
        children:
          "The analogy breaks down because a real queue usually says something true about the bread. In crypto the crowd can be manufactured: the token research lesson in Level 5 showed how paid promotion, bots and wash trading create the look of demand.",
      },
      {
        type: "paragraph",
        children:
          "FOMO pushes you to buy. Its twin pushes you to sell, or to stop listening.",
      },
      {
        type: "heading",
        level: 3,
        children:
          "Recognise FUD and do not use the label to silence real warnings",
      },
      {
        type: "paragraph",
        children:
          "Picture a rumour in an Istanbul market that one stall's scales are rigged. Shoppers walk away without checking, and by evening the stall is empty, whether or not the rumour was true.",
      },
      {
        type: "definition",
        term: "FUD",
        children:
          "Fear, uncertainty and doubt: information, often exaggerated or false, that spreads fear about a project or the market and pushes people to sell or stay away.",
      },
      {
        type: "paragraph",
        children:
          'FUD can be deliberate: a frightening post can push nervous holders to sell cheaply to the person who wrote it. Panic-selling at 3 a.m. after an anonymous rumour is the classic mistake. Communities also use the word as a shield. When someone raises a fair concern, fans reply "that\'s FUD" and move on. That reply is not evidence. The exchange failure lesson in Level 3 showed that withdrawal pauses, unexplained yields and secrecy appeared before several exchange failures. A warning does not become false because a community dislikes it.',
      },
      {
        type: "example",
        title: "The warning that was real",
        children:
          "Lucas in São Paulo holds R$1,500 of an invented token (an invented amount for this example). A post says the national regulator has warned about the platform behind it, and the token's chat group calls this FUD. He opens the regulator's own website, finds the notice on its warning list and stops adding money.",
      },
      {
        type: "comparisonTable",
        caption: "Hype, fear or evidence?",
        columns: ["What you see", "Likely pull", "What to check"],
        rows: [
          [
            '"Up 50% today, don\'t miss it"',
            "FOMO",
            "Has anything changed except price? Does it pass my checklist?",
          ],
          [
            '"This coin goes to zero tonight" from an anonymous account',
            "FUD",
            "Who posted it? Is there a primary source?",
          ],
          [
            "Your regulator's warning list names the platform",
            "Evidence",
            "Read the regulator's page yourself",
          ],
          [
            'An influencer says "last chance" with a sign-up link',
            "FOMO and possible paid promotion",
            "Is payment disclosed? Who benefits if you click?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "FOMO and FUD rarely appear alone. They rise and fall with a bigger wave.",
      },
      {
        type: "heading",
        level: 3,
        children: "Use the hype cycle as a map of feelings",
      },
      {
        type: "paragraph",
        children:
          "Think of a new restaurant in Melbourne: queues and glowing reviews in the first month, then slow nights and a thinning crowd, then, if the food is good, a steady base of regulars.",
      },
      {
        type: "paragraph",
        children:
          'The research firm Gartner describes a similar pattern for new technologies, called the hype cycle. Its five phases are an "Innovation Trigger" (early stories and media interest), a "Peak of Inflated Expectations" (some successes, many failures), a "Trough of Disillusionment" (interest falls, weaker providers leave), a "Slope of Enlightenment" (real uses become clearer) and a "Plateau of Productivity" (mainstream use).',
      },
      {
        type: "paragraph",
        children:
          'Crypto narratives often feel like this. A new idea appears, such as the 2017 ICO boom from Level 5, and "this time is different" spreads. Then disappointments pile up and only some projects remain in use.',
      },
      {
        type: "paragraph",
        children:
          'Here the analogy stops. Gartner\'s model describes expectations about a technology, not prices; it gives no timing, and many crypto narratives never reach a plateau. So use the curve to ask "which phase do my feelings belong to?", never "when should I buy?"',
      },
      {
        type: "paragraph",
        children:
          "What pushes a narrative up that steep slope? Usually attention, and one kind of token runs almost entirely on it.",
      },
      {
        type: "paragraph",
        children:
          "Fear of missing out, or FOMO, is the urge to act because others appear to be gaining an opportunity you may lose. Research on decision-making under risk, including Kahneman and Tversky's 1979 prospect theory, helped explain why reference points and framing matter. These ideas describe patterns rather than diagnose every individual or guarantee a particular behaviour. A feeling is information about your state, not a new contract right or improved liquidity.",
      },
      {
        type: "diagram",
        alt: "A conceptual map of attention and expectations. It is not a price path or a timetable.",
        caption:
          "A conceptual map of attention and expectations. It is not a price path or a timetable.",
        src: "/lessons/crypto/level-9/lesson-1-rId50.png",
        width: 2376,
        height: 1360,
      },
    ],
  },
  {
    title: "Promotion memes and signal groups",
    shortTitle: "Promotion memes and signal groups",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "See how meme coin mania spreads",
      },
      {
        type: "paragraph",
        children:
          "You met memecoins in the token purpose lesson in Level 5 and their warning signs in the token research lesson in Level 5. Here the focus is how the excitement spreads.",
      },
      {
        type: "paragraph",
        children:
          "Think of a dance craze in Mexico City: everywhere for two weeks, then gone when a new one arrives.",
      },
      {
        type: "paragraph",
        children:
          "Meme-coin mania runs a similar loop. The price rises, people post about it, the posts bring new buyers, and their buying lifts the price again. Each turn feels like proof, but the loop needs a steady supply of new buyers. When they stop arriving it runs backwards. Unlike the dance craze, the people who joined last can lose real money.",
      },
      {
        type: "example",
        title: "A trending coin in Osaka",
        children:
          "Hiro in Osaka sees an invented memecoin trending on three apps and buys ¥10,000 of it (an invented amount for this example). Two days later it has halved, and the explorer shows the biggest sellers bought on day one. He joined at the noisiest point.",
      },
      {
        type: "paragraph",
        children:
          "Curiosity is not foolish. Some people buy a little of a memecoin for fun, like a lottery ticket. If you do, call it entertainment spending with a fixed limit you could lose completely, not an investment, and notice if entertainment money starts becoming savings money.",
      },
      {
        type: "paragraph",
        children:
          "The attention behind a mania has to come from somewhere, and often someone was paid to create it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Question influencers and paid promotion",
      },
      {
        type: "paragraph",
        children:
          "When a famous footballer advertises running shoes, you assume they were paid. Crypto promotion is harder to spot, because it often looks like a friendly tip from someone you feel you know.",
      },
      {
        type: "definition",
        term: "Finfluencer",
        children:
          "A social-media personality who talks about money, investing or crypto. Some are independent and careful, some are paid by the projects they mention, and many have no licence to give financial advice.",
      },
      {
        type: "paragraph",
        children:
          "The token research lesson in Level 5 covered the 2022 case against Kim Kardashian. On 22 March 2023 the US SEC charged eight more celebrities, including Lindsay Lohan, Jake Paul and Akon, for promoting crypto-asset securities without disclosing they were paid. Six settled, without admitting or denying the findings, paying more than US$400,000 in total. The SEC also warns that fraudsters pay actors to pose as ordinary people turned millionaires.",
      },
      {
        type: "paragraph",
        children:
          "In the United Kingdom, FCA guidance published on 26 March 2024 says that unauthorised people, such as social-media influencers, who promote a regulated financial product without approval from an FCA-authorised firm may be committing a criminal offence. Rules differ by country, so check your own regulator's guidance.",
      },
      {
        type: "example",
        title: "The referral link in Pune",
        children:
          'Priya in Pune follows a finfluencer who posts "my portfolio is up 300%" with an exchange sign-up link. She asks: is the post labelled as paid, does the link pay him, and does the screenshot show account size, losses and fees or one good day? She finds a referral code and no disclosure, so she treats the post as an advert.',
      },
      {
        type: "paragraph",
        children:
          "Influencers speak to strangers. Group chats feel like friends, which can make them more persuasive.",
      },
      {
        type: "heading",
        level: 3,
        children: "Handle group chats and signal groups with care",
      },
      {
        type: "paragraph",
        children:
          'Picture neighbours in Johannesburg sharing a business "tip" in a group chat. Nobody wants to be the one who says "this sounds wrong". Crypto\'s version is the signal group, where an organiser posts "calls" to buy a coin, sometimes for a monthly fee. The US CFTC warns that pump-and-dump organisers gather people through messaging apps and message boards, some with thousands of members, and build excitement with countdowns such as "15 mins left before the pump". It notes that the people pulling the strings get out first and make the most, leaving everyone else scrambling to sell.',
      },
      {
        type: "paragraph",
        children:
          "Even honest groups share incomplete information: people post wins, not losses or fees.",
      },
      {
        type: "example",
        title: "The monthly fee in Córdoba",
        children:
          "Tomás in Córdoba, Argentina, has an account worth US$500 and pays a signal group US$40 a month (invented amounts for this example).",
      },
      {
        type: "formula",
        expression:
          "Monthly cost drag (%) = monthly cost ÷ account value × 100",
        explanation:
          "US$40 ÷ US$500 × 100 = 8% a month. Over a year that is US$480, almost the whole account, before a single trade wins or loses.",
      },
      {
        type: "warning",
        title: "Admins never need your keys",
        children:
          'If an organiser asks you to move to a private platform, pay to "unlock" profits or share your seed phrase, stop. These are scam patterns from Level 0. Real support staff never need your seed phrase or private key.',
      },
      {
        type: "paragraph",
        children: "Feeds, chats and prices share one thing: they never sleep.",
      },
    ],
  },
  {
    title: "Recognise biases and challenge your own story",
    shortTitle: "Recognise biases and challenge your own story",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Loss aversion anchoring and confirmation bias",
      },
      {
        type: "heading",
        level: 3,
        children: "Treat a bias as a pattern to check not a verdict",
      },
      {
        type: "paragraph",
        children:
          "Every driver has a blind spot, however skilled. Good drivers do not pretend it is not there; they check their mirrors before changing lanes.",
      },
      {
        type: "definition",
        term: "Cognitive bias",
        children:
          "A recurring tendency in how people select, remember or interpret information, which can push a decision away from what the evidence supports without the person intending to be careless.",
      },
      {
        type: "paragraph",
        children:
          "The earlier steps examined pressure from outside. We now look inside, at the shortcuts our minds take. The labels are tools for asking better questions, not insults or diagnoses.",
      },
      {
        type: "paragraph",
        children:
          'Keep the observation separate from the explanation. "I only read posts that agreed with me" is something you can check. "Confirmation bias may have affected me" is one possible explanation. The fix starts with the checkable action: go back and read the posts you skipped.',
      },
      {
        type: "paragraph",
        children:
          "The analogy stops working in one way. A mirror removes most of a blind spot, but knowing a bias's name does not make you immune to it. You still need written rules and records, so each section below ends with a countermeasure.",
      },
      {
        type: "paragraph",
        children: "So where did these labels come from?",
      },
      {
        type: "heading",
        level: 3,
        children: "Know where the research comes from and its limits",
      },
      {
        type: "paragraph",
        children:
          'In 1979 the psychologists Daniel Kahneman and Amos Tversky published "Prospect Theory: An Analysis of Decision under Risk". It showed that people judge outcomes as gains or losses from a reference point, such as the price they paid, rather than by their total wealth. In 2002 Kahneman received the Nobel Memorial Prize in Economic Sciences for bringing insights from psychology into economics, especially about judgement under uncertainty. Tversky had died in 1996. Their work helped start behavioural finance, though investor psychology has no single founder.',
      },
      {
        type: "paragraph",
        children:
          "Regulators and educators have since studied crypto buyers directly. The UK FCA's 2024 consumer research estimated that 12% of UK adults, around 7 million people, owned crypto. About one in five said friends and family were the main reason they bought. A 2023 study by the FINRA Investor Education Foundation and CFA Institute found that half of US Gen Z investors reported making an investment driven by fear of missing out, and 44% had started their investing with crypto.",
      },
      {
        type: "paragraph",
        children:
          "These findings describe groups, not you, and none of them predicts a price. Use them to know which questions to ask, then check your own records.",
      },
      {
        type: "paragraph",
        children:
          "The first question concerns the reference point Kahneman and Tversky described.",
      },
      {
        type: "heading",
        level: 3,
        children: "Feel loss aversion and the disposition effect",
      },
      {
        type: "paragraph",
        children:
          "Imagine finding ₹500 on a street in Kolkata, then losing ₹500 a week later. On paper you are even, yet most people remember the loss more sharply.",
      },
      {
        type: "definition",
        term: "Loss aversion",
        children:
          "The tendency for a loss to feel more painful than a gain of the same size feels good, measured from a reference point such as the purchase price.",
      },
      {
        type: "paragraph",
        children:
          "Some studies estimate that losses weigh roughly twice as much as equal gains. Researchers still debate the figure, and it varies by person and situation, so treat it as a tendency rather than a fixed rule.",
      },
      {
        type: "paragraph",
        children:
          'Loss aversion helps explain the disposition effect, which the SEC\'s Investor.gov describes as holding losing investments too long and selling winners too soon. Selling a winner feels like locking in a pleasant gain. Selling a loser turns a paper loss into a real one, which hurts, so people wait for it to "come back".',
      },
      {
        type: "example",
        title: "Two coins in Durban",
        children:
          'Thabo in Durban holds two invented coins worth R5,000 each when he bought them (invented amounts for this example). Coin A is up 30% and Coin B is down 40%. He needs cash, and his instinct is to sell A "to lock in profit" and keep B "until it recovers". His purchase prices may be pulling the decision more than the coins\' current prospects. He asks a fresh-money question instead: "If I held this money in cash today, would I buy B at its current price?" If the honest answer is no, keeping it is a new decision to own it, not a way of avoiding a loss.',
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: write exit rules before you buy, as the recurring purchase and records lesson in Level 8 showed, and use the fresh-money question at every review.",
      },
      {
        type: "paragraph",
        children:
          "A purchase price is one reference point. An old peak can be an even stronger one.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice anchoring to an all time high",
      },
      {
        type: "paragraph",
        children:
          'A family in Melbourne turns down an offer of A$900,000 for their house because a neighbour\'s sold for A$1,000,000 two years ago (invented amounts). The old number feels like the "real" value, even though the market has changed.',
      },
      {
        type: "definition",
        term: "Anchoring",
        children:
          "Relying too heavily on an earlier number, such as a past price, when judging new information.",
      },
      {
        type: "paragraph",
        children:
          'In crypto the strongest anchor is often the all-time high. Bitcoin rose above US$68,000 in November 2021, and by November 2022 it was trading below US$18,000. It fell roughly 75% from its November 2021 high to its November 2022 low. Holders anchored to the peak said "I\'ll sell when it gets back there", as if the market owed them that price.',
      },
      {
        type: "formula",
        expression:
          "Gain needed to recover = L ÷ (1 − L), where L is the loss as a decimal.",
        explanation:
          "a 75% fall gives 0.75 ÷ 0.25 = 3, a 300% gain only to return to the old high. That is arithmetic about distance, not a forecast of whether or when any recovery happens.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Try the PipStart tool: Gain recovery calculator — enter falls of 50%, 75% and 90% and notice how fast the gain needed grows. It gives estimates for learning, not guarantees. Tool setup: the Gain Recovery Calculator accepts a current balance and recovery target, not a loss-percentage input. For fictional losses from USD 1,000, use current balances 500, 250 and 100 with target 1,000 to represent falls of 50, 75 and 90 percent. Required gains are 100, 300 and 900 percent. Enter a fictional planned gain of 5 percent per period only to illustrate a constant-rate model: this assumes uninterrupted compounding and does not predict the likelihood or timing of recovery.",
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: judge a holding by today's price and your written thesis, not by its peak. Your old high belongs in your records as a drawdown measure, not as a target.",
      },
      {
        type: "paragraph",
        children:
          "Anchors fix you to a number. The next bias fixes you to a story.",
      },
      {
        type: "heading",
        level: 3,
        children: "Catch confirmation bias and echo chambers",
      },
      {
        type: "paragraph",
        children:
          "A football fan in Buenos Aires remembers every bad call against their team and none in its favour. Their attention filters what sticks.",
      },
      {
        type: "definition",
        term: "Confirmation bias",
        children:
          "Searching for, preferring and remembering information that supports what you already believe, while giving less weight to information that contradicts it.",
      },
      {
        type: "paragraph",
        children:
          "Crypto makes this hard to avoid. Feeds learn what you like and show you more of it, and communities around a coin share mostly good news. Before long your timeline becomes an echo chamber, where you hear your own view repeated back.",
      },
      {
        type: "example",
        title: "The search in Shanghai",
        children:
          'Lin in Shanghai owns an invented token and searches "why this token will rise". Reassured, she then searches "problems with this token", reads the project\'s risk disclosures and writes the strongest argument against holding it. Her view may not change, but it has faced the evidence.',
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: before any decision, write the best case against it and name one fact that would prove you wrong. Apply the same checklist to coins you like and coins you dislike.",
      },
      {
        type: "paragraph",
        children:
          "When the story is about a whole community, belief can turn into belonging.",
      },
      {
        type: "diagram",
        alt: "A fictional move from about US$80 to US$20 requires 300% growth to regain the old number. The market owes no such recovery.",
        caption:
          "A fictional move from about US$80 to US$20 requires 300% growth to regain the old number. The market owes no such recovery.",
        src: "/lessons/crypto/level-9/lesson-1-rId51.png",
        width: 2463,
        height: 1374,
      },
      {
        type: "heading",
        level: 3,
        children: "Sunk costs tribalism recency and overconfidence",
      },
      {
        type: "heading",
        level: 3,
        children: "Watch identity and tribalism",
      },
      {
        type: "paragraph",
        children:
          "Fans do not switch football clubs after a lost match. That loyalty is lovely in sport; in money it can be expensive.",
      },
      {
        type: "definition",
        term: "Maximalism",
        children:
          "In crypto, the belief that one network or coin will, or should, replace all others. Bitcoin maximalism is the best-known form, but every large coin has its own devoted community.",
      },
      {
        type: "paragraph",
        children:
          'Strong views are not wrong. Trouble starts when a coin becomes part of your identity: criticism feels personal, people who disagree become "enemies" and selling feels like betrayal. Tribalism often lies behind the "that\'s FUD" habit examined in Step 1.',
      },
      {
        type: "example",
        title: "The badge in Milan",
        children:
          "Marco in Milan has his favourite coin's logo as his profile picture and spends evenings arguing online. When a respected developer publishes a critical review, his first reaction is to attack the author. He notices, and tries an identity test: can he explain the critic's best argument in a way the critic would accept? Not yet, so he rereads the review.",
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: keep your holdings private and off your profile, and practise describing the strongest case for a coin you do not own.",
      },
      {
        type: "paragraph",
        children:
          "Loyalty looks backwards over years. The next bias overweights the last few weeks.",
      },
      {
        type: "heading",
        level: 3,
        children: "Keep recency in proportion",
      },
      {
        type: "paragraph",
        children:
          "After three sunny weeks in Cape Town, it is tempting to pack away your umbrella for good. Recent experience feels like the whole story.",
      },
      {
        type: "paragraph",
        children:
          "Recency bias gives the latest events too much weight compared with the full record. After a month of rises, crypto can feel like a one-way street; after a quiet year, its old swings can feel like history. Neither short run tells you what comes next.",
      },
      {
        type: "example",
        title: "The calm year in Incheon",
        children:
          'Ji-ho in Incheon started buying an invented coin in a calm, rising year and wants to move more savings in, because "it doesn\'t drop like it used to". She rereads the 2022 history from Level 7, asks whether her plan could survive a 75% fall, and keeps her original limit.',
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: when you review, look at the longest history you can find, including the worst falls, not only the last few weeks.",
      },
      {
        type: "paragraph",
        children:
          "Recent wins do something else, too. They make people feel clever.",
      },
      {
        type: "heading",
        level: 3,
        children: "Check overconfidence after a bull run",
      },
      {
        type: "paragraph",
        children:
          "When the tide rises in Southampton harbour, every boat goes up, well-built or leaky. A rising market makes every buyer feel skilled.",
      },
      {
        type: "paragraph",
        children:
          "Overconfidence means treating your knowledge or skill as greater than the evidence supports. A learner who recognises a few chart patterns may feel ready to explain a product without checking its custody, rights or costs. A written evidence checklist makes the missing work visible.",
      },
      {
        type: "example",
        title: "The picks in Sydney",
        children:
          "Oliver in Sydney picks five invented coins during a strong year and gains 45%. He feels gifted, until he compares: the broad market rose 60% over the same period (invented figures). His picks did worse than doing nothing special; the tide did most of the work.",
      },
      {
        type: "paragraph",
        children:
          "Overconfidence leads to bigger positions, more trades and skipped checks. A winning breach of your rules is still a breach.",
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: compare your results with a simple benchmark, keep your position limits from Level 8 whatever your recent results, and record losses as carefully as wins.",
      },
      {
        type: "paragraph",
        children:
          "Overconfidence comes from recent wins. The next bias comes from past costs.",
      },
      {
        type: "heading",
        level: 3,
        children: "Let go of sunk costs",
      },
      {
        type: "paragraph",
        children:
          'You paid €60 for a concert in Berlin, but on the night you feel unwell and it is pouring. Many people go anyway "because we paid". The €60 is gone either way.',
      },
      {
        type: "definition",
        term: "Sunk-cost fallacy",
        children:
          "Treating money, time or effort already spent as a reason to keep going, even though that past cost cannot be recovered by continuing.",
      },
      {
        type: "paragraph",
        children:
          "Crypto offers plenty of sunk costs: fees paid, hours of research, months spent in a community, coins locked in a project you no longer trust.",
      },
      {
        type: "example",
        title: "Six months in Rio",
        children:
          'Isabela in Rio de Janeiro has spent six months and R$300 in fees on an invented project (invented amounts). New information suggests its team has gone quiet and its liquidity is shrinking. Her instinct says "I\'ve put too much in to stop". She writes what she would do if she found this project today: "not invest". The past R$300 is no reason to add more.',
      },
      {
        type: "paragraph",
        children:
          'Sunk cost differs from loss aversion: it is about past effort or spending you feel must not be "wasted", not the pain of a loss on the holding.',
      },
      {
        type: "paragraph",
        children:
          'Your countermeasure: ask "What would I do if I were starting fresh today?" and let past costs stay in your records, not in your decision.',
      },
      {
        type: "paragraph",
        children:
          "Sometimes the pull to keep going does not come from your past. It comes from everyone around you.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice herding and survivorship bias",
      },
      {
        type: "paragraph",
        children:
          "In a Jakarta food market, a stall with a long queue attracts more people because of the queue. That is a fair shortcut for lunch, a weaker one for money.",
      },
      {
        type: "paragraph",
        children:
          "Herding is following what others are doing because they are doing it. Investor.gov describes manias and panics: rapid rises driven by crowds buying, followed by sharp falls when the crowd sells. The surveys above hint at herding: some buyers cite friends, family or fear of missing out.",
      },
      {
        type: "paragraph",
        children:
          "Herding feeds on stories, and stories are filtered. Survivorship bias means drawing conclusions only from the cases that survived. You hear about the coin that rose a thousandfold and the friend who bought early. You rarely hear about the tokens that disappeared or the people who lost money, because they have nothing to post.",
      },
      {
        type: "example",
        title: "The success story in Jakarta",
        children:
          "Rizky in Jakarta hears that a colleague turned Rp1,000,000 into Rp50,000,000 on an invented memecoin (invented amounts). He feels foolish for missing it. Then he asks how many other people bought similar coins that week and lost most of their money. He cannot know, and that missing number is the point. One survivor tells him nothing about the odds.",
      },
      {
        type: "paragraph",
        children:
          'Your countermeasure: for every success story, ask "How many tried this, and what happened to them?" If you cannot find out, treat the story as an advert.',
      },
      {
        type: "paragraph",
        children:
          "Herding and survivorship push you in. The last group of biases appears after you are already in and things go wrong.",
      },
      {
        type: "heading",
        level: 3,
        children: "Avoid a bounce is due revenge trading and overtrading",
      },
      {
        type: "paragraph",
        children:
          "Toss a fair coin in a Toronto classroom. After five tails, the next toss is still 50% heads; the coin owes you nothing.",
      },
      {
        type: "paragraph",
        children:
          'The gambler\'s fallacy is believing that a run of outcomes makes the opposite "due": "five red days, a bounce must be coming". The analogy has a limit. Crypto prices are not coin tosses and nobody knows their probabilities, so a losing streak neither makes a win more likely nor proves the next day is 50:50.',
      },
      {
        type: "paragraph",
        children:
          "Revenge trading is trading to win back a loss quickly, often with a bigger size or riskier product. Overtrading is trading more often than your plan supports, sometimes from boredom. Both add costs and risk without adding evidence.",
      },
      {
        type: "formula",
        expression:
          "Total trading fees = number of trades × average trade size × fee rate",
        explanation:
          "Klaus in Munich makes 40 trades a month of about €200 each, paying an invented fee of 0.5% per trade. Fees are 40 × €200 × 0.005 = €40 a month. On a €2,000 account that is 2% a month before any trade wins or loses.",
      },
      {
        type: "warning",
        title: "Never borrow to win it back",
        children:
          "The FCA's 2024 research found that the share of UK crypto buyers using a credit card or overdraft rose from 6% in 2022 to 14% in 2024. Borrowing or adding leverage to recover a loss can turn a loss into a debt. Follow your pause rule, and seek support if you feel unable to stop.",
      },
      {
        type: "paragraph",
        children:
          "Your countermeasure: set a maximum number of trades per week, a pause after any loss you did not plan for, and a cooling-off rule, which we will develop in Step 5.",
      },
      {
        type: "paragraph",
        children:
          "You have now met each bias on its own. In real decisions they arrive together, so a single table helps.",
      },
      {
        type: "heading",
        level: 3,
        children: "Match each bias to a countermeasure",
      },
      {
        type: "paragraph",
        children:
          "A pilot in Paris does not rely on memory; the checks are written down. Your countermeasures work best the same way, as a list you consult before acting and at review.",
      },
      {
        type: "comparisonTable",
        caption: "Biases, how they show up in crypto, and what to do",
        columns: ["Bias", "How it shows up", "Countermeasure"],
        rows: [
          [
            "Loss aversion and disposition effect",
            'Selling winners early, holding losers "until they come back"',
            "Exit rules written before buying; fresh-money question",
          ],
          [
            "Anchoring",
            "Waiting for an old all-time high",
            "Judge by today's price and thesis; record the peak as drawdown only",
          ],
          [
            "Confirmation bias",
            "Reading only bullish posts",
            "Write the best case against; name what would prove you wrong",
          ],
          [
            "Tribalism",
            "Calling every critic an enemy",
            "Keep holdings off your profile; explain the other side fairly",
          ],
          [
            "Recency bias",
            '"It doesn\'t drop like it used to"',
            "Review the longest history, including the worst falls",
          ],
          [
            "Overconfidence",
            "Bigger positions after a bull run",
            "Compare with a benchmark; keep Level 8 limits",
          ],
          [
            "Sunk cost",
            '"I\'ve put too much in to stop"',
            "Ask what you would do starting fresh today",
          ],
          [
            "Herding and survivorship",
            "Buying because others got rich",
            "Ask how many tried and failed",
          ],
          [
            "Gambler's fallacy, revenge trading, overtrading",
            '"A bounce is due", doubling up, constant trades',
            "Trade limits, a pause after losses, cooling-off rule",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "In the planning and review lessons in Level 9 you will write these countermeasures into a personal crypto plan and a decision journal. First, practise.",
      },
      {
        type: "paragraph",
        children:
          "A sunk cost is a past commitment that cannot be recovered by choosing differently now. The fact that you spent hours researching or bought at a higher price does not oblige future buyers to restore that price. The arithmetic of recovery does not make a larger gamble appropriate. A 50 percent drawdown requires a 100 percent gain to recover before costs, but that fact does not improve the probability of the next idea.",
      },
    ],
  },
  {
    title: "Protect attention and journal your reasoning",
    shortTitle: "Protect attention and journal your reasoning",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Protect attention and use circuit breakers",
      },
      {
        type: "heading",
        level: 3,
        children: "Live with a market that never closes",
      },
      {
        type: "paragraph",
        children:
          "Crypto trades 24 hours a day, 7 days a week, every day of the year. Level 0 showed that there is no closing bell to give you a pause.",
      },
      {
        type: "paragraph",
        children:
          "Think of a supermarket open all night. It works because staff work in shifts, but you have no night shift to hand over to. Watch a market that never closes and something gives way: sleep, work or family time. Tired people can make faster, rougher decisions, the opposite of what a volatile market needs.",
      },
      {
        type: "paragraph",
        children:
          "Compulsive price-checking means opening the app again and again for no reason linked to your plan, and each red or green number can stir a fresh urge to act.",
      },
      {
        type: "example",
        title: "Counting checks in Toronto",
        children:
          "Emily in Toronto holds an invented coin for the long term. One Saturday she counts: 45 app openings, about two minutes each.",
      },
      {
        type: "formula",
        expression:
          "Daily checking time = number of checks × average minutes per check",
        explanation:
          "45 × 2 = 90 minutes in a day. Over a week at that rate, 90 × 7 = 630 minutes, or 10.5 hours. Her long-term plan did not change once.",
      },
      {
        type: "paragraph",
        children:
          "The analogy stops there: a night shift serves real customers, while night-time checking mostly serves the feeling of control. Planned checking windows, built later in this lesson, give you the information without the pull. Some of that pull, though, is designed.",
      },
      {
        type: "heading",
        level: 3,
        children: "Notice when an app or product starts to feel like a game",
      },
      {
        type: "paragraph",
        children:
          "Games keep you playing with frequent rewards. In a financial app, the same tricks can encourage more and faster decisions than your plan allows.",
      },
      {
        type: "paragraph",
        children:
          'In November 2022 the UK FCA published research on trading apps, some offering crypto. It found falling confetti and congratulations after trades, points, badges, leaderboards ranking users by activity, flashing price alerts and high default amounts. In its survey, about 1 in 27 users (3.75%) showed "problem gambling behaviour", similar to the 1 in 29 (3.5%) it cited for online gamblers. On two apps with these features that also offered crypto, almost half of surveyed customers had invested in products potentially beyond their risk appetite.',
      },
      {
        type: "paragraph",
        children:
          "Some products add speed of their own. Leverage (the leverage lesson in Level 8) can turn a small move into a large loss within hours, memecoins can halve in a day, and very short-term trades give a result almost at once, like a spin of a wheel. The rush, the near miss and the urge to go again can feel much like gambling.",
      },
      {
        type: "paragraph",
        children:
          "Enjoying excitement is human; the question is whether the activity stays inside limits you chose calmly. Warning signs include chasing losses, hiding activity from people close to you, borrowing to keep going, losing sleep and feeling restless when you cannot check.",
      },
      {
        type: "warning",
        title: "When it stops feeling like your choice",
        children:
          "If you recognise several of these signs, pause all new crypto activity and talk to someone you trust. Support exists in most countries: your doctor, a national gambling or addiction helpline and free debt-advice services. Most phones also let you limit screen time or block an app at set hours. Stepping back is a sensible decision, not a failure.",
      },
      {
        type: "paragraph",
        children:
          "If design can push you to act faster, design can also slow you down.",
      },
      {
        type: "heading",
        level: 3,
        children:
          "Build circuit breakers starting with friction regulators use",
      },
      {
        type: "paragraph",
        children:
          "A speed bump outside a school in Rome does not stop anyone driving; it slows them where speed is most dangerous. Regulators use the same idea, often called positive friction: a small delay where impulsive decisions cause harm.",
      },
      {
        type: "paragraph",
        children:
          'The UK offers a dated example. From 8 October 2023, FCA rules for crypto promotions require firms to give first-time customers a personalised risk warning and a cooling-off period of at least 24 hours before showing them a direct offer to invest, and to check they understand the risks. "Refer a friend" bonuses were banned, and promotions must warn: "Don\'t invest unless you\'re prepared to lose all the money you invest." Other countries use other tools, so check your own regulator.',
      },
      {
        type: "paragraph",
        children:
          "The speed bump has a limit: the FCA's wait applies when you are new to a firm. After that, only you can slow yourself down. Some stock exchanges pause trading after a very sharp fall, a pause called a circuit breaker. You can write a personal version.",
      },
      {
        type: "definition",
        term: "Personal circuit breaker",
        children:
          'A rule you write in advance that pauses your decisions when a named trigger appears, such as a price spike, a "last chance" message or a loss.',
      },
      {
        type: "paragraph",
        children:
          'A cooling-off rule is the simplest one: "I wait 24 hours before buying anything I first heard about today, and I write one sentence on why I want it." The number is your choice, not a universal safe interval. Waiting does not make a failed checklist pass; it gives your calm self a turn to speak.',
      },
      {
        type: "paragraph",
        children:
          "Your second set of breakers is alert hygiene. Keep security alerts on, because a login or withdrawal you did not make needs your attention at once. Turn down the rest.",
      },
      {
        type: "comparisonTable",
        caption: "Alert hygiene, from noisy to calmer",
        columns: ["Alert or habit", "Noisy setting", "Calmer setting"],
        rows: [
          [
            "Price alerts",
            "Every 1% move on many coins",
            "None, or only levels written in your plan",
          ],
          [
            "App notifications",
            "All on, including promotions",
            "Security alerts on (logins, withdrawals, new devices); marketing off",
          ],
          [
            "Social feeds",
            "Following every account that posts gains",
            "Mute or unfollow accounts that hide paid promotion",
          ],
          [
            "Group chats",
            "Notifications on all day",
            "Muted and read at a set time, or leave",
          ],
          [
            "Night-time",
            "App beside the bed",
            "App off the home screen; do-not-disturb overnight",
          ],
          [
            "Checking",
            "Whenever bored or anxious",
            "Two fixed checking windows a day, or fewer",
          ],
        ],
      },
      {
        type: "example",
        title: "Sophie's card in Lyon",
        children:
          'Sophie in Lyon writes three rules on a card: 24 hours of cooling off, two 10-minute checking windows and no crypto app after 10 p.m. When an influencer posts "last chance before listing" about an invented token, she waits. Next morning her the token research lesson in Level 5 checklist finds an unverified contract and an anonymous team. The rule did not decide for her; it made room for the checklist.',
      },
      {
        type: "paragraph",
        children:
          "Breakers work best when practised before the pressure arrives, so try them now.",
      },
      {
        type: "paragraph",
        children:
          "Crypto markets can operate around the clock, while people cannot maintain reliable attention indefinitely. Use conditions for doing nothing: incomplete evidence, insufficient sleep for careful checking, an unexplained permission or an unresolved route. Time boundaries do not ensure a better market outcome; they reduce impulsive interruptions and make the process easier to review. You do not need to monitor every price to complete this course.",
      },
      {
        type: "paragraph",
        children:
          "After a loss, schedule a review before changing the rule rather than immediately increasing exposure. It cannot ensure profit or eliminate all mistakes, but it makes exceptions visible. Discipline is then assessed as adherence and reasoning, rather than inferred from a favourable balance.",
      },
      {
        type: "heading",
        level: 3,
        children: "Journal feelings separately from evidence",
      },
      {
        type: "paragraph",
        children:
          "A useful journal records the time, research question, available evidence, emotional state, intended action and actual action. Add whether the original rule was followed and what result occurred. Do not write only I felt confident or the trade worked. The separation helps identify cases where a correct process lost money or an unsupported action happened to gain.",
      },
      {
        type: "paragraph",
        children:
          "Use fictional accounts and omit personal secrets. Review patterns such as acting after a social message, changing an exit after entry or skipping fee checks when tired. A journal is valuable when it changes a specific habit or reveals a repeated mistake, not when it becomes a long account of every price movement. Pick one observable improvement for the next practice period.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "The sale sign before a household purchase",
        children:
          "Ravi in India planned to spend INR 2,000 on a necessary appliance. A shop's last-hour promotion persuades him to consider an INR 8,000 model he has not researched. The deadline changes his urgency but not his household budget or the product's evidence. A market promotion can produce the same decision pressure. Ravi pauses, returns to the original need and checks whether the new action fits the boundary. Missing a promotion is acceptable if the proposed purchase is unsupported.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "Do not increase exposure merely to recover a loss or justify earlier effort.",
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
          "1. Write a pause rule for an urgent promotional message.",
          "2. A profitable action broke the risk policy. Was its process automatically good?",
          "3. List four fields for a decision journal.",
        ],
        answers: [
          "1. Stop before sending or signing, identify the request, verify independently and require the original evidence and budget checks.",
          "2. No. Outcome and adherence are separate. A rule-breaking gain can reinforce a dangerous habit.",
          "3. Time, evidence, feeling, intended action, actual action, rule adherence and result are suitable fields.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does being disciplined guarantee profitable results?"],
        answers: [
          "No. Discipline can improve consistency and checking, while market and operational outcomes remain uncertain.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Emotion should be recorded without becoming evidence.",
          "Past cost does not establish future value.",
          "Assess adherence separately from outcome.",
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
              "Daniel Kahneman and Amos Tversky  Prospect Theory An Analysis of Decision under Risk",
            url: "https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Behavioral_Decision_Theory/Kahneman_Tversky_1979_Prospect_theory.pdf",
          },
          {
            title: "CFTC  Beware Virtual Currency Pump and Dump Schemes",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html",
          },
          {
            title: "FCA  Investing in crypto",
            url: "https://www.fca.org.uk/investsmart/investing-crypto",
          },
          {
            title: "FINRA  Crypto Assets",
            url: "https://www.finra.org/investors/investing/investment-products/crypto-assets",
          },
          {
            title:
              "US SEC  US SEC — SEC Charges Crypto Entrepreneur Justin Sun and His Companies for Fraud and Other Securities Law Violations (22 March 2023)",
            url: "https://www.sec.gov/newsroom/press-releases/2023-59",
          },
          {
            title:
              "Investor.gov (SEC)  Investor.gov (SEC) — Social Media and Investment Fraud: Investor Alert (29 August 2022)",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/social-media-and-investment-fraud-investor-alert",
          },
          {
            title:
              "UK FCA  UK FCA — FG24/1: Finalised guidance on financial promotions on social media (26 March 2024)",
            url: "https://www.fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media",
          },
          {
            title:
              "Nobel Prize  Nobel Prize — Press release: The Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel 2002",
            url: "https://www.nobelprize.org/prizes/economic-sciences/2002/press-release/",
          },
          {
            title:
              "Investor.gov (SEC)  Investor.gov (SEC) — Behavioral Patterns of U.S. Investors (2014)",
            url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-72",
          },
          {
            title:
              "UK FCA  UK FCA — Research Note: Cryptoassets consumer research 2024",
            url: "https://www.fca.org.uk/publications/fca-research/research-note-cryptoassets-consumer-research-2024",
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
  course: "crypto-planning-and-practice",
  description:
    "Specify a hypothesis so another learner can reproduce the test.",
  estimatedMinutes: 14,
  learningPath: "crypto",
  level: "level-9",
  module: "psychology-planning-and-paper-practice",
  objectives: [
    "Specify a hypothesis so another learner can reproduce the test.",
  ],
  position: 2,
  prerequisites: ["emotions-biases-and-attention-in-crypto-markets"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "emotions-biases-and-attention-in-crypto-markets",
    "crypto-test-without-looking-ahead",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Specify a hypothesis so another learner can reproduce the test.",
  seoTitle: "Write a Crypto Plan and Define Testable Rules",
  slug: "write-a-crypto-plan-and-define-testable-rules",
  sources: [
    {
      title: "Coinbase  Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Kraken  What are Maker and Taker fees",
      url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
    },
    {
      title:
        "Kraken  Managing margin and liquidations in multi collateral trading",
      url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
    },
    {
      title:
        "David H Bailey Jonathan Borwein Marcos Lopez de Prado and Qiji Jim Zhu  The Probability of Backtest Overfitting",
      url: "https://scholarworks.wmich.edu/math_pubs/42/",
    },
    {
      title: "MIT OpenCourseWare  Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title:
        "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
      url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
    },
    {
      title: "Glassnode  Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title:
        "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
  ],
  status: "published",
  title: "Write a Crypto Plan and Define Testable Rules",
};
const sections2: LessonSection[] = [
  {
    title: "Purpose horizon and permitted activities",
    shortTitle: "Purpose horizon and permitted activities",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Specify a hypothesis so another learner can reproduce the test.",
      },
      {
        type: "paragraph",
        children:
          "An idea that cannot be described precisely is difficult to test honestly. The rule must identify what information is observed, when it becomes available and what action follows. This lesson builds a paper-test specification and distinguishes a short-term trading hypothesis from an asset thesis or a recurring purchase policy.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "A reviewer should be able to reproduce the decision from information available at that moment.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Why write a plan before you need it",
      },
      {
        type: "paragraph",
        children:
          "A couple in Guadalajara planning a wedding agree a budget before visiting any venue. In a beautiful hall with a smiling salesperson, saying no is much harder. The calm decision at the kitchen table protects them from the excited one.",
      },
      {
        type: "definition",
        term: "Pre-commitment",
        children:
          "Making a decision in advance, usually in writing, so that your future self in a heated moment has a clear rule to follow instead of deciding from scratch.",
      },
      {
        type: "paragraph",
        children:
          "Professionals use the same idea. CFA Institute's 2010 guide to investment policy statements for individual investors describes a written policy that sets out objectives, risk management and how a portfolio will be governed. CME Group's education makes a similar point: define your risk rules, such as a maximum loss per trade, before you place a trade.",
      },
      {
        type: "paragraph",
        children:
          "You have already written two pieces. In Level 0 you made a learning plan, and in the recurring purchase and records lesson in Level 8 you drafted a portfolio-risk policy. This lesson folds both into one wider personal crypto plan, adds the psychology tools from Lesson C9.1, and shows you how to review it honestly.",
      },
      {
        type: "paragraph",
        children:
          "The analogy has a limit: a wedding budget is spent once, but a crypto plan runs for years through rallies, crashes and life changes, so it needs reviews as much as rules. Start with the reason behind it all.",
      },
      {
        type: "heading",
        level: 3,
        children: "Start with purpose and time horizon",
      },
      {
        type: "paragraph",
        children:
          'A train ticket only makes sense once you know where you are going. Level 0 separated using, owning, investing and trading. Your plan\'s first line names which one you are doing, and why. "To learn how self-custody works with a small amount" leads to very different rules from "to hold a long-term position alongside my pension", and both differ from "to trade short-term".',
      },
      {
        type: "paragraph",
        children:
          "The second line is your time horizon: how long you expect to hold before you might need the money. Money you need within a year or two, for rent, fees or a deposit, does not belong in an asset that can fall roughly 75% in a year, as bitcoin did from November 2021 to November 2022. A long horizon does not make crypto safe, but it reduces pressure to sell at the worst moment.",
      },
      {
        type: "paragraph",
        children:
          'It is also fine to write "Purpose: to understand crypto; I am not investing yet." Choosing not to invest is a complete plan.',
      },
      {
        type: "example",
        title: "Two purposes in Delhi",
        children:
          'Neha and her brother Arjun in Delhi both write plans. Neha\'s purpose is "learn self-custody with ₹5,000 I can lose entirely; horizon: this course" (an invented amount for this example). Arjun\'s is "a small long-term holding beside my retirement savings; horizon: 10 years or more". The same coin could fit one plan and break the other.',
      },
      {
        type: "paragraph",
        children:
          "With a purpose and horizon written, the next lines set how much money the plan can ever touch.",
      },
      {
        type: "heading",
        level: 3,
        children: "Set money limits you can check",
      },
      {
        type: "paragraph",
        children:
          "The sizing and exposure lessons in Level 8 taught you to set a loss budget, and the recurring purchase and records lesson in Level 8 to write it into a portfolio-risk policy. Copy those figures into your plan rather than re-deciding them, and add one line you can check at a glance: a maximum allocation.",
      },
      {
        type: "paragraph",
        children:
          "A maximum allocation is the largest share of your investable savings that crypto may ever reach, written as a percentage and as a cash figure. Investable savings means money left after your emergency fund and essentials, which stay out completely, as Level 0 showed. Your figure is personal. Regulators such as the UK FCA warn that you should be prepared to lose all the money you put into crypto, and that you are highly unlikely to be covered by a compensation scheme if something goes wrong.",
      },
      {
        type: "formula",
        expression:
          "Crypto share (%) = current value of crypto ÷ total investable savings × 100",
        explanation:
          "compare this with the maximum allocation in your plan. If the share is above your maximum, your plan, not your mood, says what happens next.",
      },
      {
        type: "example",
        title: "The cap in Mexico City",
        children:
          'Ana in Mexico City has MX$200,000 of investable savings and sets a maximum allocation of 5%, so MX$10,000 (invented figures, not a suggested level). After a rally her crypto is worth MX$16,000, and her investable savings total MX$206,000. Her crypto share is 16,000 ÷ 206,000 × 100 ≈ 7.8%. Her plan says: "Above my maximum, I add nothing new and rebalance at my next review", using the rebalancing method from the recurring purchase and records lesson in Level 8. She follows it, even though selling a rising coin feels wrong.',
      },
      {
        type: "paragraph",
        children:
          "Money limits say how much. The next lines say what you will and won't do with it.",
      },
      {
        type: "heading",
        level: 3,
        children: "Write what you will and won t do",
      },
      {
        type: "paragraph",
        children:
          "A restaurant in Lyon keeps a short menu on purpose, so every dish can be done well. Your allowed activities work the same way. Crypto offers spot buying, staking, DeFi, leverage, memecoins and much more, and each brings its own risks and checks. Fewer activities means fewer ways to be caught out.",
      },
      {
        type: "comparisonTable",
        caption: 'A sample "will and won\'t" list (fill in your own)',
        columns: ["I will", "I won't"],
        rows: [
          [
            "Buy spot crypto on a provider I have checked on my regulator's register (Lesson C3.1)",
            "Use leverage or derivatives while learning (Lesson C8.2)",
          ],
          [
            "Hold most of my coins in self-custody once I have tested recovery (Level 2)",
            "Buy a token I first heard about today (my cooling-off rule, Lesson C9.1)",
          ],
          [
            "Use one DeFi protocol only after its checklist passes (Lesson C6.5)",
            "Join paid signal groups or copy influencer calls",
          ],
          [
            "Keep any entertainment buys under my fixed limit",
            "Borrow, use a credit card or touch my emergency fund",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'The "won\'t" column is often the more useful one: it lists decisions already made, so you need not remake them at 2 a.m.',
      },
      {
        type: "paragraph",
        children:
          "Allowed activities still need protecting. The next part of the plan is about security.",
      },
      {
        type: "heading",
        level: 3,
        children: "Add security and custody rules",
      },
      {
        type: "paragraph",
        children:
          "A family in Toronto keeps passports in one drawer, spare keys with a trusted neighbour, and never tells strangers when they are away. These are routines, not tricks. Your plan should list the security routines from Levels 2 and 3 the same way.",
      },
      {
        type: "comparisonTable",
        caption: "Security and custody rules for the plan",
        columns: ["Area", "Rule to write"],
        rows: [
          [
            "Seed phrase",
            'Stored offline in the locations from my Level 2 recovery plan; never typed into a website or shared with anyone, including "support"',
          ],
          [
            "Accounts",
            "Authenticator app or security key, not SMS; withdrawal allow-list switched on",
          ],
          [
            "Sending",
            "My Lesson C2.3 checklist and a test transfer for any new address",
          ],
          [
            "Custody",
            "Most in self-custody, a working amount on an exchange; review exchange exposure at each review",
          ],
          ["Privacy", "I do not post my holdings or my wallet addresses"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Real support staff never need your seed phrase or private key. If anyone asks for it, the plan's answer is already written: no.",
      },
      {
        type: "paragraph",
        children:
          "Security keeps your coins safe from others. A research standard keeps them safe from your own rushed decisions.",
      },
    ],
  },
  {
    title: "Research rules execution and the right test",
    shortTitle: "Research rules execution and the right test",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Research standards and observable rules",
      },
      {
        type: "paragraph",
        children:
          "Name the asset universe, venue, product, quote currency, dates, timezone and data source. A test on one surviving token differs from a test on all tokens available at the time. A spot series differs from a derivative mark-price series. Choose the environment before selecting favourable results, and preserve the version of the dataset used.",
      },
      {
        type: "paragraph",
        children:
          "State the question in observable terms. For example, does a specified rule produce a better net result than a defined benchmark over a fixed sample? Avoid words such as strong trend unless you define how they are recognised. Record missing data and product availability. If a pair did not exist or was inaccessible at the supposed time, an assumed trade on it cannot represent feasible practice.",
      },
      {
        type: "paragraph",
        children:
          "A signal is a defined observation. Entry specifies when and how a hypothetical fill is modelled. Exit specifies the condition and fill assumption. Invalidation states what undermines the idea. Sizing states quantity or the loss-budget procedure. No-action rules cover missing evidence, unavailable liquidity or existing exposure limits.",
      },
      {
        type: "paragraph",
        children:
          "For a teaching specification, a signal could be a completed daily close above the previous three completed daily highs. Entry could be the next recorded interval's executable ask under a supplied fill rule, not the signal candle's already-past opening price. An exit might occur after a fixed number of intervals or a defined condition. This is a test example, not a claimed profitable strategy. Its purpose is to make timing and feasibility inspectable.",
      },
      {
        type: "paragraph",
        children:
          "A doctor in Berlin does not prescribe a medicine because a patient saw an advert; evidence comes first. Your plan needs a standard too.",
      },
      {
        type: "paragraph",
        children:
          "Write which checklists must pass before you buy or use anything: the provider checklist from the provider checking lessons in Level 3, the token research template from the token research lesson in Level 5 and the DeFi checklist from the DeFi dependency lesson in Level 6. Add source rules: primary sources first (project documents, explorers, regulator registers) and no decisions based only on social-media posts. Add a written thesis: why you are buying and what would prove you wrong, the thesis invalidation from the recurring purchase and records lesson in Level 8.",
      },
      {
        type: "example",
        title: "Wei's three-line rule in Guangzhou",
        children:
          'Wei in Guangzhou writes: "Before any purchase I complete the token research template from Level 5, read one serious critique, and wait 24 hours. If any step is missing, the answer is no." When a coin she likes jumps 30%, the rule turns the urge into a task list, and by the end she can decide calmly.',
      },
      {
        type: "paragraph",
        children:
          "Research rules protect each decision. The next tools protect you when emotions run high.",
      },
      {
        type: "heading",
        level: 3,
        children: "Cost feasible execution and the right test",
      },
      {
        type: "paragraph",
        children:
          "Include trading fees, spreads, estimated slippage, network or withdrawal charges where relevant, and funding for derivative examples. State which are embedded in assumed fills and which are added. Size must fit available depth and order increments. A historical high or low inside a candle does not prove your limit order filled, because trade sequence and queue position may be unknown.",
      },
      {
        type: "paragraph",
        children:
          "Use conservative assumptions when evidence cannot establish execution, and mark the uncertainty. Partial fills require tracking the filled amount and remaining instruction. Stops require a defined trigger reference and adverse-fill treatment. Avoid giving the test perfect buying at lows and selling at highs simply because those prices appear on a chart. That would test hindsight rather than a usable rule.",
      },
      {
        type: "comparisonTable",
        caption: "A complete paper test specification",
        columns: [
          "Field",
          "Example teaching specification",
          "Reason it matters",
        ],
        rows: [
          [
            "Universe",
            "One supplied fictional spot pair",
            "No hidden asset selection",
          ],
          ["Time", "UTC completed daily intervals", "Availability is explicit"],
          [
            "Signal",
            "Close above prior three completed highs",
            "Observable condition",
          ],
          [
            "Entry",
            "Next interval under supplied ask-fill rule",
            "Avoids entering before signal exists",
          ],
          [
            "Exit",
            "Defined holding duration or condition",
            "Prevents hindsight choice",
          ],
          [
            "Costs",
            "Named fee and adverse-fill assumptions",
            "Measures net outcome",
          ],
          [
            "No action",
            "Missing data or size exceeds depth",
            "Feasibility constraint",
          ],
          ["Version", "Recorded before results", "Tracks rule changes"],
        ],
      },
      {
        type: "paragraph",
        children:
          "A trading hypothesis concerns an action sequence and net outcomes under defined execution. An asset thesis concerns rights, use, supply, control and other evidence that may be reviewed as facts change. A recurring purchase policy concerns cash-flow timing, affordability and long-term review conditions. These questions need different benchmarks and evidence.",
      },
      {
        type: "paragraph",
        children:
          "Do not declare an asset thesis proven merely because a short trading test made money. Nor does a DCA schedule prove that the asset is sound. State which proposition is being examined and what would refute it. A thesis can fail even during a temporary price rise if the promised right does not exist. Research quality requires that the outcome measure fit the actual claim.",
      },
    ],
  },
  {
    title: "Precommitment premortem and the frozen plan",
    shortTitle: "Precommitment premortem and the frozen plan",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Precommitment and a premortem",
      },
      {
        type: "paragraph",
        children:
          'Lesson C9.1 introduced personal circuit breakers and matched each bias with a countermeasure. Write the ones you chose into your plan, with a trigger and an action for each: "If I feel FOMO, I wait 24 hours." "If I have an unplanned loss, I make no new trades for a week." "If I check prices more than my two daily windows, I delete the app from my home screen for a week."',
      },
      {
        type: "paragraph",
        children:
          "A pause rule is not a universal safe interval and does not cancel existing positions; it stops new decisions until your written restart conditions are met. A written pause rule makes a checking step part of the process before an urgent decision arrives.",
      },
      {
        type: "paragraph",
        children:
          "The psychologist Gary Klein suggested a useful planning tool in a 2007 Harvard Business Review article: the premortem. Before a project starts, the team imagines it has already failed, then lists the reasons why. This makes it easier to voice doubts early, while there is still time to fix the plan.",
      },
      {
        type: "example",
        title: "A premortem in Adelaide",
        children:
          'Before finalising her plan, Chloe in Adelaide writes: "It is a year from now and my crypto plan has failed. Why?" Her list: "I broke my cap during a rally. I bought a token from a group chat. I stopped keeping my journal." Each becomes a rule or review question.',
      },
      {
        type: "paragraph",
        children:
          "Rules are only half a plan. The other half is a record of what you actually did.",
      },
      {
        type: "heading",
        level: 3,
        children: "Freeze the rule and keep the decision journal",
      },
      {
        type: "paragraph",
        children:
          "Write the rule version and date, then test that version. If you change it after seeing results, record the change and treat the prior sample as development information rather than untouched validation. Identify information unavailable at the decision time, including revised supply or entity labels and final candle values not yet formed.",
      },
      {
        type: "paragraph",
        children:
          "Keep a simple research log of every variation tried. Testing many variations increases the chance of finding an attractive result by coincidence. The next lesson explains why a holdout and forward observation help but do not remove all overfitting. A clear rule specification is the beginning of honest testing, not a certificate that the rule will work.",
      },
      {
        type: "paragraph",
        children:
          "A pilot's logbook in São Paulo records every flight. Years later, it shows patterns no single flight could reveal.",
      },
      {
        type: "definition",
        term: "Decision journal",
        children:
          "A dated record of each decision you make, written at the time, including your reasons, the information you had, how you felt and what you expected, with the outcome added later in a separate field.",
      },
      {
        type: "paragraph",
        children:
          "The transaction records from Lesson C8.4 show what happened; the journal records why, so you can review your thinking, not only your results. Include decisions not to act: a skip, a pause or a missed move is a decision too.",
      },
      {
        type: "comparisonTable",
        caption: "Decision journal fields",
        columns: ["Field", "What to write"],
        rows: [
          ["Date and time", "When you decided, with time zone"],
          ["Decision", "Buy, sell, hold, skip, pause, or change the plan"],
          [
            "Reason and thesis",
            "Why, in one or two sentences, and what would prove you wrong",
          ],
          ["Evidence", "Checklists completed, sources read, prices seen"],
          ["Feelings", "In plain words: calm, excited, anxious, FOMO, bored"],
          ["Plan check", "Which rule allowed it, or which rule was broken"],
          [
            "Expected outcome",
            "What you thought might happen, including the downside",
          ],
          [
            "Later outcome",
            "Filled in at review, never by editing the earlier lines",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          'Write feelings in ordinary words; "felt FOMO after group chat" is enough, with no score or diagnosis needed. Add dated notes later rather than rewriting entries.',
      },
      {
        type: "paragraph",
        children:
          "A journal also lets you test ideas without risking money, as long as you guard against hindsight.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Testing a commuting route",
        children:
          "A commuter in France wants to know whether a new route saves time. She records the same departure window, weekdays, weather exclusions and measurement method before comparing trips. Choosing only the fastest journeys afterward would distort the result. A paper-trading rule similarly needs a fixed environment and measurement plan. The result should answer the stated question, including costs and days when the action cannot be performed.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A precise specification does not establish profitability; it makes the hypothesis testable.",
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
          "1. Why is entering at a signal candle's opening price usually invalid for a close-based rule?",
          "2. Add one explicit no-action condition.",
          "3. Distinguish a token-rights thesis from a trading-return hypothesis.",
        ],
        answers: [
          "1. The opening occurred before the final close and signal were known. It uses later information to choose an earlier action.",
          "2. Examples include missing completed data, unsupported product availability or insufficient depth for the modelled size.",
          "3. The thesis asks whether documented rights and mechanisms exist; the trading hypothesis asks how a specified action sequence performs after costs. One does not automatically prove the other.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Can you silently change a rule after seeing a losing test and still call the same sample independent validation?",
        ],
        answers: [
          "No. The sample has informed development. Record the change and assess it with appropriately separated or forward evidence.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Define the environment and timing.",
          "Make entry and exit feasible rather than idealised.",
          "Record every rule variation and its evidence use.",
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
            title: "Coinbase  Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Kraken  What are Maker and Taker fees",
            url: "https://support.kraken.com/in/articles/360000526126-what-are-maker-and-taker-fees-",
          },
          {
            title:
              "Kraken  Managing margin and liquidations in multi collateral trading",
            url: "https://support.kraken.com/gb/articles/4844463246100-margining-liquidations-multi-collateral-derivatives",
          },
          {
            title:
              "David H Bailey Jonathan Borwein Marcos Lopez de Prado and Qiji Jim Zhu  The Probability of Backtest Overfitting",
            url: "https://scholarworks.wmich.edu/math_pubs/42/",
          },
          {
            title: "MIT OpenCourseWare  Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title:
              "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
            url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
          },
          {
            title: "Glassnode  Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title:
              "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
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
  course: "crypto-planning-and-practice",
  description:
    "Build a fair paper test and identify biases that can manufacture an attractive result.",
  estimatedMinutes: 7,
  learningPath: "crypto",
  level: "level-9",
  module: "psychology-planning-and-paper-practice",
  objectives: [
    "Build a fair paper test and identify biases that can manufacture an attractive result.",
  ],
  position: 3,
  prerequisites: ["write-a-crypto-plan-and-define-testable-rules"],
  publishedDate: "2026-10-05",
  relatedLessonIds: [
    "write-a-crypto-plan-and-define-testable-rules",
    "read-results-honestly-and-build-a-practice-routine",
  ],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Build a fair paper test and identify biases that can manufacture an attractive result.",
  seoTitle: "Test Without Looking Ahead",
  slug: "crypto-test-without-looking-ahead",
  sources: [
    {
      title:
        "David H Bailey Jonathan Borwein Marcos Lopez de Prado and Qiji Jim Zhu  The Probability of Backtest Overfitting",
      url: "https://scholarworks.wmich.edu/math_pubs/42/",
    },
    {
      title: "MIT OpenCourseWare  Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title:
        "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
      url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
    },
    {
      title: "Coinbase  Advanced trade order types",
      url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
    },
    {
      title: "Glassnode  Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title: "Glassnode  Exchange Data Transparency Notice",
      url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
    },
    {
      title:
        "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
  ],
  status: "published",
  title: "Test Without Looking Ahead",
};
const sections3: LessonSection[] = [
  {
    title: "Separate development holdout and past information",
    shortTitle: "Separate development holdout and past information",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Build a fair paper test and identify biases that can manufacture an attractive result.",
      },
      {
        type: "paragraph",
        children:
          "A backtest is a simulation using historical information. It can be useful while still being misleading. Future data, selected assets and perfect fills can create results that a real learner could never have achieved. This lesson teaches how to inspect those errors and continue with paper observation rather than treating a historical fit as proof.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Test what a participant could have known and done, rather than what hindsight makes possible.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Development holdout and forward observation",
      },
      {
        type: "paragraph",
        children:
          "A development period is used to design or tune a rule. An out-of-sample period is reserved for evaluating the resulting rule without adjusting it to that period's outcomes. Forward observation applies the recorded rule as new information arrives. These distinctions help identify which evidence has influenced the design.",
      },
      {
        type: "paragraph",
        children:
          "Repeatedly inspecting and changing a rule to improve the reserved period weakens its independence. Testing many variants can also overfit a small history. Research on backtest overfitting explains why apparently attractive historical performance can arise through selection. A single holdout is useful discipline but not a universal solution, especially when many choices have already been made. Record the full search process and uncertainty.",
      },
      {
        type: "paragraph",
        children:
          "A cook in Naples testing a recipe who changes the ingredients after tasting can never tell whether the original worked. Rules must be written before the test.",
      },
      {
        type: "paragraph",
        children:
          "To test a crypto idea safely, use a paper-tracking test, an idea you met in Level 0. Write the rule first, with a start date, an end date, an amount and what counts as success. Then record each decision the rule would make, at the time, without real money. At the end, compare the results with a simple benchmark, as the bias and psychology lesson in Level 9 suggested.",
      },
      {
        type: "example",
        title: "Paper-testing a rule in Yokohama",
        children:
          'Daichi in Yokohama wonders whether "buy ¥10,000 of an invented coin whenever it falls 20% in a week" works (invented amounts). He writes the rule on 1 March, sets a three-month test and logs every signal. The rule fires 4 times: 2 paper trades up, 2 down. Four cases prove nothing either way, and he does not quietly change "20%" to "25%" because it would have looked better.',
      },
      {
        type: "paragraph",
        children:
          "If you change a rule, start a new version with a new test period. Applying a better-looking rule to old dates is hindsight, not evidence.",
      },
      {
        type: "paragraph",
        children:
          "Tests and journals need regular attention, so the plan needs a calendar.",
      },
      {
        type: "diagram",
        alt: "Classroom illustration for Test Without Looking Ahead.",
        caption: "Classroom illustration for Test Without Looking Ahead.",
        src: "/lessons/crypto/level-9/lesson-3-rId52.png",
        width: 1187,
        height: 486,
      },
      {
        type: "heading",
        level: 3,
        children: "Do not put future information into the past",
      },
      {
        type: "paragraph",
        children:
          "Look-ahead bias uses information that was unavailable at the decision time. Examples include the day's final close before the day ended, a later corrected price, a future token classification or an entity label discovered months afterward. A spreadsheet can contain all those values in one row, making the timing mistake easy to miss.",
      },
      {
        type: "paragraph",
        children:
          "Write an availability timestamp for each signal input. If a report is published after a period ends, it cannot be used as though it was known during that period. On-chain data may be visible promptly while a provider's interpretation arrives later or is revised. The existence of the underlying transaction does not prove that a particular labelled metric was available. Preserve point-in-time information where the test depends on it.",
      },
      {
        type: "example",
        title: "A signal that arrives too early",
        children:
          "A paper rule buys after a daily close above a threshold. The spreadsheet enters at that same day's morning price, using the close that became known only at the end of the day. The arithmetic may be flawless while the decision is impossible. A feasible rule must wait until the information exists and specify the next available execution assumption.",
      },
      {
        type: "paragraph",
        children:
          "The same issue appears with updated token lists, revised address labels and later corrected market data. Record when each input became available, rather than only the timestamp of the event it describes.",
      },
      {
        type: "heading",
        level: 3,
        children: "Include failures and avoid hindsight selection",
      },
      {
        type: "paragraph",
        children:
          "Survivorship bias occurs when the sample contains only assets or venues that survived until today. Failed, delisted or illiquid assets may be omitted, making a historical universe look safer or more profitable than it was. Choosing a start date after a major loss can similarly improve the displayed result without changing the rule.",
      },
      {
        type: "paragraph",
        children:
          "Define the universe as it existed under the test's selection method at each time. Record delistings, unavailable exits and missing records. Do not silently substitute today's popular assets into the past. If complete data is unavailable, state the limitation and narrow the conclusion. A result on one supplied surviving asset is a demonstration on that sample, not evidence of broad performance across all crypto markets.",
      },
      {
        type: "comparisonTable",
        caption: "Find the bias in the supplied test",
        columns: ["Test choice", "Problem", "Correction or disclosure"],
        rows: [
          [
            "Use final close for a noon entry",
            "Look-ahead",
            "Wait until input is actually known",
          ],
          [
            "Use only today's top tokens",
            "Survivorship and selection",
            "Historical universe with failures",
          ],
          [
            "Try 100 variants and report one",
            "Multiple testing and selection",
            "Record full search and independent evidence",
          ],
          [
            "Assume every limit touch fills",
            "Execution optimism",
            "Depth queue and conservative fill rules",
          ],
          [
            "Ignore fees and funding",
            "Gross result presented as net",
            "Complete cost worksheet",
          ],
          [
            "Use newly revised old entity labels",
            "Point-in-time mismatch",
            "Archived data or explicit limitation",
          ],
        ],
      },
    ],
  },
  {
    title: "Model feasible fills costs and testing limits",
    shortTitle: "Model feasible fills costs and testing limits",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Model feasible fills and all relevant costs",
      },
      {
        type: "paragraph",
        children:
          "Check spread, depth, queue uncertainty, partial fills, fees and product availability. A price touching a limit within a candle does not prove a fill for your size. A stop in a fast market may execute worse than its trigger. Funding and collateral rules affect derivative results, while withdrawal restrictions affect cash access.",
      },
      {
        type: "paragraph",
        children:
          "Test cost sensitivity rather than assuming one favourable estimate. A gross result that disappears under modest additional costs is fragile. Record whether the venue existed and the account would have been eligible during the sample. Simulation should also handle missed actions and unavailable data. A rule that requires continuous flawless attention may be incompatible with a beginner's actual routine even when its spreadsheet result is positive.",
      },
      {
        type: "paragraph",
        children:
          "If a candle's low touched a limit price, there may have been only a tiny quantity available at that level. A paper order larger than the available size cannot assume a full fill. If the same candle touched an entry, a stop and a target, the four summary prices may not reveal the sequence. Use finer data where appropriate or state a conservative treatment of ambiguous intervals.",
      },
      {
        type: "example",
        title: "The missing failed token",
        children:
          "A learner in Delhi tests an idea on today's ten largest tokens. A token that disappeared during the historical period is absent from the list. The test may accidentally remove a large loss from the universe. Reconstruct the assets available at the time where possible, or disclose the selection limit and avoid a stronger claim.",
      },
      {
        type: "heading",
        level: 3,
        children: "Disclose limits and keep observing",
      },
      {
        type: "paragraph",
        children:
          "A useful test report includes the rule version, all datasets, assumptions, variations, gross and net results, benchmark and limitations. Add adverse scenarios and an explanation of what the sample cannot establish. A small sample gives limited information about rare events and changing market conditions. Do not turn one favourable window into a forecast.",
      },
      {
        type: "paragraph",
        children:
          "Continue with forward paper observation if the question remains useful. Predetermine the review interval and reasons to stop or revise. A failed test can save time by exposing an unsupported idea. A successful test can justify further research without requiring a real deposit. The next lesson explains metrics and process review so that results are assessed with the same honesty as the inputs.",
      },
      {
        type: "paragraph",
        children:
          "A useful sensitivity check changes a stated assumption, such as adding a small extra cost or delaying entry by one interval, without pretending that the new outcome was the original test. Report the original result and the sensitivity result together. A rule that works only under one unusually favourable assumption needs further investigation.",
      },
      {
        type: "paragraph",
        children:
          "Forward paper observation can test whether the written procedure is usable as information arrives. It still does not reproduce real queue position, emotional pressure, account restrictions or every rare event. Success supports a bounded next research step; it does not require starting real-money trading.",
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Choosing only surviving restaurants",
        children:
          "A researcher in Italy studies restaurant profitability using only businesses still open today. The sample omits those that closed, so it may overstate the success of opening a restaurant. Testing today's surviving tokens backward creates a similar selection problem. The researcher should use the defined historical universe or clearly state the limited sample. A result cannot answer a broader question simply because the missing failures are inconvenient to obtain.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A reserved sample loses independence when repeatedly used to tune the rule.",
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
          "1. A rule is changed five times after seeing the holdout. Is the holdout still untouched?",
          "2. Why can a high or low in a candle fail to establish a fill?",
          "3. Write one limitation for a test using only one surviving venue.",
        ],
        answers: [
          "1. No. It has influenced design. Record that use and seek appropriately separated evidence.",
          "2. Trade sequence, queue position and available quantity may be unknown. A displayed extreme need not be executable for your order.",
          "3. The result may not capture venue failures, alternative liquidity, delistings or eligibility elsewhere, so it applies only to the stated sample and assumptions.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: ["Does a profitable backtest prove future performance?"],
        answers: [
          "No. Selection, estimation error, changing conditions and unmodelled failures can alter outcomes.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Keep development evidence distinct from evaluation.",
          "Audit when each input became available.",
          "Selection and execution assumptions can dominate results.",
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
              "David H Bailey Jonathan Borwein Marcos Lopez de Prado and Qiji Jim Zhu  The Probability of Backtest Overfitting",
            url: "https://scholarworks.wmich.edu/math_pubs/42/",
          },
          {
            title: "MIT OpenCourseWare  Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title:
              "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
            url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
          },
          {
            title: "Coinbase  Advanced trade order types",
            url: "https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/order-types",
          },
          {
            title: "Glassnode  Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title: "Glassnode  Exchange Data Transparency Notice",
            url: "https://docs.glassnode.com/further-information/exchange-data-transparency-notice",
          },
          {
            title:
              "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
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
  course: "crypto-planning-and-practice",
  description:
    "Measure a sample using net outcomes and an appropriate benchmark.",
  estimatedMinutes: 8,
  learningPath: "crypto",
  level: "level-9",
  module: "psychology-planning-and-paper-practice",
  objectives: [
    "Measure a sample using net outcomes and an appropriate benchmark.",
  ],
  position: 4,
  prerequisites: ["crypto-test-without-looking-ahead"],
  publishedDate: "2026-10-05",
  relatedLessonIds: ["crypto-test-without-looking-ahead"],
  relatedTermSlugs: ["bitcoin", "blockchain"],
  reviewer: "PipStart Course Owner",
  reviewDate: "2026-10-05",
  riskWarningRequired: true,
  seoDescription:
    "Measure a sample using net outcomes and an appropriate benchmark.",
  seoTitle: "Read Results Honestly and Build a Practice Routine",
  slug: "read-results-honestly-and-build-a-practice-routine",
  sources: [
    {
      title: "MIT OpenCourseWare  Blockchain and Money",
      url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    },
    {
      title:
        "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
      url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
    },
    {
      title: "CFTC  Understand the Risks of Virtual Currency Trading",
      url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
    },
    {
      title: "Glassnode  Entities metric definitions",
      url: "https://docs.glassnode.com/basic-api/endpoints/entities",
    },
    {
      title:
        "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
      url: "https://www.fca.org.uk/consumers/cryptoassets",
    },
  ],
  status: "published",
  title: "Read Results Honestly and Build a Practice Routine",
};
const sections4: LessonSection[] = [
  {
    title: "Read the sample expectancy and full equity path",
    shortTitle: "Read the sample expectancy and full equity path",
    blocks: [
      {
        type: "takeaway",
        title: "Your learning goal",
        children:
          "Measure a sample using net outcomes and an appropriate benchmark.",
      },
      {
        type: "paragraph",
        children:
          "A high win rate can coexist with a loss. A growing account can reflect new deposits rather than successful decisions. This lesson calculates a small paper sample, compares an appropriate benchmark and sets a review routine that distinguishes adherence from outcome. The numbers teach interpretation rather than statistical proof.",
      },
      {
        type: "takeaway",
        title: "Key idea",
        children:
          "Use the full net ledger and a fair comparison before judging a practice idea.",
      },
      {
        type: "riskStatement",
        children:
          "Education only. Crypto assets can lose substantial value or become worthless. No lesson requires buying an asset, depositing money or sharing real passwords, private keys or recovery words.",
      },
      {
        type: "heading",
        level: 3,
        children: "Win rate needs gain loss and sample size",
      },
      {
        type: "paragraph",
        children:
          "Win rate is the proportion of outcomes classified as wins under a stated convention. Average gain and average loss describe their magnitudes. Decide how to handle zero results and costs before calculating. Six gains and four losses in ten closed paper trades give a 60 percent win rate, but the percentage alone says little about profitability.",
      },
      {
        type: "paragraph",
        children:
          "Suppose each gross gain is USD 20 and each gross loss USD 40. Six gains total USD 120 and four losses total USD 160. Gross result is negative USD 40. Adding a USD 1 cost per completed trade makes net result negative USD 50. The sample is small and supplied; it illustrates the relationship between frequency, magnitude and costs without estimating a reliable future win probability.",
      },
      {
        type: "heading",
        level: 3,
        children: "Calculate the net sample expectancy",
      },
      {
        type: "paragraph",
        children:
          "Sample expectancy is average net outcome per trade. Here it is negative USD 50 divided by ten, or negative USD 5. Equivalently, a 60 percent share of USD 19 net gains combined with a 40 percent share of USD 41 net losses gives 0.6 × 19 minus 0.4 × 41, also negative USD 5.",
      },
      {
        type: "paragraph",
        children:
          "The average describes this sample, not a promised future amount. One exceptional outcome can dominate a small sample, and trades may not be independent. Report the distribution and range, not only the mean. PipStart's Risk Reward Calculator can compare planned distances, but it does not calculate success probability or complete realised expectancy. Actual fills and fees belong in the result ledger.",
      },
      {
        type: "heading",
        level: 3,
        children: "Read drawdown from the complete equity path",
      },
      {
        type: "paragraph",
        children:
          "Start the supplied account at USD 1,000, use the stated sequence and subtract USD 1 per trade. The equity peaks at USD 1,038 after the second trade and ends at USD 950. Its largest subsequent fall in this sequence is USD 88, about 8.48 percent of that peak. Drawdown uses the peak as denominator rather than initial capital.",
      },
      {
        type: "paragraph",
        children:
          "External deposits or withdrawals must be reconciled before describing performance. An intra-trade loss can also exceed a closed-trade series' observed drawdown, so report which observations are included. PipStart's Drawdown Calculator and Gain Recovery Calculator illustrate the arithmetic. They do not reveal unrecorded exposures or the probability of regaining a peak. A clean graph is useful only when the input series is complete for the stated question.",
      },
      {
        type: "comparisonTable",
        caption: "Calculate the ten trade sample",
        columns: ["Metric", "Calculation", "Result"],
        rows: [
          ["Win rate", "6 divided by 10", "60 percent"],
          ["Gross gains", "6 × USD 20", "USD 120"],
          ["Gross losses", "4 × USD 40", "USD 160"],
          ["Gross total", "120 − 160", "Negative USD 40"],
          ["Costs", "10 × USD 1", "USD 10"],
          ["Net total", "Negative 40 − 10", "Negative USD 50"],
          ["Net expectancy", "Negative 50 divided by 10", "Negative USD 5"],
          [
            "Observed peak-to-final decline",
            "88 divided by 1,038",
            "About 8.48 percent",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Sequence and complete equity ledger appear in the graduation practice appendix. Sample metrics are not future probabilities.",
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Try the PipStart tool: Drawdown calculator — use the complete observed paper-equity series, from the USD 1,038 peak to the USD 950 trough. Reconcile external cash flows and distinguish this observed drawdown from an unknown intratrade path. Tool setup: identify the observed USD 1,038 peak and subsequent USD 950 trough from the complete paper-equity record yourself, after reconciling external cash flows. Choose USD, starting balance 1,038, drawdown 88 and Drawdown unit Currency amount. The tool displays an 8.48 percent drawdown and 9.26 percent gain required to recover. It does not ingest a full equity series or reveal unknown intratrade lows.",
      },
      {
        type: "diagram",
        alt: "The complete supplied net ledger peaks at USD 1,038 and ends at USD 950. Maximum observed closed-trade drawdown is about 8.48 percent; intratrade paths are not supplied.",
        caption:
          "The complete supplied net ledger peaks at USD 1,038 and ends at USD 950. Maximum observed closed-trade drawdown is about 8.48 percent; intratrade paths are not supplied.",
        src: "/lessons/crypto/level-9/lesson-4-rId53.png",
        width: 1451,
        height: 655,
      },
    ],
  },
  {
    title: "Benchmarks review routine and reasons to pause",
    shortTitle: "Benchmarks review routine and reasons to pause",
    blocks: [
      {
        type: "heading",
        level: 3,
        children: "Use an appropriate benchmark",
      },
      {
        type: "paragraph",
        children:
          "A benchmark must match the dates, available capital, currency and relevant costs. Depending on the question, it may be holding the researched asset, keeping hypothetical cash or following a recurring purchase schedule. Explain exposure differences: a fully invested hold and an intermittently exposed rule have different risk paths, even if they begin with the same capital.",
      },
      {
        type: "paragraph",
        children:
          "For a separate supplied benchmark where a fully invested asset falls two percent and total costs are USD 2, USD 1,000 ends at USD 978. The paper rule's USD 950 is lower, while zero-interest fictional cash remains USD 1,000. These are capital-outcome comparisons under supplied assumptions, not proof that the benchmark is always preferable or that the risk is matched. State the question each comparison addresses.",
      },
      {
        type: "heading",
        level: 3,
        children: "Review process schedule and reasons to pause",
      },
      {
        type: "heading",
        level: 3,
        children: "Set a review schedule",
      },
      {
        type: "paragraph",
        children:
          "A car in Cape Town is serviced at set intervals, not only when it breaks down. So is a good plan.",
      },
      {
        type: "comparisonTable",
        caption: "A sample review schedule",
        columns: ["When", "What to review"],
        rows: [
          [
            "Weekly (10 minutes)",
            "Journal complete? Any rule breaks? Security alerts?",
          ],
          [
            "Monthly",
            "Crypto share against maximum allocation; fees paid; exchange exposure",
          ],
          [
            "Quarterly",
            "Process review of every journal entry; rebalancing if due (Lesson C8.4)",
          ],
          [
            "Yearly",
            "Purpose, horizon and limits; life changes; whether to continue at all",
          ],
          [
            "Trigger review",
            "After any big loss, big gain, rule break, or change in income, health or family",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Put the dates in your calendar now; reviews that wait for a free afternoon never happen. A review is for looking back, not for placing trades.",
      },
      {
        type: "paragraph",
        children:
          "What should a review look at? Not mainly whether you made money.",
      },
      {
        type: "heading",
        level: 3,
        children: "Review process separately from outcome",
      },
      {
        type: "paragraph",
        children:
          "A goalkeeper in Madrid dives the right way and still concedes; another guesses wrong and the striker hits the post. Judging keepers only by the score teaches the wrong lessons.",
      },
      {
        type: "paragraph",
        children:
          'The investor Michael Mauboussin, writing for CFA Institute, describes four boxes: a good process with a good outcome is "deserved success", a bad process with a good outcome is "dumb luck", and a bad process with a bad outcome is "poetic justice". The fourth box, a good process with a bad outcome, is an unlucky result. His point is that better decisions come from judging how a decision was made, not only how it turned out.',
      },
      {
        type: "paragraph",
        children:
          "When you review, classify each entry's process first: followed, broken or unclear. Then look at the outcome. A rule-following loss is not personal failure. A rule-breaking gain is still a break, and the gain does not prove the rule was wrong.",
      },
      {
        type: "example",
        title: "Lucy's quarter in Liverpool",
        children:
          "Lucy in Liverpool reviews 10 journal entries. Seven followed her plan, two broke it (both were FOMO buys, one of which gained) and one is unclear because she forgot to record the time. Among the nine she can assess, seven followed the plan.",
      },
      {
        type: "formula",
        expression:
          "Process-followed rate (%) = entries that followed the plan ÷ entries you can assess × 100",
        explanation:
          '7 ÷ 9 × 100 ≈ 78%. Report it as "78% of 9 assessable entries", and keep the unclear entry visible, not hidden or counted as a success.',
      },
      {
        type: "paragraph",
        children:
          "Her one change for next quarter: write the time on every entry. Changing one habit at a time shows what helped.",
      },
      {
        type: "paragraph",
        children:
          "Honest reviews sometimes point to a bigger conclusion: that it is time to stop.",
      },
      {
        type: "heading",
        level: 3,
        children: "Know when to pause or stop",
      },
      {
        type: "paragraph",
        children:
          "A marathon runner in Seoul who feels chest pain stops. Stopping is part of good running, not a failure of it.",
      },
      {
        type: "paragraph",
        children:
          "Write your stop conditions into the plan. Common ones include breaking the same rule three times in a review period, losing sleep, borrowing or wanting to, hiding activity from people close to you, needing to win back a loss, or a life change, such as a new baby or job loss, that makes the money matter more. Australia's Moneysmart describes an investor who kept adding money in the hope of recovering earlier crypto losses and ended up losing far more. Chasing losses is one of the clearest signs to stop.",
      },
      {
        type: "warning",
        title: "Stopping is a plan, not a panic",
        children:
          "Pausing means no new decisions until your written conditions for restarting are met. It does not mean selling everything in a hurry, and it does not cancel existing positions. Follow your exit and security rules. If crypto is affecting your health, money or relationships, talk to someone you trust and contact support services such as your doctor, a national gambling or addiction helpline or a free debt-advice service.",
      },
      {
        type: "paragraph",
        children:
          "Stepping back permanently is a valid result too. Deciding not to hold crypto, or to hold very little, is a successful use of what you learned.",
      },
      {
        type: "paragraph",
        children:
          "Your plan, journal and review notes now form a set. In Level 10 they feed your graduation project, alongside your security checklist, wallet backup plan and research templates. First, practise using them.",
      },
      {
        type: "paragraph",
        children:
          "Do not erase a losing sample from the research log. A sustainable routine includes scheduled data review, a small set of paper observations, a net-results reconciliation and a written decision to continue, revise or abandon the claim.",
      },
      {
        type: "diagram",
        alt: "Review whether the rule was followed separately from whether the outcome gained or lost.",
        caption:
          "Review whether the rule was followed separately from whether the outcome gained or lost.",
        src: "/lessons/crypto/level-9/lesson-4-rId54.png",
        width: 1980,
        height: 1286,
      },
    ],
  },
  {
    title: "Everyday example practice and review",
    shortTitle: "Practice and review",
    blocks: [
      {
        type: "example",
        title: "Many small savings and a few large bills",
        children:
          "A household in Canada saves CAD 20 on six shopping trips but pays an unexpected CAD 40 extra on four others. It records more saving trips than costly trips, yet the combined result is negative CAD 40 before travel expenses. A trading win rate has the same arithmetic limitation. Counting favourable outcomes without their size can hide an overall loss, and costs can deepen it.",
      },
      {
        type: "warning",
        title: "Watch out",
        children:
          "A small sample or one exceptional gain cannot establish reliable future performance.",
      },
      {
        type: "learningLink",
        title: "Open the Drawdown Calculator",
        href: "/tools/drawdown-calculator",
        description:
          "Try the PipStart tool: Drawdown Calculator — Measure peak-to-trough percentage on a clearly defined equity series. State whether deposits, withdrawals, fees and valuation changes have been reconciled. Tool setup: identify the observed USD 1,038 peak and subsequent USD 950 trough from the complete paper-equity record yourself, after reconciling external cash flows. Choose USD, starting balance 1,038, drawdown 88 and Drawdown unit Currency amount. The tool displays an 8.48 percent drawdown and 9.26 percent gain required to recover. It does not ingest a full equity series or reveal unknown intratrade lows.",
      },
      {
        type: "learningLink",
        title: "Open the Gain Recovery Calculator",
        href: "/tools/gain-recovery-calculator",
        description:
          "Try the PipStart tool: Gain Recovery Calculator — Explain the percentage gain required after a loss using an unchanged base definition. It describes arithmetic, not the likelihood or time of recovery. Tool setup: the Gain Recovery Calculator accepts a current balance and recovery target, not a loss-percentage input. For fictional losses from USD 1,000, use current balances 500, 250 and 100 with target 1,000 to represent falls of 50, 75 and 90 percent. Required gains are 100, 300 and 900 percent. Enter a fictional planned gain of 5 percent per period only to illustrate a constant-rate model: this assumes uninterrupted compounding and does not predict the likelihood or timing of recovery.",
      },
      {
        type: "learningLink",
        title: "Open the Risk Reward Calculator",
        href: "/tools/risk-reward-calculator",
        description:
          "Try the PipStart tool: Risk Reward Calculator — Compare entry, stop and target distances under stated price units. A reward-to-risk ratio is not the probability of success, actual net expectancy or a guaranteed fill. Tool setup: choose Long / Buy with fictional entry 50,000, stop-loss 47,500 and target 55,000 in matching price units. The result is 1 : 2.00. This describes planned distances before costs; calculate net sample expectancy from the actual paper results in the lesson, not from this ratio or its break-even illustration.",
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
          "1. What net average gain and loss follow from the USD 1 per-trade cost?",
          "2. Why does a 60 percent win rate not prevent the loss?",
          "3. What should a reviewer say about a profitable action that ignored the rule?",
        ],
        answers: [
          "1. Gains are USD 19 and losses USD 41 in magnitude.",
          "2. Average losses are larger than gains, and costs reduce the combined result.",
          "3. Its favourable outcome does not establish sound adherence. Review the deviation and avoid treating chance profit as evidence the rule is unnecessary.",
        ],
      },
      {
        type: "practice",
        title: "Quick knowledge check",
        prompts: [
          "Is sample expectancy a guaranteed amount earned on the next trade?",
        ],
        answers: [
          "No. It is an average over the stated observations, with uncertainty and possible dependence among outcomes.",
        ],
      },
      {
        type: "keyPoint",
        title: "What to remember",
        points: [
          "Report magnitude and costs beside win rate.",
          "Drawdown needs a specified observation series and cash-flow treatment.",
          "Adherence and outcome are separate review dimensions.",
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
            title: "MIT OpenCourseWare  Blockchain and Money",
            url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
          },
          {
            title:
              "MIT OpenCourseWare  Blockchain and the Design of Financial Systems lecture notes",
            url: "https://ocw.mit.edu/courses/14-129-blockchain-and-the-design-of-financial-systems-spring-2025/pages/lecture-notes/",
          },
          {
            title: "CFTC  Understand the Risks of Virtual Currency Trading",
            url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/understand_risks_of_virtual_currency.html",
          },
          {
            title: "Glassnode  Entities metric definitions",
            url: "https://docs.glassnode.com/basic-api/endpoints/entities",
          },
          {
            title:
              "Financial Conduct Authority  Financial Conduct Authority — Cryptoassets",
            url: "https://www.fca.org.uk/consumers/cryptoassets",
          },
        ],
      },
    ],
  },
];
export const cryptoLevel9Lessons: LessonDocument[] = [
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
