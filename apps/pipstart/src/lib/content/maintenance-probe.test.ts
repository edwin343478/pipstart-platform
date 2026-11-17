import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkableUrl,
  classifyStatus,
  probeUrl,
  publicAddress,
  runMaintenanceProbe,
  type ProbeDeps,
  type SendInput,
} from "./maintenance-probe";

const deps = (
  addresses: string[] | Error,
  replies: ({ status: number; location?: string } | Error)[] = [
    { status: 200 },
  ],
) => {
  const sent: SendInput[] = [];
  let clock = 1000;
  const d: ProbeDeps = {
    resolve: vi.fn(async () => {
      if (addresses instanceof Error) throw addresses;
      return addresses.map((address) => ({
        address,
        family: address.includes(":") ? (6 as const) : (4 as const),
      }));
    }),
    send: vi.fn(async (input: SendInput) => {
      sent.push(input);
      clock += 40;
      const r = replies[sent.length - 1] ?? { status: 200 };
      if (r instanceof Error) throw r;
      return { status: r.status, location: r.location ?? null };
    }),
    now: () => clock,
  };
  return { d, sent };
};
const url = checkableUrl("https://docs.example.org/guide?page=2")!;

describe("MP10d checkable URLs", () => {
  it.each([
    "https://docs.example.org/guide",
    "https://docs.example.org:443/a?page=2#part",
    "https://sub.docs.example.org/",
  ])("accepts %s", (u) => expect(checkableUrl(u)).not.toBeNull());
  it.each([
    "http://docs.example.org/",
    "https://docs.example.org:8443/",
    "https://user:pass@docs.example.org/",
    "https://93.184.216.34/",
    "https://[2606:4700::1111]/",
    "https://localhost/",
    "https://docs.example.org/unsubscribe/abc",
    "https://docs.example.org/account/reset",
    "https://docs.example.org/a?token=x",
    "https://docs.example.org/a?access_token=x",
    "https://docs.example.org/a?sig=x",
    "https://docs.example.org/a?API_KEY=x",
    "https://docs.example.org/a b",
    "ftp://docs.example.org/",
    "https://docs.example.org/" + "a".repeat(2048),
    "https://docs.example.org/%72eset/opaque",
    "https://docs.example.org/%75nsubscribe/opaque",
    "https://docs.example.org/%2572eset/opaque",
    "https://docs.example.org/a%2Freset",
    "https://docs.example.org/a%5Creset",
    "https://docs.example.org/%E0%A4%A",
    "https://docs.example.org/LOG%49N",
    42,
  ])("refuses %s", (u) => expect(checkableUrl(u)).toBeNull());
  it("accepts an ordinary encoded path", () =>
    expect(checkableUrl("https://docs.example.org/a%20guide")).not.toBeNull());
});

describe("MP10d public addresses", () => {
  it.each([
    "93.184.216.34",
    "1.1.1.1",
    "172.15.255.255",
    "172.32.0.1",
    "100.128.0.1",
    "2606:4700:4700::1111",
    "2a00:1450:4001:80b::200e",
  ])("accepts %s", (a) => expect(publicAddress(a)).toBe(true));
  it.each([
    "0.0.0.0",
    "10.1.2.3",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.0.0.8",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.7",
    "203.0.113.9",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::ffff:93.184.216.34",
    "64:ff9b::a00:1",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "ff02::1",
    "2001:db8::1",
    "2001::1",
    "2002:c000:204::1",
    "3fff::1",
    "not-an-address",
    "1.2.3",
  ])("refuses %s", (a) => expect(publicAddress(a)).toBe(false));
});

