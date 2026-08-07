"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-background px-6 py-20 text-foreground"
    >
      <div
        role="alert"
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8 text-center shadow-sm sm:p-12"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Something went wrong
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight">
          We could not load this page
        </h1>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
          An unexpected problem occurred. You can try loading this page again or
          return to the Skillcima homepage.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold text-foreground transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
