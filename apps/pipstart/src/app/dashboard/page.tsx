import Link from "next/link";

import styles from "./page.module.css";

const summary = [
  { label: "Lessons done", value: 0 },
  { label: "Quizzes passed", value: 0 },
  { label: "Bookmarks", value: 0 },
];

const levels = [
  "Level 0 — Orientation and Safety",
  "Level 1 — Forex Kindergarten",
  "Level 2 — Brokers and Platforms",
  "Level 3 — Charts",
  "Level 4 — Indicators and Patterns",
  "Level 5 — Risk Management",
  "Level 6 — Price Action",
  "Level 7 — Fundamental Analysis",
  "Level 8 — Psychology",
  "Level 9 — Strategy Development",
  "Level 10 — Advanced Forex",
];

export default function DashboardPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Dashboard</span>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Welcome to your dashboard</h1>
          <p>Your Forex Foundation Path is ready when you are.</p>
        </section>

        <section className={styles.nextLesson}>
          <div>
            <p>Start learning</p>
            <h2>What is Forex?</h2>
          </div>
          <Link href="/learn/forex/level-1">Start →</Link>
        </section>

        <section className={styles.summary} aria-label="Learning summary">
          {summary.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section className={styles.levels}>
          <h2>Your levels</h2>
          <div>
            {levels.map((level) => (
              <Link href="/learn/forex" key={level}>
                <span>{level}</span>
                <small>Not started</small>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
