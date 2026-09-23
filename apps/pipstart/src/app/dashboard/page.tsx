import type { Metadata } from "next";
import Link from "next/link";

import { ReferencePageShell } from "@/components/reference-page-shell";
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

function SectionHeader({
  eyebrow,
  icon,
  title,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.iconBadge} aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className={styles.sectionEyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <path
        d="M12.5 7.5L10.8 10.8L7.5 12.5L9.2 9.2L12.5 7.5Z"
        fill="var(--brand-accent)"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7 5.5L15 10L7 14.5V5.5Z" fill="var(--brand-accent)" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4H10V16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
      />
      <path
        d="M16 5.5C16 4.67 15.33 4 14.5 4H10V16H14.5C15.33 16 16 15.33 16 14.5V5.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <path
        d="M10 6.5V10L12.5 11.8"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#CCFBF1" />
      <path
        d="M6.5 10.2L8.8 12.5L13.5 7.5"
        stroke="var(--brand-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 4.5C6 4.22 6.22 4 6.5 4H13.5C13.78 4 14 4.22 14 4.5V16L10 13.5L6 16V4.5Z"
        stroke="var(--brand-accent)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6 4V16" stroke="var(--brand-accent)" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M6 4.5C8 3.5 10 5.5 14 4.5V9.5C10 10.5 8 8.5 6 9.5V4.5Z"
        fill="var(--brand-accent)"
        fillOpacity="0.16"
        stroke="var(--brand-accent)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <line x1="4" y1="6" x2="16" y2="6" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <circle cx="8" cy="6" r="1.6" fill="var(--brand-accent)" />
      <line x1="4" y1="14" x2="16" y2="14" stroke="var(--brand-accent)" strokeWidth="1.4" />
      <circle cx="13" cy="14" r="1.6" fill="var(--brand-accent)" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M8 5L13 10L8 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const newLearner =
    data.activeCourses.length === 0 && data.completedCourses.length === 0;
  const continueCourses = data.activeCourses.filter(
    (course) => course.continueTarget,
  );

  return (
    <ReferencePageShell section="Account">
      <div className={styles.pageBleed}>
        <div className={styles.pageInner}>
          <div className={styles.welcomeHeading}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <span className={styles.sectionEyebrow}>Learner dashboard</span>
            </div>
            <h1>Welcome back, {data.displayName}</h1>
            <p>
              Your learning progress, recent activity and saved lessons in
              one place.
            </p>
          </div>

          {newLearner ? (
            <section
              className={styles.onboarding}
              aria-labelledby="getting-started"
            >
              <span className={styles.iconBadge} aria-hidden="true">
                <CompassIcon />
              </span>
              <div>
                <p className={styles.sectionEyebrow}>Getting started</p>
                <h2 id="getting-started">Choose your first learning path</h2>
                <p>
                  Start with the market you want to understand first. Your
                  dashboard will begin tracking progress as soon as you open
                  a lesson.
                </p>
                <div className={styles.actions}>
                  <Link className={styles.primaryAction} href="/learn/forex">
                    Start with Forex
                  </Link>
                  <Link
                    className={styles.secondaryAction}
                    href="/learn/crypto"
                  >
                    Explore Crypto
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {continueCourses.length > 0 ? (
            <section
              className={styles.continueStack}
              aria-labelledby="continue-learning"
            >
              <h2 id="continue-learning" className={styles.srOnlyHeading}>
                Continue learning
              </h2>
              {continueCourses.map((course) => (
                <article className={styles.continueCard} key={course.id}>
                  <div className={styles.continueCardMain}>
                    <span className={styles.iconBadge} aria-hidden="true">
                      <PlayIcon />
                    </span>
                    <div className={styles.continueCardText}>
                      <p className={styles.sectionEyebrow}>
                        Pick up where you left off · {course.title}
                      </p>
                      <h3>{course.continueTarget!.title}</h3>
                      <p className={styles.mutedText}>
                        {course.continueTarget!.type === "quiz"
                          ? "Your lessons are complete. Take the required quiz to finish this course."
                          : "Continue with your most recent unfinished lesson."}
                      </p>
                    </div>
                  </div>
                  <Link
                    className={styles.primaryAction}
                    href={course.continueTarget!.href}
                  >
                    {course.continueTarget!.type === "quiz"
                      ? "Take the quiz"
                      : "Continue lesson"}
                    <ArrowIcon />
                  </Link>
                </article>
              ))}
            </section>
          ) : null}

          {data.activeCourses.length > 0 ? (
            <section className={styles.section} aria-labelledby="active-courses">
              <SectionHeader
                eyebrow="In progress"
                icon={<BookIcon />}
                title="Enrolled courses"
              />
              <div className={styles.stack}>
                {data.activeCourses.map((course) => (
                  <article className={styles.courseCard} key={course.id}>
                    <div className={styles.courseTopline}>
                      <div>
                        <h3>{course.title}</h3>
                        <p>
                          {course.progress.completed} of{" "}
                          {course.progress.total} required steps complete
                        </p>
                      </div>
                      <strong>
                        {percentageLabel(course.progress.percentage)}
                      </strong>
                    </div>
                    <progress
                      className={styles.progressBar}
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
              <SectionHeader
                eyebrow="Recent activity"
                icon={<ClockIcon />}
                title="Recent lessons"
              />
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
              <SectionHeader
                eyebrow="Assessments"
                icon={<CheckBadgeIcon />}
                title="Quiz scores"
              />
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
            <SectionHeader
              eyebrow="Saved for later"
              icon={<BookmarkIcon />}
              title="Bookmarks"
            />
            {data.bookmarks.length > 0 ? (
              <div className={styles.tileGrid}>
                {data.bookmarks.map((bookmark) => (
                  <div className={styles.tile} key={bookmark.id}>
                    <Link href={bookmark.href}>{bookmark.title}</Link>
                    <span>Saved {dateLabel(bookmark.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                No saved lessons yet. Bookmark useful lessons while you learn.
              </p>
            )}
          </section>

          {data.completedCourses.length > 0 ? (
            <section className={styles.section} aria-labelledby="completed-courses">
              <SectionHeader
                eyebrow="Finished"
                icon={<FlagIcon />}
                title="Completed courses"
              />
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
            <SectionHeader
              eyebrow="Your account"
              icon={<SlidersIcon />}
              title="Settings and notifications"
            />
            <div className={styles.tileGrid}>
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
        </div>
      </div>
    </ReferencePageShell>
  );
}
