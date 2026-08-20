const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

const COURSE_NAMES = {
  "forex-foundations": "Forex Foundations",
} as const;

type SupportedCourseSlug = keyof typeof COURSE_NAMES;

export interface ConfirmationEmailInput {
  publicOrigin: string;
  firstName: string | null;
  courseSlug: string;
  confirmationToken: string;
  confirmationExpiresAt: string;
}

export type ConfirmationEmailContentResult =
  | {
      status: "ready";
      subject: string;
      text: string;
      html: string;
      confirmationUrl: string;
    }
  | {
      status: "invalid_input";
    };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeFirstName(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length < 1 || normalized.length > 100) {
    return null;
  }

  return normalized;
}

function parsePublicOrigin(value: string): URL | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const isHttps = url.protocol === "https:";

  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");

  if (!isHttps && !isLocalHttp) {
    return null;
  }

  if (url.username || url.password) {
    return null;
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url;
}

function isSupportedCourseSlug(value: string): value is SupportedCourseSlug {
  return Object.prototype.hasOwnProperty.call(COURSE_NAMES, value);
}

export function composeConfirmationEmail(
  input: ConfirmationEmailInput,
): ConfirmationEmailContentResult {
  const origin = parsePublicOrigin(input.publicOrigin);

  if (!origin) {
    return {
      status: "invalid_input",
    };
  }

  if (!TOKEN_PATTERN.test(input.confirmationToken)) {
    return {
      status: "invalid_input",
    };
  }

  if (!isSupportedCourseSlug(input.courseSlug)) {
    return {
      status: "invalid_input",
    };
  }

  const expiresAt = Date.parse(input.confirmationExpiresAt);

  if (!Number.isFinite(expiresAt)) {
    return {
      status: "invalid_input",
    };
  }

  const firstName = normalizeFirstName(input.firstName);

  if (input.firstName !== null && firstName === null) {
    return {
      status: "invalid_input",
    };
  }

  const courseName = COURSE_NAMES[input.courseSlug];

  const confirmationUrl = new URL("/confirm", origin);

  confirmationUrl.searchParams.set("token", input.confirmationToken);

  const url = confirmationUrl.toString();

  const greeting = firstName ? `Hi ${firstName},` : "Hello,";

  const subject = `Confirm your free Skillcima ${courseName} course`;

  const text = [
    greeting,
    "",
    `You asked to receive Skillcima's free five-day ${courseName} course by email.`,
    "",
    "Confirm your course:",
    url,
    "",
    "For security, this confirmation link expires automatically.",
    "",
    "If you did not request this course, you can ignore this email.",
    "",
    "Skillcima",
  ].join("\n");

  const escapedGreeting = escapeHtml(greeting);

  const escapedCourseName = escapeHtml(courseName);

  const escapedUrl = escapeHtml(url);

  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Confirm your Skillcima course</title>",
    "</head>",
    '<body style="margin:0;padding:0;background:#f7f5ed;font-family:Arial,sans-serif;color:#111827;">',
    '<div style="max-width:600px;margin:0 auto;padding:32px 20px;">',
    '<div style="background:#ffffff;border-radius:16px;padding:32px;">',
    '<p style="margin:0 0 16px;font-size:16px;">',
    escapedGreeting,
    "</p>",
    '<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Confirm your free course</h1>',
    '<p style="margin:0 0 24px;font-size:16px;line-height:1.6;">',
    `You asked to receive Skillcima's free five-day ${escapedCourseName} course by email.`,
    "</p>",
    '<p style="margin:0 0 24px;">',
    `<a href="${escapedUrl}" style="display:inline-block;padding:14px 22px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;">Confirm my course</a>`,
    "</p>",
    '<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b5563;">For security, this confirmation link expires automatically.</p>',
    '<p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">If you did not request this course, you can ignore this email.</p>',
    "</div>",
    '<p style="margin:20px 0 0;text-align:center;font-size:13px;color:#6b7280;">Skillcima</p>',
    "</div>",
    "</body>",
    "</html>",
  ].join("");

  return {
    status: "ready",
    subject,
    text,
    html,
    confirmationUrl: url,
  };
}
