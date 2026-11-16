import "server-only";
import { lookup as dnsLookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { canOpenMaintenance, contentId } from "./maintenance-contract";

// M22 MP10d (owner decision D5, option A): one staff-clicked check of one URL. Off unless
// PIPSTART_MAINTENANCE_PROBE_ENABLED is "true". Only HTTPS on port 443, no credentials, never a
// token/reset/unsubscribe-looking link; the store must confirm the host is on the Owner allowlist and
// is not an affiliate host. Every resolved address must be public; the connection is then pinned to
// the checked address (a DNS change after the check cannot redirect it) while TLS still verifies the
// host name. HEAD, falling back to a one-byte ranged GET; no redirects followed, no cookies, the body
// is never read, one overall deadline, one check at a time per server. The result is recorded as a
// "probe" result on the staff member's own session.

export type ProbeClassification =
  | "ok"
  | "not_found"
  | "gone"
  | "redirect"
  | "forbidden"
  | "throttled"
  | "timeout"
  | "unreachable";
export type ProbeOutcome = {
  classification: ProbeClassification;
  evidence: string;
};
export type ProbeResult =
  | { kind: "checked"; classification: ProbeClassification; evidence: string }
  | {
      kind:
        | "disabled"
        | "invalid"
        | "denied"
        | "unavailable"
        | "not-allowed"
        | "busy"
        | "conflict"
        | "uncertain";
    };

export type Resolved = { address: string; family: 4 | 6 };
export type SendInput = {
  url: URL;
  address: string;
  family: 4 | 6;
  method: "HEAD" | "GET";
  headers: Record<string, string>;
  timeoutMs: number;
};
export type ProbeDeps = {
  resolve: (host: string) => Promise<Resolved[]>;
  send: (
    input: SendInput,
  ) => Promise<{ status: number; location: string | null }>;
  now: () => number;
};

const DEADLINE_MS = 8000;
const RISKY_PATH =
  /\/(unsubscribe|reset|password|verify|confirm|login|logout|signin|signup|oauth|callback)(\/|$)/i;
const RISKY_PARAM =
  /^(token|access_token|refresh_token|id_token|key|api[_-]?key|sig|signature|auth|code|session|sid|password|secret|otp|nonce|state)$/i;

/** HTTPS on 443, a lowercase host name (never an IP literal), no credentials, no secret-looking parts. */
export function checkableUrl(value: unknown): URL | null {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\s\u0000-\u001f\u007f]/.test(value)
  )
    return null;
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return null;
  }
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    (u.port !== "" && u.port !== "443") ||
    isIP(u.hostname.replace(/^\[|\]$/g, "")) !== 0 ||
    !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      u.hostname,
    ) ||
    RISKY_PATH.test(u.pathname) ||
    [...u.searchParams.keys()].some((k) => RISKY_PARAM.test(k))
  )
    return null;
  return u;
}

function v4(a: string): number[] | null {
  const p = a.split(".");
  if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || Number(x) > 255))
    return null;
  return p.map(Number);
}
function publicV4([a, b, c]: number[]): boolean {
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}
/** The eight 16-bit groups of an IPv6 address (with an embedded IPv4 tail allowed), or null. */
function v6(a: string): number[] | null {
  let s = a.toLowerCase();
  const tail = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s);
  if (tail) {
    const q = v4(tail[1]);
    if (!q) return null;
    s =
      s.slice(0, -tail[1].length) +
      ((q[0] << 8) | q[1]).toString(16) +
      ":" +
      ((q[2] << 8) | q[3]).toString(16);
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const part = (x: string) => (x === "" ? [] : x.split(":"));
  const head = part(halves[0]),
    rest = halves.length === 2 ? part(halves[1]) : [];
  const missing = 8 - head.length - rest.length;
  if (
    (halves.length === 1 && missing !== 0) ||
    (halves.length === 2 && missing < 1)
  )
    return null;
  const groups = [
    ...head,
    ...Array(halves.length === 2 ? missing : 0).fill("0"),
    ...rest,
  ];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g)))
    return null;
  return groups.map((g) => parseInt(g, 16));
}
/** Only globally routable unicast addresses; everything private, local, reserved or mapped is refused. */
export function publicAddress(address: string): boolean {
  const kind = isIP(address);
  if (kind === 4) {
    const q = v4(address);
    return !!q && publicV4(q);
  }
  if (kind !== 6) return false;
  const g = v6(address);
  if (!g) return false;
  if (g.slice(0, 6).every((x) => x === 0)) return false; // ::, ::1, IPv4-compatible
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return false; // IPv4-mapped
  if (g[0] === 0x64 && g[1] === 0xff9b) return false; // NAT64
  if (g[0] < 0x2000 || g[0] > 0x3fff) return false; // only 2000::/3 global unicast
  if (g[0] === 0x2001 && g[1] < 0x0200) return false; // 2001::/23 protocol assignments (Teredo etc.)
  if (g[0] === 0x2001 && g[1] === 0x0db8) return false; // documentation
  if (g[0] === 0x2002) return false; // 6to4
  if (g[0] === 0x3fff && g[1] < 0x1000) return false; // 3fff::/20 documentation
  return true;
}

export function classifyStatus(status: number): ProbeClassification {
  if (status >= 200 && status < 300) return "ok";
  if (status >= 300 && status < 400) return "redirect";
  if (status === 401 || status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 410) return "gone";
  if (status === 429) return "throttled";
  if (status === 408 || status === 504) return "timeout";
  return "unreachable";
}

