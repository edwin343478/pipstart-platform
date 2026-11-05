# MP06b1 — safe course/module draft boundary

Prepared as the first of two MP06b implementation patches. No connected editor UI
or action endpoint is exposed yet; MP06b remains open.

The server-only entry repeats verified Auth and live staff access, then uses the
existing user-context item/create/save RPCs with 8-second abort deadlines. SQL
remains authoritative for current scoped grants and row-locked optimistic saves.
Course creation is Owner-only. Module creation checks the current permitted parent
course/path. Permanent ID/path/parent and existing course level cannot be edited.
New IDs use the accepted route segment format and exclude the reserved quiz slug.

The browser contract includes only title, description, numeric order and the
existing lesson-context/quiz-label/SEO presentation strings. No raw body, arbitrary
metadata, actor ID, publication status, disclosure policy or assessment gate is
accepted from a client. Saves merge named fields into the current full server body,
preserving opaque body fields, placement requirements and future nested metadata.
Malformed containers are refused rather than overwritten. Blank controlled optional
presentation fields clear only those keys. Reads return an editable allowlist.

Save requires the exact observed revision and hash. A pre-read mismatch or the
database's concurrent PT409 is a conflict, with no automatic overwrite. Every
successful write returns exactly one draft revision. Unclear transport or response
outcomes are uncertain and never retried or inferred from merely matching fields.
The next UI must retain user values, block replay on uncertain outcomes, and offer
explicit reload/compare/discard rather than declaring success.

Order is a bounded per-item placement rank, not an atomic multi-item drag/drop
reorder. Equal ranks are not claimed unique. Presentation-only rank editing cannot
change identities, parentage, learner progress or existing assessment requirements.
Publication/dependency ordering and public cutover remain MP08.

New bodies retain the imported learner-facing metadata target status published,
while the actual editorial revision is draft. That metadata is not a Publish
operation: no approve/submit/public-read call is made and Production reads code.

Preparation proves exact input/merge/DTO/error behavior using unit tests and static
checks, and rehearses the owner-run addition-only installer/rollback externally.
It does not claim new real Auth/write/browser acceptance. No migration, account,
grant, provider, hosted setting, flag, commit or push is included.

Next: owner application, then MP06b2 connected course/module forms with unsaved
change protection, explicit draft saves, numeric order controls and conflict/
uncertainty recovery; rehearse authorized real Auth/PostgREST/browser acceptance
before claiming full MP06b completion. MP06c lesson editing follows full MP06b.
