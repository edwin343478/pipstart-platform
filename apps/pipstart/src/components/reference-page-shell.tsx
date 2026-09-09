import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./reference-page-shell.module.css";

type ReferencePageShellProps = {
  children: ReactNode;
  section: "About" | "Contact" | "Legal" | "Start Here";
};

export function ReferencePageShell({
  children,
  section,
}: ReferencePageShellProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>{section}</span>
      </header>

      <main id="main-content" className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </div>
  );
}
