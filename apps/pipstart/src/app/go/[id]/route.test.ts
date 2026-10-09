import { describe, expect, it } from "vitest";
import { GET } from "./route";
const request = new Request(
  "https://pipstart.net/go/deriv?url=https://evil.test&next=https://evil.test",
);
describe("M19.1 closed provider redirects", () => {
  it("ignores user-supplied destinations and preserves the registered one", async () => {
    const response = await GET(request, {
      params: Promise.resolve({ id: "deriv" }),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
    );
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });
  it("unknown ids return a safe local fallback with no redirect", async () => {
    const response = await GET(request, {
      params: Promise.resolve({ id: "<script>alert(1)</script>" }),
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("Location")).toBeNull();
    const html = await response.text();
    expect(html).toContain('href="/brokers"');
    expect(html).not.toContain("<script>");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
