import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/admin-preview/icons";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff.module.css";

function NavLink({
  href,
  icon,
  redesigned,
  current = false,
  prefetch,
  children,
}: {
  href: string;
  icon: IconName;
  redesigned: boolean;
  current?: boolean;
  prefetch?: false;
  children: ReactNode;
}) {
  return (
    <Link
      className={redesigned ? styles.navLink : styles.link}
      href={href}
      prefetch={prefetch}
      aria-current={current ? "page" : undefined}
    >
      {redesigned && <Icon name={icon} />}
      {children}
    </Link>
  );
}

// Reuse the approved visual tokens, not the sample shell's identity/counts or
// role-dependent fixture navigation. Only implemented destinations are linked.
export function StaffFrame({
  children,
  verified = false,
  people = false,
  audit = false,
  content = false,
  maintenance = false,
  paused = false,
  appearance,
}: {
  children: ReactNode;
  verified?: boolean;
  people?: boolean;
  audit?: boolean;
  content?: boolean;
  /** MP10c: the Maintenance section (review worklists and link checks). */
  maintenance?: boolean;
  paused?: boolean;
  /** Opts a redesigned page into the new shell; the value names that page. */
  appearance?: "access" | "overview" | "content";
}) {
  const redesigned = appearance !== undefined;
  const status = paused
    ? "Staff access is paused. Only Owner maintenance is available."
    : verified
      ? "Staff session verified"
      : "Verify your identity before staff access.";

  return (
    <div
      className={`${s.root} ${styles.root}${redesigned ? ` ${styles.accessFrame}` : ""}`}
    >
      <a className={styles.skip} href="#staff-main">
        Skip to staff content
      </a>
      <header className={redesigned ? styles.top : s.top}>
        <Link className={redesigned ? styles.brand : s.brand} href="/">
          PipStart<span className={styles.dot}>.</span>
        </Link>
        <span className={redesigned ? styles.section : s.section}>
          <Icon name="shield" />
          Administration
        </span>
        <Link
          className={
            redesigned ? styles.topAction : `${s.right} ${styles.link}`
          }
          href="/dashboard"
        >
          Learner dashboard
          {redesigned && <Icon name="chevR" />}
        </Link>
      </header>
      <div className={styles.body}>
        <aside className={redesigned ? styles.accessSide : styles.side}>
          <nav
            className={redesigned ? styles.nav : undefined}
            aria-label="Staff navigation"
          >
            {redesigned && (
              <p className={styles.navLabel} aria-hidden="true">
                Staff area
              </p>
            )}
            {/* Paused maintenance must not point at the closed staff entry. */}
            {paused ? (
              <NavLink
                redesigned={redesigned}
                href="/admin/maintenance"
                icon="server"
                current
              >
                Owner maintenance
              </NavLink>
            ) : verified ? (
              <NavLink
                redesigned={redesigned}
                href="/admin/staff"
                icon="home"
                current={appearance === "overview"}
              >
                Overview
              </NavLink>
            ) : (
              <NavLink
                redesigned={redesigned}
                href="/admin/access"
                icon="shield"
              >
                Staff verification
              </NavLink>
            )}
            {verified && !paused && content && (
              <NavLink
                redesigned={redesigned}
                href="/admin/staff/content"
                icon="book"
                prefetch={false}
                current={appearance === "content"}
              >
                Content library
              </NavLink>
            )}
            {verified && !paused && maintenance && (
              <NavLink
                redesigned={redesigned}
                href="/admin/staff/maintenance"
                icon="list"
                prefetch={false}
              >
                Maintenance
              </NavLink>
            )}
            {verified && people && (
              <NavLink
                redesigned={redesigned}
                href="/admin/staff/people"
                icon="users"
              >
                People
              </NavLink>
            )}
            {verified && audit && (
              <NavLink
                redesigned={redesigned}
                href="/admin/staff/audit"
                icon="clock"
                prefetch={false}
              >
                Staff audit
              </NavLink>
            )}
          </nav>
          {redesigned ? (
            <p className={styles.sideStatus}>
              <Icon name={verified && !paused ? "check" : "lock"} />
              <span>{status}</span>
            </p>
          ) : (
            <p className={s.muted}>{status}</p>
          )}
        </aside>
        <main className={styles.main} id="staff-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
