"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadFormDefaultValues,
  leadFormSchema,
  type LeadFormData,
  type LeadFormInput,
} from "@repo/validation";
import { Button, Card, Checkbox, FormField, Input } from "@repo/ui";
import { useForm } from "react-hook-form";

import { TurnstileWidget } from "./turnstile-widget";

interface LeadApiSuccess {
  ok: true;
  data: {
    status: string;
    submissionId: string;
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
  const [verifiedData, setVerifiedData] = useState<LeadFormData | null>(null);
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

    const submissionId = crypto.randomUUID();

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

      setVerifiedData(data);
      setTurnstileToken(null);
    } catch {
      setSubmitError(
        "We could not reach the verification service. Please try again.",
      );

      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    }
  }

  if (verifiedData) {
    return (
      <Card padded={false} className="p-8" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-xl font-bold"
        >
          ✓
        </div>

        <h3 className="mt-5 font-heading text-2xl font-bold">
          Secure verification passed
        </h3>

        <p className="mt-3 leading-7 text-muted">
          Your details reached the local Skillcima API and passed form and
          security verification. Nothing has been stored or added to an email
          list yet.
        </p>

        <dl className="mt-6 space-y-3 rounded-xl bg-background p-4 text-sm">
          {verifiedData.firstName ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">First name</dt>
              <dd className="font-semibold">{verifiedData.firstName}</dd>
            </div>
          ) : null}

          <div className="flex justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="break-all font-semibold">{verifiedData.email}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted">Newsletter</dt>
            <dd className="font-semibold">
              {verifiedData.newsletterConsent ? "Selected" : "Not selected"}
            </dd>
          </div>
        </dl>

        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => {
            setVerifiedData(null);
            setSubmitError(null);
            setTurnstileToken(null);
            setTurnstileResetKey((value) => value + 1);
          }}
        >
          Edit the form
        </Button>
      </Card>
    );
  }

  return (
    <Card padded={false} className="p-6 sm:p-8">
      <h3 className="font-heading text-2xl font-bold">Join the free course</h3>

      <p className="mt-3 leading-7 text-muted">
        Enter your details to test the secure enrolment flow. This development
        stage verifies the request but does not store your information or start
        email delivery.
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
          {isSubmitting ? "Verifying..." : "Validate my enrolment"}
        </Button>

        <p className="text-center text-xs leading-5 text-muted">
          Development preview. Requests are securely verified but are not stored
          yet.
        </p>
      </form>
    </Card>
  );
}
