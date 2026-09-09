import type { Metadata } from "next";
import Link from "next/link";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "Choose a structured PipStart learning path and begin with the foundations.",
};

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
      <article>
        <p className={styles.eyebrow}>Your learning starts here</p>
        <h1>Build knowledge before risking money</h1>
        <p className={styles.lead}>
          PipStart gives you a clear route through Forex and cryptocurrency
          education. Choose a path, work through it in order, and use the tools
          when a lesson introduces a new number or idea.
        </p>

        <div className={styles.pathGrid}>
          <section className={styles.pathCard}>
            <p>New to currency markets?</p>
            <h2>Start with Forex</h2>
            <span>
              Learn currency pairs, pips, lots, spreads and the people who move
              the market.
            </span>
            <Link href="/learn/forex">Open the Forex path →</Link>
          </section>

          <section className={styles.pathCard}>
            <p>New to digital assets?</p>
            <h2>Start with Crypto</h2>
            <span>
              Learn Bitcoin, blockchain, wallets, exchanges and the risks unique
              to digital assets.
            </span>
            <Link href="/learn/crypto">Open the Crypto path →</Link>
          </section>
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
          <strong>Education, not a signal service.</strong> PipStart does not
          tell you what to buy or sell and does not guarantee outcomes. Markets
          can move against you, and leverage can make losses larger.
        </aside>
      </article>
    </ReferencePageShell>
  );
}
