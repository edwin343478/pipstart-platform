import Link from "next/link";
import { PageState } from "@repo/ui";
import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import {
  getDisplayedCourseGlossary,
  getGlossaryPageMetadata,
  isGlossaryReviewMode,
} from "../../../content/glossary-display";
export const generateMetadata = getGlossaryPageMetadata;
import { searchGlossary } from "../../../lib/glossary-search";
import {
  glossaryFilterHref,
  type GlossaryRouteParams,
} from "../../../lib/glossary-route-search";
import styles from "./page.module.css";

import { GlossaryResults } from "../../../components/glossary-results";
import { GlossaryGrouping } from "../../../components/glossary-grouping";
import { GlossaryCategory } from "../../../components/glossary-category";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default async function CryptoGlossaryPage({
  searchParams,
}: {
  searchParams: Promise<GlossaryRouteParams>;
}) {
  const params = await searchParams;
  const result = searchGlossary(getDisplayedCourseGlossary("crypto"), {
    ...params,
    course: "crypto",
  });
  const visibleTerms = result.results.map((r) =>
    getDisplayedCourseGlossary("crypto").find((e) => e.id === r.entry.id)!,
  );
  return (
    <main className={styles.page} data-crypto-glossary>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>
        @layer base {
          [hidden]:has([data-crypto-glossary]) { display: block !important; }
          body:has([data-crypto-glossary]) [data-route-loading] { display: none !important; }
        }
      </style>`,
        }}
      />
      <CompactHeader className={styles.header} section="Crypto Glossary" />
      <section className={styles.introduction}>
        <h1>Crypto Glossary</h1>
        <p>
          {isGlossaryReviewMode()
            ? "Explore the reviewed Crypto definitions, everyday examples and lesson contexts."
            : "Definitions from the approved Crypto lessons, with links to read them in context."}
        </p>
        <GlossaryGrouping pathname="/glossary/crypto" selection={result} />
        <form
          action="/glossary/crypto"
          method="get"
          className={styles.search}
          role="search"
        >
          <label>
            <span className={styles.srOnly}>Search cryptocurrency terms</span>
            <input
              name="q"
              type="search"
              placeholder="Search terms…"
              defaultValue={result.query}
              maxLength={200}
            />
          </label>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
          <GlossaryCategory
            entries={getDisplayedCourseGlossary("crypto")}
            selected={result.category}
          />
        </form>
      </section>
      <nav className={styles.alphabet} aria-label="Filter glossary by letter">
        {["", ...alphabet].map((item) => (
          <Link
            key={item || "all"}
            href={glossaryFilterHref("crypto", item, result.category)}
            aria-current={
              !result.query && result.letter === item ? "page" : undefined
            }
            className={
              !result.query && result.letter === item ? styles.active : ""
            }
          >
            {item || "All"}
          </Link>
        ))}
      </nav>
      <section
        className={styles.results}
        aria-labelledby="crypto-glossary-results"
      >
        <h2 id="crypto-glossary-results">
          {result.query ? "Search results" : result.letter || "All letters"} ·{" "}
          {result.total} terms available · Crypto
          {result.category ? " · " + result.category : ""}
        </h2>
        {result.usedTypoTolerance ? (
          <p role="status">
            No direct match. Showing closely matching term names.
          </p>
        ) : null}
        {visibleTerms.length ? (
          <GlossaryResults
            key={[result.query, result.letter, result.category].join("|")}
            terms={visibleTerms}
            pathname="/glossary/crypto"
            selection={result}
            initialLimit={params.limit}
            termClassName={styles.term}
          />
        ) : (
          <PageState className={styles.emptyState}>
            No terms match this filter. Try another word or choose All.
          </PageState>
        )}
      </section>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
