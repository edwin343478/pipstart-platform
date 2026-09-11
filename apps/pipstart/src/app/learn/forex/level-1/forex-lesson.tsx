"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  LearningHeader,
  LessonNavigation,
} from "../../../../components/learning-structure";
import type { ForexLesson } from "./lessons";
import { forexLessons } from "./lessons";
import {
  FOREX_LEVEL_ONE_PROGRESS_KEY,
  parseLessonProgress,
  toggleLessonProgress,
} from "./progress";
import styles from "./page.module.css";

const PROGRESS_CHANGE_EVENT = "pipstart:forex-progress-change";
const lessonSlugs = forexLessons.map((lesson) => lesson.slug);

function subscribeToProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PROGRESS_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, callback);
  };
}

function getProgressSnapshot() {
  try {
    return window.localStorage.getItem(FOREX_LEVEL_ONE_PROGRESS_KEY) ?? "";
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

export default function ForexLessonPage({ lesson }: { lesson: ForexLesson }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const lessonIndex = forexLessons.findIndex(
    (candidate) => candidate.slug === lesson.slug,
  );
  const previousLesson = forexLessons[lessonIndex - 1];
  const nextLesson = forexLessons[lessonIndex + 1];
  const storedProgress = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const completedLessonSlugs = parseLessonProgress(storedProgress, lessonSlugs);
  const completedLessons = new Set(completedLessonSlugs);
  const lessonIsComplete = completedLessons.has(lesson.slug);

  function toggleCompletion() {
    try {
      const nextProgress = toggleLessonProgress(
        storedProgress,
        lesson.slug,
        lessonSlugs,
      );
      window.localStorage.setItem(FOREX_LEVEL_ONE_PROGRESS_KEY, nextProgress);
      window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
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
        aria-label="Forex Kindergarten lessons"
        id={collapsible ? "forex-desktop-sidebar" : undefined}
      >
        <div className={styles.sidebarHeading}>
          <h2>Forex Kindergarten</h2>
          {collapsible ? (
            <button
              type="button"
              className={styles.sidebarToggle}
              aria-controls="forex-desktop-sidebar"
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
          {completedLessonSlugs.length} of {forexLessons.length} complete
        </p>
        <nav>
          {forexLessons.map((candidate) => {
            const current = candidate.slug === lesson.slug;

            return (
              <Link
                aria-current={current ? "page" : undefined}
                className={
                  current ? styles.currentLesson : styles.upcomingLesson
                }
                href={candidate.href}
                key={candidate.slug}
              >
                <span>{candidate.title}</span>
                {completedLessons.has(candidate.slug) ? (
                  <span className={styles.completedMarker} aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </Link>
            );
          })}
          <span className={styles.upcomingLesson}>
            Level 1 quiz · Coming soon
          </span>
        </nav>
      </aside>
    );
  }

  return (
    <main className={styles.page}>
      <LearningHeader
        allLevelsClassName={styles.allLevels}
        allLevelsHref="/learn/forex"
        allLevelsLabel="All Forex levels"
        brandClassName={styles.brand}
        className={styles.header}
        contextClassName={styles.levelContext}
        levelLabel="Level 1 · Forex Kindergarten"
      />

      <div
        className={`${styles.lessonLayout} ${sidebarCollapsed ? styles.lessonLayoutCollapsed : ""}`}
      >
        {renderLessonSidebar(styles.desktopSidebar, true, sidebarCollapsed)}
        <details className={styles.mobileSidebar}>
          <summary className={styles.sidebarSummary}>
            <span>Forex Kindergarten</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </summary>
          {renderLessonSidebar(styles.mobileSidebarContent)}
        </details>

        <article className={styles.lesson}>
          <p className={styles.eyebrow}>
            Level 1 · Lesson {lesson.position} of {forexLessons.length}
          </p>
          <h1>{lesson.title}</h1>

          <p className={styles.introduction}>{lesson.introduction}</p>

          <section className={styles.keyPoints} aria-labelledby="key-points">
            <h2 id="key-points">Key points</h2>
            {lesson.keyPoints.map((point) => (
              <p key={point}>✓ {point}</p>
            ))}
          </section>

          <div className={styles.stickyActions}>
            <div className={styles.completeAction}>
              <button
                aria-pressed={lessonIsComplete}
                className={
                  lessonIsComplete ? styles.completedButton : undefined
                }
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
                previousLesson
                  ? { href: previousLesson.href, label: previousLesson.title }
                  : undefined
              }
              next={
                nextLesson
                  ? { href: nextLesson.href, label: nextLesson.title }
                  : { href: "/learn/forex", label: "Return to Forex path" }
              }
            />
          </div>
        </article>
      </div>
    </main>
  );
}
