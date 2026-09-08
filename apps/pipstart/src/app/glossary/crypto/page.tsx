"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import styles from "./page.module.css";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const terms = [
  {
    name: "Bitcoin",
    definition:
      "The first widely adopted decentralized cryptocurrency, introduced as a peer-to-peer electronic cash system.",
  },
  {
    name: "Blockchain",
    definition:
      "A shared record of transactions stored across a network of computers.",
  },
  {
    name: "Block",
    definition: "A group of verified transactions added to a blockchain.",
  },
] as const;

export default function CryptoGlossaryPage() {
  const [activeLetter, setActiveLetter] = useState("B");
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
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Crypto Glossary</span>
      </header>

      <section className={styles.introduction}>
        <h1>Crypto Glossary</h1>
        <p>
          Every cryptocurrency term used across the learning path, explained
          plainly.
        </p>
        <label className={styles.search}>
          <span className={styles.srOnly}>Search cryptocurrency terms</span>
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
          <p className={styles.emptyState}>
            No terms are available under this filter yet.
          </p>
        )}
      </section>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
