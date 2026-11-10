import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleScheduledPublicationDelivery as handle } from "./publication-scheduled-delivery";
const secret = "TEST_ONLY_" + "s".repeat(40),
  hook = "https://api.vercel.com/v1/integrations/deploy/TEST_ONLY_NOT_A_SECRET",
  token = "aa000000-0000-4000-8000-000000000001";
const config = { enabled: "true", secret, hook };
function request(body = "{}", auth = "Bearer " + secret, method = "POST") {
  return new Request(
    "https://pipstart.net/api/internal/publication/scheduled-delivery",
    {
      method,
      headers: { Authorization: auth },
      ...(method === "POST" ? { body } : {}),
    },
  );
}
function fixture() {
  let claimed = false;
  const rpc = vi.fn((name: string) => ({
    abortSignal: vi.fn(async (): Promise<{ data: unknown; error: unknown }> => {
      if (name === "pipstart_publication_scheduler_claim") {
        if (claimed) return { data: { state: "idle" }, error: null };
        claimed = true;
        return {
          data: { state: "claimed", generation: 2, token },
          error: null,
        };
      }
      if (name === "pipstart_publication_scheduler_finish")
        return { data: true, error: null };
      throw Error("unapproved RPC");
    }),
  }));
  const admin = vi.fn(() => ({ rpc }) as unknown as SupabaseClient),
    send = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  return { admin, send, rpc };
}
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe("restricted scheduled deployment endpoint", () => {
  it.each([undefined, "false", ""])(
    "defaults off (%s) before any DB/hook work",
    async (enabled) => {
      const f = fixture();
      expect((await handle(request(), { ...config, enabled }, f)).status).toBe(
        503,
      );
      expect(f.admin).not.toHaveBeenCalled();
      expect(f.send).not.toHaveBeenCalled();
    },
  );
  it.each([undefined, "short", " " + secret, secret + "\n"])(
    "refuses malformed configured token",
    async (s) => {
      const f = fixture();
      expect(
        (await handle(request(), { ...config, secret: s }, f)).status,
      ).toBe(503);
      expect(f.admin).not.toHaveBeenCalled();
    },
  );
  it.each([
    "",
    "bearer " + secret,
    "Bearer " + "x".repeat(50),
    "Bearer " + "x".repeat(200),
  ])("refuses unauthorized bearer before DB", async (auth) => {
    const f = fixture();
    expect((await handle(request("{}", auth), config, f)).status).toBe(401);
    expect(f.admin).not.toHaveBeenCalled();
  });
  it("rejects non-POST", async () => {
    const f = fixture();
    expect(
      (await handle(request("", "Bearer " + secret, "GET"), config, f)).status,
    ).toBe(405);
    expect(f.admin).not.toHaveBeenCalled();
  });
  it.each(['{"generation":2}', "[]", "null", "{broken", "x".repeat(33)])(
    "refuses caller commands and oversized bodies",
    async (body) => {
      const f = fixture();
      expect((await handle(request(body), config, f)).status).toBe(400);
      expect(f.admin).not.toHaveBeenCalled();
    },
  );
  it.each([
    undefined,
    "https://evil.example/deploy",
    "https://api.vercel.com.evil.example/v1/integrations/deploy/x",
    hook + "?token=bad",
    "https://user:pass@api.vercel.com/v1/integrations/deploy/x",
    "http://api.vercel.com/v1/integrations/deploy/x",
  ])("requires exact server-configured Vercel hook before claim", async (h) => {
    const f = fixture();
    expect((await handle(request(), { ...config, hook: h }, f)).status).toBe(
      503,
    );
    expect(f.admin).not.toHaveBeenCalled();
  });
  it("sends exactly once after a durable claim; repeated wake is idle", async () => {
    const f = fixture();
    const a = await handle(request(), config, f),
      b = await handle(request(), config, f);
    const publicBody = await a.text();
    expect(JSON.parse(publicBody)).toEqual({ status: "started" });
    expect(await b.json()).toEqual({ status: "idle" });
    expect(f.send).toHaveBeenCalledTimes(1);
    expect(f.send).toHaveBeenCalledWith(
      hook,
      expect.objectContaining({
        method: "POST",
        redirect: "error",
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_publication_scheduler_finish",
      { p_generation: 2, p_token: token, p_sent: true },
    );
    expect(publicBody).not.toContain(token);
  });
  it("accepts a genuinely empty POST stream", async () => {
    const f = fixture();
    expect((await handle(request(""), config, f)).status).toBe(200);
  });
  it.each([
    new Response(null, { status: 503 }),
    new Response(null, { status: 302 }),
  ])("records non-2xx as uncertain with no retry", async (response) => {
    const f = fixture();
    f.send.mockResolvedValue(response);
    expect((await handle(request(), config, f)).status).toBe(503);
    expect(f.send).toHaveBeenCalledTimes(1);
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_publication_scheduler_finish",
      { p_generation: 2, p_token: token, p_sent: false },
    );
  });
  it("persists uncertainty after a thrown fetch", async () => {
    const f = fixture();
    f.send.mockRejectedValue(Error("sensitive hook failure"));
    const r = await handle(request(), config, f);
    expect(await r.text()).toBe('{"status":"unknown"}');
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_publication_scheduler_finish",
      expect.objectContaining({ p_sent: false }),
    );
  });
  it("caps successful hook bodies at 4096 bytes", async () => {
    const f = fixture();
    f.send.mockResolvedValue(new Response("x".repeat(4097)));
    expect((await handle(request(), config, f)).status).toBe(503);
    expect(f.send).toHaveBeenCalledTimes(1);
  });
  it("keeps the 8-second total hook deadline even if fetch ignores abort", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.send.mockImplementation(() => new Promise(() => {}));
    const work = handle(request(), config, f);
    await vi.advanceTimersByTimeAsync(8001);
    expect((await work).status).toBe(503);
    expect(f.send).toHaveBeenCalledTimes(1);
  });
  it("bounds a never-ending request body at the existing 2-second deadline", async () => {
    vi.useFakeTimers();
    const f = fixture(),
      stream = new ReadableStream<Uint8Array>({ start() {} });
    const req = new Request("https://pipstart.net", {
      method: "POST",
      headers: { Authorization: "Bearer " + secret },
      body: stream,
      duplex: "half",
    } as RequestInit);
    const work = handle(req, config, f);
    await vi.advanceTimersByTimeAsync(2001);
    expect((await work).status).toBe(400);
    expect(f.admin).not.toHaveBeenCalled();
  });
  it.each([
    { state: "claimed", generation: 0, token },
    { state: "claimed", generation: 2, token: "bad" },
    { state: "claimed", generation: 2, token, body: "PRIVATE" },
    { state: "alien" },
  ])("refuses malformed privileged DTO before send", async (data) => {
    const f = fixture();
    f.rpc.mockReturnValue({
      abortSignal: vi.fn(async () => ({ data, error: null })),
    } as never);
    expect((await handle(request(), config, f)).status).toBe(503);
    expect(f.send).not.toHaveBeenCalled();
  });
  it("cannot report success when the finish acknowledgement is lost", async () => {
    const f = fixture();
    f.rpc.mockImplementation((name) => ({
      abortSignal: vi.fn(async () =>
        name === "pipstart_publication_scheduler_claim"
          ? { data: { state: "claimed", generation: 2, token }, error: null }
          : { data: null, error: { message: "PRIVATE" } },
      ),
    }));
    const r = await handle(request(), config, f);
    expect(await r.text()).toBe('{"status":"unknown"}');
    expect(f.send).toHaveBeenCalledTimes(1);
  });
  it("fails closed without an admin client", async () => {
    const f = fixture();
    f.admin.mockReturnValue(null as never);
    expect((await handle(request(), config, f)).status).toBe(503);
    expect(f.send).not.toHaveBeenCalled();
  });
});
