import type { LessonSection } from "../../lesson-content";

export const choosingAProviderSections: LessonSection[] = [
  {
    title: "Start with the company behind the app",
    shortTitle: "Behind the app",
    blocks: [
      {
        type: "paragraph",
        children:
          "You have learned to read a currency quote. The next question is who is offering that quote, what contract they are offering, and what happens if something goes wrong. A beautiful screen is helpful, but it does not answer any of those questions. This lesson gives you a repeatable research process rather than a list of recommended companies.",
      },
      {
        type: "paragraph",
        children:
          "A provider may supply prices, take or arrange orders, maintain account records, handle funding, and give customer support. A broker commonly arranges transactions; a dealer may trade as the customer’s counterparty. In everyday advertising both may be called “brokers.” The customer agreement tells you which legal company owes you obligations and what those obligations are.",
      },
      {
        type: "example",
        title: "A ticket app and the actual bus company",
        children: [
          "A person in South Africa books a bus ticket through an app. If the bus never arrives, the important questions are who sold the ticket, who operates the bus, and who must handle a refund. Similarly, a Forex brand, platform developer, payment processor, and contracting company can be different organisations. Write down each role instead of assuming the logo identifies all of them.",
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Know the legal entity and contract before comparing colours, bonuses, or advertised spreads.",
      },
    ],
  },
  {
    title: "Know the product behind the pair",
    shortTitle: "The contract",
    blocks: [
      {
        type: "paragraph",
        children:
          "The same EUR/USD symbol can appear on very different products. An ordinary currency conversion exchanges money you may spend or hold. A leveraged over-the-counter Forex position or a currency CFD can instead give you exposure to a price change under a contract with a provider. A CFD generally settles a difference without giving you ownership of the currencies. Exchange-traded futures have specified contract sizes, expiry dates, and exchange rules.",
      },
      {
        type: "paragraph",
        children:
          "A pair symbol is therefore only the beginning of the description. Ask whether currency is delivered, whether the position expires or rolls, how it is closed, who is the counterparty, and which account agreement applies. Do not assume a product available in another country is permitted or suitable where you live.",
      },
      {
        type: "comparisonTable",
        caption: "One familiar symbol, different agreements",
        columns: [
          "Product",
          "What the customer is arranging",
          "Details to verify",
        ],
        rows: [
          [
            "Currency conversion",
            "Exchange of one currency for another",
            "Delivery, exchange rate, conversion fee and payment timing.",
          ],
          [
            "Leveraged OTC Forex",
            "Contractual exposure through a dealer",
            "Counterparty, margin, closeout rules and overnight terms.",
          ],
          [
            "Currency CFD",
            "Settlement of the contract’s price difference",
            "Contract size, provider, fees and applicable protections.",
          ],
          [
            "FX future",
            "An exchange-standardised contract",
            "Contract size, expiry, clearing and order rules.",
          ],
        ],
      },
      {
        type: "example",
        title: "Two USD/ZAR screens",
        children: [
          "A South African learner sees USD/ZAR on a travel-money app and a leveraged trading app. The first may deliver rand after a conversion; the second may record an open position requiring margin. The matching symbol does not make the obligations, costs, or risks equal.",
        ],
      },
    ],
  },
  {
    title: "Read broker-model labels carefully",
    shortTitle: "Broker models",
    blocks: [
      {
        type: "paragraph",
        children:
          "A market maker quotes prices to customers and may take the other side of their transactions. It may retain exposure, offset customer flows, or hedge elsewhere. A dealing-desk label describes a way of handling business, not proof of dishonest behaviour. The potential conflict is still important: quoting, customer outcomes, and the firm’s own exposure can interact. Ask how conflicts are disclosed and controlled.",
      },
      {
        type: "paragraph",
        children:
          "Agency-style execution seeks a transaction through outside sources. STP, short for straight-through processing, usually describes automated processing or routing. ECN, an electronic communication network, generally describes electronic matching among participants. These labels do not prove that a retail customer directly trades on a bank order book. A firm may remain your legal counterparty even when it sends a corresponding hedge outside.",
      },
      {
        type: "paragraph",
        children:
          "Hybrid arrangements combine methods. The handling may vary by account, instrument, size, or circumstances. An A-book or B-book slogan does not replace the execution policy. No model alone guarantees tight spreads, honest treatment, a particular fill, or prompt withdrawals. A market maker does not automatically offer fixed spreads or guaranteed execution, and an ECN label does not automatically mean commission-only pricing.",
      },
      {
        type: "comparisonTable",
        caption: "Turn a label into a question",
        columns: ["Advertised label", "Possible meaning", "Useful question"],
        rows: [
          [
            "Market maker / dealing desk",
            "Firm quotes and may be the counterparty",
            "What price, execution and conflict policies apply?",
          ],
          [
            "STP",
            "Automated processing or outside routing",
            "Where are orders handled, and who remains the counterparty?",
          ],
          [
            "ECN",
            "Electronic matching or access to a network",
            "Which venue, fees and execution rules actually apply?",
          ],
          [
            "Hybrid",
            "Combination of handling methods",
            "When can handling change for this account?",
          ],
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "Compare documented obligations and observed execution; a model label is not a safety rating.",
      },
    ],
  },
  {
    title: "Verify identity through official records",
    shortTitle: "Verify identity",
    blocks: [
      {
        type: "paragraph",
        children:
          "Copy the exact legal company name from the agreement, not just the brand at the top of a webpage. Record the regulator claimed, registration or authorisation identifier, and the account’s jurisdiction. Open the regulator’s official website independently. Search for the same entity and check its current status and permissions for the specific activity.",
      },
      {
        type: "paragraph",
        children:
          "Company incorporation and financial-services permission are different checks. A business may exist legally without being authorised for the service being sold. The regulator for one subsidiary does not automatically supervise every company sharing its brand. Rules depend on the customer’s country, product, legal entity, and classification. A claim of overseas authorisation does not settle whether a firm may offer you that service.",
      },
      {
        type: "paragraph",
        children:
          "The FCA Firm Checker is an example for UK firms; the CFTC and NFA provide checks relevant to US retail Forex. Use the appropriate official authority for the actual claim and your location. Check restrictions, warnings, and disciplinary information where available. Absence from a warning list is not a certificate of safety; information can be incomplete or change.",
      },
      {
        type: "example",
        title: "A borrowed registration number",
        children: [
          "A student in South Africa is shown a supposed UK registration number. The official record belongs to a differently named firm, with another website and telephone number. The student uses the contact details in the official record to ask whether the offer is genuine. A pasted certificate or a salesperson’s explanation does not resolve that mismatch.",
        ],
      },
    ],
  },
  {
    title: "Separate a genuine firm from a clone",
    shortTitle: "Check the contact route",
    blocks: [
      {
        type: "paragraph",
        children:
          "A clone copies details from a genuine business and adds the scammer’s own website, phone number, or payment instructions. This is why checking only a registration number is insufficient. Match the legal name, product permission, domain, contact route, and the entity shown in the agreement. Contact the firm through independently verified details when anything differs.",
      },
      {
        type: "paragraph",
        children:
          "Be cautious if someone says the official record is outdated and asks you to ignore it. Do not follow a search advertisement or a chat link merely because its logo looks familiar. Save the exact web address and date of your check. A small spelling change in an address can be easy to miss on a phone.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/choosing-a-forex-provider-guide.svg",
        desktopSrc:
          "/images/lessons/forex/choosing-a-forex-provider-guide-desktop.svg",
        alt: "Three separate checks: identify the legal company, match it with the official record, and confirm product permissions and genuine contact details.",
        caption:
          "A research sequence, not a recommendation: name the entity, independently check it, then match the permissions and contact route.",
        width: 600,
        height: 525,
      },
      {
        type: "warning",
        title: "Keep this distinction clear",
        children: [
          "A genuine platform name, familiar logo, or working demo does not prove that the person asking for money represents an authorised firm.",
        ],
      },
    ],
  },
  {
    title: "Ask what protections actually apply",
    shortTitle: "Account protections",
    blocks: [
      {
        type: "paragraph",
        children:
          "Client-money segregation, negative-balance protection, complaint services, and compensation schemes have different purposes. Segregation concerns how client funds are held. Negative-balance protection, where applicable, addresses certain losses beyond an account balance. A compensation scheme may deal with eligible claims when a firm fails; it does not refund ordinary losing trades. None of these descriptions is a promise that your particular account qualifies.",
      },
      {
        type: "paragraph",
        children:
          "Ask for the written protection terms, jurisdiction, eligibility, limits, exclusions, and claim route. The same brand can offer different protections under different entities. A retail or professional classification can change rights and trading conditions. Do not accept a classification you do not understand simply to obtain higher leverage.",
      },
      {
        type: "paragraph",
        children:
          "Read the complaint process before there is a dispute. Find the official support address, response procedure, external dispute route if available, and governing law. A vague promise that “your money is insured” needs a named scheme and verifiable terms. If the explanation cannot be independently checked, leave it unresolved rather than treating it as reassurance.",
      },
      {
        type: "comparisonTable",
        caption: "Different protections solve different problems",
        columns: ["Term", "Question to ask", "What it does not establish"],
        rows: [
          [
            "Client-money treatment",
            "How and where are funds held under this agreement?",
            "That a trade cannot lose money.",
          ],
          [
            "Negative-balance protection",
            "Does it apply to this product and customer class?",
            "That the account balance cannot be lost.",
          ],
          [
            "Compensation or dispute scheme",
            "Is this entity, claim and customer eligible?",
            "Automatic repayment of trading losses.",
          ],
        ],
      },
    ],
  },
  {
    title: "Compare terms and execution evidence",
    shortTitle: "Compare fairly",
    blocks: [
      {
        type: "paragraph",
        children:
          "Use a like-for-like comparison: the same contract, pair, account currency, hypothetical size, observation time, and holding period. Record typical spreads as well as minimum advertised spreads, commission on entry and exit, financing, conversion, and account charges. Check minimum trade increments, platform availability, support, and withdrawal rules.",
      },
      {
        type: "paragraph",
        children:
          "An order-handling policy should explain how prices are sourced, when an order can be rejected, whether requotes occur, and what happens during fast markets or outages. In a requote, the firm offers another price instead of accepting the original request. A rejection means the requested transaction was not accepted; verify the status before sending another order.",
      },
      {
        type: "paragraph",
        children:
          "On demo, record the quote, intended instruction, fill, timestamp and charges for a small simulated transaction. That tests your understanding and the demo’s reporting. It does not prove live execution or withdrawals. Reviews and affiliate rankings may help you form questions, but their payment arrangements and unverifiable claims limit their value.",
      },
      {
        type: "example",
        title: "The cheaper delivery app?",
        children: [
          "Two food-delivery apps in India display the same meal for ₹300. One adds ₹40 delivery and ₹20 service fees; the other includes delivery but adds ₹30. You compare ₹360 with ₹330. Apply the same habit to a Forex offer: write the complete bill before deciding which headline is cheaper.",
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
          "Consider a fictional South African learner comparing two offers for USD/ZAR. Offer A advertises a tiny spread and a UK connection. Its agreement names an offshore entity. Offer B lists a clearer legal entity but supplies no written withdrawal timetable. Neither offer has passed the research process yet.",
      },
      {
        type: "paragraph",
        children:
          "The learner makes a two-column notebook: “claim” and “independent evidence.” For A, the UK record does not identify the entity in the agreement. For B, the withdrawal question remains unanswered. The learner requests written clarification through verified contacts and stays on demo. A successful first check does not cancel a failure in another.",
      },
      {
        type: "comparisonTable",
        caption: "A useful research notebook",
        columns: ["Item", "Evidence to retain", "Decision if unresolved"],
        rows: [
          [
            "Contracting entity",
            "Dated agreement and exact company name",
            "Do not fund an unidentified contract.",
          ],
          [
            "Authority and permissions",
            "Official record for that entity and service",
            "Pause when the claim does not match.",
          ],
          [
            "Contact and payment details",
            "Independent contact confirmation and payment terms",
            "Investigate unexplained differences.",
          ],
          [
            "Costs and withdrawals",
            "Current schedules and eligibility rules",
            "Do not guess missing charges or conditions.",
          ],
        ],
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "“Not yet verified” is a useful conclusion. You do not owe an app a deposit because you spent time researching it.",
      },
    ],
  },
  {
    title: "Practise a provider review without funding",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Using a fictional offer or public documents, list the brand, legal entity, product, claimed regulator, permission, contact route, counterparty, fees, withdrawal conditions and complaint procedure. Mark every item verified, unclear or conflicting. Do not open or fund an account for this exercise.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "A registration number matches but the website differs: that is not a completed identity check. An app says ECN but the contract names a dealer counterparty: investigate the actual agreement rather than assuming the label overrides it. A scheme exists but your account eligibility is unspecified: protection remains unconfirmed.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Write one reason to decline the offer even if all screen controls work. Then explain your conclusion to a friend in ordinary language. If you need a slogan such as “the best broker model” to justify the decision, revisit the evidence. This lesson prepares you to ask sound questions; it cannot certify a particular company or make leveraged trading suitable for everyone.",
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
          "I can identify the contracting company and the product behind a pair symbol.",
          "I can explain the broker-model labels without assuming guaranteed execution or safety.",
          "I can match an official record, product permissions and genuine contact details.",
          "I can compare full terms and leave unanswered questions unresolved.",
          "I understand that account protections vary and do not remove trading losses.",
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
            title: "NFA — Forex Transactions: Regulatory Guide (US rules)",
            url: "https://www.nfa.futures.org/members/member-resources/files/forex-regulatory-guide.html",
          },
          {
            title: "FCA — Firm Checker",
            url: "https://www.fca.org.uk/consumers/fca-firm-checker",
          },
          {
            title: "FCA — Clone firms and individuals",
            url: "https://www.fca.org.uk/consumers/clone-firms-individuals",
          },
        ],
      },
    ],
  },
];
