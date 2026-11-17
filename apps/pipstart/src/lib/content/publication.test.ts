import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runPublication } from "./publication";
import {
  parsePublicationStatus,
  validPublicationInput,
} from "./publication-contract";

const actor = "d1000000-0000-4000-8000-000000000001";
const op = "6a2b3c4d-1111-4222-8333-444455556666";
const sha = "a".repeat(64);
const reply = (generation: number, replayed = false) => ({
  generation,
  kind: "publish",
  item_id: "post-1",
  revision_no: 2,
  entries: 160,
  snapshot_sha256: "b".repeat(64),
  replayed,
});
const cleanBody = {
  metadata: { title: "Post" },
  blocks: [{ type: "learningLink", href: "/tools/risk-reward-calculator" }],
};
const revisionRead = (body: unknown = cleanBody, bodySha = sha) => ({
  data: {
    item_id: "post-1",
    revision: { revision_no: 2, body, body_sha256: bodySha },
  },
  error: null as unknown,
});
function fixture(
  role = "owner",
  write: { data: unknown; error: unknown } = { data: reply(5), error: null },
  read: { data: unknown; error: unknown } = revisionRead(),
) {
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string) =>
    fn === "pipstart_staff_access"
      ? response(
          role === "learner"
            ? { authorized: false }
            : {
                authorized: true,
                user_id: actor,
                roles: [role],
                capabilities: ["staff.enter"],
              },
        )
      : fn === "pipstart_publication_status"
        ? response({
            generation: 4,
            refresh: {
              state: "verified",
              attempts: 1,
              updated_at: "2026-11-06T10:00:00Z",
            },
            item_id: "post-1",
            published: { revision_no: 1, body_sha256: sha },
          })
        : fn === "pipstart_editorial_revision"
          ? response(read.data, read.error)
          : response(write.data, write.error),
  );
  return {
    rpc,
    getUser,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
const publish = (patch: Record<string, unknown> = {}) => ({
  action: "publish",
  operation: op,
  expected: 4,
  id: "post-1",
  revision: 2,
  sha,
  reason: "Pilot",
  ...patch,
});
const writes = (f: ReturnType<typeof fixture>) =>
  f.rpc.mock.calls.filter(
    (c) =>
      ![
        "pipstart_staff_access",
        "pipstart_publication_status",
        "pipstart_editorial_revision",
      ].includes(c[0]),
  );
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("M22 MP08b1 live publication contract", () => {
  it("accepts only the exact command shapes", () => {
    for (const ok of [
      { action: "status", id: null },
      { action: "status", id: "post-1" },
      { action: "baseline", operation: op, reason: "First" },
      publish(),
      {
        action: "withdraw",
        operation: op,
        expected: 4,
        id: "post-1",
        reason: "Retire",
      },
      {
        action: "restore",
        operation: op,
        expected: 4,
        from: 2,
        reason: "Undo",
      },
    ])
      expect(validPublicationInput(ok), JSON.stringify(ok)).toBe(true);
    for (const bad of [
      publish({ reason: " padded" }),
      publish({ reason: "" }),
      publish({ reason: "two\nlines" }),
      publish({ operation: "not-a-uuid" }),
      publish({ expected: 0 }),
      publish({ sha: "A".repeat(64) }),
      publish({ extra: true }),
      {
        action: "restore",
        operation: op,
        expected: 4,
        from: 4,
        reason: "Same",
      },
      { action: "status" },
      { action: "delete", id: "post-1" },
    ])
      expect(validPublicationInput(bad), JSON.stringify(bad)).toBe(false);
  });
  it("parses the store's status reply exactly", () => {
    expect(
      parsePublicationStatus({ generation: null, refresh: null }, false),
    ).toEqual({ generation: null, refresh: null, published: null });
    expect(
      parsePublicationStatus(
        {
          generation: 3,
          refresh: {
            state: "failed",
            attempts: 2,
            updated_at: "2026-11-06T10:00:00Z",
          },
          item_id: "x",
          published: null,
        },
        true,
      ),
    ).toEqual({
      generation: 3,
      refresh: {
        state: "failed",
        attempts: 2,
        updatedAt: "2026-11-06T10:00:00Z",
      },
      published: null,
    });
    for (const bad of [
      { generation: 0, refresh: null },
      {
        generation: 1,
        refresh: {
          state: "done",
          attempts: 0,
          updated_at: "2026-11-06T10:00:00Z",
        },
      },
      { generation: 1, refresh: null, extra: 1 },
    ])
      expect(parsePublicationStatus(bad, false)).toBeNull();
  });
});

describe("M22 MP08b1 live publication service", () => {
  it("defaults closed and refuses malformed input before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "denied",
    });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runPublication(f.client, publish({ expected: -1 }))).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("reads status for any staff role", async () => {
    const f = fixture("reviewer");
    expect(
      await runPublication(f.client, { action: "status", id: "post-1" }),
    ).toEqual({
      kind: "status",
      status: {
        generation: 4,
        refresh: {
          state: "verified",
          attempts: 1,
          updatedAt: "2026-11-06T10:00:00Z",
        },
        published: { revision: 1, bodySha256: sha },
      },
    });
  });
  it.each([
    ["author", publish()],
    [
      "editor",
      {
        action: "restore",
        operation: op,
        expected: 4,
        from: 2,
        reason: "Undo",
      },
    ],
    ["editor", { action: "baseline", operation: op, reason: "First" }],
    ["learner", { action: "status", id: null }],
  ])("refuses %s for %j without writing", async (role, input) => {
    const f = fixture(role);
    expect(await runPublication(f.client, input)).toEqual({ kind: "denied" });
    expect(writes(f)).toEqual([]);
  });
  it("sends one exact publish and accepts only the next generation", async () => {
    const f = fixture("editor");
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "done",
      generation: 5,
      replayed: false,
    });
    expect(writes(f)).toEqual([
      [
        "pipstart_publication_publish",
        {
          p_operation: op,
          p_expected_generation: 4,
          p_id: "post-1",
          p_revision: 2,
          p_sha: sha,
          p_reason: "Pilot",
        },
      ],
    ]);
  });
  it("reports a replayed operation as done, once", async () => {
    const f = fixture("owner", { data: reply(5, true), error: null });
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "done",
      generation: 5,
      replayed: true,
    });
    expect(writes(f)).toHaveLength(1);
  });
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["22023", "invalid"],
    ["55000", "state"],
    ["57014", "uncertain"],
  ])("maps store code %s to %s and never resends", async (code, kind) => {
    const f = fixture("owner", {
      data: null,
      error: { code, message: "PRIVATE" },
    });
    expect(await runPublication(f.client, publish())).toEqual({ kind });
    expect(writes(f)).toHaveLength(1);
  });
  it("maps the hourly action limit (PT429) to limited and never resends", async () => {
    const f = fixture("owner", {
      data: null,
      error: { code: "PT429", message: "PRIVATE", hint: "retry_after=600" },
    });
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "limited",
      retryAfter: 600,
    });
    expect(writes(f)).toHaveLength(1);
  });
  it.each([
    null,
    reply(7),
    { ...reply(5), extra: 1 },
    { ...reply(5), replayed: "no" },
  ])("treats an unexpected reply %# as uncertain", async (data) => {
    const f = fixture("owner", { data, error: null });
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "uncertain",
    });
  });
  it("treats a lost response after sending as uncertain", async () => {
    const f = fixture();
    const base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn: string) =>
      fn === "pipstart_publication_publish"
        ? { abortSignal: vi.fn(() => Promise.reject(Error("socket closed"))) }
        : base(fn),
    );
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "uncertain",
    });
  });
  it("expects generation 1 from the baseline and the next generation from restore", async () => {
    const b = fixture("owner", {
      data: { ...reply(1), kind: "baseline", item_id: null, revision_no: null },
      error: null,
    });
    expect(
      await runPublication(b.client, {
        action: "baseline",
        operation: op,
        reason: "First",
      }),
    ).toEqual({ kind: "done", generation: 1, replayed: false });
    const r = fixture("owner", {
      data: { ...reply(5), kind: "restore", item_id: null, revision_no: null },
      error: null,
    });
    expect(
      await runPublication(r.client, {
        action: "restore",
        operation: op,
        expected: 4,
        from: 2,
        reason: "Undo",
      }),
    ).toEqual({ kind: "done", generation: 5, replayed: false });
    expect(writes(r)[0]).toEqual([
      "pipstart_publication_restore",
      {
        p_operation: op,
        p_expected_generation: 4,
        p_from_generation: 2,
        p_reason: "Undo",
      },
    ]);
  });
});

