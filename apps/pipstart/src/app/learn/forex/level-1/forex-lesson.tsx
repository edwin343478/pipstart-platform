import Link from "next/link";

import type { ForexLesson } from "./lessons";
import { forexLessons } from "./lessons";
import styles from "./page.module.css";

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export default function ForexLessonPage({ lesson }: { lesson: ForexLesson }) {
  const lessonIndex = forexLessons.findIndex(
    (candidate) => candidate.slug === lesson.slug,
  );
  const previousLesson = forexLessons[lessonIndex - 1];
  const nextLesson = forexLessons[lessonIndex + 1];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Level 1 · Forex Kindergarten</span>
      </header>

      <div className={styles.lessonLayout}>
        <aside
          className={styles.sidebar}
          aria-label="Forex Kindergarten lessons"
        >
          <h2>Forex Kindergarten</h2>
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
                  {candidate.title}
                </Link>
              );
            })}
          </nav>
        </aside>

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

          <div className={styles.completeAction}>
            <button type="button">
              <CheckIcon />
              Mark complete
            </button>
          </div>

          <nav
            className={styles.lessonNavigation}
            aria-label="Lesson navigation"
          >
            {previousLesson ? (
              <Link href={previousLesson.href}>← {previousLesson.title}</Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextLesson ? (
              <Link href={nextLesson.href}>{nextLesson.title} →</Link>
            ) : (
              <Link href="/learn/forex">Return to Forex path →</Link>
            )}
          </nav>
        </article>
      </div>
    </main>
  );
}
