import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../../public-page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PipStart handles learning progress and visitor data.",
};

export default function PrivacyPolicyPage() {
  return (
    <ReferencePageShell section="Legal">
      <article>
        <p className={styles.eyebrow}>Legal information</p>
        <h1 className={`${styles.title} ${styles.legalTitle}`}>
          Privacy Policy
        </h1>
        <p className={styles.updated}>Last updated: 8 September 2026</p>

        <section className={styles.legalSection}>
          <h2>Current production data handling</h2>
          <p>
            PipStart currently stores your lesson progress locally on your own
            device. Broker and exchange links are tracked for affiliate purposes
            when clicked. No account system or server-side learner profile is
            active yet.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Information we collect</h2>
          <p>
            Today: local progress data stored in your browser only. When
            accounts launch, PipStart expects to collect an email address,
            learning progress, and quiz results tied to your account.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>How the information will be used</h2>
          <p>
            To resume your learning progress across sessions, to show which
            lessons and quizzes you&apos;ve completed, and to measure which
            content is actually helping learners.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Your choices</h2>
          <p>
            Local progress can be cleared at any time by clearing your
            browser&apos;s site data. Account-level controls will be added once
            accounts launch.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Retention and deletion</h2>
          <p>
            Locally stored progress remains only on your device and is never
            transmitted to PipStart&apos;s servers in the current version.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
