import "server-only";
import { createHash } from "node:crypto";
import { isOptionalEmailJob, type OptionalEmailKind } from "./dispatch";

export type ReviewedOptionalContent = Readonly<{
  id: string;
  revision: number;
  kind: OptionalEmailKind;
  subject: string;
  html: string;
  text: string;
  approvalRef: string;
  notBefore: string;
  notAfter: string;
  fingerprint: string;
}>;
export function isReviewedContentId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 64 &&
    /^[a-z0-9]/.test(value) &&
    !/[^a-z0-9_-]/.test(value)
  );
}
export function canonicalContentTime(value: unknown): number | null {
  if (typeof value !== "string" || value.length !== 24) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value
    ? time
    : null;
}
// A checksum binds copy AND approval metadata; it is not proof of human approval.
export function reviewedContentFingerprint(
  value: Omit<ReviewedOptionalContent, "fingerprint">,
): string {
  const fields = [
    value.id,
    String(value.revision),
    value.kind,
    value.subject,
    value.html,
    value.text,
    value.approvalRef,
    value.notBefore,
    value.notAfter,
  ];
  return createHash("sha256")
    .update(
      fields.map((v) => Buffer.byteLength(v, "utf8") + ":" + v).join(""),
      "utf8",
    )
    .digest("hex");
}
export function isReviewedOptionalContent(
  value: unknown,
): value is ReviewedOptionalContent {
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join() !==
      "approvalRef,fingerprint,html,id,kind,notAfter,notBefore,revision,subject,text"
  )
    return false;
  const entry = value as ReviewedOptionalContent;
  if (
    !isReviewedContentId(entry.id) ||
    !Number.isInteger(entry.revision) ||
    entry.revision < 1 ||
    entry.revision > 999999 ||
    typeof entry.approvalRef !== "string" ||
    entry.approvalRef.trim() !== entry.approvalRef ||
    !/^M21-[A-Za-z0-9_-]{8,80}$/.test(entry.approvalRef) ||
    typeof entry.fingerprint !== "string" ||
    entry.fingerprint.length !== 64 ||
    !/^[a-f0-9]{64}$/.test(entry.fingerprint)
  )
    return false;
  const start = canonicalContentTime(entry.notBefore),
    end = canonicalContentTime(entry.notAfter);
  if (
    start === null ||
    end === null ||
    start >= end ||
    !isOptionalEmailJob({
      jobId: "catalog-validation",
      userId: "00000000-0000-4000-8000-000000000000",
      kind: entry.kind,
      subject: entry.subject,
      html: entry.html,
      text: entry.text,
    })
  )
    return false;
  return reviewedContentFingerprint(entry) === entry.fingerprint;
}
// Intentionally empty: no campaign copy has been approved by this patch.
// Entries may be added only by a separately reviewed source change.
const approvedContent: readonly ReviewedOptionalContent[] = Object.freeze([]);
export function findReviewedOptionalContent(
  id: string,
): ReviewedOptionalContent | null {
  if (
    !isReviewedContentId(id) ||
    !approvedContent.every(isReviewedOptionalContent) ||
    new Set(approvedContent.map((entry) => entry.id)).size !==
      approvedContent.length
  )
    return null;
  const entry = approvedContent.find((item) => item.id === id);
  return entry ? Object.freeze({ ...entry }) : null;
}
