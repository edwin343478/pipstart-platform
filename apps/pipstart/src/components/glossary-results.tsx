"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { PublishedGlossaryEntry } from "../lib/glossary-publication";
import {
  GLOSSARY_BATCH_SIZE,
  glossaryBrowseHref,
  glossaryFragmentCount,
  glossaryTermAnchor,
  glossaryVisibleCount,
  type GlossaryBrowseSelection,
  type GlossaryPathname,
} from "../lib/glossary-browse";
import { GlossaryTeaching } from "./glossary-teaching";
import controls from "./glossary-controls.module.css";
function subscribeFragment(notify: () => void) {
  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener("hashchange", notify);
    window.removeEventListener("popstate", notify);
  };
}
const readFragment = () => window.location.hash;
const serverFragment = () => "";
export function GlossaryResults({
  terms,
  pathname,
  selection,
  initialLimit,
  termClassName,
  showCourse = false,
  linkNames = false,
}: {
  terms: readonly PublishedGlossaryEntry[];
  pathname: GlossaryPathname;
  selection: GlossaryBrowseSelection;
  initialLimit?: unknown;
  termClassName: string;
  showCourse?: boolean;
  linkNames?: boolean;
}) {
  const initial = glossaryVisibleCount(initialLimit, terms.length);
  const [requested, setRequested] = useState(initial);
  const fragment = useSyncExternalStore(
    subscribeFragment,
    readFragment,
    serverFragment,
  );
  // On the combined search route, keep course-qualified Crypto anchors regardless of filters.
  const anchorScope = pathname === "/glossary/crypto" ? "crypto" : "";
  const anchors = terms.map((term) => glossaryTermAnchor(anchorScope, term));
  const visible = Math.min(
    terms.length,
    glossaryFragmentCount(fragment, anchors, Math.max(initial, requested)),
  );
  const next = Math.min(terms.length, visible + GLOSSARY_BATCH_SIZE);
  const moreHref = glossaryBrowseHref(
    pathname,
    selection,
    next,
    anchors[visible - 1],
  );
  return (
    <>
      <p
        className={controls.resultCount}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {visible} of {terms.length} matching terms
      </p>
      <noscript>
        <style>{`
          /* Important declarations in base outrank Tailwind's layered hidden rule. */
          @layer base {
            [data-glossary-term][hidden]:target { display: block !important; }
          }
          /* Native fragment navigation must finish before controls are used again. */
          html:has([data-glossary-term]) { scroll-behavior: auto; }
        `}</style>
      </noscript>
      <div id="glossary-term-list">
        {terms.map((term, index) => (
          <article
            key={term.id}
            id={anchors[index]}
            data-glossary-term
            hidden={index >= visible}
            tabIndex={-1}
            className={termClassName + " " + controls.pagedTerm}
          >
            <h3>
              {linkNames ? (
                <Link href={term.href}>{term.name}</Link>
              ) : (
                term.name
              )}
              {showCourse
                ? " · " + (term.course === "forex" ? "Forex" : "Crypto")
                : ""}
            </h3>
            <GlossaryTeaching term={term} />
          </article>
        ))}
      </div>
      {visible < terms.length ? (
        <div className={controls.more}>
          <a
            href={moreHref}
            aria-controls="glossary-term-list"
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              const firstNew = anchors[visible];
              setRequested(next);
              window.requestAnimationFrame(() =>
                document
                  .getElementById(firstNew)
                  ?.focus({ preventScroll: true }),
              );
            }}
          >
            View more
          </a>
        </div>
      ) : null}
    </>
  );
}
