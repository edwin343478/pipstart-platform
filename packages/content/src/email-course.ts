export const FIVE_DAY_EMAIL_JOB_TYPES = [
  "course_day_1",
  "course_day_2",
  "course_day_3",
  "course_day_4",
  "course_day_5",
] as const;

export type FiveDayEmailJobType = (typeof FIVE_DAY_EMAIL_JOB_TYPES)[number];

export type FiveDayEmailCourseDay = 1 | 2 | 3 | 4 | 5;

export type EmailCourseContentStatus = "draft" | "approved";

export type EmailCourseCtaDestination =
  "none" | "microsite_lesson" | "main_course_start";

export interface EmailCourseCta {
  label: string;
  destination: EmailCourseCtaDestination;
  path: string | null;
}

export interface FiveDayEmailLesson {
  day: FiveDayEmailCourseDay;
  jobType: FiveDayEmailJobType;

  subject: string;
  previewText: string;
  heading: string;

  intro: string;
  paragraphs: readonly string[];
  keyPoints: readonly string[];

  riskNote: string;

  cta: EmailCourseCta;

  closing: string;
}

export interface FiveDayEmailCourseDefinition {
  courseSlug: string;
  courseName: string;

  /*
   * Examples:
   * draft-1
   * draft-2
   * release-1
   */
  contentVersion: string;

  status: EmailCourseContentStatus;

  lessons: readonly FiveDayEmailLesson[];
}

const EXPECTED_JOB_TYPE_BY_DAY: Record<
  FiveDayEmailCourseDay,
  FiveDayEmailJobType
> = {
  1: "course_day_1",
  2: "course_day_2",
  3: "course_day_3",
  4: "course_day_4",
  5: "course_day_5",
};

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`EMAIL_COURSE_${field.toUpperCase()}_REQUIRED`);
  }
}

function validateCta(cta: EmailCourseCta): void {
  requireText(cta.label, "cta_label");

  if (cta.destination === "none") {
    if (cta.path !== null) {
      throw new Error("EMAIL_COURSE_CTA_NONE_PATH_INVALID");
    }

    return;
  }

  if (!cta.path || !cta.path.startsWith("/") || cta.path.includes("://")) {
    throw new Error("EMAIL_COURSE_CTA_INTERNAL_PATH_REQUIRED");
  }
}

export function defineFiveDayEmailCourse(
  input: FiveDayEmailCourseDefinition,
): FiveDayEmailCourseDefinition {
  requireText(input.courseSlug, "course_slug");
  requireText(input.courseName, "course_name");
  requireText(input.contentVersion, "content_version");

  if (!/^[a-z0-9][a-z0-9._-]{0,49}$/.test(input.contentVersion)) {
    throw new Error("EMAIL_COURSE_CONTENT_VERSION_INVALID");
  }

  if (input.lessons.length !== 5) {
    throw new Error("EMAIL_COURSE_REQUIRES_FIVE_LESSONS");
  }

  const seenDays = new Set<FiveDayEmailCourseDay>();

  const seenJobTypes = new Set<FiveDayEmailJobType>();

  for (const lesson of input.lessons) {
    if (seenDays.has(lesson.day)) {
      throw new Error("EMAIL_COURSE_DUPLICATE_DAY");
    }

    seenDays.add(lesson.day);

    if (seenJobTypes.has(lesson.jobType)) {
      throw new Error("EMAIL_COURSE_DUPLICATE_JOB_TYPE");
    }

    seenJobTypes.add(lesson.jobType);

    if (EXPECTED_JOB_TYPE_BY_DAY[lesson.day] !== lesson.jobType) {
      throw new Error("EMAIL_COURSE_DAY_JOB_TYPE_MISMATCH");
    }

    requireText(lesson.subject, "subject");
    requireText(lesson.previewText, "preview_text");
    requireText(lesson.heading, "heading");
    requireText(lesson.intro, "intro");
    requireText(lesson.riskNote, "risk_note");
    requireText(lesson.closing, "closing");

    if (lesson.paragraphs.length === 0) {
      throw new Error("EMAIL_COURSE_PARAGRAPHS_REQUIRED");
    }

    for (const paragraph of lesson.paragraphs) {
      requireText(paragraph, "paragraph");
    }

    for (const keyPoint of lesson.keyPoints) {
      requireText(keyPoint, "key_point");
    }

    validateCta(lesson.cta);
  }

  return input;
}
