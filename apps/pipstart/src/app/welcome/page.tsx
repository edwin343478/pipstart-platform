import type { Metadata } from "next";
import Link from "next/link";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Welcome to PipStart",
  robots: { follow: false, index: false },
};

function ChartGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 380 300"
      fill="none"
      className={styles.chartGlyph}
    >
      <line x1="0" y1="240" x2="380" y2="240" stroke="var(--border)" strokeWidth="1" />
      <rect x="24" y="176" width="18" height="64" rx="3" fill="var(--brand-accent)" fillOpacity="0.16" />
      <rect x="70" y="140" width="18" height="100" rx="3" fill="var(--brand-accent)" fillOpacity="0.22" />
      <rect x="116" y="196" width="18" height="44" rx="3" fill="var(--brand-accent)" fillOpacity="0.16" />
      <rect x="162" y="112" width="18" height="128" rx="3" fill="var(--brand-accent)" fillOpacity="0.26" />
      <rect x="208" y="150" width="18" height="90" rx="3" fill="var(--brand-accent)" fillOpacity="0.2" />
      <rect x="254" y="84" width="18" height="156" rx="3" fill="var(--brand-accent)" fillOpacity="0.3" />
      <rect x="300" y="120" width="18" height="120" rx="3" fill="var(--brand-accent)" fillOpacity="0.24" />
      <polyline
        points="33,190 79,150 125,206 171,124 217,160 263,96 309,132"
        fill="none"
        stroke="var(--brand-accent-bright)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="309" cy="132" r="6" fill="var(--brand-accent-bright)" />
    </svg>
  );
}

function WelcomeNotice() {
  return (
    <div className={styles.notice} role="status">
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={styles.noticeIcon}
      >
        <circle cx="10" cy="10" r="9" fill="#CCFBF1" />
        <path
          d="M6 10.2L8.6 12.8L14 7.2"
          stroke="#0F766E"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        You’re all set! Take learning one clear step at a time—we’ll be here
        to help you along the way.
      </span>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <ReferencePageShell section="Account">
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.iconBadge} aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <path
                d="M5.5 10.3L8.3 13L14.5 6.8"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={styles.content}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <p className={styles.eyebrow}>Learner account</p>
            </div>

            <h1 className={styles.heading}>Welcome to PipStart</h1>

            <p className={styles.subhead}>
              Your learner account is ready. You can start wherever you feel
              most curious.
            </p>

            <WelcomeNotice />

            <p className={styles.body}>
              Explore the learning paths now, or visit your account whenever
              you want to manage your profile and preferences.
            </p>

            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/start-here">
                Start learning
              </Link>
              <Link className={styles.secondaryAction} href="/dashboard">
                View my dashboard
              </Link>
            </div>

          </div>

          <div className={styles.graphic} aria-hidden="true">
            <div className={styles.graphicGlow} />
            <ChartGlyph />
          </div>
        </div>
      </div>
    </ReferencePageShell>
  );
}
