import {
  glossaryDisplayTerm,
  glossaryBrowseSelection,
} from "../../lib/glossary-presentation";
import { PageState } from "@repo/ui";
import { CompactFooter, CompactHeader } from "../../components/site-chrome";
import {
  getDisplayedCourseGlossary,
  getGlossaryPageMetadata,
  isGlossaryReviewMode,
} from "../../content/glossary-display";
export const generateMetadata = getGlossaryPageMetadata;
import { searchGlossary } from "../../lib/glossary-search";
import type { GlossaryRouteParams } from "../../lib/glossary-route-search";
import styles from "./page.module.css";

import { GlossaryResults } from "../../components/glossary-results";
import { GlossaryGrouping } from "../../components/glossary-grouping";
import { GlossaryCategory } from "../../components/glossary-category";
import buttonStyles from "./crypto/page.module.css";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<GlossaryRouteParams>;
}) {
  const params = await searchParams;
  const entries = [
    ...getDisplayedCourseGlossary("forex"),
    ...getDisplayedCourseGlossary("crypto"),
  ];
  const result = searchGlossary(entries, params);
  const byId = new Map(entries.map((term) => [term.id, term]));
  const visibleTerms = result.results.map(({ entry }) => byId.get(entry.id)!);
  const scopeLabel =
    result.course === "forex"
      ? "Forex"
      : result.course === "crypto"
        ? "Crypto"
        : "Forex and Crypto";
  return (
    <main className={styles.page} data-forex-glossary>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>
        @layer base {
          [hidden]:has([data-forex-glossary]) { display: block !important; }
          body:has([data-forex-glossary]) [data-route-loading] { display: none !important; }
        }
      </style>`,
        }}
      />
      <CompactHeader className={styles.header} section="Glossary" />
      <section className={styles.introduction}>
        <h1>{scopeLabel} Glossary</h1>
        <p>
          {isGlossaryReviewMode()
            ? "Explore the reviewed definitions, everyday examples and lesson contexts."
            : "Explore clear definitions, everyday examples and lesson contexts."}
        </p>
        <GlossaryGrouping
          pathname="/glossary"
          selection={glossaryBrowseSelection(result)}
        />
        <form
          action="/glossary"
          method="get"
          className={styles.search}
          role="search"
        >
          {result.course ? (
            <input type="hidden" name="course" value={result.course} />
          ) : null}
          <label>
            <span className={styles.srOnly}>
              Search glossary terms, then press Enter
            </span>
            <input
              name="q"
              type="search"
              placeholder="Search terms…"
              defaultValue={result.query}
              maxLength={200}
            />
          </label>
          <GlossaryCategory
            entries={entries.filter(
              (term) => !result.course || term.course === result.course,
            )}
            selected={result.category}
          />
          <button type="submit" className={buttonStyles.searchButton}>
            Search
          </button>
        </form>
      </section>
      <form action="/glossary" method="get">
        {result.course ? (
          <input type="hidden" name="course" value={result.course} />
        ) : null}
        {result.category ? (
          <input type="hidden" name="category" value={result.category} />
        ) : null}
        <nav className={styles.alphabet} aria-label="Filter glossary by letter">
          {["", ...alphabet].map((letter) => (
            <button
              type="submit"
              name="letter"
              value={letter}
              className={
                !result.query && result.letter === letter ? styles.active : ""
              }
              aria-pressed={!result.query && result.letter === letter}
              key={letter || "all"}
            >
              {letter || "All"}
            </button>
          ))}
        </nav>
      </form>
      <section
        className={styles.results}
        aria-labelledby="forex-glossary-results"
      >
        <h2 id="forex-glossary-results">
          {result.query ? "Search results" : result.letter || "All letters"} ·{" "}
          {result.total} terms available · {scopeLabel}
          {result.category ? " · " + result.category : ""}
        </h2>
        {result.usedTypoTolerance ? (
          <p role="status">
            No direct match. Showing closely matching term names.
          </p>
        ) : null}
        {visibleTerms.length ? (
          <GlossaryResults
            key={[
              result.course,
              result.query,
              result.letter,
              result.category,
            ].join("|")}
            terms={visibleTerms.map(glossaryDisplayTerm)}
            pathname="/glossary"
            selection={glossaryBrowseSelection(result)}
            initialLimit={params.limit}
            termClassName={styles.term}
            showCourse={!result.course}
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
