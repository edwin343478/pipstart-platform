import type { LessonDocument, LessonMetadata, LessonSection } from "../../lesson-content";

import { flattenSections } from "../../lesson-content";

import { metadata as metadata1 } from "./orientation-course-purpose.mdx";

import { metadata as metadata2 } from "./trading-versus-investing.mdx";

import { metadata as metadata3 } from "./money-risk-and-demo.mdx";

import { metadata as metadata4 } from "./spot-forex-scams-and-safety.mdx";

const level0Lesson1Sections: LessonSection[] = [
    {
      title: "Why this lesson comes first",
      shortTitle: 'Why this lesson',
      blocks: [
        {
          type: "section",
          title: "Why this lesson comes first",
          paragraphs: [
            "Before learning currency pairs, pips, charts, brokers, or trading strategies, it is important to understand what learning Forex actually means.",
            "People and businesses change one currency into another every day to travel, shop, make international payments, and pay suppliers. A person trading Forex has a different aim: they take a position because they expect one currency to change in value against another. The prediction may be right or wrong.",
          ],
        },
        {
          type: "definition",
          term: "Foreign exchange",
          children:
            "Forex is short for foreign exchange: the process of changing one currency into another, for travel, shopping, payments, business, and investment.",
        },
        {
          type: "definition",
          term: "Trading Forex",
          children:
            "Trading is different: a trader expects one currency's value to change against another. If the market moves as expected, the trade may make money. If not, it may lose money.",
        },
        {
          type: "takeaway",
          children: "That means Forex trading always involves uncertainty.",
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "This course can help you understand how the market works, how trading decisions are made, what risks are involved, and how to practise carefully. What it cannot do is remove uncertainty.",
          ],
        },
        {
          type: "warning",
          children:
            "No lesson, strategy, indicator, teacher, broker, influencer, or trading system can promise that every trade will make money.",
        },
      ],
    },
    {
      title: "What this course is designed to teach",
      shortTitle: 'What it teaches',
      blocks: [
        {
          type: "section",
          title: "",
          paragraphs: [
            'The goal of this course is not to turn you into a person who presses "buy" or "sell" quickly — it\'s to help you understand what you\'re doing before you ever consider risking money.',
          ],
        },
        {
          type: "keyPoint",
          title: "By moving through the course, you will gradually learn how to…",
          points: [
            "Understand common Forex words and ideas",
            "Read a basic currency quote",
            "Understand trading costs such as spreads and fees",
            "Understand how leverage can increase both gains and losses",
            "Recognize common broker and scam warning signs",
            "Practise using demo accounts",
            "Build a trading plan and keep records of decisions",
            "Review mistakes so you can improve your understanding",
          ],
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "You may also decide that live Forex trading is not suitable for you — that is also a valid result of learning. Education should help you make a better-informed decision, including the decision not to trade.",
          ],
        },
      ],
    },
    {
      title: "What this course cannot promise",
      shortTitle: 'Cannot promise',
      blocks: [
        {
          type: "keyPoint",
          title: "This course cannot promise…",
          points: [
            "A guaranteed income",
            "A guaranteed profitable strategy",
            "A certain number of winning trades",
            "A salary from trading",
            "A specific monthly return",
            "That you will never lose money",
            "Readiness to risk real money on completion",
          ],
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "Passing a lesson or quiz only shows you understood the material — it does not prove you can predict markets or trade profitably.",
          ],
        },
        {
          type: "section",
          title: "Markets can move because of…",
          paragraphs: [
            "Interest-rate decisions, inflation reports, political events, unexpected news, changes in investor behaviour, or many other factors. Some events happen suddenly. Because of this, uncertainty is part of trading.",
          ],
        },
      ],
    },
    {
      title: "A simple way to think about learning Forex",
      shortTitle: 'Example',
      blocks: [
        {
          type: "example",
          title: "A simple way to think about learning Forex",
          children: [
            "Imagine you are learning to ride a bicycle. Before riding on a busy road, you learn how the brakes work, how to balance, how to turn, and what road signs mean. A book can explain these things and a teacher can show you how to practise, but neither can promise you will never fall.",
            "Forex education works the same way — it teaches the market version of the brakes and road signs, before you think about taking real financial risk. The purpose is preparation, not a profit guarantee.",
          ],
        },
      ],
    },
    {
      title: "Learning slowly is part of the course",
      shortTitle: 'Learning slowly',
      blocks: [
        {
          type: "section",
          title: "Learning slowly is part of the course",
          paragraphs: [
            "Beginners sometimes believe that faster learning means better learning. In reality, rushing often creates confusion.",
            "A better approach is to study one idea at a time and make sure you can explain it in your own words — repeating it the next day if it's still unclear, instead of pushing forward.",
          ],
        },
        {
          type: "example",
          title: "A 20-minute study routine",
          children: [
            "Spend 10 minutes reading one lesson carefully. Spend the next 5 minutes explaining its main idea using a familiar situation. For example, a friend in India sees rice priced at ₹60 per kilogram in one shop and ₹65 in another. You might explain how location, costs, demand, or the seller's pricing can account for the difference. That is not a Forex example yet; it is practice at explaining a price clearly.",
            "Use the last 5 minutes for a short exercise or to write down a question. If the idea is still unclear, return to it tomorrow. The goal is understanding, not finishing quickly.",
          ],
        },
      ],
    },
    {
      title: "Your learning route",
      shortTitle: "Learning route",
      blocks: [
        {
          type: "section",
          title: "Your learning route",
          paragraphs: [
            "Level 0 begins with orientation and safety. You will distinguish everyday currency exchange from trading and investing, learn what financial risk, leverage, and demo accounts mean, and recognise common Forex scam warning signs.",
            "Level 1 begins the market vocabulary: currency pairs, prices, pips, spreads, trading sessions, and market participants. Later levels build on those foundations. Follow the course as a connected journey, allowing each level to prepare you for the next.",
          ],
        },
        {
          type: "takeaway",
          children: "There is no requirement to open or fund a live trading account to continue learning.",
        },
      ],
    },
    {
      title: "Before moving on",
      shortTitle: 'Before you move on',
      blocks: [
        {
          type: "keyPoint",
          title: "Before moving on",
          points: [
            "Why do I want to learn Forex?",
            "Am I learning because I want to understand the market, or because someone promised quick money?",
            "Can I accept that learning does not guarantee profit?",
            "Am I willing to practise without putting real money at risk?",
            "Can I slow down when I do not understand something?",
          ],
        },
        {
          type: "takeaway",
          children:
            "Write down your answers. Forex education can teach you how the market works, how risk works, and how to practise more carefully. It cannot guarantee that you will make money. Keep that difference in mind throughout the course.",
        },
      ],
    },
    {
      title: "Practice: how to know that you really understand a lesson",
      shortTitle: "Check understanding",
      blocks: [
        {
          type: "section",
          title: "How to know that you really understand a lesson",
          paragraphs: [
            "Reading a definition is a first step. Try explaining the idea aloud without looking at the lesson, working its example again with different invented numbers, and naming one situation where the simple rule might not work. If you cannot do all three yet, return to the example. You do not have to memorise every term on your first reading.",
          ],
        },
        {
          type: "example",
          title: "An online purchase from India",
          children: [
            "Imagine a learner in India explaining a currency quote to a friend who paid for an overseas online order. They should be able to name the two currencies, explain the exchange rate, point out the provider's fee, and say why the final card charge may differ from a headline rate. That shows more understanding than merely recognising the words ‘exchange rate’ on a quiz.",
          ],
        },
        {
          type: "keyPoint",
          title: "A useful habit for every lesson",
          points: [
            "Explain the main idea in my own words without looking.",
            "Try a worked example with new, invented numbers.",
            "Name a limitation or question that the example does not answer.",
            "Add unfamiliar words and my own questions to a small glossary.",
          ],
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "‘I do not know yet’ is a useful answer. Pretending to know can be expensive when money is involved. Completing this foundations course means you can read the basic mechanics, recognise important risks, and evaluate a demo exercise; it does not certify skill or suitability for live trading.",
          ],
        },
        {
          type: "references",
          items: [
            {
              title: "CFTC — Eight Things You Should Know Before Trading Forex",
              url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
            },
            {
              title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
              url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
            },
          ],
        },
      ],
    },
  ];



