import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runCurriculumDraft } from "./curriculum-draft";
const fields = {
  title: "Course title",
  description: "Course description",
  order: 2,
  lessonContextTitle: "Context",
  lessonQuizLabel: "Quiz",
  seoTitle: "Search title",
  seoDescription: "Search description",
};
const actor = "d1000000-0000-4000-8000-000000000001";
const raw = () => ({
  item: {
    id: "course-1",
    family: "course",
    learning_path: "forex",
    parent_id: null,
    latest_revision: 3,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body: {
      opaque: "PRIVATE_BODY_SENTINEL",
      metadata: {
        title: "Old",
        description: "Description",
        level: "level-1",
        status: "published",
        placement: {
          order: 1,
          assessmentRequirements: [{ assessmentId: "kept" }],
        },
        protectedDisclosure: { required: true },
      },
    },
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
  const rpc = vi.fn((fn: string, args?: Record<string, unknown>) =>
    fn === "pipstart_staff_access"
      ? response({
          authorized: true,
          user_id: actor,
          roles: [role],
          capabilities: ["staff.enter"],
        })
      : fn === "pipstart_editorial_item"
        ? response(raw())
        : response({
            item_id: args?.p_id,
            revision_no: fn === "pipstart_editorial_create" ? 1 : 4,
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
const save = () => ({
  kind: "save",
  id: "course-1",
  baseRevision: 3,
  baseSha256: "a".repeat(64),
  fields,
  reason: "Improve text",
});
const create = () => ({
  kind: "create",
  id: "new-course",
  family: "course",
  path: "forex",
  parent: null,
  level: "level-1",
  fields,
  reason: "Create draft",
});
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("MP06b1 authenticated curriculum draft writes", () => {
  it("defaults closed and rejects overbroad requests before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "TRUE");
    expect(await runCurriculumDraft(f.client, save())).toEqual({
      kind: "denied",
    });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runCurriculumDraft(f.client, { ...save(), actor })).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("refuses changed Auth identity and non-writer staff", async () => {
    const f = fixture();
    f.getUser
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValue({ data: { user: { id: "other" } }, error: null });
    expect(await runCurriculumDraft(f.client, save())).toEqual({
      kind: "denied",
    });
    expect(f.rpc).not.toHaveBeenCalled();
    const r = fixture("reviewer");
    expect(
      await runCurriculumDraft(r.client, { kind: "load", id: "course-1" }),
    ).toEqual({ kind: "denied" });
  });
  it("returns only allowlisted editable metadata, never raw body or actor identifiers", async () => {
    const f = fixture(),
      result = await runCurriculumDraft(f.client, {
        kind: "load",
        id: "course-1",
      });
    expect(result.kind).toBe("ready");
    expect(JSON.stringify(result)).not.toMatch(
      /PRIVATE_BODY_SENTINEL|protectedDisclosure|assessmentRequirements|user_id/,
    );
  });
  it("uses the current full server body, preserves protected fields and saves exactly one new draft", async () => {
    const f = fixture("author");
    expect(await runCurriculumDraft(f.client, save())).toEqual({
      kind: "saved",
      id: "course-1",
      revision: 4,
      bodySha256: "b".repeat(64),
    });
    const call = f.rpc.mock.calls.find(
      ([fn]) => fn === "pipstart_editorial_save",
    )!;
    expect(call[1]).toMatchObject({
      p_base_revision: 3,
      p_reason: "Improve text",
      p_body: {
        opaque: "PRIVATE_BODY_SENTINEL",
        metadata: {
          title: fields.title,
          level: "level-1",
          protectedDisclosure: { required: true },
          placement: {
            order: fields.order,
            assessmentRequirements: [{ assessmentId: "kept" }],
          },
        },
      },
    });
    expect(f.rpc.mock.calls.map(([fn]) => fn)).toEqual([
      "pipstart_staff_access",
      "pipstart_editorial_item",
      "pipstart_editorial_save",
    ]);
  });
  it("checks both base revision and exact hash before writing", async () => {
    for (const command of [
      { ...save(), baseRevision: 2 },
      { ...save(), baseSha256: "c".repeat(64) },
    ]) {
      const f = fixture();
      expect(await runCurriculumDraft(f.client, command)).toEqual({
        kind: "conflict",
      });
      expect(
        f.rpc.mock.calls.some(([fn]) => fn === "pipstart_editorial_save"),
      ).toBe(false);
    }
  });
  it("honors authoritative revoked-grant/concurrent-conflict responses", async () => {
    for (const [code, kind] of [
      ["42501", "denied"],
      ["PT409", "conflict"],
      ["55000", "invalid"],
    ]) {
      const f = fixture(),
        original = f.rpc.getMockImplementation()!;
      f.rpc.mockImplementation((fn, args) =>
        fn === "pipstart_editorial_save"
          ? f.response(null, { code, message: "PRIVATE_SQL_ERROR" })
          : original(fn, args),
      );
      expect(await runCurriculumDraft(f.client, save())).toEqual({ kind });
      expect(
        f.rpc.mock.calls.filter(([fn]) => fn === "pipstart_editorial_save"),
      ).toHaveLength(1);
    }
  });
  it("never retries an unknown/malformed write result", async () => {
    for (const value of [
      null,
      {
        item_id: "other",
        revision_no: 4,
        body_sha256: "b".repeat(64),
        state: "draft",
      },
      {
        item_id: "course-1",
        revision_no: 4,
        body_sha256: "b".repeat(64),
        state: "approved",
      },
    ]) {
      const f = fixture(),
        original = f.rpc.getMockImplementation()!;
      f.rpc.mockImplementation((fn, args) =>
        fn === "pipstart_editorial_save"
          ? f.response(value)
          : original(fn, args),
      );
      expect(await runCurriculumDraft(f.client, save())).toEqual({
        kind: "uncertain",
      });
      expect(
        f.rpc.mock.calls.filter(([fn]) => fn === "pipstart_editorial_save"),
      ).toHaveLength(1);
    }
  });
  it("classifies a timeout after dispatch as uncertain, without leaking raw errors", async () => {
    const f = fixture(),
      original = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn, args) =>
      fn === "pipstart_editorial_save"
        ? {
            abortSignal: vi.fn(() =>
              Promise.reject(Error("PRIVATE_PROVIDER_FAILURE")),
            ),
          }
        : original(fn, args),
    );
    expect(await runCurriculumDraft(f.client, save())).toEqual({
      kind: "uncertain",
    });
  });
  it("creates only draft course revisions, requires Owner for course creation and never approves", async () => {
    const f = fixture();
    expect((await runCurriculumDraft(f.client, create())).kind).toBe("saved");
    expect(f.rpc.mock.calls.map(([fn]) => fn)).toEqual([
      "pipstart_staff_access",
      "pipstart_editorial_create",
    ]);
    expect(f.rpc.mock.calls[1][1]).toMatchObject({
      p_body: {
        metadata: {
          level: "level-1",
          status: "published",
          placement: { order: 2 },
        },
      },
    });
    const author = fixture("author");
    expect(await runCurriculumDraft(author.client, create())).toEqual({
      kind: "denied",
    });
  });
  it("checks a module's current parent path and delegates write permission to SQL", async () => {
    const command = {
      ...create(),
      family: "module",
      parent: "course-1",
      level: null,
    };
    const f = fixture("author");
    expect((await runCurriculumDraft(f.client, command)).kind).toBe("saved");
    const wrong = fixture();
    expect(
      await runCurriculumDraft(wrong.client, { ...command, path: "crypto" }),
    ).toEqual({ kind: "invalid" });
    expect(
      wrong.rpc.mock.calls.some(([fn]) => fn === "pipstart_editorial_create"),
    ).toBe(false);
  });
  it("refuses malformed/archived/unsupported existing items without a write", async () => {
    for (const change of [{ family: "lesson" }, { trashed: true }]) {
      const f = fixture(),
        original = f.rpc.getMockImplementation()!;
      f.rpc.mockImplementation((fn, args) =>
        fn === "pipstart_editorial_item"
          ? f.response({ ...raw(), item: { ...raw().item, ...change } })
          : original(fn, args),
      );
      expect(await runCurriculumDraft(f.client, save())).toEqual({
        kind: "unavailable",
      });
      expect(
        f.rpc.mock.calls.some(([fn]) => fn === "pipstart_editorial_save"),
      ).toBe(false);
    }
  });
  it("copies a validated request before async work so caller mutation cannot change the write", async () => {
    const f = fixture(),
      command = save();
    let release!: () => void;
    f.getUser.mockReturnValueOnce(
      new Promise((resolve) => {
        release = () => resolve({ data: { user: { id: actor } }, error: null });
      }),
    );
    const result = runCurriculumDraft(f.client, command);
    command.reason = "Changed after dispatch";
    release();
    expect((await result).kind).toBe("saved");
    expect(f.rpc.mock.calls.at(-1)?.[1]?.p_reason).toBe("Improve text");
  });
});
