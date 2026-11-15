import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { providers } from "../../content/providers";
import { providerLinks } from "../../content/provider-links";
import {
  emptyPartnerFields,
  linkBody,
  linkProblems,
  partnerBody,
  partnerProblems,
  projectLink,
  projectPartner,
  validPartnerEditorInput,
} from "./partner-editor-contract";
import { runPartnerEditor } from "./partner-editor";

const deriv = providers.find((p) => p.id === "deriv")!;
const derivLink = providerLinks.find((l) => l.id === "deriv")!;
// The stored Deriv body (the MP09a import shape), with store-only fields the editor must keep.
const storedPartner = () => ({
  metadata: {
    title: deriv.name,
    shortName: deriv.shortName,
    kind: deriv.kind,
    brand: deriv.brand,
  },
  relationship: deriv.relationship,
  summary: deriv.summary,
  facts: deriv.facts,
  fees: [
    { label: "Spread", value: null, verification: "pending", source: null },
  ],
  support: [],
  review: deriv.review,
  availability: deriv.availability,
  entities: [],
  payments: [],
  image: deriv.image,
});
const actor = "d9000000-0000-4000-8000-000000000001";
const item = (id: string, family: "partner" | "link", body: unknown) => ({
  item: {
    id,
    family,
    learning_path: null,
    parent_id: family === "link" ? "partner:deriv" : null,
    latest_revision: 2,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 2,
    schema_version: 1,
    body,
    body_sha256: "a".repeat(64),
    base_revision: 1,
    author_is_me: true,
    state: "approved",
    created_at: "2026-11-15T00:00:00Z",
  },
  decisions: [],
  review_required: false,
});
function fixture(
  role = "affiliate_manager",
  errors: Record<string, string> = {},
) {
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const rpc = vi.fn((fn: string, args?: Record<string, unknown>) => {
    if (errors[fn]) return response(null, { code: errors[fn] });
    if (fn === "pipstart_staff_access")
      return response({
        authorized: true,
        user_id: actor,
        roles: [role],
        capabilities: ["staff.enter"],
      });
    if (fn === "pipstart_editorial_item")
      return args?.p_id === "partner:deriv"
        ? response(item("partner:deriv", "partner", storedPartner()))
        : args?.p_id === "link:deriv"
          ? response(
              item(
                "link:deriv",
                "link",
                linkBody({
                  title: "Open",
                  url: derivLink.url,
                  active: true,
                  expiresAt: "",
                }),
              ),
            )
          : response(null, { code: "22023" });
    if (fn === "pipstart_partner_policy")
      return response(
        String(args?.p_id).startsWith("link:")
          ? {
              item_id: args?.p_id,
              kind: "link",
              version: 1,
              allowed_hosts: ["t.deriv.link"],
              risk_notice: null,
              updated_at: "x",
            }
          : {
              item_id: args?.p_id,
              kind: "partner",
              version: 1,
              allowed_hosts: null,
              risk_notice: deriv.riskNotice,
              updated_at: "x",
            },
      );
    if (fn === "pipstart_partner_policy_set")
      return response({
        item_id: args?.p_id,
        kind: args?.p_kind,
        version: Number(args?.p_expected_version) + 1,
      });
    return response({
      item_id: args?.p_id,
      revision_no: fn === "pipstart_editorial_create" ? 1 : 3,
      body_sha256: "b".repeat(64),
      state: "draft",
    });
  });
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  return {
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
const fields = () => projectPartner(storedPartner())!;
const save = (extra: Record<string, unknown> = {}) => ({
  kind: "save-partner",
  slug: "deriv",
  fields: fields(),
  baseRevision: 2,
  baseSha256: "a".repeat(64),
  reason: "Update facts",
  ...extra,
});
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("M22 MP09c partner editor contract", () => {
  it("round-trips the stored Deriv body exactly, keeping fields it does not edit", () => {
    expect(partnerBody(fields(), storedPartner())).toEqual(storedPartner());
    expect(partnerProblems(fields())).toEqual([]);
  });
  it("builds a new partner body in the store's exact shape", () => {
    const f = {
      ...emptyPartnerFields(),
      name: "Example",
      shortName: "Ex",
      summary: "Summary.",
    };
    expect(Object.keys(partnerBody(f, null)).sort()).toEqual([
      "availability",
      "entities",
      "facts",
      "fees",
      "image",
      "metadata",
      "payments",
      "relationship",
      "review",
      "summary",
      "support",
    ]);
    expect(JSON.stringify(partnerBody(f, null))).not.toMatch(
      /riskNotice|allowedHosts/,
    );
  });
  it("explains invalid partner and link fields in plain language", () => {
    expect(
      partnerProblems({
        ...fields(),
        reviewSources: "http://deriv.com/ 2026-10-09",
      })[0],
    ).toMatch(/https link/);
    expect(
      partnerProblems({ ...fields(), expiresAt: "2026-10-01" }),
    ).toContainEqual(expect.stringMatching(/later expiry/));
    const link = {
      title: "Open",
      url: derivLink.url,
      active: true,
      expiresAt: "",
    };
    expect(linkProblems(link, ["t.deriv.link"])).toEqual([]);
    expect(
      linkProblems({ ...link, url: "https://evil.example/x" }, [
        "t.deriv.link",
      ])[0],
    ).toMatch(/Owner-approved hosts: t.deriv.link/);
    for (const url of [
      "http://t.deriv.link/x",
      "https://u@t.deriv.link/x",
      "https://t.deriv.link:8443/x",
      "https://T.deriv.link/x",
    ])
      expect(linkProblems({ ...link, url }, ["t.deriv.link"])[0]).toMatch(
        /https link/,
      );
    expect(projectLink(linkBody(link))).toEqual(link);
  });
  it("accepts only exact commands", () => {
    expect(validPartnerEditorInput(save())).toBe(true);
    expect(validPartnerEditorInput({ ...save(), slug: "Deriv" })).toBe(false);
    expect(validPartnerEditorInput({ ...save(), extra: 1 })).toBe(false);
    expect(validPartnerEditorInput({ kind: "load", id: "deriv" })).toBe(false);
    expect(
      validPartnerEditorInput({
        kind: "policy",
        id: "link:deriv",
        expectedVersion: 1,
        riskNotice: null,
        allowedHosts: ["T.example"],
        reason: "x",
      }),
    ).toBe(false);
    expect(
      validPartnerEditorInput({
        kind: "policy",
        id: "partner:deriv",
        expectedVersion: 1,
        riskNotice: "Risk.",
        allowedHosts: null,
        reason: "x",
      }),
    ).toBe(true);
  });
});

describe("M22 MP09c partner editor service", () => {
  it("loads a partner with its policy and link presence, never a raw body", async () => {
    const r = await runPartnerEditor(fixture().client, {
      kind: "load",
      id: "partner:deriv",
    });
    expect(r).toMatchObject({
      kind: "ready",
      view: {
        kind: "partner",
        slug: "deriv",
        hasLink: true,
        policy: { version: 1, riskNotice: deriv.riskNotice },
      },
    });
    expect(JSON.stringify(r)).not.toMatch(/Spread/);
  });
  it("saves once, merging only edited fields over the latest stored body", async () => {
    const f = fixture();
    const r = await runPartnerEditor(
      f.client,
      save({ fields: { ...fields(), summary: "New summary." } }),
    );
    expect(r).toEqual({ kind: "saved", id: "partner:deriv", revision: 3 });
    const call = f.rpc.mock.calls.filter(
      ([fn]) => fn === "pipstart_editorial_save",
    );
    expect(call).toHaveLength(1);
    expect(call[0][1]).toMatchObject({
      p_id: "partner:deriv",
      p_base_revision: 2,
      p_body: { ...storedPartner(), summary: "New summary." },
    });
  });
  it("creates a link under its partner with the exact destination", async () => {
    const f = fixture();
    const r = await runPartnerEditor(f.client, {
      kind: "create-link",
      slug: "deriv",
      fields: {
        title: "Open",
        url: derivLink.url,
        active: true,
        expiresAt: "",
      },
      reason: "Add link",
    });
    expect(r).toEqual({ kind: "saved", id: "link:deriv", revision: 1 });
    expect(
      f.rpc.mock.calls.find(([fn]) => fn === "pipstart_editorial_create")![1],
    ).toEqual({
      p_id: "link:deriv",
      p_family: "link",
      p_learning_path: null,
      p_parent: "partner:deriv",
      p_body: {
        metadata: { title: "Open" },
        url: derivLink.url,
        active: true,
        expiresAt: null,
      },
      p_reason: "Add link",
    });
  });
  it("reports a stale base as a conflict without writing", async () => {
    const f = fixture();
    expect(await runPartnerEditor(f.client, save({ baseRevision: 1 }))).toEqual(
      { kind: "conflict" },
    );
    expect(
      f.rpc.mock.calls.some(([fn]) => fn === "pipstart_editorial_save"),
    ).toBe(false);
  });
  it("keeps policy with the Owner and roles outside partners out", async () => {
    const policy = {
      kind: "policy",
      id: "link:deriv",
      expectedVersion: 1,
      riskNotice: null,
      allowedHosts: ["t.deriv.link", "deriv.com"],
      reason: "Add host",
    };
    const am = fixture();
    expect(await runPartnerEditor(am.client, policy)).toEqual({
      kind: "denied",
    });
    expect(
      am.rpc.mock.calls.some(([fn]) => fn === "pipstart_partner_policy_set"),
    ).toBe(false);
    expect(await runPartnerEditor(fixture("owner").client, policy)).toEqual({
      kind: "policy-saved",
      id: "link:deriv",
      version: 2,
    });
    for (const role of ["author", "editor", "reviewer", "moderator"])
      expect(
        await runPartnerEditor(fixture(role).client, {
          kind: "load",
          id: "partner:deriv",
        }),
      ).toEqual({ kind: "denied" });
  });
  it("maps store refusals and never replays an unclear write", async () => {
    expect(
      await runPartnerEditor(
        fixture("affiliate_manager", { pipstart_editorial_save: "22023" })
          .client,
        save(),
      ),
    ).toEqual({ kind: "invalid" });
    expect(
      await runPartnerEditor(
        fixture("affiliate_manager", { pipstart_editorial_save: "42501" })
          .client,
        save(),
      ),
    ).toEqual({ kind: "denied" });
    const unclear = fixture("affiliate_manager", {
      pipstart_editorial_save: "XX000",
    });
    expect(await runPartnerEditor(unclear.client, save())).toEqual({
      kind: "uncertain",
    });
    expect(
      unclear.rpc.mock.calls.filter(([fn]) => fn === "pipstart_editorial_save"),
    ).toHaveLength(1);
  });
  it("is closed when the staff UI is off", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(
      await runPartnerEditor(fixture("owner").client, {
        kind: "load",
        id: "partner:deriv",
      }),
    ).toEqual({ kind: "denied" });
  });
});
