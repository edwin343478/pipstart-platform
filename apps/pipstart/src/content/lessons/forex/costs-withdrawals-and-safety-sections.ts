import type { LessonSection } from "../../lesson-content";

export const costsWithdrawalsAndSafetySections: LessonSection[] = [
  {
    title: "Read the whole bill",
    shortTitle: "The complete cost",
    blocks: [
      {
        type: "paragraph",
        children:
          "A favourable price move is not the same as money left in an account. A spread, commission, financing, conversion and account charges can change the outcome. This lesson teaches you to reconcile the bill without counting a cost twice, then check the practical route for deposits, withdrawals and complaints.",
      },
      {
        type: "paragraph",
        children:
          "Think of a bus ticket in Canada. An advertised C$20 fare can become C$28 after booking and baggage charges. Comparing only the first number misses the trip’s cost. For a Forex contract, compare the same size, entry and exit convention, holding period and account currency. A headline such as “zero commission” answers only one part of the question.",
      },
      {
        type: "paragraph",
        children:
          "All amounts in this lesson are hypothetical and are not current quotes or provider recommendations. Actual fees depend on the legal entity, account, product, payment route and date. Retain dated schedules and statements so a later change does not leave your notes without context.",
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Begin with the actual transaction prices, then add only the costs and credits not already included.",
      },
    ],
  },
  {
    title: "Separate the price effect from separate charges",
    shortTitle: "What each cost means",
    blocks: [
      {
        type: "paragraph",
        children:
          "The spread is the difference between bid and ask. When a long entry uses ask and its exit uses bid, the price-move result already reflects those executable sides. Commission is a separate stated charge, often on opening and closing; check whether an advertised amount is per side or round trip and whether a minimum applies.",
      },
      {
        type: "paragraph",
        children:
          "Financing, rollover or swap is a holding debit or credit that can apply at a provider’s cut-off. Conversion changes a result denominated in one currency into the account’s currency, possibly with an additional markup. Payment, inactivity, data or withdrawal fees are separate account-related items where the agreement provides for them.",
      },
      {
        type: "paragraph",
        children:
          "Slippage is an execution difference, not necessarily a statement line labelled “fee.” Actual entry and exit fills already reflect it. Record the intended prices separately if you want to measure execution quality, but do not then subtract that difference again from P&L calculated using the actual fills.",
      },
      {
        type: "comparisonTable",
        caption: "A statement-reading checklist",
        columns: ["Item", "Where to look", "Avoid this mistake"],
        rows: [
          [
            "Spread and actual fills",
            "Bid/ask observation and transaction record",
            "Subtracting spread again from executable-price P&L.",
          ],
          [
            "Commission",
            "Fee schedule and entry/exit statement lines",
            "Treating a per-side amount as the total round trip.",
          ],
          [
            "Financing debit or credit",
            "Dated holding terms and cash adjustments",
            "Assuming the sign or number of charged days.",
          ],
          [
            "Conversion",
            "Profit currency, account currency and applied rate",
            "Using a rate in the wrong direction.",
          ],
          [
            "Account and payment fees",
            "Funding, inactivity and withdrawal terms",
            "Calling an account free because one trade has no commission.",
          ],
        ],
      },
    ],
  },
  {
    title: "Compare two hypothetical offers fairly",
    shortTitle: "Like-for-like comparison",
    blocks: [
      {
        type: "paragraph",
        children:
          "A Canadian learner compares hypothetical EUR/CAD contracts with an assumed size of 10,000 euros and a conventional pip of 0.0001 Canadian dollars per euro. Each pip is C$1 at that size. Provider A advertises no commission and a four-pip spread. Provider B displays a two-pip spread and C$1 commission per side, C$2 for the completed round trip.",
      },
      {
        type: "paragraph",
        children:
          "At unchanged prices, spread effects would be C$4 and C$2 respectively. Adding B’s C$2 round-trip commission makes both illustrative round trips C$4 before holding, conversion, slippage or other charges. If B’s stated C$1 were instead a round-trip total, its illustrated bill would be C$3. The wording changes the comparison.",
      },
      {
        type: "paragraph",
        children:
          "This simple calculation isolates a cost at one moment; spreads can vary and fees may scale differently. Use the same contract and holding period and inspect relevant conditions. A lower theoretical bill cannot compensate for an unidentified legal entity or unexplained withdrawal restrictions.",
      },
      {
        type: "comparisonTable",
        caption: "Unchanged-price comparison at 10,000 EUR units",
        columns: [
          "Hypothetical offer",
          "Spread effect",
          "Round-trip commission",
          "Illustrative total",
        ],
        rows: [
          ["A: four-pip spread, no commission", "C$4", "C$0", "C$4"],
          ["B: two-pip spread, C$1 per side", "C$2", "C$2", "C$4"],
          ["Alternative B: C$1 total commission", "C$2", "C$1", "C$3"],
        ],
      },
      {
        type: "learningLink",
        title: "Translate the spread with the Pip Value Calculator",
        href: "/tools/pip-value-calculator",
        description:
          "Choose EUR/CAD, 0.1 lots and CAD account under the assumed 100,000-unit standard lot. One pip is C$1. Confirm the product’s contract size and commission wording separately.",
      },
    ],
  },
  {
    title: "Account for holding time and rollover",
    shortTitle: "Overnight terms",
    blocks: [
      {
        type: "paragraph",
        children:
          "Some leveraged Forex contracts apply financing when a position remains open across a stated cut-off. The amount can be a debit or credit, differ between long and short, and change with market conditions and provider markups. A country’s higher policy rate alone does not tell you the credit your account will receive.",
      },
      {
        type: "paragraph",
        children:
          "The provider may quote holding costs per lot, per specified units, in points, or as a monetary amount. Check the unit before multiplying. If a hypothetical rate is −C$0.40 per 10,000-euro position per charged day, three charged days produce −C$1.20 at that size. A 1,000-euro position would give −C$0.12 only if the schedule scales proportionally without a minimum or rounding adjustment.",
      },
      {
        type: "paragraph",
        children:
          "The number of charged days can differ from the number of nights you remember holding the trade. Settlement conventions, weekends and holidays may cause a multi-day adjustment at a particular rollover. Do not assume every product applies a triple charge on the same weekday. Check the dated product schedule, server cut-off and actual statement entries.",
      },
      {
        type: "paragraph",
        children:
          "An account described as swap-free can still have administration or other holding charges and eligibility rules. Read the complete terms rather than equating the label with no holding cost. Holding a position longer can also increase market exposure; a cost estimate says nothing about whether waiting will improve its price.",
      },
      {
        type: "example",
        title: "Use a signed ledger",
        children: [
          "A Canadian learner writes holding entries as −C$1, −C$1 and −C$1, giving a total debit of C$3. A different stated schedule might show +C$1 instead. The signs matter: a credit adds to the result; a debit subtracts from it. Never change the sign because the pair’s interest-rate story sounds favourable.",
        ],
      },
    ],
  },
  {
    title: "Reconcile P&L without double-counting",
    shortTitle: "Gross and net",
    blocks: [
      {
        type: "paragraph",
        children:
          "There are two useful starting conventions. A midpoint-movement illustration leaves the spread outside its starting result, so subtract a separately estimated spread effect once. An executable-price calculation uses the actual entry and exit sides, so the spread effect is already inside the starting result. Label your convention before doing arithmetic.",
      },
      {
        type: "paragraph",
        children:
          "Suppose a hypothetical midpoint-based EUR/CAD movement is worth C$8. An estimated C$2 spread effect leaves C$6 from executable prices. Subtract C$1 commission and C$3 financing to reach C$2. If instead the C$8 starting figure already comes from the executable entry and exit, subtract only the separate C$1 and C$3: the result is C$4. These are different starting figures, not contradictory answers.",
      },
      {
        type: "paragraph",
        children:
          "A long 10,000-euro position entered at 1.4702 and exited at 1.4710 produces (1.4710 − 1.4702) × 10,000 = C$8 gross price-move P&L. The fill prices already include their bid/ask and slippage effects. With C$1 separate commission and C$3 financing, the illustrated trading result is C$4 before further conversion, tax or account charges.",
      },
      {
        type: "formula",
        expression:
          "Net trading result = executable-price P&L − separate charges + separate credits",
        explanation:
          "Do not deduct spread or slippage again if actual entry and exit fills already include them. State which taxes and account-related fees remain outside this illustration.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/costs-withdrawals-and-safety-guide.svg",
        desktopSrc:
          "/images/lessons/forex/costs-withdrawals-and-safety-guide-desktop.svg",
        alt: "An executable-price gross result of C$8 minus C$1 commission and C$3 financing leaves C$4. Spread is already reflected in the stated fills and is not subtracted again.",
        caption:
          "This ledger starts from actual executable-price movement. It excludes further conversion, tax and account-related fees.",
        width: 600,
        height: 525,
      },
      {
        type: "learningLink",
        title: "Check the gross movement with the Profit-and-Loss Calculator",
        href: "/tools/profit-loss-calculator",
        description:
          "Use long EUR/CAD, 0.1 lots, entry 1.4702, exit 1.4710, CAD account and conversion factor 1. The gross estimate is C$8. Reconcile separate charges yourself; the calculator does not produce a final cash statement.",
      },
    ],
  },
  {
    title: "Check currency conversion and cash records",
    shortTitle: "Conversion and cash",
    blocks: [
      {
        type: "paragraph",
        children:
          "A pair’s quote currency and your account currency can differ. EUR/USD price-move P&L is naturally measured in dollars under the simple unit convention; a GBP account needs a dollar-to-pound conversion. Use a rate expressed as account-currency units per one profit-currency unit, and confirm the provider’s actual rate and time.",
      },
      {
        type: "paragraph",
        children:
          "For a hypothetical US$10 result and conversion of £0.80 per US$1, the converted amount is £8 before conversion markup or fees. Do not multiply by the inverse rate of US$1.25 per £1. Write the units next to the numbers; this makes an upside-down rate easier to spot.",
      },
      {
        type: "paragraph",
        children:
          "Cash balance movement also includes deposits, withdrawals and adjustments. If opening balance is C$500, net trading result C$4, no other entries and a C$50 withdrawal, closing balance is C$454. A lower balance is not automatically a trading loss, and a deposit is not trading profit. Keep trading performance and cash transfers in separate columns.",
      },
      {
        type: "paragraph",
        children:
          "Tax treatment depends on the product and your jurisdiction. The lesson and calculators do not determine what tax you owe. Keep statements and obtain the appropriate local guidance rather than accepting a salesperson’s universal “tax-free” claim.",
      },
      {
        type: "comparisonTable",
        caption: "Two checks on a cash statement",
        columns: ["Question", "Hypothetical check"],
        rows: [
          [
            "Is the conversion direction correct?",
            "US$10 × £0.80 per US$1 = £8.",
          ],
          [
            "Did I separate transfers from performance?",
            "C$500 + C$4 − C$50 withdrawal = C$454.",
          ],
          [
            "Have I included every adjustment?",
            "Reconcile dated fees, credits and conversions with the statement.",
          ],
        ],
      },
    ],
  },
  {
    title: "Read deposit and withdrawal terms before paying",
    shortTitle: "Funding terms",
    blocks: [
      {
        type: "paragraph",
        children:
          "Before any deposit, identify permitted payment methods, minimum amounts, supported currencies, recipient details and processing costs. Understand identity and source-of-funds checks, when documents may be needed, and the official secure route for providing them. Send sensitive documents only after independently verifying the organisation and channel.",
      },
      {
        type: "paragraph",
        children:
          "For withdrawals, distinguish submitting a request, the provider approving it and the receiving bank or wallet crediting it. Check eligibility, available balance, open-position restrictions, fees, processing times, cut-off times and return-to-source conditions. A payment processor’s timing can differ from the provider’s stated handling time.",
      },
      {
        type: "paragraph",
        children:
          "Money needed as margin may not be freely withdrawable while positions remain open. Bonus or promotion terms can impose conditions; read them before accepting anything. Do not accept an unclear turnover obligation in exchange for a headline reward. Ask how refunds, failed payments and account closure are handled.",
      },
      {
        type: "paragraph",
        children:
          "If someone already has a verified live account, an early small permitted withdrawal can test that one process, with request and receipt records retained. It does not prove every future withdrawal will succeed. No live deposit or withdrawal is required to complete this course. Learning on demo remains a valid choice.",
      },
      {
        type: "example",
        title: "The booking and the refund route",
        children: [
          "An Australian traveller checks cancellation and refund terms before paying A$200 for a room. They save the confirmation, merchant name and expected timing. Use the same habit for a provider: the ability to accept your payment is not proof of the ability or willingness to return it.",
        ],
      },
    ],
  },
  {
    title: "Recognise pressure and withdrawal traps",
    shortTitle: "Safety and access",
    blocks: [
      {
        type: "paragraph",
        children:
          "Guaranteed returns, pressure to deposit immediately, secret methods, unverifiable account screenshots and requests to move into private chats should trigger independent checks. A popular platform can be used by a genuine firm or an impostor. A display showing a large profit does not prove that money exists or can be withdrawn.",
      },
      {
        type: "paragraph",
        children:
          "A demand for a new surprise payment described as “tax,” “insurance,” “verification” or an account upgrade to release funds is a serious warning sign. Stop and independently verify the original agreement and relevant official requirements. Do not keep paying because earlier payments have already been made.",
      },
      {
        type: "paragraph",
        children:
          "Protect your password, one-time codes and account recovery details. A message claiming to be support should not persuade you to reveal a security code or install remote-access software. Contact the firm using independently verified details. Keep the device and application updated and use available account-security controls you understand.",
      },
      {
        type: "paragraph",
        children:
          "If a transaction or access attempt looks suspicious, preserve messages, URLs, receipts, account identifiers and a dated sequence of events. Contact the payment provider promptly through an official route and use the appropriate regulator or local reporting service. Recovery is not assured. Be cautious of another stranger promising recovery for an advance fee.",
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "Do not send an additional payment just to investigate or unlock a suspicious withdrawal. Verify through a route you found independently.",
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
          "A Canadian learner has the hypothetical executable-price C$8 result discussed earlier. Their statement separately lists C$1 commission and C$3 financing, so the illustrated net trading result is C$4. They notice a second worksheet subtracts C$2 spread again and reports C$2. The learner corrects that worksheet because the entry and exit were actual executable fills.",
      },
      {
        type: "paragraph",
        children:
          "Before considering any real account, they read withdrawal terms and match the legal company to official records. A supposed manager then messages them about a guaranteed monthly return and asks for a special deposit to qualify for withdrawals. The learner stops the conversation, preserves the message and checks independently. A tempting return claim does not change the fee arithmetic or the identity questions.",
      },
      {
        type: "paragraph",
        children:
          "Now change only the separate financing entry from a C$3 debit to a C$1 credit. Starting from executable C$8 and deducting C$1 commission, the illustrated result is C$8. If starting from the earlier midpoint-based C$8, deduct C$2 spread once and C$1 commission, then add the C$1 credit: C$6. Always show the starting convention alongside the answer.",
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A truthful ledger and a verified withdrawal route answer different questions. You need both; neither makes future returns certain.",
      },
    ],
  },
  {
    title: "Build your own statement checklist",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Create a hypothetical ledger with entry, exit, quantity, price-currency P&L, separate commission, signed financing, conversion and net result. Then draft a funding checklist covering identity, recipient, withdrawal eligibility, charges, timing and complaint route. No deposit is required.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "Executable gross C$8 minus C$1 commission and C$3 financing is C$4. Midpoint gross C$8 minus C$2 spread, C$1 commission and C$3 financing is C$2. A US$10 result converted at £0.80 per dollar is £8 before additional charges. A demand for a new fee to unlock a suspicious withdrawal calls for stopping and independent verification, not another payment.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Finish Level 2 by writing a short personal rule: “I will not fund a contract I cannot identify, cost or explain.” Add the official routes you would use to verify claims, the controls you would practise again and the documents you would retain. Choosing to continue with demo, or choosing not to trade, is a legitimate outcome of careful learning.",
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
        title: "I can explain this without guessing",
        points: [
          "I can compare like-for-like total costs, including per-side versus round-trip commission.",
          "I can explain holding debits and credits and check the dated rollover schedule.",
          "I can reconcile executable-price P&L without double-counting spread or slippage.",
          "I can check conversion units and separate trading results from cash transfers.",
          "I can explain funding terms, protect account access and recognise suspicious withdrawal demands.",
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
            title: "FCA — Clone firms and individuals",
            url: "https://www.fca.org.uk/consumers/clone-firms-individuals",
          },
          {
            title: "FOREX.com — Rollover rates (provider-specific example)",
            url: "https://www.forex.com/en-us/about-us/financial-transparency/rollover-rates/",
          },
          {
            title: "FOREX.com — Trading costs (provider-specific example)",
            url: "https://www.forex.com/en/about-us/financial-transparency/trading-costs/",
          },
        ],
      },
    ],
  },
];
