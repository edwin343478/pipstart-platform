# M22 MP07a — quiz versions

## Source scope

Owner-run patch following the MP06 release (main `25c8ace`), and the first MP07 packet. It makes published quiz versions immutable and keeps every approved version available for grading, before MP07b adds the quiz editor. Owner decisions (MP07): the server assigns the version on save, so editors never type one; attempts started on version N finish and are graded on N, while new attempts start on N+1.

### Database rule (migration `20261106090000_pipstart_m22_quiz_versions.sql`)

- A quiz's **approved version** is the highest `metadata.version` among its revisions that hold an imported, reviewer or Owner decision for their exact body.
- **Create and save** of a quiz must carry exactly that version plus one (1 for a new quiz). Anything else is refused with `22023` and records nothing. MP07b's server action fills the version in; the database enforces it.
- **Submit, approve and Owner publish** accept a quiz revision only when it carries the next version, or when its version is already approved with exactly this body (for example after archive and restore). Requesting changes is never blocked.
- So two different bodies can never be approved under one version.

`pipstart_editorial_create`, `_save`, `_submit`, `_review` and `_approve_single_person` are redefined with their exact accepted bodies plus one quiz check each. The builder proves that the check is the only difference. Three private helpers are added: `quiz_published_version`, `quiz_version_ok` and `quiz_decision_ok`. They are never null, are not granted to any API role, and change no rows. Other families are unaffected.

### Keeping old versions for grading (content snapshot format 2)

- `scripts/export-content-snapshot.sql` now writes format 2. It adds `quizVersions`, which holds every approved version of every quiz that is not archived or on hold: for each version, its latest revision decided for that exact body. The list is sealed by `quizVersionsSha256`, using the same line format as the item seal.
- `lib/content/source.ts` verifies each version completely: valid ID, version equal to the body's own `metadata.version`, a valid quiz body, matching SHA-256, no duplicates, and the list seal. Any defect refuses the whole snapshot. Format 1 files still load, with no history.
- `lib/assessment-registry.ts` keeps every approved version other than the current one as `retired`. Under the existing `getContinuableAssessment` rule, retired versions can be continued and graded, but new attempts never start on them. A store version replaces the code definition with the same ID and version. With today's content, the registry is unchanged.

Item selection in the snapshot itself is unchanged in this packet. The MP08 publication work will address that an edit in progress currently leaves an item out of a store snapshot.

## Verification and owner application

- A new SQL suite, `scripts/test-m22-editorial-quiz-versions.sql`, covers the following and is part of the consolidated SQL verifier (33 inputs, manifest re-pinned):
  - grants and volatility;
  - v1 on create, and N+1 on save;
  - publishing v1 then v2;
  - a tampered revision refused at submit, approve and publish;
  - changes requested still allowed;
  - refusals recording nothing;
  - the author/reviewer path;
  - identical re-approval after restore;
  - one body per approved version.
- Unit tests cover the format 2 seal, the loader's refusals, reading format 1, and the registry. In the registry tests, the older version is retired and continuable, and the current version starts new attempts.
- See the packet's preparation results for:
  - the full unit suite;
  - both TypeScript configurations;
  - scoped lint and formatting;
  - the production webpack build;
  - the public-bundle check;
  - the SQL proof.

No hosted migration, account, setting, flag, commit or push is included. The hosted migration is applied in MP07c under its own authorization phrase.

Next: MP07b, the quiz editor with sandbox preview.
