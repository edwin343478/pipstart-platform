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
}
console.log(
  `PASS: ${chunks.length} production browser chunks contain no draft or catalogue-body sentinels.`,
);
