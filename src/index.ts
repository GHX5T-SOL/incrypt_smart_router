/**
 * Incrypt Smart Router — main export
 */

export { createRouter } from "./router/index.js";
export { createServer } from "./server.js";
export { loadConfig } from "./config.js";
export { compact, decompressWithCodebook } from "./compaction/index.js";
export { classify } from "./classifier/index.js";
export { createCache } from "./cache/index.js";
export { withFallback } from "./failover/index.js";
export { getProvidersForTier, FREE_PROVIDERS, PAID_PROVIDERS } from "./providers/config.js";
export { complete } from "./providers/gateway.js";
export type {
  RouterRequest,
  RouterResponse,
  RouterConfig,
  ComplexityTier,
  ChatMessage,
  ProviderConfig,
  TelemetryEntry,
} from "./types.js";
export type { CompactionResult } from "./compaction/index.js";
export type { CompletionResult } from "./providers/gateway.js";
