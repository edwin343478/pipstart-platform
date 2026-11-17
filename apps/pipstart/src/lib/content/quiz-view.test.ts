import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runQuizView } from "./quiz-view";
import { parseQuizViewInput } from "./quiz-view-contract";

// M22 audit Package 5 (D4): one exact quiz revision, read-only, for review.
const actor = "d1000000-0000-4000-8000-000000000001";
const body = (version: number, prompt: string) => ({
  opaque: "PRIVATE_BODY",
  metadata: {
    title: "Quiz",
    version,
    scope: "module",
    passingPercentage: 70,
    retakeCooldownSeconds: 60,
    placement: { order: 4, hidden: "PRIVATE_PLACEMENT" },
    governance: {
      author: "Author",
      reviewer: "Reviewer",
      reviewedAt: "2026-10-01",
      nextReviewAt: "2027-04-01",
      sources: ["Source"],
    },
  },
  questions: [
    {
      id: "q1",
      type: "single-choice",
      prompt,
      explanation: "Because",
      choices: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      correctChoiceIds: ["a"],
      extra: "PRIVATE_ATTRIBUTE",
    },
  ],
});
const latest = (family = "quiz") => ({
  item: {
    id: "quiz-1",
    family,
    learning_path: "forex",
    parent_id: "module-1",
    latest_revision: 3,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body: body(2, "Latest prompt"),
    body_sha256: "a".repeat(64),
    base_revision: 2,
    author_is_me: false,
    state: "submitted",
    created_at: "2026-11-02T00:00:00Z",
  },
  decisions: [],
  review_required: true,
});
const earlier = {
  item_id: "quiz-1",
  latest_revision: 3,
  revision: {
    revision_no: 1,
    schema_version: 1,
    body: body(1, "First prompt"),
    body_sha256: "e".repeat(64),
    base_revision: 0,
    author_is_me: false,
    state: "superseded",
    created_at: "2026-10-01T00:00:00Z",
  },
  decisions: [],
};
function fixture(
  role = "reviewer",
  item: unknown = latest(),
  itemError: unknown = null,
) {
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const rpc = vi.fn((fn: string) =>
    fn === "pipstart_staff_access"
      ? role === "learner"
        ? response({ authorized: false })
        : response({
            authorized: true,
            user_id: actor,
            roles: [role],
            capabilities: ["staff.enter"],
          })
      : fn === "pipstart_editorial_item"
        ? response(itemError ? null : item, itemError)
        : fn === "pipstart_editorial_revision"
          ? response(earlier)
          : response(null, { code: "XX000" }),
  );
  const client = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: actor } }, error: null }),
    },
    rpc,
  } as unknown as SupabaseClient;
  return { client, rpc };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("Package 5 read-only quiz view", () => {
  it("shows a Reviewer the latest revision with its answer key, explanations and review record only", async () => {
    const f = fixture();
    const r = await runQuizView(f.client, { id: "quiz-1", revision: null });
    expect(r).toMatchObject({
      kind: "ready",
      view: {
        id: "quiz-1",
        revision: 3,
        latestRevision: 3,
        state: "submitted",
        version: 2,
        governance: { reviewer: "Reviewer", sources: ["Source"] },
        questions: [
          {
            prompt: "Latest prompt",
            correctChoiceIds: ["a"],
            explanation: "Because",
          },
        ],
      },
    });
    const text = JSON.stringify(r);
    for (const secret of [
      "PRIVATE_BODY",
      "PRIVATE_PLACEMENT",
      "PRIVATE_ATTRIBUTE",
    ])
      expect(text).not.toContain(secret);
    // Read-only: only reads are sent.
    expect(f.rpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_staff_access",
      "pipstart_editorial_item",
    ]);
  });

  it("reads an earlier exact revision, and refuses one past the latest", async () => {
    const f = fixture("owner");
    expect(
      await runQuizView(f.client, { id: "quiz-1", revision: 1 }),
    ).toMatchObject({
      kind: "ready",
      view: {
        revision: 1,
        latestRevision: 3,
        version: 1,
        state: "superseded",
        bodySha256: "e".repeat(64),
      },
    });
    expect(
      await runQuizView(fixture("owner").client, { id: "quiz-1", revision: 4 }),
    ).toEqual({
      kind: "invalid",
    });
  });

  it("refuses learners, other roles, other families and store refusals", async () => {
    for (const role of ["learner", "moderator"])
      expect(
        await runQuizView(fixture(role).client, {
          id: "quiz-1",
          revision: null,
        }),
      ).toEqual({
        kind: "denied",
      });
    expect(
      await runQuizView(fixture("reviewer", latest("lesson")).client, {
        id: "quiz-1",
        revision: null,
      }),
    ).toEqual({ kind: "unavailable" });
    expect(
      await runQuizView(fixture("reviewer", null, { code: "42501" }).client, {
        id: "quiz-1",
        revision: null,
      }),
    ).toEqual({ kind: "denied" });
  });

  it("accepts only an identity and an optional positive revision", () => {
    expect(parseQuizViewInput({ id: "quiz-1", revision: null })).not.toBeNull();
    for (const v of [
      { id: "quiz-1" },
      { id: "Bad ID", revision: null },
      { id: "quiz-1", revision: 0 },
      { id: "quiz-1", revision: 1.5 },
      { id: "quiz-1", revision: null, extra: 1 },
    ])
      expect(parseQuizViewInput(v)).toBeNull();
  });

  it("is off with the staff interface", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    const f = fixture("owner");
    expect(
      await runQuizView(f.client, { id: "quiz-1", revision: null }),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
});
