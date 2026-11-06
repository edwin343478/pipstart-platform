import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runQuizDraft } from "./quiz-draft";
import { projectQuizBody } from "./quiz-draft-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const body = (version = 2) => ({
  opaque: "PRIVATE_BODY",
  metadata: {
    title: "Quiz",
    assessmentId: "quiz-1",
    version,
    scope: "module",
    learningPath: "forex",
    courseId: "course-1",
    moduleId: "module-1",
    passingPercentage: 70,
    retakeCooldownSeconds: 60,
    status: "published",
    governance: { author: "A", reviewer: "PRIVATE_REVIEWER", sources: ["S"] },
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
    },
  ],
});
type Decision = { kind: string; note: null; by_me: boolean; at: string };
const imported: Decision = {
  kind: "imported",
  note: null,
  by_me: false,
  at: "2026-11-01T00:00:00Z",
};
const raw = (decisions: Decision[] = [imported], version = 2) => ({
  item: {
    id: "quiz-1",
    family: "quiz",
    learning_path: "forex",
    parent_id: "module-1",
    latest_revision: 3,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body: body(version),
    body_sha256: "a".repeat(64),
    base_revision: 2,
    author_is_me: true,
    state: decisions.length ? "approved" : "draft",
    created_at: "2026-11-02T00:00:00Z",
  },
  decisions,
  review_required: false,
});
function fixture(role = "owner", item: unknown = raw()) {
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
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
        ? response(item)
        : response({
            item_id: "quiz-1",
            revision_no: 4,
            body_sha256: "b".repeat(64),
            state: "draft",
          }),
  );
  return {
    getUser,
    rpc,
    response,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
const save = (patch: Record<string, unknown> = {}) => {
  const { fields, questions } = projectQuizBody(body())!;
  return {
    kind: "save",
    id: "quiz-1",
    baseRevision: 3,
    baseSha256: "a".repeat(64),
    fields,
    questions,
    reason: "Edit quiz",
    ...patch,
  };
};
const sentBody = (f: ReturnType<typeof fixture>) =>
  (
    f.rpc.mock.calls.find((c) => c[0] === "pipstart_editorial_save") as
      [string, { p_body: ReturnType<typeof body> }] | undefined
  )?.[1].p_body;
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("M22 MP07b verified quiz draft service", () => {
  it("defaults closed and refuses a caller-chosen version before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "TRUE");
    expect(await runQuizDraft(f.client, save())).toEqual({ kind: "denied" });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runQuizDraft(f.client, save({ version: 7 }))).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it.each(["reviewer", "learner"])("denies %s", async (role) => {
    const f = fixture(role);
    expect(await runQuizDraft(f.client, save())).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_item",
      expect.anything(),
    );
  });
  it("loads only the editable quiz and the version a save would carry", async () => {
    const f = fixture();
    const result = await runQuizDraft(f.client, { kind: "load", id: "quiz-1" });
    expect(result).toMatchObject({
      kind: "ready",
      item: { version: 2, nextVersion: 3, approved: true, scope: "module" },
    });
    const text = JSON.stringify(result);
    for (const secret of ["PRIVATE_BODY", "PRIVATE_REVIEWER", actor])
      expect(text).not.toContain(secret);
  });
  it.each(["owner", "author", "editor"])(
    "as %s, saves a draft of an approved version as the next version, keeping everything else",
    async (role) => {
      const f = fixture(role);
      expect(await runQuizDraft(f.client, save())).toEqual({
        kind: "saved",
        id: "quiz-1",
        revision: 4,
        bodySha256: "b".repeat(64),
        version: 3,
      });
      expect(sentBody(f)).toEqual({
        ...body(),
        metadata: { ...body().metadata, version: 3 },
      });
      expect(f.rpc).toHaveBeenCalledWith(
        "pipstart_editorial_save",
        expect.objectContaining({ p_id: "quiz-1", p_base_revision: 3 }),
      );
    },
  );
  it("keeps the version of a draft that is not approved yet", async () => {
    const f = fixture("owner", raw([], 3));
    const c = save();
    expect(await runQuizDraft(f.client, c)).toMatchObject({
      kind: "saved",
      version: 3,
    });
    expect(sentBody(f)?.metadata.version).toBe(3);
  });
  it("treats a changes-requested decision as not approved", async () => {
    const f = fixture(
      "owner",
      raw([{ ...imported, kind: "changes_requested" }], 3),
    );
    await runQuizDraft(f.client, save());
    expect(sentBody(f)?.metadata.version).toBe(3);
  });
  it.each([{ baseRevision: 2 }, { baseSha256: "f".repeat(64) }])(
    "refuses a stale base without writing",
    async (stale) => {
      const f = fixture();
      expect(await runQuizDraft(f.client, save(stale))).toEqual({
        kind: "conflict",
      });
      expect(sentBody(f)).toBeUndefined();
    },
  );
  it.each([
    { item: { ...raw().item, family: "lesson" } },
    { item: { ...raw().item, trashed: true } },
    { revision: { ...raw().revision, body: { metadata: {}, questions: [] } } },
  ])("refuses a resource outside the quiz editor %#", async (change) => {
    const f = fixture("owner", { ...raw(), ...change });
    expect(await runQuizDraft(f.client, save())).toEqual({
      kind: "unavailable",
    });
    expect(sentBody(f)).toBeUndefined();
  });
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
  ])("maps SQL %s to %s and never resends", async (code, kind) => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_save"
        ? f.response(null, { code, message: "PRIVATE_SQL" })
        : base(fn),
    );
    expect(await runQuizDraft(f.client, save())).toEqual({ kind });
    expect(
      f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_save"),
    ).toHaveLength(1);
  });
  it("treats a malformed acknowledgement as uncertain", async () => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_save"
        ? f.response({ item_id: "quiz-1", revision_no: 9 })
        : base(fn),
    );
    expect(await runQuizDraft(f.client, save())).toEqual({
      kind: "uncertain",
    });
  });
  it("snapshots caller input before Auth awaits", async () => {
    const f = fixture(),
      c = save();
    const promise = runQuizDraft(f.client, c);
    c.fields.title = "MUTATED";
    await promise;
    expect(sentBody(f)?.metadata.title).toBe("Quiz");
  });
});
