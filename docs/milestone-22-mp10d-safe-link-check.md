# MP10d: safe single-link check

This is a code-only patch. It implements owner decision D5 (option A) of 16 November 2026 and requires MP10a to MP10c, with the hosted migration `20261118090000` applied.

**The check is off by default.** It runs only when `PIPSTART_MAINTENANCE_PROBE_ENABLED` is `true` (together with the staff UI flag). Turning it on is a separate, observed step.

## What a staff member sees

When the check is enabled, the assignee or the Owner gets **Check a link automatically** in an item's actions:

- They enter a link exactly as it appears in the live revision.
- One check runs, and its result is recorded as an automatic (`probe`) result with short evidence, for example `HEAD 404 in 312 ms` or `HEAD 301 to other.example in 95 ms`.
- Manual checks are unchanged.

## Rules, in order

1. **The URL** must be HTTPS on port 443 with a host name (never an IP literal), with no user name or password.
   - Links that look like sign-in, reset, verify, unsubscribe or callback links are refused.
   - So are links with secret-looking query parameters (token, key, signature, code, session, password and similar). These are never checked.
2. **Staff access** is checked again for the request: Owner, Author, Reviewer, Editor, Moderator or Affiliate Manager.
3. **The store clears the check before any contact** (`pipstart_maintenance_probe_intent`, added after the 17 November audit): the caller must be allowed to act on the item, the revision must be the live one, the link must be in it, and the host must be on the Owner's allowlist and not an affiliate host. It also allows at most 20 checks per person per rolling hour, counted in the store so every server shares it. Otherwise nothing is contacted. (Before the audit fix, only the host was confirmed here, and the item was checked only when recording; see `milestone-22-audit-followup.md`.)
4. **Address checks:** the host is resolved once, and **every** address must be globally routable.
   - Refused IPv4: private, loopback, link-local, carrier-grade NAT, benchmarking, documentation, multicast and reserved ranges.
   - Refused IPv6: unspecified, loopback, IPv4-mapped and IPv4-compatible, NAT64, unique-local, link-local, site-local, multicast, Teredo and other protocol assignments, 6to4, and documentation ranges.
   - Only `2000::/3` global unicast is accepted for IPv6.
5. **The request:**
   - The TLS connection is **pinned to that checked address**, so a DNS change after the check cannot redirect it, while the certificate is still verified for the host name.
   - `HEAD` is sent first, falling back to a `GET` for one byte (`Range: bytes=0-0`) when `HEAD` is not allowed.
   - Only `User-Agent` and `Accept` headers are sent: no cookies or credentials.
   - Redirects are reported (with the target host) and never followed.
   - The body is never read, response headers are capped at 16 KB, and one 8-second deadline covers DNS (itself capped at 3 seconds), the connection, the headers and the HEAD-to-GET fallback. When it expires, the real request is aborted. (Before the audit fix the 8 seconds was only a socket inactivity timer.)
   - One check runs at a time per server.
6. **Classification:**
   - 2xx: ok;
   - 3xx: redirect;
   - 401 or 403: forbidden;
   - 404: not found;
   - 410: gone;
   - 429: throttled;
   - 408, 504 or no reply: timeout;
   - DNS failure, refusal, a non-public address, another status or a connection failure: unreachable.
7. **Recording:** the result is recorded once on the staff member's own session. The store re-checks the allowlist, the affiliate rule and that the link is in the live revision.
   - If recording fails after the check, the outcome is reported as uncertain and is never re-sent.

## Proof

- **Unit tests:**
  - 16 URL refusals and 3 acceptances;
  - 31 non-public addresses refused, and 7 public ones accepted;
  - status classification;
  - no connection when any resolved address is non-public;
  - the connection pinned to the first checked address after a single resolution, with only the two headers;
  - the `HEAD` to ranged `GET` fallback;
  - a redirect reported and not followed;
  - timeouts, refused connections and DNS failures, without throwing;
  - the flag off by default;
  - malformed input refused before Auth;
  - Administrators refused with no call;
  - a host not allowed by the store is never contacted;
  - exactly one check and one recorded result;
  - recording refusals mapped and never re-sent;
  - one check at a time.
- **The real TLS transport** (`node:https` with the pinned `lookup`) is not exercised against the network here. Enabling the flag and checking one allowlisted link is part of the MP10e hosted walkthrough.
- **Full checks:** formatting, lint, both typechecks, all tests, the production build and the public-bundle scan.
