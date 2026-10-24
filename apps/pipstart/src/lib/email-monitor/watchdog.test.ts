import { afterEach, describe, expect, it, vi } from "vitest";
import type { SweepStore } from "./delivery-sweep";
import { handleWatchedDeliverySweep, isWatchdogUrl } from "./watchdog";

const url = "https://hc-ping.com/00000000-0000-4000-8000-000000000001";
const config = {
  secret: "a".repeat(64),
  apiKey: "fake-provider-key",
  alertTo: "pipstartalert2026@gmail.com",
};
function setup() {
  const store: SweepStore = {
    start: vi.fn().mockResolvedValue("run-id"),
    queue: vi.fn().mockResolvedValue(0),
    due: vi.fn().mockResolvedValue([]),
    claim: vi.fn().mockResolvedValue({ state: "leased", token: "token" }),
    accept: vi.fn().mockResolvedValue(undefined),
    health: vi.fn().mockResolvedValue({
      manual_alerts: 0,
      overdue_alerts: 0,
      stale_runs: 0,
    }),
    finish: vi.fn().mockResolvedValue(undefined),
  };
  const send = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => Response.json({ id: "provider-id" }));
  const ping = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response("OK"));
  const request = (
    authorization = `Bearer ${config.secret}`,
    method = "POST",
  ) =>
    new Request("https://pipstart.net/api/internal/email-monitor/sweep", {
      method,
      headers: { authorization },
    });
  return { store, send, ping, request };
}
afterEach(() => vi.restoreAllMocks());

