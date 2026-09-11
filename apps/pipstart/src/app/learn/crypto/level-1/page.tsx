import {
  LearningHeader,
  LessonNavigation,
} from "../../../../components/learning-structure";
import styles from "./page.module.css";

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
      <LearningHeader
        allLevelsClassName={styles.allLevels}
        allLevelsHref="/learn/crypto"
        allLevelsLabel="All Crypto levels"
        brandClassName={styles.brand}
        className={styles.header}
        contextClassName={styles.levelContext}
        levelLabel="Level 1 · Bitcoin"
      />

      <div className={styles.lessonLayout}>
        <details className={styles.sidebarDetails}>
          <summary className={styles.sidebarSummary}>
            <span>Bitcoin</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </summary>
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
        </details>

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

          <LessonNavigation
            className={styles.lessonNavigation}
            next={{ href: "/learn/crypto", label: "Return to Crypto path" }}
          />
        </article>
      </div>
    </main>
  );
}
