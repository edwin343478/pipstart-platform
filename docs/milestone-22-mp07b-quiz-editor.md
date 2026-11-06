# M22 MP07b — quiz editor and sandbox preview

## Source scope

Owner-run patch following applied MP07a (quiz versions), on main `25c8ace`. Staff can now edit existing quizzes in the content library, try a draft in a sandbox, and send it through the existing review and publication panel. The flag-off default is unchanged.

### Quiz editor (`/admin/staff/content/quiz?id=…`)

- **Who:** Owner, Author and Editor, as for lessons. Each load and save re-checks Auth and live roles; the store's resource SQL stays authoritative.
- **What can be edited:**
  - the title, passing percentage (1 to 100) and retake cooldown (0 to 3600 seconds);
  - questions: add, remove, reorder, type, prompt, explanation (shown after submission), 2 to 10 choices and the answer key.
- **Rules:** the editor applies the same rules as the grading registry, so an approved draft can always be graded:
  - single choice and true/false have exactly one correct answer;
  - multiple answers need at least two;
  - true/false uses only True and False;
  - question and choice identities are unique.

  Problems are listed in plain language, and saving stays blocked until they are fixed.

- **Hidden attributes stay:** placement, governance, presentation and any extra question attributes are kept from the revision the draft started from. Question and choice identities are assigned by the editor.
- **Version, set by the server (never typed):**
  - A draft started from an approved revision (imported, reviewed or Owner-published) carries the next version.
  - A draft started from an unapproved revision keeps its version.
  - The MP07a store rule refuses anything else. An approved version therefore never changes: attempts started on it finish and are graded on it.
- **Safe saving, as in the lesson editor:**
  - the server re-reads the quiz and refuses a stale base;
  - a write is sent at most once, and an unclear outcome stays uncertain until the draft is reloaded;
  - "Load latest" compares before any work is discarded;
  - controls stay inert until hydration, and unsaved work is guarded when leaving.
- **Scope:** only existing quizzes are edited here. Creating a new quiz is not part of MP07b.

### Sandbox preview

"Open sandbox preview" shows the current, unsaved draft as a learner would answer it. "Check sandbox answers" grades it in the browser tab with the learner grader (`gradeAssessment`): score, pass or fail at the draft's pass mark, and per question the answer given, the correct answer and the explanation. Nothing is sent to the server: no attempt, result, progress or learner record is created. Explanations and answer keys are not shown until answers are checked.

### Library

- Quiz rows now have **View revision** and **Edit draft**.
- The revision view, the review and publication panel, and the revision history all work for quizzes.
- Comparing two quiz revisions lists the changes to the title, version, pass mark and cooldown, and line by line to questions, choices (with the answer key) and explanations. This goes through the editable projection only, so hidden attributes never reach the browser.
- Archive, restore and hold remain unavailable for quizzes: the panel is hidden, and the server refuses them.

Answer keys and explanations reach only signed-in staff pages, which are dynamic and never prerendered. Learner pages and payloads are unchanged.

### Test timing

The two snapshot-source suites rebuild the whole content catalogue in each test. MP07a made them heavier, and they could exceed the 5-second default on a loaded machine. They now build the import manifest once per file, and use the same 60-second budget as the content-boundary suite. No assertion changed.

## Verification and owner application

- **Unit tests:**
  - the contract: every imported quiz projects, and an unchanged merge reproduces the stored body;
  - each rule, the server version rule, access, conflicts, error mapping, the route, the editor and sandbox markup, editor state, and library comparison and lifecycle refusal.
- **Preparation checks:** see the packet's preparation results for the full unit suite, both TypeScript configurations, lint and formatting of the changed files, the default-off production webpack build and the public-bundle check.
- **Rehearsal:** a connected browser rehearsal against a disposable local stack covers editing an imported quiz, the sandbox, saving as the next version, and approving it.

No migration (MP07a's is still unapplied to the hosted database), account, hosted setting, flag, commit or push is included.

Next: MP07c, with connected acceptance (an attempt on version N survives N+1; tampered snapshot, key and version are rejected; no answer leakage), visual approval, the hosted migration under its own authorization phrase, and the release.
