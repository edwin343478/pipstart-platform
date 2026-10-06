import { beforeEach, describe, expect, it, vi } from "vitest";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { cryptoOrientationQuizV1 } from "../lib/crypto-orientation-assessment";
import { forexFoundationsQuizV1 } from "../lib/assessment-registry";

const mocks = vi.hoisted(() => ({
  signedIn: true,
  responses: [] as Array<{ data: unknown; error: unknown }>,
  filters: [] as Array<[string, unknown]>,
  rpc: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("../lib/course-progress-server", () => ({
  reconcileCourseEnrollmentForUser: vi.fn(),
}));
vi.mock("../lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ rpc: mocks.rpc }),
}));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: mocks.signedIn ? { id: "owner" } : null },
        error: null,
      }),
    },
    from: () => {
      const query = {
        select: () => query,
        eq: (key: string, value: unknown) => {
          mocks.filters.push([key, value]);
          return query;
        },
        order: () => query,
        limit: () => query,
        maybeSingle: async () =>
          mocks.responses.shift() ?? { data: null, error: null },
      };
      return query;
    },
  }),
}));
import { startAssessmentAttemptAction } from "./learn/assessment-actions";

type Quiz = typeof cryptoOrientationQuizV1;
function row(quiz: Quiz, status: "submitted" | "in_progress" = "submitted") {
  const answers = Object.fromEntries(
    quiz.questions.map((q) => [q.id, [...q.correctChoiceIds]]),
  );
  return {
    id: "11111111-1111-4111-8111-111111111111",
    quiz_id: quiz.id,
    quiz_version: quiz.version,
    passing_percentage: quiz.passingPercentage,
    public_snapshot: toPublicAssessment(quiz),
    question_order: quiz.questions.map((q) => q.id),
    choice_order: Object.fromEntries(
      quiz.questions.map((q) => [q.id, q.choices.map((c) => c.id)]),
    ),
    attempt_number: 1,
    status,
    draft_answers: {},
    submitted_answers: answers,
    review_snapshot: gradeAssessment(quiz, answers),
    score: quiz.questions.length,
    max_score: quiz.questions.length,
    passed: true,
    started_at: "2026-10-06T00:00:00Z",
    submitted_at: "2026-10-06T00:01:00Z",
  };
}
const input = (quiz: Quiz, resumeSubmitted = true) => ({
  quizId: quiz.id,
  version: quiz.version,
  resumeSubmitted,
});
beforeEach(() => {
  mocks.signedIn = true;
  mocks.responses = [];
  mocks.filters = [];
  mocks.rpc.mockReset();
});

describe("restoring submitted quiz results without an implicit retake", () => {
  for (const quiz of [cryptoOrientationQuizV1, forexFoundationsQuizV1]) {
    it(`restores the owned ${quiz.learningPath} result without a write`, async () => {
      const saved = row(quiz);
      mocks.responses.push(
        { data: null, error: null },
        { data: saved, error: null },
      );
      const restored = await startAssessmentAttemptAction(input(quiz));
      expect(restored.attempt?.status).toBe("submitted");
      expect("grade" in restored && restored.grade).toEqual(
        saved.review_snapshot,
      );
      expect(mocks.filters).toContainEqual(["user_id", "owner"]);
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
  }
  it("resumes an active retake before an older result", async () => {
    const saved = row(cryptoOrientationQuizV1, "in_progress");
    mocks.responses.push({ data: saved, error: null });
    const restored = await startAssessmentAttemptAction(
      input(cryptoOrientationQuizV1),
    );
    expect(restored.attempt?.status).toBe("in_progress");
    expect("grade" in restored).toBe(false);
    expect(mocks.filters).not.toContainEqual(["status", "submitted"]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("starts an explicit retake through the existing RPC", async () => {
    const saved = row(cryptoOrientationQuizV1, "in_progress");
    mocks.rpc.mockResolvedValue({ data: saved, error: null });
    const started = await startAssessmentAttemptAction(
      input(cryptoOrientationQuizV1, false),
    );
    expect(started.attempt?.status).toBe("in_progress");
    expect(mocks.rpc).toHaveBeenCalledWith(
      "pipstart_start_assessment_attempt",
      expect.objectContaining({
        requested_quiz_id: cryptoOrientationQuizV1.id,
        requested_user_id: "owner",
      }),
    );
  });
  it("preserves the retake cooldown", async () => {
    mocks.responses.push(
      { data: null, error: null },
      { data: { submitted_at: new Date().toISOString() }, error: null },
    );
    await expect(
      startAssessmentAttemptAction(input(cryptoOrientationQuizV1, false)),
    ).rejects.toThrow(/Wait .* seconds/);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not create another attempt when the result query fails", async () => {
    mocks.responses.push(
      { data: null, error: null },
      { data: null, error: { message: "unavailable" } },
    );
    await expect(
      startAssessmentAttemptAction(input(cryptoOrientationQuizV1)),
    ).rejects.toThrow("Submitted assessment result could not be loaded.");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects a result whose frozen quiz snapshot has changed", async () => {
    mocks.responses.push(
      { data: null, error: null },
      {
        data: { ...row(cryptoOrientationQuizV1), public_snapshot: {} },
        error: null,
      },
    );
    await expect(
      startAssessmentAttemptAction(input(cryptoOrientationQuizV1)),
    ).rejects.toThrow(/saved quiz version has changed/);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects a saved grade from another quiz", async () => {
    mocks.responses.push(
      { data: null, error: null },
      {
        data: {
          ...row(cryptoOrientationQuizV1),
          review_snapshot: gradeAssessment(forexFoundationsQuizV1, {}),
        },
        error: null,
      },
    );
    await expect(
      startAssessmentAttemptAction(input(cryptoOrientationQuizV1)),
    ).rejects.toThrow("Submitted assessment result is invalid.");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("keeps anonymous preparation free of persisted results", async () => {
    mocks.signedIn = false;
    const started = await startAssessmentAttemptAction(
      input(cryptoOrientationQuizV1),
    );
    expect(started.authenticated).toBe(false);
    expect(started.attempt).toBeNull();
    expect("grade" in started).toBe(false);
    expect(mocks.filters).toEqual([]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
