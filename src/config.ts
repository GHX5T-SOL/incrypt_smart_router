/**
 * Load router config from env
 */

import { FREE_PROVIDERS, PAID_PROVIDERS } from "./providers/config.js";
import type { RouterConfig, ProviderConfig } from "./types.js";

function env(key: string, def: string): string {
  const v = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return (typeof v === "string" && v !== "" ? v : def);
}

function envNum(key: string, def: number): number {
  const v = env(key, String(def));
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

function envBool(key: string, def: boolean): boolean {
  const v = env(key, def ? "1" : "0").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function loadConfig(): RouterConfig {
  const providers: ProviderConfig[] = [...FREE_PROVIDERS];
  const envRef = typeof process !== "undefined" ? process.env : {};
  for (const p of PAID_PROVIDERS) {
    if (p.envKey && envRef[p.envKey]) providers.push(p);
  }

  return {
    port: envNum("PORT", 3140),
    cacheTtlSeconds: envNum("CACHE_TTL_SECONDS", 3600),
    cacheMaxSize: envNum("CACHE_MAX_SIZE", 1000),
    semanticSimilarityThreshold: parseFloat(env("SEMANTIC_SIMILARITY_THRESHOLD", "0.92")) || 0.92,
    compressionEnabled: envBool("COMPRESSION_ENABLED", true),
    logLevel: env("LOG_LEVEL", "info"),
    providers,
  };
}
