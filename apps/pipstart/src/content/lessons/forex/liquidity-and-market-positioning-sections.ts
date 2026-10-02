import type { LessonSection } from "../../lesson-content";

export const liquidityAndMarketPositioningSections: LessonSection[] = [
  {
    title: "Ask what liquidity means for this order",
    shortTitle: "Ask what liquidity means for this order",
    blocks: [
      {
        type: "paragraph",
        children:
          "Liquidity is the ability to transact a stated quantity at available prices without a large price change. The practical question is not simply whether “Forex is liquid,” but whether this product, venue, time and intended size can be handled under the stated conditions. A large global market can still contain a thin quote at a particular moment.",
      },
      {
        type: "example",
        title: "One stall is not the whole market",
        children: [
          "A shopper in Indonesia sees ten bags of rice at one stall. That display does not reveal every bag in the city, and it does not promise the same price for a large delivery tomorrow. A platform’s visible quotes similarly describe its own feed and conditions.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Earlier levels introduced spread, order types and slippage. Here we connect them to depth, fragmented venues, funding and partial positioning information. We do not need a claim to see hidden institutional intentions. Start with observable quote sides, quantities when supplied, timestamps, product terms and actual order status.",
      },
      {
        type: "paragraph",
        children:
          "Liquidity can change as participants, events and trading hours change. A quiet holiday, session transition, announcement or unexpected shock may affect quotes and fills. The direction and size of any change must be observed, not assumed from a calendar label alone.",
      },
    ],
  },
  {
    title: "Separate spread, depth and price movement",
    shortTitle: "Separate spread, depth and price movement",
    blocks: [
      {
        type: "paragraph",
        children:
          "The spread is the difference between the displayed ask and bid at a moment. Depth concerns the quantity available at specified prices on the particular venue or feed. Neither is identical to trading volume, which concerns activity over a defined period. A narrow spread for a small size does not guarantee deep availability for a much larger size.",
      },
      {
        type: "comparisonTable",
        caption: "Different measurements answer different questions",
        columns: ["Measurement", "Question it helps answer", "Important limit"],
        rows: [
          [
            "Bid/ask spread",
            "How far apart are the quoted sides now?",
            "May apply only to a stated size and moment",
          ],
          [
            "Quoted depth",
            "What quantities are displayed at each level here?",
            "Not every venue or hidden/withdrawn order",
          ],
          [
            "Executed volume",
            "What activity was recorded in this source and interval?",
            "Coverage and trade-size definition matter",
          ],
          [
            "Tick count",
            "How many price updates were recorded?",
            "Updates are not necessarily executed trades",
          ],
          [
            "Slippage",
            "How did the actual fill compare with a specified reference?",
            "Reference time, side and order instruction matter",
          ],
        ],
      },
      {
        type: "example",
        title: "The narrow doorway",
        children: [
          "A shop in India displays an attractive price for one bottle of cooking oil but has only two bottles left at that price. A restaurant ordering fifty bottles faces a different availability question. The displayed price difference alone does not answer it.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A price moving rapidly does not prove the market had large executed volume; a small order in thin conditions may produce a noticeable change. Conversely, considerable activity can occur with little net price change. Keep the meaning and coverage of each measurement visible rather than using all of them as interchangeable proof of liquidity.",
      },
    ],
  },
  {
    title: "Understand why OTC Forex has no single complete book",
    shortTitle: "Understand why OTC Forex has no single complete book",
    blocks: [
      {
        type: "paragraph",
        children:
          "Retail over-the-counter Forex does not have one consolidated order book containing every participant’s orders worldwide. Banks, dealers, venues and providers can have different quotes, clients, instruments and execution arrangements. Some orders are not displayed publicly, and displayed interest can change before another order arrives.",
      },
      {
        type: "paragraph",
        children:
          "A depth-of-market panel may show exchange orders for an exchange-traded instrument, provider quotes/quantities for an OTC product, or price levels constructed from bid/ask when quantities are not supplied. The panel’s title does not establish which of those cases applies. Read the platform and provider documentation for the exact instrument.",
      },
      {
        type: "example",
        title: "The Japanese station board",
        children: [
          "A commuter in Japan sees the departures from one station. It is useful for that station, but it is not a live list of every train in the country. A provider’s depth panel can be useful without describing the global currency market.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Ask whose prices are shown, whether sizes are firm or indicative, whether the feed is delayed and what execution rules apply to your order. A screenshot cannot by itself prove that the displayed quantities would have been available to the learner at the recorded size. Changes between observation and execution are part of the analysis.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "A service claiming to show “all Forex orders” or every institution’s exact intention needs evidence about its coverage and method. A colourful depth panel, volume bar or marked chart zone is not that evidence.",
        ],
      },
    ],
  },
  {
    title: "Work through a visible-depth illustration",
    shortTitle: "Work through a visible-depth illustration",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented single-venue EUR/USD ask depth",
        columns: [
          "Ask price",
          "EUR quantity at that level",
          "USD cost if filled",
        ],
        rows: [
          ["1.1001", "1000", "1100.10"],
          ["1.1003", "2000", "2200.60"],
          ["1.1006", "2000", "2201.20"],
        ],
      },
      {
        type: "paragraph",
        children:
          "Imagine a market purchase of €5,000 that fills exactly the listed quantities and prices, with no quote withdrawal, extra fee or other level. The USD cost is 1,100.10 + 2,200.60 + 2,201.20 = 5,501.90. Dividing by €5,000 gives a quantity-weighted average fill of 1.10038 dollars per euro.",
      },
      {
        type: "formula",
        expression:
          "Average fill = Σ(price × filled quantity) / total filled quantity",
        explanation:
          "Use actual filled quantities, not an unweighted average of displayed price levels. This illustration assumes every listed quantity remains available and fills exactly.",
      },
      {
        type: "paragraph",
        children:
          "Relative to the initial top ask of 1.1001, the average fill is 0.00028 higher: 2.8 conventional EUR/USD pips of adverse entry difference. This is an invented single-venue calculation, not proof of global depth or a promise that a retail market order will fill this way. Partial fills, rejections and changing quotes can produce other outcomes.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/level-10/depth-and-fill.svg",
        desktopSrc: "/images/lessons/forex/level-10/depth-and-fill-desktop.svg",
        width: 720,
        height: 400,
        alt: "A €5,000 teaching purchase uses three invented ask levels and produces a weighted average fill of 1.10038.",
        caption:
          "Quantity at the top quote matters. The example assumes unchanged availability and exact fills; real execution must be recorded separately.",
      },
      {
        type: "example",
        title: "Buying apples from several baskets",
        children: [
          "A customer in Italy buys one kilogram at the first basket’s price and two kilograms from each of two dearer baskets. The bill per kilogram depends on how much came from each basket. Averaging only the three displayed prices would ignore those quantities.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A smaller €1,000 order under the same assumptions uses only the first level. That is why a top quote sufficient for a small order does not necessarily describe a larger one. Do not project this hypothetical depth into another provider, time or instrument.",
      },
    ],
  },
  {
    title: "Keep order instructions and outcomes separate",
    shortTitle: "Keep order instructions and outcomes separate",
    blocks: [
      {
        type: "paragraph",
        children:
          "A market order requests execution under the product’s available-price rules. It does not lock the earlier screen quote. A limit order adds a price constraint but may remain unfilled or partly filled. A stop instruction depends on its trigger definition; an ordinary stop can execute beyond the trigger, while a stop-limit can fail to fill after the market moves beyond its limit.",
      },
      {
        type: "paragraph",
        children:
          "Record submission time, accepted/rejected status, fill quantities/prices and any remaining quantity. “Order sent” and “position opened” are not the same state. A disconnection or delayed response may leave uncertainty; follow the platform’s documented status-checking process before submitting a duplicate instruction.",
      },
      {
        type: "example",
        title: "The restaurant reservation",
        children: [
          "A family in the United Kingdom asks for a table at a restaurant. Sending the request is not the same as receiving confirmation. An order request also needs an accepted status and actual execution record before the journal treats it as a completed action.",
        ],
      },
      {
        type: "paragraph",
        children:
          "If a partial fill occurs, the actual exposure is the filled quantity, while unfilled instructions may remain active under their lifetime rules. Costs and minimums can differ by product. A classroom worksheet should state whether it assumes one complete fill; a demo record should show the real sequence rather than silently substituting the intended quantity.",
      },
      {
        type: "paragraph",
        children:
          "Demo fills can help rehearse platform mechanics but may not reproduce live liquidity, latency, counterparty behaviour or execution. Keep them labelled demo. Good recordkeeping improves learning; it does not establish that a larger live order will receive the same result.",
      },
    ],
  },
  {
    title: "Observe a holiday quote without generalising it",
    shortTitle: "Observe a holiday quote without generalising it",
    blocks: [
      {
        type: "paragraph",
        children:
          "The course example is an Indonesian worker noticing a wider USD/IDR quote around a local holiday. Fewer active counterparties may be one possible explanation, but provider settings, time of day, events and quote quality also matter. Record the observations first and distinguish the explanation from the evidence.",
      },
      {
        type: "comparisonTable",
        caption: "Holiday-versus-business-day observation sheet",
        columns: ["Field", "What to record on both dates"],
        rows: [
          [
            "Instrument/product",
            "Exact provider and USD/IDR quotation convention",
          ],
          ["Clock", "Date, time, time zone and quote freshness"],
          ["Sides", "Bid and ask, spread in the stated unit"],
          ["Quantity", "Intended amount and any displayed available size"],
          ["Order", "Demo only if supported; instruction and lifetime"],
          ["Outcome", "Actual status, quantities, fills and separate charges"],
          [
            "Context",
            "Holiday/session/event information and other possible differences",
          ],
        ],
      },
      {
        type: "example",
        title: "Two exchange-counter visits",
        children: [
          "A worker in Indonesia checks the same counter at a specified time on a normal business day and a local holiday. The later spread is wider. That describes these observations; it does not establish that every holiday always has the same effect, or that another provider quotes the same prices.",
        ],
      },
      {
        type: "paragraph",
        children:
          "If the pair is not available in your demo platform or PipStart’s supported instrument list, use a paper observation. Do not choose an unrelated pair inside a calculator and pretend its pip unit or contract applies to USD/IDR. Large nominal exchange rates can make familiar four-decimal “pip” assumptions unsuitable; read the actual product’s units.",
      },
      {
        type: "paragraph",
        children:
          "Repeated observations need a predeclared comparison method. Keep comparable clock times and note confounding events. You are learning how to describe quote conditions, not trying to cause or predict a holiday price move. No trade is required to finish the exercise.",
      },
    ],
  },
  {
    title: "Define order flow without claiming to read minds",
    shortTitle: "Define order flow without claiming to read minds",
    blocks: [
      {
        type: "paragraph",
        children:
          "Order flow refers to buying/selling activity or order information under a specified source and classification method. Executed trades, displayed resting orders and quote updates are different records. An imbalance in one source can provide context but cannot reveal every institution’s private plan or guarantee the next price movement.",
      },
      {
        type: "paragraph",
        children:
          "In many datasets every executed transaction has a buyer and seller; labels such as buyer-initiated use a convention about which side took available liquidity. That convention is not the statement that only buyers existed. Classification can be uncertain when quotes and trades have different timestamps or incomplete coverage.",
      },
      {
        type: "example",
        title: "The café queue",
        children: [
          "A café in Brazil sees a queue at its counter. Some customers leave, others change orders, and a nearby café has its own queue. The visible queue is useful information about this counter now, but it is not a complete forecast of all coffee sales in the city.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A visible order can be cancelled or altered before execution. A large print may represent hedging, execution of an older decision or another activity whose motive is not public. Tick counts on a retail feed count updates rather than necessarily counting traded contracts. Name the observable record and avoid replacing it with a story about “smart money” that cannot be checked.",
      },
      {
        type: "paragraph",
        children:
          "Chart terms such as a “liquidity pool” or “order block” may be hypotheses about likely activity near a zone. A candle does not disclose every resting stop or participant’s intentions. If a strategy uses such a term, define its measurable rules, information timing and tests as in Level 9; the label alone adds no proven edge.",
      },
    ],
  },
  {
    title: "Understand the carry idea and its liabilities",
    shortTitle: "Understand the carry idea and its liabilities",
    blocks: [
      {
        type: "paragraph",
        children:
          "A carry trade seeks a return difference by financing in one currency and holding exposure to another currency or asset. A common description is borrowing in a relatively low-rate currency and investing in a relatively higher-yielding currency. The expected income is only one part of the result. Exchange rates, asset prices, funding renewal, charges and leverage can change the outcome.",
      },
      {
        type: "example",
        title: "Rent does not guarantee a gain",
        children: [
          "A learner in Japan compares borrowing cheaply to buy a rental item abroad. Rent is an income stream, but repair bills or a fall in resale value may exceed it. Foreign interest can similarly be outweighed by depreciation or financing problems.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Distinguish an unleveraged foreign deposit, borrowing to buy a foreign asset, and a leveraged retail Forex contract with overnight financing. They have different obligations and cash flows. A simplified rate difference is not automatically the income for any one of those products. The provider’s actual contract and funding schedule govern its credits/debits.",
      },
      {
        type: "paragraph",
        children:
          "A funding currency can strengthen just when the purchased exposure loses value in home terms. If borrowing is outstanding, the liability still needs repayment. Leveraged structures can add margin demands and forced position reductions. A favourable nominal interest rate does not remove those risks.",
      },
      {
        type: "paragraph",
        children:
          "The next calculation is a made-up one-period borrowed-asset example to clarify the arithmetic. It is not a current Japanese borrowing offer, a broker rollover quote or a suggested carry position.",
      },
    ],
  },
  {
    title: "Calculate a carry loss despite a positive rate difference",
    shortTitle: "Calculate a carry loss despite a positive rate difference",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented yen-funded one-period example",
        columns: ["Component", "Assumption or calculation"],
        rows: [
          ["Borrowed home amount", "¥100000"],
          ["Home borrowing interest", "1% for the whole stated period"],
          ["Foreign-asset return", "+5% in the foreign currency"],
          ["Foreign-currency change versus yen", "−10% over the same period"],
          ["Converted ending asset value", "100000 × 1.05 × 0.90 = ¥94500"],
          ["Home liability at repayment", "100000 × 1.01 = ¥101000"],
          ["Net difference before other charges", "94500 − 101000 = −¥6500"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The nominal rate comparison is 5% minus 1%, or 4 percentage points. The realised simplified net difference is a loss of ¥6,500, because the currency movement outweighs the foreign income and the borrowing still costs money. The multiplication captures the combined asset and FX change; merely subtracting ten points from five overlooks the interaction.",
      },
      {
        type: "paragraph",
        children:
          "The example assumes one fixed period, no intermediate cash flows, borrowing principal fully converted initially and the stated end conversion. Fees, taxes, collateral requirements, changing rates, different settlement dates or asset losses could make the result worse. If an actual product uses a different method, apply that method rather than treating this table as its contract.",
      },
      {
        type: "learningLink",
        title: "Profit/Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use the tool for a supported pair’s stated price movement and volume. Keep the financing/borrowing ledger separately; this tool is not a carry-income, foreign-deposit or rollover-rate calculator.",
      },
      {
        type: "paragraph",
        children:
          "For a retail product, check the direction-specific financing amount, units, posting time, holiday treatment and any multi-day charge. Do not assume every provider applies a particular weekday convention. A quoted credit can change or become a debit, and a short holding period does not guarantee that no financing event occurs.",
      },
      {
        type: "warning",
        title: "Keep the limits in view",
        children: [
          "Carry income is not free interest. A small recurring credit can coexist with a large currency loss, increased funding costs, margin pressure and adverse exits. A positive rate difference is not a reason to increase leverage.",
        ],
      },
    ],
  },
  {
    title: "Recognise an unwind without forecasting its timing",
    shortTitle: "Recognise an unwind without forecasting its timing",
    blocks: [
      {
        type: "paragraph",
        children:
          "An unwind is the reduction or closing of previously held positions. Participants may change expectations, reduce leverage, repay funding or respond to margin requirements. If many have similar exposures, their actions can interact with thin conditions and changing prices. The precise scale, timing and motives may remain uncertain from public information.",
      },
      {
        type: "paragraph",
        children:
          "A historical illustration is the August 2024 episode discussed by the BIS: currency carry positions were reduced amid changed rate expectations and volatility. The funding yen appreciated during the episode while some investment currencies weakened. This is a dated example of a possible mechanism, not a rule that the yen must strengthen at every shock or that a learner can predict the next unwind.",
      },
      {
        type: "example",
        title: "Several neighbours sell at once",
        children: [
          "Residents in Canada decide to sell similar second-hand bicycles after a shared change in circumstances. There may be fewer buyers at the previous prices. The story explains why concentrated selling can matter, but it does not tell you exactly when each neighbour will sell or what every bicycle will fetch.",
        ],
      },
      {
        type: "paragraph",
        children:
          "A “crowded” label does not establish an imminent reversal. Positions can remain crowded, increase, be hedged elsewhere or reflect different holding horizons. Even a correct broad concern may have unknown timing and execution. Record the source and date, keep alternative explanations and avoid turning hindsight into a claimed advance signal.",
      },
      {
        type: "paragraph",
        children:
          "Use the mechanism to ask better risk questions: what funding or shared exposure exists, what might force several exits, and what happens if quoted liquidity changes? Answer with documented scenarios rather than an unsupported countdown to a crash.",
      },
    ],
  },
  {
    title: "Read positioning reports as partial dated records",
    shortTitle: "Read positioning reports as partial dated records",
    blocks: [
      {
        type: "paragraph",
        children:
          "The reporting tradition predates the modern CFTC. An early annual report appeared under a US predecessor agency in 1924, and monthly COT reporting began in June 1962 with agricultural commodities. The current broader reporting formats developed later. This history explains the reports’ regulated-futures origins; it does not make them a consolidated spot-Forex order book.",
      },
      {
        type: "paragraph",
        children:
          "A positioning report describes specified holdings in a specified market and reporting population. The CFTC Commitments of Traders reports concern futures and options on futures under their coverage rules; they are not a complete map of current global spot Forex. Choose the contract and report type before reading the numbers.",
      },
      {
        type: "paragraph",
        children:
          "COT data generally reflects Tuesday positions and is released Friday, normally at 3:30 p.m. US Eastern time. Holidays can alter the release schedule, so check the official dates. Distinguish the position date, publication time and the time you actually obtained the report. A historical strategy cannot use a report on Tuesday merely because its holdings are dated Tuesday if it was not published until later.",
      },
      {
        type: "comparisonTable",
        caption: "Questions before interpreting a report",
        columns: ["Check", "Why it matters"],
        rows: [
          [
            "Contract and quotation",
            "Currency direction and units may differ from the retail pair",
          ],
          [
            "Report format",
            "Futures-only and futures/options-combined are different",
          ],
          [
            "Category",
            "Dealer, asset-manager or other classifications have defined coverage",
          ],
          ["Position date", "Snapshot of holdings at the reporting cutoff"],
          [
            "Release date/time",
            "Earliest point when public information became usable",
          ],
          [
            "Counts and units",
            "Contracts/positions are not automatically number of people or cash value",
          ],
          [
            "Coverage",
            "Specific reported market, not all spot/forward/hedged exposure",
          ],
        ],
      },
      {
        type: "paragraph",
        children:
          "Long and short counts need the report’s definitions; spreading categories can matter when reconciling totals. Do not add incompatible report versions or treat every position as an independent person. A net value summarises a category under that format, not every participant’s motive, complete risk or next action.",
      },
      {
        type: "paragraph",
        children:
          "A trader category can include hedges or strategies with exposures elsewhere. A position snapshot is not the same as the week’s complete sequence of buying/selling. Use dated data as context and preserve the publication lag in any test, rather than claiming it directly predicts tomorrow’s currency return.",
      },
    ],
  },
  {
    title: "Distinguish net positions, changes and sentiment",
    shortTitle: "Distinguish net positions, changes and sentiment",
    blocks: [
      {
        type: "comparisonTable",
        caption: "Invented category positions in one currency futures contract",
        columns: [
          "Snapshot",
          "Long contracts",
          "Short contracts",
          "Net long minus short",
        ],
        rows: [
          ["Previous reporting date", "100", "90", "+10"],
          ["Current reporting date", "120", "100", "+20"],
        ],
      },
      {
        type: "paragraph",
        children:
          "The net rises by 10 contracts, from +10 to +20, while longs rise by 20 and shorts rise by 10. “Net increased by ten” does not mean exactly ten new long contracts were added. These teaching counts do not include every report category or reconcile an entire contract’s open interest; they simply show the difference between two gross sides and a net figure.",
      },
      {
        type: "example",
        title: "The class poll",
        children: [
          "In a class survey in Germany, 40 of 50 responding students prefer a proposed trip. That is 80% of respondents. It is not an 80% probability that the trip will happen, nor proof that absent students share the view. A bullish currency survey needs the same care about its population.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Sentiment is an opinion or attitude measured by a particular survey or indicator; positioning concerns recorded holdings under a defined source. A person may express a positive view while holding a hedge, and a position can reflect obligations rather than a forecast. The two measurements should not be treated as interchangeable.",
      },
      {
        type: "paragraph",
        children:
          "Check who responded, whether self-selection matters, sample size, question wording, date and whether the indicator measures people, accounts or position volume. “Eighty percent long accounts” can differ greatly from “eighty percent of total position size.” Neither means an 80% chance of a rise.",
      },
      {
        type: "paragraph",
        children:
          "Extreme readings can persist. A contrarian interpretation is a hypothesis needing rules and fair tests, not an automatic reversal instruction. Keep the original publication and data definition, and avoid using only the historical extremes that happened to reverse.",
      },
    ],
  },
  {
    title: "Practise a cautious market-context note",
    shortTitle: "Practise a cautious market-context note",
    blocks: [
      {
        type: "exercise",
        prompt:
          "A €5,000 teaching purchase fills €1,000 at 1.1001, €2,000 at 1.1003 and €2,000 at 1.1006. Find the weighted average and its difference from the first ask.",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Total cost US$5,501.90 divided by €5,000 gives 1.10038. The average is 2.8 conventional pips above 1.1001. This assumes the listed quantities remain available and fill exactly.",
      },
      {
        type: "exercise",
        prompt:
          "An OTC depth panel shows attractive levels without quantities. Does it prove every global participant has orders there?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. It may show provider-specific quotes or constructed price levels. Check the feed and documentation; no single panel supplies the complete global OTC book.",
      },
      {
        type: "exercise",
        prompt:
          "Borrow ¥100,000 at 1%; the foreign asset earns 5% but its currency falls 10%. What is the simplified difference at repayment?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Ending asset value ¥94,500 minus liability ¥101,000 equals −¥6,500 before other charges. A positive nominal rate difference did not produce a net gain.",
      },
      {
        type: "exercise",
        prompt:
          "Tuesday holdings are published Friday. Can a historical Tuesday entry use the unpublished figures?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "No. Information becomes usable only after its actual release and acquisition time. Preserve the reporting lag and holiday schedule.",
      },
      {
        type: "exercise",
        prompt:
          "Longs change 100 to 120 and shorts 90 to 100. Compute current net and net change. Does that predict the next price?",
      },
      {
        type: "takeaway",
        title: "Check your reasoning",
        children:
          "Current net is +20 and the net change is +10 contracts. It describes the category snapshots, not all spot exposure or a guaranteed next movement.",
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
          "Separate spread, depth, tick activity and actual execution under a stated venue and size.",
          "Calculate a weighted fill and a simplified funded carry result with explicit limitations.",
          "Read delayed positioning and sentiment information with its source, units and publication lag.",
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
            title: "CFTC — Commitments of Traders reporting history",
            url: "https://www.cftc.gov/PressRoom/PressReleases/8612-22",
          },
          {
            title:
              "BIS — The global foreign exchange market in a higher-volatility environment",
            url: "https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment",
          },
          {
            title: "MetaTrader 5 — Depth of Market",
            url: "https://www.metatrader5.com/en/terminal/help/trading/depth_of_market",
          },
          {
            title:
              "CFTC — Commitments of Traders: coverage and reporting dates",
            url: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm",
          },
          {
            title: "BIS — Carry off, carry on",
            url: "https://www.bis.org/publications/qr-202409/carry-off-carry-on",
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
