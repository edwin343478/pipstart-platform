# Milestone 20 — embed-first decision and Phase 20.2

Status: audit Phases 1 and 2 locally validated and visually approved;
Phase 3 release closeout candidate, not deployed release sign-off.
Current acceptance and open gates: [M20 audit closeout](milestone-20-audit-closeout.md).
Baseline: 871c9eeb908d2ca264439d20858a008e903a58b8.
Decision date: 9 October 2026. Owner approved embed-first with additions.

Historical Phase 20.2 preparation results: 16 focused unit tests passed; changed-file lint and
TypeScript checks passed before packaging. Full Next.js build and Playwright
execution were owner-side gates at that preparation checkpoint: the external copy's dependency junctions
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

## Phase 20.3 — approved page design and menu integration

Owner-approved desktop and mobile mock-ups (10 October 2026) are implemented:

- Page follows the Analysis design system: compact header (hidden on phones),
  introduction, provider-time attribution and delayed-data chips, and a right-aligned "Open full
  calendar ↗" button (full width above the widget on phones).
- Two-column layout from 1101px: "Upcoming events" widget panel (640px frame,
  520px on phones) beside "Key events explained". The explanations column takes
  its height from the widget column and scrolls inside it; from 768px to 1100px
  and on phones the panels stack.
- The ten original explainers keep all their text. Each card now shows a
  category tag, typical calendar wording ("Often listed as"), "Why it matters",
  the everyday example in a disclosure, and the lesson, glossary and source
  links. These remain general teaching cards, not a feed of today's events:
  the cross-origin embed does not expose which events are scheduled.
- Three notice cards: delayed-data notice, "If the calendar doesn't load" with
  the five official sources (`#official-sources`), and "Reading it safely".
- Menu: "Calendar" sits directly after "Analysis" in the desktop menu and the
  mobile menu. It is a plain anchor so the calendar's CSP arrives with a fresh
  document. The visible breadcrumb was removed to match the approved design;
  the mobile tab bar now shows on the calendar with Analysis highlighted.
- From 901px to 1100px the home header uses slightly tighter spacing so the
  nine menu items stay on one row (the eight-item menu already wrapped at 901px).
- Tests: M20 Playwright suite updated (exit via header or tab bar, design,
  panel alignment, phone stacking and tab bar, axe, menu order and document
  navigation, one-row menu at 901–1440px) and two timing races fixed by waiting
  for hydration and for the calendar host's observer.

## Audit Phase 1 - release evidence (11 October 2026)

Historical preparation status: evidence hardening candidate, not final release sign-off. No page layout,
scrolling behaviour, typography, event settings, teaching content, lesson URLs
or progress keys change in this phase.

### Updated acceptance record

- Baseline: 56c25381e88e17c55150747347912f65afb0e765.
- Owner report, 11 October: calendar scrolling works on a real Samsung phone,
  Android Chrome, against localhost. This supersedes the earlier failure report
  for that tested setup; no code change is attributed to this result. Exact phone
  model, OS/browser versions and the served build were not supplied.
- This does not certify iPhone Safari, the deployed site, every gesture position,
  keyboard access, rotation, zoom or screen-reader use. Those remain separate.
- Before this phase, retained local M20 results recorded 45 passed, six expected
  skips and no failures. This historical report is not accepted by the new gate:
  it lacks the current commit/build/source binding. Run the suite afresh.
- The external preparation build limitations above are historical, not a
  statement that production builds can never run. Subsequent build/browser
  evidence must be associated with its exact source revision and settings.

### Automated gate

CI invokes the dedicated M20 production-browser suite after the existing build
and Chromium installation. HTML/JSON reports, traces and failure screenshots
are retained for 14 days. Existing M16/M17 checks remain unchanged.
At Phase 1 the verifier required all 17 named cases in all three configured projects:
45 passes and exactly six known layout skips; missing/duplicate cases, changed
skip identities, runner errors, failures, retries and flaky outcomes fail.
Reports bind to Git HEAD, normalized integration/config sources, production
BUILD_ID, Node/Playwright versions and CI run/attempt when available. The start
time must not predate the build. After committing or editing bound sources,
rerun the browser suite: old reports intentionally fail verification.

Commands, after a successful production build:

```powershell
node scripts/verify-m20-browser-results.mjs --self-test
pnpm --filter pipstart exec playwright test --config=playwright.m20.config.ts
node scripts/verify-m20-browser-results.mjs
```

