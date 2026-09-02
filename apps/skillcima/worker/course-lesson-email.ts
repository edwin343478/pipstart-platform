import {
  forexFoundationsEmailCourse,
  type SixDayEmailJobType,
  type SixDayEmailLesson,
} from "@repo/content";

import { renderSkillcimaEmailLayout } from "./skillcima-email-layout";
import { skillcimaEmailTheme } from "./skillcima-email-theme";

export interface ComposeCourseLessonEmailInput {
  courseSlug: string;
  jobType: SixDayEmailJobType;
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
  lesson: SixDayEmailLesson,
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

  const illustrationUrl = lesson.illustrationPath
    ? new URL(lesson.illustrationPath, micrositeBaseUrl).toString()
    : null;

  const illustrationHtml = illustrationUrl
    ? `<img
        src="${escapeHtml(illustrationUrl)}"
        width="452"
        alt="Illustration for ${escapeHtml(lesson.heading)}"
        style="display:block;width:100%;max-width:452px;height:auto;margin:6px 0 22px;border:0;border-radius:12px;background:${skillcimaEmailTheme.colors.background};"
      >`
    : "";

  const paragraphs = lesson.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 15px;font-size:15px;line-height:1.65;color:${skillcimaEmailTheme.colors.text};">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const points = lesson.keyPoints
    .map(
      (point) => `
        <tr>
          <td
            valign="top"
            width="25"
            style="width:25px;padding:1px 10px 11px 0;"
          >
            <div style="width:20px;height:20px;border-radius:999px;background:${skillcimaEmailTheme.colors.primary};font-size:12px;font-weight:800;line-height:20px;text-align:center;color:${skillcimaEmailTheme.colors.text};">
              &#10003;
            </div>
          </td>

          <td
            valign="top"
            style="padding:0 0 11px;font-size:14px;line-height:1.5;color:${skillcimaEmailTheme.colors.text};"
          >
            ${escapeHtml(point)}
          </td>
        </tr>`,
    )
    .join("");

  const ctaUrl = resolveCtaUrl(lesson, micrositeBaseUrl, mainSiteBaseUrl);

  const ctaHtml = ctaUrl
    ? `<table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin:22px 0 4px;"
      >
        <tr>
          <td
            align="center"
            bgcolor="${skillcimaEmailTheme.colors.text}"
            style="border-radius:10px;"
          >
            <a
              class="skillcima-button"
              href="${escapeHtml(ctaUrl)}"
              style="display:inline-block;padding:13px 20px;border:1px solid ${skillcimaEmailTheme.colors.text};border-radius:10px;background:${skillcimaEmailTheme.colors.text};font-size:14px;font-weight:800;line-height:1.2;color:#ffffff;text-decoration:none;"
            >
              ${escapeHtml(lesson.cta.label)} &rarr;
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const renderLearningBox = (
    label: string,
    content: string | undefined,
    background: string,
  ): string =>
    content
      ? `<table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="width:100%;margin:18px 0;background:${background};border:1px solid ${skillcimaEmailTheme.colors.border};border-radius:12px;"
        >
          <tr>
            <td style="padding:16px 18px;">
              <div style="margin:0 0 7px;font-size:11px;font-weight:800;line-height:1.3;letter-spacing:0.9px;text-transform:uppercase;color:${skillcimaEmailTheme.colors.accent};">
                ${escapeHtml(label)}
              </div>
              <div style="font-size:14px;line-height:1.6;color:${skillcimaEmailTheme.colors.text};">
                ${escapeHtml(content)}
              </div>
            </td>
          </tr>
        </table>`
      : "";

  const exampleHtml = renderLearningBox(
    "Simple example",
    lesson.example,
    skillcimaEmailTheme.colors.background,
  );
  const activityHtml = renderLearningBox(
    "Try it yourself",
    lesson.activity,
    "#FFF8EF",
  );

  const teaserHtml = lesson.teaser
    ? `<p style="margin:20px 0 0;padding-top:17px;border-top:1px solid ${skillcimaEmailTheme.colors.border};font-size:14px;font-weight:700;line-height:1.6;color:${skillcimaEmailTheme.colors.text};">
        ${escapeHtml(lesson.teaser)}
      </p>`
    : "";

  const closingHtml = escapeHtml(lesson.closing).replaceAll("\n", "<br>");

  const trustedContentHtml = `
    ${illustrationHtml}

    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${skillcimaEmailTheme.colors.text};">
      ${greeting}
    </p>

