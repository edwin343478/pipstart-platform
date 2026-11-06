import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ action: vi.fn() }));
vi.mock("@/app/admin/staff/content/quiz-actions", () => ({
  runQuizDraftAction: mocks.action,
}));
import { newQuizQuestion, StaffQuizEditor } from "./staff-quiz-editor";
import { StaffQuizPreview } from "./staff-quiz-preview";
import type { QuizDraftView } from "@/lib/content/quiz-draft-contract";
import {
  initialQuizEditor,
  quizBuffer,
  quizEditorReducer,
} from "@/lib/content/quiz-editor-state";

const item = (patch: Partial<QuizDraftView> = {}): QuizDraftView => ({
  id: "quiz-1",
  path: "forex",
  parent: "module-1",
  scope: "module",
  revision: 3,
  bodySha256: "a".repeat(64),
  version: 2,
  nextVersion: 3,
  approved: true,
  fields: { title: "Quiz", passingPercentage: 70, retakeCooldownSeconds: 60 },
  questions: [
    {
      sourceIndex: 0,
      id: "q1",
      type: "single-choice",
      prompt: "Pick one",
      explanation: "PRIVATE_EXPLANATION",
      choices: [
        { id: "a", label: "Choice A" },
        { id: "b", label: "Choice B" },
      ],
      correctChoiceIds: ["a"],
    },
  ],
  ...patch,
});

describe("M22 MP07b quiz editor presentation", () => {
  it("labels every quiz control and states the server-set version", () => {
    const html = renderToStaticMarkup(<StaffQuizEditor item={item()} />);
    for (const label of [
      "Edit quiz",
      "Passing percentage",
      "Retake cooldown (seconds)",
      "Question 1 type",
      "Question 1 prompt",
      "Question 1 choice 1",
      "Correct: choice 1",
      "Question 1 explanation (shown after submission)",
      "Add choice to question 1",
      "Question type to add",
      "Change reason",
      "Save quiz draft",
      "Open sandbox preview",
      "Version on save",
      "Version 2 is approved and never changes",
      "Saving creates version 3",
      "it cannot be typed",
    ])
      expect(html).toContain(label);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('href="/admin/staff/content"');
    expect(html).not.toMatch(/name="version"|sourceIndex/);
  });
  it("explains that an unapproved draft keeps its version", () => {
    const html = renderToStaticMarkup(
      <StaffQuizEditor
        item={item({ approved: false, version: 3, nextVersion: 3 })}
      />,
    );
    expect(html).toContain(
      "This draft is version 3, which is not approved yet",
    );
  });
  it("keeps server-rendered controls inert until hydration", () => {
    const html = renderToStaticMarkup(<StaffQuizEditor item={item()} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/<fieldset disabled="">/);
    expect(html).toMatch(/<button type="submit" disabled="">/);
  });
  it("escapes entered text", () => {
    const html = renderToStaticMarkup(
      <StaffQuizEditor
        item={item({
          fields: {
            title: "<script>alert(1)</script>",
            passingPercentage: 70,
            retakeCooldownSeconds: 60,
          },
        })}
      />,
    );
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("M22 MP07b quiz sandbox preview", () => {
  it("shows questions as a learner sees them, with no answer key or explanation before checking", () => {
    const html = renderToStaticMarkup(
      <StaffQuizPreview
        id="quiz-1"
        version={3}
        fields={item().fields}
        questions={item().questions}
      />,
    );
    expect(html).toContain("Pick one");
    expect(html).toContain("Choice A");
    expect(html).toContain("Check sandbox answers");
    expect(html).toContain("nothing is sent to the server");
    expect(html).not.toContain("PRIVATE_EXPLANATION");
    expect(html).not.toContain("Correct answer");
    expect(mocks.action).not.toHaveBeenCalled();
  });
  it("does not preview a draft with problems", () => {
    const html = renderToStaticMarkup(
      <StaffQuizPreview
        id="quiz-1"
        version={3}
        fields={item().fields}
        questions={[{ ...item().questions[0], correctChoiceIds: [] }]}
      />,
    );
    expect(html).toContain("Fix the listed problems to preview this quiz.");
    expect(html).not.toContain("Choice A");
  });
});

describe("M22 MP07b quiz editor state", () => {
  it("builds new questions with fresh identities and no answer key", () => {
    expect(newQuizQuestion("single-choice", ["question-1"])).toMatchObject({
      sourceIndex: null,
      id: "question-2",
      choices: [{ id: "choice-1" }, { id: "choice-2" }],
      correctChoiceIds: [],
    });
    expect(newQuizQuestion("true-false", []).choices.map((c) => c.id)).toEqual([
      "true",
      "false",
    ]);
  });
  it("records the saved version and blocks further edits until reload", () => {
    const s = quizEditorReducer(
      quizEditorReducer(initialQuizEditor(item()), { type: "busy" }),
      {
        type: "result",
        result: {
          kind: "saved",
          id: "quiz-1",
          revision: 4,
          bodySha256: "b".repeat(64),
          version: 3,
        },
      },
    );
    expect(s.phase).toBe("saved");
    expect(s.base).toMatchObject({ revision: 4, version: 3, approved: false });
    expect(s.message).toContain("saved as version 3");
    expect(quizBuffer(s)).toBe(s.clean);
    expect(
      quizEditorReducer(s, { type: "edit", buffer: { reason: "x" } }),
    ).toBe(s);
  });
  it.each([
    ["conflict", "conflict"],
    ["uncertain", "uncertain"],
    ["denied", "denied"],
    ["invalid", "idle"],
  ] as const)("keeps entered work on a %s result", (kind, phase) => {
    const start = quizEditorReducer(initialQuizEditor(item()), {
      type: "edit",
      buffer: { reason: "Edit" },
    });
    const s = quizEditorReducer(quizEditorReducer(start, { type: "busy" }), {
      type: "result",
      result: { kind },
    });
    expect(s.phase).toBe(phase);
    expect(s.reason).toBe("Edit");
  });
});
