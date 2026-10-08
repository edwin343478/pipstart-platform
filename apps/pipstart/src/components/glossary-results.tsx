"use client";
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import type { GlossaryDisplayTerm } from "../lib/glossary-presentation";
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
const readLocation = () => window.location.search + window.location.hash;
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
  terms: readonly GlossaryDisplayTerm[];
  pathname: GlossaryPathname;
  selection: GlossaryBrowseSelection;
  initialLimit?: unknown;
  termClassName: string;
  showCourse?: boolean;
  linkNames?: boolean;
}) {
  const initial = glossaryVisibleCount(initialLimit, terms.length);
  const location = useSyncExternalStore(
    subscribeFragment,
    readLocation,
    serverFragment,
  );
  const hashIndex = location.indexOf("#");
  const fragment = hashIndex < 0 ? "" : location.slice(hashIndex);
  const search = hashIndex < 0 ? location : location.slice(0, hashIndex);
  const requested = location
    ? glossaryVisibleCount(
        new URLSearchParams(search).get("limit"),
        terms.length,
      )
    : initial;
  useEffect(() => {
    if (!fragment) return;
    let id: string;
    try {
      id = decodeURIComponent(fragment.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target?.hasAttribute("data-glossary-term") || target.hidden) return;
    // Re-align after native reload restoration and late font layout have finished.
    // Cancel pending work as soon as the reader starts navigating the page.
    let cancelled = false;
    let frame = 0;
    const align = () => {
      if (cancelled || window.location.hash !== fragment) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
    };
    const settle = () => {
      if (cancelled) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(align);
      });
    };
    const cancel = () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
    const inputs = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    for (const input of inputs)
      window.addEventListener(input, cancel, { passive: true });
    window.addEventListener("load", settle);
    window.addEventListener("pageshow", settle);
    align();
    if (document.readyState === "complete") settle();
    void document.fonts.ready.then(settle);
    return () => {
      cancel();
      for (const input of inputs) window.removeEventListener(input, cancel);
      window.removeEventListener("load", settle);
      window.removeEventListener("pageshow", settle);
    };
  }, [fragment]);
  // On the combined search route, keep course-qualified Crypto anchors regardless of filters.
  const anchorScope = pathname === "/glossary/crypto" ? "crypto" : "";
  const anchors = terms.map((term) => glossaryTermAnchor(anchorScope, term));
  const visible = Math.min(
    terms.length,
    glossaryFragmentCount(fragment, anchors, requested),
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
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<p>The count describes the current batch. A directly linked term may also appear below it.</p>
          <style>
            @layer base {
              [data-glossary-term][hidden]:target { display: block !important; }
            }
            html:has([data-glossary-term]) { scroll-behavior: auto; }
          </style>`,
        }}
      />
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
              const url = new URL(window.location.href);
              url.searchParams.set("limit", String(next));
              window.history.pushState(
                null,
                "",
                url.pathname + url.search + url.hash,
              );
              window.dispatchEvent(new PopStateEvent("popstate"));
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
