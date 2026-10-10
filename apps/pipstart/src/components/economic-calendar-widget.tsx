"use client";

import { useEffect, useRef, useState } from "react";
import {
  calendarFallbackText,
  calendarLoadTimeoutMs,
  calendarScriptUrl,
  calendarWidgetSettings,
  fullCalendarUrl,
} from "../lib/economic-calendar";
import styles from "./economic-calendar-widget.module.css";

type CalendarState = "idle" | "loading" | "embedded" | "unavailable";

export function EconomicCalendarWidget() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CalendarState>("idle");
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let started = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: MutationObserver | undefined;
    const start = () => {
      if (started || disposed) return;
      started = true;
      setState("loading");
      const container = document.createElement("div");
      container.className = "tradingview-widget-container";
      const widget = document.createElement("div");
      widget.className = "tradingview-widget-container__widget";
      const credit = document.createElement("div");
      credit.className = "tradingview-widget-copyright";
      const link = document.createElement("a");
      link.href = fullCalendarUrl;
      link.rel = "noopener nofollow";
      link.target = "_blank";
      const name = document.createElement("span");
      name.className = "blue-text";
      name.textContent = "Economic Calendar";
      const trademark = document.createElement("span");
      trademark.className = "trademark";
      trademark.textContent = "\u00a0by TradingView";
      link.append(name);
      credit.append(link, trademark);
      container.append(widget, credit);
      host.append(container);
      const findFrame = () => {
        const iframe = container.querySelector("iframe");
        if (!iframe || disposed) return false;
        if (!iframe.title) iframe.title = "Economic calendar by TradingView";
        clearTimeout(timer);
        // Frame presence does not prove that cross-origin data loaded.
        setState("embedded");
        observer?.disconnect();
        return true;
      };
      observer = new MutationObserver(findFrame);
      observer.observe(container, { childList: true, subtree: true });
      timer = setTimeout(() => {
        if (!disposed && !findFrame()) setState("unavailable");
      }, calendarLoadTimeoutMs);
      const script = document.createElement("script");
      script.src = calendarScriptUrl;
      script.type = "text/javascript";
      script.async = true;
      script.textContent = JSON.stringify(calendarWidgetSettings);
      script.onerror = () => {
        if (!disposed && !findFrame()) {
          clearTimeout(timer);
          setState("unavailable");
        }
      };
      container.append(script);
    };
    const visibilityObserver =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              visibilityObserver?.disconnect();
              start();
            }
          });
    if (visibilityObserver) visibilityObserver.observe(host);
    else start();
    return () => {
      disposed = true;
      visibilityObserver?.disconnect();
      observer?.disconnect();
      clearTimeout(timer);
      host.replaceChildren();
    };
  }, []);
  return (
    <>
      <div className={styles.frameArea} data-calendar-state={state}>
        <div
          ref={hostRef}
          className={styles.host}
          data-testid="calendar-host"
        />
        <div className={styles.status} role="status" aria-live="polite">
          {state === "idle"
            ? "The calendar loads when it comes into view."
            : null}
          {state === "loading" ? "Loading the calendar…" : null}
          {state === "unavailable" ? (
            <>
              <p>{calendarFallbackText}</p>
              <p>
                <a
                  href={fullCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the full calendar ↗
                </a>
                {" · "}
                <a href="#official-sources">Official release schedules</a>
              </p>
            </>
          ) : null}
        </div>
      </div>
      <noscript data-calendar-fallback>
        <p>{calendarFallbackText} JavaScript is disabled.</p>
        <p>
          <a href={fullCalendarUrl} target="_blank" rel="noopener noreferrer">
            Open the full calendar
          </a>{" "}
          or <a href="#official-sources">check official release schedules</a>.
        </p>
      </noscript>
    </>
  );
}
