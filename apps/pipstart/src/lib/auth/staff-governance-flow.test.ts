import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), verify: vi.fn() }));
vi.mock("./staff-role-flow", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./staff-role-flow")>()),
  readLiveStaffAccess: mocks.access,
}));
vi.mock("./staff-mfa-flow", () => ({ verifyStaffFactor: mocks.verify }));
import {
  completeGovernanceIntent,
  prepareGovernanceIntent,
  readLiveStaffGovernance,
  validGovernanceCommand,
  mayChangeGovernance,
  type GovernanceCommand,
} from "./staff-governance-flow";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
  target = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c",
  factor = "55555555-5555-4555-8555-555555555555";
const access = {
  authorized: true as const,
  user_id: actor,
  roles: ["owner" as const],
  capabilities: ["staff.enter" as const, "roles.manage" as const],
};
const command: GovernanceCommand = {
  target,
  operation: "assign",
  value: "",
  resourceKind: "lesson",
  resourceId: "forex/lesson-1",
  reason: "access_change",
};
function client() {
  const rpc = vi.fn((name: string, args: Record<string, unknown>) => ({
    abortSignal: vi.fn().mockResolvedValue({
      error: null,
      data:
        name === "pipstart_staff_governance"
          ? {
              target_id: target,
              staff_active: true,
              staff_roles: ["administrator"],
              delegations: [],
              assignments: [],
              next_after: null,
            }
          : name === "pipstart_staff_receipt"
            ? { status: "issued", expires_at: "2026-10-27T23:00:00Z" }
            : { status: "changed", request_id: args.p_request },
    }),
  }));
  return { rpc, client: { rpc } as unknown as SupabaseClient };
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.access.mockResolvedValue({ kind: "authorized", access });
  mocks.verify.mockResolvedValue({ kind: "verified" });
});
describe("Owner governance exact-command controller", () => {
  it("copies scope before asynchronous verification so caller edits cannot retarget it", async () => {
    const c = client(),
      mutable = { ...command };
    const pending = prepareGovernanceIntent(
      c.client,
      actor,
      mutable,
      factor,
      "012345",
    );
    mutable.resourceId = "retargeted";
    expect((await pending).kind).toBe("ready");
    expect(c.rpc).toHaveBeenCalledWith(
      "pipstart_staff_receipt",
      expect.objectContaining({ p_id: "forex/lesson-1" }),
    );
  });
  it("does not issue proof after an uncertain provider verification", async () => {
    const c = client();
    mocks.verify.mockResolvedValue({ kind: "unknown" });
    expect(
      (
        await prepareGovernanceIntent(
          c.client,
          actor,
          command,
          factor,
          "012345",
        )
      ).kind,
    ).toBe("unknown");
    expect(
      c.rpc.mock.calls.some(
        ([name]) =>
          name === "pipstart_staff_receipt" || name === "pipstart_staff_change",
      ),
    ).toBe(false);
  });
  it("reconciles an uncertain send through the same exact scope/reference without a token", async () => {
    const c = client(),
      ready = await prepareGovernanceIntent(
        c.client,
        actor,
        command,
        factor,
        "012345",
      );
    if (ready.kind !== "ready") throw Error("fixture");
    c.rpc.mockImplementation(() => ({
      abortSignal: vi.fn().mockRejectedValue(Error("transport")),
    }));
    expect((await completeGovernanceIntent(c.client, ready.intent)).kind).toBe(
      "unknown",
    );
    c.rpc.mockImplementation((_name, args) => ({
      abortSignal: vi.fn().mockResolvedValue({
        error: null,
        data: { status: "already_recorded", request_id: args.p_request },
      }),
    }));
    expect(
      await completeGovernanceIntent(c.client, ready.intent, true),
    ).toMatchObject({
      kind: "complete",
      status: "already_recorded",
      request: ready.intent.request,
    });
    expect(c.rpc).toHaveBeenLastCalledWith(
      "pipstart_staff_change",
      expect.objectContaining({
        p_token: "",
        p_request: ready.intent.request,
        p_kind: "lesson",
        p_id: "forex/lesson-1",
      }),
    );
  });
  it("stops a prepared command before sending when Owner access is revoked", async () => {
    const c = client(),
      ready = await prepareGovernanceIntent(
        c.client,
        actor,
        command,
        factor,
        "012345",
      );
    if (ready.kind !== "ready") throw Error("fixture");
    mocks.access.mockResolvedValue({ kind: "denied" });
    expect((await completeGovernanceIntent(c.client, ready.intent)).kind).toBe(
      "denied",
    );
    expect(
      c.rpc.mock.calls.some(([name]) => name === "pipstart_staff_change"),
    ).toBe(false);
  });
  it.each(["assign", "unassign"] as const)(
    "binds %s resource kind/id to proof and mutation",
    async (operation) => {
      const c = client(),
        prepared = await prepareGovernanceIntent(
          c.client,
          actor,
          { ...command, operation },
          factor,
          "012345",
        );
      expect(prepared.kind).toBe("ready");
      if (prepared.kind !== "ready") return;
      expect(c.rpc).toHaveBeenCalledWith(
        "pipstart_staff_receipt",
        expect.objectContaining({
          p_target: target,
          p_operation: operation,
          p_kind: "lesson",
          p_id: "forex/lesson-1",
          p_value: "",
        }),
      );
      expect(
        c.rpc.mock.calls.filter(([name]) => name === "pipstart_staff_change"),
      ).toHaveLength(0);
      expect(Object.isFrozen(prepared.intent.command)).toBe(true);
      expect(
        (await completeGovernanceIntent(c.client, prepared.intent)).kind,
      ).toBe("complete");
      expect(c.rpc).toHaveBeenCalledWith(
        "pipstart_staff_change",
        expect.objectContaining({
          p_kind: "lesson",
          p_id: "forex/lesson-1",
          p_request: prepared.intent.request,
          p_reason: "access_change",
        }),
      );
    },
  );
  it.each(["grant_delegation", "revoke_delegation"] as const)(
    "binds fixed %s without assignment scope",
    async (operation) => {
      const c = client();
      expect(
        (
          await prepareGovernanceIntent(
            c.client,
            actor,
            {
              ...command,
              operation,
              value: "audit.read",
              resourceKind: "",
              resourceId: "",
            },
            factor,
            "012345",
          )
        ).kind,
      ).toBe("ready");
      expect(c.rpc).toHaveBeenCalledWith(
        "pipstart_staff_receipt",
        expect.objectContaining({
          p_operation: operation,
          p_value: "audit.read",
          p_kind: "",
          p_id: "",
        }),
      );
    },
  );
  it.each([
    { resourceId: "Uppercase" },
    { resourceId: "x".repeat(201) },
    { resourceKind: "unknown" },
    { operation: "suspend" },
    {
      operation: "grant_delegation",
      value: "roles.manage",
      resourceKind: "",
      resourceId: "",
    },
    { extra: "actor" },
  ])("rejects malformed or widened commands %#", async (patch) => {
    const c = client();
    expect(
      (
        await prepareGovernanceIntent(
          c.client,
          actor,
          { ...command, ...patch } as GovernanceCommand,
          factor,
          "012345",
        )
      ).kind,
    ).toBe("invalid");
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(c.rpc).not.toHaveBeenCalled();
  });
  it("does not treat delegated roles.delegate as governance authority", async () => {
    const c = client();
    mocks.access.mockResolvedValue({
      kind: "authorized",
      access: { ...access, capabilities: ["staff.enter", "roles.delegate"] },
    });
    expect(
      (
        await prepareGovernanceIntent(
          c.client,
          actor,
          command,
          factor,
          "012345",
        )
      ).kind,
    ).toBe("denied");
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(c.rpc).not.toHaveBeenCalled();
  });
  it("rejects self-delegation grants and mismatched target DTOs", async () => {
    expect(
      mayChangeGovernance(access, {
        ...command,
        target: actor,
        operation: "grant_delegation",
        value: "audit.read",
        resourceKind: "",
        resourceId: "",
      }),
    ).toBe(false);
    const c = client();
    expect((await readLiveStaffGovernance(c.client, actor, actor)).kind).toBe(
      "unavailable",
    );
  });
  it("checks the target is Administrator before preparing a delegation", async () => {
    const c = client();
    c.rpc.mockImplementation(() => ({
      abortSignal: vi.fn().mockResolvedValue({
        error: null,
        data: {
          target_id: target,
          staff_active: true,
          staff_roles: ["author"],
          delegations: [],
          assignments: [],
          next_after: null,
        },
      }),
    }));
    expect(
      (
        await prepareGovernanceIntent(
          c.client,
          actor,
          {
            ...command,
            operation: "grant_delegation",
            value: "audit.read",
            resourceKind: "",
            resourceId: "",
          },
          factor,
          "012345",
        )
      ).kind,
    ).toBe("denied");
    expect(mocks.verify).not.toHaveBeenCalled();
  });
  it("rechecks authority after MFA and before completion", async () => {
    const c = client();
    mocks.access
      .mockResolvedValueOnce({ kind: "authorized", access })
      .mockResolvedValueOnce({ kind: "authorized", access })
      .mockResolvedValue({ kind: "denied" });
    expect(
      (
        await prepareGovernanceIntent(
          c.client,
          actor,
          command,
          factor,
          "012345",
        )
      ).kind,
    ).toBe("denied");
    expect(
      c.rpc.mock.calls.some(([name]) => name === "pipstart_staff_receipt"),
    ).toBe(false);
  });
  it("reconciliation sends the same reference and an empty token, and never accepts a new mutation result", async () => {
    const c = client(),
      ready = await prepareGovernanceIntent(
        c.client,
        actor,
        command,
        factor,
        "012345",
      );
    if (ready.kind !== "ready") throw Error("fixture");
    expect(
      (await completeGovernanceIntent(c.client, ready.intent, true)).kind,
    ).toBe("unknown");
    expect(c.rpc).toHaveBeenLastCalledWith(
      "pipstart_staff_change",
      expect.objectContaining({ p_token: "", p_request: ready.intent.request }),
    );
  });
  it("does not trust a client-supplied scope, reason or extra actor field", () => {
    expect(
      validGovernanceCommand({ ...command, actor } as GovernanceCommand),
    ).toBe(false);
    expect(
      validGovernanceCommand({
        ...command,
        reason: "free-text",
      } as unknown as GovernanceCommand),
    ).toBe(false);
  });
});
