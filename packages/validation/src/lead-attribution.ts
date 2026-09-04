import { z } from "zod";

const attributionValueSchema = z
  .string()
  .trim()
  .min(1, "Attribution values must not be empty.")
  .max(100, "Attribution values must not exceed 100 characters.")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9._~-]*$/,
    "Attribution values contain unsupported characters.",
  );

export const leadAttributionSchema = z
  .object({
    utmSource: attributionValueSchema.optional(),
    utmMedium: attributionValueSchema.optional(),
    utmCampaign: attributionValueSchema.optional(),
    utmContent: attributionValueSchema.optional(),
    utmTerm: attributionValueSchema.optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some(Boolean), {
    message: "Attribution must contain at least one UTM value.",
  });

export type LeadAttributionInput = z.input<typeof leadAttributionSchema>;
export type LeadAttributionData = z.output<typeof leadAttributionSchema>;
