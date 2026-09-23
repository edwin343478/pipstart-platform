import type { Metadata } from "next";
import Link from "next/link";

import { AccountNav } from "@/components/account-nav";
import { ReferencePageShell } from "@/components/reference-page-shell";
import { requireUser } from "@/lib/auth/session";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { follow: false, index: false },
};

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7.5" r="2.8" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <path
        d="M4.5 15.5C5.5 12.5 7.5 11 10 11C12.5 11 14.5 12.5 15.5 15.5"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="5.5" width="12" height="9" rx="1.5" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <path
        d="M4.5 6.5L10 10.5L15.5 6.5"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3.5L15.5 5.5V9.5C15.5 13 13 15.5 10 16.5C7 15.5 4.5 13 4.5 9.5V5.5L10 3.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.7 10L9.2 11.5L12.5 8"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4H10V16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
      />
      <path
        d="M16 5.5C16 4.67 15.33 4 14.5 4H10V16H14.5C15.33 16 16 15.33 16 14.5V5.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#CCFBF1" />
      <rect x="9.25" y="8.5" width="1.5" height="5" rx="0.75" fill="#0F766E" />
      <rect x="9.25" y="5.75" width="1.5" height="1.5" rx="0.75" fill="#0F766E" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className={styles.chevron}
      aria-hidden="true"
    >
      <path
        d="M8 5L13 10L8 15"
        stroke="#C7D0D6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const overviewCards = [
  {
    href: "/account/profile",
    icon: <PersonIcon />,
    title: "Profile",
    description: "Choose how your name appears in PipStart.",
  },
  {
    href: "/account/email-preferences",
    icon: <EnvelopeIcon />,
    title: "Email preferences",
    description: "Control optional learning and product emails.",
  },
  {
    href: "/account/security",
    icon: <ShieldIcon />,
    title: "Security",
    description: "Change your password or manage signed-in sessions.",
  },
  {
    href: "/dashboard",
    icon: <BookIcon />,
    title: "Learning progress",
    description: "Review your progress and continue where you left off.",
  },
];

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireUser("/account/settings");
  const { notice } = await searchParams;

  return (
    <ReferencePageShell section="Account">
      <div className={styles.pageBleed}>
        <div className={styles.pageInner}>
          <div className={styles.heading}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <span className={styles.eyebrow}>Learner account</span>
            </div>
            <h1>Account settings</h1>
            <p>Signed in as {user.email ?? "a PipStart learner"}.</p>
          </div>

          <AccountNav active="overview" />

          {notice === "not-authorized" ? (
            <div className={styles.notice} role="status">
              <span className={styles.noticeIcon} aria-hidden="true">
                <InfoIcon />
              </span>
              <span>Your account does not have administrator access.</span>
            </div>
          ) : null}

          <div className={styles.grid}>
            {overviewCards.map((card) => (
              <Link className={styles.card} href={card.href} key={card.href}>
                <span className={styles.iconBadge} aria-hidden="true">
                  {card.icon}
                </span>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                <ChevronIcon />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ReferencePageShell>
  );
}
