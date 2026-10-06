# M16-H5 runtime security

Baseline: fe40968a2a52e66187f2c6a11d0b170a2296516a (approved H4).

## Anonymous assessment budget

Anonymous Forex and Crypto grading still uses the existing service-role-only atomic PostgreSQL RPC, with 20 requests per 60 seconds. No database migration or learning-record change is needed. Distributed application workers use the same database bucket. Missing service credentials, RPC errors and all responses other than literal boolean true reject grading.

The client key no longer includes user-agent or cookies. Changing these values cannot renew the budget. IPv4-mapped IPv6 equals the corresponding IPv4 address; IPv6 addresses in one /64 share the budget to limit privacy-address rotation. The application sends a versioned SHA-256 identity digest; it does not send raw address or user-agent data to the RPC. Existing database rows use the established hashed primary key and cleanup policy. The change starts a new versioned bucket once on deployment; no historical learner data changes.

### Ingress trust

On Vercel (`VERCEL=1`), only the platform-set `x-vercel-forwarded-for` header is accepted. The ordinary client-supplied x-forwarded-for and x-real-ip headers cannot override it.

For self-hosting, `PIPSTART_TRUST_PROXY_IP_HEADER` may explicitly select `x-forwarded-for` or `x-real-ip`. Configure this only when the public ingress strips/overwrites that header and direct access bypassing the ingress is blocked. Exactly one literal address is accepted; forwarded chains, hostnames, ports and malformed values fall back to the unattributed bucket. Other configuration values do not enable trust. This patch does not edit environment files or assume a deployment topology.

With no trusted ingress configured, all anonymous requests share a conservative 20/minute unattributed bucket. This prevents spoofed identities from bypassing the application budget, but a busy self-hosted installation needs its verified ingress configured before launch to avoid throttling unrelated learners. Local review/browser gates work without changing environment files. Authenticated attempt creation, draft saving, submitting, result restore and history are unchanged.

Application limits cannot prevent distributed attacks using many real networks; edge/network-level abuse controls remain a deployment responsibility. No claim of complete DDoS prevention is made.

## Enforced Content Security Policy

The policy now uses Content-Security-Policy rather than report-only. It blocks foreign scripts, cross-origin connections, frames, plugins, arbitrary base URLs and cross-origin form submissions. Production string eval is disabled. Local fonts/images, inline hydration/JSON-LD, styles and existing static prerendering remain supported. Development only permits unsafe-eval and WebSocket connections for debugging/hot reload.

`upgrade-insecure-requests` is included only for a production build configured with an HTTPS NEXT_PUBLIC_SITE_URL. Local HTTP production builds and development omit it. The ignored report-only directive and its console warning are removed.

Inline scripts/styles remain allowed to preserve approved static delivery. This is an enforced baseline CSP, not a nonce-based strict CSP and not complete inline-XSS protection. Introducing per-request nonces would require a separately reviewed rendering/cache change. Permissions-Policy, Referrer-Policy, nosniff, frame denial and disabled powered-by disclosure remain intact. Neither headers nor rate-limit logic modifies lesson typography or layout.

## Release gates

- Unit tests cover ingress provenance, malformed addresses, IPv6 normalization, cookie/user-agent rotation, literal RPC allowance, failures, and production/development CSP differences.
- The actual Supabase verification makes 25 concurrent calls with a random test-only daily bucket and requires exactly 20 allowed / 5 rejected, then verifies anonymous direct RPC access is denied. It changes no schema or learning records. The bucket uses existing cleanup and is distinct from learner buckets. Ordinary application windows remain 60 seconds.
- Nine browser checks assert enforced headers on Crypto, Forex, login and tools; approved lesson hydration at desktop/mobile sizes; an actually blocked foreign script; and blocked production eval.
- The existing cumulative browser command and CI run this verification plus all existing suites: 206 browser tests total. Existing 197 tests and assertions are retained.
- Authenticated release checks remain available separately through the existing H3 gate; no identity/persistence contract changes are made.

## Primary documentation

- https://nextjs.org/docs/app/guides/content-security-policy
- https://nextjs.org/docs/pages/api-reference/config/next-config-js/headers
- https://vercel.com/docs/headers/request-headers
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For

Reviewed for H5 on 2026-10-06. A self-hosted header must never be trusted solely because the client supplied it.
