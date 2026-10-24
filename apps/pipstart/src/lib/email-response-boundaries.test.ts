import { createHmac } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import {
  handleDeliverySweep,
  type SweepStore,
} from "./email-monitor/delivery-sweep";
import {
  handleMonitoringWebhook,
  type MonitorStore,
} from "./email-monitor/monitor";
import { handleWatchedDeliverySweep } from "./email-monitor/watchdog";
import { createOptionalResendTransport } from "./optional-email/resend-transport";
const config = {
  secret: "a".repeat(64),
  apiKey: "fake-key",
  alertTo: "pipstartalert2026@gmail.com",
};
const request = () =>
  new Request("https://pipstart.net/api/internal/email-monitor/sweep", {
    method: "POST",
    headers: { authorization: `Bearer ${config.secret}` },
  });
const heartbeat = "https://hc-ping.com/00000000-0000-4000-8000-000000000001";
const provider = "00000000-0000-4000-8000-000000000004",
  jobId = "00000000-0000-4000-8000-000000000001";
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function sweepStore(): SweepStore {
  return {
    start: vi.fn().mockResolvedValue("run"),
    queue: vi.fn().mockResolvedValue(0),
    due: vi
      .fn()
      .mockResolvedValue([{ messageId: "generated", type: "email.bounced" }]),
    claim: vi.fn().mockResolvedValue({ state: "leased", token: "token" }),
    accept: vi.fn().mockResolvedValue(undefined),
    health: vi.fn().mockResolvedValue({
      manual_alerts: 0,
      overdue_alerts: 0,
      stale_runs: 0,
    }),
    finish: vi.fn().mockResolvedValue(undefined),
  };
}
function webhook() {
  const secret = `whsec_${Buffer.alloc(24, 7).toString("base64")}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = JSON.stringify({
    type: "email.bounced",
    created_at: "2026-10-19T09:00:00Z",
    data: {
      email_id: "generated",
      from: "PipStart <no-reply@account.pipstart.net>",
    },
  });
  const digest = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
    .update(`msg_generated.${timestamp}.${body}`)
    .digest("base64");
  const req = new Request("https://pipstart.net/api/webhooks/resend", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": "msg_generated",
      "svix-timestamp": timestamp,
      "svix-signature": `v1,${digest}`,
    },
  });
  const store: MonitorStore = {
    record: vi.fn().mockResolvedValue(undefined),
    claim: vi.fn().mockResolvedValue({ state: "leased", token: "token" }),
    accept: vi.fn().mockResolvedValue(undefined),
  };
  return { secret, req, store };
}
function optional(send: typeof fetch) {
  const receipts = { acknowledge: vi.fn().mockResolvedValue(undefined) };
  const transport = createOptionalResendTransport(
    { enabled: true, apiKey: "re_GENERATED_ONLY_12345", receipts },
    send,
  )!;
  return {
    receipts,
    run: () =>
      transport.deliver(
        {
          jobId,
          to: "generated@example.test",
          subject: "Generated",
          html: "<p>Generated</p>",
          text: "Generated",
          headers: {
            "List-Unsubscribe": `<https://pipstart.net/unsubscribe?token=${"a".repeat(64)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        `pipstart-opt-v1-${jobId}`,
      ),
  };
}
it.each(["account", "sweep", "optional"])(
  "%s refuses an oversized acknowledgement without accepting or retrying",
  async (kind) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ id: provider, padding: "x".repeat(17000) }),
      );
    if (kind === "account") {
      const w = webhook();
      const reply = await handleMonitoringWebhook(
        w.req,
        { ...config, secret: w.secret },
        w.store,
        send,
      );
      expect(reply.status).toBe(503);
      expect(w.store.accept).not.toHaveBeenCalled();
    } else if (kind === "sweep") {
      const store = sweepStore();
      expect(
        (await handleDeliverySweep(request(), config, store, send)).status,
      ).toBe(503);
      expect(store.accept).not.toHaveBeenCalled();
      expect(store.finish).toHaveBeenCalledWith(
        "run",
        expect.objectContaining({ failed: 1, accepted: 0 }),
        "partial",
      );
    } else {
      const t = optional(send);
      await expect(t.run()).rejects.toThrow(
        /^Optional provider outcome unavailable/,
      );
      expect(t.receipts.acknowledge).not.toHaveBeenCalled();
    }
    expect(send).toHaveBeenCalledOnce();
  },
);
it.each(["account", "sweep", "optional"])(
  "%s settles on stalled acknowledgement at 8s without acceptance or resend",
  async (kind) => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const send = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response(new ReadableStream({ cancel }), {
          headers: { "content-type": "application/json" },
        }),
    );
    let result: Promise<unknown>;
    let accept: ReturnType<typeof vi.fn>;
    if (kind === "account") {
      const w = webhook();
      accept = vi.mocked(w.store.accept);
      result = handleMonitoringWebhook(
        w.req,
        { ...config, secret: w.secret },
        w.store,
        send,
      ).then((r) => expect(r.status).toBe(503));
    } else if (kind === "sweep") {
      const store = sweepStore();
      accept = vi.mocked(store.accept);
      result = handleDeliverySweep(request(), config, store, send).then((r) =>
        expect(r.status).toBe(503),
      );
    } else {
      const t = optional(send);
      accept = t.receipts.acknowledge;
      result = expect(t.run()).rejects.toThrow(
        /^Optional provider outcome unavailable/,
      );
    }
    await vi.advanceTimersByTimeAsync(0);
    expect(send).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(8000);
    await result;
    expect(accept).not.toHaveBeenCalled();
    expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  },
);
it("watchdog error cancellation cannot hang or change a persisted successful sweep", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = sweepStore();
  vi.mocked(store.due).mockResolvedValue([]);
  const cancel = vi.fn(() => new Promise<void>(() => {}));
  const ping = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      new Response(new ReadableStream({ cancel }), { status: 500 }),
    );
  const send = vi.fn<typeof fetch>();
  const reply = await handleWatchedDeliverySweep(
    request(),
    config,
    store,
    heartbeat,
    send,
    ping,
  );
  expect(reply.status).toBe(200);
  expect(cancel).toHaveBeenCalledOnce();
  expect(ping).toHaveBeenCalledOnce();
  expect(send).not.toHaveBeenCalled();
  expect(store.finish).toHaveBeenCalledOnce();
});
it.each(["body", "headers"])(
  "watchdog stalled %s settles at 3s and leaves sweep result unchanged",
  async (stage) => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = sweepStore();
    vi.mocked(store.due).mockResolvedValue([]);
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const ping = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        stage === "headers"
          ? new Promise<Response>(() => {})
          : Promise.resolve(new Response(new ReadableStream({ cancel }))),
      );
    const result = handleWatchedDeliverySweep(
      request(),
      config,
      store,
      heartbeat,
      vi.fn(),
      ping,
    );
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);
    expect((await result).status).toBe(200);
    expect(ping).toHaveBeenCalledOnce();
    expect(ping.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  },
);
it.each(["excess bytes", "empty chunk flood", "bad UTF-8"])(
  "watchdog rejects %s without repeating the ping",
  async (kind) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = sweepStore();
    vi.mocked(store.due).mockResolvedValue([]);
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const ping = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            if (kind === "empty chunk flood")
              for (let i = 0; i < 33; i++) c.enqueue(new Uint8Array());
            else
              c.enqueue(
                kind === "excess bytes"
                  ? new Uint8Array(65)
                  : new Uint8Array([0xff]),
              );
            if (kind === "bad UTF-8") c.close();
          },
          cancel,
        }),
      ),
    );
    expect(
      (
        await handleWatchedDeliverySweep(
          request(),
          config,
          store,
          heartbeat,
          vi.fn(),
          ping,
        )
      ).status,
    ).toBe(200);
    expect(log).toHaveBeenCalledWith("PIPSTART_SWEEP_WATCHDOG_PING_FAILED");
    expect(ping).toHaveBeenCalledOnce();
  },
);
