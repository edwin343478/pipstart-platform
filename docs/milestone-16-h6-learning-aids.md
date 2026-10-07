# Milestone 16-H6: accessibility and learning aids

Baseline: `fd96b69d27a39caf82514a575ef3b92026fd7d00` (approved, pushed H5).

## Learner changes

Each of the 41 Crypto diagrams keeps its original image, dimensions and approved takeaway caption. Its alternative text now identifies what is drawn. Below it, an original-size link opens the existing image in a new browser tab, where the browser's image zoom is available. A native **Read diagram as text** disclosure contains the diagram's steps, labels, numerical comparisons and relevant qualifications. These paragraphs reflow at normal lesson typography on phones and remain available without scripting. Print exposes the descriptions even when the disclosure was closed.

The original raster images have not been redrawn as SVG or replaced with portrait artwork. This patch provides a readable text equivalent and access to the original-size asset without redesigning the approved illustrations. It does not claim that embedded PNG lettering becomes sharper.

The Crypto glossary is generated on the server from approved published definition blocks. The 120 occurrences yield 118 distinct course terms; Bitcoin and Blockchain retain their existing introductory definitions, giving 120 entries. Distinct explanations of repeated terms, such as Slashing and Wash trading, are retained with their original lesson context. Lesson links use canonical published routes. Names remove the editorial prefix `Definition —`; definition wording is preserved.

The glossary has native GET search, letter filters, an All link and stable entry IDs. Search is submitted with Enter or the Search button rather than requiring client-side live filtering. Opening `/glossary/crypto#gas` shows the full glossary and reaches Gas. These operations also work without JavaScript.

Lesson-specific **Key terms in this lesson** links occupy the existing footer disclosure format. Related-term metadata is derived from the active lesson's definition blocks. A lesson with no definition block receives no invented key-term list. Forex payloads receive no new glossary data. The complete catalogue remains server-only; client lesson props contain just the active lesson's small name/link list.

Wide native tables now expose a labelled, keyboard-focusable scroll region. A focus outline appears during keyboard interaction. Existing table, paragraph, heading and button typography remains unchanged.

## Validation and boundaries

Crypto diagram publication rejects identical alt/caption text. Optional descriptions must contain nonempty text. The stricter duplicate-alt rule is scoped to Crypto diagram assets, preserving already-approved Forex diagrams. The H6 unit coverage also checks every current Crypto diagram for a text equivalent and an existing original file.

Seven new unit cases cover diagram aids, all definition occurrences, repeated meanings and context links, draft exclusion, active-lesson payloads, validator failures and keyboard table semantics.

Eight browser cases join the cumulative M16 configuration. Three sweep every currently approved lesson, at 1440, 390 and 320 pixels, using the course metadata in the test runner. The catalogue is not sent to a browser. Native non-scored disclosures are opened for the accessibility scan. axe checks WCAG A/AA tags and attaches every route's findings; there are no disabled rules or excluded selectors. Other cases check no-JavaScript diagram/print access, keyboard table scrolling, native glossary search/filter/deep links, key-term round trips and glossary accessibility.

Automated axe checks are a regression gate, not a claim of complete WCAG conformance. Manual checks should include screen-reader reading order, pronunciation and ease of following the diagram descriptions.

The existing production TypeScript configuration, CSP, rate limiting, permanent IDs, section-navigation contract, quiz answers, grading and database schema are preserved. No new dependency is added. H5 security checks still run through the cumulative browser command.
