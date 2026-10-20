import { describe, expect, it, vi } from "vitest";
import { dispatchOptionalEmail, isDispatchState, type DispatchState, type OptionalEmailJob } from "./dispatch";

const job: OptionalEmailJob = { jobId: "generated-job-1", userId: "00000000-0000-4000-8000-000000000001", kind: "learning_lesson", subject: "Lesson", html: "<p>Lesson</p>", text: "Lesson" };
const active = { status: "active", email: "learner@example.test", learning: true, partner: true, frequency: "all" } as const;
function setup(first: DispatchState = active, last: DispatchState = first) {
  return { store: { load: vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(last) }, issuer: { issue: vi.fn().mockResolvedValue(true) }, transport: { deliver: vi.fn().mockResolvedValue({ providerId: "generated-provider-id" }) } };
}
describe("mandatory fresh optional-email dispatch boundary", () => {
  it.each(["learning_lesson", "learning_weekly", "partner_offer"] as const)("checks twice and invokes transport with current recipient/unsubscribe envelope for %s", async kind => {
    const state: DispatchState = { ...active, frequency: kind === "learning_weekly" ? "weekly" : "all" };
    const d = setup(state);
    expect(await dispatchOptionalEmail({ ...job, kind }, d)).toEqual({ status: "accepted", providerId: "generated-provider-id" });
    expect(d.store.load).toHaveBeenCalledTimes(2); expect(d.transport.deliver).toHaveBeenCalledOnce();
    expect(d.store.load).toHaveBeenNthCalledWith(2, job.userId);
    const message = d.transport.deliver.mock.calls[0][0];
    expect(message.to).toBe(active.email); expect(message.jobId).toBe(job.jobId);
    expect(message.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(message.headers["List-Unsubscribe"]).toMatch(/^<https:\/\/pipstart.net\/unsubscribe\?token=[a-f0-9]{64}>$/);
    expect(message.html).toContain("Unsubscribe from all optional emails"); expect(message.text).toContain("Unsubscribe from all optional emails");
    expect(d.issuer.issue).toHaveBeenNthCalledWith(1, job.userId, kind === "partner_offer" ? "partner" : "learning", expect.any(String));
  });
  it.each(["first", "final"])("suppresses OFF at the %s read, not a queue-time ON snapshot", async phase => {
    const off: DispatchState = { ...active, learning: false };
    const d = setup(phase === "first" ? off : active, off);
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "suppressed", reason: "opted_out" });
    expect(d.transport.deliver).not.toHaveBeenCalled();
    if (phase === "first") expect(d.issuer.issue).not.toHaveBeenCalled();
  });
  it.each(["learning_lesson", "learning_weekly", "partner_offer"] as const)("uses the correct current opt-out for %s", async kind => {
    const state: DispatchState = { ...active, learning: kind === "partner_offer", partner: kind !== "partner_offer", frequency: kind === "learning_weekly" ? "weekly" : "all" };
    const d = setup(state);
    expect(await dispatchOptionalEmail({ ...job, kind }, d)).toEqual({ status: "suppressed", reason: "opted_out" }); expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("does not confuse learning OFF with partner OFF", async () => {
    const d = setup({ ...active, learning: false, frequency: "weekly" });
    expect((await dispatchOptionalEmail({ ...job, kind: "partner_offer" }, d)).status).toBe("accepted");
  });
  it.each(["learning_lesson", "learning_weekly"] as const)("suppresses stale %s jobs when cadence changes during preparation", async kind => {
    const first: DispatchState = { ...active, frequency: kind === "learning_weekly" ? "weekly" : "all" };
    const d = setup(first, { ...active, frequency: kind === "learning_weekly" ? "all" : "weekly" });
    expect(await dispatchOptionalEmail({ ...job, kind }, d)).toEqual({ status: "suppressed", reason: "frequency_changed" });expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it.each(["first", "final"])("denies inactive/deleted/unconfirmed/banned accounts at %s read", async phase => {
    const d = setup(phase === "first" ? { status: "inactive" } : active, { status: "inactive" });
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "suppressed", reason: "account_inactive" });expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("uses the latest confirmed email rather than the preparation-time address", async () => {
    const d = setup(active, { ...active, email: "changed@example.test" });
    await dispatchOptionalEmail(job, d);expect(d.transport.deliver.mock.calls[0][0].to).toBe("changed@example.test");
  });
  it.each([0, 1])("fails closed if eligibility read %s throws", async at => {
    const d = setup(); if (at === 0) d.store.load.mockReset(); else d.store.load.mockReset().mockResolvedValueOnce(active);
    d.store.load.mockRejectedValueOnce(new Error("private database details"));
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "unavailable", reason: "eligibility" });expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it.each([null, {}, { ...active, learning: "true" }, { ...active, frequency: "daily" }, { ...active, email: "bad\r\n@example.test" }, { status: "inactive", email: active.email }])("rejects malformed current state", async state => {
    expect(isDispatchState(state)).toBe(false);const d = setup();d.store.load.mockReset().mockResolvedValue(state);
    expect((await dispatchOptionalEmail(job, d)).status).toBe("unavailable");expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it.each(["store", "issuer", "transport"] as const)("does not dispatch without %s", async key => {
    const d = setup();expect(await dispatchOptionalEmail(job, { ...d, [key]: null })).toEqual({ status: "unavailable", reason: "dependencies" });expect(d.issuer.issue).not.toHaveBeenCalled();expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it.each(["false", "throw"])("does not dispatch if unsubscribe preparation returns %s", async mode => {
    const d = setup();if (mode === "false") d.issuer.issue.mockResolvedValue(false);else d.issuer.issue.mockRejectedValue(new Error("private capability"));
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "unavailable", reason: "preparation" });expect(d.transport.deliver).not.toHaveBeenCalled();expect(d.store.load).toHaveBeenCalledOnce();
  });
  it.each([{ ...job, to: "cached@example.test" }, { ...job, learning: true }, { ...job, kind: "security" }, { ...job, userId: "bad" }, { ...job, subject: "\r\nBcc: wrong" }, { ...job, html: "" }, { ...job, jobId: "bad/id" }])("rejects cached/invalid or security jobs", async value => {
    const d = setup();expect(await dispatchOptionalEmail(value as OptionalEmailJob, d)).toEqual({ status: "unavailable", reason: "invalid_job" });expect(d.store.load).not.toHaveBeenCalled();expect(d.transport.deliver).not.toHaveBeenCalled();
  });
  it("captures job identity/content before the first asynchronous read", async () => {
    const d = setup();const mutable = { ...job };
    d.store.load.mockImplementationOnce(async () => { mutable.userId = "00000000-0000-4000-8000-000000000002";mutable.kind = "partner_offer";mutable.subject = "mutated";return active; });
    await dispatchOptionalEmail(mutable, d);
    expect(d.store.load).toHaveBeenNthCalledWith(2, job.userId);expect(d.transport.deliver.mock.calls[0][0].subject).toBe(job.subject);expect(d.issuer.issue.mock.calls[0][1]).toBe("learning");
  });
  it("does not retry or report success when transport outcome is uncertain", async () => {
    const d = setup();d.transport.deliver.mockRejectedValue(new Error("private provider body"));
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "uncertain" });expect(d.transport.deliver).toHaveBeenCalledOnce();
  });
  it.each([null, {}, { providerId: "" }, { providerId: "private\nbody" }])("treats malformed provider acknowledgement as uncertain", async value => {
    const d = setup();d.transport.deliver.mockResolvedValue(value);
    expect(await dispatchOptionalEmail(job, d)).toEqual({ status: "uncertain" });expect(d.transport.deliver).toHaveBeenCalledOnce();
  });
});
