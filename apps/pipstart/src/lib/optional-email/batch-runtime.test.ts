import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const factories = vi.hoisted(() => ({ worker: vi.fn(), queue: vi.fn(), store: vi.fn(), issuer: vi.fn(), receipts: vi.fn() }));
vi.mock("./worker-store", () => ({ createOptionalWorkerStore: factories.worker }));
vi.mock("./queue-store", () => ({ createOptionalEmailQueue: factories.queue }));
vi.mock("./store", () => ({ createOptionalEmailDispatchStore: factories.store }));
vi.mock("./delivery-evidence-store", () => ({ createOptionalProviderEvidenceStore: factories.receipts }));
vi.mock("../email-unsubscribe/delivery", async original => ({
  ...await original<typeof import("../email-unsubscribe/delivery")>(), createUnsubscribeTokenIssuer: factories.issuer,
}));
import { runConfiguredOptionalEmailBatch } from "./batch-runtime";
import type { DispatchState } from "./dispatch";
const id = (n: number) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const apiKey = "re_generated_fixture_key";
const state: DispatchState = { status: "active", email: "generated@example.test", learning: true, partner: true, frequency: "all" };
const admission = { acquire: vi.fn(), finish: vi.fn() };
const queue = { claim: vi.fn(), begin: vi.fn(), finish: vi.fn(), release: vi.fn() };
const store = { load: vi.fn() }, issuer = { issue: vi.fn() }, receipts = { acknowledge: vi.fn() };
const send = vi.fn();
beforeEach(() => {
  vi.resetAllMocks(); vi.stubGlobal("fetch", send);
  factories.worker.mockReturnValue(admission); factories.queue.mockReturnValue(queue);
  factories.store.mockReturnValue(store); factories.issuer.mockReturnValue(issuer); factories.receipts.mockReturnValue(receipts);
  admission.acquire.mockResolvedValue({ status: "acquired", token: id(90), jobIds: [id(1)] }); admission.finish.mockResolvedValue(true);
  queue.claim.mockImplementation(async (jobId: string) => ({ status: "claimed", token: id(80), job: { jobId, userId: id(70), kind: "learning_lesson", subject: "Generated", html: "Generated", text: "Generated" } }));
  queue.begin.mockResolvedValue(true); queue.finish.mockResolvedValue(true); queue.release.mockResolvedValue(true);
  store.load.mockResolvedValue(state); issuer.issue.mockResolvedValue(true); receipts.acknowledge.mockResolvedValue(undefined);
  send.mockImplementation(async () => Response.json({ id: id(60) }));
});
afterEach(() => vi.unstubAllGlobals());
describe("real worker/queue/dispatch/transport composition with fake stores and fetch", () => {
  it("is disabled by default before constructing stores", async () => {
    expect(await runConfiguredOptionalEmailBatch()).toEqual({ status: "disabled", processed: 0 });
    for (const factory of Object.values(factories)) expect(factory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects missing provider configuration before stores", async () => {
    expect((await runConfiguredOptionalEmailBatch("", true)).status).toBe("unavailable");
    expect(factories.receipts).not.toHaveBeenCalled(); expect(admission.acquire).not.toHaveBeenCalled();
  });
  it.each(["worker", "queue", "store", "issuer", "receipts"] as const)("requires %s before admission", async key => {
    factories[key].mockReturnValue(null);
    expect((await runConfiguredOptionalEmailBatch(apiKey, true)).status).toBe("unavailable");
    expect(admission.acquire).not.toHaveBeenCalled(); expect(send).not.toHaveBeenCalled();
  });
  it("uses the real ordered send/checkpoint path, headers and idempotency", async () => {
    expect(await runConfiguredOptionalEmailBatch(apiKey, true)).toEqual({ status: "completed", processed: 1 });
    expect(store.load).toHaveBeenCalledTimes(3); expect(issuer.issue).toHaveBeenCalledTimes(2);
    expect(queue.begin).toHaveBeenCalledTimes(1); expect(send).toHaveBeenCalledTimes(1);
    const [url, options] = send.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers["Authorization"]).toBe("Bearer " + apiKey);
    expect(options.headers["Idempotency-Key"]).toBe("pipstart-opt-v1-" + id(1));
    const message = JSON.parse(options.body);
    expect(message.to).toEqual(["generated@example.test"]); expect(message.tags[0]).toEqual({ name: "pipstart_job_id", value: id(1) });
    expect(message.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(message.headers["List-Unsubscribe"]).toMatch(/^<https:\/\/pipstart\.net\/unsubscribe\?token=[a-f0-9]{64}>$/);
    expect(receipts.acknowledge).toHaveBeenCalledExactlyOnceWith(id(1), id(60), expect.stringMatching(/^[a-f0-9]{64}$/));
    expect(queue.finish).toHaveBeenCalledExactlyOnceWith(id(1), id(80), "accepted", null, id(60));
    expect(admission.finish).toHaveBeenCalledExactlyOnceWith(id(90));
    expect(queue.begin.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0]);
    expect(receipts.acknowledge.mock.invocationCallOrder[0]).toBeLessThan(queue.finish.mock.invocationCallOrder[0]);
  });
  it("suppresses a last-moment opt-out without provider handoff", async () => {
    store.load.mockResolvedValueOnce(state).mockResolvedValueOnce(state).mockResolvedValueOnce({ ...state, learning: false });
    expect((await runConfiguredOptionalEmailBatch(apiKey, true)).status).toBe("completed");
    expect(send).not.toHaveBeenCalled(); expect(queue.finish).toHaveBeenCalledWith(id(1), id(80), "suppressed", "opted_out", null);
  });
  it("retains admission after cadence/lease denial with zero sends", async () => {
    queue.begin.mockResolvedValue(false);
    expect((await runConfiguredOptionalEmailBatch(apiKey, true)).status).toBe("review_required");
    expect(send).not.toHaveBeenCalled(); expect(admission.finish).not.toHaveBeenCalled();
  });
  it.each(["provider", "receipt", "checkpoint"])("never retries/unlocks after uncertain %s outcome", async stage => {
    if (stage === "provider") send.mockRejectedValue(new Error("generated provider fault"));
    if (stage === "receipt") receipts.acknowledge.mockRejectedValue(new Error("generated receipt fault"));
    if (stage === "checkpoint") queue.finish.mockResolvedValue(false);
    const result = await runConfiguredOptionalEmailBatch(apiKey, true);
    expect(result.status).toBe("review_required"); expect(send).toHaveBeenCalledTimes(1); expect(admission.finish).not.toHaveBeenCalled();
    if (stage !== "checkpoint") expect(queue.finish).toHaveBeenCalledWith(id(1), id(80), "manual", "provider_uncertain", null);
  });
  it("does not call claim/provider for busy admission", async () => {
    admission.acquire.mockResolvedValue({ status: "busy" });
    expect(await runConfiguredOptionalEmailBatch(apiKey, true)).toEqual({ status: "busy", processed: 0 });
    expect(queue.claim).not.toHaveBeenCalled(); expect(send).not.toHaveBeenCalled();
  });
  it("processes only a fixed batch of five, without refill or parallel sends", async () => {
    admission.acquire.mockResolvedValue({ status: "acquired", token: id(90), jobIds: [1, 2, 3, 4, 5].map(id) });
    let active = 0;
    send.mockImplementation(async () => { expect(++active).toBe(1); await Promise.resolve(); active--; return Response.json({ id: id(60) }); });
    expect(await runConfiguredOptionalEmailBatch(apiKey, true)).toEqual({ status: "completed", processed: 5 });
    expect(send).toHaveBeenCalledTimes(5); expect(admission.acquire).toHaveBeenCalledTimes(1); expect(queue.claim.mock.calls.map(c => c[0])).toEqual([1, 2, 3, 4, 5].map(id));
  });
});
