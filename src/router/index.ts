/**
 * Router core — wire cache → compaction → classifier → policy → provider mesh → failover.
 */

import { compact } from "../compaction/index.js";
import { classify } from "../classifier/index.js";
import { getProvidersForTier } from "../providers/config.js";
import { withFallback } from "../failover/index.js";
import { createCache } from "../cache/index.js";
import type {
  RouterRequest,
  RouterResponse,
  RouterConfig,
  ComplexityTier,
  ChatMessage,
  TelemetryEntry,
} from "../types.js";

function generateId(): string {
  return "chatcmpl-" + Math.random().toString(36).slice(2, 16);
}

export function createRouter(config: RouterConfig) {
  const cache = createCache({
    ttlSeconds: config.cacheTtlSeconds,
    maxSize: config.cacheMaxSize,
  });

  const telemetry: TelemetryEntry[] = [];
  const maxTelemetry = 1000;

  async function handle(req: RouterRequest): Promise<RouterResponse> {
    const tier: ComplexityTier = req.forceTier ?? classify(req.messages);
    let messages: ChatMessage[] = req.messages;
    let compressedFromTokens: number | undefined;

    if (config.compressionEnabled && messages.length > 0) {
      const result = compact(messages);
      messages = result.messages;
      compressedFromTokens = Math.ceil(result.compressedFromChars / 4);
    }

    const cacheHit = cache.has(req);
    if (cacheHit) {
      const cached = cache.get(req)!;
      const meta = {
        tier: cached.meta?.tier ?? "standard",
        model: cached.meta?.model ?? "",
        provider: cached.meta?.provider ?? "",
        cacheHit: true,
        compressedFromTokens: cached.meta?.compressedFromTokens,
        latencyMs: cached.meta?.latencyMs,
        fallbackUsed: cached.meta?.fallbackUsed,
      };
      return { ...cached, meta };
    }

    const providers = getProvidersForTier(tier, process.env);
    if (providers.length === 0) {
      throw new Error(`No provider available for tier: ${tier}. Add API keys to .env for paid tiers.`);
    }

    const start = Date.now();
    const { result, provider, fallbackUsed } = await withFallback(
      providers,
      {
        messages,
        model: req.model ?? providers[0].modelId,
        max_tokens: req.max_tokens,
        temperature: req.temperature,
      },
      process.env
    );
    const latencyMs = Date.now() - start;

    const response: RouterResponse = {
      id: generateId(),
      choices: [
        {
          message: { role: "assistant", content: result.content },
          finish_reason: result.finishReason,
          index: 0,
        },
      ],
      usage: result.usage,
      meta: {
        tier,
        model: provider.modelId,
        provider: provider.id,
        cacheHit: false,
        compressedFromTokens,
        latencyMs,
        fallbackUsed,
      },
    };

    cache.set(req, response);

    telemetry.push({
      requestId: response.id,
      tier,
      model: provider.modelId,
      provider: provider.id,
      cacheHit: false,
      latencyMs,
      promptTokens: result.usage?.prompt_tokens ?? 0,
      completionTokens: result.usage?.completion_tokens ?? 0,
      fallbackUsed,
      timestamp: Date.now(),
    });
    if (telemetry.length > maxTelemetry) telemetry.shift();

    return response;
  }

  function getTelemetry(): TelemetryEntry[] {
    return [...telemetry];
  }

  function getCacheStats() {
    return cache.getStats();
  }

  return { handle, getTelemetry, getCacheStats };
}
