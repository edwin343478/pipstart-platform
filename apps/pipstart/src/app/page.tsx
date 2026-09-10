import Link from "next/link";

import { createPageMetadata } from "../lib/seo";
import styles from "./page.module.css";

export const metadata = createPageMetadata("/");

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.checkIcon}>
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

function ResourceIcon({
  type,
}: {
  type: "analysis" | "brokers" | "glossary" | "tools";
}) {
  if (type === "glossary")
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M3 3h6.5L17 10.5 10.5 17 3 10.5V3Z" />
      </svg>
    );
  if (type === "tools")
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 8h6M7 11h4" />
      </svg>
    );
  if (type === "analysis")
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="m3 15 4-4 3 2 5-7 2 2" />
      </svg>
    );
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M3 10h4l2-6 2 12 2-6h4" />
    </svg>
  );
}

const resources = [
  { href: "/glossary", label: "Glossary", type: "glossary" as const },
  { href: "/tools", label: "Calculators", type: "tools" as const },
  { href: "/analysis", label: "Analysis", type: "analysis" as const },
  { href: "/brokers", label: "Brokers", type: "brokers" as const },
];

const heroTrustPoints = [
  "Core lessons stay free",
  "No trading signals",
  "Affiliate partners always disclosed",
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <nav className={styles.navigation} aria-label="Primary navigation">
          <Link href="/start-here">Start Here</Link>
          <Link href="/learn/forex">Learn Forex</Link>
          <Link href="/learn/crypto">Learn Crypto</Link>
          <Link className={styles.analysisLink} href="/analysis">
            Analysis
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/brokers">Brokers</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <p>Structured Forex &amp; crypto education</p>
        <h1>Learn markets with structure, not shortcuts.</h1>
        <div className={styles.heroDescription}>
          A complete, free learning path — from what a currency pair is to
          building your own risk-managed trading plan.
        </div>
        <ul className={styles.heroTrust}>
          {heroTrustPoints.map((point) => (
            <li key={point}>
              <CheckIcon />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.schools} aria-label="Learning paths">
        <article className={styles.glowWrap}>
          <div className={styles.glowRing} aria-hidden="true" />
          <div className={styles.schoolCard}>
            <p>New to forex?</p>
            <h2>School of Forex</h2>
            <div>
              11 levels, from complete beginner to advanced strategy — at your
              own pace.
            </div>
            <Link href="/learn/forex/level-1">Start Forex Level 1 →</Link>
          </div>
        </article>
        <article className={styles.glowWrap}>
          <div className={styles.glowRing} aria-hidden="true" />
          <div className={styles.schoolCard}>
            <p>New to crypto?</p>
            <h2>School of Crypto</h2>
            <div>
              10 levels covering Bitcoin, wallets, exchanges and DeFi risk.
            </div>
            <Link href="/learn/crypto/level-1">Start Crypto Level 1 →</Link>
          </div>
        </article>
      </section>

      <nav className={styles.resources} aria-label="Learning resources">
        {resources.map((resource) => (
          <Link href={resource.href} key={resource.href}>
            <ResourceIcon type={resource.type} />
            <span>{resource.label}</span>
          </Link>
        ))}
      </nav>

      <footer className={styles.footer}>
        <span>PipStart · pipstart.net</span>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy-policy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/cookie-policy">Cookies</Link>
          <Link href="/legal/risk-disclosure">Risk disclosure</Link>
        </nav>
      </footer>
    </main>
  );
}
