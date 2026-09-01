import { afterEach, describe, expect, it, vi } from "vitest";

import worker from "./index";

const token = "a".repeat(64);

const env = {
  SUPABASE_URL: "https://example.supabase.co",

  SUPABASE_SECRET_KEY: "test-secret",
} as unknown as Parameters<typeof worker.fetch>[1];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima newsletter unsubscribe Worker runtime", () => {
  it("routes POST through the real withdrawal adapter without sending the raw token to Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "withdrawn",

          result_lead_id: "11111111-1111-4111-8111-111111111111",

          result_enrolment_id: "22222222-2222-4222-8222-222222222222",

          result_grant_consent_event_id: "33333333-3333-4333-8333-333333333333",

          result_withdrawal_consent_event_id:
            "44444444-4444-4444-8444-444444444444",

          result_withdrawn_at: "2026-08-26T06:00:00.000Z",
        },
      ]),
    );

    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      }),
      env,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "unsubscribed",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_withdraw_newsletter_by_token",
    );

    const bodyText = String((requestInit as RequestInit).body);

    expect(bodyText).not.toContain(token);

    const parsed = JSON.parse(bodyText);

    expect(parsed.p_token_hash).toMatch(/^[0-9a-f]{64}$/);

    expect(parsed.p_token_hash).not.toBe(token);
  });

  it("rejects GET before any database access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/unsubscribe", {
        method: "GET",
      }),
      env,
    );

    expect(response.status).toBe(405);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
