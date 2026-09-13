import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The real @caffeineai/object-storage package's dist/index.js imports
      // "./blob" without an extension, which Vitest cannot resolve. The
      // generated backend.ts only uses ExternalBlob as a type, so a stub
      // satisfies the import in the test environment.
      "@caffeineai/object-storage": path.resolve(
        __dirname,
        "./src/__tests__/objectStorageStub.ts",
      ),
    },
  },
  test: {
    setupFiles: ["./src/__tests__/setup.ts"],
    environment: "jsdom",
    pool: "forks",
    maxWorkers: 1,
    minWorkers: 1,
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1,
      },
    },
  },
});
