import type { Metadata } from "next";

import { ReferencePageShell } from "@/components/reference-page-shell";

import styles from "../../public-page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PipStart handles account, learning, support and email data.",
};

export default function PrivacyPolicyPage() {
  return (
    <ReferencePageShell section="Legal">
      <article>
        <p className={styles.eyebrow}>Legal information</p>
        <h1 className={`${styles.title} ${styles.legalTitle}`}>
          Privacy Policy
        </h1>
        <p className={styles.updated}>Last updated: 24 October 2026</p>

        <section className={styles.legalSection}>
          <h2>Who to contact</h2>
          <p>
            PipStart provides this learning service. Contact PipStart at{" "}
            <a href="mailto:support@pipstart.net">support@pipstart.net</a> for
            support, privacy questions or data-rights requests. We may need to
            verify account ownership before handling an account-specific
            request.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Current production data handling</h2>
          <p>
            PipStart stores anonymous lesson progress locally on your device. If
            you create an account, we also store your email address, display
            name, role, email preferences, enrollment, lesson completion and
            recent learning activity. Broker and exchange links may be tracked
            for affiliate attribution when clicked.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Information we collect</h2>
          <p>
            We collect the account details you provide, authentication and
            security records needed to protect the service, and the email
            preferences you select. When you sign in, valid anonymous progress
            can be imported for cross-device synchronization.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>How the information will be used</h2>
          <p>
            To create and secure your learner account, provide account settings,
            synchronize learning progress, deliver messages you request, and
            respect your communication choices.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Your choices</h2>
          <p>
            Local progress can be cleared by clearing your browser&apos;s site
            data. Signed-in learners can edit their profile, change optional
            email preferences, end sessions, change their password, or delete
            their account from Account settings.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Optional email preferences</h2>
          <p>
            The learning-email and partner-offer choices are ON by default at
            signup. You can turn either off before creating your account and
            change them later in{" "}
            <a href="/account/email-preferences">Email preferences</a>. Learning
            frequency is a separate choice; selecting Weekly does not turn an
            OFF category back on. These settings record your choices, not a
            claim that you gave express consent to a campaign.
          </p>
          <p>
            Customer optional-email campaigns are currently disabled. Saving a
            preference does not schedule an email. Optional-email delivery is
            designed to include category and all-optional unsubscribe choices;
            changing these choices does not turn off password-reset or essential
            account-security messages. Partner offers, if separately approved,
            would be sent by PipStart; the implemented email system does not
            export learner addresses to partners.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Email choices, delivery and suppression records</h2>
          <p>
            We store preference changes and unsubscribe actions with the
            relevant account, category, source and time. Unsubscribe links use
            secret tokens; their lookup records store token hashes. Private
            prepared email content can also contain the working links, so those
            records require restricted access.
          </p>
          <p>
            Delivery monitoring records provider message identifiers, event
            types, timestamps and operational alert or sweep status. A delivered
            event means the receiving mail server accepted a message, not that
            it appeared in your inbox. To prevent further optional sends after
            hard bounces, complaints or provider suppression, we retain
            normalized email-address hashes and related suppression evidence.
            These hashes can still be linked to an address and are not anonymous
            data.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Service providers and support messages</h2>
          <p>
            Supabase supports account authentication and application records;
            Vercel hosts the site; Resend handles email delivery; and Zoho Mail
            handles messages sent to our support address and our replies. Email
            delivery providers process the recipient address and message content
            needed for delivery. Support messages can contain your email
            address, message text, attachments and information needed to address
            your request. Please do not send passwords, recovery links, trading
            or banking credentials, private keys or seed phrases.
          </p>
          <p>
            We also use Healthchecks to receive operational heartbeat signals
            for the email-monitoring sweep, not learner message bodies or
            recipient addresses. Providers may hold their own service logs and
            backups; deleting an application record is not a promise that every
            provider copy is immediately erased.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Third-party economic calendar</h2>
          <p>
            The economic calendar embeds TradingView content when its calendar
            area comes into view. Loading it connects your browser directly to
            TradingView and its infrastructure. TradingView receives your IP
            address, the page address and browser request information, and may
            use its own cookies or storage under its policies. PipStart does not
            send your learner account details or learning progress to the
            widget, and does not copy its event feed into a PipStart database.
          </p>
          <p>
            You can use our static event explanations and official-source links
            without relying on the widget. Browser blocking tools may prevent
            the calendar loading. Opening an external link connects you to that
            website, which applies its own policies. See the{" "}
            <a
              href="https://www.tradingview.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TradingView privacy policy
            </a>
            .
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Retention and deletion</h2>
          <p>
            Account deletion removes the authentication account and its linked
            PipStart profile, preferences, enrollment, progress and learning
            events. It also removes linked preference history, unsubscribe
            records and optional-email jobs and their dependent records. Local
            progress must be cleared separately from your browser.
          </p>
          <p>
            Independent delivery-monitoring records, address-level suppression,
            cadence budgets and owner-action evidence are not all removed by
            account deletion. An address-level delivery block can remain after
            deletion. By contrast, category preferences and their history are
            account-linked: if you later create a new account, the current
            signup defaults can apply again. Deleting an account is not an
            independent, permanent category unsubscribe for a future account.
          </p>
          <p>
            Optional-email cleanup is manual. Existing review thresholds are 90
            days for eligible completed message content, 31 days for cadence
            reservations and 365 days for recovery audits. These are guarded
            review thresholds, not automatic deletion dates. Unresolved work,
            valid unsubscribe links and investigation holds need separate
            protection and review. Other operational records, support messages,
            provider logs and backups have separate lifecycles. Contact{" "}
            <a href="mailto:support@pipstart.net">support@pipstart.net</a> to
            ask about your records or request a review; do not assume account
            deletion removes every independent record or external copy.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
