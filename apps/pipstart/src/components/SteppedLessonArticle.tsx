"use client";

// =============================================================================
// SteppedLessonArticle.tsx
//
// Renders ONE lesson as a sequence of named sections, one visible at a
// time, with pill navigation, a progress indicator, and Back/Next links —
// this is the production implementation of the approved
// "PipStart — Level 0 lessons: sidebar + interactive in-lesson section
// stepper" mockup.
//
// Pairs with <LessonSidebar> below, which renders the level's lesson list
// with a desktop collapse toggle and a mobile <details> accordion.
//
// This file assumes NOTHING about the surrounding app beyond:
//   - Next.js App Router (`next/link`)
//   - The four CSS custom properties already defined in PipStart's
//     globals.css: --brand-primary, --brand-accent, --brand-accent-bright,
//     --font-pipstart-heading (fallback to a system stack if absent)
//   - The existing <LessonBlocks blocks={...}/> component, used unmodified
//     to render each section's content (see integration note 3 in
//     INTEGRATION-README.md if that component isn't available — a minimal
//     fallback renderer is NOT included here on purpose, to avoid
//     duplicating logic that already exists in the target codebase).
// =============================================================================

import Link from "next/link";
import { useLessonReadingState } from "../lib/use-lesson-reading-state";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

import { LessonBlocks } from "./lesson-blocks"; // adjust path per integration notes
import type { LessonSection } from "../content/lesson-content"; // adjust path per integration notes
import styles from "./stepped-lesson-article.module.css";

// SSR and the hydration pass expose the complete lesson. Only then enhance it.
const subscribeToEnhancement = () => () => {};
const clientEnhanced = () => true;
const serverEnhanced = () => false;

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="14" height="14">
      <path
        d="M12 5l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="14" height="14">
      <path
        d="M8 5L13 10L8 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export type NextLessonInfo = {
  title: string;
  href: string;
};

