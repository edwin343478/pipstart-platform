"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  LearningHeader,
  LessonNavigation,
} from "../../../../components/learning-structure";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { getLessonNavigation } from "../../../../lib/course-engine";
import { getRelatedTermLabels } from "../../../../lib/related-learning";
import { cryptoLessons } from "./lessons";
import {
  CRYPTO_LEVEL_ONE_PROGRESS_KEY,
  CRYPTO_PROGRESS_CHANGE_EVENT,
  parseCryptoLessonProgress,
  toggleCryptoLessonProgress,
} from "./progress";
import styles from "./page.module.css";

const publishedLesson = cryptoLessons[0]!;
const publishedLessonIds = cryptoLessons.map((lesson) => lesson.id);

function subscribeToProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CRYPTO_PROGRESS_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CRYPTO_PROGRESS_CHANGE_EVENT, callback);
  };
}

function getProgressSnapshot() {
  try {
    return window.localStorage.getItem(CRYPTO_LEVEL_ONE_PROGRESS_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerProgressSnapshot() {
  return "";
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export default function CryptoLevelOnePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const storedProgress = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const completedLessonIds = parseCryptoLessonProgress(
    storedProgress,
    publishedLessonIds,
  );
  const lessonIsComplete = completedLessonIds.includes(publishedLesson.id);
  const navigation = getLessonNavigation(cryptoLessons, publishedLesson.id);

  function toggleCompletion() {
    try {
      const nextProgress = toggleCryptoLessonProgress(
        storedProgress,
        publishedLesson.id,
        publishedLessonIds,
      );
      window.localStorage.setItem(CRYPTO_LEVEL_ONE_PROGRESS_KEY, nextProgress);
      window.dispatchEvent(new Event(CRYPTO_PROGRESS_CHANGE_EVENT));
    } catch {
      // The lesson stays usable when browser storage is unavailable.
    }
  }

  function renderLessonSidebar(
    className: string,
    collapsible = false,
    collapsed = false,
  ) {
    return (
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""} ${className}`}
        aria-label="Bitcoin lessons"
        id={collapsible ? "crypto-desktop-sidebar" : undefined}
      >
        <div className={styles.sidebarHeading}>
          <h2>
            <Link href="/learn/crypto/level-1/bitcoin">Bitcoin</Link>
          </h2>
          {collapsible ? (
            <button
              type="button"
              className={styles.sidebarToggle}
              aria-controls="crypto-desktop-sidebar"
              aria-expanded={!collapsed}
              aria-label={
                collapsed ? "Expand lesson sidebar" : "Collapse lesson sidebar"
              }
              onClick={() => setSidebarCollapsed((current) => !current)}
            >
              <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
            </button>
          ) : null}
        </div>
        <p className={styles.progressSummary} aria-live="polite">
          {completedLessonIds.length} of {cryptoLessons.length} complete
        </p>
        <nav>
          {cryptoLessons.map((lesson) => {
            const current = lesson.id === publishedLesson.id;
            return (
              <Link
                aria-current={current ? "page" : undefined}
                className={
                  current ? styles.currentLesson : styles.upcomingLesson
                }
                href={lesson.href}
                key={lesson.id}
              >
                {lesson.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <main className={styles.page}>
      <LearningHeader
        allLevelsClassName={styles.allLevels}
        allLevelsHref="/learn/crypto"
        allLevelsLabel="All Crypto levels"
        brandClassName={styles.brand}
        className={styles.header}
        contextClassName={styles.levelContext}
        levelLabel="Level 1 · Bitcoin"
      />

      <div
        className={`${styles.lessonLayout} ${sidebarCollapsed ? styles.lessonLayoutCollapsed : ""}`}
      >
        {renderLessonSidebar(styles.desktopSidebar, true, sidebarCollapsed)}
        <details className={styles.mobileSidebar}>
          <summary className={styles.sidebarSummary}>
            <span>Bitcoin</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </summary>
          {renderLessonSidebar(styles.mobileSidebarContent)}
        </details>

        <article className={styles.lesson}>
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/learn/crypto", label: "Learn Crypto" },
              { href: "/learn/crypto/level-1/bitcoin", label: "Bitcoin" },
              { label: publishedLesson.title },
            ]}
          />
          <p className={styles.eyebrow}>
            Level 1 · Lesson 1 of {cryptoLessons.length} ·{" "}
            {publishedLesson.estimatedMinutes}-minute read
          </p>
          <h1>{publishedLesson.title}</h1>

          <p className={styles.introduction}>{publishedLesson.introduction}</p>

          <section className={styles.keyPoints} aria-labelledby="objectives">
            <h2 id="objectives">Learning objectives</h2>
            {publishedLesson.objectives.map((objective) => (
              <p key={objective}>✓ {objective}</p>
            ))}
            <p>No previous lesson required.</p>
          </section>

          <section className={styles.keyPoints} aria-labelledby="key-points">
            <h2 id="key-points">Key points</h2>
            {publishedLesson.keyPoints.map((point) => (
              <p key={point}>✓ {point}</p>
            ))}
          </section>

          <section
            className={styles.keyPoints}
            aria-labelledby="related-learning"
          >
            <h2 id="related-learning">Related learning</h2>
            <p>
              Terms:{" "}
              {getRelatedTermLabels(publishedLesson.relatedTermSlugs).join(
                ", ",
              )}
              {" · "}
              <Link href="/glossary/crypto">Open glossary</Link>
            </p>
          </section>

          <div className={styles.completeAction}>
            <button
              aria-pressed={lessonIsComplete}
              className={lessonIsComplete ? styles.completedButton : undefined}
              type="button"
              onClick={toggleCompletion}
            >
              <CheckIcon />
              {lessonIsComplete ? "Completed" : "Mark complete"}
            </button>
          </div>

          <LessonNavigation
            className={styles.lessonNavigation}
            previous={
              navigation?.previous
                ? {
                    href: navigation.previous.href,
                    label: navigation.previous.title,
                  }
                : undefined
            }
            next={
              navigation?.next
                ? { href: navigation.next.href, label: navigation.next.title }
                : { href: "/learn/crypto", label: "Return to Crypto path" }
            }
          />
        </article>
      </div>
    </main>
  );
}
