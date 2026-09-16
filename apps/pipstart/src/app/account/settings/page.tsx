import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";

import styles from "../account.module.css";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireUser();
  const { notice } = await searchParams;
  return (
    <AccountShell
      description={`Signed in as ${user.email ?? "a PipStart learner"}.`}
      navigation
      title="Account settings"
    >
      {notice === "not-authorized" ? (
        <div className={styles.notice}>
          Your account does not have administrator access.
        </div>
      ) : null}
      <div className={styles.grid}>
        <Link className={styles.card} href="/account/profile">
          <h2>Profile</h2>
          <p>Choose how your name appears in PipStart.</p>
        </Link>
        <Link className={styles.card} href="/account/email-preferences">
          <h2>Email preferences</h2>
          <p>Control optional learning and product emails.</p>
        </Link>
        <Link className={styles.card} href="/account/security">
          <h2>Security</h2>
          <p>Change your password or manage signed-in sessions.</p>
        </Link>
        <Link className={styles.card} href="/start-here">
          <h2>Continue learning</h2>
          <p>Return to the Forex and Crypto learning paths.</p>
        </Link>
      </div>
    </AccountShell>
  );
}
