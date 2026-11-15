import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { providerLinks } from "../../content/provider-links";
import { providers } from "../../content/providers";
import { resolveProviderLink, type Provider } from "../provider-directory";
import { jsonbText } from "./jsonb";
import { LIVE_GENERATION_FORMAT } from "./live-generation";
import { parsePartnerSnapshot } from "./partner-snapshot";

const sha = (body: unknown) =>
  createHash("sha256").update(jsonbText(body), "utf8").digest("hex");
// The store body MP09a validates for a partner: the register's record minus identity, status,
// link and the Owner-held risk notice.
const partnerBody = (p: Provider) => ({
  metadata: {
    title: p.name,
    shortName: p.shortName,
    kind: p.kind,
    brand: p.brand,
  },
  relationship: p.relationship,
  summary: p.summary,
  facts: p.facts,
  fees: p.fees,
  support: p.support,
  review: p.review,
  availability: p.availability,
  entities: p.entities,
  payments: p.payments,
  image: p.image,
});
const deriv = providers.find((p) => p.id === "deriv")!;
const derivLink = providerLinks.find((l) => l.id === "deriv")!;
const linkBody = {
  metadata: { title: "Open account" },
  url: derivLink.url,
  active: derivLink.active,
  expiresAt: derivLink.expiresAt,
};
const linkEntry = (body: Record<string, unknown> = linkBody) => ({
  id: "link:deriv",
  revisionNo: 1,
  bodySha256: sha(body),
  body,
  allowedHosts: [...derivLink.allowedHosts],
  policyVersion: 1,
});
const partnerEntry = (links: unknown[] = [linkEntry()]) => ({
  id: "partner:deriv",
  revisionNo: 1,
  bodySha256: sha(partnerBody(deriv)),
  body: partnerBody(deriv),
  riskNotice: deriv.riskNotice,
  policyVersion: 1,
  links,
});
const snapshot = (partners?: unknown[]) =>
  JSON.stringify({
    format: "pipstart-content-snapshot",
    version: 2,
    items: [],
    ...(partners ? { partners } : {}),
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("M22 MP09b partner snapshot", () => {
  it("reads nothing when the generation publishes no partners", () => {
    expect(parsePartnerSnapshot(snapshot())).toEqual({
      providers: [],
      links: [],
    });
  });

  it("reproduces today's Deriv register exactly, attribution URL byte-for-byte", () => {
    const d = parsePartnerSnapshot(snapshot([partnerEntry()]));
    expect(d.providers).toEqual([deriv]);
    expect(d.links).toEqual([derivLink]);
    expect(resolveProviderLink("deriv", d.providers, d.links)?.url).toBe(
      "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
    );
  });

  it("keeps a partner whose link was revoked, with no way out", () => {
    const d = parsePartnerSnapshot(snapshot([partnerEntry([])]));
    expect(d.providers[0]).toMatchObject({ id: "deriv", linkId: null });
    expect(d.links).toEqual([]);
    expect(resolveProviderLink("deriv", d.providers, d.links)).toBeNull();
  });

  it("fails closed on expired or inactive links", () => {
    for (const patch of [{ active: false }, { expiresAt: "2026-01-01" }]) {
      const d = parsePartnerSnapshot(
        snapshot([partnerEntry([linkEntry({ ...linkBody, ...patch })])]),
      );
      expect(resolveProviderLink("deriv", d.providers, d.links)).toBeNull();
    }
  });

  it.each([
    [
      "a tampered partner body",
      [{ ...partnerEntry(), bodySha256: "0".repeat(64) }],
    ],
    ["a code-style identity", [{ ...partnerEntry(), id: "deriv" }]],
    ["a missing risk notice", [{ ...partnerEntry(), riskNotice: "" }]],
    ["an extra field", [{ ...partnerEntry(), secret: "x" }]],
    [
      "a destination outside its approved hosts",
      [partnerEntry([{ ...linkEntry(), allowedHosts: ["other.example"] }])],
    ],
    [
      "a tampered link body",
      [partnerEntry([{ ...linkEntry(), bodySha256: "1".repeat(64) }])],
    ],
    ["an empty partners list", []],
  ])("refuses %s", (_, partners) => {
    expect(() => parsePartnerSnapshot(snapshot(partners))).toThrow();
  });
});

describe("M22 MP09b /go and /brokers source", { timeout: 60_000 }, () => {
  const liveFile = (partners: unknown[]) => {
    const cwd = mkdtempSync(join(tmpdir(), "pipstart-partners-"));
    mkdirSync(join(cwd, ".generated"));
    writeFileSync(
      join(cwd, ".generated/live-generation.json"),
      JSON.stringify({
        format: LIVE_GENERATION_FORMAT,
        generation: 9,
        snapshotSha256: "e".repeat(64),
        groups: ["partners"],
        fetchedAt: "2026-11-15T10:00:00.000Z",
        snapshot: snapshot(partners),
      }),
    );
    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    vi.stubEnv("PIPSTART_STORE_FAMILIES", "partners");
  };
  const go = async (id: string) => {
    const route = await import("../../app/go/[id]/route");
    return route.GET(new Request("https://pipstart.net/go/" + id), {
      params: Promise.resolve({ id }),
    });
  };

  it("redirects only to the live generation's exact destination", async () => {
    liveFile([partnerEntry()]);
    const r = await go("deriv");
    expect(r.status).toBe(302);
    expect(r.headers.get("location")).toBe(derivLink.url);
    expect(r.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect((await go("link:deriv")).status).toBe(404);
    expect((await go("unknown")).status).toBe(404);
  });

  it("stops redirecting once the link is revoked in the live generation", async () => {
    liveFile([partnerEntry([])]);
    expect((await go("deriv")).status).toBe(404);
  });

  it("reads the code register when partners are not switched", async () => {
    const r = await go("deriv");
    expect(r.status).toBe(302);
    expect(r.headers.get("location")).toBe(derivLink.url);
  });
});
