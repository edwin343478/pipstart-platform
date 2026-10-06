import mdx from "@mdx-js/rollup";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Test-only alias; production server-only boundaries stay intact.
export default defineConfig({
  plugins: [mdx()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./scripts/test-stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: [
      "src/lib/assessment*.test.ts",
      "src/app/milestone-13-assessment*.test.ts",
      "src/app/milestone-16-h1-assessment-binding.test.ts",
    ],
    maxWorkers: 2,
  },
});
