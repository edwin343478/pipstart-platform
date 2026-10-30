// Presentation text for curriculum items, keyed by course, module or quiz ID. It lives beside
// the curriculum objects (not inside them) so page payloads stay unchanged. An item without an
// entry here gets text derived from its title and description, so new items need no code edit.
// Existing Crypto values are today's exact strings, moved from the per-level route files.
export type SeoText = { title: string; description: string };
export type CurriculumPresentation = {
  /** Breadcrumb label on lesson pages; defaults to the course title. */
  lessonContextTitle?: string;
  /** Page SEO; a central seoEntries entry for the URL takes precedence. */
  seo?: SeoText;
};

export const curriculumPresentation: Readonly<
  Record<string, CurriculumPresentation>
> = {
  bitcoin: { lessonContextTitle: "Bitcoin and Shared Ledgers" },
  "bitcoin-foundations-quiz": {
    seo: {
      title: "Bitcoin and Shared Ledgers Quiz",
      description:
        "Check your understanding of the five Bitcoin and shared-ledger lessons with fifteen questions.",
    },
  },
  "wallets-and-security": {
    lessonContextTitle: "Wallets and Personal Security",
    seo: {
      title: "Wallets and Personal Security",
      description:
        "Five complete wallet and personal-security lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "wallet-and-personal-security": {
    seo: {
      title: "Wallets and Personal Security",
      description:
        "Five complete wallet and personal-security lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "crypto-wallet-security-quiz": {
    seo: {
      title: "Wallets and Personal Security Quiz",
      description:
        "Check your understanding of the five wallet and personal-security lessons with fifteen questions.",
    },
  },
  "crypto-exchanges-and-markets": {
    lessonContextTitle: "Exchanges Stablecoins and Market Orders",
    seo: {
      title: "Exchanges, Stablecoins and Market Orders",
      description:
        "Five complete exchange, stablecoin and market-order lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "exchanges-stablecoins-and-orders": {
    seo: {
      title: "Exchanges, Stablecoins and Market Orders",
      description:
        "Five complete exchange, stablecoin and market-order lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "crypto-exchange-markets-quiz": {
    seo: {
      title: "Exchanges Stablecoins and Market Orders Quiz",
      description:
        "Check your understanding of the five exchange, stablecoin and market-order lessons with fifteen questions.",
    },
  },
  "crypto-ethereum-and-networks": {
    lessonContextTitle: "Ethereum Contracts and Connected Networks",
    seo: {
      title: "Ethereum, Contracts and Connected Networks",
      description:
        "Five complete Ethereum, smart-contract, gas, token-standard and bridge lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "ethereum-contracts-and-connected-networks": {
    seo: {
      title: "Ethereum, Contracts and Connected Networks",
      description:
        "Five complete Ethereum, smart-contract, gas, token-standard and bridge lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "crypto-ethereum-networks-quiz": {
    seo: {
      title: "Ethereum Contracts and Connected Networks Quiz",
      description:
        "Check your understanding of Ethereum, smart contracts, gas, tokens and bridges with fifteen questions.",
    },
  },
  "crypto-tokens-and-research": {
    lessonContextTitle: "Tokens Supply and Research",
    seo: {
      title: "Tokens, Supply and Research",
      description:
        "Four complete token-category, supply, vesting and research lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "token-supply-and-research": {
    seo: {
      title: "Tokens, Supply and Research",
      description:
        "Four complete token-category, supply, vesting and research lessons with examples, practice and a fifteen-question quiz.",
    },
  },
  "crypto-token-research-quiz": {
    seo: {
      title: "Tokens Supply and Research Quiz",
      description:
        "Check your understanding of token rights, supply, valuation, vesting and evidence-based research with fifteen questions.",
    },
  },
  "crypto-defi-foundations": {
    lessonContextTitle: "DeFi Liquidity Lending and Rewards",
    seo: {
      title: "DeFi: Liquidity, Lending and Rewards",
      description:
        "Five complete DeFi lessons covering swaps, liquidity provision, lending, rewards and protocol dependencies, with practice and a fifteen-question quiz.",
    },
  },
  "defi-liquidity-lending-and-rewards": {
    seo: {
      title: "DeFi: Liquidity, Lending and Rewards",
      description:
        "Five complete DeFi lessons covering swaps, liquidity provision, lending, rewards and protocol dependencies, with practice and a fifteen-question quiz.",
    },
  },
  "crypto-defi-foundations-quiz": {
    seo: {
      title: "DeFi Liquidity Lending and Rewards Quiz",
      description:
        "Check your understanding of swaps, liquidity provision, lending, rewards and DeFi dependencies with fifteen questions.",
    },
  },
  "crypto-charts-and-evidence": {
    lessonContextTitle: "Charts Market Context and Evidence",
    seo: {
      title: "Charts, Market Context and Evidence",
      description:
        "Five complete chart and evidence lessons covering price structure, market context, derivatives data, on-chain measurements and research notes, with practice and a fifteen-question quiz.",
    },
  },
  "charts-market-context-and-evidence": {
    seo: {
      title: "Charts, Market Context and Evidence",
      description:
        "Five complete chart and evidence lessons covering price structure, market context, derivatives data, on-chain measurements and research notes, with practice and a fifteen-question quiz.",
    },
  },
  "crypto-charts-and-evidence-quiz": {
    seo: {
      title: "Charts Market Context and Evidence Quiz",
      description:
        "Check your understanding of charts, market context, derivatives, on-chain data and evidence-based research with fifteen questions.",
    },
  },
  "crypto-risk-and-portfolios": {
    lessonContextTitle: "Sizing Leverage and Portfolio Risk",
    seo: {
      title: "Sizing, Leverage and Portfolio Risk",
      description:
        "Four complete lessons covering loss budgets, leverage, portfolio dependencies, purchase schedules and records, with practice and a fifteen-question quiz.",
    },
  },
  "sizing-leverage-and-portfolio-risk": {
    seo: {
      title: "Sizing, Leverage and Portfolio Risk",
      description:
        "Four complete lessons covering loss budgets, leverage, portfolio dependencies, purchase schedules and records, with practice and a fifteen-question quiz.",
    },
  },
  "crypto-risk-and-portfolios-quiz": {
    seo: {
      title: "Sizing Leverage and Portfolio Risk Quiz",
      description:
        "Check your understanding of sizing, leverage, portfolio risk, recurring purchases and records with fifteen questions.",
    },
  },
  "crypto-planning-and-practice": {
    lessonContextTitle: "Psychology Planning and Paper Practice",
    seo: {
      title: "Psychology, Planning and Paper Practice",
      description:
        "Four complete lessons covering decision habits, written plans, honest testing and paper-practice review, with practice and a fifteen-question quiz.",
    },
  },
  "psychology-planning-and-paper-practice": {
    seo: {
      title: "Psychology, Planning and Paper Practice",
      description:
        "Four complete lessons covering decision habits, written plans, honest testing and paper-practice review, with practice and a fifteen-question quiz.",
    },
  },
  "crypto-planning-and-practice-quiz": {
    seo: {
      title: "Psychology Planning and Paper Practice Quiz",
      description:
        "Check your understanding of biases, plans, testing limits and paper-practice results with fifteen questions.",
    },
  },
  "crypto-advanced-and-graduation": {
    lessonContextTitle: "Advanced Awareness and Graduation",
    seo: {
      title: "Advanced Awareness and Graduation",
      description:
        "Four complete lessons covering network security, governance, product claims and the seven-part graduation workbook, with practice and a fifteen-question quiz.",
    },
  },
  "advanced-awareness-and-graduation": {
    seo: {
      title: "Advanced Awareness and Graduation",
      description:
        "Four complete lessons covering network security, governance, product claims and the seven-part graduation workbook, with practice and a fifteen-question quiz.",
    },
  },
  "crypto-advanced-and-graduation-quiz": {
    seo: {
      title: "Advanced Awareness and Graduation Quiz",
      description:
        "Check your understanding of security assumptions, governance, product rights and graduation evidence with fifteen questions.",
    },
  },
};
