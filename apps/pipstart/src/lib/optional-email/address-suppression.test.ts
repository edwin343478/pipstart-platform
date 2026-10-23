import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  handleAddressSuppressionWebhook,
  normalizeOptionalAddress,
  parseAddressEvidence,
} from "./address-suppression";
const secret = `whsec_${Buffer.alloc(24, 3).toString("base64")}`;
function payload(type = "email.bounced", data = {}) {
  return JSON.stringify({
    type,
    created_at: "2026-10-21T10:00:00Z",
    data: {
      from: "PipStart <no-reply@account.pipstart.net>",
      email_id: "generated-provider",
      to: ["Learner+tag@Example.test"],
      bounce: { type: "Permanent" },
      subject: "private",
      html: "private-token",
      ...data,
    },
  });
}
function request(body = payload(), overrides: Record<string, string> = {}) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
    .update(`msg_generated.${timestamp}.${body}`)
    .digest("base64");
  return new Request(
    "https://pipstart.net/api/webhooks/resend/optional-suppression",
    {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "svix-id": "msg_generated",
        "svix-timestamp": timestamp,
        "svix-signature": `v1,${signature}`,
        ...overrides,
      },
    },
  );
}
describe("optional address suppression intake", () => {
  it("normalizes case/spaces but never removes dots or plus tags", () => {
    expect(normalizeOptionalAddress(" A.B+tag@Example.test ")).toBe(
      "a.b+tag@example.test",
    );
    expect(normalizeOptionalAddress("a.b@example.test")).not.toBe(
      normalizeOptionalAddress("ab@example.test"),
    );
  });
  it.each([
    null,
    "",
    "bad",
    "x@y",
    "x@y.test\n",
    "Name <a@b.test>",
    "a@b.test,c@b.test",
    "ä@b.test",
    "K@b.test",
    "a@-bad.test",
    "a@bad-.test",
    "a".repeat(250) + "@b.test",
  ])("rejects unsafe/non-supported mailbox %s", (value) => {
    expect(normalizeOptionalAddress(value)).toBeNull();
  });
  it.each([
    ["email.bounced", "hard_bounce"],
    ["email.complained", "complaint"],
    ["email.suppressed", "provider_suppressed"],
  ])("maps %s to minimal evidence", (type, reason) => {
    expect(parseAddressEvidence(payload(type), "msg_generated")).toEqual({
      eventId: "msg_generated",
      messageId: "generated-provider",
      address: "learner+tag@example.test",
      reason,
      occurredAt: "2026-10-21T10:00:00.000Z",
    });
  });
  it.each(["Transient", "Undetermined"])(
    "does not permanently block %s bounce",
    (type) => {
      expect(
        parseAddressEvidence(
          payload("email.bounced", { bounce: { type } }),
          "msg_generated",
        ),
      ).toBeNull();
    },
  );
  it.each([
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.failed",
    "suppression.removed",
  ])("ignores %s and never clears a block", (type) => {
    expect(parseAddressEvidence(payload(type), "msg_generated")).toBeNull();
  });
  it.each([
    "Skillcima <no-reply@skillcima.com>",
    "ops-alerts@account.pipstart.net",
    "attacker@example.test",
  ])("excludes sender %s", (from) => {
    expect(
      parseAddressEvidence(
        payload("email.complained", { from }),
        "msg_generated",
      ),
    ).toBeNull();
  });
  it.each([[], ["a@b.test", "c@b.test"], ["Display <a@b.test>"], null])(
    "rejects absent/ambiguous recipient %j",
    (to) => {
      expect(() =>
        parseAddressEvidence(
          payload("email.complained", { to }),
          "msg_generated",
        ),
      ).toThrow();
    },
  );
  it("requires known bounce classification", () => {
    expect(() =>
      parseAddressEvidence(
        payload("email.bounced", { bounce: {} }),
        "msg_generated",
      ),
    ).toThrow();
  });
  it.each(["recorded", "duplicate"] as const)(
    "acknowledges durable %s without logging payloads or sending email",
    async (status) => {
      const record = vi.fn().mockResolvedValue(status),
        fetchSpy = vi
          .spyOn(globalThis, "fetch")
          .mockRejectedValue(new Error("Must not send"));
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        const response = await handleAddressSuppressionWebhook(
          request(),
          secret,
          { record },
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ status });
        expect(record).toHaveBeenCalledOnce();
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(log).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
        log.mockRestore();
      }
    },
  );
  it("rejects invalid signature before persistence", async () => {
    const record = vi.fn();
    expect(
      (
        await handleAddressSuppressionWebhook(
          request(payload(), { "svix-signature": "v1,bad" }),
          secret,
          { record },
        )
      ).status,
    ).toBe(401);
    expect(record).not.toHaveBeenCalled();
  });
  it("ignores unrelated events without persistence", async () => {
    const record = vi.fn();
    expect(
      await (
        await handleAddressSuppressionWebhook(
          request(payload("email.delivered")),
          secret,
          { record },
        )
      ).json(),
    ).toEqual({ status: "ignored" });
    expect(record).not.toHaveBeenCalled();
  });
  it("returns redacted retry status if atomic persistence fails", async () => {
    const response = await handleAddressSuppressionWebhook(request(), secret, {
      record: vi.fn().mockRejectedValue(new Error("private recipient")),
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "retry_required" });
  });
  it("rejects malformed JSON after authentication", async () => {
    expect(
      (
        await handleAddressSuppressionWebhook(request("{"), secret, {
          record: vi.fn(),
        })
      ).status,
    ).toBe(400);
  });
  it("rejects non-JSON and oversize bodies", async () => {
    expect(
      (
        await handleAddressSuppressionWebhook(
          request(payload(), { "content-type": "text/plain" }),
          secret,
          { record: vi.fn() },
        )
      ).status,
    ).toBe(415);
    expect(
      (
        await handleAddressSuppressionWebhook(
          request("x".repeat(65537)),
          secret,
          { record: vi.fn() },
        )
      ).status,
    ).toBe(413);
  });
  it("stays unavailable without dedicated secret/store", async () => {
    expect(
      (
        await handleAddressSuppressionWebhook(request(), "", {
          record: vi.fn(),
        })
      ).status,
    ).toBe(503);
    expect(
      (await handleAddressSuppressionWebhook(request(), secret, null)).status,
    ).toBe(503);
  });
  it("rejects non-POST", async () => {
    expect(
      (
        await handleAddressSuppressionWebhook(
          new Request("https://pipstart.net"),
          secret,
          { record: vi.fn() },
        )
      ).status,
    ).toBe(405);
  });
});
