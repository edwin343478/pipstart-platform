"use client";

import Link from "next/link";
import { useState } from "react";

import {
  LearningHeader,
  LessonNavigation,
} from "../../../../components/learning-structure";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { LessonBlocks } from "../../../../components/lesson-blocks";
import { ProgressSyncStatus } from "../../../../components/progress-sync-status";
import { getLessonNavigation } from "../../../../lib/course-engine";
import { getRelatedTermLabels } from "../../../../lib/related-learning";
import { usePermanentProgress } from "../../../../lib/use-permanent-progress";
import type { ForexLesson } from "./lessons";
import { forexLessons, getForexLessonById } from "./lessons";
import {
  FOREX_LEVEL_ONE_PROGRESS_KEY,
  FOREX_PROGRESS_CHANGE_EVENT,
  parseLessonProgress,
  serializeLessonProgress,
} from "./progress";
import styles from "./page.module.css";

const lessonSlugs = forexLessons.map((lesson) => lesson.slug);

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export default function ForexLessonPage({ lesson }: { lesson: ForexLesson }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigation = getLessonNavigation(forexLessons, lesson.id);
  const previousLesson = navigation?.previous;
  const nextLesson = navigation?.next;
  const prerequisiteLessons = lesson.prerequisites
    .map(getForexLessonById)
    .filter((candidate): candidate is ForexLesson => Boolean(candidate));
  const relatedLessons = lesson.relatedLessonIds
    .map(getForexLessonById)
    .filter((candidate): candidate is ForexLesson => Boolean(candidate));
  const progress = usePermanentProgress({
    courseId: lesson.course,
    eventName: FOREX_PROGRESS_CHANGE_EVENT,
    lessonId: lesson.id,
    parse: parseLessonProgress,
    serialize: serializeLessonProgress,
    storageKey: FOREX_LEVEL_ONE_PROGRESS_KEY,
    validIds: lessonSlugs,
  });
  const completedLessonSlugs = progress.completedIds;
  const completedLessons = new Set(completedLessonSlugs);
  const lessonIsComplete = completedLessons.has(lesson.slug);

  function toggleCompletion() {
    progress.toggle(lesson.id);
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
          <h2>
            <Link href="/learn/forex/level-1/forex-kindergarten">
              Forex Kindergarten
            </Link>
          </h2>
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
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/learn/forex", label: "Learn Forex" },
              {
                href: "/learn/forex/level-1/forex-kindergarten",
                label: "Forex Kindergarten",
              },
              { label: lesson.title },
            ]}
          />
          <p className={styles.eyebrow}>
            Level 1 · Lesson {navigation?.position ?? lesson.position} of{" "}
            {navigation?.total ?? forexLessons.length} ·{" "}
            {lesson.estimatedMinutes}
            -minute read
          </p>
          <h1>{lesson.title}</h1>

          <p className={styles.introduction}>{lesson.introduction}</p>

          <p className={styles.reviewDates}>
            Published {lesson.publishedDate} · Reviewed {lesson.reviewDate}
          </p>

          <section className={styles.keyPoints} aria-labelledby="objectives">
            <h2 id="objectives">Learning objectives</h2>
            {lesson.objectives.map((objective) => (
              <p key={objective}>✓ {objective}</p>
            ))}
            {prerequisiteLessons.length > 0 ? (
              <p>
                Prerequisite:{" "}
                {prerequisiteLessons.map((prerequisite, index) => (
                  <span key={prerequisite.id}>
                    {index > 0 ? ", " : ""}
                    <Link href={prerequisite.href}>{prerequisite.title}</Link>
                  </span>
                ))}
              </p>
            ) : (
              <p>No previous lesson required.</p>
            )}
          </section>

          <LessonBlocks blocks={lesson.blocks} />

          {relatedLessons.length > 0 || lesson.relatedTermSlugs.length > 0 ? (
            <section
              className={styles.keyPoints}
              aria-labelledby="related-learning"
            >
              <h2 id="related-learning">Related learning</h2>
              {relatedLessons.map((relatedLesson) => (
                <p key={relatedLesson.id}>
                  <Link href={relatedLesson.href}>{relatedLesson.title}</Link>
                </p>
              ))}
              {lesson.relatedTermSlugs.length > 0 ? (
                <p>
                  Terms:{" "}
                  {getRelatedTermLabels(lesson.relatedTermSlugs).join(", ")}
                  {" · "}
                  <Link href="/glossary">Open glossary</Link>
                </p>
              ) : null}
            </section>
          ) : null}

          <div className={styles.stickyActions}>
            <div className={styles.completeAction}>
              <button
                aria-pressed={lessonIsComplete}
                className={
                  lessonIsComplete ? styles.completedButton : undefined
                }
                type="button"
                disabled={progress.syncState === "saving"}
                onClick={toggleCompletion}
              >
                <CheckIcon />
                {lessonIsComplete ? "Completed" : "Mark complete"}
              </button>
              <ProgressSyncStatus
                className={styles.syncStatus}
                message={progress.message}
                retry={progress.retry}
                state={progress.syncState}
              />
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
