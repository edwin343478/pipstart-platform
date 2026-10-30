import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { buildContentSnapshot } from "./source";

// The export runs against the editorial store (MP05c-3 local staging); these checks keep it
// read-only and in step with the loader's seal and filters.
const sql = readFileSync(
  resolve(import.meta.dirname, "../../../scripts/export-content-snapshot.sql"),
  "utf8",
);
const statements = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

describe("M22 MP05c-3 content snapshot export", () => {
  it("is one read-only transaction that writes nothing", () => {
    expect(statements.trim().startsWith("begin transaction read only;")).toBe(
      true,
    );
    expect(statements.trim().endsWith("commit;")).toBe(true);
    expect(statements).not.toMatch(
      /\b(insert|update|delete|truncate|drop|alter|create|grant|revoke|copy|call|perform)\b/i,
    );
  });

  it("exports only approved revisions of items that are not trashed or on hold", () => {
    expect(statements).toContain("state = 'approved'");
    expect(statements).toContain(
      "i.trashed_at is null and i.hold_reason is null",
    );
    // Children are reached only through an exported parent.
    expect(statements).toContain("join tree t on a.parent_id = t.id");
  });

  it("seals the items exactly as the loader verifies them", () => {
    expect(statements).toContain("'format', 'pipstart-content-snapshot'");
    expect(statements).toContain("'version', 1");
    expect(statements).toContain("'state', 'approved'");
    expect(statements).toContain(
      "id || ' ' || family || ' ' || revision_no || ' ' || body_sha256 || chr(10)",
    );
    const item = {
      id: "a",
      family: "course" as const,
      learningPath: "forex" as const,
      parentId: null,
      revisionNo: 3,
      body: { metadata: { title: "A" } },
    };
    const sealed = buildContentSnapshot([item], "2026-10-30T00:00:00.000Z");
    // The same line format, hashed, is the loader's itemsSha256.
    const line = `a course 3 ${sealed.items[0]!.bodySha256}\n`;
    expect(sealed.itemsSha256).toBe(
      createHash("sha256").update(line).digest("hex"),
    );
  });
});
