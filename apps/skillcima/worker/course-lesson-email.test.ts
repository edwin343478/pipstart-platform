import {
  SIX_DAY_EMAIL_JOB_TYPES,
  forexFoundationsEmailCourse,
} from "@repo/content";
import { describe, expect, it } from "vitest";

import { composeCourseLessonEmail } from "./course-lesson-email";

const baseInput = {
  courseSlug: "forex-foundations",
  firstName: "Amina",
  micrositeBaseUrl: "https://skillcima.com/",
  mainSiteBaseUrl: "https://pipstart.net/",
};

describe("Skillcima six-day course lesson content", () => {
  it("contains exactly six approved emails", () => {
    expect(forexFoundationsEmailCourse.status).toBe("approved");

    expect(forexFoundationsEmailCourse.contentVersion).toBe("v2");

    expect(forexFoundationsEmailCourse.lessons).toHaveLength(6);
  });

  it("covers all six Queue job types", () => {
    expect(
      forexFoundationsEmailCourse.lessons.map((lesson) => lesson.jobType),
    ).toEqual(SIX_DAY_EMAIL_JOB_TYPES);
  });

  it.each(SIX_DAY_EMAIL_JOB_TYPES)(
    "composes %s using the Skillcima email layout",
    (jobType) => {
      const result = composeCourseLessonEmail({
        ...baseInput,
        jobType,
      });

      expect(result.subject).toBeTruthy();
      expect(result.html).toContain("Skillcima");

      expect(result.html).toContain("#BFDD6E");

      expect(result.text).toContain("Risk reminder:");

      expect(result.contentVersion).toBe("v2");
    },
  );

  it("escapes recipient personalization", () => {
    const result = composeCourseLessonEmail({
      ...baseInput,
      jobType: "course_day_1",
      firstName: '<script>alert("x")</script>',
    });

    expect(result.html).not.toContain('<script>alert("x")</script>');

    expect(result.html).toContain("&lt;script&gt;");
  });

  it("keeps Days 1-5 free of CTA links", () => {
    for (const jobType of SIX_DAY_EMAIL_JOB_TYPES.slice(0, 5)) {
      const result = composeCourseLessonEmail({
        ...baseInput,
        jobType,
      });

      expect(result.html).not.toContain('href="https://');
    }
  });

  it("links Day 6 only to the supplied PipStart origin", () => {
    const result = composeCourseLessonEmail({
      ...baseInput,
      jobType: "course_day_6",
    });

    expect(result.html).toContain('href="https://pipstart.net/learn"');

    expect(result.text).toContain("https://pipstart.net/learn");
  });

  it("rejects unsupported course slugs", () => {
    expect(() =>
      composeCourseLessonEmail({
        ...baseInput,
        courseSlug: "unknown-course",
        jobType: "course_day_1",
      }),
    ).toThrow("COURSE_EMAIL_COURSE_UNSUPPORTED");
  });

  it("rejects insecure content origins", () => {
    expect(() =>
      composeCourseLessonEmail({
        ...baseInput,
        jobType: "course_day_6",
        mainSiteBaseUrl: "http://pipstart.net/",
      }),
    ).toThrow("COURSE_EMAIL_MAIN_SITE_BASE_URL_INVALID");
  });

  it("contains no affiliate URL in the approved content", () => {
    const serialized = JSON.stringify(
      forexFoundationsEmailCourse,
    ).toLowerCase();

    expect(serialized).not.toContain("affiliate");

    expect(serialized).not.toContain("broker.example");
  });
});
