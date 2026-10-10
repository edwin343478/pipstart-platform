import Link from "next/link";
import { CalendarDocumentBoundary } from "../../components/calendar-document-boundary";
import { CalendarTimezone } from "../../components/calendar-timezone";
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

type ExplainerIcon = (typeof calendarExplainers)[number]["icon"];

function MarkerIcon({ type }: { type: ExplainerIcon }) {
  return (
    <svg className={styles.markerIcon} aria-hidden="true" viewBox="0 0 20 20">
      {type === "bank" ? (
        <path d="M3 8h14L10 3.5 3 8Zm1.5 0v6.5m3.5-6.5v6.5m4-6.5v6.5m3.5-6.5v6.5M3 16.5h14" />
      ) : type === "price" ? (
        <path d="M3.5 10.5 9.5 4.5H16v6.5l-6 6-6.5-6.5ZM13 7.5h.01" />
      ) : type === "jobs" ? (
        <path d="M4 7.5h12v8.5H4V7.5Zm4-3h4v3H8v-3ZM4 11.5h12" />
      ) : type === "growth" ? (
        <path d="m3 14.5 4.5-4.5 3 3L17 6.5M12.5 6.5H17V11" />
      ) : type === "survey" ? (
        <path d="M5 3.5h10v13H5v-13Zm2.5 4h5m-5 3h5m-5 3h3" />
      ) : (
        <path d="M3.5 4.5h2l1.8 8h8.2l1.5-5.5H6.4M8.5 16h.01M14.5 16h.01" />
      )}
    </svg>
  );
}

function IconClock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M10 3 2 17h16L10 3Z" />
      <path d="M10 8v4M10 14.5v.5" />
    </svg>
  );
}

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
      <CompactHeader className={styles.header} section="Calendar" />

      <section
        className={styles.introduction}
        aria-labelledby="calendar-heading"
      >
        <h1 id="calendar-heading">Economic Calendar</h1>
        <p>
          Scheduled economic releases and central-bank decisions, with event
          times displayed by TradingView. Use it to know <em>when</em> markets
          may move — not which way. Not financial advice.
        </p>
      </section>

      <div className={styles.toolbar}>
        <span className={styles.chip}>
          <IconClock />
          <CalendarTimezone />
        </span>
        <span className={styles.chip}>
          <IconWarning />
          Data may be delayed
        </span>
        <a
          className={styles.fullLink}
          href={fullCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open full calendar ↗
        </a>
      </div>

      <div className={styles.grid}>
        <section
          className={`${styles.panel} ${styles.widgetPanel}`}
          aria-labelledby="events-heading"
        >
          <div className={styles.panelHead}>
            <h2 id="events-heading">Upcoming events</h2>
            <span>Medium and high importance · G20, euro area</span>
          </div>
          <EconomicCalendarWidget />
          <p className={styles.panelNote}>
            Event times are displayed by TradingView; official sources may use a
            different time zone. Coverage varies by country, so not every local
            release is guaranteed. Daily and weekly filters are in the full
            calendar. When this calendar comes into view it connects to
            TradingView, which receives your IP address and page address —{" "}
            <Link href="/legal/privacy-policy">privacy policy</Link>.
            <span className={styles.mobileScrollHint}>
              Swipe inside the calendar to browse available events. Use the full
              calendar for more dates.
            </span>
          </p>
        </section>

        <section
          className={`${styles.panel} ${styles.explainPanel}`}
          id="key-events"
          aria-labelledby="key-events-heading"
        >
          <div className={styles.panelHead}>
            <h2 id="key-events-heading">Key events explained</h2>
            <span>{calendarExplainers.length} common releases</span>
          </div>
          <div
            className={styles.explainBody}
            role="region"
            aria-label="Key event explanations"
            tabIndex={0}
          >
            <p className={styles.explainIntro}>
              Find the event you see in the calendar to learn what it measures
              and why it can move a currency. A result far from the forecast
              usually matters more than the number itself. Example numbers are
              invented, not current releases or forecasts.
            </p>
            <ol className={styles.feed}>
              {calendarExplainers.map((event) => (
                <li className={styles.feedItem} key={event.id}>
                  <div className={styles.marker}>
                    <MarkerIcon type={event.icon} />
                  </div>
                  <article
                    className={styles.card}
                    aria-labelledby={`event-${event.id}`}
                  >
                    <div className={styles.cardMeta}>
                      <span className={styles.tag}>
                        {event.category.toUpperCase()}
                      </span>
                      <span className={styles.listedAs}>
                        Often listed as: {event.listedAs}
                      </span>
                    </div>
                    <h3 id={`event-${event.id}`}>{event.title}</h3>
                    <p>{event.measures}</p>
                    <p>
                      <strong>Why it matters:</strong> {event.reaction}
                    </p>
                    <details className={styles.example}>
                      <summary>Everyday example and the surprise</summary>
                      <p>{event.example}</p>
                    </details>
                    <div className={styles.cardLinks}>
                      <Link href={calendarLessonUrl}>
                        Lesson: Use an economic calendar safely →
                      </Link>
                      <Link href="/glossary">Glossary</Link>
                      <a
                        href={event.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source: {event.source} ↗
                      </a>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <div className={styles.notes}>
        <section
          className={`${styles.note} ${styles.warn}`}
          aria-labelledby="delay-heading"
        >
          <h2 id="delay-heading">Delayed-data notice</h2>
          <p>
            Calendar data comes from TradingView and may be delayed, revised,
            incomplete or unavailable. A visible calendar frame does not confirm
            data freshness. Forecasts are estimates, not promises, and no
            release guarantees a market direction or profit — confirm times and
            figures with the official source before relying on them.
          </p>
        </section>
        <section
          className={styles.note}
          id="official-sources"
          aria-labelledby="official-sources-heading"
        >
          <h2 id="official-sources-heading">If the calendar doesn’t load</h2>
          <p>
            Some ad blockers and networks block third-party widgets.{" "}
            <a href={fullCalendarUrl} target="_blank" rel="noopener noreferrer">
              Open the full calendar
            </a>{" "}
            or check the official release schedules (read each source’s time
            zone):
          </p>
          <ul className={styles.sourceList}>
            {officialCalendarSources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={source.name}
                >
                  {source.shortName} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.note} aria-labelledby="safety-heading">
          <h2 id="safety-heading">Reading it safely</h2>
          <p>
            High-importance events often bring wider spreads and fast price
            moves. The calendar shows when volatility is more likely — it never
            tells you the direction. On small screens, event names may be
            shortened. <Link href={calendarLessonUrl}>Learn more →</Link>
          </p>
        </section>
      </div>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
