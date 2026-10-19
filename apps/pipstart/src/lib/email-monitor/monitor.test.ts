import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  alertSender,
  eventTypes,
  handleMonitoringWebhook,
  parseEvidence,
  verifySignature,
  type MonitorStore,
} from "./monitor";

const secret = `whsec_${Buffer.alloc(24, 7).toString("base64")}`;
const config = {
  secret,
  apiKey: "test-key-not-real",
  alertTo: "pipstartalert2026@gmail.com",
};
function payload(
  type = "email.failed",
  from = "PipStart <no-reply@account.pipstart.net>",
) {
  return JSON.stringify({
    type,
    created_at: "2026-10-19T09:00:00Z",
    data: {
      email_id: "test-email-id",
      from,
      to: ["private@example.com"],
      subject: "private subject",
      html: "secret recovery token",
      failed: { reason: "private-provider-error" },
    },
  });
}
function headers(
  body: string,
  timestamp = String(Math.floor(Date.now() / 1000)),
) {
  const digest = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
    .update(`msg_test.${timestamp}.${body}`)
    .digest("base64");
  return new Headers({
    "content-type": "application/json",
    "svix-id": "msg_test",
    "svix-timestamp": timestamp,
    "svix-signature": `v1,${digest}`,
  });
}
function request(body = payload(), overrides?: Headers) {
  return new Request("https://pipstart.net/api/webhooks/resend", {
    method: "POST",
    body,
    headers: overrides ?? headers(body),
  });
}
function setup() {
  const store: MonitorStore = {
    record: vi.fn().mockResolvedValue(undefined),
    claim: vi.fn().mockResolvedValue({ state: "leased", token: "lease" }),
    accept: vi.fn().mockResolvedValue(undefined),
  };
  const send = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ id: "alert-provider-id" }));
  return { store, send };
}

