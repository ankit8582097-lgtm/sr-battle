// Test-only stub for @caffeineai/object-storage.
//
// The real package's dist/index.js imports "./blob" without a file extension,
// which Vitest cannot resolve in this environment. The generated backend.ts
// only uses ExternalBlob as a type, so a minimal stub satisfies the import
// without exercising any real object-storage behavior.
export class ExternalBlob {
  constructor(public readonly data: Uint8Array) {}
}
