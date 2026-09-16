export const PASSWORD_MIN_LENGTH = 8;

export type ValidationResult =
  { ok: true; value: string } | { message: string; ok: false };

export function validateEmail(
  value: FormDataEntryValue | null,
): ValidationResult {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { message: "Enter a valid email address.", ok: false };
  }
  return { ok: true, value: email };
}

export function validatePassword(
  value: FormDataEntryValue | null,
): ValidationResult {
  const password = typeof value === "string" ? value : "";
  if (password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
    return {
      message: `Use between ${PASSWORD_MIN_LENGTH} and 128 characters.`,
      ok: false,
    };
  }
  return { ok: true, value: password };
}

export function validateDisplayName(
  value: FormDataEntryValue | null,
): ValidationResult {
  const displayName =
    typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (displayName.length < 2 || displayName.length > 60) {
    return { message: "Use between 2 and 60 characters.", ok: false };
  }
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\p{N} .'-]*$/u.test(displayName)) {
    return {
      message: "Use letters, numbers, spaces, apostrophes, periods or hyphens.",
      ok: false,
    };
  }
  return { ok: true, value: displayName };
}

export function safeInternalRedirect(
  value: string | null | undefined,
  fallback = "/account/settings",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "https://pipstart.net");
    return parsed.origin === "https://pipstart.net"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