export type EndOfLevelInfo = {
  /** e.g. "You've finished Level 0 — start Level 1" */
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

export type SteppedLessonArticleProps = {
  /** e.g. "Level 0" */
  lessonId?: string;
  levelLabel: string;
  /** 1-indexed position of this lesson within the level, e.g. 4 */
  lessonPosition: number;
  /** total lessons in the level, e.g. 4 */
  lessonTotal: number;
  /** Full lesson title, e.g. "Spot Forex Scams and Make a Safer Learning Plan" */
  title: string;
  sections: LessonSection[];
  /** The lesson to advance to when the reader finishes the LAST section.
   *  Provide this OR endOfLevel, never both — see validation note below. */
  nextLesson?: NextLessonInfo;
  /** Shown instead of a "next lesson" link on the final section, for the
   *  level's last lesson (there's nothing to advance to within the level). */
  endOfLevel?: EndOfLevelInfo;
  /** Called when the reader clicks "Mark complete" on the final section.
   *  Wire this to whatever completion-tracking mechanism the target
   *  codebase already uses (see INTEGRATION-README.md, note 4). */
  onMarkComplete?: () => void;
  isComplete?: boolean;
  completionDisabled?: boolean;
  /** Existing bookmark and account sync controls are placed after the lesson. */
  footerControls?: ReactNode;
};

export function SteppedLessonArticle({
  lessonId,
  levelLabel,
  lessonPosition,
  lessonTotal,
  title,
  sections,
  nextLesson,
  endOfLevel,
  onMarkComplete,
  isComplete = false,
  completionDisabled = false,
  footerControls,
}: SteppedLessonArticleProps) {
  if (process.env.NODE_ENV !== "production") {
    if (Boolean(nextLesson) === Boolean(endOfLevel)) {
      console.error(
        "SteppedLessonArticle: provide exactly one of nextLesson or endOfLevel.",
      );
    }
  }

  const reading = useLessonReadingState(lessonId ?? title, sections);
  const { activeIndex } = reading;
  const enhanced = useSyncExternalStore(
    subscribeToEnhancement,
    clientEnhanced,
    serverEnhanced,
  );
  const showAll = !enhanced || reading.showAll;
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    function revealMatch(event: Event) {
      if (!(event.target instanceof HTMLElement)) return;
      const index = Number(event.target.dataset.sectionIndex);
      if (!Number.isInteger(index) || index < 0 || index >= sections.length)
        return;
      // Let native Find/fragment navigation scroll to its match. Keep tabs,
      // progress and saved position in sync without moving keyboard focus.
      flushSync(() => reading.select(index));
    }
    article?.addEventListener("beforematch", revealMatch);
    return () => article?.removeEventListener("beforematch", revealMatch);
  }, [reading, sections.length]);
  const tabIdBase = useId();
  const total = sections.length;
  const isLastSection = activeIndex === total - 1;
  const progressPercent = total
    ? Math.round(((activeIndex + 1) / total) * 100)
    : 0;

  function goTo(index: number, focus: "heading" | "tab" = "heading") {
    reading.select(index);
    if (focus === "tab") {
      document.getElementById(`${tabIdBase}-tab-${index}`)?.focus();
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    requestAnimationFrame(() => {
      document
        .getElementById(`${tabIdBase}-panel-${index}-heading`)
        ?.focus({ preventScroll: true });
    });
  }

  return (
    <article
      ref={articleRef}
      className={styles.article}
      data-enhanced={enhanced}
    >
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        {levelLabel} <span aria-hidden="true">/</span> {title}
      </nav>
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        <span className={styles.eyebrow}>
          {levelLabel} · Lesson {lessonPosition} of {lessonTotal}
          {isLastSection && !nextLesson ? " · Final lesson" : ""}
        </span>
      </div>
      <h1 className={styles.title}>{title}</h1>

      {/* Section pills — horizontally scrollable so an N-section lesson
          never forces illegibly small pills on mobile. Proper ARIA
          tablist/tab roles, not just visual styling. */}
      <div
        className={styles.stepRow}
        role="tablist"
        aria-label={`Sections of ${title}`}
      >
        {sections.map((section, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={section.title}
              type="button"
              role="tab"
              id={`${tabIdBase}-tab-${index}`}
              aria-selected={active}
              aria-controls={`${tabIdBase}-panel-${index}`}
              tabIndex={active ? 0 : -1}
              className={active ? styles.pillActive : styles.pill}
              onClick={() => goTo(index)}
              onKeyDown={(event) => {
                if (
                  ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? total - 1
                        : (index + direction + total) % total;
                  goTo(next, "tab");
                }
              }}
            >
              <span className={styles.pillNumber}>{index + 1}</span>
              {section.shortTitle ?? section.title}
            </button>
          );
        })}
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        className={styles.mobileProgress}
        aria-label={`Section ${activeIndex + 1} of ${total}`}
      >
        {sections.map((section, index) => (
          <span
            key={section.title}
            className={index === activeIndex ? styles.activeDot : styles.dot}
          />
        ))}
        <span className={styles.mobileProgressLabel}>
          Section {activeIndex + 1} of {total}
        </span>
      </div>

      <label className={styles.showAllToggle}>
        <input
          type="checkbox"
          checked={showAll}
          onChange={(event) => reading.setShowAll(event.target.checked)}
        />
        Show all sections at once
      </label>

      {sections.map((section, index) => {
        const isActive = index === activeIndex;
        const isLast = index === total - 1;
        const showBack = index > 0;

        return (
          <div
            key={section.title}
            role="tabpanel"
            id={`${tabIdBase}-panel-${index}`}
            aria-labelledby={`${tabIdBase}-tab-${index}`}
            className={styles.panel}
            data-section-index={index}
            aria-hidden={!showAll && !isActive ? true : undefined}
            ref={(panel) => {
              if (!panel) return;
              // React 19.2 treats hidden as boolean; use the native enumerated
              // attribute so until-found is not silently changed to hidden="".
              if (!showAll && !isActive) {
                panel.setAttribute(
                  "hidden",
                  "onbeforematch" in panel ? "until-found" : "",
                );
              } else {
                panel.removeAttribute("hidden");
              }
            }}
          >
            <p className={styles.sectionEyebrow}>
              Section {index + 1} of {total}
            </p>
            <h2
              id={`${tabIdBase}-panel-${index}-heading`}
              tabIndex={-1}
              className={styles.sectionHeading}
            >
              {section.title}
            </h2>

            <LessonBlocks
              blocks={section.blocks.map((block) =>
                block.type === "section" && block.title === section.title
                  ? { ...block, title: "" }
                  : block,
              )}
              checklistState={{
                prefix: reading.sectionIds[index],
                checked: reading.checked,
                onChange: reading.setChecked,
              }}
            />

            {isLast && onMarkComplete ? (
              <button
                type="button"
                className={styles.markComplete}
                onClick={onMarkComplete}
                disabled={completionDisabled}
                aria-pressed={isComplete}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  width="15"
                  height="15"
                >
                  <path
                    d="M4 10.5 8 14.5 16 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                {isComplete ? "Completed" : "Mark complete"}
              </button>
            ) : null}

            {(!showAll || isLast) && (
              <div className={styles.panelNav}>
                {!showAll && showBack ? (
                  <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => goTo(index - 1)}
                  >
                    <BackIcon />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {!showAll && !isLast ? (
                  <button
                    type="button"
                    className={styles.nextLink}
                    onClick={() => goTo(index + 1)}
                  >
                    Next: {sections[index + 1].title}
                    <NextIcon />
                  </button>
                ) : nextLesson ? (
                  <Link href={nextLesson.href} className={styles.nextLink}>
                    Next lesson: {nextLesson.title}
                    <NextIcon />
                  </Link>
                ) : endOfLevel ? (
                  <Link
                    href={endOfLevel.ctaHref}
                    className={styles.endOfLevelLink}
                  >
                    {endOfLevel.ctaLabel}
                    <NextIcon />
                  </Link>
                ) : null}
              </div>
            )}

            {isLast && endOfLevel ? (
              <div className={styles.endOfLevelBanner}>
                <p className={styles.endOfLevelEyebrow}>End of {levelLabel}</p>
                <p className={styles.endOfLevelMessage}>{endOfLevel.message}</p>
              </div>
            ) : null}
          </div>
        );
      })}
      {footerControls ? (
        <div className={styles.footerControls}>{footerControls}</div>
      ) : null}
    </article>
  );
}

