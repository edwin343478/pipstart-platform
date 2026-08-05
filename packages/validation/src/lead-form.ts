import { z } from "zod";

export const leadFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Enter your first name.")
      .max(50, "First name must not exceed 50 characters."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254, "Email address must not exceed 254 characters.")
      .transform((value) => value.toLowerCase()),

    privacyAcknowledged: z.boolean().refine((value) => value, {
      message: "You must acknowledge the Privacy Notice.",
    }),

    marketingConsent: z.boolean(),
  })
  .strict();

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormData = z.output<typeof leadFormSchema>;

export const leadFormDefaultValues: LeadFormInput = {
  firstName: "",
  email: "",
  privacyAcknowledged: false,
  marketingConsent: false,
};
