import Link from "next/link";

const footerLinks = [
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
  {
    href: "/legal/privacy-policy",
    label: "Privacy",
  },
  {
    href: "/legal/terms",
    label: "Terms",
  },
  {
    href: "/legal/cookie-policy",
    label: "Cookies",
  },
  {
    href: "/legal/risk-disclaimer",
    label: "Risk disclaimer",
  },
] as const;

type SiteFooterProps = {
  variant?: "default" | "encouraging";
};

export function SiteFooter({ variant = "default" }: SiteFooterProps) {
  const isEncouraging = variant === "encouraging";
  const visibleFooterLinks = isEncouraging
    ? footerLinks.filter((link) => link.href !== "/legal/risk-disclaimer")
    : footerLinks;
  return (
    <footer className="border-t border-border bg-surface px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="font-heading text-lg font-bold">
            Skillcima
          </Link>

          {isEncouraging ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              Friendly Forex lessons that help complete beginners learn one
              clear concept at a time.
            </p>
          ) : (
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              Free, structured and risk-conscious Forex education for complete
              beginners.
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-muted">
            {isEncouraging
              ? "Keep learning, stay curious and enjoy every step."
              : "Educational content only. No trading signals, profit guarantees or broker recommendations."}
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {visibleFooterLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-semibold text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-6 text-xs text-muted">
        © 2026 Skillcima. All rights reserved.
      </div>
    </footer>
  );
}
