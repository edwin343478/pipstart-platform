import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
const draft = vi.hoisted(() => vi.fn());
vi.mock("./lesson-draft", () => ({ runLessonDraft: draft }));
import { runLessonEditor } from "./lesson-editor";
import { LESSON_DRAFT_RISK } from "./lesson-create-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const command = () => ({
  kind: "create",
  id: "lesson",
  path: "forex",
  parent: "module",
  order: 1,
  fields: {
    title: "Lesson",
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Learn"],
    seoTitle: "Lesson",
    seoDescription: "Description",
    sources: [{ title: "Source", url: "https://example.com/source" }],
  },
  content: {
    mode: "flat",
    blocks: [
      { sourceIndex: null, value: { type: "paragraph", children: "Text" } },
      {
        sourceIndex: null,
        value: { type: "riskNotice", children: LESSON_DRAFT_RISK },
      },
    ],
  },
  reason: "Create lesson",
});
const raw = (id: string) => ({
  item: {
    id,
    family: id === "module" ? "module" : "course",
    learning_path: "forex",
    parent_id: id === "module" ? "course" : null,
    latest_revision: 1,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 1,
    schema_version: 1,
    body: { metadata: { title: id, level: "level-1" } },
    body_sha256: "a".repeat(64),
    base_revision: 0,
    author_is_me: true,
    state: "draft",
    created_at: "2026-11-02T00:00:00Z",
  },
  decisions: [],
  review_required: true,
});
function fixture(role = "owner") {
  const response = (data: unknown, error: unknown = null) => ({
      abortSignal: vi.fn(() => Promise.resolve({ data, error })),
    }),
    getUser = vi
      .fn()
      .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string, args?: Record<string, unknown>) =>
    fn === "pipstart_staff_access"
      ? response({
          authorized: true,
          user_id: actor,
          roles: [role],
          capabilities: ["staff.enter"],
        })
      : fn === "pipstart_editorial_item"
        ? response(raw(String(args?.p_id)))
        : response({
            item_id: "lesson",
            revision_no: 1,
            body_sha256: "b".repeat(64),
            state: "draft",
          }),
  );
  return {
    response,
    getUser,
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  draft.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("lesson editor creation transport", () => {
  it("defaults closed before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(await runLessonEditor(f.client, command())).toEqual({
      kind: "denied",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("delegates existing draft writes to the accepted MP06c1 boundary", async () => {
    const f = fixture(),
      c = { kind: "save" };
    await runLessonEditor(f.client, c);
    expect(draft).toHaveBeenCalledWith(f.client, c);
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it.each(["owner", "author", "editor"])(
    "creates as %s with verified parent chain and user-context SQL",
    async (role) => {
      const f = fixture(role);
      expect(await runLessonEditor(f.client, command())).toEqual({
        kind: "saved",
        id: "lesson",
        revision: 1,
        bodySha256: "b".repeat(64),
      });
      expect(f.rpc).toHaveBeenCalledWith("pipstart_editorial_item", {
        p_id: "module",
      });
      expect(f.rpc).toHaveBeenCalledWith("pipstart_editorial_item", {
        p_id: "course",
      });
      expect(f.rpc).toHaveBeenCalledWith(
        "pipstart_editorial_create",
        expect.objectContaining({
          p_id: "lesson",
          p_family: "lesson",
          p_parent: "module",
          p_learning_path: "forex",
          p_body: expect.objectContaining({
            metadata: expect.objectContaining({
              sources: [{ title: "Source", url: "https://example.com/source" }],
              status: "draft",
              approved: false,
            }),
          }),
        }),
      );
      expect(
        f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_create"),
      ).toHaveLength(1);
    },
  );
  it("refuses reviewers and spoofed input", async () => {
    const f = fixture("reviewer");
    expect(await runLessonEditor(f.client, command())).toEqual({
      kind: "denied",
    });
    expect(await runLessonEditor(f.client, { ...command(), actor })).toEqual({
      kind: "invalid",
    });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_create",
      expect.anything(),
    );
  });
  it("refuses a changed Auth identity", async () => {
    const f = fixture();
    f.getUser
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValue({ data: { user: { id: "other" } }, error: null });
    expect(await runLessonEditor(f.client, command())).toEqual({
      kind: "denied",
    });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it.each([
    { family: "lesson" },
    { trashed: true },
    { learning_path: "crypto" },
  ])("rejects invalid parent module %#", async (change) => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn, args) =>
      fn === "pipstart_editorial_item" && args?.p_id === "module"
        ? f.response({
            ...raw("module"),
            item: { ...raw("module").item, ...change },
          })
        : base(fn, args),
    );
    expect(await runLessonEditor(f.client, command())).toEqual({
      kind: "invalid",
    });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_create",
      expect.anything(),
    );
  });
  it("refuses missing/mismatched course and absent course permission before create", async () => {
    for (const mode of ["path", "permission", "level"]) {
      const f = fixture(),
        base = f.rpc.getMockImplementation()!;
      f.rpc.mockImplementation((fn, args) => {
        if (fn === "pipstart_editorial_item" && args?.p_id === "course") {
          const c = raw("course");
          if (mode === "path") c.item.learning_path = "crypto";
          if (mode === "level") c.revision.body.metadata.level = "bad";
          return mode === "permission"
            ? f.response(null, { code: "42501" })
            : f.response(c);
        }
        return base(fn, args);
      });
      expect((await runLessonEditor(f.client, command())).kind).toBe(
        mode === "permission" ? "denied" : "invalid",
      );
      expect(f.rpc).not.toHaveBeenCalledWith(
        "pipstart_editorial_create",
        expect.anything(),
      );
    }
  });
  it.each([
    ["42501", "denied"],
    ["PT409", "conflict"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
  ])("maps create refusal %s without retry", async (code, kind) => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn, args) =>
      fn === "pipstart_editorial_create"
        ? f.response(null, { code, message: "PRIVATE_PROVIDER_ERROR" })
        : base(fn, args),
    );
    expect(await runLessonEditor(f.client, command())).toEqual({ kind });
    expect(
      f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_create"),
    ).toHaveLength(1);
  });
  it("retains uncertain state for a malformed creation acknowledgement", async () => {
    const f = fixture(),
      base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn, args) =>
      fn === "pipstart_editorial_create"
        ? f.response({ wrong: "PRIVATE" })
        : base(fn, args),
    );
    expect(await runLessonEditor(f.client, command())).toEqual({
      kind: "uncertain",
    });
  });
  it("captures exact creation input before awaits", async () => {
    const f = fixture(),
      c = command(),
      pending = runLessonEditor(f.client, c);
    c.fields.title = "Changed";
    await pending;
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_editorial_create",
      expect.objectContaining({
        p_body: expect.objectContaining({
          metadata: expect.objectContaining({ title: "Lesson" }),
        }),
      }),
    );
  });
});
