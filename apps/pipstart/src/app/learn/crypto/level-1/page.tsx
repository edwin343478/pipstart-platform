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
  { label: "What is Bitcoin?", status: "current" },
  { label: "Blockchain", status: "upcoming" },
  { label: "Transactions and blocks", status: "upcoming" },
  { label: "Mining and proof of work", status: "upcoming" },
  { label: "Supply and halving", status: "upcoming" },
  { label: "Keys and digital signatures", status: "upcoming" },
  { label: "Level 1 quiz", status: "upcoming" },
] as const;

export default function CryptoLevelOnePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Level 1 · Bitcoin</span>
      </header>

      <div className={styles.lessonLayout}>
        <aside className={styles.sidebar} aria-label="Bitcoin lessons">
          <h2>Bitcoin</h2>
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
          <h1>What is Bitcoin?</h1>

          <p className={styles.introduction}>
            Bitcoin is a digital asset that can be transferred between people
            through a decentralized network. This introductory lesson explains
            its purpose and provides the foundation for the rest of the Bitcoin
            level.
          </p>

          <section className={styles.keyPoints} aria-labelledby="key-points">
            <h2 id="key-points">Key points</h2>
            <p>✓ Bitcoin operates without a central bank</p>
            <p>✓ Transactions are recorded on a shared blockchain</p>
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
            <Link href="/learn/crypto/level-1/blockchain">Blockchain →</Link>
          </nav>
        </article>
      </div>
    </main>
  );
}
