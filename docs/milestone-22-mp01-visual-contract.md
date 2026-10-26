# Milestone 22 MP01: administration design preview and visual contract

Status: design implemented as a preview. No feature is connected.

## Approved foundation and implementation boundary

The owner adopted the master plan and supplied desktop/phone sheets and HTML on
26 October 2026. Those files are the visual reference. Reuse this shell, visual
tokens, screen hierarchy and responsive arrangements in MP02–MP12 rather than
introducing a second dashboard. The reference sheets' surrounding browser/phone
frames and explanatory captions are not application UI.

The preview's role names, MFA badges, health counts, identities and times are
fictional samples, not evidence about a session or the deployed platform. The
existing administrator gate protects the preview; it is not the future staff
permission model. Later packages must bind navigation and actions to live grants
and server/database enforcement. Recovery-code issuance/revocation needs an
approved, supported design in MP03; the A3 sample does not implement it.

Screen-to-package labels follow the approved twelve-package master sequence:
course/module/lesson editors and review/conflict UI in MP06, quizzes in MP07,
publication in MP08. Storage and bridge dependencies remain MP04/MP05.

Trash copy follows the master: recoverable for at least 90 days, protected
references/holds and no automatic purge. This corrects the supplied sample's
permanent-deletion promise without changing its visual structure.

This is a static visual preview, not completed interactive accessibility. The
modal samples have ARIA labels and inert main/sidebar content but do not yet
implement initial focus, a complete focus trap, Escape dismissal or focus return.
Before a corresponding modal becomes functional, its owning feature patch must
implement and keyboard-test those behaviours, including background header/tab-bar
isolation. Static markup and axe checks alone cannot prove this. Signed-in
administrator and signed-in learner rejection tests also remain release gates;
skipped credential-dependent tests are never counted as acceptance.

The shared primitives are visual building blocks, not finished input/form APIs.
Feature patches will add controlled values, validation, pending/error behaviour,
accessible feedback and action handlers while preserving the approved appearance.

## What this is

The 27 approved Milestone 22 administration screens, built as real, accessible pages in the PipStart app and served only to signed-in administrators at `/admin/preview`. Every screen uses sample data. Nothing on a preview page reads or writes data, calls a service, sends a form, or stores anything. The later patches (MP02 onward) replace one screen at a time with a working version and reuse the shell, components and tokens defined here.

This respects the MP01 rule of "no product switch": learners see nothing new, and no existing route changes behaviour. The one existing file touched is `/admin`, which gains a link to the preview.

## Routes and access

| Route                        | Behaviour                                                             |
| ---------------------------- | --------------------------------------------------------------------- |
| `/admin/preview`             | Screen list. Administrators only.                                     |
| `/admin/preview/<screen-id>` | One of the 27 screens. Any other value is a 404 for an administrator. |

- The proxy already sends anonymous visitors for any `/admin/*` path to `/login?next=<path>`, including unknown screen names, so a visitor learns nothing about which screens exist.
- Each page calls `requireAdministrator()` before it renders anything, so a signed-in learner is turned away even if the proxy were bypassed.
- `layout.tsx` marks the area `noindex, nofollow`. The preview is not in the sitemap or `robots.txt`.
- Screens are listed with `generateStaticParams` and `dynamicParams = false`.

## Code map

All paths are under `apps/pipstart/src/`.

| Path                                                | Purpose                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app/admin/preview/`                                | Route files and the noindex layout                                                             |
| `components/admin-preview/registry.tsx`             | The 27 screens: id, number, role, navigation state, note, the later patch that makes each live |
| `components/admin-preview/shell.tsx`                | Header, role-based sidebar, phone tab bar, preview bar, dialog handling                        |
| `components/admin-preview/primitives.tsx`           | Buttons, badges, panels, fields, tables, tabs, dialog and the other shared parts               |
| `components/admin-preview/icons.tsx`                | The icon set (constant SVG paths only)                                                         |
| `components/admin-preview/screens/*.tsx`            | Screen bodies, grouped as in the mock-ups                                                      |
| `components/admin-preview/admin-preview.module.css` | All styles, as one CSS module scoped to `.root`                                                |

## Design tokens

Colours, type and spacing match the approved mock-ups and the existing PipStart site: Inter for text, Manrope for headings (the site's existing `next/font` variables), teal accent, 12px panel radius, 64px header.

One deliberate difference from the mock-ups: secondary text is `#5b6678`, not `#667085`. The mock-up colour measured 4.38:1 on the grey step-list background, below the WCAG AA minimum of 4.5:1 that PipStart works to. The new colour measures 4.7:1 or better on every background used.

One addition to the mock-ups: a slim "Design preview · sample data only" bar under the header, with links to the screen list and the previous and next screen. It makes it impossible to mistake a preview page for a live tool. Later patches remove it from each screen as that screen goes live.

## Responsive rules

- 768px and wider: sidebar plus content, with two- and three-column grids as in the mock-ups. Checked at 768, 1024 and 1440.
- Under 768px: the sidebar is replaced by the five-item tab bar (Overview, Content, People, Partners, More); tables become labelled cards; two-column layouts stack; the preview bar wraps.
- 320px: no horizontal page scrolling on any screen. Wide tables scroll inside their own container only where a grid cannot become cards.

## Accessibility rules applied

- One `h1` per page. Three screens with no visible page heading (A3, A4, A5) carry a visually hidden one.
- Real elements: buttons are `<button type="button">`, choices are real checkboxes and radios, navigation is `<nav>` with a label, tables use table roles so they stay tables when drawn as cards.
- Fields are labelled, read-only, and linked to their hint or error text. Sample values cannot be edited.
- Visible `:focus-visible` outline on every control; buttons are at least 40px tall (32px for the small variant), above the WCAG 2.2 AA minimum target size of 24px.
- Dialogs use `role="dialog"` and `aria-modal`; the page behind them is `inert`.
- Icons are hidden from screen readers; the sample QR code has a text label.
- State is never shown by colour alone: every status badge carries text.

## Tests

- `components/admin-preview/admin-preview.test.tsx`: registry, markup, gate and isolation checks (37 tests).
- `e2e/milestone-22-mp01-preview.spec.ts` with `playwright.m22-mp01.config.ts`: anonymous gate checks at 1440, 390 and 320; and, when `PIPSTART_M22_ADMIN_EMAIL` and `PIPSTART_M22_ADMIN_PASSWORD` name a disposable administrator in the project given by the `PIPSTART_M13_*` variables, all 27 screens for overflow, one `h1` and WCAG 2 A/AA axe violations.

## Not in this patch

MP01's decisions, permission matrices and harness-safety work are separate deliverables. This patch contains the approved visual design only. No database change, no new permission, no new dependency.
