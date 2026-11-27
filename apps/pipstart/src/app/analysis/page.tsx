import Link from "next/link";

import { Pagination } from "../../components/pagination";
import { CompactHeader } from "../../components/site-chrome";
import {
  tradeIdeasEnabled,
  type TradeState,
} from "../../lib/content/trade-idea";
import { FundamentalIcon, TechnicalIcon } from "./icons";
import {
  analysisPageCopy,
  analysisPosts,
  formatPublishedDate,
  tradeIdeasPageCopy,
  type AnalysisCategory,
} from "./posts";
import {
  TradeChartImage,
  TradeLevels,
  TradeStatusLine,
  TradeTags,
} from "./trade-idea";
import styles from "./page.module.css";

function isAnalysisCategory(
  value: string | undefined,
): value is AnalysisCategory {
  return value === "fundamental" || value === "technical";
}

function isTradeState(value: string | undefined): value is TradeState {
  return value === "active" || value === "inactive";
}

interface AnalysisPageProps {
  searchParams: Promise<{ type?: string; page?: string; status?: string }>;
}

const postsPerPage = 2;

export default async function AnalysisPage({
  searchParams,
}: AnalysisPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeCategory: AnalysisCategory = isAnalysisCategory(
    resolvedSearchParams.type,
  )
    ? resolvedSearchParams.type
    : "fundamental";
  // TA-a: trade ideas show only while the switch is on, and only under Technical Analysis.
  const trades = tradeIdeasEnabled() && activeCategory === "technical";
  const statusFilter =
    trades && isTradeState(resolvedSearchParams.status)
      ? resolvedSearchParams.status
      : null;
  const sectionPosts = analysisPosts
    .filter((post) => post.category === activeCategory)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  const categoryPosts = statusFilter
    ? sectionPosts.filter((post) => post.trade?.status.state === statusFilter)
    : sectionPosts;
  const totalPages = Math.max(
    1,
    Math.ceil(categoryPosts.length / postsPerPage),
  );
  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const visiblePosts = categoryPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );
  const categoryHref = `/analysis?type=${activeCategory}${statusFilter ? `&status=${statusFilter}` : ""}`;
  const count = (state: TradeState | null) =>
    state
      ? sectionPosts.filter((post) => post.trade?.status.state === state).length
      : sectionPosts.length;
  const filters: { label: string; state: TradeState | null }[] = [
    { label: "All", state: null },
    { label: "Active", state: "active" },
    { label: "Inactive", state: "inactive" },
  ];

  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Analysis" />
      <section className={styles.introduction}>
        <h1>{analysisPageCopy.heading}</h1>
        <p>
          {trades ? tradeIdeasPageCopy.subheading : analysisPageCopy.subheading}
        </p>
        <p>
          <a href="/economic-calendar">
            Explore the economic calendar and key event explanations →
          </a>
        </p>
        <nav className={styles.tabs} aria-label="Analysis category">
          <Link
            href="/analysis?type=fundamental"
            aria-current={activeCategory === "fundamental" ? "page" : undefined}
            className={
              activeCategory === "fundamental" ? styles.tabActive : styles.tab
            }
          >
            Fundamental Analysis
          </Link>
          <Link
            href="/analysis?type=technical"
            aria-current={activeCategory === "technical" ? "page" : undefined}
            className={
              activeCategory === "technical" ? styles.tabActive : styles.tab
            }
          >
            Technical Analysis
          </Link>
        </nav>
        {trades ? (
          <div className={styles.statusBar}>
            <nav
              className={styles.statusFilters}
              aria-label="Filter trade ideas by status"
            >
              <span className={styles.statusFiltersLabel}>Show</span>
              {filters.map(({ label, state }) => (
                <Link
                  key={label}
                  href={`/analysis?type=technical${state ? `&status=${state}` : ""}`}
                  aria-current={statusFilter === state ? "page" : undefined}
                  className={
                    statusFilter === state
                      ? styles.statusFilterActive
                      : styles.statusFilter
                  }
                >
                  {label} · {count(state)}
                </Link>
              ))}
            </nav>
            <p className={styles.statusLegend}>
              <strong>Active</strong> the idea is still valid.{" "}
              <strong>Inactive</strong> closed in profit or loss, or no longer
              tradable.
            </p>
          </div>
        ) : null}
      </section>
      <ol className={styles.feed}>
        {visiblePosts.map((post) => (
          <li key={post.slug} className={styles.feedItem}>
            <div className={styles.marker} aria-hidden="true">
              {activeCategory === "fundamental" ? (
                <FundamentalIcon />
              ) : (
                <TechnicalIcon />
              )}
            </div>
            {trades && post.trade ? (
              <Link
                href={`/analysis/${post.slug}`}
                className={`${styles.card} ${styles.tradeCard}`}
              >
                <div className={styles.tradeThumb}>
                  <TradeChartImage trade={post.trade} thumbnail />
                </div>
                <div className={styles.tradeContent}>
                  <div className={styles.cardMeta}>
                    <TradeTags trade={post.trade} />
                    <time
                      dateTime={post.publishedAt}
                      className={styles.timestamp}
                    >
                      {formatPublishedDate(post.publishedAt)}
                    </time>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <TradeLevels trade={post.trade} />
                  <TradeStatusLine status={post.trade.status} />
                </div>
              </Link>
            ) : (
              <Link href={`/analysis/${post.slug}`} className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.tag}>{post.tag.toUpperCase()}</span>
                  <time
                    dateTime={post.publishedAt}
                    className={styles.timestamp}
                  >
                    {formatPublishedDate(post.publishedAt)}
                  </time>
                </div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
              </Link>
            )}
          </li>
        ))}
      </ol>
      {trades && visiblePosts.length === 0 ? (
        <p className={styles.emptyFilter}>
          No trade ideas with this status yet.
        </p>
      ) : null}
      <Pagination
        ariaLabel="Analysis archive pages"
        className={styles.pagination}
        currentPage={currentPage}
        previousHref={
          currentPage > 1
            ? `${categoryHref}&page=${currentPage - 1}`
            : undefined
        }
        nextHref={
          currentPage < totalPages
            ? `${categoryHref}&page=${currentPage + 1}`
            : undefined
        }
        totalPages={totalPages}
      />
      {trades ? (
        <p className={styles.tradeDisclosure}>
          <strong>{tradeIdeasPageCopy.archiveDisclosureLead}</strong>{" "}
          {tradeIdeasPageCopy.archiveDisclosure}
        </p>
      ) : null}
    </main>
  );
}
