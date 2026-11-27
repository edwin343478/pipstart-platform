// TA-b: the analysis editor's form state. Pure, so the form logic is testable without a browser.
import { actionLimitMessage } from "./staff-action-limit";
import {
  tradeReasons,
  isOtherReason,
  type TradeDirection,
  type TradeOutcome,
  type TradeReason,
  type TradeTimeframe,
} from "./trade-idea";
import type {
  AnalysisCategory,
  AnalysisDraftFields,
  AnalysisDraftResult,
  AnalysisDraftView,
} from "./analysis-draft-contract";

export type TradeForm = {
  instrument: string;
  timeframe: TradeTimeframe;
  direction: TradeDirection;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  chartPath: string;
  chartAlt: string;
  chartCredit?: string;
  chartThumbnailPath?: string;
  chartWidth: number;
  chartHeight: number;
  reason: TradeReason;
  note: string;
  outcome: TradeOutcome;
};

export type AnalysisForm = {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  category: AnalysisCategory;
  bodyText: string;
  hasTrade: boolean;
  trade: TradeForm;
};

export const emptyTradeForm: TradeForm = {
  instrument: "EUR/USD",
  timeframe: "h4",
  direction: "buy",
  entry: "",
  stopLoss: "",
  takeProfit: "",
  chartPath: "",
  chartAlt: "",
  chartWidth: 0,
  chartHeight: 0,
  reason: "pending",
  note: "",
  outcome: "void",
};

export const emptyAnalysisForm: AnalysisForm = {
  id: "",
  title: "",
  tag: "",
  excerpt: "",
  category: "technical",
  bodyText: "",
  hasTrade: true,
  trade: emptyTradeForm,
};

