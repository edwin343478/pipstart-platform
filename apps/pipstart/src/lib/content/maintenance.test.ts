import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readMaintenancePage, runMaintenance } from "./maintenance";
import {
  parseAllowlist,
  parseIntervals,
  parseResults,
  parseWorklist,
  reasonOk,
  validMaintenanceInput,
} from "./maintenance-contract";

const actor = "d1000000-0000-4000-8000-000000000001";
const other = "d1000000-0000-4000-8000-000000000002";
const item = (id: string, patch: Record<string, unknown> = {}) => ({
  id,
  family: "lesson",
  title: "Lesson",
  revision: 2,
  reviewedOn: "2026-01-01",
  contentDue: "2027-01-01",
  due: "2027-01-01",
  rescheduled: false,
  status: "current",
  acknowledged: null,
  assignedToMe: true,
  assignee: null,
  ...patch,
});
function fixture(
  role = "moderator",
  replies: Record<string, { data: unknown; error: unknown }> = {},
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
      : replies[fn]
        ? response(replies[fn].data, replies[fn].error)
        : response({ item_id: "l1", status: "ok" }),
  );
  return {
    rpc,
    getUser,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
    writes: () =>
      rpc.mock.calls.filter((c) => c[0] !== "pipstart_staff_access"),
  };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("MP10c maintenance contract", () => {
  it("accepts exactly the supported commands", () => {
    for (const ok of [
      { action: "acknowledge", id: "l1", revision: 2, reason: "Seen" },
      {
        action: "reschedule",
        id: "l1",
        revision: 2,
        due: "2027-02-28",
        reason: "Later",
      },
      {
        action: "result",
        id: "l1",
        revision: 2,
        reference: "https://docs.example.org/x",
        classification: "manual_broken",
        note: "",
      },
      { action: "assign", id: "partner:p", assignee: other, reason: "Owner" },
      { action: "unassign", id: "l1", reason: "Moved" },
      { action: "results", id: "l1" },
      {
        action: "interval",
        family: "analysis",
        expected: 1,
        days: 90,
        reason: "Faster",
      },
      {
        action: "allowlist",
        host: "docs.example.org",
        change: "add",
        reason: "Docs",
      },
    ])
      expect(validMaintenanceInput(ok)).toBe(true);
  });
  it.each([
    { action: "acknowledge", id: "l1", revision: 0, reason: "x" },
    { action: "acknowledge", id: "L1", revision: 1, reason: "x" },
    { action: "acknowledge", id: "l1", revision: 1, reason: " x" },
    { action: "acknowledge", id: "l1", revision: 1, reason: "a\nb" },
    { action: "acknowledge", id: "l1", revision: 1, reason: "x", extra: 1 },
    {
      action: "reschedule",
      id: "l1",
      revision: 1,
      due: "2027-02-30",
      reason: "x",
    },
    {
      action: "result",
      id: "l1",
      revision: 1,
      reference: "x",
      classification: "ok",
      note: "",
    },
    {
      action: "result",
      id: "l1",
      revision: 1,
      reference: "a\u0007",
      classification: "manual_ok",
      note: "",
    },
    { action: "assign", id: "l1", assignee: "not-a-uuid", reason: "x" },
    { action: "interval", family: "quiz", expected: 1, days: 90, reason: "x" },
    {
      action: "interval",
      family: "lesson",
      expected: 1,
      days: 29,
      reason: "x",
    },
    {
      action: "allowlist",
      host: "Docs.Example.org",
      change: "add",
      reason: "x",
    },
    {
      action: "allowlist",
      host: "docs.example.org",
      change: "block",
      reason: "x",
    },
    { action: "probe", id: "l1" },
  ])("refuses malformed command %#", (bad) => {
    expect(validMaintenanceInput(bad)).toBe(false);
  });
  it("parses an ordered worklist page and its cursor", () => {
    expect(
      parseWorklist({ items: [item("a"), item("b")], next: "b" })?.items.map(
        (i) => i.id,
      ),
    ).toEqual(["a", "b"]);
    expect(
      parseWorklist({
        items: [
          item("a", {
            acknowledged: { at: "2026-11-16T10:00:00+00:00", reason: "Seen" },
          }),
        ],
        next: null,
      })?.items[0].acknowledged,
    ).toEqual({ at: "2026-11-16T10:00:00+00:00", reason: "Seen" });
  });
  it.each([
    { items: [item("b"), item("a")], next: null },
    { items: [item("a")], next: "z" },
    { items: [item("a", { status: "late" })], next: null },
    { items: [item("a", { family: "course" })], next: null },
    { items: [item("a", { extra: 1 })], next: null },
    { items: [item("a", { assignee: "x" })], next: null },
    { items: [], next: null, extra: 1 },
  ])("refuses a malformed worklist %#", (bad) => {
    expect(parseWorklist(bad)).toBeNull();
  });
  it("parses results, intervals and the allowlist strictly", () => {
    const r = {
      reference: "https://x.example/a",
      source: "manual",
      classification: "manual_ok",
      evidence: null,
      checkedAt: "2026-11-16T10:00:00+00:00",
      byMe: true,
    };
    expect(parseResults({ item_id: "l1", revision: 2, results: [r] })).toEqual({
      revision: 2,
      results: [r],
    });
    expect(
      parseResults({
        item_id: "l1",
        revision: 2,
        results: [{ ...r, source: "guess" }],
      }),
    ).toBeNull();
    expect(
      parseIntervals([
        {
          family: "lesson",
          version: 1,
          days: 365,
          setAt: "2026-11-16T10:00:00Z",
        },
      ]),
    ).toHaveLength(1);
    expect(
      parseIntervals([
        { family: "quiz", version: 1, days: 1, setAt: "2026-11-16T10:00:00Z" },
      ]),
    ).toBeNull();
    expect(
      parseAllowlist([
        { host: "docs.example.org", since: "2026-11-16T10:00:00Z" },
      ]),
    ).toHaveLength(1);
    expect(
      parseAllowlist([{ host: "x", since: "2026-11-16T10:00:00Z" }]),
    ).toBeNull();
    expect(reasonOk("x".repeat(200))).toBe(true);
    expect(reasonOk("x".repeat(201))).toBe(false);
  });
});

