import Link from "next/link";

import styles from "./page.module.css";

type ToolIcon =
  | "compound"
  | "crypto-position-size"
  | "drawdown"
  | "dca"
  | "gain-recovery"
  | "margin"
  | "pip-value"
  | "position-size"
  | "profit-loss"
  | "risk-reward";

type Tool = {
  description: string;
  href?: string;
  icon: ToolIcon;
  name: string;
};

const tools: Tool[] = [
  {
    name: "Position Size Calculator",
    description: "Find how many units to trade based on your risk per trade.",
    href: "/tools/position-size-calculator",
    icon: "position-size",
  },
  {
    name: "Pip Value Calculator",
    description: "See what each pip is worth in your account's currency.",
    href: "/tools/pip-value-calculator",
    icon: "pip-value",
  },
  {
    name: "Risk-to-Reward Calculator",
    description:
      "Compare your potential loss against your potential gain before entering.",
    href: "/tools/risk-reward-calculator",
    icon: "risk-reward",
  },
  {
    name: "Profit-and-Loss Calculator",
    description: "Estimate the result between your entry and exit prices.",
    href: "/tools/profit-loss-calculator",
    icon: "profit-loss",
  },
  {
    name: "Margin Calculator",
    description: "Work out the margin required to open a leveraged position.",
    href: "/tools/margin-calculator",
    icon: "margin",
  },
  {
    name: "Drawdown Calculator",
    description: "See how much gain is needed to recover from a given loss.",
    href: "/tools/drawdown-calculator",
    icon: "drawdown",
  },
  {
    name: "Gain-Recovery Calculator",
    description: "Estimate the gain required to recover from a trading loss.",
    href: "/tools/gain-recovery-calculator",
    icon: "gain-recovery",
  },
  {
    name: "Crypto Position-Size Calculator",
    description: "Size a crypto position using account risk and stop distance.",
    href: "/tools/crypto-position-size-calculator",
    icon: "crypto-position-size",
  },
  {
    name: "Dollar-Cost-Averaging Calculator",
    description: "Explore recurring crypto purchases across changing prices.",
    href: "/tools/dollar-cost-averaging-calculator",
    icon: "dca",
  },
  {
    name: "Compound-Growth Illustration",
    description:
      "Explore hypothetical compounding with recurring contributions.",
    href: "/tools/compound-growth-illustration",
    icon: "compound",
  },
];

function CalculatorIcon({ type }: { type: ToolIcon }) {
  if (type === "position-size") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M4 10.5 8 14.5 16 6M3 3h6.5L17 10.5" />
      </svg>
    );
  }

  if (type === "pip-value") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6.5V10l2.5 1.5" />
      </svg>
    );
  }

  if (type === "risk-reward") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M5 15v-4M10 15V7M15 15V3" />
      </svg>
    );
  }

  if (type === "margin") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 8h6M7 11h4M7 14h2" />
      </svg>
    );
  }

  if (type === "drawdown") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="m3 15 4-4 3 2 5-7 2 2" />
      </svg>
    );
  }

  if (type === "profit-loss") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="m3 14 4-4 3 2 5-6M12 6h3v3" />
      </svg>
    );
  }

  if (type === "gain-recovery") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M4 9a6 6 0 1 1 1.5 5M4 9V5m0 4h4" />
      </svg>
    );
  }

  if (type === "crypto-position-size") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 2 16 6v8l-6 4-6-4V6l6-4Zm0 4v8M7.5 7.5h4a1.5 1.5 0 0 1 0 3h-4m0 0h4a1.5 1.5 0 0 1 0 3h-4" />
      </svg>
    );
  }

  if (type === "compound") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M4 15V9M8 15V6M12 15V4M16 15V2M3 15h14" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m3 17 3-9 3 5 3-11 3 15" />
    </svg>
  );
}

function ToolContent({ tool }: { tool: Tool }) {
  return (
    <>
      <CalculatorIcon type={tool.icon} />
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
    </>
  );
}

export default function ToolsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Tools</span>
      </header>

      <section className={styles.introduction}>
        <h1>Trading Calculators</h1>
        <p>
          Practical tools for the numbers every level teaches. No signup
          required.
        </p>
      </section>

      <section className={styles.tools} aria-label="Trading calculators">
        {tools.map((tool) =>
          tool.href ? (
            <Link className={styles.tool} href={tool.href} key={tool.name}>
              <ToolContent tool={tool} />
            </Link>
          ) : (
            <article
              className={`${styles.tool} ${styles.comingSoon}`}
              key={tool.name}
            >
              <ToolContent tool={tool} />
            </article>
          ),
        )}
      </section>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
