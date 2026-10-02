import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  plugins: [mdx()],
  test: {
    environment: "node",
  },
});
