import { describe, expect, it } from "vitest";
import {
  parseMaintenanceReview,
  validMaintenanceProof,
} from "./staff-maintenance-contract";
const request = "d9000000-0000-4000-8000-000000000001";
const review = {
  request_id: request,
  target_id: "d1000000-0000-4000-8000-000000000005",
  operation: "auth_resume",
  suspend_until: null,
  reason: "access_change",
  state: "prepared",
  status: "reviewed",
};
describe("minimized maintenance review", () => {
  it("freezes the exact reviewed request", () => {
    const r = parseMaintenanceReview(review, request);
    expect(r).toEqual(review);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it.each([
    { ...review, email: "private" },
    { ...review, operation: "factor_recovery" },
    { ...review, state: "invented" },
    { ...review, suspend_until: "2028-01-01" },
    { ...review, target_id: "bad" },
    { ...review, operation: "auth_suspend", suspend_until: "bad" },
    { ...review, reason: "anything" },
  ])("rejects malformed or overbroad review %#", (value) =>
    expect(parseMaintenanceReview(value, request)).toBeNull(),
  );
  it("refuses request mismatch", () =>
    expect(parseMaintenanceReview(review, "other")).toBeNull());
  it("accepts a bounded suspension timestamp", () =>
    expect(
      parseMaintenanceReview(
        {
          ...review,
          operation: "auth_suspend",
          suspend_until: "2028-01-01T00:00:00Z",
        },
        request,
      ),
    ).not.toBeNull());
  it("does not accept an extra browser-supplied service credential", () =>
    expect(
      validMaintenanceProof({
        request,
        mode: "inspect",
        token: "a".repeat(64),
        expiresAt: "2099-01-01",
        key: "secret",
      }),
    ).toBe(false));
});
