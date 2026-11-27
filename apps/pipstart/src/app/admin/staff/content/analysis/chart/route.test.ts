import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  enabled: true,
  roles: ["owner"] as string[],
  live: "authorized" as "authorized" | "denied" | "unavailable",
  upload: vi.fn(),
  download: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/lib/auth/staff-gate", () => ({ staffUiEnabled: () => m.enabled }));
vi.mock("@/lib/auth/staff-entry", () => ({ staffDeadline: (p: unknown) => p }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "u1" } }, error: null }),
    },
  }),
}));
vi.mock("@/lib/auth/staff-role-flow", () => ({
  readLiveStaffAccess: async () =>
    m.live === "authorized"
      ? { kind: "authorized", access: { roles: m.roles } }
      : { kind: m.live },
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ storage: { from: m.from } }),
}));

const { GET, POST } = await import("./route");

const png = () => {
  const b = new Uint8Array(new ArrayBuffer(64));
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
  b.set(
    [..."IHDR"].map((c) => c.charCodeAt(0)),
    12,
  );
  new DataView(b.buffer).setUint32(16, 1600);
  new DataView(b.buffer).setUint32(20, 900);
  return b;
};
const URL_ = "https://pipstart.example/admin/staff/content/analysis/chart";
const post = (
  body: Uint8Array<ArrayBuffer> | string,
  headers: Record<string, string> = {},
) =>
  POST(
    new Request(URL_, {
      method: "POST",
      body,
      headers: {
        origin: "https://pipstart.example",
        "content-type": "image/png",
        ...headers,
      },
    }),
  );

beforeEach(() => {
  m.enabled = true;
  m.roles = ["owner"];
  m.live = "authorized";
  m.upload.mockReset().mockResolvedValue({ data: { path: "x" }, error: null });
  m.download
    .mockReset()
    .mockResolvedValue({ data: new Blob(["chart"]), error: null });
  m.from
    .mockReset()
    .mockReturnValue({ upload: m.upload, download: m.download });
});

describe("trade-idea chart upload route (TA-b)", () => {
  it("stores an Owner's PNG under a random dated name and returns its size", async () => {
    const response = await post(png());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toMatchObject({ kind: "uploaded", width: 1600, height: 900 });
    expect(body.path).toMatch(/^private\/\d{4}\/\d{2}\/[a-f0-9]{32}\.png$/);
    expect(m.from).toHaveBeenCalledWith("analysis-private-charts");
    expect(m.upload.mock.calls[0][2]).toEqual({
      contentType: "image/png",
      cacheControl: "0",
      upsert: false,
    });
  });

  it("refuses other sites, non-Owners and non-images without uploading", async () => {
    expect((await post(png(), { origin: "https://evil.example" })).status).toBe(
      403,
    );
    expect((await post(png(), { "sec-fetch-site": "cross-site" })).status).toBe(
      403,
    );
    m.roles = ["editor"];
    expect((await post(png())).status).toBe(403);
    m.roles = ["owner"];
    m.live = "denied";
    expect((await post(png())).status).toBe(403);
    m.live = "authorized";
    const svg = await post('<svg xmlns="http://www.w3.org/2000/svg"/>', {
      "content-type": "image/png",
    });
    expect(svg.status).toBe(400);
    expect(await svg.json()).toEqual({
      kind: "invalid",
      reason: "Upload a PNG, JPEG or WebP image",
    });
    expect(m.upload).not.toHaveBeenCalled();
  });

  it("refuses a declared size over 4 MB before reading, and is hidden when staff UI is off", async () => {
    expect(
      (await post(png(), { "content-length": String(5 * 1024 * 1024) })).status,
    ).toBe(413);
    m.enabled = false;
    expect((await post(png())).status).toBe(404);
    expect(m.upload).not.toHaveBeenCalled();
  });

  it("keeps a saved draft chart behind the live Owner gate", async () => {
    const path = "private/2026/11/" + "a".repeat(32) + ".png";
    const request = new Request(URL_ + "?path=" + encodeURIComponent(path));
    m.roles = ["editor"];
    expect((await GET(request)).status).toBe(404);
    expect(m.download).not.toHaveBeenCalled();
    m.roles = ["owner"];
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(m.download).toHaveBeenCalledExactlyOnceWith(path);
  });

  it("reports storage trouble as unavailable", async () => {
    m.upload.mockResolvedValue({ data: null, error: { message: "x" } });
    expect((await post(png())).status).toBe(503);
  });
});
