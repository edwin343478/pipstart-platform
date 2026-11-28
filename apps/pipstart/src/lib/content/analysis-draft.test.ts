import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runAnalysisDraft } from "./analysis-draft";
import {
  mergeAnalysisFields,
  projectAnalysisFields,
  validAnalysisFields,
  validAnalysisInput,
  type AnalysisDraftFields,
  type TradeDraft,
} from "./analysis-draft-contract";
import { checkContentBody } from "./validate";

const actor = "d1000000-0000-4000-8000-000000000001";
const NOW = new Date("2026-11-28T10:00:00.000Z");
const trade = (): TradeDraft => ({
  instrument: "EUR/USD",
  timeframe: "h4",
  direction: "buy-limit",
  entry: "1.0845",
  stopLoss: "1.0810",
  takeProfit: "1.0920",
  chart: {
    path: "2026/11/abc123.png",
    alt: "EUR/USD 4H chart",
    width: 1600,
    height: 900,
  },
  status: { state: "active", reason: "pending" },
});
const fields = (): AnalysisDraftFields => ({
  title: "EUR/USD: buying the retest of 1.0845 support",
  tag: "Support & Resistance",
  excerpt: "We wait for a calm retest before buying.",
  category: "technical",
  paragraphs: ["First paragraph.", "Second paragraph."],
  trade: trade(),
});
const storedBody = () => ({
  opaque: "PRIVATE_BODY_SENTINEL",
  metadata: {
    title: "Old title",
    category: "technical",
    excerpt: "Old",
    tag: "Old tag",
    publishedAt: "2026-11-27T09:00:00.000Z",
    reviewedAt: "2026-11-27T09:00:00.000Z",
    cluster: "technical",
    extra: { kept: true },
  },
  paragraphs: ["Old paragraph."],
  trade: {
    ...trade(),
    status: {
      state: "active",
      reason: "pending",
      updatedAt: "2026-11-27T14:30:00.000Z",
    },
  },
});
const raw = (body: unknown = storedBody()) => ({
  item: {
    id: "eurusd-retest",
    family: "analysis",
    learning_path: null,
    parent_id: null,
    latest_revision: 3,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body,
    body_sha256: "a".repeat(64),
    base_revision: 2,
    author_is_me: true,
    state: "approved",
    created_at: "2026-11-27T00:00:00Z",
  },
  decisions: [],
  review_required: false,
});

