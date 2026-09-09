import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../../public-page.module.css";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of PipStart educational content.",
};

export default function TermsPage() {
  return (
    <ReferencePageShell section="Legal">
      <article>
        <p className={styles.eyebrow}>Legal information</p>
        <h1 className={`${styles.title} ${styles.legalTitle}`}>Terms of Use</h1>
        <p className={styles.updated}>Last updated: 8 September 2026</p>

        <section className={styles.legalSection}>
          <h2>Educational purpose</h2>
          <p>
            PipStart provides Forex and cryptocurrency education, including
            lessons, tools, calculators and market commentary. Nothing on
            PipStart is personalized financial, investment, tax or legal advice.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>No guaranteed outcome</h2>
          <p>
            Completing lessons, quizzes or the full learning path does not
            guarantee trading or investment success. Calculators and analysis
            are educational illustrations, not predictions.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Responsible use</h2>
          <p>
            You agree to use PipStart&apos;s content, tools and calculators for
            personal educational purposes, and to make your own independent
            decisions about any real trading or investment activity.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Affiliate relationships</h2>
          <p>
            Some broker and exchange links on PipStart are affiliate links,
            clearly disclosed where they appear. PipStart may earn a commission,
            which never determines how a partner is ranked.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Availability</h2>
          <p>
            PipStart is under active development. Features, content and tools
            may change, be added, or be temporarily unavailable while the
            platform is being built out.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Changes to these terms</h2>
          <p>
            These terms may be updated as PipStart&apos;s features develop.
            Continued use after an update means you accept the revised terms.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
