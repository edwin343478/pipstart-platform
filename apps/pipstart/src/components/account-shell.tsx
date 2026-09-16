import Link from "next/link";
import type { ReactNode } from "react";

import { ReferencePageShell } from "./reference-page-shell";
import styles from "./account-shell.module.css";

type AccountShellProps = {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  navigation?: boolean;
  title: string;
};

export function AccountShell({
  children,
  description,
  eyebrow = "Learner account",
  navigation = false,
  title,
}: AccountShellProps) {
  return (
    <ReferencePageShell section="Account">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {navigation ? (
        <nav className={styles.navigation} aria-label="Account settings">
          <Link href="/account/settings">Overview</Link>
          <Link href="/account/profile">Profile</Link>
          <Link href="/account/email-preferences">Emails</Link>
          <Link href="/account/security">Security</Link>
        </nav>
      ) : null}
      {children}
    </ReferencePageShell>
  );
}
