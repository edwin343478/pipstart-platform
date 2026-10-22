import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleOptionalEmailBatch } from "./batch-endpoint";
const secret = "a".repeat(64), apiKey = "re_generated_fixture_key";
const configuration = { secret, apiKey, enabled: "true" };
const run = vi.fn().mockResolvedValue({ status: "completed", processed: 1 });
function request(options: RequestInit = {}, suffix = "") {
  return new Request("https://pipstart.net/api/internal/optional-email/run" + suffix, {
    method: "POST", ...options, headers: { authorization: "Bearer " + secret, ...options.headers },
  });
}
beforeEach(() => { run.mockReset(); run.mockResolvedValue({ status: "completed", processed: 1 }); });
describe("machine-only optional batch boundary", () => {
  it.each(["GET", "PUT", "DELETE"])("rejects %s without execution", async method => {
    const result = await handleOptionalEmailBatch(request({ method }), configuration, run);
    expect(result.status).toBe(405); expect(result.headers.get("allow")).toBe("POST"); expect(run).not.toHaveBeenCalled();
  });
  it.each([undefined, "", "a".repeat(63), "a".repeat(64) + " ", "a".repeat(64) + "\n", "A".repeat(64)])("fails closed on invalid configured secret", async value => {
    expect((await handleOptionalEmailBatch(request(), { ...configuration, secret: value }, run)).status).toBe(503);
    expect(run).not.toHaveBeenCalled();
  });
  it.each(["", "Bearer " + "b".repeat(64), "Basic " + secret, "bearer " + secret, "Bearer " + secret + ", Bearer " + secret, "Bearer " + "a".repeat(63)])("denies invalid bearer credentials", async value => {
    const result = await handleOptionalEmailBatch(request({ headers: { authorization: value, cookie: "admin=true" } }), configuration, run);
    expect(result.status).toBe(401); expect(run).not.toHaveBeenCalled();
    expect(await result.text()).not.toContain(secret);
  });
  it.each([undefined, "", "false", "TRUE", "1", " true "])("is disabled unless flag is exactly true", async enabled => {
    const result = await handleOptionalEmailBatch(request(), { ...configuration, enabled }, run);
    expect(result.status).toBe(503); expect(await result.json()).toEqual({ status: "disabled", processed: 0 }); expect(run).not.toHaveBeenCalled();
  });
  it.each([undefined, "", "not-a-key", apiKey + " ", apiKey + "\n"])("requires a dedicated well-formed provider key", async value => {
    expect((await handleOptionalEmailBatch(request(), { ...configuration, apiKey: value }, run)).status).toBe(503); expect(run).not.toHaveBeenCalled();
  });
  it.each([
    [{}, "?jobId=arbitrary"], [{}, "?enabled=true"], [{}, "#fragment"],
    [{ body: "{}" }, ""], [{ body: "" }, ""],
    [{ headers: { origin: "https://pipstart.net" } }, ""],
    [{ headers: { origin: "https://other.example" } }, ""],
    [{ headers: { "content-type": "application/json" } }, ""],
    [{ headers: { "content-length": "1" } }, ""],
    [{ headers: { "transfer-encoding": "chunked" } }, ""],
  ] as [RequestInit, string][])("rejects content/recipient/browser inputs before runtime", async (options, suffix) => {
    expect((await handleOptionalEmailBatch(request(options, suffix), configuration, run)).status).toBe(400); expect(run).not.toHaveBeenCalled();
  });
  it("calls exactly once after all gates and returns only aggregate state", async () => {
    const result = await handleOptionalEmailBatch(request({ headers: { "content-length": "0" } }), configuration, run);
    expect(run).toHaveBeenCalledExactlyOnceWith(apiKey); expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ status: "completed", processed: 1 });
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(result.headers.get("access-control-allow-origin")).toBeNull();
  });
  it.each([["empty", 0, 200], ["busy", 0, 409], ["review_required", 2, 503], ["unavailable", 0, 503], ["completed", 5, 200]])("maps %s without retry", async (status, processed, code) => {
    run.mockResolvedValue({ status, processed });
    const result = await handleOptionalEmailBatch(request(), configuration, run);
    expect(result.status).toBe(code); expect(run).toHaveBeenCalledTimes(1);
    expect(await result.json()).toEqual({ status, processed });
  });
  it.each([null, {}, { status: "completed", processed: 0 }, { status: "completed", processed: 6 }, { status: "empty", processed: 1 },
    { status: "completed", processed: 1.5 }, { status: "unknown", processed: 0 }, { status: "completed", processed: 1, token: secret }])("sanitizes malformed runtime results", async value => {
    run.mockResolvedValue(value);
    const result = await handleOptionalEmailBatch(request(), configuration, run);
    expect(result.status).toBe(503); expect(await result.json()).toEqual({ status: "review_required", processed: 0 }); expect(run).toHaveBeenCalledTimes(1);
  });
  it("never exposes exceptions or retries an uncertain runtime", async () => {
    run.mockRejectedValue(new Error("private " + secret + apiKey));
    const result = await handleOptionalEmailBatch(request(), configuration, run);
    expect(await result.json()).toEqual({ status: "review_required", processed: 0 }); expect(run).toHaveBeenCalledTimes(1);
  });
});
