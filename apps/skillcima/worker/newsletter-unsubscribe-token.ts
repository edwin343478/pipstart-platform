const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NEWSLETTER_UNSUBSCRIBE_TOKEN_NAMESPACE =
  "skillcima-newsletter-unsubscribe:v1";

const MINIMUM_SECRET_BYTES = 32;

export interface NewsletterUnsubscribeTokenEnv {
  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET: string;
}

export type NewsletterUnsubscribeTokenResult =
  | {
      status: "ready";
      token: string;
      tokenHash: string;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "invalid_consent_event_id";
    };

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);

  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return bytesToHex(digest);
}

export async function deriveNewsletterUnsubscribeToken(
  env: NewsletterUnsubscribeTokenEnv,
  consentEventId: string,
): Promise<NewsletterUnsubscribeTokenResult> {
  if (!UUID_PATTERN.test(consentEventId)) {
    return {
      status: "invalid_consent_event_id",
    };
  }

  const secret = env.SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET?.trim();

  if (!secret) {
    return {
      status: "misconfigured",
    };
  }

  const secretBytes = new TextEncoder().encode(secret);

  if (secretBytes.byteLength < MINIMUM_SECRET_BYTES) {
    return {
      status: "misconfigured",
    };
  }

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const message = `${NEWSLETTER_UNSUBSCRIBE_TOKEN_NAMESPACE}:${consentEventId}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  const token = bytesToHex(signature);
  const tokenHash = await sha256Hex(token);

  return {
    status: "ready",
    token,
    tokenHash,
  };
}
