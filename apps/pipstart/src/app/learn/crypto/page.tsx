"use client";

import Link from "next/link";
import { useState } from "react";

import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import styles from "./page.module.css";

const cryptoLevels = [
  {
    title: "Orientation and Safety",
    description:
      "Learn what crypto is, compare ownership and trading, understand loss mechanisms and practise spotting scams without funding an account.",
  },
  {
    title: "Bitcoin and Shared Ledgers",
    description:
      "Bitcoin, blockchain records, transactions, mining, proof of work, supply and signatures.",
  },
  {
    title: "Wallets and Personal Security",
    description:
      "Wallet control, recovery phrases, backups, phishing, malware and recovery planning.",
  },
  {
    title: "Exchanges, Stablecoins and Market Orders",
    description:
      "Exchange types, orders, costs, liquidity, slippage, stablecoins and provider risk.",
  },
  {
    title: "Ethereum, Contracts and Connected Networks",
    description:
      "Ethereum, contracts, gas, tokens, layer-two networks and bridge risks.",
  },
  {
    title: "Tokens, Supply and Research",
    description:
      "Token supply, allocations, vesting, unlocks, incentives and evidence-based research.",
  },
  {
    title: "DeFi: Liquidity, Lending and Rewards",
    description:
      "Liquidity pools, lending, staking, rewards, oracles and contract risks.",
  },
  {
    title: "Charts, Market Context and Evidence",
    description:
      "Charts, market cycles, derivatives data, on-chain evidence and their limitations.",
  },
  {
    title: "Sizing, Leverage and Portfolio Risk",
    description:
      "Position sizing, concentration, leverage, custody, rebalancing and records.",
  },
  {
    title: "Psychology, Planning and Paper Practice",
    description:
      "Decision habits, planning, journals and realistic practice with fictional funds.",
  },
  {
    title: "Advanced Awareness and Graduation",
    description:
      "Network security, governance, research limitations and a graduation dossier.",
  },
];

export default function LearnCryptoPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Learn Crypto" />

      <section className={styles.introduction}>
        <span>Curriculum</span>
        <h1>Cryptocurrency Foundation Path</h1>
        <p>
          Eleven levels, from absolute beginner to advanced cryptocurrency
          concepts. Work through them in order, or explore the full path before
          you begin.
        </p>
      </section>

      <section className={styles.curriculum} aria-labelledby="curriculum-title">
        <h2 id="curriculum-title">What You&apos;ll Learn</h2>
        <ol
          className={`${styles.timeline} ${expanded ? styles.timelineExpanded : ""}`}
          id="crypto-levels"
        >
          {cryptoLevels.map((level, index) => (
            <li key={level.title}>
              <span className={styles.marker} aria-hidden="true">
                {index}
              </span>
              {index <= 10 ? (
                <Link
                  className={`${styles.levelCard} ${styles.availableLevel}`}
                  href={`/learn/crypto/level-${index}`}
                  aria-label={`Start Level ${index}: ${level.title}`}
                >
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 10</span>
                    <strong>Available</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                  <span className={styles.startLevel}>
                    Start Level {index} →
                  </span>
                </Link>
              ) : (
                <article className={styles.levelCard}>
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 10</span>
                    <strong>Coming soon</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                </article>
              )}
            </li>
          ))}
        </ol>
        <button
          className={styles.viewMore}
          type="button"
          aria-expanded={expanded}
          aria-controls="crypto-levels"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "View fewer levels ↑" : "View more levels ↓"}
        </button>
      </section>

      <CompactFooter className={styles.footer} />
    </main>
  );
}
