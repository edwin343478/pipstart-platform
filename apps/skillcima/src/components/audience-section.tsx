import { forexFoundationsCourse } from "@repo/content";
import { Card } from "@repo/ui";

import { CheckGlyph, CrossGlyph } from "./glyph-icons";
import { DecorativeCornerShapes } from "./decorative-corner-shapes";

const course = forexFoundationsCourse;

export function AudienceSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-24">
      <DecorativeCornerShapes variant="accent-primary" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-brand-accent"
            />
            Who this course is for
          </p>

          <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find out if this is the{" "}
            <span className="text-brand-accent">right fit</span> for you
          </h2>

          <p className="mt-5 text-lg leading-8 text-muted">
            Built for learners who want real knowledge and skills —{" "}
            <span className="font-semibold text-foreground">
              not shortcuts.
            </span>
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-primary/50 bg-brand-soft p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary"
              >
                <CheckGlyph className="mt-0 h-4 w-4 text-foreground" />
              </span>

              <h3 className="font-heading text-xl font-bold text-foreground">
                This course is for
              </h3>
            </div>

            <ul className="mt-6 space-y-3">
              {course.audience.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckGlyph />

                  <span className="leading-7 text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm leading-6 text-muted">
              If you&apos;re teachable, patient and committed to learning — we
              built this for you.
            </p>
          </div>

          <Card className="sm:p-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-border"
              >
                <CrossGlyph className="mt-0 h-4 w-4 text-muted" />
              </span>

              <h3 className="font-heading text-xl font-bold text-foreground">
                This course is not for
              </h3>
            </div>

            <ul className="mt-6 space-y-3">
              {course.notFor.map((item) => (
                <li key={item} className="flex gap-3">
                  <CrossGlyph />

                  <span className="leading-7 text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
