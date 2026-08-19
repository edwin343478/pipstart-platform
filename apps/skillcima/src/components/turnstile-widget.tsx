"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileWidgetId = string;

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "compact" | "flexible";
  retry?: "auto" | "never";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (errorCode: string) => boolean | void;
}

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ): TurnstileWidgetId;
  reset(widgetId?: TurnstileWidgetId): void;
  remove(widgetId: TurnstileWidgetId): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  resetKey: number;
  onTokenChange: (token: string | null) => void;
}

export function TurnstileWidget({
  siteKey,
  resetKey,
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);

  const renderWidget = useCallback(() => {
    if (
      !siteKey ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      retry: "auto",

      callback(token) {
        onTokenChange(token);
      },

      "expired-callback"() {
        onTokenChange(null);
      },

      "timeout-callback"() {
        onTokenChange(null);
      },

      "error-callback"() {
        onTokenChange(null);

        // Allow Turnstile to recover automatically from transient errors,
        // including temporary network loss.
        return false;
      },
    });
  }, [onTokenChange, siteKey]);

  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  useEffect(() => {
    if (resetKey === 0 || !widgetIdRef.current || !window.turnstile) {
      return;
    }

    onTokenChange(null);
    window.turnstile.reset(widgetIdRef.current);
  }, [onTokenChange, resetKey]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!siteKey) {
    return (
      <p
        className="rounded-xl border border-warning-border bg-warning-soft p-4 text-sm leading-6 text-warning"
        role="alert"
      >
        Security verification is not configured for this environment.
      </p>
    );
  }

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />

      <div
        ref={containerRef}
        className="min-h-[65px] w-full overflow-hidden rounded-xl"
        aria-label="Security verification"
      />
    </>
  );
}
