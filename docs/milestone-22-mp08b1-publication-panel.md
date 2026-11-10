# M22 MP08b1 — Publication panel

## Source scope

Owner-run patch following applied MP08a (publication store). Staff can now see and change what is **live** in the store, from the content library. Learner pages still read code: delivery to the live site is MP08b2, and switching a content type to the store is MP08d.

### Library

- **Live publication summary** at the top of the library:
  - the live generation and its delivery state (waiting, being delivered, verified on the live site, failed and retried, or replaced);
  - for the Owner, **Create the live baseline** (generation 1, once) and **Restore generation** (an earlier generation's content as a new generation).
- **Live publication of this item** panel in every item's revision view:
  - which revision is live in the current generation;
  - **Make revision N live**, when the latest revision is approved and is not already live;
  - **Take offline**, when the item is live.

  Owner and Editor see the actions; the store decides every permission.

- Every change asks for a reason (1 to 200 characters) and a confirmation, carries a fresh operation identity and the live generation the panel showed, and is sent at most once. The outcomes are:
  - **Refusal** by the store, such as someone changing the live publication first, or publishing a child before its parent: shown plainly, with nothing changed.
  - **Unclear outcome:** treated as uncertain and not resent. The panel stays blocked until the status is reloaded.
- The review panel's existing Owner **Publish revision N** still records Owner approval only. Making content live is the separate **Make revision N live**.
- **Analysis posts** now open in the library's revision view, so the pilot can make them live, take them offline and restore them. Revision comparison and an editor for analysis posts are not part of MP08b1.

### Server

`lib/content/publication.ts` checks the signed-in session and live roles, for navigation only, then calls the MP08a staff RPCs through the user's own session, never a service key. It accepts only the store's exact replies: the next generation, or generation 1 for the baseline.

## Verification and owner application

- **Unit tests:**
  - the contract's command shapes and status parsing;
  - the service: roles, exact single writes, replay, store refusal codes, uncertain replies and lost responses;
  - the panel's plain-language status, with nothing sent during render;
  - analysis detail in the library.
- **Connected rehearsal**, with real local Auth and MFA, PostgREST and Chromium, covers the baseline, making a post live, taking it offline and restoring it.
- See the packet's preparation results for the full unit suite, both TypeScript configurations, lint, formatting, the production webpack build and the public-bundle check.
- No migration, account, hosted setting, flag, commit or push.

Next: MP08b2 — the build-time generation loader, the refresh job and deploy hook, and anonymous verification.
