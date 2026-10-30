import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import fixtures from "./content-shape-fixtures.json";
import { contentFamilies } from "./contract";

// The editorial SQL suite (run by the MP03 runner and CI) checks the same fixtures with the
// store's own body_ok. This test keeps that generated block identical to the fixture file.
// Regenerate after changing fixtures: M22_WRITE_SHAPE_SQL=1 pnpm test.
const suite = resolve(
  __dirname,
  "../../../scripts/test-m22-editorial-store.sql",
);
const BEGIN =
  "-- BEGIN generated shape fixtures (src/lib/content/shape-parity.test.ts)";
const END = "-- END generated shape fixtures";

function shapeFixtureSql() {
  // body_ok is only reached for known families: the store's create refuses any other
  // family first (covered by the MP04a suite), so unknown-family cases stay TypeScript-only.
  const known = fixtures.cases.filter((c) =>
    (contentFamilies as readonly string[]).includes(c.family),
  );
  const lines = known.map((c) => {
    const json = JSON.stringify(c.body);
    if (json.includes("$fx$") || c.name.includes("'"))
      throw new Error("Fixture cannot be quoted: " + c.name);
    return `select pg_temp.ed_ok(pipstart_editorial_private.body_ok('${c.family}',$fx$${json}$fx$::jsonb) is ${c.valid},'shape fixture: ${c.name}');`;
  });
  return [BEGIN, ...lines, END].join("\n");
}

describe("M22 MP04b TypeScript/SQL shape parity", () => {
  it("runs every known-family fixture through the store's body_ok in the SQL suite", () => {
    let text = readFileSync(suite, "utf8");
    const start = text.indexOf(BEGIN),
      end = text.indexOf(END);
    expect(start, "generated block present").toBeGreaterThan(0);
    const current = text.slice(start, end + END.length);
    if (process.env.M22_WRITE_SHAPE_SQL === "1") {
      text = text.replace(current, shapeFixtureSql());
      writeFileSync(suite, text);
    }
    expect(readFileSync(suite, "utf8")).toContain(shapeFixtureSql());
    expect(shapeFixtureSql().split("\n")).toHaveLength(
      fixtures.cases.filter((c) => c.family !== "page").length + 2,
    );
  });
});