describe("M22 MP10b Make live reference gate", () => {
  const reads = (f: ReturnType<typeof fixture>) =>
    f.rpc.mock.calls.filter((c) => c[0] === "pipstart_editorial_revision");
  it("reads the exact revision before publishing", async () => {
    const f = fixture("editor");
    expect((await runPublication(f.client, publish())).kind).toBe("done");
    expect(reads(f)).toEqual([
      ["pipstart_editorial_revision", { p_id: "post-1", p_revision: 2 }],
    ]);
    const order = f.rpc.mock.calls.map((c) => c[0]);
    expect(order.indexOf("pipstart_editorial_revision")).toBeLessThan(
      order.indexOf("pipstart_publication_publish"),
    );
  });
  it("refuses a revision with missing pages or images and sends nothing", async () => {
    const blocks = [
      { type: "learningLink", href: "/tools/gone" },
      ...Array.from({ length: 11 }, (_, i) => ({
        type: "diagram",
        alt: "A",
        src: `/images/missing-${i}.svg`,
        width: 1,
        height: 1,
      })),
    ];
    const f = fixture(
      "owner",
      undefined,
      revisionRead({ metadata: { title: "L" }, blocks }),
    );
    const result = await runPublication(f.client, publish());
    expect(result).toEqual({
      kind: "references",
      total: 12,
      references: [
        "blocks[0].href links to a page that does not exist: /tools/gone",
        ...Array.from(
          { length: 9 },
          (_, i) =>
            `blocks[${i + 1}].src uses an image that does not exist: /images/missing-${i}.svg`,
        ),
      ],
    });
    expect(writes(f)).toEqual([]);
  });
  it("treats a revision whose hash changed as a conflict and sends nothing", async () => {
    const f = fixture(
      "owner",
      undefined,
      revisionRead(cleanBody, "c".repeat(64)),
    );
    expect(await runPublication(f.client, publish())).toEqual({
      kind: "conflict",
    });
    expect(writes(f)).toEqual([]);
  });
  it.each([
    [{ data: null, error: { code: "42501" } }, "denied"],
    [{ data: null, error: { code: "22023" } }, "invalid"],
    [{ data: null, error: { code: "57014" } }, "unavailable"],
    [{ data: { item_id: "post-1" }, error: null }, "conflict"],
  ])(
    "maps a failed revision read %# to %s without sending",
    async (read, kind) => {
      const f = fixture("owner", undefined, read);
      expect(await runPublication(f.client, publish())).toEqual({ kind });
      expect(writes(f)).toEqual([]);
    },
  );
  it("does not read revisions for withdraw, restore or baseline", async () => {
    const f = fixture("owner", {
      data: { ...reply(5), kind: "withdraw" },
      error: null,
    });
    await runPublication(f.client, {
      action: "withdraw",
      operation: op,
      expected: 4,
      id: "post-1",
      reason: "Offline",
    });
    expect(reads(f)).toEqual([]);
  });
});
