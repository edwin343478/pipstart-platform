import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Email Preferences | Skillcima",
  description:
    "Information about Skillcima course delivery and optional educational emails.",
};

export default function EmailPreferencesPage() {
  return (
    <PageShell>
      <article>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Communication choices
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Email preferences
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          Newsletter preference management will be available before recurring
          newsletter delivery begins. Course delivery is handled separately from
          the optional educational newsletter.
        </p>

        <div className="mt-12 space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Requested communication
            </p>

            <h2 className="mt-3 font-heading text-2xl font-bold">
              Course delivery
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Course-delivery messages will be used to provide educational
              material that a learner directly requests.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Optional communication
            </p>

            <h2 className="mt-3 font-heading text-2xl font-bold">
              Continuing educational emails
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Continuing educational emails will be optional, unchecked by
              default and independently withdrawable.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Not currently collected
            </p>

            <h2 className="mt-3 font-heading text-2xl font-bold">
              Partner communications
            </h2>

            <p className="mt-4 leading-7 text-muted">
              The current Skillcima enrolment form does not request permission
              for partner or affiliate communications.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-7 text-warning">
          Functional preference controls will be added only after secure
          identity verification and the email system are implemented.
        </div>

        <Link
          href="/legal/privacy-policy"
          className="mt-8 inline-flex font-semibold text-brand-accent underline underline-offset-4"
        >
          Read the Privacy Policy
        </Link>
      </article>
    </PageShell>
  );
}