/** The real transport: one TLS connection pinned to the checked address; the body is never read. */
export const realProbeDeps: ProbeDeps = {
  resolve: async (host) =>
    (await dnsLookup(host, { all: true, verbatim: true })).map((r) => ({
      address: r.address,
      family: r.family === 6 ? 6 : 4,
    })),
  send: ({ url, address, family, method, headers, timeoutMs }) =>
    new Promise((resolve, reject) => {
      const req = httpsRequest(
        {
          protocol: "https:",
          hostname: url.hostname,
          servername: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method,
          headers,
          agent: false,
          maxHeaderSize: 16384,
          lookup: (_host, options, callback) => {
            const cb = callback as (...args: unknown[]) => void;
            if ((options as { all?: boolean }).all)
              cb(null, [{ address, family }]);
            else cb(null, address, family);
          },
        },
        (res) => {
          const location =
            typeof res.headers.location === "string"
              ? res.headers.location
              : null;
          res.destroy();
          resolve({ status: res.statusCode ?? 0, location });
        },
      );
      req.setTimeout(timeoutMs, () => req.destroy(new Error("ETIMEDOUT")));
      req.on("error", reject);
      req.end();
    }),
  now: () => Date.now(),
};

let active = 0;
/** One bounded check of one already-validated URL. Never throws. */
export async function probeUrl(
  url: URL,
  deps: ProbeDeps,
): Promise<ProbeOutcome> {
  const started = deps.now();
  const left = () => Math.max(1, DEADLINE_MS - (deps.now() - started));
  let resolved: Resolved[];
  try {
    resolved = await Promise.race([
      deps.resolve(url.hostname),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ETIMEDOUT")), 3000),
      ),
    ]);
  } catch (e) {
    return (e as Error).message === "ETIMEDOUT"
      ? { classification: "timeout", evidence: "DNS lookup timed out" }
      : { classification: "unreachable", evidence: "DNS lookup failed" };
  }
  if (!resolved.length || resolved.some((r) => !publicAddress(r.address)))
    return {
      classification: "unreachable",
      evidence: "Not contacted: the host resolves to a non-public address",
    };
  const target = resolved[0];
  const headers = { "User-Agent": "PipStart-LinkCheck/1.0", Accept: "*/*" };
  const send = (method: "HEAD" | "GET", extra: Record<string, string> = {}) =>
    deps.send({
      url,
      address: target.address,
      family: target.family,
      method,
      headers: { ...headers, ...extra },
      timeoutMs: left(),
    });
  try {
    let method: "HEAD" | "GET" = "HEAD";
    let reply = await send("HEAD");
    if (reply.status === 405 || reply.status === 501) {
      method = "GET";
      reply = await send("GET", { Range: "bytes=0-0" });
    }
    const classification = classifyStatus(reply.status);
    let note = "";
    if (classification === "redirect" && reply.location) {
      try {
        note = " to " + new URL(reply.location, url).host;
      } catch {
        note = " (unreadable location)";
      }
    }
    return {
      classification,
      evidence: `${method} ${reply.status}${note} in ${deps.now() - started} ms`,
    };
  } catch (e) {
    const code = String(
      (e as { code?: string; message?: string }).code ??
        (e as Error).message ??
        "error",
    ).slice(0, 40);
    return code === "ETIMEDOUT"
      ? {
          classification: "timeout",
          evidence: `No reply within ${DEADLINE_MS} ms`,
        }
      : {
          classification: "unreachable",
          evidence: `Connection failed (${code.replace(/[^A-Za-z0-9_]/g, "")})`,
        };
  }
}

const codes: Record<string, "conflict" | "denied" | "invalid"> = {
  PT409: "conflict",
  "42501": "denied",
  "22023": "invalid",
};

/** The staff-clicked check: allowlist confirmed by the store, one probe, result recorded once. */
export async function runMaintenanceProbe(
  client: SupabaseClient,
  input: unknown,
  deps: ProbeDeps = realProbeDeps,
): Promise<ProbeResult> {
  if (
    process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true" ||
    process.env.PIPSTART_MAINTENANCE_PROBE_ENABLED !== "true"
  )
    return { kind: "disabled" };
  const v = input as Record<string, unknown> | null;
  if (
    !v ||
    typeof v !== "object" ||
    Object.keys(v).sort().join(",") !== "id,reference,revision" ||
    !contentId(v.id) ||
    !Number.isSafeInteger(v.revision) ||
    (v.revision as number) < 1 ||
    !checkableUrl(v.reference)
  )
    return { kind: "invalid" };
  const id = v.id as string,
    revision = v.revision as number,
    reference = v.reference as string,
    url = checkableUrl(reference)!;
  const call = (fn: string, args: object) =>
    client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000));
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!canOpenMaintenance(live.access)) return { kind: "denied" };
    const allowed = await call("pipstart_maintenance_check_allowed", {
      p_url: reference,
    });
    if (allowed.error)
      return { kind: codes[allowed.error.code ?? ""] ?? "unavailable" };
    if (allowed.data !== true) return { kind: "not-allowed" };
    if (active > 0) return { kind: "busy" };
    active++;
    let outcome: ProbeOutcome;
    try {
      outcome = await probeUrl(url, deps);
    } finally {
      active--;
    }
    sent = true;
    const recorded = await call("pipstart_maintenance_record_result", {
      p_item: id,
      p_expected_revision: revision,
      p_reference: reference,
      p_source: "probe",
      p_classification: outcome.classification,
      p_evidence: outcome.evidence,
    });
    if (recorded.error)
      return { kind: codes[recorded.error.code ?? ""] ?? "uncertain" };
    return { kind: "checked", ...outcome };
  } catch {
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
