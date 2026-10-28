# MP03: paused-Owner authorization and dormant provider bridge

This bounded bundle connects fresh operation-specific MFA proof to the private
journal for staff Auth suspension/resumption and read-only uncertainty inspection.
It adds no endpoint, UI wiring, production operator transport, scheduler, factor
removal, retirement executor, service-role dispatch grant or activation.

The public receipt issuer requires a real authenticated AAL2 JWT, an active Owner,
a live verified TOTP session/factor, matching fresh provider AMR and paused staff
control. Editable metadata, a service key, AAL1 and delegated Administrator access
cannot authorize this path. Each verification second can issue one receipt globally.
Request and mode are bound; dispatch and inspection require separate verification.
The target/action/expiry come from the existing immutable operator-reviewed journal,
not the browser. Self-targeting and factor-recovery/retirement execution are refused.
Suspension dispatch has a 365-day transport ceiling, not an automatic policy.

The operator-only take primitive rechecks Owner/session/factor/ban state and exact
provider verification, then consumes the receipt and claims the dispatch in one
transaction. Failed claim/event append rolls consumption back. A service key alone
cannot call it or read private tables. This is not a fresh-MFA bypass while paused:
only this narrow maintenance receipt path works; ordinary staff access stays closed.
A separate hosted approval/migration and exact-account recovery procedure remain
necessary. The current installed SDK has no recovery-code API.

The server-only adapter is disabled unless PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED
is exactly true. No caller or production transport is connected by this patch.
Its private journal port must call the reviewed operator-only SQL primitives;
never replace this with a browser/service-key endpoint or accept posted actor IDs.
The adapter takes an exact durable permit before one bounded SDK update. It records
known acknowledgment versus uncertainty and never retries a provider call, claim
or result append automatically. A timed-out call may still complete remotely.
The existing environment flag is neither changed nor supplied by source apply.

Only getUserById is used for inspection. Observed desired state is not proof that
the earlier request caused it, nor proof that in-flight remote work is finished.
Inspection never changes an operation to resolved or re-enables staff. Unknown or
dispatched operations continue to block activation; an operator must review exact
provider evidence and outstanding work before a terminal journal resolution.

GoTrue accepts ban_duration, so a suspension acknowledgment may differ by up to
15 seconds from the reviewed absolute expiry. Resume uses the installed SDK's
none value. Provider JSON is minimized to state comparisons; emails, metadata,
passwords, raw errors and tokens are not returned or logged. Ban expiry is not
session invalidation: the staff actor gate now checks live banned_until, so an
older valid token cannot retain protected staff privileges while its account is
banned. Learner session policy is not changed by this gate.

## Evidence and remaining gates

The migration checks the accepted prior actor body fingerprint (CRLF normalized)
and provider banned_until column before replacing the staff actor function. Source
application runs no SQL or provider operation. The SQL suite uses rolled-back
Auth/session/AMR fixtures in a marked disposable database only; it is prepared,
not evidence of real MFA or provider API behavior. Unit tests use SDK/journal mocks.
Types/lint do not establish real Auth/PostgREST/controller integration acceptance.

Before publication: isolated SQL, real local Owner/other-role MFA/API proof,
revocation and banned-token checks, controlled provider suspension/resumption and
lost-response read-only inspection must pass on generated fixtures. Complete-loss
and only-Owner recovery still require separately reviewed offline identity checks,
backup-factor/session rehearsal and audit. No real account operation, provider
flag, hosted migration, bootstrap, activation, commit or push is authorized by
source preparation or application.

Next within MP03: isolated bridge SQL and real Auth/provider acceptance, then
complete the offline factor-recovery and retirement/recovery procedure. Nine main
packages follow full MP03; MP04 remains revision storage and adapters.
