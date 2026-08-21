"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

type ConfirmationView =
  | "checking"
  | "ready"
  | "submitting"
  | "confirmed"
  | "already_confirmed"
  | "expired"
  | "invalid"
  | "not_available"
  | "unavailable";

interface ApiErrorBody {
  ok?: false;
  error?: {
    code?: string;
  };
}

interface ApiSuccessBody {
  ok?: true;
  status?: "confirmed" | "already_confirmed";
  courseSlug?: string;
}

function sanitizeAddressBar(): void {
  const url = new URL(window.location.href);

  url.searchParams.delete("token");

  const search = url.searchParams.toString();

  const cleanUrl =
    `${url.pathname}` + `${search ? `?${search}` : ""}` + `${url.hash}`;

  window.history.replaceState(window.history.state, "", cleanUrl);
}

async function readJson(
  response: Response,
): Promise<ApiErrorBody | ApiSuccessBody | null> {
  try {
    return (await response.json()) as ApiErrorBody | ApiSuccessBody;
  } catch {
    return null;
  }
}

export function CourseConfirmationCard() {
  const tokenRef = useRef<string | null>(null);

  const initializedRef = useRef(false);

  const [view, setView] = useState<ConfirmationView>("checking");

  useEffect(() => {
    /*
     * Prevent the development Strict Mode
     * effect replay from re-reading the URL
     * after we remove the token.
     */
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const url = new URL(window.location.href);

    const token = url.searchParams.get("token");

    if (token && TOKEN_PATTERN.test(token)) {
      tokenRef.current = token;

      setView("ready");
    } else {
      setView("invalid");
    }

    /*
     * Keep the confirmation token out of the
     * visible address bar after it has been
     * captured in memory.
     *
     * This does not submit or confirm anything.
     */
    sanitizeAddressBar();
  }, []);

  async function confirmCourse() {
    const token = tokenRef.current;

    if (!token || !TOKEN_PATTERN.test(token)) {
      setView("invalid");
      return;
    }

    setView("submitting");

    let response: Response;

    try {
      response = await fetch("/api/v1/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
        cache: "no-store",
        credentials: "same-origin",
      });
    } catch {
      setView("unavailable");
      return;
    }

    const body = await readJson(response);

    if (response.status === 200 && body?.ok === true) {
      if (body.status === "already_confirmed") {
        setView("already_confirmed");
      } else if (body.status === "confirmed") {
        setView("confirmed");
      } else {
        setView("unavailable");
      }

      tokenRef.current = null;

      return;
    }

    if (response.status === 410) {
      setView("expired");
      tokenRef.current = null;
      return;
    }

    if (response.status === 400) {
      setView("invalid");
      tokenRef.current = null;
      return;
    }

    if (response.status === 409) {
      setView("not_available");
      tokenRef.current = null;
      return;
    }

    setView("unavailable");
  }

  if (view === "checking") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-6 text-center"
      >
        <p className="leading-7 text-muted">
          Checking your confirmation link&hellip;
        </p>
      </div>
    );
  }

  if (view === "confirmed" || view === "already_confirmed") {
    return (
      <>
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold"
        >
          {"\u2713"}
        </div>

        <p className="mt-8 text-center text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Course confirmed
        </p>

        <h1 className="mt-4 text-center font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          You&apos;re confirmed
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted">
          Your Skillcima Forex Foundations course enrolment has been confirmed
          successfully.
        </p>

        {view === "already_confirmed" && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-muted">
            This enrolment had already been confirmed, so no duplicate
            confirmation was created.
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Return to Skillcima
          </Link>
        </div>
      </>
    );
  }

  if (view === "expired") {
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Confirmation link
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          This link has expired
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          This course confirmation link is no longer valid. Please return to
          Skillcima for the available enrolment options.
        </p>

        <ReturnHome />
      </>
    );
  }

  if (view === "invalid") {
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Confirmation link
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          This link is invalid
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          We could not verify this course confirmation link.
        </p>

        <ReturnHome />
      </>
    );
  }

  if (view === "not_available") {
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Confirmation unavailable
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          This enrolment cannot be confirmed
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          This course enrolment is not currently available for confirmation.
        </p>

        <ReturnHome />
      </>
    );
  }

  if (view === "unavailable") {
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Temporary problem
        </p>

        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          We couldn&apos;t confirm your course
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted">
          Confirmation is temporarily unavailable. Your link has not been
          intentionally discarded. Please try again.
        </p>

        <button
          type="button"
          onClick={confirmCourse}
          className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Try again
        </button>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
        One final step
      </p>

      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Confirm your free course
      </h1>

      <p className="mt-6 text-lg leading-8 text-muted">
        Confirm that you want to receive Skillcima&apos;s free five-day Forex
        Foundations course by email.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-heading text-xl font-bold">Forex Foundations</h2>

        <p className="mt-3 leading-7 text-muted">
          Five structured beginner lessons focused on terminology, market
          mechanics and risk awareness.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-warning-border bg-warning-soft p-6 text-sm leading-7 text-warning">
        Opening this page does not confirm your enrolment. Your course is
        confirmed only when you choose the button below.
      </div>

      <button
        type="button"
        disabled={view === "submitting"}
        onClick={confirmCourse}
        className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
      >
        {view === "submitting" ? "Confirming\u2026" : "Confirm my course"}
      </button>
    </>
  );
}

function ReturnHome() {
  return (
    <div className="mt-10">
      <Link
        href="/"
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-action px-6 py-3 font-semibold text-action-foreground transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        Return to Skillcima
      </Link>
    </div>
  );
}
