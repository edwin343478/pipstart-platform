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
      (paragraph) =>
        `<p style="margin:0 0 18px;font-size:16px;line-height:1.72;color:${skillcimaEmailTheme.colors.text};">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const points = lesson.keyPoints
    .map(
      (point, index) => `
        <tr>
          <td valign="top" style="width:42px;padding:0 14px 14px 0;">
            <div style="width:32px;height:32px;border-radius:999px;background:${skillcimaEmailTheme.colors.primary};font-size:13px;font-weight:800;line-height:32px;text-align:center;color:${skillcimaEmailTheme.colors.text};">
              ${index + 1}
            </div>
          </td>
          <td valign="top" style="padding:3px 0 14px;font-size:15px;line-height:1.6;color:${skillcimaEmailTheme.colors.text};">
            ${escapeHtml(point)}
          </td>
        </tr>`,
    )
    .join("");

  const ctaUrl = resolveCtaUrl(lesson, micrositeBaseUrl, mainSiteBaseUrl);

  const ctaHtml = ctaUrl
    ? `<div style="margin:30px 0 8px;">
        <a
          href="${escapeHtml(ctaUrl)}"
          style="display:inline-block;background:${skillcimaEmailTheme.colors.primary};color:${skillcimaEmailTheme.colors.text};text-decoration:none;font-weight:800;padding:15px 22px;border-radius:999px;border:1px solid ${skillcimaEmailTheme.colors.text};"
        >${escapeHtml(lesson.cta.label)}</a>
      </div>`
    : "";

  const trustedContentHtml = `
    <div style="margin:0 0 28px;">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${skillcimaEmailTheme.colors.text};">${greeting}</p>

      <p style="margin:0 0 22px;font-size:18px;line-height:1.65;color:${skillcimaEmailTheme.colors.text};">
        ${escapeHtml(lesson.intro)}
      </p>

      ${paragraphs}
    </div>

    <div
      style="margin:30px 0;padding:24px 24px 10px;background:${skillcimaEmailTheme.colors.soft};border:1px solid ${skillcimaEmailTheme.colors.border};border-radius:18px;"
    >
      <div style="margin:0 0 18px;font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${skillcimaEmailTheme.colors.accent};">
        Learning brief
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${points}
      </table>
    </div>

    <div
      style="margin:30px 0;padding:20px 22px;background:${skillcimaEmailTheme.colors.background};border-left:5px solid ${skillcimaEmailTheme.colors.accent};border-radius:14px;"
    >
      <div style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase;color:${skillcimaEmailTheme.colors.accent};">
        Risk reminder
      </div>
      <div style="font-size:15px;line-height:1.65;color:${skillcimaEmailTheme.colors.text};">
        ${escapeHtml(lesson.riskNote)}
      </div>
    </div>

    ${ctaHtml}

    <div style="margin:30px 0 0;padding-top:22px;border-top:1px solid ${skillcimaEmailTheme.colors.border};">
      <p style="margin:0;font-size:16px;line-height:1.7;color:${skillcimaEmailTheme.colors.text};">
        ${escapeHtml(lesson.closing)}
      </p>
    </div>
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
