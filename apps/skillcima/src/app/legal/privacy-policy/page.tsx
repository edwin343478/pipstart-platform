import type { Metadata } from "next";

import { SKILLCIMA_PRIVACY_NOTICE_VERSION } from "@/lib/privacy-notice-version";

export const metadata: Metadata = {
  title: "Privacy Policy | Skillcima",
  description:
    "How Skillcima handles course enrolment information and communication choices.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        Legal information
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Privacy Policy
      </h1>

      <p className="mt-4 text-sm text-muted">
        Last updated:{" "}
        <time dateTime={SKILLCIMA_PRIVACY_NOTICE_VERSION}>
          {new Date(SKILLCIMA_PRIVACY_NOTICE_VERSION).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            },
          )}
        </time>
      </p>

      <div className="mt-10 space-y-10 leading-8 text-muted">
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Current production data handling
          </h2>

          <p className="mt-4">
            When you submit the Skillcima enrolment form, the information is
            transmitted securely to our server-side systems for validation,
            enrolment processing and course delivery. We store the information
            needed to operate the enrolment workflow and record applicable
            consent evidence.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Information we collect
          </h2>

          <p className="mt-4">
            When the secure enrolment system is activated, Skillcima expects to
            collect an email address, an optional first name, acknowledgement of
            the Privacy Notice and any optional educational newsletter choice.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            How the information will be used
          </h2>

          <p className="mt-4">
            An email address will be used to deliver the course requested by the
            learner. Continuing educational emails will only be sent when the
            learner separately chooses to receive them.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Website analytics
          </h2>
          <p className="mt-4">
            We use Cloudflare Web Analytics for aggregate website usage and
            performance measurements. Cloudflare describes this service as
            cookieless and states that it does not collect or use visitors&apos;
            personal data. It also states that query strings are not logged.
          </p>
          <p className="mt-4">
            These measurements are separate from course enrolment information
            and email-marketing preferences. Skillcima&apos;s analytics
            configuration is managed separately from PipStart&apos;s.
          </p>
          <p className="mt-4">
            Read{" "}
            <a
              className="font-semibold underline underline-offset-4"
              href="https://developers.cloudflare.com/web-analytics/about/"
            >
              Cloudflare&apos;s description of Web Analytics
            </a>{" "}
            and its{" "}
            <a
              className="font-semibold underline underline-offset-4"
              href="https://developers.cloudflare.com/web-analytics/faq/"
            >
              data collection FAQ
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Your choices
          </h2>

          <p className="mt-4">
            Newsletter consent will remain optional and independent from course
            delivery. Learners will be able to withdraw optional consent without
            losing access to educational material already requested.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Retention and deletion
          </h2>

          <p className="mt-4">
            Final retention periods, deletion procedures and contact details
            will be published before the enrolment system becomes publicly
            active.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-6 text-warning">
        This policy describes Skillcima&apos;s current data-handling practices
        and may be updated as the service evolves.
      </div>
    </article>
  );
}
