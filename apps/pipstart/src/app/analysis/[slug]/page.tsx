import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../components/breadcrumbs";
import { CompactHeader } from "../../../components/site-chrome";
import { analysisPosts, formatPublishedDate } from "../posts";
import styles from "./page.module.css";

export function generateStaticParams() {
  return analysisPosts.map((post) => ({ slug: post.slug }));
}

interface AnalysisArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnalysisArticlePage({
  params,
}: AnalysisArticlePageProps) {
  const { slug } = await params;
  const post = analysisPosts.find((candidate) => candidate.slug === slug);

  if (!post) {
    notFound();
  }

  const categoryLabel =
    post.category === "fundamental"
      ? "Fundamental Analysis"
      : "Technical Analysis";

  const related = analysisPosts
    .filter(
      (candidate) =>
        candidate.category === post.category && candidate.slug !== post.slug,
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 2);

  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Analysis" />

      <article className={styles.article}>
        <Breadcrumbs
          className={styles.breadcrumb}
          items={[
            { href: "/analysis", label: "Analysis" },
            { label: categoryLabel },
          ]}
        />

        <span className={styles.tag}>{post.tag.toUpperCase()}</span>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          Published{" "}
          <time dateTime={post.publishedAt}>
            {formatPublishedDate(post.publishedAt)}
          </time>
        </p>

        <div className={styles.disclosure}>
          <strong>Educational commentary, not financial advice.</strong> This
          reflects the author&apos;s interpretation of publicly available
          information and is not a recommendation to trade.
        </div>

        {post.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        {related.length > 0 && (
          <div className={styles.related}>
            <p className={styles.relatedLabel}>Related</p>
            {related.map((item) => (
              <Link key={item.slug} href={`/analysis/${item.slug}`}>
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
