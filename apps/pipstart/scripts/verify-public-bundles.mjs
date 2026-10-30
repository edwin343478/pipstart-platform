import { readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

// Run after a real production build. Server output is allowed to retain the catalogue;
// executable browser chunks are not. The source graph test also prevents new leaks.
const root = resolve(process.cwd(), ".next/static");
const forbidden = [
  "This draft is not approved for publication.",
  "A trading strategy is a set of rules describing what to observe",
  "Two pair names can look different while hiding the same currency direction",
];
// M22 MP04b: quiz explanations stay private until a learner submits. They may never reach
// a browser chunk or the initial HTML/RSC payload of a prerendered page, and neither may an
// answer key or draft text. Markers are kept current by src/lib/content/private-markers.test.ts.
const draft = forbidden[0];
const { explanationMarkers } = JSON.parse(
  await readFile(
    new URL("./m22-private-content-markers.json", import.meta.url),
    "utf8",
  ),
);
if (!Array.isArray(explanationMarkers) || explanationMarkers.length < 250)
  throw new Error("Private content markers are missing or incomplete.");
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(join(dir, entry.name))
          : [join(dir, entry.name)],
      ),
    )
  ).flat();
}
const chunks = (await files(root)).filter((path) => path.endsWith(".js"));
if (!chunks.length)
  throw new Error(
    "No production browser chunks found. Run the PipStart production build first.",
  );
for (const path of chunks) {
  const content = await readFile(path, "utf8");
  for (const marker of forbidden)
    if (content.includes(marker))
      throw new Error(
        `Lesson catalogue/draft body reached browser chunk: ${path}`,
      );
  for (const marker of explanationMarkers)
    if (content.includes(marker))
      throw new Error(
        `Private quiz explanation reached browser chunk: ${path}`,
      );
}
const payloads = (
  await files(resolve(process.cwd(), ".next/server/app"))
).filter((path) => /\.(html|rsc|body)$/.test(path));
if (!payloads.length)
  throw new Error("No prerendered HTML/RSC payloads found in the build.");
for (const path of payloads) {
  const content = await readFile(path, "utf8");
  if (content.includes("correctChoiceIds"))
    throw new Error(`Quiz answer key reached an initial payload: ${path}`);
  for (const marker of [draft, ...explanationMarkers])
    if (content.includes(marker))
      throw new Error(`Private quiz or draft text reached ${path}`);
}
console.log(
  `PASS: ${chunks.length} production browser chunks contain no draft, catalogue-body or quiz-explanation sentinels; ${payloads.length} prerendered HTML/RSC payloads contain no draft text, quiz explanation or answer key.`,
);
