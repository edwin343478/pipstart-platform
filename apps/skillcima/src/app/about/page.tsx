import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "About | Skillcima",
  description:
    "Learn about Skillcima and its structured, risk-conscious educational approach.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <article>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          About Skillcima
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Financial-market education that starts with understanding
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          Skillcima is an educational microsite designed to introduce complete
          beginners to Forex and cryptocurrency concepts through free,
          structured and risk-conscious learning.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-heading text-2xl font-bold">
              Our educational purpose
            </h2>

            <p className="mt-4 leading-8 text-muted">
              The purpose of Skillcima is to help learners understand essential
              terminology, market mechanics and financial risk before they
              consider using real money.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold">
              What learners can expect
            </h2>

            <ul className="mt-5 space-y-4 leading-7 text-muted">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-bold text-brand-accent"
                >
                  ✓
                </span>
                <span>Clear lessons designed for complete beginners.</span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-bold text-brand-accent"
                >
                  ✓
                </span>
                <span>Education presented in a structured learning order.</span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-bold text-brand-accent"
                >
                  ✓
                </span>
                <span>
                  Prominent explanations of trading and leverage risk.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold">
              What Skillcima does not offer
            </h2>

            <p className="mt-4 leading-8 text-muted">
              Skillcima does not provide trading signals, personal financial
              advice, guaranteed strategies, managed trading services or
              promises of profit.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-xl font-bold">
              Current development stage
            </h2>

            <p className="mt-3 leading-7 text-muted">
              Skillcima is currently being developed and tested. Course delivery
              and email systems are not active yet.
            </p>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
