// TA-b: the staff analysis-post editor (Owner only; the store grants analysis writes to the Owner).
// Shared by the client form and the server runner. A trade idea's status time is never sent by
// the client: the server keeps the previous time when the status is unchanged and stamps "now"
// when it changes.
import type { ActionLimited } from "./staff-action-limit";
import { routeSegment } from "./routes";
import {
  editorTimeframes,
  tradeDirections,
  tradeIdeaProblem,
  tradeInstruments,
  tradeLimits,
  type TradeHistoryEntry,
  type TradeChart,
  type TradeDirection,
  type TradeIdea,
  type TradeOutcome,
  type TradeReason,
  type TradeState,
  type TradeTimeframe,
} from "./trade-idea";

export type AnalysisCategory = "fundamental" | "technical";

export type TradeStatusDraft = {
  state: TradeState;
  reason: TradeReason;
  note?: string;
  outcome?: TradeOutcome;
};

export type TradeDraft = {
  instrument: string;
  timeframe: TradeTimeframe;
  direction: TradeDirection;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  chart: TradeChart;
  status: TradeStatusDraft;
};

export type AnalysisDraftFields = {
  title: string;
  tag: string;
  excerpt: string;
  category: AnalysisCategory;
  paragraphs: string[];
  /** Technical posts only; null is a plain article without a trade idea. */
  trade: TradeDraft | null;
};

export type AnalysisDraftInput =
  | { kind: "load"; id: string }
  | {
      kind: "save";
      id: string;
      baseRevision: number;
      baseSha256: string;
      fields: AnalysisDraftFields;
      reason: string;
    }
  | { kind: "create"; id: string; fields: AnalysisDraftFields; reason: string };

export type AnalysisDraftView = {
  id: string;
  revision: number;
  bodySha256: string;
  fields: AnalysisDraftFields;
  /** When the saved status was set, for display only. */
  statusUpdatedAt: string | null;
};

export type AnalysisDraftResult =
  | ActionLimited
  | { kind: "ready"; item: AnalysisDraftView }
  | { kind: "saved"; id: string; revision: number; bodySha256: string }
  | { kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain" };

export const analysisLimits = {
  titleLength: 200,
  tagLength: 60,
  excerptLength: 300,
  paragraphs: 200,
  paragraphLength: 5000,
  reasonLength: 200,
} as const;

export const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>) => Object.keys(v).sort().join(",");
// Trimmed, no control characters (no line breaks), within the limit.
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" &&
  v.length > 0 &&
  v === v.trim() &&
  [...v].length <= max &&
  !/[\u0000-\u001f\u007f]/.test(v);

export const analysisId = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 100 && routeSegment.test(v);

const STATUS_KEYS = new Set([
  "reason,state",
  "note,reason,state",
  "note,outcome,reason,state",
]);

/** A trade draft from the editor: the store rule plus the editor's own lists. */
export function validTradeDraft(v: unknown): v is TradeDraft {
  if (
    !object(v) ||
    keys(v) !==
      "chart,direction,entry,instrument,status,stopLoss,takeProfit,timeframe" ||
    !object(v.chart) ||
    Object.keys(v.chart).some(
      (key) =>
        !["alt", "credit", "height", "path", "thumbnailPath", "width"].includes(
          key,
        ),
    ) ||
    !object(v.status) ||
    !STATUS_KEYS.has(keys(v.status)) ||
    !tradeInstruments.includes(String(v.instrument)) ||
    !(editorTimeframes as readonly string[]).includes(String(v.timeframe)) ||
    !(tradeDirections as readonly string[]).includes(String(v.direction))
  )
    return false;
  return (
    tradeIdeaProblem({
      ...v,
      status: { ...v.status, updatedAt: "2026-01-01T00:00:00.000Z" },
    }) === null
  );
}

export function validAnalysisFields(v: unknown): v is AnalysisDraftFields {
  return (
    object(v) &&
    keys(v) === "category,excerpt,paragraphs,tag,title,trade" &&
    text(v.title, analysisLimits.titleLength) &&
    text(v.tag, analysisLimits.tagLength) &&
    text(v.excerpt, analysisLimits.excerptLength) &&
    (v.category === "fundamental" || v.category === "technical") &&
    Array.isArray(v.paragraphs) &&
    v.paragraphs.length >= 1 &&
    v.paragraphs.length <= analysisLimits.paragraphs &&
    v.paragraphs.every((p) => text(p, analysisLimits.paragraphLength)) &&
    (v.trade === null ||
      (v.category === "technical" && validTradeDraft(v.trade)))
  );
}

