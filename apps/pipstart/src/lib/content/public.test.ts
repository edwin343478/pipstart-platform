import { describe, expect, expectTypeOf, it } from "vitest";
import { analysisPosts, type AnalysisPost } from "../../app/analysis/posts";
import {
  getPublishedLesson,
  getPublishedLessons,
  publishedLessons,
  type PublishedLesson,
} from "../../content/lesson-registry";
import { type AssessmentDefinition, toPublicAssessment } from "../assessment";
import {
  assessmentRegistry,
  getCurrentPublishedAssessment,
} from "../assessment-registry";
import { codeContentRepository } from "./code-adapter";
import { listPrivateQuizzes } from "./private";
import {
  type PublicQuiz,
  publicLessonKeys,
  toPublicAnalysisPost,
  toPublicLesson,
  toPublicQuiz,
} from "./public";

const SECRET = "M22-PRIVATE-SENTINEL";

describe("M22 MP04b public projection never carries private fields", () => {
  it("drops every sentinel planted in private and unknown quiz fields", () => {
    const quiz = {
      ...assessmentRegistry[0],
      governance: {
        ...assessmentRegistry[0].governance,
        reviewer: SECRET,
        sources: [SECRET],
      },
      reviewNote: SECRET,
      questions: assessmentRegistry[0].questions.map((question) => ({
        ...question,
        explanation: SECRET,
        correctChoiceIds: [SECRET],
        draftPrompt: SECRET,
        choices: question.choices.map((choice) => ({
          ...choice,
          isCorrect: SECRET,
        })),
      })),
    } as unknown as AssessmentDefinition;
    const json = JSON.stringify(toPublicQuiz(quiz));
    expect(json).not.toContain(SECRET);
    expect(json).not.toContain("correctChoiceIds");
    expect(json).not.toContain("explanation");
    expect(json).not.toContain("governance");
  });

  it("drops sentinels planted in unknown lesson and analysis fields", () => {
    const lesson = {
      ...publishedLessons[0],
      reviewNote: SECRET,
      draftBody: SECRET,
    } as PublishedLesson;
    const post = {
      ...analysisPosts[0],
      reviewNote: SECRET,
      status: SECRET,
    } as unknown as AnalysisPost;
    expect(JSON.stringify(toPublicLesson(lesson))).not.toContain(SECRET);
    expect(JSON.stringify(toPublicAnalysisPost(post))).not.toContain(SECRET);
  });

  it("has no answer-key, explanation or governance field in its types", () => {
    type Question = PublicQuiz["questions"][number];
    expectTypeOf<keyof Question>().toEqualTypeOf<
      "id" | "prompt" | "type" | "choices"
    >();
    expectTypeOf<keyof Question["choices"][number]>().toEqualTypeOf<
      "id" | "label"
    >();
    expectTypeOf<PublicQuiz>().not.toHaveProperty("governance");
    expectTypeOf<PublicQuiz>().not.toHaveProperty("status");
  });

  it("gives every quiz exactly what toPublicAssessment publishes today", () => {
    for (const quiz of assessmentRegistry)
      expect(toPublicQuiz(quiz), `${quiz.id} v${quiz.version}`).toEqual(
        toPublicAssessment(quiz),
      );
  });

  it("keeps every field public lesson pages receive today, and only those", () => {
    for (const lesson of publishedLessons) {
      expect(toPublicLesson(lesson), lesson.slug).toEqual(lesson);
      for (const key of Object.keys(lesson))
        expect(publicLessonKeys, `${lesson.slug}.${key}`).toContain(key);
    }
  });
});

describe("M22 MP04b code adapter matches today's registries", () => {
  it("serves the same lessons, quizzes and analysis posts", () => {
    for (const path of ["forex", "crypto"] as const) {
      expect(codeContentRepository.lessons(path)).toEqual(
        getPublishedLessons({ learningPath: path }),
      );
      for (const lesson of getPublishedLessons({ learningPath: path })) {
        expect(codeContentRepository.lessons(path, lesson.level)).toEqual(
          getPublishedLessons({ learningPath: path, level: lesson.level }),
        );
        expect(codeContentRepository.lesson(path, lesson.slug)).toEqual(
          getPublishedLesson(path, lesson.slug),
        );
      }
    }
    expect(codeContentRepository.lesson("forex", "no-such-lesson")).toBe(
      undefined,
    );
    for (const id of new Set(assessmentRegistry.map((quiz) => quiz.id))) {
      const current = getCurrentPublishedAssessment(id);
      expect(codeContentRepository.currentQuiz(id)).toEqual(
        current && toPublicAssessment(current),
      );
    }
    const withoutStatus = (post: AnalysisPost) => {
      const copy: Partial<AnalysisPost> = { ...post };
      delete copy.status;
      return copy;
    };
    expect(codeContentRepository.analysisPosts()).toEqual(
      analysisPosts.map(withoutStatus),
    );
    for (const category of ["fundamental", "technical"] as const)
      expect(
        codeContentRepository
          .analysisPosts(category)
          .every((post) => post.category === category),
      ).toBe(true);
    expect(codeContentRepository.analysisPost(analysisPosts[0].slug)).toEqual(
      withoutStatus(analysisPosts[0]),
    );
  });

  it("returns only published content; drafts stay in the private view", () => {
    const privateQuizzes = listPrivateQuizzes();
    expect(privateQuizzes).toBe(assessmentRegistry);
    for (const quiz of privateQuizzes.filter((q) => q.status !== "published"))
      if (!getCurrentPublishedAssessment(quiz.id))
        expect(codeContentRepository.currentQuiz(quiz.id)).toBe(undefined);
    expect(
      publishedLessons.every(
        (lesson) => lesson.status === "published" && lesson.approved,
      ),
    ).toBe(true);
  });
});
