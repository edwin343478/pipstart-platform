import Link from "next/link";

import { Pagination } from "../../components/pagination";
import { CompactHeader } from "../../components/site-chrome";
import { FundamentalIcon, TechnicalIcon } from "./icons";
import {
  analysisPageCopy,
  analysisPosts,
  formatPublishedDate,
  type AnalysisCategory,
} from "./posts";
import styles from "./page.module.css";

function isAnalysisCategory(
  value: string | undefined,
): value is AnalysisCategory {
  return value === "fundamental" || value === "technical";
}

interface AnalysisPageProps {
  searchParams: Promise<{ type?: string; page?: string }>;
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
  const categoryPosts = analysisPosts
    .filter((post) => post.category === activeCategory)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
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
  const categoryHref = `/analysis?type=${activeCategory}`;

  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Analysis" />
      <section className={styles.introduction}>
        <h1>{analysisPageCopy.heading}</h1>
        <p>{analysisPageCopy.subheading}</p>
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
            <Link href={`/analysis/${post.slug}`} className={styles.card}>
              <div className={styles.cardMeta}>
                <span className={styles.tag}>{post.tag.toUpperCase()}</span>
                <time dateTime={post.publishedAt} className={styles.timestamp}>
                  {formatPublishedDate(post.publishedAt)}
                </time>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ol>
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
    </main>
  );
}
