import type { Metadata } from "next";

export const siteUrl = "https://pipstart.net";

export type SeoEntry = {
  description: string;
  path: `/${string}` | "/";
  title: string;
};

export const seoEntries = [
  {
    path: "/",
    title: "Forex and Crypto Education",
    description:
      "Learn Forex and cryptocurrency through structured lessons, practical calculators and risk-conscious market education.",
  },
  {
    path: "/start-here",
    title: "Start Here",
    description:
      "Choose a structured PipStart learning path and begin with the foundations.",
  },
  {
    path: "/about",
    title: "About",
    description: "Learn about PipStart's structured educational approach.",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Contact information and support guidance for PipStart learners.",
  },
  {
    path: "/learn/forex",
    title: "Learn Forex",
    description:
      "Follow a structured Forex curriculum from market foundations through risk management and strategy.",
  },
  {
    path: "/learn/forex/level-1",
    title: "Forex Kindergarten",
    description:
      "Learn currency pairs, pips, lots, spreads, sessions and Forex market participants.",
  },
  {
    path: "/learn/crypto",
    title: "Learn Cryptocurrency",
    description:
      "Follow a structured cryptocurrency curriculum from Bitcoin foundations through security and risk.",
  },
  {
    path: "/learn/crypto/level-1",
    title: "Bitcoin Foundations",
    description:
      "Learn what Bitcoin is and how its decentralized network records transactions.",
  },
  {
    path: "/analysis",
    title: "Market Analysis",
    description:
      "Educational Forex and cryptocurrency market commentary designed to build understanding, not call trades.",
  },
  {
    path: "/glossary",
    title: "Forex Glossary",
    description: "Plain-language explanations of essential Forex terminology.",
  },
  {
    path: "/glossary/crypto",
    title: "Crypto Glossary",
    description:
      "Plain-language explanations of essential cryptocurrency terminology.",
  },
  {
    path: "/brokers",
    title: "Compare Forex Brokers",
    description:
      "Educational broker comparisons with transparent affiliate disclosures and risk information.",
  },
  {
    path: "/tools",
    title: "Trading Calculators",
    description:
      "Free calculators for position sizing, pip value, margin, drawdown and trading risk.",
  },
  {
    path: "/tools/position-size-calculator",
    title: "Forex Position Size Calculator",
    description:
      "Calculate a risk-based Forex position size using balance, risk percentage and stop distance.",
  },
  {
    path: "/tools/pip-value-calculator",
    title: "Pip Value Calculator",
    description:
      "Calculate the value of a pip for a Forex position and account currency.",
  },
  {
    path: "/tools/risk-reward-calculator",
    title: "Risk-to-Reward Calculator",
    description:
      "Compare potential trading loss and gain before entering a position.",
  },
  {
    path: "/tools/profit-loss-calculator",
    title: "Profit and Loss Calculator",
    description: "Estimate a trade result between entry and exit prices.",
  },
  {
    path: "/tools/margin-calculator",
    title: "Forex Margin Calculator",
    description:
      "Estimate the margin required to open a leveraged Forex position.",
  },
  {
    path: "/tools/drawdown-calculator",
    title: "Drawdown Calculator",
    description:
      "Measure account drawdown and the gain needed to recover from a loss.",
  },
  {
    path: "/tools/gain-recovery-calculator",
    title: "Gain Recovery Calculator",
    description:
      "Estimate the compounded gain and periods needed to recover a trading loss.",
  },
  {
    path: "/tools/crypto-position-size-calculator",
    title: "Crypto Position Size Calculator",
    description:
      "Calculate a cryptocurrency position size using account risk and stop distance.",
  },
  {
    path: "/tools/dollar-cost-averaging-calculator",
    title: "Dollar-Cost Averaging Calculator",
    description:
      "Explore recurring cryptocurrency purchases across changing prices.",
  },
  {
    path: "/tools/compound-growth-illustration",
    title: "Compound Growth Illustration",
    description:
      "Explore hypothetical compound growth with recurring contributions.",
  },
  {
    path: "/legal/privacy-policy",
    title: "Privacy Policy",
    description: "How PipStart handles learning progress and visitor data.",
  },
  {
    path: "/legal/terms",
    title: "Terms of Use",
    description: "Terms governing use of PipStart educational content.",
  },
  {
    path: "/legal/cookie-policy",
    title: "Cookie Policy",
    description: "Information about browser storage and cookies on PipStart.",
  },
  {
    path: "/legal/risk-disclosure",
    title: "Risk Disclosure",
    description: "Important Forex and cryptocurrency risk information.",
  },
] as const satisfies readonly SeoEntry[];

export function createPageMetadata(path: SeoEntry["path"]): Metadata {
  const entry = seoEntries.find((candidate) => candidate.path === path);
  if (!entry) throw new Error(`Missing SEO entry for ${path}`);

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: entry.path },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "website",
      url: entry.path,
      siteName: "PipStart",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
  };
}

export function createDynamicMetadata(entry: SeoEntry): Metadata {
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: entry.path },
    openGraph: {
      ...entry,
      type: "article",
      url: entry.path,
      siteName: "PipStart",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
  };
}
