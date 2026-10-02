import type { LessonSection } from "../../lesson-content";

export const platformsAndDemoSections: LessonSection[] = [
  {
    title: "Use demo as a rehearsal",
    shortTitle: "Purpose of demo",
    blocks: [
      {
        type: "paragraph",
        children:
          "A demo account records simulated transactions using simulated funds. It gives you room to learn the controls, read quotes, recognise order states and keep accurate notes. Its most useful result is an explanation you can repeat, not a large pretend balance. This lesson builds a complete rehearsal from opening the correct screen to finding the final history entry.",
      },
      {
        type: "paragraph",
        children:
          "A driving simulator helps you locate the brake and understand a junction. It does not reproduce every road surface, traffic situation or feeling. In the same way, demo cannot prove live profitability, real withdrawal reliability or your response to losing money. Quotes, fills, costs and available features may differ from the live product.",
      },
      {
        type: "example",
        title: "A Brazilian learner’s first objective",
        children: [
          "A learner in Brazil begins with EUR/USD on demo. Today’s aim is to explain the bid, ask, account currency and position size, then open and close one tiny simulated position correctly. Finishing with a loss is still a successful control exercise if every instruction and result is understood.",
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A successful demo session is one you can explain and document, even when the simulated trade loses.",
      },
    ],
  },
  {
    title: "Confirm the account and product first",
    shortTitle: "Before any click",
    blocks: [
      {
        type: "paragraph",
        children:
          "Find a clear demo or practice indicator. Verify the account identifier, account currency and server or environment before submitting anything. If an app holds both live and demo accounts, check again whenever you switch screens or reconnect. A large simulated balance does not make a control error harmless if you are accidentally on the wrong account.",
      },
      {
        type: "paragraph",
        children:
          "Open the contract specification for the exact symbol. Confirm the product, base and quote currencies, contract size, pip convention, minimum order size and increment, trading hours, margin method and fees. A symbol suffix can distinguish one account’s product from another. Do not infer units from a familiar-looking name.",
      },
      {
        type: "paragraph",
        children:
          "For many retail EUR/USD examples, one standard lot represents 100,000 euros and 0.01 lot represents 1,000 euros. Your product must confirm that convention. Read any “units,” “contracts,” or “lots” label next to the size box. A figure of 1 can mean very different exposure depending on the label.",
      },
      {
        type: "comparisonTable",
        caption: "Pre-click checks",
        columns: ["Field", "What you need to know", "Mistake it prevents"],
        rows: [
          [
            "Account",
            "Demo or live; correct identifier and currency",
            "Sending a rehearsal instruction to the wrong account.",
          ],
          [
            "Symbol and specification",
            "Product, size units, increment and hours",
            "Treating two similarly named products as identical.",
          ],
          [
            "Bid and ask",
            "The executable sides shown at this moment",
            "Using a chart line as the guaranteed fill.",
          ],
          [
            "Order ticket",
            "Direction, quantity, type and attached instructions",
            "Buying when you intended to sell or using the wrong size.",
          ],
        ],
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "Keep one-click trading disabled while learning if the platform offers that choice. Always review the final ticket, not just the earlier plan.",
        ],
      },
    ],
  },
  {
    title: "Understand the account numbers",
    shortTitle: "Balance and equity",
    blocks: [
      {
        type: "paragraph",
        children:
          "Balance usually reflects recorded cash entries and closed trading results, although statement conventions differ. Unrealised or floating P&L is the changing result on open positions. Equity commonly combines balance and floating results, with adjustments such as credits or financing where applicable. A green floating figure can disappear before a position is closed.",
      },
      {
        type: "paragraph",
        children:
          "Used margin is the amount currently required to support positions under the account’s rules. Free margin is commonly equity minus used margin. Margin level, where shown this way, is equity divided by used margin, multiplied by 100. These are account-control figures, not a safe amount to lose or withdraw. A provider can impose different formulas and closeout thresholds.",
      },
      {
        type: "paragraph",
        children:
          "If a demo balance is US$1,000 and floating P&L is −US$12 with no other adjustments, equity is US$988. If used margin is US$100, free margin is US$888 and margin level is 988%. Closing at that result would make balance US$988 before further charges, release margin and remove that floating position. Do not treat the large percentage as evidence that the trade itself is wise.",
      },
      {
        type: "comparisonTable",
        caption: "One hypothetical account snapshot",
        columns: [
          "Number",
          "Illustrative value",
          "Meaning under the stated assumptions",
        ],
        rows: [
          [
            "Balance",
            "US$1,000",
            "Recorded funds before this open position’s result.",
          ],
          ["Floating P&L", "−US$12", "Unrealised result; it can still change."],
          ["Equity", "US$988", "1,000 − 12, with no other adjustments."],
          [
            "Used / free margin",
            "US$100 / US$888",
            "Required support / equity remaining under this example.",
          ],
          [
            "Margin level",
            "988%",
            "988 ÷ 100 × 100; provider thresholds vary.",
          ],
        ],
      },
      {
        type: "learningLink",
        title: "Explore the arithmetic with the Margin Calculator",
        href: "/tools/margin-calculator",
        description:
          "For an arithmetic exercise only, use EUR/USD, 0.01 lots, market price 1.1000, leverage 10:1, a USD account and conversion factor 1. Under the assumed 100,000-unit standard lot, exposure is US$1,100 and estimated margin is US$110. This is not a leverage recommendation or maximum loss; the provider’s actual requirements can differ.",
      },
    ],
  },
  {
    title: "Read the quote and the chart separately",
    shortTitle: "Quote versus chart",
    blocks: [
      {
        type: "paragraph",
        children:
          "For a simple long EUR/USD position, a buy enters at the available ask and a sale to close uses the available bid. A short sale enters at bid and a purchase to close uses ask. Actual fills can differ from the quote you observed. Record the filled prices, not a remembered chart level.",
      },
      {
        type: "paragraph",
        children:
          "Charts may display bid, ask, last-traded or midpoint prices depending on the product and platform. A candlestick reaching your drawn line does not by itself prove that the relevant executable side or trigger condition was met. A widened spread can change the relationship between the chart and a stop or target.",
      },
      {
        type: "paragraph",
        children:
          "Record the chart’s price basis and time zone. Provider server time, UTC, and your local clock need not match. A German learner recording 14:00 without a date and time zone cannot reliably compare that note with tomorrow’s news schedule. Daylight-saving changes make date-specific conversions important.",
      },
      {
        type: "example",
        title: "An unchanged quote can start with a loss",
        children: [
          "The demo quote is EUR/USD bid 1.1000 and ask 1.1002. Under a 1,000-euro size convention, buying at 1.1002 and immediately selling at 1.1000 produces (1.1000 − 1.1002) × 1,000 = −US$0.20 before separate fees. Nothing unusual has to happen: the two-pip spread explains the difference.",
        ],
      },
      {
        type: "learningLink",
        title: "Check this example with the Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Choose EUR/USD, 0.01 lots and a USD account, with the assumed 100,000-unit standard lot. The illustrative value is US$0.10 per pip; two pips correspond to US$0.20. Confirm the product convention first.",
      },
    ],
  },
  {
    title: "Distinguish an order, a fill and a position",
    shortTitle: "The life cycle",
    blocks: [
      {
        type: "paragraph",
        children:
          "An order is an instruction. A fill or deal records execution of some or all of that instruction. A position is the resulting open exposure. A pending instruction is not yet a position. An instruction can be accepted and still wait, partly fill, expire, be cancelled or be rejected.",
      },
      {
        type: "paragraph",
        children:
          "Find the order list, position list, execution record and account history. Note the identifier for each relevant item. A “submitted” message may only confirm receipt; look for the accepted, filled or rejected status that follows. If a response is delayed, inspect status before pressing the same button again. Duplicate instructions can create unintended exposure.",
      },
      {
        type: "paragraph",
        children:
          "Cancellation asks the system to remove a waiting instruction. Closing asks for an offsetting transaction on an existing position. A cancellation request can arrive after a fill, so verify the final state. Navigating away from the page, logging out, deleting a chart line or closing the browser is not the same as cancelling an order.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/platforms-and-demo-practice-guide.svg",
        desktopSrc:
          "/images/lessons/forex/platforms-and-demo-practice-guide-desktop.svg",
        alt: "A demo life cycle separates a waiting order, a filled open position and a closed history record. Cancelling removes an unfilled instruction; closing offsets a filled position.",
        caption:
          "Follow the recorded status. A waiting instruction, an open exposure and a closed result are different things.",
        width: 600,
        height: 525,
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Find both the current status and its record. A button press alone does not prove the action finished.",
      },
    ],
  },
  {
    title: "Rehearse the complete control routine",
    shortTitle: "A calm routine",
    blocks: [
      {
        type: "paragraph",
        children:
          "Begin with one pair and a short scheduled practice session. Read the quote and specification, write the intended direction and tiny simulated size, and state what would close the position. Review the ticket and submit one instruction. Wait for its confirmed status, then record the actual fill, identifier, timestamp, spread and any displayed costs.",
      },
      {
        type: "paragraph",
        children:
          "Locate any attached stop and target after the fill. Confirm that they are active instructions on the intended position rather than drawings. If an attachment is rejected or cannot be placed near the market, the position can remain open without it. Record the provider’s minimum distances and amendment rules instead of repeatedly clicking.",
      },
      {
        type: "paragraph",
        children:
          "Next, close through the platform’s position-control function and find the closed entry in history. Record the final price and realised result, then check that no residual position or unwanted pending instruction remains. In a separate exercise, place a pending limit, cancel it, and retain its final cancellation record. A control you cannot reliably locate deserves more practice.",
      },
      {
        type: "example",
        title: "The oven’s off switch",
        children: [
          "Before using a new oven in France, you locate the temperature dial and the off switch. On demo, make the close and cancel controls equally familiar. Practise them slowly; discovering an exit only after opening an exposure reverses the useful learning order.",
        ],
      },
    ],
  },
  {
    title: "Check how the account handles opposite trades",
    shortTitle: "Netting and hedging",
    blocks: [
      {
        type: "paragraph",
        children:
          "In a netting arrangement, transactions in one symbol combine into a net position. If you are long 1,000 EUR/USD units and sell 600 of the same product, a simple netting account may leave you long 400 units. Selling 1,400 instead can close the long and leave a 400-unit short, subject to the account’s rules.",
      },
      {
        type: "paragraph",
        children:
          "In a hedging arrangement, the account may hold separately identified positions, including opposite directions. A new sale can therefore create another position instead of closing the original long. You may face costs and margin rules on both. The word “hedging” describes the accounting arrangement here; it does not prove that the combined account is free of risk.",
      },
      {
        type: "paragraph",
        children:
          "This is why “press the opposite button to close” is unsafe as a universal instruction. Use the intended position’s close function and confirm remaining exposure. Test partial closure on demo, including what happens to associated stops and targets. The platform developer’s guide and provider’s account settings together determine the available behaviour.",
      },
      {
        type: "comparisonTable",
        caption: "The same instruction can have different effects",
        columns: [
          "Starting point",
          "Simple netting example",
          "Possible hedging-account result",
        ],
        rows: [
          [
            "Long 1,000 units; sell 600",
            "One long position of 400 remains",
            "A separate 600-unit short may be added.",
          ],
          [
            "Intended partial close",
            "Reduce exposure through the correct control",
            "Close part of the selected position explicitly.",
          ],
          [
            "Intended full close",
            "Confirm net exposure is zero",
            "Confirm the specific position and other positions are closed.",
          ],
        ],
      },
    ],
  },
  {
    title: "Plan for rejection, disconnection and uncertainty",
    shortTitle: "When something fails",
    blocks: [
      {
        type: "paragraph",
        children:
          "An instruction may be rejected because of size increments, margin, market hours, invalid prices, minimum distances or another rule. Read the message and verify the state before correcting it. A failed request to add a stop is different from a rejected entry. In the first case, exposure might already exist.",
      },
      {
        type: "paragraph",
        children:
          "If connectivity drops after submission, the provider may already have accepted the order. Reconnect through a trusted route and inspect the order and position records. Do not assume that nothing happened because your screen froze. Keep the official support route available and learn the platform’s documented outage procedure on demo.",
      },
      {
        type: "paragraph",
        children:
          "Some automated features depend on the local application running; others are held on the provider’s system. MetaTrader 5 documents its built-in trailing stop as a terminal-side function, for example. That is a specific implementation, not a rule for every platform. Find out which instructions survive logout, loss of connection or closure of the application.",
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "Demo cannot establish that live withdrawals work, that every future outage will be handled well, or that a server will always accept an exit at your planned price.",
        ],
      },
    ],
  },
  {
    title: "A real-life worked example",
    shortTitle: "Worked example",
    blocks: [
      {
        type: "paragraph",
        children:
          "The Brazilian learner records a hypothetical EUR/USD quote of 1.1000 bid and 1.1002 ask. The account is demo, uses USD, and defines 0.01 lot as 1,000 euros. A simulated market buy fills at 1.1003. The fill is one pip worse than the observed ask; the record shows US$0.10 of adverse entry slippage at this size.",
      },
      {
        type: "paragraph",
        children:
          "Later, the position is closed by selling at bid 1.1013. The executable movement is 1.1013 − 1.1003 = 0.0010, or ten pips. Gross price-move P&L is US$1 before any separate charges. The entry already used the actual ask-side fill and the exit the bid-side fill, so do not subtract the spread or entry slippage again.",
      },
      {
        type: "paragraph",
        children:
          "The learner saves both records, checks that exposure is zero, and explains the difference between the earlier floating result and the final history result. Tomorrow’s exercise repeats the control routine with a cancelled pending order. The aim is consistency and truthful records, not a target amount of pretend profit.",
      },
      {
        type: "learningLink",
        title: "Reconcile the fills with the Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use a long EUR/USD position, 0.01 lots, entry 1.1003, exit 1.1013, USD account and conversion factor 1. The gross result is US$1. Separate commissions and financing belong in the statement reconciliation.",
      },
    ],
  },
  {
    title: "Keep a notebook you can audit",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "For five short demo sessions, record date, time zone, account type, currency, exact symbol, size units, bid/ask, intended instruction, confirmed status, actual fill, costs and final exposure. Rehearse one cancellation and one full closure. No live account is needed.",
      },
      {
        type: "comparisonTable",
        caption: "A compact demo journal",
        columns: ["Question", "Record it like this"],
        rows: [
          [
            "What did I mean to do?",
            "Buy 1,000 EUR/USD units on demo after checking the ticket.",
          ],
          [
            "What actually happened?",
            "Order accepted, filled at the recorded price, position ID saved.",
          ],
          [
            "What remains active?",
            "Position quantity, attached exits and any other pending instructions.",
          ],
          [
            "How did I finish?",
            "Closed record, final result, no unintended exposure.",
          ],
          [
            "What needs more practice?",
            "One specific control or explanation for the next session.",
          ],
        ],
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "A pending limit shows “cancel requested”: wait for the final record rather than declaring it gone. Equity is green while a position is open: that figure is still unrealised. An opposite order appears as a second position: use the correct close control and investigate the account’s position-accounting mode.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Review whether your simulated size and session length are realistic for a careful beginner. An enormous demo balance or frantic clicking can hide mistakes that a useful rehearsal would expose. Continue practising until you can explain each field and the complete life cycle. Comfort with an interface is a prerequisite for learning further, not proof that live trading is appropriate.",
      },
    ],
  },
  {
    title: "References and before moving on",
    shortTitle: "Before moving on",
    blocks: [
      {
        type: "riskStatement",
        children:
          "Learning material and hypothetical examples only. Leveraged Forex can cause substantial losses. Demo results, planned exits and calculators do not guarantee live fills or profits. Product rules and protections depend on the actual provider, account and jurisdiction.",
      },
      {
        type: "keyPoint",
        checklist: true,
        title: "I can explain this without guessing",
        points: [
          "I can confirm the demo account, exact product and size units before clicking.",
          "I can distinguish balance, equity, margin and realised versus floating results.",
          "I can follow an order through acceptance, execution, cancellation or rejection.",
          "I can close the intended position and confirm remaining exposure.",
          "I can explain why a demo record cannot prove live profitability or withdrawals.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "MetaTrader 5 — Demo account opening (Android example)",
            url: "https://www.metatrader5.com/en/mobile-trading/android/help/settings_accounts/account_open",
          },
          {
            title: "MetaTrader 5 — Basic trading principles and trailing stops",
            url: "https://www.metatrader5.com/en/terminal/help/trading/general_concept",
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
