import type { ReactNode } from "react";

import { CompactFooter, CompactHeader } from "./site-chrome";
import styles from "./reference-page-shell.module.css";

type ReferencePageShellProps = {
  children: ReactNode;
  section: "About" | "Authors" | "Contact" | "Legal" | "Start Here";
};

export function ReferencePageShell({
  children,
  section,
}: ReferencePageShellProps) {
  return (
    <div className={styles.page}>
      <CompactHeader
        brandClassName={styles.brand}
        className={styles.header}
        section={section}
      />

      <main id="main-content" className={styles.main}>
        {children}
      </main>

      <CompactFooter className={styles.footer} />
    </div>
  );
}
