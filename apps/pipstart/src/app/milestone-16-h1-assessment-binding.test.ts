import { beforeEach, describe, expect, it, vi } from "vitest";
import { toPublicAssessment, gradeAssessment } from "../lib/assessment";
import {
  forexFoundationsQuizV1,
  getAssessment,
} from "../lib/assessment-registry";
import { requireBoundAssessment } from "../lib/assessment-attempt-binding";

const mocks = vi.hoisted(() => ({
  row: null as Record<string, unknown> | null,
  rpc: vi.fn(),
  reconcile: vi.fn(),
  signedIn: true,
  filters: [] as Array<[string, string]>,
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("../lib/course-progress-server", () => ({
  reconcileCourseEnrollmentForUser: mocks.reconcile,
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
        eq: (key: string, value: string) => {
          mocks.filters.push([key, value]);
          return query;
        },
        maybeSingle: async () => ({ data: mocks.row, error: null }),
      };
      return query;
    },
  }),
}));
import {
  saveAssessmentDraftAction,
  submitAssessmentAttemptAction,
} from "./learn/assessment-actions";
const quiz = forexFoundationsQuizV1;
const attemptId = "11111111-1111-4111-8111-111111111111";
const submissionToken = "22222222-2222-4222-8222-222222222222";
const answers = Object.fromEntries(
  quiz.questions.map((q) => [q.id, [...q.correctChoiceIds]]),
);
const input = {
  answers,
  attemptId,
  quizId: quiz.id,
  version: quiz.version,
  submissionToken,
};
const stored = () => ({
  id: attemptId,
  quiz_id: quiz.id,
  quiz_version: quiz.version,
  passing_percentage: quiz.passingPercentage,
  public_snapshot: toPublicAssessment(quiz),
  status: "in_progress",
});
beforeEach(() => {
  mocks.row = stored();
  mocks.signedIn = true;
  mocks.filters = [];
  mocks.rpc.mockReset();
  mocks.reconcile.mockReset();
  mocks.rpc.mockImplementation(async (name, args) => ({
    data: [
      {
        ...stored(),
        status: name.includes("submit") ? "submitted" : "in_progress",
        review_snapshot: args.requested_review_snapshot,
      },
    ],
    error: null,
  }));
});
describe("M16-H1 owned attempt binding", () => {
  for (const [label, action] of [
    ["draft", saveAssessmentDraftAction],
    ["submit", submitAssessmentAttemptAction],
  ] as const) {
    it(`${label}: rejects another quiz`, async () => {
      await expect(
        action({ ...input, quizId: "bitcoin-foundations-quiz" }),
      ).rejects.toThrow("does not match");
      expect(mocks.rpc).not.toHaveBeenCalled();
      expect(mocks.reconcile).not.toHaveBeenCalled();
    });
    it(`${label}: rejects another version before writing`, async () => {
      await expect(action({ ...input, version: 2 })).rejects.toThrow(
        "does not match",
      );
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it(`${label}: rejects missing or other-user attempt`, async () => {
      mocks.row = null;
      await expect(action(input)).rejects.toThrow("could not be loaded");
      expect(mocks.filters).toContainEqual(["user_id", "owner"]);
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it(`${label}: rejects modified frozen content`, async () => {
      mocks.row!.public_snapshot = {
        ...toPublicAssessment(quiz),
        courseId: "another-course",
      };
      await expect(action(input)).rejects.toThrow("has changed");
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it(`${label}: rejects unknown question and choice identifiers`, async () => {
      for (const invalid of [
        { unknown: ["yes"] },
        { [quiz.questions[0]!.id]: ["unknown"] },
      ]) {
        await expect(action({ ...input, answers: invalid })).rejects.toThrow(
          /Unknown/,
        );
      }
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it(`${label}: authenticates before loading or mutating`, async () => {
      mocks.signedIn = false;
      await expect(action(input)).rejects.toThrow("Sign in");
      expect(mocks.filters).toHaveLength(0);
      expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it(`${label}: passes stored identity and snapshot to the transaction`, async () => {
      await action(input);
      expect(mocks.filters).toContainEqual(["id", attemptId]);
      expect(mocks.rpc).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          requested_quiz_id: quiz.id,
          requested_quiz_version: quiz.version,
          requested_public_snapshot: toPublicAssessment(quiz),
          requested_user_id: "owner",
        }),
      );
    });
  }
  it("blocks the audit's wallet-to-Bitcoin substitution with real registered definitions", async () => {
    const wallet = getAssessment("crypto-wallet-security-quiz", 1)!;
    const bitcoin = getAssessment("bitcoin-foundations-quiz", 1)!;
    expect(wallet).toBeDefined();
    expect(bitcoin).toBeDefined();
    mocks.row = {
      ...stored(),
      quiz_id: wallet.id,
      quiz_version: wallet.version,
      passing_percentage: wallet.passingPercentage,
      public_snapshot: toPublicAssessment(wallet),
    };
    const foreign = {
      ...input,
      quizId: bitcoin.id,
      version: bitcoin.version,
      answers: Object.fromEntries(
        bitcoin.questions.map((q) => [q.id, [...q.correctChoiceIds]]),
      ),
    };
    await expect(submitAssessmentAttemptAction(foreign)).rejects.toThrow(
      "does not match",
    );
    await expect(saveAssessmentDraftAction(foreign)).rejects.toThrow(
      "does not match",
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.reconcile).not.toHaveBeenCalled();
  });
  it("continues retired versions and refuses withdrawn/unavailable versions", () => {
    const row = stored();
    const ref = { quizId: quiz.id, version: quiz.version };
    expect(
      requireBoundAssessment(row, ref, () => ({ ...quiz, status: "retired" }))
        .id,
    ).toBe(quiz.id);
    expect(() =>
      requireBoundAssessment(row, ref, () => ({
        ...quiz,
        status: "withdrawn",
      })),
    ).toThrow("unavailable");
    expect(() => requireBoundAssessment(row, ref, () => undefined)).toThrow(
      "unavailable",
    );
  });
  it("returns the persisted result on a duplicate submission", async () => {
    const original = gradeAssessment(quiz, {});
    mocks.rpc.mockResolvedValue({
      data: [{ ...stored(), status: "submitted", review_snapshot: original }],
      error: null,
    });
    expect((await submitAssessmentAttemptAction(input)).grade).toEqual(
      original,
    );
  });
  it("does not reconcile when the database rejects the transaction", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "binding mismatch" },
    });
    await expect(submitAssessmentAttemptAction(input)).rejects.toThrow(
      "not saved",
    );
    expect(mocks.reconcile).not.toHaveBeenCalled();
  });
});
