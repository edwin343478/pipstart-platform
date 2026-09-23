import Link from "next/link";

import styles from "./account-nav.module.css";

const links = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "overview", href: "/account/settings", label: "Overview" },
  { key: "profile", href: "/account/profile", label: "Profile" },
  { key: "emails", href: "/account/email-preferences", label: "Emails" },
  { key: "security", href: "/account/security", label: "Security" },
] as const;

type AccountNavKey = (typeof links)[number]["key"];

export function AccountNav({ active }: { active: AccountNavKey }) {
  return (
    <nav aria-label="Learner account" className={styles.nav}>
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          aria-current={link.key === active ? "page" : undefined}
          className={link.key === active ? styles.linkActive : styles.link}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
