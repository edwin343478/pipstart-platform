import { forexFoundationsCourse } from "@repo/content";

import { HeroMotif } from "@/components/hero-motif";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CourseOverviewCard } from "@/components/course-overview-card";
import { CourseTimeline } from "@/components/course-timeline";
import { AudienceSection } from "@/components/audience-section";
import { FAQAccordion } from "@/components/faq-accordion";
import { DecorativeCornerShapes } from "@/components/decorative-corner-shapes";

const course = forexFoundationsCourse;

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content">
        <section className="relative overflow-hidden px-6 py-16 sm:py-24">
          <HeroMotif />

          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-foreground">
                Free five-day beginner course
              </p>

              <h1 className="mt-6 max-w-4xl font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
                Start with understanding, not guessing.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                Learn the terminology, mechanics and risks of Forex trading
                through a free, structured five-day course — built for complete
                beginners.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#course"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover hover:text-action-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Explore the lessons
                </a>

                <a
                  href="#signup"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold text-foreground transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Start free course
                </a>
              </div>
            </div>

            <CourseOverviewCard course={course} />
          </div>
        </section>

        <CourseTimeline />

        <AudienceSection />

        <FAQAccordion />

        <section
          id="signup"
          className="relative scroll-mt-24 overflow-hidden border-t border-border bg-brand-soft px-6 py-20 lg:py-28"
        >
          <DecorativeCornerShapes variant="accent-primary" />

          <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:pt-6">
              <p className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.15em] text-brand-accent">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-brand-accent"
                />
                Course enrolment
              </p>

              <h2 className="mt-4 max-w-lg font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Start your five-day Forex foundation
              </h2>

              <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
                Enter your details to request the free five-day Forex
                Foundations course by email. We use the information you submit
                to process your enrolment and course delivery. Continuing
                educational emails are sent only if you choose the optional
                newsletter consent.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary font-heading text-sm font-bold text-foreground"
                >
                  5
                </span>

                <p className="text-sm leading-6 text-muted">
                  Five structured beginner lessons focused on understanding
                  before trading.
                </p>
              </div>
            </div>

            <LeadForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
