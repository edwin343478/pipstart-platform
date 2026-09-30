"use client";

import Link from "next/link";
import { LessonBookmarkButton } from "./lesson-bookmark-button";
import { ProgressSyncStatus } from "./progress-sync-status";
import { LessonSidebar, SteppedLessonArticle } from "./SteppedLessonArticle";
import type { PublishedLesson } from "../content/lesson-registry";
import type { LessonBlock, LessonSection } from "../content/lesson-content";
import { usePermanentProgress } from "../lib/use-permanent-progress";
import {
  FOREX_LEVEL_ONE_PROGRESS_KEY,
  FOREX_PROGRESS_CHANGE_EVENT,
  parseLessonProgress,
  serializeLessonProgress,
} from "../app/learn/forex/level-1/progress";
import {
  CRYPTO_LEVEL_ONE_PROGRESS_KEY,
  CRYPTO_PROGRESS_CHANGE_EVENT,
  parseCryptoLessonProgress,
  serializeCryptoLessonProgress,
} from "../app/learn/crypto/level-1/progress";
import { getCurriculumModule } from "../lib/curriculum";
import styles from "./lesson-page.module.css";

type Target = { href: string; label: string };

type Props = {
  path: "forex" | "crypto";
  lesson: PublishedLesson;
  lessons: readonly PublishedLesson[];
  contextTitle: string;
  contextHref: string;
  progressKey?: string;
  quizTarget?: Target | null;
};

// Existing flat lessons also use the same visual and interaction pattern.
// Group their blocks at real headings, keeping examples and tables intact.
function sectionsFor(lesson: PublishedLesson): LessonSection[] {
  if (lesson.sections?.length) return lesson.sections;
  const sections: LessonSection[] = [];
  let current: LessonSection = { title: "Getting started", blocks: [] };
  for (const block of lesson.blocks) {
    if (block.type === "heading" && block.level !== 3) {
      if (current.blocks.length) sections.push(current);
      current = { title: block.children, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.blocks.length) sections.push(current);
  if (!sections.length)
    sections.push({ title: lesson.title, blocks: lesson.blocks });
  return sections;
}

export function LessonPage({
  path,
  lesson,
  lessons,
  contextTitle,
  contextHref,
  progressKey,
  quizTarget,
}: Props) {
  const level = /^level-(\d+)$/.exec(lesson.level)?.[1] ?? lesson.level;
  const isForex = path === "forex";
  const progress = usePermanentProgress({
    courseId: lesson.course,
    eventName: isForex
      ? FOREX_PROGRESS_CHANGE_EVENT
      : CRYPTO_PROGRESS_CHANGE_EVENT,
    lessonId: lesson.id,
    parse: isForex ? parseLessonProgress : parseCryptoLessonProgress,
    serialize: isForex
      ? serializeLessonProgress
      : serializeCryptoLessonProgress,
    storageKey:
      progressKey ??
      (isForex ? FOREX_LEVEL_ONE_PROGRESS_KEY : CRYPTO_LEVEL_ONE_PROGRESS_KEY),
    validIds: lessons.map((item) => item.id),
  });
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const next = lessons[currentIndex + 1];
  const isComplete = progress.completedIds.includes(lesson.id);
  const sections = sectionsFor(lesson);
  const registeredQuiz = lesson.module
    ? getCurriculumModule(path, lesson.module)?.lessons.find(
        (item) => item.type === "quiz",
      )
    : undefined;
  const resolvedQuizTarget = registeredQuiz
    ? { href: registeredQuiz.href, label: `Take the ${registeredQuiz.title}` }
    : quizTarget;
  const endOfLevel = next
    ? undefined
    : {
        message:
          lesson.level === "level-0"
            ? "You're ready to continue to Level 1 with a safety-first foundation — still without opening or funding a live trading account."
            : "You've finished the lessons in this level. Review what you learned before continuing.",
        ctaLabel:
          lesson.level === "level-0"
            ? "You've finished Level 0 — start Level 1"
            : (resolvedQuizTarget?.label ??
              `Return to ${path === "forex" ? "Forex" : "Crypto"} levels`),
        ctaHref:
          lesson.level === "level-0"
            ? "/learn/forex/level-1"
            : (resolvedQuizTarget?.href ?? `/learn/${path}`),
      };

  return (
    <main className={styles.page} data-learning-path={path}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          PipStart
        </Link>
        <Link className={styles.allLevels} href={`/learn/${path}`}>
          <span aria-hidden="true">‹</span> All {isForex ? "Forex" : "Crypto"}{" "}
          levels
        </Link>
        <span className={styles.headerContext}>
          Level {level} · {contextTitle}
        </span>
      </header>
      <div className={`${styles.layout} ${isForex ? styles.forexLayout : ""}`}>
        <LessonSidebar
          levelTitle={contextTitle}
          levelHref={contextHref}
          lessons={lessons.map((item) => ({
            title: item.title,
            href: item.href,
            complete: progress.completedIds.includes(item.id),
            current: item.id === lesson.id,
          }))}
          quiz={
            registeredQuiz
              ? {
                  title: registeredQuiz.title,
                  href: registeredQuiz.href,
                  complete: Boolean(
                    progress.snapshot?.assessments?.some(
                      (item) => item.assessmentId === registeredQuiz.id,
                    ),
                  ),
                  current: false,
                }
              : undefined
          }
        />
        <SteppedLessonArticle
          key={lesson.id}
          levelLabel={`Level ${level}`}
          lessonPosition={currentIndex + 1}
          lessonTotal={lessons.length}
          title={lesson.title}
          sections={sections}
          nextLesson={next ? { title: next.title, href: next.href } : undefined}
          endOfLevel={endOfLevel}
          onMarkComplete={() => progress.toggle(lesson.id)}
          isComplete={isComplete}
          completionDisabled={progress.syncState === "saving"}
          footerControls={
            <div className={styles.footer}>
              <p>
                Published {lesson.publishedDate} · Reviewed {lesson.reviewDate}{" "}
                · {lesson.estimatedMinutes}-minute read
              </p>
              <LessonBookmarkButton
                lessonHref={lesson.href}
                lessonId={lesson.id}
                lessonPage
              />
              <ProgressSyncStatus
                state={progress.syncState}
                message={progress.message}
                retry={progress.retry}
              />
              {lesson.objectives.length ? (
                <details>
                  <summary>Learning objectives</summary>
                  <ul>
                    {lesson.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {!sections.some((section) =>
                section.blocks.some(
                  (block: LessonBlock) => block.type === "references",
                ),
              ) && lesson.sources.length ? (
                <details>
                  <summary>Sources and further reading</summary>
                  <ul>
                    {lesson.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {source.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          }
        />
      </div>
    </main>
  );
}
