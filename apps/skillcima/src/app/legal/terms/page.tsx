import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Skillcima",
  description: "Terms governing use of Skillcima educational content.",
};

export default function TermsPage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        Legal information
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Terms of Use
      </h1>

      <p className="mt-4 text-sm text-muted">Last updated: 6 August 2026</p>

      <div className="mt-10 space-y-10 leading-8 text-muted">
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Educational purpose
          </h2>

          <p className="mt-4">
            Skillcima provides general educational information about Forex and
            cryptocurrency concepts. The content is not personal financial,
            investment, legal or tax advice.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            No guaranteed outcome
          </h2>

          <p className="mt-4">
            Skillcima does not promise profit, successful trading, employment,
            income or any specific financial result.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Responsible use
          </h2>

          <p className="mt-4">
            Visitors must not misuse the website, attempt unauthorised access,
            interfere with its operation or use its material for unlawful
            purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Availability
          </h2>

          <p className="mt-4">
            Educational content and website features may be corrected, replaced,
            suspended or withdrawn as the platform develops.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Changes to these terms
          </h2>

          <p className="mt-4">
            Material changes will be reflected by an updated date on this page.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-6 text-warning">
        These terms apply to the current Skillcima service and may be updated as
        the service evolves.
      </div>
    </article>
  );
}
