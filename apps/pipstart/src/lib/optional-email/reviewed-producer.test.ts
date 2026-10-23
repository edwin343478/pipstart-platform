import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  queue: vi.fn(),
  enqueue: vi.fn(),
}));
vi.mock("./content-catalog", async (original) => ({
  ...(await original<typeof import("./content-catalog")>()),
  findReviewedOptionalContent: mocks.find,
}));
vi.mock("./queue-store", () => ({ createOptionalEmailQueue: mocks.queue }));
import { reviewedContentFingerprint } from "./content-catalog";
import {
  enqueueReviewedOptionalEmail,
  reviewedJobDedupeKey,
} from "./reviewed-producer";
const userId = "00000000-0000-4000-8000-000000000070",
  jobId = "00000000-0000-4000-8000-000000000071";
const now = "2026-10-22T12:00:00.000Z";
const request = {
  userId,
  contentId: "generated-content",
  occurrenceKey: "generated-occurrence",
  availableAt: now,
};
const draft = {
  id: request.contentId,
  revision: 1,
  kind: "learning_lesson" as const,
  subject: "Generated",
  html: "<p>Generated</p>",
  text: "Generated",
  approvalRef: "M21-generated-proof",
  notBefore: "2026-10-22T00:00:00.000Z",
  notAfter: "2026-10-24T00:00:00.000Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(Date.parse(now));
  mocks.find.mockReturnValue({
    ...draft,
    fingerprint: reviewedContentFingerprint(draft),
  });
  mocks.queue.mockReturnValue({ enqueue: mocks.enqueue });
  mocks.enqueue.mockResolvedValue({ status: "queued", jobId });
});
afterEach(() => vi.restoreAllMocks());
describe("dormant one-job reviewed producer", () => {
  it("does no lookup or SDK work by default", async () => {
    expect(await enqueueReviewedOptionalEmail(request)).toEqual({
      status: "disabled",
    });
    expect(mocks.find).not.toHaveBeenCalled();
    expect(mocks.queue).not.toHaveBeenCalled();
  });
  it.each([
    null,
    {},
    { ...request, email: "override@example.test" },
    { ...request, subject: "override" },
    { ...request, enabled: true },
    { ...request, userId: userId + "\n" },
    { ...request, occurrenceKey: "bad\n" },
    { ...request, availableAt: "2026-10-22T12:00:00Z" },
  ])("rejects arbitrary/unvalidated job inputs", async (value) => {
    expect(await enqueueReviewedOptionalEmail(value, true)).toEqual({
      status: "invalid_request",
    });
    expect(mocks.queue).not.toHaveBeenCalled();
    expect(mocks.enqueue).not.toHaveBeenCalled();
  });
  it.each([
    null,
    {},
    { ...draft, fingerprint: "a".repeat(64) },
    {
      ...draft,
      id: "other",
      fingerprint: reviewedContentFingerprint({ ...draft, id: "other" }),
    },
  ])("rejects missing/mismatched/tampered catalog entries", async (value) => {
    mocks.find.mockReturnValue(value);
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "not_approved",
    });
    expect(mocks.queue).not.toHaveBeenCalled();
  });
  it.each(["2026-10-21T23:59:59.999Z", "2026-10-24T00:00:00.000Z"])(
    "rejects an inactive review window at %s",
    async (time) => {
      vi.mocked(Date.now).mockReturnValue(Date.parse(time));
      expect(
        await enqueueReviewedOptionalEmail(
          { ...request, availableAt: time },
          true,
        ),
      ).toEqual({ status: "not_approved" });
      expect(mocks.enqueue).not.toHaveBeenCalled();
    },
  );
  it.each(["2026-10-22T11:59:59.999Z", "2026-10-24T00:00:00.000Z"])(
    "rejects past/out-of-window delivery time",
    async (availableAt) => {
      expect(
        await enqueueReviewedOptionalEmail({ ...request, availableAt }, true),
      ).toEqual({ status: "not_approved" });
      expect(mocks.enqueue).not.toHaveBeenCalled();
    },
  );
  it("queues exactly one immutable reviewed payload through the accepted adapter", async () => {
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "queued",
      jobId,
    });
    expect(mocks.enqueue).toHaveBeenCalledExactlyOnceWith(
      {
        userId,
        kind: draft.kind,
        subject: draft.subject,
        html: draft.html,
        text: draft.text,
      },
      reviewedJobDedupeKey(request.contentId, request.occurrenceKey),
      now,
    );
    expect(
      reviewedJobDedupeKey(request.contentId, request.occurrenceKey),
    ).toMatch(/^m21-reviewed-v1-[a-f0-9]{64}$/);
  });
  it("keeps the same logical key when schedule/revision/body changes; SQL decides duplicate/conflict", async () => {
    await enqueueReviewedOptionalEmail(request, true);
    const revised = { ...draft, revision: 2, text: "Changed approved fixture" };
    mocks.find.mockReturnValue({
      ...revised,
      fingerprint: reviewedContentFingerprint(revised),
    });
    mocks.enqueue.mockResolvedValue({ status: "conflict" });
    expect(
      await enqueueReviewedOptionalEmail(
        { ...request, availableAt: "2026-10-22T13:00:00.000Z" },
        true,
      ),
    ).toEqual({ status: "conflict" });
    expect(mocks.enqueue.mock.calls[0][1]).toBe(mocks.enqueue.mock.calls[1][1]);
    expect(mocks.enqueue).toHaveBeenCalledTimes(2);
  });
  it.each(["account_inactive", "opted_out", "frequency_changed"])(
    "preserves SQL suppression %s",
    async (reason) => {
      mocks.enqueue.mockResolvedValue({ status: "suppressed", reason });
      expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
        status: "suppressed",
        reason,
      });
    },
  );
  it("preserves duplicate acknowledgement without a replacement key", async () => {
    mocks.enqueue.mockResolvedValue({ status: "duplicate", jobId });
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "duplicate",
      jobId,
    });
    expect(mocks.enqueue).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    {},
    { status: "queued", jobId, secret: "private" },
    { status: "suppressed", reason: "unknown" },
    { status: "queued", jobId: "bad" },
  ])("sanitizes malformed acknowledgements without retry", async (value) => {
    mocks.enqueue.mockResolvedValue(value);
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "review_required",
    });
    expect(mocks.enqueue).toHaveBeenCalledTimes(1);
  });
  it("quarantines lost enqueue acknowledgement without exposing details or retrying", async () => {
    mocks.enqueue.mockRejectedValue(new Error("private generated detail"));
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "review_required",
    });
    expect(mocks.enqueue).toHaveBeenCalledTimes(1);
  });
  it("does not construct an alternative queue when the adapter is unavailable", async () => {
    mocks.queue.mockReturnValue(null);
    expect(await enqueueReviewedOptionalEmail(request, true)).toEqual({
      status: "unavailable",
    });
    expect(mocks.enqueue).not.toHaveBeenCalled();
  });
});
