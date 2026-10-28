import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/admin-preview/icons";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff.module.css";

// Reuse the approved visual tokens, not the sample shell's identity/counts or
// role-dependent fixture navigation. Only implemented destinations are linked.
export function StaffFrame({
  children,
  verified = false,
  people = false,
  audit = false,
  paused = false,
}: {
  children: ReactNode;
  verified?: boolean;
  people?: boolean;
  audit?: boolean;
  paused?: boolean;
}) {
  return (
    <div className={`${s.root} ${styles.root}`}>
      <a className={styles.skip} href="#staff-main">
        Skip to staff content
      </a>
      <header className={s.top}>
        <Link className={s.brand} href="/">
          PipStart<span className={styles.dot}>.</span>
        </Link>
        <span className={s.section}>
          <Icon name="shield" />
          Administration
        </span>
        <Link className={`${s.right} ${styles.link}`} href="/dashboard">
          Learner dashboard
        </Link>
      </header>
      <div className={styles.body}>
        <aside className={styles.side}>
          <nav aria-label="Staff navigation">
            {/* Paused maintenance must not point at the closed staff entry. */}
            {paused ? (
              <Link
                className={styles.link}
                href="/admin/maintenance"
                aria-current="page"
              >
                Owner maintenance
              </Link>
            ) : (
              <Link
                className={styles.link}
                href={verified ? "/admin/staff" : "/admin/access"}
              >
                {verified ? "Overview" : "Staff verification"}
              </Link>
            )}
            {verified && people && (
              <Link className={styles.link} href="/admin/staff/people">
                People
              </Link>
            )}
            {verified && audit && (
              <Link
                className={styles.link}
                href="/admin/staff/audit"
                prefetch={false}
              >
                Staff audit
              </Link>
            )}
          </nav>
          <p className={s.muted}>
            {paused
              ? "Staff access is paused. Only Owner maintenance is available."
              : verified
                ? "Staff session verified"
                : "Verify your identity before staff access."}
          </p>
        </aside>
        <main className={styles.main} id="staff-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
