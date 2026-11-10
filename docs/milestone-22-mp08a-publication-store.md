# M22 MP08a — publication store

## Source scope

Owner-run patch on main `616ce75`, and the first MP08 packet. It adds the database half of publishing: what is live is recorded as an immutable, sealed **publication generation**. Learner pages keep reading code; MP08b adds delivery and MP08d the per-family authority switch.

Owner decisions (MP08):

- each publication is a new generation delivered by a new deployment;
- analysis posts are the pilot family;
- the Owner's audited single-person approval is accepted for publication while no distinct reviewer exists;
- the scheduler is built later and stays inactive until separately authorized.

### Migration `20261107090000_pipstart_m22_publication_store.sql`

- **Generations:** each generation holds exactly one published revision per item, plus the quiz versions it carries, frozen when it is created. Each published quiz keeps every approved version up to its published version, so attempts keep grading on their own version. A seal (entry count and the SHA-256 of the generation's public snapshot) is written last; a single pointer names the live generation. Generations, entries, frozen quiz versions and seals are append-only.
- **Staff RPCs:**
  - **Baseline** (Owner, once) makes generation 1 from every item whose latest decided revision is approved: today's imported content.
  - **Publish** (content.publish) makes the next generation with one item set to an exact approved revision.
  - **Withdraw** (content.withdraw) makes the next generation without one item.
  - **Restore** (Owner) makes an earlier generation's exact set live again, as a new generation. History is never rewritten.

  Every change rechecks approval, capability, dependencies and trash state at execution. Each one carries a stable operation identity, so a repeated click returns its first result and a reused identity for another change is refused. Each one also carries the expected live generation (compare-and-set): a stale request is refused (`PT409`), so nothing undoes a newer decision. A child needs its published parent; a parent with published contents cannot be withdrawn; a quiz can only move to a later version; content in trash is never published or restored. Every change is audited.

- **An edit in progress never changes what is published.** Generations name exact revisions, which fixes the MP07 snapshot gap.
- **Build read** (`pipstart_publication_snapshot`, service role only): the live generation's public snapshot in format 2, verified against its seal, or refused (`XX001`). It includes quiz answer keys, used for server-side grading, so no staff or anonymous role can read it.
- **Delivery tracking** (`pipstart_publication_refresh`, service role): each generation gets a job — pending, processing, verified or failed, with bounded retries. Older open jobs become superseded.
- **Trash** keeps its exact behaviour, plus one check: published content must be withdrawn first.
- Analysis posts cannot be assigned to staff, so in the pilot only the Owner publishes them.

## Verification and owner application

- **SQL suite `scripts/test-m22-publication-store.sql`** (65 assertions, rolled back) covers:
  - grants and volatility;
  - the baseline;
  - publish refusals: unapproved, wrong hash, author without permission, replay and reuse, stale, unchanged;
  - frozen quiz versions, and an edit in progress;
  - parent-first publishing;
  - withdraw, trash and restore rules;
  - delivery states;
  - immutability, audit, and a tampered body refused by the build read.
- **Concurrency stage:** the consolidated verifier (35 inputs) runs two real sessions.
  - Two publishes against the same generation: one wins, and the other waits on the lock and is refused as stale.
  - The same operation identity in two sessions publishes once.
- No hosted migration, account, setting, flag, commit or push is included. The hosted migration follows in its own packet.

Next: MP08b — delivery (the build-time generation loader, refresh jobs and deploy hook, anonymous verification) and the staff Publication panel.
