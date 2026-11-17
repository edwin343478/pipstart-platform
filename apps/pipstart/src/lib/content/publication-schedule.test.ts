import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runPublicationSchedule } from "./publication-schedule";
import {
  parseScheduleRecord,
  parseScheduleStatus,
  validScheduleInput,
  scheduleLabel,
} from "./publication-schedule-contract";
const actor = "d1000000-0000-4000-8000-000000000001",
  op = "6a2b3c4d-1111-4222-8333-444455556666",
  sha = "a".repeat(64);
const input = (patch: Record<string, unknown> = {}) => ({
  action: "schedule",
  operation: op,
  expected: 4,
  id: "post-1",
  publicationAction: "publish",
  revision: 2,
  sha,
  localInput: "2027-01-15T12:30",
  timeZone: "Africa/Nairobi",
  reason: "Planned lesson release",
  ...patch,
});
const row = (patch: Record<string, unknown> = {}) => ({
  id: op,
  item_id: "post-1",
  action: "publish",
  state: "scheduled",
  revision_no: 2,
  body_sha256: sha,
  base_generation: 4,
  policy_version: 0,
  due_at: "2027-01-15T09:30:00.000Z",
  time_zone: "Africa/Nairobi",
  local_input: "2027-01-15T12:30",
  outcome_generation: null,
  failure_code: null,
  ...patch,
});
function fixture(role = "owner") {
  const writes: Record<string, unknown>[] = [];
  let data: unknown = row(),
    error: unknown = null,
    status: unknown = { execution_enabled: false, schedules: [row()] };
  const response = (d: unknown, e: unknown = null) => ({
    abortSignal: vi.fn(async () => ({ data: d, error: e })),
  });
  const getUser = vi.fn(async () => ({
    data: { user: { id: actor } },
    error: null,
  }));
  const rpc = vi.fn((fn: string, args?: Record<string, unknown>) => {
    if (fn === "pipstart_staff_access")
      return response(
        role === "learner"
          ? { authorized: false }
          : {
              authorized: true,
              user_id: actor,
              roles: [role],
              capabilities: ["staff.enter"],
            },
      );
    if (fn === "pipstart_publication_schedule_status") return response(status);
    if (
      ![
        "pipstart_publication_schedule",
        "pipstart_publication_cancel_schedule",
      ].includes(fn)
    )
      throw Error("Unreviewed RPC");
    expect(getUser).toHaveBeenCalledTimes(1);
    writes.push({ fn, ...args });
    return response(data, error);
  });
  return {
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
    rpc,
    getUser,
    writes,
    write: (d: unknown, e: unknown = null) => {
      data = d;
      error = e;
    },
    status: (s: unknown) => {
      status = s;
    },
  };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("schedule contract", () => {
  it("accepts exact planning, read and cancellation inputs", () => {
    expect(validScheduleInput(input())).toBe(true);
    expect(
      validScheduleInput(
        input({ publicationAction: "withdraw", revision: null, sha: null }),
      ),
    ).toBe(true);
    expect(validScheduleInput({ action: "status", id: "post-1" })).toBe(true);
    expect(
      validScheduleInput({
        action: "cancel",
        id: "post-1",
        schedule: op,
        reason: "Cancelled plan",
      }),
    ).toBe(true);
  });
  it.each([
    { actor },
    { dueAt: "2027-01-15T09:30Z" },
    { expected: 0 },
    { revision: 2147483648 },
    { operation: "00000000-0000-0000-0000-000000000000" },
    { timeZone: "EST" },
    { timeZone: "right/Africa/Nairobi" },
    { reason: " padded " },
    { publicationAction: "withdraw" },
    { sha: "private" },
    { id: "UPPER" },
  ])("refuses extra authority and malformed planning input", (patch) =>
    expect(validScheduleInput(input(patch))).toBe(false),
  );
  it("minimizes records without authorizer, body or secret fields", () => {
    const r = parseScheduleRecord(row(), "post-1");
    expect(r?.dueAt).toBe("2027-01-15T09:30:00.000Z");
    expect(JSON.stringify(r)).not.toMatch(/actor_id|body\"|secret/);
    expect(parseScheduleRecord(row({ actor_id: actor }), "post-1")).toBeNull();
  });
  it.each([
    { item_id: "other" },
    { state: "alien" },
    { state: "failed" },
    { state: "published", outcome_generation: 4 },
    { outcome_generation: 5 },
    { failure_code: "revoked" },
    { due_at: "2027-02-30T09:30:00.000Z" },
    { local_input: "2027-02-30T12:30" },
    { policy_version: -1 },
    { revision_no: null },
    { due_at: "2027-01-15T09:30:01.000Z" },
  ])("refuses inconsistent or noncanonical records", (patch) =>
    expect(parseScheduleRecord(row(patch), "post-1")).toBeNull(),
  );
  it("distinguishes completed withdrawal from completed publication", () => {
    const r = parseScheduleRecord(
      row({
        action: "withdraw",
        revision_no: null,
        body_sha256: null,
        state: "published",
        outcome_generation: 5,
      }),
      "post-1",
    );
    expect(r).not.toBeNull();
    expect(scheduleLabel(r!)).toBe("Withdrawal recorded");
  });
  it("refuses oversized, duplicate or multi-pending status", () => {
    expect(
      parseScheduleStatus(
        { execution_enabled: false, schedules: Array(11).fill(row()) },
        "post-1",
      ),
    ).toBeNull();
    expect(
      parseScheduleStatus(
        { execution_enabled: false, schedules: [row(), row()] },
        "post-1",
      ),
    ).toBeNull();
    expect(
      parseScheduleStatus(
        {
          execution_enabled: false,
          schedules: [
            row(),
            row({ id: "6a2b3c4d-1111-4222-8333-444455556667" }),
          ],
        },
        "post-1",
      ),
    ).toBeNull();
    expect(
      parseScheduleStatus(
        { execution_enabled: false, schedules: [] },
        "post-1",
      ),
    ).toEqual({ executionEnabled: false, schedules: [] });
  });
});
describe("current-user schedule controller", () => {
  it("refuses default-off before Auth or DB work", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    const f = fixture();
    expect(await runPublicationSchedule(f.client, input())).toEqual({
      kind: "denied",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("refuses malformed input before Auth", async () => {
    const f = fixture();
    expect(await runPublicationSchedule(f.client, input({ actor }))).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it.each(["author", "reviewer", "learner"])(
    "refuses %s writes before the mutation RPC",
    async (role) => {
      const f = fixture(role);
      expect(await runPublicationSchedule(f.client, input())).toEqual({
        kind: "denied",
      });
      expect(f.writes).toHaveLength(0);
    },
  );
  it.each(["owner", "editor"])(
    "sends exactly one original-time/UTC-checked plan as %s",
    async (role) => {
      const f = fixture(role);
      expect((await runPublicationSchedule(f.client, input())).kind).toBe(
        "recorded",
      );
      expect(f.writes).toEqual([
        {
          fn: "pipstart_publication_schedule",
          p_operation: op,
          p_expected_generation: 4,
          p_action: "publish",
          p_id: "post-1",
          p_revision: 2,
          p_sha: sha,
          p_local_input: "2027-01-15T12:30",
          p_time_zone: "Africa/Nairobi",
          p_due_at: "2027-01-15T09:30:00.000Z",
          p_reason: "Planned lesson release",
        },
      ]);
    },
  );
  it.each([
    ["2027-11-07T01:30", "America/New_York", "ambiguous"],
    ["2027-03-14T02:30", "America/New_York", "nonexistent"],
    ["2027-02-29T12:30", "UTC", "invalid"],
    ["2027-01-15T12:30", "Unknown/Place", "invalid"],
  ])(
    "refuses invalid or ambiguous wall clocks before a write",
    async (localInput, timeZone, problem) => {
      const f = fixture();
      expect(
        await runPublicationSchedule(f.client, input({ localInput, timeZone })),
      ).toEqual({ kind: "time", problem });
      expect(f.writes).toHaveLength(0);
    },
  );
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["22023", "invalid"],
    ["55000", "state"],
    ["PGRST000", "uncertain"],
  ])(
    "maps known refusal or unconfirmed result without retry",
    async (code, kind) => {
      const f = fixture();
      f.write(null, { code });
      expect(await runPublicationSchedule(f.client, input())).toEqual({ kind });
      expect(f.writes).toHaveLength(1);
    },
  );
  it("maps the hourly action limit (PT429) to limited without retry", async () => {
    const f = fixture();
    f.write(null, { code: "PT429", hint: "retry_after=600" });
    expect(await runPublicationSchedule(f.client, input())).toEqual({
      kind: "limited",
      retryAfter: 600,
    });
    expect(f.writes).toHaveLength(1);
  });
  it.each([
    { id: "6a2b3c4d-1111-4222-8333-444455556667" },
    { body_sha256: "b".repeat(64) },
    { item_id: "other" },
    { base_generation: 5 },
    { local_input: "2027-01-15T12:31" },
  ])("treats a mismatched committed response as uncertain", async (patch) => {
    const f = fixture();
    f.write(row(patch));
    expect(await runPublicationSchedule(f.client, input())).toEqual({
      kind: "uncertain",
    });
    expect(f.writes).toHaveLength(1);
  });
  it("binds cancellation to a scoped item before sending it", async () => {
    const f = fixture();
    f.status({ execution_enabled: false, schedules: [] });
    expect(
      await runPublicationSchedule(f.client, {
        action: "cancel",
        id: "post-1",
        schedule: op,
        reason: "Cancel plan",
      }),
    ).toEqual({ kind: "state" });
    expect(f.writes).toHaveLength(0);
  });
  it("cancels one permitted plan and accepts only a cancelled result", async () => {
    const f = fixture();
    f.write(row({ state: "cancelled" }));
    expect(
      (
        await runPublicationSchedule(f.client, {
          action: "cancel",
          id: "post-1",
          schedule: op,
          reason: "Cancel plan",
        })
      ).kind,
    ).toBe("recorded");
    expect(f.writes).toEqual([
      {
        fn: "pipstart_publication_cancel_schedule",
        p_schedule: op,
        p_reason: "Cancel plan",
      },
    ]);
  });
  it("refuses a wrong-item read without returning partial history", async () => {
    const f = fixture();
    f.status({
      execution_enabled: false,
      schedules: [row({ item_id: "other" })],
    });
    expect(
      await runPublicationSchedule(f.client, {
        action: "status",
        id: "post-1",
      }),
    ).toEqual({ kind: "unavailable" });
  });
  it("retains the eight-second write deadline when the transport ignores abort", async () => {
    vi.useFakeTimers();
    const f = fixture();
    const original = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn, args) =>
      fn === "pipstart_publication_schedule"
        ? {
            abortSignal: vi.fn(
              () => new Promise<{ data: unknown; error: unknown }>(() => {}),
            ),
          }
        : original(fn, args),
    );
    const work = runPublicationSchedule(f.client, input());
    await vi.advanceTimersByTimeAsync(8001);
    expect(await work).toEqual({ kind: "uncertain" });
  });
});
