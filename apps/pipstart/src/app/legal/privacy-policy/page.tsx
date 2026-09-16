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
        <p className={styles.updated}>Last updated: 16 September 2026</p>

        <section className={styles.legalSection}>
          <h2>Current production data handling</h2>
          <p>
            PipStart stores anonymous lesson progress locally on your device. If
            you create an account, we also store your email address, display
            name, role, email preferences, enrollment, lesson completion and
            recent learning activity. Broker and exchange links may be tracked
            for affiliate attribution when clicked.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Information we collect</h2>
          <p>
            We collect the account details you provide, authentication and
            security records needed to protect the service, and the email
            preferences you select. When you sign in, valid anonymous progress
            can be imported for cross-device synchronization.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>How the information will be used</h2>
          <p>
            To create and secure your learner account, provide account settings,
            synchronize learning progress, deliver messages you request, and
            respect your communication choices.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Your choices</h2>
          <p>
            Local progress can be cleared by clearing your browser&apos;s site
            data. Signed-in learners can edit their profile, change optional
            email preferences, end sessions, change their password, or delete
            their account from Account settings.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Retention and deletion</h2>
          <p>
            Account deletion removes the authentication account and its linked
            PipStart profile, preferences, enrollment, progress and learning
            events. Records that must be retained for security, fraud
            prevention, or legal compliance may be retained only for the period
            required. Local progress must be cleared separately from the
            learner&apos;s browser.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
