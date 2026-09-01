"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  extractUnsubscribeToken,
  mapUnsubscribeApiResponse,
} from "./unsubscribe-state";

type ViewState =
  | "loading"
  | "ready"
  | "submitting"
  | "success"
  | "invalid"
  | "stale"
  | "retryable"
  | "failure";

export function UnsubscribeClient() {
  const initialized = useRef(false);

  const [token, setToken] = useState<string | null>(null);

  const [state, setState] = useState<ViewState>("loading");

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const result = extractUnsubscribeToken(window.location.search);

    /*
     * Remove the capability token from the
     * visible URL immediately after reading it.
     * This performs no network request and no
     * consent mutation.
     */
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );

    if (result.status !== "ready") {
      setState("invalid");
      return;
    }

    setToken(result.token);
    setState("ready");
  }, []);

  async function submitUnsubscribe() {
    if (!token) {
      setState("invalid");
      return;
    }

    setState("submitting");

    let response: Response;

    try {
      response = await fetch("/api/v1/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          token,
        }),
      });
    } catch {
      setState("retryable");
      return;
    }

    let body: unknown = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const outcome = mapUnsubscribeApiResponse(response.status, body);

    switch (outcome) {
      case "success":
        setToken(null);
        setState("success");
        return;

      case "invalid":
        setToken(null);
        setState("invalid");
        return;

      case "stale":
        setToken(null);
        setState("stale");
        return;

      case "retryable":
        setState("retryable");
        return;

      case "failure":
        setState("failure");
        return;
    }
  }

  const canSubmit = state === "ready" || state === "retryable";

  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        Communication choices
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Unsubscribe
      </h1>

      <p className="mt-6 text-lg leading-8 text-muted">
        You can stop optional continuing Skillcima educational emails here. Your
        course-delivery request is managed separately and will not be cancelled
        by this action.
      </p>

      <div
        className="mt-10 rounded-2xl border border-border bg-surface p-6"
        aria-live="polite"
      >
        {state === "loading" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              Checking your link
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Preparing your unsubscribe option.
            </p>
          </>
        )}

        {canSubmit && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              Stop continuing educational emails?
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Press the button below to withdraw your optional newsletter
              consent. Simply opening this page does not unsubscribe you.
            </p>

            {state === "retryable" && (
              <p className="mt-4 text-sm leading-6 text-warning">
                The service was temporarily unavailable. Your preference has not
                been changed yet. You can try again.
              </p>
            )}

            <button
              type="button"
              onClick={submitUnsubscribe}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover"
            >
              {state === "retryable"
                ? "Try unsubscribe again"
                : "Unsubscribe from educational emails"}
            </button>
          </>
        )}

        {state === "submitting" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              Updating your preference
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Please wait while we securely process your request.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              You are unsubscribed
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You will no longer receive optional continuing Skillcima
              educational emails from this subscription. Any course delivery you
              separately requested remains unchanged.
            </p>
          </>
        )}

        {state === "invalid" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              This link is not valid
            </h2>

            <p className="mt-4 leading-7 text-muted">
              The unsubscribe link is missing or invalid. Please use the
              unsubscribe link from a Skillcima educational email.
            </p>
          </>
        )}

        {state === "stale" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              This link is no longer current
            </h2>

            <p className="mt-4 leading-7 text-muted">
              This unsubscribe link belongs to an earlier subscription cycle and
              cannot change a newer newsletter choice. Please use the link from
              your most recent Skillcima educational email.
            </p>
          </>
        )}

        {state === "failure" && (
          <>
            <h2 className="font-heading text-2xl font-bold">
              We could not update this preference
            </h2>

            <p className="mt-4 leading-7 text-muted">
              This newsletter preference cannot currently be changed using this
              link.
            </p>
          </>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold transition-colors hover:bg-brand-soft"
        >
          Return home
        </Link>

        <Link
          href="/email-preferences"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 font-semibold transition-colors hover:bg-brand-soft"
        >
          Email preferences
        </Link>
      </div>
    </article>
  );
}