describe("MP10c maintenance service", () => {
  it("defaults closed and refuses malformed input before Auth", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(
      await runMaintenance(f.client, { action: "results", id: "l1" }),
    ).toEqual({ kind: "denied" });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runMaintenance(f.client, { action: "results" })).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it.each(["learner", "administrator"])(
    "refuses %s without calling the store",
    async (role) => {
      const f = fixture(role);
      expect(
        await runMaintenance(f.client, {
          action: "acknowledge",
          id: "l1",
          revision: 2,
          reason: "x",
        }),
      ).toEqual({ kind: "denied" });
      expect(f.writes()).toEqual([]);
    },
  );
  it.each([
    [
      { action: "acknowledge", id: "l1", revision: 2, reason: "Seen" },
      "pipstart_maintenance_acknowledge",
      { p_item: "l1", p_expected_revision: 2, p_reason: "Seen" },
    ],
    [
      {
        action: "reschedule",
        id: "l1",
        revision: 2,
        due: "2027-01-31",
        reason: "Later",
      },
      "pipstart_maintenance_reschedule",
      {
        p_item: "l1",
        p_expected_revision: 2,
        p_due: "2027-01-31",
        p_reason: "Later",
      },
    ],
    [
      {
        action: "result",
        id: "l1",
        revision: 2,
        reference: "https://x.example/a",
        classification: "manual_broken",
        note: "",
      },
      "pipstart_maintenance_record_result",
      {
        p_item: "l1",
        p_expected_revision: 2,
        p_reference: "https://x.example/a",
        p_source: "manual",
        p_classification: "manual_broken",
        p_evidence: null,
      },
    ],
    [
      { action: "assign", id: "l1", assignee: other, reason: "Owner" },
      "pipstart_maintenance_assign",
      { p_item: "l1", p_assignee: other, p_reason: "Owner" },
    ],
    [
      { action: "unassign", id: "l1", reason: "Moved" },
      "pipstart_maintenance_unassign",
      { p_item: "l1", p_reason: "Moved" },
    ],
    [
      {
        action: "interval",
        family: "lesson",
        expected: 1,
        days: 400,
        reason: "Slower",
      },
      "pipstart_maintenance_interval_set",
      {
        p_family: "lesson",
        p_expected_version: 1,
        p_days: 400,
        p_reason: "Slower",
      },
    ],
    [
      {
        action: "allowlist",
        host: "docs.example.org",
        change: "remove",
        reason: "Gone",
      },
      "pipstart_maintenance_allowlist_change",
      { p_host: "docs.example.org", p_action: "remove", p_reason: "Gone" },
    ],
  ])("sends one exact %j", async (input, fn, args) => {
    const f = fixture("owner");
    expect(await runMaintenance(f.client, input)).toEqual({ kind: "done" });
    expect(f.writes()).toEqual([[fn, args]]);
  });
  it("records a manual note as evidence and never sends a probe", async () => {
    const f = fixture();
    await runMaintenance(f.client, {
      action: "result",
      id: "l1",
      revision: 2,
      reference: "r",
      classification: "manual_ok",
      note: "Opened it",
    });
    expect((f.writes()[0] as unknown[])[1]).toMatchObject({
      p_source: "manual",
      p_evidence: "Opened it",
    });
  });
  it("maps the hourly action limit (PT429) to limited and never resends", async () => {
    const f = fixture("moderator", {
      pipstart_maintenance_acknowledge: {
        data: null,
        error: { code: "PT429", message: "PRIVATE", hint: "retry_after=600" },
      },
    });
    expect(
      await runMaintenance(f.client, {
        action: "acknowledge",
        id: "l1",
        revision: 2,
        reason: "x",
      }),
    ).toEqual({ kind: "limited", retryAfter: 600 });
    expect(f.writes()).toHaveLength(1);
  });
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
  ])("maps a write refusal %s to %s and never resends", async (code, kind) => {
    const f = fixture("moderator", {
      pipstart_maintenance_acknowledge: {
        data: null,
        error: { code, message: "PRIVATE" },
      },
    });
    expect(
      await runMaintenance(f.client, {
        action: "acknowledge",
        id: "l1",
        revision: 2,
        reason: "x",
      }),
    ).toEqual({ kind });
    expect(f.writes()).toHaveLength(1);
  });
  it("treats a lost reply after sending as uncertain", async () => {
    const f = fixture();
    const base = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn: string) =>
      fn === "pipstart_maintenance_acknowledge"
        ? { abortSignal: vi.fn(() => Promise.reject(Error("socket closed"))) }
        : base(fn),
    );
    expect(
      await runMaintenance(f.client, {
        action: "acknowledge",
        id: "l1",
        revision: 2,
        reason: "x",
      }),
    ).toEqual({ kind: "uncertain" });
  });
  it("reads results and fails closed on a malformed reply", async () => {
    const good = fixture("moderator", {
      pipstart_maintenance_results: {
        data: { item_id: "l1", revision: 2, results: [] },
        error: null,
      },
    });
    expect(
      await runMaintenance(good.client, { action: "results", id: "l1" }),
    ).toEqual({ kind: "results", revision: 2, results: [] });
    const bad = fixture("moderator", {
      pipstart_maintenance_results: { data: { item_id: "l1" }, error: null },
    });
    expect(
      await runMaintenance(bad.client, { action: "results", id: "l1" }),
    ).toEqual({ kind: "unavailable" });
    const denied = fixture("moderator", {
      pipstart_maintenance_results: { data: null, error: { code: "42501" } },
    });
    expect(
      await runMaintenance(denied.client, { action: "results", id: "l1" }),
    ).toEqual({ kind: "denied" });
  });
});

