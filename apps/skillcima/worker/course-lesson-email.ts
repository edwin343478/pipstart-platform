import {
  forexFoundationsEmailCourse,
  type FiveDayEmailJobType,
  type FiveDayEmailLesson,
} from "@repo/content";

import { renderSkillcimaEmailLayout } from "./skillcima-email-layout";
import { skillcimaEmailTheme } from "./skillcima-email-theme";

export interface ComposeCourseLessonEmailInput {
  courseSlug: string;
  jobType: FiveDayEmailJobType;
  firstName: string | null;

  micrositeBaseUrl: string;
  mainSiteBaseUrl: string;
}

export interface ComposedCourseLessonEmail {
  subject: string;
  html: string;
  text: string;
  contentVersion: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireHttpsOrigin(value: string, field: string): URL {
  const url = new URL(value);

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`COURSE_EMAIL_${field.toUpperCase()}_INVALID`);
  }

  return url;
}

function resolveCtaUrl(
  lesson: FiveDayEmailLesson,
  micrositeBaseUrl: URL,
  mainSiteBaseUrl: URL,
): string | null {
  if (lesson.cta.destination === "none" || lesson.cta.path === null) {
    return null;
  }

  const baseUrl =
    lesson.cta.destination === "main_course_start"
      ? mainSiteBaseUrl
      : micrositeBaseUrl;

  return new URL(lesson.cta.path, baseUrl).toString();
}

export function composeCourseLessonEmail(
  input: ComposeCourseLessonEmailInput,
): ComposedCourseLessonEmail {
  if (input.courseSlug !== forexFoundationsEmailCourse.courseSlug) {
    throw new Error("COURSE_EMAIL_COURSE_UNSUPPORTED");
  }

  const lesson = forexFoundationsEmailCourse.lessons.find(
    (candidate) => candidate.jobType === input.jobType,
  );

  if (!lesson) {
    throw new Error("COURSE_EMAIL_LESSON_NOT_FOUND");
  }

  const micrositeBaseUrl = requireHttpsOrigin(
    input.micrositeBaseUrl,
    "microsite_base_url",
  );

  const mainSiteBaseUrl = requireHttpsOrigin(
    input.mainSiteBaseUrl,
    "main_site_base_url",
  );

  const firstName = input.firstName?.trim() || null;

  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  const paragraphs = lesson.paragraphs
    .map(
      (paragraph) => `<p style="margin:0 0 18px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const points = lesson.keyPoints
    .map((point) => `<li style="margin:0 0 10px;">${escapeHtml(point)}</li>`)
    .join("");

  const ctaUrl = resolveCtaUrl(lesson, micrositeBaseUrl, mainSiteBaseUrl);

  const ctaHtml = ctaUrl
    ? `<p style="margin:28px 0 8px;">
        <a
          href="${escapeHtml(ctaUrl)}"
          style="display:inline-block;background:${skillcimaEmailTheme.colors.primary};color:${skillcimaEmailTheme.colors.text};text-decoration:none;font-weight:700;padding:14px 20px;border-radius:10px;"
        >${escapeHtml(lesson.cta.label)}</a>
      </p>`
    : "";

  const trustedContentHtml = `
    <p style="margin:0 0 20px;">${greeting}</p>

    <p style="margin:0 0 18px;">
      ${escapeHtml(lesson.intro)}
    </p>

    ${paragraphs}

    <div
      style="margin:28px 0;padding:20px;background:${skillcimaEmailTheme.colors.soft};border:1px solid ${skillcimaEmailTheme.colors.border};border-radius:12px;"
    >
      <strong>Key points</strong>
      <ul style="margin:14px 0 0;padding-left:22px;">
        ${points}
      </ul>
    </div>

    <div
      style="margin:28px 0;padding:18px;border-left:4px solid ${skillcimaEmailTheme.colors.accent};background:${skillcimaEmailTheme.colors.background};"
    >
      <strong>Risk reminder</strong>
      <div style="margin-top:8px;">
        ${escapeHtml(lesson.riskNote)}
      </div>
    </div>

    ${ctaHtml}

    <p style="margin:28px 0 0;">
      ${escapeHtml(lesson.closing)}
    </p>
  `;

  const html = renderSkillcimaEmailLayout({
    previewText: lesson.previewText,
    eyebrow: `Day ${lesson.day} · ${forexFoundationsEmailCourse.courseName}`,
    heading: lesson.heading,
    trustedContentHtml,
  });

  const textParts = [
    firstName ? `Hi ${firstName},` : "Hi,",
    "",
    lesson.heading,
    "",
    lesson.intro,
    "",
    ...lesson.paragraphs,
    "",
    "Key points:",
    ...lesson.keyPoints.map((point) => `- ${point}`),
    "",
    `Risk reminder: ${lesson.riskNote}`,
  ];

  if (ctaUrl) {
    textParts.push("", `${lesson.cta.label}: ${ctaUrl}`);
  }

  textParts.push(
    "",
    lesson.closing,
    "",
    `${skillcimaEmailTheme.brandName} · ${skillcimaEmailTheme.domain}`,
  );

  return {
    subject: lesson.subject,
    html,
    text: textParts.join("\n"),
    contentVersion: forexFoundationsEmailCourse.contentVersion,
  };
}
