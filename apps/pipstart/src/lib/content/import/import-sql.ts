// M22 MP05a import SQL: one ordered, independent statement per manifest item, each carrying
// the body hash computed from code. Re-running is safe (unchanged items are no-ops), so an
// interrupted run is resumed by running the same SQL again. A final summary lists the
// outcome of every item; any conflict stops the run with an error after the summary rows.
import type { ManifestItem } from "./manifest";

const TAG = "$m22import$";
const lit = (value: string | null) =>
  value === null ? "null" : `'${value.replace(/'/g, "''")}'`;

export function importStatement(item: ManifestItem): string {
  const body = JSON.stringify(item.body);
  if (body.includes(TAG))
    throw new Error("Body contains the SQL quote tag: " + item.id);
  return (
    `insert into m22_import_result select ${item.seq},${lit(item.id)},` +
    `pipstart_editorial_private.import_item(${lit(item.id)},${lit(item.family)},` +
    `${lit(item.learningPath)},${lit(item.parentId)},${TAG}${body}${TAG}::jsonb,` +
    `${lit(item.sourceRef)},${lit(item.bodySha256)});`
  );
}

export function importSql(
  items: readonly ManifestItem[],
  manifestSha256: string,
): string {
  return (
    [
      `-- PipStart M22 MP05a import: ${items.length} items, manifest ${manifestSha256}.`,
      "-- Operator-only. Safe to re-run: unchanged items are no-ops and staff edits are never overwritten.",
      "create temp table if not exists m22_import_result(seq integer primary key, item_id text not null, status text not null);",
      "truncate m22_import_result;",
      ...items.map(importStatement),
      "do $m22check$ begin if (select count(*) from m22_import_result)<>" +
        items.length +
        " then raise exception 'Import incomplete'; end if; end $m22check$;",
      "select status, count(*) as items from m22_import_result group by status order by status;",
    ].join("\n") + "\n"
  );
}
