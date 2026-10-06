import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";

type RequestHeaders = Pick<Headers, "get">;
type ProxyEnvironment = {
  VERCEL?: string;
  PIPSTART_TRUST_PROXY_IP_HEADER?: string;
};

function networkIdentity(address: string): string | null {
  const family = isIP(address);
  if (family === 4) return address;
  if (family !== 6 || address.includes("%")) return null;
  const canonical = new URL(`http://[${address}]/`).hostname.slice(1, -1);
  // IPv4-mapped IPv6 and the equivalent IPv4 address share one budget.
  const mapped = canonical.match(/^::ffff:([a-f0-9]+):([a-f0-9]+)$/);
  if (mapped) {
    const value = parseInt(mapped[1], 16) * 65536 + parseInt(mapped[2], 16);
    return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
  }
  const [left, right] = canonical.split("::");
  const prefix = left ? left.split(":") : [];
  const suffix = right ? right.split(":") : [];
  const parts = canonical.includes("::")
    ? [
        ...prefix,
        ...Array<string>(8 - prefix.length - suffix.length).fill("0"),
        ...suffix,
      ]
    : prefix;
  // Privacy-address rotation inside one IPv6 /64 must not reset the limit.
  return `${parts
    .slice(0, 4)
    .map((part) => part.padStart(4, "0"))
    .join(":")}/64`;
}

export function getAnonymousAssessmentClientKey(
  headers: RequestHeaders,
  environment: ProxyEnvironment = {
    VERCEL: process.env.VERCEL,
    PIPSTART_TRUST_PROXY_IP_HEADER: process.env.PIPSTART_TRUST_PROXY_IP_HEADER,
  },
): string {
  // Vercel sets this header at its trusted edge. Self-hosted deployments must
  // opt in only after an ingress strips/overwrites the selected client header.
  const configured = environment.PIPSTART_TRUST_PROXY_IP_HEADER;
  const header =
    environment.VERCEL === "1"
      ? "x-vercel-forwarded-for"
      : configured === "x-forwarded-for" || configured === "x-real-ip"
        ? configured
        : null;
  const raw = header ? headers.get(header)?.trim() : null;
  // Accept exactly one literal address. A client-supplied chain is not trusted.
  const identity = raw && raw.length <= 45 ? networkIdentity(raw) : null;
  // Missing/invalid/untrusted addresses share a conservative bucket; headers,
  // user-agent strings and cookies cannot mint fresh rate-limit identities.
  const digest = createHash("sha256")
    .update(identity ?? "unattributed")
    .digest("hex");
  return `pipstart:anonymous-assessment:v2:${digest}`;
}
