"use client";

import Link from "next/link";
import { useState } from "react";

import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import styles from "./page.module.css";

const forexLevels = [
  {
    title: "Orientation and Safety",
    description:
      "Course purpose, trading versus investing, financial risk, scams, demo accounts and your learning plan.",
  },
  {
    title: "Forex Kindergarten",
    description:
      "Currency pairs, bid and ask prices, spreads, pips, lots, market sessions and participants.",
  },
  {
    title: "Brokers and Platforms",
    description:
      "Broker models, regulation, research, platforms, order types, trading costs and scam detection.",
  },
  {
    title: "Charts",
    description:
      "Chart types, timeframes, candlesticks, support and resistance, trends, market structure and breakouts.",
  },
  {
    title: "Indicators and Patterns",
    description:
      "Moving averages, RSI, MACD, ATR, Bollinger Bands, Fibonacci, chart patterns and indicator limitations.",
  },
  {
    title: "Risk Management",
    description:
      "Risk per trade, position sizing, leverage, drawdown, loss limits, risk of ruin and a personal risk policy.",
  },
  {
    title: "Price Action",
    description:
      "Continuation, reversal, consolidation, supply and demand, entry triggers, invalidation and trading checklists.",
  },
  {
    title: "Fundamental Analysis",
    description:
      "Interest rates, inflation, employment, central banks, economic calendars, event risk and geopolitics.",
  },
  {
    title: "Psychology",
    description:
      "Fear, greed, overtrading, revenge trading, bias, discipline, patience and realistic expectations.",
  },
  {
    title: "Strategy Development",
    description:
      "Entry and exit rules, backtesting, forward testing, expectancy, drawdown and avoiding curve fitting.",
  },
  {
    title: "Advanced Forex",
    description:
      "Correlations, market regimes, liquidity, carry trades, sentiment, portfolio exposure and performance review.",
  },
];

export default function LearnForexPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Learn Forex" />

      <section className={styles.introduction}>
        <span>Curriculum</span>
        <h1>Forex Foundation Path</h1>
        <p>
          Eleven levels, from absolute beginner to advanced strategy. Work
          through them in order, or explore the full path before you begin.
        </p>
      </section>

      <section className={styles.curriculum} aria-labelledby="curriculum-title">
        <h2 id="curriculum-title">What You&apos;ll Learn</h2>
        <ol
          className={`${styles.timeline} ${expanded ? styles.timelineExpanded : ""}`}
          id="forex-levels"
        >
          {forexLevels.map((level, index) => (
            <li key={level.title}>
              <span className={styles.marker} aria-hidden="true">
                {index}
              </span>
              {index === 1 ? (
                <Link
                  className={`${styles.levelCard} ${styles.availableLevel}`}
                  href="/learn/forex/level-1"
                  aria-label="Start Level 1: Forex Kindergarten"
                >
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 10</span>
                    <strong>Available</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                  <span className={styles.startLevel}>Start Level 1 →</span>
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
          aria-controls="forex-levels"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "View fewer levels ↑" : "View more levels ↓"}
        </button>
      </section>

      <CompactFooter className={styles.footer} />
    </main>
  );
}
