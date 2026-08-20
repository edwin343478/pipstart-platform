const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONFIRMATION_TOKEN_NAMESPACE = "skillcima-confirmation:v1";

const MINIMUM_SECRET_BYTES = 32;

export interface ConfirmationTokenEnv {
  SKILLCIMA_CONFIRMATION_TOKEN_SECRET: string;
}

export type ConfirmationTokenResult =
  | {
      status: "ready";
      token: string;
      tokenHash: string;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "invalid_job_id";
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

export async function deriveConfirmationToken(
  env: ConfirmationTokenEnv,
  jobId: string,
): Promise<ConfirmationTokenResult> {
  if (!UUID_PATTERN.test(jobId)) {
    return {
      status: "invalid_job_id",
    };
  }

  const secret = env.SKILLCIMA_CONFIRMATION_TOKEN_SECRET?.trim();

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

  const message = `${CONFIRMATION_TOKEN_NAMESPACE}:${jobId}`;

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
