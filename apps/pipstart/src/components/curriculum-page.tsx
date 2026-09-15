import Link from "next/link";

import type {
  CurriculumCourse,
  CurriculumLevel,
  CurriculumModule,
  LearningPath,
} from "../lib/curriculum";
import { createBreadcrumbJsonLd } from "../lib/seo";
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
      </section>

      <section className={styles.curriculum} aria-labelledby="curriculum-items">
        <h2 id="curriculum-items">
          {kind === "course" ? "What You’ll Learn" : "Lessons"}
        </h2>
        <ol className={styles.timeline}>
          {cards.map((item, index) => (
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
                  <strong>Available</strong>
                </span>
                <h3>{item.title}</h3>
                {"description" in item ? <p>{item.description}</p> : null}
                <span className={styles.startLevel}>
                  {"type" in item ? "Start lesson" : "View module"} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
