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
        <p className={styles.updated}>Last updated: 16 September 2026</p>

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
            No analytics or advertising cookies are active yet. When added, they
            will be optional and disclosed here before activation.
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
