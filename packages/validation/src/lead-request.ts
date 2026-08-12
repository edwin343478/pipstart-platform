import { z } from "zod";

import { leadFormSchema } from "./lead-form";

export const leadRequestSchema = z
  .object({
    submissionId: z.string().uuid("Submission ID must be a valid UUID."),

    turnstileToken: z
      .string()
      .trim()
      .min(1, "Turnstile verification token is required.")
      .max(2048, "Turnstile verification token is too long."),

    lead: leadFormSchema,
  })
  .strict();

export type LeadRequestInput = z.input<typeof leadRequestSchema>;
export type LeadRequestData = z.output<typeof leadRequestSchema>;