// Keep published metadata, existing routes and saved progress identifiers.
// Only the lesson manuscript and its section structure are replaced.
level0Lesson1Sections[0].blocks.push({
  type: "riskStatement",
  children: "Forex trading can cause financial losses. Learning and demo practice do not guarantee future results.",
});

export const level0Lesson1: LessonDocument = {
  metadata: metadata1 as LessonMetadata,
  sections: level0Lesson1Sections,
  blocks: flattenSections(level0Lesson1Sections),
};


const level0Lesson2Sections: LessonSection[] = [
    {
      title: "Travel money",
      shortTitle: 'Travel money',
      blocks: [
        {
          type: "section",
          title: "Why these activities should not be mixed together",
          paragraphs: [
            "Before learning how to place trades, you need to understand why a person is using money in the first place. Three activities are often confused: exchanging currency for a practical reason, trading, and investing. Understanding the purpose helps you understand the risk.",
            "Everyday currency exchange happens when someone needs another currency for a payment, trip, purchase, or business transaction. The goal is to obtain the currency they need, not necessarily to profit from a change in its price. The rate and provider charges still affect what they pay or receive.",
          ],
        },
        {
          type: "example",
          title: "Travel money",
          children: [
            "Lucas lives in Brazil and is travelling to Germany. Before the trip, he changes Brazilian reais (BRL) into euros (EUR) to pay for local transport, food, and other expenses.",
            "Lucas is not trying to predict whether the euro will rise or fall tomorrow. His questions are: what exchange rate will I receive, are there any fees, and how much will I actually get after the fees? This is everyday currency exchange.",
          ],
        },
      ],
    },
    {
      title: "The tomato trader",
      shortTitle: 'The tomato trader',
      blocks: [
        {
          type: "section",
          title: "Trading",
          paragraphs: [
            "Trading is different. A trader buys or sells because they expect the price to move, hoping to benefit from that price change over minutes, hours, days, or longer. But there is no guarantee the price will move in the expected direction — the trader can be wrong, and may also face costs such as the spread, commissions, or financing charges.",
            "A trade can move in the expected direction and still fail to make a profit if the price change is too small to cover those costs. Before placing any trade, a learner should know both why they expect a move and what happens if they are wrong.",
          ],
        },
        {
          type: "example",
          title: "The tomato trader",
          children: [
            "Diego buys a crate of tomatoes in Mexico for MX$800 in the morning, hoping to sell it later that day for MX$950. But several things can go wrong: the market price could fall, some tomatoes could spoil, transport costs could increase, customers may not arrive. If Diego sells for only MX$780 after paying transport, he loses money.",
            "A currency trade works differently from selling tomatoes, but the basic lesson is similar: an expected price increase is not the same as a guaranteed profit.",
          ],
        },
      ],
    },
    {
      title: "Course fees due Friday",
      shortTitle: 'Course fees due Friday',
      blocks: [
        {
          type: "section",
          title: "Investing",
          paragraphs: [
            "Investing usually has a longer-term purpose — a person may invest money to work toward a future goal such as retirement, education, or long-term wealth building. Investing still involves risk, but the time horizon and purpose are usually different from a short-term trade. So when someone says \"I am investing in Forex,\" it's worth asking what they actually mean: are they holding an asset as part of a long-term plan, or repeatedly opening short-term speculative positions? The label matters less than the actual behaviour.",
            "The value of an investment can rise or fall. A diversified long-term investment is different from placing all your money into one speculative currency position. Even an overseas investment can have currency risk: a foreign asset's value and the exchange rate can both change before you bring the money home.",
          ],
        },
        {
          type: "section",
          title: "Why time matters",
          paragraphs: [
            "The sooner you need the money, the more careful you should be about exposing it to market risk. Money needed tomorrow has a different job from money set aside for a long-term goal.",
          ],
        },
        {
          type: "example",
          title: "Course fees due Friday",
          children:
            "Mia lives in Australia. She has A$600 set aside for course fees that must be paid on Friday. On Tuesday, she watches a video claiming she can make a quick Forex profit before Thursday. If Mia uses the A$600 to trade and the trade loses, she may not be able to pay her fees. The issue is not whether the trade \"looks good\" — it's that the A$600 already has an important job. For money needed very soon, keeping it available may be more important than trying to earn a short-term return.",
        },
        {
          type: "warning",
          children:
            "Some beginners assume that making more trades creates more chances to profit. It also creates more decisions — each trade may involve costs, and each decision can be wrong. More activity can mean more opportunities for mistakes, not only more opportunities for gains. This is one reason why trading should not be treated as a shortcut to income.",
        },
      ],
    },
    {
      title: "Comparing the three activities",
      shortTitle: 'Comparing & practice',
      blocks: [
        {
          type: "comparisonTable",
          caption: "Comparing the three activities",
          columns: ["Activity", "Main purpose", "Example", "Main question"],
          rows: [
            [
              "Everyday currency exchange",
              "Make a payment or use money in another currency",
              "Change BRL into EUR before travel",
              "What rate and fees will I pay?",
            ],
            [
              "Short-term trading",
              "Try to benefit from a price move",
              "Open and close a currency position today",
              "What could I lose and what will it cost?",
            ],
            [
              "Longer-term investing",
              "Work toward a future financial goal",
              "Contribute to a diversified long-term investment",
              "What are the risks, time horizon, and costs?",
            ],
          ],
        },
        {
          type: "exercise",
          prompt:
            "Classify each situation: (A) A Brazilian business changes BRL into EUR to pay a supplier in Germany — this is currency exchange, because the purpose is payment. (B) A person opens a currency position in the morning hoping to close it for a profit that evening — this is trading, because the goal is to benefit from a short-term price movement. (C) A person regularly contributes money to a diversified investment portfolio for a long-term goal — this is longer-term investing. Now explain each answer using three ideas: the purpose of the money, the time frame, and the main risk.",
        },
      ],
    },
    {
      title: "Four different activities that use currencies",
      shortTitle: "Four purposes",
      blocks: [
        {
          type: "section",
          title: "Four different activities that use currencies",
          paragraphs: [
            "A payment, a hedge, an investment, and a speculative trade can all involve foreign currency. The reason for the transaction determines what a good outcome means. Paying a bill means obtaining the required currency for a known expense. Hedging means reducing uncertainty about a future receipt or payment. Investing means holding an asset toward a longer-term goal, while taking the risks of both that asset and its currency. Speculating means deliberately taking a price risk in the hope of a gain.",
            "For example, a South African exporter who expects a payment in US dollars might arrange in advance how those dollars will be converted to rand. Their main concern is planning the rand amount available to pay local expenses, not winning a short-term currency bet. A hedge can involve charges and can mean missing out if the exchange rate later becomes more favourable. Its exact protection depends on the arrangement used.",
          ],
        },
        {
          type: "comparisonTable",
          caption: "The same currencies can serve different purposes",
          columns: ["Activity", "Purpose", "What counts as success?"],
          rows: [
            ["Paying", "Obtain currency for a known bill", "Pay the bill at an understood total cost"],
            ["Hedging", "Reduce uncertainty about a later payment or receipt", "Keep a budget more predictable, subject to terms and costs"],
            ["Investing", "Hold an asset toward a longer-term goal", "Assess the asset, time horizon, costs, and currency risk"],
            ["Speculating", "Seek a gain from a currency price move", "Understand potential loss and costs as well as possible gain"],
          ],
        },
        {
          type: "example",
          title: "A Brazilian family's school-fee bill",
          children: [
            "A family in Brazil must pay US$200 in school fees next month. At an invented USD/BRL rate of 5.00 — one US dollar costs five reais — the bill would be R$1,000 before provider charges (200 × 5.00). If that rate becomes 5.20, the same bill would cost R$1,040 before charges (200 × 5.20). That is R$40 more for the same school fee.",
            "If the family buys the US$200 early, they know how many reais they paid for this one bill, though fees and the provider's rate still matter. They are meeting an expense, not claiming that the dollar will rise. Someone buying US$200 solely because they hope to sell it later at a higher price is speculating. The dollar could instead fall, and conversion costs can reduce or erase a gain.",
          ],
        },
        {
          type: "exercise",
          prompt: "Try explaining the difference: a Brazilian parent buys dollars for a school bill, an exporter arranges a future conversion to make a budget steadier, and a trader buys dollars hoping to sell them at a higher rate next week. Which is paying, hedging, and speculating? Answer: the parent is paying, the exporter is hedging, and the trader is speculating. For each one, ask what money is needed, when it is needed, and what could still go wrong.",
        },
        {
          type: "takeaway",
          children: "When someone says ‘I trade Forex,’ ask what instrument they use and whether the purpose is paying, hedging, investing, or speculating. The words alone do not tell you their risk.",
        },
      ],
    },
    {
      title: "Key takeaway",
      shortTitle: 'Takeaway',
      blocks: [
        {
          type: "takeaway",
          children:
            "Before deciding whether an activity is suitable, first ask: what is this money meant to do? Money for travel, bills, food, school fees, rent, or emergencies should not be treated the same way as money someone is prepared to expose to investment or trading risk.",
        },
        {
          type: "references",
          items: [
            {
              title: "FINRA — Frequent Intraday Trading: Understanding the Basics",
              url: "https://www.finra.org/investors/insights/frequent-intraday-trading",
            },
            {
              title:
                "Consumer Financial Protection Bureau — An Essential Guide to Building an Emergency Fund",
              url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
            },
            {
              title: "CFTC — Eight Things You Should Know Before Trading Forex",
              url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
            },
            {
              title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
              url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
            },
          ],
        },
      ],
    },
  ];



