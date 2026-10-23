import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  handleUnsubscribe,
  hashUnsubscribeToken,
  newUnsubscribeToken,
  type UnsubscribeStore,
} from "./core";

const token = "a".repeat(64);
const url = `https://pipstart.net/unsubscribe?token=${token}`;
function store(): UnsubscribeStore {
  return {
    lookup: vi.fn().mockResolvedValue("learning"),
    apply: vi.fn().mockResolvedValue("unsubscribed"),
  };
}
function post(
  body = "List-Unsubscribe=One-Click",
  type = "application/x-www-form-urlencoded",
) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": type },
    body,
  });
}
describe("unsubscribe capability tokens", () => {
  it("generates independent 256-bit opaque tokens and hashes only validated hex", () => {
    const first = newUnsubscribeToken(),
      second = newUnsubscribeToken();
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
    expect(hashUnsubscribeToken(token)).toBe(
      createHash("sha256").update(token).digest("hex"),
    );
    expect(hashUnsubscribeToken(token)).not.toBe(token);
  });
  it.each([
    null,
    undefined,
    123,
    "",
    "a".repeat(63),
    "a".repeat(65),
    "A".repeat(64),
    "g".repeat(64),
    `${token}\n`,
    `<script>${token}</script>`,
  ])("rejects malformed capability %s", (value) => {
    expect(hashUnsubscribeToken(value)).toBeNull();
  });
});
describe("public unsubscribe HTTP boundary", () => {
  it.each(["learning", "partner", "all"])(
    "GET confirms %s but never changes settings",
    async (scope) => {
      const mock = store();
      vi.mocked(mock.lookup).mockResolvedValue(scope as "learning");
      const response = await handleUnsubscribe(new Request(url), mock);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('method="post"');
      expect(html).toContain('name="List-Unsubscribe"');
      expect(mock.lookup).toHaveBeenCalledWith(hashUnsubscribeToken(token));
      expect(mock.apply).not.toHaveBeenCalled();
      expect(html).not.toContain("<script");
    },
  );
  it("HEAD never looks up or changes a preference", async () => {
    const mock = store();
    const response = await handleUnsubscribe(
      new Request(url, { method: "HEAD" }),
      mock,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(mock.lookup).not.toHaveBeenCalled();
    expect(mock.apply).not.toHaveBeenCalled();
  });
  it.each([
    "",
    "?token=x",
    `?token=${token}&token=${token}`,
    `?token=${token}&scope=all`,
  ])("rejects missing/malformed/ambiguous URLs %s", async (query) => {
    const mock = store();
    expect(
      (
        await handleUnsubscribe(
          new Request(`https://pipstart.net/unsubscribe${query}`),
          mock,
        )
      ).status,
    ).toBe(400);
    expect(mock.lookup).not.toHaveBeenCalled();
    expect(mock.apply).not.toHaveBeenCalled();
  });
  it.each(["PUT", "DELETE", "PATCH", "OPTIONS"])(
    "rejects method %s without DB activity",
    async (method) => {
      const mock = store();
      const response = await handleUnsubscribe(
        new Request(url, { method }),
        mock,
      );
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("GET, HEAD, POST");
      expect(mock.apply).not.toHaveBeenCalled();
      expect(mock.lookup).not.toHaveBeenCalled();
    },
  );
  it.each(["unsubscribed", "already_unsubscribed"])(
    "POST %s succeeds without login/cookies or redirect",
    async (result) => {
      const mock = store();
      vi.mocked(mock.apply).mockResolvedValue(result as "unsubscribed");
      const response = await handleUnsubscribe(post(), mock);
      expect(response.status).toBe(200);
      expect(response.headers.get("Location")).toBeNull();
      expect(response.headers.get("Set-Cookie")).toBeNull();
      expect(await response.text()).toContain("You are unsubscribed");
      expect(mock.lookup).not.toHaveBeenCalled();
      expect(mock.apply).toHaveBeenCalledWith(hashUnsubscribeToken(token));
    },
  );
  it("accepts RFC multipart submission", async () => {
    const form = new FormData();
    form.set("List-Unsubscribe", "One-Click");
    const mock = store();
    const response = await handleUnsubscribe(
      new Request(url, { method: "POST", body: form }),
      mock,
    );
    expect(response.status).toBe(200);
    expect(mock.apply).toHaveBeenCalledOnce();
  });
  it.each([
    "",
    "List-Unsubscribe=Wrong",
    "token=abc",
    "List-Unsubscribe=One-Click&scope=all",
    "List-Unsubscribe=One-Click&List-Unsubscribe=One-Click",
  ])("rejects noncanonical POST body %s", async (body) => {
    const mock = store();
    expect((await handleUnsubscribe(post(body), mock)).status).toBe(400);
    expect(mock.apply).not.toHaveBeenCalled();
  });
  it.each([
    "application/json",
    "text/plain",
    "",
    "application/x-www-form-urlencodedevil",
  ])("rejects unsupported body type %s", async (type) => {
    const mock = store();
    expect(
      (await handleUnsubscribe(post("List-Unsubscribe=One-Click", type), mock))
        .status,
    ).toBe(415);
    expect(mock.apply).not.toHaveBeenCalled();
  });
  it("caps actual body even with missing or falsely small Content-Length", async () => {
    for (const length of [undefined, "1", "2049", "bad"]) {
      const request = post("a".repeat(2049));
      if (length !== undefined) request.headers.set("Content-Length", length);
      const mock = store();
      expect((await handleUnsubscribe(request, mock)).status).toBe(413);
      expect(mock.apply).not.toHaveBeenCalled();
    }
  });
  it("rejects invalid UTF-8 without applying", async () => {
    const mock = store();
    const request = new Request(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new Uint8Array([255]),
    });
    expect((await handleUnsubscribe(request, mock)).status).toBe(400);
    expect(mock.apply).not.toHaveBeenCalled();
  });
  it("handles unknown/deleted tokens without revealing account data", async () => {
    const mock = store();
    vi.mocked(mock.lookup).mockResolvedValue(null);
    vi.mocked(mock.apply).mockResolvedValue("invalid");
    for (const request of [new Request(url), post()]) {
      const response = await handleUnsubscribe(request, mock);
      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).not.toContain(token);
      expect(html).not.toContain("@example");
    }
  });
  it.each(["GET", "POST"])(
    "fails safely on unavailable storage for %s",
    async (method) => {
      const request = () => (method === "GET" ? new Request(url) : post());
      expect((await handleUnsubscribe(request(), null)).status).toBe(503);
      const mock = store();
      vi.mocked(mock.lookup).mockRejectedValue(new Error(token));
      vi.mocked(mock.apply).mockRejectedValue(new Error(token));
      const response = await handleUnsubscribe(request(), mock);
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain(token);
    },
  );
  it("does not claim success on an unexpected storage result", async () => {
    const mock = store();
    vi.mocked(mock.apply).mockResolvedValue("surprise" as "invalid");
    expect((await handleUnsubscribe(post(), mock)).status).toBe(503);
  });
  it("prevents caching, indexing, referrer leakage, framing and scripts", async () => {
    const response = await handleUnsubscribe(new Request(url), store());
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "default-src 'none'",
    );
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });
});