describe("MP10c maintenance page reads", () => {
  const people = (items: unknown[], next: string | null = null) => ({
    data: { items, next_after: next },
    error: null,
  });
  const person = (
    id: string,
    roles: string[],
    active: boolean | null = true,
  ) => ({
    user_id: id,
    display_name: "Person " + id.slice(-1),
    created_at: "2026-10-01T00:00:00Z",
    staff_active: active,
    staff_roles: roles,
  });
  it("reads only what the view needs, with exact arguments", async () => {
    const f = fixture("moderator", {
      pipstart_maintenance_worklist: {
        data: { items: [item("a")], next: null },
        error: null,
      },
    });
    const page = await readMaintenancePage(f.client, {
      scope: "mine",
      status: "overdue",
      family: "lesson",
      after: "",
      owner: false,
      policy: false,
    });
    expect(page.worklist?.items).toHaveLength(1);
    expect(f.rpc.mock.calls).toEqual([
      [
        "pipstart_maintenance_worklist",
        {
          p_scope: "mine",
          p_status: "overdue",
          p_family: "lesson",
          p_after: "",
          p_limit: 50,
        },
      ],
    ]);
    expect(page.staff).toBeNull();
  });
  it("lists active maintenance-capable staff for the Owner's picker", async () => {
    const f = fixture("owner", {
      pipstart_maintenance_worklist: {
        data: { items: [], next: null },
        error: null,
      },
      pipstart_staff_people: people([
        person("d1000000-0000-4000-8000-000000000001", ["owner"]),
        person("d1000000-0000-4000-8000-000000000002", ["moderator"]),
        person("d1000000-0000-4000-8000-000000000003", ["administrator"]),
        person("d1000000-0000-4000-8000-000000000004", ["author"], false),
        person("d1000000-0000-4000-8000-000000000005", []),
      ]),
    });
    const page = await readMaintenancePage(f.client, {
      scope: "all",
      status: null,
      family: null,
      after: "",
      owner: true,
      policy: false,
    });
    expect(page.staff?.map((p) => p.id.slice(-1))).toEqual(["1", "2"]);
  });
  it("fails closed per section", async () => {
    const f = fixture("owner", {
      pipstart_maintenance_intervals: { data: null, error: { code: "42501" } },
      pipstart_maintenance_allowlist: { data: [{ host: "BAD" }], error: null },
    });
    const page = await readMaintenancePage(f.client, {
      scope: null,
      status: null,
      family: null,
      after: "",
      owner: true,
      policy: true,
    });
    expect(page).toEqual({
      worklist: null,
      intervals: null,
      allowlist: null,
      staff: null,
    });
  });
});
