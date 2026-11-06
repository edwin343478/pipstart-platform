import { describe, expect, it } from "vitest";
import { buildImportManifest } from "./import/manifest";
import {
  mergeQuizDraft,
  nextQuizPartId,
  projectQuizBody,
  quizDraftInputSchema,
  quizDraftProblems,
  type QuizDraftQuestion,
} from "./quiz-draft-contract";

const quizBody = () => ({
  metadata: {
    title: "Quiz",
    assessmentId: "quiz-1",
    version: 2,
    scope: "module",
    learningPath: "forex",
    courseId: "course-1",
    moduleId: "module-1",
    passingPercentage: 70,
    retakeCooldownSeconds: 60,
    status: "published",
    governance: { author: "A", reviewer: "R", sources: ["S"] },
    placement: { order: 2 },
  },
  questions: [
    {
      id: "q1",
      type: "single-choice",
      prompt: "Pick one",
      explanation: "Because",
      choices: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      correctChoiceIds: ["a"],
      hidden: "KEPT_ATTRIBUTE",
    },
    {
      id: "q2",
      type: "true-false",
      prompt: "True?",
      explanation: "Yes",
      choices: [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ],
      correctChoiceIds: ["true"],
    },
  ],
});
const draft = () => projectQuizBody(quizBody())!;
const save = (patch: Record<string, unknown> = {}) => ({
  kind: "save",
  id: "quiz-1",
  baseRevision: 3,
  baseSha256: "a".repeat(64),
  fields: draft().fields,
  questions: draft().questions,
  reason: "Edit quiz",
  ...patch,
});
const withQuestion = (n: number, patch: Partial<QuizDraftQuestion>) =>
  draft().questions.map((q, i) => (i === n ? { ...q, ...patch } : q));

