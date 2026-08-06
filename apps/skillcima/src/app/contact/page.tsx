import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Contact | Skillcima",
  description:
    "Contact information and support guidance for Skillcima learners.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <article>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Contact
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          How to contact Skillcima
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          Skillcima&apos;s official support channel is being prepared and will
          be published before the website becomes publicly active.
        </p>

        <div className="mt-12 space-y-8">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-bold">General support</h2>

            <p className="mt-4 leading-7 text-muted">
              An official support email address will be added after the domain
              email service and security records have been configured.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-bold">
              Privacy questions
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Privacy enquiries and data-rights requests will receive a
              dedicated contact method before the enrolment system is activated.
            </p>

            <Link
              href="/legal/privacy-policy"
              className="mt-5 inline-flex font-semibold text-brand-accent underline underline-offset-4"
            >
              Read the Privacy Policy
            </Link>
          </section>

          <section className="rounded-2xl border border-warning-border bg-warning-soft p-6">
            <h2 className="font-heading text-xl font-bold text-warning">
              Do not send financial account information
            </h2>

            <p className="mt-3 leading-7 text-warning">
              Skillcima will never need a trading password, banking password,
              private key, seed phrase or remote access to a learner&apos;s
              device.
            </p>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
