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
          PipStart&apos;s official support channel is being prepared and will be
          published as account features roll out.
        </p>

        <div className={styles.cardStack}>
          <section className={styles.card}>
            <h2>General support</h2>
            <p>
              An official support email address will be added once the domain
              email service and security records are configured.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Privacy questions</h2>
            <p>
              Privacy enquiries and data-rights requests will receive a
              dedicated contact method before account creation is enabled.
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