// Keep published metadata, existing routes and saved progress identifiers.
// Only the lesson manuscript and its section structure are replaced.
level0Lesson2Sections[0].blocks.push({
  type: "riskStatement",
  children: "Forex trading can cause financial losses. Learning and demo practice do not guarantee future results.",
});

export const level0Lesson2: LessonDocument = {
  metadata: metadata2 as LessonMetadata,
  sections: level0Lesson2Sections,
  blocks: flattenSections(level0Lesson2Sections),
};


const level0Lesson3Sections: LessonSection[] = [
    {
      title: "Start with the money, not the trade",
      shortTitle: 'Start with the money',
      blocks: [
        {
          type: "section",
          title: "Start with the money, not the trade",
          paragraphs: [
            "Before learning how leverage works, you need to understand a more basic idea: not all money should be put at risk. Money used for food, rent, transport, school fees, urgent medical costs, or emergencies already has an important purpose. If that money is lost in a trade, the problem is not only the trading loss — it can affect everyday life.",
          ],
        },
        {
          type: "takeaway",
          children:
            "That is why risk management starts before a trade is opened. It starts with the question: can I afford to lose this money without harming an important need?",
        },
        {
          type: "definition",
          term: "Financial risk",
          children:
            "Financial risk is the possibility that you may lose some or all of the money you put into an activity. Forex trading can create losses quickly because currency prices can move in either direction. Costs also matter — a trade may involve a spread, a commission, overnight financing, slippage, or other provider charges, which can reduce gains or increase losses.",
        },
      ],
    },
    {
      title: "What leverage means",
      shortTitle: 'What leverage means',
      blocks: [
        {
          type: "definition",
          term: "Leverage",
          children:
            "Leverage allows a trader to control a position that is larger than the cash they personally put down. This can make small market movements have a much larger effect on the trader's own money — leverage works in both directions, increasing gains, but also increasing losses.",
        },
        {
          type: "example",
          title: "Building the idea step by step",
          children: [
            "Suppose you use US$10 of your own money. Without leverage, that US$10 controls a US$10 position — if that position falls 1%, the loss is US$0.10.",
            "Now imagine the same US$10 controls a US$100 position instead. A 1% fall in US$100 is US$1. The market moved only 1%, but you lost US$1 from the US$10 you put down — that's 10% of your cash. Leverage has made a small market movement much more important to you.",
          ],
        },
        {
          type: "comparisonTable",
          caption: "How leverage changes the effect of a 1% market move",
          columns: ["Cash put down", "Position controlled", "1% loss on position", "Share of cash lost"],
          rows: [
            ["US$10", "US$10", "US$0.10", "1%"],
            ["US$10", "US$100", "US$1.00", "10%"],
            ["US$10", "US$500", "US$5.00", "50%"],
          ],
        },
        {
          type: "riskNotice",
          children:
            "This is why leverage can be dangerous for beginners — a small movement in the market can create a large change in the money you put down. Depending on the product, broker, account agreement, local rules, and available protections, losses may sometimes exceed the amount initially deposited.",
        },
      ],
    },
    {
      title: "Margin and trading costs",
      shortTitle: 'Margin & spread',
      blocks: [
        {
          type: "section",
          title: "Margin",
          paragraphs: [
            "Margin is the amount of money a broker requires you to have in order to open or maintain a leveraged position — part of the mechanism that allows you to control a larger position. The important point for Level 0 is not to memorize every margin formula yet; it's to understand that leverage allows a larger position to be controlled with less cash, which increases the effect of market movements. Later lessons will explain margin more deeply.",
          ],
        },
        {
          type: "section",
          title: "Trading costs",
          paragraphs: [
            'Even before the market moves, a trade can begin with a cost. One common cost is the spread: the difference between the price at which you can buy and the price at which you can sell.',
          ],
        },
        {
          type: "example",
          title: "The fruit stall",
          children:
            "Imagine a fruit stall in South Africa. The stall sells a small bag of oranges for R110. But if you immediately try to sell the same bag back to the stall, the stall will only pay R100. The R10 difference is similar to the idea of a spread — if you buy and sell immediately, you are already starting with a cost. Forex quotes work differently from fruit stalls, but the example helps show why the buy and sell prices are not necessarily the same.",
        },
      ],
    },
    {
      title: "Why demo accounts come first",
      shortTitle: 'Demo accounts',
      blocks: [
        {
          type: "section",
          title: "Why demo accounts come before live accounts",
          paragraphs: [
            "A demo account is a practice environment that uses simulated money. It allows you to learn how a trading platform works — finding currency pairs, entering an order, closing an order, recording a trade, reading account information, noticing trading costs, and understanding how mistakes happen — without risking the demo balance as real money. But a demo account is not the same as a live account.",
          ],
        },
        {
          type: "warning",
          title: "What a demo account cannot prove",
          children:
            "A learner may make several successful demo trades. That does not prove the same results will continue in live trading. Demo conditions may differ from live conditions — execution may differ, spreads may differ, slippage may differ. And most importantly, real money can create emotional pressure that simulated money does not.",
        },
        {
          type: "example",
          title: "Practising a bus route",
          children:
            "Min lives in South Korea and wants to learn a new bus route through Seoul. She first studies the route on a map — where the bus stops, where she changes buses, where she gets off. This practice is useful, but the real journey can still feel different: there may be traffic, she may miss a stop, she may feel pressure because she needs to arrive on time. A demo account works in a similar way — useful practice, but it does not reproduce every live condition.",
        },
      ],
    },
    {
      title: "Practice: understanding leverage",
      shortTitle: 'Practice',
      blocks: [
        {
          type: "section",
          title: "A safer way to use a demo account",
          paragraphs: [
            "Instead of using a demo account to chase a large fake balance, use it to learn a process. For each practice trade, write down why you entered, what you expected to happen, where you would exit if you were wrong, what costs appeared, what actually happened, what surprised you, and what you would do differently next time. The goal is not to prove that you can make money — the goal is to learn how decisions work.",
          ],
        },
        {
          type: "formula",
          expression: "US$200 × 2% = US$4 loss  →  US$4 ÷ US$20 = 20% of cash",
          explanation:
            "Suppose you put down US$20 and control a US$200 position. If the position falls by 2%, the loss before fees is US$200 × 2% = US$4. Compare that loss with your US$20: US$4 ÷ US$20 = 20%. So a 2% movement in the larger position produced a loss equal to 20% of the cash you put down. Now ask a more important question: what if that US$20 was needed for transport, food, or a bill tomorrow? That question connects the mathematics back to real financial risk.",
        },
      ],
    },
    {
      title: "Key takeaway",
      shortTitle: 'Takeaway',
      blocks: [
        {
          type: "takeaway",
          children:
            "Leverage does not remove risk — it increases the effect of market movements on your own money. A demo account can help you learn the process, but demo results do not guarantee live results. And money needed for essential expenses should not be treated as trading money.",
        },
        {
          type: "references",
          items: [
            {
              title: "SEC Investor Bulletin — Foreign Currency Exchange Trading",
              url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/foreign",
            },
            {
              title: "CFTC — Eight Things You Should Know Before Trading Forex",
              url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
            },
            {
              title:
                "Consumer Financial Protection Bureau — An Essential Guide to Building an Emergency Fund",
              url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
            },
          ],
        },
      ],
    },
  ];



