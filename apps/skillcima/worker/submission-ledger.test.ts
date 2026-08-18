import { afterEach, describe, expect, it, vi } from "vitest";

import type { SupabaseEnv } from "./supabase";

import {
  classifyExistingSubmission,
  reserveLeadSubmission,
  type StoredLeadSubmission,
} from "./submission-ledger";

const env: SupabaseEnv = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "test-server-secret",
};

const submission: StoredLeadSubmission = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  requestFingerprint: "a".repeat(64),
  status: "received",
  leadId: null,
  enrolmentId: null,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("classifyExistingSubmission", () => {
  it("returns existing for the same fingerprint", () => {
    const result = classifyExistingSubmission(
      submission,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("existing");
  });

  it("returns conflict for a different fingerprint", () => {
    const result = classifyExistingSubmission(submission, "b".repeat(64));

    expect(result.status).toBe("conflict");
  });
});

describe("reserveLeadSubmission", () => {
  it("reserves a new submission when the ID does not exist", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 201,
        }),
      );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("reserved");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    if (result.status === "reserved") {
      expect(result.submission.status).toBe("received");
      expect(result.submission.leadId).toBeNull();
      expect(result.submission.enrolmentId).toBeNull();
    }
  });

  it("returns existing when the stored fingerprint matches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            submission_id: submission.submissionId,
            request_fingerprint: submission.requestFingerprint,
            status: "received",
            lead_id: null,
            enrolment_id: null,
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("existing");
  });

  it("returns conflict when the stored fingerprint differs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            submission_id: submission.submissionId,
            request_fingerprint: "b".repeat(64),
            status: "received",
            lead_id: null,
            enrolment_id: null,
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("conflict");
  });

  it("handles a concurrent insert race with the same request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 409,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              submission_id: submission.submissionId,
              request_fingerprint: submission.requestFingerprint,
              status: "received",
              lead_id: null,
              enrolment_id: null,
            },
          ]),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("existing");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("handles a concurrent insert race with different request content", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 409,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              submission_id: submission.submissionId,
              request_fingerprint: "b".repeat(64),
              status: "received",
              lead_id: null,
              enrolment_id: null,
            },
          ]),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("conflict");
  });

  it("reports missing Supabase configuration without making a request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await reserveLeadSubmission(
      {
        SUPABASE_URL: "",
        SUPABASE_SECRET_KEY: "",
      },
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result.status).toBe("misconfigured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unavailable database response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 503,
      }),
    );

    const result = await reserveLeadSubmission(
      env,
      submission.submissionId,
      submission.requestFingerprint,
    );

    expect(result).toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });
});
