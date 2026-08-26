import {
  SKILLCIMA_PRIVACY_NOTICE_VERSION,
} from "./consent";

import {
  withdrawNewsletterByToken,
  type WithdrawNewsletterByTokenResult,
} from "./newsletter-unsubscribe-state";

import type { SupabaseEnv } from "./supabase";

const MAX_UNSUBSCRIBE_BODY_BYTES = 2048;

const NEWSLETTER_WITHDRAWAL_WORDING =
  "Unsubscribe me from continuing Skillcima educational emails.";

const NEWSLETTER_WITHDRAWAL_WORDING_VERSION = "1.0.0";

const NEWSLETTER_UNSUBSCRIBE_PAGE_VERSION = "1.0.0";

interface NewsletterUnsubscribeRequestBody {
  token: string;
}

export interface NewsletterUnsubscribeRouteDependencies {
  withdrawNewsletterByToken: typeof withdrawNewsletterByToken;
}

const defaultDependencies: NewsletterUnsubscribeRouteDependencies = {
  withdrawNewsletterByToken,
};

function jsonHeaders(): Headers {
  return new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
}

function jsonResponse(
  status: number,
  body: unknown,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: jsonHeaders(),
    },
  );
}

function isJsonContentType(
  request: Request,
): boolean {
  const value = request.headers
    .get("Content-Type")
    ?.toLowerCase();

  if (!value) {
    return false;
  }

  return (
    value === "application/json" ||
    value.startsWith("application/json;")
  );
}

function isExactUnsubscribeBody(
  value: unknown,
): value is NewsletterUnsubscribeRequestBody {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const record = value as Record<
    string,
    unknown
  >;

  const keys = Object.keys(record);

  return (
    keys.length === 1 &&
    keys[0] === "token" &&
    typeof record.token === "string"
  );
}

function mapUnsubscribeResult(
  result: WithdrawNewsletterByTokenResult,
): Response {
  switch (result.status) {
    case "withdrawn":
      return jsonResponse(200, {
        ok: true,
        status: "unsubscribed",
      });

    case "already_withdrawn":
      return jsonResponse(200, {
        ok: true,
        status: "already_unsubscribed",
      });

    case "stale":
      return jsonResponse(410, {
        ok: false,
        error: {
          code: "UNSUBSCRIBE_LINK_STALE",
          message:
            "This unsubscribe link is no longer current.",
        },
      });

    case "invalid_token":
    case "not_found":
      /*
       * Do not distinguish malformed tokens from
       * unknown token values publicly.
       */
      return jsonResponse(400, {
        ok: false,
        error: {
          code: "INVALID_UNSUBSCRIBE_LINK",
          message:
            "This unsubscribe link is invalid.",
        },
      });

    case "invalid_token_state":
    case "invalid_consent_state":
      return jsonResponse(409, {
        ok: false,
        error: {
          code: "UNSUBSCRIBE_STATE_INVALID",
          message:
            "This newsletter preference cannot be changed using this link.",
        },
      });

    case "misconfigured":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "UNSUBSCRIBE_NOT_CONFIGURED",
          message:
            "Unsubscribe is temporarily unavailable. Please try again.",
        },
      });

    case "unavailable":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "UNSUBSCRIBE_UNAVAILABLE",
          message:
            "Unsubscribe is temporarily unavailable. Please try again.",
        },
      });
  }
}

export async function handleNewsletterUnsubscribeRequest(
  request: Request,
  env: SupabaseEnv,
  dependencies: NewsletterUnsubscribeRouteDependencies =
    defaultDependencies,
): Promise<Response> {
  /*
   * GET must never mutate newsletter consent.
   * This also protects against email-link scanners.
   */
  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message:
          "This endpoint only accepts POST requests.",
      },
    });
  }

  if (!isJsonContentType(request)) {
    return jsonResponse(415, {
      ok: false,
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message:
          "Content-Type must be application/json.",
      },
    });
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message:
          "The request body could not be read.",
      },
    });
  }

  if (
    new TextEncoder()
      .encode(rawBody)
      .byteLength >
    MAX_UNSUBSCRIBE_BODY_BYTES
  ) {
    return jsonResponse(413, {
      ok: false,
      error: {
        code: "REQUEST_TOO_LARGE",
        message:
          "The request body is too large.",
      },
    });
  }

  if (!rawBody.trim()) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message:
          "A JSON request body is required.",
      },
    });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_JSON",
        message:
          "The request body contains invalid JSON.",
      },
    });
  }

  if (!isExactUnsubscribeBody(parsed)) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_UNSUBSCRIBE_REQUEST",
        message:
          "The unsubscribe request is invalid.",
      },
    });
  }

  let result: WithdrawNewsletterByTokenResult;

  try {
    result =
      await dependencies.withdrawNewsletterByToken(
        env,
        parsed.token,
        {
          privacyNoticeVersion:
            SKILLCIMA_PRIVACY_NOTICE_VERSION,

          consentWording:
            NEWSLETTER_WITHDRAWAL_WORDING,

          consentWordingVersion:
            NEWSLETTER_WITHDRAWAL_WORDING_VERSION,

          landingPageVersion:
            NEWSLETTER_UNSUBSCRIBE_PAGE_VERSION,
        },
      );
  } catch {
    return jsonResponse(503, {
      ok: false,
      error: {
        code: "UNSUBSCRIBE_UNAVAILABLE",
        message:
          "Unsubscribe is temporarily unavailable. Please try again.",
      },
    });
  }

  return mapUnsubscribeResult(result);
}
