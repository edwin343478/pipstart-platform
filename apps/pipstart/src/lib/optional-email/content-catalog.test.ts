import { describe, expect, it, vi } from "vitest";
const queueFactory = vi.hoisted(() => vi.fn());
vi.mock("./queue-store", () => ({ createOptionalEmailQueue: queueFactory }));
import { enqueueReviewedOptionalEmail } from "./reviewed-producer";
import { canonicalContentTime, findReviewedOptionalContent, isReviewedContentId, isReviewedOptionalContent, reviewedContentFingerprint, type ReviewedOptionalContent } from "./content-catalog";
const draft = {
  id: "generated-content", revision: 1, kind: "learning_lesson" as const, subject: "Generated",
  html: "<p>Generated</p>", text: "Generated", approvalRef: "M21-generated-proof",
  notBefore: "2026-10-22T00:00:00.000Z", notAfter: "2026-10-24T00:00:00.000Z",
};
const entry = (): ReviewedOptionalContent => ({ ...draft, fingerprint: reviewedContentFingerprint(draft) });
describe("reviewed content checksum and closed catalog", () => {
  it("cannot enqueue with the actual empty production catalog even when explicitly enabled", async () => {
    expect(await enqueueReviewedOptionalEmail({ userId: "00000000-0000-4000-8000-000000000070", contentId: draft.id,
      occurrenceKey: "generated-occurrence", availableAt: "2026-10-23T00:00:00.000Z" }, true)).toEqual({ status: "not_approved" });
    expect(queueFactory).not.toHaveBeenCalled();
  });
  it("ships with no approved content, even for a valid generated ID", () => {
    expect(findReviewedOptionalContent(draft.id)).toBeNull(); expect(findReviewedOptionalContent("unknown")).toBeNull();
  });
  it("validates a generated review record without treating its checksum as approval", () => {
    expect(isReviewedOptionalContent(entry())).toBe(true);
    expect(findReviewedOptionalContent(draft.id)).toBeNull();
  });
  it.each(["id", "revision", "kind", "subject", "html", "text", "approvalRef", "notBefore", "notAfter"] as const)("binds exact %s to the checksum", key => {
    const value = { ...entry(), [key]: key === "revision" ? 2 : key === "kind" ? "partner_offer" : String(draft[key]) + "changed" };
    expect(isReviewedOptionalContent(value)).toBe(false);
  });
  it("uses UTF8 length prefixes rather than ambiguous concatenation", () => {
    expect(reviewedContentFingerprint({ ...draft, subject: "ab", html: "c" })).not.toBe(reviewedContentFingerprint({ ...draft, subject: "a", html: "bc" }));
    const unicode = { ...draft, subject: "Generated \u{1F600}", html: "<p>\u00e9</p>" };
    expect(isReviewedOptionalContent({ ...unicode, fingerprint: reviewedContentFingerprint(unicode) })).toBe(true);
  });
  it.each([null, {}, { ...entry(), extra: true }, { ...entry(), fingerprint: "a".repeat(64) + "\n" },
    { ...entry(), approvalRef: draft.approvalRef + "\n" }, { ...entry(), revision: 0 }, { ...entry(), revision: 1.5 },
    { ...entry(), notBefore: draft.notAfter }, { ...entry(), subject: "bad\r\nheader" }, { ...entry(), html: "" }])("rejects malformed records", value => {
    expect(isReviewedOptionalContent(value)).toBe(false);
  });
  it.each(["bad\n", "UPPER", "-leading", "x".repeat(65), "has space", "a/b", "a?b", ""])("rejects unsafe IDs", value => {
    expect(isReviewedContentId(value)).toBe(false); expect(findReviewedOptionalContent(value)).toBeNull();
  });
  it.each(["2026-02-30T00:00:00.000Z", "2026-10-22T00:00:00Z", "2026-10-22T03:00:00.000+03:00", "infinity", "", null])("requires canonical real UTC timestamps", value => {
    expect(canonicalContentTime(value)).toBeNull();
  });
});
