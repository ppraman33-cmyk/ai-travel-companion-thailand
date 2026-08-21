import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    // The quarantined nationwide identity registries are intentionally large.
    // Bound parallel workers to prevent memory contention without reducing any
    // test, assertion, or file-level coverage.
    maxWorkers: 4,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