    <p style="margin:0 0 18px;font-size:16px;font-weight:600;line-height:1.55;color:${skillcimaEmailTheme.colors.text};">
      ${escapeHtml(lesson.intro)}
    </p>

    ${paragraphs}

    ${exampleHtml}

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width:100%;margin:22px 0 18px;background:${skillcimaEmailTheme.colors.soft};border:1px solid ${skillcimaEmailTheme.colors.border};border-radius:12px;"
    >
      <tr>
        <td style="padding:18px 18px 7px;">
          <div style="margin:0 0 13px;font-size:11px;font-weight:800;line-height:1.3;letter-spacing:0.9px;text-transform:uppercase;color:${skillcimaEmailTheme.colors.accent};">
            Key points
          </div>

          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            ${points}
          </table>
        </td>
      </tr>
    </table>

    ${activityHtml}

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width:100%;margin:18px 0;background:${skillcimaEmailTheme.colors.background};border-radius:10px;"
    >
      <tr>
        <td
          width="4"
          style="width:4px;background:${skillcimaEmailTheme.colors.accent};border-radius:10px 0 0 10px;font-size:0;line-height:0;"
        >
          &nbsp;
        </td>

        <td style="padding:14px 16px;">
          <div style="margin:0 0 5px;font-size:10px;font-weight:800;line-height:1.3;letter-spacing:0.8px;text-transform:uppercase;color:${skillcimaEmailTheme.colors.accent};">
            Risk reminder
          </div>

          <div style="font-size:13px;line-height:1.55;color:${skillcimaEmailTheme.colors.text};">
            ${escapeHtml(lesson.riskNote)}
          </div>
        </td>
      </tr>
    </table>

    ${ctaHtml}

    ${teaserHtml}

    <p style="margin:20px 0 0;padding-top:17px;border-top:1px solid ${skillcimaEmailTheme.colors.border};font-size:14px;line-height:1.6;color:${skillcimaEmailTheme.colors.muted};">
      ${closingHtml}
    </p>
  `;

  const isCompletionEmail = lesson.day === 6;

  const html = renderSkillcimaEmailLayout({
    previewText: lesson.previewText,
    eyebrow: isCompletionEmail
      ? forexFoundationsEmailCourse.courseName
      : `Lesson ${lesson.day}`,
    heading: lesson.heading,
    trustedContentHtml,
    progressCurrent: isCompletionEmail ? 5 : lesson.day,
    progressTotal: 5,
    progressLabel: isCompletionEmail
      ? "Course complete"
      : `Day ${lesson.day} of 5`,
  });

  const textParts = [
    firstName ? `Hi ${firstName},` : "Hi,",
    "",
    lesson.heading,
    "",
    lesson.intro,
    "",
    ...lesson.paragraphs,
    ...(lesson.example ? ["", `Simple example: ${lesson.example}`] : []),
    "",
    "Key points:",
    ...lesson.keyPoints.map((point) => `- ${point}`),
    ...(lesson.activity ? ["", `Try it yourself: ${lesson.activity}`] : []),
    "",
    `Risk reminder: ${lesson.riskNote}`,
  ];

  if (ctaUrl) {
    textParts.push("", `${lesson.cta.label}: ${ctaUrl}`);
  }

  if (lesson.teaser) {
    textParts.push("", lesson.teaser);
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
