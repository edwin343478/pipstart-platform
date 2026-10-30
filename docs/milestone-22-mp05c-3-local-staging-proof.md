# MP05c-3: local staging proof (store to site without code edits)

Status: published at `2467321`, after the local staging proof. The repository gains the snapshot
export query and its guard test. Production keeps reading code.

## The export

`apps/pipstart/scripts/export-content-snapshot.sql` is operator-only and read-only. It produces the
sealed snapshot file that `PIPSTART_CONTENT_SOURCE=snapshot` reads (MP05c-2).

- **What it includes:** every item at its approved revision. Items that are trashed or on hold are
  left out, and so is everything below them. Unapproved drafts are never exported.
- **Item order:** depth-first in curriculum order (path, level, course, module, item). Analysis
  posts follow, by section and newest first. This reproduces the site's own ordering.
- **The seal:** computed in SQL from the store's own `body_sha256` values, in the line format the
  loader verifies.

Run it with `psql -X -qAt -f apps/pipstart/scripts/export-content-snapshot.sql` and save the
single output value. `lib/content/export-snapshot-sql.test.ts` keeps the query to one read-only
transaction with no writes, and keeps its filters and seal format in step with the loader.

## The staging run (30 October 2026)

The run used a fresh, marked, disposable database in the local Supabase stack. It was derived from
the accepted isolated SQL runner, in the same way as the MP05b rehearsal. The application database
was never touched, and the disposable database was dropped (run `7f240776…`, cleanup confirmed).

1. **Production history replayed:** MP03 hosted steps, the sealed Owner rollout fixture with MFA,
   MP04a and MP05a.
2. **Today's manifest imported** through `import_item`: 160 items created.
3. **New items created by the fixture Owner** through the real staff RPCs, under an AAL2 session:
   - a new course, module, later lesson and module quiz in Crypto Level 2;
   - the same in Forex Level 2;
   - all 8 approved with `approve_single_person`;
   - one lesson per path created and left as an unapproved draft.
4. **Read-only export:** 168 items. The store was unchanged afterwards.

The app's own loader verified the export:

- every body matches its stored SHA-256, and the seal matches;
- all 160 imported bodies are byte-identical to today's code, in manifest order;
- the 8 approved new items are present, each after its level's existing course;
- both drafts are absent.

## The site, built from the store export

A production build was made with `PIPSTART_CONTENT_SOURCE=snapshot` reading the store export. It
was compared with the code-source build of 6189b7a across all 1,142 prerendered files:

| Result     | Files | Meaning                                                                                      |
| ---------- | ----: | -------------------------------------------------------------------------------------------- |
| Identical  |   605 | build noise only                                                                             |
| Route view |   361 | visible HTML identical where HTML; content identical; object key order differs               |
| Different  |   176 | every course and module page of both paths, whose curriculum tree now includes the new items |
| Added      |    48 | the 8 new pages and their RSC and segment files                                              |
| Removed    |     0 |                                                                                              |

For the 176 different files:

- no string of the code build is missing;
- all 57 added strings belong to the 8 new items: their values, IDs and URLs.

`sitemap.xml` gained exactly the 8 new URLs. Every existing entry is unchanged, and the drafts are
not listed.

### Served locally (`next start`, snapshot source on)

- **New pages:** all 8 return 200, with titles derived from the store:
  - "Staging Proof Crypto Course";
  - "Staging Proof Module";
  - "Staging Proof: A New Crypto Lesson";
  - "Staging Proof Module Quiz";
  - and the Forex equivalents.
- **Module quizzes:** both live at their module URL, for example
  `/learn/crypto/level-2/mp05c3-crypto-course/mp05c3-crypto-module/quiz`.
- **Drafts:** both return 404. That includes the Forex draft, rendered on demand, which proves
  that the running server reads the same verified export.
- **Lesson page:**
  - the breadcrumb reads "Level 2 / Staging Proof Crypto Course";
  - the sidebar lists the course's own lesson and its module quiz.
- **Progress:** "Mark complete" saved progress under the new course's own key,
  `pipstart:learn:crypto:level-2:mp05c3-crypto-course:progress`. After a reload the lesson showed
  "Completed" and "1 of 1 complete", and the quiz page agreed.
- **Quiz page:** 15 questions and the store quiz's 80% pass mark.
- **Grading:**
  - the browser submit stopped at the anonymous rate limit, which needs the Supabase service client
    that this local server does not have;
  - the grading that follows it (`getCurrentPublishedAssessment`, then `gradeAssessment`) was run
    in-process on the store export:
    - Crypto: 15/15, 100%, passed;
    - Forex: 12/12, passed;
    - all-wrong answers: 0, failed;
    - the public payload carries no answer key.

## What this closes

A new course, module, lesson and quiz, created and approved in the editorial store, reached a
staging build of the site with no code edit. They have:

- their own pages and URLs;
- the quiz under its module;
- breadcrumbs and progress;
- grading;
- sitemap entries.

Existing pages are unchanged apart from listing the new items. Unapproved drafts never appear.
