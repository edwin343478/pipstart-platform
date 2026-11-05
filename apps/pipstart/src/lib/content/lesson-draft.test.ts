import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runLessonDraft } from "./lesson-draft";
import { projectLessonBody } from "./lesson-draft-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const body = () => ({
  opaque: "PRIVATE_BODY",
  metadata: {
    title: "Lesson",
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Understand"],
    seoTitle: "Search",
    seoDescription: "Description",
    slug: "immutable",
    riskWarningRequired: true,
    affiliateDisclosureRequired: false,
    approved: true,
  },
  blocks: [
    { type: "paragraph", children: "Text" },
    { type: "riskNotice", children: "Risk" },
  ],
});
const raw = () => ({
  item: {
    id: "lesson",
    family: "lesson",
    learning_path: "forex",
    parent_id: "module",
    latest_revision: 3,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body: body(),
    body_sha256: "a".repeat(64),
    base_revision: 2,
    author_is_me: true,
    state: "approved",
    created_at: "2026-11-02T00:00:00Z",
  },
  decisions: [],
  review_required: false,
});
function fixture(role = "owner") {
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
            roles: role === "learner" ? [] : [role],
            capabilities: ["staff.enter"],
          })
      : fn === "pipstart_editorial_item"
        ? response(raw())
        : response({
            item_id: "lesson",
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
const command = () => ({
  kind: "save",
  id: "lesson",
  baseRevision: 3,
  baseSha256: "a".repeat(64),
  ...projectLessonBody(body()),
  reason: "Edit lesson",
});
const save = () => {
  const { fields, content } = projectLessonBody(body())!;
  return {
    kind: "save",
    id: "lesson",
    baseRevision: 3,
    baseSha256: "a".repeat(64),
    fields,
    content,
    reason: "Edit lesson",
  };
};
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("MP06c1 verified lesson service", () => {
  it("defaults closed and rejects arbitrary caller metadata before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "TRUE");
    expect(await runLessonDraft(f.client, save())).toEqual({ kind: "denied" });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runLessonDraft(f.client, command())).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it.each(["reviewer", "learner"])(
    "denies %s without item access",
    async (role) => {
      const f = fixture(role);
      expect(await runLessonDraft(f.client, save())).toEqual({
        kind: "denied",
      });
      expect(f.rpc).not.toHaveBeenCalledWith(
        "pipstart_editorial_item",
        expect.anything(),
      );
    },
  );
  it("denies changed verified identity", async () => {
    const f = fixture();
    f.getUser
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValue({ data: { user: { id: "other" } }, error: null });
    expect(await runLessonDraft(f.client, save())).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("returns only intended editable content, never raw body or protected metadata", async () => {
    const f = fixture(),
      result = await runLessonDraft(f.client, { kind: "load", id: "lesson" });
    expect(result.kind).toBe("ready");
    expect(JSON.stringify(result)).not.toContain("PRIVATE_BODY");
    expect(JSON.stringify(result)).not.toContain("immutable");
    expect(JSON.stringify(result)).not.toContain(actor);
  });
  it.each(["owner", "author", "editor"])(
    "saves as %s through existing user-context RPC with bounded abort signal",
    async (role) => {
      const f = fixture(role);
      expect(await runLessonDraft(f.client, save())).toEqual({
        kind: "saved",
        id: "lesson",
        revision: 4,
        bodySha256: "b".repeat(64),
      });
      const call = f.rpc.mock.calls.find(
        (c) => c[0] === "pipstart_editorial_save",
      );
      expect(call).toBeDefined();
      expect(f.rpc).toHaveBeenCalledWith(
        "pipstart_editorial_save",
        expect.objectContaining({
          p_id: "lesson",
          p_base_revision: 3,
          p_body: body(),
          p_reason: "Edit lesson",
        }),
      );
      expect(
        f.rpc.mock.results.every(
          (r) => r.value.abortSignal.mock.calls[0][0] instanceof AbortSignal,
        ),
      ).toBe(true);
    },
  );
  it.each([{ baseRevision: 2 }, { baseSha256: "f".repeat(64) }])(
    "rejects stale version/hash without write",
    async (stale) => {
      const f = fixture();
      expect(await runLessonDraft(f.client, { ...save(), ...stale })).toEqual({
        kind: "conflict",
      });
      expect(f.rpc).not.toHaveBeenCalledWith(
        "pipstart_editorial_save",
        expect.anything(),
      );
    },
  );
  it.each([{ family: "course" }, { trashed: true }])(
    "refuses wrong family/trashed resource",
    async (change) => {
      const f = fixture();
      f.rpc.mockImplementation((fn) =>
        fn === "pipstart_editorial_item"
          ? f.response({ ...raw(), item: { ...raw().item, ...change } })
          : f.response({
              authorized: true,
              user_id: actor,
              roles: ["owner"],
              capabilities: ["staff.enter"],
            }),
      );
      expect(await runLessonDraft(f.client, save())).toEqual({
        kind: "unavailable",
      });
    },
  );
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["55000", "invalid"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
  ])("maps SQL %s to %s with no write replay", async (code, kind) => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_save"
        ? f.response(null, { code, message: "PRIVATE_SQL" })
        : base(fn),
    );
    expect(await runLessonDraft(f.client, save())).toEqual({ kind });
    expect(
      f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_save"),
    ).toHaveLength(1);
  });
  it("treats malformed acknowledgements and lost write responses as uncertain, never retrying", async () => {
    for (const data of [
      null,
      {
        item_id: "wrong",
        revision_no: 4,
        body_sha256: "b".repeat(64),
        state: "draft",
      },
    ]) {
      const f = fixture(),
        base = f.rpc.getMockImplementation()!;
      f.rpc.mockImplementation((fn) =>
        fn === "pipstart_editorial_save" ? f.response(data) : base(fn),
      );
      expect(await runLessonDraft(f.client, save())).toEqual({
        kind: "uncertain",
      });
      expect(
        f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_save"),
      ).toHaveLength(1);
    }
  });
  it("snapshots caller input before Auth awaits", async () => {
    const f = fixture(),
      c = save();
    const promise = runLessonDraft(f.client, c);
    c.fields.title = "MUTATED";
    await promise;
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_editorial_save",
      expect.objectContaining({ p_body: body() }),
    );
  });
  it("does not write when disclosures are weakened", async () => {
    const f = fixture(),
      c = save();
    if (c.content.mode !== "flat") throw Error();
    c.content.blocks.pop();
    expect(await runLessonDraft(f.client, c)).toEqual({ kind: "invalid" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_save",
      expect.anything(),
    );
  });
});
