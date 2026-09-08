import Link from "next/link";

import styles from "./page.module.css";

type ToolIcon =
  "drawdown" | "dca" | "margin" | "pip-value" | "position-size" | "risk-reward";

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
    name: "Dollar-Cost-Averaging Calculator",
    description: "Explore recurring crypto purchases across changing prices.",
    href: "/tools/dollar-cost-averaging-calculator",
    icon: "dca",
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
