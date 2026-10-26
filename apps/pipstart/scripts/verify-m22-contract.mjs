import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function verifyM22Contract(ledger) {
  const fail = () => {
    throw new Error(
      "M22 contract coverage is incomplete or claims future execution.",
    );
  };
  const validPatch = (patch) => /^MP(0[1-9]|1[0-2])$/.test(patch);
  const expected = [
    "course-editor",
    "lesson-editor",
    "quiz-editor",
    "draft-review",
    "publishing",
    "scheduling",
    "revision-history",
    "user-management",
    "role-management",
    "partner-management",
    "affiliate-link-management",
    "content-review-reminders",
    "audit-logs",
    "broken-link-reports",
  ];
  if (
    ledger.version !== 1 ||
    ledger.mainPatchCount !== 12 ||
    ledger.screenCount !== 27
  )
    fail();
  if (ledger.decisions?.join(",") !== "D01,D02,D03,D04,D05,D06,D07,D08,D09")
    fail();
  if (
    !Array.isArray(ledger.features) ||
    ledger.features.length !== 14 ||
    expected.some(
      (id) => ledger.features.filter((f) => f.id === id).length !== 1,
    )
  )
    fail();
  if (
    !Array.isArray(ledger.acceptance) ||
    ledger.acceptance.length !== 5 ||
    ["AT01", "AT02", "AT03", "AT04", "AT05"].some(
      (id) => ledger.acceptance.filter((a) => a.id === id).length !== 1,
    )
  )
    fail();
  for (const row of [...ledger.features, ...ledger.acceptance]) {
    if (
      !Array.isArray(row.patches) ||
      !row.patches.length ||
      !row.patches.every(validPatch) ||
      row.status !== "future-gate" ||
      typeof row.proof !== "string" ||
      row.proof.length < 40
    )
      fail();
  }
  const sql = ledger.sqlManifest;
  if (
    sql?.executable !== false ||
    !Array.isArray(sql.migrations) ||
    sql.migrations.length !== 0
  )
    fail();
  return {
    features: 14,
    acceptanceTests: 5,
    decisions: 9,
    plannedPatches: 12,
    sqlExecution: false,
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.length !== 2)
    throw new Error(
      "No target, credential or execution arguments are accepted.",
    );
  const ledger = JSON.parse(
    readFileSync(
      new URL("../../../docs/milestone-22-mp01-evidence.json", import.meta.url),
      "utf8",
    ),
  );
  console.log(JSON.stringify(verifyM22Contract(ledger)));
  console.log(
    "M22 CONTRACT COVERAGE VERIFIED. Future feature gates are not execution results; no DB/API operation.",
  );
}
