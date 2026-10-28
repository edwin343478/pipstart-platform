import { describe, expect, it } from "vitest";
import type { LiveStaffAccess } from "./staff-role-flow";
import {
  mayPrepareLearnerIntent,
  parseLearnerRequest,
  validLearnerCommand,
} from "./staff-learner-intent";
const request = "d9000000-0000-4000-8000-000000000001";
const target = "d1000000-0000-4000-8000-000000000005";
const command = {
  request,
  target,
  operation: "auth_resume",
  until: null,
  reason: "access_change",
};
const access: LiveStaffAccess = {
  authorized: true,
  user_id: "d1000000-0000-4000-8000-000000000003",
  roles: ["administrator"],
  capabilities: ["people.read", "people.manage_learners"],
};
const response = {
  request_id: request,
  target_id: target,
  operation: "auth_resume",
  suspend_until: null,
  expires_at: "2026-10-28T15:00:00+00:00",
  status: "intent_recorded",
};
describe("learner intent presentation contract", () => {
  it("accepts exact resume and suspension commands", () => {
    expect(validLearnerCommand(command)).toBe(true);
    expect(
      validLearnerCommand({
        ...command,
        operation: "auth_suspend",
        until: "2026-10-29T15:00:00.000Z",
      }),
    ).toBe(true);
  });
  it.each([
    null,
    [],
    {},
    { ...command, actor: target },
    { ...command, reason: "arbitrary" },
    { ...command, target: "not-a-uuid" },
    { ...command, until: "2026-10-29T00:00:00Z" },
    { ...command, operation: "auth_suspend", until: null },
    { ...command, operation: "auth_suspend", until: "infinity" },
    { ...command, operation: "delete_user" },
  ])("rejects malformed or expanded command %#", (v) => {
    expect(validLearnerCommand(v)).toBe(false);
  });
  it("rejects invalid calendar dates and non-string enum objects without coercion", () => {
    expect(
      validLearnerCommand({ ...command, operation: { toString: null } }),
    ).toBe(false);
    expect(
      validLearnerCommand({ ...command, reason: { toString: null } }),
    ).toBe(false);
    expect(
      validLearnerCommand({
        ...command,
        operation: "auth_suspend",
        until: "2026-02-30T00:00:00Z",
      }),
    ).toBe(false);
    expect(
      parseLearnerRequest(
        { ...response, expires_at: "2026-02-30T00:00:00Z" },
        request,
        target,
      ),
    ).toEqual({ kind: "unavailable" });
  });
  it("requires an explicit role and learner capability, never a self target", () => {
    expect(mayPrepareLearnerIntent(access, command)).toBe(true);
    expect(
      mayPrepareLearnerIntent(
        { ...access, capabilities: ["people.read"] },
        command,
      ),
    ).toBe(false);
    expect(
      mayPrepareLearnerIntent({ ...access, roles: ["author"] }, command),
    ).toBe(false);
    expect(
      mayPrepareLearnerIntent(access, { ...command, target: access.user_id }),
    ).toBe(false);
    expect(
      mayPrepareLearnerIntent({ ...access, roles: ["owner"] }, command),
    ).toBe(true);
  });
  it("reports a recorded intent without claiming a provider effect", () => {
    const result = parseLearnerRequest(response, request, target);
    expect(result).toEqual({
      kind: "intent_recorded",
      request,
      target,
      operation: "auth_resume",
      until: null,
      expiresAt: response.expires_at,
    });
    expect(result).not.toHaveProperty("succeeded");
  });
  it.each([
    { ...response, status: "succeeded" },
    { ...response, email: "private@example.invalid" },
    { ...response, token: "secret" },
    { ...response, actor_id: target },
    { ...response, expires_at: "bad" },
    { ...response, suspend_until: "bad" },
    { ...response, request_id: target },
    { ...response, target_id: request },
    { ...response, operation: "factor_recovery" },
    null,
  ])("refuses unexpected, mismatched or sensitive response %#", (v) => {
    expect(parseLearnerRequest(v, request, target)).toEqual({
      kind: "unavailable",
    });
  });
  it("accepts a bounded suspension record and expired historical intent", () => {
    expect(
      parseLearnerRequest(
        {
          ...response,
          operation: "auth_suspend",
          suspend_until: "2026-10-29T15:00:00.000000+00:00",
        },
        request,
        target,
      ).kind,
    ).toBe("intent_recorded");
    expect(
      parseLearnerRequest(
        { ...response, expires_at: "2020-01-01T00:00:00Z" },
        request,
        target,
      ).kind,
    ).toBe("intent_recorded");
  });
});
