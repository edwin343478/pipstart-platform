# M16-H7 controlled cleanup

Baseline: approved H6 commit `623b5b4dbb1ff8aaa7dc327430b8bf641cddc7e9`.

The ten Crypto secondary lesson routes use a shared server-only parameter and lookup helper. Each route retains its own statically declared `dynamicParams = false`, existing metadata factory and lesson renderer. First lessons retain the level-root route; Level 0's mixed hierarchy/lesson routing is unchanged. Unknown and cross-level slugs remain unavailable. Array order, metadata, canonical routes and permanent IDs are preserved.

Forex and Crypto quiz contexts use one server-only lookup and compact client-data converter. Established wrapper exports remain compatible. Course/module membership checks, publication filters, lesson IDs, quiz identity, level labels and legacy progress keys are retained. Quiz rendering, assessment versions, grading, attempts and database schema are unchanged. The complete lesson catalogue remains server-only.

Reading-state code is unchanged. A captured pre-cleanup reference checks all 89 existing lesson storage keys and all compact quiz contexts, including the legacy keys. Tests confirm lesson-card section-one URLs reset show-all while retaining saved ticks. No storage migration or learner progress reset is introduced.

Roadmap verification confirms the existing curriculum includes each of the 50 published Crypto lessons exactly once and one canonical quiz in each of the 11 levels. No approved roadmap or lesson text is rewritten. The fixture was captured from the approved H6 code before refactoring and is imported only by a unit test.

Seven regression tests supplement the existing suite. Browser validation uses the existing 214-case cumulative production suite, including H6 accessibility and H5 runtime/security gates. Preparation HTTP checks cover 50 lessons, 11 quizzes and two invalid/cross-level routes. These HTTP checks are not browser interaction or accessibility claims.

No stylesheet, image, lesson-content document, reading hook, package dependency, environment file or migration changes. Old local patch folders are left untouched. This cleanup does not remove the existing Next.js NoFallbackError console message observed during unknown-route probes; response semantics remain checked, and the framework logging issue remains recorded rather than suppressed.
