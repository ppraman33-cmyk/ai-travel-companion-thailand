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
    // Bound workers because deterministic research reconstruction expands the
    // compact village shards in-memory without reducing test coverage.
    maxWorkers: 4,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
