# M22 MP06d2a — lesson sources

## Source scope

Owner-run patch following accepted MP06d1. The owner decided on 2 November 2026 that lessons need at least one valid source before they can be sent to a reviewer or published, with review and approval details taken from the store's decision record rather than typed into the body. This packet adds the authoring half: a structured **Sources** control in the lesson editor. The enforcement and the review/publication actions follow in MP06d2b.

Each source is an HTTPS citation: a title (1 to 200 characters) and an `https://` URL, the same rule as References blocks. A lesson has at most 50 sources. Drafts may be saved with none; the control says that review and publication will require one. All 89 imported lessons already carry between 1 and 21 sources (616 in total), and every one of them fits this rule, so existing lessons load and save with their sources unchanged.

New lessons take their sources from the editor instead of a fixed empty list. They remain `status: draft`, `approved: false`, with the fixed risk notice and no fabricated reviewer or dates. A stored body without a sources list reads as empty, and a save never adds an empty list to a body that had none. The revision comparison from MP06d1 now lists added, removed and changed sources.

## Verification and owner application

See the packet's preparation results for focused and full unit tests, both TypeScript configurations, scoped lint and format, the default-off production webpack build and the public-bundle check. The connected lesson journey now also adds a source while creating the sectioned lesson and checks the stored list. No migration, account, hosted setting, flag, commit or push is included.

Next: MP06d2b (the required-sources rule in SQL, Send to reviewer, Approve or Request changes, and Publish), then MP06d3.
