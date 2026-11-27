// TA-a: the reader-facing pieces of a trade idea, shared by the Analysis list and the post page.
import {
  directionLabels,
  isOtherReason,
  outcomeLabels,
  timeframeLabels,
  tradeChartUrl,
  tradeOutcome,
  tradeRiskReward,
  tradeStatusText,
  type TradeIdea,
  type TradeStatus,
} from "../../lib/content/trade-idea";
import styles from "./trade-idea.module.css";

export function TradeTags({ trade }: { trade: TradeIdea }) {
  return (
    <>
      <span className={styles.instrument}>{trade.instrument}</span>
      <span className={styles.chip}>{timeframeLabels[trade.timeframe]}</span>
      <span className={styles.chip}>{directionLabels[trade.direction]}</span>
    </>
  );
}

/** Active or Inactive, the outcome when closed, and the reason or the analyst's note. */
export function TradeStatusLine({
  status,
  large = false,
}: {
  status: TradeStatus;
  large?: boolean;
}) {
  const outcome = tradeOutcome(status);
  const note = isOtherReason(status.reason);
  return (
    <span className={large ? styles.statusLarge : styles.status}>
      <span className={styles.badge} data-state={status.state}>
        <span className={styles.dot} aria-hidden="true" />
        {status.state === "active" ? "Active" : "Inactive"}
      </span>
      {outcome ? (
        <span className={styles.outcome} data-outcome={outcome}>
          {outcomeLabels[outcome]}
        </span>
      ) : null}
      <span className={styles.statusText}>
        {note ? `“${tradeStatusText(status)}”` : tradeStatusText(status)}
      </span>
      {note ? <span className={styles.noteLabel}>Analyst note</span> : null}
    </span>
  );
}

export function TradeLevels({
  trade,
  detailed = false,
}: {
  trade: TradeIdea;
  detailed?: boolean;
}) {
  const distances = detailed ? tradeRiskReward(trade) : null;
  const distance = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"}`;
  return (
    <dl className={detailed ? styles.levelsDetailed : styles.levels}>
      <div className={styles.level} data-level="entry">
        <dt>Entry</dt>
        <dd>{trade.entry}</dd>
      </div>
      <div className={styles.level} data-level="stop">
        <dt>Stop loss</dt>
        <dd>{trade.stopLoss}</dd>
        {distances ? (
          <dd className={styles.pips}>
            {distance(distances.risk, distances.unit)} risk
          </dd>
        ) : null}
      </div>
      <div className={styles.level} data-level="target">
        <dt>Take profit</dt>
        <dd>{trade.takeProfit}</dd>
        {distances ? (
          <dd className={styles.pips}>
            {distance(distances.reward, distances.unit)} reward
          </dd>
        ) : null}
      </div>
    </dl>
  );
}

/** The uploaded chart, or a quiet placeholder when the storage origin is not configured. */
export function TradeChartImage({
  trade,
  thumbnail = false,
}: {
  trade: TradeIdea;
  thumbnail?: boolean;
}) {
  const src = tradeChartUrl(
    (thumbnail && trade.chart.thumbnailPath) || trade.chart.path,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  if (!src)
    return (
      <span className={thumbnail ? styles.thumbEmpty : styles.chartEmpty}>
        Chart unavailable
      </span>
    );
  const image = (
    // Charts are public storage objects; next/image would need a remote loader for them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={thumbnail ? styles.thumb : styles.chart}
      src={src}
      alt={thumbnail ? "" : trade.chart.alt}
      width={trade.chart.width}
      height={trade.chart.height}
      loading={thumbnail ? "lazy" : "eager"}
      decoding="async"
    />
  );
  return thumbnail ? (
    image
  ) : (
    <a href={src} className={styles.chartLink}>
      {image}
      <span>Open full-size chart</span>
    </a>
  );
}

const statusDate = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function TradeInfoPanel({ trade }: { trade: TradeIdea }) {
  const ratio = tradeRiskReward(trade)?.ratio;
  return (
    <aside className={styles.panel} aria-labelledby="trade-information">
      <h2 id="trade-information" className={styles.panelEyebrow}>
        Trade information
      </h2>
      <dl className={styles.facts}>
        <div>
          <dt>Instrument</dt>
          <dd>{trade.instrument}</dd>
        </div>
        <div>
          <dt>Timeframe</dt>
          <dd>{timeframeLabels[trade.timeframe]}</dd>
        </div>
        <div className={styles.factWide}>
          <dt>Direction</dt>
          <dd>{directionLabels[trade.direction]}</dd>
        </div>
      </dl>
      <TradeLevels trade={trade} detailed />
      {ratio ? (
        <p className={styles.ratio}>
          <span>Risk to reward</span>
          <strong>1 : {ratio}</strong>
        </p>
      ) : null}
      <div className={styles.panelStatus}>
        <p className={styles.panelLabel}>Status</p>
        <TradeStatusLine status={trade.status} />
        <p className={styles.updated}>
          Updated{" "}
          <time dateTime={trade.status.updatedAt}>
            {statusDate.format(new Date(trade.status.updatedAt))} UTC
          </time>
        </p>
      </div>
    </aside>
  );
}
