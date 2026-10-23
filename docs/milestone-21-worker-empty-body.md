# M21 empty worker POST compatibility

The Node adapter used by Next can expose a zero-byte POST as a non-null
ReadableStream. The former body-null guard rejected that representation before
worker admission. The controlled replacement response was HTTP 400
invalid_request, processed 0; the subsequent paused/read-only verification
reported pending, attempts 0, permit closed, worker idle and no provider evidence.

The handler now proves EOF without accepting bytes. It reads at most four chunks
with a one-second total timeout; rejects used, locked, aborted or failing streams;
and does not await cancellation. It never parses or buffers content. Method,
exact bearer authentication, forbidden headers, URL input, default-off flag,
dedicated key checks, one runtime call and response sanitization are unchanged.

Offline tests include the installed Next Node adapter and hostile stream cases,
alongside existing endpoint/runtime/route, optional-email and unsubscribe tests.
This is a compatibility correction, not evidence of a successful hosted send.

No schema migration, permit arming, recovery, secret/configuration change,
provider send, scheduler activation or campaign is included. Apply and publication
are separate owner-run steps. Existing attempt journals are retained. A further
live attempt requires fresh explicit authorization; do not rerun old commands.
The database permit remains closed. A successful build/deployment alone does not
complete the live worker acceptance or final M21 operational/privacy handover.
