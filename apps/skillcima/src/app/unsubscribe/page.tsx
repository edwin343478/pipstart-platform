import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Unsubscribe | Skillcima",
  description:
    "Information about withdrawing optional Skillcima educational-email consent.",
};

export default function UnsubscribePage() {
  return (
    <PageShell>
      <article>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Communication choices
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Unsubscribe
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          No live Skillcima newsletter subscription exists during the current
          development preview, so there is nothing to unsubscribe from yet.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-heading text-2xl font-bold">
            How this will work after launch
          </h2>

          <p className="mt-4 leading-7 text-muted">
            Educational newsletters will contain a secure unsubscribe link.
            Using that link will withdraw optional newsletter consent without
            automatically changing course-delivery records.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-7 text-warning">
          This page does not currently submit or update any information.
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover"
          >
            Return home
          </Link>

          <Link
            href="/email-preferences"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold transition-colors hover:bg-brand-soft"
          >
            View email preferences
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
