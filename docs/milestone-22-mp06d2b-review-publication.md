# M22 MP06d2b — review and publication decisions

## Source scope

Owner-run patch following accepted MP06d2a. The content library's revision detail gains a **Review and publication** panel for courses, modules and lessons, built on the accepted MP04 store RPCs and the owner's MP04 decisions (two paths: Owner single-person "Publish" while review is optional, and "Send to reviewer" for a different reviewer):

- **Send to reviewer** on a draft (Owner, Author, Editor).
- **Approve** or **Request changes** on a submitted revision, by a reviewer who did not save it (Owner, Reviewer). Requesting changes needs a note; approval may carry one.
- **Publish** on a draft or submitted revision (Owner only, closed when the review policy requires independent review), after a confirmation that names the exact revision.

Every decision applies to the exact latest revision and its fingerprint. The server re-reads the item, refuses a stale revision or hash as a conflict, sends at most one write, and treats an unclear outcome as uncertain: the panel blocks further decisions until the revision is reloaded and nothing is resent. After a recorded decision the revision is reloaded from the store, so the panel and the history show the stored state and decision. Roles only choose which buttons appear; SQL decides every permission, including the different-person rule.

Approval does not change learner pages. Production keeps reading the published code until the MP08 public content cutover, and the panel says so.

## Sources rule

`20261105090000_pipstart_m22_editorial_publication_sources.sql` redefines `pipstart_editorial_submit`, `pipstart_editorial_review` and `pipstart_editorial_approve_single_person` with their exact signatures, grants, authority and behaviour, adding one check on the exact target revision: a lesson needs 1 to 50 sources, each exactly a non-blank title of at most 200 characters and an `https://` URL of at most 2,048 characters without whitespace, user information or control characters. Requesting changes is not affected, so a reviewer can always send a lesson back. Courses, modules, quizzes and analysis posts are not affected. Drafts can still be created and saved without sources. All 89 imported lessons (616 sources) satisfy the rule.

The app checks the same rule first, so a lesson without sources gets a clear message and no write is sent. The SQL suite `test-m22-editorial-publication-sources.sql` runs in the consolidated MP03 verifier after the revision-read stage and covers the sources shape, both paths, the different-person rule, a revision submitted before the rule, other families, ordering of existing refusals, and that refusals record nothing.

Reviewer names, review dates and approval come from the store's decision record, never from text typed into the lesson body; publishing them on learner pages belongs to MP08. The hosted migration is applied only in MP06e, as an owner-run SQL Editor step with its own authorization phrase, before any deployment of this source.

## Verification and owner application

See the packet's preparation results for focused and full unit tests, both TypeScript configurations, scoped lint and format, the consolidated SQL proof on a disposable database, the default-off production webpack build and the public-bundle check. The fingerprinted installer checks the exact applied MP06a–d2a predecessor, applies only its listed files and runs focused regression tests. No account, hosted setting, flag, commit or push is included.

Next: MP06d3 (archive, restore and hold, full connected acceptance of MP06d and owner visual approval).
