import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("../lib/auth/session", () => ({ getCurrentUser }));

import { GET } from "../app/api/learner-navigation/route";
import ForexLayout from "../app/learn/forex/layout";
import CryptoLayout from "../app/learn/crypto/layout";
import { LearnerNavigationLink } from "./learner-navigation-context";

const root = path.dirname(fileURLToPath(import.meta.url));

function read(relative: string) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

describe("public lesson delivery and verified navigation", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  for (const [name, Layout] of [
    ["Forex", ForexLayout],
    ["Crypto", CryptoLayout],
  ] as const) {
    it(`${name} renders complete children and a usable login link without reading cookies`, () => {
      const html = renderToStaticMarkup(
        <Layout>
          <LearnerNavigationLink className="approved-account-button" />
          <p>Teaching content is available immediately.</p>
        </Layout>,
      );
      expect(html).toContain("Teaching content is available immediately.");
      expect(html).toContain('href="/login"');
      expect(html).toContain('class="approved-account-button"');
      expect(html).toContain("Log in");
      expect(html).not.toContain("Dashboard");
      expect(getCurrentUser).not.toHaveBeenCalled();
    });
  }

  it.each([
    [null, false],
    [{ id: "verified-user", email: "private@example.test" }, true],
  ])(
    "returns only the server-verified authentication flag",
    async (user, authenticated) => {
      getCurrentUser.mockResolvedValue(user);
      const response = await GET();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ authenticated });
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(response.headers.get("cache-control")).toBe(
        "private, no-store, max-age=0",
      );
      expect(response.headers.get("vary")).toBe("Cookie");
    },
  );

  it("keeps authentication failures private and uncached without leaking errors", async () => {
    getCurrentUser.mockRejectedValue(new Error("private provider details"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ authenticated: false });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("preserves the existing authenticated layouts for home and start-here", () => {
    expect(read("../app/page.tsx")).toContain(
      "AuthenticatedNavigationProvider",
    );
    expect(read("../app/start-here/layout.tsx")).toContain(
      "AuthenticatedNavigationProvider",
    );
    expect(read("authenticated-navigation-provider.tsx")).toContain(
      "await getCurrentUser()",
    );
    expect(read("../lib/auth/session.ts")).toContain("supabase.auth.getUser()");
    expect(read("../lib/supabase/proxy.ts")).toContain(
      "supabase.auth.getClaims()",
    );
  });
});
