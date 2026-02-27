/**
 * Incrypt Smart Router — shared types
 */

export type ComplexityTier = "simple" | "standard" | "complex";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface RouterRequest {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  /** Optional: force tier (overrides classifier) */
  forceTier?: ComplexityTier;
}

export interface RouterResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason?: string;
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  /** Router metadata */
  meta?: {
    tier: ComplexityTier;
    model: string;
    provider: string;
    cacheHit: boolean;
    compressedFromTokens?: number;
    latencyMs?: number;
    fallbackUsed?: boolean;
  };
}

export interface ProviderConfig {
  id: string;
  name: string;
  tier: ComplexityTier;
  /** Free = no API key required */
  free: boolean;
  modelId: string;
  baseUrl?: string;
  envKey?: string;
  maxTokens?: number;
}

export interface RouterConfig {
  port: number;
  cacheTtlSeconds: number;
  cacheMaxSize: number;
  semanticSimilarityThreshold: number;
  compressionEnabled: boolean;
  logLevel: string;
  providers: ProviderConfig[];
}

export interface TelemetryEntry {
  requestId: string;
  tier: ComplexityTier;
  model: string;
  provider: string;
  cacheHit: boolean;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  fallbackUsed: boolean;
  timestamp: number;
}
