"use client";

import Link from "next/link";
import { useState } from "react";

import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import { getContinueLearningState } from "../../../lib/course-engine";
import { usePermanentProgress } from "../../../lib/use-permanent-progress";
import { forexLessons } from "./level-1/lessons";
import {
  FOREX_LEVEL_ONE_PROGRESS_KEY,
  FOREX_PROGRESS_CHANGE_EVENT,
  parseLessonProgress,
  serializeLessonProgress,
} from "./level-1/progress";
import styles from "./page.module.css";

const lessonSlugs = forexLessons.map((lesson) => lesson.slug);

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
  const progress = usePermanentProgress({
    courseId: "forex-kindergarten",
    eventName: FOREX_PROGRESS_CHANGE_EVENT,
    parse: parseLessonProgress,
    serialize: serializeLessonProgress,
    storageKey: FOREX_LEVEL_ONE_PROGRESS_KEY,
    validIds: lessonSlugs,
  });
  const completedLessonSlugs = progress.completedIds;
  const continueState = getContinueLearningState(
    forexLessons.map((lesson) => ({ ...lesson, id: lesson.slug })),
    completedLessonSlugs,
  );
  const levelHref =
    continueState.status === "lesson"
      ? continueState.lesson.href
      : "/learn/forex/level-1/forex-kindergarten/forex-foundations";
  const levelAction =
    continueState.status === "complete"
      ? "Review completed module"
      : "Start Level 1";
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
              {index <= 10 ? (
                <Link
                  className={`${styles.levelCard} ${styles.availableLevel}`}
                  href={
                    index === 0
                      ? "/learn/forex/level-0"
                      : index === 1
                        ? levelHref
                        : index === 2
                          ? "/learn/forex/level-2"
                          : index === 3
                            ? "/learn/forex/level-3"
                            : index === 4
                              ? "/learn/forex/level-4"
                              : index === 5
                                ? "/learn/forex/level-5"
                                : index === 6
                                  ? "/learn/forex/level-6"
                                  : index === 7
                                    ? "/learn/forex/level-7"
                                    : index === 8
                                      ? "/learn/forex/level-8"
                                      : index === 9
                                        ? "/learn/forex/level-9"
                                        : "/learn/forex/level-10"
                  }
                  aria-label={
                    index === 0
                      ? "Start Level 0: Orientation and Safety"
                      : index === 1
                        ? "Start Level 1: Forex Kindergarten"
                        : index === 2
                          ? "Start Level 2: Brokers and Platforms"
                          : index === 3
                            ? "Start Level 3: Charts"
                            : index === 4
                              ? "Start Level 4: Indicators and Patterns"
                              : index === 5
                                ? "Start Level 5: Risk Management"
                                : index === 6
                                  ? "Start Level 6: Price Action"
                                  : index === 7
                                    ? "Start Level 7: Fundamental Analysis"
                                    : index === 8
                                      ? "Start Level 8: Psychology"
                                      : index === 9
                                        ? "Start Level 9: Strategy Development"
                                        : "Start Level 10: Advanced Forex"
                  }
                >
                  <span className={styles.levelMeta}>
                    <span>Level {index} of 10</span>
                    <strong>Available</strong>
                  </span>
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                  <span className={styles.startLevel}>
                    {index === 0
                      ? "Start Level 0"
                      : index === 1
                        ? levelAction
                        : index === 2
                          ? "Start Level 2"
                          : index === 3
                            ? "Start Level 3"
                            : index === 4
                              ? "Start Level 4"
                              : index === 5
                                ? "Start Level 5"
                                : index === 6
                                  ? "Start Level 6"
                                  : index === 7
                                    ? "Start Level 7"
                                    : index === 8
                                      ? "Start Level 8"
                                      : index === 9
                                        ? "Start Level 9"
                                        : "Start Level 10"}{" "}
                    →
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
