# MP03: own-account deletion safety

Adds an own-account eligibility RPC and a server-only guard after existing typed
confirmation and password reauthentication. This is one bounded part of account
safeguards, not completion of remote administration, retirement or MFA recovery.

Current and former staff history blocks ordinary self-service Auth deletion even
when staff control is disabled or no roles remain. The user is directed to
support@pipstart.net for reviewed staff retirement and deletion handling. The RPC
accepts no target and returns only the caller ID and eligibility status after a
matching live Auth session check. AAL1 suffices for this read; no staff privilege
or authority comes from it. The original staff RESTRICT FK is unchanged and
remains the final race guard if membership is added after the eligibility read.

The server verifies current identity again, accepts only an exact same-user reply
and dispatches deletion once. Missing migration, privilege, schema/provider errors
or malformed responses fail closed before deletion. An unconfirmed remote result
shows uncertainty/support guidance; no automatic resend or false success. This
is not a durable operation ledger or a guarantee against manually repeated calls.
No raw provider errors, secrets or passwords enter the result or new audit data.

## Rollout

Source application executes no SQL. The additive eligibility migration must be
applied and accepted before publishing this action. Until then, deletion fails
closed for all users. Preparation touches no local/hosted application databases.
SQL tests are rolled-back generated fixtures for a marked disposable DB only.
Unit/controller tests do not establish real Auth/PostgREST deletion or hosted
compatibility. The existing staff FK is not bypassed and audit is not purged.
A deletion request is not permanently denied: audited retirement/anonymization
and retention handling remain required; this is not compliance certification.

Next within MP03: isolated SQL and real Auth refusal/deletion acceptance, then
remote account-operation intents, retirement and recovery. Nine main packages
follow full MP03. MP04 remains revision storage and adapters.