The six skips are: independent phone scrolling and phone stacking on desktop;
desktop panel alignment and desktop navigation fitting on each phone width.
Fixture checks grade PipStart integration, NOT real TradingView event data,
provider accessibility, storage behaviour or time-zone accuracy.

### Scope and remaining acceptance

| Requirement                      | Current position                                         | Remaining evidence / decision                                   |
| -------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Approved desktop/mobile design   | Retained                                                 | Owner approved; no redesign in this phase                       |
| Real-phone calendar scrolling    | Owner-reported pass on Samsung/Android Chrome, localhost | Deployed URL and Safari checks still separate                   |
| Native date/time-zone controls   | Not delivered; full-calendar link retained               | Explicit reduced-scope acceptance, not invented controls        |
| Per-scheduled-event explanations | Not delivered; ten general teaching cards                | Preserve honest scope; curated/licensed data is future work     |
| Live event times and values      | Provider rendered                                        | Dated source comparison, date rollover and DST checks pending   |
| Keyboard / screen reader / zoom  | Host fixtures give partial evidence                      | Manual provider-frame checks pending                            |
| Provider use and privacy         | Official generated embed, attribution retained           | Dated owner review of intended use and applicable terms pending |
| M20 CI acceptance                | Gate added by this phase                                 | Fresh CI evidence pending application/commit/push               |

Do not restore the removed Nairobi/GMT badge or Kenya/Tanzania descriptions.
Do not infer a universal fixed provider time zone. The current label identifies
TradingView as the owner of the event times, not a user-selected offset.

### Manual checks to record without pre-marking success

Record date, URL, commit/build, phone/OS/browser versions, event name and source,
action and outcome. Check Android Chrome and iPhone Safari separately: scroll
events in both directions, scroll explanations, continue page scrolling,
tap a provider control, rotate, and open the full-calendar fallback. Record
keyboard/focus/exit, screen-reader labels and 200% text enlargement separately.
For live times/values, compare a named release against its official schedule,
including source time zone, units, actual/forecast/previous, missing values,
date rollover and DST transition periods. Keep external attribution visible.
Retain terms links and the owner-approved use/attribution decision; request
provider clarification if needed. No legal permission is invented by this patch.

# Audit Phase 2 — recovery and learning links (11 October 2026)

This phase preserves approved styles, panel heights, independent scrolling and
lesson destinations. The widget keeps observing its host after frame insertion.
Removing either the frame or its provider container restores the unavailable
fallback. A user-triggered Reload calendar link requests a fresh document rather
than repeatedly injecting provider scripts into the existing document. A frame
arriving after timeout can recover the embedded state; frame presence never
certifies fresh or complete provider data. Permanent delayed-data guidance remains.

The ten teaching cards now link to five existing published public glossary anchors.
Destinations are labelled Related term: no unpublished payroll, wage or survey
entries are invented, and related concepts are not presented as exact definitions.

The Phase 2 browser contract supersedes the earlier 17-case counts: 20 cases,
60 instances across three Chromium projects, 54 passes and exactly six existing
viewport-specific skips. New cases cover frame/container removal and document
reload, late-frame recovery, and public glossary anchor resolution. Source/build/
commit binding and rejection of retries, failures and extra skips remain enforced.

Owner-reported acceptance remains Samsung/Android Chrome on localhost only.
Safari, deployed-provider behaviour, data accuracy and DST checks are not claimed.
Run the Phase 2 helper, not the Phase 1 hash-guarded helper, after this patch.

## Audit Phase 3 — closeout and maintainability (11 October 2026)

The owner approved Phase 2 visuals after its complete helper passed: 1,087 unit
tests in 111 files, lint, production build, TypeScript, 42 public browser chunks,
and 54 browser passes with six justified viewport skips. The saved browser report
was independently verified against the working tree and build before Phase 3.
This records local evidence, not a pushed revision or remote CI success.

Phase 3 replaces mobile-tab source-text assertions with rendered navigation
checks covering calendar highlighting, existing hub highlighting and non-hub
absence. No production component, CSS, lesson or progress data is changed.
The rendered test is included in the browser source fingerprint, so old reports
must not be reused after applying this patch.

The companion closeout document reconciles findings, records scope decisions,
and supplies an unfilled manual release checklist. It does not invent provider
permission, Safari acceptance, live accuracy or CI success. The Phase 3 helper
supersedes earlier helpers after application; it runs the consolidated checks.