/** Paragraphs are separated by a blank line; line breaks inside one become spaces. */
export const paragraphsFrom = (text: string) =>
  text
    .split(/\n[ \t]*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

export function formFromView(view: AnalysisDraftView): AnalysisForm {
  const f = view.fields;
  const t = f.trade;
  return {
    id: view.id,
    title: f.title,
    tag: f.tag,
    excerpt: f.excerpt,
    category: f.category,
    bodyText: f.paragraphs.join("\n\n"),
    hasTrade: t !== null,
    trade: t
      ? {
          instrument: t.instrument,
          timeframe: t.timeframe,
          direction: t.direction,
          entry: t.entry,
          stopLoss: t.stopLoss,
          takeProfit: t.takeProfit,
          chartPath: t.chart.path,
          chartAlt: t.chart.alt,
          ...(t.chart.credit ? { chartCredit: t.chart.credit } : {}),
          ...(t.chart.thumbnailPath
            ? { chartThumbnailPath: t.chart.thumbnailPath }
            : {}),
          chartWidth: t.chart.width,
          chartHeight: t.chart.height,
          reason: t.status.reason,
          note: t.status.note ?? "",
          outcome: t.status.outcome ?? "void",
        }
      : emptyTradeForm,
  };
}

/** The fields sent to the server; the server applies the full rule again. */
export function fieldsFromForm(form: AnalysisForm): AnalysisDraftFields {
  const t = form.trade;
  const tradeOn = form.category === "technical" && form.hasTrade;
  return {
    title: form.title.trim(),
    tag: form.tag.trim(),
    excerpt: form.excerpt.trim(),
    category: form.category,
    paragraphs: paragraphsFrom(form.bodyText),
    trade: tradeOn
      ? {
          instrument: t.instrument,
          timeframe: t.timeframe,
          direction: t.direction,
          entry: t.entry.trim(),
          stopLoss: t.stopLoss.trim(),
          takeProfit: t.takeProfit.trim(),
          chart: {
            path: t.chartPath,
            alt: t.chartAlt.trim(),
            ...(t.chartCredit?.trim() ? { credit: t.chartCredit.trim() } : {}),
            ...(t.chartThumbnailPath
              ? { thumbnailPath: t.chartThumbnailPath }
              : {}),
            width: t.chartWidth,
            height: t.chartHeight,
          },
          status: {
            state: tradeReasons[t.reason].state,
            reason: t.reason,
            ...(isOtherReason(t.reason) ? { note: t.note.trim() } : {}),
            ...(t.reason === "inactive-other" ? { outcome: t.outcome } : {}),
          },
        }
      : null,
  };
}

export type EditorPhase =
  "idle" | "busy" | "conflict" | "uncertain" | "denied" | "saved";

export type AnalysisEditorState = {
  form: AnalysisForm;
  reason: string;
  phase: EditorPhase;
  message: string;
  base: AnalysisDraftView | null;
  clean: string;
};

export const editorBuffer = (form: AnalysisForm, reason: string) =>
  JSON.stringify({ form, reason });

export function initialAnalysisEditor(
  item: AnalysisDraftView | null,
): AnalysisEditorState {
  const form = item ? formFromView(item) : { ...emptyAnalysisForm };
  return {
    form,
    reason: "",
    phase: "idle",
    message: "",
    base: item,
    clean: editorBuffer(form, ""),
  };
}

export type AnalysisEditorEvent =
  | { type: "form"; patch: Partial<AnalysisForm> }
  | { type: "trade"; patch: Partial<TradeForm> }
  | { type: "reason"; value: string }
  | { type: "busy" }
  | { type: "invalid" }
  | { type: "result"; result: AnalysisDraftResult }
  | { type: "reloaded"; result: AnalysisDraftResult };

export function analysisEditorReducer(
  s: AnalysisEditorState,
  e: AnalysisEditorEvent,
): AnalysisEditorState {
  if (e.type === "form") return { ...s, form: { ...s.form, ...e.patch } };
  if (e.type === "trade")
    return {
      ...s,
      form: { ...s.form, trade: { ...s.form.trade, ...e.patch } },
    };
  if (e.type === "reason") return { ...s, reason: e.value };
  if (e.type === "busy")
    return {
      ...s,
      phase: "busy",
      message: "Checking current access and saving this exact draft…",
    };
  if (e.type === "invalid")
    return {
      ...s,
      phase: "idle",
      message:
        "Check the highlighted rules: title, tag, summary and text are required; a trade idea needs a chart, its description, prices in the right order and, for “Other”, a written explanation. Give a change reason. Your values are preserved.",
    };
  if (e.type === "reloaded") {
    if (e.result.kind === "ready")
      return {
        ...initialAnalysisEditor(e.result.item),
        message: "Saved draft reloaded. You can make further changes.",
      };
    return {
      ...s,
      message:
        "The saved draft could not be read. Reload the page to continue; nothing was sent.",
    };
  }
  if (e.type === "result") {
    const r = e.result;
    if (r.kind === "saved")
      return {
        ...s,
        reason: "",
        phase: "saved",
        clean: editorBuffer(s.form, ""),
        message:
          "Draft saved. It is not public yet: approve and publish it from the content library. Reload the saved draft before another save.",
        base: s.base
          ? { ...s.base, revision: r.revision, bodySha256: r.bodySha256 }
          : null,
        form: { ...s.form, id: r.id },
      };
    const phase: EditorPhase =
      r.kind === "conflict"
        ? "conflict"
        : r.kind === "uncertain" || r.kind === "ready"
          ? "uncertain"
          : r.kind === "denied"
            ? "denied"
            : "idle";
    return {
      ...s,
      phase,
      message:
        r.kind === "conflict"
          ? "A newer revision exists, or that address is already taken. Your changes are preserved; nothing was overwritten."
          : phase === "uncertain"
            ? "The save outcome is uncertain. Do not resend it. Open the content library and check the latest revision first."
            : r.kind === "denied"
              ? "Only the Owner can edit analysis posts, or your staff access changed. Saving is blocked; your values remain in this tab."
              : r.kind === "limited"
                ? actionLimitMessage(r.retryAfter)
                : "The request was refused or unavailable. Your values are preserved.",
    };
  }
  return s;
}