describe("M22 MP07b quiz draft contract", () => {
  it("projects every imported quiz, and an unchanged merge at its version is the same body", async () => {
    const quizzes = (await buildImportManifest()).filter(
      (item) => item.family === "quiz",
    );
    expect(quizzes.length).toBeGreaterThanOrEqual(21);
    for (const quiz of quizzes) {
      const projected = projectQuizBody(quiz.body);
      expect(projected, quiz.id).not.toBeNull();
      const v = projected!.version;
      expect(
        mergeQuizDraft(quiz.body, projected!.fields, projected!.questions, v),
      ).toEqual(quiz.body);
      const next = mergeQuizDraft(
        quiz.body,
        projected!.fields,
        projected!.questions,
        v + 1,
      )!;
      expect((next.metadata as { version: number }).version).toBe(v + 1);
      expect({
        ...next,
        metadata: { ...(next.metadata as object), version: v },
      }).toEqual(quiz.body);
    }
  });

  it("edits only the shown fields and keeps hidden attributes of the question each entry came from", () => {
    const d = draft();
    const moved = [
      { ...d.questions[1], prompt: "Really true?" },
      d.questions[0],
      {
        sourceIndex: null,
        id: "question-1",
        type: "multiple-answer" as const,
        prompt: "Pick two",
        explanation: "Both",
        choices: [
          { id: "choice-1", label: "X" },
          { id: "choice-2", label: "Y" },
        ],
        correctChoiceIds: ["choice-1", "choice-2"],
      },
    ];
    const body = mergeQuizDraft(
      quizBody(),
      { title: "New title", passingPercentage: 80, retakeCooldownSeconds: 0 },
      moved,
      3,
    )!;
    expect(body.metadata).toEqual({
      ...quizBody().metadata,
      title: "New title",
      passingPercentage: 80,
      retakeCooldownSeconds: 0,
      version: 3,
    });
    const qs = body.questions as Record<string, unknown>[];
    expect(qs.map((q) => q.id)).toEqual(["q2", "q1", "question-1"]);
    expect(qs[0].prompt).toBe("Really true?");
    expect(qs[1].hidden).toBe("KEPT_ATTRIBUTE");
    expect(qs[2]).not.toHaveProperty("hidden");
    expect(Object.keys(qs[2]).sort()).toEqual([
      "choices",
      "correctChoiceIds",
      "explanation",
      "id",
      "prompt",
      "type",
    ]);
  });

  it.each([
    ["no title", { fields: { ...draft().fields, title: " " } }, "title"],
    [
      "pass mark 0",
      { fields: { ...draft().fields, passingPercentage: 0 } },
      "Passing",
    ],
    [
      "fractional pass mark",
      { fields: { ...draft().fields, passingPercentage: 70.5 } },
      "Passing",
    ],
    [
      "cooldown above an hour",
      { fields: { ...draft().fields, retakeCooldownSeconds: 3601 } },
      "cooldown",
    ],
    ["no questions", { questions: [] }, "1 to 100 questions"],
    [
      "blank prompt",
      { questions: withQuestion(0, { prompt: "" }) },
      "enter a question",
    ],
    [
      "blank explanation",
      { questions: withQuestion(0, { explanation: " " }) },
      "explanation",
    ],
    [
      "one choice",
      { questions: withQuestion(0, { choices: [{ id: "a", label: "A" }] }) },
      "2 to 10",
    ],
    [
      "blank choice",
      {
        questions: withQuestion(0, {
          choices: [
            { id: "a", label: "A" },
            { id: "b", label: "" },
          ],
        }),
      },
      "choice 2",
    ],
    [
      "duplicate choice",
      {
        questions: withQuestion(0, {
          choices: [
            { id: "a", label: "A" },
            { id: "a", label: "B" },
          ],
        }),
      },
      "repeated",
    ],
    [
      "two keys on single choice",
      { questions: withQuestion(0, { correctChoiceIds: ["a", "b"] }) },
      "exactly one",
    ],
    [
      "no key",
      { questions: withQuestion(0, { correctChoiceIds: [] }) },
      "exactly one",
    ],
    [
      "unknown key",
      { questions: withQuestion(0, { correctChoiceIds: ["z"] }) },
      "not listed",
    ],
    [
      "one key on multiple answers",
      { questions: withQuestion(0, { type: "multiple-answer" }) },
      "at least two",
    ],
    [
      "true/false with other choices",
      {
        questions: withQuestion(1, {
          choices: [
            { id: "true", label: "True" },
            { id: "maybe", label: "Maybe" },
          ],
          correctChoiceIds: ["true"],
        }),
      },
      "True and False",
    ],
    [
      "duplicate question",
      { questions: withQuestion(1, { id: "q1" }) },
      "repeated",
    ],
    [
      "unsafe identity",
      { questions: withQuestion(1, { id: "Q 2" }) },
      "identity",
    ],
  ])("names the problem and refuses to save: %s", (_, patch, words) => {
    const c = save(patch) as ReturnType<typeof save> & {
      fields: ReturnType<typeof draft>["fields"];
      questions: QuizDraftQuestion[];
    };
    expect(quizDraftProblems(c.fields, c.questions).join(" ")).toContain(words);
    expect(quizDraftInputSchema.safeParse(c).success).toBe(false);
  });

  it("accepts only the exact save shape, with a single-line reason and unique source indexes", () => {
    expect(quizDraftInputSchema.safeParse(save()).success).toBe(true);
    expect(
      quizDraftInputSchema.safeParse({ kind: "load", id: "quiz-1" }).success,
    ).toBe(true);
    for (const bad of [
      save({ version: 9 }),
      save({ reason: "two\nlines" }),
      save({ reason: " padded" }),
      save({ baseSha256: "A".repeat(64) }),
      save({ questions: withQuestion(1, { sourceIndex: 0 }) }),
      save({
        questions: [
          { ...draft().questions[0], extra: true },
          draft().questions[1],
        ],
      }),
      { kind: "load", id: "quiz-1", version: 1 },
    ])
      expect(quizDraftInputSchema.safeParse(bad).success).toBe(false);
  });

  it("refuses a merge that points at a question the body does not have, or a body outside the rules", () => {
    const d = draft();
    expect(
      mergeQuizDraft(
        quizBody(),
        d.fields,
        withQuestion(1, { sourceIndex: 5 }),
        3,
      ),
    ).toBeNull();
    const broken = quizBody();
    broken.questions[0].correctChoiceIds = ["a", "b"];
    expect(projectQuizBody(broken)).toBeNull();
    expect(mergeQuizDraft(broken, d.fields, d.questions, 3)).toBeNull();
    expect(mergeQuizDraft(quizBody(), d.fields, d.questions, 0)).toBeNull();
  });

  it("picks the smallest unused identity", () => {
    expect(nextQuizPartId("question", [])).toBe("question-1");
    expect(nextQuizPartId("choice", ["choice-1", "choice-3"])).toBe("choice-2");
  });
});
