# MP03 browser prerequisite: exact Auth/RPC origin

Real-controller run `6030db9a02db9609ffdb1bcfd2bdafca` passed all fourteen
Auth/PostgREST/controller/replay/recovery checks and removed its disposable stack.
It did not execute a browser or enforce the website's Content Security Policy.

Browser-gate preparation found that `connect-src 'self'` would block the direct
cross-origin Supabase SDK requests used by staff MFA and role management. This
was found by inspecting the installed client calls and emitted policy; it is not
reported as an observed live/hosted browser result.

The shared CSP builder now accepts an optional public Supabase URL and adds only
its exact valid HTTPS origin to connect-src. Both normal and calendar headers
receive `NEXT_PUBLIC_SUPABASE_URL`; missing/invalid configuration adds nothing.
Credentials, wildcard hosts, embedded whitespace/directives, non-root paths,
queries, fragments and non-HTTPS remote origins are refused. Only development
permits HTTP localhost/127.0.0.1 with an exact configured port. This introduces no
remote WebSocket permission, script/frame/image permission or wildcard.

Unsubscribe's stricter later override stays isolated. The existing development
WebSocket/eval and production HTTPS-upgrade rules are otherwise unchanged. This
patch does not activate staff, modify any key/environment value, grant a role,
change CORS at the provider, migrate data, send mail, commit or push. CSP is an
additional browser boundary; it does not authorize staff RPCs or replace SQL.

Preparation evidence is recorded separately: focused policy/header/controller
tests, production types, changed-file lint/format and a default-off webpack build.
Browser interaction, keyboard/axe, responsive/zoom screenshots and Owner visual
acceptance remain pending. The browser gate must retain this actual policy and
use only generated local identities on a disposable stack, without disabling CSP
or routing direct API calls through a same-origin bypass that hides the issue.

Next within MP03: apply this browser prerequisite, then isolated browser and
visual/accessibility acceptance; remaining governance/account-operation work is
still pending. This is an internal corrective bundle, not a new main package.
MP04 follows full MP03; nine main packages follow MP03.
