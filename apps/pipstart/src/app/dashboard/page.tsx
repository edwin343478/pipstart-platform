import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { loadDashboardData } from "@/lib/dashboard-server";

import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Learner dashboard",
  robots: { follow: false, index: false },
};

function dateLabel(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function percentageLabel(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const newLearner =
    data.activeCourses.length === 0 && data.completedCourses.length === 0;
  const continueCourses = data.activeCourses.filter(
    (course) => course.continueTarget,
  );

  return (
    <AccountShell
      description="Your learning progress, recent activity and saved lessons in one place."
      eyebrow="Learner dashboard"
      navigation
      title={`Welcome back, ${data.displayName}`}
    >
      {newLearner ? (
        <section
          className={styles.onboarding}
          aria-labelledby="getting-started"
        >
          <p className={styles.sectionEyebrow}>Getting started</p>
          <h2 id="getting-started">Choose your first learning path</h2>
          <p>
            Start with the market you want to understand first. Your dashboard
            will begin tracking progress as soon as you open a lesson.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/learn/forex">
              Start with Forex
            </Link>
            <Link className={styles.secondaryAction} href="/learn/crypto">
              Explore Crypto
            </Link>
          </div>
        </section>
      ) : null}

      {continueCourses.length > 0 ? (
        <section className={styles.section} aria-labelledby="continue-learning">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>
                Pick up where you left off
              </p>
              <h2 id="continue-learning">Continue learning</h2>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {continueCourses.map((course) => (
              <article className={styles.card} key={course.id}>
                <p className={styles.cardLabel}>{course.title}</p>
                <h3>{course.continueTarget!.title}</h3>
                <p>
                  {course.continueTarget!.type === "quiz"
                    ? "Your lessons are complete. Take the required quiz to finish this course."
                    : "Continue with your most recent unfinished lesson."}
                </p>
                <Link
                  className={styles.textLink}
                  href={course.continueTarget!.href}
                >
                  {course.continueTarget!.type === "quiz"
                    ? "Take the quiz"
                    : "Continue lesson"}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.activeCourses.length > 0 ? (
        <section className={styles.section} aria-labelledby="active-courses">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>In progress</p>
              <h2 id="active-courses">Enrolled courses</h2>
            </div>
          </div>
          <div className={styles.stack}>
            {data.activeCourses.map((course) => (
              <article className={styles.courseCard} key={course.id}>
                <div className={styles.courseTopline}>
                  <div>
                    <h3>{course.title}</h3>
                    <p>
                      {course.progress.completed} of {course.progress.total}{" "}
                      required steps complete
                    </p>
                  </div>
                  <strong>{percentageLabel(course.progress.percentage)}</strong>
                </div>
                <progress
                  aria-label={`${course.title} completion`}
                  max={100}
                  value={course.progress.percentage}
                >
                  {percentageLabel(course.progress.percentage)}
                </progress>
                <div className={styles.cardFooter}>
                  <span>Last activity {dateLabel(course.lastActivityAt)}</span>
                  <Link className={styles.textLink} href={course.href}>
                    View course
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.twoColumn}>
        <section className={styles.section} aria-labelledby="recent-lessons">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Recent activity</p>
              <h2 id="recent-lessons">Recent lessons</h2>
            </div>
          </div>
          {data.recentLessons.length > 0 ? (
            <ul className={styles.list}>
              {data.recentLessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={lesson.href}>{lesson.title}</Link>
                  <span>
                    {lesson.completed ? "Completed" : "In progress"} ·{" "}
                    {dateLabel(lesson.lastVisitedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No lessons visited yet.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="quiz-results">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Assessments</p>
              <h2 id="quiz-results">Quiz scores</h2>
            </div>
          </div>
          {data.quizResults.length > 0 ? (
            <ul className={styles.list}>
              {data.quizResults.map((result) => (
                <li key={result.id}>
                  <Link href={result.href}>{result.title}</Link>
                  <span>
                    {result.score}/{result.maxScore} ·{" "}
                    {result.passed ? "Passed" : "Not passed"} ·{" "}
                    {dateLabel(result.submittedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No submitted quiz attempts yet.</p>
          )}
        </section>
      </div>

      <section className={styles.section} aria-labelledby="bookmarks">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>Saved for later</p>
            <h2 id="bookmarks">Bookmarks</h2>
          </div>
        </div>
        {data.bookmarks.length > 0 ? (
          <ul className={styles.list}>
            {data.bookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                <Link href={bookmark.href}>{bookmark.title}</Link>
                <span>Saved {dateLabel(bookmark.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            No saved lessons yet. Bookmark useful lessons while you learn.
          </p>
        )}
      </section>

      {data.completedCourses.length > 0 ? (
        <section className={styles.section} aria-labelledby="completed-courses">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Finished</p>
              <h2 id="completed-courses">Completed courses</h2>
            </div>
          </div>
          <ul className={styles.list}>
            {data.completedCourses.map((course) => (
              <li key={course.id}>
                <Link href={course.href}>{course.title}</Link>
                <span>Completed {dateLabel(course.completedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="account-settings">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>Your account</p>
            <h2 id="account-settings">Settings and notifications</h2>
          </div>
        </div>
        <div className={styles.settingsGrid}>
          <Link className={styles.settingCard} href="/account/settings">
            <strong>Account settings</strong>
            <span>Profile, security and account controls</span>
          </Link>
          <Link
            className={styles.settingCard}
            href="/account/email-preferences"
          >
            <strong>Email preferences</strong>
            <span>
              Learning emails{" "}
              {data.emailPreferences.educationalEmails ? "on" : "off"}
              {" · "}Product emails{" "}
              {data.emailPreferences.marketingEmails ? "on" : "off"}
            </span>
          </Link>
        </div>
      </section>
    </AccountShell>
  );
}
