import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../components/breadcrumbs";
import { AuthorBox } from "../../../components/author-box";
import { JsonLd } from "../../../components/json-ld";
import { CompactHeader } from "../../../components/site-chrome";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createDynamicMetadata,
  siteUrl,
} from "../../../lib/seo";
import { pipStartEditorialTeam } from "../authors";
import { analysisPosts, formatPublishedDate } from "../posts";
import styles from "./page.module.css";

export function generateStaticParams() {
  return analysisPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: AnalysisArticlePageProps) {
  const { slug } = await params;
  const post = analysisPosts.find((candidate) => candidate.slug === slug);
  if (!post) return {};

  const metadata = createDynamicMetadata(
    {
      path: `/analysis/${post.slug}`,
      title: post.title,
      description: post.excerpt,
    },
    `${siteUrl}/analysis/${post.slug}/opengraph-image`,
  );

  return {
    ...metadata,
    authors: [
      {
        name: pipStartEditorialTeam.name,
        url: pipStartEditorialTeam.href,
      },
    ],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.reviewedAt,
      authors: [pipStartEditorialTeam.href],
    },
  };
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
        candidate.cluster === post.cluster && candidate.slug !== post.slug,
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 2);

  return (
    <main className={styles.page}>
      <JsonLd
        data={createArticleJsonLd({
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.reviewedAt,
          path: `/analysis/${post.slug}`,
          authorName: pipStartEditorialTeam.name,
          authorPath: pipStartEditorialTeam.href,
          image: `${siteUrl}/analysis/${post.slug}/opengraph-image`,
        })}
      />
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Analysis", path: "/analysis" },
          { name: post.title, path: `/analysis/${post.slug}` },
        ])}
      />
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
          {" · Reviewed "}
          <time dateTime={post.reviewedAt}>
            {formatPublishedDate(post.reviewedAt)}
          </time>
          {" · "}
          <Link href={pipStartEditorialTeam.href}>
            {pipStartEditorialTeam.name}
          </Link>
        </p>

        <div className={styles.disclosure}>
          <strong>Educational commentary, not financial advice.</strong> This
          reflects the author&apos;s interpretation of publicly available
          information and is not a recommendation to trade.
        </div>

        {post.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        <AuthorBox
          author={pipStartEditorialTeam}
          className={styles.authorBox}
        />

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
