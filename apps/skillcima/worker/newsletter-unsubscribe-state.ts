import type { SupabaseEnv } from "./supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

type PrepareDatabaseStatus =
  | "prepared"
  | "already_prepared"
  | "not_found"
  | "invalid_grant"
  | "token_mismatch"
  | "token_conflict"
  | "unavailable";

interface PrepareRpcRow {
  result_status: PrepareDatabaseStatus;
  result_lead_id: string | null;
  result_enrolment_id: string | null;
  result_consent_event_id: string | null;
  result_prepared_at: string | null;
}

type WithdrawalDatabaseStatus =
  | "withdrawn"
  | "already_withdrawn"
  | "not_found"
  | "stale"
  | "invalid_token_state"
  | "invalid_consent_state";

interface WithdrawalRpcRow {
  result_status: WithdrawalDatabaseStatus;
  result_lead_id: string | null;
  result_enrolment_id: string | null;
  result_grant_consent_event_id: string | null;
  result_withdrawal_consent_event_id: string | null;
  result_withdrawn_at: string | null;
}

export interface PrepareNewsletterUnsubscribeTokenInput {
  consentEventId: string;
  tokenHash: string;
}

export interface NewsletterWithdrawalEvidence {
  privacyNoticeVersion: string;
  consentWording: string;
  consentWordingVersion: string;
  landingPageVersion: string;
}

