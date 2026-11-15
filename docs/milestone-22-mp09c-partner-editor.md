# MP09c: partner and link editor

This patch is staff UI only and requires MP09a and MP09b. It adds no migration and changes no public page.

## Screens

The editor lives at `/admin/staff/content/partner`. Only the Owner and Affiliate Managers can open it; for everyone else the page is not found.

- **New partner.** Set the identity (`partner:<identity>`, whose link is served at `/go/<identity>`), then:
  - name, short name, directory, relationship and card style;
  - summary;
  - review status, reviewed date, expiry date and sources (one "https-link date" per line);
  - facts, each with a label, value, verification, source link and checked date.

  Fees, payments, support, regulated entities, availability and the card image are kept exactly as stored.

- **`?id=partner:<identity>`** edits the partner and links to its link.
- **`?link=<identity>`** creates the partner's one link. **`?id=link:<identity>`** edits it: button label, destination, active and expiry.
  - The Owner-approved hosts are shown next to the destination, and any destination outside them is refused with a plain message before anything is sent.
  - Attribution parameters are kept exactly as typed.
- **Owner policy panel.** It holds the partner's risk notice or the link's approved hosts, saved as a new version with compare-and-set. Affiliate Managers see it read-only.

Saving creates a draft. Review, approval and making content live happen in the content library through the existing panels.

## Library

- Partner and link rows appear, with **View revision** and **Edit draft**, plus a **New partner** button and partner/link family filters.
- Affiliate Managers can open the library. They can send their drafts for review, archive and restore them, and take an assigned live link offline (**Take offline**, the store's `link.revoke`).
- Making content live remains Owner or Editor only.
- Revision comparison reports partner and link content as unsupported, like analysis posts.

## Server

`lib/content/partner-editor.ts` handles every operation:

- it repeats verified Auth and live staff access;
- it calls the store RPCs on the user's own session;
- it merges only the edited fields over the latest stored body;
- it reports a stale base as a conflict;
- it never replays a write whose outcome is unclear.

Only the Owner may send a policy change. The store decides every permission.

## Proof

- **Unit tests:**
  - the stored Deriv body round-trips byte-exact;
  - plain-language validation;
  - exact commands;
  - one write per action;
  - conflicts, denials and uncertainty;
  - the Owner-only policy.
- **Markup tests:** labels, read-only policy and no publication controls.
- **Workspace contract:** partner rows parse.
- **Checks:** full tests, typechecks, lint, build and the public-bundle scan.
- **Connected browser rehearsal:** the record is in the packet.
