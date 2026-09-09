import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../public-page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about PipStart's structured educational approach.",
};

export default function AboutPage() {
  return (
    <ReferencePageShell section="About">
      <article>
        <p className={styles.eyebrow}>About PipStart</p>
        <h1 className={styles.title}>
          A complete learning path that starts with understanding
        </h1>
        <p className={styles.lead}>
          PipStart is the main learning platform for structured, risk-conscious
          Forex and cryptocurrency education — built for learners who want real
          knowledge, not shortcuts.
        </p>

        <section className={styles.section}>
          <h2>Our educational purpose</h2>
          <p>
            PipStart exists to take a learner from complete beginner to
            genuinely capable — understanding terminology, market mechanics,
            risk and strategy, in that order, before any real money is involved.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What learners can expect</h2>
          <ul className={styles.checkList}>
            <li>
              <span aria-hidden="true">✓</span>
              Complete Forex and cryptocurrency learning paths, free at their
              core
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Progress tracking, calculators, a glossary and ongoing market
              analysis
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Prominent explanations of risk before any discussion of strategy
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>What PipStart does not offer</h2>
          <p>
            PipStart does not provide trading signals, personal financial
            advice, guaranteed strategies, managed trading services, or promises
            of profit.
          </p>
        </section>

        <section className={styles.card}>
          <h2>Production rollout</h2>
          <p>
            PipStart is being launched in stages. The Forex learning path,
            tools, analysis and broker information are live; the cryptocurrency
            path and full account system are still being built out.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
