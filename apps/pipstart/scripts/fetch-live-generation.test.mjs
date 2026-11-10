import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { fetchLiveGeneration, groupsFrom } from "./fetch-live-generation.mjs";

const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), "pipstart-live-"));
const env = (extra = {}) => ({
  PIPSTART_STORE_FAMILIES: "analysis",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "SECRET_FIXTURE_KEY",
  ...extra,
});
const reply = (data, status = 200) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
const good = {
  generation: 7,
  snapshot_sha256: "c".repeat(64),
  snapshot: { format: "pipstart-content-snapshot", version: 2 },
};

describe("M22 MP08b2a build-time live generation fetch", () => {
  it("accepts only known groups", () => {
    expect(groupsFrom("")).toEqual([]);
    expect(groupsFrom(" analysis , curriculum ")).toEqual([
      "analysis",
      "curriculum",
    ]);
    for (const bad of ["lessons", "analysis,analysis", "analysis,"])
      expect(() => groupsFrom(bad)).toThrow("Unknown PIPSTART_STORE_FAMILIES");
  });
  it("does nothing, and removes a stale file, when no group is switched", async () => {
    const cwd = dir();
    fs.mkdirSync(path.join(cwd, ".generated"));
    fs.writeFileSync(
      path.join(cwd, ".generated/live-generation.json"),
      "stale",
    );
    const fetchImpl = vi.fn();
    expect(await fetchLiveGeneration({ env: {}, cwd, fetchImpl })).toContain(
      "reads code",
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(
      fs.existsSync(path.join(cwd, ".generated/live-generation.json")),
    ).toBe(false);
  });
  it("reads the live generation with the service key and writes it for the switched groups", async () => {
    const cwd = dir(),
      fetchImpl = reply(good);
    const summary = await fetchLiveGeneration({ env: env(), cwd, fetchImpl });
    expect(summary).toBe(
      "Live generation 7 (cccccccccccc…) written for analysis.",
    );
    expect(summary).not.toContain("SECRET");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/pipstart_publication_snapshot",
    );
    expect(init.method).toBe("POST");
    expect(init.headers.apikey).toBe("SECRET_FIXTURE_KEY");
    const file = JSON.parse(
      fs.readFileSync(
        path.join(cwd, ".generated/live-generation.json"),
        "utf8",
      ),
    );
    expect(file).toMatchObject({
      format: "pipstart-live-generation",
      generation: 7,
      snapshotSha256: "c".repeat(64),
      groups: ["analysis"],
    });
    expect(JSON.parse(file.snapshot)).toEqual(good.snapshot);
    expect(
      fs.existsSync(path.join(cwd, ".generated/live-generation.json.partial")),
    ).toBe(false);
  });
  it.each([
    [
      "a missing key",
      env({ SUPABASE_SECRET_KEY: "" }),
      reply(good),
      "need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY",
    ],
    [
      "an insecure URL",
      env({ NEXT_PUBLIC_SUPABASE_URL: "http://example.com" }),
      reply(good),
      "HTTPS",
    ],
    [
      "a refused read",
      env(),
      reply({ message: "Nothing is published" }, 400),
      "HTTP 400",
    ],
    ["a malformed reply", env(), reply({ ...good, extra: 1 }), "malformed"],
    [
      "a non-positive generation",
      env(),
      reply({ ...good, generation: 0 }),
      "malformed",
    ],
  ])(
    "stops the build on %s, writing nothing",
    async (_, e, fetchImpl, message) => {
      const cwd = dir();
      await expect(
        fetchLiveGeneration({ env: e, cwd, fetchImpl }),
      ).rejects.toThrow(message);
      expect(
        fs.existsSync(path.join(cwd, ".generated/live-generation.json")),
      ).toBe(false);
    },
  );
});
