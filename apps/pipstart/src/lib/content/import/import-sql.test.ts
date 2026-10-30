import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonbSha256, jsonbText } from "../jsonb";
import { importSql, importStatement } from "./import-sql";
import { buildImportManifest } from "./manifest";

describe("M22 MP05a import SQL", () => {
  it("prints canonical jsonb text the way PostgreSQL does", () => {
    expect(jsonbText({ bb: 1, a: [1, "x"], ccc: { z: null, y: true } })).toBe(
      '{"a": [1, "x"], "bb": 1, "ccc": {"y": true, "z": null}}',
    );
    // Shorter keys first, then bytewise; non-ASCII stays raw; control characters escape.
    expect(jsonbText({ é: 1, z: 2, ab: 3 })).toBe('{"z": 2, "ab": 3, "é": 1}');
    expect(jsonbText({ t: "line\n\ttab\u0001" })).toBe(
      '{"t": "line\\n\\ttab\\u0001"}',
    );
    expect(() => jsonbText({ n: 1e21 })).toThrow();
  });

  it("emits one ordered, quoted, hash-carrying statement per item", async () => {
    const items = await buildImportManifest();
    const sql = importSql(items, "0".repeat(64));
    const statements = sql
      .split("\n")
      .filter((line) => line.startsWith("insert into m22_import_result"));
    expect(statements).toHaveLength(items.length);
    for (const [index, item] of items.entries()) {
      expect(statements[index]).toBe(importStatement(item));
      expect(statements[index]).toContain(`'${item.bodySha256}');`);
    }
    expect(
      importStatement({ ...items[0], sourceRef: "curriculum:o'brien" }),
    ).toContain("'curriculum:o''brien'");
  });

  // Export for the full-inventory acceptance: M22_WRITE_IMPORT_DIR=<dir> pnpm vitest ...
  it.runIf(process.env.M22_WRITE_IMPORT_DIR)(
    "writes the manifest, import SQL and a drift case",
    async () => {
      const dir = process.env.M22_WRITE_IMPORT_DIR!;
      mkdirSync(dir, { recursive: true });
      const items = await buildImportManifest();
      const manifest = items.map((item) => {
        const entry: Partial<typeof item> = { ...item };
        delete entry.body;
        return entry;
      });
      const manifestText = JSON.stringify(manifest, null, 1) + "\n";
      const manifestSha = createHash("sha256")
        .update(manifestText)
        .digest("hex");
      writeFileSync(join(dir, "import-manifest.json"), manifestText);
      writeFileSync(join(dir, "import.sql"), importSql(items, manifestSha));
      // Drift: one lesson changes in code; only that item may get a new revision.
      const lesson = items.find((item) => item.family === "lesson")!;
      const blocks = [
        ...(lesson.body.blocks as unknown[]),
        { type: "paragraph", children: "MP05a drift check." },
      ];
      const body = { ...lesson.body, blocks };
      const drifted = { ...lesson, body, bodySha256: await jsonbSha256(body) };
      writeFileSync(
        join(dir, "drift.sql"),
        importSql(
          items.map((item) => (item.id === lesson.id ? drifted : item)),
          manifestSha,
        ),
      );
      writeFileSync(join(dir, "drift-item.txt"), lesson.id + "\n");
    },
  );
});
