import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
vi.mock("../components/SteppedLessonArticle", () => ({
  LessonSidebar: ({
    lessons,
    quiz,
  }: {
    lessons: { href: string; title: string }[];
    quiz?: { href: string; title: string };
  }) => (
    <nav>
      {[...lessons, ...(quiz ? [quiz] : [])].map((item) => (
        <a href={item.href} key={item.href}>
          {item.title}
        </a>
      ))}
    </nav>
  ),
  SteppedLessonArticle: ({
    endOfLevel,
  }: {
    endOfLevel?: { ctaHref: string; ctaLabel: string };
  }) =>
    endOfLevel ? (
      <a data-testid="end-of-level" href={endOfLevel.ctaHref}>
        {endOfLevel.ctaLabel}
      </a>
    ) : null,
}));
import { LessonPage } from "../components/lesson-page";
import { getPublishedLessons } from "../content/lesson-registry";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import {
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
} from "../lib/forex-level-routing";
import { assertValidAssessmentRegistry } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { brokerFoundationsQuizV1 } from "../lib/broker-foundations-assessment";
import sitemap from "./sitemap";
describe("Level 1 and 2 quiz completion links", () => {
  it.each([1, 2])(
    "ends Level %i with its registered quiz without an explicit target",
    (level) => {
      const lessons = getPublishedLessons({
        learningPath: "forex",
        level: `level-${level}`,
      });
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lessons.at(-1)!}
          lessons={lessons}
          contextTitle="Module"
          contextHref="/learn/forex"
          quizTarget={null}
        />,
      );
      expect(markup).toContain(
        `data-testid="end-of-level" href="/learn/forex/level-${level}/quiz"`,
      );
      expect(markup).toContain("Take the ");
      expect(markup).not.toContain("Return to Forex levels");
      expect(
        markup.match(
          new RegExp(`href="/learn/forex/level-${level}/quiz"`, "g"),
        ),
      ).toHaveLength(2);
    },
  );
  it("keeps the Level 0 transition and Level 3 fallback", () => {
    for (const level of [0, 3]) {
      const lessons = getPublishedLessons({
        learningPath: "forex",
        level: `level-${level}`,
      });
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lessons.at(-1)!}
          lessons={lessons}
          contextTitle="Module"
          contextHref="/learn/forex"
        />,
      );
      expect(markup).toContain(
        level === 0 ? "start Level 1" : "Return to Forex levels",
      );
    }
  });
  it("resolves Level 2 quiz and retains its lesson routes", () => {
    expect(getGenericForexSecondSegment("level-2", "quiz")?.kind).toBe("quiz");
    expect(getGenericForexSecondSegmentParams()).toContainEqual({
      level: "level-2",
      segment: "quiz",
    });
    for (const lesson of getPublishedLessons({
      learningPath: "forex",
      level: "level-2",
    }).slice(1))
      expect(getGenericForexSecondSegment("level-2", lesson.slug)?.kind).toBe(
        "lesson",
      );
    expect(getGenericForexSecondSegment("level-3", "quiz")).toBeUndefined();
  });
  it("isolates each quiz's lessons, progress and return link", () => {
    const one = getForexQuizContext("forex-kindergarten", "forex-foundations")!;
    const two = getForexQuizContext(
      "brokers-and-platforms",
      "broker-foundations",
    )!;
    expect(one.lessonIds).toHaveLength(6);
    expect(two.lessonIds).toHaveLength(4);
    expect(one.progressKey).toBe("pipstart:learn:forex:level-1:progress");
    expect(two.progressKey).toBe(
      "pipstart:learn:forex:level-2:brokers-and-platforms:progress",
    );
    expect(two.module.href).toBe(
      "/learn/forex/level-2/brokers-and-platforms/broker-foundations",
    );
    expect(
      getForexQuizContext("forex-kindergarten", "broker-foundations"),
    ).toBeUndefined();
  });
  it("validates the new assessment and excludes private answers from public data", () => {
    expect(() => assertValidAssessmentRegistry()).not.toThrow();
    expect(brokerFoundationsQuizV1.questions).toHaveLength(12);
    const publicJson = JSON.stringify(
      toPublicAssessment(brokerFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
  });
  it("grades the 70% boundary and unanswered questions correctly", () => {
    const quiz = brokerFoundationsQuizV1;
    const answers = (count: number) =>
      Object.fromEntries(
        quiz.questions.slice(0, count).map((q) => [q.id, q.correctChoiceIds]),
      );
    expect(gradeAssessment(quiz, answers(12))).toMatchObject({
      score: 12,
      passed: true,
    });
    expect(gradeAssessment(quiz, answers(9)).passed).toBe(true);
    expect(gradeAssessment(quiz, answers(8)).passed).toBe(false);
    expect(gradeAssessment(quiz, {}).passed).toBe(false);
  });
  it("keeps sidebar lesson counts separate from the quiz", async () => {
    const { LessonSidebar } = await vi.importActual<
      typeof import("../components/SteppedLessonArticle")
    >("../components/SteppedLessonArticle");
    const lessons = getPublishedLessons({
      learningPath: "forex",
      level: "level-2",
    }).map((item) => ({
      title: item.title,
      href: item.href,
      complete: true,
      current: false,
    }));
    const markup = renderToStaticMarkup(
      <LessonSidebar
        levelTitle="Broker Foundations"
        levelHref="/learn/forex/level-2"
        lessons={lessons}
        quiz={{
          title: "Broker Foundations quiz",
          href: "/learn/forex/level-2/quiz",
          complete: false,
          current: false,
        }}
      />,
    );
    expect(markup).toContain("4 of 4 complete");
    expect(markup).toContain("/learn/forex/level-2/quiz");
    expect(markup).not.toContain("4 of 5");
  });
  it("includes each quiz exactly once in the sitemap", () => {
    const urls = sitemap().map((item) => item.url);
    for (const level of [1, 2])
      expect(
        urls.filter((url) => url.endsWith(`/learn/forex/level-${level}/quiz`)),
      ).toHaveLength(1);
  });
});
