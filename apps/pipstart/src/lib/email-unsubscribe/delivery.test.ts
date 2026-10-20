import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { prepareOptionalEmail, type TokenIssuer } from "./delivery";
import { hashUnsubscribeToken } from "./core";
const input = { userId: "00000000-0000-4000-8000-000000000001", category: "learning" as const, html: "<p>Lesson</p>", text: "Lesson" };
describe("mandatory optional-email envelope", () => {
  it.each(["learning", "partner"])("includes category/all links in both bodies and RFC headers for %s", async category => {
    const issuer: TokenIssuer = { issue: vi.fn().mockResolvedValue(true) };
    const email = await prepareOptionalEmail({ ...input, category: category as "learning" }, issuer);
    const categoryUrl = email.headers["List-Unsubscribe"].slice(1, -1);
    const parsed = new URL(categoryUrl), token = parsed.searchParams.get("token");
    expect(parsed.origin).toBe("https://pipstart.net"); expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(email.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(email.html).toContain(categoryUrl); expect(email.text).toContain(categoryUrl);
    expect(email.html).toContain("Unsubscribe from all optional emails"); expect(email.text).toContain("Unsubscribe from all optional emails");
    expect(issuer.issue).toHaveBeenNthCalledWith(1, input.userId, category, hashUnsubscribeToken(token));
    expect(vi.mocked(issuer.issue).mock.calls[1][1]).toBe("all");
    expect(vi.mocked(issuer.issue).mock.calls.flat()).not.toContain(token);
  });
  it("fails closed for disabled category and never issues an all token", async () => {
    const issuer: TokenIssuer = { issue: vi.fn().mockResolvedValue(false) };
    await expect(prepareOptionalEmail(input, issuer)).rejects.toThrow("OFF or unavailable"); expect(issuer.issue).toHaveBeenCalledTimes(1);
  });
  it("places the footer inside a complete HTML email document", async () => {
    const email = await prepareOptionalEmail({ ...input, html: "<!doctype html><html><body><p>Lesson</p></body></html>" }, { issue: vi.fn().mockResolvedValue(true) });
    expect(email.html.indexOf("Unsubscribe from all optional emails")).toBeLessThan(email.html.indexOf("</body>"));
    expect(email.html.endsWith("</body></html>")).toBe(true);
  });
  it("fails closed if either issuance fails", async () => {
    const issuer: TokenIssuer = { issue: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false) };
    await expect(prepareOptionalEmail(input, issuer)).rejects.toThrow();
    vi.mocked(issuer.issue).mockRejectedValue(new Error("unavailable"));
    await expect(prepareOptionalEmail(input, issuer)).rejects.toThrow();
  });
  it.each([{ ...input, userId: "bad" }, { ...input, category: "security" }, { ...input, html: "" }, { ...input, text: " " }])("rejects malformed or non-optional envelopes", async value => {
    const issuer: TokenIssuer = { issue: vi.fn() };
    await expect(prepareOptionalEmail(value as typeof input, issuer)).rejects.toThrow(); expect(issuer.issue).not.toHaveBeenCalled();
  });
  it("bypasses session refresh only for the exact unsubscribe route", () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, "../../proxy.ts"), "utf8");
    expect(source).toContain('request.nextUrl.pathname === "/unsubscribe"');
    expect(source).toContain("return NextResponse.next()"); expect(source).toContain("return updateSupabaseSession(request)");
  });
});
