import { forexFoundationsCourse } from "@repo/content";
import { Card, RiskNotice } from "@repo/ui";

import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const course = forexFoundationsCourse;

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content">
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold">
                Free five-day beginner course
              </p>

              <h1 className="mt-6 max-w-4xl font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
                {course.tagline}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                {course.description}
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
                  Preview enrolment
                </a>
              </div>
            </div>

            <Card padded={false} className="p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
                Course overview
              </p>

              <dl className="mt-6 space-y-5">
                <div className="flex justify-between border-b border-border pb-5">
                  <dt className="text-muted">Duration</dt>
                  <dd className="font-semibold">{course.durationDays} days</dd>
                </div>

                <div className="flex justify-between border-b border-border pb-5">
                  <dt className="text-muted">Level</dt>
                  <dd className="font-semibold">Beginner</dd>
                </div>

                <div className="flex justify-between border-b border-border pb-5">
                  <dt className="text-muted">Cost</dt>
                  <dd className="font-semibold">Free</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted">Trading signals</dt>
                  <dd className="font-semibold">None</dd>
                </div>
              </dl>
            </Card>
          </div>
        </section>

        <section
          id="course"
          className="scroll-mt-24 border-y border-border bg-surface px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Five structured lessons
            </p>

            <h2 className="mt-4 font-heading text-4xl font-bold">
              Learn the foundations in a sensible order
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {course.lessons.map((lesson) => (
                <Card key={lesson.slug}>
                  <p className="text-sm font-semibold text-muted">
                    Day {lesson.day}
                  </p>

                  <h3 className="mt-2 font-heading text-xl font-bold">
                    {lesson.title}
                  </h3>

                  <p className="mt-4 leading-7 text-muted">{lesson.summary}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <Card>
              <h2 className="font-heading text-2xl font-bold">
                This course is for
              </h2>

              <ul className="mt-6 space-y-4">
                {course.audience.map((item) => (
                  <li key={item} className="flex gap-3 leading-7">
                    <span aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-heading text-2xl font-bold">
                This course is not for
              </h2>

              <ul className="mt-6 space-y-4">
                {course.notFor.map((item) => (
                  <li key={item} className="flex gap-3 leading-7">
                    <span aria-hidden="true">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <RiskNotice title="Forex trading involves substantial risk">
              Skillcima provides education only. It does not provide trading
              signals, personal financial advice, broker recommendations or
              guaranteed financial outcomes.
            </RiskNotice>
          </div>
        </section>

        <section
          id="privacy-summary"
          className="scroll-mt-24 border-y border-border bg-surface px-6 py-16"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="font-heading text-3xl font-bold">Privacy summary</h2>

            <p className="mt-5 leading-8 text-muted">
              When the real enrolment system is activated, Skillcima will use
              the submitted email to deliver the requested course. Continuing
              educational emails will remain optional and can be withdrawn
              independently.
            </p>

            <a
              href="/legal/privacy-policy"
              className="mt-5 inline-flex font-semibold text-brand-accent underline underline-offset-4"
            >
              Read the full Privacy Policy
            </a>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
                Common questions
              </p>

              <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight">
                Before you start
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted">
                Clear answers about what the course is, what it is not and what
                you should expect.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <Card>
                <h3 className="font-heading text-xl font-bold">
                  Is the course really free?
                </h3>

                <p className="mt-3 leading-7 text-muted">
                  Yes. The five-day Forex Foundations course is designed as free
                  beginner education. There is no payment required to access the
                  introductory course.
                </p>
              </Card>

              <Card>
                <h3 className="font-heading text-xl font-bold">
                  Do I need a broker account to learn?
                </h3>

                <p className="mt-3 leading-7 text-muted">
                  No. You can learn the terminology, market mechanics and risk
                  concepts without opening or funding a brokerage account.
                </p>
              </Card>

              <Card>
                <h3 className="font-heading text-xl font-bold">
                  Will Skillcima send me trading signals?
                </h3>

                <p className="mt-3 leading-7 text-muted">
                  No. Skillcima does not provide buy or sell signals, managed
                  trading, guaranteed strategies or promises of profit.
                </p>
              </Card>

              <Card>
                <h3 className="font-heading text-xl font-bold">
                  Is this financial advice?
                </h3>

                <p className="mt-3 leading-7 text-muted">
                  No. Skillcima provides general educational information. It
                  does not consider your personal finances, objectives or
                  individual tolerance for risk.
                </p>
              </Card>

              <Card>
                <h3 className="font-heading text-xl font-bold">
                  Can I lose money trading Forex?
                </h3>

                <p className="mt-3 leading-7 text-muted">
                  Yes. Forex trading involves substantial financial risk, and
                  leverage can magnify losses. Learning about risk is therefore
                  part of the course from the beginning.
                </p>

                <a
                  href="/legal/risk-disclaimer"
                  className="mt-4 inline-flex font-semibold text-brand-accent underline underline-offset-4"
                >
                  Read the Risk Disclaimer
                </a>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="signup"
          className="scroll-mt-24 bg-foreground px-6 py-20 text-background"
        >
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
                Enrolment preview
              </p>

              <h2 className="mt-4 font-heading text-4xl font-bold">
                Start with understanding, not speculation
              </h2>

              <p className="mt-5 text-lg leading-8 text-background/70">
                Test the accessible form and its validation. No information is
                transmitted during this development step.
              </p>
            </div>

            <LeadForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
