import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-action px-4 py-3 font-semibold text-action-foreground focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to content
      </a>

      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Skillcima
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-5"
          >
            <Link
              href="/#course"
              className="hidden text-sm font-semibold text-muted transition-colors hover:text-foreground sm:inline"
            >
              Course
            </Link>

            <Link
              href="/legal/risk-disclaimer"
              className="hidden text-sm font-semibold text-muted transition-colors hover:text-foreground md:inline"
            >
              Risk notice
            </Link>

            <Link
              href="/#signup"
              className="rounded-xl bg-action px-5 py-3 text-sm font-semibold text-action-foreground transition-colors hover:bg-action-hover hover:text-action-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Join free
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
