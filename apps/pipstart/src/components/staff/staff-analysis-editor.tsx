"use client";
// TA-b: the Owner's editor for analysis posts and their trade ideas. It saves private drafts
// only; approval and publication stay in the content library panels.
import {
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { runAnalysisDraftAction } from "@/app/admin/staff/content/analysis-actions";
import {
  analysisLimits,
  validAnalysisInput,
  type AnalysisDraftInput,
  type AnalysisDraftView,
} from "@/lib/content/analysis-draft-contract";
import {
  analysisEditorReducer,
  editorBuffer,
  fieldsFromForm,
  initialAnalysisEditor,
  type TradeForm,
} from "@/lib/content/analysis-editor-state";
import {
  CHART_MAX_BYTES,
  type ChartUploadResult,
} from "@/lib/content/chart-image";
import {
  directionLabels,
  editorTimeframes,
  instrumentNames,
  isBuy,
  isOtherReason,
  outcomeLabels,
  PRICE_PATTERN,
  reasonLabels,
  timeframeLabels,
  tradeChartEditorUrl,
  tradeDirections,
  tradeInstrumentGroups,
  tradeInstruments,
  tradeLimits,
  tradeOutcomes,
  tradeReasons,
  tradeRiskReward,
  type TradeDirection,
  type TradeOutcome,
  type TradeReason,
  type TradeTimeframe,
} from "@/lib/content/trade-idea";
import { routeSegment } from "@/lib/content/routes";
import { useDraftLeaveGuard } from "./use-draft-leave-guard";
import s from "@/components/admin-preview/admin-preview.module.css";
import shell from "./staff-curriculum-editor.module.css";
import styles from "./staff-analysis-editor.module.css";

const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

const activeReasons = (Object.keys(tradeReasons) as TradeReason[]).filter(
  (r) => tradeReasons[r].state === "active",
);
const inactiveReasons = (Object.keys(tradeReasons) as TradeReason[]).filter(
  (r) => tradeReasons[r].state === "inactive",
);
const reasonOption = (r: TradeReason) =>
  isOtherReason(r) ? reasonLabels[r] + " (write my own)…" : reasonLabels[r];

/** A URL-safe address from a title: lowercase words joined by hyphens. */
export const addressFromTitle = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/, "");

/** Plain-language problems with the prices, shown as the Owner types. */
export function priceProblem(
  t: Pick<TradeForm, "direction" | "entry" | "stopLoss" | "takeProfit">,
) {
  const prices = [t.entry, t.stopLoss, t.takeProfit].map((p) => p.trim());
  if (prices.some((p) => p === "")) return null;
  if (prices.some((p) => !PRICE_PATTERN.test(p)))
    return "Use digits and one decimal point, for example 1.0845.";
  const [entry, stop, target] = prices.map(Number);
  if (isBuy(t.direction) && !(stop < entry && entry < target))
    return "For a buy, the stop loss must be below the entry and the take profit above it.";
  if (!isBuy(t.direction) && !(target < entry && entry < stop))
    return "For a sell, the stop loss must be above the entry and the take profit below it.";
  return null;
}

