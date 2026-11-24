import { pathToFileURL } from "node:url";

import { run } from "./m24-uptime-probes.mjs";

export { run };

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (
    process.argv.length > 3 ||
    (process.argv[2] && process.argv[2] !== "--report")
  ) {
    console.error("Usage: node m24-uptime.mjs [--report]");
    process.exitCode = 1;
  } else {
    process.exitCode = (await run({
      report: process.argv[2] === "--report",
      env: process.env,
    }))
      ? 0
      : 1;
  }
}
