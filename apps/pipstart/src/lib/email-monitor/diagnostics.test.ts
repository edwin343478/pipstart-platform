import { createHmac } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { providerStatusClass, reportMonitorFailure } from "./diagnostics";
import { handleMonitoringWebhook, type MonitorStore } from "./monitor";
import { handleDeliverySweep, type SweepStore } from "./delivery-sweep";
import { POST as webhookRoute } from "../../app/api/webhooks/resend/route";
import { POST as sweepRoute } from "../../app/api/internal/email-monitor/sweep/route";
const marker = "GENERATED_PRIVATE_ID",
  providerId = "GENERATED_PROVIDER_ID";
const webhookSecret = `whsec_${Buffer.alloc(24, 7).toString("base64")}`;
const config = {
  secret: webhookSecret,
  apiKey: "GENERATED_PRIVATE_KEY",
  alertTo: "pipstartalert2026@gmail.com",
};
const sweepConfig = { ...config, secret: "a".repeat(64) };
const constant = "PIPSTART_EMAIL_MONITOR_FAILURE_STAGE";
beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function webhookRequest(
  body = JSON.stringify({
    type: "email.failed",
    created_at: "2026-10-19T09:00:00Z",
    data: {
      email_id: marker,
      from: "PipStart <no-reply@account.pipstart.net>",
      to: ["private@example.test"],
      html: "PRIVATE_BEARER_TOKEN",
    },
  }),
) {
  const time = String(Math.floor(Date.now() / 1000));
  const digest = createHmac(
    "sha256",
    Buffer.from(webhookSecret.slice(6), "base64"),
  )
    .update(`msg_generated.${time}.${body}`)
    .digest("base64");
  return new Request("https://pipstart.net/api/webhooks/resend", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": "msg_generated",
      "svix-timestamp": time,
      "svix-signature": `v1,${digest}`,
    },
  });
}
function sweepRequest() {
  return new Request("https://pipstart.net/api/internal/email-monitor/sweep", {
    method: "POST",
    headers: { authorization: `Bearer ${sweepConfig.secret}` },
  });
}
function monitorStore(): MonitorStore {
  return {
    record: vi.fn().mockResolvedValue(undefined),
    claim: vi
      .fn()
      .mockResolvedValue({ state: "leased", token: "PRIVATE_LEASE" }),
    accept: vi.fn().mockResolvedValue(undefined),
  };
}
function sweepStore(): SweepStore {
  return {
    start: vi.fn().mockResolvedValue("PRIVATE_RUN_ID"),
    queue: vi.fn().mockResolvedValue(0),
    due: vi
      .fn()
      .mockResolvedValue([{ messageId: marker, type: "email.failed" }]),
    claim: vi
      .fn()
      .mockResolvedValue({ state: "leased", token: "PRIVATE_LEASE" }),
    accept: vi.fn().mockResolvedValue(undefined),
    health: vi.fn().mockResolvedValue({
      manual_alerts: 0,
      overdue_alerts: 0,
      stale_runs: 0,
    }),
    finish: vi.fn().mockResolvedValue(undefined),
  };
}
function sent() {
  return vi
    .fn<typeof fetch>()
    .mockImplementation(async () => Response.json({ id: providerId }));
}
function check(
  source: "webhook" | "sweep",
  stage: string,
  status = "not_attempted",
) {
  expect(console.error).toHaveBeenCalledWith(constant, {
    source,
    stage,
    provider_status_class: status,
  });
  const logs = JSON.stringify(vi.mocked(console.error).mock.calls);
  for (const privateValue of [
    marker,
    providerId,
    webhookSecret,
    config.apiKey,
    config.alertTo,
    sweepConfig.secret,
    "PRIVATE_LEASE",
    "PRIVATE_RUN_ID",
    "PRIVATE_BEARER_TOKEN",
    "private@example.test",
    "PRIVATE_EXCEPTION",
  ])
    expect(logs).not.toContain(privateValue);
}
it.each([
  [200, "2xx"],
  [299, "2xx"],
  [300, "3xx"],
  [399, "3xx"],
  [400, "4xx"],
  [429, "4xx"],
  [499, "4xx"],
  [500, "5xx"],
  [599, "5xx"],
  [199, "unavailable"],
  [600, "unavailable"],
  [NaN, "unavailable"],
  [Infinity, "unavailable"],
  [200.5, "unavailable"],
])("classifies only the status class for %s", (status, expected) =>
  expect(providerStatusClass(Number(status))).toBe(expected),
);
it("sanitizes unexpected runtime field values instead of printing them", () => {
  reportMonitorFailure(
    "PRIVATE_EXCEPTION" as "webhook",
    "PRIVATE_BEARER_TOKEN" as "record",
    "GENERATED_PRIVATE_KEY" as "2xx",
  );
  expect(console.error).toHaveBeenCalledExactlyOnceWith(constant, {
    source: "unknown",
    stage: "unknown",
    provider_status_class: "unavailable",
  });
});
it.each(["record", "claim", "accept"] as const)(
  "webhook identifies %s without exposing exception/payload or changing retry response",
  async (stage) => {
    const store = monitorStore(),
      send = sent();
    vi.mocked(store[stage]).mockRejectedValue(Error("PRIVATE_EXCEPTION"));
    const reply = await handleMonitoringWebhook(
      webhookRequest(),
      config,
      store,
      send,
    );
    expect(reply.status).toBe(503);
    expect(await reply.json()).toEqual({ status: "retry_required" });
    check("webhook", stage, stage === "accept" ? "2xx" : "not_attempted");
    expect(send).toHaveBeenCalledTimes(stage === "accept" ? 1 : 0);
    expect(console.error).toHaveBeenCalledWith(
      "PIPSTART_EMAIL_MONITOR_RETRY_REQUIRED",
    );
  },
);
it.each([401, 429, 503])(
  "webhook identifies rejected provider HTTP %s without accepting or retrying",
  async (status) => {
    const store = monitorStore(),
      send = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("PRIVATE_BEARER_TOKEN", { status }));
    expect(
      (await handleMonitoringWebhook(webhookRequest(), config, store, send))
        .status,
    ).toBe(503);
    check("webhook", "send", status < 500 ? "4xx" : "5xx");
    expect(store.accept).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
  },
);
it.each(["transport", "body"])(
  "webhook labels unavailable %s evidence without guessing a rejection status",
  async (kind) => {
    const store = monitorStore(),
      send = sent();
    if (kind === "transport")
      send.mockRejectedValue(Error("PRIVATE_EXCEPTION"));
    else
      send.mockResolvedValue(
        new Response(
          new ReadableStream({
            start(c) {
              c.error(Error("PRIVATE_EXCEPTION"));
            },
          }),
        ),
      );
    expect(
      (await handleMonitoringWebhook(webhookRequest(), config, store, send))
        .status,
    ).toBe(503);
    check("webhook", "send", "unavailable");
    expect(store.accept).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
  },
);
it("labels HTTP success with an invalid acknowledgement as send, not accept", async () => {
  const store = monitorStore(),
    send = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: [] }));
  expect(
    (await handleMonitoringWebhook(webhookRequest(), config, store, send))
      .status,
  ).toBe(503);
  check("webhook", "send", "2xx");
  expect(store.accept).not.toHaveBeenCalled();
});
it("keeps a signed malformed payload retryable without recording it or logging its contents", async () => {
  const store = monitorStore(),
    send = sent();
  const reply = await handleMonitoringWebhook(
    webhookRequest('{"type":"email.failed","data":"PRIVATE_BEARER_TOKEN"}'),
    config,
    store,
    send,
  );
  expect(reply.status).toBe(400);
  check("webhook", "payload");
  expect(store.record).not.toHaveBeenCalled();
  expect(send).not.toHaveBeenCalled();
});
it("does not add failure logs to successful delivery or claim busy responses", async () => {
  const store = monitorStore(),
    send = sent();
  expect(
    (await handleMonitoringWebhook(webhookRequest(), config, store, send))
      .status,
  ).toBe(200);
  vi.mocked(store.claim).mockResolvedValue({ state: "busy", token: null });
  expect(
    (await handleMonitoringWebhook(webhookRequest(), config, store, send))
      .status,
  ).toBe(503);
  expect(console.error).not.toHaveBeenCalled();
  expect(send).toHaveBeenCalledOnce();
});
it.each([
  "start",
  "queue",
  "due",
  "claim",
  "accept",
  "health",
  "finish",
] as const)(
  "sweep identifies %s while retaining partial/fail-closed behavior",
  async (stage) => {
    const store = sweepStore(),
      send = sent();
    vi.mocked(store[stage]).mockRejectedValue(Error("PRIVATE_EXCEPTION"));
    expect(
      (await handleDeliverySweep(sweepRequest(), sweepConfig, store, send))
        .status,
    ).toBe(503);
    check("sweep", stage, stage === "accept" ? "2xx" : "not_attempted");
    if (stage === "finish") check("sweep", "recovery_finish");
    if (["start", "queue", "due", "claim"].includes(stage))
      expect(send).not.toHaveBeenCalled();
    else expect(send).toHaveBeenCalledOnce();
  },
);
it("sweep separates provider rejection from a later health failure without stale provider status", async () => {
  const store = sweepStore(),
    send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("PRIVATE_EXCEPTION", { status: 429 }));
  vi.mocked(store.health).mockRejectedValue(Error("PRIVATE_EXCEPTION"));
  expect(
    (await handleDeliverySweep(sweepRequest(), sweepConfig, store, send))
      .status,
  ).toBe(503);
  check("sweep", "send", "4xx");
  check("sweep", "health");
  expect(store.accept).not.toHaveBeenCalled();
  expect(send).toHaveBeenCalledOnce();
});
it("sweep resets diagnostic stage/status for each alert", async () => {
  const store = sweepStore(),
    send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));
  vi.mocked(store.due).mockResolvedValue([
    { messageId: marker, type: "email.failed" },
    { messageId: "second", type: "email.bounced" },
  ]);
  vi.mocked(store.claim)
    .mockResolvedValueOnce({ state: "leased", token: "PRIVATE_LEASE" })
    .mockRejectedValueOnce(Error("PRIVATE_EXCEPTION"));
  const reply = await handleDeliverySweep(
    sweepRequest(),
    sweepConfig,
    store,
    send,
  );
  expect(reply.status).toBe(503);
  check("sweep", "send", "5xx");
  check("sweep", "claim");
  expect(send).toHaveBeenCalledOnce();
});
it.each(["webhook", "sweep"] as const)(
  "%s missing handler configuration is logged without changing its public response",
  async (source) => {
    const store = source === "webhook" ? monitorStore() : sweepStore();
    const send = sent();
    const reply =
      source === "webhook"
        ? await handleMonitoringWebhook(
            webhookRequest(),
            { ...config, apiKey: "" },
            store as MonitorStore,
            send,
          )
        : await handleDeliverySweep(
            sweepRequest(),
            { ...sweepConfig, apiKey: "" },
            store as SweepStore,
            send,
          );
    expect(reply.status).toBe(503);
    expect(await reply.json()).toEqual({ status: "not_configured" });
    check(source, "configuration");
    expect(send).not.toHaveBeenCalled();
  },
);
it.each(["webhook", "sweep"] as const)(
  "actual %s route logs unavailable database configuration without a network call",
  async (source) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const network = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", network);
    const reply = await (source === "webhook"
      ? webhookRoute(webhookRequest())
      : sweepRoute(sweepRequest()));
    expect(reply.status).toBe(503);
    expect(await reply.json()).toEqual({ status: "not_configured" });
    check(source, "configuration");
    expect(network).not.toHaveBeenCalled();
  },
);
