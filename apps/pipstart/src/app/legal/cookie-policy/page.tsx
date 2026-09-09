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
        <p className={styles.updated}>Last updated: 8 September 2026</p>

        <section className={styles.legalSection}>
          <h2>Current website</h2>
          <p>
            PipStart currently uses browser local storage, not cookies, to save
            your lesson progress on this device. This policy will expand as
            account features and analytics are added.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Essential technologies</h2>
          <p>
            Local storage is used to remember which lessons you&apos;ve
            completed. This stays on your device and is never transmitted to
            PipStart&apos;s servers in the current version.
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
