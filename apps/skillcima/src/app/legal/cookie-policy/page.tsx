import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Skillcima",
  description:
    "Information about cookies and similar technologies on Skillcima.",
};

export default function CookiePolicyPage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        Legal information
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Cookie Policy
      </h1>

      <p className="mt-4 text-sm text-muted">Last updated: 6 August 2026</p>

      <div className="mt-10 space-y-10 leading-8 text-muted">
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Current website
          </h2>

          <p className="mt-4">
            The current development version of Skillcima does not intentionally
            set advertising or behavioural-tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Essential technologies
          </h2>

          <p className="mt-4">
            The production website may use essential technologies required for
            security, abuse prevention, course enrolment and basic website
            operation.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Analytics and optional technologies
          </h2>

          <p className="mt-4">
            Any future analytics or optional technologies will be documented
            before activation, including their purpose and the available visitor
            choices.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Policy updates
          </h2>

          <p className="mt-4">
            This policy will be updated when the final hosting, security,
            analytics and consent tools are confirmed.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-6 text-warning">
        This is an initial development draft and must receive appropriate legal
        review before public launch.
      </div>
    </article>
  );
}
