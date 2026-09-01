"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  CONFIRMATION_TOKEN_PATTERN,
  readConfirmationToken,
} from "./course-confirmation-token";

type ConfirmationView =
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

interface ConfirmationFrameProps {
  badge: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  activeSteps?: number;
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

function ConfirmationFrame({
  badge,
  eyebrow,
  title,
  children,
  activeSteps = 1,
}: ConfirmationFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[520px] text-[#241f19]">
      <div className="flex items-center justify-between gap-4 px-2">
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-[#241f19] sm:text-[28px]"
        >
          Skill<span className="text-[#a84725]">cima</span>
        </Link>

        <span className="text-right text-[10px] font-bold uppercase tracking-[0.16em] text-[#655c50] sm:text-xs">
          Forex Foundations
        </span>
      </div>

      <div
        aria-label={`${activeSteps} of 5 course steps active`}
        className="mt-5 grid grid-cols-5 gap-2 px-2"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`h-1.5 rounded-full ${
              index < activeSteps ? "bg-[#bfdd6e]" : "bg-[#e7edd8]"
            }`}
          />
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#e3dbc8] bg-white shadow-[0_18px_50px_rgba(36,31,25,0.08)]">
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <span className="inline-flex rounded-full bg-[#bfdd6e] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#241f19]">
            {badge}
          </span>

          <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.15em] text-[#a84725]">
            {eyebrow}
          </p>

          <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.08] tracking-tight text-[#241f19] sm:text-[38px]">
            {title}
          </h1>

          {children}
        </div>
      </section>

      <div className="px-4 py-7 text-center text-xs leading-6 text-[#74695b]">
        <p>Skillcima · skillcima.com</p>
        <p>Calm, structured and risk-conscious Forex education.</p>
      </div>
    </div>
  );
}

function PositivePoint({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#bfdd6e] text-sm font-extrabold text-[#241f19]"
      >
        {"\u2713"}
      </span>

      <span className="pt-0.5 text-[15px] leading-6 text-[#241f19]">
        {children}
      </span>
    </li>
  );
}

function WelcomeView({ alreadyConfirmed }: { alreadyConfirmed: boolean }) {
  return (
    <ConfirmationFrame
      badge="Course active"
      eyebrow="Welcome to Forex Foundations"
      title="You’re officially in!"
    >
      <p className="mt-7 text-lg font-semibold leading-8 text-[#241f19]">
        Great choice—your place in Skillcima’s Forex Foundations course is now
        confirmed.
      </p>

      <p className="mt-5 text-base leading-7 text-[#4f473e]">
        Your first lesson, <strong>What Forex Really Is</strong>, is on its way
        to your inbox. From here, we’ll guide you through one clear and
        practical lesson at a time.
      </p>

      {alreadyConfirmed && (
        <div className="mt-6 rounded-2xl border border-[#d9e8ae] bg-[#f3f8e7] px-5 py-4 text-sm leading-6 text-[#4f473e]">
          Welcome back. Your course was already active, so your existing lesson
          schedule has been kept exactly as it was.
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[#dce3ca] bg-[#edf3df] p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#a84725]">
          What happens next
        </p>

        <ul className="mt-5 space-y-4">
          <PositivePoint>Your course enrolment is confirmed.</PositivePoint>

          <PositivePoint>Day 1 should reach your inbox shortly.</PositivePoint>

          <PositivePoint>
            A new focused lesson follows every 24 hours.
          </PositivePoint>

          <PositivePoint>
            After five foundation lessons, Day 6 will show you how to continue
            learning more deeply on PipStart.
          </PositivePoint>
        </ul>
      </div>

      <div className="mt-7 rounded-2xl bg-[#241f19] px-6 py-6 text-white">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#bfdd6e]">
          A strong start
        </p>

        <p className="mt-3 text-base font-semibold leading-7">
          You’ve already completed the hardest part: choosing to begin.
        </p>

        <p className="mt-2 text-sm leading-6 text-[#eee9df]">
          Keep showing up, stay curious and take each lesson at your own pace.
          Steady learning is how real confidence grows.
        </p>
      </div>

      <div className="mt-7 rounded-2xl border-l-4 border-[#a84725] bg-[#f7f3e8] px-5 py-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#a84725]">
          Friendly reminder
        </p>

        <p className="mt-2 text-sm leading-6 text-[#4f473e]">
          There is no need to rush into trading. Learn the language, understand
          the risks and move forward only at a pace that feels responsible.
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#241f19] px-6 py-3 text-center font-bold text-white transition-colors hover:bg-[#3a332b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84725] focus-visible:ring-offset-2 sm:w-auto"
        >
          Return to Skillcima
          <span aria-hidden="true" className="ml-2">
            {"\u2192"}
          </span>
        </Link>
      </div>

      <p className="mt-6 border-t border-[#e3dbc8] pt-5 text-sm leading-6 text-[#74695b]">
        If Day 1 is not visible after a few minutes, check your Promotions or
        Spam folder and mark Skillcima as a trusted sender.
      </p>
    </ConfirmationFrame>
  );
}

function ConfirmationPrompt({ onConfirm }: { onConfirm: () => void }) {
  return (
    <ConfirmationFrame
      badge="Action required"
      eyebrow="Secure confirmation"
      title="Confirm your free course"
    >
      <p className="mt-7 text-lg font-semibold leading-8 text-[#241f19]">
        Confirm that you requested Skillcima’s free Forex Foundations course.
      </p>

      <p className="mt-5 text-base leading-7 text-[#4f473e]">
        After you confirm, we’ll activate your six-email course and send the
        first lesson to the address used during enrolment.
      </p>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#241f19] px-6 py-3 text-center font-bold text-white transition-colors hover:bg-[#3a332b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84725] focus-visible:ring-offset-2 sm:w-auto"
      >
        Confirm my course
      </button>

      <p className="mt-6 border-t border-[#e3dbc8] pt-5 text-sm leading-6 text-[#74695b]">
        Opening this page does not confirm your enrolment. Your course begins
        only after you select the confirmation button above.
      </p>
    </ConfirmationFrame>
  );
}

function ConfirmationLoadingView() {
  return (
    <ConfirmationFrame
      badge="Activating course"
      eyebrow="Secure confirmation"
      title="Just a moment…"
    >
      <div
        role="status"
        aria-live="polite"
        className="mt-7 rounded-2xl border border-[#dce3ca] bg-[#edf3df] p-6"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#a84725]"
          />

          <p className="text-base leading-7 text-[#4f473e]">
            We’re confirming your place and preparing your first Forex
            Foundations lesson.
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-6 text-[#74695b]">
        Please keep this page open. This normally takes only a moment.
      </p>
    </ConfirmationFrame>
  );
}

function ConfirmationCheckingView() {
  return (
    <ConfirmationFrame
      badge="Checking link"
      eyebrow="Secure confirmation"
      title="Preparing confirmation…"
    >
      <div
        role="status"
        aria-live="polite"
        className="mt-7 rounded-2xl border border-[#dce3ca] bg-[#edf3df] p-6"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#a84725]"
          />

          <p className="text-base leading-7 text-[#4f473e]">
            We’re securely checking your confirmation link. No enrolment will be
            confirmed until you choose to continue.
          </p>
        </div>
      </div>
    </ConfirmationFrame>
  );
}

function FailureView({
  badge,
  eyebrow,
  title,
  message,
  onRetry,
}: {
  badge: string;
  eyebrow: string;
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <ConfirmationFrame
      badge={badge}
      eyebrow={eyebrow}
      title={title}
      activeSteps={0}
    >
      <p className="mt-7 text-base leading-7 text-[#4f473e]">{message}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#241f19] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a332b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84725] focus-visible:ring-offset-2"
          >
            Try again
          </button>
        )}

        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d8cfbc] bg-white px-6 py-3 font-bold text-[#241f19] transition-colors hover:bg-[#f7f3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84725]"
        >
          Return to Skillcima
        </Link>
      </div>
    </ConfirmationFrame>
  );
}

function CourseConfirmationContent() {
  const searchParams = useSearchParams();
  const initialToken = readConfirmationToken(searchParams);
  const tokenRef = useRef<string | null>(initialToken);
  const submissionInFlightRef = useRef(false);

  const [view, setView] = useState<ConfirmationView>(() =>
    initialToken ? "ready" : "invalid",
  );

  const confirmCourse = useCallback(async (providedToken?: string) => {
    const token = providedToken ?? tokenRef.current;

    if (!token || !CONFIRMATION_TOKEN_PATTERN.test(token)) {
      setView("invalid");
      return;
    }

    if (submissionInFlightRef.current) {
      return;
    }

    submissionInFlightRef.current = true;

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
      submissionInFlightRef.current = false;
      setView("unavailable");
      return;
    }

    const body = await readJson(response);

    submissionInFlightRef.current = false;

    if (response.status === 200 && body?.ok === true) {
      if (body.status === "confirmed") {
        setView("confirmed");
        tokenRef.current = null;
        return;
      }

      if (body.status === "already_confirmed") {
        setView("already_confirmed");
        tokenRef.current = null;
        return;
      }

      setView("unavailable");
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
  }, []);

  useEffect(() => {
    /*
     * Remove the raw confirmation token from the
     * visible address bar as soon as it is captured.
     */
    sanitizeAddressBar();
  }, []);

  if (view === "ready") {
    return (
      <ConfirmationPrompt
        onConfirm={() => {
          void confirmCourse();
        }}
      />
    );
  }

  if (view === "submitting") {
    return <ConfirmationLoadingView />;
  }

  if (view === "confirmed" || view === "already_confirmed") {
    return <WelcomeView alreadyConfirmed={view === "already_confirmed"} />;
  }

  if (view === "expired") {
    return (
      <FailureView
        badge="Link expired"
        eyebrow="Confirmation link"
        title="This link has expired"
        message="This confirmation link is no longer valid. Return to Skillcima to review the available enrolment options and begin again safely."
      />
    );
  }

  if (view === "invalid") {
    return (
      <FailureView
        badge="Invalid link"
        eyebrow="Confirmation link"
        title="We couldn’t verify this link"
        message="The confirmation link is incomplete or invalid. Please use the complete button or link from your Skillcima confirmation email."
      />
    );
  }

  if (view === "not_available") {
    return (
      <FailureView
        badge="Unavailable"
        eyebrow="Confirmation status"
        title="This enrolment cannot be confirmed"
        message="This course enrolment is not currently available for confirmation. Return to Skillcima to review the available options."
      />
    );
  }

  return (
    <FailureView
      badge="Temporary problem"
      eyebrow="Secure confirmation"
      title="We couldn’t confirm your course"
      message="Your link has not been discarded. Please check your connection and try the confirmation again."
      onRetry={() => {
        void confirmCourse();
      }}
    />
  );
}

export function CourseConfirmationCard() {
  return (
    <Suspense fallback={<ConfirmationCheckingView />}>
      <CourseConfirmationContent />
    </Suspense>
  );
}
