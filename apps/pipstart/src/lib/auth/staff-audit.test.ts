import { describe, expect, it } from "vitest";
import { parseAuditCursor, parseStaffAudit } from "./staff-audit";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
  target = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c";
const id = (n: number) =>
  `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`;
const row = (n = 30) => ({
  id: id(n),
  created_at: "2026-10-27T09:12:33.123456+00:00",
  actor_id: actor,
  request_id: id(100 + n),
  operation: "grant_role",
  target_id: target,
  value: "reviewer",
  resource_kind: "",
  resource_id: "",
  reason_code: "access_change",
  outcome: "changed",
});
describe("bounded staff audit DTO and cursor", () => {
  it("keeps the exact microsecond cursor and uses one lookahead without losing its event", () => {
    const rows = Array.from({ length: 26 }, (_, i) => row(30 - i));
    const first = parseStaffAudit(rows);
    expect(first.kind).toBe("ready");
    if (first.kind !== "ready") return;
    expect(first.items).toHaveLength(25);
    expect(first.next).toEqual({
      before: rows[24].created_at,
      beforeId: rows[24].id,
    });
    expect(parseStaffAudit([rows[25]], first.next)).toMatchObject({
      kind: "ready",
      items: [rows[25]],
      next: null,
    });
  });
  it("orders events within the same millisecond using all six digits", () => {
    const older = { ...row(50), created_at: "2026-10-27T09:12:33.123455Z" };
    expect(parseStaffAudit([row(), older]).kind).toBe("ready");
    expect(parseStaffAudit([older, row()]).kind).toBe("unavailable");
    expect(
      parseStaffAudit([row()], { before: older.created_at, beforeId: older.id })
        .kind,
    ).toBe("unavailable");
  });
  it("rejects repeated ids, repeated request references, cursor echoes and unsorted ties", () => {
    expect(parseStaffAudit([row(), row()]).kind).toBe("unavailable");
    expect(
      parseStaffAudit([row(), { ...row(29), request_id: row().request_id }])
        .kind,
    ).toBe("unavailable");
    expect(
      parseStaffAudit([row()], { before: row().created_at, beforeId: row().id })
        .kind,
    ).toBe("unavailable");
    expect(parseStaffAudit([row(29), row(30)]).kind).toBe("unavailable");
  });
  it.each([
    null,
    {},
    { items: [] },
    Array.from({ length: 27 }, (_, i) => row(40 - i)),
  ])("rejects malformed or excessive responses %#", (value) =>
    expect(parseStaffAudit(value)).toEqual({ kind: "unavailable" }),
  );
  it.each([
    { email: "private@example.invalid" },
    { token: "private-token" },
    { actor_id: "bad" },
    { target_id: null },
    { outcome: "success" },
    { reason_code: "free text" },
    { operation: "delete_user" },
    { operation: "__proto__" },
    { value: "arbitrary-private-content" },
    { created_at: "2026-02-30T00:00:00Z" },
    { created_at: "2026-10-27T09:12:33.1234567Z" },
    { created_at: "2026-10-27T09:12:33+03:00" },
    { created_at: "2026-10-27T09:12:33Z<script>" },
    { resource_id: "unexpected" },
  ])("fails the whole page closed for an invalid event %#", (change) =>
    expect(parseStaffAudit([{ ...row(), ...change }])).toEqual({
      kind: "unavailable",
    }),
  );
  it.each(["grant_role", "revoke_role"])(
    "accepts fixed role operation %s",
    (operation) =>
      expect(parseStaffAudit([{ ...row(), operation }]).kind).toBe("ready"),
  );
  it.each(["grant_delegation", "revoke_delegation"])(
    "accepts fixed delegation %s",
    (operation) => {
      expect(
        parseStaffAudit([{ ...row(), operation, value: "audit.read" }]).kind,
      ).toBe("ready");
      expect(
        parseStaffAudit([{ ...row(), operation, value: "content.publish" }])
          .kind,
      ).toBe("unavailable");
    },
  );
  it.each(["assign", "unassign"])("accepts bounded scope %s", (operation) => {
    expect(
      parseStaffAudit([
        {
          ...row(),
          operation,
          value: "",
          resource_kind: "lesson",
          resource_id: "forex/level-1:lesson",
        },
      ]).kind,
    ).toBe("ready");
    expect(
      parseStaffAudit([
        {
          ...row(),
          operation,
          value: "",
          resource_kind: "lesson",
          resource_id: "x".repeat(201),
        },
      ]).kind,
    ).toBe("unavailable");
  });
  it.each(["suspend", "resume"])(
    "accepts staff membership event %s",
    (operation) =>
      expect(
        parseStaffAudit([
          { ...row(), operation, value: "", outcome: "unchanged" },
        ]).kind,
      ).toBe("ready"),
  );
  it("preserves operator events without inventing an actor or target", () => {
    const events = [
      {
        ...row(),
        actor_id: null,
        operation: "bootstrap",
        value: "owner",
        reason_code: "owner_transfer",
      },
      {
        ...row(29),
        actor_id: null,
        target_id: null,
        operation: "control",
        value: "false",
        reason_code: "enablement",
      },
    ];
    expect(parseStaffAudit(events)).toMatchObject({
      kind: "ready",
      items: events,
      next: null,
    });
    expect(
      parseStaffAudit([{ ...events[1], value: "private text" }]).kind,
    ).toBe("unavailable");
  });
  it("distinguishes an empty result from unavailable", () =>
    expect(parseStaffAudit([])).toEqual({
      kind: "ready",
      items: [],
      next: null,
    }));
  it.each([{}, { before: row().created_at, beforeId: row().id }])(
    "accepts only absent or exact paired cursors %#",
    (params) => expect(parseAuditCursor(params).kind).toBe("ready"),
  );
  it.each([
    { before: row().created_at },
    { beforeId: row().id },
    { before: [row().created_at], beforeId: row().id },
    { before: row().created_at, beforeId: [row().id] },
    { before: row().created_at, beforeId: "bad" },
    { before: "2026-02-30T00:00:00Z", beforeId: row().id },
    { page: "1" },
    { before: row().created_at, beforeId: row().id, token: "sentinel" },
  ])("rejects ambiguous, invalid or extra query input %#", (params) =>
    expect(parseAuditCursor(params)).toEqual({ kind: "invalid" }),
  );
});
