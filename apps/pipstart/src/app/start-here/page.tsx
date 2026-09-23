import type { Metadata } from "next";
import Link from "next/link";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "Choose a structured PipStart learning path and begin with the foundations.",
};

function ExchangeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 8H14M14 8L11 5M14 8L11 11"
        stroke="var(--brand-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 13H6M6 13L9 10M6 13L9 16"
        stroke="var(--brand-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BlockchainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="var(--brand-accent)" strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="var(--brand-accent)" strokeWidth="1.5" />
      <path d="M8 10L10 8" stroke="var(--brand-accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4L17 15.5H3L10 4Z"
        stroke="#B45309"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="9.25" y="8.5" width="1.5" height="4" rx="0.75" fill="#B45309" />
      <rect x="9.25" y="13" width="1.5" height="1.5" rx="0.75" fill="#B45309" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8 5L13 10L8 15"
        stroke="var(--brand-accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const paths = [
  {
    href: "/learn/forex",
    icon: <ExchangeIcon />,
    eyebrow: "New to currency markets?",
    title: "Start with Forex",
    description:
      "Learn currency pairs, pips, lots, spreads and the people who move the market.",
    cta: "Open the Forex path",
  },
  {
    href: "/learn/crypto",
    icon: <BlockchainIcon />,
    eyebrow: "New to digital assets?",
    title: "Start with Crypto",
    description:
      "Learn Bitcoin, blockchain, wallets, exchanges and the risks unique to digital assets.",
    cta: "Open the Crypto path",
  },
] as const;

const steps = [
  {
    title: "Choose one market",
    description:
      "Start with Forex or cryptocurrency. Learning one foundation at a time makes unfamiliar ideas easier to connect.",
  },
  {
    title: "Follow the lessons in order",
    description:
      "Each level builds on the last. Use the glossary whenever you meet an unfamiliar term.",
  },
  {
    title: "Practise the numbers",
    description:
      "Use PipStart calculators to explore position size, risk, margin and growth without placing a trade.",
  },
  {
    title: "Understand the risk",
    description:
      "Read the risk disclosure before considering real money. Education does not remove market risk.",
  },
] as const;

export default function StartHerePage() {
  return (
    <ReferencePageShell section="Start Here">
      <div className={styles.pageBleed}>
        <div className={styles.pageInner}>
          <article className={styles.article}>
            <div className={styles.hero}>
              <div className={styles.eyebrowRow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                <span className={styles.eyebrow}>Your learning starts here</span>
              </div>
              <h1>Build knowledge before risking money</h1>
              <p className={styles.lead}>
                PipStart gives you a clear route through Forex and
                cryptocurrency education. Choose a path, work through it in
                order, and use the tools when a lesson introduces a new
                number or idea.
              </p>
            </div>

            <div className={styles.pathGrid}>
              {paths.map((path) => (
                <section className={styles.pathCard} key={path.href}>
                  <span className={styles.iconBadge} aria-hidden="true">
                    {path.icon}
                  </span>
                  <p className={styles.pathEyebrow}>{path.eyebrow}</p>
                  <h2>{path.title}</h2>
                  <span className={styles.pathDescription}>
                    {path.description}
                  </span>
                  <Link className={styles.pathLink} href={path.href}>
                    {path.cta}
                    <ArrowIcon />
                  </Link>
                </section>
              ))}
            </div>

            <section className={styles.steps}>
              <h2>A simple learning order</h2>
              <ol>
                {steps.map((step, index) => (
                  <li key={step.title}>
                    <span aria-hidden="true">{index + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <aside className={styles.notice}>
              <span className={styles.noticeIcon} aria-hidden="true">
                <WarningIcon />
              </span>
              <p>
                <strong>Education, not a signal service.</strong> PipStart
                does not tell you what to buy or sell and does not guarantee
                outcomes. Markets can move against you, and leverage can make
                losses larger.
              </p>
            </aside>
          </article>
        </div>
      </div>
    </ReferencePageShell>
  );
}
