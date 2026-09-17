"use client";

import Link from "next/link";

import type {
  CurriculumCourse,
  CurriculumLevel,
  CurriculumModule,
  LearningPath,
} from "../lib/curriculum";
import { createBreadcrumbJsonLd } from "../lib/seo";
import {
  calculateModuleCompletion,
  calculateProgress,
  getModuleRequiredAssessmentIds,
} from "../lib/permanent-progress";
import {
  parseLocalProgress,
  serializeLocalProgress,
} from "../lib/local-progress";
import { usePermanentProgress } from "../lib/use-permanent-progress";
import { Breadcrumbs } from "./breadcrumbs";
import { JsonLd } from "./json-ld";
import { CompactFooter, CompactHeader } from "./site-chrome";
// Course and module hierarchy pages intentionally reuse the already-approved
// learning-path visual system. Keep hierarchy changes structural rather than
// introducing a second set of cards, spacing or responsive rules.
import styles from "../app/learn/forex/page.module.css";

type CurriculumPageProps = {
  course: CurriculumCourse;
  kind: "course" | "module";
  level: CurriculumLevel;
  learningPath: LearningPath;
  module?: CurriculumModule;
};

export function CurriculumPage({
  course,
  kind,
  level,
  learningPath,
  module,
}: CurriculumPageProps) {
  const current = module ?? course;
  const breadcrumbs = [
    { href: "/", label: "Home", name: "Home", path: "/" },
    {
      href: learningPath.href,
      label: learningPath.title,
      name: learningPath.title,
      path: learningPath.href,
    },
    {
      href: level.href,
      label: level.title,
      name: level.title,
      path: level.href,
    },
    ...(module
      ? [
          {
            href: course.href,
            label: course.title,
            name: course.title,
            path: course.href,
          },
        ]
      : []),
    { label: current.title, name: current.title, path: current.href },
  ];
  const cards = module ? module.lessons : course.modules;
  const lessons = module
    ? module.lessons
    : course.modules.flatMap((item) => item.lessons);
  const pathProgress =
    learningPath.id === "forex"
      ? {
          eventName: "pipstart:forex-progress-change",
          storageKey: "pipstart:learn:forex:level-1:progress",
        }
      : {
          eventName: "pipstart:crypto-progress-change",
          storageKey: "pipstart:learn:crypto:level-1:progress",
        };
  const progress = usePermanentProgress({
    courseId: course.id,
    ...pathProgress,
    parse: parseLocalProgress,
    serialize: serializeLocalProgress,
    validIds: lessons
      .filter((lesson) => lesson.type === "lesson")
      .map((lesson) => lesson.id),
  });
  const summary = calculateProgress(lessons, progress.completedIds);

  return (
    <main className={styles.page}>
      <CompactHeader
        className={styles.header}
        section={`${learningPath.title} · ${level.title}`}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          breadcrumbs.map(({ name, path }) => ({ name, path })),
        )}
      />
      <section className={styles.introduction}>
        <Breadcrumbs
          items={breadcrumbs.map(({ href, label }) => ({ href, label }))}
        />
        <span>
          {level.title} · {kind === "course" ? "Course" : "Module"}
        </span>
        <h1>{current.title}</h1>
        <p>{current.description}</p>
        <p aria-live="polite">
          {summary.completed} of {summary.total} lessons complete ·{" "}
          {summary.percentage}%
        </p>
      </section>

      <section className={styles.curriculum} aria-labelledby="curriculum-items">
        <h2 id="curriculum-items">
          {kind === "course" ? "What You’ll Learn" : "Lessons"}
        </h2>
        <ol className={styles.timeline}>
          {cards.map((item, index) => {
            const itemProgress = calculateProgress(
              "type" in item ? [item] : item.lessons,
              progress.completedIds,
            );
            const assessmentComplete =
              "type" in item &&
              item.type === "quiz" &&
              progress.snapshot?.assessments?.some(
                (assessment) => assessment.assessmentId === item.id,
              );
            const itemComplete =
              "type" in item
                ? item.type === "quiz"
                  ? Boolean(assessmentComplete)
                  : itemProgress.percentage === 100
                : progress.snapshot?.authenticated
                  ? calculateModuleCompletion(item, progress.snapshot).complete
                  : itemProgress.percentage === 100 &&
                    getModuleRequiredAssessmentIds(item).length === 0;
            return (
              <li key={item.id}>
                <span className={styles.marker} aria-hidden="true">
                  {index + 1}
                </span>
                <Link
                  className={`${styles.levelCard} ${styles.availableLevel}`}
                  href={item.href}
                >
                  <span className={styles.levelMeta}>
                    <span>
                      {"type" in item ? item.type : "Module"} {index + 1} of{" "}
                      {cards.length}
                    </span>
                    <strong>
                      {itemComplete ? "Completed" : "Available"}
                    </strong>
                  </span>
                  <h3>{item.title}</h3>
                  {"description" in item ? <p>{item.description}</p> : null}
                  <span className={styles.startLevel}>
                    {"type" in item && item.type === "quiz"
                      ? itemComplete
                        ? "Retake quiz"
                        : "Start quiz"
                      : itemProgress.completed > 0
                        ? "Continue"
                        : "type" in item
                          ? "Start lesson"
                          : "View module"}{" "}
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
