# Shared UI component catalogue

This package is the shared accessibility and interaction layer for PipStart and SkillCIMA. Product-specific CSS Modules may be supplied through `className` while the primitive retains its semantic contract.

| Component      | Supported states and variants                                              |
| -------------- | -------------------------------------------------------------------------- |
| `Button`       | primary/secondary; small/medium/large; full-width; disabled; focus-visible |
| `Link`         | default/muted/standalone; hover; focus-visible                             |
| `Card`         | padded/unpadded; composable `asChild` rendering                            |
| `Alert`        | info/success/warning/error; optional title; polite/urgent live roles       |
| `Badge`        | neutral/accent/warning                                                     |
| `ProgressBar`  | bounded values; accessible label                                           |
| `FormField`    | description; required; validation error                                    |
| `Input`        | normal/error; disabled; read-only; focus                                   |
| `Checkbox`     | checked/unchecked; description; error; disabled                            |
| `Radio`        | checked/unchecked; description; error; disabled                            |
| `Tabs` / `Tab` | selected/unselected; controlled panel relationship; keyboard-focusable     |
| `Accordion`    | open/closed native disclosure                                              |
| `Modal`        | open/closed; labelled dialog; close control                                |
| `RiskNotice`   | optional title; semantic note                                              |
| `EmailCapture` | normal/submitting/success/error                                            |
| `PageState`    | loading/empty/error; appropriate live-region behavior                      |

## Adoption rules

1. Use these primitives for new interactive controls and repeated state patterns.
2. Preserve product styling with `className`; do not duplicate semantic or ARIA behavior in page code.
3. Use Next.js `Link` for application routing. `Card asChild` can apply shared card behavior to a linked card without introducing invalid nested interactive elements.
4. Add component tests for every new state and an application-level adoption test for each migration slice.
