import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Thank You | Skillcima",
  description: "Take the final step to begin Skillcima Forex Foundations.",
};

export default function ThankYouPage() {
  return (
    <PageShell variant="encouraging">
      <article className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold"
        >
          {"\u2713"}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-brand-accent">
          One more step
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          You&apos;re almost there!
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          Check your inbox for a confirmation email from Skillcima. Select
          &ldquo;Confirm my course,&rdquo; and we&apos;ll send your first lesson
          shortly after.
        </p>

        <div className="mt-10 rounded-2xl border border-warning-border bg-warning-soft p-6 text-left text-sm leading-7 text-warning">
          <span className="font-semibold uppercase tracking-wider">
            What happens next
          </span>
          <span className="mt-2 block">
            Open the email, confirm your place and get ready to begin.
            We&apos;ll guide you through one clear and practical lesson at a
            time.
          </span>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover"
          >
            Return to Skillcima
          </Link>

          <Link
            href="/#course"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold transition-colors hover:bg-brand-soft"
          >
            See what you&apos;ll learn
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
