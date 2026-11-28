import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const m = vi.hoisted(() => ({
  publication: vi.fn(),
  draft: vi.fn(),
  decision: vi.fn(),
  publish: vi.fn(),
}));
vi.mock("./publication", () => ({ runPublication: m.publication }));
vi.mock("./analysis-draft", () => ({ runAnalysisDraft: m.draft }));
vi.mock("./editorial-decision", () => ({ runEditorialDecision: m.decision }));
vi.mock("./publication-delivery", () => ({
  runPublicationWithDelivery: m.publish,
}));

const { runTradeStatusUpdate, statusChangeReason } =
  await import("./trade-status-update");
const { validStatusDraft, validStatusUpdate } =
  await import("./trade-status-update-contract");

const client = {} as SupabaseClient;
const SHA = "a".repeat(64);
const NEW_SHA = "b".repeat(64);
const view = {
  id: "eurusd-retest",
  revision: 5,
  bodySha256: SHA,
  statusUpdatedAt: "2026-11-27T14:30:00.000Z",
  fields: {
    title: "EUR/USD retest",
    tag: "Support",
    excerpt: "Retest.",
    category: "technical",
    paragraphs: ["One."],
    trade: {
      instrument: "EUR/USD",
      timeframe: "h4",
      direction: "buy-limit",
      entry: "1.0845",
      stopLoss: "1.0810",
      takeProfit: "1.0920",
      chart: { path: "2026/11/a.png", alt: "Chart", width: 1600, height: 900 },
      status: { state: "active", reason: "pending" },
    },
  },
};
const input = (
  status: Record<string, unknown> = {
    state: "inactive",
    reason: "take-profit",
  },
) => ({
  id: "eurusd-retest",
  revision: 5,
  sha: SHA,
  generation: 12,
  status,
});

beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  m.publication.mockReset().mockResolvedValue({
    kind: "status",
    status: {
      generation: 12,
      refresh: null,
      published: { revision: 5, bodySha256: SHA },
    },
  });
  m.draft
    .mockReset()
    .mockImplementation(async (_c: unknown, cmd: { kind: string }) =>
      cmd.kind === "load"
        ? { kind: "ready", item: structuredClone(view) }
        : {
            kind: "saved",
            id: "eurusd-retest",
            revision: 6,
            bodySha256: NEW_SHA,
          },
    );
  m.decision.mockReset().mockResolvedValue({
    kind: "done",
    id: "eurusd-retest",
    revision: 6,
    state: "approved",
  });
  m.publish.mockReset().mockResolvedValue({
    kind: "done",
    generation: 13,
    replayed: false,
    delivery: "started",
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("one-step live status update (TA-c)", () => {
  it("saves the new status, approves it and publishes it with delivery", async () => {
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "done",
      revision: 6,
      generation: 13,
      delivery: "started",
    });
    const save = m.draft.mock.calls[1][1];
    expect(save).toMatchObject({
      kind: "save",
      baseRevision: 5,
      baseSha256: SHA,
      reason: "Trade status: Take profit reached: closed in profit",
    });
    expect(save.fields.trade.status).toEqual({
      state: "inactive",
      reason: "take-profit",
    });
    expect(m.decision).toHaveBeenCalledWith(client, {
      action: "publish",
      id: "eurusd-retest",
      revision: 6,
      sha: NEW_SHA,
      note: null,
    });
    const publish = m.publish.mock.calls[0][1];
    expect(publish).toMatchObject({
      action: "publish",
      expected: 12,
      id: "eurusd-retest",
      revision: 6,
      sha: NEW_SHA,
    });
    expect(publish.operation).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("refuses when the latest revision is not the live one, before writing", async () => {
    m.publication.mockResolvedValue({
      kind: "status",
      status: {
        generation: 12,
        refresh: null,
        published: { revision: 4, bodySha256: "c".repeat(64) },
      },
    });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "not-live",
    });
    m.publication.mockResolvedValue({
      kind: "status",
      status: { generation: 12, refresh: null, published: null },
    });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "not-live",
    });
    m.publication.mockResolvedValue({
      kind: "status",
      status: {
        generation: 12,
        refresh: null,
        published: { revision: 5, bodySha256: SHA },
      },
    });
    m.draft.mockResolvedValueOnce({
      kind: "ready",
      item: { ...view, revision: 7 },
    });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "not-live",
    });
    expect(m.decision).not.toHaveBeenCalled();
    expect(m.publish).not.toHaveBeenCalled();
  });

  it("refuses a moved generation and an unchanged status without writing", async () => {
    m.publication.mockResolvedValueOnce({
      kind: "status",
      status: {
        generation: 13,
        refresh: null,
        published: { revision: 5, bodySha256: SHA },
      },
    });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "conflict",
    });
    expect(
      await runTradeStatusUpdate(
        client,
        input({ state: "active", reason: "pending" }),
      ),
    ).toEqual({
      kind: "unchanged",
    });
    expect(m.draft.mock.calls.every((c) => c[1].kind === "load")).toBe(true);
  });

  it("says which steps finished when the chain stops", async () => {
    m.decision.mockResolvedValueOnce({ kind: "uncertain" });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "stopped",
      step: "saved",
      revision: 6,
    });
    expect(m.publish).not.toHaveBeenCalled();
    m.publish.mockResolvedValueOnce({ kind: "conflict" });
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "stopped",
      step: "approved",
      revision: 6,
    });
  });

  it("passes a refused save through and publishes nothing", async () => {
    m.draft.mockImplementation(async (_c: unknown, cmd: { kind: string }) =>
      cmd.kind === "load"
        ? { kind: "ready", item: structuredClone(view) }
        : { kind: "limited", retryAfter: 60 },
    );
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "limited",
      retryAfter: 60,
    });
    expect(m.decision).not.toHaveBeenCalled();
  });

  it("checks the input exactly", async () => {
    expect(
      await runTradeStatusUpdate(client, { ...input(), extra: 1 }),
    ).toEqual({ kind: "invalid" });
    expect(
      validStatusUpdate(input({ state: "active", reason: "take-profit" })),
    ).toBe(false);
    expect(
      validStatusDraft({
        state: "active",
        reason: "active-other",
        note: "Waiting for NFP",
      }),
    ).toBe(true);
    expect(validStatusDraft({ state: "active", reason: "active-other" })).toBe(
      false,
    );
    expect(
      validStatusDraft({
        state: "inactive",
        reason: "inactive-other",
        note: "News",
        outcome: "void",
      }),
    ).toBe(true);
    expect(
      validStatusDraft({
        state: "inactive",
        reason: "take-profit",
        outcome: "profit",
      }),
    ).toBe(false);
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(await runTradeStatusUpdate(client, input())).toEqual({
      kind: "denied",
    });
    expect(m.publication).not.toHaveBeenCalled();
  });

  it("writes a one-line reason within 200 characters", () => {
    expect(
      statusChangeReason({
        state: "active",
        reason: "active-other",
        note: "x".repeat(140),
      }).length,
    ).toBeLessThanOrEqual(200);
  });
});
