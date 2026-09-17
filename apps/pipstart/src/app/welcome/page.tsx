import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Welcome to PipStart",
  robots: { follow: false, index: false },
};

export default function WelcomePage() {
  return (
    <AccountShell
      description="Your learner account is ready. You can start wherever you feel most curious."
      title="Welcome to PipStart"
    >
      <div className={styles.notice} role="status">
        You’re all set! Take learning one clear step at a time—we’ll be here to
        help you along the way.
      </div>
      <p>
        Explore the learning paths now, or visit your account whenever you want
        to manage your profile and preferences.
      </p>
      <div className={styles.actions}>
        <Link className={styles.primaryAction} href="/start-here">
          Start learning
        </Link>
        <Link className={styles.secondaryAction} href="/dashboard">
          View my dashboard
        </Link>
      </div>
    </AccountShell>
  );
}
