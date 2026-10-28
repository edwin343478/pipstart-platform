# MP03: dormant staff account-operation journal

Four additive source files provide a private journal for reviewed staff account
operations. No public RPC, service-key privilege, provider executor, scheduled job,
staff activation, retirement, factor removal or account suspension is connected.
The migration requires staff control to be disabled and leaves it unchanged.

The fixed intent binds request UUID, existing staff identity, one operation, an
exact factor UUID or explicit suspension expiry when applicable, fixed reason and
control version. Only a trusted DB operator can use these primitives. Provenance
explicitly says trusted_db_operator: there is no assertion of a verified human
actor, user-context authorization, fresh MFA or remote acknowledgment from SQL
alone. No password, JWT, MFA seed, email, arbitrary payload or free-form note is
stored. A five-minute claim window is an expiry, not proof of recent MFA.

One unresolved operation is permitted per staff identity. Preparation is durable
before a dispatch claim; exact replay reads the existing state. Claim checks the
current target, original control version and expiry and issues one dispatch ID.
A repeated claim returns no executable target or permit. A lost claim response
must be reconciled, never treated as permission to resend. This is not a network
exactly-once guarantee. The later dispatcher must not automatically retry sends.

Known success, definitive failure and uncertainty are separate states. A later
trusted observation of desired/other provider state is separately labelled and
is not proof that this dispatch caused that state. Fixed result labels are trusted
operator attestations until a separately authorized provider adapter is installed.
Only unstarted prepared work can be cancelled. Result recording survives a stop
or control-version change; prepare/dispatch cannot ignore that change. Prepared,
dispatched and unknown records block enabling staff access.

Last-active-Owner suspension is refused again at claim. Factor recovery requires
an exact verified TOTP factor owned by the staff target. Retirement requires prior
audited access removal: inactive membership, no roles, delegations or assignments.
These are planning checks, not completed recovery/retirement. A second verified
factor, complete-loss/only-Owner identity checks, session effects and offline
recovery rehearsal remain required before live recovery is allowed. Delegated
learner operations and ordinary learner deletion are outside this first journal.

Intent bindings are immutable; valid state transitions and monotonic revisions
are guarded. Every primitive appends an event in the same transaction as its state
update. Append failure rolls both back. Events and requests cannot be deleted by
normal primitives. Existing staff Auth foreign keys and governance audit remain
unchanged. DB owners remain trusted and can bypass triggers; no claim of protection
against the DB owner, automatic purge or legal compliance is made.

## Owner-run source and isolated SQL acceptance

The combined external wrapper applies these four fingerprinted additions, then
uses the accepted local isolation runner. It creates one new marked disposable
database within the existing local Supabase container; it does not reset/stop the
application database, alter global roles or run hosted SQL. Minimal Auth schema
fixtures are SQL stubs, not real Auth/PostgREST/MFA proof. Fixture writes roll back.
The runner checks the empty/default-closed head and observes actual two-session
contention for a single dispatch permit. Existing core behavior/last-Owner gates
also remain in the run. Only the exact marked database is removed on cleanup.

Preparation checks fingerprints, runner syntax and planning guards; real SQL
acceptance remains pending until the owner runs the bundle. A source apply is not
publication approval. Hosted compatibility/migration, API integration, real Auth
recovery, browser acceptance, CI and publication remain separate gates.

Next within MP03: inspect isolated journal acceptance, then bind approved account
operations to user-context fresh verification and implement/rehearse provider
reconciliation and recovery. Nine main packages follow full MP03; MP04 remains
revision storage and adapters.
