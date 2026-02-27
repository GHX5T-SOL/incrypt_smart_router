/**
 * Retry and fallback chain — try primary provider, then next in tier on timeout/rate-limit/5xx.
 */

import { complete } from "../providers/gateway.js";
import type { ProviderConfig } from "../types.js";
import type { CompletionOptions, CompletionResult } from "../providers/gateway.js";

const TIMEOUT_MS = 60_000;

async function fetchWithTimeout(
  fn: () => Promise<CompletionResult>,
  ms: number
): Promise<CompletionResult> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([fn(), timeout]);
}

export async function withFallback(
  providers: ProviderConfig[],
  options: CompletionOptions,
  env: NodeJS.ProcessEnv
): Promise<{ result: CompletionResult; provider: ProviderConfig; fallbackUsed: boolean }> {
  let lastError: Error | null = null;
  let fallbackUsed = false;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      const result = await fetchWithTimeout(
        () => complete(provider, options, env),
        TIMEOUT_MS
      );
      return { result, provider, fallbackUsed };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      fallbackUsed = i > 0;
      // Try next provider
      continue;
    }
  }

  throw lastError ?? new Error("No provider succeeded");
}
