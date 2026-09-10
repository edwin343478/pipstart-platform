import Link from "next/link";
import type { ReactNode } from "react";

type LearningHeaderProps = {
  allLevelsClassName?: string;
  allLevelsHref: string;
  allLevelsLabel: string;
  brandClassName?: string;
  className?: string;
  contextClassName?: string;
  levelLabel: string;
};

export function LearningHeader({
  allLevelsClassName,
  allLevelsHref,
  allLevelsLabel,
  brandClassName,
  className,
  contextClassName,
  levelLabel,
}: LearningHeaderProps) {
  return (
    <header className={className}>
      <Link className={brandClassName} href="/" aria-label="PipStart home">
        PipStart
      </Link>
      <div className={contextClassName}>
        <Link className={allLevelsClassName} href={allLevelsHref}>
          ← {allLevelsLabel}
        </Link>
        <span>{levelLabel}</span>
      </div>
    </header>
  );
}

type LessonNavigationProps = {
  className?: string;
  next?: { href: string; label: ReactNode };
  previous?: { href: string; label: ReactNode };
};

export function LessonNavigation({
  className,
  next,
  previous,
}: LessonNavigationProps) {
  return (
    <nav className={className} aria-label="Lesson navigation">
      {previous ? (
        <Link href={previous.href}>← {previous.label}</Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link href={next.href}>{next.label} →</Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