export function validAnalysisInput(v: unknown): v is AnalysisDraftInput {
  if (!object(v) || !analysisId(v.id)) return false;
  if (v.kind === "load") return keys(v) === "id,kind";
  if (
    !validAnalysisFields(v.fields) ||
    !text(v.reason, analysisLimits.reasonLength)
  )
    return false;
  if (v.kind === "create") return keys(v) === "fields,id,kind,reason";
  return (
    v.kind === "save" &&
    keys(v) === "baseRevision,baseSha256,fields,id,kind,reason" &&
    Number.isSafeInteger(v.baseRevision) &&
    Number(v.baseRevision) >= 1 &&
    Number(v.baseRevision) < 2147483647 &&
    typeof v.baseSha256 === "string" &&
    /^[a-f0-9]{64}$/.test(v.baseSha256)
  );
}

/** The editable fields of a stored analysis body; null when the shape cannot be edited here. */
export function projectAnalysisFields(
  body: Record<string, unknown>,
): { fields: AnalysisDraftFields; statusUpdatedAt: string | null } | null {
  const m = body.metadata;
  if (!object(m)) return null;
  let trade: TradeDraft | null = null;
  let statusUpdatedAt: string | null = null;
  if (body.trade !== undefined) {
    if (tradeIdeaProblem(body.trade) !== null) return null;
    const stored = body.trade as TradeIdea;
    const { updatedAt, ...status } = stored.status;
    statusUpdatedAt = updatedAt;
    trade = {
      instrument: stored.instrument,
      timeframe: stored.timeframe,
      direction: stored.direction,
      entry: stored.entry,
      stopLoss: stored.stopLoss,
      takeProfit: stored.takeProfit,
      chart: { ...stored.chart },
      status,
    };
  }
  const fields = {
    title: m.title,
    tag: m.tag,
    excerpt: m.excerpt,
    category: m.category,
    paragraphs: body.paragraphs,
    trade,
  };
  // The trade already passed the store rule above; a stored value outside the editor's lists
  // (instrument or timeframe) still loads, and saving then asks for a listed value.
  if (
    !validAnalysisFields({ ...fields, trade: null }) ||
    (trade !== null && fields.category !== "technical")
  )
    return null;
  return { fields: fields as AnalysisDraftFields, statusUpdatedAt };
}

const sameStatus = (a: TradeStatusDraft, b: TradeStatusDraft) =>
  a.state === b.state &&
  a.reason === b.reason &&
  (a.note ?? "") === (b.note ?? "") &&
  (a.outcome ?? "") === (b.outcome ?? "");

/** Server use only. Writes the named fields and keeps every other stored key. */
export function mergeAnalysisFields(
  body: Record<string, unknown>,
  fields: AnalysisDraftFields,
  now: string,
): Record<string, unknown> | null {
  const m = body.metadata;
  if (body.metadata !== undefined && !object(m)) return null;
  const previous = projectAnalysisFields(body);
  const metadata: Record<string, unknown> = {
    ...(m as Record<string, unknown> | undefined),
    title: fields.title,
    category: fields.category,
    cluster: fields.category,
    excerpt: fields.excerpt,
    tag: fields.tag,
    publishedAt:
      object(m) && typeof m.publishedAt === "string" ? m.publishedAt : now,
    reviewedAt: now,
  };
  const next: Record<string, unknown> = {
    ...body,
    metadata,
    paragraphs: [...fields.paragraphs],
  };
  delete next.trade;
  if (fields.trade) {
    const before = previous?.fields.trade;
    const unchanged =
      !!before &&
      !!previous?.statusUpdatedAt &&
      sameStatus(before.status, fields.trade.status);
    const updatedAt = unchanged ? previous!.statusUpdatedAt! : now;
    // TA-c: a changed status moves the previous one, with its time, into the history.
    const stored =
      object(body.trade) && Array.isArray(body.trade.history)
        ? (body.trade.history as TradeHistoryEntry[])
        : [];
    const history =
      before && previous?.statusUpdatedAt && !unchanged
        ? [...stored, { ...before.status, at: previous.statusUpdatedAt }]
        : stored;
    next.trade = {
      ...fields.trade,
      chart: { ...fields.trade.chart },
      status: { ...fields.trade.status, updatedAt },
      ...(history.length
        ? { history: history.slice(-tradeLimits.historyEntries) }
        : {}),
    };
  }
  return next;
}
