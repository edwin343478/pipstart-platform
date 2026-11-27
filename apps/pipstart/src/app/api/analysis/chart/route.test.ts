import { afterEach, expect, it, vi } from "vitest";

const paths = vi.hoisted(() => ({
  published: "private/2026/11/" + "a".repeat(32) + ".png",
  draft: "private/2026/11/" + "b".repeat(32) + ".jpg",
  download: vi.fn(),
}));

vi.mock("@/app/analysis/posts", () => ({
  analysisPosts: [
    {
      category: "technical",
      status: "published",
      trade: { chart: { path: paths.published } },
    },
    {
      category: "technical",
      status: "draft",
      trade: { chart: { path: paths.draft } },
    },
  ],
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    storage: { from: () => ({ download: paths.download }) },
  }),
}));

const { GET } = await import("./route");
const request = (path: string) =>
  new Request(
    "https://pipstart.example/api/analysis/chart?path=" +
      encodeURIComponent(path),
  );

afterEach(() => vi.unstubAllEnvs());

it("serves only a published chart while Trade Ideas is enabled", async () => {
  paths.download.mockResolvedValue({
    data: new Blob(["chart"], { type: "image/png" }),
    error: null,
  });
  vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "");
  expect((await GET(request(paths.published))).status).toBe(404);
  vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
  expect((await GET(request(paths.draft))).status).toBe(404);
  expect((await GET(request("../chart.png"))).status).toBe(404);
  expect(paths.download).not.toHaveBeenCalled();
  const response = await GET(request(paths.published));
  expect(response.status).toBe(200);
  expect(await response.text()).toBe("chart");
  expect(response.headers.get("content-type")).toBe("image/png");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(paths.download).toHaveBeenCalledExactlyOnceWith(paths.published);
});
