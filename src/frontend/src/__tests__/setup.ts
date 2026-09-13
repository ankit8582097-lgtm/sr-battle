import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components use `data-ocid` as their test id attribute.
configure({ testIdAttribute: "data-ocid" });

// Vitest runs without `globals: true`, so RTL's automatic afterEach cleanup is
// not registered. Without explicit cleanup, renders accumulate across tests in
// the same file and later queries fail with "Found multiple elements".
afterEach(() => {
  cleanup();
});

// The app's main.tsx installs this polyfill so that TanStack Query can hash
// query keys containing BigInt (e.g. ["tournament", id]). The test suite
// renders pages directly without main.tsx, so replicate the polyfill here.
BigInt.prototype.toJSON = function () {
  return this.toString();
};
