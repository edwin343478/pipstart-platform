# PipStart M17 — Phase 2: website integration and search

## Three-phase completion plan

1. Content verification and approval: finish the remaining claim-level checks and obtain publication approval.
2. Website integration and search: prepare the approved glossary adapter, discovery controls and public-only search.
3. Hardening and release: complete desktop/mobile browser checks, CI, final source and approval gates, then commit/push through the agreed workflow.

This patch starts Phase 2 now. It does not certify Phase 1 as finished. Phase 3 publication still depends on both earlier phases passing.

## What changes

- The catalogue adapter can display approved definitions, examples, clarification notes, aliases, categories, related terms and lesson links once the existing root and individual entry gates pass. Pending entries remain private. Invalid canonical URLs or lesson references retain the legacy public fallback instead of being integrated.
- Existing Forex and Crypto glossary pages gain a shared renderer, a combined-search link and conservative spelling suggestions. Their original stylesheets are unchanged.
- `/glossary/search` searches both paths, with a native GET form and a learning-path filter. Course-qualified identities keep shared names separate. Each result links to its existing canonical glossary anchor and keeps its own lesson contexts.
- Category controls use only public entries. They are hidden when fewer than two public categories exist, avoiding an empty or misleading selector while the expanded catalogue remains gated.
- Typo matching runs only when there are no direct matches. It uses published names and approved aliases, respects course/category filters, and bounds query length and edit distance. It never searches the private review catalogue.
- Slashing and Wash trading retain separate meanings and per-meaning contexts. Related terms resolve only to available public entries.

## Preservation and release status

The 378-entry / 380-meaning expanded catalogue, its approval flags and source records are unchanged. The existing 16 Forex and 120 Crypto public entries remain available. The 89 published lesson URLs, reading keys, lesson content, approved fonts and the two existing glossary stylesheets are preserved.

Source verification remains incomplete: 130 targeted checks are pending. The 149 core-evidence mappings and five corrected meanings still require final claim-level review, including remaining examples and notes outside the 18 reviewed meanings. Arithmetic and lesson-context checks are separate evidence, not whole-catalogue certification.

No database operations, secret entry, cache deletion, generated-type moves, publication, commit or push are performed by this patch.

## Validation

Local focused search/publication tests passed: 32 tests. A supplemental rendering harness passed all 46 tests across the search, publication and existing page suites. That harness used the supplied lesson sources, a metadata-only MDX transform, and two existing helper files from earlier snapshots to fill export omissions; it is not a substitute for your current repository's configuration. A scoped TypeScript check covering the changed TS/TSX files and their available dependencies passed, as did targeted ESLint.

The five existing audit verifiers passed, including all 50 negative fixtures. The package also checks catalogue/lesson/style preservation, manifest hashes, expected release refusal and archive integrity. Prettier runs on every payload file.

Your installer reruns all five audit verifiers, the 46-test suite, your actual production typecheck, targeted ESLint and Prettier. Desktop/mobile browser validation and full build/CI remain Phase 3 requirements.

## Apply and review

Save the ZIP and runner in Downloads. Run the supplied command from `D:\Website-Projects\pipstart-platform`. The installer requires the reviewed H7 HEAD and checks the current source hashes before changing files. It backs up each changed existing file and records new files. It stops on unexpected local differences; do not force it past a baseline mismatch.

After a successful run, use your normal development command and check:

1. `/glossary`, `/glossary/crypto` and `/glossary/search` load on desktop and mobile.
2. Searching `spread` in combined search shows distinct Forex and Crypto results and correct links.
3. Searching `bitcion` suggests Bitcoin and announces that a close spelling match is being shown.
4. The combined learning-path selector separates Forex and Crypto. Empty results offer a clear message.
5. Alphabet navigation and existing lesson links still work. Keyboard focus remains visible.
6. Pending catalogue examples and expanded categories do not appear. This is expected while publication gates are closed.
7. Approved lesson layouts and fonts remain unchanged.

Return the transcript and any browser observations. This prepares integration; it does not close the outstanding content-verification or release work.
