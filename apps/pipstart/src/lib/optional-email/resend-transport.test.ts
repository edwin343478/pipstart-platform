import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  createOptionalResendTransport,
  optionalPreparedHash,
  optionalSender,
} from "./resend-transport";
import { processOptionalEmailJob } from "./queue";
const id = "00000000-0000-4000-8000-000000000001",
  provider = "00000000-0000-4000-8000-000000000004",
  key = `pipstart-opt-v1-${id}`;
const message = () => ({
  jobId: id,
  to: "generated@example.test",
  subject: "Generated",
  html: "<p>Generated</p>",
  text: "Generated",
  headers: {
    "List-Unsubscribe": `<https://pipstart.net/unsubscribe?token=${"a".repeat(64)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  },
});
const config = () => ({
  enabled: true,
  apiKey: "re_GENERATED_ONLY_12345",
  receipts: { acknowledge: vi.fn().mockResolvedValue(undefined) },
});
const success = () => Response.json({ id: provider });
describe("dormant immediate optional Resend transport", () => {
  it.each([
    {},
    { enabled: false },
    { enabled: true },
    { enabled: true, apiKey: "re_GENERATED_ONLY_12345" },
    {
      enabled: true,
      apiKey: "whsec_invalid",
      receipts: { acknowledge: vi.fn() },
    },
  ])("has no transport without explicit complete configuration %j", (c) => {
    const send = vi.fn();
    expect(createOptionalResendTransport(c, send)).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
  it("sends precisely the persisted body/key/unsubscribe headers and two correlation tags", async () => {
    const send = vi.fn().mockResolvedValue(success()),
      c = config(),
      m = message();
    expect(
      await createOptionalResendTransport(c, send)!.deliver(m, key),
    ).toEqual({ providerId: provider });
    expect(send).toHaveBeenCalledOnce();
    const [url, options] = send.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.redirect).toBe("error");
    expect(options.cache).toBe("no-store");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options.headers["Idempotency-Key"]).toBe(key);
    expect(JSON.parse(options.body)).toEqual({
      from: optionalSender,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      text: m.text,
      headers: m.headers,
      tags: [
        { name: "pipstart_job_id", value: id },
        { name: "pipstart_payload_hash", value: optionalPreparedHash(m) },
      ],
    });
    expect(c.receipts.acknowledge).toHaveBeenCalledWith(
      id,
      provider,
      optionalPreparedHash(m),
    );
  });
  it.each(["bad", "pipstart-opt-v1-other"])(
    "refuses mismatched key %s without fetch",
    async (bad) => {
      const send = vi.fn();
      await expect(
        createOptionalResendTransport(config(), send)!.deliver(message(), bad),
      ).rejects.toThrow(/^Optional provider outcome unavailable/);
      expect(send).not.toHaveBeenCalled();
    },
  );
  it.each([
    (m) => ({ ...m, cc: "other@example.test" }),
    (m) => ({ ...m, to: "a@example.test,b@example.test" }),
    (m) => ({ ...m, subject: "header\ninjection" }),
    (m) => ({
      ...m,
      headers: { ...m.headers, "List-Unsubscribe": "<https://evil.test>" },
    }),
    (m) => ({ ...m, html: "" }),
    (m) => ({ ...m, headers: { ...m.headers, Authorization: "bad" } }),
  ] as Array<(m: ReturnType<typeof message>) => unknown>)(
    "rejects malformed/expanded envelope",
    async (change) => {
      const send = vi.fn();
      await expect(
        createOptionalResendTransport(config(), send)!.deliver(
          change(message()) as ReturnType<typeof message>,
          key,
        ),
      ).rejects.toThrow();
      expect(send).not.toHaveBeenCalled();
    },
  );
  it.each([400, 401, 403, 409, 422, 429, 500, 503])(
    "never retries HTTP %s or echoes provider response",
    async (status) => {
      const send = vi
        .fn()
        .mockResolvedValue(new Response("private body", { status }));
      await expect(
        createOptionalResendTransport(config(), send)!.deliver(message(), key),
      ).rejects.toThrow(/^Optional provider outcome unavailable/);
      expect(send).toHaveBeenCalledOnce();
    },
  );
  it.each([
    () =>
      new Response("not json", {
        headers: { "content-type": "application/json" },
      }),
    () => Response.json({ id: "bad" }),
    () => Response.json({}),
    () =>
      new Response("x".repeat(17000), {
        headers: { "content-type": "application/json" },
      }),
    () => new Response("{}", { headers: { "content-type": "text/html" } }),
  ])("rejects malformed or excessive acknowledgements", async (response) => {
    const send = vi.fn().mockResolvedValue(response()),
      c = config();
    await expect(
      createOptionalResendTransport(c, send)!.deliver(message(), key),
    ).rejects.toThrow();
    expect(send).toHaveBeenCalledOnce();
    expect(c.receipts.acknowledge).not.toHaveBeenCalled();
  });
  it("treats network and receipt-checkpoint loss as uncertain without another provider call", async () => {
    for (const failure of ["network", "receipt"]) {
      const send = vi.fn(),
        c = config();
      if (failure === "network") send.mockRejectedValue(Error("private"));
      else {
        send.mockResolvedValue(success());
        c.receipts.acknowledge.mockRejectedValue(Error("private"));
      }
      await expect(
        createOptionalResendTransport(c, send)!.deliver(message(), key),
      ).rejects.toThrow(/^Optional provider outcome unavailable/);
      expect(send).toHaveBeenCalledOnce();
    }
  });
  it("hashes UTF-8 byte lengths with a fixed field order, including unsubscribe headers", () => {
    const m = { ...message(), html: "<p>Learning 😀</p>", text: "Learning 😀" };
    const fields = [
      m.jobId,
      m.to,
      m.subject,
      m.html,
      m.text,
      m.headers["List-Unsubscribe"],
      m.headers["List-Unsubscribe-Post"],
    ];
    expect(optionalPreparedHash(m)).toBe(
      createHash("sha256")
        .update(fields.map((v) => Buffer.byteLength(v) + ":" + v).join(""))
        .digest("hex"),
    );
    expect(optionalPreparedHash({ ...m, text: m.text + ":" })).not.toBe(
      optionalPreparedHash(m),
    );
  });
  it("uses the durable queue marker and final preference read before the only network call", async () => {
    const calls: string[] = [],
      c = config(),
      send = vi.fn().mockImplementation(async () => {
        calls.push("send");
        return success();
      });
    const job = {
      jobId: id,
      userId: "00000000-0000-4000-8000-000000000003",
      kind: "learning_lesson" as const,
      subject: "Generated",
      html: "<p>Generated</p>",
      text: "Generated",
    };
    const d = {
      queue: {
        claim: vi
          .fn()
          .mockResolvedValue({ status: "claimed", token: provider, job }),
        begin: vi.fn().mockImplementation(async () => {
          calls.push("begin");
          return { version: 2, status: "started" } as const;
        }),
        finish: vi.fn().mockResolvedValue(true),
        release: vi.fn(),
      },
      store: {
        load: vi.fn().mockImplementation(async () => {
          calls.push("read");
          return {
            status: "active",
            email: "generated@example.test",
            learning: true,
            partner: true,
            frequency: "all",
          };
        }),
      },
      issuer: { issue: vi.fn().mockResolvedValue(true) },
      transport: createOptionalResendTransport(c, send),
    };
    expect(await processOptionalEmailJob(id, d, true)).toEqual({
      status: "accepted",
    });
    expect(calls.slice(-3)).toEqual(["begin", "read", "send"]);
    expect(d.queue.release).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
  });
  it("leaves uncertain adapter handoff manual, never releases for retry", async () => {
    const c = config(),
      send = vi.fn().mockRejectedValue(Error("private")),
      job = {
        jobId: id,
        userId: provider,
        kind: "partner_offer" as const,
        subject: "Generated",
        html: "<p>Generated</p>",
        text: "Generated",
      };
    const queue = {
      claim: vi
        .fn()
        .mockResolvedValue({ status: "claimed", token: provider, job }),
      begin: vi.fn().mockResolvedValue({ version: 2, status: "started" }),
      finish: vi.fn().mockResolvedValue(true),
      release: vi.fn(),
    };
    expect(
      await processOptionalEmailJob(
        id,
        {
          queue,
          store: {
            load: vi.fn().mockResolvedValue({
              status: "active",
              email: "generated@example.test",
              learning: true,
              partner: true,
              frequency: "all",
            }),
          },
          issuer: { issue: vi.fn().mockResolvedValue(true) },
          transport: createOptionalResendTransport(c, send),
        },
        true,
      ),
    ).toEqual({ status: "manual" });
    expect(queue.finish).toHaveBeenCalledWith(
      id,
      provider,
      "manual",
      "provider_uncertain",
      null,
    );
    expect(queue.release).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
  });
});