export type PrepareNewsletterUnsubscribeTokenResult =
  | {
      status: "prepared" | "already_prepared";
      leadId: string;
      enrolmentId: string;
      consentEventId: string;
      preparedAt: string;
    }
  | {
      status: "invalid_grant";
      leadId: string;
      enrolmentId: string | null;
      consentEventId: string;
    }
  | {
      status: "token_mismatch";
      leadId: string;
      enrolmentId: string | null;
      consentEventId: string;
      preparedAt: string;
    }
  | {
      status: "token_conflict";
      leadId: string;
      enrolmentId: string | null;
      consentEventId: string;
    }
  | {
      status: "not_found";
    }
  | {
      status: "invalid_consent_event_id" | "invalid_token_hash";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

export type WithdrawNewsletterByTokenResult =
  | {
      status: "withdrawn" | "already_withdrawn";
      leadId: string;
      enrolmentId: string;
      grantConsentEventId: string;
      withdrawalConsentEventId: string;
      withdrawnAt: string;
    }
  | {
      status: "stale" | "invalid_token_state";
      leadId: string;
      enrolmentId: string;
      grantConsentEventId: string;
    }
  | {
      status: "invalid_consent_state";
      leadId: string;
      enrolmentId: string;
      grantConsentEventId: string;
      latestConsentEventId: string | null;
    }
  | {
      status: "not_found";
    }
  | {
      status: "invalid_token";
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

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isNullableUuid(value: unknown): value is string | null {
  return value === null || isUuid(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isPrepareStatus(value: unknown): value is PrepareDatabaseStatus {
  return (
    value === "prepared" ||
    value === "already_prepared" ||
    value === "not_found" ||
    value === "invalid_grant" ||
    value === "token_mismatch" ||
    value === "token_conflict" ||
    value === "unavailable"
  );
}

function isWithdrawalStatus(
  value: unknown,
): value is WithdrawalDatabaseStatus {
  return (
    value === "withdrawn" ||
    value === "already_withdrawn" ||
    value === "not_found" ||
    value === "stale" ||
    value === "invalid_token_state" ||
    value === "invalid_consent_state"
  );
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return bytesToHex(digest);
}

async function callRpc(
  configuration: SupabaseConfiguration,
  functionName: string,
  body: Record<string, unknown>,
): Promise<
  | {
      status: "ok";
      body: unknown;
      httpStatus: number;
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    }
> {
  const url = new URL(
    `${configuration.url}/rest/v1/rpc/${functionName}`,
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
      body: JSON.stringify(body),
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

  try {
    return {
      status: "ok",
      body: (await response.json()) as unknown,
      httpStatus: response.status,
    };
  } catch {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }
}

function getSingleRow(body: unknown): Record<string, unknown> | null {
  if (!Array.isArray(body) || body.length !== 1) {
    return null;
  }

  const row = body[0];

  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }

  return row as Record<string, unknown>;
}

export async function prepareNewsletterUnsubscribeToken(
  env: SupabaseEnv,
  input: PrepareNewsletterUnsubscribeTokenInput,
): Promise<PrepareNewsletterUnsubscribeTokenResult> {
  if (!isUuid(input.consentEventId)) {
    return {
      status: "invalid_consent_event_id",
    };
  }

  if (!TOKEN_PATTERN.test(input.tokenHash)) {
    return {
      status: "invalid_token_hash",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const rpc = await callRpc(
    configuration,
    "skillcima_prepare_newsletter_unsubscribe_token",
    {
      p_consent_event_id: input.consentEventId,
      p_token_hash: input.tokenHash,
    },
  );

  if (rpc.status !== "ok") {
    return rpc;
  }

  const row = getSingleRow(rpc.body);

  if (!row || !isPrepareStatus(row.result_status)) {
    return {
      status: "unavailable",
    };
  }

  if (row.result_status === "unavailable") {
    return {
      status: "unavailable",
    };
  }

  if (row.result_status === "not_found") {
    return {
      status: "not_found",
    };
  }

  if (
    !isUuid(row.result_lead_id) ||
    !isNullableUuid(row.result_enrolment_id) ||
    !isUuid(row.result_consent_event_id)
  ) {
    return {
      status: "unavailable",
    };
  }

  if (row.result_status === "invalid_grant") {
    return {
      status: "invalid_grant",
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      consentEventId: row.result_consent_event_id,
    };
  }

  if (row.result_status === "token_conflict") {
    return {
      status: "token_conflict",
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      consentEventId: row.result_consent_event_id,
    };
  }

  if (!isValidTimestamp(row.result_prepared_at)) {
    return {
      status: "unavailable",
    };
  }

  if (row.result_status === "token_mismatch") {
    return {
      status: "token_mismatch",
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      consentEventId: row.result_consent_event_id,
      preparedAt: row.result_prepared_at,
    };
  }

  if (!isUuid(row.result_enrolment_id)) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: row.result_status,
    leadId: row.result_lead_id,
    enrolmentId: row.result_enrolment_id,
    consentEventId: row.result_consent_event_id,
    preparedAt: row.result_prepared_at,
  };
}

export async function withdrawNewsletterByToken(
  env: SupabaseEnv,
  rawToken: string,
  evidence: NewsletterWithdrawalEvidence,
): Promise<WithdrawNewsletterByTokenResult> {
  if (typeof rawToken !== "string" || !TOKEN_PATTERN.test(rawToken)) {
    return {
      status: "invalid_token",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const tokenHash = await sha256Hex(rawToken);

  const rpc = await callRpc(
    configuration,
    "skillcima_withdraw_newsletter_by_token",
    {
      p_token_hash: tokenHash,
      p_privacy_notice_version: evidence.privacyNoticeVersion,
      p_consent_wording: evidence.consentWording,
      p_consent_wording_version: evidence.consentWordingVersion,
      p_landing_page_version: evidence.landingPageVersion,
    },
  );

  if (rpc.status !== "ok") {
    return rpc;
  }

  const row = getSingleRow(rpc.body);

  if (!row || !isWithdrawalStatus(row.result_status)) {
    return {
      status: "unavailable",
    };
  }

  if (row.result_status === "not_found") {
    return {
      status: "not_found",
    };
  }

  if (
    !isUuid(row.result_lead_id) ||
    !isUuid(row.result_enrolment_id) ||
    !isUuid(row.result_grant_consent_event_id)
  ) {
    return {
      status: "unavailable",
    };
  }

  if (
    row.result_status === "stale" ||
    row.result_status === "invalid_token_state"
  ) {
    return {
      status: row.result_status,
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      grantConsentEventId: row.result_grant_consent_event_id,
    };
  }

  if (row.result_status === "invalid_consent_state") {
    if (!isNullableUuid(row.result_withdrawal_consent_event_id)) {
      return {
        status: "unavailable",
      };
    }

    return {
      status: "invalid_consent_state",
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      grantConsentEventId: row.result_grant_consent_event_id,
      latestConsentEventId: row.result_withdrawal_consent_event_id,
    };
  }

  if (
    !isUuid(row.result_withdrawal_consent_event_id) ||
    !isValidTimestamp(row.result_withdrawn_at)
  ) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: row.result_status,
    leadId: row.result_lead_id,
    enrolmentId: row.result_enrolment_id,
    grantConsentEventId: row.result_grant_consent_event_id,
    withdrawalConsentEventId:
      row.result_withdrawal_consent_event_id,
    withdrawnAt: row.result_withdrawn_at,
  };
}
