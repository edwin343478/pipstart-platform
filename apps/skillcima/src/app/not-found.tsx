import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main
        id="main-content"
        className="flex min-h-[60vh] items-center px-6 py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
            Error 404
          </p>

          <h1 className="mt-4 font-heading text-5xl font-bold tracking-tight">
            Page not found
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted">
            The page may have moved, the address may be incorrect or the
            requested page may not exist.
          </p>

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
              Explore the course
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
