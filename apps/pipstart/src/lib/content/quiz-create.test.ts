import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runQuizDraft } from "./quiz-draft";
import { runQuizCreate } from "./quiz-create";
import {
  newQuizBody,
  parseQuizCreation,
  projectQuizBody,
  QUIZ_GOVERNANCE,
  quizSourceProblems,
  type QuizCreation,
} from "./quiz-draft-contract";
import { checkContentBody } from "./validate";

// M22 audit Package 5 (D1, D2): a new quiz at version 1 under a module.
const actor = "d1000000-0000-4000-8000-000000000001";
const NOW = new Date("2026-11-18T09:30:00.000Z");
const question = {
  sourceIndex: null,
  id: "question-1",
  type: "single-choice",
  prompt: "Which is a currency pair?",
  explanation: "EUR/USD prices one currency in another.",
  choices: [
    { id: "choice-1", label: "EUR/USD" },
    { id: "choice-2", label: "Gold" },
  ],
  correctChoiceIds: ["choice-1"],
};
const command = (patch: Record<string, unknown> = {}) => ({
  kind: "create",
  id: "new-quiz",
  path: "crypto",
  parent: "module-1",
  fields: {
    title: "New quiz",
    passingPercentage: 70,
    retakeCooldownSeconds: 0,
  },
  questions: [structuredClone(question)],
  sources: ["PipStart: Currency pairs"],
  reason: "New practice quiz",
  ...patch,
});
const item = (
  id: string,
  family: string,
  parent: string | null,
  metadata: Record<string, unknown>,
  trashed = false,
) => ({
  item: {
    id,
    family,
    learning_path: "crypto",
    parent_id: parent,
    latest_revision: 1,
    trashed,
    on_hold: false,
  },
  revision: {
    revision_no: 1,
    schema_version: 1,
    body: { metadata },
    body_sha256: "b".repeat(64),
    base_revision: 0,
    author_is_me: false,
    state: "approved",
    created_at: "2026-11-01T00:00:00Z",
  },
  decisions: [],
  review_required: false,
});
const row = (id: string, family: string, parent: string, trashed = false) => ({
  id,
  family,
  learning_path: "crypto",
  category: null,
  parent_id: parent,
  latest_revision: 1,
  state: "approved",
  trashed,
});
function fixture(
  opts: {
    role?: string;
    children?: ReturnType<typeof row>[];
    quizRoute?: string | null;
    create?: { data: unknown; error: unknown };
  } = {},
) {
  const children = opts.children ?? [
    row("lesson-a", "lesson", "module-1"),
    row("level-quiz", "quiz", "module-1"),
    row("old-quiz", "quiz", "module-1", true),
    row("other", "lesson", "module-2"),
  ];
  const items: Record<string, unknown> = {
    "module-1": item("module-1", "module", "course-1", { title: "Module" }),
    "course-1": item("course-1", "course", null, { title: "Course" }),
    "lesson-a": item("lesson-a", "lesson", "module-1", {
      placement: { order: 3 },
    }),
    "level-quiz": item("level-quiz", "quiz", "module-1", {
      placement: {
        order: 4,
        ...(opts.quizRoute === null
          ? {}
          : { route: opts.quizRoute ?? "level" }),
      },
    }),
  };
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const rpc = vi.fn((fn: string, args: Record<string, unknown> = {}) => {
    if (fn === "pipstart_staff_access")
      return response({
        authorized: true,
        user_id: actor,
        roles: [opts.role ?? "author"],
        capabilities: ["staff.enter"],
      });
    if (fn === "pipstart_editorial_item")
      return response(
        items[String(args.p_id)] ?? null,
        items[String(args.p_id)] ? null : { code: "22023" },
      );
    if (fn === "pipstart_editorial_list") return response(children);
    if (fn === "pipstart_editorial_create")
      return opts.create
        ? response(opts.create.data, opts.create.error)
        : response({
            item_id: "new-quiz",
            revision_no: 1,
            state: "draft",
            body_sha256: "c".repeat(64),
          });
    return response(null, { code: "XX000" });
  });
  const client = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: actor } }, error: null }),
    },
    rpc,
  } as unknown as SupabaseClient;
  const creates = () =>
    rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_create");
  return { client, rpc, creates };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("Package 5 quiz creation", () => {
  it("creates version 1 under the module with every derived field set by the server", async () => {
    const f = fixture();
    expect(await runQuizCreate(f.client, command(), NOW)).toEqual({
      kind: "saved",
      id: "new-quiz",
      revision: 1,
      bodySha256: "c".repeat(64),
      version: 1,
    });
    expect(f.creates()).toHaveLength(1);
    const args = f.creates()[0][1] as Record<string, unknown>;
    expect(args).toMatchObject({
      p_id: "new-quiz",
      p_family: "quiz",
      p_learning_path: "crypto",
      p_parent: "module-1",
      p_reason: "New practice quiz",
    });
    const body = args.p_body as {
      metadata: Record<string, unknown>;
      questions: unknown[];
    };
    expect(body.metadata).toEqual({
      title: "New quiz",
      assessmentId: "new-quiz",
      version: 1,
      scope: "module",
      learningPath: "crypto",
      courseId: "course-1",
      moduleId: "module-1",
      passingPercentage: 70,
      retakeCooldownSeconds: 0,
      status: "draft",
      governance: {
        author: QUIZ_GOVERNANCE.author,
        reviewer: QUIZ_GOVERNANCE.reviewer,
        reviewedAt: "2026-11-18",
        nextReviewAt: "2027-11-18",
        sources: ["PipStart: Currency pairs"],
      },
      // After the highest order among the module's active children (the archived quiz is ignored).
      placement: {
        order: 5,
        estimatedMinutes: 5,
        objectives: [],
        prerequisites: [],
        relatedLessonIds: [],
        relatedTermSlugs: [],
      },
    });
    expect(body.questions).toEqual([
      {
        id: "question-1",
        type: "single-choice",
        prompt: question.prompt,
        explanation: question.explanation,
        choices: question.choices,
        correctChoiceIds: ["choice-1"],
      },
    ]);
    expect(checkContentBody("quiz", body).ok).toBe(true);
    expect(projectQuizBody(body)?.version).toBe(1);
  });

  it("is reached through the quiz draft action", async () => {
    const f = fixture();
    expect((await runQuizDraft(f.client, command())).kind).toBe("saved");
    expect(f.creates()).toHaveLength(1);
  });

  it("refuses a module that already has its module quiz, creating nothing", async () => {
    for (const quizRoute of [null, "module"]) {
      const f = fixture({ quizRoute });
      expect(await runQuizCreate(f.client, command(), NOW)).toEqual({
        kind: "occupied",
      });
      expect(f.creates()).toHaveLength(0);
    }
  });

  it("refuses a parent that is not an active module of the same path, and an identity already used", async () => {
    for (const patch of [
      { parent: "course-1" },
      { path: "forex" },
      { id: "lesson-a" },
    ]) {
      const f = fixture();
      expect(await runQuizCreate(f.client, command(patch), NOW)).toEqual({
        kind: "invalid",
      });
      expect(f.creates()).toHaveLength(0);
    }
  });

  it("refuses malformed commands before any network call", async () => {
    for (const patch of [
      { sources: [] },
      { sources: ["a", "b", "c", "d", "e", "f"] },
      { sources: [" padded"] },
      { sources: ["same", "same"] },
      { questions: [{ ...question, sourceIndex: 0 }] },
      { questions: [{ ...question, correctChoiceIds: [] }] },
      { id: "module-1" },
      { id: "Bad ID" },
      { path: "stocks" },
      { reason: "" },
      { extra: true },
    ]) {
      const f = fixture();
      expect(await runQuizCreate(f.client, command(patch), NOW)).toEqual({
        kind: "invalid",
      });
      expect(f.rpc).not.toHaveBeenCalled();
    }
  });

  it("allows Owner, Author and Editor only", async () => {
    for (const role of ["reviewer", "moderator", "affiliate_manager"]) {
      const f = fixture({ role });
      expect(await runQuizCreate(f.client, command(), NOW)).toEqual({
        kind: "denied",
      });
      expect(f.creates()).toHaveLength(0);
    }
    for (const role of ["owner", "editor"])
      expect(
        (await runQuizCreate(fixture({ role }).client, command(), NOW)).kind,
      ).toBe("saved");
  });

  it("maps the store's answers once, never resending", async () => {
    const cases: [unknown, unknown, Record<string, unknown>][] = [
      [null, { code: "42501" }, { kind: "denied" }],
      [null, { code: "PT409" }, { kind: "conflict" }],
      [null, { code: "22023" }, { kind: "invalid" }],
      [
        null,
        { code: "PT429", hint: "retry_after=120" },
        { kind: "limited", retryAfter: 120 },
      ],
      [null, { code: "57014" }, { kind: "uncertain" }],
      [
        {
          item_id: "new-quiz",
          revision_no: 2,
          state: "draft",
          body_sha256: "c".repeat(64),
        },
        null,
        { kind: "uncertain" },
      ],
    ];
    for (const [data, error, expected] of cases) {
      const f = fixture({ create: { data, error } });
      expect(await runQuizCreate(f.client, command(), NOW)).toEqual(expected);
      expect(f.creates()).toHaveLength(1);
    }
  });

  it("checks sources in plain language", () => {
    expect(quizSourceProblems(["One"])).toEqual([]);
    expect(quizSourceProblems([])).toHaveLength(1);
    expect(quizSourceProblems(["x".repeat(301)])).toHaveLength(1);
    expect(parseQuizCreation(command())).not.toBeNull();
    expect(
      newQuizBody(
        parseQuizCreation(command()) as QuizCreation,
        "course-1",
        0,
        NOW,
      ),
    ).toBeNull();
  });
});
