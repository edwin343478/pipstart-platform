import { describe, expect, it, vi } from "vitest";
import { isQueueClaim, processOptionalEmailJob } from "./queue";
const id = "00000000-0000-4000-8000-000000000001",
  token = "00000000-0000-4000-8000-000000000002";
const job = {
  jobId: id,
  userId: "00000000-0000-4000-8000-000000000003",
  kind: "learning_lesson" as const,
  subject: "Generated",
  html: "<p>Generated</p>",
  text: "Generated",
};
const active = {
  status: "active",
  email: "generated@example.test",
  learning: true,
  partner: true,
  frequency: "all",
};
function setup() {
  return {
    queue: {
      claim: vi.fn().mockResolvedValue({ status: "claimed", token, job }),
      begin: vi.fn().mockResolvedValue(true),
      finish: vi.fn().mockResolvedValue(true),
      release: vi.fn().mockResolvedValue(true),
    },
    store: { load: vi.fn().mockImplementation(async () => ({ ...active })) },
    issuer: { issue: vi.fn().mockResolvedValue(true) },
    transport: {
      deliver: vi.fn().mockResolvedValue({ providerId: "generated-provider" }),
    },
  };
}
describe("dormant durable optional queue consumer", () => {
  it("is disabled by default without claiming or preparing anything", async () => {
    const d = setup();
    expect(await processOptionalEmailJob(id, d)).toEqual({
      status: "disabled",
    });
    expect(d.queue.claim).not.toHaveBeenCalled();
    expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it.each(["queue", "store", "issuer", "transport"] as const)(
    "fails before claim without %s",
    async (key) => {
      const d = setup();
      expect(
        await processOptionalEmailJob(id, { ...d, [key]: null }, true),
      ).toEqual({ status: "unavailable" });
      expect(d.queue.claim).not.toHaveBeenCalled();
    },
  );
  it("rejects malformed job IDs before accessing storage", async () => {
    const d = setup();
    expect((await processOptionalEmailJob("bad", d, true)).status).toBe(
      "unavailable",
    );
    expect(d.queue.claim).not.toHaveBeenCalled();
  });
  it.each(["missing", "terminal", "manual", "busy", "not_due"])(
    "does not hand off a %s claim",
    async (status) => {
      const d = setup();
      d.queue.claim.mockResolvedValue({ status });
      expect(await processOptionalEmailJob(id, d, true)).toEqual({ status });
      expect(d.issuer.issue).not.toHaveBeenCalled();
      expect(d.transport.deliver).not.toHaveBeenCalled();
    },
  );
  it("persists immutable envelope, checks fresh state a third time, uses stable key and checkpoints acceptance", async () => {
    const d = setup();
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "accepted",
    });
    expect(d.queue.begin).toHaveBeenCalledOnce();
    expect(d.store.load).toHaveBeenCalledTimes(3);
    expect(d.transport.deliver).toHaveBeenCalledOnce();
    const [message, key] = d.transport.deliver.mock.calls[0];
    expect(key).toBe(`pipstart-opt-v1-${id}`);
    expect(Object.isFrozen(message)).toBe(true);
    expect(Object.isFrozen(message.headers)).toBe(true);
    expect(d.queue.begin.mock.calls[0][2]).toBe(message);
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "accepted",
      null,
      "generated-provider",
    );
    expect(d.queue.release).not.toHaveBeenCalled();
  });
  it("suppresses a queued opt-out without beginning a send", async () => {
    const d = setup();
    d.store.load.mockResolvedValue({ ...active, learning: false });
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "suppressed",
    });
    expect(d.queue.begin).not.toHaveBeenCalled();
    expect(d.transport.deliver).not.toHaveBeenCalled();
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "suppressed",
      "opted_out",
      null,
    );
  });
  it.each([
    { ...active, learning: false },
    { ...active, frequency: "weekly" },
    { status: "inactive" },
  ])(
    "blocks state changes while persisting prepared payload",
    async (current) => {
      const d = setup();
      d.queue.begin.mockImplementation(async () => {
        d.store.load.mockResolvedValue(current);
        return true;
      });
      expect((await processOptionalEmailJob(id, d, true)).status).toBe(
        "suppressed",
      );
      expect(d.transport.deliver).not.toHaveBeenCalled();
      expect(d.queue.release).not.toHaveBeenCalled();
    },
  );
  it("does not substitute another address into a durable prepared body", async () => {
    const d = setup();
    d.queue.begin.mockImplementation(async () => {
      d.store.load.mockResolvedValue({
        ...active,
        email: "changed@example.test",
      });
      return true;
    });
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "manual",
    });
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "manual",
      "recipient_changed",
      null,
    );
    expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("cannot dispatch after losing its preparation lease", async () => {
    const d = setup();
    d.queue.begin.mockResolvedValue(false);
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "lease_lost",
    });
    expect(d.transport.deliver).not.toHaveBeenCalled();
    expect(d.queue.finish).not.toHaveBeenCalled();
    expect(d.queue.release).not.toHaveBeenCalled();
  });
  it("never sends after a lost send-marker acknowledgement", async () => {
    const d = setup();
    d.queue.begin.mockRejectedValue(new Error("private database detail"));
    expect((await processOptionalEmailJob(id, d, true)).status).toBe("manual");
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "manual",
      "handoff_uncertain",
      null,
    );
    expect(d.transport.deliver).not.toHaveBeenCalled();
    expect(d.queue.release).not.toHaveBeenCalled();
  });
  it("fails closed if the post-persistence eligibility read fails", async () => {
    const d = setup();
    d.queue.begin.mockImplementation(async () => {
      d.store.load.mockRejectedValue(new Error("private"));
      return true;
    });
    expect((await processOptionalEmailJob(id, d, true)).status).toBe("manual");
    expect(d.transport.deliver).not.toHaveBeenCalled();
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "manual",
      "eligibility_unavailable",
      null,
    );
  });
  it("only releases/retries before any durable send marker", async () => {
    const d = setup();
    d.issuer.issue.mockResolvedValue(false);
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "retry_later",
    });
    expect(d.queue.release).toHaveBeenCalledWith(id, token);
    expect(d.queue.begin).not.toHaveBeenCalled();
    expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("does not retry uncertain provider outcomes", async () => {
    const d = setup();
    d.transport.deliver.mockRejectedValue(new Error("provider private body"));
    expect((await processOptionalEmailJob(id, d, true)).status).toBe("manual");
    expect(d.transport.deliver).toHaveBeenCalledOnce();
    expect(d.queue.release).not.toHaveBeenCalled();
    expect(d.queue.finish).toHaveBeenCalledWith(
      id,
      token,
      "manual",
      "provider_uncertain",
      null,
    );
  });
  it("lost acceptance checkpoint cannot lead to automatic redelivery", async () => {
    const d = setup();
    d.queue.finish.mockRejectedValue(new Error("acknowledgement lost"));
    expect((await processOptionalEmailJob(id, d, true)).status).toBe(
      "checkpoint_pending",
    );
    d.queue.claim.mockResolvedValue({ status: "manual" });
    expect((await processOptionalEmailJob(id, d, true)).status).toBe("manual");
    expect(d.transport.deliver).toHaveBeenCalledOnce();
    expect(d.queue.release).not.toHaveBeenCalled();
  });
  it.each([
    null,
    {},
    { status: "claimed", token: "bad", job },
    { status: "claimed", token, job: { ...job, to: "cached@example.test" } },
  ])("rejects malformed claims", async (claim) => {
    expect(isQueueClaim(claim)).toBe(false);
    const d = setup();
    d.queue.claim.mockResolvedValue(claim);
    expect((await processOptionalEmailJob(id, d, true)).status).toBe(
      "unavailable",
    );
    expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("rejects a job/claim ID mismatch", async () => {
    const d = setup();
    d.queue.claim.mockResolvedValue({
      status: "claimed",
      token,
      job: { ...job, jobId: token },
    });
    expect((await processOptionalEmailJob(id, d, true)).status).toBe(
      "unavailable",
    );
    expect(d.transport.deliver).not.toHaveBeenCalled();
  });
});
