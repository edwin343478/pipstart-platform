# PipStart M17 — Glossary browsing refinements

This is a refinement within Phase 2 of the approved three-phase plan.

## Changes requested and implemented

1. The default `/glossary` view includes both public paths: 16 Forex and 120 Crypto terms, for 136 published entries. Selecting Forex reports the 16 available Forex terms explicitly; it does not label them as the whole glossary. The alphabet reset reads **All letters** to distinguish it from the grouping controls.
2. A visible **Forex / Crypto / Both** control appears above the search form on the default glossary, Crypto glossary and combined search page. It uses native links, identifies the current selection and wraps on narrow screens. Switching groups retains the search/letter intent and resets the old category and display count.
3. Only 12 matching terms are initially displayed. **View more** reveals the next group of 12, updates the displayed-versus-matching count, and disappears after the last group. It supports keyboard operation. Newly revealed content receives programmatic focus without forcing a scroll jump.
4. Desktop and mobile share this behavior. The existing page stylesheets and lesson fonts/layouts are unchanged. Only the previously added control stylesheet is extended, using inherited fonts and the existing teal palette.

## Direct links and native fallback

Public term cards are present in server HTML, with later groups hidden from ordinary display. That preserves existing glossary anchor URLs while preventing the initial long scroll. Shared Forex/Crypto term names have distinct anchors in the combined view; course-specific canonical URLs remain unchanged.

When JavaScript is available, a direct hash link reveals the group containing its target. Without JavaScript, a direct target is revealed by CSS, and **View more** follows a native URL carrying the next display limit and current filters. On native navigation the fragment points to the last previously visible card so the reader can continue from that point. The default view does not automatically reveal further groups while scrolling.

All entries passed into the client display component are already-public entries. No draft catalogue or source ledger is imported by it. The 378-entry expanded catalogue and its release flags remain unchanged. It is still awaiting complete source verification; its entries are not counted as publicly available terms.

## Validation and limits

The supplemental local rendering/unit harness passed 58 tests across five suites, including the 46 existing tests. Checks cover default and grouping-specific totals, visible group sizes, unique anchors, native View more URLs, filter reset, invalid limits, empty results and draft privacy. Scoped TypeScript and targeted ESLint passed. Both original glossary CSS files remain byte-identical.

As in the preceding patch, the local harness uses a metadata-only MDX transform and two earlier snapshot helper files to fill export omissions. Your runner reruns the same 58-test suite with the actual repository configuration, your production typecheck, targeted ESLint, Prettier and all five existing audit verifiers.

The manifest checks the reviewed baseline and input hashes before applying the small patch. A verified backup is created before file writes. No lesson content, cache, generated types, database, keys, commit or push are changed. Expanded catalogue publication remains blocked. Actual interactive desktop/mobile review is still required; the local render tests do not prove browser click behavior or visual layout.

## Review after applying

- `/glossary` defaults to Both, reports 136 available terms and displays the first 12.
- Forex reports 16; Crypto reports 120. All letters resets the alphabet only, within the current group.
- Forex, Crypto and Both controls remain visible on every page and work on mobile.
- View more reveals 12 additional terms per click, without an automatic infinite scroll. It disappears at the final group.
- Search and letter filters reset the displayed group. Search for `spread` keeps both path meanings distinct; `bitcion` still suggests Bitcoin.
- A later direct link such as `/glossary#position-size` or `/glossary/crypto#gas` reveals its target; previous lesson links work.
- Verify keyboard focus and mobile wrapping, and check native View more with JavaScript disabled if possible.

Return the execution transcript and browser observations. A successful installation does not certify the pending expanded definitions or complete Phase 3 release approval.