describe("MP10d probe", () => {
  it("classifies statuses", () => {
    expect(
      [200, 206, 301, 308, 401, 403, 404, 408, 410, 429, 500, 503, 504].map(
        classifyStatus,
      ),
    ).toEqual([
      "ok",
      "ok",
      "redirect",
      "redirect",
      "forbidden",
      "forbidden",
      "not_found",
      "timeout",
      "gone",
      "throttled",
      "unreachable",
      "unreachable",
      "timeout",
    ]);
  });
  it("never connects when any resolved address is not public", async () => {
    for (const set of [
      ["10.0.0.5"],
      ["93.184.216.34", "127.0.0.1"],
      ["::1"],
      [],
    ]) {
      const { d, sent } = deps(set);
      expect(await probeUrl(url, d)).toEqual({
        classification: "unreachable",
        evidence: "Not contacted: the host resolves to a non-public address",
      });
      expect(sent).toEqual([]);
    }
  });
  it("pins the connection to the checked address, resolving once, with no cookies or credentials", async () => {
    const { d, sent } = deps(["93.184.216.34", "93.184.216.35"]);
    expect(await probeUrl(url, d)).toEqual({
      classification: "ok",
      evidence: "HEAD 200 in 40 ms",
    });
    expect(d.resolve).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      address: "93.184.216.34",
      family: 4,
      method: "HEAD",
    });
    expect(sent[0].url.href).toBe("https://docs.example.org/guide?page=2");
    expect(sent[0].headers).toEqual({
      "User-Agent": "PipStart-LinkCheck/1.0",
      Accept: "*/*",
    });
  });
  it("falls back to a one-byte ranged GET when HEAD is not allowed", async () => {
    const { d, sent } = deps(
      ["93.184.216.34"],
      [{ status: 405 }, { status: 206 }],
    );
    expect(await probeUrl(url, d)).toEqual({
      classification: "ok",
      evidence: "GET 206 in 80 ms",
    });
    expect(sent.map((s) => s.method)).toEqual(["HEAD", "GET"]);
    expect(sent[1].headers.Range).toBe("bytes=0-0");
  });
  it("reports a redirect with its target host and never follows it", async () => {
    const { d, sent } = deps(
      ["93.184.216.34"],
      [{ status: 301, location: "https://other.example/x" }],
    );
    expect(await probeUrl(url, d)).toEqual({
      classification: "redirect",
      evidence: "HEAD 301 to other.example in 40 ms",
    });
    expect(sent).toHaveLength(1);
  });
  it.each([
    [{ status: 404 }, "not_found"],
    [{ status: 410 }, "gone"],
    [{ status: 403 }, "forbidden"],
    [{ status: 429 }, "throttled"],
    [{ status: 502 }, "unreachable"],
  ])("maps %j to %s", async (reply, classification) => {
    const { d } = deps(["93.184.216.34"], [reply]);
    expect((await probeUrl(url, d)).classification).toBe(classification);
  });
  it("reports timeouts, refused connections and DNS failures without throwing", async () => {
    expect(
      await probeUrl(url, deps(["93.184.216.34"], [new Error("ETIMEDOUT")]).d),
    ).toEqual({
      classification: "timeout",
      evidence: "No reply within 8000 ms",
    });
    expect(
      await probeUrl(
        url,
        deps(
          ["93.184.216.34"],
          [Object.assign(new Error("connect"), { code: "ECONNREFUSED" })],
        ).d,
      ),
    ).toEqual({
      classification: "unreachable",
      evidence: "Connection failed (ECONNREFUSED)",
    });
    expect(await probeUrl(url, deps(new Error("ENOTFOUND")).d)).toEqual({
      classification: "unreachable",
      evidence: "DNS lookup failed",
    });
  });
});