export function StaffAnalysisEditor({
  item,
}: {
  item: AnalysisDraftView | null;
}) {
  const [state, dispatch] = useReducer(
    analysisEditorReducer,
    item,
    initialAnalysisEditor,
  );
  const [addressEdited, setAddressEdited] = useState(false);
  const [upload, setUpload] = useState<{ busy: boolean; message: string }>({
    busy: false,
    message: "",
  });
  const [reloading, setReloading] = useState(false);
  const lock = useRef(false),
    status = useRef<HTMLParagraphElement>(null);
  const { form } = state;
  const trade = form.trade;
  const dirty = editorBuffer(form, state.reason) !== state.clean;
  useDraftLeaveGuard(
    dirty || state.phase === "busy" || state.phase === "uncertain",
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientHydrated,
    serverHydrated,
  );
  const existing = state.base !== null || state.phase === "saved";
  const disabled =
    !hydrated ||
    reloading ||
    state.phase === "busy" ||
    state.phase === "uncertain" ||
    state.phase === "denied" ||
    state.phase === "saved";
  const showTrade = form.category === "technical" && form.hasTrade;
  const problem = showTrade ? priceProblem(trade) : null;
  const pricesReady =
    showTrade &&
    !problem &&
    [trade.entry, trade.stopLoss, trade.takeProfit].every((p) => p.trim());
  const rr = pricesReady ? tradeRiskReward(trade) : null;
  const chartSrc = trade.chartPath
    ? tradeChartEditorUrl(trade.chartPath, process.env.NEXT_PUBLIC_SUPABASE_URL)
    : null;
  const reasonState = tradeReasons[trade.reason].state;
  const statusPreview = isOtherReason(trade.reason)
    ? trade.note.trim() || "Your explanation will appear here"
    : reasonLabels[trade.reason];
  const outcome =
    trade.reason === "inactive-other"
      ? trade.outcome
      : tradeReasons[trade.reason].outcome;
  const setTrade = (patch: Partial<TradeForm>) =>
    dispatch({ type: "trade", patch });

  async function chooseChart(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || upload.busy) return;
    if (file.size > CHART_MAX_BYTES) {
      setUpload({ busy: false, message: "Charts must be 4 MB or smaller." });
      return;
    }
    setUpload({ busy: true, message: "Uploading chart…" });
    try {
      const response = await fetch("/admin/staff/content/analysis/chart", {
        method: "POST",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });
      const result = (await response.json()) as ChartUploadResult;
      if (result.kind === "uploaded") {
        setTrade({
          chartPath: result.path,
          chartThumbnailPath: undefined,
          chartWidth: result.width,
          chartHeight: result.height,
        });
        setUpload({
          busy: false,
          message: `Chart uploaded (${result.width} × ${result.height}). Save the draft to keep it.`,
        });
      } else
        setUpload({
          busy: false,
          message:
            result.kind === "invalid"
              ? result.reason + "."
              : result.kind === "denied"
                ? "Only the Owner can upload charts."
                : "The upload is unavailable. Try again.",
        });
    } catch {
      setUpload({ busy: false, message: "The upload failed. Try again." });
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || state.phase !== "idle") return;
    const fields = fieldsFromForm(form);
    const command: AnalysisDraftInput = state.base
      ? {
          kind: "save",
          id: state.base.id,
          baseRevision: state.base.revision,
          baseSha256: state.base.bodySha256,
          fields,
          reason: state.reason.trim(),
        }
      : { kind: "create", id: form.id, fields, reason: state.reason.trim() };
    if (!validAnalysisInput(command)) {
      dispatch({ type: "invalid" });
      status.current?.focus();
      return;
    }
    lock.current = true;
    dispatch({ type: "busy" });
    try {
      dispatch({
        type: "result",
        result: await runAnalysisDraftAction(command),
      });
    } catch {
      dispatch({ type: "result", result: { kind: "uncertain" } });
    } finally {
      lock.current = false;
      status.current?.focus();
    }
  }

  async function reload() {
    const id = state.base?.id || form.id;
    if (lock.current || !id) return;
    lock.current = true;
    setReloading(true);
    try {
      dispatch({
        type: "reloaded",
        result: await runAnalysisDraftAction({ kind: "load", id }),
      });
    } catch {
      dispatch({ type: "reloaded", result: { kind: "unavailable" } });
    } finally {
      lock.current = false;
      setReloading(false);
      status.current?.focus();
    }
  }

  return (
    <div className={`${shell.editor} ${shell.redesign} ${styles.analysis}`}>
      <header className={shell.head}>
        <a className={shell.back} href="/admin/staff/content">
          Back to content library
        </a>
        <div className={shell.headRow}>
          <div className={shell.headText}>
            <p className={shell.eyebrow}>Content · Analysis post</p>
            <h1>{state.base ? "Edit analysis post" : "New analysis post"}</h1>
            <p>
              Save a private draft of the post and its trade idea. Saving does
              not change the public site: approve and publish the draft from the
              content library.
            </p>
          </div>
        </div>
      </header>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        ref={status}
        tabIndex={-1}
        className={shell.notice}
        data-state={state.message ? "message" : dirty ? "unsaved" : "clean"}
      >
        {state.message || (dirty ? "Unsaved changes." : "No unsaved changes.")}
      </p>
      <form
        onSubmit={(event) => void save(event)}
        aria-busy={!hydrated || state.phase === "busy" || reloading}
        className={`${s.panel} ${shell.formCard}`}
      >
        <fieldset disabled={disabled}>
          <legend>Post</legend>
          {state.base ? (
            <dl className={shell.identityTiles}>
              <div className={shell.tileWide}>
                <dt>Address</dt>
                <dd className={shell.mono}>/analysis/{state.base.id}</dd>
              </div>
              <div>
                <dt>Base revision</dt>
                <dd>{state.base.revision}</dd>
              </div>
            </dl>
          ) : null}
          <div className={`${shell.grid} ${shell.fields}`}>
            <label htmlFor="analysis-title" className={shell.wide}>
              Title
              <input
                id="analysis-title"
                required
                maxLength={analysisLimits.titleLength}
                value={form.title}
                onChange={(e) =>
                  dispatch({
                    type: "form",
                    patch: {
                      title: e.target.value,
                      ...(!state.base && !addressEdited
                        ? { id: addressFromTitle(e.target.value) }
                        : {}),
                    },
                  })
                }
              />
            </label>
            {!state.base && (
              <label htmlFor="analysis-address" className={shell.wide}>
                Page address
                <input
                  id="analysis-address"
                  required
                  maxLength={100}
                  pattern={routeSegment.source.slice(1, -1)}
                  className={shell.mono}
                  aria-describedby="analysis-address-help"
                  value={form.id}
                  onChange={(e) => {
                    setAddressEdited(true);
                    dispatch({ type: "form", patch: { id: e.target.value } });
                  }}
                />
                <span id="analysis-address-help">
                  pipstart.net/analysis/{form.id || "your-post"}. Lowercase
                  words joined by hyphens; it cannot be changed later.
                </span>
              </label>
            )}
            <label htmlFor="analysis-category">
              Section
              <select
                id="analysis-category"
                value={form.category}
                onChange={(e) =>
                  dispatch({
                    type: "form",
                    patch: {
                      category: e.target.value as "technical" | "fundamental",
                    },
                  })
                }
              >
                <option value="technical">Technical Analysis</option>
                <option value="fundamental">Fundamental Analysis</option>
              </select>
            </label>
            <label htmlFor="analysis-tag">
              Topic tag
              <input
                id="analysis-tag"
                required
                maxLength={analysisLimits.tagLength}
                placeholder="Support & Resistance"
                value={form.tag}
                onChange={(e) =>
                  dispatch({ type: "form", patch: { tag: e.target.value } })
                }
              />
            </label>
            <label htmlFor="analysis-excerpt" className={shell.wide}>
              Short summary for the list
              <textarea
                id="analysis-excerpt"
                rows={2}
                required
                maxLength={analysisLimits.excerptLength}
                value={form.excerpt}
                onChange={(e) =>
                  dispatch({
                    type: "form",
                    patch: {
                      excerpt: e.target.value.replace(/\s*\n\s*/g, " "),
                    },
                  })
                }
              />
            </label>
            <label htmlFor="analysis-body" className={shell.wide}>
              Explanation
              <textarea
                id="analysis-body"
                rows={10}
                required
                aria-describedby="analysis-body-help"
                value={form.bodyText}
                onChange={(e) =>
                  dispatch({
                    type: "form",
                    patch: { bodyText: e.target.value },
                  })
                }
              />
              <span id="analysis-body-help">
                Leave a blank line between paragraphs.
              </span>
            </label>
          </div>
        </fieldset>

        {form.category === "technical" && (
          <fieldset disabled={disabled} className={styles.trade}>
            <legend>Trade idea</legend>
            <label className={styles.toggle} htmlFor="analysis-has-trade">
              <input
                id="analysis-has-trade"
                type="checkbox"
                checked={form.hasTrade}
                onChange={(e) =>
                  dispatch({
                    type: "form",
                    patch: { hasTrade: e.target.checked },
                  })
                }
              />
              This post includes a trade idea (chart, levels and status)
            </label>
            {showTrade && (
              <>
                <div className={styles.tradeGrid}>
                  <label htmlFor="trade-instrument">
                    Instrument
                    <select
                      id="trade-instrument"
                      value={trade.instrument}
                      onChange={(e) => setTrade({ instrument: e.target.value })}
                    >
                      {!tradeInstruments.includes(trade.instrument) && (
                        <option value={trade.instrument}>
                          {trade.instrument} (not in the list)
                        </option>
                      )}
                      {tradeInstrumentGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((code) => (
                            <option key={code} value={code}>
                              {instrumentNames[code]
                                ? `${code} · ${instrumentNames[code]}`
                                : code}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="trade-timeframe">
                    Timeframe
                    <select
                      id="trade-timeframe"
                      value={trade.timeframe}
                      onChange={(e) =>
                        setTrade({
                          timeframe: e.target.value as TradeTimeframe,
                        })
                      }
                    >
                      {!(editorTimeframes as readonly string[]).includes(
                        trade.timeframe,
                      ) && (
                        <option value={trade.timeframe}>
                          {timeframeLabels[trade.timeframe]} (not in the list)
                        </option>
                      )}
                      {editorTimeframes.map((tf) => (
                        <option key={tf} value={tf}>
                          {timeframeLabels[tf]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="trade-direction">
                    Direction
                    <select
                      id="trade-direction"
                      value={trade.direction}
                      onChange={(e) =>
                        setTrade({
                          direction: e.target.value as TradeDirection,
                        })
                      }
                    >
                      {tradeDirections.map((d) => (
                        <option key={d} value={d}>
                          {d === "buy" || d === "sell"
                            ? directionLabels[d] + " (market)"
                            : directionLabels[d]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.tradeGrid}>
                  {(
                    [
                      ["entry", "Entry price", "trade-entry"],
                      ["stopLoss", "Stop loss", "trade-stop"],
                      ["takeProfit", "Take profit", "trade-target"],
                    ] as const
                  ).map(([key, label, id]) => (
                    <label
                      key={key}
                      htmlFor={id}
                      className={styles.price}
                      data-level={key}
                    >
                      {label}
                      <input
                        id={id}
                        required
                        inputMode="decimal"
                        autoComplete="off"
                        maxLength={15}
                        placeholder={key === "entry" ? "1.0845" : undefined}
                        value={trade[key]}
                        aria-invalid={problem ? true : undefined}
                        aria-describedby="trade-price-help"
                        onChange={(e) =>
                          setTrade({ [key]: e.target.value.trim() })
                        }
                      />
                    </label>
                  ))}
                </div>
                <p
                  id="trade-price-help"
                  className={styles.priceLine}
                  data-state={problem ? "problem" : rr ? "ready" : "empty"}
                >
                  {problem
                    ? problem
                    : rr
                      ? `Risk ${rr.risk} ${rr.unit}${rr.risk === 1 ? "" : "s"} · Reward ${rr.reward} ${rr.unit}${rr.reward === 1 ? "" : "s"} · Risk to reward ${rr.ratio ? "1 : " + rr.ratio : "—"}. Readers see this too.`
                      : "Enter all three prices to see the risk to reward."}
                </p>

                <div className={styles.chartRow}>
                  <div className={styles.chartPreview}>
                    {chartSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={chartSrc}
                        alt=""
                        width={trade.chartWidth || undefined}
                        height={trade.chartHeight || undefined}
                      />
                    ) : (
                      <span>No chart yet</span>
                    )}
                  </div>
                  <div className={styles.chartFields}>
                    <label htmlFor="trade-chart-file">
                      Price chart
                      <input
                        id="trade-chart-file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        aria-describedby="trade-chart-help"
                        disabled={upload.busy}
                        onChange={(e) => void chooseChart(e)}
                      />
                      <span id="trade-chart-help">
                        PNG, JPEG or WebP, up to 4 MB. Wide charts (16:9) read
                        best.
                      </span>
                    </label>
                    <p className={styles.uploadLine} aria-live="polite">
                      {upload.message}
                    </p>
                    <label htmlFor="trade-chart-alt">
                      Chart description for screen readers
                      <input
                        id="trade-chart-alt"
                        required
                        maxLength={tradeLimits.altLength}
                        placeholder="EUR/USD 4-hour chart with the support zone, entry, stop and target marked"
                        value={trade.chartAlt}
                        onChange={(e) => setTrade({ chartAlt: e.target.value })}
                      />
                    </label>
                    <label htmlFor="trade-chart-credit">
                      Chart credit (optional)
                      <input
                        id="trade-chart-credit"
                        maxLength={tradeLimits.creditLength}
                        value={trade.chartCredit ?? ""}
                        onChange={(e) =>
                          setTrade({ chartCredit: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.statusCard}>
                  <div className={styles.statusHead}>
                    <h2>Trade status</h2>
                    <span className={styles.badge} data-state={reasonState}>
                      {reasonState === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className={styles.help}>
                    The reason decides the status: <strong>Active</strong>{" "}
                    reasons keep the idea open, <strong>Inactive</strong>{" "}
                    reasons close it.
                  </p>
                  <label htmlFor="trade-reason">
                    Status explanation
                    <select
                      id="trade-reason"
                      value={trade.reason}
                      onChange={(e) =>
                        setTrade({ reason: e.target.value as TradeReason })
                      }
                    >
                      <optgroup label="Active: the idea is still valid">
                        {activeReasons.map((r) => (
                          <option key={r} value={r}>
                            {reasonOption(r)}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Inactive: closed or no longer tradable">
                        {inactiveReasons.map((r) => (
                          <option key={r} value={r}>
                            {reasonOption(r)}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                  {trade.reason === "inactive-other" && (
                    <label htmlFor="trade-outcome">
                      Outcome
                      <select
                        id="trade-outcome"
                        value={trade.outcome}
                        onChange={(e) =>
                          setTrade({ outcome: e.target.value as TradeOutcome })
                        }
                      >
                        {tradeOutcomes.map((o) => (
                          <option key={o} value={o}>
                            {o === "void"
                              ? "No longer valid (no trade)"
                              : outcomeLabels[o]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {isOtherReason(trade.reason) && (
                    <label htmlFor="trade-note">
                      Write the explanation
                      <textarea
                        id="trade-note"
                        rows={3}
                        required
                        maxLength={tradeLimits.noteLength}
                        aria-describedby="trade-note-help"
                        value={trade.note}
                        onChange={(e) =>
                          setTrade({
                            note: e.target.value.replace(/\s*\n\s*/g, " "),
                          })
                        }
                      />
                      <span id="trade-note-help">
                        Short and factual; readers see it as an analyst note.{" "}
                        {trade.note.length} / {tradeLimits.noteLength}
                      </span>
                    </label>
                  )}
                  <div className={styles.preview}>
                    <p className={styles.previewLabel}>Readers will see</p>
                    <p className={styles.previewLine}>
                      <span className={styles.badge} data-state={reasonState}>
                        {reasonState === "active" ? "Active" : "Inactive"}
                      </span>
                      {outcome ? (
                        <span className={styles.outcome} data-outcome={outcome}>
                          {outcomeLabels[outcome]}
                        </span>
                      ) : null}
                      <span
                        className={styles.previewText}
                        data-empty={
                          isOtherReason(trade.reason) && !trade.note.trim()
                            ? "true"
                            : undefined
                        }
                      >
                        {isOtherReason(trade.reason) && trade.note.trim()
                          ? `“${statusPreview}”`
                          : statusPreview}
                      </span>
                    </p>
                    {state.base?.statusUpdatedAt && (
                      <p className={styles.help}>
                        Status last set{" "}
                        <time dateTime={state.base.statusUpdatedAt}>
                          {new Date(state.base.statusUpdatedAt).toUTCString()}
                        </time>
                        . A changed status gets the time you save.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </fieldset>
        )}

        <fieldset disabled={disabled}>
          <label htmlFor="analysis-reason" className={shell.reason}>
            Change reason
            <input
              id="analysis-reason"
              required
              maxLength={analysisLimits.reasonLength}
              value={state.reason}
              onChange={(e) =>
                dispatch({ type: "reason", value: e.target.value })
              }
            />
          </label>
        </fieldset>
        <div className={shell.actions}>
          <button
            type="submit"
            disabled={
              disabled || state.phase !== "idle" || !dirty || upload.busy
            }
          >
            {state.phase === "busy" ? "Saving draft…" : "Save draft"}
          </button>
          {existing && (
            <button
              type="button"
              className={shell.secondary}
              disabled={!hydrated || reloading || state.phase === "busy"}
              onClick={() => void reload()}
            >
              {reloading ? "Reading saved draft…" : "Reload saved draft"}
            </button>
          )}
          {existing && (
            <a href="/admin/staff/content">
              Approve and publish in the library
            </a>
          )}
        </div>
      </form>
      {state.base && (
        <p className={shell.revision}>
          Revision {state.base.revision} ·{" "}
          <code className={shell.hash}>{state.base.bodySha256}</code>
        </p>
      )}
    </div>
  );
}
