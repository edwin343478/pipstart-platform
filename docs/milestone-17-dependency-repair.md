# M17 dependency repair: current status

The raw audit after the initial Next.js/sharp upgrade reported 26 development advisories. This repair constrains the available fixes to Undici 7.29.1, Vitest 4.1.11, js-yaml 4.3.2 and brace-expansion 1.1.21 / 5.0.12.

There is no available braces 3.0.4 release. Keep braces 3.0.3 and apply `patches/braces-3.0.3-depth-limit.patch` with pnpm patchedDependencies. The local patch adds a fixed 100-level brace/parenthesis parser bound and recursive-walker guards, including public AST calls. Excessively nested patterns throw a controlled SyntaxError; this intentionally rejects patterns deeper than the new limit.

Local checks passed deep-input protections and 812 ordinary-pattern comparisons with the original 3.0.3 source. These comparisons used the available local fill-range dependency; the runner verifies ordinary expansion/range behavior against the actual installed tree and runs real lint/tests/build/browser validation. No claim is made that arbitrary application callers can leave the new validation exception uncaught safely: callers handling untrusted patterns should catch syntax errors.

The raw registry audit may still flag GHSA-vfj7-8cjw-p6xm because the package version stays 3.0.3. `scripts/verify-m17-dependency-audit.mjs` requires exact patch-file/installed-source hashes, runs behavioral checks, and permits only that known advisory on the existing development-only Next ESLint/fast-glob/micromatch paths. Any other advisory, version, production path, missing patch or malformed audit response fails the gate. There is no global ignore setting. CI runs this same gate after normal tests.

**Added 17 November 2026 (M22 audit follow-up):**

- The same gate also accepts GHSA-fc5q-39xc-vjpf (picomatch <=4.0.7 ReDoS through single-branch repeated extglobs). No fixed release exists: npm lists `>=4.0.8`, which is not published.
- picomatch is accepted only:
  - at the installed 4.0.5 and 2.3.2;
  - as a development dependency;
  - on paths from the workspaces through vitest, `eslint-config-next` or `@mdx-js/rollup`.
- Those tools read glob patterns from this repository's own configuration, never from users.
- Any other version, a production path, or a different root fails.
- The script's self-test now runs on every CI invocation, with eight picomatch rejection fixtures.
- Remove the exception together with the upgrade once a fixed picomatch is adopted.

This is a locally maintained mitigation pending a verified upstream release, not a clean raw audit or an upstream fix. Re-review when braces/parent dependencies change; remove the patch and scoped policy together when a verified upstream repair is adopted. Do not remove the verification gate while retaining the audit exception.

Approved glossary content, fonts, CSS and lesson/progress identities remain unchanged.
Owner execution on 8 October 2026 passed installed patch checks, the constrained
fresh-audit gate, all 1,215 workspace unit tests, lint/type checks, both-app builds
and 48 public plus 48 review production browser cases. The raw audit retained one
braces advisory, as expected by the explicit scoped mitigation policy. Final
read-only review and owner visual/accessibility approval also passed. Commit/push
and fresh CI for the exact follow-up commit remain pending Phase 2 requirements.
See `milestone-17-phase-2-verification.md` for retained local evidence. This note supersedes the handoff report's proposed-but-unavailable braces 3.0.4 target; retain that report as historical execution evidence.

Sources:

- https://github.com/micromatch/braces/issues/70
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://pnpm.io/cli/patch
