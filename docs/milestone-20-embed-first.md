# Milestone 20 — embed-first decision and Phase 20.2

Status: implementation candidate, not release sign-off.
Baseline: 871c9eeb908d2ca264439d20858a008e903a58b8.
Decision date: 9 October 2026. Owner approved embed-first with additions.

Local preparation results: 16 focused unit tests passed; changed-file lint and
TypeScript checks passed before packaging. Full Next.js build and Playwright
execution are still owner-side gates: the external copy's dependency junctions
were rejected by Turbopack, and webpack hit a Windows cross-drive entry-path
resolution error. An alternative drive-D copy could not be created due to
filesystem permissions. These are validation limitations, not successful builds.

## Delivered by this patch

- /economic-calendar, reachable from Analysis; SEO entry also feeds sitemap.
- Owner-supplied TradingView embed with branding and attribution preserved.
- Medium/high default importance; original countries plus Kenya/Tanzania.
- Fixed outer heights: 640px desktop, 520px phones. Reserved space precedes JS.
- Intersection-triggered loading; immediate only without IntersectionObserver.
- Script-error fallback, eight-second no-frame timeout from attempted loading,
  no-JavaScript fallback, persistent full-calendar and official-source links.
- Ten original teaching cards, fictional examples, source links and unchanged
  Level 7 lesson/glossary links.
- Route-specific script/frame CSP exceptions. Existing global policy, accounts,
  lesson content/progress keys and navigation layout unchanged.
- Calendar entry/exit are document navigations because CSP cannot change during
  an App Router transition. Hash links remain local; modified/new-tab clicks
  keep normal browser behaviour. Regression tests check the document headers.
- Privacy/cookie disclosure, no API keys and no copied event feed.

## Explicit limitations / deferred scope

Native daily/weekly filters and event-specific descriptions inside the embed
are NOT delivered. Full-calendar links are a workaround, not equivalent native
features. Static explainers partially meet educational description needs, not
per-event coverage. Flags do not replace a guaranteed explicit currency column.
Compact labels/values can be shortened. Missing forecasts are not zero.

The visible country menu included Kenya and Tanzania on 9 October. Selection
support does NOT guarantee complete or timely local event coverage. CBK/BoT
links provide authoritative local information.

Frame insertion does not prove event data loaded or is fresh. Cross-origin
restrictions prevent checking that in application code. A stalled frame retains
fallback instructions/links, not a false success claim. Provider controls and
iframe accessibility remain outside PipStart's control.

Reason: no budget for a licensed comprehensive feed. Future options: a separately
approved curated official-source calendar with native filters, permissions and
editorial ownership, or a licensed feed. These are future scope, not delivered
Phase 20.2 work.

## Provider permission evidence and boundaries

- Official widget: https://www.tradingview.com/widget-docs/widgets/calendars/economic-calendar/
- Widget offering: https://www.tradingview.com/widget/
- Applicable policies: https://www.tradingview.com/policies/
- Privacy: https://www.tradingview.com/privacy-policy/

The owner supplied generated embed code via FEEDBACK DATA.txt. This is an official
display embed, not permission to extract, cache, repackage or redistribute its
data. Keep attribution, logo and links. No proprietary scraping or invented API.
Recheck terms before release; this is integration evidence, not independent legal
advice or a guarantee of perpetual rights. Original PipStart text uses no provider
copy. No unconditional licensing acceptance is claimed.

Observed parent-page allowances: script at
https://s3.tradingview.com/external-embedding/embed-widget-events.js and frame at
https://www.tradingview-widget.com. Requests inside the cross-origin frame do not
justify broadly loosening the parent connection/image policy.

## Validation and release gates

- Isolated probe: one event displayed 16:00 GMT+3 Nairobi, 13:00 GMT+0 UTC,
  09:00 GMT-4 New York. This is not a DST-boundary proof.
- Deterministic Playwright fixtures test integration/failure behaviour, NOT live
  provider accuracy. Tests cover blocked script, silent no-frame timeout, lazy
  timing, fixed sizes, attribution, CSP and JavaScript disabled.
- Before release: owner desktop/mobile visuals, keyboard/screen-reader checks,
  real mobile Safari, live widget, timezones including DST boundaries,
  provider/privacy review and CI.
- API-key gate: not applicable (none). Failure isolation and direction notices
  need passing tests; do not pre-mark acceptance as passed.
- The original M20 build list remains partially met under the approved reduced
  scope. Close the milestone only with those limitations explicitly accepted.
