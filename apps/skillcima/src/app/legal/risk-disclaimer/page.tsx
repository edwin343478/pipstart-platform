import type { Metadata } from "next";

import { RiskNotice } from "@repo/ui";

export const metadata: Metadata = {
  title: "Risk Disclaimer | Skillcima",
  description:
    "Important risk information concerning Forex and cryptocurrency education.",
};

export default function RiskDisclaimerPage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        Important information
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Risk Disclaimer
      </h1>

      <p className="mt-4 text-sm text-muted">Last updated: 6 August 2026</p>

      <div className="mt-10">
        <RiskNotice title="Trading involves substantial financial risk">
          Forex and cryptocurrency markets can be highly volatile. It is
          possible to lose some or all of the money committed to trading.
        </RiskNotice>
      </div>

      <div className="mt-10 space-y-10 leading-8 text-muted">
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Leverage can increase losses
          </h2>

          <p className="mt-4">
            Leveraged products may magnify both gains and losses. Small market
            movements can therefore have a large effect on a trading account.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Education is not advice
          </h2>

          <p className="mt-4">
            Skillcima content is general education. It does not consider an
            individual&apos;s finances, objectives, experience or tolerance for
            risk.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            No signals or profit guarantees
          </h2>

          <p className="mt-4">
            Skillcima does not provide trading signals, managed trading,
            guaranteed strategies or promises of profit.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Make independent decisions
          </h2>

          <p className="mt-4">
            Learners should conduct their own research and obtain appropriately
            qualified independent advice before making financial decisions.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-6 text-warning">
        This risk disclaimer applies to Skillcima&apos;s educational content and
        should be read before using the materials.
      </div>
    </article>
  );
}
