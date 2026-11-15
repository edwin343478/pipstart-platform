import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { providerLinks } from "../../../content/provider-links";
import { providers } from "../../../content/providers";
import type { Provider, ProviderLink } from "../../provider-directory";
import { jsonbText } from "../jsonb";
import { parsePartnerSnapshot } from "../partner-snapshot";
import {
  partnerImportManifest,
  partnerImportSql,
  partnerImportStatement,
  type PartnerImportStep,
} from "./partner-import";

const sha = (value: unknown) =>
  createHash("sha256").update(jsonbText(value), "utf8").digest("hex");
const deriv = providers.find((p) => p.id === "deriv")!;
const derivLink = providerLinks.find((l) => l.id === "deriv")!;
type Item = Extract<PartnerImportStep, { step: "item" }>;
type Policy = Extract<PartnerImportStep, { step: "policy" }>;

// The snapshot section MP09b would seal for these steps, built only from the manifest.
function sealedSection(steps: PartnerImportStep[]) {
  const items = steps.filter((s): s is Item => s.step === "item");
  const policy = (id: string) =>
    steps.find((s): s is Policy => s.step === "policy" && s.id === id)!.value;
  return JSON.stringify({
    format: "pipstart-content-snapshot",
    version: 2,
    items: [],
    partners: items
      .filter((i) => i.family === "partner")
      .map((p) => ({
        id: p.id,
        revisionNo: 1,
        bodySha256: p.bodySha256,
        body: p.body,
        riskNotice: (policy(p.id) as { riskNotice: string }).riskNotice,
        policyVersion: 1,
        links: items
          .filter((l) => l.parentId === p.id)
          .map((l) => ({
            id: l.id,
            revisionNo: 1,
            bodySha256: l.bodySha256,
            body: l.body,
            allowedHosts: (policy(l.id) as { allowedHosts: string[] })
              .allowedHosts,
            policyVersion: 1,
          })),
      })),
  });
}

describe("M22 MP09d2 partner import manifest", () => {
  it("imports Deriv in order: risk notice, partner, approved hosts, link", async () => {
    const steps = await partnerImportManifest();
    expect(steps.map((s) => [s.seq, s.step, s.id, s.sourceRef])).toEqual([
      [1, "policy", "partner:deriv", "provider-registry:deriv/risk-notice"],
      [2, "item", "partner:deriv", "provider-registry:deriv"],
      [3, "policy", "link:deriv", "provider-link-registry:deriv/allowed-hosts"],
      [4, "item", "link:deriv", "provider-link-registry:deriv"],
    ]);
    expect(steps[0]).toMatchObject({
      kind: "partner",
      value: { riskNotice: deriv.riskNotice },
    });
    expect(steps[2]).toMatchObject({
      kind: "link",
      value: { allowedHosts: ["t.deriv.link"] },
    });
    expect(steps[3]).toMatchObject({
      family: "link",
      parentId: "partner:deriv",
      body: {
        metadata: { title: "Visit Deriv" },
        url: "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
        active: true,
        expiresAt: null,
      },
    });
  });

  it("hashes each body as PostgreSQL's jsonb text", async () => {
    for (const s of await partnerImportManifest())
      if (s.step === "item") expect(s.bodySha256).toBe(sha(s.body));
  });

  it("reproduces the deployment register exactly through the MP09b snapshot reader", async () => {
    const directory = parsePartnerSnapshot(
      sealedSection(await partnerImportManifest()),
    );
    expect(directory.providers).toEqual(providers);
    expect(directory.links).toEqual(providerLinks);
    expect(directory.links[0].url).toBe(derivLink.url);
  });

  it("refuses an unpublished partner, a second link or an unpaired link", async () => {
    await expect(
      partnerImportManifest([{ ...deriv, status: "draft" } as Provider], []),
    ).rejects.toThrow("Only published partners");
    await expect(
      partnerImportManifest(
        [deriv],
        [derivLink, { ...derivLink, id: "deriv-2" } as ProviderLink],
      ),
    ).rejects.toThrow("at most one link");
    await expect(partnerImportManifest([deriv], [])).rejects.toThrow(
      "do not pair",
    );
    await expect(
      partnerImportManifest(
        [{ ...deriv, linkId: null } as Provider],
        [{ ...derivLink, providerId: "other" } as ProviderLink],
      ),
    ).rejects.toThrow("not imported");
  });

  it("writes one guarded statement per step and stops on any conflict", async () => {
    const steps = await partnerImportManifest();
    const text = partnerImportSql(steps, "a".repeat(64));
    const lines = text.trimEnd().split("\n");
    expect(lines[0]).toBe(
      "-- PipStart M22 MP09d2 partner import: 4 steps, manifest " +
        "a".repeat(64) +
        ".",
    );
    expect(lines.filter((l) => l.startsWith("insert into"))).toEqual(
      steps.map(partnerImportStatement),
    );
    expect(partnerImportStatement(steps[1])).toContain(
      "pipstart_editorial_private.import_partner_item('partner:deriv','partner',null,$m22partner$",
    );
    expect(partnerImportStatement(steps[3])).toMatch(
      /,'provider-link-registry:deriv','[0-9a-f]{64}'\);$/,
    );
    expect(text).toContain("status not in ('created','unchanged','updated')");
    expect(text).not.toMatch(/import_item\(/);
  });

  it("refuses a value carrying the SQL quote tag", async () => {
    const [policy] = await partnerImportManifest();
    expect(() =>
      partnerImportStatement({
        ...(policy as Policy),
        value: { riskNotice: "x $m22partner$ y" },
      }),
    ).toThrow("quote tag");
  });
});
