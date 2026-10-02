import type { LessonSection } from "../../lesson-content";

export const economicNewsAndCurrencyDemandSections: LessonSection[] = [
  {
    title: "Follow the people behind currency demand",
    shortTitle: "Follow the people behind currency demand",
    blocks: [
      {
        type: "paragraph",
        children:
          "Fundamental analysis studies economic conditions, policy and other developments that may affect a currency relative to another. A payment, investment, loan, hedge or expectation can change the desire to buy and sell currencies. Your task is to describe plausible channels and compare evidence. A headline does not tell you the next executable price.",
      },
      {
        type: "paragraph",
        children:
          "Keep three questions separate: what happened in the economy, how the news differs from earlier expectations, and what prices or quotes actually did after publication. They can point in different directions. The economic figure describes a measured period; the currency price reflects many participants considering the present and future at once.",
      },
      {
        type: "example",
        title: "The neighbourhood shop has several influences",
        children: [
          "A shop in India pays suppliers, transports stock, serves customers and pays rent. A flour-price change matters to a bakery, but it does not alone determine the price of every loaf or the owner’s profit. Currency prices also have several interacting influences.",
        ],
      },
      {
        type: "paragraph",
        children:
          "This lesson uses invented reports and exchange rates. It teaches how to read news without claiming a guaranteed currency response. Keep Level 5’s risk boundaries and Level 6’s distinction between observations and interpretations. Learning a release definition is useful even when your decision is to observe without a position.",
      },
    ],
  },
  {
    title: "Trace a cross-border payment",
    shortTitle: "Trace a cross-border payment",
    blocks: [
      {
        type: "paragraph",
        children:
          "A company importing goods may need to obtain the seller’s currency. A traveller may buy foreign money for spending; an investor may convert money to buy overseas assets. Export receipts, remittances, repayments and hedging also create currency transactions. The final exchange rate depends on many flows and expectations, not one customer’s purchase.",
      },
      {
        type: "example",
        title: "A Brazilian importer’s dollar bill",
        children: [
          "An importer in Brazil owes a US supplier US$100. At invented USD/BRL 5.00, each dollar costs five reais and the bill is R$500. At 5.20 it costs R$520, an extra R$20, or 4% of the original local-currency bill before fees.",
          "The dollar became more expensive in reais under this quote. That changes the importer’s cost; it does not establish which news caused the change or where the next quote will be. An exporter receiving dollars faces a different cash-flow situation.",
        ],
      },
      {
        type: "formula",
        expression:
          "Local-currency payment = foreign-currency amount × local currency per foreign unit",
        explanation:
          "Read the quote convention and include conversion fees separately. An inverse quotation needs a different operation.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-7/import-payment.svg",
        desktopSrc: "/images/lessons/forex/level-7/import-payment-desktop.svg",
        width: 720,
        height: 400,
        alt: "US$100 costs R$500 at USD/BRL 5.00 and R$520 at 5.20, before fees.",
        caption:
          "The payment obligation stays US$100 while its local-currency cost changes. These quotes are invented teaching values.",
      },
    ],
  },
  {
    title: "Think in pairs and in possible channels",
    shortTitle: "Think in pairs and in possible channels",
    blocks: [
      {
        type: "paragraph",
        children:
          "EUR/USD compares euros with dollars. News from either currency area can matter, and broad changes in dollar demand can affect many pairs simultaneously. A story about one economy is only part of that comparison. A currency can rise against one currency and fall against another at the same time.",
      },
      {
        type: "comparisonTable",
        caption: "Possible influences; none is a one-way price rule",
        columns: ["Channel", "Question to investigate"],
        rows: [
          ["Trade/payment flows", "Who needs which currency for a payment?"],
          [
            "Investment/funding",
            "What returns and funding needs are being considered?",
          ],
          [
            "Interest expectations",
            "How has the expected future rate path changed relative to the other currency?",
          ],
          [
            "Inflation/output/jobs",
            "What was measured and how did it differ from expectations?",
          ],
          ["Risk and confidence", "What uncertainties or constraints changed?"],
          [
            "Positioning/liquidity",
            "Could existing exposure or thin execution conditions affect the reaction?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Over longer horizons, trade and income flows, funding conditions, relative prices and policy can all interact. A current-account surplus or deficit is not a simple short-term entry rule. Flows can be hedged, offset by financial transactions or anticipated. Avoid treating the word “fundamental” as permission to ignore spread, product terms or uncertain timing.",
      },
      {
        type: "example",
        title: "The same tourist bill, two currencies",
        children: [
          "A German visitor pays a hotel in Japan in yen. The visitor cares about EUR/JPY, while a US visitor cares about USD/JPY. A story about Japan can affect both, but euro- and dollar-specific conditions still make the two comparisons different.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Over longer horizons, analysts also examine the balance of payments: a record of transactions between residents and the rest of the world under its accounting framework. The current account includes goods, services and income-related flows; financing and investment entries belong to other parts of that framework. A trade balance covers a narrower area. A surplus or deficit is not by itself a short-term currency forecast because financing, hedging, expectations and other flows also matter. Do not confuse a country’s current account with a learner’s trading account.",
      },
    ],
  },
  {
    title: "Separate an interest rate from a currency forecast",
    shortTitle: "Separate an interest rate from a currency forecast",
    blocks: [
      {
        type: "paragraph",
        children:
          "An interest rate is a price for borrowing or a return associated with a particular savings or lending arrangement. A central-bank benchmark can influence funding, saving and investment through its policy framework. Commercial deposit rates, bond yields and broker financing rates are related questions, not identical numbers.",
      },
      {
        type: "example",
        title: "An expected fee rise can still be a smaller surprise",
        children: [
          "A school in France raises its fee by 5%, but families had expected 8%. The fee rose; the surprise was that it rose less than expected. Similarly, a rate increase can be smaller or less persistent than participants expected, so the currency reaction need not match “rate up, currency up.”",
        ],
      },
      {
        type: "paragraph",
        children:
          "Record the current decision, what was expected before it and what the explanation suggests about future decisions. Compare the other currency’s circumstances. A higher stated rate does not lock in a positive home-currency return because exchange-rate changes, charges and product terms can dominate. Lesson 2 will work through that relationship in more detail.",
      },
    ],
  },
  {
    title: "Read inflation as a rate of price change",
    shortTitle: "Read inflation as a rate of price change",
    blocks: [
      {
        type: "paragraph",
        children:
          "Inflation measures price change across a defined basket or spending measure over a stated period. A consumer price index is an index level; its percentage change is a separate number. Month-on-month and year-on-year changes use different comparison periods. The average basket need not match every household’s purchases.",
      },
      {
        type: "formula",
        expression:
          "Price-index change % = (new index ÷ comparison index − 1) × 100",
        explanation:
          "State the series and comparison period. An index level of 104 is not an inflation rate of 104%.",
      },
      {
        type: "example",
        title: "Prices can keep rising while inflation slows",
        children: [
          "Use invented index levels 100, then 104, then 106 in successive years. The first rise is 4%. The next is 106/104 − 1, about 1.92%. Inflation slowed but the price level did not fall. That is disinflation; a falling comparable price level would be deflation.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Headline measures include their full defined coverage; commonly cited US core CPI excludes food and energy, while other “core” measures can use other definitions. Read the label instead of assuming all countries calculate the same basket. CPI and the PCE price index are different measures with different coverage and methods; compare like with like. A release may show monthly, annual and adjusted series together.",
      },
      {
        type: "paragraph",
        children:
          "A stronger inflation reading can alter expected policy, growth or purchasing power, sometimes in competing ways. It is not automatically good news for a currency. Do not turn an index result into a currency signal before checking the forecast, revisions, other releases and policy context.",
      },
    ],
  },
  {
    title: "Read employment without confusing jobs and people",
    shortTitle: "Read employment without confusing jobs and people",
    blocks: [
      {
        type: "paragraph",
        children:
          "The US nonfarm payroll headline is a change in covered payroll jobs estimated from an establishment survey. It is not simply a count of every employed person. A person with more than one covered job can appear in more than one payroll job, while some types of work are outside that survey. The unemployment rate comes from a different household survey and uses a labour-force definition.",
      },
      {
        type: "paragraph",
        children:
          "Read wage, hours, participation and unemployment information alongside payrolls, and check revisions to earlier estimates. A lower unemployment rate can have different explanations, including changes in employment or in participation. A high wage growth figure need not represent every worker’s personal pay rise. Compare the exact population and period before making claims.",
      },
      {
        type: "example",
        title: "A bakery’s customer count is not its profit",
        children: [
          "A Canadian bakery serves more customers but also pays more for flour and electricity. More customers is one useful observation, not the whole result. More payroll jobs likewise illuminates activity without resolving inflation, policy or the currency’s future path.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Invented payroll release, in thousands of jobs",
        columns: ["Field", "Value", "What to note"],
        rows: [
          [
            "Forecast saved before release",
            "150",
            "An external estimate; record source/time",
          ],
          ["Current actual", "190", "First reported estimate"],
          ["Current minus forecast", "+40", "Headline surprise in these units"],
          [
            "Prior originally reported",
            "200",
            "Value available before the new release",
          ],
          ["Prior revised", "140", "Revision of −60"],
          [
            "Simple combined comparison",
            "−20",
            "+40 surprise plus −60 prior revision; not a trading signal",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "The arithmetic +40 − 60 = −20 does not compress the whole report into a definitive “net surprise.” It only demonstrates why revisions can matter. Wages, hours, household data, measurement uncertainty and expectations for policy can alter interpretations. Record the separate fields rather than silently replacing the old prior number.",
      },
    ],
  },
  {
    title: "Read output and growth with the correct units",
    shortTitle: "Read output and growth with the correct units",
    blocks: [
      {
        type: "paragraph",
        children:
          "Gross domestic product, or GDP, measures the value of final goods and services produced within an economy during a period under its accounting framework. Nominal GDP uses current prices; real GDP adjusts for price change. A higher nominal value can reflect more output, higher prices or both. GDP estimates arrive after the measured period and may be revised.",
      },
      {
        type: "example",
        title: "More sales value is not always more bread",
        children: [
          "An Italian bakery sells the same number of loaves at higher prices. Its cash sales rise without a matching rise in the quantity of bread. The nominal/real distinction asks a similar question at the economy level, though national accounts are much more detailed than one bakery.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Check whether growth is quarter-on-quarter, year-on-year or annualised. A quarterly 1% increase, if hypothetically repeated for four quarters, compounds to (1.01^4 − 1) × 100 ≈ 4.06% annualised. That is not four quarters of already-observed 1% growth or a promise about the next year. Do not compare an annualised quarterly figure directly with a nonannualised quarterly figure as if the units matched.",
      },
      {
        type: "paragraph",
        children:
          "Advance estimates and later estimates are versions of information available at different dates. Keep the first available vintage if you are studying what a learner could have known then. Strong output can support one interpretation while changing inflation, imports or future policy expectations in another direction. A headline growth number is not a complete currency explanation.",
      },
    ],
  },
  {
    title: "Know the recurring releases at a glance",
    shortTitle: "Know the recurring releases at a glance",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Common releases and what a beginner should check",
        columns: [
          "Release",
          "What it measures or communicates",
          "Important distinction",
        ],
        rows: [
          [
            "Rate decision/statement",
            "Policy action and explanation",
            "Expected decision versus expected future path",
          ],
          [
            "CPI/core CPI",
            "Defined consumer-price changes",
            "Index level, monthly/annual rate and coverage",
          ],
          [
            "PCE inflation",
            "A consumer-spending price measure",
            "Different coverage/methods from CPI",
          ],
          [
            "PPI",
            "Defined producer selling-price measures",
            "Not identical to household inflation",
          ],
          [
            "Payrolls/unemployment/wages",
            "Different labour-market measures",
            "Jobs versus people; surveys and revisions",
          ],
          [
            "GDP",
            "Production over a period",
            "Real/nominal; annualised or nonannualised",
          ],
          [
            "Retail sales",
            "Covered retail sales values",
            "Price effects and coverage; not all consumption",
          ],
          [
            "PMI/similar business surveys",
            "Survey-based activity indicators",
            "Diffusion index, components and provider",
          ],
          [
            "Industrial production",
            "Production in covered industries",
            "Coverage and monthly/revised changes",
          ],
          [
            "Trade balance",
            "Exports minus imports under the stated coverage",
            "Goods versus broader measures; units/period",
          ],
          [
            "Consumer confidence",
            "Survey attitudes/expectations",
            "Survey result, not guaranteed spending",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "These families appear repeatedly, but the exact names, schedules, populations and units differ across countries. The table is a vocabulary guide, not a ranking that tells you which release will move prices most. Use the original agency or survey provider’s definitions, and separate an official statistic from a private forecast.",
      },
      {
        type: "paragraph",
        children:
          "For many PMI activity indexes, a reading above 50 indicates more respondents reporting improvement than deterioration under that index’s methodology. A value of 55 is not GDP growth of 55% or a 55% chance of a currency rise. Components can have different interpretations, such as supplier-delivery measures, so read the specific series rather than applying one rule to every row.",
      },
    ],
  },
  {
    title: "Distinguish reported values from expected values",
    shortTitle: "Distinguish reported values from expected values",
    blocks: [
      {
        type: "paragraph",
        children:
          "A calendar’s forecast may be a survey median, average or another provider estimate. It is not every participant’s belief or a direct measurement of all expectations priced into markets. Save its source and timestamp before the release. If you only copy a forecast after publication, you may accidentally use a revised number or an estimate that was never available beforehand.",
      },
      {
        type: "example",
        title: "A healthy reading can disappoint",
        children: [
          "An invented report forecasts 220,000 payroll jobs and records 190,000. The level is positive, but the difference from this forecast is −30,000. In another example, an expected 150,000 versus actual 190,000 gives +40,000. The same actual can have a different surprise relative to different saved expectations.",
        ],
      },
      {
        type: "comparisonTable",
        caption: "Keep comparisons separate",
        columns: ["Comparison", "Question answered"],
        rows: [
          [
            "Actual versus saved forecast",
            "How did this estimate differ from the prior estimate?",
          ],
          [
            "Actual versus prior comparable result",
            "What changed from the measured earlier period?",
          ],
          [
            "Revised prior versus original prior",
            "What was corrected in earlier information?",
          ],
          [
            "Quote before versus quote after",
            "What observable price/spread change occurred?",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "A forecast miss and a currency move occurring together do not prove that the release alone caused every change. Another country’s news, revised components, positioning and liquidity can act at the same time. Describe possible channels and alternatives; avoid replacing uncertainty with a dramatic headline.",
      },
    ],
  },
  {
    title: "Separate the economic period from the trading clock",
    shortTitle: "Separate the economic period from the trading clock",
    blocks: [
      {
        type: "paragraph",
        children:
          "A release date is not the same as the period the statistic describes. A jobs report published this month may describe last month. A GDP estimate may cover a completed quarter, and an annual inflation rate compares a year-long interval ending earlier. Prices around publication react to newly available information and expectations, not necessarily to an economic change beginning at that second.",
      },
      {
        type: "example",
        title: "A report card describes earlier work",
        children: [
          "A learner in South Korea receives a school report in October about work completed earlier. The publication is new information, while the studied period is older. A market release has the same separation between measurement period and publication time.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Record four dates where relevant: measurement period, scheduled publication, actual publication and your observation timestamp. This matters if a release is delayed, corrected or revised. Using a later revised series to explain an earlier decision can introduce future information, just as using an unconfirmed swing did in Level 6.",
      },
      {
        type: "paragraph",
        children:
          "The first move can reverse after readers examine components or a policy explanation. You do not need to invent one reason that explains the whole path. A notebook can say “headline initially appeared above the saved forecast; spread widened; later prices reversed; other causes remain possible.”",
      },
    ],
  },
  {
    title: "Connect the news to a cash scenario cautiously",
    shortTitle: "Connect the news to a cash scenario cautiously",
    blocks: [
      {
        type: "paragraph",
        children:
          "Fundamental analysis proposes explanations; the risk worksheet asks what a stated position could cost. Neither should silently replace the other. If you already have a demo position, inspect common currency exposure and release-related execution assumptions. If you are observing without a position, a hypothetical price calculation can teach units without becoming a forecast.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "For supported EUR/USD, use a USD account, conversion 1, 0.01 lot, long entry 1.1000 and hypothetical exit 1.0950. The price-only result is −US$5. This scenario does not say that any release will cause that move; add charges and worse-fill assumptions separately.",
      },
      {
        type: "paragraph",
        children:
          "A Brazil importer’s USD/BRL bill uses a different pair and purpose from that supported tool exercise. Do not force an unsupported instrument into a calculator or treat a spot payment as identical to a leveraged derivative. Always name the product and quote convention. A strong economic story does not remove minimum-size, margin, cost or loss-limit checks.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "No headline, calendar icon or economic model guarantees an exchange-rate direction, a fill or a maximum loss. Keep essential living money outside trading experiments and use observation or demo while definitions and assumptions are unclear.",
        ],
      },
    ],
  },
  {
    title: "Practise reading the whole release",
    shortTitle: "Practise reading the whole release",
    blocks: [
      {
        type: "exercise",
        prompt:
          "An importer owes US$100. What are the before-fee bills at invented USD/BRL 5.00 and 5.20? What is the increase as a percentage of the first bill?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "R$500 and R$520. The increase is R$20/500 = 4%. This is payment arithmetic, not a forecast or proof of which news caused the rate change.",
      },
      {
        type: "exercise",
        prompt:
          "An invented price index rises from 100 to 104, then 106. Does slowing inflation mean the second price level fell?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. The changes are 4% and about 1.92%. Prices rose more slowly; the level is still higher. State the period and series before calling a number an inflation rate.",
      },
      {
        type: "exercise",
        prompt:
          "An actual payroll estimate is 190,000 versus a saved 150,000 forecast, while the prior figure is revised down by 60,000. What should the record include?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Headline surprise +40,000 and the separate −60,000 prior revision, plus other components and the saved forecast source/time. Do not turn their simple sum into a guaranteed currency signal.",
      },
      {
        type: "exercise",
        prompt:
          "A quarterly real GDP change is reported as 1% nonannualised. If repeated for four quarters, approximately what annualised rate corresponds to that arithmetic?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "(1.01^4 − 1) × 100 ≈ 4.06%. This annualisation is a convention based on repetition, not four observed quarters or a future growth promise.",
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
          "Explain currency demand through payments, investment and changing expectations.",
          "Read inflation, employment and growth with the correct units and revisions.",
          "Separate an actual/forecast comparison from a guaranteed currency response.",
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
            title: "Bank of England — Who sets exchange rates?",
            url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates",
          },
          {
            title: "BLS — Current Employment Statistics FAQ",
            url: "https://www.bls.gov/web/empsit/cesfaq.htm",
          },
          {
            title: "BLS — Consumer Price Index FAQ",
            url: "https://www.bls.gov/cpi/questions-and-answers.htm",
          },
          {
            title: "BEA — Gross Domestic Product learning guide",
            url: "https://www.bea.gov/resources/learning-center/what-to-know-gdp",
          },
          {
            title: "BEA — Personal Consumption Expenditures Price Index",
            url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index",
          },
          {
            title: "BLS — Producer Price Indexes",
            url: "https://www.bls.gov/ppi/",
          },
          {
            title: "U.S. Census Bureau — Monthly Retail Trade",
            url: "https://www.census.gov/retail/index.html",
          },
          {
            title: "ISM — PMI Reports",
            url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/",
          },
        ],
      },
    ],
  },
];
