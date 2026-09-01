import {
  deriveNewsletterUnsubscribeToken,
  type NewsletterUnsubscribeTokenEnv,
} from "./newsletter-unsubscribe-token";

import { prepareNewsletterUnsubscribeToken } from "./newsletter-unsubscribe-state";

import type { SupabaseEnv } from "./supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

type ActiveGrantDatabaseStatus =
  "active" | "not_found" | "not_subscribed" | "invalid_consent_state";

interface ActiveGrantRpcRow {
  result_status: ActiveGrantDatabaseStatus;
  result_lead_id: string | null;
  result_enrolment_id: string | null;
  result_grant_consent_event_id: string | null;
  result_email: string | null;
  result_first_name: string | null;
  result_granted_at: string | null;
}

export type NewsletterUnsubscribeDeliveryEnv = SupabaseEnv &
  NewsletterUnsubscribeTokenEnv & {
    SKILLCIMA_PUBLIC_ORIGIN: string;
  };

export type ActiveNewsletterGrantResult =
  | {
      status: "active";
      leadId: string;
      enrolmentId: string;
      grantConsentEventId: string;
      recipientEmail: string;
      firstName: string | null;
      grantedAt: string;
    }
  | {
      status: "not_found" | "not_subscribed" | "invalid_consent_state";
    }
  | {
      status: "invalid_lead_id";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

export type PrepareNewsletterUnsubscribeDeliveryResult =
  | {
      status: "ready";
      leadId: string;
      enrolmentId: string;
      grantConsentEventId: string;
      recipientEmail: string;
      firstName: string | null;
      grantedAt: string;
      unsubscribeUrl: string;
    }
  | {
      status:
        | "not_found"
        | "not_subscribed"
        | "invalid_consent_state"
        | "invalid_grant"
        | "token_mismatch"
        | "token_conflict";
    }
  | {
      status: "invalid_lead_id" | "invalid_public_origin";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

function getSupabaseConfiguration(
  env: SupabaseEnv,
): SupabaseConfiguration | null {
  const url = env.SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    secretKey,
  };
}

function parsePublicOrigin(value: string): URL | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const isHttps = url.protocol === "https:";

  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");

  if (!isHttps && !isLocalHttp) {
    return null;
  }

  if (url.username || url.password) {
    return null;
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url;
}

function isDatabaseStatus(value: unknown): value is ActiveGrantDatabaseStatus {
  return (
    value === "active" ||
    value === "not_found" ||
    value === "not_subscribed" ||
    value === "invalid_consent_state"
  );
}

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 3 &&
    value.length <= 254 &&
    value.includes("@")
  );
}