describe("M21 independent sweep watchdog", () => {
  it("wires only the existing server sweep route to the optional secret", () => {
    const route = readFileSync(
      resolve(
        process.cwd(),
        "src/app/api/internal/email-monitor/sweep/route.ts",
      ),
      "utf8",
    );
    expect(route).toContain(
      'import { handleWatchedDeliverySweep } from "@/lib/email-monitor/watchdog"',
    );
    expect(route).toContain("return handleWatchedDeliverySweep(");
    expect(route).toContain(
      'process.env.PIPSTART_EMAIL_MONITOR_HEARTBEAT_URL?.trim() ?? ""',
    );
    expect(route).toContain("export const maxDuration = 60");
    expect(route).not.toContain("NEXT_PUBLIC_EMAIL_MONITOR");
  });
  it("accepts only the canonical UUID success URL", () => {
    expect(isWatchdogUrl(url)).toBe(true);
  });
  it.each(["manual_alerts", "overdue_alerts", "stale_runs"] as const)(
    "withholds the success heartbeat when %s needs review",
    async (key) => {
      const { store, send, ping, request } = setup();
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(store.health).mockResolvedValue({
        manual_alerts: 0,
        overdue_alerts: 0,
        stale_runs: 0,
        [key]: 1,
      });
      expect(
        (
          await handleWatchedDeliverySweep(
            request(),
            config,
            store,
            url,
            send,
            ping,
          )
        ).status,
      ).toBe(503);
      expect(send).not.toHaveBeenCalled();
      expect(ping).not.toHaveBeenCalled();
    },
  );
  it("withholds heartbeat when health evidence is unavailable", async () => {
    const { store, send, ping, request } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(store.health).mockRejectedValue(Error("private"));
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          url,
          send,
          ping,
        )
      ).status,
    ).toBe(503);
    expect(ping).not.toHaveBeenCalled();
  });
  it.each([
    "http://hc-ping.com/00000000-0000-4000-8000-000000000001",
    url + "/start",
    url + "/fail",
    url + "/",
    url + "?rid=secret",
    url + "#fragment",
    " " + url,
    url + "\n",
    url.replace("hc-ping.com", "hc-ping.com.evil.test"),
    url.replace("hc-ping.com", "evil.test@hc-ping.com"),
    url.replace("hc-ping.com", "hc-ping.com:443"),
    "https://hc-ping.com/project-key/name",
    "https://127.0.0.1/private",
    "https://healthchecks.io/",
    url.replace("000000000001", "%3000000000001"),
    "",
    "https://hc-ping.com/not-a-uuid",
  ])("rejects unsafe or unsupported endpoint %#", (value) => {
    expect(isWatchdogUrl(value)).toBe(false);
  });
  it("pings only after durable completion, with no learner data or credentials", async () => {
    const { store, send, ping, request } = setup();
    ping.mockImplementation(async () => {
      expect(store.finish).toHaveBeenCalledWith(
        "run-id",
        {
          queued: 0,
          accepted: 0,
          skipped: 0,
          failed: 0,
          deferred: 0,
          manual_alerts: 0,
          overdue_alerts: 0,
          stale_runs: 0,
        },
        "completed",
      );
      return new Response("OK");
    });
    const response = await handleWatchedDeliverySweep(
      request(),
      config,
      store,
      url,
      send,
      ping,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "sweep_completed",
      summary: {
        queued: 0,
        accepted: 0,
        skipped: 0,
        failed: 0,
        deferred: 0,
        manual_alerts: 0,
        overdue_alerts: 0,
        stale_runs: 0,
      },
    });
    expect(send).not.toHaveBeenCalled();
    expect(ping).toHaveBeenCalledOnce();
    const [target, init] = ping.mock.calls[0];
    expect(target).toBe(url);
    expect(init).toMatchObject({
      method: "POST",
      body: "",
      redirect: "error",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    expect(init?.headers).toBeUndefined();
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
  it("uses a three-second heartbeat timeout", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const { store, send, ping, request } = setup();
      ping.mockImplementation(() => new Promise<Response>(() => {}));
      let settled = false;
      const result = handleWatchedDeliverySweep(
        request(),
        config,
        store,
        url,
        send,
        ping,
      ).then((reply) => {
        settled = true;
        return reply;
      });
      await vi.advanceTimersByTimeAsync(2999);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect((await result).status).toBe(200);
      expect(ping.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(ping).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("leaves an unconfigured watchdog disabled without affecting sweeps", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { store, send, ping, request } = setup();
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          "",
          send,
          ping,
        )
      ).status,
    ).toBe(200);
    expect(ping).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
  it("invalid configuration logs a constant, not the URL, and never pings", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { store, send, ping, request } = setup();
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          url + "/fail",
          send,
          ping,
        )
      ).status,
    ).toBe(200);
    expect(ping).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([
      ["PIPSTART_SWEEP_WATCHDOG_INVALID_CONFIG"],
    ]);
  });
  it.each([401, 503])(
    "never pings after an unsuccessful sweep (%s)",
    async (status) => {
      const { store, send, ping, request } = setup();
      const response = await handleWatchedDeliverySweep(
        request(status === 401 ? "Bearer wrong" : undefined),
        status === 503 ? { ...config, apiKey: "" } : config,
        store,
        url,
        send,
        ping,
      );
      expect(response.status).toBe(status);
      expect(store.start).not.toHaveBeenCalled();
      expect(ping).not.toHaveBeenCalled();
    },
  );
  it("never pings after a rejected method", async () => {
    const { store, send, ping, request } = setup();
    expect(
      (
        await handleWatchedDeliverySweep(
          request(undefined, "GET"),
          config,
          store,
          url,
          send,
          ping,
        )
      ).status,
    ).toBe(405);
    expect(ping).not.toHaveBeenCalled();
  });
  it.each(["start", "queue", "due", "finish"] as const)(
    "never pings after persistence failure at %s",
    async (method) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const { store, send, ping, request } = setup();
      vi.mocked(store[method]).mockRejectedValue(new Error("database failure"));
      expect(
        (
          await handleWatchedDeliverySweep(
            request(),
            config,
            store,
            url,
            send,
            ping,
          )
        ).status,
      ).toBe(503);
      expect(ping).not.toHaveBeenCalled();
    },
  );
  it("never pings for partial alert sending", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { store, send, ping, request } = setup();
    vi.mocked(store.due).mockResolvedValue([
      { messageId: "failure-id", type: "email.failed" },
    ]);
    send.mockResolvedValue(new Response("provider failure", { status: 503 }));
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          url,
          send,
          ping,
        )
      ).status,
    ).toBe(503);
    expect(ping).not.toHaveBeenCalled();
  });
  it("never pings when remaining alerts are deferred", async () => {
    const { store, send, ping, request } = setup();
    vi.mocked(store.due).mockResolvedValue([
      { messageId: "deferred-id", type: "email.failed" },
    ]);
    const now = vi.fn().mockReturnValueOnce(0).mockReturnValue(36000);
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          url,
          send,
          ping,
          now,
        )
      ).status,
    ).toBe(503);
    expect(send).not.toHaveBeenCalled();
    expect(ping).not.toHaveBeenCalled();
  });
  it("pings after an alert is accepted and the completed run is saved", async () => {
    const { store, send, ping, request } = setup();
    vi.mocked(store.due).mockResolvedValue([
      { messageId: "failure-id", type: "email.failed" },
    ]);
    ping.mockImplementation(async () => {
      expect(store.accept).toHaveBeenCalledOnce();
      expect(store.finish).toHaveBeenCalledWith(
        "run-id",
        expect.objectContaining({ accepted: 1 }),
        "completed",
      );
      return new Response("OK");
    });
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          url,
          send,
          ping,
        )
      ).status,
    ).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    expect(ping).toHaveBeenCalledOnce();
  });
  it.each([
    "OK (not found)",
    "OK (rate limited)",
    "",
    "untrusted details",
    "x".repeat(65),
  ])(
    "does not treat an unaccepted heartbeat body as success %#",
    async (body) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { store, send, ping, request } = setup();
      ping.mockImplementation(async () => new Response(body));
      expect(
        (
          await handleWatchedDeliverySweep(
            request(),
            config,
            store,
            url,
            send,
            ping,
          )
        ).status,
      ).toBe(200);
      expect(ping).toHaveBeenCalledOnce();
      expect(log.mock.calls).toEqual([["PIPSTART_SWEEP_WATCHDOG_PING_FAILED"]]);
      expect(store.finish).toHaveBeenCalledOnce();
    },
  );
  it.each([301, 302, 401, 404, 429, 500, 503])(
    "preserves the sweep on heartbeat HTTP %s",
    async (status) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { store, send, ping, request } = setup();
      ping.mockResolvedValue(new Response("sensitive details", { status }));
      expect(
        (
          await handleWatchedDeliverySweep(
            request(),
            config,
            store,
            url,
            send,
            ping,
          )
        ).status,
      ).toBe(200);
      expect(ping).toHaveBeenCalledOnce();
      expect(log.mock.calls).toEqual([["PIPSTART_SWEEP_WATCHDOG_PING_FAILED"]]);
    },
  );
  it.each([
    new Error(url + " contains credentials"),
    new DOMException("timeout", "TimeoutError"),
  ])(
    "does not log an exception or retry the completed sweep %#",
    async (error) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { store, send, ping, request } = setup();
      ping.mockRejectedValue(error);
      const response = await handleWatchedDeliverySweep(
        request(),
        config,
        store,
        url,
        send,
        ping,
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(ping).toHaveBeenCalledOnce();
      expect(store.start).toHaveBeenCalledOnce();
      expect(store.finish).toHaveBeenCalledOnce();
      expect(log.mock.calls).toEqual([["PIPSTART_SWEEP_WATCHDOG_PING_FAILED"]]);
      expect(JSON.stringify(await response.json())).not.toContain("hc-ping");
    },
  );
});
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