// -----------------------------------------------------------------------
// LessonSidebar — the level's lesson list, with a desktop collapse toggle
// and a mobile accordion. Genuinely independent of SteppedLessonArticle;
// use it on any lesson page (sectioned or flat), not just this one.
// -----------------------------------------------------------------------

export type SidebarLessonInfo = {
  title: string;
  href: string;
  complete: boolean;
  current: boolean;
};

export type LessonSidebarProps = {
  levelTitle: string;
  levelHref: string;
  lessons: SidebarLessonInfo[];
  quiz?: SidebarLessonInfo;
};

export function LessonSidebar({
  levelTitle,
  levelHref,
  lessons,
  quiz,
}: LessonSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const completedCount = lessons.filter((lesson) => lesson.complete).length;
  const percent = Math.round((completedCount / lessons.length) * 100);

  const nav = (
    <nav>
      {[...lessons, ...(quiz ? [quiz] : [])].map((lesson) => (
        <Link
          key={lesson.href}
          href={lesson.href}
          aria-current={lesson.current ? "page" : undefined}
          className={lesson.current ? styles.navCurrent : styles.navItem}
        >
          <span>{lesson.title}</span>
          {lesson.complete ? (
            <span aria-hidden="true" className={styles.navCheck}>
              ✓
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: collapsible aside */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        <div className={styles.sidebarHeadRow}>
          {!collapsed ? (
            <h2 className={styles.sidebarTitle}>
              <Link href={levelHref}>{levelTitle}</Link>
            </h2>
          ) : null}
          <button
            type="button"
            className={styles.sidebarToggleBtn}
            aria-expanded={!collapsed}
            aria-label={
              collapsed ? "Expand lesson list" : "Collapse lesson list"
            }
            onClick={() => setCollapsed((current) => !current)}
          >
            <span
              className={collapsed ? styles.chevronCollapsed : styles.chevron}
            >
              <BackIcon />
            </span>
          </button>
        </div>
        {!collapsed ? (
          <>
            <p className={styles.sidebarSub}>
              {completedCount} of {lessons.length} complete
            </p>
            <div className={styles.sidebarBar} aria-hidden="true">
              <div style={{ width: `${percent}%` }} />
            </div>
            {nav}
          </>
        ) : null}
      </aside>

      {/* Mobile: native accordion, no JS state needed */}
      <details className={styles.mobileSidebar}>
        <summary className={styles.mobileSidebarSummary}>
          <span>
            {levelTitle}
            <span className={styles.mobileSidebarProgress}>
              {completedCount} of {lessons.length}
            </span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="12" height="12">
            <path
              d="m5 8 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </summary>
        {nav}
      </details>
    </>
  );
}
