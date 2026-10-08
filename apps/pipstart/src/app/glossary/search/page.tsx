import Link from "next/link";
import { PageState } from "@repo/ui";
import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import { GlossaryResults } from "../../../components/glossary-results";
import { GlossaryGrouping } from "../../../components/glossary-grouping";
import { GlossaryCategory } from "../../../components/glossary-category";
import {
  getDisplayedCourseGlossary,
  getGlossaryPageMetadata,
  isGlossaryReviewMode,
} from "../../../content/glossary-display";
export const generateMetadata = getGlossaryPageMetadata;
import { searchGlossary } from "../../../lib/glossary-search";
import styles from "../page.module.css";
import buttonStyles from "../crypto/page.module.css";
import controls from "../../../components/glossary-controls.module.css";
export default async function GlossarySearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    course?: string | string[];
    category?: string | string[];
    limit?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const entries = [
    ...getDisplayedCourseGlossary("forex"),
    ...getDisplayedCourseGlossary("crypto"),
  ];
  const result = searchGlossary(entries, params);
  const byId = new Map(entries.map((e) => [e.id, e]));
  return (
    <main className={styles.page} data-glossary-search>
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            "<style>@layer base{[hidden]:has([data-glossary-search]){display:block!important;}body:has([data-glossary-search]) [data-route-loading]{display:none!important;}}</style>",
        }}
      />
      <CompactHeader className={styles.header} section="Glossary search" />
      <section className={styles.introduction}>
        <h1>Glossary search</h1>
        <p>
          {isGlossaryReviewMode()
            ? "Find reviewed Forex and Crypto terms and read their lesson contexts."
            : "Find published Forex and Crypto terms and read their lesson contexts."}
        </p>
        <GlossaryGrouping pathname="/glossary/search" selection={result} />
        <form
          action="/glossary/search"
          method="get"
          className={styles.search}
          role="search"
        >
          <label>
            <span className={styles.srOnly}>Search Forex and Crypto terms</span>
            <input
              type="search"
              name="q"
              maxLength={200}
              defaultValue={result.query}
              placeholder="Search terms…"
            />
          </label>
          <input type="hidden" name="course" value={result.course} />
          <GlossaryCategory
            entries={entries.filter(
              (e) => !result.course || e.course === result.course,
            )}
            selected={result.category}
          />
          <button type="submit" className={buttonStyles.searchButton}>
            Search
          </button>
        </form>
        <Link className={controls.crossSearch} href="/glossary?course=forex">
          Browse Forex terminology
        </Link>
        {" · "}
        <Link className={controls.crossSearch} href="/glossary/crypto">
          Crypto glossary
        </Link>
      </section>
      <section
        className={styles.results}
        aria-labelledby="glossary-search-results"
      >
        <h2 id="glossary-search-results">
          {result.total} terms available ·{" "}
          {result.course === "forex"
            ? "Forex"
            : result.course === "crypto"
              ? "Crypto"
              : "Forex and Crypto"}
        </h2>
        {result.usedTypoTolerance ? (
          <p role="status">
            No direct match. Showing closely matching term names.
          </p>
        ) : null}
        {result.results.length ? (
          <GlossaryResults
            key={[result.course, result.query, result.category].join("|")}
            terms={result.results.map(({ entry }) => byId.get(entry.id)!)}
            pathname="/glossary/search"
            selection={result}
            initialLimit={params.limit}
            termClassName={styles.term}
            showCourse
            linkNames
          />
        ) : (
          <PageState className={styles.emptyState}>
            No terms match this filter. Try another word or choose all learning
            paths.
          </PageState>
        )}
      </section>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
