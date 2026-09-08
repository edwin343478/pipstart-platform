"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  calendarCurrencies,
  calendarEvents,
  type CalendarImpact,
} from "./events";
import styles from "./page.module.css";

type EventFilter = "all" | "high" | string;

const defaultTimeZone = "Africa/Dar_es_Salaam";
const initialDate = new Date("2026-09-08T12:00:00.000Z");

const fallbackTimeZones = [
  "Pacific/Pago_Pago",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Halifax",
  "America/Sao_Paulo",
  "Atlantic/South_Georgia",
  "Atlantic/Azores",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Athens",
  "Africa/Dar_es_Salaam",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Pacific/Noumea",
  "Pacific/Auckland",
  "Pacific/Chatham",
  "Pacific/Kiritimati",
];

function supportedTimeZones(): string[] {
  const international = Intl as typeof Intl & {
    supportedValuesOf?: (key: "timeZone") => string[];
  };
  const zones =
    international.supportedValuesOf?.("timeZone") ?? fallbackTimeZones;
  return [...new Set(["UTC", ...zones])];
}

function timeZoneOffset(timeZone: string, date: Date): string {
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  return offset ?? "UTC";
}

function dateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDate(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function impactLabel(impact: CalendarImpact): string {
  return `${impact[0].toUpperCase()}${impact.slice(1)}`;
}

export function EconomicCalendar() {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [timeZone, setTimeZone] = useState(defaultTimeZone);
  const [filter, setFilter] = useState<EventFilter>("all");
  const timeZones = useMemo(() => supportedTimeZones(), []);
  const selectedDateKey = dateKey(selectedDate, timeZone);
  const visibleEvents = calendarEvents.filter((event) => {
    if (dateKey(new Date(event.startsAt), timeZone) !== selectedDateKey)
      return false;
    if (filter === "all") return true;
    if (filter === "high") return event.impact === "high";
    return event.currency === filter;
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          PipStart
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/learn/forex">Learn Forex</Link>
          <Link href="/analysis">Analysis</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/brokers">Brokers</Link>
          <span>Calendar</span>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1>Economic Calendar</h1>
            <p>
              Track scheduled economic events and learn why they may matter.
              Impact ratings describe expected attention—not market direction.
            </p>
          </div>
          <span className={styles.refreshStatus}>
            ○ Live data connection pending
          </span>
        </div>

        <section className={styles.controls} aria-label="Calendar navigation">
          <div className={styles.dateNavigation}>
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => setSelectedDate((date) => shiftDate(date, -1))}
            >
              ‹
            </button>
            <button type="button" onClick={() => setSelectedDate(initialDate)}>
              Today
            </button>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => setSelectedDate((date) => shiftDate(date, 1))}
            >
              ›
            </button>
          </div>
          <strong>
            {new Intl.DateTimeFormat("en-US", {
              timeZone,
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(selectedDate)}
          </strong>
          <label>
            <span className={styles.srOnly}>Timezone</span>
            <select
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
            >
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {timeZoneOffset(zone, selectedDate)} ·{" "}
                  {zone.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className={styles.filters} aria-label="Event filters">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All events
          </button>
          <button
            type="button"
            aria-pressed={filter === "high"}
            onClick={() => setFilter("high")}
          >
            High impact
          </button>
          {["USD", "EUR", "GBP"].map((currency) => (
            <button
              key={currency}
              type="button"
              aria-pressed={filter === currency}
              onClick={() => setFilter(currency)}
            >
              {currency}
            </button>
          ))}
          <label>
            <span className={styles.srOnly}>More currencies</span>
            <select
              value={calendarCurrencies.includes(filter) ? filter : ""}
              onChange={(event) => setFilter(event.target.value || "all")}
            >
              <option value="">More currencies</option>
              {calendarCurrencies.map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
        </div>

        <section className={styles.eventList} aria-live="polite">
          <div className={styles.dayHeading}>
            <strong>
              {new Intl.DateTimeFormat("en-US", {
                timeZone,
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(selectedDate)}
            </strong>
            <span>Illustrative preview data</span>
          </div>
          {visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <article className={styles.eventRow} key={event.id}>
                <time dateTime={event.startsAt}>
                  {new Intl.DateTimeFormat("en-GB", {
                    timeZone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(event.startsAt))}
                </time>
                <strong className={styles.currency}>{event.currency}</strong>
                <div className={styles.eventName}>
                  <strong>{event.name}</strong>
                  <span>{event.explanation}</span>
                </div>
                <span className={`${styles.impact} ${styles[event.impact]}`}>
                  <i aria-hidden="true" />
                  {impactLabel(event.impact)}
                </span>
                <span className={styles.value}>
                  <small>Actual</small>
                  <strong>{event.actual}</strong>
                </span>
                <span className={styles.value}>
                  <small>Forecast</small>
                  {event.forecast}
                </span>
                <span className={styles.value}>
                  <small>Previous</small>
                  {event.previous}
                </span>
              </article>
            ))
          ) : (
            <p className={styles.empty}>
              No illustrative events match this date and filter.
            </p>
          )}
        </section>

        <aside className={styles.guide}>
          <strong>✓ Read the event, not just the colour.</strong> Forecasts can
          be wrong, previous figures can be revised, and high-impact events do
          not predict whether a currency will rise or fall.
        </aside>
      </main>

      <footer className={styles.footer}>
        <span>PipStart · pipstart.net</span>
        <nav aria-label="Footer">
          <a href="https://skillcima.com/about">About</a>
          <a href="https://skillcima.com/contact">Contact</a>
          <a href="https://skillcima.com/legal/privacy-policy">Privacy</a>
          <a href="https://skillcima.com/legal/terms">Terms</a>
          <a href="https://skillcima.com/legal/cookie-policy">Cookies</a>
          <a href="https://skillcima.com/legal/risk-disclaimer">
            Risk Disclosure
          </a>
        </nav>
      </footer>
    </div>
  );
}
