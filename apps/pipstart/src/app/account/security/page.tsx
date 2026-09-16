import Link from "next/link";

import { logoutAction } from "@/app/account/actions";
import { ChangePasswordForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";

import styles from "../account.module.css";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireUser("/account/security");
  const { notice } = await searchParams;
  return (
    <AccountShell
      description="Update your password and control active sessions."
      navigation
      title="Security"
    >
      {notice === "password-updated" ? (
        <div className={styles.notice}>Password updated.</div>
      ) : null}
      {notice === "other-sessions-ended" ? (
        <div className={styles.notice}>
          Other sessions have been signed out.
        </div>
      ) : null}
      <section className={styles.section}>
        <h2>Change password</h2>
        <ChangePasswordForm />
      </section>
      <section className={styles.section}>
        <h2>Sessions</h2>
        <p>
          End sessions on other devices, or sign out everywhere including this
          browser.
        </p>
        <form action={logoutAction}>
          <input name="scope" type="hidden" value="others" />
          <button className={styles.secondaryButton}>
            Sign out other sessions
          </button>
        </form>
        <form action={logoutAction}>
          <input name="scope" type="hidden" value="global" />
          <button className={styles.secondaryButton}>
            Sign out everywhere
          </button>
        </form>
      </section>
      <div className={styles.dangerNotice}>
        <h2>Delete account</h2>
        <p>
          Permanently remove your PipStart learner account and associated
          account preferences.
        </p>
        <Link href="/account/delete">Go to account deletion</Link>
      </div>
    </AccountShell>
  );
}
