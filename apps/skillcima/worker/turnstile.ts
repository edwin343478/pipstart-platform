const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileSiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

type TurnstileVerificationResult =
  | {
      status: "verified";
    }
  | {
      status: "failed";
      errorCodes: string[];
    }
  | {
      status: "unavailable";
    };

interface VerifyTurnstileOptions {
  secret: string;
  token: string;
  remoteIp?: string;
  idempotencyKey: string;
}

export async function verifyTurnstile({
  secret,
  token,
  remoteIp,
  idempotencyKey,
}: VerifyTurnstileOptions): Promise<TurnstileVerificationResult> {
  try {
    const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
        idempotency_key: idempotencyKey,
      }),
    });

    if (!response.ok) {
      return {
        status: "unavailable",
      };
    }

    const result = (await response.json()) as TurnstileSiteverifyResponse;

    if (!result.success) {
      return {
        status: "failed",
        errorCodes: result["error-codes"] ?? [],
      };
    }

    return {
      status: "verified",
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}