function fixture(role = "owner", body?: unknown) {
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(() => Promise.resolve({ data, error })),
  });
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string, args?: Record<string, unknown>) =>
    fn === "pipstart_staff_access"
      ? response({
          authorized: true,
          user_id: actor,
          roles: [role],
          capabilities: ["staff.enter"],
        })
      : fn === "pipstart_editorial_item"
        ? response(raw(body))
        : response({
            item_id: args?.p_id,
            revision_no: fn === "pipstart_editorial_create" ? 1 : 4,
            body_sha256: "b".repeat(64),
            state: "draft",
          }),
  );
  return {
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
const sent = (rpc: ReturnType<typeof vi.fn>, fn: string) =>
  rpc.mock.calls.find((c) => c[0] === fn)?.[1] as
    Record<string, unknown> | undefined;

beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("analysis draft contract (TA-b)", () => {
  it("accepts a technical post with or without a trade idea, and a fundamental post", () => {
    expect(validAnalysisFields(fields())).toBe(true);
    expect(validAnalysisFields({ ...fields(), trade: null })).toBe(true);
    expect(
      validAnalysisFields({
        ...fields(),
        category: "fundamental",
        trade: null,
      }),
    ).toBe(true);
  });

  it.each([
    ["a fundamental post with a trade", { category: "fundamental" }],
    ["a blank title", { title: "" }],
    ["a padded tag", { tag: " Tag" }],
    ["no paragraphs", { paragraphs: [] }],
    ["a paragraph with a line break", { paragraphs: ["One\nTwo"] }],
    [
      "an instrument outside the list",
      { trade: { ...trade(), instrument: "USD/ZAR" } },
    ],
    [
      "a timeframe outside the editor list",
      { trade: { ...trade(), timeframe: "w1" } },
    ],
    [
      "a sell with buy-side levels",
      { trade: { ...trade(), direction: "sell" } },
    ],
    [
      "a status time sent by the browser",
      {
        trade: {
          ...trade(),
          status: {
            state: "active",
            reason: "pending",
            updatedAt: "2026-11-28T00:00:00Z",
          },
        },
      },
    ],
    [
      "Other without a note",
      {
        trade: {
          ...trade(),
          status: { state: "active", reason: "active-other" },
        },
      },
    ],
    [
      "a missing chart",
      {
        trade: {
          ...trade(),
          chart: { path: "", alt: "x", width: 1, height: 1 },
        },
      },
    ],
  ])("refuses %s", (_name, patch) =>
    expect(validAnalysisFields({ ...fields(), ...patch })).toBe(false),
  );

  it("offers every listed instrument and the five editor timeframes", () => {
    for (const instrument of [
      "XAU/USD",
      "XAG/USD",
      "US30",
      "GER40",
      "NZD/CAD",
      "GBP/USD",
    ])
      expect(
        validAnalysisFields({ ...fields(), trade: { ...trade(), instrument } }),
      ).toBe(true);
    for (const timeframe of ["d1", "h4", "h1", "m30", "m15"])
      expect(
        validAnalysisFields({
          ...fields(),
          trade: { ...trade(), timeframe } as TradeDraft,
        }),
      ).toBe(true);
  });

  it("checks create and save commands exactly", () => {
    expect(
      validAnalysisInput({
        kind: "create",
        id: "eurusd-retest",
        fields: fields(),
        reason: "New idea",
      }),
    ).toBe(true);
    expect(
      validAnalysisInput({
        kind: "create",
        id: "EURUSD",
        fields: fields(),
        reason: "New idea",
      }),
    ).toBe(false);
    expect(
      validAnalysisInput({
        kind: "save",
        id: "eurusd-retest",
        baseRevision: 3,
        baseSha256: "a".repeat(64),
        fields: fields(),
        reason: "",
      }),
    ).toBe(false);
    expect(
      validAnalysisInput({ kind: "load", id: "eurusd-retest", extra: 1 }),
    ).toBe(false);
  });

  it("keeps the status time when the status is unchanged, and stamps a changed one", () => {
    const same = mergeAnalysisFields(
      storedBody(),
      fields(),
      NOW.toISOString(),
    )!;
    expect(
      (same.trade as { status: { updatedAt: string } }).status.updatedAt,
    ).toBe("2026-11-27T14:30:00.000Z");
    const closed = mergeAnalysisFields(
      storedBody(),
      {
        ...fields(),
        trade: {
          ...trade(),
          status: { state: "inactive", reason: "take-profit" },
        },
      },
      NOW.toISOString(),
    )!;
    expect(
      (closed.trade as { status: { updatedAt: string } }).status.updatedAt,
    ).toBe(NOW.toISOString());
    expect(checkContentBody("analysis", closed)).toEqual({ ok: true });
  });

  it("keeps unedited keys and the first publication time, and drops a removed trade", () => {
    const body = mergeAnalysisFields(
      storedBody(),
      { ...fields(), trade: null },
      NOW.toISOString(),
    )!;
    expect(body.opaque).toBe("PRIVATE_BODY_SENTINEL");
    expect(body.trade).toBeUndefined();
    expect(body.metadata).toMatchObject({
      extra: { kept: true },
      publishedAt: "2026-11-27T09:00:00.000Z",
      reviewedAt: NOW.toISOString(),
      cluster: "technical",
    });
  });

  it("loads a stored post into editor fields with the status time apart", () => {
    const projected = projectAnalysisFields(storedBody())!;
    expect(projected.statusUpdatedAt).toBe("2026-11-27T14:30:00.000Z");
    expect(projected.fields.trade?.status).toEqual({
      state: "active",
      reason: "pending",
    });
    expect(projectAnalysisFields({ metadata: { title: "x" } })).toBeNull();
  });
});

describe("analysis draft runner (TA-b, Owner only)", () => {
  it("creates a draft analysis post with both times set", async () => {
    const { rpc, client } = fixture();
    expect(
      await runAnalysisDraft(
        client,
        {
          kind: "create",
          id: "eurusd-retest",
          fields: fields(),
          reason: "New idea",
        },
        () => NOW,
      ),
    ).toEqual({
      kind: "saved",
      id: "eurusd-retest",
      revision: 1,
      bodySha256: "b".repeat(64),
    });
    const args = sent(rpc, "pipstart_editorial_create")!;
    expect(args).toMatchObject({
      p_family: "analysis",
      p_learning_path: null,
      p_parent: null,
    });
    const body = args.p_body as {
      metadata: Record<string, unknown>;
      trade: { status: { updatedAt: string } };
    };
    expect(body.metadata.publishedAt).toBe(NOW.toISOString());
    expect(body.trade.status.updatedAt).toBe(NOW.toISOString());
  });

  it("refuses everyone but the Owner before any write", async () => {
    const { rpc, client } = fixture("editor");
    expect(
      await runAnalysisDraft(client, { kind: "load", id: "eurusd-retest" }),
    ).toEqual({ kind: "denied" });
    expect(rpc.mock.calls.map((c) => c[0])).toEqual(["pipstart_staff_access"]);
  });

  it("loads, saves on the exact base and refuses a stale base", async () => {
    const { rpc, client } = fixture();
    const loaded = await runAnalysisDraft(client, {
      kind: "load",
      id: "eurusd-retest",
    });
    expect(loaded).toMatchObject({
      kind: "ready",
      item: { revision: 3, statusUpdatedAt: "2026-11-27T14:30:00.000Z" },
    });
    const base = {
      kind: "save",
      id: "eurusd-retest",
      baseSha256: "a".repeat(64),
      fields: fields(),
      reason: "Update",
    };
    expect(
      await runAnalysisDraft(client, { ...base, baseRevision: 2 }),
    ).toEqual({ kind: "conflict" });
    expect(sent(rpc, "pipstart_editorial_save")).toBeUndefined();
    expect(
      await runAnalysisDraft(client, { ...base, baseRevision: 3 }, () => NOW),
    ).toMatchObject({ kind: "saved", revision: 4 });
    expect(sent(rpc, "pipstart_editorial_save")).toMatchObject({
      p_id: "eurusd-retest",
      p_base_revision: 3,
    });
  });

  it("is off without the staff switch and refuses malformed input", async () => {
    const { rpc, client } = fixture();
    expect(
      await runAnalysisDraft(client, { kind: "load", id: "../x" }),
    ).toEqual({ kind: "invalid" });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(
      await runAnalysisDraft(client, { kind: "load", id: "eurusd-retest" }),
    ).toEqual({ kind: "denied" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reports a store refusal after sending as uncertain only when unclear", async () => {
    const { rpc, client } = fixture();
    rpc.mockImplementation(((fn: string) =>
      fn === "pipstart_staff_access"
        ? {
            abortSignal: () =>
              Promise.resolve({
                data: {
                  authorized: true,
                  user_id: actor,
                  roles: ["owner"],
                  capabilities: ["staff.enter"],
                },
                error: null,
              }),
          }
        : {
            abortSignal: () => Promise.reject(new Error("network")),
          }) as never);
    expect(
      await runAnalysisDraft(client, {
        kind: "create",
        id: "eurusd-retest",
        fields: fields(),
        reason: "New",
      }),
    ).toEqual({ kind: "uncertain" });
  });
});

describe("status history (TA-c)", () => {
  it("moves the previous status into the history when the status changes", () => {
    const closed = {
      ...fields(),
      trade: {
        ...trade(),
        status: { state: "inactive" as const, reason: "take-profit" as const },
      },
    };
    const once = mergeAnalysisFields(storedBody(), closed, NOW.toISOString())!;
    expect((once.trade as { history: unknown[] }).history).toEqual([
      { state: "active", reason: "pending", at: "2026-11-27T14:30:00.000Z" },
    ]);
    expect(checkContentBody("analysis", once)).toEqual({ ok: true });
    // An unchanged status keeps the history as it is.
    const again = mergeAnalysisFields(
      once,
      closed,
      "2026-11-29T10:00:00.000Z",
    )!;
    expect((again.trade as { history: unknown[] }).history).toHaveLength(1);
    expect(
      (again.trade as { status: { updatedAt: string } }).status.updatedAt,
    ).toBe(NOW.toISOString());
  });

  it("keeps at most the 50 latest earlier statuses", () => {
    const body = storedBody() as Record<string, unknown> & {
      trade: Record<string, unknown>;
    };
    body.trade.history = Array.from({ length: 50 }, () => ({
      state: "active",
      reason: "pending",
      at: "2026-11-20T00:00:00.000Z",
    }));
    const next = mergeAnalysisFields(
      body,
      {
        ...fields(),
        trade: { ...trade(), status: { state: "active", reason: "triggered" } },
      },
      NOW.toISOString(),
    )!;
    const history = (next.trade as { history: { at: string }[] }).history;
    expect(history).toHaveLength(50);
    expect(history.at(-1)!.at).toBe("2026-11-27T14:30:00.000Z");
  });

  it("drops the history with the trade idea when the trade is removed", () => {
    expect(
      mergeAnalysisFields(
        storedBody(),
        { ...fields(), trade: null },
        NOW.toISOString(),
      )!.trade,
    ).toBeUndefined();
  });
});
