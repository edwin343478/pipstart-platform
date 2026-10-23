// Preference state is not proof of express consent or eligibility to send.
export const EMAIL_PREFERENCE_MODEL = "pipstart-optional-email-v1";
export type LearningEmailFrequency = "all" | "weekly";
export interface OptionalEmailPreferences {
  educationalEmails: boolean;
  marketingEmails: boolean;
  learningFrequency: LearningEmailFrequency;
}
type PreferenceResult =
  | { ok: true; value: OptionalEmailPreferences }
  | { ok: false; message: string };

export function readEmailPreferenceForm(
  form: FormData,
  registration = false,
): PreferenceResult {
  const version = form.getAll("emailPreferenceModel");
  // Older signup clients had no preference controls. New account defaults apply,
  // but this branch must never reinterpret an older saved-settings submission.
  if (registration && version.length === 0) {
    return {
      ok: true,
      value: {
        educationalEmails: true,
        marketingEmails: true,
        learningFrequency: "all",
      },
    };
  }
  if (version.length !== 1 || version[0] !== EMAIL_PREFERENCE_MODEL) {
    return {
      ok: false,
      message: "Refresh this page before saving email preferences.",
    };
  }
  const educational = form.getAll("educationalEmails");
  const marketing = form.getAll("marketingEmails");
  const frequency = form.getAll("learningFrequency");
  if (
    educational.length > 1 ||
    marketing.length > 1 ||
    (educational.length === 1 && educational[0] !== "on") ||
    (marketing.length === 1 && marketing[0] !== "on") ||
    frequency.length !== 1 ||
    (frequency[0] !== "all" && frequency[0] !== "weekly") ||
    (registration && frequency[0] !== "all")
  ) {
    return {
      ok: false,
      message: "Check your email preferences and try again.",
    };
  }
  return {
    ok: true,
    value: {
      educationalEmails: educational.length === 1,
      marketingEmails: marketing.length === 1,
      learningFrequency: frequency[0],
    },
  };
}

export function readStoredEmailPreferences(
  data: unknown,
): OptionalEmailPreferences | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (
    typeof row.educational_emails !== "boolean" ||
    typeof row.marketing_emails !== "boolean" ||
    (row.learning_frequency !== "all" && row.learning_frequency !== "weekly")
  )
    return null;
  return {
    educationalEmails: row.educational_emails,
    marketingEmails: row.marketing_emails,
    learningFrequency: row.learning_frequency,
  };
}