describe("PipStart account-email monitor", () => {
  it("matches the independent Svix published verification vector", () => {
    const body = '{"event_type":"ping","data":{"success":true}}';
    const h = new Headers({
      "svix-id": "msg_loFOjxBNrRLzqYUf",
      "svix-timestamp": "1731705121",
      "svix-signature": "v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0=",
    });
    expect(
      verifySignature(body, h, "whsec_plJ3nmyCDGBKInavdOK15jsl", 1731705121000),
    ).toBe(true);
  });
  it("rejects tampered bodies and supports rotated signatures", () => {
    const body = payload();
    const h = headers(body);
    expect(verifySignature(body + " ", h, secret)).toBe(false);
    h.set(
      "svix-signature",
      `v1,${Buffer.alloc(32).toString("base64")} ${h.get("svix-signature")}`,
    );
    expect(verifySignature(body, h, secret)).toBe(true);
  });
  it.each([-301, 301])(
    "rejects stale/future signatures (%s seconds)",
    (offset) => {
      const body = payload();
      expect(
        verifySignature(
          body,
          headers(body, String(Math.floor(Date.now() / 1000) + offset)),
          secret,
        ),
      ).toBe(false);
    },
  );
  it("rejects missing signature without accessing persistence", async () => {
    const { store, send } = setup();
    const h = headers(payload());
    h.delete("svix-signature");
    expect(
      (
        await handleMonitoringWebhook(
          request(payload(), h),
          config,
          store,
          send,
        )
      ).status,
    ).toBe(401);
    expect(store.record).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["", "whsec_bad", "not-a-key"])(
    "rejects invalid secrets: %s",
    (key) => {
      expect(verifySignature(payload(), headers(payload()), key)).toBe(false);
    },
  );
  it.each(eventTypes)("records only minimal evidence for %s", async (type) => {
    const { store, send } = setup();
    const result = await handleMonitoringWebhook(
      request(payload(type)),
      config,
      store,
      send,
    );
    expect(result.status).toBe(200);
    expect(store.record).toHaveBeenCalledWith({
      eventId: "msg_test",
      messageId: "test-email-id",
      type,
      occurredAt: "2026-10-19T09:00:00.000Z",
    });
    if (
      [
        "email.failed",
        "email.bounced",
        "email.complained",
        "email.suppressed",
      ].includes(type)
    ) {
      expect(send).toHaveBeenCalledOnce();
      const init = send.mock.calls[0][1]!;
      expect(JSON.stringify(init)).not.toMatch(
        /private@example|private subject|secret recovery|private-provider/,
      );
      expect(JSON.parse(init.body as string).to).toEqual([config.alertTo]);
    } else {
      expect(send).not.toHaveBeenCalled();
    }
  });
  it.each([
    alertSender,
    "Other <hello@skillcima.com>",
    "no-reply@account.pipstart.net.evil.test",
  ])("ignores unrelated/alert sender %s", async (from) => {
    const { store, send } = setup();
    expect(
      (
        await handleMonitoringWebhook(
          request(payload("email.failed", from)),
          config,
          store,
          send,
        )
      ).status,
    ).toBe(200);
    expect(store.record).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it("ignores tracking events", () => {
    expect(parseEvidence(payload("email.opened"), "msg_test")).toBeNull();
  });
  it("deduplicates accepted alerts without sending again", async () => {
    const { store, send } = setup();
    vi.mocked(store.claim).mockResolvedValue({
      state: "accepted",
      token: null,
    });
    expect(
      (await handleMonitoringWebhook(request(), config, store, send)).status,
    ).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["busy", "manual"] as const)(
    "requests retry/operator review for %s",
    async (state) => {
      const { store, send } = setup();
      vi.mocked(store.claim).mockResolvedValue({ state, token: null });
      expect(
        (await handleMonitoringWebhook(request(), config, store, send)).status,
      ).toBe(503);
      expect(send).not.toHaveBeenCalled();
    },
  );
  it.each(["timeout", "provider", "database"])(
    "keeps the alert recoverable on %s failure",
    async (failure) => {
      const { store, send } = setup();
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      if (failure === "timeout")
        send.mockRejectedValue(new Error("secret token"));
      if (failure === "provider")
        send.mockResolvedValue(
          Response.json({ error: "secret token" }, { status: 429 }),
        );
      if (failure === "database")
        vi.mocked(store.record).mockRejectedValue(new Error("secret token"));
      expect(
        (await handleMonitoringWebhook(request(), config, store, send)).status,
      ).toBe(503);
      expect(store.accept).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith("PIPSTART_EMAIL_MONITOR_RETRY_REQUIRED");
      log.mockRestore();
    },
  );
  it("uses the same send key/body after a lost DB acknowledgement", async () => {
    const { store, send } = setup();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(store.accept).mockRejectedValueOnce(new Error("db"));
    send.mockImplementation(async () => Response.json({ id: "same-alert-id" }));
    expect(
      (await handleMonitoringWebhook(request(), config, store, send)).status,
    ).toBe(503);
    expect(
      (await handleMonitoringWebhook(request(), config, store, send)).status,
    ).toBe(200);
    expect(send.mock.calls[0][1]?.body).toBe(send.mock.calls[1][1]?.body);
    expect(send.mock.calls[0][1]?.headers).toEqual(
      send.mock.calls[1][1]?.headers,
    );
    log.mockRestore();
  });
  it("bounds the actual streamed body even without content-length", async () => {
    const { store, send } = setup();
    const body = "x".repeat(65537);
    expect(
      (await handleMonitoringWebhook(request(body), config, store, send))
        .status,
    ).toBe(413);
    expect(store.record).not.toHaveBeenCalled();
  });
  it.each([
    "not json",
    JSON.stringify({
      type: "email.failed",
      data: { from: "no-reply@account.pipstart.net" },
    }),
  ])("rejects malformed signed payloads", async (body) => {
    const { store, send } = setup();
    expect(
      (await handleMonitoringWebhook(request(body), config, store, send))
        .status,
    ).toBe(400);
    expect(store.record).not.toHaveBeenCalled();
  });
  it("fails closed for missing/wrong operator configuration", async () => {
    const { store, send } = setup();
    expect(
      (
        await handleMonitoringWebhook(
          request(),
          { ...config, alertTo: "other@example.com" },
          store,
          send,
        )
      ).status,
    ).toBe(503);
    expect(store.record).not.toHaveBeenCalled();
  });
});
