import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../../public-page.module.css";

export const metadata: Metadata = {
  title: "Risk Disclosure",
  description: "Important Forex and cryptocurrency risk information.",
};

export default function RiskDisclosurePage() {
  return (
    <ReferencePageShell section="Legal">
      <article>
        <p className={styles.eyebrow}>Legal information</p>
        <h1 className={`${styles.title} ${styles.legalTitle}`}>
          Risk Disclosure
        </h1>
        <p className={styles.updated}>Last updated: 8 September 2026</p>

        <aside className={styles.riskNotice}>
          <p>
            <strong>
              Forex and cryptocurrency trading both carry substantial risk of
              loss.
            </strong>{" "}
            Nothing on PipStart guarantees a financial outcome.
          </p>
        </aside>

        <section className={styles.legalSection}>
          <h2>Leverage can increase losses</h2>
          <p>
            Leveraged Forex and crypto positions can lose more than the amount
            deposited. Leverage magnifies both gains and losses, often faster
            than beginners expect.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Cryptocurrency-specific risk</h2>
          <p>
            Cryptocurrency prices can be highly volatile, and losses from wallet
            mismanagement, exchange failure or scams can be permanent and
            unrecoverable.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Education is not advice</h2>
          <p>
            PipStart&apos;s lessons, tools and analysis are general education
            only. They do not account for your personal financial situation and
            are not personalized investment advice.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>No signals or profit guarantees</h2>
          <p>
            PipStart does not provide trading signals, managed accounts, or any
            promise of profit. Be cautious of anyone who claims otherwise while
            referencing PipStart.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Make independent decisions</h2>
          <p>
            Any decision to trade or invest is yours alone. Consider consulting
            a licensed financial professional before risking real money.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