function isValidOptionalFirstName(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.length >= 1 && value.length <= 100)
  );
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export async function getActiveNewsletterGrant(
  env: SupabaseEnv,
  leadId: string,
): Promise<ActiveNewsletterGrantResult> {
  if (!UUID_PATTERN.test(leadId)) {
    return {
      status: "invalid_lead_id",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_get_active_newsletter_grant`,
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        p_lead_id: leadId,
      }),
    });
  } catch {
    return {
      status: "unavailable",
    };
  }

  if (!response.ok) {
    const httpStatus = response.status;

    await response.body?.cancel();

    return {
      status: "unavailable",
      httpStatus,
    };
  }

  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }

  if (!Array.isArray(body) || body.length !== 1) {
    return {
      status: "unavailable",
    };
  }

  const row = body[0];

  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {
      status: "unavailable",
    };
  }

  const candidate = row as Partial<ActiveGrantRpcRow>;

  if (!isDatabaseStatus(candidate.result_status)) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status !== "active") {
    return {
      status: candidate.result_status,
    };
  }

  if (
    typeof candidate.result_lead_id !== "string" ||
    !UUID_PATTERN.test(candidate.result_lead_id) ||
    candidate.result_lead_id !== leadId ||
    typeof candidate.result_enrolment_id !== "string" ||
    !UUID_PATTERN.test(candidate.result_enrolment_id) ||
    typeof candidate.result_grant_consent_event_id !== "string" ||
    !UUID_PATTERN.test(candidate.result_grant_consent_event_id) ||
    !isValidEmail(candidate.result_email) ||
    !isValidOptionalFirstName(candidate.result_first_name) ||
    !isValidTimestamp(candidate.result_granted_at)
  ) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: "active",
    leadId: candidate.result_lead_id,
    enrolmentId: candidate.result_enrolment_id,
    grantConsentEventId: candidate.result_grant_consent_event_id,
    recipientEmail: candidate.result_email,
    firstName: candidate.result_first_name,
    grantedAt: candidate.result_granted_at,
  };
}

export async function prepareNewsletterUnsubscribeDelivery(
  env: NewsletterUnsubscribeDeliveryEnv,
  leadId: string,
): Promise<PrepareNewsletterUnsubscribeDeliveryResult> {
  if (!UUID_PATTERN.test(leadId)) {
    return {
      status: "invalid_lead_id",
    };
  }

  const origin = parsePublicOrigin(env.SKILLCIMA_PUBLIC_ORIGIN?.trim());

  if (!origin) {
    return {
      status: "invalid_public_origin",
    };
  }

  const grant = await getActiveNewsletterGrant(env, leadId);

  if (grant.status !== "active") {
    return grant;
  }

  let tokenResult: Awaited<ReturnType<typeof deriveNewsletterUnsubscribeToken>>;

  try {
    tokenResult = await deriveNewsletterUnsubscribeToken(
      env,
      grant.grantConsentEventId,
    );
  } catch {
    return {
      status: "unavailable",
    };
  }

  if (tokenResult.status === "misconfigured") {
    return {
      status: "misconfigured",
    };
  }

  if (tokenResult.status === "invalid_consent_event_id") {
    /*
     * The consent-event ID came from the trusted database
     * read model and was already UUID validated above.
     */
    return {
      status: "unavailable",
    };
  }

  let prepared: Awaited<ReturnType<typeof prepareNewsletterUnsubscribeToken>>;

  try {
    prepared = await prepareNewsletterUnsubscribeToken(env, {
      consentEventId: grant.grantConsentEventId,
      tokenHash: tokenResult.tokenHash,
    });
  } catch {
    return {
      status: "unavailable",
    };
  }

  switch (prepared.status) {
    case "prepared":
    case "already_prepared":
      break;

    case "not_found":
      return {
        status: "not_found",
      };

    case "invalid_grant":
      return {
        status: "invalid_grant",
      };

    case "token_mismatch":
      return {
        status: "token_mismatch",
      };

    case "token_conflict":
      return {
        status: "token_conflict",
      };

    case "misconfigured":
      return {
        status: "misconfigured",
      };

    case "unavailable":
      return prepared;

    case "invalid_consent_event_id":
    case "invalid_token_hash":
      /*
       * Both inputs were produced and validated internally.
       * Treat a disagreement as an unavailable internal
       * contract rather than exposing an impossible state.
       */
      return {
        status: "unavailable",
      };
  }

  if (
    prepared.consentEventId !== grant.grantConsentEventId ||
    prepared.leadId !== grant.leadId ||
    prepared.enrolmentId !== grant.enrolmentId
  ) {
    return {
      status: "unavailable",
    };
  }

  const unsubscribeUrl = new URL("/unsubscribe", origin);

  unsubscribeUrl.searchParams.set("token", tokenResult.token);

  return {
    status: "ready",
    leadId: grant.leadId,
    enrolmentId: grant.enrolmentId,
    grantConsentEventId: grant.grantConsentEventId,
    recipientEmail: grant.recipientEmail,
    firstName: grant.firstName,
    grantedAt: grant.grantedAt,
    unsubscribeUrl: unsubscribeUrl.toString(),
  };
}
