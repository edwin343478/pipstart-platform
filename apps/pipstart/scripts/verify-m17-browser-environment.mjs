import fs from "node:fs";
import net from "node:net";
import { chromium } from "@playwright/test";
import { getM17BrowserMetadata } from "./m17-browser-metadata.mjs";
const appRoot = process.cwd();
const metadata = getM17BrowserMetadata(appRoot);
if (!metadata.buildId)
  throw new Error(
    "A successful fresh production build is required before M17 browser verification. No tests ran.",
  );
if (!metadata.releaseApproved || !metadata.archivePreserved)
  throw new Error(
    "Approved release record and preserved review archive are required.",
  );
if (!fs.existsSync(chromium.executablePath()))
  throw new Error(
    "Installed Chromium is unavailable. Run pnpm --filter pipstart exec playwright install chromium, then repeat verification. No tests ran.",
  );
const socket = net.createServer();
try {
  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.listen(3102, "127.0.0.1", resolve);
  });
} catch {
  throw new Error(
    "Port 3102 is unavailable. Stop only your own previous M17 verification server before repeating. No process was terminated.",
  );
} finally {
  if (socket.listening)
    await new Promise((resolve, reject) =>
      socket.close((error) => (error ? reject(error) : resolve())),
    );
}
console.log(
  "M17 production build, approved publication record, installed Chromium and port preflight passed. No credentials or database operations required.",
);
