"use client";

import { useCallback, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadFormDefaultValues,
  leadFormSchema,
  type LeadFormData,
  type LeadFormInput,
} from "@repo/validation";
import { Button, Card, Checkbox, FormField, Input } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { TurnstileWidget } from "./turnstile-widget";

interface LeadApiSuccess {
  ok: true;
  data: {
    status: "completed";
    submissionId: string;
    leadId: string;
    enrolmentId: string;
    replayed: boolean;
  };
  requestId: string;
}

interface LeadApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}

type LeadApiResponse = LeadApiSuccess | LeadApiFailure;

function getLeadEndpoint(): string {
  const baseUrl = process.env.NEXT_PUBLIC_LEAD_API_URL?.trim();

  if (!baseUrl) {
    return "/api/v1/lead";
  }

  return `${baseUrl.replace(/\/$/, "")}/api/v1/lead`;
}

export function LeadForm() {
  const router = useRouter();

  const logicalSubmissionRef = useRef<{
    payload: string;
    submissionId: string;
  } | null>(null);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  const handleTurnstileTokenChange = useCallback((token: string | null) => {
    setTurnstileToken(token);

    if (token) {
      setSubmitError(null);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, Record<string, never>, LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaultValues,
    mode: "onBlur",
  });

  async function onSubmit(data: LeadFormData) {
    setSubmitError(null);

    if (!turnstileSiteKey) {
      setSubmitError(
        "Security verification is not configured. Please try again later.",
      );
      return;
    }

    if (!turnstileToken) {
      setSubmitError("Complete the security verification before continuing.");
      return;
    }

    const logicalPayload = JSON.stringify(data);

    if (
      !logicalSubmissionRef.current ||
      logicalSubmissionRef.current.payload !== logicalPayload
    ) {
      logicalSubmissionRef.current = {
        payload: logicalPayload,
        submissionId: crypto.randomUUID(),
      };
    }

    const submissionId = logicalSubmissionRef.current.submissionId;

    try {
      const response = await fetch(getLeadEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          turnstileToken,
          lead: data,
        }),
      });

      const result = (await response.json()) as LeadApiResponse;

      if (!response.ok || !result.ok) {
        setSubmitError(
          result.ok
            ? "The request could not be completed. Please try again."
            : result.error.message,
        );

        setTurnstileToken(null);
        setTurnstileResetKey((value) => value + 1);
        return;
      }

      if (result.data.status !== "completed") {
        setSubmitError(
          "The enrolment request returned an unexpected response. Please try again.",
        );
        setTurnstileToken(null);
        setTurnstileResetKey((value) => value + 1);
        return;
      }

      logicalSubmissionRef.current = null;
      setTurnstileToken(null);

      router.push("/thank-you");
    } catch {
      setSubmitError(
        "We could not complete your enrolment request. Please try again.",
      );

      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    }
  }

  return (
    <Card padded={false} className="p-6 sm:p-8">
      <h3 className="font-heading text-2xl font-bold">Join the free course</h3>

      <p className="mt-3 leading-7 text-muted">
        Enter your details to join the free Forex Foundations course. Your
        enrolment request is securely verified and recorded before the email
        delivery stage.
      </p>

      <form
        className="mt-8 space-y-6"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          id="firstName"
          label="First name"
          description="Optional"
          error={errors.firstName?.message}
        >
          {(controlProps) => (
            <Input
              {...register("firstName")}
              {...controlProps}
              type="text"
              autoComplete="given-name"
              placeholder="Amina"
              hasError={Boolean(errors.firstName)}
              disabled={isSubmitting}
            />
          )}
        </FormField>

        <FormField
          id="email"
          label="Email address"
          error={errors.email?.message}
          required
        >
          {(controlProps) => (
            <Input
              {...register("email")}
              {...controlProps}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="amina@example.com"
              hasError={Boolean(errors.email)}
              disabled={isSubmitting}
            />
          )}
        </FormField>

        <Checkbox
          id="privacyAcknowledged"
          {...register("privacyAcknowledged")}
          label="I acknowledge the Privacy Notice."
          description={
            <span>
              Read the{" "}
              <a
                href="/legal/privacy-policy"
                className="font-semibold underline underline-offset-4"
              >
                Privacy Policy
              </a>{" "}
              before continuing.
            </span>
          }
          error={errors.privacyAcknowledged?.message}
          disabled={isSubmitting}
        />

        <Checkbox
          id="newsletterConsent"
          {...register("newsletterConsent")}
          label="Send me continuing educational emails."
          description="Optional and unchecked by default. Course delivery does not require newsletter consent."
          error={errors.newsletterConsent?.message}
          disabled={isSubmitting}
        />

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            Security verification
          </p>

          <TurnstileWidget
            siteKey={turnstileSiteKey}
            resetKey={turnstileResetKey}
            onTokenChange={handleTurnstileTokenChange}
          />
        </div>

        {submitError ? (
          <p
            className="rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm leading-6 text-warning"
            role="alert"
            aria-live="polite"
          >
            {submitError}
          </p>
        ) : null}

        <Button type="submit" size="large" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Join the free course"}
        </Button>

        <p className="text-center text-xs leading-5 text-muted">
          Your enrolment request is securely verified before it is recorded.
        </p>
      </form>
    </Card>
  );
}
