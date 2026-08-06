"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadFormDefaultValues,
  leadFormSchema,
  type LeadFormData,
  type LeadFormInput,
} from "@repo/validation";
import { Button, Card, Checkbox, FormField, Input } from "@repo/ui";
import { useForm } from "react-hook-form";

export function LeadForm() {
  const [validatedData, setValidatedData] = useState<LeadFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, Record<string, never>, LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaultValues,
    mode: "onBlur",
  });

  function onSubmit(data: LeadFormData) {
    setValidatedData(data);
  }

  if (validatedData) {
    return (
      <Card padded={false} className="p-8" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-xl font-bold"
        >
          ✓
        </div>

        <h3 className="mt-5 font-heading text-2xl font-bold">
          Your details passed validation
        </h3>

        <p className="mt-3 leading-7 text-muted">
          This is currently a local form preview. Your information has not been
          sent, stored or added to an email list.
        </p>

        <dl className="mt-6 space-y-3 rounded-xl bg-background p-4 text-sm">
          {validatedData.firstName ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">First name</dt>
              <dd className="font-semibold">{validatedData.firstName}</dd>
            </div>
          ) : null}

          <div className="flex justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="break-all font-semibold">{validatedData.email}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted">Newsletter</dt>
            <dd className="font-semibold">
              {validatedData.newsletterConsent ? "Selected" : "Not selected"}
            </dd>
          </div>
        </dl>

        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => setValidatedData(null)}
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
        Enter your email to preview the enrolment process. No information will
        leave your browser during this development step.
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
                href="#privacy-summary"
                className="font-semibold underline underline-offset-4"
              >
                privacy summary
              </a>{" "}
              before continuing.
            </span>
          }
          error={errors.privacyAcknowledged?.message}
        />

        <Checkbox
          id="newsletterConsent"
          {...register("newsletterConsent")}
          label="Send me continuing educational emails."
          description="Optional and unchecked by default. Course delivery does not require newsletter consent."
          error={errors.newsletterConsent?.message}
        />

        <Button type="submit" size="large" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Checking details…" : "Validate my enrolment"}
        </Button>

        <p className="text-center text-xs leading-5 text-muted">
          Development preview only. No data is transmitted or stored.
        </p>
      </form>
    </Card>
  );
}
