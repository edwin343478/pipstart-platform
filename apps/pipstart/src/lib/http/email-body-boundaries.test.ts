import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleUnsubscribe } from "../email-unsubscribe/core";
import { handleMonitoringWebhook } from "../email-monitor/monitor";
import { handleAddressSuppressionWebhook } from "../optional-email/address-suppression";
import { handleOptionalDeliveryWebhook } from "../optional-email/delivery-evidence";
import { requestBodyTimeoutMs } from "./request-body";
const secret = "whsec_" + Buffer.alloc(32, 7).toString("base64");
const cases = ["unsubscribe", "monitor", "suppression", "delivery"] as const;
function setup(kind: (typeof cases)[number]) {
  const record = vi.fn().mockResolvedValue("recorded"),
    apply = vi.fn().mockResolvedValue("unsubscribed"),
    send = vi.fn(),
    claim = vi.fn(),
    accept = vi.fn();
  const body =
    kind === "unsubscribe"
      ? "List-Unsubscribe=One-Click"
      : " \n" +
        JSON.stringify({
          type: kind === "suppression" ? "email.bounced" : "email.delivered",
          created_at: "2026-10-24T00:00:00Z",
          data: {
            from: "PipStart <no-reply@account.pipstart.net>",
            to: ["generated@example.test"],
            email_id: "00000000-0000-4000-8000-000000000004",
            subject: "Résumé 🙂",
            bounce: { type: "Permanent" },
            ...(kind === "delivery"
              ? {
                  tags: {
                    pipstart_job_id: "00000000-0000-4000-8000-000000000001",
                    pipstart_payload_hash: "a".repeat(64),
                  },
                }
              : {}),
          },
        });
  const timestamp = String(Math.floor(Date.now() / 1000)),
    id = "msg_generated_stream";
  const headers =
    kind === "unsubscribe"
      ? { "content-type": "application/x-www-form-urlencoded" }
      : {
          "content-type": "application/json",
          "svix-id": id,
          "svix-timestamp": timestamp,
          "svix-signature":
            "v1," +
            createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
              .update(`${id}.${timestamp}.${body}`)
              .digest("base64"),
        };
  const url =
    kind === "unsubscribe"
      ? "https://pipstart.net/unsubscribe?token=" + "a".repeat(64)
      : "https://pipstart.net/api/webhooks/resend";
  return {
    body,
    record,
    apply,
    send,
    claim,
    accept,
    maxBytes: kind === "unsubscribe" ? 2048 : 65536,
    request(stream: ReadableStream<Uint8Array>, signal?: AbortSignal) {
      return new Request(url, {
        method: "POST",
        headers,
        body: stream,
        duplex: "half",
        signal,
      } as RequestInit);
    },
    run(req: Request) {
      if (kind === "unsubscribe")
        return handleUnsubscribe(req, { lookup: vi.fn(), apply });
      if (kind === "monitor")
        return handleMonitoringWebhook(
          req,
          {
            secret,
            apiKey: "generated-not-real",
            alertTo: "pipstartalert2026@gmail.com",
          },
          { record, claim, accept },
          send,
        );
      if (kind === "suppression")
        return handleAddressSuppressionWebhook(req, secret, { record });
      return handleOptionalDeliveryWebhook(req, secret, { record });
    },
  };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe.each(cases)("%s request-body safety", (kind) => {
  it("accepts valid split bytes without normalization or authentication changes", async () => {
    const d = setup(kind),
      bytes = new TextEncoder().encode(d.body);
    const response = await d.run(
      d.request(
        new ReadableStream({
          start(c) {
            for (let i = 0; i < bytes.length; i += 2)
              c.enqueue(bytes.slice(i, i + 2));
            c.close();
          },
        }),
      ),
    );
    expect(response.status).toBe(200);
    expect(kind === "unsubscribe" ? d.apply : d.record).toHaveBeenCalledOnce();
    expect(d.send).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("times out without storage or provider activity even if cancellation hangs", async () => {
    const d = setup(kind),
      cancel = vi.fn(() => new Promise<void>(() => {}));
    const pending = d.run(d.request(new ReadableStream({ cancel })));
    await vi.advanceTimersByTimeAsync(requestBodyTimeoutMs + 1);
    const response = await pending;
    expect(response.status).toBe(408);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(d.record).not.toHaveBeenCalled();
    expect(d.apply).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects actual byte overflow without waiting for cancellation", async () => {
    const d = setup(kind),
      req = d.request(
        new ReadableStream({
          start(c) {
            c.enqueue(new Uint8Array(d.maxBytes + 1));
          },
          cancel() {
            return new Promise<void>(() => {});
          },
        }),
      );
    req.headers.set("content-length", "1");
    expect((await d.run(req)).status).toBe(413);
    expect(d.record).not.toHaveBeenCalled();
    expect(d.apply).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
  });
  it("bounds empty-chunk floods", async () => {
    const d = setup(kind),
      req = d.request(
        new ReadableStream({
          pull(c) {
            c.enqueue(new Uint8Array(0));
          },
        }),
      );
    expect((await d.run(req)).status).toBe(400);
    expect(d.record).not.toHaveBeenCalled();
    expect(d.apply).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects malformed UTF-8 without mutating state", async () => {
    const d = setup(kind),
      req = d.request(
        new ReadableStream({
          start(c) {
            c.enqueue(new Uint8Array([255]));
            c.close();
          },
        }),
      );
    expect((await d.run(req)).status).toBe(400);
    expect(d.record).not.toHaveBeenCalled();
    expect(d.apply).not.toHaveBeenCalled();
  });
  it("handles abort during a stalled body without mutating state", async () => {
    const d = setup(kind),
      abort = new AbortController(),
      pending = d.run(d.request(new ReadableStream(), abort.signal));
    abort.abort();
    expect((await pending).status).toBe(400);
    expect(d.record).not.toHaveBeenCalled();
    expect(d.apply).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  if (kind !== "unsubscribe")
    it("still rejects a signed-body mismatch", async () => {
      const d = setup(kind),
        bytes = new TextEncoder().encode(d.body + " ");
      expect(
        (
          await d.run(
            d.request(
              new ReadableStream({
                start(c) {
                  c.enqueue(bytes);
                  c.close();
                },
              }),
            ),
          )
        ).status,
      ).toBe(401);
      expect(d.record).not.toHaveBeenCalled();
      expect(d.send).not.toHaveBeenCalled();
    });
});
