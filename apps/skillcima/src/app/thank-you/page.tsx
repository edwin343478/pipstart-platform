import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Thank You | Skillcima",
  description: "Skillcima enrolment confirmation page.",
};

export default function ThankYouPage() {
  return (
    <PageShell>
      <article className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold"
        >
          {"\u2713"}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Enrolment journey
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Thank you
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          Your enrolment request has been securely received and recorded. Course
          email delivery will be connected in the next stage of the enrolment
          workflow.
        </p>

        <div className="mt-10 rounded-2xl border border-warning-border bg-warning-soft p-6 text-left text-sm leading-7 text-warning">
          Visiting this page directly does not prove that an enrolment was
          submitted. A valid enrolment request is recorded only after the form
          passes validation and security verification.
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover"
          >
            Return home
          </Link>

          <Link
            href="/#course"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold transition-colors hover:bg-brand-soft"
          >
            Review the course
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
