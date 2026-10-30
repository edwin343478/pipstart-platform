// PostgreSQL's canonical jsonb text, reproduced exactly so a body's SHA-256 can be computed
// before import and compared with the store's own `body_sha256`. jsonb orders object keys
// by byte length, then bytewise; prints ", " and ": " separators; escapes like JSON. Only
// JSON-safe values are supported: finite numbers printed by JSON.stringify, no undefined.
const utf8 = new TextEncoder();

function compareKeys(a: string, b: string) {
  const left = utf8.encode(a),
    right = utf8.encode(b);
  if (left.length !== right.length) return left.length - right.length;
  for (let i = 0; i < left.length; i++)
    if (left[i] !== right[i]) return left[i] - right[i];
  return 0;
}

export function jsonbText(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value) || /e/i.test(String(value)))
      throw new Error("Unsupported number for jsonb: " + value);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return "[" + value.map(jsonbText).join(", ") + "]";
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    return (
      "{" +
      entries
        .sort(([a], [b]) => compareKeys(a, b))
        .map(([k, v]) => JSON.stringify(k) + ": " + jsonbText(v))
        .join(", ") +
      "}"
    );
  }
  throw new Error("Unsupported value for jsonb: " + typeof value);
}

/** The SHA-256 the store records for this body (`encode(sha256(convert_to(body::text)))`). */
export async function jsonbSha256(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    utf8.encode(jsonbText(value)),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