// Keep published metadata, existing routes and saved progress identifiers.
// Only the lesson manuscript and its section structure are replaced.
level0Lesson3Sections[0].blocks.push({
  type: "riskStatement",
  children: "Forex trading can cause financial losses. Learning and demo practice do not guarantee future results.",
});

export const level0Lesson3: LessonDocument = {
  metadata: metadata3 as LessonMetadata,
  sections: level0Lesson3Sections,
  blocks: flattenSections(level0Lesson3Sections),
};


const level0Lesson4Sections: LessonSection[] = [
    {
      title: "The biggest warning sign: certainty",
      shortTitle: "Certainty warning",
      blocks: [
        {
          type: "section",
          title: "Why scams belong in the beginner level",
          paragraphs: [
            "A beginner may know very little about Forex but still be exposed to advertisements, social-media messages, signal groups, fake brokers, or people claiming to have a secret trading method. This means scam awareness should come before advanced trading knowledge — you do not need to understand every trading strategy to recognize many dangerous warning signs.",
            "From the earlier lessons, you already know that prices can move in either direction, losses are possible, leverage can increase losses, past results do not guarantee future results, and a demo winning streak does not prove future profit. Once you understand those ideas, unrealistic promises become easier to recognize.",
          ],
        },
        {
          type: "warning",
          title: "Certainty where uncertainty exists",
          children:
            'Forex trading involves uncertainty. So when someone claims "Guaranteed profit," "No risk," "You cannot lose," "Double your money by Friday," or "This trade always wins," you should become cautious. A strong guarantee is a warning sign because it conflicts with the basic reality that markets can move unexpectedly — that alone is a strong reason to stop and investigate before sending money.',
        },
        {
          type: "warning",
          title: "Pressure is another warning sign",
          children:
            'Scammers often try to make people act before they have time to think — "Deposit today," "This offer ends tonight," "Only five places left," "Send the money now." The pressure is useful to the scammer because careful checking takes time. A safer response is to slow down; real learning does not require panic.',
        },
      ],
    },
    {
      title: "The group-chat offer",
      shortTitle: 'The group-chat offer',
      blocks: [
        {
          type: "example",
          title: "The group-chat offer",
          children: [
            'Daniel is in the United Kingdom. He joins a group chat where someone says: "Deposit £100 today and we will double it by Friday." Instead of sending the money, Daniel asks who the company is, where it is registered, how the strategy supposedly works, what the risks are, why the return is guaranteed, and whether he can verify the company independently.',
            "The person avoids the questions and keeps repeating that Daniel must act quickly. Daniel decides not to send the money. The important lesson is not that Daniel knew everything about Forex — he simply noticed that the offer combined an unrealistic profit promise with pressure to act quickly.",
          ],
        },
      ],
    },
    {
      title: "The look-alike website",
      shortTitle: 'The look-alike site',
      blocks: [
        {
          type: "section",
          title: "Verify independently",
          paragraphs: [
            "A common mistake is to use the link sent by the same person who is asking for money — a fake website can look very similar to a real one. A safer approach is to find the official website independently.",
          ],
        },
        {
          type: "example",
          title: "The look-alike website",
          children:
            "Sophie is in Canada. She receives a message that appears to come from a broker, containing a link and asking her to log in. Instead of clicking the link, Sophie opens her browser and independently navigates to the broker's known official website — reducing the chance of entering details into a fake one. The same principle applies to phone numbers, email addresses, registration details, and support contacts: whenever possible, verify important information using an independent source.",
        },
      ],
    },
    {
      title: "Protect your account and check the provider",
      shortTitle: "Protect account",
      blocks: [
        {
          type: "warning",
          title: "Protect account access",
          children:
            "Scams are not only about sending money — some scams try to steal access to your accounts. Be suspicious if someone asks for your password, a one-time verification code, backup codes, remote access to your device, access to your email account, or access to your wallet or payment account. A legitimate need for support does not usually require you to hand over secret authentication information. One-time codes are designed to protect you — do not treat them like ordinary information.",
        },
        {
          type: "section",
          title: "Check the provider, not only the advertisement",
          paragraphs: [
            "A professional-looking advertisement does not prove that a provider is legitimate. A celebrity image does not prove legitimacy. A large social-media following does not prove legitimacy. Before trusting a provider, investigate the legal company name, where it is registered, which regulator is responsible if applicable, whether the contact details match official records, how deposits and withdrawals work, what fees apply, whether the website domain matches the official provider, and whether the provider makes unrealistic profit claims. Rules and protections differ between countries, so there is no single worldwide checklist that proves a broker is safe — the important habit is to verify claims independently.",
          ],
        },
        {
          type: "warning",
          title: "Withdrawal problems matter",
          children:
            'A scam may appear normal when money is being deposited. The problem may become visible when the person tries to withdraw. Warning signs can include demands such as "Pay another fee before you can withdraw," "Deposit more money to unlock your balance," "Pay tax directly to us before withdrawal," "Upgrade your account first," or "Send a verification payment." Not every delay means fraud, but unexpected demands for more money should trigger careful investigation.',
        },
      ],
    },
    {
      title: "Practice: identify the warning signs",
      shortTitle: "Practice",
      blocks: [
        {
          type: "exercise",
          prompt:
            'Imagine you receive this message in Canada: "Earn 15% every week. Send C$500 before midnight. To activate your account, send us the one-time code from your phone." Before deciding what to do, examine the message.',
        },
        {
          type: "keyPoint",
          title: "Three warning signs in this message",
          points: [
            "The unrealistic return — a fixed 15% weekly return is an extremely strong claim; markets do not produce guaranteed returns on demand.",
            'The time pressure — "before midnight" is designed to reduce the time available for checking.',
            "The request for a one-time code — one-time codes are security information; you should not send them to someone who contacts you asking for access.",
          ],
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "A safer response is to avoid sending money, avoid sending the code, avoid using the supplied link, and verify the company independently before taking any further action.",
          ],
        },
      ],
    },
    {
      title: "Build a safer learning plan",
      shortTitle: "Safer plan",
      blocks: [
        {
          type: "section",
          title: "Build a safer learning plan",
          paragraphs: [
            "Now connect everything from Level 0. A safer beginner learning plan begins by learning the vocabulary before thinking about trades. Next, understand risk and accept that losing trades are possible and that leverage can increase losses.",
          ],
        },
        {
          type: "keyPoint",
          points: [
            "Keep essential money separate — rent, food, school fees, emergency savings, and other money needed soon should not be treated as trading money.",
            "Use simulated funds to practise platform mechanics and decision-making, and keep records of why you entered a practice trade, what happened, what went wrong, and what you learned.",
            "Verify providers independently rather than relying only on advertisements, social-media messages, or referral links.",
            "Treat guaranteed profits, pressure, and \"risk-free\" claims as warning signs.",
          ],
        },
        {
          type: "takeaway",
          children:
            "Most importantly, do not create a deadline for moving from demo learning to live trading. You can continue to Level 1 without opening or funding a live account.",
        },
      ],
    },
    {
      title: "Final Level 0 reflection",
      shortTitle: 'Final reflection',
      blocks: [
        {
          type: "keyPoint",
          title: "Before continuing, make sure you can explain these ideas in your own words",
          points: [
            "Why can no course guarantee profit?",
            "What is the difference between trading, investing, and everyday currency exchange?",
            "Why should essential money stay out of speculative trades?",
            "How can leverage magnify a loss?",
            "What can a demo account teach?",
            "What can a demo account not prove?",
            "Why are guaranteed returns a warning sign?",
            "Why should you verify a broker or website independently?",
            "Why should you never share passwords or one-time codes?",
          ],
        },
        {
          type: "section",
          title: "",
          paragraphs: [
            "If you can explain these ideas clearly, you are ready to begin Level 1. Level 1 will introduce the market itself: currency pairs, base and quote currencies, bid and ask prices, spreads, pips, lots, sessions, and market participants. You still do not need a live trading account.",
          ],
        },
        {
          type: "takeaway",
          children:
            'A safer learner does not ask only "How can I make money?" A safer learner also asks: "What can go wrong, what can I verify, and how can I learn without risking money I need?" That mindset is the real purpose of Level 0.',
        },
        {
          type: "references",
          items: [
            {
              title: "CFTC — Forex Frauds",
              url: "https://www.cftc.gov/LearnAndProtect/forexfrauds",
            },
            {
              title: "CFTC — Fraud Advisory: Foreign Currency (Forex) Fraud",
              url: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_forex.html",
            },
            {
              title: "Investor.gov — Red Flags of Investment Fraud Checklist",
              url: "https://www.investor.gov/protect-your-investments/fraud/how-avoid-fraud/red-flags-investment-fraud-checklist",
            },
          ],
        },
      ],
    },
  ];



// Keep published metadata, existing routes and saved progress identifiers.
// Only the lesson manuscript and its section structure are replaced.
level0Lesson4Sections[0].blocks.push({
  type: "riskStatement",
  children: "Forex trading can cause financial losses. Learning and demo practice do not guarantee future results.",
});

export const level0Lesson4: LessonDocument = {
  metadata: metadata4 as LessonMetadata,
  sections: level0Lesson4Sections,
  blocks: flattenSections(level0Lesson4Sections),
};
