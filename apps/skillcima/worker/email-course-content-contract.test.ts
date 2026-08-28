import {
  defineSixDayEmailCourse,
  type SixDayEmailCourseDefinition,
} from "@repo/content";
import { describe, expect, it } from "vitest";

function fixture(): SixDayEmailCourseDefinition {
  return {
    courseSlug: "forex-foundations",
    courseName: "Forex Foundations",
    contentVersion: "draft-1",
    status: "draft",
    lessons: [1, 2, 3, 4, 5, 6].map((day) => ({
      day: day as 1 | 2 | 3 | 4 | 5 | 6,
      jobType: `course_day_${day}` as
        | "course_day_1"
        | "course_day_2"
        | "course_day_3"
        | "course_day_4"
        | "course_day_5"
        | "course_day_6",
      subject: `Day ${day}`,
      previewText: `Preview ${day}`,
      heading: `Heading ${day}`,
      intro: `Intro ${day}`,
      paragraphs: [`Paragraph ${day}`],
      keyPoints: [`Point ${day}`],
      riskNote: `Risk ${day}`,
      cta: {
        label: "Continue learning",
        destination: "microsite_lesson",
        path: `/learn/day-${day}`,
      },
      closing: "Skillcima",
    })),
  };
}

describe("six-day email content contract", () => {
  it("accepts a complete editable six-day draft", () => {
    expect(defineSixDayEmailCourse(fixture()).contentVersion).toBe("draft-1");
  });

  it("requires exactly six lessons", () => {
    const input = fixture();

    expect(() =>
      defineSixDayEmailCourse({
        ...input,
        lessons: input.lessons.slice(0, 5),
      }),
    ).toThrow("EMAIL_COURSE_REQUIRES_SIX_LESSONS");
  });

  it("requires day and Queue job type to match", () => {
    const input = fixture();

    const lessons = [...input.lessons];

    lessons[0] = {
      ...lessons[0]!,
      jobType: "course_day_2",
    };

    expect(() =>
      defineSixDayEmailCourse({
        ...input,
        lessons,
      }),
    ).toThrow();
  });

  it("rejects external CTA URLs", () => {
    const input = fixture();

    const lessons = [...input.lessons];

    lessons[0] = {
      ...lessons[0]!,
      cta: {
        label: "Open",
        destination: "microsite_lesson",
        path: "https://broker.example.com",
      },
    };

    expect(() =>
      defineSixDayEmailCourse({
        ...input,
        lessons,
      }),
    ).toThrow("EMAIL_COURSE_CTA_INTERNAL_PATH_REQUIRED");
  });
});
