import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("PUBLISHED_ROUTE_NOT_FOUND");
  },
}));
vi.mock("../components/lesson-page", () => ({ LessonPage: () => null }));
vi.mock("../components/curriculum-page", () => ({
  CurriculumPage: () => null,
}));
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericRoot from "./learn/forex/[level]/page";
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import GenericModule from "./learn/forex/[level]/[segment]/[module]/page";
import LegacyRoot from "./learn/forex/level-1/page";
import LegacyLesson from "./learn/forex/level-1/[lesson]/page";
import { getPublishedLessons } from "../content/lesson-registry";
import { getGenericForexLevelContext } from "../lib/forex-level-routing";

describe("Published Forex route page resolution", () => {
  const lessons = getPublishedLessons({ learningPath: "forex" });
  it.each(lessons)("resolves $href to its published lesson", async (lesson) => {
    const page =
      lesson.level === "level-1"
        ? lesson.position === 1
          ? LegacyRoot()
          : await LegacyLesson({
              params: Promise.resolve({ lesson: lesson.slug }),
            })
        : lesson.position === 1
          ? await GenericRoot({
              params: Promise.resolve({ level: lesson.level }),
            })
          : await GenericSegment({
              params: Promise.resolve({
                level: lesson.level,
                segment: lesson.slug,
              }),
            });
    expect(page.props.lesson.id).toBe(lesson.id);
  });
  it.each([
    "level-0",
    "level-2",
    "level-3",
    "level-4",
    "level-5",
    "level-6",
    "level-7",
    "level-8",
    "level-9",
    "level-10",
  ])("resolves %s course and module", async (level) => {
    const context = getGenericForexLevelContext(level)!;
    expect(
      (
        await GenericSegment({
          params: Promise.resolve({ level, segment: context.course.id }),
        })
      ).props.course.id,
    ).toBe(context.course.id);
    expect(
      (
        await GenericModule({
          params: Promise.resolve({
            level,
            segment: context.course.id,
            module: context.module.id,
          }),
        })
      ).props.module.id,
    ).toBe(context.module.id);
  });
  it("resolves the Broker Foundations quiz", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-2", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe("broker-foundations-quiz");
    expect(JSON.stringify(page.props.assessment)).not.toContain(
      "correctChoiceIds",
    );
  });
  it("continues to reject unavailable or unknown routes", async () => {
    await expect(
      GenericRoot({ params: Promise.resolve({ level: "level-11" }) }),
    ).rejects.toThrow("PUBLISHED_ROUTE_NOT_FOUND");
    await expect(
      GenericSegment({
        params: Promise.resolve({
          level: "level-2",
          segment: "unpublished-lesson",
        }),
      }),
    ).rejects.toThrow("PUBLISHED_ROUTE_NOT_FOUND");
    await expect(
      LegacyLesson({
        params: Promise.resolve({ lesson: "unpublished-lesson" }),
      }),
    ).rejects.toThrow("PUBLISHED_ROUTE_NOT_FOUND");
  });
});
