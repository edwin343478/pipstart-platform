import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), headers: vi.fn() }));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("../lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ rpc: mocks.rpc }),
}));
import { gradeAnonymousAssessmentAction } from "./learn/assessment-actions";
import { cryptoOrientationQuizV1 } from "../lib/crypto-orientation-assessment";
const input = {
  quizId: cryptoOrientationQuizV1.id,
  version: cryptoOrientationQuizV1.version,
  answers: {},
};

beforeEach(() => {
  vi.stubEnv("VERCEL", "1");
  mocks.headers.mockResolvedValue(
    new Headers({
      "x-vercel-forwarded-for": "192.0.2.1",
      "user-agent": "first",
    }),
  );
  mocks.rpc.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("anonymous grading rate-limit enforcement", () => {
  it("keeps one database budget after a user-agent change", async () => {
    const counts = new Map<string, number>();
    mocks.rpc.mockImplementation(async (_name, args) => {
      const count = (counts.get(args.requested_client_key) ?? 0) + 1;
      counts.set(args.requested_client_key, count);
      return { data: count <= args.requested_limit, error: null };
    });
    for (let n = 0; n < 20; n++) await gradeAnonymousAssessmentAction(input);
    mocks.headers.mockResolvedValue(
      new Headers({
        "x-vercel-forwarded-for": "192.0.2.1",
        "user-agent": "changed",
      }),
    );
    await expect(gradeAnonymousAssessmentAction(input)).rejects.toThrow(
      "Too many quiz submissions",
    );
    expect(counts.size).toBe(1);
    expect(mocks.rpc).toHaveBeenLastCalledWith(
      "pipstart_consume_assessment_rate_limit",
      {
        requested_client_key: expect.any(String),
        requested_limit: 20,
        requested_window_seconds: 60,
      },
    );
  });
  it.each([false, null, [], {}, "true", 1])(
    "accepts only literal database true, rejecting %j",
    async (data) => {
      mocks.rpc.mockResolvedValue({ data, error: null });
      await expect(gradeAnonymousAssessmentAction(input)).rejects.toThrow(
        "Too many quiz submissions",
      );
    },
  );
  it("does not grade when the limiter fails", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "unavailable" },
    });
    await expect(gradeAnonymousAssessmentAction(input)).rejects.toThrow(
      "could not be checked",
    );
  });
});
