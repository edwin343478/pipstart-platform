import Link from "next/link";

import styles from "./page.module.css";

const cryptoLevels = [
  {
    title: "Orientation and Risk",
    description:
      "What cryptocurrency is, traditional money comparisons, ownership, volatility, permanent-loss risks, scams and safe learning.",
  },
  {
    title: "Bitcoin",
    description:
      "Bitcoin purpose, blockchain, transactions, mining, proof of work, supply, halving, keys and digital signatures.",
  },
  {
    title: "Wallet Security",
    description:
      "Custodial and non-custodial wallets, hot and cold storage, seed phrases, backups, phishing, malware and recovery planning.",
  },
  {
    title: "Exchanges",
    description:
      "Centralized and decentralized exchanges, spot markets, order books, fees, liquidity, slippage, stablecoins and counterparty risk.",
  },
  {
    title: "Ethereum and Smart Contracts",
    description:
      "Ethereum, Ether, smart contracts, gas, tokens, applications, layer-one and layer-two networks, bridges and bridge risk.",
  },
  {
    title: "Altcoins and Tokenomics",
    description:
      "Token types, supply, market capitalisation, valuation, vesting, unlocks, founder allocations and liquidity concentration.",
  },
  {
    title: "Decentralized Finance",
    description:
      "Automated market makers, liquidity pools, lending, staking, yield, impermanent loss, oracle and smart-contract risk.",
  },
  {
    title: "Crypto Analysis",
    description:
      "Market cycles, Bitcoin dominance, funding rates, open interest, liquidations, exchange flows, on-chain metrics and their limitations.",
  },
  {
    title: "Portfolio and Risk",
    description:
      "Position sizing, concentration, correlation, custody and counterparty exposure, leverage, rebalancing and exit planning.",
  },
  {
    title: "Advanced Crypto",
    description:
      "Consensus, network security, governance, cross-chain systems, oracles, valuation, audit awareness and regulatory risk.",
  },
];

export default function LearnCryptoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Learn Crypto</span>
      </header>

      <section className={styles.introduction}>
        <span>Curriculum</span>
        <h1>Cryptocurrency Foundation Path</h1>
        <p>
          Ten levels, from absolute beginner to advanced cryptocurrency
          concepts. Work through them in order, or explore the full path before
          you begin.
        </p>
      </section>

      <section className={styles.curriculum} aria-labelledby="curriculum-title">
        <h2 id="curriculum-title">What You&apos;ll Learn</h2>

        <ol className={styles.timeline}>
          {cryptoLevels.map((level, index) => (
            <li key={level.title}>
              <span className={styles.marker} aria-hidden="true">
                {index}
              </span>
              {index === 1 ? (
                <Link
                  className={`${styles.levelCard} ${styles.availableLevel}`}
                  href="/learn/crypto/level-1"
                  aria-label="Start Level 1: Bitcoin"
                >
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 9</span>
                    <strong>Available</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                  <span className={styles.startLevel}>Start Level 1 →</span>
                </Link>
              ) : (
                <article className={styles.levelCard}>
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 9</span>
                    <strong>Coming soon</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                </article>
              )}
            </li>
          ))}
        </ol>
      </section>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
