# M21 C04: preferences accessibility

Prepared 24 October 2026 against `b49af26`. This small patch keeps the approved
layout, labels, default-ON signup choices, stored choices, action contracts and
service/security separation. No database, sending, retention or activation change.

## Changes

- Learning and partner checkboxes have concise accessible names and explicitly
  associated descriptions. React `useId` keeps the relationships unique if more
  than one fields instance is rendered in a document.
- Native frequency radios expose a named radio group. The OFF/frequency explanation
  is linked to the group and each radio; selecting Weekly never turns learning ON.
- Frequency layout keeps the same group typography/gap but no longer inherits
  text-input padding, minimum height and borders. Native radio behavior is retained.
- Preference checkboxes and frequency radios have an explicit keyboard-focus
  outline. Controls do not shrink when labels wrap. No custom switch, key handler,
  tabindex order, automatic submit or new focus trap is introduced.
- Existing form success `status`, error `alert`, pending submit disable and
  unavailable-read alert are retained rather than replaced with speculative UI.

## Acceptance and limits

Unit tests render the actual fields and check unique description/name targets,
all stored ON/OFF combinations, Weekly while OFF, registration hidden frequency,
native input types and shared markup contracts. Existing account/server action
tests remain unchanged. CSS checks guard scoped focus and native-radio layout.

The external C04 bundle includes a separate local browser gate using rendered
actual fields and actual CSS at 1440, 390 and 320 px. It checks label/description
resolution, Tab/Space/Arrow navigation, focus outline, submission values, wrapping
and an axe scan. The fixture has no account, database or provider connection.
This grades native server-rendered controls, not a signed-in save/reload, signup
hydration, real screen reader or hosted acceptance. Existing saved OFF + Weekly
owner acceptance remains historical evidence; no new hosted write is claimed.

The browser connection was unavailable during preparation. The bundle must not
claim the browser gate passed until its separate result and file fingerprints are
verified. CI and deployment must match the later published commit.

Next package: **C05 — final reconciliation**. One approved closeout package remains
after C04; future campaign activation work remains separately gated.
