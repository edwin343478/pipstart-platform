# M21 closeout C01: outgoing response boundaries

Baseline `c7c3fa0` already passed 8-second provider and 3-second watchdog abort
signals into fetch. This patch does not claim native fetch ignored those signals.
Three external baseline probes demonstrated narrower application-contract gaps:
the account sweep accepted a provider JSON body above 16 KiB; generated watchdog
error-body cancellation remained pending after its 3-second signal aborted; and
generated optional-provider over-limit cancellation remained pending after its
8-second signal aborted. The cancellation probes are injected-stream boundary
tests, not evidence of a production attack or a measured provider outage.

## Scoped correction

A small shared outgoing response helper now covers the existing account webhook,
account sweep, optional Resend transport and Healthchecks ping. It uses one
absolute deadline across connection/headers and complete body reading, with an
explicit promise race and AbortController. Provider replies allow at most 16 KiB
and 1,024 chunks in eight seconds; watchdog replies allow 64 bytes and 32 chunks
in three seconds. Empty chunks count toward the work limit. These are tiny
acknowledgement contracts, not a general HTTP client.

Rejected HTTP responses are canceled without reading their body. Every cleanup
path cancels best-effort without awaiting a potentially non-settling callback.
Caller abort is honored, timers/listeners are removed, and a late response from a
transport that ignored abort is canceled. Event-loop suspension and an arbitrary
transport that never returns cannot be forcibly terminated by application code;
the awaited handler settles, native fetch receives abort, and no retry is added.

Accepted replies are fully buffered inside the budget before existing small
JSON/text validation runs. Actual bytes are counted; Content-Length is not trusted.
The optional UUID/content-type contract and exact watchdog `OK` body remain;
invalid UTF-8 watchdog text now fails closed. No provider payload, idempotency key,
sender, recipient, credential or alert classification changes.

A provider body timeout/limit failure remains an uncertain handoff, not permission
to send again. Existing account lease/idempotency behavior and optional manual
recovery remain. A failed watchdog ping logs the existing redacted constant and
does not change the already persisted sweep result or repeat a provider send.
No raw response bodies, bearer URLs or caught provider errors enter new logs.

## Verification and limits

Generated-stream tests cover byte/chunk boundaries, stalled headers and body,
non-restarted budgets, hanging/rejected/thrown cancellation, caller abort,
late replies and no automatic retry. Tests exercise all four actual caller paths;
a generated loopback HTTP server additionally exercises native fetch with a
stalled body. No public network, provider keys, customer fixtures or emails are
needed. Existing successful acknowledgement, signature, idempotency and watchdog
response regressions remain required. The watchdog timeout test checks actual
settlement rather than spying on a particular AbortSignal construction method.

This is source-only: no migration, scheduler/canary, worker admission/budget
change, recipient configuration, domain setup, dependency change or activation.
Receipt persistence and other database calls are not covered by this outgoing
helper. Current account DB bounds remain separate. Optional sending stays OFF;
campaign activation prerequisites remain deferred, not silently declared fixed.

After application, run the existing commit/release workflow and require exact
candidate CI plus deployment evidence. This patch alone is not production delivery
proof and does not close the whole audit.

Next closeout package: **C02 - monitoring diagnostics**. Remaining packages after
C01: C02 diagnostics; C03 current privacy/operations; C04 preferences accessibility;
C05 final report reconciliation and verified default-off handover. C01 is not
called applied until the owner executes its guarded apply command.