describe("MP10d staff check", () => {
  const actor = "d1000000-0000-4000-8000-000000000001";
  function client(
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
          : response(
              fn === "pipstart_maintenance_probe_intent"
                ? { status: "cleared", item_id: "l1", revision: 2 }
                : { item_id: "l1", status: "recorded" },
            ),
    );
    return {
      getUser,
      rpc,
      client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
      calls: () =>
        rpc.mock.calls.filter((c) => c[0] !== "pipstart_staff_access"),
    };
  }
  const input = {
    id: "l1",
    revision: 2,
    reference: "https://docs.example.org/guide",
  };
  beforeEach(() => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    vi.stubEnv("PIPSTART_MAINTENANCE_PROBE_ENABLED", "true");
  });
  afterEach(() => vi.unstubAllEnvs());
  it("is off unless the site enables it", async () => {
    vi.stubEnv("PIPSTART_MAINTENANCE_PROBE_ENABLED", "");
    const c = client();
    expect(
      await runMaintenanceProbe(c.client, input, deps(["93.184.216.34"]).d),
    ).toEqual({ kind: "disabled" });
    expect(c.getUser).not.toHaveBeenCalled();
  });
  it.each([
    { ...input, reference: "http://docs.example.org/" },
    { ...input, reference: "https://docs.example.org/a?token=x" },
    { ...input, revision: 0 },
    { ...input, extra: 1 },
  ])("refuses malformed input %# before Auth", async (bad) => {
    const c = client();
    expect(
      await runMaintenanceProbe(c.client, bad, deps(["93.184.216.34"]).d),
    ).toEqual({ kind: "invalid" });
    expect(c.getUser).not.toHaveBeenCalled();
  });
  it("refuses people outside maintenance without any store call or request", async () => {
    const c = client("administrator"),
      { d, sent } = deps(["93.184.216.34"]);
    expect(await runMaintenanceProbe(c.client, input, d)).toEqual({
      kind: "denied",
    });
    expect(c.calls()).toEqual([]);
    expect(sent).toEqual([]);
  });
  it("never contacts a host the store does not allow", async () => {
    const c = client("moderator", {
        pipstart_maintenance_probe_intent: {
          data: { status: "not-allowed" },
          error: null,
        },
      }),
      { d, sent } = deps(["93.184.216.34"]);
    expect(await runMaintenanceProbe(c.client, input, d)).toEqual({
      kind: "not-allowed",
    });
    expect(sent).toEqual([]);
    expect(c.calls().map((x) => x[0])).toEqual([
      "pipstart_maintenance_probe_intent",
    ]);
  });
  it("checks once and records one probe result", async () => {
    const c = client(),
      { d } = deps(["93.184.216.34"], [{ status: 404 }]);
    expect(await runMaintenanceProbe(c.client, input, d)).toEqual({
      kind: "checked",
      classification: "not_found",
      evidence: "HEAD 404 in 40 ms",
    });
    expect(c.calls()).toEqual([
      [
        "pipstart_maintenance_probe_intent",
        { p_item: "l1", p_expected_revision: 2, p_reference: input.reference },
      ],
      [
        "pipstart_maintenance_record_result",
        {
          p_item: "l1",
          p_expected_revision: 2,
          p_reference: input.reference,
          p_source: "probe",
          p_classification: "not_found",
          p_evidence: "HEAD 404 in 40 ms",
        },
      ],
    ]);
  });
  it.each([
    ["PT409", "conflict"],
    ["42501", "denied"],
    ["57014", "uncertain"],
  ])(
    "maps a recording refusal %s to %s without re-checking",
    async (code, kind) => {
      const c = client("moderator", {
          pipstart_maintenance_record_result: { data: null, error: { code } },
        }),
        { d, sent } = deps(["93.184.216.34"]);
      expect(await runMaintenanceProbe(c.client, input, d)).toEqual({ kind });
      expect(sent).toHaveLength(1);
    },
  );
  it.each([
    ["42501", "denied"],
    ["PT409", "conflict"],
    ["22023", "invalid"],
    ["PT429", "limited"],
  ])(
    "makes no DNS or HTTP contact when the store refuses the intent (%s)",
    async (code, kind) => {
      const c = client("moderator", {
          pipstart_maintenance_probe_intent: { data: null, error: { code } },
        }),
        { d, sent } = deps(["93.184.216.34"]);
      expect(await runMaintenanceProbe(c.client, input, d)).toEqual({ kind });
      expect(d.resolve).not.toHaveBeenCalled();
      expect(sent).toEqual([]);
      expect(c.calls().map((x) => x[0])).toEqual([
        "pipstart_maintenance_probe_intent",
      ]);
    },
  );
  it("runs one check at a time", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const slow: ProbeDeps = {
      resolve: async () => [{ address: "93.184.216.34", family: 4 }],
      send: async () => {
        await gate;
        return { status: 200, location: null };
      },
      now: () => 0,
    };
    const first = runMaintenanceProbe(client().client, input, slow);
    await new Promise((r) => setTimeout(r, 20));
    expect(await runMaintenanceProbe(client().client, input, slow)).toEqual({
      kind: "busy",
    });
    release();
    expect((await first).kind).toBe("checked");
  });
});

describe("MP10d overall deadline (audit F2)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const hanging = (onSend?: (signal: AbortSignal) => void): ProbeDeps => ({
    resolve: async () => [{ address: "93.184.216.34", family: 4 }],
    send: (input) => {
      onSend?.(input.signal);
      return new Promise(() => {});
    },
    now: () => Date.now(),
  });
  it("ends a send that never answers at 8 s and aborts the real request", async () => {
    let signal: AbortSignal | undefined;
    let settled = false;
    const run = probeUrl(
      url,
      hanging((s) => (signal = s)),
    ).then((r) => ((settled = true), r));
    await vi.advanceTimersByTimeAsync(7999);
    expect(settled).toBe(false);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await run).toEqual({
      classification: "timeout",
      evidence: "No reply within 8000 ms",
    });
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("counts the HEAD-to-GET fallback inside the same 8 s", async () => {
    const signals: AbortSignal[] = [];
    const d: ProbeDeps = {
      resolve: async () => [{ address: "93.184.216.34", family: 4 }],
      send: (input) => {
        signals.push(input.signal);
        return input.method === "HEAD"
          ? new Promise((r) =>
              setTimeout(() => r({ status: 405, location: null }), 6000),
            )
          : new Promise(() => {});
      },
      now: () => Date.now(),
    };
    const run = probeUrl(url, d);
    await vi.advanceTimersByTimeAsync(8000);
    expect((await run).classification).toBe("timeout");
    expect(signals).toHaveLength(2);
    expect(signals.every((s) => s.aborted)).toBe(true);
  });
  it("ends a DNS lookup that never answers at 3 s without contacting anything", async () => {
    const send = vi.fn();
    const run = probeUrl(url, {
      resolve: () => new Promise(() => {}),
      send,
      now: () => Date.now(),
    });
    await vi.advanceTimersByTimeAsync(3000);
    expect(await run).toEqual({
      classification: "timeout",
      evidence: "DNS lookup timed out",
    });
    expect(send).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("clears every timer when a check finishes early", async () => {
    const run = probeUrl(url, {
      resolve: async () => [{ address: "93.184.216.34", family: 4 }],
      send: async () => ({ status: 200, location: null }),
      now: () => Date.now(),
    });
    expect((await run).classification).toBe("ok");
    expect(vi.getTimerCount()).toBe(0);
  });
});
