"use client";

import { useMemo, useState } from "react";

import { PageState } from "@repo/ui";
import { CompactFooter, CompactHeader } from "../../components/site-chrome";
import styles from "./page.module.css";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const terms = [
  {
    name: "Pip",
    definition:
      "The standard unit used to measure price movement in a currency pair.",
  },
  {
    name: "Pipette",
    definition:
      "A fractional pip, used by brokers that quote prices to one extra decimal place.",
  },
  {
    name: "Position size",
    definition: "The number of units of currency controlled in a single trade.",
  },
] as const;

export default function GlossaryPage() {
  const [activeLetter, setActiveLetter] = useState("P");
  const [query, setQuery] = useState("");

  const visibleTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return terms.filter((term) => {
      if (normalizedQuery) {
        return (
          term.name.toLowerCase().includes(normalizedQuery) ||
          term.definition.toLowerCase().includes(normalizedQuery)
        );
      }

      return term.name.startsWith(activeLetter);
    });
  }, [activeLetter, query]);

  function selectLetter(letter: string) {
    setActiveLetter(letter);
    setQuery("");
  }

  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Glossary" />

      <section className={styles.introduction}>
        <h1>Forex Glossary</h1>
        <p>Every term used across the learning path, explained plainly.</p>
        <label className={styles.search}>
          <span className={styles.srOnly}>Search glossary terms</span>
          <input
            type="search"
            placeholder="Search terms…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      <nav className={styles.alphabet} aria-label="Filter glossary by letter">
        {alphabet.map((letter) => (
          <button
            type="button"
            className={!query && activeLetter === letter ? styles.active : ""}
            aria-pressed={!query && activeLetter === letter}
            key={letter}
            onClick={() => selectLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </nav>

      <section className={styles.results} aria-live="polite">
        <h2>{query ? "Search results" : activeLetter}</h2>
        {visibleTerms.length > 0 ? (
          visibleTerms.map((term) => (
            <article className={styles.term} key={term.name}>
              <h3>{term.name}</h3>
              <p>{term.definition}</p>
            </article>
          ))
        ) : (
          <PageState className={styles.emptyState}>
            No terms are available under this filter yet.
          </PageState>
        )}
      </section>

      <CompactFooter className={styles.footer} />
    </main>
  );
}
