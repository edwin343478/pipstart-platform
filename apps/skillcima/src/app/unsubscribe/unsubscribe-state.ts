const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export type UnsubscribeTokenResult =
  | {
      status: "ready";
      token: string;
    }
  | {
      status: "invalid";
    };

export type UnsubscribeApiOutcome =
  "success" | "invalid" | "stale" | "retryable" | "failure";

export function extractUnsubscribeToken(
  search: string,
): UnsubscribeTokenResult {
  const params = new URLSearchParams(search);

  const tokens = params.getAll("token");

  if (tokens.length !== 1 || !TOKEN_PATTERN.test(tokens[0] ?? "")) {
    return {
      status: "invalid",
    };
  }

  return {
    status: "ready",
    token: tokens[0],
  };
}

export function mapUnsubscribeApiResponse(
  status: number,
  body: unknown,
): UnsubscribeApiOutcome {
  if (
    status === 200 &&
    body &&
    typeof body === "object" &&
    !Array.isArray(body)
  ) {
    const record = body as Record<string, unknown>;

    if (
      record.ok === true &&
      (record.status === "unsubscribed" ||
        record.status === "already_unsubscribed")
    ) {
      return "success";
    }
  }

  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;

    const error =
      record.error &&
      typeof record.error === "object" &&
      !Array.isArray(record.error)
        ? (record.error as Record<string, unknown>)
        : null;

    const code = typeof error?.code === "string" ? error.code : null;

    if (status === 400 && code === "INVALID_UNSUBSCRIBE_LINK") {
      return "invalid";
    }

    if (status === 410 && code === "UNSUBSCRIBE_LINK_STALE") {
      return "stale";
    }

    if (
      status === 503 &&
      (code === "UNSUBSCRIBE_NOT_CONFIGURED" ||
        code === "UNSUBSCRIBE_UNAVAILABLE")
    ) {
      return "retryable";
    }
  }

  return "failure";
}
