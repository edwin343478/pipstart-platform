import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  handleDeliverySweep,
  operationalAlertPayload,
  type SweepStore,
  type SweepAlert,
} from "./delivery-sweep";
import { handleMonitoringWebhook, type MonitorStore } from "./monitor";

const config = {
  secret: "a".repeat(64),
  apiKey: "test-key",
  alertTo: "pipstartalert2026@gmail.com",
};
const missing: SweepAlert = {
  messageId: "missing-message",
  type: "email.delivery_missing",
};
function request(authorization = `Bearer ${config.secret}`, method = "POST") {
  return new Request("https://pipstart.net/api/internal/email-monitor/sweep", {
    method,
    headers: { authorization },
  });
}
function setup() {
  const store: SweepStore = {
    start: vi.fn().mockResolvedValue("run-id"),
    queue: vi.fn().mockResolvedValue(1),
    due: vi.fn().mockResolvedValue([missing]),
    claim: vi.fn().mockResolvedValue({ state: "leased", token: "lease-token" }),
    accept: vi.fn().mockResolvedValue(undefined),
    finish: vi.fn().mockResolvedValue(undefined),
  };
  const send = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => Response.json({ id: "provider-id" }));
  return { store, send };
}
afterEach(() => vi.restoreAllMocks());

describe("M21 delivery sweep", () => {
  it.each([
    "",
    "Bearer wrong",
    `bearer ${config.secret}`,
    `Bearer ${"b".repeat(64)}`,
  ])("rejects invalid authorization before persistence", async (auth) => {
    const { store, send } = setup();
    expect(
      (await handleDeliverySweep(request(auth), config, store, send)).status,
    ).toBe(401);
    expect(store.start).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["", "short", "A".repeat(64)])(
    "fails closed for invalid secret configuration",
    async (secret) => {
      const { store, send } = setup();
      expect(
        (
          await handleDeliverySweep(
            request(),
            { ...config, secret },
            store,
            send,
          )
        ).status,
      ).toBe(503);
      expect(store.start).not.toHaveBeenCalled();
    },
  );
  it("rejects GET without changing state", async () => {
    const { store, send } = setup();
    expect(
      (
        await handleDeliverySweep(
          request(undefined, "GET"),
          config,
          store,
          send,
        )
      ).status,
    ).toBe(405);
    expect(store.start).not.toHaveBeenCalled();
  });
  it.each([
    { ...config, apiKey: "" },
    { ...config, alertTo: "other@example.com" },
  ])("requires the correct operator configuration", async (bad) => {
    const { store, send } = setup();
    expect(
      (await handleDeliverySweep(request(), bad, store, send)).status,
    ).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
  it("sends one qualified timeout alert with no learner data", async () => {
    const { store, send } = setup();
    const response = await handleDeliverySweep(request(), config, store, send);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    const init = send.mock.calls[0][1]!;
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual([config.alertTo]);
    expect(body.from).toContain("ops-alerts@account.pipstart.net");
    expect(body.subject).toBe(
      "[PipStart] Account email delivery not confirmed",
    );
    expect(body.text).toContain("not proof that the email failed");
    expect(init.headers).toHaveProperty(
      "Idempotency-Key",
      "pipstart-monitor:missing-message:email.delivery_missing",
    );
    expect(store.accept).toHaveBeenCalledWith(
      missing,
      "lease-token",
      "provider-id",
    );
    expect(store.finish).toHaveBeenCalledWith(
      "run-id",
      { queued: 1, accepted: 1, skipped: 0, failed: 0, deferred: 0 },
      "completed",
    );
  });
  it.each(["accepted", "resolved", "busy", "manual"] as const)(
    "does not send a %s alert",
    async (state) => {
      const { store, send } = setup();
      vi.mocked(store.claim).mockResolvedValue({ state, token: null });
      expect(
        (await handleDeliverySweep(request(), config, store, send)).status,
      ).toBe(200);
      expect(send).not.toHaveBeenCalled();
    },
  );
  it("handles an empty pending queue", async () => {
    const { store, send } = setup();
    vi.mocked(store.due).mockResolvedValue([]);
    vi.mocked(store.queue).mockResolvedValue(0);
    expect(
      (await handleDeliverySweep(request(), config, store, send)).status,
    ).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["timeout", "rejected", "invalid-response", "acknowledgement"])(
    "retains durable retry evidence on %s",
    async (mode) => {
      const { store, send } = setup();
      vi.spyOn(console, "error").mockImplementation(() => {});
      if (mode === "timeout")
        send.mockRejectedValue(new Error("private token"));
      if (mode === "rejected")
        send.mockResolvedValue(
          Response.json({ error: "private token" }, { status: 429 }),
        );
      if (mode === "invalid-response")
        send.mockResolvedValue(Response.json({ unexpected: "private token" }));
      if (mode === "acknowledgement")
        vi.mocked(store.accept).mockRejectedValue(new Error("private token"));
      const result = await handleDeliverySweep(request(), config, store, send);
      expect(result.status).toBe(503);
      expect(await result.text()).not.toContain("private token");
      expect(console.error).toHaveBeenCalledWith(
        "PIPSTART_EMAIL_SWEEP_ALERT_RETRY_REQUIRED",
      );
      expect(store.finish).toHaveBeenCalledWith(
        "run-id",
        expect.objectContaining({ failed: 1, accepted: 0 }),
        "partial",
      );
    },
  );
  it.each(["start", "queue", "due", "finish"] as const)(
    "fails safely on %s database errors",
    async (method) => {
      const { store, send } = setup();
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(store[method]).mockRejectedValue(new Error("private data"));
      const result = await handleDeliverySweep(request(), config, store, send);
      expect(result.status).toBe(503);
      expect(await result.text()).not.toContain("private data");
    },
  );
  it("defers rows when the processing budget is exhausted", async () => {
    const { store, send } = setup();
    let reads = 0;
    const now = () => (reads++ === 0 ? 0 : 36000);
    expect(
      (await handleDeliverySweep(request(), config, store, send, now)).status,
    ).toBe(503);
    expect(send).not.toHaveBeenCalled();
    expect(store.claim).not.toHaveBeenCalled();
    expect(store.finish).toHaveBeenCalledWith(
      "run-id",
      expect.objectContaining({ deferred: 1 }),
      "partial",
    );
  });
  it("refuses oversized batches", async () => {
    const { store, send } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(store.due).mockResolvedValue(
      Array.from({ length: 6 }, () => missing),
    );
    expect(
      (await handleDeliverySweep(request(), config, store, send)).status,
    ).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
  it("uses a stable payload without timestamps", () => {
    expect(operationalAlertPayload(missing, config.alertTo)).toEqual(
      operationalAlertPayload(missing, config.alertTo),
    );
  });
  it.each([
    "email.failed",
    "email.bounced",
    "email.complained",
    "email.suppressed",
  ] as const)(
    "matches the deployed webhook payload AND key exactly for %s",
    async (type) => {
      const webhookSecret = `whsec_${Buffer.alloc(24, 7).toString("base64")}`;
      const body = JSON.stringify({
        type,
        created_at: "2026-10-19T09:00:00Z",
        data: {
          email_id: "compat-message",
          from: "no-reply@account.pipstart.net",
        },
      });
      const timestamp = String(Math.floor(Date.now() / 1000));
      const signature = createHmac(
        "sha256",
        Buffer.from(webhookSecret.slice(6), "base64"),
      )
        .update(`msg_compat.${timestamp}.${body}`)
        .digest("base64");
      const webhookRequest = new Request(
        "https://pipstart.net/api/webhooks/resend",
        {
          method: "POST",
          body,
          headers: {
            "content-type": "application/json",
            "svix-id": "msg_compat",
            "svix-timestamp": timestamp,
            "svix-signature": `v1,${signature}`,
          },
        },
      );
      const webhookStore: MonitorStore = {
        record: vi.fn().mockResolvedValue(undefined),
        claim: vi.fn().mockResolvedValue({ state: "leased", token: "token" }),
        accept: vi.fn().mockResolvedValue(undefined),
      };
      const webhookSend = vi
        .fn<typeof fetch>()
        .mockImplementation(async () => Response.json({ id: "provider-id" }));
      expect(
        (
          await handleMonitoringWebhook(
            webhookRequest,
            { ...config, secret: webhookSecret },
            webhookStore,
            webhookSend,
          )
        ).status,
      ).toBe(200);
      const { store, send } = setup();
      vi.mocked(store.due).mockResolvedValue([
        { messageId: "compat-message", type },
      ]);
      expect(
        (await handleDeliverySweep(request(), config, store, send)).status,
      ).toBe(200);
      expect(send.mock.calls[0][1]?.body).toBe(
        webhookSend.mock.calls[0][1]?.body,
      );
      expect(send.mock.calls[0][1]?.headers).toEqual(
        webhookSend.mock.calls[0][1]?.headers,
      );
    },
  );
});
