import type { Metadata } from "next";
import Link from "next/link";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../public-page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact information and support guidance for PipStart learners.",
};

export default function ContactPage() {
  return (
    <ReferencePageShell section="Contact">
      <article>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.title}>How to contact PipStart</h1>
        <p className={styles.lead}>
          Contact PipStart for learner support, privacy questions or help with
          your email preferences.
        </p>

        <div className={styles.cardStack}>
          <section className={styles.card}>
            <h2>General support</h2>
            <p>
              Email{" "}
              <a href="mailto:support@pipstart.net">support@pipstart.net</a>. We
              receive and reply to support messages through this mailbox.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Privacy questions</h2>
            <p>
              Send privacy enquiries and data-rights requests to{" "}
              <a href="mailto:support@pipstart.net">support@pipstart.net</a>.
              Describe your request without including passwords, reset links or
              other sensitive credentials. We may need to verify account
              ownership before handling an account-specific request.
            </p>
            <Link href="/legal/privacy-policy">Read the Privacy Policy</Link>
          </section>

          <section className={`${styles.card} ${styles.warning}`}>
            <h2>Do not send financial account information</h2>
            <p>
              PipStart will never need a trading password, banking password,
              private key, seed phrase, or remote access to a learner&apos;s
              device.
            </p>
          </section>
        </div>
      </article>
    </ReferencePageShell>
  );
}
