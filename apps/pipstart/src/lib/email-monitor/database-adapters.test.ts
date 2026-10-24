import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as sweep } from "../../app/api/internal/email-monitor/sweep/route";
import { POST as webhook } from "../../app/api/webhooks/resend/route";
import { monitorDatabaseTimeoutMs } from "./database-fetch";

const secret = "a".repeat(64),
  webhookSecret = "whsec_" + Buffer.alloc(24, 7).toString("base64");
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://generated.supabase.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "generated-public");
  vi.stubEnv("SUPABASE_SECRET_KEY", "generated-secret");
  vi.stubEnv("PIPSTART_EMAIL_MONITOR_SWEEP_SECRET", secret);
  vi.stubEnv("PIPSTART_ALERT_RESEND_API_KEY", "generated-provider");
  vi.stubEnv("PIPSTART_OPERATIONAL_ALERT_TO", "pipstartalert2026@gmail.com");
  vi.stubEnv("PIPSTART_RESEND_WEBHOOK_SECRET", webhookSecret);
  vi.stubEnv("PIPSTART_EMAIL_MONITOR_HEARTBEAT_URL", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function sweepRequest(authorization = "Bearer " + secret) {
  return new Request("https://pipstart.net/api/internal/email-monitor/sweep", {
    method: "POST",
    headers: { authorization },
  });
}
function webhookRequest() {
  const body = JSON.stringify({
    type: "email.sent",
    created_at: "2026-10-19T09:00:00Z",
    data: {
      email_id: "generated-message",
      from: "PipStart <no-reply@account.pipstart.net>",
    },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac(
    "sha256",
    Buffer.from(webhookSecret.slice(6), "base64"),
  )
    .update("msg_generated." + timestamp + "." + body)
    .digest("base64");
  return new Request("https://pipstart.net/api/webhooks/resend", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": "msg_generated",
      "svix-timestamp": timestamp,
      "svix-signature": "v1," + signature,
    },
  });
}
describe("real monitoring route adapters and Supabase SDK with fake transport only", () => {
  it("runs the actual sweep SDK adapter through the bounded fetch for every operation", async () => {
    const send = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      expect(url).toContain("https://generated.supabase.test/rest/v1/");
      if (url.includes("pipstart_queue_missing_email_deliveries"))
        return Response.json(0);
      if (url.includes("pipstart_list_due_email_alerts"))
        return Response.json([]);
      if (url.includes("pipstart_email_monitor_health"))
        return Response.json({
          manual_alerts: 0,
          overdue_alerts: 0,
          stale_runs: 0,
        });
      if (url.includes("pipstart_email_monitor_sweeps"))
        return Response.json({ id: "generated-run" });
      throw Error("Unexpected transport");
    });
    vi.stubGlobal("fetch", send);
    const result = await sweep(sweepRequest());
    expect(result.status).toBe(200);
    expect((await result.json()).status).toBe("sweep_completed");
    expect(send).toHaveBeenCalledTimes(5);
    for (const [, init] of send.mock.calls)
      expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
  it("runs the actual signed webhook SDK adapter without a provider send", async () => {
    const send = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      expect(String(input)).toContain(
        "/rest/v1/rpc/pipstart_record_email_event",
      );
      return new Response(null, { status: 204 });
    });
    vi.stubGlobal("fetch", send);
    const result = await webhook(webhookRequest());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ status: "recorded" });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
  it.each(["manual_alerts", "overdue_alerts", "stale_runs"] as const)(
    "persists %s from the actual health RPC and withholds heartbeat",
    async (key) => {
      vi.stubEnv(
        "PIPSTART_EMAIL_MONITOR_HEARTBEAT_URL",
        "https://hc-ping.com/00000000-0000-4000-8000-000000000001",
      );
      const send = vi.fn<typeof fetch>().mockImplementation(async (input) => {
        const url = String(input);
        expect(url).toContain("https://generated.supabase.test/rest/v1/");
        if (url.includes("pipstart_queue_missing_email_deliveries"))
          return Response.json(0);
        if (url.includes("pipstart_list_due_email_alerts"))
          return Response.json([]);
        if (url.includes("pipstart_email_monitor_health"))
          return Response.json({
            manual_alerts: 0,
            overdue_alerts: 0,
            stale_runs: 0,
            [key]: 1,
          });
        return Response.json({ id: "generated-run" });
      });
      vi.stubGlobal("fetch", send);
      const result = await sweep(sweepRequest());
      expect(result.status).toBe(503);
      expect((await result.json()).summary[key]).toBe(1);
      const update = send.mock.calls.find(
        ([, init]) => init?.method === "PATCH",
      );
      expect(update).toBeDefined();
      expect(JSON.parse(update![1]!.body as string)).toMatchObject({
        status: "partial",
        [key]: 1,
      });
      expect(send).toHaveBeenCalledTimes(5);
    },
  );
  it("fails closed when the deployed database lacks the health RPC", async () => {
    const send = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("pipstart_queue_missing_email_deliveries"))
        return Response.json(0);
      if (url.includes("pipstart_list_due_email_alerts"))
        return Response.json([]);
      if (url.includes("pipstart_email_monitor_health"))
        return Response.json(
          { message: "missing function", code: "PGRST202" },
          { status: 404 },
        );
      return Response.json({ id: "generated-run" });
    });
    vi.stubGlobal("fetch", send);
    expect((await sweep(sweepRequest())).status).toBe(503);
    const update = send.mock.calls.find(([, init]) => init?.method === "PATCH");
    expect(JSON.parse(update![1]!.body as string)).toMatchObject({
      status: "partial",
      manual_alerts: null,
      overdue_alerts: null,
      stale_runs: null,
    });
  });
  it.each(["sweep", "webhook"] as const)(
    "returns 503 when %s DB headers never arrive, without provider/heartbeat traffic",
    async (kind) => {
      vi.useFakeTimers();
      const send = vi
        .fn<typeof fetch>()
        .mockImplementation(() => new Promise(() => {}));
      vi.stubGlobal("fetch", send);
      const pending =
        kind === "sweep" ? sweep(sweepRequest()) : webhook(webhookRequest());
      await vi.advanceTimersByTimeAsync(monitorDatabaseTimeoutMs + 1);
      const result = await pending;
      expect(result.status).toBe(503);
      expect(send).toHaveBeenCalledOnce();
      expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
    },
  );
  it("returns 503 for a stalled DB response body after successful HTTP headers", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const send = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode("{"));
          },
          cancel,
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", send);
    const pending = webhook(webhookRequest());
    await vi.advanceTimersByTimeAsync(monitorDatabaseTimeoutMs + 1);
    expect((await pending).status).toBe(503);
    expect(cancel).toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
  });
  it("does not reach a database or provider on failed authentication", async () => {
    const send = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", send);
    expect((await sweep(sweepRequest("Bearer invalid"))).status).toBe(401);
    const request = webhookRequest();
    request.headers.set(
      "svix-signature",
      "v1," + Buffer.alloc(32).toString("base64"),
    );
    expect((await webhook(request)).status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });
});
