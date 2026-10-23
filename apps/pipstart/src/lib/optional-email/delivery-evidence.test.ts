import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  handleOptionalDeliveryWebhook,
  parseOptionalDeliveryEvidence,
} from "./delivery-evidence";
const job = "00000000-0000-4000-8000-000000000001",
  provider = "00000000-0000-4000-8000-000000000004",
  secret = "whsec_" + Buffer.alloc(32, 7).toString("base64");
const payload = () => ({
  type: "email.delivered",
  created_at: "2026-10-21T10:00:00Z",
  data: {
    from: "PipStart <no-reply@account.pipstart.net>",
    to: ["Generated@Example.test"],
    email_id: provider,
    tags: { pipstart_job_id: job, pipstart_payload_hash: "a".repeat(64) },
  },
});
function request(body: string, signed = true) {
  const timestamp = String(Math.floor(Date.now() / 1000)),
    id = "msg_generated_delivery";
  const signature = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return new Request(
    "https://pipstart.net/api/webhooks/resend/optional-delivery",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "svix-id": id,
        "svix-timestamp": timestamp,
        "svix-signature": signed ? `v1,${signature}` : "v1,invalid",
      },
      body,
    },
  );
}
describe("optional signed delivery evidence", () => {
  it.each([
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.failed",
    "email.bounced",
    "email.complained",
    "email.suppressed",
  ])("parses %s as independent provider facts", (type) => {
    expect(
      parseOptionalDeliveryEvidence(
        JSON.stringify({ ...payload(), type }),
        "msg_generated",
      ),
    ).toEqual({
      eventId: "msg_generated",
      jobId: job,
      providerId: provider,
      preparedHash: "a".repeat(64),
      recipient: "generated@example.test",
      type,
      occurredAt: "2026-10-21T10:00:00.000Z",
    });
  });
  it("ignores security mail without tags and other-brand/operator senders", () => {
    const p = payload();
    expect(
      parseOptionalDeliveryEvidence(
        JSON.stringify({ ...p, data: { ...p.data, tags: {} } }),
        "id",
      ),
    ).toBeNull();
    for (const from of ["other@other.test", "ops-alerts@account.pipstart.net"])
      expect(
        parseOptionalDeliveryEvidence(
          JSON.stringify({ ...p, data: { ...p.data, from } }),
          "id",
        ),
      ).toBeNull();
  });
  it.each([
    (p) => ({
      ...p,
      data: { ...p.data, to: ["a@example.test", "b@example.test"] },
    }),
    (p) => ({ ...p, data: { ...p.data, email_id: "bad" } }),
    (p) => ({
      ...p,
      data: {
        ...p.data,
        tags: { pipstart_job_id: job, pipstart_payload_hash: "bad" },
      },
    }),
    (p) => ({ ...p, created_at: "invalid" }),
  ] as Array<(p: ReturnType<typeof payload>) => unknown>)(
    "rejects malformed correlated evidence",
    (change) => {
      expect(() =>
        parseOptionalDeliveryEvidence(
          JSON.stringify(change(payload())),
          "msg_generated",
        ),
      ).toThrow();
    },
  );
  it("requires its own configuration and valid signature before persistence", async () => {
    const store = { record: vi.fn() };
    expect(
      (await handleOptionalDeliveryWebhook(request("{}"), "", store)).status,
    ).toBe(503);
    expect(
      (
        await handleOptionalDeliveryWebhook(
          request(JSON.stringify(payload()), false),
          secret,
          store,
        )
      ).status,
    ).toBe(401);
    expect(store.record).not.toHaveBeenCalled();
  });
  it.each(["recorded", "duplicate", "ignored"] as const)(
    "returns bounded %s response",
    async (status) => {
      const store = { record: vi.fn().mockResolvedValue(status) },
        response = await handleOptionalDeliveryWebhook(
          request(JSON.stringify(payload())),
          secret,
          store,
        );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status });
      expect(store.record).toHaveBeenCalledOnce();
    },
  );
  it("rejects oversized bodies, non-JSON and malformed signed JSON without persistence", async () => {
    const store = { record: vi.fn() };
    expect(
      (
        await handleOptionalDeliveryWebhook(
          request("x".repeat(65537)),
          secret,
          store,
        )
      ).status,
    ).toBe(413);
    const r = request("{}");
    r.headers.set("content-type", "text/plain");
    expect((await handleOptionalDeliveryWebhook(r, secret, store)).status).toBe(
      415,
    );
    expect(
      (await handleOptionalDeliveryWebhook(request("{"), secret, store)).status,
    ).toBe(400);
    expect(store.record).not.toHaveBeenCalled();
  });
  it("keeps storage errors private and requests provider redelivery, not email resend", async () => {
    const r = await handleOptionalDeliveryWebhook(
      request(JSON.stringify(payload())),
      secret,
      { record: vi.fn().mockRejectedValue(Error("private recipient details")) },
    );
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ status: "retry_required" });
  });
});
