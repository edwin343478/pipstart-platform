"use client";

import { forexFoundationsCourse } from "@repo/content";
import { Card } from "@repo/ui";
import { Clock } from "lucide-react";
import { DecorativeCornerShapes } from "./decorative-corner-shapes";

export function CourseTimeline() {
  const lessons = forexFoundationsCourse.lessons;

  return (
    <section
      id="course"
      className="relative scroll-mt-24 overflow-hidden border-y border-border bg-brand-soft py-20 lg:py-28"
    >
      <DecorativeCornerShapes variant="primary-accent" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.15em] text-brand-accent">
            Curriculum
          </span>

          <h2 className="mt-3 mb-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            What You&apos;ll Learn
          </h2>

          <p className="mx-auto max-w-lg leading-7 text-muted">
            Five focused lessons delivered straight to your inbox. No fluff, no
            filler — just the fundamentals you need before risking real money.
          </p>
        </div>

        <div className="relative pl-12 md:pl-14">
          <div className="absolute top-6 bottom-6 left-5 w-[2px] bg-gradient-to-b from-brand-primary to-brand-primary/10 md:left-6" />

          <div className="space-y-6">
            {lessons.map((lesson) => {
              return (
                <div key={lesson.day} className="relative">
                  <div
                    className="absolute top-0 -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary font-heading text-sm font-bold text-foreground shadow-sm md:-left-14 md:h-9 md:w-9"
                    style={{ transform: "translateX(0.5rem)" }}
                  >
                    {lesson.day}
                  </div>

                  <Card className="rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/60 hover:shadow-[0_12px_24px_-8px_rgba(36,31,25,0.10)]">
                    <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                      {lesson.title}
                    </h3>

                    <p className="mb-4 text-sm leading-relaxed text-muted">
                      {lesson.summary}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 px-3 py-1 text-xs text-foreground">
                        <Clock className="h-3 w-3" />
                        Short read
                      </span>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
