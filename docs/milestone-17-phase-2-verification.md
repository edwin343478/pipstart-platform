# Milestone 17 audit follow-up — Phase 2 verification

Checkpoint: 8 October 2026, Africa/Nairobi.
Disposition: implementation and local verification passed; owner commit/push and
fresh CI pending. This is not a declaration that every original audit recommendation
has been completed.

## Repository and protected scope

Local main and remote main were both verified at
490d9de69b09b754a0b6157b5483978c7a04d64d before preparation. No staged changes existed.
The original approved Milestone 17 release remains a historical checkpoint.

The reviewed implementation consists of 18 modified tracked files and eight
intended new files. This closure package additionally adds this evidence note and
updates only the two existing status documents: 27 intended commit paths in total.
Old M15 delivery folders, local scripts/archives, generated browser artifacts,
environment files and credentials are excluded.

No approved catalogue JSON, release/review approval record, CSS, lesson MDX,
lesson URLs, reading/progress keys or approved glossary teaching text changed.
Approved coverage remains 378 entries, 380 meanings and 89 baseline lesson identities.
Introductory attribution and lesson relationship labels are the approved audit fixes,
not definition/example/caution rewrites.

The final review found no additional implementation-blocking defect in this scope.
The display allowlist reduces serialized props, not the complete server DOM.
Runtime validation covers teaching/search fields; it is not a complete provenance
schema. Static noscript HTML contains no user-input interpolation.

## Local automated evidence

The owner executed the browser correction runner against the updated dependencies.

| Check                                       | Result                                                              |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Workspace lint and type checks              | Passed                                                              |
| Unit tests                                  | 848 PipStart + 340 SkillCIMA + 11 UI + 16 validation = 1,215 passed |
| Both application builds                     | Passed                                                              |
| Production public bundles                   | 40 chunks passed draft/catalogue sentinel checks                    |
| Public browser suite                        | 48 passed; zero failed, flaky, skipped or runner errors             |
| Review browser suite                        | 48 passed; zero failed, flaky, skipped or runner errors             |
| Strict browser result verifiers             | Both passed build/source/catalogue/mode binding                     |
| Final read-only formatting review           | 995 tracked/intended-new paths passed                               |
| Git diff whitespace check                   | Passed                                                              |
| Approved integration/release verifiers      | Passed                                                              |
| Dependency-policy/browser-result self-tests | Passed rejection fixtures                                           |

The reviewing assistant did not rerun production builds or modify repository files.
It checked the supplied logs, archived JSON statistics, current source bindings,
final diffs, formatting, release contracts and verifier self-tests.

Retained owner evidence:
PipStart-M17-Browser-Correction-20261008-182511-45001a.zip

Archive SHA256:
9f0ebe382a627d95b87ba1bc25a95047cc8bfc8d691a6898b38105032efed6f6

Browser catalogue hash:
aa4de35f8aeb1ff435c7be14348b9a8526e360b65090c180d027a0b8f17a9347

Browser glossary source hash:
46f38f8da46699843912fcee94191c22a03628a446869a96d756598c6a1b2237

Public tested build ID: w-pZcVPdHI7zGUlYTYRbF.
Review tested build ID: 0fq3M1xzSFu3NHWiQYWD7.
Final public rebuilt ID: G8ZSjaTAAn2H18fiLg73i.

Current glossary source/catalogue hashes matched the successful reports during
final review. The final public rebuild has a new ID and was not browser-tested
again. Do not relabel archived reports as evidence for that build or future CI.

## Owner manual review

The owner approved desktop/mobile visuals and View more behavior, then confirmed
all the requested checks passed: keyboard navigation after expansion, 200% text
enlargement, custom text spacing, long term names, screen-reader reading order and
real mobile Safari.

These are owner-reported passes. Browser/device versions, assistive-technology
versions and independent recordings were not supplied. Automated checks do not
establish beginner comprehension, and the owner has not reported the recommended
three-to-five beginner term-finding/explanation sessions.

## Residual findings and maintenance

The raw dependency audit retains one braces advisory,
GHSA-vfj7-8cjw-p6xm. The installed local depth-limit patch and constrained policy
passed; this is not an upstream repair or a zero-advisory audit. The exception is
limited to the existing development-only Next ESLint/fast-glob/micromatch paths.
Unexpected versions, production paths, additional findings or patch/hash drift
fail the gate. The mitigation and its verification must be maintained together
until a supported upstream repair is independently verified.

Further typography/editorial redesigns, additional taught terms, measured beginner
comprehension, complete provenance schema validation and full DOM performance
optimization are outside this patch's completion claim.

Source-review/editorial ownership, supported-host production review-flag controls
and branch protection remain separate follow-ups. No hosting/account/repository
settings were changed. Noindex does not provide access control.

The optional dependency-updater helper is retained as historical tooling. It pins
the Next ecosystem; its console text also mentions sharp, whose override is supplied
by the separate workspace configuration. Do not use that message alone as proof
the sharp override was applied.

## Commit and CI closure

Use the supplied explicit scope manifest and reviewed owner-run instructions.
Do not use git add -A or include old local delivery packages. The owner performs
the documentation patch application, staging, commit and ordinary non-force push.

Fresh CI must succeed for that exact commit. Existing CI includes the constrained
dependency audit, public/review browser gates and broader M16 checks; the local
M17 run is not proof those other CI gates have passed for this commit.

After push, retain the exact commit SHA and CI run URL/result alongside this note.
Until that evidence is available, status remains local verification approved,
commit/CI closure pending. Open recommendations above remain explicit.
