import { z } from "zod";

const optionalFirstNameSchema = z
  .string()
  .trim()
  .max(50, "First name must not exceed 50 characters.")
  .refine(
    (value) => value.length === 0 || value.length >= 2,
    "First name must contain at least 2 characters.",
  )
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const leadFormSchema = z
  .object({
    firstName: optionalFirstNameSchema,

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254, "Email address must not exceed 254 characters.")
      .transform((value) => value.toLowerCase()),

    privacyAcknowledged: z.boolean().refine((value) => value, {
      message: "You must acknowledge the Privacy Notice.",
    }),

    newsletterConsent: z.boolean(),
  })
  .strict();

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormData = z.output<typeof leadFormSchema>;

export const leadFormDefaultValues: LeadFormInput = {
  firstName: "",
  email: "",
  privacyAcknowledged: false,
  newsletterConsent: false,
};
