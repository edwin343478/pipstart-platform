# M22 MP06d3 — archive, restore and hold

## Source scope

Owner-run patch following accepted MP06d2b, and the last MP06d source packet. The content library's revision detail gains an **Archive and hold** panel for courses, modules and lessons, on the accepted MP04 store RPCs:

- **Archive** (Owner, Author, Editor): moves an active item that is not on hold to the archive (the store's trash). Every revision is kept. The store refuses an item that still has active contents.
- **Restore as draft** (Owner, Editor): brings an archived item back as a new draft revision copied from its latest one. Earlier approvals are not reinstated, as decided in MP04. The store refuses while the parent is archived.
- **Place hold** and **Release hold** (Owner only): a hold blocks archiving until released.

Archive, restore and placing a hold need a reason (1 to 200 characters); each asks for confirmation first. As with review decisions, the server re-reads the item and refuses when it changed since it was shown, sends the write at most once, and treats an unclear outcome as uncertain until the revision is reloaded. After a recorded action the revision is reloaded from the store. Roles only choose which buttons appear; SQL decides every permission. Learner pages are not changed: removal from the live site is MP08's Withdraw.

## Polish from earlier review

- The Review and publication panel no longer repeats "No decision is available" under an approved or changes-requested revision.
- Revision comparison names numbers inside blocks, for example `level: 3` for a heading level.

## Verification and owner application

No migration. See the packet's preparation results for focused and full unit tests, both TypeScript configurations, scoped lint and format, the default-off production webpack build and the public-bundle check. The connected acceptance covers the complete MP06 journey (library, course/module and lesson editors, revision history and comparison, sources, review and publication, archive, restore and hold) with real local Auth, PostgREST and a real browser, followed by owner visual approval. No account, hosted setting, flag, commit or push is included.

Next: MP06e — integrated release reconciliation, the two hosted migrations (`20261102090000` revision reads, `20261105090000` publication sources) under their own authorization phrases, exact-file commit and push, and exact-commit deployment checks.
