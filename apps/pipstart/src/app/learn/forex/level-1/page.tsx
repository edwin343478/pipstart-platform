import Link from "next/link";

import styles from "./page.module.css";

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

const lessons = [
  { label: "What is Forex", status: "current" },
  { label: "Currency pairs", status: "upcoming" },
  { label: "Pips and lots", status: "upcoming" },
  { label: "Bid, ask & spread", status: "upcoming" },
  { label: "Trading sessions", status: "upcoming" },
  { label: "Market participants", status: "upcoming" },
  { label: "Level 1 quiz", status: "upcoming" },
] as const;

export default function ForexLevelOnePage() {
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
            {lessons.map((lesson) => {
              const className =
                lesson.status === "current"
                  ? styles.currentLesson
                  : styles.upcomingLesson;

              return (
                <span
                  aria-current={
                    lesson.status === "current" ? "page" : undefined
                  }
                  className={className}
                  key={lesson.label}
                >
                  {lesson.label}
                </span>
              );
            })}
          </nav>
        </aside>

        <article className={styles.lesson}>
          <p className={styles.eyebrow}>Level 1 · Lesson 1 of 6</p>
          <h1>What is Forex?</h1>

          <p className={styles.introduction}>
            Forex, short for foreign exchange, is the global market where one
            currency is exchanged for another. This introductory lesson provides
            the foundation for the rest of Forex Kindergarten.
          </p>

          <section className={styles.keyPoints} aria-labelledby="key-points">
            <h2 id="key-points">Key points</h2>
            <p>✓ Forex means foreign exchange</p>
            <p>✓ Currencies are exchanged in pairs</p>
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
            <span aria-hidden="true" />
            <Link href="/learn/forex/level-1/currency-pairs">
              Currency pairs →
            </Link>
          </nav>
        </article>
      </div>
    </main>
  );
}
