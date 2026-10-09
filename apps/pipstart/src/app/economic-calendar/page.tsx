import Link from "next/link";
import { CalendarDocumentBoundary } from "../../components/calendar-document-boundary";
import { CompactFooter, CompactHeader } from "../../components/site-chrome";
import { EconomicCalendarWidget } from "../../components/economic-calendar-widget";
import { calendarExplainers } from "../../content/calendar-explainers";
import {
  calendarLessonUrl,
  fullCalendarUrl,
  officialCalendarSources,
} from "../../lib/economic-calendar";
import { createPageMetadata } from "../../lib/seo";
import styles from "./page.module.css";

export const metadata = createPageMetadata("/economic-calendar");

export default function EconomicCalendarPage() {
  return (
    <main className={styles.page} data-economic-calendar>
      {/* Match the approved lesson/glossary fallback: streamed HTML must remain
          readable without JavaScript, using our markers rather than stream IDs. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>
            @layer base {
              [hidden]:has([data-economic-calendar]) { display: block !important; }
              body:has([data-economic-calendar]) [data-route-loading] { display: none !important; }
              [data-economic-calendar] [data-calendar-state] { display: none !important; }
            }
          </style>`,
        }}
      />
      <CalendarDocumentBoundary />
      <CompactHeader className={styles.header} section="Economic calendar" />
      <div className={styles.content}>
        <nav aria-label="Breadcrumb">
          <Link href="/analysis">Analysis</Link> / Economic calendar
        </nav>
        <section
          className={styles.introduction}
          aria-labelledby="calendar-heading"
        >
          <p className={styles.eyebrow}>Prepare, don’t predict</p>
          <h1 id="calendar-heading">Economic Calendar</h1>
          <p>
            See upcoming economic announcements and learn what the numbers mean.
            Use this calendar to prepare your learning and risk checks, not to
            decide that a currency must rise or fall.
          </p>
        </section>
        <section className={styles.panel} aria-labelledby="events-heading">
          <h2 id="events-heading">Upcoming events</h2>
          <p>
            Showing medium- and high-importance events by default. The selection
            includes major economies, Kenya and Tanzania where TradingView has
            coverage. Country inclusion does not guarantee every local release.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.primaryLink}
              href={fullCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open full calendar ↗
            </a>
            <a href="#official-sources">Official release schedules</a>
            <a href="#key-events">Key events explained</a>
          </div>
          <p className={styles.notice}>
            Third-party data may be delayed, revised, incomplete or unavailable.
            Forecasts are estimates, not promises. No release guarantees a
            market direction or profit.
          </p>
          <p className={styles.small}>
            This embedded view has no PipStart daily/weekly filters or in-widget
            event descriptions. Use the full-calendar link for the provider’s
            additional controls and the explanations below for learning.
          </p>
          <p className={styles.small}>
            When this calendar comes into view, it connects to TradingView,
            which receives your IP address and page address.
            <Link href="/legal/privacy-policy"> Read our privacy policy</Link>.
          </p>
          <EconomicCalendarWidget />
        </section>
        <section
          className={styles.section}
          id="key-events"
          aria-labelledby="key-events-heading"
        >
          <h2 id="key-events-heading">Key events explained</h2>
          <p>
            Original PipStart explanations. All numbers in these examples are
            invented, not current releases or forecasts. Compare actual,
            forecast and previous figures on the same basis, and check
            revisions. A surprise is only one part of a market reaction.
          </p>
          <div className={styles.cards}>
            {calendarExplainers.map((event) => (
              <article className={styles.card} key={event.id}>
                <h3>{event.title}</h3>
                <dl>
                  <dt>What it measures</dt>
                  <dd>{event.measures}</dd>
                  <dt>Why currencies can react</dt>
                  <dd>{event.reaction}</dd>
                  <dt>Everyday example and the surprise</dt>
                  <dd>{event.example}</dd>
                </dl>
                <div className={styles.cardLinks}>
                  <Link href={calendarLessonUrl}>Level 7 calendar lesson</Link>
                  <Link href="/glossary">Browse the glossary</Link>
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source: {event.source} ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className={styles.panel}
          id="official-sources"
          aria-labelledby="official-sources-heading"
        >
          <h2 id="official-sources-heading">
            Official sources and release schedules
          </h2>
          <p>
            Check the publisher for dates, local announcements and revisions.
            Some links lead to policy pages rather than a combined calendar.
            Read each source’s timezone; do not assume it matches your device.
          </p>
          <ul>
            {officialCalendarSources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer">
                  {source.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
