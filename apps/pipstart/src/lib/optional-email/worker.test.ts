import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ process: vi.fn() }));
vi.mock("./queue", () => ({ processOptionalEmailJob: mocks.process }));
import { isWorkerAdmission, runOptionalEmailWorker } from "./worker";
import type { OptionalWorkerStore } from "./worker";
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const deps = { queue: {}, store: {}, issuer: {}, transport: {} } as Parameters<
  typeof runOptionalEmailWorker
>[1];
let store: OptionalWorkerStore;
beforeEach(() => {
  vi.resetAllMocks();
  store = {
    acquire: vi.fn().mockResolvedValue({
      status: "acquired",
      token: id(90),
      jobIds: [id(1)],
    }),
    finish: vi.fn().mockResolvedValue(true),
  };
  mocks.process.mockResolvedValue({ status: "accepted" });
});
describe("dormant bounded worker", () => {
  it("does nothing by default", async () => {
    expect(await runOptionalEmailWorker(store, deps)).toEqual({
      status: "disabled",
      processed: 0,
    });
    expect(store.acquire).not.toHaveBeenCalled();
    expect(mocks.process).not.toHaveBeenCalled();
  });
  it("requires all dependencies before acquiring admission", async () => {
    for (const key of ["queue", "store", "issuer", "transport"] as const)
      expect(
        (await runOptionalEmailWorker(store, { ...deps, [key]: null }, true))
          .status,
      ).toBe("unavailable");
    expect(store.acquire).not.toHaveBeenCalled();
  });
  it.each(["busy", "empty"])("does no work when %s", async (status) => {
    vi.mocked(store.acquire).mockResolvedValue({ status } as never);
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      status,
    );
    expect(mocks.process).not.toHaveBeenCalled();
    expect(store.finish).not.toHaveBeenCalled();
  });
  it("handles five jobs sequentially and finishes only after all settle", async () => {
    vi.mocked(store.acquire).mockResolvedValue({
      status: "acquired",
      token: id(90),
      jobIds: [1, 2, 3, 4, 5].map(id),
    });
    let active = 0;
    mocks.process.mockImplementation(async () => {
      expect(++active).toBe(1);
      await Promise.resolve();
      active--;
      return { status: "accepted" };
    });
    expect(await runOptionalEmailWorker(store, deps, true)).toEqual({
      status: "completed",
      processed: 5,
    });
    expect(mocks.process).toHaveBeenCalledTimes(5);
    expect(store.finish).toHaveBeenCalledExactlyOnceWith(id(90));
  });
  it.each([
    "manual",
    "checkpoint_pending",
    "lease_lost",
    "busy",
    "unavailable",
    "disabled",
    "unknown",
  ])("retains admission and stops on %s", async (status) => {
    vi.mocked(store.acquire).mockResolvedValue({
      status: "acquired",
      token: id(90),
      jobIds: [id(1), id(2)],
    });
    mocks.process.mockResolvedValue({ status });
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      "review_required",
    );
    expect(mocks.process).toHaveBeenCalledTimes(1);
    expect(store.finish).not.toHaveBeenCalled();
  });
  it.each([
    "suppressed",
    "missing",
    "terminal",
    "not_due",
    "retry_later",
    "cadence_deferred",
  ])("finishes known non-uncertain %s outcomes", async (status) => {
    mocks.process.mockResolvedValue({ status });
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      "completed",
    );
  });
  it("continues to a different job after safe deferral, without retrying the deferred job", async () => {
    vi.mocked(store.acquire).mockResolvedValue({
      status: "acquired",
      token: id(90),
      jobIds: [id(1), id(2)],
    });
    mocks.process
      .mockResolvedValueOnce({ status: "cadence_deferred" })
      .mockResolvedValueOnce({ status: "accepted" });
    expect(await runOptionalEmailWorker(store, deps, true)).toEqual({
      status: "completed",
      processed: 2,
    });
    expect(mocks.process.mock.calls.map((call) => call[0])).toEqual([
      id(1),
      id(2),
    ]);
    expect(store.finish).toHaveBeenCalledExactlyOnceWith(id(90));
  });
  it("does not finish admission if a safe deferral is followed by an uncertain job", async () => {
    vi.mocked(store.acquire).mockResolvedValue({
      status: "acquired",
      token: id(90),
      jobIds: [id(1), id(2)],
    });
    mocks.process
      .mockResolvedValueOnce({ status: "cadence_deferred" })
      .mockResolvedValueOnce({ status: "manual" });
    expect(await runOptionalEmailWorker(store, deps, true)).toEqual({
      status: "review_required",
      processed: 2,
    });
    expect(store.finish).not.toHaveBeenCalled();
  });
  it("never unlocks in a finally after an exception", async () => {
    mocks.process.mockRejectedValue(new Error("private detail"));
    expect(await runOptionalEmailWorker(store, deps, true)).toEqual({
      status: "review_required",
      processed: 0,
    });
    expect(store.finish).not.toHaveBeenCalled();
  });
  it("treats lost admission/finish acknowledgements as review, without retry", async () => {
    vi.mocked(store.acquire).mockRejectedValueOnce(new Error());
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      "review_required",
    );
    vi.mocked(store.finish).mockRejectedValueOnce(new Error());
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      "review_required",
    );
    expect(store.acquire).toHaveBeenCalledTimes(2);
    expect(store.finish).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    {},
    { status: "busy", token: id(1) },
    { status: "acquired", token: id(90), jobIds: [] },
    { status: "acquired", token: id(90), jobIds: [1, 2, 3, 4, 5, 6].map(id) },
    { status: "acquired", token: id(90), jobIds: [id(1), id(1)] },
    { status: "acquired", token: "bad", jobIds: [id(1)] },
    { status: "acquired", token: id(90), jobIds: ["bad"] },
  ])("rejects malformed admission without processing", async (value) => {
    expect(isWorkerAdmission(value)).toBe(false);
    vi.mocked(store.acquire).mockResolvedValue(value as never);
    expect((await runOptionalEmailWorker(store, deps, true)).status).toBe(
      "review_required",
    );
    expect(mocks.process).not.toHaveBeenCalled();
    expect(store.finish).not.toHaveBeenCalled();
  });
});
