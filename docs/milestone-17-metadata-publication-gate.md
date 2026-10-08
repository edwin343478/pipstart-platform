# Milestone 17 discovery metadata publication gate

The existing public adapter copied aliases and categories directly from the private review catalogue, even though its release gate was draft/unapproved and every entry's source review was pending. Definitions already remained private, but discovery metadata bypassed the catalogue's publication decision.

The adapter now obtains discovery metadata through `getPublicGlossaryCatalogue()`. The existing catalogue-level release gate and per-entry status, approval and source-review checks apply to aliases and categories as well as definitions. With the current draft catalogue, no proposed aliases or categories enter the public adapter. The adapter retains its previous default category until reviewed categories are released. A default label is not a claim that every advanced term belongs pedagogically to Foundations; category curation remains pending.

Approved public definitions continue to come from the 14 Forex lesson definitions, existing Pipette/Position size entries and the existing Crypto glossary. All 16 Forex and 120 Crypto identities, definition meanings, lesson context links and canonical anchors are retained. No glossary CSS, lesson content, page layout, search ranking code, route or learner storage is changed. Draft catalogue wording, examples and proposed links remain private and unchanged.

An additional integration case asserts that pending aliases and categories are absent from both public adapters. The existing name-search case uses the canonical published British spelling rather than depending on the pending American spelling alias. Case, prefix and substring matching of actual published names and definitions still works; a query can still match text within a published definition. Publication approval of alternate spellings is a later editorial step.

The apply script verifies the nine existing M17 files, unchanged lesson source inputs and H7 HEAD before writing. It accepts the two previously reviewed tracked glossary-page changes. It backs up the two overwritten files outside the repository and creates this document. An identical rerun is permitted; unrelated tracked/staged edits stop execution before writes. Historical untracked patch folders remain untouched.

After application, run the 26 catalogue/page integration tests, production type check, lint and formatting checks. Full browser/production release verification remains part of public feature integration and Milestone 17 closeout. Do not apply the retired 17B1 foundation patch.

Next, review the 362-entry catalogue's wording, source provenance, aliases, categories and context links, then release only reviewed metadata/content through the existing gates. Add category controls, related-term navigation, transparent typo suggestions and a dedicated search-results experience in bounded patches using the approved visuals.
