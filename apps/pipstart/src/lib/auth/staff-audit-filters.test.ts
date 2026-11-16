import { describe, expect, it } from "vitest";
import {
  auditFiltered,
  auditRpcArgs,
  parseAuditQuery,
  parseContentAudit,
} from "./staff-audit";

const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const row = (id: string, at: string, patch: Record<string, unknown> = {}) => ({
  id,
  created_at: at,
  actor_id: actor,
  operation: "maintenance",
  item_id: "crypto-start-here",
  revision_no: 1,
  action: "acknowledge",
  ...patch,
});
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

describe("MP10f audit query", () => {
  it("defaults to the unfiltered staff page", () => {
    const q = parseAuditQuery({});
    expect(q).toEqual({
      kind: "ready",
      query: {
        source: "staff",
        operation: null,
        actor: null,
        item: null,
        from: null,
        to: null,
        cursor: null,
      },
    });
    expect(q.kind === "ready" && auditFiltered(q.query)).toBe(false);
  });
  it("treats empty form fields as absent and keeps a staff cursor unfiltered", () => {
    const q = parseAuditQuery({
      source: "staff",
      operation: "",
      actor: "",
      item: "",
      from: "",
      to: "",
      before: "2026-10-27T09:00:00.123456+00:00",
      beforeId: actor,
    });
    expect(
      q.kind === "ready" &&
        !auditFiltered(q.query) &&
        q.query.cursor?.beforeId === actor,
    ).toBe(true);
  });
  it("accepts each filter for its own source", () => {
    const s = parseAuditQuery({
      operation: "grant_role",
      actor,
      item: "partner:deriv",
      from: "2026-11-01",
      to: "2026-11-16",
    });
    expect(s.kind === "ready" && auditFiltered(s.query)).toBe(true);
    const c = parseAuditQuery({
      source: "content",
      operation: "maintenance",
      item: "crypto-start-here",
    });
    expect(
      c.kind === "ready" &&
        c.query.source === "content" &&
        auditFiltered(c.query),
    ).toBe(true);
  });
  it.each([
    { source: "everything" },
    { operation: "maintenance" },
    { source: "content", operation: "grant_role" },
    { actor: "not-a-uuid" },
    { item: "Bad Item" },
    { from: "2026-02-30" },
    { from: "2026-11-16", to: "2026-11-01" },
    { before: "2026-10-27T09:00:00Z" },
    { beforeId: actor },
    { extra: "1" },
    { operation: ["grant_role", "assign"] },
  ])("refuses %j", (params) => {
    expect(
      parseAuditQuery(params as unknown as Record<string, string | string[]>),
    ).toEqual({
      kind: "invalid",
    });
  });
  it("sends whole UTC days with the end day included and the right item argument per source", () => {
    const s = parseAuditQuery({
      operation: "assign",
      item: "partner:deriv",
      from: "2026-11-01",
      to: "2026-11-16",
    });
    const c = parseAuditQuery({
      source: "content",
      item: "crypto-start-here",
      to: "2026-12-31",
    });
    if (s.kind !== "ready" || c.kind !== "ready") throw Error("ready expected");
    expect(auditRpcArgs(s.query)).toEqual({
      p_before: null,
      p_before_id: null,
      p_limit: 26,
      p_operation: "assign",
      p_actor: null,
      p_resource: "partner:deriv",
      p_from: "2026-11-01T00:00:00.000Z",
      p_to: "2026-11-17T00:00:00.000Z",
    });
    expect(auditRpcArgs(c.query)).toMatchObject({
      p_item: "crypto-start-here",
      p_from: null,
      p_to: "2027-01-01T00:00:00.000Z",
    });
    expect(auditRpcArgs(c.query)).not.toHaveProperty("p_resource");
  });
});

describe("MP10f content audit rows", () => {
  it("parses minimized rows newest first and pages with a cursor", () => {
    const rows = Array.from({ length: 26 }, (_, i) =>
      row(
        id(100 - i),
        `2026-11-16T10:${String(59 - i).padStart(2, "0")}:00.000001+00:00`,
      ),
    );
    const page = parseContentAudit(rows);
    expect(page.kind).toBe("ready");
    if (page.kind !== "ready") return;
    expect(page.items).toHaveLength(25);
    expect(page.next).toEqual({
      before: rows[24].created_at,
      beforeId: rows[24].id,
    });
  });
  it("accepts site-wide rows and non-maintenance rows without an action", () => {
    expect(
      parseContentAudit([
        row(id(2), "2026-11-16T10:00:00Z", {
          operation: "publish",
          action: null,
        }),
        row(id(1), "2026-11-16T09:00:00Z", {
          item_id: null,
          revision_no: null,
          action: "allowlist",
        }),
      ]).kind,
    ).toBe("ready");
  });
  it.each([
    [row(id(1), "2026-11-16T10:00:00Z", { detail: "PRIVATE" })],
    [row(id(1), "2026-11-16T10:00:00Z", { operation: "grant_role" })],
    [row(id(1), "2026-11-16T10:00:00Z", { action: "deleted" })],
    [
      row(id(1), "2026-11-16T10:00:00Z", {
        operation: "publish",
        action: "acknowledge",
      }),
    ],
    [row(id(1), "2026-11-16T10:00:00Z", { revision_no: 0 })],
    [row(id(1), "2026-11-16T10:00:00Z", { item_id: "Bad Item" })],
    [row(id(1), "2026-11-16T10:00:00Z", { actor_id: null })],
    [row(id(1), "2026-11-16T09:00:00Z"), row(id(2), "2026-11-16T10:00:00Z")],
    [row(id(1), "2026-11-16T10:00:00Z"), row(id(1), "2026-11-16T09:00:00Z")],
  ])("refuses malformed or out-of-order rows %#", (...rows) => {
    expect(parseContentAudit(rows)).toEqual({ kind: "unavailable" });
  });
  it("refuses rows that are not older than the cursor", () => {
    expect(
      parseContentAudit([row(id(5), "2026-11-16T10:00:00Z")], {
        before: "2026-11-16T09:00:00Z",
        beforeId: id(9),
      }),
    ).toEqual({ kind: "unavailable" });
  });
});
