import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../../public-page.module.css";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information about browser storage and cookies on PipStart.",
};

export default function CookiePolicyPage() {
  return (
    <ReferencePageShell section="Legal">
      <article>
        <p className={styles.eyebrow}>Legal information</p>
        <h1 className={`${styles.title} ${styles.legalTitle}`}>
          Cookie Policy
        </h1>
        <p className={styles.updated}>Last updated: 9 October 2026</p>

        <section className={styles.legalSection}>
          <h2>Current website</h2>
          <p>
            PipStart uses local storage for anonymous lesson progress and
            essential cookies to maintain signed-in learner sessions.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Essential technologies</h2>
          <p>
            Local storage remembers anonymous completion. When you sign in,
            valid progress is imported and removed locally only after the server
            confirms persistence.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Analytics and optional technologies</h2>
          <p>
            PipStart has not added its own analytics or advertising cookies. The
            economic calendar is a third-party TradingView embed, loaded when
            its calendar area comes into view. TradingView may use cookies or
            browser storage under its own policies; browser settings can block
            these and may prevent the widget working. Static explanations and
            official-source links remain available. See our{" "}
            <a href="/legal/privacy-policy">privacy policy</a> and the{" "}
            <a
              href="https://www.tradingview.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TradingView privacy policy
            </a>
            .
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Policy updates</h2>
          <p>
            This policy will be updated as soon as any cookie-based technology
            is introduced, with a revised &quot;last updated&quot; date above.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
