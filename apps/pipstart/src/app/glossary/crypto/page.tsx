import Link from "next/link";
import { PageState } from "@repo/ui";
import { CompactFooter, CompactHeader } from "../../../components/site-chrome";
import { cryptoGlossaryEntries } from "../../../content/lesson-registry";
import styles from "./page.module.css";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default async function CryptoGlossaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; letter?: string | string[] }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const letter =
    typeof params.letter === "string" && /^[A-Z]$/.test(params.letter)
      ? params.letter
      : "";
  const normalized = query.toLowerCase();
  const visibleTerms = cryptoGlossaryEntries.filter((term) =>
    normalized
      ? term.name.toLowerCase().includes(normalized) ||
        term.meanings.some((meaning) =>
          meaning.definition.toLowerCase().includes(normalized),
        )
      : !letter || term.name.toUpperCase().startsWith(letter),
  );
  return (
    <main className={styles.page} data-crypto-glossary>
      {/* Reveal only this resolved glossary inside a streamed loading boundary
          when scripting is disabled, as the approved lesson pages already do. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>
        @layer base {
          [hidden]:has([data-crypto-glossary]) {
            display: block !important;
          }
          body:has([data-crypto-glossary]) [data-route-loading] {
            display: none !important;
          }
        }
      </style>`,
        }}
      />
      <CompactHeader className={styles.header} section="Crypto Glossary" />
      <section className={styles.introduction}>
        <h1>Crypto Glossary</h1>
        <p>
          Definitions from the approved Crypto lessons, with links to read them
          in context.
        </p>
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
              defaultValue={query}
            />
          </label>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </section>
      <nav className={styles.alphabet} aria-label="Filter glossary by letter">
        <Link
          href="/glossary/crypto"
          aria-current={!query && !letter ? "page" : undefined}
          className={!query && !letter ? styles.active : ""}
        >
          All
        </Link>
        {alphabet.map((item) => (
          <Link
            key={item}
            href={`/glossary/crypto?letter=${item}`}
            aria-current={!query && letter === item ? "page" : undefined}
            className={!query && letter === item ? styles.active : ""}
          >
            {item}
          </Link>
        ))}
      </nav>
      <section
        className={styles.results}
        aria-labelledby="crypto-glossary-results"
      >
        <h2 id="crypto-glossary-results">
          {query ? "Search results" : letter || "All terms"} ·{" "}
          {visibleTerms.length} terms
        </h2>
        {visibleTerms.length ? (
          visibleTerms.map((term) => (
            <article className={styles.term} key={term.slug} id={term.slug}>
              <h3>{term.name}</h3>
              {term.meanings.map((meaning) => (
                <div key={meaning.definition}>
                  <p>{meaning.definition}</p>
                  {meaning.lessons.length ? (
                    <ul className={styles.lessonLinks}>
                      {meaning.lessons.map((lesson) => (
                        <li key={lesson.href}>
                          <Link href={lesson.href}>
                            Read in context: {lesson.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </article>
          ))
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
