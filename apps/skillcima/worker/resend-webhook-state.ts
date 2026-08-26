import type { SupabaseEnv } from "./supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_PROVIDER_IDENTIFIER_LENGTH = 200;

export type ResendDeliverabilityEventType =
  | "email.bounced"
  | "email.complained";

export interface RecordResendWebhookEventInput {
  providerEventId: string;
  eventType: ResendDeliverabilityEventType;
  providerMessageId: string;
  providerCreatedAt: string | null;
}

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

type DatabaseStatus =
  | "recorded"
  | "already_recorded"
  | "event_mismatch";

interface RpcRow {
  result_status: DatabaseStatus;
  result_event_id: string;
  result_email_job_id: string | null;
}

export type RecordResendWebhookEventResult =
  | {
      status:
        | "recorded"
        | "already_recorded"
        | "event_mismatch";
      eventId: string;
      emailJobId: string | null;
    }
  | {
      status: "invalid_input";
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
  const url =
    env.SUPABASE_URL?.trim();

  const secretKey =
    env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    secretKey,
  };
}

function normalizeProviderIdentifier(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length === 0 ||
    normalized.length >
      MAX_PROVIDER_IDENTIFIER_LENGTH
  ) {
    return null;
  }

  return normalized;
}

function isUuid(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

function isNullableUuid(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    isUuid(value)
  );
}

function isDatabaseStatus(
  value: unknown,
): value is DatabaseStatus {
  return (
    value === "recorded" ||
    value === "already_recorded" ||
    value === "event_mismatch"
  );
}

function isDeliverabilityEventType(
  value: unknown,
): value is ResendDeliverabilityEventType {
  return (
    value === "email.bounced" ||
    value === "email.complained"
  );
}

function normalizeProviderCreatedAt(
  value: unknown,
):
  | string
  | null
  | undefined {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== "string" ||
    !Number.isFinite(
      Date.parse(value),
    )
  ) {
    return undefined;
  }

  return new Date(
    value,
  ).toISOString();
}

export async function recordResendWebhookEvent(
  env: SupabaseEnv,
  input: RecordResendWebhookEventInput,
): Promise<RecordResendWebhookEventResult> {
  const providerEventId =
    normalizeProviderIdentifier(
      input.providerEventId,
    );

  const providerMessageId =
    normalizeProviderIdentifier(
      input.providerMessageId,
    );

  const providerCreatedAt =
    normalizeProviderCreatedAt(
      input.providerCreatedAt,
    );

  if (
    !providerEventId ||
    !providerMessageId ||
    !isDeliverabilityEventType(
      input.eventType,
    ) ||
    providerCreatedAt ===
      undefined
  ) {
    return {
      status: "invalid_input",
    };
  }

  const configuration =
    getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_record_resend_webhook_event`,
  );

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            apikey:
              configuration.secretKey,
          },
          body: JSON.stringify({
            p_provider_event_id:
              providerEventId,
            p_event_type:
              input.eventType,
            p_provider_message_id:
              providerMessageId,
            p_provider_created_at:
              providerCreatedAt,
          }),
        },
      );
  } catch {
    return {
      status: "unavailable",
    };
  }

  if (!response.ok) {
    const httpStatus =
      response.status;

    await response.body?.cancel();

    return {
      status: "unavailable",
      httpStatus,
    };
  }

  let body: unknown;

  try {
    body =
      (await response.json()) as unknown;
  } catch {
    return {
      status: "unavailable",
      httpStatus:
        response.status,
    };
  }

  if (
    !Array.isArray(body) ||
    body.length !== 1
  ) {
    return {
      status: "unavailable",
    };
  }

  const row =
    body[0];

  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row)
  ) {
    return {
      status: "unavailable",
    };
  }

  const candidate =
    row as Partial<RpcRow>;

  if (
    !isDatabaseStatus(
      candidate.result_status,
    ) ||
    !isUuid(
      candidate.result_event_id,
    ) ||
    !isNullableUuid(
      candidate.result_email_job_id,
    )
  ) {
    return {
      status: "unavailable",
    };
  }

  return {
    status:
      candidate.result_status,
    eventId:
      candidate.result_event_id,
    emailJobId:
      candidate.result_email_job_id,
  };
}